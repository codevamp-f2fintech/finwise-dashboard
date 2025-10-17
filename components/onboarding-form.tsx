"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Briefcase, IndianRupee, CreditCard, TrendingUp, Calculator, PieChart, BarChart3 } from "lucide-react"

export interface CustomerInfo {
  name: string
  employmentType: string
  income: string
  loanAmount: string
  existingObligations: string
}

interface OnboardingFormProps {
  onSubmit: ( data: CustomerInfo ) => void
}

export function OnboardingForm ( { onSubmit }: OnboardingFormProps ) {
  const [ formData, setFormData ] = useState<CustomerInfo>( {
    name: "",
    employmentType: "",
    income: "",
    loanAmount: "",
    existingObligations: "",
  } )

  const [ errors, setErrors ] = useState<Partial<Record<keyof CustomerInfo, string>>>( {} )

  const handleSubmit = ( e: React.FormEvent ) => {
    e.preventDefault()

    // Validation
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {}

    if ( !formData.name.trim() ) newErrors.name = "Name is required"
    if ( !formData.employmentType ) newErrors.employmentType = "Employment type is required"
    if ( !formData.income.trim() ) newErrors.income = "Income is required"
    if ( !formData.loanAmount.trim() ) newErrors.loanAmount = "Loan amount is required"
    if ( !formData.existingObligations.trim() ) newErrors.existingObligations = "This field is required (enter 0 if none)"

    if ( Object.keys( newErrors ).length > 0 )
    {
      setErrors( newErrors )
      return
    }

    onSubmit( formData )
  }

  const updateField = ( field: keyof CustomerInfo, value: string ) => {
    setFormData( ( prev ) => ( { ...prev, [ field ]: value } ) )
    // Clear error when user starts typing
    if ( errors[ field ] )
    {
      setErrors( ( prev ) => ( { ...prev, [ field ]: undefined } ) )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c4d5eb] to-[#e8eff9] p-4 relative overflow-hidden">
    
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm border-white/50 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="space-y-4 text-center pb-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#3f50b5]/10">
              <TrendingUp className="h-10 w-10 text-[#3f50b5]" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] bg-clip-text text-transparent">
              Welcome to Dr. Finwise
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Let's find the smartest loan options tailored for you. Share a few details to get started.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-gray-700 font-medium">
                    <User className="h-4 w-4 text-[#3f50b5]" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={( e ) => updateField( "name", e.target.value )}
                      className={`bg-white/70 border-gray-200 focus:border-[#3f50b5] focus:ring-[#3f50b5] transition-all duration-200 pl-10 ${ errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "" }`}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                {/* Employment Type */}
                <div className="space-y-2">
                  <Label htmlFor="employmentType" className="flex items-center gap-2 text-gray-700 font-medium">
                    <Briefcase className="h-4 w-4 text-[#3f50b5]" />
                    Employment Type
                  </Label>
                  <Select value={formData.employmentType} onValueChange={( value ) => updateField( "employmentType", value )}>
                    <SelectTrigger
                      id="employmentType"
                      className={`bg-white/70 border-gray-200 focus:border-[#3f50b5] focus:ring-[#3f50b5] transition-all duration-200 ${ errors.employmentType ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "" }`}
                    >
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="salaried" className="focus:bg-[#c4d5eb]">Salaried</SelectItem>
                      <SelectItem value="self-employed" className="focus:bg-[#c4d5eb]">Self-Employed Professional</SelectItem>
                      <SelectItem value="business" className="focus:bg-[#c4d5eb]">Business Owner</SelectItem>
                      <SelectItem value="freelancer" className="focus:bg-[#c4d5eb]">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.employmentType && <p className="text-sm text-red-500">{errors.employmentType}</p>}
                </div>

                {/* Income/Turnover */}
                <div className="space-y-2">
                  <Label htmlFor="income" className="flex items-center gap-2 text-gray-700 font-medium">
                    <IndianRupee className="h-4 w-4 text-[#3f50b5]" />
                    {formData.employmentType === "business" ? "Annual Turnover" : "Monthly Income"}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      id="income"
                      type="number"
                      placeholder={formData.employmentType === "business" ? "e.g., 5000000" : "e.g., 75000"}
                      value={formData.income}
                      onChange={( e ) => updateField( "income", e.target.value )}
                      className={`bg-white/70 border-gray-200 focus:border-[#3f50b5] focus:ring-[#3f50b5] transition-all duration-200 pl-8 ${ errors.income ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "" }`}
                    />
                  </div>
                  {errors.income && <p className="text-sm text-red-500">{errors.income}</p>}
                </div>

                {/* Loan Amount Required */}
                <div className="space-y-2">
                  <Label htmlFor="loanAmount" className="flex items-center gap-2 text-gray-700 font-medium">
                    <CreditCard className="h-4 w-4 text-[#3f50b5]" />
                    Loan Amount Required
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      id="loanAmount"
                      type="number"
                      placeholder="e.g., 500000"
                      value={formData.loanAmount}
                      onChange={( e ) => updateField( "loanAmount", e.target.value )}
                      className={`bg-white/70 border-gray-200 focus:border-[#3f50b5] focus:ring-[#3f50b5] transition-all duration-200 pl-8 ${ errors.loanAmount ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "" }`}
                    />
                  </div>
                  {errors.loanAmount && <p className="text-sm text-red-500">{errors.loanAmount}</p>}
                </div>

                {/* Existing Obligations */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="existingObligations" className="flex items-center gap-2 text-gray-700 font-medium">
                    <CreditCard className="h-4 w-4 text-[#3f50b5]" />
                    Existing EMIs / Monthly Obligations
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <Input
                      id="existingObligations"
                      type="number"
                      placeholder="Enter 0 if none"
                      value={formData.existingObligations}
                      onChange={( e ) => updateField( "existingObligations", e.target.value )}
                      className={`bg-white/70 border-gray-200 focus:border-[#3f50b5] focus:ring-[#3f50b5] transition-all duration-200 pl-8 ${ errors.existingObligations ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "" }`}
                    />
                  </div>
                  {errors.existingObligations && <p className="text-sm text-red-500">{errors.existingObligations}</p>}
                  <p className="text-sm text-gray-500">
                    Include all existing loan EMIs, credit card payments, etc.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 text-base bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5] text-white shadow-lg hover:shadow-xl transition-all duration-300 mt-4"
              >
                Find My Best Options
                <TrendingUp className="h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}