// mock-lenders.tsx

export interface Lender {
    id: string
    name: string
    productType: string
    indicativeLimit: string
    finalLimit?: string
    roiRange: string
    processingFee: string
    disbursalTime: string
    pros: string[]
    cons: string[]
    status: "eligible" | "partial" | "ineligible"
    rank: number
    // Add filtering criteria
    eligibility: {
        employmentTypes: string[]
        minIncome: number // monthly income in rupees
        maxIncome?: number // monthly income in rupees
        minLoanAmount: number
        maxLoanAmount: number
        businessMinTurnover?: number // annual turnover for business owners
    }
}

export const mockLenders: Lender[] = [
    // Existing lenders
    {
        id: "1",
        name: "Bajaj Finance",
        productType: "Personal Loan",
        indicativeLimit: "₹15 lakhs",
        finalLimit: "₹15 lakhs",
        roiRange: "11.5% - 14.5%",
        processingFee: "2.5% + GST",
        disbursalTime: "24-48 hours",
        pros: [ "Fast approval", "Minimal documentation", "Flexible tenure" ],
        cons: [ "Higher processing fee", "Limited to salaried" ],
        status: "eligible",
        rank: 1,
        eligibility: {
            employmentTypes: [ "salaried", "doctor" ],
            minIncome: 30000,
            maxLoanAmount: 1500000,
            minLoanAmount: 50000
        }
    },
    {
        id: "2",
        name: "ABFL (Aditya Birla Finance)",
        productType: "Credit Line",
        indicativeLimit: "₹12 lakhs",
        finalLimit: "₹12 lakhs",
        roiRange: "12% - 15%",
        processingFee: "2% + GST",
        disbursalTime: "48-72 hours",
        pros: [ "Revolving credit", "Pay interest on usage only", "Good for business owners" ],
        cons: [ "Slightly higher ROI", "Requires banking history" ],
        status: "eligible",
        rank: 2,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed", "business" ],
            minIncome: 40000,
            maxLoanAmount: 1200000,
            minLoanAmount: 100000,
            businessMinTurnover: 1000000
        }
    },
    {
        id: "3",
        name: "Tata Capital",
        productType: "Personal Loan",
        indicativeLimit: "₹10 lakhs",
        finalLimit: "₹10 lakhs",
        roiRange: "10.5% - 13.5%",
        processingFee: "1.5% + GST",
        disbursalTime: "3-5 days",
        pros: [ "Lower ROI", "Trusted brand", "Good customer service" ],
        cons: [ "Slower disbursal", "Stricter eligibility" ],
        status: "partial",
        rank: 3,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed" ],
            minIncome: 50000,
            maxLoanAmount: 1000000,
            minLoanAmount: 100000
        }
    },
    {
        id: "4",
        name: "L&T Finance",
        productType: "Personal Loan",
        indicativeLimit: "₹8 lakhs",
        finalLimit: "₹8 lakhs",
        roiRange: "11% - 14%",
        processingFee: "2% + GST",
        disbursalTime: "2-4 days",
        pros: [ "Competitive rates", "Flexible repayment", "Digital process" ],
        cons: [ "Lower limit for new customers", "CIBIL sensitive" ],
        status: "partial",
        rank: 4,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed", "business", "freelancer" ],
            minIncome: 25000,
            maxLoanAmount: 800000,
            minLoanAmount: 50000,
            businessMinTurnover: 500000
        }
    },
    {
        id: "5",
        name: "HDFC Bank",
        productType: "Personal Loan",
        indicativeLimit: "₹20 lakhs",
        finalLimit: "₹20 lakhs",
        roiRange: "10.75% - 13.25%",
        processingFee: "2.25% + GST",
        disbursalTime: "1-2 days",
        pros: [ "High loan amount", "Quick disbursal", "Low ROI" ],
        cons: [ "Strict eligibility", "High processing fee" ],
        status: "eligible",
        rank: 5,
        eligibility: {
            employmentTypes: [ "salaried" ],
            minIncome: 75000,
            maxLoanAmount: 2000000,
            minLoanAmount: 100000
        }
    },

    // Additional Major Banks
    {
        id: "6",
        name: "ICICI Bank",
        productType: "Personal Loan",
        indicativeLimit: "₹25 lakhs",
        finalLimit: "₹25 lakhs",
        roiRange: "10.5% - 16%",
        processingFee: "2% + GST",
        disbursalTime: "24 hours",
        pros: [ "Instant approval", "High limit", "No collateral" ],
        cons: [ "High interest for some", "CIBIL score >750 preferred" ],
        status: "eligible",
        rank: 6,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed" ],
            minIncome: 30000,
            maxLoanAmount: 2500000,
            minLoanAmount: 50000
        }
    },
    {
        id: "7",
        name: "State Bank of India",
        productType: "Personal Loan",
        indicativeLimit: "₹20 lakhs",
        finalLimit: "₹20 lakhs",
        roiRange: "9.5% - 12.5%",
        processingFee: "1% + GST",
        disbursalTime: "3-7 days",
        pros: [ "Lowest interest rates", "Trusted PSU bank", "Minimal processing fee" ],
        cons: [ "Longer processing time", "Stringent documentation" ],
        status: "partial",
        rank: 7,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed" ],
            minIncome: 25000,
            maxLoanAmount: 2000000,
            minLoanAmount: 25000
        }
    },
    {
        id: "8",
        name: "Axis Bank",
        productType: "Personal Loan",
        indicativeLimit: "₹15 lakhs",
        finalLimit: "₹15 lakhs",
        roiRange: "10.49% - 15%",
        processingFee: "1.5% + GST",
        disbursalTime: "48 hours",
        pros: [ "Quick processing", "Flexible repayment", "Good customer service" ],
        cons: [ "Higher rates for low CIBIL", "Limited pre-approved offers" ],
        status: "eligible",
        rank: 8,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed" ],
            minIncome: 25000,
            maxLoanAmount: 1500000,
            minLoanAmount: 50000
        }
    },
    {
        id: "9",
        name: "Kotak Mahindra Bank",
        productType: "Personal Loan",
        indicativeLimit: "₹15 lakhs",
        finalLimit: "₹15 lakhs",
        roiRange: "10.99% - 16%",
        processingFee: "2% + GST",
        disbursalTime: "24-72 hours",
        pros: [ "Fast disbursal", "Minimal documentation", "Online process" ],
        cons: [ "Processing fee non-refundable", "CIBIL dependent rates" ],
        status: "eligible",
        rank: 9,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed", "doctor", "ca" ],
            minIncome: 25000,
            maxLoanAmount: 1500000,
            minLoanAmount: 50000
        }
    },

    // Additional NBFCs
    {
        id: "10",
        name: "Muthoot Finance",
        productType: "Personal Loan",
        indicativeLimit: "₹10 lakhs",
        finalLimit: "₹10 lakhs",
        roiRange: "12% - 18%",
        processingFee: "1.5% + GST",
        disbursalTime: "2-4 hours",
        pros: [ "Very fast disbursal", "Gold loan options", "Less documentation" ],
        cons: [ "Higher interest rates", "Collateral required for high amounts" ],
        status: "eligible",
        rank: 10,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed", "business", "freelancer" ],
            minIncome: 20000,
            maxLoanAmount: 1000000,
            minLoanAmount: 25000
        }
    },
    {
        id: "11",
        name: "Indiabulls",
        productType: "Home Loan",
        indicativeLimit: "₹50 lakhs",
        finalLimit: "₹50 lakhs",
        roiRange: "8.5% - 11%",
        processingFee: "0.5% + GST",
        disbursalTime: "7-10 days",
        pros: [ "Low interest rates", "High loan amount", "Long tenure" ],
        cons: [ "Property valuation required", "Longer processing time" ],
        status: "partial",
        rank: 11,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed", "business", "doctor" ],
            minIncome: 30000,
            maxLoanAmount: 5000000,
            minLoanAmount: 500000
        }
    },
    {
        id: "12",
        name: "Fullerton India",
        productType: "Personal Loan",
        indicativeLimit: "₹25 lakhs",
        finalLimit: "₹25 lakhs",
        roiRange: "11% - 24%",
        processingFee: "2.5% + GST",
        disbursalTime: "24-48 hours",
        pros: [ "High approval rate", "Flexible eligibility", "Quick processing" ],
        cons: [ "High interest for low credit", "Charges prepayment penalty" ],
        status: "eligible",
        rank: 12,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed", "business", "freelancer", "doctor" ],
            minIncome: 18000,
            maxLoanAmount: 2500000,
            minLoanAmount: 50000
        }
    },
    {
        id: "13",
        name: "IDFC First Bank",
        productType: "Personal Loan",
        indicativeLimit: "₹15 lakhs",
        finalLimit: "₹15 lakhs",
        roiRange: "10.49% - 14%",
        processingFee: "1% + GST",
        disbursalTime: "24 hours",
        pros: [ "Low processing fee", "Transparent charges", "No prepayment penalty" ],
        cons: [ "Limited branches", "Newer in market" ],
        status: "eligible",
        rank: 13,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed", "doctor" ],
            minIncome: 25000,
            maxLoanAmount: 1500000,
            minLoanAmount: 50000
        }
    },
    {
        id: "14",
        name: "Yes Bank",
        productType: "Personal Loan",
        indicativeLimit: "₹20 lakhs",
        finalLimit: "₹20 lakhs",
        roiRange: "10.99% - 16%",
        processingFee: "2% + GST",
        disbursalTime: "48 hours",
        pros: [ "Quick approval", "Competitive rates", "Good for existing customers" ],
        cons: [ "Recent stability concerns", "Limited service areas" ],
        status: "partial",
        rank: 14,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed" ],
            minIncome: 30000,
            maxLoanAmount: 2000000,
            minLoanAmount: 50000
        }
    },
    {
        id: "15",
        name: "PNB Housing Finance",
        productType: "Home Loan",
        indicativeLimit: "₹75 lakhs",
        finalLimit: "₹75 lakhs",
        roiRange: "8.4% - 10.5%",
        processingFee: "0.5% + GST",
        disbursalTime: "10-15 days",
        pros: [ "Very high loan amount", "Low interest rates", "Long repayment period" ],
        cons: [ "Lengthy process", "Property documentation heavy" ],
        status: "eligible",
        rank: 15,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed", "business", "doctor" ],
            minIncome: 40000,
            maxLoanAmount: 7500000,
            minLoanAmount: 300000
        }
    },
    {
        id: "16",
        name: "Mahindra Finance",
        productType: "Business Loan",
        indicativeLimit: "₹30 lakhs",
        finalLimit: "₹30 lakhs",
        roiRange: "13% - 16%",
        processingFee: "1.5% + GST",
        disbursalTime: "5-7 days",
        pros: [ "Rural focus", "Business friendly", "Flexible collateral" ],
        cons: [ "Higher interest", "Limited urban presence" ],
        status: "partial",
        rank: 16,
        eligibility: {
            employmentTypes: [ "self-employed", "business", "doctor" ],
            minIncome: 35000,
            maxLoanAmount: 3000000,
            minLoanAmount: 100000,
            businessMinTurnover: 1200000
        }
    },
    {
        id: "17",
        name: "Shriram Finance",
        productType: "Personal Loan",
        indicativeLimit: "₹5 lakhs",
        finalLimit: "₹5 lakhs",
        roiRange: "14% - 20%",
        processingFee: "2% + GST",
        disbursalTime: "1-2 days",
        pros: [ "Easy eligibility", "Quick disbursal", "Minimal documentation" ],
        cons: [ "High interest rates", "Lower loan amounts" ],
        status: "eligible",
        rank: 17,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed", "business", "freelancer" ],
            minIncome: 15000,
            maxLoanAmount: 500000,
            minLoanAmount: 25000
        }
    },
    {
        id: "18",
        name: "Bank of Baroda",
        productType: "Personal Loan",
        indicativeLimit: "₹10 lakhs",
        finalLimit: "₹10 lakhs",
        roiRange: "9.5% - 12.5%",
        processingFee: "1% + GST",
        disbursalTime: "5-7 days",
        pros: [ "Low interest rates", "Trusted PSU", "Minimal charges" ],
        cons: [ "Slow processing", "Stringent checks" ],
        status: "partial",
        rank: 18,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed" ],
            minIncome: 25000,
            maxLoanAmount: 1000000,
            minLoanAmount: 50000
        }
    },
    {
        id: "19",
        name: "Canara Bank",
        productType: "Personal Loan",
        indicativeLimit: "₹10 lakhs",
        finalLimit: "₹10 lakhs",
        roiRange: "9.6% - 12.6%",
        processingFee: "0.5% + GST",
        disbursalTime: "7-10 days",
        pros: [ "Low processing fee", "PSU reliability", "Good customer service" ],
        cons: [ "Slow disbursal", "Extensive documentation" ],
        status: "partial",
        rank: 19,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed" ],
            minIncome: 20000,
            maxLoanAmount: 1000000,
            minLoanAmount: 50000
        }
    },
    {
        id: "20",
        name: "Union Bank of India",
        productType: "Personal Loan",
        indicativeLimit: "₹15 lakhs",
        finalLimit: "₹15 lakhs",
        roiRange: "9.7% - 12.7%",
        processingFee: "0.75% + GST",
        disbursalTime: "5-8 days",
        pros: [ "Competitive rates", "PSU trust", "Low charges" ],
        cons: [ "Average processing time", "Branch visits required" ],
        status: "eligible",
        rank: 20,
        eligibility: {
            employmentTypes: [ "salaried", "self-employed" ],
            minIncome: 25000,
            maxLoanAmount: 1500000,
            minLoanAmount: 50000
        }
    }
]