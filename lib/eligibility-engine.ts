// utils/eligibility-engine.ts

import { LENDER_CONFIGS, REASON_CODES } from '@/lib/config/lenders'
import { calculateEligibleTicket, calculateDSCR, formatCurrency } from './calculations'
import type { UserProfile, EligibilityResult, EligibilityStatus, PhaseBProfile, PhaseAProfile, LoanProduct } from '@/lib/types/eligibility'
import { applyConservativeDefaults } from './phase-a-defaults';

// §5 Reason_Codes.csv — CIBIL band to numeric mapping for comparisons
function cibilBandToMinScore(band: string): number {
  const map: Record<string, number> = {
    "750+": 750,
    "725-749": 725,
    "700-724": 700,
    "680-699": 680,
    "<680": 650
  }
  return map[band] || 650
}

export function checkGate(
  gate: any,
  profile: UserProfile,
  calculations: any,
  phase: 'A' | 'B'
): { passed: boolean; reason?: string; skipped?: boolean } {
  const { field, operator, threshold_value } = gate

  if (phase === 'A') {
    // Skip ABB checks if ABB not provided
    if (field === 'abb' && !profile.abb) {
      return { passed: true, skipped: true }
    }

    // Skip banking vintage checks (assume minimum met)
    if (field === 'banking_vintage_months') {
      return { passed: true, skipped: true }
    }

    // Relax bounce checks in Phase A
    if (field === 'bounces_6m') {
      return { passed: true, skipped: true }
    }

    // Skip speculative flows in Phase A (not available)
    if (field === 'has_speculative_flows') {
      return { passed: true, skipped: true }
    }

    // Skip custom banking checks in Phase A
    if (operator === 'CUSTOM_TATA_BANKING') {
      return { passed: true, skipped: true }
    }

    // Skip ABB sanity checks if ABB not available in Phase A
    if (operator === 'CUSTOM_ABB_SANITY' || operator === 'CUSTOM_ABB_5X' || operator === 'CUSTOM_ABB_TATA') {
      if (!profile.abb) {
        return { passed: true, skipped: true }
      }
    }
  }


  // Get value from profile or calculations
  let value: any
  if (field.includes('.')) {
    // Nested field like "banking.abb"
    const parts = field.split('.')
    value = (profile as any)[parts[0]]?.[parts[1]]
  } else if (field === 'CALCULATED_DSCR') {
    // Special calculated field
    value = calculations.dscr
  } else if (field === 'CALCULATED_FOIR' || field === 'CALCULATED_PRINCIPAL') {
    // Skip calc-only fields (these are handled in ticket calculation)
    return { passed: true, skipped: true }
  } else if (field === 'CUSTOM_TATA_BANKING') {
    // Handled by CUSTOM_TATA_BANKING operator below
    value = null
  } else {
    value = (profile as any)[field]
  }

  // Apply operator
  switch (operator) {
    case 'IN':
      const allowed = Array.isArray(threshold_value) ? threshold_value : [threshold_value]
      return {
        passed: allowed.includes(value),
        reason: !allowed.includes(value) ? gate.on_fail_reason_code : undefined
      }

    case '>=':
      return {
        passed: value >= threshold_value,
        reason: value < threshold_value ? gate.on_fail_reason_code : undefined
      }

    case '<=':
      return {
        passed: value <= threshold_value,
        reason: value > threshold_value ? gate.on_fail_reason_code : undefined
      }

    case '=':
      return {
        passed: value === threshold_value,
        reason: value !== threshold_value ? gate.on_fail_reason_code : undefined
      }

    case 'CUSTOM_ABB_5X':
      // L&T specific: EMI ≤ ABB/5
      if (!profile.abb) {
        return { passed: false, reason: 'ABB_LT_THRESHOLD' }
      }
      const lntMaxEMI = profile.abb / 5
      const lntProposedEMI = calculations.max_emi
      return {
        passed: lntProposedEMI <= lntMaxEMI,
        reason: lntProposedEMI > lntMaxEMI ? 'ABB_LT_THRESHOLD' : undefined
      }

    case 'CUSTOM_ABB_SANITY': {
      // Bajaj/ABFL: ABB sanity check — EMI ≤ ABB / threshold_value (2)
      if (!profile.abb || profile.abb <= 0) {
        // §10: If ABB not provided, skip sanity (info only for OD tickets ≤₹15L)
        return { passed: true, skipped: true }
      }
      const abbDivisor = threshold_value || 2
      const sanityMaxEMI = profile.abb / abbDivisor
      const proposedEMI = calculations.max_emi
      if (proposedEMI <= 0) return { passed: true }
      return {
        passed: proposedEMI <= sanityMaxEMI,
        reason: proposedEMI > sanityMaxEMI ? 'ABB_LT_THRESHOLD' : undefined
      }
    }

    case 'CUSTOM_ABB_TATA': {
      // Tata: IF(RequestedLimit > ₹15L, EMI ≤ ABB/1.5, lenient)
      if (profile.requested_limit <= 1500000) {
        // ≤₹15L → lenient, no ABB check
        return { passed: true }
      }
      if (!profile.abb || profile.abb <= 0) {
        return { passed: false, reason: 'ABB_LT_THRESHOLD' }
      }
      const tataMaxEMI = profile.abb / 1.5
      const tataProposed = calculations.max_emi
      return {
        passed: tataProposed <= tataMaxEMI,
        reason: tataProposed > tataMaxEMI ? 'ABB_LT_THRESHOLD' : undefined
      }
    }

    case 'CUSTOM_LNT_CIBIL': {
      // L&T: ≥685 standard; ≥750 for high ticket (>₹75L)
      const minScore = cibilBandToMinScore(profile.cibil_band)
      if (profile.requested_limit > 7500000) {
        // High ticket: need 750+
        return {
          passed: minScore >= 750,
          reason: minScore < 750 ? 'BUREAU_MIN_FAIL' : undefined
        }
      }
      // Standard: ≥685 
      // Bands 700-724, 725-749, 750+ all pass. 680-699 also passes (min 680 ≥ 685 approx)
      // Only <680 fails
      return {
        passed: minScore >= 680,
        reason: minScore < 680 ? 'BUREAU_MIN_FAIL' : undefined
      }
    }

    case 'CUSTOM_GODREJ_VINTAGE': {
      // Godrej: Doctors ≥3y; CA ≥5y (or ≥3y + receipts ≥₹50L)
      const expYears = profile.experience_years
      if (profile.persona === 'CA') {
        if (expYears >= 5) return { passed: true }
        if (expYears >= 3 && (profile.gross_receipts || 0) >= 5000000) {
          return { passed: true }
        }
        return { passed: false, reason: 'VINTAGE_SHORTFALL' }
      }
      // Doctor: ≥3y
      return {
        passed: expYears >= 3,
        reason: expYears < 3 ? 'VINTAGE_SHORTFALL' : undefined
      }
    }

    case 'CUSTOM_TATA_BANKING': {
      // Tata: Banking NOT required for domestic degree UNLESS:
      // - foreign_degree = true → FOREIGN_DEGREE_BANKING_REQD
      // - live_usl > 4 → need banking
      const isForeign = profile.foreign_degree === true
      const highUSL = (profile.live_usl || 0) > 4

      if (isForeign) {
        // Foreign degree → must have 6m banking
        if (!profile.banking_vintage_months || profile.banking_vintage_months < 6) {
          return { passed: false, reason: 'FOREIGN_DEGREE_BANKING_REQD' }
        }
      }
      if (highUSL) {
        // High USL → need banking proof
        if (!profile.banking_vintage_months || profile.banking_vintage_months < 6) {
          return { passed: false, reason: 'BANKING_MISSING' }
        }
      }
      // Domestic degree + USL ≤ 4 → banking waived
      return { passed: true }
    }

    default:
      return { passed: false, reason: 'UNKNOWN_OPERATOR' }
  }
}

