// utils/bank-statement-parser.ts
// Comprehensive bank statement parser with transaction-level scanning
// Works across all Indian banks (ICICI, HDFC, SBI, Axis, Kotak, BOB, PNB, etc.)

import * as XLSX from 'xlsx'

// ============================================================================
// TYPES
// ============================================================================

export interface EMIDetail {
  lender: string          // e.g. "Bajaj Finance", "ICICI Car Loan"
  amount: number          // Monthly EMI amount
  frequency: number       // How many months detected
  day_of_month: number    // Typical debit day
  type: 'auto_debit' | 'manual' | 'inferred'
}

export interface IncomeSource {
  name: string            // e.g. "Arista Spine", "Chintan Orthopaedic Hospital"
  type: 'hospital' | 'pharma' | 'consulting' | 'salary' | 'insurance_payout' | 'other'
  total: number           // Total over period
  frequency: number       // Number of credits
}

export interface BankStatementData {
  // Banking Health Metrics
  banking_vintage_months: number
  abb: number
  amc: number
  min_balance: number
  max_balance: number
  closing_balance: number
  opening_balance: number

  // Risk Indicators
  bounces_6m: number
  live_usl: number
  enquiries_6m: number
  od_cc_present: boolean
  credit_card_present: boolean
  has_speculative_flows: boolean

  // Income Analysis
  salary_credits: boolean
  professional_income: number
  recurring_income: number
  total_credits_6m: number
  total_debits_6m: number

  // EMI Analysis (CRITICAL — transaction-verified)
  total_emi_payments: number          // From Expense sheet (may undercount)
  total_emi_verified: number          // From transaction scanning (accurate)
  emi_details: EMIDetail[]            // Individual EMI breakdowns

  // Income Sources
  income_sources: IncomeSource[]

  // Transaction Patterns
  total_transactions: number
  credit_transactions: number
  debit_transactions: number
  average_transaction_size: number

  // Flags
  tax_payments: boolean
  insurance_payments: boolean
  investment_activity: boolean
  risk_flags: string[]

  // Bank Info
  bank_name: string
  account_type: string
}

// ============================================================================
// KEYWORD DICTIONARIES — Cross-Bank Compatible
// ============================================================================

// NBFC/Lender names in transaction descriptions (all banks format these similarly)
const EMI_LENDER_KEYWORDS: { pattern: string; label: string }[] = [
  // Major NBFCs
  { pattern: 'bajaj finance', label: 'Bajaj Finance' },
  { pattern: 'bajaj finserv', label: 'Bajaj Finance' },
  { pattern: 'tata capital', label: 'Tata Capital' },
  { pattern: 'tata motor', label: 'Tata Motors Finance' },
  { pattern: 'l&t finance', label: 'L&T Finance' },
  { pattern: 'l and t finance', label: 'L&T Finance' },
  { pattern: 'aditya birla', label: 'ABFL' },
  { pattern: 'abfl', label: 'ABFL' },
  { pattern: 'hdfc ltd', label: 'HDFC Ltd' },
  { pattern: 'hdfc limited', label: 'HDFC Ltd' },
  { pattern: 'lichousing', label: 'LIC Housing' },
  { pattern: 'lic housing', label: 'LIC Housing' },
  { pattern: 'pnb housing', label: 'PNB Housing' },
  { pattern: 'edelweiss', label: 'Edelweiss' },
  { pattern: 'piramal', label: 'Piramal Finance' },
  { pattern: 'manappuram', label: 'Manappuram' },
  { pattern: 'muthoot', label: 'Muthoot' },
  { pattern: 'fullerton', label: 'Fullerton' },
  { pattern: 'shriram', label: 'Shriram Finance' },
  { pattern: 'mahindra finance', label: 'Mahindra Finance' },
  { pattern: 'cholamandalam', label: 'Chola Finance' },
  { pattern: 'sundaram finance', label: 'Sundaram Finance' },
  { pattern: 'indostar', label: 'IndoStar Capital' },
  { pattern: 'hero fincorp', label: 'Hero FinCorp' },
  { pattern: 'dspfin', label: 'DSP Finance' },

  // Banks (when they appear as lender in another bank's statement)
  { pattern: 'kotak mahindra', label: 'Kotak Mahindra Bank' },
  { pattern: 'axis bank', label: 'Axis Bank' },
  { pattern: 'icici bank', label: 'ICICI Bank' },
  { pattern: 'sbi card', label: 'SBI Card' },
  { pattern: 'indusind', label: 'IndusInd Bank' },
  { pattern: 'yes bank', label: 'Yes Bank' },
  { pattern: 'federal bank', label: 'Federal Bank' },
  { pattern: 'idfc first', label: 'IDFC First' },
  { pattern: 'rbl bank', label: 'RBL Bank' },
  { pattern: 'au small', label: 'AU Small Finance' },
  { pattern: 'bandhan', label: 'Bandhan Bank' },
]

