"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle, AlertCircle, Loader } from "lucide-react"
import { extractTextFromPDF, chunkText } from "@/lib/pdf-processor"
import { ragStore } from "@/lib/rag-store"

interface PDFUploadProps {
  onUploadComplete?: () => void
}

export function PDFUpload({ onUploadComplete }: PDFUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [fileName, setFileName] = useState("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.includes("pdf")) {
      setStatus("error")
      setMessage("Please upload a PDF file")
      return
    }

    setIsLoading(true)
    setStatus("idle")
    setFileName(file.name)

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file)

      // Chunk the text
      const chunks = chunkText(text, 500, 100)

      // Store in RAG store (no embeddings needed)
      await ragStore.addChunks(chunks)

      setStatus("success")
      setMessage(`Successfully processed ${file.name} with ${chunks.length} chunks`)
      onUploadComplete?.()
    } catch (error) {
      console.error("PDF processing error:", error)
      setStatus("error")
      setMessage("Failed to process PDF. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Knowledge Base
        </CardTitle>
        <CardDescription>Upload a PDF to enhance AI responses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="hidden"
            id="pdf-upload"
          />
          <label htmlFor="pdf-upload" className="flex-1">
            <Button asChild variant="outline" className="w-full cursor-pointer bg-transparent" disabled={isLoading}>
              <span>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose PDF
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>

        {status === "success" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{message}</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{message}</AlertDescription>
          </Alert>
        )}

        {fileName && status === "success" && (
          <div className="text-sm text-muted-foreground">
            Current knowledge base: <span className="font-medium">{fileName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
