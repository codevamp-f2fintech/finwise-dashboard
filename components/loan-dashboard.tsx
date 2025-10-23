"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatAssistant } from "@/components/chat-assistant"
import { ConsentModal } from "@/components/consent-modal"
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, Clock, FileText, ArrowRight, Star, Zap, Shield } from "lucide-react"
import type { CustomerInfo } from "@/components/onboarding-form"
import type { Lender } from "./mock-lenders"

type Stage = "A" | "B"

interface LoanDashboardProps {
  customerInfo: CustomerInfo | null
  lenders: Lender[]
}

export function LoanDashboard ( { customerInfo, lenders }: LoanDashboardProps ) {
  const [ stage, setStage ] = useState<Stage>( "A" )
  const [ showConsentModal, setShowConsentModal ] = useState( false )
  const [ selectedLender, setSelectedLender ] = useState<Lender | null>( null )

  // Sort lenders: eligible first, then partial eligible
  const sortedLenders = useMemo( () => {
    return [ ...lenders ].sort( ( a, b ) => {
      // Priority order: eligible > partial > ineligible
      const priorityOrder = {
        eligible: 0,
        partial: 1,
        ineligible: 2
      }

      return priorityOrder[ a.status ] - priorityOrder[ b.status ]
    } )
  }, [ lenders ] )

  const handleApply = ( lender: Lender ) => {
    setSelectedLender( lender )
    if ( stage === "A" )
    {
      setShowConsentModal( true )
    } else
    {
      // Stage B - proceed with application
      console.log( "[v0] Proceeding with application for:", lender.name )
    }
  }

  const handleConsentAccept = () => {
    setShowConsentModal( false )
    setStage( "B" )
    console.log( "[v0] User consented, moving to Stage B" )
  }

  const getStatusIcon = ( status: Lender[ "status" ] ) => {
    switch ( status )
    {
      case "eligible":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "partial":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      case "ineligible":
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = ( status: Lender[ "status" ] ) => {
    const variants = {
      eligible: "default",
      partial: "secondary",
      ineligible: "destructive",
    } as const

    const labels = {
      eligible: "Eligible",
      partial: "Partial Eligibility",
      ineligible: "Not Eligible",
    }

    return (
      <Badge variant={variants[ status ]} className="gap-1.5 bg-white/80 text-gray-700 border-gray-200">
        {getStatusIcon( status )}
        {labels[ status ]}
      </Badge>
    )
  }

  // Count lenders by status for display
  const eligibleCount = lenders.filter( l => l.status === "eligible" ).length
  const partialCount = lenders.filter( l => l.status === "partial" ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4d5eb] to-[#e8eff9] relative">
      {/* ... existing decorative elements ... */}

      <div className="container mx-auto p-4 lg:p-8 relative z-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] bg-clip-text text-transparent">
                  Dr. Finwise
                </h1>
              </div>
              <p className="text-lg text-gray-600 text-pretty">
                Your AI-powered financial advisor for smart loan decisions
              </p>
              {customerInfo && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-white/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Welcome back, <span className="text-[#3f50b5] font-semibold">{customerInfo.name}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
              <div className="text-center">
                <p className="text-sm text-gray-600">Matching Lenders Found</p>
                <p className="text-2xl font-bold text-[#3f50b5]">{lenders.length}</p>
                <div className="flex gap-2 justify-center text-xs text-gray-500">
                  <span>{eligibleCount} Eligible</span>
                  <span>•</span>
                  <span>{partialCount} Partial</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Info */}
          <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm p-6 border border-white/50 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#3f50b5]/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-[#3f50b5]" />
              </div>
              <div>
                <p className="text-sm text-gray-700 mb-2">
                  {stage === "A" ? (
                    <>
                      <strong className="text-[#3f50b5]">Indicative Pre-Check:</strong> Get estimated loan offers without affecting your credit score.
                      No bureau check required.
                    </>
                  ) : (
                    <>
                      <strong className="text-[#3f50b5]">Final Eligibility:</strong> Complete verification with document upload and bureau check for
                      confirmed offers.
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Employment: {customerInfo?.employmentType}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Income: ₹{customerInfo?.income}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Loan Needed: ₹{customerInfo?.loanAmount}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Lender Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">Ranked Lenders</h2>
              <Badge variant="outline" className="text-sm bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700">
                {eligibleCount} eligible • {partialCount} partial
              </Badge>
            </div>

            {sortedLenders.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm border-white/50 shadow-lg rounded-2xl overflow-hidden text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No matching lenders found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find lenders that match your current profile. Try adjusting your loan amount or check back later.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5]"
                >
                  Start Over
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6">
                {sortedLenders.map( ( lender, index ) => (
                  <Card
                    key={lender.id}
                    className="bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden"
                    style={{
                      animationDelay: `${ index * 100 }ms`,
                    }}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between pt-2">
                        <div className="space-y-2">
                          <CardTitle className="text-xl text-gray-800">{lender.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-[#3f50b5] border-blue-200">
                              {lender.productType}
                            </Badge>
                            {lender.status === "eligible" && (
                              <div className="flex items-center gap-1 text-amber-600">
                                <Zap className="h-3 w-3" />
                                <span className="text-xs font-medium">Top Pick</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {getStatusBadge( lender.status )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6 pt-0">
                      {/* Limit & ROI */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-sm text-gray-600 font-medium">
                            {stage === "A" ? "Indicative Limit" : "Final Limit"}
                          </p>
                          <p className="text-2xl font-bold text-[#3f50b5]">
                            {stage === "B" && lender.finalLimit ? lender.finalLimit : lender.indicativeLimit}
                          </p>
                        </div>
                        <div className="space-y-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <p className="text-sm text-gray-600 font-medium">ROI Range</p>
                          <p className="text-lg font-semibold text-green-700">{lender.roiRange}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-[#3f50b5]" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Processing Fee</p>
                            <p className="text-sm font-medium text-gray-800">{lender.processingFee}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Disbursal Time</p>
                            <p className="text-sm font-medium text-gray-800">{lender.disbursalTime}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pros & Cons */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Advantages
                          </p>
                          <ul className="space-y-2">
                            {lender.pros.map( ( pro, i ) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                                <span>{pro}</span>
                              </li>
                            ) )}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Considerations
                          </p>
                          <ul className="space-y-2">
                            {lender.cons.map( ( con, i ) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
                                <span>{con}</span>
                              </li>
                            ) )}
                          </ul>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex">
                        <Button
                          onClick={() => handleApply( lender )}
                          disabled={lender.status === "ineligible"}
                          className="w-[26vw] gap-2 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-6 text-base font-semibold"
                          size="lg"
                        >
                          {stage === "A" ? "Apply" : "Proceed with Application"}
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                        <Button
                          disabled={lender.status === "ineligible"}
                          className="w-[26vw] gap-2 bg-gradient-to-r from-[#3fb56c] to-[#5cc0b3] hover:from-[#354497] hover:to-[#4a58a5] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-6 text-base font-semibold"
                          size="lg"
                        >
                          {stage === "A" ? "Call" : "Proceed with Application"}
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) )}
              </div>
            )}
          </div>

          {/* Chat Assistant */}
          <div className="lg:max-h-[100vh] lg:flex lg:flex-col lg:min-h-0 sticky top-[2px] self-start">
            <ChatAssistant stage={stage} customerInfo={customerInfo} />
          </div>
        </div>
      </div>

      {/* Consent Modal */}
      <ConsentModal
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        onAccept={handleConsentAccept}
        lenderName={selectedLender?.name || ""}
      />
    </div>
  )
}