export function runEligibilityCheck(
  profile: UserProfile,
  phase: 'A' | 'B'
): EligibilityResult[] {
  const results: EligibilityResult[] = []

  // §10 Assumptions: Unknown CIBIL (treat as 680-699 conservative)
  // Do not surface strict lenders (Tata/L&T)
  const isUnknownCibil = profile.cibil_band === '<680' || profile.cibil_band === '680-699'

  // Check each lender
  for (const [lenderId, config] of Object.entries(LENDER_CONFIGS) as [string, any][]) {
    // Skip if product type doesn't match
    if (!config.product_types.includes(profile.product)) {
      continue
    }

    // §10: Unknown CIBIL → suppress Tata and L&T (strict lenders)
    if (isUnknownCibil && (lenderId === 'tata' || lenderId === 'lnt')) {
      results.push(createIneligibleResult(
        config, profile, phase,
        ['BUREAU_MIN_FAIL'],
        [`Improve CIBIL to ${lenderId === 'tata' ? '725+' : '685+'} to unlock ${config.name}`]
      ))
      continue
    }

    const passedGates: string[] = []
    const failedGates: string[] = []
    const reasonCodes: string[] = []
    let status: EligibilityStatus = "eligible"

    // Calculate capacities using lender-specific FOIR%
    const calculations = calculateEligibleTicket(
      profile,
      config,
      config.roi
    )

    // Run through gates
    const gates = config.gates || []
    for (const gate of gates) {
      const result = checkGate(gate, profile, calculations, phase)

      if (result.skipped) {
        // Skipped gate (Phase A relaxation) — don't count as pass or fail
        continue
      }

      if (result.passed) {
        passedGates.push(gate.gate)
      } else {
        failedGates.push(gate.gate)
        if (result.reason) {
          reasonCodes.push(result.reason)
        }

        // Determine status based on failed gate
        const isHardFail = gate.gate.includes("Bureau") ||
          gate.gate.includes("Degree") ||
          gate.gate.includes("Vintage") ||
          gate.gate.includes("Speculative") ||
          gate.gate.includes("College")

        if (isHardFail) {
          status = "ineligible"
        } else {
          status = status === "eligible" ? "partial" : status
        }

        // Stop at first hard failure for ineligible
        if (status === "ineligible") break
      }
    }

    // §5.4: Partial-pass if EligibleTicket < RequestedLimit
    if (status === "eligible" && calculations.eligible_ticket < profile.requested_limit) {
      status = "partial"
      // Add reason based on limiting factor
      if (calculations.limiting_factor === 'abb_capacity') {
        reasonCodes.push('ABB_LT_THRESHOLD')
      } else if (calculations.limiting_factor === 'foir_capacity') {
        reasonCodes.push('PROGRAM_GATES_NOT_MET')
      }
    }

    // Phase B: Check for missing documents
    const requiredDocs = config.docs_required?.[`phase_${phase.toLowerCase()}`] || []
    const missingDocs: string[] = []

    if (phase === 'B' && profile.documents) {
      // Check actual document uploads
      const docMap: Record<string, boolean> = {
        'ITR (2 years)': !!(profile.documents as any)?.itr_2_years?.length,
        'Business Proof': !!(profile.documents as any)?.business_proof,
        'Business Proof (Udyam/CA firm)': !!(profile.documents as any)?.business_proof,
        'GST': !!(profile.documents as any)?.gst,
        'GST (if applicable)': !!(profile.documents as any)?.gst,
        '26AS': !!(profile.documents as any)?.gst, // Usually tied to GST
        'OHP': !!(profile.documents as any)?.ohp,
        'OHP (preferred)': !!(profile.documents as any)?.ohp,
        '6m Banking Statements': !!(profile.documents as any)?.banking_6m,
        '6m Banking': !!(profile.documents as any)?.banking_6m,
        'Consultation/Practice Proof': !!(profile.documents as any)?.consultation_proof,
        'Residence Proof': !!(profile.documents as any)?.residence_proof,
        'Residence Proof (Rent Agreement or OHP)': !!(profile.documents as any)?.residence_proof || !!(profile.documents as any)?.ohp,
      }

      for (const doc of requiredDocs) {
        if (!docMap[doc]) {
          missingDocs.push(doc)
        }
      }

      // §21: If mandatory doc missing → downgrade to Partial with Doc Checklist CTA
      if (missingDocs.length > 0 && status === "eligible") {
        status = "partial"
        reasonCodes.push("PROGRAM_GATES_NOT_MET")
      }
    }

    // Generate pros and cons
    const pros: string[] = []
    const cons: string[] = []

    // Pros
    if (passedGates.some(g => g.includes("Bureau"))) {
      pros.push(`CIBIL score meets requirement (${profile.cibil_band})`)
    }
    if (passedGates.some(g => g.includes("Degree"))) {
      pros.push(`${profile.degree} degree approved`)
    }
    if (passedGates.some(g => g.includes("Banking") || g.includes("banking"))) {
      pros.push(`Banking history verified`)
    }
    if (passedGates.some(g => g.includes("ABB"))) {
      pros.push(`Bank balance meets threshold`)
    }

    // Cons
    if (reasonCodes.includes("BUREAU_MIN_FAIL")) {
      cons.push(`CIBIL score below lender minimum`)
    }
    if (reasonCodes.includes("ABB_LT_THRESHOLD")) {
      cons.push(`Average bank balance below required threshold`)
    }
    if (reasonCodes.includes("USL_TOO_MANY")) {
      cons.push(`Too many existing unsecured loans (${profile.live_usl})`)
    }
    if (reasonCodes.includes("VINTAGE_SHORTFALL")) {
      cons.push(`Practice/firm vintage below minimum requirement`)
    }
    if (reasonCodes.includes("SPECULATIVE_EXPOSURE_HIGH")) {
      cons.push(`Speculative flows detected — policy rejects speculative activity`)
    }
    if (reasonCodes.includes("BOUNCE_POLICY_FAIL")) {
      cons.push(`Cheque bounces exceed tolerance`)
    }
    if (reasonCodes.includes("ENQUIRY_EXCESS")) {
      cons.push(`Too many credit enquiries in last 6 months`)
    }
    if (reasonCodes.includes("BANKING_MISSING")) {
      cons.push(`6 months banking statements required`)
    }
    if (reasonCodes.includes("FOREIGN_DEGREE_BANKING_REQD")) {
      cons.push(`Foreign degree — 6m banking mandatory`)
    }
    if (reasonCodes.includes("COLLEGE_NOT_APPROVED")) {
      cons.push(`College not on approved list`)
    }
    if (reasonCodes.includes("DSCR_FAIL")) {
      cons.push(`Debt service coverage ratio below 0.8`)
    }

    // If eligible/partial but could get higher limit
    if ((status === "eligible" || status === "partial") && calculations.eligible_ticket < profile.requested_limit) {
      cons.push(`Eligible for ${formatCurrency(calculations.eligible_ticket)} (requested ${formatCurrency(profile.requested_limit)}). ${calculations.limiting_factor === 'abb_capacity' ? 'Increase ABB to unlock higher limit.' :
          calculations.limiting_factor === 'foir_capacity' ? 'Increase income or reduce EMIs.' :
            calculations.limiting_factor === 'degree_cap' ? 'Degree cap limits maximum.' :
              calculations.limiting_factor === 'lender_max' ? 'Lender policy cap reached.' :
                ''
        }`)
    }

    // Add to results
    results.push({
      lender_id: config.id,
      lender_name: config.name,
      status,
      indicative_limit: phase === 'A' ? calculations.eligible_ticket : undefined,
      final_limit: phase === 'B' ? calculations.eligible_ticket : undefined,
      roi: config.roi,
      processing_fee: config.processing_fee,
      disbursal_time: config.disbursal_time,
      reasons: {
        passed_gates: passedGates,
        failed_gates: failedGates,
        reason_codes: reasonCodes,
        customer_messages: reasonCodes.map((code: string) => REASON_CODES[code] || code)
      },
      pros,
      cons: cons.length > 0 ? cons : status === "eligible" ? ["Maintain good credit score and income stability"] : [],
      required_docs: requiredDocs,
      missing_docs: phase === 'B' ? missingDocs : undefined,
      io_months: config.io_months,
      dropline: config.dropline,
      product_type: profile.product,
      policy_version: "v1.3",  // §10 Audit trail
    })
  }

  // §4.6: TL fallback — If product is OD and lender fails OD but FOIR passes, generate TL offer
  if (profile.product === 'OD') {
    const tlFallbacks = generateTLFallbacks(profile, results, phase)
    results.push(...tlFallbacks)
  }

  // §22: Offer-Set Composition — 4 Approved/Partial + 2 Not-Approved
  return composeOfferSet(results)
}

