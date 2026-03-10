/**
 * RAG Store using LangChain with Local Transformers.js Embeddings
 * 
 * This module handles PDF document storage and retrieval for the chat assistant.
 * Uses LangChain VectorStore with Transformers.js - NO external API calls.
 */

import { VectorStore } from "@langchain/core/vectorstores"
import { Document } from "@langchain/core/documents"
import { Embeddings, EmbeddingsParams } from "@langchain/core/embeddings"

// Dynamic import for transformers (to avoid SSR issues)
let pipeline: any = null
let embeddingPipeline: any = null

async function getEmbeddingPipeline() {
  if (embeddingPipeline) return embeddingPipeline
  
  if (!pipeline) {
    const { pipeline: transformersPipeline } = await import("@xenova/transformers")
    pipeline = transformersPipeline
  }
  
  // Use a small, fast embedding model
  embeddingPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
    quantized: true,
  })
  
  return embeddingPipeline
}

// Custom LangChain Embeddings class using Transformers.js
class TransformersEmbeddings extends Embeddings {
  private pipelinePromise: Promise<any> | null = null
  
  constructor(params?: EmbeddingsParams) {
    super(params || {})
  }
  
  private async getPipeline() {
    if (!this.pipelinePromise) {
      this.pipelinePromise = getEmbeddingPipeline()
    }
    return this.pipelinePromise
  }
  
  async embedDocuments(documents: string[]): Promise<number[][]> {
    const pipe = await this.getPipeline()
    const embeddings: number[][] = []
    
    for (const doc of documents) {
      const output = await pipe(doc, { pooling: "mean", normalize: true })
      embeddings.push(Array.from(output.data))
    }
    
    return embeddings
  }
  
  async embedQuery(query: string): Promise<number[]> {
    const pipe = await this.getPipeline()
    const output = await pipe(query, { pooling: "mean", normalize: true })
    return Array.from(output.data)
  }
}

// Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Custom In-Memory Vector Store using LangChain's VectorStore base
class InMemoryVectorStore extends VectorStore {
  private memoryVectors: { content: string; embedding: number[]; metadata: Record<string, any> }[] = []

  constructor(embeddings: Embeddings) {
    super(embeddings, {})
  }

  _vectorstoreType(): string {
    return "memory"
  }

  async addDocuments(documents: Document[]): Promise<void> {
    const texts = documents.map(doc => doc.pageContent)
    const embeddings = await this.embeddings.embedDocuments(texts)
    await this.addVectors(embeddings, documents)
  }

  async addVectors(vectors: number[][], documents: Document[]): Promise<void> {
    for (let i = 0; i < documents.length; i++) {
      this.memoryVectors.push({
        content: documents[i].pageContent,
        embedding: vectors[i],
        metadata: documents[i].metadata,
      })
    }
  }

  async similaritySearchVectorWithScore(query: number[], k: number): Promise<[Document, number][]> {
    const results = this.memoryVectors
      .map(vector => ({
        document: new Document({ pageContent: vector.content, metadata: vector.metadata }),
        score: cosineSimilarity(query, vector.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k)

    return results.map(r => [r.document, r.score])
  }

  static async fromDocuments(docs: Document[], embeddings: Embeddings): Promise<InMemoryVectorStore> {
    const store = new InMemoryVectorStore(embeddings)
    await store.addDocuments(docs)
    return store
  }
}

export interface DocumentChunk {
  text: string
  metadata?: Record<string, unknown>
}

export interface StoredChunk extends DocumentChunk {
  score?: number
}

export interface RetrievalResult {
  chunks: StoredChunk[]
  hasRelevantResults: boolean
  relevanceScore: number
}

class RAGStore {
  private vectorStore: InMemoryVectorStore | null = null
  private embeddings: TransformersEmbeddings | null = null
  private chunks: DocumentChunk[] = []
  private isInitialized = false
  private relevanceThreshold = 0.3

  async addChunks(newChunks: DocumentChunk[]): Promise<void> {
    console.log("[RAGStore] Adding", newChunks.length, "chunks with LangChain")
    
    this.chunks = newChunks

    try {
      // Create embeddings instance
      this.embeddings = new TransformersEmbeddings()

      // Create LangChain documents
      const documents = newChunks.map((chunk, index) => 
        new Document({
          pageContent: chunk.text,
          metadata: { ...chunk.metadata, index },
        })
      )

      // Create custom InMemoryVectorStore
      this.vectorStore = await InMemoryVectorStore.fromDocuments(documents, this.embeddings)

      this.isInitialized = true
      console.log("[RAGStore] LangChain vector store initialized with", newChunks.length, "documents")
    } catch (error) {
      console.error("[RAGStore] Failed to initialize vector store:", error)
      this.isInitialized = true // Mark as initialized to prevent retries
    }
  }

  async retrieveRelevant(query: string, topK = 5): Promise<RetrievalResult> {
    if (!this.isInitialized || !this.vectorStore) {
      return {
        chunks: [],
        hasRelevantResults: false,
        relevanceScore: 0,
      }
    }

    try {
      // Use LangChain similarity search
      const results = await this.vectorStore.similaritySearchWithScore(query, topK)

      const chunks: StoredChunk[] = results.map(([doc, score]) => ({
        text: doc.pageContent,
        metadata: doc.metadata,
        score,
      }))

      const topScore = chunks.length > 0 ? (chunks[0].score || 0) : 0
      const hasRelevantResults = topScore >= this.relevanceThreshold

      console.log("[RAGStore] LangChain search found", chunks.length, "results, top score:", topScore.toFixed(3))

      return {
        chunks,
        hasRelevantResults,
        relevanceScore: topScore,
      }
    } catch (error) {
      console.error("[RAGStore] Search error:", error)
      return {
        chunks: [],
        hasRelevantResults: false,
        relevanceScore: 0,
      }
    }
  }

  getChunks(): StoredChunk[] {
    return this.chunks
  }

  clear(): void {
    this.chunks = []
    this.vectorStore = null
    this.isInitialized = false
  }

  isReady(): boolean {
    return this.isInitialized && this.vectorStore !== null
  }
}

export const ragStore = new RAGStore()
