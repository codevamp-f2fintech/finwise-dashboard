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
    // Add filtering criteria
    eligibility?: {
        employmentTypes?: string[]
        minIncome?: number // monthly income in rupees
        maxIncome?: number // monthly income in rupees
        minLoanAmount?: number
        maxLoanAmount?: number
        businessMinTurnover?: number // annual turnover for business owners
    }
}

export const mockLenders: Lender[] = [
    // Lenders for Doctors/CAs
    {
        id: "1",
        name: "Bajaj Finance",
        productType: "Doctor/CA Overdraft (OD) & Term Loan",
        indicativeLimit: "₹10L – ₹75L",
        finalLimit: "₹75L",
        roiRange: "11.99% – 15.50%",
        processingFee: "2.0% + GST",
        disbursalTime: "24–48 hours",
        pros: [
            "Fast approval; MBBS allowed with 0 yrs exp",
            "No financials required up to ₹50L (policy track)",
            "OD with interest-only on utilization",
            "Unlimited part-payments"
        ],
        cons: [
            "Residence proof (rent agreement/OHP) strictly required",
            "CIBIL < 700 gets declined"
        ],
        status: "eligible",
        rank: 1,
        totalCharges: "PF + GST; state stamp duty; bounce ~₹500 + GST; penal ~24% p.a.",
        insurance: "Credit life as per Bajaj grid (shown in KFS)",
        docsRequired: [
            "PAN/Aadhaar KYC",
            "Medical/CA degree + registration",
            "6 months banking",
            "Residence proof (Rent Agreement if not OHP)"
        ],
        eligibilityCriteria: "CIBIL ≥700; Live USL ≤6; Enquiries ≤2 (L6m); ABB to EMI ≥2×; Banking vintage ≥6m",
        eligibility: {
            employmentTypes: [ "doctor", "ca" ],
        }
    },
    {
        id: "2",
        name: "Aditya Birla Finance (ABFL) — DLOD",
        productType: "Hybrid Dropline Overdraft (Interest-only 12–24m; no limit drop during IO) ",
        indicativeLimit: "₹10L – ₹1Cr",
        finalLimit: "₹1Cr",
        roiRange: "12.00% – 15.00%",
        processingFee: "2.0% – 2.5% + GST",
        disbursalTime: "48–72 hours",
        pros: [
            "High ticket size up to ₹1Cr",
            "No limit drop during interest-only period",
            "Strong acceptance for degree-based OD"
        ],
        cons: [
            "ITR + business proof mandatory",
            "Own-house proof preferred; TAT can be longer in some locations"
        ],
        status: "eligible",
        rank: 2,
        totalCharges: "PF + GST; stamp duty as applicable; bounce ~₹500 + GST; penal ~24 % p.a.",
        insurance: "Credit life per ABFL grid (disclosed in KFS)",
        docsRequired: [
            "ITR (2 years)",
            "26AS with professional/consultancy income",
            "Udyam/Practice registration; GST if applicable",
            "Own-house proof (OHP) / stable residence"
        ],
        eligibilityCriteria: "CIBIL ≥700; FOIR ≤65%; ABB to EMI ≥2×; Clean banking ≥6m",
        eligibility: {
            employmentTypes: [ "doctor", "ca" ],
        }
    },
    {
        id: "3",
        name: "Tata Capital",
        productType: "Doctor/CA OD & Term Loan",
        indicativeLimit: "₹10L – ₹75L+",
        finalLimit: "₹75L+ (program dependent)",
        roiRange: "12.50% – 14.50%",
        processingFee: "2.0% + GST",
        disbursalTime: "~48 hours",
        pros: [
            "Domestic approved college: banking can be waived",
            "OD + TL combo; ABB rule clarity for >₹15L",
            "Predictable pricing and documentation"
        ],
        cons: [
            "Consultation/practice proof mandatory",
            "Foreign degree requires banking (no waiver)"
        ],
        status: "eligible",
        rank: 3,
        totalCharges: "PF + GST; stamp duty as applicable; bounce ~₹500 + GST; penal ~24 % p.a.",
        insurance: "Credit life per Tata grid (shown in KFS)",
        docsRequired: [
            "Degree + approved college proof",
            "Consultation/practice proof",
            "OHP (residential stability)",
            "6m banking if foreign degree or exposure high"
        ],
        eligibilityCriteria: "CIBIL ≥725 (≥700 RCM); ABB to EMI ≥1.5× if ticket>₹15L; FOIR ≤65 % ",
        eligibility: {
            employmentTypes: [ "doctor", "ca" ],
        }
    },
    {
        id: "4",
        name: "L&T Finance",
        productType: "Doctor/CA OD & Term Loan",
        indicativeLimit: "₹15L – ₹80L",
        finalLimit: "₹80L (higher possible with stricter bureau)",
        roiRange: "12.00% – 15.50%",
        processingFee: "2.0% – 3.0% + GST",
        disbursalTime: "~72 hours",
        pros: [
            "Multiple surrogate programs (Banking/GST/Income)",
            "Strong policy for clean banking customers",
            "Good fit for experienced practitioners (≥3 yrs)"
        ],
        cons: [
            "Strict ABB rule (EMI ≤ ABB/5)",
            "Speculative flows (trading/crypto/betting) are blocked"
        ],
        status: "eligible",
        rank: 4,
        totalCharges: "PF + GST; stamp duty; bounce ~₹500 + GST; penal ~24% p.a.",
        insurance: "Credit life per L&T grid (in KFS)",
        docsRequired: [
            "ITR 2 years + 26AS; GST if applicable",
            "Udyam/registration; 6m banking",
            "Own-house proof preferred",
            "Clean statements; DSCR ≥0.8"
        ],
        eligibilityCriteria: "CIBIL ≥685 (≥750 for high ticket); Vintage ≥3y; ABB to EMI ≥5×; FOIR ≤70 %; DSCR ≥0.8",
        eligibility: {
            employmentTypes: [ "doctor", "ca" ],
        }
    },
    {
        id: "5",
        name: "Godrej Capital",
        productType: "Doctor/CA OD & Term Loan",
        indicativeLimit: "₹20L – ₹1.25Cr (MBBS); up to ₹2Cr (MD); up to ₹1.5Cr ( CA )",
        finalLimit: "Up to ₹2Cr (degree & program caps apply)",
        roiRange: "11.50% – 14.50%",
        processingFee: "1.5% – 2.5% + GST",
        disbursalTime: "48–72 hours",
        pros: [
            "High degree-based caps (MBBS/MD/CA)",
            "Multiple tracks (Income/Gross Receipt/Banking/Scorecard)",
            "Digital journey with clear KFS"
        ],
        cons: [
            "Doctors need ≥3 yrs; CA ≥5 yrs (or ≥3 yrs + receipts ≥₹50L)",
            "6m banking mandatory"
        ],
        status: "eligible",
        rank: 5,
        totalCharges: "PF + GST; stamp duty; bounce ~₹500 + GST; penal ~24% p.a.",
        insurance: "Credit life per Godrej grid (shown in KFS)",
        docsRequired: [
            "ITR 2 years or Gross-Receipt mode as per program",
            "6 months banking; Udyam/Practice registration",
            "26AS; OHP/residence"
        ],
        eligibilityCriteria: "CIBIL ≥700; ABB to EMI ≥1.5×; Vintage ≥3y ( Doctors ) / ≥5y( CA or ≥3y + receipts ≥₹50L ); FOIR ≤65% ",
        eligibility: {
            employmentTypes: [ "doctor", "ca" ],
        }
    },
    {
        id: "6",
        name: "Cholamandalam Finance",
        productType: "Doctor Professional OD / TL",
        indicativeLimit: "₹10L – ₹50L (OD programs typically ≤₹20L)",
        finalLimit: "₹50L",
        roiRange: "16.50% – 17.50%",
        processingFee: "Up to 3.0% + GST",
        disbursalTime: "48–72 hours",
        pros: [
            "Coverage in Tier-2/3 markets",
            "Reasonable acceptance with basic docs",
            "Quick manual decisions"
        ],
        cons: [
            "Higher pricing vs peers",
            "Lower ticket ceilings on OD tracks"
        ],
        status: "eligible",
        rank: 6,
        totalCharges: "PF + GST; stamp duty as applicable; bounce per grid; penal ~24 % p.a.",
        insurance: "Credit life per Chola grid (in KFS)",
        docsRequired: [
            "KYC; Degree & registration",
            "6 months banking",
            "Income proof as per program"
        ],
        eligibilityCriteria: "CIBIL ≥700; FOIR ≤70%; Stable banking vintage ≥6m",
        eligibility: {
            employmentTypes: [ "doctor", "ca" ],
        }
    },

    // Lenders for Personal Loans - Salaried
    {
        id: "PL-HDFC",
        name: "HDFC Bank",
        productType: "Personal Loan – Salaried",
        indicativeLimit: "₹1L – ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "10.50% – 12%",
        processingFee: "Up to ₹10,000 + GST",
        tenure: "12–60 months",
        emiPerLakhMin: "₹1,878",
        disbursalTime: "2–5 days",
        pros: [ "Lowest interest rate band", "Wide employer coverage", "Digital process" ],
        cons: [ "Standard foreclosure charges 3.75%", "CIBIL <700 not accepted" ],
        status: "eligible",
        rank: 1,
        totalCharges: "PF + GST; foreclosure 3.75%; part-prepay 2–3%; bounce ₹500–₹1, 500; penal ~24 % p.a.",
        insurance: "Credit life optional (as per customer choice)",
        docsRequired: [
            "PAN Card", "Aadhaar Card", "3 months Salary Slips", "6 months Bank Statement",
            "Form 16 (Last 2 years)", "Company ID Card", "Passport size Photograph",
            "Ownership Proof / Rent Agreement", "Utility Bill"
        ],
        eligibilityCriteria: "Age 21–60; Work exp ≥2 yrs; CIBIL ≥700; Monthly salary ≥₹25,000",
        eligibility: {
            employmentTypes: [ "personal loan", "salaried" ],
        }
    },
    {
        id: "PL-BAJAJ",
        name: "Bajaj Finserv",
        productType: "Personal Loan – Salaried (OD facility available)",
        indicativeLimit: "₹1L – ₹50L",
        finalLimit: "₹50L",
        roiRange: "12% – 14%",
        processingFee: "Up to 2% + GST",
        tenure: "12–96 months",
        emiPerLakhMin: "₹1,125",
        disbursalTime: "2–3 days",
        pros: [ "Overdraft facility", "Fast digital journey" ],
        cons: [ "Higher PF vs banks", "CIBIL <685 rejected" ],
        status: "eligible",
        rank: 6,
        totalCharges: "PF + GST; foreclosure 4.75%; part-prepay 0–3%; bounce ₹500–₹1, 500; penal ~24 % p.a.",
        insurance: "Credit life optional (shown in KFS)",
        docsRequired: [
            "PAN Card", "Aadhaar Card", "3 months Salary Slips", "6 months Bank Statement",
            "Form 16 (Last 2 years)", "Company ID Card", "Passport size Photograph",
            "Ownership Proof / Rent Agreement", "Utility Bill"
        ],
        eligibilityCriteria: "Age 24–60; Work exp ≥2 yrs; CIBIL ≥685; Monthly salary ≥₹35,000",
        eligibility: {
            employmentTypes: [ "personal loan", "salaried" ],
        }
    },
    {
        id: "PL-IDFC",
        name: "IDFC First Bank",
        productType: "Personal Loan – Salaried",
        indicativeLimit: "₹1L – ₹75L",
        finalLimit: "₹75L",
        roiRange: "10.75% – 14%",
        processingFee: "Up to ₹10,000 + GST",
        tenure: "12–72 months",
        emiPerLakhMin: "₹2,149",
        disbursalTime: "2–5 days",
        pros: [ "High loan approval rate", "Digital KYC" ],
        cons: [ "EMI per lakh (table) higher vs peers", "Foreclosure 4.75%" ],
        status: "eligible",
        rank: 4,
        totalCharges: "PF + GST; foreclosure 4.75%; part-prepay 2–3%; bounce ₹500–₹1, 500; penal ~24 % p.a.",
        insurance: "Credit life optional (as per bank plan)",
        "docsRequired": [
            "PAN Card", "Aadhaar Card", "3 months Salary Slips", "6 months Bank Statement",
            "Form 16 (Last 2 years)", "Company ID Card", "Passport size Photograph",
            "Ownership Proof / Rent Agreement", "Utility Bill"
        ],
        eligibilityCriteria: "Age 23–60; Work exp ≥2 yrs; CIBIL ≥700; Monthly salary ≥₹25,000",
        eligibility: {
            employmentTypes: [ "personal loan", "salaried" ],
        }
    },
    {
        id: "PL-ICICI",
        name: "ICICI Bank",
        productType: "Personal Loan – Salaried",
        indicativeLimit: "₹1L – ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "11% – 13%",
        processingFee: "Up to ₹10,000 + GST",
        tenure: "12–60 months",
        emiPerLakhMin: "₹1,878",
        disbursalTime: "2–5 days",
        pros: [ "Lowest interest rate feature", "Strong branch network" ],
        cons: [ "Standard PF & charges", "CIBIL <700 rejected" ],
        status: "eligible",
        rank: 2,
        totalCharges: "PF + GST; foreclosure 4.75%; part-prepay 2–3%; bounce ₹500–₹1,500; penal ~24 % p.a.",
        insurance: "Credit life optional (bank grid)",
        docsRequired: [
            "PAN Card", "Aadhaar Card", "3 months Salary Slips", "6 months Bank Statement",
            "Form 16 (Last 2 years)", "Company ID Card", "Passport size Photograph",
            "Ownership Proof / Rent Agreement", "Utility Bill"
        ],
        eligibilityCriteria: "Age 23–60; Work exp ≥2 yrs; CIBIL ≥700; Monthly salary ≥₹25,000",
        eligibility: {
            employmentTypes: [ "personal loan", "salaried" ],
        }
    },
    {
        id: "PL-CHOLA",
        name: "Cholamandalam Finance",
        productType: "Personal Loan – Salaried (OD facility)",
        indicativeLimit: "₹1L – ₹10L",
        finalLimit: "₹10L",
        roiRange: "13.5% – 18%",
        processingFee: "Up to 3% + GST",
        tenure: "12–48 months",
        emiPerLakhMin: "₹2,200",
        disbursalTime: "2–5 days",
        pros: [ "OD facility", "Good for Tier-2/3 cities" ],
        cons: [ "Higher pricing vs banks", "Lower ticket size" ],
        status: "eligible",
        rank: 7,
        totalCharges: "PF + GST; foreclosure 4.25%; part-prepay 0–3%; bounce ₹500–₹1, 500; penal ~24 % p.a.",
        insurance: "Credit life optional (as per lender)",
        docsRequired: [
            "PAN Card", "Aadhaar Card", "3 months Salary Slips", "6 months Bank Statement",
            "Form 16 (Last 2 years)", "Company ID Card", "Passport size Photograph",
            "Ownership Proof / Rent Agreement", "Utility Bill"
        ],
        eligibilityCriteria: "Age 21–60; Work exp ≥2 yrs; CIBIL ≥685; Monthly salary ≥₹35,000",
        eligibility: {
            employmentTypes: [ "personal loan", "salaried" ],
        }
    },
    {
        id: "PL-TATA",
        name: "Tata Capital",
        productType: "Personal Loan – Salaried (OD facility)",
        indicativeLimit: "₹1L – ₹40L",
        finalLimit: "₹40L",
        roiRange: "12% – 14%",
        processingFee: "Up to 2.5% + GST",
        tenure: "12–60 months",
        emiPerLakhMin: "₹1,916",
        disbursalTime: "2–5 days",
        pros: [ "Overdraft/flexi option", "Good mid-ROI band" ],
        cons: [ "PF up to 2.5% vs banks' ₹10k cap", "Min salary ₹35k" ],
        status: "eligible",
        rank: 3,
        totalCharges: "PF + GST; foreclosure 4.25%; part-prepay 0–3%; bounce ₹500–₹1, 500; penal ~24 % p.a.",
        insurance: "Credit life optional (per Tata plan)",
        docsRequired: [
            "PAN Card", "Aadhaar Card", "3 months Salary Slips", "6 months Bank Statement",
            "Form 16 (Last 2 years)", "Company ID Card", "Passport size Photograph",
            "Ownership Proof / Rent Agreement", "Utility Bill"
        ],
        eligibilityCriteria: "Age 21–60; Work exp ≥2 yrs; CIBIL ≥685; Monthly salary ≥₹35,000",
        eligibility: {
            employmentTypes: [ "personal loan", "salaried" ],
        }
    },
    {
        id: "PL-AXIS",
        name: "Axis Bank",
        productType: "Personal Loan – Salaried",
        indicativeLimit: "₹1L – ₹75L",
        finalLimit: "₹75L",
        roiRange: "11% – 13%",
        processingFee: "Up to ₹10,000 + GST",
        tenure: "12–60 months",
        emiPerLakhMin: "₹2,224",
        disbursalTime: "2–5 days",
        pros: [ "Customer-friendly process", "Balanced ROI" ],
        cons: [ "Foreclosure 4.75%", "Standard bank documentation" ],
        status: "eligible",
        rank: 5,
        totalCharges: "PF + GST; foreclosure 4.75%; part-prepay 2–3%; bounce ₹500–₹1, 500; penal ~24 % p.a.",
        insurance: "Credit life optional (bank plan)",
        docsRequired: [
            "PAN Card", "Aadhaar Card", "3 months Salary Slips", "6 months Bank Statement",
            "Form 16 (Last 2 years)", "Company ID Card", "Passport size Photograph",
            "Ownership Proof / Rent Agreement", "Utility Bill"
        ],
        eligibilityCriteria: "Age 21–60; Work exp ≥2 yrs; CIBIL ≥700; Monthly salary ≥₹25,000",
        eligibility: {
            employmentTypes: [ "personal loan", "salaried" ],
        }
    },

    // Lenders For Personal Loan - PreApproved
    {
        id: "PL1",
        name: "Godrej Capital",
        productType: "Personal Loan – Salaried (with OD variant)",
        indicativeLimit: "₹1L – ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "10.50% – 12.00%",
        processingFee: "Up to ₹10,000 + GST",
        disbursalTime: "2–5 days",
        pros: [ "Lowest ROI band in grid", "OD-type flexibility available", "Tenure up to 60 months" ],
        cons: [ "Standard foreclosure 4.75%", "KYC + income checks mandatory" ],
        status: "eligible",
        rank: 1,
        totalCharges: "PF (up to ₹10k) + GST; EMI bounce ₹500–₹1,500; foreclosure 4.75%; part- prepay 2–3 %; penal 24 % p.a.",
        insurance: "Credit life per Godrej plan (added in KFS)",
        docsRequired: [ "PAN & Aadhaar", "3 months salary slips", "6 months bank statement", "Form - 16( last 2 yrs )", "Address proof( rent agreement / ownership )" ],
        eligibilityCriteria: "Age 21–60 yrs; Work exp ≥2 yrs; CIBIL ≥700; Monthly salary ≥₹25,000",
        eligibility: {
            employmentTypes: [ "personal loan", "pre-approved" ],
        }
    },
    {
        id: "PL2",
        name: "Aditya Birla Finance (ABFL)",
        productType: "Personal Loan – Salaried",
        indicativeLimit: "₹1L – ₹50L",
        finalLimit: "₹50L",
        roiRange: "12.00% – 14.00%",
        processingFee: "Up to 2% + GST",
        disbursalTime: "2–3 days",
        pros: [ "Quick TAT", "Transparent pricing", "Strong corporate coverage" ],
        cons: [ "Min salary ₹35k", "Foreclosure 4.75%" ],
        status: "eligible",
        rank: 2,
        totalCharges: "PF up to 2% + GST; EMI bounce ₹500–₹1,500; foreclosure 4.75%; part- prepay 0–3 %; penal 24 % p.a.",
        insurance: "Credit life mandatory (as per ABFL grid)",
        docsRequired: [ "PAN/Aadhaar", "3 months salary slips", "6 months bank statement", "Form - 16( 2 yrs )", "Company ID", "Address proof" ],
        eligibilityCriteria: "Age 24–60 yrs; Work exp ≥2 yrs; CIBIL ≥685+; Monthly salary ≥₹35,000",
        eligibility: {
            employmentTypes: [ "personal loan", "pre-approved" ],
        }
    },
    {
        id: "PL3",
        name: "L&T Finance",
        productType: "Personal Loan – Salaried (OD option)",
        indicativeLimit: "₹1L – ₹75L",
        finalLimit: "₹75L",
        roiRange: "10.75% – 14.00%",
        processingFee: "Up to ₹10,000 + GST",
        disbursalTime: "2–5 days",
        pros: [ "High approval rate for corporates", "Low ROI band (10.75–14%)", "Optional OD flexibility" ],
        cons: [ "CIBIL <700 generally rejected", "Foreclosure 4.75%" ],
        status: "eligible",
        rank: 3,
        totalCharges: "PF up to ₹10k + GST; EMI bounce ₹500–₹1,500; foreclosure 4.75%; part- prepay 2–3 %; penal 24 % p.a.",
        insurance: "Credit life per L&T plan (shown in KFS)",
        docsRequired: [ "PAN/Aadhaar", "3 months salary slips", "6 months bank statement", "Form - 16( 2 yrs )", "Employer ID" ],
        eligibilityCriteria: "Age 23–60 yrs; Work exp ≥2 yrs; CIBIL ≥700; Monthly salary ≥₹25,000",
        eligibility: {
            employmentTypes: [ "personal loan", "pre-approved" ],
        }
    },
    {
        id: "PL4",
        name: "Tata Capital",
        productType: "Personal Loan – Salaried (OD flexi available)",
        indicativeLimit: "₹1L – ₹1 Cr",
        finalLimit: "₹1 Cr",
        roiRange: "11.00% – 13.00%",
        processingFee: "Up to ₹10,000 + GST",
        disbursalTime: "2–5 days",
        pros: [ "Low EMI (₹1,878 per lakh benchmark)", "Fast approval", "Flexi/OD variant" ],
        cons: [ "Foreclosure after 12 EMIs", "Bounce fee ₹500+GST" ],
        status: "eligible",
        rank: 4,
        totalCharges: "PF up to ₹10k + GST; EMI bounce ₹500–₹1,500; foreclosure 4.75 %; part - prepay 2–3 %; penal 24 % p.a.",
        insurance: "Credit life optional (per customer consent)",
        docsRequired: [ "PAN/Aadhaar", "3 months salary slips", "6 months bank statement", "Form - 16 / ITR", "Address proof" ],
        eligibilityCriteria: "Age 23–60 yrs; Work exp ≥2 yrs; CIBIL ≥700; Monthly salary ≥₹25,000",
        eligibility: {
            employmentTypes: [ "personal loan", "pre-approved" ],
        }
    },
    {
        id: "PL5",
        name: "Bajaj Finance",
        productType: "Personal Loan – Salaried",
        indicativeLimit: "₹1L – ₹10L",
        finalLimit: "₹10L",
        roiRange: "13.50% – 18.00%",
        processingFee: "Up to 3% + GST",
        disbursalTime: "2–5 days",
        pros: [ "Fast digital journey", "High acceptance for salaried", "Flexible tenure to 48 months" ],
        cons: [ "Higher PF vs peers", "Higher ROI band" ],
        status: "eligible",
        rank: 5,
        totalCharges: "PF up to 3% + GST; EMI bounce ₹500–₹1,500; foreclosure 4.25 %; part- prepay 0–3 %; penal 24 % p.a.",
        insurance: "Credit life as per Bajaj policy (shown in KFS)",
        docsRequired: [ "PAN/Aadhaar", "3 months salary slips", "6 months bank statement", "Form - 16( 2 yrs )", "Rent agreement / ownership proof" ],
        eligibilityCriteria: "Age 21–60 yrs; Work exp ≥2 yrs; CIBIL ≥685+; Monthly salary ≥₹35,000",
        eligibility: {
            employmentTypes: [ "personal loan", "pre-approved" ],
        }
    },
    {
        id: "PL6",
        name: "Cholamandalam Finance",
        productType: "Personal Loan – Salaried",
        indicativeLimit: "₹1L – ₹40L",
        finalLimit: "₹40L",
        roiRange: "12.00% – 14.00%",
        processingFee: "Up to 2.5% + GST",
        disbursalTime: "2–5 days",
        pros: [ "Good for Tier-2/3 salaried", "Quick manual processing", "Stable pricing" ],
        cons: [ "Smaller max ticket than peers", "Manual docs" ],
        status: "eligible",
        rank: 6,
        totalCharges: "PF up to 2.5% + GST; EMI bounce ₹500–₹1,500; foreclosure 4.25 %; part - prepay 0–3 %; penal 24 % p.a.",
        insurance: "Credit life optional (as per customer consent)",
        docsRequired: [ "PAN/Aadhaar", "3 months salary slips", "6 months bank statement", "Form - 16( 2 yrs )", "Address proof" ],
        eligibilityCriteria: "Age 21–60 yrs; Work exp ≥2 yrs; CIBIL ≥685+; Monthly salary ≥₹35,000",
        eligibility: {
            employmentTypes: [ "personal loan", "pre-approved" ],
        }
    },
    {
        id: "PL7",
        name: "HDFC / Prime Bank (reference column)",
        productType: "Personal Loan – Salaried",
        indicativeLimit: "₹1L – ₹75L",
        finalLimit: "₹75L",
        roiRange: "11.00% – 13.00%",
        processingFee: "Up to ₹10,000 + GST",
        disbursalTime: "2–5 days",
        pros: [ "Balanced ROI", "Wide employer coverage", "Digital KYC" ],
        cons: [ "Foreclosure 4.75%", "Standard doc set" ],
        status: "eligible",
        rank: 7,
        totalCharges: "PF up to ₹10k + GST; EMI bounce ₹500–₹1,500; foreclosure 4.75%; part- prepay 2–3 %; penal 24 % p.a.",
        insurance: "Credit life optional (bank grid)",
        docsRequired: [ "PAN/Aadhaar", "3 months salary slips", "6 months bank statement", "Form - 16( 2 yrs )", "Address proof" ],
        eligibilityCriteria: "Age 21–60 yrs; Work exp ≥2 yrs; CIBIL ≥700; Monthly salary ≥₹25,000",
        eligibility: {
            employmentTypes: [ "personal loan", "pre-approved" ],
        }
    }
]