/**
 * §4.6, §15.1: TL fallback — If OD fails on ABB but FOIR OK, recommend TL
 */
function generateTLFallbacks(
  profile: UserProfile,
  odResults: EligibilityResult[],
  phase: 'A' | 'B'
): EligibilityResult[] {
  const fallbacks: EligibilityResult[] = []

  for (const odResult of odResults) {
    // Only generate TL fallback if:
    // 1. OD was partial/ineligible due to ABB
    // 2. Lender supports TL
    const config = (LENDER_CONFIGS as any)[odResult.lender_id]
    if (!config || !config.product_types.includes('TL')) continue
    if (odResult.status === 'eligible') continue

    const isABBFail = odResult.reasons.reason_codes.includes('ABB_LT_THRESHOLD')
    if (!isABBFail) continue

    // Create a TL profile and check FOIR
    const tlProfile = { ...profile, product: 'TL' as LoanProduct }
    const tlCalc = calculateEligibleTicket(tlProfile, config, config.roi)

    if (tlCalc.foir_capacity > 0) {
      fallbacks.push({
        lender_id: odResult.lender_id,
        lender_name: odResult.lender_name,
        status: 'partial',
        indicative_limit: phase === 'A' ? tlCalc.eligible_ticket : undefined,
        final_limit: phase === 'B' ? tlCalc.eligible_ticket : undefined,
        roi: config.roi,
        processing_fee: config.processing_fee,
        disbursal_time: config.disbursal_time,
        reasons: {
          passed_gates: ['FOIR OK for TL'],
          failed_gates: ['OD ABB threshold'],
          reason_codes: ['ABB_LT_THRESHOLD'],
          customer_messages: ['OD limit restricted by bank balance. Term Loan option available.']
        },
        pros: [`Term Loan available with ${formatCurrency(tlCalc.eligible_ticket)} limit`],
        cons: ['OD not available due to ABB threshold', 'Consider TL as alternative'],
        required_docs: config.docs_required?.phase_b || [],
        io_months: undefined,
        dropline: false,
        product_type: 'TL',
        is_tl_fallback: true,
        policy_version: "v1.3",
      })
    }
  }

  return fallbacks
}

