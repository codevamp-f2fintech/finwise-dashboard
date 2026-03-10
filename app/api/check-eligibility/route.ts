// app/api/check-eligibility/route.ts

import { NextRequest } from 'next/server'
import { extractAadhaar, extractPAN, analyzeBankStatement } from '@/utils/tejas-api'
import { parseBankStatementExcel } from '@/utils/bank-statement-parser'
import { getCachedExtraction, saveCachedExtraction, clearCache } from '@/utils/extraction-cache'

// Progress event types for the streaming response
type ProgressStep = 'aadhaar' | 'pan' | 'bank_statement' | 'banking_analysis' | 'eligibility' | 'complete'
type StepStatus = 'processing' | 'complete' | 'cached' | 'error'

interface ProgressEvent {
  type: 'progress'
  step: ProgressStep
  status: StepStatus
  message: string
}

interface ResultEvent {
  type: 'result'
  data: any
}

interface ErrorEvent {
  type: 'error'
  message: string
  details?: string
  failedStep?: ProgressStep
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      // Helper to send a progress event
      const sendProgress = (step: ProgressStep, status: StepStatus, message: string) => {
        const event: ProgressEvent = { type: 'progress', step, status, message }
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
      }

      // Helper to send the final result
      const sendResult = (data: any) => {
        const event: ResultEvent = { type: 'result', data }
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
        controller.close()
      }

      // Helper to send an error
      const sendError = (message: string, details?: string, failedStep?: ProgressStep) => {
        const event: ErrorEvent = { type: 'error', message, details, failedStep }
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
        controller.close()
      }

