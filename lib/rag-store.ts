import { type DocumentChunk, calculateTFIDF } from "./pdf-processor"

export interface StoredChunk extends DocumentChunk {
  // Removed embedding field - using TF-IDF instead
}

export interface RetrievalResult {
  chunks: StoredChunk[]
  hasRelevantResults: boolean
  relevanceScore: number
}

class RAGStore {
  private chunks: StoredChunk[] = []
  private isInitialized = false
  private relevanceThreshold = 0.1 // Added relevance threshold to determine if results are meaningful

  async addChunks(chunks: DocumentChunk[]): Promise<void> {
    this.chunks = chunks
    this.isInitialized = true
  }

  async retrieveRelevant(query: string, topK = 5): Promise<RetrievalResult> {
    if (!this.isInitialized || this.chunks.length === 0) {
      return {
        chunks: [],
        hasRelevantResults: false,
        relevanceScore: 0,
      }
    }

    const chunkTexts = this.chunks.map((chunk) => chunk.text)
    const scores = calculateTFIDF(query, chunkTexts)

    const rankedChunks = this.chunks
      .map((chunk, index) => ({
        chunk,
        score: scores[index],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)

    const topScore = rankedChunks.length > 0 ? rankedChunks[0].score : 0
    const avgScore =
      rankedChunks.length > 0 ? rankedChunks.reduce((sum, item) => sum + item.score, 0) / rankedChunks.length : 0
    const hasRelevantResults = topScore >= this.relevanceThreshold

    return {
      chunks: rankedChunks.map((item) => item.chunk),
      hasRelevantResults,
      relevanceScore: topScore,
    }
  }

  getChunks(): StoredChunk[] {
    return this.chunks
  }

  clear(): void {
    this.chunks = []
    this.isInitialized = false
  }

  isReady(): boolean {
    return this.isInitialized && this.chunks.length > 0
  }
}

export const ragStore = new RAGStore()
