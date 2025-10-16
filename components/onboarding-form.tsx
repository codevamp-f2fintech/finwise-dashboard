"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Briefcase, IndianRupee, CreditCard, TrendingUp } from "lucide-react"

export interface CustomerInfo {
  name: string
  employmentType: string
  income: string
  loanAmount: string
  existingObligations: string
}

interface OnboardingFormProps {
  onSubmit: (data: CustomerInfo) => void
}

export function OnboardingForm({ onSubmit }: OnboardingFormProps) {
  const [formData, setFormData] = useState<CustomerInfo>({
    name: "",
    employmentType: "",
    income: "",
    loanAmount: "",
    existingObligations: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.employmentType) newErrors.employmentType = "Employment type is required"
    if (!formData.income.trim()) newErrors.income = "Income is required"
    if (!formData.loanAmount.trim()) newErrors.loanAmount = "Loan amount is required"
    if (!formData.existingObligations.trim()) newErrors.existingObligations = "This field is required (enter 0 if none)"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const updateField = (field: keyof CustomerInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="glass w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-balance">Welcome to Dr. Finwise</CardTitle>
          <CardDescription className="text-base text-pretty">
            Let's find the smartest loan options tailored for you. Share a few details to get started.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Employment Type */}
            <div className="space-y-2">
              <Label htmlFor="employmentType" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                Employment Type
              </Label>
              <Select value={formData.employmentType} onValueChange={(value) => updateField("employmentType", value)}>
                <SelectTrigger id="employmentType" className={errors.employmentType ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select your employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self-employed">Self-Employed Professional</SelectItem>
                  <SelectItem value="business">Business Owner</SelectItem>
                  <SelectItem value="freelancer">Freelancer</SelectItem>
                </SelectContent>
              </Select>
              {errors.employmentType && <p className="text-sm text-destructive">{errors.employmentType}</p>}
            </div>

            {/* Income/Turnover */}
            <div className="space-y-2">
              <Label htmlFor="income" className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                {formData.employmentType === "business" ? "Annual Business Turnover" : "Monthly Income"}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="income"
                  type="number"
                  placeholder={formData.employmentType === "business" ? "e.g., 5000000" : "e.g., 75000"}
                  value={formData.income}
                  onChange={(e) => updateField("income", e.target.value)}
                  className={`pl-8 ${errors.income ? "border-destructive" : ""}`}
                />
              </div>
              {errors.income && <p className="text-sm text-destructive">{errors.income}</p>}
            </div>

            {/* Loan Amount Required */}
            <div className="space-y-2">
              <Label htmlFor="loanAmount" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Loan Amount Required
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="loanAmount"
                  type="number"
                  placeholder="e.g., 500000"
                  value={formData.loanAmount}
                  onChange={(e) => updateField("loanAmount", e.target.value)}
                  className={`pl-8 ${errors.loanAmount ? "border-destructive" : ""}`}
                />
              </div>
              {errors.loanAmount && <p className="text-sm text-destructive">{errors.loanAmount}</p>}
            </div>

            {/* Existing Obligations */}
            <div className="space-y-2">
              <Label htmlFor="existingObligations" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Existing EMIs / Monthly Obligations
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="existingObligations"
                  type="number"
                  placeholder="Enter 0 if none"
                  value={formData.existingObligations}
                  onChange={(e) => updateField("existingObligations", e.target.value)}
                  className={`pl-8 ${errors.existingObligations ? "border-destructive" : ""}`}
                />
              </div>
              {errors.existingObligations && <p className="text-sm text-destructive">{errors.existingObligations}</p>}
              <p className="text-sm text-muted-foreground">
                Include all existing loan EMIs, credit card payments, etc.
              </p>
            </div>

            {/* Submit Button */}
            <Button type="submit" size="lg" className="w-full gap-2 text-base">
              Find My Best Options
              <TrendingUp className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
