import { kv } from '@vercel/kv'
import { v4 as uuidv4 } from 'uuid'

export interface Product {
  id: string
  label: string
  name: string
  desc: string
}

export interface Category {
  id: string
  title: string
  products: Product[]
}

export interface ProductCatalog {
  categories: Category[]
}

// ── Pure functions (no I/O, fully testable) ──────────────────────────────────

export function addCategoryToCatalog(
  catalog: ProductCatalog,
  title: string
): ProductCatalog {
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return {
    categories: [...catalog.categories, { id, title, products: [] }],
  }
}

export function updateCategoryInCatalog(
  catalog: ProductCatalog,
  categoryId: string,
  title: string
): ProductCatalog {
  return {
    categories: catalog.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, title } : cat
    ),
  }
}

export function deleteCategoryFromCatalog(
  catalog: ProductCatalog,
  categoryId: string
): ProductCatalog {
  return {
    categories: catalog.categories.filter((cat) => cat.id !== categoryId),
  }
}

export function addProductToCategory(
  catalog: ProductCatalog,
  categoryId: string,
  product: Omit<Product, 'id'>
): ProductCatalog {
  return {
    categories: catalog.categories.map((cat) =>
      cat.id === categoryId
        ? { ...cat, products: [...cat.products, { ...product, id: uuidv4() }] }
        : cat
    ),
  }
}

export function updateProductInCatalog(
  catalog: ProductCatalog,
  productId: string,
  updates: Partial<Omit<Product, 'id'>>
): ProductCatalog {
  return {
    categories: catalog.categories.map((cat) => ({
      ...cat,
      products: cat.products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      ),
    })),
  }
}

export function deleteProductFromCatalog(
  catalog: ProductCatalog,
  productId: string
): ProductCatalog {
  return {
    categories: catalog.categories.map((cat) => ({
      ...cat,
      products: cat.products.filter((p) => p.id !== productId),
    })),
  }
}

/**
 * Returns true if the category has no products.
 * Also returns true if the categoryId does not exist — callers should validate the ID first.
 */
export function isCategoryEmpty(catalog: ProductCatalog, categoryId: string): boolean {
  const cat = catalog.categories.find((c) => c.id === categoryId)
  return cat ? cat.products.length === 0 : true
}

// ── KV I/O (thin wrappers — not tested directly) ─────────────────────────────

const KV_KEY = 'products'

export async function getCatalog(): Promise<ProductCatalog> {
  const data = await kv.get<ProductCatalog>(KV_KEY)
  return data ?? { categories: [] }
}

export async function saveCatalog(catalog: ProductCatalog): Promise<void> {
  await kv.set(KV_KEY, catalog)
}