/**
 * §22: Offer-Set Composition & Presentation Rule
 * Goal: 4 Approved/Partial + 2 Not-Approved
 * 1. Build pools: Approved, Partial, Not-Approved
 * 2. Fill Approved slots first (rank by FitScore)
 * 3. If <4, top-up with Partial
 * 4. Always include exactly 2 Not-Approved (with reasons + coaching)
 * 5. Rank by FitScore within each pool
 */
function composeOfferSet(results: EligibilityResult[]): EligibilityResult[] {
  // Assign FitScore to each result
  const scored = results.map(r => ({
    ...r,
    fit_score: calculateFitScore(r)
  }))

  // Build pools
  const approved = scored.filter(r => r.status === 'eligible').sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0))
  const partial = scored.filter(r => r.status === 'partial').sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0))
  const notApproved = scored.filter(r => r.status === 'ineligible').sort((a, b) => (b.fit_score || 0) - (a.fit_score || 0))

  // Fill 4 Approved/Partial slots
  const approvedSlots: EligibilityResult[] = []

  // First, add all approved
  for (const r of approved) {
    if (approvedSlots.length >= 4) break
    approvedSlots.push(r)
  }

  // If <4, top-up with partial
  for (const r of partial) {
    if (approvedSlots.length >= 4) break
    approvedSlots.push(r)
  }

  // Include up to 2 Not-Approved with reasons
  const notApprovedSlots = notApproved.slice(0, 2)

  return [...approvedSlots, ...notApprovedSlots]
}

