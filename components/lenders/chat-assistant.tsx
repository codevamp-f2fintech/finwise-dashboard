"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, Sparkles, Upload, MoreVertical, ChevronUp, ChevronDown, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { PDFUpload } from "./pdf-upload"
import { ragStore } from "@/lib/rag-store"
import type { CustomerInfo } from "./onboarding-form"
import type { Lender } from "./mock-lenders"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  fromKnowledgeBase?: boolean
  isSystemMessage?: boolean
}

interface ChatAssistantProps {
  stage: "A" | "B"
  customerInfo: CustomerInfo | null
  lenders: Lender[]
  onLenderSelection?: (lenderIds: string[], reasoning: any) => void
  onSelectionStart?: () => void
  onSelectionEnd?: () => void
}

const knowledgeChips = [
  "Improve CIBIL",
  "Processing Fee",
  "Overdraft vs Term Loan",
  "Faster Approval",
  "Documentation Required",
  "ROI Comparison",
]

// Detection patterns for lender selection requests
const SELECTION_PATTERNS = [
  // Explicit selection patterns with numbers
  /show\s+(me\s+)?(the\s+)?(top|best)\s+(\d+)\s+(lenders?|vendors?|options?)/i,
  /select\s+(the\s+)?(top|best)\s+(\d+)/i,
  /recommend\s+(\d+)\s+(lenders?|vendors?)/i,
  /which\s+(\d+)\s+(are\s+)?(best|top)/i,
  /top\s+(\d+)\s+(lenders?|recommendations?)/i,
  /give\s+(me\s+)?(\d+)\s+(best|top)/i,

  // Natural language patterns asking for recommendations
  /which\s+(are|ones?)\s+(the\s+)?(top|best)\s*(\d+)?\s*(according\s+to\s+(you|ai)|for\s+me|in\s+your\s+opinion)?/i,
  /what\s+(would\s+you|do\s+you)\s+(recommend|suggest)/i,
  /which\s+(ones?|lenders?)\s+(would|should|do)\s+(you\s+)?(recommend|suggest|pick|choose)/i,
  /your\s+(top|best)\s+(picks?|choices?|recommendations?|(\d+))/i,
  /what\s+(are|is)\s+(your\s+)?(top|best)\s+(picks?|choices?|recommendations?|(\d+)?)/i,
  /(suggest|recommend)\s+(me\s+)?(some|the\s+best|top)/i,
  /help\s+me\s+(pick|choose|select|decide)/i,
  /which\s+(should\s+i|one\s+should\s+i)\s+(pick|choose|go\s+with|select)/i,
  /narrow\s+(it\s+)?down\s+(to\s+)?(\d+)?/i,
  /filter\s+(to\s+)?(top|best)\s*(\d+)?/i,
  /just\s+(show|give)\s+(me\s+)?(the\s+)?(top|best)\s*(\d+)?/i,

  // Patterns with contractions and "from these" type queries
  /what'?s\s+(the\s+)?(best|top)\s*(\d+|one)?\s*(from\s+(these|them|this|the\s+list))?/i,
  /(the\s+)?best\s+(\d+|one)\s*(from\s+(these|them|this|the\s+list|above))?/i,
  /pick\s+(the\s+)?(best|top)\s*(\d+|one)?/i,
  /choose\s+(the\s+)?(best|top)\s*(\d+|one)?/i,
  /which\s+(is|one\s+is)\s+(the\s+)?(best|top)/i,
  /what\s+is\s+(the\s+)?(best|top)\s*(\d+|one|option|lender|choice)?/i,
  /the\s+best\s+(option|lender|choice|one)\s*(from\s+(these|them))?/i,
  /single\s+(best|top)\s+(option|lender|choice)/i,
  /only\s+(\d+|one)\s+(best|top)/i,
]

