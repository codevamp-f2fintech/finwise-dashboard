"use client"

import { useState, useRef, useEffect } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, Sparkles, ChevronUp, ChevronDown, Loader2, Trash2, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

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
  onClose?: () => void
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

export function ChatAssistant({ stage, customerInfo, lenders, onLenderSelection, onSelectionStart, onSelectionEnd, onClose }: ChatAssistantProps) {
  const initialMessages: Message[] = [
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm Dr. Finwise, your financial advisor. I can help you understand loan eligibility, compare lenders, and answer questions about fees, timelines, and documentation. How can I assist you today?",
      timestamp: new Date(),
    },
  ]
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  const [ragReady, setRagReady] = useState(false)
  const [showQuickTopics, setShowQuickTopics] = useState(true)
  const [firstInteractionDone, setFirstInteractionDone] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
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

  const handleClearChat = () => {
    setMessages(initialMessages)
    setFirstInteractionDone(false)
    setInput("")
  }



  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  return (
    <div className="space-y-3 flex flex-col h-full min-h-0 animate-in fade-in zoom-in-95 duration-500">
      <Card className="bg-white border-0 shadow-lg rounded-2xl flex flex-col overflow-hidden h-full py-0 max-h-full ring-1 ring-black/5">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] text-white p-3.5 sm:p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-inner shrink-0">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-white text-base sm:text-lg font-bold tracking-tight truncate">Dr. Finwise</CardTitle>
                <CardDescription className="text-white/80 text-[11px] sm:text-xs font-medium flex items-center gap-1">
                  AI Financial Advisor {ragReady && <span className="flex items-center gap-1"> <Sparkles className="h-3 w-3 text-yellow-300" /> RAG</span>}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearChat}
                className="text-white hover:bg-white/20 rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full h-8 w-8 sm:h-9 sm:w-9 transition-colors"
                  title="Close Chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-1 p-0 bg-transparent min-h-0 relative">
          {/* Messages Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5 scroll-smooth">
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2.5 sm:gap-3 max-w-full animate-in slide-in-from-bottom-2 duration-300",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] sm:max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm relative transition-all duration-300 hover:shadow-md",
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] text-white rounded-br-sm"
                      : message.isSystemMessage
                        ? "bg-yellow-50 border border-yellow-200/50 text-yellow-900 rounded-bl-sm"
                        : "bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-sm"
                  )}
                >
                  <div className="text-xs sm:text-[14px] leading-relaxed whitespace-pre-wrap break-words prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  <div className={cn("flex justify-end items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2", message.role === "user" ? "text-indigo-100" : "text-gray-400")}>
                    {message.fromKnowledgeBase && (
                      <span className="text-[9px] sm:text-[10px] text-[#3f50b5] bg-indigo-100/50 px-1.5 py-0.5 rounded-full font-medium">
                        KB
                      </span>
                    )}
                    <span className="text-[9px] sm:text-[10px] font-medium">{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}

            {(isTyping || isSelecting) && (
              <div className="flex gap-2.5 sm:gap-3 justify-start animate-in fade-in duration-300">
                <div className="bg-gray-50 border border-gray-100 rounded-bl-sm rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm max-w-[85%] sm:max-w-[80%]">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {isSelecting ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-[#3f50b5]" />
                    ) : (
                      <div className="flex space-x-1.5">
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-[#5c6bc0] [animation-delay:-0.3s]" />
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-[#5c6bc0] [animation-delay:-0.15s]" />
                        <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-bounce rounded-full bg-[#5c6bc0]" />
                      </div>
                    )}
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">
                      {isSelecting ? "Analyzing lenders..." : "Thinking"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} className="h-2" />
          </div>

          {/* Quick Topics Toggle Section */}
          <div className="border-t border-gray-100 bg-white p-2.5 sm:p-3 transition-all duration-300 ease-in-out shrink-0">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#3f50b5]" />
                <span className="text-[11px] sm:text-xs text-gray-700 font-semibold uppercase tracking-wider">Suggested Topics</span>
              </div>

              <button
                onClick={() => setShowQuickTopics(!showQuickTopics)}
                className="p-1 sm:p-1.5 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                aria-label="Toggle Quick Topics"
              >
                {showQuickTopics ? (
                  <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                )}
              </button>
            </div>

            {showQuickTopics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                {knowledgeChips.map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleChipClick(chip)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] sm:text-xs px-2.5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm hover:shadow hover:-translate-y-0.5 break-words min-h-[2.25rem] sm:min-h-[2.5rem] flex items-center justify-center text-center leading-tight font-medium"
                  >
                    <span className="break-words whitespace-normal">{chip}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white p-2.5 sm:p-3 border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 relative">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={isSelecting}
                  className="bg-gray-50 border-gray-200 shadow-inner rounded-full pl-4 sm:pl-5 pr-3 sm:pr-4 py-4 sm:py-5 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-[#3f50b5] focus-visible:border-transparent w-full transition-all"
                />
              </div>

              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || isSelecting}
                className="bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5] text-white rounded-full h-10 w-10 sm:h-11 sm:w-11 transition-all duration-300 shadow-md hover:shadow-lg shrink-0 flex items-center justify-center p-0"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5 sm:ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}