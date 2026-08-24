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
  ExternalLink,
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
    console.log("[Dashboard] User consented, redirecting to application form");

    const baseUrl = "http://localhost:5173/application-form";
    const params = new URLSearchParams();

    if (selectedLender) {
      // Map mock lender names to standard provider names expected by the backend
      const providerMap: Record<string, string> = {
        "Bajaj Finserv": "Bajaj Finance",
        "Cholamandalam Finance": "Cholamandalam",
      };

      const providerName = providerMap[selectedLender.name] || selectedLender.name;
      params.append("provider", providerName);

      let loanType = "personal-loan";
      if (selectedLender.id.startsWith("BL-")) {
        loanType = "business-loan";
      } else if (selectedLender.id.startsWith("DOC-")) {
        loanType = "doctor-loan";
      } else if (selectedLender.id.startsWith("HL-")) {
        loanType = "home-loans";
      }
      params.append("loanType", loanType);
    }

    if (customerInfo) {
      if (customerInfo.name) {
        const nameParts = customerInfo.name.split(" ");
        if (["Dr.", "CA"].includes(nameParts[0])) {
          params.append("prefix", nameParts[0].replace(".", ""));
          params.append("name", nameParts.slice(1).join(" "));
        } else {
          params.append("name", customerInfo.name);
        }
      }
      if (customerInfo.phone) params.append("contact", customerInfo.phone);
      if (customerInfo.email) params.append("email", customerInfo.email);
      if (customerInfo.requested_limit) params.append("amount", customerInfo.requested_limit);
    }

    window.location.href = `${baseUrl}?${params.toString()}`;
  };

  // Handler for HARD eligibility results from ConsentModal
  const handleHardResults = (apiResult: any) => {
    console.log("[Dashboard] Received HARD eligibility results:", apiResult);

    if (!apiResult?.eligibility) return;

    const { lenders: eligibleLenders = [], partial_lenders: partialLenders = [] } = apiResult.eligibility;
    // Combine eligible + partial; exclude FAIL lenders from display
    const allHardLenders = [...eligibleLenders, ...partialLenders];

    if (allHardLenders.length === 0) return;

    // Only keep lenders that have a HARD match (eligible or partial)
    // Lenders without a match in HARD results are excluded (they failed hard check)
    const updatedLenders = initialLenders
      .map(lender => {
        const hardMatch = allHardLenders.find(
          (hl: any) => hl.lender_id === lender.id ||
            hl.lender?.toLowerCase() === lender.name.toLowerCase()
        );

        if (!hardMatch) return null; // Not in eligible or partial — hide it

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
      })
      .filter((l): l is NonNullable<typeof l> => l !== null && l.status !== 'ineligible');

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
  const totalChecked = allLenders.length;
  const hiddenCount = totalChecked - sortedLenders.length;

  // NEW: Check if AI filtering is active
  const isAiFiltered = aiFilteredLenderIds !== null && aiFilteredLenderIds.length > 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#c4d5eb] to-[#e8eff9] relative animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-2 duration-500 ease-out">
        <div className="container mx-auto px-3 py-4 sm:p-6 lg:p-8 relative z-10">
          {/* Header */}
          <header className="mb-6 sm:mb-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] rounded-lg flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] bg-clip-text text-transparent">
                    Dr. Finwise
                  </h1>
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600 text-pretty">
                  Your AI-powered financial advisor for smart loan decisions
                </p>
                {customerInfo && (
                  <div className="mt-2.5 sm:mt-3 inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 border border-white/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      Welcome back,{" "}
                      <span className="text-[#3f50b5] font-semibold">
                        {customerInfo.name}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Results Summary */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 sm:p-4 border border-white/50">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {isAiFiltered
                      ? "AI Selected Lenders"
                      : "Matching Lenders Found"}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-[#3f50b5]">
                    {sortedLenders.length}
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center text-xs text-gray-500">
                    <span className="text-green-600 font-medium">{eligibleCount} Eligible</span>
                    <span>•</span>
                    <span className="text-amber-600 font-medium">{partialCount} Partial</span>
                    {hiddenCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-gray-400">{hiddenCount} Not Eligible</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Info */}
            <div className="mt-4 sm:mt-6 rounded-2xl bg-white/80 backdrop-blur-sm p-4 sm:p-6 border border-white/50 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#3f50b5]/10 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-[#3f50b5]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-700 mb-2 leading-relaxed">
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
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 text-[11px] sm:text-xs">
                      {customerInfo?.persona} ({customerInfo?.degree})
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[11px] sm:text-xs">
                      {customerInfo?.employment_type === "SelfEmployed" ? "Own Practice" : "Employed"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 text-[11px] sm:text-xs"
                    >
                      Income: ₹{Number(customerInfo?.net_monthly_income || 0).toLocaleString("en-IN")}/mo
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 text-[11px] sm:text-xs"
                    >
                      CIBIL: {customerInfo?.cibil_band}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-indigo-50 text-indigo-700 text-[11px] sm:text-xs"
                    >
                      Loan: ₹{Number(customerInfo?.requested_limit || 0).toLocaleString("en-IN")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Selection Banner */}
            {isAiFiltered && (
              <div className="mt-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 backdrop-blur-sm p-4 sm:p-6 border border-purple-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-purple-900 flex items-center gap-2">
                        AI Smart Selection
                        <Badge className="bg-purple-500 text-white text-xs">
                          {aiFilteredLenderIds.length} Lenders Selected
                        </Badge>
                      </h3>
                      <p className="text-xs sm:text-sm text-purple-700 mt-1 leading-relaxed">
                        Dr. Finwise analyzed your profile and selected the best lenders based on your criteria.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleResetFilter}
                    variant="ghost"
                    size="sm"
                    className="text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-lg text-xs"
                  >
                    Show All Lenders
                  </Button>
                </div>
              </div>
            )}
          </header>

          {/* Main Content */}
          <div className="flex gap-6 relative">
            <div className="flex-1 min-w-0 w-full space-y-6 transition-all duration-500 ease-in-out">
              {/* Lender Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    {isAiFiltered ? "Your Top Picks" : "Ranked Lenders"}
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-xs sm:text-sm bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700"
                  >
                    {eligibleCount} eligible • {partialCount} partial
                  </Badge>
                </div>

                {/* Loading State */}
                {isSelecting && (
                  <Card className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-2 border-purple-300 p-8 sm:p-12 text-center animate-in fade-in zoom-in duration-300">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 rounded-full bg-purple-200 animate-ping opacity-25"></div>
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                          <Bot className="h-8 w-8 text-white animate-bounce" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Dr. Finwise is Analyzing Lenders
                      </h3>
                      <p className="text-sm text-gray-600">
                        Evaluating interest rates, approval criteria, and your profile to find the best match...
                      </p>
                      <div className="flex justify-center gap-1.5 pt-2">
                        <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Lenders List */}
                {!isSelecting && sortedLenders.length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-sm shadow-sm rounded-2xl p-8 sm:p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No matching lenders found
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                      {isAiFiltered
                        ? "Dr. Finwise couldn't find any lenders matching your specific query. Try a different request or show all lenders."
                        : "Based on the criteria, no lenders are currently available. Try adjusting your information."}
                    </p>
                    <Button
                      onClick={() => isAiFiltered ? handleResetFilter() : window.location.reload()}
                      variant="outline"
                      className="rounded-xl"
                    >
                      {isAiFiltered ? "Show All Lenders" : "Start Over"}
                    </Button>
                  </Card>
                ) : (
                  !isSelecting && (
                    <div
                      className="grid gap-4 sm:gap-6 w-full transition-all duration-500"
                      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))' }}
                    >
                      {sortedLenders.map((lender, index) => (
                        <Card
                          key={lender.id}
                          className={`flex flex-col h-full bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] rounded-2xl overflow-hidden border-l-4 ${lender.status === "eligible"
                            ? "border-l-green-500 border-green-200"
                            : lender.status === "partial"
                              ? "border-l-amber-500 border-amber-200"
                              : "border-l-red-500 border-red-200"
                            }`}
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between pt-1">
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <CardTitle className="text-base sm:text-lg md:text-xl text-gray-800">
                                    {lender.name}
                                  </CardTitle>
                                  {isAiFiltered && (
                                    <Badge className="gap-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 text-xs">
                                      <Sparkles className="h-3 w-3" />
                                      AI Pick
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-[#3f50b5] border-blue-200 text-xs"
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

                          <CardContent className="flex-1 flex flex-col p-4 sm:p-6 pt-0">
                            <div className="flex-1 space-y-4 sm:space-y-6">

                              {/* AI Reasoning (if available) */}
                              {isAiFiltered &&
                                aiReasoning &&
                                aiReasoning[`lender${index + 1}`] && (
                                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-3.5 sm:p-4 border border-purple-200">
                                    <p className="text-xs sm:text-sm font-medium text-purple-900 mb-1 flex items-center gap-1.5 sm:gap-2">
                                      <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                                      Why we recommend this:
                                    </p>
                                    <p className="text-xs sm:text-sm text-purple-800 leading-relaxed">
                                      {aiReasoning[`lender${index + 1}`]}
                                    </p>
                                  </div>
                                )}

                              {/* Limit & ROI */}
                              <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                                <div className="space-y-1 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2.5 sm:p-3 border border-blue-100">
                                  <p className="text-xs text-gray-600 font-medium">
                                    {stage === "A"
                                      ? "Indicative Limit"
                                      : "Final Limit"}
                                  </p>
                                  <p className="text-lg sm:text-xl font-bold text-[#3f50b5] leading-snug">
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
                                <div className="space-y-1 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-2.5 sm:p-3 border border-green-100">
                                  <p className="text-xs text-gray-600 font-medium">
                                    Rate of Interest (ROI)
                                  </p>
                                  <p className="text-sm sm:text-base font-semibold text-green-700">
                                    {lender.roiRange}
                                  </p>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                                <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg p-2 sm:p-2.5">
                                  <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                    <FileText className="h-3.5 w-3.5 text-[#3f50b5]" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] sm:text-[11px] text-gray-500">
                                      Processing Fee
                                    </p>
                                    <p className="text-xs font-medium text-gray-800 truncate">
                                      {lender.processingFee}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg p-2 sm:p-2.5">
                                  <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                    <Clock className="h-3.5 w-3.5 text-green-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] sm:text-[11px] text-gray-500">
                                      Disbursal Time
                                    </p>
                                    <p className="text-xs font-medium text-gray-800 truncate">
                                      {lender.disbursalTime}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Why Matched / How to Improve */}
                              <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2 sm:space-y-3">
                                  <p className="text-xs sm:text-sm font-semibold text-green-700 flex items-center gap-1.5 sm:gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    <span>{lender.status === "eligible" ? "Why You're Eligible" : "What's Working"}</span>
                                  </p>
                                  <ul className="space-y-1.5 sm:space-y-2">
                                    {lender.pros.map((pro, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-xs sm:text-sm text-gray-700"
                                      >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 shrink-0"></div>
                                        <span className="leading-snug">{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                  <p className={`text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 ${lender.status === "ineligible" ? "text-red-600" :
                                    lender.status === "partial" ? "text-amber-600" : "text-gray-600"
                                    }`}>
                                    {lender.status === "eligible" ? (
                                      <TrendingUp className="h-4 w-4 shrink-0" />
                                    ) : (
                                      <AlertCircle className="h-4 w-4 shrink-0" />
                                    )}
                                    <span>
                                      {lender.status === "eligible"
                                        ? "To Get Higher Limit"
                                        : lender.status === "partial"
                                          ? "To Improve Eligibility"
                                          : "Why Not Eligible"}
                                    </span>
                                  </p>
                                  <ul className="space-y-1.5 sm:space-y-2">
                                    {lender.cons.map((con, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-xs sm:text-sm text-gray-700"
                                      >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full mt-1.5 shrink-0"></div>
                                        <span className="leading-snug">{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                              <Button
                                onClick={() => {
                                  let loanType = "personal-loan";
                                  let suffix = "-personal-loan";

                                  if (lender.id.startsWith("BL-")) {
                                    loanType = "business-loan";
                                    suffix = "-business-loan";
                                  } else if (lender.id.startsWith("DOC-")) {
                                    loanType = "doctor-loan";
                                    suffix = "-doctor-loan";
                                  } else if (lender.id.startsWith("HL-")) {
                                    loanType = "home-loans";
                                    suffix = "-home-loans";
                                  }

                                  const bankSlugMap: Record<string, string> = {
                                    "PL-HDFC": "hdfc-personal-loan",
                                    "PL-BAJAJ": "bajaj-finance-personal-loan",
                                    "PL-IDFC": "hdfc-personal-loan",
                                    "PL-ICICI": "icici-personal-loan",
                                    "PL-CHOLA": "cholamandalam-personal-loan",
                                    "PL-TATA": "hdfc-personal-loan",
                                    "PL-AXIS": "hdfc-personal-loan",
                                    "PL1": "sbi-personal-loan",
                                    "PL2": "lt-housing-finance-personal-loan",
                                    "PL3": "lt-housing-finance-personal-loan",
                                    "PL4": "hdfc-personal-loan",
                                    "PL5": "bajaj-finance-personal-loan",
                                    "PL6": "cholamandalam-personal-loan",

                                    "BL-BAJAJ": "bajaj-finance-business-loan",
                                    "BL-IDFC": "hdfc-business-loan",
                                    "BL-ICICI": "icici-business-loan",
                                    "BL-CHOLA": "cholamandalam-business-loan",
                                    "BL-TATA": "hdfc-business-loan",
                                    "BL-LENDINGKART": "sbi-business-loan",

                                    "DOC-BAJAJ": "bajaj-finance-doctor-loan",
                                    "DOC-ABFL": "lt-housing-finance-doctor-loan",
                                    "DOC-TATA": "hdfc-doctor-loan",
                                    "DOC-LTF": "lt-housing-finance-doctor-loan",
                                    "DOC-GODREJ": "sbi-doctor-loan",
                                    "DOC-CHOLA": "cholamandalam-doctor-loan",

                                    "HL-SBI": "sbi-home-loans",
                                    "HL-BOB": "pnb-home-loan",
                                    "HL-ICICI": "icici-home-loans",
                                    "HL-AXIS": "hdfc-home-loans",
                                    "HL-BAJAJ-HF": "bajaj-finance-home-loans",
                                    "HL-LTF": "lt-housing-finance-home-loan",
                                    "HL-TATA-HF": "hdfc-home-loans",
                                    "HL-ABFL-HF": "lt-housing-finance-home-loan",
                                    "HL-INDIABULLS": "hdfc-home-loans",
                                  };

                                  const slug = bankSlugMap[lender.id] || `${lender.name.toLowerCase().replace(/\s+/g, '-')}${suffix}`;
                                  window.location.href = `http://localhost:5173/${loanType}/${slug}`;
                                }}
                                variant="outline"
                                className="flex-1 gap-2 border-2 border-[#3f50b5] text-[#3f50b5] hover:bg-[#f0f4ff] hover:text-[#354497] transition-all duration-300 rounded-xl py-2 sm:py-2.5 text-sm font-semibold h-auto"
                              >
                                <span>View Details</span>
                                <ExternalLink className="h-4 w-4 shrink-0" />
                              </Button>
                              <Button
                                onClick={() => handleApply(lender)}
                                disabled={lender.status === "ineligible"}
                                className="flex-1 gap-2 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl py-2 sm:py-2.5 text-sm font-semibold h-auto"
                              >
                                <span>
                                  {stage === "A"
                                    ? "Apply"
                                    : "Proceed"}
                                </span>
                                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Desktop Chat Sidebar (visible when toggled) */}
            <div className={`hidden lg:flex lg:flex-col lg:h-[calc(100vh-24px)] lg:sticky lg:top-[6px] lg:self-start transition-all duration-500 ease-in-out overflow-hidden ${showMobileChat ? 'w-[350px] xl:w-[420px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10 pointer-events-none'}`}>
              <div className="w-[350px] xl:w-[420px] h-full flex flex-col pb-4">
                <br /> <br />
                <ChatAssistant
                  stage={stage}
                  customerInfo={customerInfo}
                  lenders={allLenders}
                  onLenderSelection={handleAiLenderSelection}
                  onSelectionStart={() => setIsSelecting(true)}
                  onSelectionEnd={() => setIsSelecting(false)}
                  onClose={() => setShowMobileChat(false)}
                />

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Chat Overlay */}
      {showMobileChat && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-black/50 backdrop-blur-sm transition-all duration-300">
          {/* Overlay header bar (mobile only) */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#3f50b5] text-white shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
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
          <div className="flex-1 min-h-0 overflow-hidden p-2.5 sm:p-3">
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
              onClose={() => setShowMobileChat(false)}
            />
          </div>
        </div>
      )}

      {/* Global Chat FAB */}
      {!showMobileChat && (
        <button
          onClick={() => setShowMobileChat(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 flex items-center justify-center gap-2 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] text-white px-4 py-3.5 sm:px-5 sm:py-4 rounded-full shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Open chat assistant"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Ask Dr. Finwise</span>
        </button>
      )}

      {/* Consent Modal */}
      <ConsentModal
        open={showConsentModal}
        onOpenChange={setShowConsentModal}
        onAccept={handleConsentAccept}
        onHardResults={handleHardResults}
        lenderName={selectedLender?.name || ""}
      />
    </>
  );
}