/**
 * §20: FitScore = PolicyFit(60%) + ObservedTAT(25%) + CostScore(15%)
 * Since we don't have observed TAT data yet, use heuristic:
 * - PolicyFit: based on how many gates passed
 * - TAT: based on lender's disbursal_time 
 * - CostScore: lower PF/ROI = better
 */
function calculateFitScore(result: EligibilityResult): number {
  // PolicyFit (60%) — ratio of passed gates
  const totalGates = result.reasons.passed_gates.length + result.reasons.failed_gates.length
  const policyFit = totalGates > 0
    ? (result.reasons.passed_gates.length / totalGates) * 100
    : (result.status === 'eligible' ? 100 : 0)

  // ObservedTAT (25%) — lower days = better score (normalize to 0-100)
  const tatDays = parseInt(result.disbursal_time) || 5
  const tatScore = Math.max(0, 100 - (tatDays * 10))

  // CostScore (15%) — lower ROI = better (normalize: 11% → 100, 16% → 0)
  const costScore = Math.max(0, Math.min(100, (16 - result.roi) * 20))

  return Math.round(policyFit * 0.60 + tatScore * 0.25 + costScore * 0.15)
}

/**
 * Helper: Create an ineligible result (for suppressed lenders)
 */
function createIneligibleResult(
  config: any,
  profile: UserProfile,
  phase: 'A' | 'B',
  reasonCodes: string[],
  coaching: string[]
): EligibilityResult {
  return {
    lender_id: config.id,
    lender_name: config.name,
    status: "ineligible",
    indicative_limit: 0,
    roi: config.roi,
    processing_fee: config.processing_fee,
    disbursal_time: config.disbursal_time,
    reasons: {
      passed_gates: [],
      failed_gates: reasonCodes.map(c => REASON_CODES[c] || c),
      reason_codes: reasonCodes,
      customer_messages: reasonCodes.map(c => REASON_CODES[c] || c)
    },
    pros: [],
    cons: coaching,
    required_docs: [],
    io_months: config.io_months,
    dropline: config.dropline,
    product_type: profile.product,
    policy_version: "v1.3",
  }
}

