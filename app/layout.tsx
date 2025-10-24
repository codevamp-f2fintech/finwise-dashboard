import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import AppBar from "@/components/AppBar"
import { Toaster } from "@/components/ui/sonner"

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
      <body className={`font-sans ${ GeistSans.variable } ${ GeistMono.variable }`}>
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
