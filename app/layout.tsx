import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import AppBar from "@/components/lenders/AppBar"
import { Toaster } from "@/components/ui/sonner"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: "Dr. Finwise - AI Financial Advisor",
  description: "Smart loan comparison and advisory for Indian professionals",
  generator: "v0.app",
}

export default function RootLayout ( {
  children,
}: Readonly<{
  children: React.ReactNode
}> ) {
  return (
    <html lang="en">
      <body className={`font-sans ${poppins.variable} ${dmSans.variable}`}>
        <AppBar />
        <main>
          {children}
          <Toaster position="top-center" />
        </main>
        <Analytics />
      </body>
    </html>
  )
}
