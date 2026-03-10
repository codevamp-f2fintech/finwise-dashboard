// utils/calculations.ts

import { Degree, UserProfile } from "@/lib/types/eligibility"

export interface CapacityCalculation {
  foir_capacity: number
  abb_capacity: number | null
  eligible_ticket: number
  max_emi: number
  monthly_rate: number
  dscr?: number              // For L&T
  emi_from_abb?: number      // ABB-derived EMI
  principal_from_abb?: number // ABB-derived principal
  limiting_factor?: string   // What capped the ticket
}

export function calculateMonthlyRate(roiAnnual: number): number {
  return roiAnnual / 12 / 100
}

export function calculateEMI(
  principal: number,
  roiAnnual: number,
  tenureMonths: number
): number {
  const r = calculateMonthlyRate(roiAnnual)
  if (r === 0) return principal / tenureMonths

  // PMT formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const numerator = principal * r * Math.pow(1 + r, tenureMonths)
  const denominator = Math.pow(1 + r, tenureMonths) - 1
  return numerator / denominator
}

export function calculatePrincipalFromEMI(
  emi: number,
  roiAnnual: number,
  tenureMonths: number
): number {
  const r = calculateMonthlyRate(roiAnnual)
  if (r === 0) return emi * tenureMonths

  // PV formula: EMI * ((1+r)^n - 1) / (r * (1+r)^n)
  const numerator = emi * (Math.pow(1 + r, tenureMonths) - 1)
  const denominator = r * Math.pow(1 + r, tenureMonths)
  return numerator / denominator
}

export function calculateFOIRCapacity(
  netMonthlyIncome: number,
  existingEMI: number,
  foirPercent: number, // e.g., 65 for 65%
  roiAnnual: number,
  tenureMonths: number
): number {
  const maxEMI = (foirPercent / 100) * netMonthlyIncome - existingEMI
  if (maxEMI <= 0) return 0

  return calculatePrincipalFromEMI(maxEMI, roiAnnual, tenureMonths)
}

export function calculateABBCapacity(
  abb: number | undefined,
  abbMultiple: number, // e.g., 5 for L&T, 1.5 for Tata, 2 for Bajaj/ABFL
  roiAnnual: number,
  tenureMonths: number
): number | null {
  if (!abb || abb <= 0) return null

  const maxEMI = abb / abbMultiple
  return calculatePrincipalFromEMI(maxEMI, roiAnnual, tenureMonths)
}

/**
 * Calculate EMI from ABB for a specific ABB multiple
 * Returns null if ABB not available
 */
export function calculateEMIFromABB(
  abb: number | undefined,
  abbMultiple: number
): number | null {
  if (!abb || abb <= 0) return null
  return abb / abbMultiple
}

export function calculateDSCR(
  netMonthlyIncome: number,
  existingEMI: number,
  proposedEMI: number
): number {
  const totalEMI = existingEMI + proposedEMI
  if (totalEMI === 0) return Infinity
  return netMonthlyIncome / totalEMI
}

/**
 * Calculate OD Monthly Interest (interest-only phase)
 * §5.5: Monthly Interest = UtilizedAmount * (ROI%/12)
 */
export function calculateODMonthlyInterest(
  utilizedAmount: number,
  roiAnnual: number
): number {
  return utilizedAmount * (roiAnnual / 100 / 12)
}

/**
 * Generate utilization examples for KFS preview
 * Shows monthly cost at 10%, 30%, 50%, 80% utilization
 */
export function generateUtilizationExamples(
  limit: number,
  roiAnnual: number
): { util_pct: number; monthly_cost: number }[] {
  return [10, 30, 50, 80].map(pct => ({
    util_pct: pct,
    monthly_cost: Math.round(calculateODMonthlyInterest(limit * pct / 100, roiAnnual))
  }))
}

export function getDegreeCap(degree: Degree, lenderId: string): number {
  const caps: Record<string, Record<string, number>> = {
    godrej: {
      MBBS: 12500000,  // ₹1.25Cr
      MD: 20000000,    // ₹2Cr
      MS: 20000000,    // ₹2Cr
      DM: 20000000,    // ₹2Cr
      MCh: 20000000,   // ₹2Cr
      DNB: 20000000,   // ₹2Cr
      BDS: 12500000,   // ₹1.25Cr (same as MBBS tier)
      MDS: 12500000,   // ₹1.25Cr
      BHMS: 12500000,  // ₹1.25Cr
      BAMS: 12500000,  // ₹1.25Cr
      CA: 15000000,    // ₹1.5Cr
      CS: 15000000,    // ₹1.5Cr
      CMA: 15000000,   // ₹1.5Cr
    }
  }

  return caps[lenderId]?.[degree] || Infinity
}

