import { GoogleGenerativeAI } from "@google/generative-ai";
import { ragStore } from "@/lib/rag-store";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "NEXT_PUBLIC_API_KEY environment variable is not set" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { messages, lenders, customerInfo } = body;

    console.log("[chat-rag] Received messages:", messages?.length, "lenders:", lenders?.length);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    // Get the latest user message for RAG retrieval
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content) {
      return Response.json(
        { error: "Invalid message structure" },
        { status: 400 },
      );
    }

    const userQuery = lastMessage.content;

    let context = "";
    let usedKnowledgeBase = false;

    // 1. Use the PASSED lenders (already filtered for user's selection)
    if (lenders && Array.isArray(lenders) && lenders.length > 0) {
      const lenderContext = lenders.map((l: any) => 
        `**${l.name}** (${l.productType}): ROI ${l.roiRange}, Limit ${l.indicativeLimit}, Fee ${l.processingFee}, Disbursal ${l.disbursalTime}. Pros: ${l.pros?.slice(0, 2).join(", ") || "N/A"}. Cons: ${l.cons?.slice(0, 2).join(", ") || "N/A"}.`
      ).join("\n");
      
      context += `\n\nFiltered Lenders for ${customerInfo?.loanType || "loan"} (${lenders.length} options):\n${lenderContext}`;
      usedKnowledgeBase = true;
      console.log("[chat-rag] Using", lenders.length, "filtered lenders for context");
    }

    // 2. Add customer context
    if (customerInfo) {
      context += `\n\nCustomer Profile:
- Loan Type: ${customerInfo.loanType}
- Employment: ${customerInfo.employmentType}
- Monthly Income: ₹${customerInfo.income}
- Loan Amount Required: ₹${customerInfo.loanAmount}`;
    }

    // 3. Retrieve relevant PDF chunks if RAG store is ready
    if (ragStore.isReady()) {
      try {
        const retrievalResult = await ragStore.retrieveRelevant(userQuery, 5);

        if (
          retrievalResult &&
          retrievalResult.hasRelevantResults &&
          retrievalResult.chunks &&
          retrievalResult.chunks.length > 0
        ) {
          context += `\n\nRelevant knowledge base information:\n${retrievalResult.chunks
            .map((chunk) => `- ${chunk.text}`)
            .join("\n")}`;
          usedKnowledgeBase = true;
        }
      } catch (error) {
        console.error("[chat-rag] RAG retrieval error:", error);
      }
    }

    const systemPrompt = usedKnowledgeBase
      ? `You are Dr. Finwise, an expert financial advisor AI assistant specializing in loans and financial products.

YOUR EXPERTISE:
- Loan types: Home loans, Personal loans, Business loans, Machinery loans, Professional loans
- Eligibility criteria (income requirements, credit scores, documentation)
- Interest rates and ROI comparisons
- Processing fees and hidden charges
- EMI calculations and loan tenures
- Documentation requirements
- Loan approval process and timelines
- Tips for improving loan eligibility

CUSTOMER CONTEXT:
${context}

GUIDELINES:
1. For lender-specific questions (like "lowest interest rate", "fastest disbursal", "best for my needs"):
   - Use ONLY the lenders listed above
   - Be specific with lender names and exact rates/fees
   - Compare multiple lenders when relevant

2. For general loan questions (like "what is EMI", "how to improve CIBIL", "documents needed"):
   - Use your financial knowledge to provide helpful guidance
   - Relate answers to the customer's loan type when relevant

3. Always be:
   - Clear and jargon-free
   - Helpful and encouraging
   - Honest about limitations
   - Specific with numbers when available`
      : `You are Dr. Finwise, an expert financial advisor AI assistant specializing in loans and financial products.

YOUR EXPERTISE:
- Loan types: Home loans, Personal loans, Business loans, Machinery loans, Professional loans
- Eligibility criteria (income requirements, credit scores, documentation)
- Interest rates and ROI comparisons
- Processing fees and hidden charges
- EMI calculations and loan tenures
- Documentation requirements
- Loan approval process and timelines
- Tips for improving loan eligibility

Provide helpful, clear, and accurate financial guidance. You can answer questions about:
- How loans work
- EMI calculations
- Credit score/CIBIL improvement
- Documentation requirements
- Choosing between loan types
- General financial advice

Be honest if you're uncertain about specific details or if you need more information from the customer.`;

    if (!Array.isArray(messages)) {
      console.error("[v0] Messages is not an array:", typeof messages);
      return Response.json(
        { error: "Invalid messages format" },
        { status: 400 },
      );
    }

    const validMessages = messages.filter(
      (msg: any) => msg && typeof msg === "object" && msg.role && msg.content,
    );

    console.log("[v0] Valid messages count:", validMessages.length);

    if (validMessages.length === 0) {
      return Response.json(
        { error: "No valid messages to process" },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let chatHistory = validMessages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Find the first user message index to ensure chat history starts with user
    let firstUserIndex = -1;
    for (let i = 0; i < chatHistory.length; i++) {
      if (chatHistory[i].role === "user") {
        firstUserIndex = i;
        break;
      }
    }

    // If no user message found in history, start fresh with empty history
    if (firstUserIndex === -1) {
      chatHistory = [];
    } else if (firstUserIndex > 0) {
      // Remove any messages before the first user message
      chatHistory = chatHistory.slice(firstUserIndex);
    }

    const userMessage = validMessages[validMessages.length - 1];
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessageStream([
      {
        text: `${systemPrompt}\n\nUser message: ${userMessage.content}`,
      },
    ]);

    console.log("[v0] Stream created successfully");

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // Format as SSE (Server-Sent Events)
              const data = JSON.stringify({
                type: "text-delta",
                text: text,
              });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[v0] Chat error:", error);
    console.error(
      "[v0] Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return Response.json(
      {
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