// EMI description keywords (bank-agnostic patterns)
const EMI_DESCRIPTION_KEYWORDS = [
  'emi', 'car loan', 'home loan', 'personal loan', 'gold loan',
  'vehicle loan', 'auto loan', 'two wheeler', 'consumer durable',
  'education loan', 'property loan', 'lap loan', 'business loan',
  'loan repay', 'loan emi', 'loan instalment',
]

// Auto-debit patterns (found across all Indian banks)
const AUTO_DEBIT_PATTERNS = [
  'ach/', 'ach-', 'nach/', 'nach-',
  'si/', 'si-',       // Standing instruction
  'mandate',
  'auto debit', 'auto-debit',
  'ecs/', 'ecs-',     // Electronic Clearing Service
]

// Speculative flow keywords — EXPANDED for all platforms
const SPECULATIVE_KEYWORDS = [
  // Stock trading platforms
  'zerodha', 'upstox', 'groww', 'angel one', 'angel broking',
  '5paisa', 'motilal oswal', 'sharekhan', 'iifl sec',
  'kotak securities', 'icici direct', 'hdfc securities',
  'axis direct', 'geojit', 'religare', 'edelweiss sec',
  'samco', 'fyers', 'dhan', 'finvasia', 'prostocks',
  'nuvama', 'paytm money',    // Paytm Money for trading

  // Crypto
  'crypto', 'binance', 'wazirx', 'coinbase', 'coindcx',
  'zebpay', 'bitbns', 'buyucoin', 'unocoin', 'giottus',
  'bitcoin', 'ethereum',

  // Gambling / Fantasy
  'dream11', 'mpl', 'my11circle', 'winzo', 'zupee',
  'rummy', 'poker', 'pokerbaazi', 'adda52',
  'stake', 'bet365', '1xbet', 'betway', 'fairplay',
  'gambling', 'betting', 'casino', 'satta',

  // Forex trading
  'forex', 'octafx', 'olymp trade', 'iq option', 'exness',
  'xm trading', 'fbs', 'hotforex',

  // Intraday/F&O markers
  'intraday', 'margin money', 'f&o', 'futures', 'options premium',
]

// Exclude these from speculative detection (false positives)
const SPECULATIVE_EXCLUDE = [
  'bse limited',        // Mutual fund SIPs go through BSE
  'cams', 'kfintech',   // MF registrars
  'mf ', 'mutual fund', // Explicitly mutual funds
  'sip',                // SIP investments
  'insurance',
  'fd ', 'fixed deposit',
  'ppf', 'nps',
  'sovereign gold',
]

// Professional income keywords (Doctors + CAs)
const PROFESSIONAL_INCOME_KEYWORDS: { pattern: string; type: IncomeSource['type'] }[] = [
  // Hospitals & Clinics
  { pattern: 'hospital', type: 'hospital' },
  { pattern: 'healthcare', type: 'hospital' },
  { pattern: 'medical', type: 'hospital' },
  { pattern: 'clinic', type: 'hospital' },
  { pattern: 'nursing', type: 'hospital' },
  { pattern: 'diagnostic', type: 'hospital' },
  { pattern: 'patholog', type: 'hospital' },
  { pattern: 'laborator', type: 'hospital' },
  { pattern: 'orthopaedic', type: 'hospital' },
  { pattern: 'orthopedic', type: 'hospital' },
  { pattern: 'spine', type: 'hospital' },
  { pattern: 'surgical', type: 'hospital' },
  { pattern: 'dental', type: 'hospital' },
  { pattern: 'eye care', type: 'hospital' },
  { pattern: 'ivf', type: 'hospital' },
  { pattern: 'fertility', type: 'hospital' },

  // Named hospital chains
  { pattern: 'apollo', type: 'hospital' },
  { pattern: 'fortis', type: 'hospital' },
  { pattern: 'max health', type: 'hospital' },
  { pattern: 'medanta', type: 'hospital' },
  { pattern: 'manipal', type: 'hospital' },
  { pattern: 'narayana', type: 'hospital' },
  { pattern: 'shalby', type: 'hospital' },
  { pattern: 'sterling', type: 'hospital' },
  { pattern: 'wockhardt', type: 'hospital' },
  { pattern: 'kokilaben', type: 'hospital' },
  { pattern: 'lilavati', type: 'hospital' },
  { pattern: 'hinduja', type: 'hospital' },
  { pattern: 'breach candy', type: 'hospital' },
  { pattern: 'jaslok', type: 'hospital' },
  { pattern: 'arista', type: 'hospital' },
  { pattern: 'chintan ortho', type: 'hospital' },

  // Pharma companies
  { pattern: 'pharma', type: 'pharma' },
  { pattern: 'cadila', type: 'pharma' },
  { pattern: 'alkem', type: 'pharma' },
  { pattern: 'cipla', type: 'pharma' },
  { pattern: 'sun pharma', type: 'pharma' },
  { pattern: 'lupin', type: 'pharma' },
  { pattern: 'dr reddy', type: 'pharma' },
  { pattern: 'torrent pharma', type: 'pharma' },
  { pattern: 'glenmark', type: 'pharma' },
  { pattern: 'biocon', type: 'pharma' },
  { pattern: 'zydus', type: 'pharma' },
  { pattern: 'mankind', type: 'pharma' },
  { pattern: 'ipca', type: 'pharma' },
  { pattern: 'aurobindo', type: 'pharma' },
  { pattern: 'abbott', type: 'pharma' },
  { pattern: 'pfizer', type: 'pharma' },
  { pattern: 'novartis', type: 'pharma' },
  { pattern: 'johnson', type: 'pharma' },
  { pattern: 'medtronic', type: 'pharma' },
  { pattern: 'stryker', type: 'pharma' },
  { pattern: 'zimmer', type: 'pharma' },

  // CA/CS consulting
  { pattern: 'chartered accountant', type: 'consulting' },
  { pattern: 'audit', type: 'consulting' },
  { pattern: 'compliance', type: 'consulting' },
  { pattern: 'tax consult', type: 'consulting' },
  { pattern: 'advisory', type: 'consulting' },
]

