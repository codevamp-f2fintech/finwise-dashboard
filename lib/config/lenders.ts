// config/lenders.ts

export const LENDER_CONFIGS: Record<string, any> = {
  bajaj: {
    id: "bajaj",
    name: "Bajaj Finance",
    product_types: ["OD", "TL"],
    max_limit: 7500000, // ₹75L
    roi: 14.6,
    processing_fee: "2% + GST",
    disbursal_time: "3-5 days",
    foir_percent: 65,           // Policy: 60-70%, default 65
    foir_salaried_percent: 55,  // Policy: 50-60% for salaried
    io_months: 24,              // IO: up to 24m
    dropline: false,
    abb_multiple: 2,            // ABB/2 sanity for Bajaj
    penal_rate_pa: 24,
    bounce_fee: 500,

    gates: [
      {
        rule_order: 1,
        gate: "Degree/Experience",
        field: "degree",
        operator: "IN",
        threshold_value: ["MBBS", "MD", "MS", "CA", "CS"],
        on_pass_next: 2,
        on_fail_reason_code: "DEGREE_NOT_APPROVED",
        notes: "MBBS allowed 0y exp"
      },
      {
        rule_order: 2,
        gate: "Bureau",
        field: "cibil_band",
        operator: "IN",
        threshold_value: ["700-724", "725-749", "750+"],
        on_pass_next: 3,
        on_fail_reason_code: "BUREAU_MIN_FAIL",
        notes: "Min 700"
      },
      {
        rule_order: 3,
        gate: "Banking Vintage",
        field: "banking_vintage_months",
        operator: ">=",
        threshold_value: 6,
        on_pass_next: 4,
        on_fail_reason_code: "BANKING_MISSING",
        notes: "6m mandatory"
      },
      {
        rule_order: 4,
        gate: "Bounces",
        field: "bounces_6m",
        operator: "<=",
        threshold_value: 1,
        on_pass_next: 5,
        on_fail_reason_code: "BOUNCE_POLICY_FAIL",
        notes: "≤1 technical"
      },
      {
        rule_order: 5,
        gate: "Exposure – USL",
        field: "live_usl",
        operator: "<=",
        threshold_value: 6,
        on_pass_next: 6,
        on_fail_reason_code: "USL_TOO_MANY",
        notes: "Max 6"
      },
      {
        rule_order: 6,
        gate: "Exposure – Enquiries",
        field: "enquiries_6m",
        operator: "<=",
        threshold_value: 2,
        on_pass_next: 7,
        on_fail_reason_code: "ENQUIRY_EXCESS",
        notes: "Max 2"
      },
      {
        rule_order: 7,
        gate: "ABB sanity",
        field: "abb",
        operator: "CUSTOM_ABB_SANITY",
        threshold_value: 2,  // ABB/2 for Bajaj
        on_pass_next: "CALCULATE",
        on_fail_reason_code: "ABB_LT_THRESHOLD",
        notes: "Use ABB/2 sanity for EMI"
      }
    ],

    // TL-specific gates (from Bajaj_TL.csv)
    tl_gates: [
      {
        rule_order: 1,
        gate: "Degree/Experience",
        field: "degree",
        operator: "IN",
        threshold_value: ["MBBS", "MD", "MS", "CA", "CS"],
        on_pass_next: 2,
        on_fail_reason_code: "DEGREE_NOT_APPROVED"
      },
      {
        rule_order: 2,
        gate: "Bureau",
        field: "cibil_band",
        operator: "IN",
        threshold_value: ["700-724", "725-749", "750+"],
        on_pass_next: 3,
        on_fail_reason_code: "BUREAU_MIN_FAIL"
      },
      {
        rule_order: 3,
        gate: "Employment",
        field: "product",
        operator: "=",
        threshold_value: "TL",
        on_pass_next: 4,
        on_fail_reason_code: "",
        notes: "Salaried uses FOIR 50-60%"
      },
      {
        rule_order: 4,
        gate: "FOIR – Salaried",
        field: "CALCULATED_FOIR",
        operator: "calc",
        threshold_value: null,
        on_pass_next: 5,
        on_fail_reason_code: "",
        notes: "=FOIR%*NetSalary-ExistingEMIs"
      },
      {
        rule_order: 5,
        gate: "Principal",
        field: "CALCULATED_PRINCIPAL",
        operator: "calc",
        threshold_value: null,
        on_pass_next: "CALCULATE",
        on_fail_reason_code: "",
        notes: "Tenure 36/48/60m"
      }
    ],

    docs_required: {
      phase_a: ["KYC", "Degree Certificate"],
      phase_b: ["Residence Proof (Rent Agreement or OHP)", "6m Banking Statements"]
    }
  },

  abfl: {
    id: "abfl",
    name: "ABFL (DLOD)",
    product_types: ["OD", "TL"],
    max_limit: 10000000, // ₹1Cr
    roi: 14.5,
    processing_fee: "2-2.5% + GST",
    disbursal_time: "5-7 days",
    foir_percent: 65,
    foir_salaried_percent: 55,
    io_months: 24,          // IO: 12-24m
    dropline: true,          // Post-IO → dropline; no limit drop during IO
    abb_multiple: 2,         // ABB/2 sanity for ABFL
    penal_rate_pa: 24,
    bounce_fee: 500,

    gates: [
      {
        rule_order: 1,
        gate: "Degree/Experience",
        field: "degree",
        operator: "IN",
        threshold_value: ["MBBS", "MD", "MS", "CA"],
        on_pass_next: 2,
        on_fail_reason_code: "DEGREE_NOT_APPROVED"
      },
      {
        rule_order: 2,
        gate: "Bureau",
        field: "cibil_band",
        operator: "IN",
        threshold_value: ["700-724", "725-749", "750+"],
        on_pass_next: 3,
        on_fail_reason_code: "BUREAU_MIN_FAIL"
      },
      {
        rule_order: 3,
        gate: "Pin/Bounce",
        field: "bounces_6m",
        operator: "<=",
        threshold_value: 1,
        on_pass_next: 4,
        on_fail_reason_code: "BOUNCE_POLICY_FAIL"
      },
      {
        rule_order: 4,
        gate: "ABB sanity",
        field: "abb",
        operator: "CUSTOM_ABB_SANITY",
        threshold_value: 2,  // ABB/2 for ABFL
        on_pass_next: "CALCULATE",
        on_fail_reason_code: "ABB_LT_THRESHOLD",
        notes: "Use ABB/2 sanity for EMI"
      }
    ],

    docs_required: {
      phase_a: ["KYC", "Degree Certificate"],
      phase_b: ["ITR (2 years)", "Business Proof (Udyam/CA firm)", "GST (if applicable)", "26AS", "OHP"]
    }
  },

  tata: {
    id: "tata",
    name: "Tata Capital",
    product_types: ["OD", "TL"],
    max_limit: 8000000, // from Tata_OD.csv Final Ticket cap
    roi: 13.5,
    processing_fee: "2% + GST",
    disbursal_time: "4-6 days",
    foir_percent: 65,
    foir_salaried_percent: 55,
    io_months: 24,
    dropline: true,           // Fixed-cum dropline OD
    abb_multiple: 1.5,        // ABB/1.5 for tickets >₹15L
    penal_rate_pa: 24,
    bounce_fee: 500,

    gates: [
      {
        rule_order: 1,
        gate: "Degree/College",
        field: "college_on_list",
        operator: "=",
        threshold_value: true,
        on_pass_next: 2,
        on_fail_reason_code: "COLLEGE_NOT_APPROVED"
      },
      {
        rule_order: 2,
        gate: "Bureau",
        field: "cibil_band",
        operator: "IN",
        threshold_value: ["725-749", "750+"], // 700-724 via RCM
        on_pass_next: 3,
        on_fail_reason_code: "BUREAU_MIN_FAIL",
        notes: "RCM allowed for 700-724"
      },
      {
        rule_order: 3,
        gate: "Exposure",
        field: "live_usl",
        operator: "<=",
        threshold_value: 6,
        on_pass_next: 4,
        on_fail_reason_code: "USL_TOO_MANY"
      },
      {
        rule_order: 4,
        gate: "Exposure – new USL 6m",
        field: "enquiries_6m",
        operator: "<=",
        threshold_value: 2,
        on_pass_next: 5,
        on_fail_reason_code: "ENQUIRY_EXCESS"
      },
      {
        rule_order: 5,
        gate: "Banking waiver",
        field: "CUSTOM_TATA_BANKING",
        operator: "CUSTOM_TATA_BANKING",
        threshold_value: null,
        on_pass_next: 6,
        on_fail_reason_code: "FOREIGN_DEGREE_BANKING_REQD",
        notes: "Banking not required for domestic degree UNLESS foreign_degree=true OR live_usl > 4"
      },
      {
        rule_order: 6,
        gate: "ABB rule",
        field: "abb",
        operator: "CUSTOM_ABB_TATA",
        threshold_value: null,
        on_pass_next: "CALCULATE",
        on_fail_reason_code: "ABB_LT_THRESHOLD",
        notes: "IF(RequestedLimit>1500000, ABB/1.5, lenient)"
      }
    ],

    docs_required: {
      phase_a: ["KYC", "Degree Certificate"],
      phase_b: ["Consultation/Practice Proof", "OHP"],
      conditional: {
        foreign_degree: ["6m Banking Statements"]
      }
    }
  },

  lnt: {
    id: "lnt",
    name: "L&T Finance",
    product_types: ["OD", "TL"],
    max_limit: 7500000, // ₹75L+
    roi: 14.5,
    processing_fee: "2-3% + GST",
    disbursal_time: "5-8 days",
    foir_percent: 65,           // Policy: FOIR 60-70%
    foir_salaried_percent: 55,
    io_months: 24,
    dropline: false,
    abb_multiple: 5,            // ABB/5 strict
    penal_rate_pa: 24,
    bounce_fee: 500,

    gates: [
      {
        rule_order: 1,
        gate: "Vintage",
        field: "experience_years",
        operator: ">=",
        threshold_value: 3,
        on_pass_next: 2,
        on_fail_reason_code: "VINTAGE_SHORTFALL",
        notes: "≥3y"
      },
      {
        rule_order: 2,
        gate: "Bureau",
        field: "cibil_band",
        operator: "CUSTOM_LNT_CIBIL",
        threshold_value: null,
        on_pass_next: 3,
        on_fail_reason_code: "BUREAU_MIN_FAIL",
        notes: "≥685 std; ≥750 if >₹75L"
      },
      {
        rule_order: 3,
        gate: "Speculative flows",
        field: "has_speculative_flows",
        operator: "=",
        threshold_value: false,
        on_pass_next: 4,
        on_fail_reason_code: "SPECULATIVE_EXPOSURE_HIGH",
        notes: "Block if speculative keywords present"
      },
      {
        rule_order: 4,
        gate: "ABB strict",
        field: "abb",
        operator: "CUSTOM_ABB_5X",
        threshold_value: null,
        on_pass_next: 5,
        on_fail_reason_code: "ABB_LT_THRESHOLD",
        notes: "EMI ≤ ABB/5"
      },
      {
        rule_order: 5,
        gate: "DSCR",
        field: "CALCULATED_DSCR",
        operator: ">=",
        threshold_value: 0.8,
        on_pass_next: "CALCULATE",
        on_fail_reason_code: "DSCR_FAIL",
        notes: "≥0.8"
      }
    ],

    docs_required: {
      phase_a: ["KYC", "Degree Certificate"],
      phase_b: ["ITR (2 years)", "Business Proof (Udyam/registration)", "GST (if applicable)", "26AS", "OHP", "Clean Banking (no speculative flows)", "ABB/5 check", "DSCR ≥ 0.8"]
    }
  },

  godrej: {
    id: "godrej",
    name: "Godrej Capital",
    product_types: ["OD", "TL"],
    max_limit: 20000000, // ₹2Cr
    roi: 14.5,
    processing_fee: "1.5-2.5% + GST",
    disbursal_time: "6-9 days",
    foir_percent: 65,
    foir_salaried_percent: 55,
    io_months: 24,
    dropline: false,
    abb_multiple: 1.5,          // ABB/1.5 default
    penal_rate_pa: 24,
    bounce_fee: 500,

    gates: [
      {
        rule_order: 1,
        gate: "Vintage",
        field: "experience_years",
        operator: "CUSTOM_GODREJ_VINTAGE",
        threshold_value: null,
        on_pass_next: 2,
        on_fail_reason_code: "VINTAGE_SHORTFALL",
        notes: "Doctors ≥3y; CA ≥5y or 3y+₹50L receipts"
      },
      {
        rule_order: 2,
        gate: "Bureau",
        field: "cibil_band",
        operator: "IN",
        threshold_value: ["700-724", "725-749", "750+"],
        on_pass_next: 3,
        on_fail_reason_code: "BUREAU_MIN_FAIL"
      },
      {
        rule_order: 3,
        gate: "Banking",
        field: "banking_vintage_months",
        operator: ">=",
        threshold_value: 6,
        on_pass_next: "CALCULATE",
        on_fail_reason_code: "BANKING_MISSING",
        notes: "6m mandatory"
      }
    ],

    docs_required: {
      phase_a: ["KYC", "Degree Certificate"],
      phase_b: ["ITR (2 years) OR Gross Receipts", "6m Banking", "Udyam/Practice Registration", "26AS", "OHP (preferred)"]
    }
  }
}

