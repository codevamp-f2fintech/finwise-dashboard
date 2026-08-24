"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2, ArrowLeft, UserCircle2, ClipboardList, CheckCircle2,
  Phone, Mail, MapPin, Briefcase, GraduationCap, Clock, Wallet,
  CreditCard, Banknote, Shapes, Globe, Building2, Shield
} from "lucide-react"

export interface CustomerInfo {
  name: string
  phone: string
  email: string
  persona: "Doctor" | "CA"
  degree: string
  experience_years: string
  employment_type: "Salaried" | "SelfEmployed"
  cibil_band: "<680" | "680-699" | "700-724" | "725-749" | "750+"
  existing_emi: string
  net_monthly_income: string
  product: "OD" | "TL"
  requested_limit: string
  tenure_months: "36" | "48" | "60"
  city?: string
  pincode?: string
  foreign_degree?: boolean
  college_on_list?: boolean
}

interface OnboardingFormProps {
  onSubmit: (data: CustomerInfo) => Promise<void> | void
}

const DOCTOR_DEGREES = [
  { value: "MBBS", label: "MBBS" },
  { value: "MD", label: "MD" },
  { value: "MS", label: "MS" },
  { value: "DM", label: "DM" },
  { value: "MCh", label: "MCh" },
  { value: "DNB", label: "DNB" },
  { value: "BDS", label: "BDS" },
  { value: "MDS", label: "MDS" },
  { value: "BHMS", label: "BHMS" },
  { value: "BAMS", label: "BAMS" },
]

const CA_DEGREES = [
  { value: "CA", label: "CA" },
  { value: "CS", label: "CS" },
  { value: "CA_CPA", label: "CA + CPA" },
  { value: "CA_CS", label: "CA + CS" },
  { value: "CMA", label: "CMA" },
]

const CIBIL_BANDS = [
  { value: "750+", label: "750+" },
  { value: "725-749", label: "725-749" },
  { value: "700-724", label: "700-724" },
  { value: "680-699", label: "680-699" },
  { value: "<680", label: "<680" },
]

// Reusable component for stacked label + icon input
const FloatingInput = ({ label, icon: Icon, error, ...props }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[11px] font-semibold text-gray-500 pl-1 tracking-wide">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className={`h-4 w-4 ${error ? 'text-red-400' : 'text-[#3b4bdf]/60'}`} />
      </div>
      <Input
        className={`w-full pl-10 h-11 border rounded-lg text-sm font-medium text-gray-800 placeholder:text-gray-300 transition-all shadow-none
          ${error
            ? 'border-red-300 focus:border-red-400 bg-red-50/30'
            : 'border-gray-200 hover:border-[#3b4bdf]/50 focus:border-[#3b4bdf] bg-white'}`}
        {...props}
      />
    </div>
    {error && <p className="text-[10px] text-red-500 pl-1">{error}</p>}
  </div>
)

// Reusable component for stacked label + icon select
const FloatingSelect = ({ label, icon: Icon, value, onValueChange, options, error, placeholder }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[11px] font-semibold text-gray-500 pl-1 tracking-wide">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <Icon className={`h-4 w-4 ${error ? 'text-red-400' : 'text-[#3b4bdf]/60'}`} />
      </div>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={`w-full pl-10 h-11 border rounded-lg text-sm font-medium text-gray-800 transition-all shadow-none
          ${error
            ? 'border-red-300 bg-red-50/30'
            : 'border-gray-200 hover:border-[#3b4bdf]/50 focus:border-[#3b4bdf] bg-white'}`}>
          <SelectValue placeholder={placeholder ?? 'Select...'} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt: any) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    {error && <p className="text-[10px] text-red-500 pl-1">{error}</p>}
  </div>
)

