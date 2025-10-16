"use client"

import { useState } from "react"
import { OnboardingForm, type CustomerInfo } from "@/components/onboarding-form"
import { LoadingTransition } from "@/components/loading-transition"
import { LoanDashboard } from "@/components/loan-dashboard"

type AppState = "onboarding" | "loading" | "dashboard"

export default function Home() {
  const [appState, setAppState] = useState<AppState>("onboarding")
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)

  const handleFormSubmit = (data: CustomerInfo) => {
    setCustomerInfo(data)
    setAppState("loading")
  }

  const handleLoadingComplete = () => {
    setAppState("dashboard")
  }

  if (appState === "onboarding") {
    return <OnboardingForm onSubmit={handleFormSubmit} />
  }

  if (appState === "loading") {
    return <LoadingTransition onComplete={handleLoadingComplete} />
  }

  return <LoanDashboard customerInfo={customerInfo} />
}
