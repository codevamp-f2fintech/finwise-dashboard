// app/api/select-lenders/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

export const maxDuration = 30

interface SelectionRequest {
  customerInfo: {
    name: string
    employmentType: string
    loanType: string
    income: string
    loanAmount: string
  }
  lenders: any[]
  conversationContext?: string
  requestedCount?: number
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY
    if (!apiKey) {
      return Response.json({ error: "API key not configured" }, { status: 500 })
    }

    const body: SelectionRequest = await req.json()
    const { customerInfo, lenders, conversationContext, requestedCount = 2 } = body

    if (!customerInfo || !lenders || lenders.length === 0) {
      return Response.json({ error: "Invalid request data" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Prepare lender summary for AI
    const lenderSummary = lenders.map((l, idx) => `
${idx + 1}. ${l.name} (ID: ${l.id})
   - Product: ${l.productType}
   - Status: ${l.status}
   - Loan Limit: ${l.indicativeLimit}
   - ROI: ${l.roiRange}
   - Processing Fee: ${l.processingFee}
   - Disbursal Time: ${l.disbursalTime}
   - Pros: ${l.pros.join("; ")}
   - Cons: ${l.cons.join("; ")}
   - Current Rank: ${l.rank}
`).join("\n")

    const prompt = `You are Dr. Finwise, an expert financial advisor. Analyze the following customer profile and available lenders to recommend the TOP ${requestedCount} BEST lenders.

CUSTOMER PROFILE:
- Name: ${customerInfo.name}
- Employment: ${customerInfo.employmentType}
- Loan Type Requested: ${customerInfo.loanType}
- Monthly Income/Turnover: ₹${customerInfo.income}
- Loan Amount Needed: ₹${customerInfo.loanAmount}

${conversationContext ? `CONVERSATION CONTEXT:\n${conversationContext}\n` : ""}

AVAILABLE LENDERS (Already filtered for eligibility):
${lenderSummary}

SELECTION CRITERIA (Priority Order):
1. **Eligibility Strength**: Fully eligible > Partially eligible
2. **Cost Optimization**: Lower ROI + Lower processing fees
3. **Loan Amount Match**: Can provide the requested amount
4. **Speed**: Faster disbursal time (24-48 hours is excellent)
5. **Product Fit**: 
   - Salaried: Prefer overdraft options for flexibility
   - Business/Self-employed: Prefer higher limits with business-friendly terms
   - Doctors/CA: Prefer specialized professional loan products
6. **Value Proposition**: Better pros-to-cons ratio
7. **Conversation Context**: If customer mentioned "urgent", prioritize speed; if "cheap/low cost", prioritize low ROI

INSTRUCTIONS:
1. Analyze each lender carefully against the customer's needs
2. Select the TOP ${requestedCount} lenders that best match the customer
3. Provide your selection in this EXACT JSON format (no markdown, no code blocks):

{
  "selectedLenderIds": ["id1", "id2"],
  "reasoning": {
    "lender1": "Brief reason why this is best (1-2 sentences)",
    "lender2": "Brief reason why this is second best (1-2 sentences)"
  },
  "summary": "Overall recommendation summary (2-3 sentences)"
}

Respond ONLY with the JSON object, nothing else.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()
    
    console.log("[AI Selection] Raw response:", responseText)

    // Try to parse JSON from response
    let jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("AI did not return valid JSON")
    }

    const selection = JSON.parse(jsonMatch[0])

    // Validate response
    if (!selection.selectedLenderIds || !Array.isArray(selection.selectedLenderIds)) {
      throw new Error("Invalid selection format")
    }

    // Ensure we only return requested count
    selection.selectedLenderIds = selection.selectedLenderIds.slice(0, requestedCount)

    console.log("[AI Selection] Parsed selection:", selection)

    return Response.json({
      success: true,
      selection
    })

  } catch (error) {
    console.error("[AI Selection] Error:", error)
    return Response.json(
      { 
        error: "Failed to select lenders", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}