export function OnboardingForm({ onSubmit }: OnboardingFormProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [formData, setFormData] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    persona: "Doctor",
    degree: "",
    experience_years: "",
    employment_type: "SelfEmployed",
    cibil_band: "750+",
    existing_emi: "0",
    net_monthly_income: "",
    product: "OD",
    requested_limit: "",
    tenure_months: "60",
    city: "",
    pincode: "",
    foreign_degree: false,
    college_on_list: true,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [returnUrl, setReturnUrl] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setReturnUrl(params.get("returnUrl"))
  }, [])

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {}
    if (!formData.name.trim()) newErrors.name = "Required"
    if (!formData.phone.trim()) newErrors.phone = "Required"
    if (!formData.email.trim()) newErrors.email = "Required"
    if (!formData.city?.trim()) newErrors.city = "Required"
    if (!formData.pincode?.trim()) newErrors.pincode = "Required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }
    setErrors({})
    return true
  }

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {}
    if (!formData.degree) newErrors.degree = "Required"
    if (!formData.experience_years.trim()) newErrors.experience_years = "Required"
    if (!formData.net_monthly_income.trim()) newErrors.net_monthly_income = "Required"
    if (!formData.requested_limit.trim()) newErrors.requested_limit = "Required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Scroll to top of the form so the user sees error highlights
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return false
    }
    setErrors({})
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return

    setIsLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  const updateField = (field: keyof CustomerInfo, value: string | boolean) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === "persona") updated.degree = ""
      return updated
    })
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const getDegreeOptions = () => formData.persona === "Doctor" ? DOCTOR_DEGREES : CA_DEGREES

  return (
    <div className="w-full flex-1 bg-[#f8f9fa] flex flex-col relative pt-4 sm:pt-6 lg:pt-8 pb-14 sm:pb-20 lg:pb-28 px-3 sm:px-6 lg:px-8 items-center justify-start">
      {returnUrl && (
        <Button
          variant="ghost"
          className="absolute top-2 left-2 sm:top-4 sm:left-4 z-50 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900 bg-white/90 hover:bg-white rounded-full transition-all shadow-sm px-3 py-1.5 sm:px-4 sm:py-2"
          onClick={() => window.location.href = returnUrl}
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Back to Options</span>
          <span className="xs:hidden">Back</span>
        </Button>
      )}

      <div className="max-w-[1450px] w-full bg-white rounded-2xl sm:rounded-[24px] shadow-sm border border-gray-200 flex flex-col lg:flex-row min-h-0 h-auto">

        {/* Left Column: Form Area */}
        <div className="flex-1 flex flex-col pt-3 sm:pt-6 pb-6 px-3 sm:px-6 lg:px-8 xl:px-10">

          {/* Header Banner - Rounded floating style */}
          <div className="bg-[#3b4bdf] rounded-xl px-4 sm:px-8 py-3.5 sm:py-4 text-white shadow-sm mx-1 sm:mx-2 mt-1 sm:mt-2 mb-3 sm:mb-5">
            <h1 className="text-lg sm:text-xl font-bold tracking-wide text-center">Loan Eligibility Check</h1>
          </div>

          {/* Mobile Step Indicator (visible on iPhone 12 Pro & mobile / tablet, hidden on desktop where sidebar handles it) */}
          <div className="lg:hidden mx-1 sm:mx-2 mb-4">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
              <span className="text-[#3b4bdf] flex items-center gap-1.5 font-bold">
                <span className="w-5 h-5 rounded-full bg-[#3b4bdf] text-white flex items-center justify-center text-[11px] font-bold">
                  {step}
                </span>
                {step === 1 ? "Step 1 of 2: Personal Details" : "Step 2 of 2: Loan Information"}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3b4bdf] transition-all duration-300 rounded-full"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>

          <div className="px-1 sm:px-2 lg:px-4 flex-1 flex flex-col">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-[#3b4bdf] mb-1">
                {step === 1 ? "Personal Information" : "Loan Information"}
              </h2>
              <p className="text-gray-500 text-xs sm:text-[13px]">
                {step === 1
                  ? "Please provide your basic details to help us determine loan eligibility."
                  : "Provide details about your income, expenses, and specific loan needs."}
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="flex-1 flex flex-col">
              {step === 1 && (
                <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500 space-y-3">

                  {/* Identity Card */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-[#3b4bdf]/10 flex items-center justify-center">
                        <UserCircle2 className="w-3.5 h-3.5 text-[#3b4bdf]" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#3b4bdf]">
                        Identity
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-y-5">
                      <FloatingInput
                        label="Full Name"
                        icon={UserCircle2}
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e: any) => updateField("name", e.target.value)}
                        error={errors.name}
                      />
                    </div>
                  </div>

                  {/* Contact Details Card */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-[#3b4bdf]/10 flex items-center justify-center">
                        <Phone className="w-3.5 h-3.5 text-[#3b4bdf]" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#3b4bdf]">
                        Contact Details
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                      <FloatingInput
                        label="Contact Number"
                        icon={Phone}
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e: any) => updateField("phone", e.target.value)}
                        error={errors.phone}
                      />
                      <FloatingInput
                        label="Email Address"
                        icon={Mail}
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e: any) => updateField("email", e.target.value)}
                        error={errors.email}
                      />
                    </div>
                  </div>

                  {/* Location Card */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-[#3b4bdf]/10 flex items-center justify-center">
                        <MapPin className="w-3.5 h-3.5 text-[#3b4bdf]" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#3b4bdf]">
                        Location
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                      <FloatingInput
                        label="City"
                        icon={MapPin}
                        placeholder="e.g. Mumbai"
                        value={formData.city || ""}
                        onChange={(e: any) => updateField("city", e.target.value)}
                        error={errors.city}
                      />
                      <FloatingInput
                        label="Pincode"
                        icon={MapPin}
                        placeholder="e.g. 400001"
                        value={formData.pincode || ""}
                        onChange={(e: any) => updateField("pincode", e.target.value)}
                        error={errors.pincode}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center pb-6">
                    <Button
                      onClick={handleNextStep}
                      type="button"
                      className="w-full sm:w-auto px-10 h-12 bg-[#3b4bdf] hover:bg-[#2a38b4] text-white rounded-xl shadow-md transition-all font-semibold text-base"
                    >
                      Continue to Loan Details
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 space-y-3">

                  {/* Professional Profile Card */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-[#3b4bdf]/10 flex items-center justify-center">
                        <Briefcase className="w-3.5 h-3.5 text-[#3b4bdf]" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#3b4bdf]">Professional Profile</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                      <FloatingSelect
                        label="Profession"
                        icon={Briefcase}
                        value={formData.persona}
                        onValueChange={(v: any) => updateField("persona", v)}
                        options={[
                          { value: "Doctor", label: "Doctor" },
                          { value: "CA", label: "Chartered Accountant" }
                        ]}
                      />
                      <FloatingSelect
                        label="Qualification"
                        icon={GraduationCap}
                        value={formData.degree}
                        onValueChange={(v: any) => updateField("degree", v)}
                        options={getDegreeOptions()}
                        error={errors.degree}
                        placeholder="Select qualification"
                      />
                      <FloatingSelect
                        label="Employment Type"
                        icon={Briefcase}
                        value={formData.employment_type}
                        onValueChange={(v: any) => updateField("employment_type", v)}
                        options={[
                          { value: "SelfEmployed", label: "Own Practice" },
                          { value: "Salaried", label: "Employed" }
                        ]}
                      />
                      <FloatingInput
                        label="Experience (Years)"
                        icon={Clock}
                        type="number"
                        min="0"
                        placeholder="e.g. 5"
                        value={formData.experience_years}
                        onChange={(e: any) => updateField("experience_years", e.target.value)}
                        error={errors.experience_years}
                      />
                      <FloatingSelect
                        label="Foreign Degree?"
                        icon={Globe}
                        value={formData.foreign_degree ? "yes" : "no"}
                        onValueChange={(v: any) => updateField("foreign_degree", v === "yes")}
                        options={[
                          { value: "no", label: "No (Indian)" },
                          { value: "yes", label: "Yes (Foreign)" }
                        ]}
                      />
                      <FloatingSelect
                        label="College Approved?"
                        icon={Building2}
                        value={formData.college_on_list === false ? "no" : "yes"}
                        onValueChange={(v: any) => updateField("college_on_list", v === "yes")}
                        options={[
                          { value: "yes", label: "Yes" },
                          { value: "no", label: "No" }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Financial Details Card */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-[#3b4bdf]/10 flex items-center justify-center">
                        <Wallet className="w-3.5 h-3.5 text-[#3b4bdf]" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#3b4bdf]">Financial Details</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                      <FloatingInput
                        label="Monthly Income (₹)"
                        icon={Wallet}
                        type="number"
                        placeholder="e.g. 300000"
                        value={formData.net_monthly_income}
                        onChange={(e: any) => updateField("net_monthly_income", e.target.value)}
                        error={errors.net_monthly_income}
                      />
                      <FloatingInput
                        label="Existing EMIs (₹)"
                        icon={CreditCard}
                        type="number"
                        placeholder="0 if none"
                        value={formData.existing_emi}
                        onChange={(e: any) => updateField("existing_emi", e.target.value)}
                      />
                      <FloatingSelect
                        label="CIBIL Score"
                        icon={CheckCircle2}
                        value={formData.cibil_band}
                        onValueChange={(v: any) => updateField("cibil_band", v)}
                        options={CIBIL_BANDS}
                      />
                    </div>
                  </div>

                  {/* Loan Preferences Card */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-[#3b4bdf]/10 flex items-center justify-center">
                        <Banknote className="w-3.5 h-3.5 text-[#3b4bdf]" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#3b4bdf]">Loan Preferences</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                      <FloatingSelect
                        label="Loan Category"
                        icon={Shapes}
                        value={formData.product}
                        onValueChange={(v: any) => updateField("product", v)}
                        options={[
                          { value: "OD", label: "Overdraft (OD)" },
                          { value: "TL", label: "Term Loan (TL)" }
                        ]}
                      />
                      <FloatingInput
                        label="Loan Amount Needed (₹)"
                        icon={Banknote}
                        type="number"
                        placeholder="e.g. 5000000"
                        value={formData.requested_limit}
                        onChange={(e: any) => updateField("requested_limit", e.target.value)}
                        error={errors.requested_limit}
                      />
                      <FloatingSelect
                        label="Tenure"
                        icon={Clock}
                        value={formData.tenure_months}
                        onValueChange={(v: any) => updateField("tenure_months", v)}
                        options={[
                          { value: "36", label: "3 Years" },
                          { value: "48", label: "4 Years" },
                          { value: "60", label: "5 Years" }
                        ]}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="w-full sm:w-auto h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 h-12 bg-[#3b4bdf] hover:bg-[#2a38b4] text-white rounded-xl shadow-md transition-all font-semibold text-base disabled:opacity-70"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Checking...
                        </>
                      ) : (
                        "Check Eligibility"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Progress Tracker - visible on desktop split screen, hidden on mobile/tablet */}
        <div className="hidden lg:flex lg:flex-col lg:w-72 xl:w-80 2xl:w-96 bg-white border-l border-gray-100 p-6 lg:p-7 xl:p-9 shrink-0 justify-between lg:sticky lg:top-24 lg:self-start rounded-r-2xl sm:rounded-r-[24px]">
          <div>
            <h3 className="text-[#3b4bdf] font-bold text-lg mb-2 sm:mb-3">Your Loan Journey</h3>
            <p className="text-gray-600 text-[12px] leading-relaxed mb-6 sm:mb-8">
              Complete all steps below to discover loan offers tailored to your needs. Each step brings you closer to finding the perfect financing solution.
            </p>

            <div className="space-y-4 sm:space-y-5 relative ml-1 sm:ml-2">
              {/* Connecting Line */}
              <div className="absolute left-6 top-10 bottom-10 w-px bg-gray-200" />

              {/* Step 1 */}
              <div className={`relative flex gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-xl transition-all ${step === 1 ? 'bg-[#ebf0ff] border border-[#d1ddff] z-10' : 'z-10'}`}>
                <div className="shrink-0 relative">
                  {step > 1 ? (
                    <CheckCircle2 className="w-5 h-5 text-[#3b4bdf] bg-white rounded-full relative z-10" />
                  ) : (
                    <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center relative z-10 ${step === 1 ? 'bg-[#3b4bdf] text-white' : 'border-2 border-gray-300 bg-white'}`}>
                      {step === 1 && <UserCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`font-bold text-[13px] ${step === 1 ? 'text-[#3b4bdf]' : 'text-gray-800'}`}>Basic Details</h4>
                  {step === 1 && (
                    <p className="text-gray-600 text-[11px] mt-1.5 leading-relaxed pr-1 sm:pr-2">
                      Enter your personal information and loan requirements.
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className={`relative flex gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-xl transition-all ${step === 2 ? 'bg-[#ebf0ff] border border-[#d1ddff] z-10' : 'z-10'}`}>
                <div className="shrink-0 relative">
                  {step > 2 ? (
                    <CheckCircle2 className="w-5 h-5 text-[#3b4bdf] bg-white rounded-full relative z-10" />
                  ) : (
                    <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center relative z-10 ${step === 2 ? 'bg-[#3b4bdf] text-white' : 'border-2 border-gray-300 bg-white'}`}>
                      {step === 2 && <ClipboardList className="w-3.5 h-3.5" />}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`font-bold text-[13px] ${step === 2 ? 'text-[#3b4bdf]' : 'text-gray-800'}`}>Loan Information</h4>
                  {step === 2 && (
                    <p className="text-gray-600 text-[11px] mt-1.5 leading-relaxed pr-1 sm:pr-2">
                      Provide details about your income, expenses, and specific loan needs.
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex gap-3.5 sm:gap-4 p-3.5 sm:p-4 rounded-xl transition-all opacity-70 z-10">
                <div className="shrink-0 relative">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white relative z-10" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-800">Available Offers</h4>
                  <p className="text-gray-500 text-[11px] mt-1.5 leading-relaxed pr-1 sm:pr-2">
                    View and select from available loan offers tailored to your profile.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security / Help Card at the bottom */}
          <div className="mt-8 pt-5 border-t border-gray-100">
            <div className="bg-[#f4f7ff] rounded-xl p-3.5 flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#3b4bdf] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-800">100% Safe & Secure</p>
                <p className="text-[11px] text-gray-500">256-bit bank-grade encryption</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}