/**
 * Main ticket calculation — configurable FOIR% per lender
 * Implements: EligibleTicket = MIN(Principal_FOIR, Principal_ABB, DegreeCap, LenderMax, RequestedLimit)
 * Per Rulesheet Global_Formulas.csv
 */
export function calculateEligibleTicket(
  profile: UserProfile,
  lenderConfig: any,
  roiAnnual: number = 13 // default ROI for calculations
): CapacityCalculation {
  const {
    net_monthly_income,
    existing_emi,
    tenure_months,
    requested_limit,
    abb,
    degree,
    employment_type
  } = profile

  const monthlyRate = calculateMonthlyRate(roiAnnual)

  // Use lender-specific FOIR% (employment-type aware)
  const foirPercent = employment_type === "Salaried"
    ? (lenderConfig.foir_salaried_percent || 55)
    : (lenderConfig.foir_percent || 65)

  // FOIR Capacity
  const foirCapacity = calculateFOIRCapacity(
    net_monthly_income,
    existing_emi,
    foirPercent,
    roiAnnual,
    tenure_months
  )

  // ABB Capacity (lender-specific multiple from config)
  let abbCapacity: number | null = null
  let emiFromAbb: number | null = null
  const abbMultiple = lenderConfig.abb_multiple || 2

  // Tata special: ABB/1.5 only applies if ticket > ₹15L
  if (lenderConfig.id === "tata") {
    if (requested_limit > 1500000 && abb && abb > 0) {
      emiFromAbb = calculateEMIFromABB(abb, 1.5)
      if (emiFromAbb !== null) {
        abbCapacity = calculatePrincipalFromEMI(emiFromAbb, roiAnnual, tenure_months)
      }
    }
    // If ticket ≤ ₹15L, ABB check is lenient — no cap from ABB
  } else if (abb && abb > 0) {
    emiFromAbb = calculateEMIFromABB(abb, abbMultiple)
    if (emiFromAbb !== null) {
      abbCapacity = calculatePrincipalFromEMI(emiFromAbb, roiAnnual, tenure_months)
    }
  }

  // Degree Cap
  const degreeCap = getDegreeCap(degree, lenderConfig.id)

  // Lender Max
  const lenderMax = lenderConfig.max_limit

  // Final Eligible Ticket = MIN(all capacities)
  const capacities = [
    foirCapacity,
    abbCapacity,
    degreeCap,
    lenderMax,
    requested_limit
  ].filter(c => c !== null && c > 0) as number[]

  const eligibleTicket = Math.min(...capacities)

  // Determine limiting factor
  let limitingFactor = "requested_limit"
  if (eligibleTicket === foirCapacity) limitingFactor = "foir_capacity"
  else if (abbCapacity !== null && eligibleTicket === abbCapacity) limitingFactor = "abb_capacity"
  else if (eligibleTicket === degreeCap) limitingFactor = "degree_cap"
  else if (eligibleTicket === lenderMax) limitingFactor = "lender_max"

  const maxEMI = (foirPercent / 100) * net_monthly_income - existing_emi

  // DSCR calculation (for L&T)
  let dscr: number | undefined
  if (lenderConfig.id === 'lnt') {
    const proposedEMI = maxEMI > 0 ? maxEMI : 0
    dscr = calculateDSCR(net_monthly_income, existing_emi, proposedEMI)
  }

  // Round to nearest ₹10,000 per §10 Assumptions
  return {
    foir_capacity: Math.round(foirCapacity / 10000) * 10000,
    abb_capacity: abbCapacity ? Math.round(abbCapacity / 10000) * 10000 : null,
    eligible_ticket: Math.round(eligibleTicket / 10000) * 10000,
    max_emi: Math.round(maxEMI),
    monthly_rate: monthlyRate,
    dscr,
    emi_from_abb: emiFromAbb ? Math.round(emiFromAbb) : undefined,
    principal_from_abb: abbCapacity ? Math.round(abbCapacity / 10000) * 10000 : undefined,
    limiting_factor: limitingFactor,
  }
}

// Helper to format currency
// §10: Show ₹L format for ≥₹1,00,000
export function formatCurrency(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  return `₹${amount.toLocaleString("en-IN")}`
}