      try {
        const formData = await request.formData()

        const aadhaarFile = formData.get('aadhaar') as File
        const panFile = formData.get('pancard') as File
        const bankStatementFile = formData.get('bankStatement') as File
        const customerInfoStr = formData.get('customerInfo') as string
        const sessionId = (formData.get('sessionId') as string) || `fallback-${Date.now()}`

        if (!aadhaarFile || !panFile || !bankStatementFile || !customerInfoStr) {
          sendError('Missing required documents or customer info')
          return
        }

        const customerInfo = JSON.parse(customerInfoStr)
        console.log('[check-eligibility] Processing documents for:', customerInfo.name)

        // Check for cached extraction results
        const cached = getCachedExtraction(sessionId)
        if (cached) {
          console.log('[check-eligibility] Found cache:',
            cached.aadhaar ? '✓ Aadhaar' : '✗ Aadhaar',
            cached.pan ? '✓ PAN' : '✗ PAN',
            cached.bankStatement ? '✓ BankStmt' : '✗ BankStmt'
          )
        }

        // ── Step 1: Extract Aadhaar ──────────────────────────
        let aadhaarData
        if (cached?.aadhaar) {
          aadhaarData = cached.aadhaar
          sendProgress('aadhaar', 'cached', 'Aadhaar details loaded from cache')
          console.log('[check-eligibility] ✓ Aadhaar from cache:', aadhaarData.detectedDetails[0].name)
        } else {
          sendProgress('aadhaar', 'processing', 'Extracting Aadhaar details...')
          try {
            aadhaarData = await extractAadhaar(aadhaarFile)
            saveCachedExtraction(sessionId, 'aadhaar', aadhaarData)
            sendProgress('aadhaar', 'complete', 'Aadhaar verified successfully')
            console.log('[check-eligibility] ✓ Aadhaar extracted:', aadhaarData.detectedDetails[0].name)
          } catch (err: any) {
            sendError('Aadhaar extraction failed. Please check the uploaded file.', err.message, 'aadhaar')
            return
          }
        }

        // ── Step 2: Extract PAN ──────────────────────────────
        let panData
        if (cached?.pan) {
          panData = cached.pan
          sendProgress('pan', 'cached', 'PAN details loaded from cache')
          console.log('[check-eligibility] ✓ PAN from cache:', panData.detectedDetails[0].panCardNumber)
        } else {
          sendProgress('pan', 'processing', 'Extracting PAN card details...')
          try {
            panData = await extractPAN(panFile)
            saveCachedExtraction(sessionId, 'pan', panData)
            sendProgress('pan', 'complete', 'PAN verified successfully')
            console.log('[check-eligibility] ✓ PAN extracted:', panData.detectedDetails[0].panCardNumber)
          } catch (err: any) {
            sendError('PAN extraction failed. Please check the uploaded file.', err.message, 'pan')
            return
          }
        }

        // ── Step 3: Analyze Bank Statement ───────────────────
        let bankStatementAnalysis
        if (cached?.bankStatement) {
          bankStatementAnalysis = cached.bankStatement
          sendProgress('bank_statement', 'cached', 'Bank statement loaded from cache')
          console.log('[check-eligibility] ✓ Bank statement from cache')
        } else {
          sendProgress('bank_statement', 'processing', 'Analyzing bank statement...')
          try {
            bankStatementAnalysis = await analyzeBankStatement(bankStatementFile)
            saveCachedExtraction(sessionId, 'bankStatement', bankStatementAnalysis)
            sendProgress('bank_statement', 'complete', 'Bank statement analyzed successfully')
            console.log('[check-eligibility] ✓ Bank statement analyzed')
          } catch (err: any) {
            sendError('Bank statement analysis failed. Please check the uploaded file.', err.message, 'bank_statement')
            return
          }
        }

        // ── Step 4: Parse Banking Data ───────────────────────
        sendProgress('banking_analysis', 'processing', 'Extracting banking metrics...')
        const bankingData = await parseBankStatementExcel(bankStatementAnalysis.downloadUrl)
        sendProgress('banking_analysis', 'complete', 'Banking metrics extracted successfully')
        console.log('[check-eligibility] ✓ Banking data extracted')

        // Log banking details
        console.log('[check-eligibility]   - Vintage:', bankingData.banking_vintage_months, 'months')
        console.log('[check-eligibility]   - ABB: ₹', bankingData.abb.toLocaleString())
        console.log('[check-eligibility]   - AMC: ₹', bankingData.amc.toLocaleString())
        console.log('[check-eligibility]   - Professional Income: ₹', bankingData.professional_income.toLocaleString())
        console.log('[check-eligibility]   - EMI (summary): ₹', bankingData.total_emi_payments.toLocaleString())
        console.log('[check-eligibility]   - EMI (verified): ₹', bankingData.total_emi_verified.toLocaleString(), `(${bankingData.emi_details.length} loans)`)
        bankingData.emi_details.forEach(e =>
          console.log(`[check-eligibility]     → ${e.lender}: ₹${e.amount.toLocaleString()}/month (${e.type})`)
        )
        console.log('[check-eligibility]   - Bounces:', bankingData.bounces_6m)
        console.log('[check-eligibility]   - Live USL:', bankingData.live_usl)
        console.log('[check-eligibility]   - Speculative Flows:', bankingData.has_speculative_flows ? 'YES ⚠' : 'No ✓')
        console.log('[check-eligibility]   - Credit Card:', bankingData.credit_card_present ? 'Yes' : 'No')
        console.log('[check-eligibility]   - Income Sources:', bankingData.income_sources.length)

        // ── Step 5: Run Eligibility Check ────────────────────
        sendProgress('eligibility', 'processing', 'Checking eligibility across lenders...')

        // Calculate income and EMI
        const actualExistingEMI = Math.max(bankingData.total_emi_payments, bankingData.total_emi_verified)
        const actualIncome = bankingData.professional_income > 0
          ? bankingData.professional_income
          : (bankingData.amc > parseInt(customerInfo.net_monthly_income)
            ? bankingData.amc
            : parseInt(customerInfo.net_monthly_income))

        console.log('[check-eligibility] Income calculation:')
        console.log('[check-eligibility]   - Declared: ₹', parseInt(customerInfo.net_monthly_income).toLocaleString())
        console.log('[check-eligibility]   - Professional: ₹', bankingData.professional_income.toLocaleString())
        console.log('[check-eligibility]   - AMC: ₹', bankingData.amc.toLocaleString())
        console.log('[check-eligibility]   - Final Used: ₹', actualIncome.toLocaleString())

        const eligibilityPayload = {
          phase: 'HARD',
          profile: {
            name: customerInfo.name || aadhaarData.detectedDetails[0].name,
            persona: customerInfo.persona,
            degree: customerInfo.degree,
            experience_years: parseInt(customerInfo.experience_years) || 0,
            employment_type: customerInfo.employment_type,
            city: customerInfo.city || '',
            pincode: customerInfo.pincode || '',
            foreign_degree: customerInfo.foreign_degree ?? false,
            college_on_list: customerInfo.college_on_list ?? true,
          },
          credit: {
            cibil_band: customerInfo.cibil_band,
            cibil_exact: customerInfo.cibil_exact || 0,
            existing_emi: actualExistingEMI,
          },
          income: {
            net_monthly_income: actualIncome,
            professional_income: bankingData.professional_income,
            recurring_income: bankingData.recurring_income,
            gross_receipts: customerInfo.gross_receipts || 0,
          },
          loan: {
            product: customerInfo.product,
            requested_limit: parseInt(customerInfo.requested_limit) || 0,
            tenure_months: parseInt(customerInfo.tenure_months) || 60,
          },
          banking: {
            vintage_months: bankingData.banking_vintage_months,
            abb: bankingData.abb,
            amc: bankingData.amc,
            bounces_6m: bankingData.bounces_6m,
            live_usl: bankingData.live_usl,
            enquiries_6m: bankingData.enquiries_6m || 0,
            od_cc_present: bankingData.od_cc_present,
            has_speculative_flows: bankingData.has_speculative_flows,
          },
          kyc: {
            aadhaar_number: aadhaarData.detectedDetails[0].aadhaarNumber,
            pan_number: panData.detectedDetails[0].panCardNumber,
            name: aadhaarData.detectedDetails[0].name,
            dob: aadhaarData.detectedDetails[0].dateOfBirth,
            address: aadhaarData.detectedDetails[0].address,
          },
          financial_health: {
            min_balance: bankingData.min_balance,
            max_balance: bankingData.max_balance,
            closing_balance: bankingData.closing_balance,
            total_credits: bankingData.total_credits_6m,
            total_debits: bankingData.total_debits_6m,
            tax_payments: bankingData.tax_payments,
            insurance_payments: bankingData.insurance_payments,
            investment_activity: bankingData.investment_activity,
          },
          documents: {
            bank_statement_6m: true,
            bureau_report: false,
          }
        }

        console.log('[check-eligibility] Calling /api/eligibility with HARD phase...')
        if (bankingData.has_speculative_flows) {
          console.warn('[check-eligibility] ⚠ SPECULATIVE FLOWS DETECTED — L&T will be blocked')
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const eligibilityResponse = await fetch(`${baseUrl}/api/eligibility`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eligibilityPayload)
        })