// OD/CC Detection keywords
const OD_CC_KEYWORDS = [
  // Credit card payments
  'cred', 'cred_', 'credit card', 'cc payment', 'card payment',
  'amex', 'american express', 'diners',
  'sbi card', 'hdfc card', 'icici card', 'axis card', 'kotak card',
  'cardpay', 'bill desk', 'billdesk',
  // OD/CC interest & charges
  'od int', 'od charge', 'overdraft int', 'overdraft charge',
  'penal int', 'limit excess', 'cc int',
  'overdue charge', 'late payment',
]

// Investment keywords (positive signal)
const INVESTMENT_KEYWORDS = [
  'bse limited', 'bse ltd', 'nse ',
  'mutual fund', 'sip ', 'systematic invest',
  'cams', 'kfintech', 'karvy',
  'fd ', 'fixed deposit', 'term deposit',
  'ppf', 'nps', 'national pension',
  'sovereign gold', 'sgb',
  'rd ', 'recurring deposit',
]

// Insurance keywords
const INSURANCE_KEYWORDS = [
  'insurance', 'lic ', 'licahmedabad', 'lic of india',
  'icici prudential', 'icici pru', 'hdfc life', 'sbi life',
  'max life', 'tata aia', 'bajaj allianz', 'star health',
  'new india assurance', 'national insurance',
  'zurich kotak', 'kotak general', 'general insurance',
  'health insurance', 'term plan', 'endowment',
]

// Tax payment keywords
const TAX_KEYWORDS = [
  'income tax', 'advance tax', 'self assessment tax',
  'tds', 'tax deducted', 'gst', 'goods and service',
  'professional tax', 'property tax',
  'dtax', 'oltas', 'tin-nsdl',
]

// ============================================================================
// MAIN PARSER
// ============================================================================

