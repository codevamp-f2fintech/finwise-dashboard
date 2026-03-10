// utils/tejas-api.ts

const TEJAS_API_KEY = process.env.TEJAS_API_KEY!
const TEJAS_API_SECRET = process.env.TEJAS_API_SECRET!
const TEJAS_BASE_URL = 'https://api-tejas.finhub.habilelabs.io/v1'

interface AadhaarResponse {
  status: number
  message: string
  statusMessage: string
  totalPages: number
  detectedDetails: Array<{
    VID: string
    aadhaarNumber: string
    address: string
    dateOfBirth: string
    fatherOrHusbandName: string
    gender: string
    name: string
    pincode: string
  }>
}

interface PANResponse {
  status: number
  message: string
  statusMessage: string
  detectedDetails: Array<{
    name: string
    dateOfBirth: string
    panCardNumber: string
  }>
}

interface BankStatementResponse {
  status: number
  message: string
  totalPages: number
  downloadUrl: string
  statusMessage: string
}

export async function extractAadhaar(file: File): Promise<AadhaarResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${TEJAS_BASE_URL}/aadhaar-ocr`, {
    method: 'POST',
    headers: {
      'api_key': TEJAS_API_KEY,
      'api_secret': TEJAS_API_SECRET,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Aadhaar extraction failed')
  }

  return response.json()
}

export async function extractPAN(file: File): Promise<PANResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${TEJAS_BASE_URL}/pan-ocr`, {
    method: 'POST',
    headers: {
      'api_key': TEJAS_API_KEY,
      'api_secret': TEJAS_API_SECRET,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'PAN extraction failed')
  }

  return response.json()
}

export async function analyzeBankStatement(file: File): Promise<BankStatementResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${TEJAS_BASE_URL}/bank-statement-analyzer`, {
    method: 'POST',
    headers: {
      'api_key': TEJAS_API_KEY,
      'api_secret': TEJAS_API_SECRET,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Bank statement analysis failed')
  }

  return response.json()
}