"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AlertCircle, Shield, FileCheck, CheckCircle, XCircle, Building, FileText, CreditCard, TrendingUp, TrendingDown, ChevronDown, ChevronUp, Loader2, Check, X, Zap } from "lucide-react"
import { useState, useRef } from "react"
import { toast } from "sonner"

interface ConsentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
  onHardResults?: (results: any) => void
  lenderName: string
}

interface DocumentFiles {
  aadhaar: File | null
  pan: File | null
  bankStatement: File | null
  cibilReport: File | null
}

interface EligibilityResult {
  eligible: boolean
  reason: string
  recommendations: string
}

interface FullApiResult {
  success: boolean
  eligibility: EligibilityResult & {
    lenders: any[]
    partial_lenders: any[]
    tl_fallback_lenders: any[]
    failed_lenders: any[]
  }
  extractedData: {
    kyc: any
    banking: any
    insights: {
      strengths: Array<{ category: string; message: string; priority: string }>
      improvements: Array<{ category: string; message: string; priority: string }>
      lenderFeedback: Array<{
        name: string
        status: string
        limit: number | null
        pros: string[]
        cons: string[]
        messages: string[]
      }>
      summary: {
        total_lenders_checked: number
        eligible_count: number
        partial_count: number
        failed_count: number
        highest_limit: number
      }
    }
  }
}

type ProcessingStepId = 'aadhaar' | 'pan' | 'bank_statement' | 'banking_analysis' | 'eligibility' | 'complete'
type ProcessingStatus = 'waiting' | 'processing' | 'complete' | 'cached' | 'error'

interface ProcessingStep {
  id: ProcessingStepId
  label: string
  status: ProcessingStatus
  message: string
}

const INITIAL_PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'aadhaar', label: 'Aadhaar Verification', status: 'waiting', message: 'Waiting...' },
  { id: 'pan', label: 'PAN Card Verification', status: 'waiting', message: 'Waiting...' },
  { id: 'bank_statement', label: 'Bank Statement Analysis', status: 'waiting', message: 'Waiting...' },
  { id: 'banking_analysis', label: 'Banking Metrics Extraction', status: 'waiting', message: 'Waiting...' },
  { id: 'eligibility', label: 'Eligibility Check', status: 'waiting', message: 'Waiting...' },
]