        if (!eligibilityResponse.ok) {
          throw new Error(`Eligibility API failed: ${eligibilityResponse.statusText}`)
        }

        const eligibilityResult = await eligibilityResponse.json()
        console.log('[check-eligibility] ✓ Eligibility check complete')

        // Parse results
        const eligibleLenders = eligibilityResult.lenders?.filter(
          (l: any) => l.eligibility.status === 'PASS'
        ) || []

        const partialLenders = eligibilityResult.lenders?.filter(
          (l: any) => l.eligibility.status === 'PARTIAL'
        ) || []

        const tlFallbackLenders = eligibilityResult.lenders?.filter(
          (l: any) => l.is_tl_fallback === true
        ) || []

        const failedLenders = eligibilityResult.lenders?.filter(
          (l: any) => l.eligibility.status === 'FAIL'
        ) || []

        const eligible = eligibleLenders.length > 0

        sendProgress('eligibility', 'complete',
          eligible
            ? `Eligible for ${eligibleLenders.length} lender${eligibleLenders.length > 1 ? 's' : ''}!`
            : partialLenders.length > 0
              ? `Partially eligible for ${partialLenders.length} lender${partialLenders.length > 1 ? 's' : ''}`
              : 'Eligibility check complete'
        )

        console.log('[check-eligibility] Results:')
        console.log('[check-eligibility]   - Eligible lenders:', eligibleLenders.length)
        console.log('[check-eligibility]   - Partial lenders:', partialLenders.length)
        console.log('[check-eligibility]   - TL fallback offers:', tlFallbackLenders.length)
        console.log('[check-eligibility]   - Failed lenders:', failedLenders.length)

        // Generate insights
        const insights = generateDetailedInsights(bankingData, eligibleLenders, partialLenders, failedLenders)

        if (bankingData.has_speculative_flows) {
          insights.improvements.push({
            category: 'Banking',
            message: 'Speculative transactions detected (trading/crypto/betting). Some lenders may be restricted.',
            priority: 'high'
          })
        }

        // Clear cache on success
        clearCache(sessionId)

