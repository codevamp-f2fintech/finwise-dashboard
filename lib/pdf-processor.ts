let pdfjsLib: any = null;

// Load PDF.js only in the browser
if (typeof window !== "undefined") {
  (async () => {
    const pdfjs = await import("pdfjs-dist/build/pdf");
    pdfjsLib = pdfjs;
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  })();
}

export interface DocumentChunk {
  id: string;
  text: string;
  pageNumber: number;
  chunkIndex: number;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  if (typeof window === "undefined" || !pdfjsLib) {
    console.warn("PDF.js is not available on the server side.");
    return "";
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += `\n[Page ${i}]\n${pageText}`;
  }

  return fullText;
}

export function chunkText(text: string, chunkSize = 500, overlap = 100): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);

  let currentChunk = "";
  let chunkIndex = 0;
  let pageNumber = 1;

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        id: `chunk-${chunkIndex}`,
        text: currentChunk.trim(),
        pageNumber,
        chunkIndex,
      });

      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + " " + sentence;
      chunkIndex++;
    } else {
      currentChunk += " " + sentence;
    }

    if (text.includes(`[Page ${pageNumber + 1}]`)) {
      pageNumber++;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      id: `chunk-${chunkIndex}`,
      text: currentChunk.trim(),
      pageNumber,
      chunkIndex,
    });
  }

  return chunks;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function calculateTFIDF(query: string, documents: string[]): number[] {
  const queryTokens = tokenize(query);
  const allDocs = documents.map((doc) => tokenize(doc));

  const idf: { [key: string]: number } = {};
  for (const token of queryTokens) {
    const docsWithToken = allDocs.filter((doc) => doc.includes(token)).length;
    idf[token] = Math.log(documents.length / (docsWithToken + 1));
  }

  return allDocs.map((docTokens) => {
    let score = 0;
    for (const token of queryTokens) {
      const tf = docTokens.filter((t) => t === token).length / docTokens.length;
      score += tf * (idf[token] || 0);
    }
    return score;
  });
}