export function ConsentModal({ open, onOpenChange, onAccept, onHardResults, lenderName }: ConsentModalProps) {
  const [bureauConsent, setBureauConsent] = useState(false)
  const [termsConsent, setTermsConsent] = useState(false)
  const [step, setStep] = useState<'consent' | 'documents' | 'processing' | 'results'>('consent')

  // Document states
  const [documents, setDocuments] = useState<DocumentFiles>({
    aadhaar: null,
    pan: null,
    bankStatement: null,
    cibilReport: null
  })
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null)
  const [fullResult, setFullResult] = useState<FullApiResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const sessionIdRef = useRef<string>(`session-${Date.now()}`)
  const [expandedLender, setExpandedLender] = useState<string | null>(null)
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(INITIAL_PROCESSING_STEPS)
  const [processingError, setProcessingError] = useState<string | null>(null)

  const handleAccept = () => {
    if (bureauConsent && termsConsent) {
      setStep('documents')
    }
  }

  const handleFileChange = (field: keyof DocumentFiles, file: File | null) => {
    if (file) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error(`File size must be less than 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
      }
    }

    setDocuments(prev => ({
      ...prev,
      [field]: file
    }))
  }


  // Update a single processing step
  const updateStep = (stepId: ProcessingStepId, status: ProcessingStatus, message: string) => {
    setProcessingSteps(prev =>
      prev.map(s => s.id === stepId ? { ...s, status, message } : s)
    )
  }

  const handleSubmitDocuments = async () => {
    // Validate required fields
    if (!documents.aadhaar || !aadhaarNumber || !documents.pan || !panNumber || !documents.bankStatement) {
      toast.error("Please upload all required documents and fill in the details");
      return;
    }

    if (aadhaarNumber.length !== 12) {
      toast.error("Aadhaar number must be 12 digits");
      return;
    }

    if (panNumber.length !== 10) {
      toast.error("PAN number must be 10 characters");
      return;
    }

    try {
      setIsLoading(true)
      setProcessingSteps(INITIAL_PROCESSING_STEPS)
      setProcessingError(null)
      setStep('processing')

      const formData = new FormData();
      formData.append('aadhaar', documents.aadhaar);
      formData.append('pancard', documents.pan);
      formData.append('bankStatement', documents.bankStatement);
      formData.append('sessionId', sessionIdRef.current);

      if (documents.cibilReport) {
        formData.append('cibilReport', documents.cibilReport);
      }

      const customerInfoStr = localStorage.getItem('customerInfo')
      let customerIdStr = "";
      if (customerInfoStr) {
        formData.append('customerInfo', customerInfoStr)
        try {
          const cInfo = JSON.parse(customerInfoStr);
          if (cInfo && cInfo.id) {
            customerIdStr = cInfo.id;
          }
        } catch (e) { }
      } else {
        toast.error('Customer information not found')
        setIsLoading(false)
        setStep('documents')
        return
      }

      if (!customerIdStr) {
        toast.error("Customer ID missing from profile.");
        setIsLoading(false);
        setStep('documents');
        return;
      }

      // 1. Concurrently update KYC and upload documents
      const uploadTasks: Promise<any>[] = [];

      // Task A: Update KYC details (Aadhaar & PAN)
      uploadTasks.push(
        fetch(`/api/update-leads-info/${customerIdStr}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aadhaar_number: aadhaarNumber,
            pan_number: panNumber
          }),
        }).then(res => {
          if (!res.ok) throw new Error("Failed to update KYC data");
          return res.json();
        })
      );

      // Helper function for document upload
      const uploadDoc = async (file: File, type: string) => {
        const docFormData = new FormData();
        docFormData.append("document", file);
        docFormData.append("folder", `document/${file.name}`);
        docFormData.append("companyId", 101);

        const uploadResponse = await fetch("/api/upload-to-s3", {
          method: "POST",
          body: docFormData,
        });

        if (!uploadResponse.ok) throw new Error(`Failed to upload ${type}`);

        const uploadResult = await uploadResponse.json();
        const attachmentUrl = uploadResult?.data?.data || uploadResult?.data; // handle slight response variants

        if (attachmentUrl) {
          const createRecordRes = await fetch("/api/create-leads-info-document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              document_url: attachmentUrl,
              leads_info_id: customerIdStr,
              type: type,
              company_id: 101,
            }),
          });
          if (!createRecordRes.ok) throw new Error(`Failed to link ${type}`);
        }
      };

      // Task B, C, D: Upload Docs
      uploadTasks.push(uploadDoc(documents.aadhaar, "aadhar"));
      uploadTasks.push(uploadDoc(documents.pan, "pan card"));
      uploadTasks.push(uploadDoc(documents.bankStatement, "bank statement"));
      if (documents.cibilReport) {
        uploadTasks.push(uploadDoc(documents.cibilReport, "cibil report"));
      }

      // Wait for all uploads to complete
      try {
        await Promise.all(uploadTasks);
      } catch (err) {
        console.error("Error during concurrent document uploads/KYC sync:", err);
        // We continue with eligibility check even if documents fail, or we could stop here.
        // Continuing for now to not block the flow completely if S3 is down.
        toast.warning("Some documents failed to backup, but evaluating eligibility...");
      }

      const response = await fetch('/api/check-eligibility', {
        method: 'POST',
        body: formData,
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      // Read the NDJSON stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let finalResult: any = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line)

            if (event.type === 'progress') {
              updateStep(event.step, event.status, event.message)
            } else if (event.type === 'result') {
              finalResult = event.data
            } else if (event.type === 'error') {
              // Mark the failed step
              if (event.failedStep) {
                updateStep(event.failedStep, 'error', event.message)
              }
              setProcessingError(event.message)
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('Failed to parse stream event:', line, e)
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer)
          if (event.type === 'result') finalResult = event.data
          if (event.type === 'error') {
            if (event.failedStep) updateStep(event.failedStep, 'error', event.message)
            setProcessingError(event.message)
            setIsLoading(false)
            return
          }
        } catch (e) {
          console.error('Failed to parse final buffer:', e)
        }
      }

      if (finalResult) {
        setEligibilityResult(finalResult.eligibility)
        setFullResult(finalResult)
        setStep('results')
        setIsLoading(false)

        if (onHardResults) {
          onHardResults(finalResult)
        }
      } else {
        toast.error('No result received from server')
        setIsLoading(false)
        setStep('documents')
      }

    } catch (error) {
      toast.error("Failed to process documents")
      console.error('Upload error:', error)
      setIsLoading(false)
      setProcessingError('Connection failed. Please try again.')
    }
  };

  const handleResultsClose = () => {
    if (eligibilityResult?.eligible) {
      // User is eligible, call onAccept
      onAccept();
      toast.success("Application submitted successfully! Our team will reach out to you shortly.");
    }
    // Close modal and reset
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setBureauConsent(false)
    setTermsConsent(false)
    setStep('consent')
    setDocuments({
      aadhaar: null,
      pan: null,
      bankStatement: null,
      cibilReport: null
    })
    setAadhaarNumber('')
    setPanNumber('')
    setEligibilityResult(null)
    setFullResult(null)
    setIsLoading(false)
    sessionIdRef.current = `session-${Date.now()}`
    setExpandedLender(null)
    setProcessingSteps(INITIAL_PROCESSING_STEPS)
    setProcessingError(null)
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full sm:mx-auto sm:max-w-[500px] md:max-w-[550px] lg:max-w-[600px] max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ${step === 'results'
              ? eligibilityResult?.eligible
                ? 'bg-green-100'
                : 'bg-red-100'
              : step === 'processing'
                ? 'bg-amber-100'
                : 'bg-primary/10'
              }`}>
              {step === 'consent' ? (
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              ) : step === 'documents' ? (
                <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              ) : step === 'processing' ? (
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 animate-spin" />
              ) : eligibilityResult?.eligible ? (
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl">
                {step === 'consent'
                  ? 'Consent Required'
                  : step === 'documents'
                    ? 'Upload Documents'
                    : step === 'processing'
                      ? 'Verifying Documents'
                      : eligibilityResult?.eligible
                        ? 'Congratulations! You\'re Eligible'
                        : 'Application Status'}
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {step === 'consent'
                  ? 'Moving to Stage B: Final Eligibility Check'
                  : step === 'documents'
                    ? 'Please provide the required documents'
                    : step === 'processing'
                      ? 'Please wait while we process your application'
                      : eligibilityResult?.eligible
                        ? `You qualify for a loan with ${lenderName}`
                        : 'We\'ve reviewed your application'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 py-4 px-1">
          {step === 'consent' ? (
            <>
              {/* Info Alert */}
              <div className="flex gap-3 rounded-lg bg-primary/10 p-3 sm:p-4">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">What happens next?</p>
                  <p className="text-muted-foreground">
                    To provide final eligibility for <strong>{lenderName}</strong>, we need to:
                  </p>
                  <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
                    <li>Run a credit bureau check (may impact CIBIL score slightly)</li>
                    <li>Verify your documents and banking history</li>
                    <li>Get confirmed loan limits and interest rates</li>
                  </ul>
                </div>
              </div>

              {/* Consent Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="bureau-consent"
                    checked={bureauConsent}
                    onCheckedChange={(checked) => setBureauConsent(checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <Label htmlFor="bureau-consent" className="cursor-pointer font-medium leading-relaxed text-sm sm:text-base">
                      I consent to credit bureau check
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      This will be a hard inquiry and may temporarily affect your credit score by 1-5 points.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms-consent"
                    checked={termsConsent}
                    onCheckedChange={(checked) => setTermsConsent(checked as boolean)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <Label htmlFor="terms-consent" className="cursor-pointer font-medium leading-relaxed text-sm sm:text-base">
                      I agree to share my documents and information
                    </Label>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Your data will be securely shared with {lenderName} for verification purposes only.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : step === 'documents' ? (
            <>
              {/* Document Upload Form */}
              <div className="space-y-6">
                {/* Aadhaar Section */}
                <div className="space-y-3 p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">Aadhaar Card *</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar-file" className="text-sm">Upload Aadhaar (PDF or Image)</Label>
                    <Input
                      id="aadhaar-file"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange('aadhaar', e.target.files?.[0] || null)}
                      className="cursor-pointer"
                      disabled={isLoading}
                    />
                    {documents.aadhaar && (
                      <p className="text-xs text-green-600">✓ {documents.aadhaar.name} ({(documents.aadhaar.size / (1024 * 1024)).toFixed(2)}MB)</p>
                    )}
                    <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar-number" className="text-sm">Aadhaar Number</Label>
                    <Input
                      id="aadhaar-number"
                      type="text"
                      placeholder="XXXX XXXX XXXX"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={12}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* PAN Section */}
                <div className="space-y-3 p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">PAN Card *</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan-file" className="text-sm">Upload PAN (PDF or Image)</Label>
                    <Input
                      id="pan-file"
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => handleFileChange('pan', e.target.files?.[0] || null)}
                      className="cursor-pointer"
                      disabled={isLoading}
                    />
                    {documents.pan && (
                      <p className="text-xs text-green-600">✓ {documents.pan.name} ({(documents.pan.size / (1024 * 1024)).toFixed(2)}MB)</p>
                    )}
                    <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan-number" className="text-sm">PAN Number</Label>
                    <Input
                      id="pan-number"
                      type="text"
                      placeholder="ABCDE1234F"
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      maxLength={10}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Bank Statement Section */}
                <div className="space-y-3 p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">Bank Statement *</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank-statement" className="text-sm">Last 6 Months Bank Statement (PDF)</Label>
                    <Input
                      id="bank-statement"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange('bankStatement', e.target.files?.[0] || null)}
                      className="cursor-pointer"
                      disabled={isLoading}
                    />
                    {documents.bankStatement && (
                      <p className="text-xs text-green-600">✓ {documents.bankStatement.name} ({(documents.bankStatement.size / (1024 * 1024)).toFixed(2)}MB)</p>
                    )}
                    <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
                  </div>
                </div>

                {/* CIBIL Report Section */}
                {/* <div className="space-y-3 p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">CIBIL Report (Optional)</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cibil-report" className="text-sm">Upload CIBIL Report (PDF)</Label>
                    <Input
                      id="cibil-report"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange('cibilReport', e.target.files?.[0] || null)}
                      className="cursor-pointer"
                      disabled={isLoading}
                    />
                    {documents.cibilReport && (
                      <p className="text-xs text-green-600">✓ {documents.cibilReport.name} ({(documents.cibilReport.size / (1024 * 1024)).toFixed(2)}MB)</p>
                    )}
                    <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
                    <div className="flex gap-2 rounded-lg bg-blue-50 p-3 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                      <p className="text-blue-800">
                        If you don't have a CIBIL report, we will fetch it for you with your consent.
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            </>
          ) : step === 'processing' ? (
            <>
              {/* Processing Stepper UI */}
              <div className="space-y-3">
                <div className="rounded-lg border bg-card p-4">
                  <div className="space-y-4">
                    {processingSteps.map((ps, idx) => {
                      const isActive = ps.status === 'processing'
                      const isDone = ps.status === 'complete' || ps.status === 'cached'
                      const isError = ps.status === 'error'
                      const isWaiting = ps.status === 'waiting'

                      return (
                        <div key={ps.id} className="flex items-start gap-3">
                          {/* Step connector line */}
                          <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isDone
                              ? 'bg-green-100 text-green-600'
                              : isActive
                                ? 'bg-amber-100 text-amber-600'
                                : isError
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                              {isDone ? (
                                <Check className="h-4 w-4" />
                              ) : isActive ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isError ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <span className="text-xs font-semibold">{idx + 1}</span>
                              )}
                            </div>
                            {idx < processingSteps.length - 1 && (
                              <div className={`w-0.5 h-4 mt-1 transition-all duration-300 ${isDone ? 'bg-green-300' : 'bg-muted'
                                }`} />
                            )}
                          </div>

                          {/* Step content */}
                          <div className="flex-1 min-w-0 pt-1">
                            <p className={`text-sm font-medium transition-all duration-300 ${isDone
                              ? 'text-green-700'
                              : isActive
                                ? 'text-foreground'
                                : isError
                                  ? 'text-red-700'
                                  : 'text-muted-foreground'
                              }`}>
                              {ps.label}
                              {ps.status === 'cached' && (
                                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                                  <Zap className="inline h-3 w-3 mr-0.5" />cached
                                </span>
                              )}
                            </p>
                            {(isActive || isDone || isError || ps.status === 'cached') && (
                              <p className={`text-xs mt-0.5 ${isDone ? 'text-green-600' : isError ? 'text-red-600' : 'text-muted-foreground'
                                }`}>
                                {ps.message}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Error Message */}
                {processingError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">{processingError}</p>
                        <p className="text-xs text-red-600 mt-1">Completed steps are cached — only failed steps will be retried.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Results Display */}
              {eligibilityResult && (
                <div className="space-y-4">
                  {/* Status Card */}
                  <div className={`rounded-lg border-2 p-4 sm:p-6 ${eligibilityResult.eligible
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                    }`}>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full ${eligibilityResult.eligible ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                        {eligibilityResult.eligible ? (
                          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h3 className={`text-base sm:text-lg font-semibold ${eligibilityResult.eligible ? 'text-green-900' : 'text-red-900'
                          }`}>
                          {eligibilityResult.eligible ? 'Application Approved' : 'Application Not Approved'}
                        </h3>
                        <p className={`text-sm leading-relaxed ${eligibilityResult.eligible ? 'text-green-800' : 'text-red-800'
                          }`}>
                          {eligibilityResult.reason}
                        </p>
                        {fullResult?.extractedData?.insights?.summary && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {fullResult.extractedData.insights.summary.total_lenders_checked} lenders checked •{' '}
                            {fullResult.extractedData.insights.summary.eligible_count} approved •{' '}
                            {fullResult.extractedData.insights.summary.partial_count} partial
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Per-Lender Feedback */}
                  {fullResult?.extractedData?.insights?.lenderFeedback && fullResult.extractedData.insights.lenderFeedback.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Lender-wise Breakdown</p>
                      {fullResult.extractedData.insights.lenderFeedback.map((lf, idx) => {
                        const isExpanded = expandedLender === `${lf.name}-${idx}`
                        const statusColor = lf.status === 'PASS' || lf.status === 'eligible'
                          ? 'text-green-600 bg-green-50 border-green-200'
                          : lf.status === 'PARTIAL' || lf.status === 'partial'
                            ? 'text-amber-600 bg-amber-50 border-amber-200'
                            : 'text-red-600 bg-red-50 border-red-200'
                        const statusLabel = lf.status === 'PASS' || lf.status === 'eligible'
                          ? 'Approved'
                          : lf.status === 'PARTIAL' || lf.status === 'partial'
                            ? 'Partial'
                            : 'Not Approved'

                        return (
                          <div key={`${lf.name}-${idx}`} className={`rounded-lg border p-3 ${statusColor}`}>
                            <button
                              className="w-full flex items-center justify-between gap-2 text-left"
                              onClick={() => setExpandedLender(isExpanded ? null : `${lf.name}-${idx}`)}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Building className="h-4 w-4 shrink-0" />
                                <span className="font-medium text-sm truncate">{lf.name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {lf.limit && lf.limit > 0 && (
                                  <span className="text-xs font-semibold">
                                    ₹{lf.limit.toLocaleString('en-IN')}
                                  </span>
                                )}
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="mt-3 space-y-2 border-t pt-2">
                                {lf.pros?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-green-700 mb-1">✓ Strengths</p>
                                    <ul className="space-y-1">
                                      {lf.pros.map((p, i) => (
                                        <li key={i} className="text-xs text-green-800 pl-3">• {p}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {lf.cons?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-red-700 mb-1">✗ Areas to Improve</p>
                                    <ul className="space-y-1">
                                      {lf.cons.map((c, i) => (
                                        <li key={i} className="text-xs text-red-800 pl-3">• {c}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {lf.messages?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-blue-700 mb-1">ℹ Details</p>
                                    <ul className="space-y-1">
                                      {lf.messages.map((m, i) => (
                                        <li key={i} className="text-xs text-blue-800 pl-3">• {m}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Strengths & Improvements */}
                  {fullResult?.extractedData?.insights && (
                    <div className="space-y-3">
                      {/* Strengths */}
                      {fullResult.extractedData.insights.strengths?.length > 0 && (
                        <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-semibold text-green-900">Your Strengths</p>
                          </div>
                          <ul className="space-y-1">
                            {fullResult.extractedData.insights.strengths.slice(0, 4).map((s, i) => (
                              <li key={i} className="text-xs text-green-800 pl-2">✓ {s.message}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {fullResult.extractedData.insights.improvements?.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="h-4 w-4 text-amber-600" />
                            <p className="text-sm font-semibold text-amber-900">How to Improve</p>
                          </div>
                          <ul className="space-y-1">
                            {fullResult.extractedData.insights.improvements.map((imp, i) => (
                              <li key={i} className="text-xs text-amber-800 pl-2">
                                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${imp.priority === 'high' ? 'bg-red-500' : imp.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-400'}`} />
                                {imp.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Info for Approved */}
                  {eligibilityResult.eligible && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <p className="text-sm text-muted-foreground">
                        Your application has been submitted to <strong>{lenderName}</strong>.
                        You'll receive detailed loan offers including interest rates and repayment terms shortly.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="shrink-0 flex flex-col sm:flex-row gap-2 pt-4 border-t">
          {step === 'results' ? (
            <Button
              onClick={handleResultsClose}
              className="w-full"
            >
              {eligibilityResult?.eligible ? 'Continue to Offers' : 'Close'}
            </Button>
          ) : step === 'processing' ? (
            <>
              {processingError ? (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={() => { setStep('documents'); setProcessingError(null) }}
                    className="flex-1"
                  >
                    Go Back
                  </Button>
                  <Button
                    onClick={handleSubmitDocuments}
                    className="flex-1"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center w-full">
                  <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                  Please do not close this window
                </p>
              )}
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto order-2 sm:order-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              {step === 'consent' ? (
                <Button
                  onClick={handleAccept}
                  disabled={!bureauConsent || !termsConsent}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  Accept & Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitDocuments}
                  className="w-full sm:w-auto order-1 sm:order-2"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Submit Documents'}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}