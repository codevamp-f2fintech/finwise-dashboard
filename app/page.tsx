"use client"

import { useState } from "react"
import { OnboardingForm, type CustomerInfo } from "@/components/onboarding-form"
import { LoadingTransition } from "@/components/loading-transition"
import { LoanDashboard } from "@/components/loan-dashboard"
import { mockLenders, type Lender } from "@/components/mock-lenders"

type AppState = "onboarding" | "loading" | "dashboard"

// Filtering function
function filterLenders ( lenders: Lender[], customerInfo: CustomerInfo ): Lender[] {
  const { employmentType, income, loanAmount } = customerInfo

  // Convert string values to numbers
  const monthlyIncome = parseFloat( income )
  const requestedLoanAmount = parseFloat( loanAmount )

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

export default function Home () {
  const [ appState, setAppState ] = useState<AppState>( "onboarding" )
  const [ customerInfo, setCustomerInfo ] = useState<CustomerInfo | null>( null )
  const [ filteredLenders, setFilteredLenders ] = useState<Lender[]>( [] )

  const handleFormSubmit = ( data: CustomerInfo ) => {
    setCustomerInfo( data )

    // Filter lenders based on customer information
    const filtered = filterLenders( mockLenders, data )
    setFilteredLenders( filtered )

    setAppState( "loading" )
  }

  const handleLoadingComplete = () => {
    setAppState( "dashboard" )
  }

  if ( appState === "onboarding" )
  {
    return <OnboardingForm onSubmit={handleFormSubmit} />
  }

  if ( appState === "loading" )
  {
    return <LoadingTransition onComplete={handleLoadingComplete} />
  }

  return <LoanDashboard customerInfo={customerInfo} lenders={filteredLenders} />
}