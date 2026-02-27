import { describe, it, expect } from 'vitest'
import {
  addDocumentToCatalog,
  removeDocumentFromCatalog,
  findDocument,
  type PdfCatalog,
  type PdfDocument,
} from '../pdfs'

const doc1: PdfDocument = {
  id: 'doc1',
  name: 'Line Card 2026',
  url: 'https://example.com/line-card.pdf',
  uploadedAt: '2026-02-27T00:00:00Z',
}

const doc2: PdfDocument = {
  id: 'doc2',
  name: 'Capability Statement',
  url: 'https://example.com/capability.pdf',
  uploadedAt: '2026-02-27T00:00:00Z',
}

const catalog: PdfCatalog = { documents: [doc1, doc2] }

describe('addDocumentToCatalog', () => {
  it('adds a document to the catalog', () => {
    const empty: PdfCatalog = { documents: [] }
    const result = addDocumentToCatalog(empty, doc1)
    expect(result.documents).toHaveLength(1)
    expect(result.documents[0].name).toBe('Line Card 2026')
  })

  it('does not mutate the original', () => {
    const empty: PdfCatalog = { documents: [] }
    addDocumentToCatalog(empty, doc1)
    expect(empty.documents).toHaveLength(0)
  })
})

describe('removeDocumentFromCatalog', () => {
  it('removes the specified document', () => {
    const result = removeDocumentFromCatalog(catalog, 'doc1')
    expect(result.documents).toHaveLength(1)
    expect(result.documents[0].id).toBe('doc2')
  })

  it('does not mutate the original', () => {
    removeDocumentFromCatalog(catalog, 'doc1')
    expect(catalog.documents).toHaveLength(2)
  })
})

describe('findDocument', () => {
  it('returns the matching document', () => {
    const result = findDocument(catalog, 'doc1')
    expect(result?.name).toBe('Line Card 2026')
  })

  it('returns undefined for non-existent id', () => {
    expect(findDocument(catalog, 'nope')).toBeUndefined()
  })
})