export async function parseBankStatementExcel(
  downloadUrl: string
): Promise<BankStatementData> {
  try {
    const response = await fetch(downloadUrl)
    const arrayBuffer = await response.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    console.log('[Parser] Starting analysis...')
    console.log('[Parser] Sheets:', workbook.SheetNames.join(', '))

    // PHASE 1: Extract from summary sheets
    const summaryData = extractFromSummarySheets(workbook)

    // PHASE 2: ALWAYS deep scan transactions (summary alone is unreliable)
    console.log('[Parser] Performing transaction-level deep scan...')
    const txnScan = scanAllTransactions(workbook)

    // PHASE 3: Combine — transaction data overrides summary where available
    const totalEmiVerified = txnScan.emi_details.reduce((sum, e) => sum + e.amount, 0)

    const result: BankStatementData = {
      // From summary
      banking_vintage_months: summaryData.banking_vintage_months,
      abb: summaryData.abb,
      amc: summaryData.amc,
      min_balance: summaryData.min_balance,
      max_balance: summaryData.max_balance,
      closing_balance: summaryData.closing_balance,
      opening_balance: summaryData.opening_balance,
      bounces_6m: summaryData.bounces_6m,
      total_credits_6m: summaryData.total_credits_6m,
      total_debits_6m: summaryData.total_debits_6m,
      total_transactions: summaryData.total_transactions,
      credit_transactions: summaryData.credit_transactions,
      debit_transactions: summaryData.debit_transactions,
      average_transaction_size: summaryData.average_transaction_size,
      salary_credits: summaryData.salary_credits,
      recurring_income: summaryData.recurring_income,
      bank_name: summaryData.bank_name,
      account_type: summaryData.account_type,

      // EMI — USE TRANSACTION-VERIFIED if higher (summary undercounts)
      total_emi_payments: summaryData.total_emi_payments,
      total_emi_verified: totalEmiVerified,
      emi_details: txnScan.emi_details,

      // Live USL estimated from verified EMI count
      live_usl: Math.max(summaryData.live_usl, txnScan.emi_details.length),

      // From transaction scan (always)
      has_speculative_flows: txnScan.has_speculative_flows,
      professional_income: txnScan.professional_income,
      income_sources: txnScan.income_sources,
      od_cc_present: summaryData.od_cc_present || txnScan.od_cc_present,
      credit_card_present: txnScan.credit_card_present,
      tax_payments: txnScan.tax_payments,
      insurance_payments: txnScan.insurance_payments,
      investment_activity: txnScan.investment_activity,
      risk_flags: txnScan.risk_flags,

      // Not available from bank statement
      enquiries_6m: 0,
    }

    // Log results
    console.log('[Parser] ✅ Analysis complete')
    console.log(`[Parser] Bank: ${result.bank_name}`)
    console.log(`[Parser] ABB: ₹${result.abb.toLocaleString()}`)
    console.log(`[Parser] AMC: ₹${result.amc.toLocaleString()}`)
    console.log(`[Parser] Bounces: ${result.bounces_6m}`)
    console.log(`[Parser] EMI (summary): ₹${result.total_emi_payments.toLocaleString()}`)
    console.log(`[Parser] EMI (verified): ₹${result.total_emi_verified.toLocaleString()} (${result.emi_details.length} loans)`)
    result.emi_details.forEach(e =>
      console.log(`[Parser]   → ${e.lender}: ₹${e.amount.toLocaleString()}/month (${e.type}, day ${e.day_of_month})`)
    )
    console.log(`[Parser] Professional income: ₹${result.professional_income.toLocaleString()}`)
    console.log(`[Parser] Speculative flows: ${result.has_speculative_flows}`)
    console.log(`[Parser] OD/CC: ${result.od_cc_present} | Credit Card: ${result.credit_card_present}`)
    console.log(`[Parser] Tax: ${result.tax_payments} | Insurance: ${result.insurance_payments} | Investment: ${result.investment_activity}`)
    console.log(`[Parser] Live USL (estimated): ${result.live_usl}`)
    if (result.risk_flags.length > 0) {
      console.log(`[Parser] ⚠️ Risk flags: ${result.risk_flags.join(', ')}`)
    }

    return result

  } catch (error) {
    console.error('[Parser] Error:', error)
    throw new Error('Failed to parse bank statement')
  }
}

// ============================================================================
// PHASE 1: SUMMARY SHEET EXTRACTION
// ============================================================================

