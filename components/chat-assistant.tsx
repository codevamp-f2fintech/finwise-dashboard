"use client"

import { Badge } from "@/components/ui/badge"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Sparkles, Upload, Brain, MoreVertical, Paperclip, Smile, Mic, ChevronUp, ChevronDown } from "lucide-react"
import ReactMarkdown from "react-markdown"
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
      content: "Hello! I'm Dr. Finwise, your financial advisor. I can help you understand loan eligibility, compare lenders, and answer questions about fees, timelines, and documentation. How can I assist you today?",
      timestamp: new Date(),
    },
  ] )
  const [ input, setInput ] = useState( "" )
  const [ isTyping, setIsTyping ] = useState( false )
  const [ showPDFUpload, setShowPDFUpload ] = useState( false )
  const [ ragReady, setRagReady ] = useState( false )
  const [ showQuickTopics, setShowQuickTopics ] = useState( true )
  const [ firstInteractionDone, setFirstInteractionDone ] = useState( false )
  const scrollRef = useRef<HTMLDivElement>( null )
  const endRef = useRef<HTMLDivElement>( null )

  useEffect( () => {
    endRef.current?.scrollIntoView( { behavior: "smooth", block: "end" } )
  }, [ messages, isTyping ] )

  useEffect( () => {
    setRagReady( ragStore.isReady() )
  }, [] )

  const handleSend = async () => {
    if ( isTyping ) return
    if ( !input.trim() ) return
    if ( !firstInteractionDone )
    {
      setFirstInteractionDone( true )
      setShowQuickTopics( false )
    }
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

        const events = buffer.split( "\n\n" )
        buffer = events.pop() || ""

        for ( const evt of events )
        {
          const lines = evt.split( "\n" )
          for ( const line of lines )
          {
            if ( !line.startsWith( "data:" ) ) continue
            const payload = line.slice( 5 ).trimStart()
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

  const formatTime = ( date: Date ) => {
    return date.toLocaleTimeString( 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true } )
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
                onClick={() => setShowPDFUpload( !showPDFUpload )}
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
          {/* Messages Area - Much larger space */}
          <div className="flex-1 min-h-0 flex flex-col">
            <ScrollArea className="flex-1 px-4 py-4 min-h-0">
              <div className="space-y-4">
                {messages.map( ( message ) => (
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
                          : "bg-white rounded-bl-none"
                      )}
                    >
                      {/* Message content with larger text */}
                      <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap break-words">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {/* Timestamp */}
                      <div className="flex justify-end items-center gap-1 mt-2">
                        {message.fromKnowledgeBase && (
                          <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">KB</span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime( message.timestamp )}
                        </span>
                      </div>

                      {/* Tail for message bubble */}
                      <div
                        className={cn(
                          "absolute bottom-0 w-3 h-4",
                          message.role === "user"
                            ? "right-0 -mr-3 bg-[#d9fdd3] clip-path-[polygon(100% 0, 0 0, 100% 100%)]"
                            : "left-0 -ml-3 bg-white clip-path-[polygon(0 0, 100% 0, 0 100%)]"
                        )}
                      />
                    </div>
                  </div>
                ) )}

                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="bg-white rounded-bl-none rounded-2xl px-4 py-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500">Thinking</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Quick Topics Toggle Section */}
          {( showQuickTopics || !firstInteractionDone ) && (
            <div className="border-t border-gray-300 bg-white p-3 transition-all duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#008069]" />
                  <span className="text-sm text-gray-600 font-medium">Quick Topics</span>
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => setShowQuickTopics( !showQuickTopics )}
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
                  {knowledgeChips.map( ( chip ) => (
                    <button
                      key={chip}
                      onClick={() => handleChipClick( chip )}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2 py-2 rounded-full transition-colors duration-200 border border-gray-300 break-words min-h-[2rem] flex items-center justify-center text-center leading-tight"
                    >
                      <span className="break-words whitespace-normal">{chip}</span>
                    </button>
                  ) )}
                </div>
              )}
            </div>
          )}


          {/* Input Area - Compact */}
          <div className="bg-gray-100 p-3 border-t border-gray-300 shrink-0">
            <div className="flex items-center gap-2">

              {/* Input Field */}
              <div className="flex-1 min-w-0">
                <Input
                  value={input}
                  onChange={( e ) => setInput( e.target.value )}
                  onKeyDown={( e ) => {
                    if ( e.key === "Enter" && !e.shiftKey )
                    {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message"
                  className="bg-white border-0 rounded-full px-4 py-3 text-sm focus:ring-1 focus:ring-[#008069] focus:border-[#008069] w-full"
                />
              </div>

              {/* Send/Voice Record Button */}
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
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