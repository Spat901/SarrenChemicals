import { kv } from './kv'
import { del } from '@vercel/blob'

export interface PdfDocument {
  id: string
  name: string
  url: string
  uploadedAt: string // ISO 8601
}

export interface PdfCatalog {
  documents: PdfDocument[]
}

// ── Pure functions ────────────────────────────────────────────────────────────

export function addDocumentToCatalog(
  catalog: PdfCatalog,
  doc: PdfDocument
): PdfCatalog {
  return { documents: [...catalog.documents, doc] }
}

export function removeDocumentFromCatalog(
  catalog: PdfCatalog,
  id: string
): PdfCatalog {
  return { documents: catalog.documents.filter((d) => d.id !== id) }
}

export function findDocument(catalog: PdfCatalog, id: string): PdfDocument | undefined {
  return catalog.documents.find((d) => d.id === id)
}

// ── KV I/O ───────────────────────────────────────────────────────────────────

const KV_KEY = 'pdfs'

export async function getPdfCatalog(): Promise<PdfCatalog> {
  const data = await kv.get<PdfCatalog>(KV_KEY)
  return data ?? { documents: [] }
}

export async function savePdfCatalog(catalog: PdfCatalog): Promise<void> {
  await kv.set(KV_KEY, catalog)
}

export async function deletePdfBlob(url: string): Promise<void> {
  await del(url)
}
