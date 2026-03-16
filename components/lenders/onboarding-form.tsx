"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Stethoscope, Loader2 } from "lucide-react"

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

export function OnboardingForm({ onSubmit }: OnboardingFormProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {}

    if (!formData.name.trim()) newErrors.name = "Required"
    if (!formData.phone.trim()) newErrors.phone = "Required"
    if (!formData.email.trim()) newErrors.email = "Required"
    if (!formData.degree) newErrors.degree = "Required"
    if (!formData.experience_years.trim()) newErrors.experience_years = "Required"
    if (!formData.net_monthly_income.trim()) newErrors.net_monthly_income = "Required"
    if (!formData.requested_limit.trim()) newErrors.requested_limit = "Required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
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

  const fieldStyle = "h-10 bg-white border-gray-300 focus:border-[#3f50b5] focus:ring-[#3f50b5] rounded-md"
  const errorStyle = "border-red-400"
  const labelStyle = "text-sm font-medium text-gray-700 mb-1.5 block"

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4d5eb] to-[#e8eff9] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
        {/* Header */}
        <CardHeader className="text-center pb-4 pt-6">
          <div className="mx-auto w-14 h-14 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] rounded-xl flex items-center justify-center mb-3 shadow-lg">
            <Stethoscope className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Loan Eligibility Checker
          </CardTitle>
          <CardDescription className="text-gray-500">
            For Doctors & Chartered Accountants
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-8 pb-6 pt-2">
          <form onSubmit={handleSubmit}>
            {/* Row 1: Name, Phone, Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className={labelStyle}>Full Name</Label>
                <Input
                  placeholder="Dr. / CA Name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={`${fieldStyle} ${errors.name ? errorStyle : ""}`}
                />
              </div>
              <div>
                <Label className={labelStyle}>Phone Number</Label>
                <Input
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={`${fieldStyle} ${errors.phone ? errorStyle : ""}`}
                />
              </div>
              <div>
                <Label className={labelStyle}>Email Address</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`${fieldStyle} ${errors.email ? errorStyle : ""}`}
                />
              </div>
            </div>

            {/* Row 2: Profession, Qualification, Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className={labelStyle}>Profession</Label>
                <Select value={formData.persona} onValueChange={(v) => updateField("persona", v)}>
                  <SelectTrigger className={`${fieldStyle} w-full`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Doctor">🩺 Doctor</SelectItem>
                    <SelectItem value="CA">📊 CA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}>Qualification</Label>
                <Select value={formData.degree} onValueChange={(v) => updateField("degree", v)}>
                  <SelectTrigger className={`${fieldStyle} w-full ${errors.degree ? errorStyle : ""}`}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {getDegreeOptions().map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}>Experience (Yrs)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={formData.experience_years}
                  onChange={(e) => updateField("experience_years", e.target.value)}
                  className={`${fieldStyle} ${errors.experience_years ? errorStyle : ""}`}
                />
              </div>
            </div>

            {/* Row 3: Employment, CIBIL, Income */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className={labelStyle}>Employment</Label>
                <Select value={formData.employment_type} onValueChange={(v) => updateField("employment_type", v)}>
                  <SelectTrigger className={`${fieldStyle} w-full`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SelfEmployed">Own Practice</SelectItem>
                    <SelectItem value="Salaried">Employed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}>CIBIL Score</Label>
                <Select value={formData.cibil_band} onValueChange={(v) => updateField("cibil_band", v)}>
                  <SelectTrigger className={`${fieldStyle} w-full`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CIBIL_BANDS.map((band) => (
                      <SelectItem key={band.value} value={band.value}>{band.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}>Monthly Income (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 300000"
                  value={formData.net_monthly_income}
                  onChange={(e) => updateField("net_monthly_income", e.target.value)}
                  className={`${fieldStyle} ${errors.net_monthly_income ? errorStyle : ""}`}
                />
              </div>
            </div>

            {/* Row 4: Existing EMI, Loan Type, Loan Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className={labelStyle}>Existing EMIs (₹)</Label>
                <Input
                  type="number"
                  placeholder="0 if none"
                  value={formData.existing_emi}
                  onChange={(e) => updateField("existing_emi", e.target.value)}
                  className={fieldStyle}
                />
              </div>
              <div>
                <Label className={labelStyle}>Loan Type</Label>
                <Select value={formData.product} onValueChange={(v) => updateField("product", v)}>
                  <SelectTrigger className={`${fieldStyle} w-full`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OD">Overdraft (OD)</SelectItem>
                    <SelectItem value="TL">Term Loan (TL)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}>Loan Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 5000000"
                  value={formData.requested_limit}
                  onChange={(e) => updateField("requested_limit", e.target.value)}
                  className={`${fieldStyle} ${errors.requested_limit ? errorStyle : ""}`}
                />
              </div>
            </div>

            {/* Row 5: Tenure, City, Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className={labelStyle}>Tenure</Label>
                <Select value={formData.tenure_months} onValueChange={(v) => updateField("tenure_months", v)}>
                  <SelectTrigger className={`${fieldStyle} w-full`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="36">3 Years</SelectItem>
                    <SelectItem value="48">4 Years</SelectItem>
                    <SelectItem value="60">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}>City</Label>
                <Input
                  placeholder="e.g. Mumbai"
                  value={formData.city || ""}
                  onChange={(e) => updateField("city", e.target.value)}
                  className={fieldStyle}
                />
              </div>
              <div>
                <Label className={labelStyle}>Pincode</Label>
                <Input
                  placeholder="e.g. 400001"
                  value={formData.pincode || ""}
                  onChange={(e) => updateField("pincode", e.target.value)}
                  className={fieldStyle}
                />
              </div>
            </div>

            {/* Row 6: Foreign Degree, College */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
              <div>
                <Label className={labelStyle}>Foreign Degree?</Label>
                <Select
                  value={formData.foreign_degree ? "yes" : "no"}
                  onValueChange={(v) => updateField("foreign_degree", v === "yes")}
                >
                  <SelectTrigger className={`${fieldStyle} w-full`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No (Indian)</SelectItem>
                    <SelectItem value="yes">Yes (Foreign)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={labelStyle}>College Approved?</Label>
                <Select
                  value={formData.college_on_list === false ? "no" : "yes"}
                  onValueChange={(v) => updateField("college_on_list", v === "yes")}
                >
                  <SelectTrigger className={`${fieldStyle} w-full`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button Row */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-80 h-11 gap-2 font-semibold bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5] text-white shadow-lg hover:shadow-xl transition-all rounded-lg disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Check Eligibility
                    <TrendingUp className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-3">
              Instant check • No documents • 6+ lenders compared
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}