export const REASON_CODES: Record<string, string> = {
  BUREAU_MIN_FAIL: "Credit score below lender's minimum band",
  USL_TOO_MANY: "Live unsecured loans exceed cap",
  ENQUIRY_EXCESS: "Excess enquiries in last 3–6 months",
  BANKING_MISSING: "6m banking/statements missing",
  ABB_LT_THRESHOLD: "Average bank balance below required multiple of EMI",
  FOREIGN_DEGREE_BANKING_REQD: "Banking mandatory for foreign degrees",
  BOUNCE_POLICY_FAIL: "NT/cheque bounces beyond tolerance",
  SPECULATIVE_EXPOSURE_HIGH: "Speculative flows observed (trading/crypto/betting)",
  VINTAGE_SHORTFALL: "Practice/firm vintage below minimum",
  COLLEGE_NOT_APPROVED: "College not on approved list",
  NEG_PIN: "Pincode not serviced/negative",
  PROGRAM_GATES_NOT_MET: "Banking/GST/Income track not passing",
  DSCR_FAIL: "DSCR below lender threshold",
  DEGREE_NOT_APPROVED: "Degree not permitted by lender"
}

// Negative pincode list — lenders with negative territory restrictions
export const NEGATIVE_PINCODES: string[] = [
  // Populate with actual negative pincodes per policy
  // This is a placeholder; add real data when available
]