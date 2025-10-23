import { Lender } from "../components/mock-lenders"

export interface CustomerInfo {
    employmentType: "salaried" | "business" | "self-employed" | string
    income: string
    loanAmount: string
    existingObligations: string
}

export function filterLenders ( lenders: Lender[], customerInfo: CustomerInfo ): Lender[] {
    const { employmentType, income, loanAmount, existingObligations } = customerInfo

    // Convert string values to numbers
    const monthlyIncome = parseFloat( income )
    const requestedLoanAmount = parseFloat( loanAmount )
    const existingEMIs = parseFloat( existingObligations )

    // For business owners, convert annual turnover to equivalent monthly income for filtering
    const effectiveMonthlyIncome = employmentType === "business"
        ? monthlyIncome / 12  // Convert annual turnover to monthly equivalent
        : monthlyIncome

    return lenders.filter( lender => {
        // Check employment type eligibility
        if ( !lender.eligibility.employmentTypes.includes( employmentType ) )
        {
            return false
        }

        // Check income eligibility
        if ( effectiveMonthlyIncome < lender.eligibility.minIncome )
        {
            return false
        }

        // For business owners, check additional turnover criteria if specified
        if ( employmentType === "business" && lender.eligibility.businessMinTurnover )
        {
            if ( monthlyIncome < lender.eligibility.businessMinTurnover )
            {
                return false
            }
        }

        // Check loan amount range
        if ( requestedLoanAmount < lender.eligibility.minLoanAmount ||
            requestedLoanAmount > lender.eligibility.maxLoanAmount )
        {
            return false
        }

        // Check debt-to-income ratio (optional enhancement)
        const debtToIncomeRatio = existingEMIs / effectiveMonthlyIncome
        if ( debtToIncomeRatio > 0.5 )
        { // 50% DTI threshold
            lender.status = "partial"
        }

        return true
    } ).map( lender => {
        // Enhance status based on additional criteria
        let status = lender.status

        // If loan amount is at the higher end of the range, mark as partial
        const loanAmountNum = parseFloat( loanAmount )
        const maxLoanAmount = lender.eligibility.maxLoanAmount
        if ( loanAmountNum > maxLoanAmount * 0.8 )
        {
            status = "partial"
        }

        // If income is just meeting minimum, mark as partial
        if ( effectiveMonthlyIncome < lender.eligibility.minIncome * 1.2 )
        {
            status = status === "eligible" ? "partial" : status
        }

        return {
            ...lender,
            status
        }
    } ).sort( ( a, b ) => a.rank - b.rank ) // Sort by rank
}