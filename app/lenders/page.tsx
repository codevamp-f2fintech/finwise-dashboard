"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type CustomerInfo } from "@/components/lenders/onboarding-form"
import { LoadingTransition } from "@/components/lenders/loading-transition"
import { LoanDashboard } from "@/components/lenders/loan-dashboard"
import { type Lender } from "@/components/lenders/mock-lenders"

type AppState = "loading" | "dashboard"

// Map eligibility response to Lender format for dashboard display
interface EligibilityLender {
  lender: string
  lender_id: string
  product: string
  eligibility: {
    phase: string
    status: string
    eligible_limit: number
    reasons: string[]
  }
  pricing: {
    roi: number
    processing_fee_pct: number
  }
  structure: {
    io_months?: number
    tenure_months: number
    dropline?: boolean
    flexi?: boolean
  }
  explain: {
    why_matched: string[]
    how_to_increase_limit: string[]
  }
}

function mapEligibilityToLender(el: EligibilityLender, rank: number): Lender {
  const limit = el.eligibility.eligible_limit
  const status = el.eligibility.status

  // Map status to lender status
  let lenderStatus: "eligible" | "partial" | "ineligible" = "ineligible"
  if (status === "PASS" || status === "SOFT_PASS") {
    lenderStatus = "eligible"
  } else if (status === "PARTIAL" || status === "SOFT_PARTIAL") {
    lenderStatus = "partial"
  }

  return {
    id: el.lender_id,
    name: el.lender,
    productType: el.product === "OD" ? "Overdraft" : "Term Loan",
    indicativeLimit: `₹${(limit / 100000).toFixed(1)}L`,
    finalLimit: `₹${(limit / 100000).toFixed(1)}L`,
    roiRange: `${el.pricing.roi}%`,
    processingFee: el.pricing.processing_fee_pct > 0
      ? `${el.pricing.processing_fee_pct}%`
      : "Nil",
    tenure: `${el.structure.tenure_months} months`,
    disbursalTime: "3-7 days",
    pros: el.explain.why_matched,
    cons: el.explain.how_to_increase_limit,
    status: lenderStatus,
    rank: rank,
    eligibility: {
      employmentTypes: ["SelfEmployed", "Salaried"],
      minIncome: 0,
      maxLoanAmount: limit,
    },
  }
}

export default function LendersPage() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>("loading")
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [filteredLenders, setFilteredLenders] = useState<Lender[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [lendersLoaded, setLendersLoaded] = useState(false)
  const [eligibilityResponse, setEligibilityResponse] = useState<any>(null)

  useEffect(() => {
    async function loadLenders() {
      // Get customer info from localStorage
      const storedData = localStorage.getItem("customerInfo")

      if (!storedData) {
        // If no data, redirect back to home
        router.push("/")
        return
      }

      const data: CustomerInfo = JSON.parse(storedData)
      setCustomerInfo(data)

      try {
        // Call the new eligibility API (Phase 1 - Soft Eligibility)
        const response = await fetch("/api/eligibility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phase: "SOFT",
            profile: {
              persona: data.persona,
              degree: data.degree,
              experience_years: parseInt(data.experience_years) || 0,
              employment_type: data.employment_type,
            },
            credit: {
              cibil_band: data.cibil_band,
              existing_emi: parseInt(data.existing_emi) || 0,
            },
            income: {
              net_monthly_income: parseInt(data.net_monthly_income) || 0,
            },
            loan: {
              product: data.product,
              requested_limit: parseInt(data.requested_limit) || 0,
              tenure_months: parseInt(data.tenure_months) || 60,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`Eligibility check failed: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.success && result.lenders) {
          console.log("[LendersPage] Eligibility check:", result.status, "with", result.lenders.length, "lenders")
          setEligibilityResponse(result)

          // Map eligibility results to Lender format
          const mappedLenders = result.lenders.map((el: EligibilityLender, idx: number) =>
            mapEligibilityToLender(el, idx + 1)
          )
          setFilteredLenders(mappedLenders)
        } else {
          console.error("[LendersPage] Eligibility error:", result.error)
          setSearchError(result.error || "Eligibility check failed")
        }
      } catch (error) {
        console.error("[LendersPage] Fetch error:", error)
        setSearchError(String(error))
      } finally {
        // Mark lenders as loaded (whether success or error)
        setLendersLoaded(true)
      }
    }

    loadLenders()
  }, [router])

  const handleLoadingComplete = () => {
    setAppState("dashboard")
  }

  if (!customerInfo || appState === "loading") {
    return <LoadingTransition onComplete={handleLoadingComplete} dataReady={lendersLoaded} />
  }

  if (searchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#c4d5eb] to-[#e8eff9]">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Eligibility Check Error</h2>
          <p className="text-gray-600">{searchError}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-[#3f50b5] text-white rounded-md hover:bg-[#354497]"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Pass eligibility response to dashboard
  return (
    <LoanDashboard
      customerInfo={customerInfo}
      lenders={filteredLenders}
      allLenders={filteredLenders}
      eligibilityResponse={eligibilityResponse}
    />
  )
}
