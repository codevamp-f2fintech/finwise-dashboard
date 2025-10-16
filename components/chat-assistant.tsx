"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { PDFUpload } from "@/components/pdf-upload"
import { ragStore } from "@/lib/rag-store"
import type { CustomerInfo } from "@/components/onboarding-form"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  fromKnowledgeBase?: boolean
}

interface ChatAssistantProps {
  stage: "A" | "B"
  customerInfo: CustomerInfo | null
}

const knowledgeChips = [
  "Improve CIBIL",
  "Processing Fee",
  "Overdraft vs Term Loan",
  "Faster Approval",
  "Documentation Required",
  "ROI Comparison",
]

export function ChatAssistant({ stage, customerInfo }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm Dr. Finwise, your financial advisor. I can help you understand loan eligibility, compare lenders, and answer questions about fees, timelines, and documentation. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showPDFUpload, setShowPDFUpload] = useState(false)
  const [ragReady, setRagReady] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isTyping])

  useEffect(() => {
    setRagReady(ragStore.isReady())
  }, [])

  const handleSend = async () => {
    if (isTyping) return
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      let assistantContent = ""
      const decoder = new TextDecoder()
      let buffer = ""
      let doneReading = false

      while (!doneReading) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE events separated by blank lines
        const events = buffer.split("\n\n")
        buffer = events.pop() || ""

        for (const evt of events) {
          const lines = evt.split("\n")
          for (const line of lines) {
            if (!line.startsWith("data:")) continue
            const payload = line.slice(5).trimStart() // after "data:"
            if (!payload) continue
            if (payload === "[DONE]") {
              doneReading = true
              break
            }
            try {
              const data = JSON.parse(payload)
              if (data?.type === "text-delta" && typeof data.text === "string") {
                assistantContent += data.text
              }
            } catch {
              // Ignore non-JSON or partial lines
            }
          }
          if (doneReading) break
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        fromKnowledgeBase: ragReady,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleChipClick = (chip: string) => {
    setInput(chip)
  }

  const handlePDFUploadComplete = () => {
    setShowPDFUpload(false)
    setRagReady(true)
  }

  return (
    <div className="space-y-4">
      {showPDFUpload && <PDFUpload onUploadComplete={handlePDFUploadComplete} />}

      <Card className="glass flex h-full max-h-full flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Dr. Finwise</CardTitle>
                <CardDescription>
                  AI Financial Advisor {ragReady && <span className="ml-2 text-xs text-green-600">(RAG Enabled)</span>}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowPDFUpload(!showPDFUpload)}>
              {showPDFUpload ? "Hide" : "Upload PDF"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 min-h-0 flex-col gap-4 p-4">
          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2.5 text-sm leading-relaxed",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <>
                        <div
                          className={cn("relative", expanded[message.id] ? "" : "max-h-56 overflow-auto pr-1")}
                          aria-expanded={!!expanded[message.id]}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.content.length > 600 && (
                          <button
                            type="button"
                            className="mt-2 text-xs underline opacity-80 hover:opacity-100"
                            onClick={() => setExpanded((prev) => ({ ...prev, [message.id]: !prev[message.id] }))}
                            aria-label={expanded[message.id] ? "Show less" : "Show more"}
                          >
                            {expanded[message.id] ? "Show less" : "Show more"}
                          </button>
                        )}
                        <p className="mt-2 text-xs opacity-60">
                          {message.fromKnowledgeBase ? "📚 From knowledge base" : "🧠 General knowledge"}
                        </p>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-muted px-4 py-2.5">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          {/* Knowledge Chips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Quick topics</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {knowledgeChips.map((chip) => (
                <Badge
                  key={chip}
                  variant="outline"
                  className="cursor-pointer transition-colors hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleChipClick(chip)}
                >
                  {chip}
                </Badge>
              ))}
            </div>
          </div>

          {/* Input Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="border-t pt-3"
            aria-label="Chat message composer"
          >
            <InputGroup className="bg-card">
              <InputGroupTextarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Type your question about loans... (Shift+Enter for a new line)"
                aria-label="Message"
                className="text-base md:text-sm"
              />
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                className="mx-2"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                title="Send"
              >
                <Send className="h-4 w-4" />
              </InputGroupButton>
            </InputGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
