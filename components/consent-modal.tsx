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
import { AlertCircle, Shield, FileCheck } from "lucide-react"
import { useState } from "react"

interface ConsentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
  lenderName: string
}

export function ConsentModal({ open, onOpenChange, onAccept, lenderName }: ConsentModalProps) {
  const [bureauConsent, setBureauConsent] = useState(false)
  const [termsConsent, setTermsConsent] = useState(false)

  const handleAccept = () => {
    if (bureauConsent && termsConsent) {
      onAccept()
      // Reset checkboxes
      setBureauConsent(false)
      setTermsConsent(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Consent Required</DialogTitle>
              <DialogDescription>Moving to Stage B: Final Eligibility Check</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info Alert */}
          <div className="flex gap-3 rounded-lg bg-primary/10 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-primary" />
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
              />
              <div className="space-y-1">
                <Label htmlFor="bureau-consent" className="cursor-pointer font-medium leading-relaxed">
                  I consent to credit bureau check
                </Label>
                <p className="text-sm text-muted-foreground">
                  This will be a hard inquiry and may temporarily affect your credit score by 1-5 points.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms-consent"
                checked={termsConsent}
                onCheckedChange={(checked) => setTermsConsent(checked as boolean)}
              />
              <div className="space-y-1">
                <Label htmlFor="terms-consent" className="cursor-pointer font-medium leading-relaxed">
                  I agree to share my documents and information
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your data will be securely shared with {lenderName} for verification purposes only.
                </p>
              </div>
            </div>
          </div>

          {/* What You'll Need */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <FileCheck className="h-4 w-4 text-primary" />
              <span>Documents you'll need to upload:</span>
            </div>
            <ul className="ml-6 space-y-1 text-sm text-muted-foreground">
              <li>PAN Card</li>
              <li>Aadhaar Card</li>
              <li>Last 3 months salary slips</li>
              <li>Last 6 months bank statements</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={!bureauConsent || !termsConsent}>
            Accept & Continue to Stage B
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
