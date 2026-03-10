export interface Lender {
    id: string
    name: string
    productType: string
    indicativeLimit: string
    finalLimit?: string
    roiRange: string
    processingFee: string
    tenure?: string
    emiPerLakhMin?: string
    disbursalTime: string
    pros: string[]
    cons: string[]
    status: "eligible" | "partial" | "ineligible"
    rank: number
    totalCharges?: string
    insurance?: string
    docsRequired?: string[]
    eligibilityCriteria?: string
    eligibility?: {
        employmentTypes?: string[]
        minIncome?: number
        maxIncome?: number
        minLoanAmount?: number
        maxLoanAmount?: number
        businessMinTurnover?: number
    }
}

export const mockLenders: Lender[] = [
    // Personal Loans - Salaried
    {
        id: "PL-HDFC",
        name: "HDFC Bank",
        productType: "Personal Loan - Salaried",
        indicativeLimit: "Up to ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "10.90% – 24.00% p.a.",
        processingFee: "Up to 2.50% of loan amount OR ₹6,500 + GST (whichever is lower)",
        tenure: "12 – 60 months",
        disbursalTime: "2-3 working days",
        pros: [
            "Fast approval process",
            "Pre-approved journeys available",
            "Competitive interest rates",
            "Flexible tenure options"
        ],
        cons: [
            "Processing fee applicable",
            "Requires good CIBIL score (≥700)",
            "Banking vintage of 6 months required"
        ],
        status: "eligible",
        rank: 1,
        totalCharges: "Processing fee + GST; stamp duty as applicable",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 21, Max age: 60, Min monthly salary: ₹25,000, Min work exp: 2 years, Min CIBIL: 700, FOIR: 50-60%",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 25000,
            minLoanAmount: 50000,
            maxLoanAmount: 10000000
        }
    },
    {
        id: "PL-BAJAJ",
        name: "Bajaj Finserv",
        productType: "Personal Loan - Salaried (OD facility available)",
        indicativeLimit: "Up to ₹50L",
        finalLimit: "₹50L",
        roiRange: "10% – 31% p.a.",
        processingFee: "Up to 3.93% of loan amount (inclusive of applicable taxes)",
        tenure: "12 – 96 months",
        disbursalTime: "24-48 hours",
        pros: [
            "OD facility available",
            "Fast approval",
            "Pre-approved offers",
            "Flexible repayment tenure"
        ],
        cons: [
            "Higher processing fee",
            "Higher maximum interest rate",
            "Higher minimum salary requirement (₹35,000)"
        ],
        status: "eligible",
        rank: 2,
        totalCharges: "Processing fee (inclusive of taxes)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 24, Max age: 60, Min monthly salary: ₹35,000, Min work exp: 2 years, Min CIBIL: 685, FOIR: 55-60%",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 35000,
            minLoanAmount: 50000,
            maxLoanAmount: 5000000
        }
    },
    {
        id: "PL-IDFC",
        name: "IDFC First Bank",
        productType: "Personal Loan - Salaried",
        indicativeLimit: "Up to ₹75L",
        finalLimit: "₹75L",
        roiRange: "From 9.99% p.a.",
        processingFee: "2% of loan amount (inclusive of GST)",
        tenure: "12 – 72 months",
        disbursalTime: "2-3 working days",
        pros: [
            "Competitive starting rate (9.99%)",
            "Higher loan limit (₹75L)",
            "Reasonable processing fee",
            "Good tenure options"
        ],
        cons: [
            "Requires good CIBIL score (≥700)",
            "Banking vintage of 6 months required",
            "Income proof mandatory"
        ],
        status: "eligible",
        rank: 3,
        totalCharges: "Processing fee: 2% of loan amount (inclusive of GST)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 23, Max age: 60, Min monthly salary: ₹25,000, Min work exp: 2 years, Min CIBIL: 700, FOIR: 50-60%",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 25000,
            minLoanAmount: 50000,
            maxLoanAmount: 7500000
        }
    },
    {
        id: "PL-ICICI",
        name: "ICICI Bank",
        productType: "Personal Loan - Salaried",
        indicativeLimit: "Up to ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "10.45% – 16.50% p.a.",
        processingFee: "Up to 2% of loan amount + taxes",
        tenure: "12 – 60 months",
        disbursalTime: "2-3 working days",
        pros: [
            "High loan limit (₹1 Cr)",
            "Competitive interest rate range",
            "Established bank with wide network",
            "Pre-approved options available"
        ],
        cons: [
            "Processing fee up to 2%",
            "Requires CIBIL ≥700",
            "Shorter maximum tenure (60 months)"
        ],
        status: "eligible",
        rank: 4,
        totalCharges: "Processing fee: Up to 2% of loan amount + taxes",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 23, Max age: 60, Min monthly salary: ₹25,000, Min work exp: 2 years, Min CIBIL: 700",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 25000,
            minLoanAmount: 50000,
            maxLoanAmount: 10000000
        }
    },
    {
        id: "PL-CHOLA",
        name: "Cholamandalam Finance",
        productType: "Personal Loan - Salaried (OD facility)",
        indicativeLimit: "Up to ₹10L",
        finalLimit: "₹10L",
        roiRange: "10% – 28% p.a.",
        processingFee: "Instant/digital PL (Chola One): 4%–6% + GST; other programs: as per sanction/KFS",
        tenure: "12 – 48 months",
        disbursalTime: "24-48 hours",
        pros: [
            "OD facility available",
            "Fast approval process",
            "Digital application (Chola One)",
            "Flexible repayment options"
        ],
        cons: [
            "Lower maximum loan amount (₹10L)",
            "Higher processing fee (4-6%)",
            "Shorter tenure (48 months max)",
            "Higher salary requirement (₹35,000)"
        ],
        status: "eligible",
        rank: 5,
        totalCharges: "Processing fee: 4%–6% + GST for Chola One",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 21, Max age: 60, Min monthly salary: ₹35,000, Min work exp: 2 years, Min CIBIL: 685, FOIR: 55-60%",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 35000,
            minLoanAmount: 50000,
            maxLoanAmount: 1000000
        }
    },
    {
        id: "PL-TATA",
        name: "Tata Capital",
        productType: "Personal Loan - Salaried (OD facility)",
        indicativeLimit: "Up to ₹40L",
        finalLimit: "₹40L",
        roiRange: "10.99% – 29.99% p.a.",
        processingFee: "Up to 3.5% of loan amount + GST",
        tenure: "12 – 60 months",
        disbursalTime: "2-3 working days",
        pros: [
            "OD facility available",
            "Flexible tenure options",
            "Pre-approved offers",
            "Quick disbursal"
        ],
        cons: [
            "Wide interest rate range (up to 29.99%)",
            "Processing fee up to 3.5%",
            "Higher minimum salary (₹35,000)",
            "Lower CIBIL acceptance (685)"
        ],
        status: "eligible",
        rank: 6,
        totalCharges: "Processing fee: Up to 3.5% of loan amount + GST",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 21, Max age: 60, Min monthly salary: ₹35,000, Min work exp: 2 years, Min CIBIL: 685, FOIR: 55-60%",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 35000,
            minLoanAmount: 50000,
            maxLoanAmount: 4000000
        }
    },
    {
        id: "PL-AXIS",
        name: "Axis Bank",
        productType: "Personal Loan - Salaried",
        indicativeLimit: "Up to ₹75L",
        finalLimit: "₹75L",
        roiRange: "9.99% – 22% p.a.",
        processingFee: "Typically 1.5%–2% of loan amount + GST",
        tenure: "12 – 60 months",
        disbursalTime: "2-3 working days",
        pros: [
            "Competitive starting rate (9.99%)",
            "High loan limit (₹75L)",
            "Established bank",
            "Lower processing fee range"
        ],
        cons: [
            "Requires CIBIL ≥700",
            "Banking vintage required",
            "Standard documentation needed"
        ],
        status: "eligible",
        rank: 7,
        totalCharges: "Processing fee: 1.5%–2% of loan amount + GST",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 21, Max age: 60, Min monthly salary: ₹25,000, Min work exp: 2 years, Min CIBIL: 700",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 25000,
            minLoanAmount: 50000,
            maxLoanAmount: 7500000
        }
    },

    // Pre-Approved Personal Loans
    {
        id: "PL1",
        name: "Godrej Capital",
        productType: "Pre-Approved Personal Loan (OD variant)",
        indicativeLimit: "Up to ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "From 10.99% p.a.",
        processingFee: "Zero processing fee (campaign offer)",
        tenure: "12 – 60 months",
        disbursalTime: "24-48 hours",
        pros: [
            "Zero processing fee",
            "Pre-approved offer",
            "Competitive starting rate",
            "OD variant available",
            "High loan limit"
        ],
        cons: [
            "Pre-approval required",
            "Specific campaign offer",
            "May not be available to all customers"
        ],
        status: "eligible",
        rank: 1,
        totalCharges: "Zero processing fee (campaign offer)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 21, Max age: 60, Min monthly salary: ₹25,000, Min work exp: 2 years, Min CIBIL: 700",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 25000,
            minLoanAmount: 50000,
            maxLoanAmount: 10000000
        }
    },
    {
        id: "PL2",
        name: "Aditya Birla Finance (ABFL)",
        productType: "Pre-Approved Personal Loan",
        indicativeLimit: "Up to ₹50L",
        finalLimit: "₹50L",
        roiRange: "Starts at 12.99% p.a.; APR 13%–28%",
        processingFee: "3% + GST",
        tenure: "12 – 60 months",
        disbursalTime: "24-48 hours",
        pros: [
            "Pre-approved offer",
            "Fast approval process",
            "Competitive starting rate",
            "Established NBFC"
        ],
        cons: [
            "Wide APR range (up to 28%)",
            "Processing fee 3%",
            "Higher salary requirement (₹35,000)",
            "Pre-approval needed"
        ],
        status: "eligible",
        rank: 2,
        totalCharges: "Processing fee: 3% + GST",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 24, Max age: 60, Min monthly salary: ₹35,000, Min work exp: 2 years, Min CIBIL: 685",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 35000,
            minLoanAmount: 50000,
            maxLoanAmount: 5000000
        }
    },
    {
        id: "PL3",
        name: "L&T Finance",
        productType: "Pre-Approved Personal Loan (OD option)",
        indicativeLimit: "Up to ₹75L",
        finalLimit: "₹75L",
        roiRange: "11% p.a. onwards",
        processingFee: "Up to 4% of loan amount + applicable taxes",
        tenure: "12 – 60 months",
        disbursalTime: "24-48 hours",
        pros: [
            "Pre-approved offer",
            "OD option available",
            "High loan limit (₹75L)",
            "Competitive starting rate"
        ],
        cons: [
            "Processing fee up to 4%",
            "Pre-approval required",
            "Standard documentation needed"
        ],
        status: "eligible",
        rank: 3,
        totalCharges: "Processing fee: Up to 4% of loan amount + applicable taxes",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 23, Max age: 60, Min monthly salary: ₹25,000, Min work exp: 2 years, Min CIBIL: 700",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 25000,
            minLoanAmount: 50000,
            maxLoanAmount: 7500000
        }
    },
    {
        id: "PL4",
        name: "Tata Capital",
        productType: "Pre-Approved Personal Loan (OD flexi)",
        indicativeLimit: "Up to ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "10.99% – 29.99% p.a.",
        processingFee: "Up to 3.5% of loan amount + GST",
        tenure: "12 – 60 months",
        disbursalTime: "24-48 hours",
        pros: [
            "Pre-approved offer",
            "OD flexi option",
            "High loan limit (₹1 Cr)",
            "Fast disbursal"
        ],
        cons: [
            "Wide interest rate range",
            "Processing fee up to 3.5%",
            "Pre-approval required"
        ],
        status: "eligible",
        rank: 4,
        totalCharges: "Processing fee: Up to 3.5% of loan amount + GST",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 23, Max age: 60, Min monthly salary: ₹25,000, Min work exp: 2 years, Min CIBIL: 700",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 25000,
            minLoanAmount: 50000,
            maxLoanAmount: 10000000
        }
    },
    {
        id: "PL5",
        name: "Bajaj Finance",
        productType: "Pre-Approved Personal Loan",
        indicativeLimit: "Up to ₹10L",
        finalLimit: "₹10L",
        roiRange: "10% – 31% p.a.",
        processingFee: "Up to 3.93% of loan amount (inclusive of applicable taxes)",
        tenure: "12 – 48 months",
        disbursalTime: "24-48 hours",
        pros: [
            "Pre-approved offer",
            "Fast approval",
            "Quick disbursal",
            "Simple documentation"
        ],
        cons: [
            "Lower loan limit (₹10L)",
            "Wide interest rate range",
            "Shorter tenure (48 months)",
            "Processing fee up to 3.93%"
        ],
        status: "eligible",
        rank: 5,
        totalCharges: "Processing fee: Up to 3.93% of loan amount (inclusive of taxes)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 21, Max age: 60, Min monthly salary: ₹35,000, Min work exp: 2 years, Min CIBIL: 685",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 35000,
            minLoanAmount: 50000,
            maxLoanAmount: 1000000
        }
    },
    {
        id: "PL6",
        name: "Cholamandalam Finance",
        productType: "Pre-Approved Personal Loan",
        indicativeLimit: "Up to ₹40L",
        finalLimit: "₹40L",
        roiRange: "10% – 28% p.a.",
        processingFee: "Instant/digital PL (Chola One): 4%–6% + GST; other programs: as per sanction/KFS",
        tenure: "12 – 60 months",
        disbursalTime: "24-48 hours",
        pros: [
            "Pre-approved offer",
            "Digital application (Chola One)",
            "Fast disbursal",
            "Flexible options"
        ],
        cons: [
            "Higher processing fee (4-6%)",
            "Wide interest rate range",
            "Higher salary requirement"
        ],
        status: "eligible",
        rank: 6,
        totalCharges: "Processing fee: 4%–6% + GST for Chola One",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "Last 3 months salary slips + Form 16 / latest ITR",
            "Last 6 months salary account statements",
            "Employee ID / joining letter (as asked)",
            "Existing loan statements (if any)",
            "Recent photo"
        ],
        eligibilityCriteria: "Min age: 21, Max age: 60, Min monthly salary: ₹35,000, Min work exp: 2 years, Min CIBIL: 685",
        eligibility: {
            employmentTypes: ["salaried"],
            minIncome: 35000,
            minLoanAmount: 50000,
            maxLoanAmount: 4000000
        }
    },

    // Business Loans - Term (Unsecured)
    {
        id: "BL-BAJAJ",
        name: "Bajaj Finserv",
        productType: "Business Loan – Term (Unsecured)",
        indicativeLimit: "Up to ₹75 Lakh",
        finalLimit: "₹75 Lakh",
        roiRange: "14% – 25% p.a.",
        processingFee: "Up to 4.72% (inclusive of applicable taxes)",
        tenure: "12 – 84 months",
        disbursalTime: "3-5 working days",
        pros: [
            "No collateral required",
            "Fast approval process",
            "Flexible tenure",
            "Lower minimum turnover requirement (₹60 Lakh)"
        ],
        cons: [
            "Higher processing fee (up to 4.72%)",
            "Higher interest rate range",
            "Minimum 3 years business vintage required",
            "Higher minimum CIBIL (685)"
        ],
        status: "eligible",
        rank: 1,
        totalCharges: "Processing fee: Up to 4.72% (inclusive of applicable taxes)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST/Shop Act/Udyam/Partnership deed/COI & MOA/AOA (as applicable)",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited)",
            "Last 6–12 months current account statements",
            "Ownership/office proof",
            "Existing loan statements"
        ],
        eligibilityCriteria: "Min age: 24, Max age: 60, Min CIBIL: 685, Min business vintage: 3 years, Min annual turnover: ₹60 Lakh",
        eligibility: {
            employmentTypes: ["business_owner", "self_employed"],
            businessMinTurnover: 6000000,
            minLoanAmount: 100000,
            maxLoanAmount: 7500000
        }
    },
    {
        id: "BL-IDFC",
        name: "IDFC First Bank",
        productType: "Business Loan – Term (Unsecured)",
        indicativeLimit: "Up to ₹75 Lakh",
        finalLimit: "₹75 Lakh",
        roiRange: "From 12.99% p.a.",
        processingFee: "Up to 3.5% of sanctioned amount + GST",
        tenure: "12 – 60 months",
        disbursalTime: "3-5 working days",
        pros: [
            "Competitive starting rate (12.99%)",
            "No collateral required",
            "Higher loan limit",
            "Established bank"
        ],
        cons: [
            "Processing fee up to 3.5%",
            "Higher CIBIL requirement (725)",
            "Minimum 3 years business vintage",
            "Higher turnover requirement (₹1 Cr)"
        ],
        status: "eligible",
        rank: 2,
        totalCharges: "Processing fee: Up to 3.5% of sanctioned amount + GST",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST/Shop Act/Udyam/Partnership deed/COI & MOA/AOA (as applicable)",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited)",
            "Last 6–12 months current account statements",
            "Ownership/office proof",
            "Existing loan statements"
        ],
        eligibilityCriteria: "Min age: 23, Max age: 60, Min CIBIL: 725, Min business vintage: 3 years, Min annual turnover: ₹1 Cr",
        eligibility: {
            employmentTypes: ["business_owner", "self_employed"],
            businessMinTurnover: 10000000,
            minLoanAmount: 100000,
            maxLoanAmount: 7500000
        }
    },
    {
        id: "BL-ICICI",
        name: "ICICI Bank",
        productType: "Business Loan – Term (Unsecured)",
        indicativeLimit: "Up to ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "13.25% – 19.25% p.a.",
        processingFee: "Up to 2% of loan amount + applicable taxes",
        tenure: "12 – 60 months",
        disbursalTime: "3-5 working days",
        pros: [
            "High loan limit (₹1 Cr)",
            "Competitive interest rate range",
            "Lower processing fee (up to 2%)",
            "Established bank with wide network"
        ],
        cons: [
            "Higher CIBIL requirement (725)",
            "Higher turnover requirement (₹1 Cr)",
            "Minimum 3 years business vintage",
            "Extensive documentation"
        ],
        status: "eligible",
        rank: 3,
        totalCharges: "Processing fee: Up to 2% of loan amount + applicable taxes",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST/Shop Act/Udyam/Partnership deed/COI & MOA/AOA (as applicable)",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited)",
            "Last 6–12 months current account statements",
            "Ownership/office proof",
            "Existing loan statements"
        ],
        eligibilityCriteria: "Min age: 23, Max age: 65, Min CIBIL: 725, Min business vintage: 3 years, Min annual turnover: ₹1 Cr",
        eligibility: {
            employmentTypes: ["business_owner", "self_employed"],
            businessMinTurnover: 10000000,
            minLoanAmount: 100000,
            maxLoanAmount: 10000000
        }
    },
    {
        id: "BL-CHOLA",
        name: "Cholamandalam Finance",
        productType: "Business Loan – Term (Unsecured)",
        indicativeLimit: "Up to ₹20 Lakh",
        finalLimit: "₹20 Lakh",
        roiRange: "10% – 30% p.a.",
        processingFee: "As per sanction/KFS (charges vary by program)",
        tenure: "12 – 48 months",
        disbursalTime: "3-5 working days",
        pros: [
            "Lower minimum turnover (₹70 Lakh)",
            "Shorter business vintage (2 years)",
            "Flexible programs available",
            "Lower CIBIL acceptance (700)"
        ],
        cons: [
            "Lower loan limit (₹20 Lakh)",
            "Wide interest rate range (up to 30%)",
            "Shorter tenure (48 months)",
            "Variable processing fee"
        ],
        status: "eligible",
        rank: 4,
        totalCharges: "Processing fee: As per sanction/KFS (varies by program)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST/Shop Act/Udyam/Partnership deed/COI & MOA/AOA (as applicable)",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited)",
            "Last 6–12 months current account statements",
            "Ownership/office proof",
            "Existing loan statements"
        ],
        eligibilityCriteria: "Min age: 25, Max age: 65, Min CIBIL: 700, Min business vintage: 2 years, Min annual turnover: ₹70 Lakh",
        eligibility: {
            employmentTypes: ["business_owner", "self_employed"],
            businessMinTurnover: 7000000,
            minLoanAmount: 100000,
            maxLoanAmount: 2000000
        }
    },
    {
        id: "BL-TATA",
        name: "Tata Capital",
        productType: "Business Loan – Term (Unsecured)",
        indicativeLimit: "Up to ₹20 Lakh",
        finalLimit: "₹20 Lakh",
        roiRange: "12% – 30% p.a.",
        processingFee: "Up to 3% of loan amount + taxes",
        tenure: "12 – 60 months",
        disbursalTime: "3-5 working days",
        pros: [
            "Lower business vintage requirement (2 years)",
            "Lower CIBIL acceptance (700)",
            "High turnover limit (₹1 Cr)",
            "Flexible tenure"
        ],
        cons: [
            "Lower loan limit (₹20 Lakh)",
            "Wide interest rate range (up to 30%)",
            "Processing fee up to 3%",
            "Extensive documentation"
        ],
        status: "eligible",
        rank: 5,
        totalCharges: "Processing fee: Up to 3% of loan amount + taxes",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST/Shop Act/Udyam/Partnership deed/COI & MOA/AOA (as applicable)",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited)",
            "Last 6–12 months current account statements",
            "Ownership/office proof",
            "Existing loan statements"
        ],
        eligibilityCriteria: "Min age: 21, Max age: 60, Min CIBIL: 700, Min business vintage: 2 years, Min annual turnover: ₹1 Cr",
        eligibility: {
            employmentTypes: ["business_owner", "self_employed"],
            businessMinTurnover: 10000000,
            minLoanAmount: 100000,
            maxLoanAmount: 2000000
        }
    },
    {
        id: "BL-LENDINGKART",
        name: "LendingKart",
        productType: "Business Loan – Term (Unsecured)",
        indicativeLimit: "Up to ₹35 Lakh",
        finalLimit: "₹35 Lakh",
        roiRange: "Starting from 13.5% p.a.",
        processingFee: "Up to 4% of loan amount + applicable taxes",
        tenure: "12 – 60 months",
        disbursalTime: "2-3 working days",
        pros: [
            "Lower CIBIL requirement (650)",
            "Lower turnover requirement (₹50 Lakh)",
            "Shorter business vintage (2 years)",
            "Fast disbursal"
        ],
        cons: [
            "Processing fee up to 4%",
            "Moderate loan limit (₹35 Lakh)",
            "Interest rate not fully disclosed",
            "NBFC lender"
        ],
        status: "eligible",
        rank: 6,
        totalCharges: "Processing fee: Up to 4% of loan amount + applicable taxes",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST/Shop Act/Udyam/Partnership deed/COI & MOA/AOA (as applicable)",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited)",
            "Last 6–12 months current account statements",
            "Ownership/office proof",
            "Existing loan statements"
        ],
        eligibilityCriteria: "Min age: 21, Max age: 65, Min CIBIL: 650, Min business vintage: 2 years, Min annual turnover: ₹50 Lakh",
        eligibility: {
            employmentTypes: ["business_owner", "self_employed"],
            businessMinTurnover: 5000000,
            minLoanAmount: 100000,
            maxLoanAmount: 3500000
        }
    },

    // Doctor / CA Loans
    {
        id: "DOC-BAJAJ",
        name: "Bajaj Finance",
        productType: "Doctor/CA OD & Term Loan",
        indicativeLimit: "Up to ₹75L",
        finalLimit: "₹75L",
        roiRange: "11% – 18% p.a.",
        processingFee: "Up to 2.95% of loan amount (inclusive of taxes)",
        tenure: "Up to 60 months",
        disbursalTime: "24-48 hours",
        pros: [
            "MBBS allowed with 0 years experience",
            "OD and term loan options",
            "Fast approval",
            "Competitive interest rate",
            "No experience required for MBBS"
        ],
        cons: [
            "Requires CIBIL ≥700",
            "Processing fee up to 2.95%",
            "Banking vintage 6 months required",
            "Limited to specific professions"
        ],
        status: "eligible",
        rank: 1,
        totalCharges: "Processing fee: Up to 2.95% of loan amount (inclusive of taxes)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST registration/Shop Act/Udyam/Professional registration",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited) (if applicable)",
            "Last 6–12 months current + savings statements",
            "Office address proof",
            "Existing loan statements",
            "Degree + Medical Registration Certificate",
            "Clinic/hospital proof, rental/ownership proof (if applicable)"
        ],
        eligibilityCriteria: "Min CIBIL: 700, Min experience: 0 years (MBBS), Eligible degrees: MBBS, MD, MS, CA, CS, Banking vintage: 6 months, FOIR: 60-70%, ABB rule: EMI ≤ ABB / 2",
        eligibility: {
            employmentTypes: ["doctor", "ca"],
            minLoanAmount: 100000,
            maxLoanAmount: 7500000
        }
    },
    {
        id: "DOC-ABFL",
        name: "Aditya Birla Finance (ABFL)",
        productType: "Hybrid Dropline OD (DLOD)",
        indicativeLimit: "Up to ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "Flexi/DLOD APR: 12.50% – 28% p.a.; Reference rates: STRR 19.45% / LTRR 20.45%",
        processingFee: "Up to 4% (excluding GST)",
        tenure: "Varies (Dropline OD)",
        disbursalTime: "2-3 working days",
        pros: [
            "High loan limit (₹1 Cr)",
            "Hybrid dropline OD facility",
            "Flexible repayment structure",
            "For MBBS/MD/CA professionals"
        ],
        cons: [
            "Wide APR range (up to 28%)",
            "Higher processing fee (up to 4%)",
            "Requires CIBIL ≥700",
            "Complex structure"
        ],
        status: "eligible",
        rank: 2,
        totalCharges: "Processing fee: Up to 4% (excluding GST)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST registration/Shop Act/Udyam/Professional registration",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited) (if applicable)",
            "Last 6–12 months current + savings statements",
            "Office address proof",
            "Existing loan statements",
            "Degree + Medical Registration Certificate",
            "Clinic/hospital proof, rental/ownership proof (if applicable)"
        ],
        eligibilityCriteria: "Min CIBIL: 700, Eligible degrees: MBBS, MD, CA, FOIR: 60-70%, ABB rule: EMI ≤ ABB / 2",
        eligibility: {
            employmentTypes: ["doctor", "ca"],
            minLoanAmount: 100000,
            maxLoanAmount: 10000000
        }
    },
    {
        id: "DOC-TATA",
        name: "Tata Capital",
        productType: "Doctor/CA OD & TL",
        indicativeLimit: "₹75L+",
        finalLimit: "₹75L+",
        roiRange: "11% – 22% p.a.",
        processingFee: "Up to 2.99% of loan amount",
        tenure: "Up to 60 months",
        disbursalTime: "2-3 working days",
        pros: [
            "High loan limit (₹75L+)",
            "OD and term loan options",
            "Competitive interest rate",
            "Foreign degree allowed with banking"
        ],
        cons: [
            "Higher CIBIL requirement (725)",
            "For tickets >₹15L: stricter ABB rule (EMI ≤ ABB / 1.5)",
            "Banking vintage 6 months required",
            "Processing fee up to 2.99%"
        ],
        status: "eligible",
        rank: 3,
        totalCharges: "Processing fee: Up to 2.99% of loan amount",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST registration/Shop Act/Udyam/Professional registration",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited) (if applicable)",
            "Last 6–12 months current + savings statements",
            "Office address proof",
            "Existing loan statements",
            "Degree + Medical Registration Certificate",
            "Clinic/hospital proof, rental/ownership proof (if applicable)"
        ],
        eligibilityCriteria: "Min CIBIL: 725, Eligible degrees: Domestic approved college; foreign degree allowed with banking, Banking vintage: 6 months, FOIR: 60-70%, ABB rule: If ticket >₹15L: EMI ≤ ABB / 1.5",
        eligibility: {
            employmentTypes: ["doctor", "ca"],
            minLoanAmount: 100000,
            maxLoanAmount: 7500000
        }
    },
    {
        id: "DOC-LTF",
        name: "L&T Finance",
        productType: "Doctor/CA OD & TL",
        indicativeLimit: "₹80L (higher with stricter bureau)",
        finalLimit: "₹80L+",
        roiRange: "From 15% p.a.",
        processingFee: "Up to 3% of sanctioned amount + applicable taxes",
        tenure: "Varies",
        disbursalTime: "2-3 working days",
        pros: [
            "High loan limit (₹80L+)",
            "Lower CIBIL acceptance (685)",
            "OD and term loan options",
            "DSCR check (0.8)"
        ],
        cons: [
            "Higher starting interest rate (15%)",
            "Processing fee up to 3%",
            "Minimum 3 years experience required",
            "Stricter ABB rule (EMI ≤ ABB / 5)"
        ],
        status: "eligible",
        rank: 4,
        totalCharges: "Processing fee: Up to 3% of sanctioned amount + applicable taxes",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST registration/Shop Act/Udyam/Professional registration",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited) (if applicable)",
            "Last 6–12 months current + savings statements",
            "Office address proof",
            "Existing loan statements",
            "Degree + Medical Registration Certificate",
            "Clinic/hospital proof, rental/ownership proof (if applicable)"
        ],
        eligibilityCriteria: "Min CIBIL: 685, Min experience: 3 years, Eligible degrees: Doctors/CA as per program, Banking vintage: 6 months, FOIR: ≤70%, DSCR: 0.8, ABB rule: EMI ≤ ABB / 5",
        eligibility: {
            employmentTypes: ["doctor", "ca"],
            minLoanAmount: 100000,
            maxLoanAmount: 8000000
        }
    },
    {
        id: "DOC-GODREJ",
        name: "Godrej Capital",
        productType: "Doctor/CA OD & TL",
        indicativeLimit: "MBBS ₹1.25Cr; MD ₹2Cr; CA ₹1.5Cr",
        finalLimit: "₹2 Cr (MD)",
        roiRange: "From 14% p.a.",
        processingFee: "Up to 3% of loan amount",
        tenure: "Varies",
        disbursalTime: "2-3 working days",
        pros: [
            "Very high loan limits based on qualification",
            "OD and term loan options",
            "Degree-specific limits",
            "Established lender"
        ],
        cons: [
            "Higher starting interest rate (14%)",
            "Requires CIBIL ≥700",
            "Minimum 3 years experience",
            "Processing fee up to 3%"
        ],
        status: "eligible",
        rank: 5,
        totalCharges: "Processing fee: Up to 3% of loan amount",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST registration/Shop Act/Udyam/Professional registration",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited) (if applicable)",
            "Last 6–12 months current + savings statements",
            "Office address proof",
            "Existing loan statements",
            "Degree + Medical Registration Certificate",
            "Clinic/hospital proof, rental/ownership proof (if applicable)"
        ],
        eligibilityCriteria: "Min CIBIL: 700, Min experience: 3 years, Eligible degrees: MBBS, MD, CA with vintage caps, Banking vintage: 6 months, FOIR: 60-70%, ABB rule: EMI ≤ ABB / 1.5",
        eligibility: {
            employmentTypes: ["doctor", "ca"],
            minLoanAmount: 100000,
            maxLoanAmount: 20000000
        }
    },
    {
        id: "DOC-CHOLA",
        name: "Cholamandalam Finance",
        productType: "Doctor Professional OD / TL",
        indicativeLimit: "₹50L (OD ≤₹20L typical)",
        finalLimit: "₹50L",
        roiRange: "10% – 28% p.a.",
        processingFee: "As per sanction/KFS (program-specific)",
        tenure: "Varies",
        disbursalTime: "2-3 working days",
        pros: [
            "OD and term loan options",
            "Requires CIBIL ≥700",
            "Banking vintage 6 months",
            "Flexible programs"
        ],
        cons: [
            "Wide interest rate range (up to 28%)",
            "Lower typical OD limit (≤₹20L)",
            "Variable processing fee",
            "Limited to doctors"
        ],
        status: "eligible",
        rank: 6,
        totalCharges: "Processing fee: As per sanction/KFS (program-specific)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID",
            "GST registration/Shop Act/Udyam/Professional registration",
            "Last 2 years ITR + computation",
            "P&L + Balance Sheet (CA-certified/audited) (if applicable)",
            "Last 6–12 months current + savings statements",
            "Office address proof",
            "Existing loan statements",
            "Degree + Medical Registration Certificate",
            "Clinic/hospital proof, rental/ownership proof (if applicable)"
        ],
        eligibilityCriteria: "Min CIBIL: 700, Eligible degrees: Doctors as per grid, Banking vintage: 6 months, FOIR: ≤70%",
        eligibility: {
            employmentTypes: ["doctor"],
            minLoanAmount: 100000,
            maxLoanAmount: 5000000
        }
    },

    // Home Loans - PSU Banks
    {
        id: "HL-SBI",
        name: "SBI",
        productType: "Home Loan - PSU",
        indicativeLimit: "Up to ₹10 Cr",
        finalLimit: "₹10 Cr",
        roiRange: "7.50% – 8.70% p.a.",
        processingFee: "0.35% of loan amount + GST (min ₹2,000; max ₹10,000)",
        tenure: "10 – 36 years",
        emiPerLakhMin: "₹1,213",
        disbursalTime: "10-15 working days",
        pros: [
            "Lowest interest rate (7.50% starting)",
            "Highest loan amount (₹10 Cr)",
            "Longest tenure (36 years)",
            "Low processing fee (max ₹10,000)",
            "Trusted PSU bank"
        ],
        cons: [
            "Longer processing time",
            "Extensive documentation required",
            "Property evaluation mandatory",
            "Complex approval process"
        ],
        status: "eligible",
        rank: 1,
        totalCharges: "Processing fee: 0.35% + GST (min ₹2,000; max ₹10,000)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID (all applicants)",
            "Income (Salaried): last 3 months salary slips + Form 16/ITR + last 6 months bank statements",
            "Income (Self-employed): last 2 years ITR + financials (P&L/BS) + GST returns + last 6–12 months bank statements",
            "Property: agreement to sell/allotment letter, chain/title documents, approved plan, NOC (builder/society), property tax receipt",
            "Existing loan statement (if BT)",
            "Latest passport photo"
        ],
        eligibilityCriteria: "Published pricing is risk-based; ROI varies by CIBIL/loan slab. Standard docs: KYC + income + property/title docs",
        eligibility: {
            employmentTypes: ["salaried", "self_employed", "business_owner"],
            minLoanAmount: 500000,
            maxLoanAmount: 100000000
        }
    },
    {
        id: "HL-BOB",
        name: "Bank of Baroda",
        productType: "Home Loan - PSU",
        indicativeLimit: "Up to ₹10 Cr",
        finalLimit: "₹10 Cr",
        roiRange: "Starting at 8% p.a.",
        processingFee: "Up to ₹50L: 0.50% (min ₹8,500; max ₹15,000); Above ₹50L: 0.25% (min ₹15,000; max ₹25,000)",
        tenure: "10 – 36 years",
        emiPerLakhMin: "₹1,221",
        disbursalTime: "10-15 working days",
        pros: [
            "Competitive starting rate (8%)",
            "High loan limit (₹10 Cr)",
            "Long tenure (36 years)",
            "PSU bank reliability",
            "Structured processing fee"
        ],
        cons: [
            "Longer processing time",
            "Higher processing fee for loans >₹50L",
            "Extensive documentation",
            "Complex approval process"
        ],
        status: "eligible",
        rank: 2,
        totalCharges: "Processing fee: Up to ₹50L: 0.50% (min ₹8,500; max ₹15,000); Above ₹50L: 0.25% (min ₹15,000; max ₹25,000)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID (all applicants)",
            "Income (Salaried): last 3 months salary slips + Form 16/ITR + last 6 months bank statements",
            "Income (Self-employed): last 2 years ITR + financials (P&L/BS) + GST returns + last 6–12 months bank statements",
            "Property: agreement to sell/allotment letter, chain/title documents, approved plan, NOC (builder/society), property tax receipt",
            "Existing loan statement (if BT)",
            "Latest passport photo"
        ],
        eligibilityCriteria: "Published pricing is risk-based; ROI varies by CIBIL/loan slab. Standard docs: KYC + income + property/title docs",
        eligibility: {
            employmentTypes: ["salaried", "self_employed", "business_owner"],
            minLoanAmount: 500000,
            maxLoanAmount: 100000000
        }
    },
    {
        id: "HL-ICICI",
        name: "ICICI Bank",
        productType: "Home Loan - Private Bank",
        indicativeLimit: "Up to ₹10 Cr",
        finalLimit: "₹10 Cr",
        roiRange: "8.50% – 9.80% p.a.",
        processingFee: "As per ICICI Bank schedule/offer at login (varies by scheme and offers)",
        tenure: "10 – 36 years",
        emiPerLakhMin: "₹1,237",
        disbursalTime: "10-15 working days",
        pros: [
            "Competitive interest rate range",
            "High loan limit (₹10 Cr)",
            "Long tenure (36 years)",
            "Strong private bank",
            "Digital processes available"
        ],
        cons: [
            "Variable processing fee",
            "Extensive documentation",
            "Property evaluation required",
            "Approval process time"
        ],
        status: "eligible",
        rank: 3,
        totalCharges: "Processing fee: As per ICICI Bank schedule/offer at login",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID (all applicants)",
            "Income (Salaried): last 3 months salary slips + Form 16/ITR + last 6 months bank statements",
            "Income (Self-employed): last 2 years ITR + financials (P&L/BS) + GST returns + last 6–12 months bank statements",
            "Property: agreement to sell/allotment letter, chain/title documents, approved plan, NOC (builder/society), property tax receipt",
            "Existing loan statement (if BT)",
            "Latest passport photo"
        ],
        eligibilityCriteria: "Published pricing is risk-based; ROI varies by CIBIL/loan slab. Standard docs: KYC + income + property/title docs",
        eligibility: {
            employmentTypes: ["salaried", "self_employed", "business_owner"],
            minLoanAmount: 500000,
            maxLoanAmount: 100000000
        }
    },
    {
        id: "HL-AXIS",
        name: "Axis Bank",
        productType: "Home Loan - Private Bank",
        indicativeLimit: "Up to ₹10 Cr",
        finalLimit: "₹10 Cr",
        roiRange: "8.35% – 9.35% p.a.",
        processingFee: "Up to 1% of loan amount or ₹10,000 (whichever higher) + GST; upfront ₹5,000 + GST at application",
        tenure: "10 – 36 years",
        emiPerLakhMin: "₹1,253",
        disbursalTime: "10-15 working days",
        pros: [
            "Competitive starting rate (8.35%)",
            "High loan limit (₹10 Cr)",
            "Long tenure (36 years)",
            "Transparent pricing",
            "Established private bank"
        ],
        cons: [
            "Upfront application fee (₹5,000)",
            "Processing fee up to 1%",
            "Extensive documentation",
            "Property evaluation required"
        ],
        status: "eligible",
        rank: 4,
        totalCharges: "Processing fee: Up to 1% or ₹10,000 (whichever higher) + GST; upfront ₹5,000 + GST at application",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID (all applicants)",
            "Income (Salaried): last 3 months salary slips + Form 16/ITR + last 6 months bank statements",
            "Income (Self-employed): last 2 years ITR + financials (P&L/BS) + GST returns + last 6–12 months bank statements",
            "Property: agreement to sell/allotment letter, chain/title documents, approved plan, NOC (builder/society), property tax receipt",
            "Existing loan statement (if BT)",
            "Latest passport photo"
        ],
        eligibilityCriteria: "Published pricing is risk-based; ROI varies by CIBIL/loan slab. Standard docs: KYC + income + property/title docs",
        eligibility: {
            employmentTypes: ["salaried", "self_employed", "business_owner"],
            minLoanAmount: 500000,
            maxLoanAmount: 100000000
        }
    },

    // Home Loans - NBFCs
    {
        id: "HL-BAJAJ-HF",
        name: "Bajaj Housing Finance",
        productType: "Home Loan - NBFC",
        indicativeLimit: "Up to ₹10 Cr",
        finalLimit: "₹10 Cr",
        roiRange: "7.15% – 10.25% (salaried) / 7.75% – 10.65% (self-employed)",
        processingFee: "Up to 4% of loan amount + GST",
        tenure: "10 – 36 years",
        emiPerLakhMin: "₹1,221",
        disbursalTime: "10-15 working days",
        pros: [
            "Very competitive starting rate (7.15% for salaried)",
            "High loan limit (₹10 Cr)",
            "Long tenure (36 years)",
            "Separate rates for salaried/self-employed",
            "Fast approval for NBFC"
        ],
        cons: [
            "Higher processing fee (up to 4%)",
            "Higher rates for self-employed",
            "NBFC (not a bank)",
            "May have stricter eligibility"
        ],
        status: "eligible",
        rank: 1,
        totalCharges: "Processing fee: Up to 4% of loan amount + GST",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID (all applicants)",
            "Income (Salaried): last 3 months salary slips + Form 16/ITR + last 6 months bank statements",
            "Income (Self-employed): last 2 years ITR + financials (P&L/BS) + GST returns + last 6–12 months bank statements",
            "Property: agreement to sell/allotment letter, chain/title documents, approved plan, NOC (builder/society), property tax receipt",
            "Existing loan statement (if BT)",
            "Latest passport photo"
        ],
        eligibilityCriteria: "Published pricing is risk-based; ROI varies by CIBIL/loan slab. Standard docs: KYC + income + property/title docs",
        eligibility: {
            employmentTypes: ["salaried", "self_employed", "business_owner"],
            minLoanAmount: 500000,
            maxLoanAmount: 100000000
        }
    },
    {
        id: "HL-LTF",
        name: "L&T Finance",
        productType: "Home Loan - NBFC",
        indicativeLimit: "Up to ₹10 Cr",
        finalLimit: "₹10 Cr",
        roiRange: "7.30% p.a. onwards (floating)",
        processingFee: "Up to 3% of sanctioned amount + applicable taxes",
        tenure: "10 – 36 years",
        emiPerLakhMin: "₹1,223",
        disbursalTime: "10-15 working days",
        pros: [
            "Excellent starting rate (7.30%)",
            "High loan limit (₹10 Cr)",
            "Long tenure (36 years)",
            "Moderate processing fee (up to 3%)",
            "Established NBFC"
        ],
        cons: [
            "Processing fee up to 3%",
            "NBFC (not a bank)",
            "Rate is floating",
            "Documentation requirements"
        ],
        status: "eligible",
        rank: 2,
        totalCharges: "Processing fee: Up to 3% of sanctioned amount + applicable taxes",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID (all applicants)",
            "Income (Salaried): last 3 months salary slips + Form 16/ITR + last 6 months bank statements",
            "Income (Self-employed): last 2 years ITR + financials (P&L/BS) + GST returns + last 6–12 months bank statements",
            "Property: agreement to sell/allotment letter, chain/title documents, approved plan, NOC (builder/society), property tax receipt",
            "Existing loan statement (if BT)",
            "Latest passport photo"
        ],
        eligibilityCriteria: "Published pricing is risk-based; ROI varies by CIBIL/loan slab. Standard docs: KYC + income + property/title docs",
        eligibility: {
            employmentTypes: ["salaried", "self_employed", "business_owner"],
            minLoanAmount: 500000,
            maxLoanAmount: 100000000
        }
    },
    {
        id: "HL-TATA-HF",
        name: "Tata Capital Housing Finance",
        productType: "Home Loan - NBFC",
        indicativeLimit: "Up to ₹10 Cr",
        finalLimit: "₹10 Cr",
        roiRange: "Starting at 7.75% p.a.",
        processingFee: "Up to 3% of loan amount + GST",
        tenure: "10 – 36 years",
        emiPerLakhMin: "₹1,223",
        disbursalTime: "10-15 working days",
        pros: [
            "Competitive starting rate (7.75%)",
            "High loan limit (₹10 Cr)",
            "Long tenure (36 years)",
            "Established Tata brand",
            "Reasonable processing fee"
        ],
        cons: [
            "Processing fee up to 3%",
            "NBFC (not a bank)",
            "Extensive documentation",
            "Property evaluation required"
        ],
        status: "eligible",
        rank: 3,
        totalCharges: "Processing fee: Up to 3% of loan amount + GST",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID (all applicants)",
            "Income (Salaried): last 3 months salary slips + Form 16/ITR + last 6 months bank statements",
            "Income (Self-employed): last 2 years ITR + financials (P&L/BS) + GST returns + last 6–12 months bank statements",
            "Property: agreement to sell/allotment letter, chain/title documents, approved plan, NOC (builder/society), property tax receipt",
            "Existing loan statement (if BT)",
            "Latest passport photo"
        ],
        eligibilityCriteria: "Published pricing is risk-based; ROI varies by CIBIL/loan slab. Standard docs: KYC + income + property/title docs",
        eligibility: {
            employmentTypes: ["salaried", "self_employed", "business_owner"],
            minLoanAmount: 500000,
            maxLoanAmount: 100000000
        }
    },
    {
        id: "HL-ABFL-HF",
        name: "Aditya Birla Capital (Housing)",
        productType: "Home Loan - NBFC",
        indicativeLimit: "Up to ₹10 Cr",
        finalLimit: "₹10 Cr",
        roiRange: "Starting at 8% p.a.",
        processingFee: "Up to 1% of loan amount (offers may vary)",
        tenure: "10 – 36 years",
        emiPerLakhMin: "₹1,234",
        disbursalTime: "10-15 working days",
        pros: [
            "Competitive starting rate (8%)",
            "Lower processing fee (up to 1%)",
            "High loan limit (₹10 Cr)",
            "Long tenure (36 years)",
            "Established brand"
        ],
        cons: [
            "NBFC (not a bank)",
            "Offers may vary",
            "Documentation requirements",
            "Property evaluation mandatory"
        ],
        status: "eligible",
        rank: 4,
        totalCharges: "Processing fee: Up to 1% of loan amount (offers may vary)",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID (all applicants)",
            "Income (Salaried): last 3 months salary slips + Form 16/ITR + last 6 months bank statements",
            "Income (Self-employed): last 2 years ITR + financials (P&L/BS) + GST returns + last 6–12 months bank statements",
            "Property: agreement to sell/allotment letter, chain/title documents, approved plan, NOC (builder/society), property tax receipt",
            "Existing loan statement (if BT)",
            "Latest passport photo"
        ],
        eligibilityCriteria: "Published pricing is risk-based; ROI varies by CIBIL/loan slab. Standard docs: KYC + income + property/title docs",
        eligibility: {
            employmentTypes: ["salaried", "self_employed", "business_owner"],
            minLoanAmount: 500000,
            maxLoanAmount: 100000000
        }
    },
    {
        id: "HL-INDIABULLS",
        name: "Indiabulls Housing Finance",
        productType: "Home Loan - NBFC",
        indicativeLimit: "Up to ₹10 Cr",
        finalLimit: "₹10 Cr",
        roiRange: "8.75% p.a. onwards",
        processingFee: "Up to 2% of loan amount",
        tenure: "10 – 36 years",
        emiPerLakhMin: "₹1,205",
        disbursalTime: "10-15 working days",
        pros: [
            "Competitive starting rate (8.75%)",
            "Lower processing fee (up to 2%)",
            "High loan limit (₹10 Cr)",
            "Long tenure (36 years)",
            "Established housing finance company"
        ],
        cons: [
            "NBFC (not a bank)",
            "Documentation requirements",
            "Property evaluation required",
            "May have stricter eligibility"
        ],
        status: "eligible",
        rank: 5,
        totalCharges: "Processing fee: Up to 2% of loan amount",
        docsRequired: [
            "PAN + Aadhaar/Passport/DL/Voter ID (all applicants)",
            "Income (Salaried): last 3 months salary slips + Form 16/ITR + last 6 months bank statements",
            "Income (Self-employed): last 2 years ITR + financials (P&L/BS) + GST returns + last 6–12 months bank statements",
            "Property: agreement to sell/allotment letter, chain/title documents, approved plan, NOC (builder/society), property tax receipt",
            "Existing loan statement (if BT)",
            "Latest passport photo"
        ],
        eligibilityCriteria: "Published pricing is risk-based; ROI varies by CIBIL/loan slab. Standard docs: KYC + income + property/title docs",
        eligibility: {
            employmentTypes: ["salaried", "self_employed", "business_owner"],
            minLoanAmount: 500000,
            maxLoanAmount: 100000000
        }
    }
]