export function ChatAssistant({ stage, customerInfo, lenders, onLenderSelection, onSelectionStart, onSelectionEnd }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Dr. Finwise, your financial advisor. I can help you understand loan eligibility, compare lenders, and answer questions about fees, timelines, and documentation. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [showPDFUpload, setShowPDFUpload] = useState(false)
  const [ragReady, setRagReady] = useState(false)
  const [showQuickTopics, setShowQuickTopics] = useState(true)
  const [firstInteractionDone, setFirstInteractionDone] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, isTyping])

  useEffect(() => {
    setRagReady(ragStore.isReady())
  }, [])

  // Detect if user is asking for lender selection
  const detectSelectionRequest = (text: string): { isRequest: boolean; count: number } => {
    // Word to number mapping
    const wordToNumber: Record<string, number> = {
      one: 1, two: 2, three: 3, four: 4, five: 5,
      single: 1, first: 1, top: 2, best: 2,
    }

    for (const pattern of SELECTION_PATTERNS) {
      const match = text.match(pattern)
      if (match) {
        // First try to extract a digit
        const numberMatch = text.match(/(\d+)/)
        if (numberMatch) {
          return { isRequest: true, count: Math.min(parseInt(numberMatch[1]), lenders.length) }
        }

        // Then try to extract word numbers
        const lowerText = text.toLowerCase()
        for (const [word, num] of Object.entries(wordToNumber)) {
          if (lowerText.includes(word)) {
            return { isRequest: true, count: Math.min(num, lenders.length) }
          }
        }

        // Default to 2 if no number found
        return { isRequest: true, count: Math.min(2, lenders.length) }
      }
    }
    return { isRequest: false, count: 0 }
  }

  const handleLenderSelection = async (requestedCount: number) => {
    if (!customerInfo || lenders.length === 0 || !onLenderSelection) {
      return
    }

    setIsSelecting(true)
    onSelectionStart?.() // Notify parent component (dashboard)

    // Add system message
    const systemMsg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `🔍 Analyzing ${lenders.length} lenders to find the top ${requestedCount} options for you...`,
      timestamp: new Date(),
      isSystemMessage: true,
    }
    setMessages(prev => [...prev, systemMsg])

    try {
      // Get last few messages for context
      const recentMessages = messages.slice(-5).map(m => `${m.role}: ${m.content}`).join("\n")

      const response = await fetch("/api/select-lenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerInfo,
          lenders,
          conversationContext: recentMessages,
          requestedCount,
        }),
      })

      if (!response.ok) {
        throw new Error("Selection failed")
      }

      const data = await response.json()

      if (data.success && data.selection) {
        const { selectedLenderIds, reasoning, summary } = data.selection

        // Trigger the callback to update dashboard
        onLenderSelection(selectedLenderIds, reasoning)

        // Add AI response with reasoning
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `✅ **Top ${selectedLenderIds.length} Lenders Selected**\n\n${summary}\n\n**Detailed Reasoning:**\n${Object.entries(reasoning).map(([key, value]) => `• ${value}`).join("\n")}\n\n*The dashboard has been updated to show only your selected lenders. You can reset to view all lenders anytime.*`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev.filter(m => !m.isSystemMessage), aiMsg])
      }
    } catch (error) {
      console.error("Selection error:", error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error while selecting the best lenders. Please try asking again or let me know if you'd like help comparing specific lenders.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev.filter(m => !m.isSystemMessage), errorMsg])
    } finally {
      setIsSelecting(false)
      onSelectionEnd?.() // Notify parent component (dashboard)
    }
  }

  const handleSend = async () => {
    if (isTyping || isSelecting) return
    if (!input.trim()) return

    if (!firstInteractionDone) {
      setFirstInteractionDone(true)
      setShowQuickTopics(false)
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput("")

    // Check if this is a selection request
    const selectionCheck = detectSelectionRequest(userInput)
    if (selectionCheck.isRequest && customerInfo && lenders.length > 0) {
      await handleLenderSelection(selectionCheck.count)
      return
    }

    // Normal chat flow
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          // Pass the filtered lenders and customer context
          lenders: lenders,
          customerInfo: customerInfo,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      let assistantContent = ""
      const decoder = new TextDecoder()
      let buffer = ""

      // FIXED: Simplified streaming logic without premature exit
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split("\n\n")
        buffer = events.pop() || ""

        for (const evt of events) {
          if (!evt.trim()) continue

          const lines = evt.split("\n")
          for (const line of lines) {
            if (!line.startsWith("data:")) continue
            const payload = line.slice(5).trimStart()
            if (!payload) continue
            if (payload === "[DONE]") {
              continue // Skip [DONE] marker but keep processing
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
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        fromKnowledgeBase: ragReady,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  return (
    <div className="space-y-3 flex flex-col h-screen">
      {showPDFUpload && (
        <div className="px-4">
          <PDFUpload onUploadComplete={handlePDFUploadComplete} />
        </div>
      )}

      <Card className="bg-[#f0f2f5] border-0 shadow-xl rounded-lg flex flex-col overflow-hidden h-full py-0 max-h-[calc(100vh-100px)]">
        {/* WhatsApp-like Header */}
        <CardHeader className="bg-[#008069] text-white p-4 border-b border-[#008069] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-10 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg">Dr. Finwise</CardTitle>
                <CardDescription className="text-white/80 text-sm">
                  AI Financial Advisor {ragReady && "• RAG Enabled"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPDFUpload(!showPDFUpload)}
                className="text-white hover:bg-white/20 rounded-full h-10 w-10"
              >
                <Upload className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-10 w-10"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 p-0 bg-[#efeae2] bg-opacity-60 bg-chat-background min-h-0">
          {/* Messages Area */}
          <div className="flex-1 min-h-0 flex flex-col">
            <ScrollArea className="flex-1 px-4 py-4 min-h-0">
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 max-w-full",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[90%] lg:max-w-[80%] xl:max-w-[75%] rounded-2xl px-4 py-3 relative",
                        message.role === "user"
                          ? "bg-[#d9fdd3] rounded-br-none"
                          : message.isSystemMessage
                            ? "bg-yellow-100 border border-yellow-300 rounded-bl-none"
                            : "bg-white rounded-bl-none"
                      )}
                    >
                      <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap break-words">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>

                      <div className="flex justify-end items-center gap-1 mt-2">
                        {message.fromKnowledgeBase && (
                          <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                            KB
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                      </div>

                      <div
                        className={cn(
                          "absolute bottom-0 w-3 h-4",
                          message.role === "user"
                            ? "right-0 -mr-3 bg-[#d9fdd3] clip-path-[polygon(100% 0, 0 0, 100% 100%)]"
                            : message.isSystemMessage
                              ? "left-0 -ml-3 bg-yellow-100 clip-path-[polygon(0 0, 100% 0, 0 100%)]"
                              : "left-0 -ml-3 bg-white clip-path-[polygon(0 0, 100% 0, 0 100%)]"
                        )}
                      />
                    </div>
                  </div>
                ))}

                {(isTyping || isSelecting) && (
                  <div className="flex gap-3 justify-start">
                    <div className="bg-white rounded-bl-none rounded-2xl px-4 py-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        {isSelecting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#008069]" />
                        ) : (
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                          </div>
                        )}
                        <span className="text-sm text-gray-500">
                          {isSelecting ? "Analyzing lenders..." : "Thinking"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Quick Topics Toggle Section */}
          {(showQuickTopics || !firstInteractionDone) && (
            <div className="border-t border-gray-300 bg-white p-3 transition-all duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#008069]" />
                  <span className="text-sm text-gray-600 font-medium">Quick Topics</span>
                </div>

                <button
                  onClick={() => setShowQuickTopics(!showQuickTopics)}
                  className="p-1 rounded-full hover:bg-gray-200 transition"
                  aria-label="Toggle Quick Topics"
                >
                  {showQuickTopics ? (
                    <ChevronUp className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>

              {showQuickTopics && (
                <div className="grid grid-cols-3 gap-2">
                  {knowledgeChips.map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick(chip)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-2 rounded-full transition-colors duration-200 border border-gray-300 break-words min-h-[2rem] flex items-center justify-center text-center leading-tight"
                    >
                      <span className="break-words whitespace-normal">{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="bg-gray-100 p-3 border-t border-gray-300 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type a message"
                  disabled={isSelecting}
                  className="bg-white border-0 rounded-full px-4 py-3 text-sm focus:ring-1 focus:ring-[#008069] focus:border-[#008069] w-full"
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || isSelecting}
                className="bg-[#008069] hover:bg-[#006e58] text-white rounded-full h-10 w-10 transition-colors duration-200 shrink-0"
                size="icon"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        .bg-chat-background {
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2390c8c8' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  )
}