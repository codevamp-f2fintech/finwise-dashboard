"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatAssistant } from "@/components/chat-assistant"
import { ConsentModal } from "@/components/consent-modal"
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, Clock, FileText, ArrowRight, Star, Zap, Shield } from "lucide-react"
import type { CustomerInfo } from "@/components/onboarding-form"

type Stage = "A" | "B"
type EligibilityStatus = "eligible" | "partial" | "ineligible"

interface Lender {
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
  status: EligibilityStatus
  rank: number
}

const mockLenders: Lender[] = [
  {
    id: "1",
    name: "Bajaj Finance",
    productType: "Personal Loan",
    indicativeLimit: "₹15 lakhs",
    roiRange: "11.5% - 14.5%",
    processingFee: "2.5% + GST",
    disbursalTime: "24-48 hours",
    pros: [ "Fast approval", "Minimal documentation", "Flexible tenure" ],
    cons: [ "Higher processing fee", "Limited to salaried" ],
    status: "eligible",
    rank: 1,
  },
  {
    id: "2",
    name: "ABFL (Aditya Birla Finance)",
    productType: "Credit Line",
    indicativeLimit: "₹12 lakhs",
    roiRange: "12% - 15%",
    processingFee: "2% + GST",
    disbursalTime: "48-72 hours",
    pros: [ "Revolving credit", "Pay interest on usage only", "Good for business owners" ],
    cons: [ "Slightly higher ROI", "Requires banking history" ],
    status: "eligible",
    rank: 2,
  },
  {
    id: "3",
    name: "Tata Capital",
    productType: "Personal Loan",
    indicativeLimit: "₹10 lakhs",
    roiRange: "10.5% - 13.5%",
    processingFee: "1.5% + GST",
    disbursalTime: "3-5 days",
    pros: [ "Lower ROI", "Trusted brand", "Good customer service" ],
    cons: [ "Slower disbursal", "Stricter eligibility" ],
    status: "partial",
    rank: 3,
  },
  {
    id: "4",
    name: "L&T Finance",
    productType: "Personal Loan",
    indicativeLimit: "₹8 lakhs",
    roiRange: "11% - 14%",
    processingFee: "2% + GST",
    disbursalTime: "2-4 days",
    pros: [ "Competitive rates", "Flexible repayment", "Digital process" ],
    cons: [ "Lower limit for new customers", "CIBIL sensitive" ],
    status: "partial",
    rank: 4,
  },
]

interface LoanDashboardProps {
  customerInfo: CustomerInfo | null
}

export function LoanDashboard ( { customerInfo }: LoanDashboardProps ) {
  const [ stage, setStage ] = useState<Stage>( "A" )
  const [ showConsentModal, setShowConsentModal ] = useState( false )
  const [ selectedLender, setSelectedLender ] = useState<Lender | null>( null )

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

  const getStatusIcon = ( status: EligibilityStatus ) => {
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

  const getStatusBadge = ( status: EligibilityStatus ) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4d5eb] to-[#e8eff9] relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-[#3f50b5]/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-40 right-20 w-24 h-24 bg-[#3f50b5]/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-[#3f50b5]/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>

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

            {/* Stage Toggle */}
            <Tabs value={stage} onValueChange={( v ) => setStage( v as Stage )} className="w-full lg:w-auto">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-white/80 backdrop-blur-sm border border-white/50 p-1 rounded-2xl">
                <TabsTrigger
                  value="A"
                  className="gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3f50b5] data-[state=active]:to-[#5c6bc0] data-[state=active]:text-white transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4" />
                  Stage A: Indicative
                </TabsTrigger>
                <TabsTrigger
                  value="B"
                  className="gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3f50b5] data-[state=active]:to-[#5c6bc0] data-[state=active]:text-white transition-all duration-300"
                >
                  <FileText className="h-4 w-4" />
                  Stage B: Final
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Stage Info */}
          <div className="mt-6 rounded-2xl bg-white/80 backdrop-blur-sm p-6 border border-white/50 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#3f50b5]/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4 text-[#3f50b5]" />
              </div>
              <p className="text-sm text-gray-700">
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
                {mockLenders.length} options available
              </Badge>
            </div>

            <div className="grid gap-6">
              {mockLenders.map( ( lender, index ) => (
                <Card
                  key={lender.id}
                  className="bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden"
                  style={{
                    animationDelay: `${ index * 100 }ms`,
                  }}
                >
                  {/* Rank Ribbon */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                      #{lender.rank}
                    </div>
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between pt-2">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-gray-800">{lender.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-[#3f50b5] border-blue-200">
                            {lender.productType}
                          </Badge>
                          <div className="flex items-center gap-1 text-amber-600">
                            <Zap className="h-3 w-3" />
                            <span className="text-xs font-medium">Top Pick</span>
                          </div>
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
                    <Button
                      onClick={() => handleApply( lender )}
                      disabled={lender.status === "ineligible"}
                      className="w-full gap-2 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-6 text-base font-semibold"
                      size="lg"
                    >
                      {stage === "A" ? "Apply Now" : "Proceed with Application"}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              ) )}
            </div>
          </div>

          {/* Chat Assistant */}
          <div className="lg:sticky lg:top-8 lg:max-h-[calc(100vh-6rem)] lg:flex lg:flex-col lg:min-h-0">
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