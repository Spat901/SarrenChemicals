import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'
import { revalidateTag } from 'next/cache'
import {
  getPdfCatalog,
  savePdfCatalog,
  addDocumentToCatalog,
  removeDocumentFromCatalog,
  findDocument,
  deletePdfBlob,
} from '@/lib/pdfs'

export async function GET() {
  const catalog = await getPdfCatalog()
  return NextResponse.json(catalog)
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const name = formData.get('name') as string
  const file = formData.get('file') as File

  if (!name || !file) {
    return NextResponse.json({ error: 'Missing name or file' }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
  }

  const filename = `${uuidv4()}.pdf`
  const { url } = await put(filename, file, { access: 'public' })

  let catalog = await getPdfCatalog()
  catalog = addDocumentToCatalog(catalog, {
    id: uuidv4(),
    name,
    url,
    uploadedAt: new Date().toISOString(),
  })

  await savePdfCatalog(catalog)
  revalidateTag('pdfs', 'max')
  return NextResponse.json(catalog)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  let catalog = await getPdfCatalog()
  const doc = findDocument(catalog, id)

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  await deletePdfBlob(doc.url)
  catalog = removeDocumentFromCatalog(catalog, id)

  await savePdfCatalog(catalog)
  revalidateTag('pdfs', 'max')
  return NextResponse.json(catalog)
}
