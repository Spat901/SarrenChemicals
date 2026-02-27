import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import {
  getCatalog,
  saveCatalog,
  addCategoryToCatalog,
  updateCategoryInCatalog,
  deleteCategoryFromCatalog,
  addProductToCategory,
  updateProductInCatalog,
  deleteProductFromCatalog,
  isCategoryEmpty,
} from '@/lib/products'

export async function GET() {
  const catalog = await getCatalog()
  return NextResponse.json(catalog)
}

export async function POST(req: NextRequest) {
  const body = await req.json() as
    | { type: 'category'; title: string }
    | { type: 'product'; categoryId: string; label: string; name: string; desc: string }

  let catalog = await getCatalog()

  if (body.type === 'category') {
    catalog = addCategoryToCatalog(catalog, body.title)
  } else {
    const { categoryId, label, name, desc } = body
    catalog = addProductToCategory(catalog, categoryId, { label, name, desc })
  }

  await saveCatalog(catalog)
  revalidateTag('products', 'max')
  return NextResponse.json(catalog)
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as
    | { type: 'category'; id: string; title: string }
    | { type: 'product'; id: string; label?: string; name?: string; desc?: string }

  let catalog = await getCatalog()

  if (body.type === 'category') {
    catalog = updateCategoryInCatalog(catalog, body.id, body.title)
  } else {
    const { id, ...updates } = body
    catalog = updateProductInCatalog(catalog, id, updates)
  }

  await saveCatalog(catalog)
  revalidateTag('products', 'max')
  return NextResponse.json(catalog)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (!type || !id) {
    return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
  }

  let catalog = await getCatalog()

  if (type === 'category') {
    if (!isCategoryEmpty(catalog, id)) {
      return NextResponse.json(
        { error: 'Cannot delete a category that contains products' },
        { status: 400 }
      )
    }
    catalog = deleteCategoryFromCatalog(catalog, id)
  } else {
    catalog = deleteProductFromCatalog(catalog, id)
  }

  await saveCatalog(catalog)
  revalidateTag('products', 'max')
  return NextResponse.json(catalog)
}
