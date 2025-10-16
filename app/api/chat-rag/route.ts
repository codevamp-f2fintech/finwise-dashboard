import { GoogleGenerativeAI } from "@google/generative-ai"
import { ragStore } from "@/lib/rag-store"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY environment variable is not set" }, { status: 500 })
    }

    const body = await req.json()
    const { messages } = body

    console.log("[v0] Received messages:", messages)

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 })
    }

    // Get the latest user message for RAG retrieval
    const lastMessage = messages[messages.length - 1]

    if (!lastMessage || !lastMessage.content) {
      return Response.json({ error: "Invalid message structure" }, { status: 400 })
    }

    const userQuery = lastMessage.content

    let context = ""
    let usedKnowledgeBase = false

    // Retrieve relevant chunks if RAG store is ready
    if (ragStore.isReady()) {
      try {
        const retrievalResult = await ragStore.retrieveRelevant(userQuery, 5)

        if (
          retrievalResult &&
          retrievalResult.hasRelevantResults &&
          retrievalResult.chunks &&
          retrievalResult.chunks.length > 0
        ) {
          context = `\n\nRelevant knowledge base information:\n${retrievalResult.chunks
            .map((chunk) => `- ${chunk.text}`)
            .join("\n")}`
          usedKnowledgeBase = true
        }
      } catch (error) {
        console.error("RAG retrieval error:", error)
        // Continue without RAG context if retrieval fails
      }
    }

    const systemPrompt = usedKnowledgeBase
      ? `You are Dr. Finwise, a financial advisor AI assistant. You help customers understand loans, eligibility, fees, and financial products.

Use the following knowledge base information to answer questions:
${context}

Provide clear, helpful, and accurate financial guidance based on the knowledge base. If the question is not covered in the knowledge base, acknowledge this and provide general financial guidance.`
      : `You are Dr. Finwise, a financial advisor AI assistant. You help customers understand loans, eligibility, fees, and financial products.

No specific knowledge base information is available for this query. Please provide a helpful, general answer based on your training knowledge about financial products, loans, and financial advisory best practices. Be honest if you're uncertain about specific details.`

    if (!Array.isArray(messages)) {
      console.error("[v0] Messages is not an array:", typeof messages)
      return Response.json({ error: "Invalid messages format" }, { status: 400 })
    }

    const validMessages = messages.filter((msg: any) => msg && typeof msg === "object" && msg.role && msg.content)

    console.log("[v0] Valid messages count:", validMessages.length)

    if (validMessages.length === 0) {
      return Response.json({ error: "No valid messages to process" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    let chatHistory = validMessages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Find the first user message index to ensure chat history starts with user
    let firstUserIndex = -1
    for (let i = 0; i < chatHistory.length; i++) {
      if (chatHistory[i].role === "user") {
        firstUserIndex = i
        break
      }
    }

    // If no user message found in history, start fresh with empty history
    if (firstUserIndex === -1) {
      chatHistory = []
    } else if (firstUserIndex > 0) {
      // Remove any messages before the first user message
      chatHistory = chatHistory.slice(firstUserIndex)
    }

    const userMessage = validMessages[validMessages.length - 1]
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    })

    const result = await chat.sendMessageStream([
      {
        text: `${systemPrompt}\n\nUser message: ${userMessage.content}`,
      },
    ])

    console.log("[v0] Stream created successfully")

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              // Format as SSE (Server-Sent Events)
              const data = JSON.stringify({
                type: "text-delta",
                text: text,
              })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[v0] Chat error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return Response.json(
      { error: "Failed to process chat message", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
