"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChatAssistant } from "@/components/chat-assistant"
import { ConsentModal } from "@/components/consent-modal"
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, Clock, FileText, ArrowRight } from "lucide-react"
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
    pros: ["Fast approval", "Minimal documentation", "Flexible tenure"],
    cons: ["Higher processing fee", "Limited to salaried"],
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
    pros: ["Revolving credit", "Pay interest on usage only", "Good for business owners"],
    cons: ["Slightly higher ROI", "Requires banking history"],
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
    pros: ["Lower ROI", "Trusted brand", "Good customer service"],
    cons: ["Slower disbursal", "Stricter eligibility"],
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
    pros: ["Competitive rates", "Flexible repayment", "Digital process"],
    cons: ["Lower limit for new customers", "CIBIL sensitive"],
    status: "partial",
    rank: 4,
  },
]

interface LoanDashboardProps {
  customerInfo: CustomerInfo | null
}

export function LoanDashboard({ customerInfo }: LoanDashboardProps) {
  const [stage, setStage] = useState<Stage>("A")
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null)

  const handleApply = (lender: Lender) => {
    setSelectedLender(lender)
    if (stage === "A") {
      setShowConsentModal(true)
    } else {
      // Stage B - proceed with application
      console.log("[v0] Proceeding with application for:", lender.name)
    }
  }

  const handleConsentAccept = () => {
    setShowConsentModal(false)
    setStage("B")
    console.log("[v0] User consented, moving to Stage B")
  }

  const getStatusIcon = (status: EligibilityStatus) => {
    switch (status) {
      case "eligible":
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case "partial":
        return <AlertCircle className="h-5 w-5 text-warning" />
      case "ineligible":
        return <XCircle className="h-5 w-5 text-destructive" />
    }
  }

  const getStatusBadge = (status: EligibilityStatus) => {
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
      <Badge variant={variants[status]} className="gap-1.5">
        {getStatusIcon(status)}
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-4 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-balance">Dr. Finwise</h1>
              <p className="mt-2 text-lg text-muted-foreground text-pretty">
                Your AI-powered financial advisor for smart loan decisions
              </p>
              {customerInfo && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Welcome back, <span className="font-medium text-foreground">{customerInfo.name}</span>
                </p>
              )}
            </div>

            {/* Stage Toggle */}
            <Tabs value={stage} onValueChange={(v) => setStage(v as Stage)} className="w-full lg:w-auto">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger value="A" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Stage A: Indicative
                </TabsTrigger>
                <TabsTrigger value="B" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Stage B: Final
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Stage Info */}
          <div className="mt-4 rounded-lg bg-primary/10 p-4">
            <p className="text-sm text-foreground">
              {stage === "A" ? (
                <>
                  <strong>Indicative Pre-Check:</strong> Get estimated loan offers without affecting your credit score.
                  No bureau check required.
                </>
              ) : (
                <>
                  <strong>Final Eligibility:</strong> Complete verification with document upload and bureau check for
                  confirmed offers.
                </>
              )}
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Lender Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Ranked Lenders</h2>
              <Badge variant="outline" className="text-sm">
                {mockLenders.length} options available
              </Badge>
            </div>

            <div className="grid gap-4">
              {mockLenders.map((lender, index) => (
                <Card
                  key={lender.id}
                  className="glass transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="h-6 w-6 rounded-full p-0 text-xs">
                            {lender.rank}
                          </Badge>
                          <CardTitle className="text-xl">{lender.name}</CardTitle>
                        </div>
                        <CardDescription>{lender.productType}</CardDescription>
                      </div>
                      {getStatusBadge(lender.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Limit & ROI */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {stage === "A" ? "Indicative Limit" : "Final Limit"}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {stage === "B" && lender.finalLimit ? lender.finalLimit : lender.indicativeLimit}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">ROI Range</p>
                        <p className="text-lg font-semibold">{lender.roiRange}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="font-medium">{lender.processingFee}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium">{lender.disbursalTime}</span>
                      </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-success">Pros</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {lender.pros.map((pro, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-destructive">Cons</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {lender.cons.map((con, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      onClick={() => handleApply(lender)}
                      disabled={lender.status === "ineligible"}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {stage === "A" ? "Apply Now" : "Proceed with Application"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