function extractFromSummarySheets(workbook: XLSX.WorkBook) {
  const result = {
    banking_vintage_months: 6,
    abb: 0,
    amc: 0,
    min_balance: 0,
    max_balance: 0,
    closing_balance: 0,
    opening_balance: 0,
    bounces_6m: 0,
    live_usl: 0,
    total_emi_payments: 0,
    salary_credits: false,
    total_credits_6m: 0,
    total_debits_6m: 0,
    total_transactions: 0,
    credit_transactions: 0,
    debit_transactions: 0,
    average_transaction_size: 0,
    recurring_income: 0,
    od_cc_present: false,
    bank_name: '',
    account_type: '',
  }

  // --- Account Summary Sheet (most accurate source for ABB, balances) ---
  const summarySheet = findSheet(workbook, ['Account Summary', 'Summary', 'Account Info'])
  if (summarySheet) {
    const data = XLSX.utils.sheet_to_json(summarySheet) as any[]
    for (const row of data) {
      const field = normalize(row['Field'] || row['Metric'] || row['Parameter'] || '')
      const value = row['Value'] || row['Amount'] || row['Detail'] || ''
      const numValue = parseNumeric(value)

      // Bank info
      if (field.includes('bank name') || field.includes('bank')) {
        result.bank_name = String(value).trim()
      }
      if (field.includes('account type')) {
        result.account_type = String(value).trim()
      }

      // Balances
      if (field.includes('average') && field.includes('balance')) {
        result.abb = numValue
      }
      if (field.includes('opening balance')) {
        result.opening_balance = numValue
      }
      if (field.includes('closing balance')) {
        result.closing_balance = numValue
      }
      if (field.includes('highest') || field.includes('maximum balance')) {
        result.max_balance = numValue
      }
      if ((field.includes('lowest') || field.includes('minimum balance')) && !field.includes('violation')) {
        result.min_balance = numValue
      }

      // Totals
      if (field.includes('total credit')) {
        result.total_credits_6m = numValue
      }
      if (field.includes('total debit')) {
        result.total_debits_6m = numValue
      }

      // Bounces
      if (field.includes('bounce') || field.includes('bounced')) {
        result.bounces_6m = numValue
      }

      // Overdraft
      if (field.includes('overdraft') && field.includes('occurrence')) {
        result.od_cc_present = numValue > 0
      }

      // Period
      if (field.includes('analysis period') || field.includes('period')) {
        const days = numValue
        if (days > 0) {
          result.banking_vintage_months = Math.round(days / 30)
        }
      }
    }
    console.log(`[Summary] Account: ${result.bank_name}, ABB=₹${result.abb.toLocaleString()}, Bounces=${result.bounces_6m}`)
  }

  // --- Banking Behaviour Sheet ---
  const behaviourSheet = findSheet(workbook, ['Banking Behaviour', 'Banking Behavior', 'Risk Metrics'])
  if (behaviourSheet) {
    const data = XLSX.utils.sheet_to_json(behaviourSheet) as any[]
    for (const row of data) {
      const metric = normalize(row['Metric'] || '')
      const value = parseNumeric(row['Count/Value'] || row['Value'] || 0)

      if (metric.includes('bounce')) {
        result.bounces_6m = Math.max(result.bounces_6m, value)
      }
      if (metric.includes('overdraft') && metric.includes('day')) {
        if (value > 0) result.od_cc_present = true
      }
    }
  }

  // --- Cash Flow Analysis Sheet ---
  const cashFlowSheet = findSheet(workbook, ['Cash Flow Analysis', 'Cash Flow', 'Monthly Flow'])
  if (cashFlowSheet) {
    const data = XLSX.utils.sheet_to_json(cashFlowSheet) as any[]

    let totalInflows = 0
    let totalOutflows = 0
    const minBalances: number[] = []

    for (const row of data) {
      const inflows = parseNumeric(row['Inflows'] || row['Total Inflows'] || 0)
      const outflows = parseNumeric(row['Outflows'] || row['Total Outflows'] || 0)
      const minBal = parseNumeric(row['Min Balance'] || row['Minimum Balance'] || 0)

      totalInflows += inflows
      totalOutflows += outflows
      if (minBal > 0) minBalances.push(minBal)
    }

    // Only use Cash Flow data if Account Summary didn't provide values
    if (result.banking_vintage_months <= 1 && data.length > 1) {
      result.banking_vintage_months = data.length
    }
    if (result.total_credits_6m === 0) result.total_credits_6m = Math.round(totalInflows)
    if (result.total_debits_6m === 0) result.total_debits_6m = Math.round(totalOutflows)
    if (result.min_balance === 0 && minBalances.length > 0) {
      result.min_balance = Math.round(Math.min(...minBalances))
    }

    const monthCount = data.length || 1
    result.amc = Math.round(totalInflows / monthCount)
  }

  // --- Income Analysis Sheet ---
  const incomeSheet = findSheet(workbook, ['Income Analysis', 'Income Summary', 'Credit Analysis'])
  if (incomeSheet) {
    const data = XLSX.utils.sheet_to_json(incomeSheet) as any[]
    let totalSalary = 0
    let totalOther = 0

    for (const row of data) {
      const salary = parseNumeric(row['Salary Credits'] || row['Salary'] || 0)
      const other = parseNumeric(row['Other Credits'] || row['Other Income'] || 0)
      totalSalary += salary
      totalOther += other
    }

    result.salary_credits = totalSalary > 0
    result.recurring_income = Math.round(totalOther / (data.length || 1))
  }

  // --- Expense Categorization Sheet ---
  const expenseSheet = findSheet(workbook, ['Expense Categorization', 'Expense Analysis', 'Expenses'])
  if (expenseSheet) {
    const data = XLSX.utils.sheet_to_json(expenseSheet) as any[]
    for (const row of data) {
      const category = normalize(row['Category'] || '')
      if (category.includes('loan') || category.includes('emi')) {
        const avg = parseNumeric(row['Average'] || row['Avg'] || 0)
        result.total_emi_payments += avg
      }
    }
    result.total_emi_payments = Math.round(result.total_emi_payments)
  }

  // --- Transaction Details (count only in Phase 1) ---
  const txnSheet = findSheet(workbook, ['Transaction Details', 'Transactions', 'Statement'])
  if (txnSheet) {
    const data = XLSX.utils.sheet_to_json(txnSheet) as any[]
    result.total_transactions = data.length
    for (const row of data) {
      if (parseNumeric(row['Credit'] || 0) > 0) result.credit_transactions++
      if (parseNumeric(row['Debit'] || 0) > 0) result.debit_transactions++
    }
    const totalCount = result.credit_transactions + result.debit_transactions
    if (totalCount > 0) {
      result.average_transaction_size = Math.round(
        (result.total_credits_6m + result.total_debits_6m) / totalCount
      )
    }
  }

  // --- Risk Assessment (USL estimation) ---
  const riskSheet = findSheet(workbook, ['Risk Assessment', 'Risk Assessment ', 'Risk Score'])
  if (riskSheet) {
    if (result.total_emi_payments > 0) {
      result.live_usl = Math.min(6, Math.ceil(result.total_emi_payments / 40000))
    }
  }

  return result
}

// ============================================================================
// PHASE 2: TRANSACTION-LEVEL DEEP SCAN
// ============================================================================

interface TxnScanResult {
  has_speculative_flows: boolean
  professional_income: number
  income_sources: IncomeSource[]
  emi_details: EMIDetail[]
  od_cc_present: boolean
  credit_card_present: boolean
  tax_payments: boolean
  insurance_payments: boolean
  investment_activity: boolean
  risk_flags: string[]
}

