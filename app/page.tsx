"use client"

import { useRouter } from "next/navigation"
import { OnboardingForm, type CustomerInfo } from "@/components/lenders/onboarding-form"

import { Footer } from "@/components/footer"

export default function Home() {
  const router = useRouter()

  const handleFormSubmit = async (data: CustomerInfo) => {
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        persona: data.persona,
        degree: data.degree,
        experience_years: parseInt(data.experience_years) || 0,
        employment_type: data.employment_type,
        cibil_band: data.cibil_band,
        declared_income: parseInt(data.net_monthly_income) || 0,
        existing_emi: parseInt(data.existing_emi) || 0,
        product: data.product,
        requested_limit: parseInt(data.requested_limit) || 0,
        tenure_months: parseInt(data.tenure_months) || 0,
        city: data.city,
        pincode: data.pincode,
        foreign_degree: data.foreign_degree,
        college_on_list: data.college_on_list,
      }

      const response = await fetch("/api/create-leads-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit form data");
      }

      const responseData = await response.json();

      // Store customer info in localStorage to pass to lenders page
      localStorage.setItem("customerInfo", JSON.stringify(data))

      // Clear any previous cached results to ensure a fresh loading screen on new submit
      sessionStorage.removeItem("lendersResult")
      sessionStorage.removeItem("lendersResultInfo")

      // Navigate to lenders route
      router.push("/lenders")
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong while submitting the form. Please try again.");
      throw error;
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <OnboardingForm onSubmit={handleFormSubmit} />
      </div>
      <Footer />
    </div>
  )
}