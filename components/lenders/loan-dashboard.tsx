"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatAssistant } from "./chat-assistant";
import { ConsentModal } from "./consent-modal";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  Clock,
  FileText,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Phone,
  RotateCcw,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { CustomerInfo } from "./onboarding-form";
import type { Lender } from "./mock-lenders";

type Stage = "A" | "B";

interface LoanDashboardProps {
  customerInfo: CustomerInfo | null;
  lenders: Lender[];
  allLenders: Lender[];
  eligibilityResponse?: any;
  onLenderSelection?: (lenderIds: string[], reasoning: any) => void;
  onResetFilter?: () => void;
  isAiFiltered?: boolean;
  aiReasoning?: any;
}

export function LoanDashboard({
  customerInfo,
  lenders: initialLenders,
  allLenders,
  eligibilityResponse,
}: LoanDashboardProps) {
  const [stage, setStage] = useState<Stage>("A");
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hardUpdatedLenders, setHardUpdatedLenders] = useState<Lender[] | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // NEW: State for AI-filtered lenders
  const [aiFilteredLenderIds, setAiFilteredLenderIds] = useState<string[] | null>(null);
  const [aiReasoning, setAiReasoning] = useState<any>(null);

  // NEW: Determine which lenders to show
  const displayedLenders = useMemo(() => {
    // If HARD phase results are available, use them
    const baseLenders = hardUpdatedLenders || initialLenders;

    if (aiFilteredLenderIds && aiFilteredLenderIds.length > 0) {
      // Show only AI-selected lenders, maintaining their order
      return aiFilteredLenderIds
        .map(id => allLenders.find(l => l.id === id))
        .filter(Boolean) as Lender[];
    }
    // Show all lenders by default
    return baseLenders;
  }, [aiFilteredLenderIds, allLenders, initialLenders, hardUpdatedLenders]);

  // Sort lenders: eligible first, then partial eligible
  const sortedLenders = useMemo(() => {
    return [...displayedLenders].sort((a, b) => {
      // Priority order: eligible > partial > ineligible
      const priorityOrder = {
        eligible: 0,
        partial: 1,
        ineligible: 2,
      };

      return priorityOrder[a.status] - priorityOrder[b.status];
    });
  }, [displayedLenders]);

  // NEW: Handler for AI lender selection
  const handleAiLenderSelection = (lenderIds: string[], reasoning: any) => {
    console.log("[Dashboard] AI selected lenders:", lenderIds);
    console.log("[Dashboard] AI reasoning:", reasoning);
    setAiFilteredLenderIds(lenderIds);
    setAiReasoning(reasoning);
  };

  // NEW: Handler to reset filter and show all lenders
  const handleResetFilter = () => {
    console.log("[Dashboard] Resetting filter, showing all lenders");
    setAiFilteredLenderIds(null);
    setAiReasoning(null);
  };

  const handleApply = (lender: Lender) => {
    setSelectedLender(lender);
    if (stage === "A") {
      setShowConsentModal(true);
    } else {
      console.log("[Dashboard] Proceeding with application for:", lender.name);
      toast.success("Your application has been submitted. We will contact you soon.");
    }
  };



  const handleConsentAccept = () => {
    setShowConsentModal(false);
    // setStage("B");
    console.log("[Dashboard] User consented, moving to Stage B");
  };

  // Handler for HARD eligibility results from ConsentModal
  const handleHardResults = (apiResult: any) => {
    console.log("[Dashboard] Received HARD eligibility results:", apiResult);

    if (!apiResult?.eligibility) return;

    const { lenders: eligibleLenders = [], partial_lenders: partialLenders = [] } = apiResult.eligibility;
    const allHardLenders = [...eligibleLenders, ...partialLenders];

    if (allHardLenders.length === 0) return;

    // Update existing lenders with HARD phase data
    const updatedLenders = initialLenders.map(lender => {
      // Try to find a matching lender from HARD results by lender_id or name
      const hardMatch = allHardLenders.find(
        (hl: any) => hl.lender_id === lender.id ||
          hl.lender?.toLowerCase() === lender.name.toLowerCase()
      );

      if (!hardMatch) return lender;

      // Map HARD eligibility status to Lender status
      const statusMap: Record<string, "eligible" | "partial" | "ineligible"> = {
        'PASS': 'eligible',
        'SOFT_PASS': 'eligible',
        'PARTIAL': 'partial',
        'SOFT_PARTIAL': 'partial',
        'FAIL': 'ineligible',
      };

      const newStatus = statusMap[hardMatch.eligibility?.status] || lender.status;
      const eligibleLimit = hardMatch.eligibility?.eligible_limit;

      return {
        ...lender,
        status: newStatus,
        finalLimit: eligibleLimit
          ? `₹${Number(eligibleLimit).toLocaleString('en-IN')}`
          : lender.finalLimit,
        pros: hardMatch.explain?.why_matched?.length > 0
          ? hardMatch.explain.why_matched
          : lender.pros,
        cons: hardMatch.explain?.how_to_increase_limit?.length > 0
          ? hardMatch.explain.how_to_increase_limit
          : lender.cons,
      };
    });

    setHardUpdatedLenders(updatedLenders);
    setStage('B');
    console.log("[Dashboard] Lenders updated with HARD phase results");
  };

  const handleCall = () => {
    window.location.href = "tel:+14388010973";
  };

  const getStatusIcon = (status: Lender["status"]) => {
    switch (status) {
      case "eligible":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "partial":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "ineligible":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const getStatusBadge = (status: Lender["status"]) => {
    const styles = {
      eligible: "bg-green-100 text-green-800 border-green-300",
      partial: "bg-amber-100 text-amber-800 border-amber-300",
      ineligible: "bg-red-100 text-red-800 border-red-300",
    };

    const labels = {
      eligible: "✓ Eligible",
      partial: "⚡ Partial Match",
      ineligible: "✗ Not Eligible",
    };

    return (
      <Badge
        className={`gap-1.5 font-semibold ${styles[status]}`}
      >
        {labels[status]}
      </Badge>
    );
  };

  // Count lenders by status for display
  const eligibleCount = sortedLenders.filter((l) => l.status === "eligible").length;
  const partialCount = sortedLenders.filter((l) => l.status === "partial").length;

  // NEW: Check if AI filtering is active
  const isAiFiltered = aiFilteredLenderIds !== null && aiFilteredLenderIds.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4d5eb] to-[#e8eff9] relative">
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
                    Welcome back,{" "}
                    <span className="text-[#3f50b5] font-semibold">
                      {customerInfo.name}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {isAiFiltered
                    ? "AI Selected Lenders"
                    : "Matching Lenders Found"}
                </p>
                <p className="text-2xl font-bold text-[#3f50b5]">
                  {sortedLenders.length}
                </p>
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
                      <strong className="text-[#3f50b5]">
                        Indicative Pre-Check:
                      </strong>{" "}
                      Get estimated loan offers without affecting your credit
                      score. No bureau check required.
                    </>
                  ) : (
                    <>
                      <strong className="text-[#3f50b5]">
                        Final Eligibility:
                      </strong>{" "}
                      Complete verification with document upload and bureau
                      check for confirmed offers.
                    </>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    {customerInfo?.persona} ({customerInfo?.degree})
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {customerInfo?.employment_type === "SelfEmployed" ? "Own Practice" : "Employed"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    Income: ₹{Number(customerInfo?.net_monthly_income || 0).toLocaleString("en-IN")}/mo
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700"
                  >
                    CIBIL: {customerInfo?.cibil_band}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700"
                  >
                    Loan: ₹{Number(customerInfo?.requested_limit || 0).toLocaleString("en-IN")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* AI Selection Banner */}
          {isAiFiltered && (
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-purple-100 to-blue-100 backdrop-blur-sm p-6 border border-purple-200 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-purple-900">
                      🎯 AI-Recommended Lenders
                    </h3>
                    <Button
                      onClick={handleResetFilter}
                      variant="outline"
                      size="sm"
                      className="gap-2 hover:bg-white"
                    >
                      <RotateCcw className="h-3 w-3" />
                      View All {allLenders.length} Lenders
                    </Button>
                  </div>
                  <p className="text-sm text-purple-800">
                    Dr. Finwise has analyzed all available lenders and selected
                    these top options specifically for your needs.
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Lender Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                {isAiFiltered ? "Your Top Picks" : "Ranked Lenders"}
              </h2>
              <Badge
                variant="outline"
                className="text-sm bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700"
              >
                {eligibleCount} eligible • {partialCount} partial
              </Badge>
            </div>

            {/* Loading State */}
            {isSelecting && (
              <Card className="bg-white/90 backdrop-blur-sm border-white/50 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-ping opacity-20"></div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2 justify-center">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                        AI Analysis in Progress
                      </h3>
                      <p className="text-gray-600 text-lg">
                        Analyzing {allLenders.length} lenders to find your best
                        matches...
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Checking eligibility criteria</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <span>Comparing interest rates and fees</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                        <span>Matching with your profile</span>
                      </div>
                    </div>

                    <div className="w-full max-w-md bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lenders List */}
            {!isSelecting && sortedLenders.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm border-white/50 shadow-lg rounded-2xl overflow-hidden text-center p-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No matching lenders found
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find lenders that match your current profile. Try
                  adjusting your loan amount or check back later.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5]"
                >
                  Start Over
                </Button>
              </Card>
            ) : (
              !isSelecting && (
                <div className="grid gap-6">
                  {sortedLenders.map((lender, index) => (
                    <Card
                      key={lender.id}
                      className={`bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden border-l-4 ${lender.status === "eligible"
                        ? "border-l-green-500 border-green-200"
                        : lender.status === "partial"
                          ? "border-l-amber-500 border-amber-200"
                          : "border-l-red-500 border-red-200"
                        }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between pt-2">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <CardTitle className="text-lg sm:text-xl text-gray-800">
                                {lender.name}
                              </CardTitle>
                              {isAiFiltered && (
                                <Badge className="gap-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                                  <Sparkles className="h-3 w-3" />
                                  AI Pick
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-[#3f50b5] border-blue-200"
                              >
                                {lender.productType}
                              </Badge>
                              {lender.status === "eligible" && (
                                <div className="flex items-center gap-1 text-amber-600">
                                  <Zap className="h-3 w-3" />
                                  <span className="text-xs font-medium">
                                    Top Pick
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="self-start">{getStatusBadge(lender.status)}</div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6 pt-0">
                        {/* AI Reasoning (if available) */}
                        {isAiFiltered &&
                          aiReasoning &&
                          aiReasoning[`lender${index + 1}`] && (
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                              <p className="text-sm font-medium text-purple-900 mb-1 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Why we recommend this:
                              </p>
                              <p className="text-sm text-purple-800">
                                {aiReasoning[`lender${index + 1}`]}
                              </p>
                            </div>
                          )}

                        {/* Limit & ROI */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-sm text-gray-600 font-medium">
                              {stage === "A"
                                ? "Indicative Limit"
                                : "Final Limit"}
                            </p>
                            <p className="text-2xl font-bold text-[#3f50b5] leading-snug">
                              {stage === "B" && lender.finalLimit
                                ? lender.finalLimit
                                : lender.indicativeLimit
                                  ?.split(";")
                                  .map((line: string, idx: number) => (
                                    <span key={idx}>
                                      {line.trim()}
                                      <br />
                                    </span>
                                  ))}
                            </p>
                          </div>
                          <div className="space-y-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                            <p className="text-sm text-gray-600 font-medium">
                              Rate of Interest (ROI)
                            </p>
                            <p className="text-lg font-semibold text-green-700">
                              {lender.roiRange}
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-4 w-4 text-[#3f50b5]" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Processing Fee
                              </p>
                              <p className="text-sm font-medium text-gray-800">
                                {lender.processingFee}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Clock className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">
                                Disbursal Time
                              </p>
                              <p className="text-sm font-medium text-gray-800">
                                {lender.disbursalTime}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Why Matched / How to Improve */}
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-3">
                            <p className="text-sm font-semibold text-green-700 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              {lender.status === "eligible" ? "Why You're Eligible" : "What's Working"}
                            </p>
                            <ul className="space-y-2">
                              {lender.pros.map((pro, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-gray-700"
                                >
                                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                                  <span>{pro}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-3">
                            <p className={`text-sm font-semibold flex items-center gap-2 ${lender.status === "ineligible" ? "text-red-600" :
                              lender.status === "partial" ? "text-amber-600" : "text-gray-600"
                              }`}>
                              {lender.status === "eligible" ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              {lender.status === "eligible"
                                ? "To Get Higher Limit"
                                : lender.status === "partial"
                                  ? "To Improve Eligibility"
                                  : "Why Not Eligible"}
                            </p>
                            <ul className="space-y-2">
                              {lender.cons.map((con, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-gray-700"
                                >
                                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
                                  <span>{con}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-row gap-3 sm:flex-col">
                          <Button
                            onClick={() => handleApply(lender)}
                            disabled={lender.status === "ineligible"}
                            className="flex-1 sm:flex-none sm:w-full gap-2 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-6 text-base font-semibold"
                            size="lg"
                          >
                            {stage === "A"
                              ? "Apply"
                              : "Proceed with Application"}
                            <ArrowRight className="h-5 w-5" />
                          </Button>

                          {/* Call button — always shown on mobile (flex-row), hidden on sm+ */}
                          <Button
                            onClick={handleCall}
                            className="flex-1 sm:hidden gap-2 bg-gradient-to-r from-[#3fb56c] to-[#5cc0b3] hover:from-[#359a5c] hover:to-[#4ca895] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-6 text-base font-semibold"
                            size="lg"
                          >
                            Call
                            <Phone className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Chat Assistant — desktop sidebar only (always hidden inside grid on mobile) */}
          <div className="hidden lg:flex lg:max-h-[100vh] lg:flex-col lg:min-h-0 lg:sticky lg:top-[6px] lg:self-start">
            <br /> <br />
            <ChatAssistant
              stage={stage}
              customerInfo={customerInfo}
              lenders={allLenders}
              onLenderSelection={handleAiLenderSelection}
              onSelectionStart={() => setIsSelecting(true)}
              onSelectionEnd={() => setIsSelecting(false)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Chat Overlay — fixed full-screen, only on mobile, hidden on lg+ */}
      {showMobileChat && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-black/40 backdrop-blur-sm">
          {/* Overlay header bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#008069] text-white shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold text-base">Ask Dr. Finwise</span>
            </div>
            <button
              onClick={() => setShowMobileChat(false)}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          {/* Chat panel fills remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden p-3">
            <ChatAssistant
              stage={stage}
              customerInfo={customerInfo}
              lenders={allLenders}
              onLenderSelection={(ids, reasoning) => {
                handleAiLenderSelection(ids, reasoning);
                setShowMobileChat(false);
              }}
              onSelectionStart={() => setIsSelecting(true)}
              onSelectionEnd={() => setIsSelecting(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Chat FAB — hidden on lg+ */}
      <button
        onClick={() => setShowMobileChat(prev => !prev)}
        className="fixed bottom-6 right-6 z-40 lg:hidden flex items-center gap-2 bg-[#008069] text-white px-4 py-3 rounded-full shadow-xl hover:bg-[#006e58] active:scale-95 transition-all duration-200"
        aria-label="Toggle chat assistant"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-semibold">Ask Dr. Finwise</span>
      </button>

      {/* Consent Modal */}
      <ConsentModal
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        onAccept={() => {
          // This is called when eligibility is confirmed
          setStage('B')
        }}
        onHardResults={handleHardResults}
        lenderName={selectedLender?.name || ""}
      />
    </div>
  );
}