// utils/eligibility-engine.ts

export function runPhaseAEligibility(profile: PhaseAProfile): EligibilityResult[] {
  // Apply conservative defaults
  const fullProfile = applyConservativeDefaults(profile)

  // Run eligibility check with relaxed ABB rules
  const results = runEligibilityCheck(fullProfile, 'A')

  // Add disclaimers to all results
  return results.map(result => ({
    ...result,
    disclaimer: "This is an indicative offer based on the information provided. Final limits will be confirmed after document verification in Phase 2.",
    confidence_level: calculateConfidenceLevel(profile, result)
  }))
}

function calculateConfidenceLevel(
  profile: PhaseAProfile,
  result: EligibilityResult
): "High" | "Medium" | "Low" {
  // High confidence if:
  // - Eligible status
  // - Good CIBIL (750+)
  // - Low existing EMI
  if (result.status === "eligible" &&
    profile.cibil_band === "750+" &&
    profile.existing_emi < profile.net_monthly_income * 0.3) {
    return "High"
  }

  // Low confidence if:
  // - Partial/Ineligible
  // - Low CIBIL
  if (result.status === "ineligible" || profile.cibil_band === "<680") {
    return "Low"
  }

  return "Medium"
}

export function runPhaseBEligibility(profile: PhaseBProfile): EligibilityResult[] {
  // Use actual extracted data
  const results = runEligibilityCheck(profile, 'B')

  // No disclaimers needed - this is final
  return results.map(result => ({
    ...result,
    is_final: true
  }))
}