function scanAllTransactions(workbook: XLSX.WorkBook): TxnScanResult {
  const result: TxnScanResult = {
    has_speculative_flows: false,
    professional_income: 0,
    income_sources: [],
    emi_details: [],
    od_cc_present: false,
    credit_card_present: false,
    tax_payments: false,
    insurance_payments: false,
    investment_activity: false,
    risk_flags: [],
  }

  const txnSheet = findSheet(workbook, ['Transaction Details', 'Transactions', 'Statement'])
  if (!txnSheet) {
    console.log('[Deep Scan] No transaction sheet found — skipping')
    return result
  }

  const data = XLSX.utils.sheet_to_json(txnSheet) as any[]
  console.log(`[Deep Scan] Scanning ${data.length} transactions...`)

  // Collect recurring debit candidates for EMI detection
  const debitTracker: Map<string, { amounts: number[]; dates: Date[]; label: string }> = new Map()
  // Collect income sources
  const incomeTracker: Map<string, { total: number; count: number; type: IncomeSource['type'] }> = new Map()
  // Track speculative transaction details
  const speculativeDetails: string[] = []

  for (const row of data) {
    const rawDesc = String(row['Description'] || row['Narration'] || row['Particulars'] || row['Remarks'] || '')
    const desc = normalize(rawDesc)
    const credit = parseNumeric(row['Credit'] || row['Credit Amount'] || row['Cr'] || 0)
    const debit = parseNumeric(row['Debit'] || row['Debit Amount'] || row['Dr'] || 0)
    const dateStr = String(row['Date'] || row['Transaction Date'] || row['Txn Date'] || '')
    const date = parseDate(dateStr)
    const category = normalize(row['Category'] || '')

    // ── 1. SPECULATIVE FLOW DETECTION ──
    if (debit > 0 || credit > 0) {
      let isSpeculative = false
      for (const keyword of SPECULATIVE_KEYWORDS) {
        if (desc.includes(keyword)) {
          // Check if it's a false positive (mutual fund SIP, insurance, etc.)
          let excluded = false
          for (const excl of SPECULATIVE_EXCLUDE) {
            if (desc.includes(excl)) {
              excluded = true
              break
            }
          }
          if (!excluded) {
            isSpeculative = true
            speculativeDetails.push(`${keyword} (₹${(debit || credit).toLocaleString()})`)
            break
          }
        }
      }
      if (isSpeculative) {
        result.has_speculative_flows = true
      }
    }

    // ── 2. EMI DETECTION (debit-side) ──
    if (debit > 0) {
      // Check against known NBFC/lender names
      for (const lender of EMI_LENDER_KEYWORDS) {
        if (desc.includes(lender.pattern)) {
          trackDebit(debitTracker, lender.label, debit, date)
          break
        }
      }

      // Check EMI description keywords
      for (const keyword of EMI_DESCRIPTION_KEYWORDS) {
        if (desc.includes(keyword) || category.includes('emi')) {
          const label = extractEMILabel(rawDesc, keyword)
          trackDebit(debitTracker, label, debit, date)
          break
        }
      }

      // Check auto-debit patterns (ACH/NACH/SI) — these are typically EMIs or SIPs
      for (const pattern of AUTO_DEBIT_PATTERNS) {
        if (desc.includes(pattern)) {
          // Extract the beneficiary name from auto-debit
          const label = extractAutoDebitLabel(rawDesc)
          // Only track if amount > ₹1000 (filter out small SIPs)
          if (debit >= 1000 && label) {
            trackDebit(debitTracker, label, debit, date)
          }
          break
        }
      }
    }

    // ── 3. PROFESSIONAL INCOME DETECTION (credit-side) ──
    if (credit > 0) {
      for (const src of PROFESSIONAL_INCOME_KEYWORDS) {
        if (desc.includes(src.pattern)) {
          // Skip insurance payouts — they're not professional income
          if (desc.includes('insurance') && src.type !== 'hospital') continue

          const sourceName = extractSourceName(rawDesc, src.pattern)
          const existing = incomeTracker.get(sourceName)
          if (existing) {
            existing.total += credit
            existing.count++
          } else {
            incomeTracker.set(sourceName, { total: credit, count: 1, type: src.type })
          }
          result.professional_income += credit
          break
        }
      }
    }

    // ── 4. OD/CC DETECTION ──
    if (debit > 0) {
      for (const keyword of OD_CC_KEYWORDS) {
        if (desc.includes(keyword)) {
          result.od_cc_present = true
          // Specifically flag credit card
          if (keyword.includes('cred') || keyword.includes('card') ||
            keyword.includes('amex') || keyword.includes('diners') ||
            keyword.includes('sbi card') || keyword.includes('bill desk')) {
            result.credit_card_present = true
          }
          break
        }
      }
    }

    // ── 5. TAX PAYMENTS ──
    if (debit > 0 && !result.tax_payments) {
      for (const keyword of TAX_KEYWORDS) {
        if (desc.includes(keyword)) {
          result.tax_payments = true
          break
        }
      }
    }

    // ── 6. INSURANCE ──
    if (!result.insurance_payments) {
      for (const keyword of INSURANCE_KEYWORDS) {
        if (desc.includes(keyword)) {
          result.insurance_payments = true
          break
        }
      }
    }

    // ── 7. INVESTMENTS ──
    if (debit > 0 && !result.investment_activity) {
      for (const keyword of INVESTMENT_KEYWORDS) {
        if (desc.includes(keyword)) {
          result.investment_activity = true
          break
        }
      }
    }
  }

  // ── POST-PROCESSING: IDENTIFY RECURRING EMIs ──
  result.emi_details = identifyRecurringEMIs(debitTracker)

  // ── POST-PROCESSING: BUILD INCOME SOURCES ──
  for (const [name, data] of incomeTracker) {
    result.income_sources.push({
      name,
      type: data.type,
      total: Math.round(data.total),
      frequency: data.count,
    })
  }
  result.professional_income = Math.round(result.professional_income)

  // ── POST-PROCESSING: RISK FLAGS ──
  if (result.has_speculative_flows) {
    result.risk_flags.push(`Speculative flows detected: ${speculativeDetails.join(', ')}`)
  }
  if (result.credit_card_present) {
    result.risk_flags.push('Credit card usage detected')
  }

  // Log
  console.log('[Deep Scan] ✅ Complete')
  console.log(`[Deep Scan] Speculative: ${result.has_speculative_flows}`)
  console.log(`[Deep Scan] EMIs found: ${result.emi_details.length}`)
  console.log(`[Deep Scan] Professional income: ₹${result.professional_income.toLocaleString()} from ${result.income_sources.length} sources`)
  console.log(`[Deep Scan] Credit card: ${result.credit_card_present} | OD: ${result.od_cc_present}`)

  return result
}

