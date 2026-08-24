"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { type CustomerInfo } from "@/components/lenders/onboarding-form"
import { LoadingTransition } from "@/components/lenders/loading-transition"
import { LoanDashboard } from "@/components/lenders/loan-dashboard"
import { type Lender, mockLenders } from "@/components/lenders/mock-lenders"

type AppState = "initializing" | "loading" | "dashboard"

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

  // Find corresponding mock lender to enrich data
  const mockLender = mockLenders.find(m =>
    m.id === el.lender_id ||
    m.name.toLowerCase() === el.lender.toLowerCase() ||
    m.id.toLowerCase().includes(el.lender_id.toLowerCase())
  )

  // FAIL lenders are not mapped — they are filtered out before calling this

  return {
    id: el.lender_id,
    name: mockLender?.name || el.lender,
    productType: mockLender?.productType || (el.product === "OD" ? "Overdraft" : "Term Loan"),
    indicativeLimit: `₹${(limit / 100000).toFixed(1)}L`,
    finalLimit: `₹${(limit / 100000).toFixed(1)}L`,
    roiRange: mockLender?.roiRange || `${el.pricing.roi}%`,
    processingFee: mockLender?.processingFee || (el.pricing.processing_fee_pct > 0
      ? `${el.pricing.processing_fee_pct}%`
      : "Nil"),
    tenure: mockLender?.tenure || `${el.structure.tenure_months} months`,
    disbursalTime: mockLender?.disbursalTime || "3-7 days",
    pros: el.explain.why_matched.length > 0 ? el.explain.why_matched : (mockLender?.pros || []),
    cons: el.explain.how_to_increase_limit.length > 0 ? el.explain.how_to_increase_limit : (mockLender?.cons || []),
    status: lenderStatus,
    rank: rank,
    totalCharges: mockLender?.totalCharges,
    docsRequired: mockLender?.docsRequired,
    eligibilityCriteria: mockLender?.eligibilityCriteria,
    eligibility: mockLender?.eligibility || {
      employmentTypes: ["SelfEmployed", "Salaried"],
      minIncome: 0,
      maxLoanAmount: limit,
    },
  }
}

export default function LendersPage() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>("initializing")
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

      // Check cache to avoid re-loading on "Back" navigation
      const cachedResultStr = sessionStorage.getItem("lendersResult")
      const cachedInfoStr = sessionStorage.getItem("lendersResultInfo")

      let isBackNavigation = false
      if (typeof performance !== "undefined") {
        const navEntries = performance.getEntriesByType("navigation")
        if (navEntries.length > 0) {
          const navTiming = navEntries[0] as PerformanceNavigationTiming
          isBackNavigation = (navTiming.type === "back_forward")
        }
      }

      if (isBackNavigation && cachedResultStr && cachedInfoStr === storedData) {
        try {
          const cachedResult = JSON.parse(cachedResultStr)
          if (cachedResult.filteredLenders && cachedResult.eligibilityResponse) {
            setFilteredLenders(cachedResult.filteredLenders)
            setEligibilityResponse(cachedResult.eligibilityResponse)
            setLendersLoaded(true)
            setAppState("dashboard") // Skip loading transition entirely
            return
          }
        } catch (e) {
          console.error("Cache read error", e)
        }
      }

      setAppState("loading")

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

          // Filter out FAIL lenders — only show eligible (PASS) and partial (PARTIAL) lenders
          const visibleLenders = result.lenders.filter(
            (el: EligibilityLender) =>
              el.eligibility.status === "PASS" ||
              el.eligibility.status === "SOFT_PASS" ||
              el.eligibility.status === "PARTIAL" ||
              el.eligibility.status === "SOFT_PARTIAL"
          )

          console.log(
            `[LendersPage] Showing ${visibleLenders.length} lenders ` +
            `(${result.lenders.length - visibleLenders.length} ineligible hidden)`
          )

          // Map eligibility results to Lender format
          const mappedLenders = visibleLenders.map((el: EligibilityLender, idx: number) =>
            mapEligibilityToLender(el, idx + 1)
          )

          // Append partial lenders from mock data if they are not already in the mapped list
          const existingIds = new Set(mappedLenders.map(l => l.id))
          const partialMockLenders = mockLenders.filter(m => m.status === "partial" && !existingIds.has(m.id))
            .map((m, idx) => ({ ...m, rank: mappedLenders.length + idx + 1 }))

          const finalLenders = [...mappedLenders, ...partialMockLenders]
          setFilteredLenders(finalLenders)

          sessionStorage.setItem("lendersResultInfo", storedData)
          sessionStorage.setItem("lendersResult", JSON.stringify({
            filteredLenders: finalLenders,
            eligibilityResponse: result
          }))
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

  if (appState === "initializing") {
    return <div className="min-h-screen bg-gradient-to-br from-[#c4d5eb] to-[#e8eff9]" />
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
