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
import { toast } from "sonner"

interface ConsentModalProps {
  open: boolean
  onOpenChange: ( open: boolean ) => void
  onAccept: () => void
  lenderName: string
}

export function ConsentModal ( { open, onOpenChange, onAccept, lenderName }: ConsentModalProps ) {
  const [ bureauConsent, setBureauConsent ] = useState( false )
  const [ termsConsent, setTermsConsent ] = useState( false )

  const handleAccept = () => {
    if ( bureauConsent && termsConsent )
    {
      // Show toast message instead of proceeding to stage B
      toast.success( "Your Interest Has Been Successfully Noted, Our Executive Will Call You In Some Time." )

      // Close the modal
      onOpenChange( false )

      // Reset checkboxes
      setBureauConsent( false )
      setTermsConsent( false )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full mx-4 sm:mx-auto sm:max-w-[500px] md:max-w-[550px] lg:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl">Consent Required</DialogTitle>
              {/* <DialogDescription className="text-sm sm:text-base">Moving to Stage B: Final Eligibility Check</DialogDescription> */}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 py-4 px-1">
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
                onCheckedChange={( checked ) => setBureauConsent( checked as boolean )}
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
                onCheckedChange={( checked ) => setTermsConsent( checked as boolean )}
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

          {/* What You'll Need */}
          {/* <div className="rounded-lg border bg-muted/50 p-3 sm:p-4">
            <div className="mb-2 sm:mb-3 flex items-center gap-2 text-sm font-medium">
              <FileCheck className="h-4 w-4 text-primary" />
              <span>Documents you'll need to upload:</span>
            </div>
            <ul className="ml-4 sm:ml-6 space-y-1 text-xs sm:text-sm text-muted-foreground">
              <li>PAN Card</li>
              <li>Aadhaar Card</li>
              <li>Last 3 months salary slips</li>
              <li>Last 6 months bank statements</li>
            </ul>
          </div> */}
        </div>

        <DialogFooter className="shrink-0 flex flex-col sm:flex-row gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange( false )}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!bureauConsent || !termsConsent}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}