// ============================================================================
// EMI IDENTIFICATION — GROUP RECURRING DEBITS
// ============================================================================

function trackDebit(
  tracker: Map<string, { amounts: number[]; dates: Date[]; label: string }>,
  label: string,
  amount: number,
  date: Date | null
) {
  const key = label.toLowerCase()
  const existing = tracker.get(key)
  if (existing) {
    existing.amounts.push(amount)
    if (date) existing.dates.push(date)
  } else {
    tracker.set(key, {
      amounts: [amount],
      dates: date ? [date] : [],
      label: label,
    })
  }
}

function identifyRecurringEMIs(
  tracker: Map<string, { amounts: number[]; dates: Date[]; label: string }>
): EMIDetail[] {
  const emis: EMIDetail[] = []

  for (const [, data] of tracker) {
    // Need at least 2 occurrences to consider it recurring
    if (data.amounts.length < 2) continue

    // Find the most common amount (within 5% tolerance)
    const amountGroups = groupByTolerance(data.amounts, 0.05)
    const largestGroup = amountGroups.sort((a, b) => b.length - a.length)[0]

    if (largestGroup.length >= 2) {
      const avgAmount = Math.round(largestGroup.reduce((a, b) => a + b, 0) / largestGroup.length)

      // Find typical day of month
      let dayOfMonth = 1
      if (data.dates.length > 0) {
        const days = data.dates.map(d => d.getDate())
        dayOfMonth = mode(days)
      }

      // Determine type
      let type: EMIDetail['type'] = 'inferred'
      if (data.label.toLowerCase().includes('ach') || data.label.toLowerCase().includes('nach')) {
        type = 'auto_debit'
      } else if (data.label.toLowerCase().includes('emi')) {
        type = 'manual'
      }

      emis.push({
        lender: data.label,
        amount: avgAmount,
        frequency: largestGroup.length,
        day_of_month: dayOfMonth,
        type,
      })
    }
  }

  // Sort by amount descending
  emis.sort((a, b) => b.amount - a.amount)

  return emis
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** Find a sheet by trying multiple name variations */
function findSheet(workbook: XLSX.WorkBook, names: string[]): XLSX.WorkSheet | null {
  for (const name of names) {
    // Exact match
    if (workbook.SheetNames.includes(name)) {
      return workbook.Sheets[name]
    }
    // Case-insensitive match
    const found = workbook.SheetNames.find(s => s.toLowerCase().trim() === name.toLowerCase().trim())
    if (found) {
      return workbook.Sheets[found]
    }
    // Partial match
    const partial = workbook.SheetNames.find(s => s.toLowerCase().includes(name.toLowerCase()))
    if (partial) {
      return workbook.Sheets[partial]
    }
  }
  return null
}

/** Normalize string for matching */
function normalize(str: string): string {
  return String(str).toLowerCase().trim()
}

/** Parse numeric value from various formats */
function parseNumeric(val: any): number {
  if (typeof val === 'number') return val
  const str = String(val).replace(/[₹,\s]/g, '').replace(/\(([^)]+)\)/, '-$1')
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

/** Extract EMI label from transaction description */
function extractEMILabel(description: string, matchedKeyword: string): string {
  // Try to extract a meaningful name from the description
  const desc = description.trim()

  // Pattern: "Used Car Loan XX58497 EMI"
  const loanMatch = desc.match(/([A-Za-z\s]+(?:loan|emi))/i)
  if (loanMatch) return loanMatch[1].trim()

  // Fallback: use first meaningful words
  const words = desc.split(/[\s/\-]+/).filter(w => w.length > 2).slice(0, 3)
  return words.join(' ') || matchedKeyword
}

/** Extract beneficiary from auto-debit descriptions */
function extractAutoDebitLabel(description: string): string {
  const desc = description.trim()

  // Pattern: "ACH/BAJAJ FINANCE LTD/..." or "ACH/BD-BSE Limited/..."
  const achMatch = desc.match(/(?:ACH|NACH|SI|ECS)[/\-](?:BD-)?([A-Za-z\s]+?)(?:[/\-]|$)/i)
  if (achMatch) {
    const name = achMatch[1].trim()
    // Skip very short or generic names
    if (name.length > 2 && !['bd', 'cr', 'dr'].includes(name.toLowerCase())) {
      return name
    }
  }

  // Fallback
  const parts = desc.split('/').filter(p => p.trim().length > 2)
  return parts[1]?.trim() || parts[0]?.trim() || 'Unknown Auto-Debit'
}

/** Extract source name from credit descriptions */
function extractSourceName(description: string, matchedPattern: string): string {
  const desc = description.trim()

  // Pattern: "NEFT-xxx-CHINTAN ORTHOPAEDIC HOSPITAL-..."
  const neftMatch = desc.match(/(?:NEFT|RTGS|IMPS)[/\-]\w+[/\-]([A-Za-z\s]+)/i)
  if (neftMatch) return neftMatch[1].trim().substring(0, 40)

  // Pattern: "INF/INFT/.../ARISTA SPINE"
  const infMatch = desc.match(/\/([A-Za-z\s]+)$/i)
  if (infMatch) return infMatch[1].trim()

  // Pattern: "CLG/CADILA PHARMACEUTICALS/..."
  const clgMatch = desc.match(/(?:CLG|MMT)[/]([A-Za-z\s]+)/i)
  if (clgMatch) return clgMatch[1].trim().substring(0, 40)

  return matchedPattern.charAt(0).toUpperCase() + matchedPattern.slice(1)
}

/** Group numbers by tolerance (e.g., 5% = amounts within 5% of each other) */
function groupByTolerance(numbers: number[], tolerance: number): number[][] {
  if (numbers.length === 0) return []

  const sorted = [...numbers].sort((a, b) => a - b)
  const groups: number[][] = [[sorted[0]]]

  for (let i = 1; i < sorted.length; i++) {
    const lastGroup = groups[groups.length - 1]
    const groupAvg = lastGroup.reduce((a, b) => a + b, 0) / lastGroup.length
    const diff = Math.abs(sorted[i] - groupAvg) / groupAvg

    if (diff <= tolerance) {
      lastGroup.push(sorted[i])
    } else {
      groups.push([sorted[i]])
    }
  }

  return groups
}

/** Find mode (most common value) in array */
function mode(arr: number[]): number {
  const counts = new Map<number, number>()
  for (const val of arr) {
    counts.set(val, (counts.get(val) || 0) + 1)
  }
  let maxCount = 0
  let modeVal = arr[0]
  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count
      modeVal = val
    }
  }
  return modeVal
}

