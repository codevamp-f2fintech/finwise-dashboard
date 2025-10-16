"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, CheckCircle2 } from "lucide-react"

interface LoadingTransitionProps {
  onComplete: () => void
}

export function LoadingTransition({ onComplete }: LoadingTransitionProps) {
  const [step, setStep] = useState(0)

  const steps = [
    "Analyzing your profile...",
    "Comparing lender eligibility...",
    "Calculating best rates...",
    "Finding smartest options...",
  ]

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 800)

    const completeTimeout = setTimeout(() => {
      onComplete()
    }, 3500)

    return () => {
      clearInterval(stepInterval)
      clearTimeout(completeTimeout)
    }
  }, [onComplete])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="space-y-8 text-center animate-in fade-in duration-500">
        {/* Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 animate-pulse">
          <TrendingUp className="h-12 w-12 text-primary" />
        </div>

        {/* Main Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-balance">Finding the smartest loan options for you</h2>
          <p className="text-lg text-muted-foreground text-pretty">This will only take a moment...</p>
        </div>

        {/* Progress Steps */}
        <div className="mx-auto max-w-md space-y-3">
          {steps.map((stepText, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-500 ${
                index <= step ? "bg-primary/10" : "bg-muted/30"
              }`}
            >
              {index < step ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success animate-in zoom-in duration-300" />
              ) : index === step ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
              ) : (
                <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
              )}
              <span className={`text-sm ${index <= step ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {stepText}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
