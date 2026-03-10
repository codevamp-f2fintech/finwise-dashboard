// types/eligibility.ts

export type CibilBand = "<680" | "680-699" | "700-724" | "725-749" | "750+"
export type Degree = "MBBS" | "MD" | "MS" | "DM" | "MCh" | "DNB" | "BDS" | "MDS" | "BHMS" | "BAMS" | "CA" | "CS" | "CMA"
export type LoanProduct = "OD" | "TL"
export type EligibilityStatus = "eligible" | "partial" | "ineligible"

export interface UserProfile {
  // Basic Info (Phase A)
  persona: "Doctor" | "CA"
  degree: Degree
  experience_years: number
  employment_type: "Salaried" | "SelfEmployed"
  city?: string
  pincode?: string

  // Credit Info (Phase A)
  cibil_band: CibilBand
  live_usl: number
  enquiries_6m: number
  bounces_6m: number
  existing_emi: number

  // Banking Info (Phase A - Optional)
  banking_vintage_months?: number
  abb?: number  // Average Bank Balance
  amc?: number  // Average Monthly Credits
  od_cc_present?: boolean

  // Loan Request (Phase A)
  product: LoanProduct
  requested_limit: number
  tenure_months: 36 | 48 | 60
  net_monthly_income: number

  // Documents (Phase B)
  documents?: {
    itr_2_years?: File[]
    business_proof?: File
    gst?: File
    banking_6m?: File
    ohp?: File  // Own House Proof
    degree_certificate?: File
    registration_certificate?: File
    consultation_proof?: File    // Tata: clinic registration, consultancy invoices
    residence_proof?: File       // Bajaj: rent agreement or OHP
  }

  // Additional Flags
  foreign_degree?: boolean
  college_on_list?: boolean
  has_speculative_flows?: boolean

  // Gross receipts (for Godrej CA alternate vintage gate)
  gross_receipts?: number

  // Salaried-specific fields (§23.2)
  monthly_gross?: number
  employer_type?: string     // Hospital/Big4/etc.
  salary_credit_vintage?: number  // months in same employer
  form_16_available?: boolean
  net_salary?: number
}

// types/eligibility.ts

export interface PhaseAProfile {
  // Basic Info
  name: string
  persona: "Doctor" | "CA"
  degree: Degree
  experience_years: number
  employment_type: "Salaried" | "SelfEmployed"

  // Self-Declared Financial
  cibil_band: CibilBand  // User selects approximate range
  net_monthly_income: number
  existing_emi: number

  // Loan Request
  product: LoanProduct
  requested_limit: number
  tenure_months: 36 | 48 | 60

  // Optional
  city?: string
  pincode?: string
  foreign_degree?: boolean
  college_on_list?: boolean
}

export interface PhaseBProfile extends PhaseAProfile {
  // Extracted from Bank Statement
  banking_vintage_months: number
  abb: number
  amc: number
  bounces_6m: number
  od_cc_present: boolean
  has_speculative_flows: boolean

  // Extracted from Bureau Report
  cibil_exact: number  // Exact score
  live_usl: number
  enquiries_6m: number

  // Document uploads
  documents: {
    bank_statement_6m: File
    bureau_report: File
    itr_2_years?: File[]
    business_proof?: File
    gst?: File
    degree_certificate?: File
    registration_certificate?: File
    ohp?: File
    consultation_proof?: File
    residence_proof?: File
  }

  // Flags
  foreign_degree?: boolean
  college_on_list?: boolean

  // Financial
  gross_receipts?: number
}

export interface LenderGate {
  rule_order: number
  gate: string
  field: string
  operator: string
  threshold_value: string | number | boolean | string[] | null
  on_pass_next: number | "END" | "CALCULATE"
  on_fail_reason_code: string
  notes?: string
}

export interface EligibilityResult {
  lender_id: string
  lender_name: string
  status: EligibilityStatus
  indicative_limit?: number
  final_limit?: number
  roi: number
  processing_fee: string
  disbursal_time: string
  reasons: {
    passed_gates: string[]
    failed_gates: string[]
    reason_codes: string[]
    customer_messages: string[]
  }
  pros: string[]
  cons: string[]
  required_docs: string[]
  missing_docs?: string[]
  fit_score?: number           // §20 FitScore for ranking
  policy_version?: string      // §10 Audit trail
  io_months?: number           // Per-lender IO period
  dropline?: boolean           // Per-lender dropline flag
  product_type?: LoanProduct   // OD or TL
  is_tl_fallback?: boolean     // Whether this is a TL fallback from OD fail
}