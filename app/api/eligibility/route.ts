// app/api/eligibility/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { runPhaseAEligibility, runPhaseBEligibility } from '@/lib/eligibility-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phase, profile, credit, income, loan, banking, documents } = body

    // Validate phase
    if (!phase || !['SOFT', 'HARD'].includes(phase)) {
      return NextResponse.json(
        { error: 'Invalid phase. Must be SOFT or HARD' },
        { status: 400 }
      )
    }

    // Build user profile
    const userProfile: any = {
      // From profile
      name: profile.name || '',
      persona: profile.persona,
      degree: profile.degree,
      experience_years: profile.experience_years,
      employment_type: profile.employment_type,
      city: profile.city,
      pincode: profile.pincode,
      foreign_degree: profile.foreign_degree,
      college_on_list: profile.college_on_list,

      // From credit
      cibil_band: credit.cibil_band,
      existing_emi: credit.existing_emi,

      // From income
      net_monthly_income: income.net_monthly_income,
      gross_receipts: income.gross_receipts,

      // From loan
      product: loan.product,
      requested_limit: loan.requested_limit,
      tenure_months: loan.tenure_months,
    }

    // Phase B only - from banking (extracted from documents)
    if (phase === 'HARD' && banking) {
      userProfile.banking_vintage_months = banking.vintage_months
      userProfile.abb = banking.abb
      userProfile.amc = banking.amc
      userProfile.bounces_6m = banking.bounces_6m
      userProfile.live_usl = banking.live_usl
      userProfile.enquiries_6m = banking.enquiries_6m
      userProfile.od_cc_present = banking.od_cc_present
      userProfile.has_speculative_flows = banking.has_speculative_flows
      userProfile.cibil_exact = credit.cibil_exact || 0
      userProfile.documents = documents || {}
    }

    // Run appropriate eligibility check
    let results
    if (phase === 'SOFT') {
      // Phase A - Conservative assumptions
      results = runPhaseAEligibility(userProfile)
    } else {
      // Phase B - Real document data
      results = runPhaseBEligibility(userProfile)
    }

    // Map to expected format with per-lender IO/dropline/reason trail
    const lenders = results.map((result: any) => ({
      lender: result.lender_name,
      lender_id: result.lender_id,
      product: result.product_type || userProfile.product,
      is_tl_fallback: result.is_tl_fallback || false,
      eligibility: {
        phase: phase,
        status: result.status === 'eligible' ? 'PASS' :
          result.status === 'partial' ? 'PARTIAL' : 'FAIL',
        eligible_limit: result.indicative_limit || result.final_limit || 0,
        reasons: result.reasons.customer_messages,
        reason_codes: result.reasons.reason_codes,
        fit_score: result.fit_score,
        policy_version: result.policy_version,
      },
      pricing: {
        roi: result.roi,
        processing_fee_pct: parseFloat(result.processing_fee) || 2.0
      },
      structure: {
        tenure_months: userProfile.tenure_months,
        io_months: result.io_months || 24,
        dropline: result.dropline || false,
        flexi: false
      },
      explain: {
        why_matched: result.pros,
        how_to_increase_limit: result.cons
      },
      docs: {
        required: result.required_docs,
        missing: result.missing_docs || []
      }
    }))

    return NextResponse.json({
      success: true,
      status: phase === 'SOFT' ? 'SOFT_ELIGIBILITY' : 'HARD_ELIGIBILITY',
      lenders: lenders,
      summary: {
        total: lenders.length,
        eligible: lenders.filter((l: any) => l.eligibility.status === 'PASS').length,
        partial: lenders.filter((l: any) => l.eligibility.status === 'PARTIAL').length,
        ineligible: lenders.filter((l: any) => l.eligibility.status === 'FAIL').length
      }
    })
  } catch (error) {
    console.error('Eligibility check error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}