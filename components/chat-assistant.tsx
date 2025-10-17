"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Sparkles, Upload, Brain } from "lucide-react"
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

export function ChatAssistant ( { stage, customerInfo }: ChatAssistantProps ) {
  const [ messages, setMessages ] = useState<Message[]>( [
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm Dr. Finwise, your financial advisor. I can help you understand loan eligibility, compare lenders, and answer questions about fees, timelines, and documentation. How can I assist you today?",
      timestamp: new Date(),
    },
  ] )
  const [ input, setInput ] = useState( "" )
  const [ isTyping, setIsTyping ] = useState( false )
  const [ showPDFUpload, setShowPDFUpload ] = useState( false )
  const [ ragReady, setRagReady ] = useState( false )
  const scrollRef = useRef<HTMLDivElement>( null )
  const endRef = useRef<HTMLDivElement>( null )
  const [ expanded, setExpanded ] = useState<Record<string, boolean>>( {} )

  useEffect( () => {
    endRef.current?.scrollIntoView( { behavior: "smooth", block: "end" } )
  }, [ messages, isTyping ] )

  useEffect( () => {
    setRagReady( ragStore.isReady() )
  }, [] )

  const handleSend = async () => {
    if ( isTyping ) return
    if ( !input.trim() ) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages( ( prev ) => [ ...prev, userMessage ] )
    setInput( "" )
    setIsTyping( true )

    try
    {
      const response = await fetch( "/api/chat-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( {
          messages: [ ...messages, userMessage ].map( ( msg ) => ( {
            role: msg.role,
            content: msg.content,
          } ) ),
        } ),
      } )

      if ( !response.ok ) throw new Error( "Failed to get response" )

      const reader = response.body?.getReader()
      if ( !reader ) throw new Error( "No response body" )

      let assistantContent = ""
      const decoder = new TextDecoder()
      let buffer = ""
      let doneReading = false

      while ( !doneReading )
      {
        const { done, value } = await reader.read()
        if ( done ) break

        buffer += decoder.decode( value, { stream: true } )

        // Process complete SSE events separated by blank lines
        const events = buffer.split( "\n\n" )
        buffer = events.pop() || ""

        for ( const evt of events )
        {
          const lines = evt.split( "\n" )
          for ( const line of lines )
          {
            if ( !line.startsWith( "data:" ) ) continue
            const payload = line.slice( 5 ).trimStart() // after "data:"
            if ( !payload ) continue
            if ( payload === "[DONE]" )
            {
              doneReading = true
              break
            }
            try
            {
              const data = JSON.parse( payload )
              if ( data?.type === "text-delta" && typeof data.text === "string" )
              {
                assistantContent += data.text
              }
            } catch
            {
              // Ignore non-JSON or partial lines
            }
          }
          if ( doneReading ) break
        }
      }

      const assistantMessage: Message = {
        id: ( Date.now() + 1 ).toString(),
        role: "assistant",
        content: assistantContent || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        fromKnowledgeBase: ragReady,
      }

      setMessages( ( prev ) => [ ...prev, assistantMessage ] )
    } catch ( error )
    {
      console.error( "Chat error:", error )
      const errorMessage: Message = {
        id: ( Date.now() + 1 ).toString(),
        role: "assistant",
        content: "I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages( ( prev ) => [ ...prev, errorMessage ] )
    } finally
    {
      setIsTyping( false )
    }
  }

  const handleChipClick = ( chip: string ) => {
    setInput( chip )
  }

  const handlePDFUploadComplete = () => {
    setShowPDFUpload( false )
    setRagReady( true )
  }

  return (
    <div className="space-y-3 h-[120vh] flex flex-col">
      {showPDFUpload && <PDFUpload onUploadComplete={handlePDFUploadComplete} />}

      <Card className="bg-white/90 backdrop-blur-sm border-white/50 shadow-xl rounded-xl flex flex-col overflow-hidden h-full">
        <CardHeader className="border-b border-gray-200/50 pb-3 pt-3 px-4 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] bg-clip-text text-transparent truncate">
                  Dr. Finwise
                </CardTitle>
                <CardDescription className="text-xs text-gray-600 flex items-center gap-1 flex-wrap">
                  AI Advisor
                  {ragReady && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      <Brain className="h-2.5 w-2.5" />
                      RAG
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPDFUpload( !showPDFUpload )}
              className="bg-white/80 border-gray-200 text-gray-700 hover:bg-[#3f50b5] hover:text-white transition-all duration-300 rounded-lg text-xs px-2 py-1 h-auto shrink-0"
            >
              <Upload className="h-3 w-3 mr-1" />
              PDF
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 min-h-[85vh] flex-col gap-3 p-3">
          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0 pr-2">
            <div className="space-y-3">
              {messages.map( ( message ) => (
                <div
                  key={message.id}
                  className={cn( "flex gap-2", message.role === "user" ? "justify-end" : "justify-start" )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#3f50b5]/10 to-[#5c6bc0]/10">
                      <Bot className="h-3.5 w-3.5 text-[#3f50b5]" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed shadow-sm",
                      message.role === "user"
                        ? "bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] text-white"
                        : "bg-gray-50/80 border border-gray-100 text-gray-800",
                    )}
                  >
                    {message.role === "assistant" ? (
                      <>
                        <div
                          className={cn( "relative", expanded[ message.id ] ? "" : "max-h-40 overflow-auto" )}
                          aria-expanded={!!expanded[ message.id ]}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.content.length > 400 && (
                          <button
                            type="button"
                            className="mt-1.5 text-[10px] text-[#3f50b5] font-medium hover:text-[#354497] transition-colors"
                            onClick={() => setExpanded( ( prev ) => ( { ...prev, [ message.id ]: !prev[ message.id ] } ) )}
                            aria-label={expanded[ message.id ] ? "Show less" : "Show more"}
                          >
                            {expanded[ message.id ] ? "Show less" : "Show more"}
                          </button>
                        )}
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-gray-500">
                          {message.fromKnowledgeBase ? (
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">📚 Knowledge</span>
                          ) : (
                            <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">🧠 AI</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0]">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              ) )}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#3f50b5]/10 to-[#5c6bc0]/10">
                    <Bot className="h-3.5 w-3.5 text-[#3f50b5]" />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-gray-50/80 border border-gray-100 px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#3f50b5] [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#3f50b5] [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#3f50b5]" />
                    </div>
                    <span className="text-xs text-gray-500">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          {/* Knowledge Chips */}
          <div className="space-y-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <Sparkles className="h-3 w-3 text-[#3f50b5]" />
              <span>Quick Topics</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {knowledgeChips.map( ( chip ) => (
                <Badge
                  key={chip}
                  variant="outline"
                  className="cursor-pointer transition-all duration-300 bg-white/80 border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-[#3f50b5] hover:to-[#5c6bc0] hover:text-white hover:border-transparent hover:shadow-md rounded-md px-2 py-0.5 text-[10px]"
                  onClick={() => handleChipClick( chip )}
                >
                  {chip}
                </Badge>
              ) )}
            </div>
          </div>

          {/* Input Composer */}
          <form
            onSubmit={( e ) => {
              e.preventDefault()
              handleSend()
            }}
            className="border-t border-gray-200/50 pt-2 shrink-0"
            aria-label="Chat message composer"
          >
            <InputGroup className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-2">
              <InputGroupTextarea
                rows={2}
                value={input}
                onChange={( e ) => setInput( e.target.value )}
                onKeyDown={( e ) => {
                  if ( e.key === "Enter" && !e.shiftKey )
                  {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask about loans..."
                aria-label="Message"
                className="text-xs border-0 focus:ring-0 bg-white text-gray-800 placeholder:text-gray-400 resize-none w-full px-2 py-1 rounded focus:outline-none"
              />
              <InputGroupButton
                type="submit"
                variant="default"
                size="icon-sm"
                className="ml-2 bg-gradient-to-r from-[#3f50b5] to-[#5c6bc0] hover:from-[#354497] hover:to-[#4a58a5] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-md h-8 w-8"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                title="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </InputGroupButton>
            </InputGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}