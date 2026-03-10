// utils/phase-a-defaults.ts

import { UserProfile, PhaseAProfile } from '@/lib/types/eligibility'

/**
 * Apply conservative defaults for Phase A
 * §10 Assumptions:
 * - banking_vintage_months: 6 (assumed minimum)
 * - abb: undefined (don't assume ABB in Phase A)
 * - amc: net_monthly_income (assume income = credits)
 * - bounces_6m: 0 (optimistic)
 * - od_cc_present: false (assume none)
 * - live_usl: estimated from CIBIL
 * - enquiries_6m: estimated from CIBIL
 * - foreign_degree: false (assume domestic)
 * - college_on_list: true (assume approved)
 * - has_speculative_flows: false (assume clean banking)
 * - Unknown CIBIL: treat as 680-699 (conservative)
 */
export function applyConservativeDefaults(profile: PhaseAProfile): UserProfile {
  return {
    ...profile,
    // Conservative assumptions for missing data
    banking_vintage_months: 6,  // Assume minimum
    abb: undefined,  // Don't assume ABB in Phase A
    amc: profile.net_monthly_income,  // Assume income = credits
    bounces_6m: 0,  // Optimistic assumption
    od_cc_present: false,
    has_speculative_flows: false, // Assume clean banking

    // Bureau assumptions
    live_usl: estimateUSL(profile.cibil_band),
    enquiries_6m: estimateEnquiries(profile.cibil_band),

    // Flags
    foreign_degree: profile.foreign_degree ?? false,  // Use provided or assume domestic
    college_on_list: profile.college_on_list ?? true,  // Use provided or assume approved

    // Gross receipts (if provided by CA user from form)
    gross_receipts: (profile as any).gross_receipts,
  }
}

// Estimate USL from CIBIL band (conservative)
function estimateUSL(cibilBand: string): number {
  switch (cibilBand) {
    case "750+": return 1
    case "725-749": return 2
    case "700-724": return 3
    case "680-699": return 4
    case "<680": return 5
    default: return 4  // §10: Unknown → treat as 680-699
  }
}

// Estimate Enquiries from CIBIL band (conservative)
function estimateEnquiries(cibilBand: string): number {
  switch (cibilBand) {
    case "750+": return 0
    case "725-749": return 1
    case "700-724": return 1
    case "680-699": return 2
    case "<680": return 3
    default: return 2  // §10: Unknown → treat as 680-699
  }
}