        // ── Step 6: Update Leads Info in Database ─────────────
        if (customerInfo.id) {
          sendProgress('complete', 'processing', 'Saving verified details...')
          try {
            console.log(`[check-eligibility] Updating leads info for ID: ${customerInfo.id}`)

            // Format dates simply for DB (YYYY-MM-DD if available)
            let formattedDob = aadhaarData.detectedDetails[0].dateOfBirth
            if (formattedDob && typeof formattedDob === 'string' && formattedDob.includes('/')) {
              // simple conversion from DD/MM/YYYY to YYYY-MM-DD
              const parts = formattedDob.split('/')
              if (parts.length === 3) formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`
            }

            const updatePayload = {
              dob: formattedDob,
              address: aadhaarData.detectedDetails[0].address,

              verified_income: actualIncome,
              professional_income: bankingData.professional_income,
              abb: bankingData.abb,
              amc: bankingData.amc,
              banking_vintage_months: bankingData.banking_vintage_months,
              bounces_6m: bankingData.bounces_6m,
              live_usl: bankingData.live_usl,
              verified_emi: bankingData.total_emi_verified,
              emi_count: bankingData.emi_details?.length || 0,
              od_cc_present: bankingData.od_cc_present || bankingData.credit_card_present,
            }

            const updateRes = await fetch(`${baseUrl}/api/update-leads-info/${customerInfo.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatePayload)
            })

            if (!updateRes.ok) {
              console.warn(`[check-eligibility] Failed to save verified details for ${customerInfo.id}: ${updateRes.status}`)
            } else {
              console.log(`[check-eligibility] ✓ Verified details saved to database`)
            }
          } catch (e) {
            console.error(`[check-eligibility] Error saving verified details:`, e)
            // Non-blocking error
          }
        }

        // Send final result
        sendProgress('complete', 'complete', 'All checks completed!')

        sendResult({
          success: true,
          eligibility: {
            eligible,
            reason: eligible
              ? `Congratulations! You're eligible for loans from ${eligibleLenders.length} lender${eligibleLenders.length > 1 ? 's' : ''}.`
              : partialLenders.length > 0
                ? `You're partially eligible for ${partialLenders.length} lender${partialLenders.length > 1 ? 's' : ''}. Improve your banking metrics for better offers.`
                : 'Based on your documents, you do not meet the minimum eligibility criteria at this time.',
            recommendations: eligible
              ? `Your highest approved limit is ₹${Math.max(...eligibleLenders.map((l: any) => l.eligibility.eligible_limit)).toLocaleString('en-IN')}.`
              : partialLenders.length > 0
                ? insights.improvements.map(i => i.message).join(' ')
                : 'We recommend: ' + insights.improvements.map(i => i.message).join(' '),
            lenders: eligibleLenders,
            partial_lenders: partialLenders,
            tl_fallback_lenders: tlFallbackLenders,
            failed_lenders: failedLenders.slice(0, 2),
          },
          extractedData: {
            kyc: {
              name: aadhaarData.detectedDetails[0].name,
              aadhaar: aadhaarData.detectedDetails[0].aadhaarNumber,
              pan: panData.detectedDetails[0].panCardNumber,
              dob: aadhaarData.detectedDetails[0].dateOfBirth,
              address: aadhaarData.detectedDetails[0].address,
            },
            banking: bankingData,
            insights
          }
        })

      } catch (error: any) {
        console.error('[check-eligibility] Error:', error)
        const event: ErrorEvent = {
          type: 'error',
          message: 'An unexpected error occurred during document verification.',
          details: error.message
        }
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

// ── Helpers ──────────────────────────────────────────

interface InsightItem {
  category: string
  message: string
  priority: 'high' | 'medium' | 'low'
}

function generateDetailedInsights(
  banking: any,
  eligible: any[],
  partial: any[],
  failed: any[]
) {
  const strengths: InsightItem[] = []
  const improvements: InsightItem[] = []

  // Strengths
  if (banking.abb > 500000) {
    strengths.push({ category: 'Banking', message: `Excellent average bank balance of ₹${banking.abb.toLocaleString('en-IN')}.`, priority: 'high' })
  } else if (banking.abb > 300000) {
    strengths.push({ category: 'Banking', message: `Good average bank balance of ₹${banking.abb.toLocaleString('en-IN')}.`, priority: 'medium' })
  }

  if (banking.bounces_6m === 0) {
    strengths.push({ category: 'Credit', message: 'Perfect payment discipline — zero bounces in 6 months.', priority: 'high' })
  }

  if (banking.professional_income > banking.amc * 0.6) {
    strengths.push({ category: 'Income', message: `Strong professional income of ₹${banking.professional_income.toLocaleString('en-IN')}/month.`, priority: 'high' })
  }

  if (banking.tax_payments) {
    strengths.push({ category: 'Compliance', message: 'Tax compliance verified.', priority: 'medium' })
  }

  if (banking.investment_activity) {
    strengths.push({ category: 'Profile', message: 'Active investor profile detected.', priority: 'low' })
  }

  if (!banking.has_speculative_flows) {
    strengths.push({ category: 'Banking', message: 'Clean banking — no speculative activity.', priority: 'medium' })
  }

  if (banking.banking_vintage_months >= 24) {
    strengths.push({ category: 'Banking', message: `${banking.banking_vintage_months}-month banking vintage.`, priority: 'medium' })
  }

  if (banking.live_usl <= 2) {
    strengths.push({ category: 'Credit', message: 'Low existing loan burden.', priority: 'medium' })
  }

  // Improvements
  if (banking.abb < 100000) {
    improvements.push({ category: 'Banking', message: `ABB of ₹${banking.abb.toLocaleString('en-IN')} is below most lender minimums. Maintain ₹2L+ for 90 days.`, priority: 'high' })
  } else if (banking.abb < 200000) {
    improvements.push({ category: 'Banking', message: `ABB of ₹${banking.abb.toLocaleString('en-IN')} meets basic requirements. Increase to ₹3L+ for higher limits.`, priority: 'medium' })
  }

  if (banking.bounces_6m > 2) {
    improvements.push({ category: 'Credit', message: `${banking.bounces_6m} bounces detected. Most lenders allow max 1-2. Clear all bounces for 6 months.`, priority: 'high' })
  } else if (banking.bounces_6m > 0) {
    improvements.push({ category: 'Credit', message: `${banking.bounces_6m} bounce detected. Zero bounces strengthens your application.`, priority: 'medium' })
  }

  if (banking.live_usl > 4) {
    improvements.push({ category: 'Credit', message: `${banking.live_usl} active loans exceeds the cap for several lenders (max 3-4). Consider closing smaller loans.`, priority: 'high' })
  } else if (banking.live_usl > 3) {
    improvements.push({ category: 'Credit', message: `${banking.live_usl} active loans. Some lenders cap at 3. Closing 1-2 can help.`, priority: 'medium' })
  }

  if (banking.banking_vintage_months < 12) {
    improvements.push({ category: 'Banking', message: `Banking vintage of ${banking.banking_vintage_months} months is below the 12-month minimum.`, priority: 'high' })
  }

  if (partial.length > 0 && eligible.length === 0) {
    improvements.push({ category: 'Overall', message: 'Improving ABB and reducing active loans can upgrade you to full eligibility.', priority: 'high' })
  }

  // Per-lender feedback
  const lenderFeedback: Array<{
    name: string
    status: string
    limit: number | null
    pros: string[]
    cons: string[]
    messages: string[]
  }> = []

  for (const l of [...eligible, ...partial, ...failed.slice(0, 2)]) {
    const elig = l.eligibility || {}
    const explain = l.explain || {}
    lenderFeedback.push({
      name: l.lender || l.lender_name || l.lender_id || 'Unknown',
      status: elig.status || (eligible.includes(l) ? 'PASS' : partial.includes(l) ? 'PARTIAL' : 'FAIL'),
      limit: elig.eligible_limit || elig.final_limit || null,
      pros: explain.why_matched || elig.pros || [],
      cons: explain.how_to_increase_limit || elig.cons || [],
      messages: Array.isArray(elig.reasons) ? elig.reasons : (elig.reasons?.customer_messages || []),
    })
  }

  return {
    strengths,
    improvements,
    lenderFeedback,
    summary: {
      total_lenders_checked: eligible.length + partial.length + failed.length,
      eligible_count: eligible.length,
      partial_count: partial.length,
      failed_count: failed.length,
      highest_limit: eligible.length > 0
        ? Math.max(...eligible.map((l: any) => l.eligibility?.eligible_limit || l.final_limit || 0))
        : partial.length > 0
          ? Math.max(...partial.map((l: any) => l.eligibility?.eligible_limit || l.final_limit || 0))
          : 0
    }
  }
}