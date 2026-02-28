'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import type { PdfCatalog, PdfDocument } from '@/lib/pdfs'

export default function AdminPdfsPage() {
  const [catalog, setCatalog] = useState<PdfCatalog | null>(null)
  const [uploading, setUploading] = useState(false)
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/pdfs')
      .then((r) => r.json())
      .then(setCatalog)
  }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('name', name)
    formData.append('file', file)

    const res = await fetch('/api/admin/pdfs', { method: 'POST', body: formData })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Upload failed')
      setUploading(false)
      return
    }

    const data = await res.json()
    setCatalog(data)
    setName('')
    setFile(null)
    setUploading(false)
    // Reset file input
    const input = document.getElementById('pdf-file') as HTMLInputElement
    if (input) input.value = ''
  }

  async function handleDelete(id: string, docName: string) {
    if (!confirm(`Delete "${docName}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/pdfs?id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    setCatalog(data)
  }

  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-[900px] mx-auto px-8 py-12">
        <h1 className="text-[32px] mb-8">Documents</h1>

        {/* Upload form */}
        <div className="bg-white border border-border rounded p-6 mb-8">
          <h2 className="text-[18px] font-semibold mb-4">Upload PDF</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="label mb-1.5 block" htmlFor="pdf-name">Display Name</label>
              <input
                id="pdf-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Line Card 2026"
                className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy"
              />
            </div>
            <div>
              <label className="label mb-1.5 block" htmlFor="pdf-file">PDF File</label>
              <input
                id="pdf-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full border border-border rounded px-4 py-2.5 text-[15px] text-steel file:mr-4 file:py-1 file:px-4 file:rounded file:border file:border-border file:text-[13px] file:font-medium file:text-charcoal file:bg-offwhite cursor-pointer"
              />
            </div>
            {error && <p className="text-red-600 text-[14px]">{error}</p>}
            <button
              type="submit"
              disabled={uploading || !name || !file}
              className="btn btn-primary h-10 text-[14px] disabled:opacity-50"
            >
              {uploading ? 'Uploading\u2026' : 'Upload'}
            </button>
          </form>
        </div>

        {/* Document list */}
        {!catalog ? (
          <p className="text-steel">Loading\u2026</p>
        ) : catalog.documents.length === 0 ? (
          <p className="text-steel">No documents uploaded yet.</p>
        ) : (
          <div className="bg-white border border-border rounded divide-y divide-border">
            {catalog.documents.map((doc) => (
              <DocumentRow key={doc.id} doc={doc} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentRow({
  doc,
  onDelete,
}: {
  doc: PdfDocument
  onDelete: (id: string, name: string) => void
}) {
  const date = new Date(doc.uploadedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div>
        <p className="font-medium text-navy">{doc.name}</p>
        <p className="text-[13px] text-steel mt-0.5">Uploaded {date}</p>
      </div>
      <div className="flex gap-3 items-center">
        <a
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[14px] text-navy font-medium hover:underline"
        >
          View
        </a>
        <button
          className="text-[14px] text-steel hover:text-red-600 transition-colors"
          onClick={() => onDelete(doc.id, doc.name)}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
