// utils/extraction-cache.ts
// File-based cache for Tejas API extraction results to avoid re-calling APIs on retry

import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), 'uploads', '.cache')

interface CachedExtractions {
    sessionId: string
    createdAt: string
    aadhaar: any | null
    pan: any | null
    bankStatement: any | null
}

function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true })
    }
}

function getCachePath(sessionId: string): string {
    // Sanitize sessionId to prevent path traversal
    const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, '')
    return path.join(CACHE_DIR, `${safe}.json`)
}

export function getCachedExtraction(sessionId: string): CachedExtractions | null {
    try {
        const filePath = getCachePath(sessionId)
        if (!fs.existsSync(filePath)) return null

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

        // Expire cache after 30 minutes
        const createdAt = new Date(data.createdAt).getTime()
        if (Date.now() - createdAt > 30 * 60 * 1000) {
            fs.unlinkSync(filePath)
            return null
        }

        return data
    } catch {
        return null
    }
}

export function saveCachedExtraction(
    sessionId: string,
    type: 'aadhaar' | 'pan' | 'bankStatement',
    data: any
) {
    ensureCacheDir()
    const filePath = getCachePath(sessionId)

    let existing: CachedExtractions
    try {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch {
        existing = {
            sessionId,
            createdAt: new Date().toISOString(),
            aadhaar: null,
            pan: null,
            bankStatement: null,
        }
    }

    existing[type] = data
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8')
}

export function clearCache(sessionId: string) {
    try {
        const filePath = getCachePath(sessionId)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }
    } catch {
        // Ignore cleanup errors
    }
}