/** Parse dates in various Indian bank formats */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null
  try {
    // YYYY-MM-DD (ISO)
    const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]))
    }

    // DD/MM/YYYY
    const slashMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (slashMatch) {
      return new Date(parseInt(slashMatch[3]), parseInt(slashMatch[2]) - 1, parseInt(slashMatch[1]))
    }

    // DD-MM-YYYY
    const dashMatch = dateStr.match(/(\d{2})-(\d{2})-(\d{4})/)
    if (dashMatch) {
      return new Date(parseInt(dashMatch[3]), parseInt(dashMatch[2]) - 1, parseInt(dashMatch[1]))
    }

    // DD-MMM-YYYY (e.g., 05-Aug-2025)
    const monthNames: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    }
    const mmmMatch = dateStr.match(/(\d{2})-([A-Za-z]{3})-(\d{4})/)
    if (mmmMatch) {
      const month = monthNames[mmmMatch[2].toLowerCase()]
      if (month !== undefined) {
        return new Date(parseInt(mmmMatch[3]), month, parseInt(mmmMatch[1]))
      }
    }

    // Excel serial date number
    if (/^\d+$/.test(dateStr.trim())) {
      const serial = parseInt(dateStr)
      if (serial > 40000 && serial < 50000) {
        // Excel date serial
        const excelEpoch = new Date(1899, 11, 30)
        const msPerDay = 86400000
        return new Date(excelEpoch.getTime() + serial * msPerDay)
      }
    }

    return new Date(dateStr)
  } catch {
    return null
  }
}