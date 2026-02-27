# Admin Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a password-protected `/admin` panel in the Next.js app allowing the client to manage the product catalog and upload PDFs without touching code or Vercel.

**Architecture:** Custom `/admin` route group with its own layout (no public Nav/Footer). Products and PDF metadata stored in Vercel KV. PDF files stored in Vercel Blob. Auth via iron-session signed cookie. Public pages fetch from KV at request time with ISR cache revalidation.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, @vercel/kv, @vercel/blob, iron-session, Vitest

---

## Prerequisites

Before starting, provision two Vercel services in the Vercel dashboard:
1. **Vercel KV** — Storage → Create Database → KV. Connect to project. Env vars auto-set: `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`.
2. **Vercel Blob** — Storage → Create Blob Store. Connect to project. Env var auto-set: `BLOB_READ_WRITE_TOKEN`.

Then add manually in Vercel environment variables:
- `ADMIN_PASSWORD` — the client's login password (any strong string)
- `SESSION_SECRET` — random 32+ char string (e.g. `openssl rand -hex 32`)

---

## Task 1: Install Dependencies and Set Up Testing

**Files:**
- Modify: `sarren-next/package.json`
- Create: `sarren-next/vitest.config.ts`
- Create: `sarren-next/.env.local` (gitignored — local dev only)

**Step 1: Install runtime dependencies**

```bash
cd sarren-next
npm install @vercel/kv @vercel/blob iron-session
```

Expected: packages added to `node_modules`, `package-lock.json` updated.

**Step 2: Install test dependencies**

```bash
npm install --save-dev vitest @vitest/coverage-v8
```

**Step 3: Add test script to package.json**

In `package.json`, add to the `scripts` section:
```json
"test": "vitest run",
"test:watch": "vitest"
```

**Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 5: Create .env.local with placeholder values**

```bash
# Admin Panel
ADMIN_PASSWORD=change-me-before-deploying
SESSION_SECRET=change-me-32-chars-minimum-random

# Vercel KV (auto-populated when KV is provisioned in Vercel)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=

# Vercel Blob (auto-populated when Blob is provisioned in Vercel)
BLOB_READ_WRITE_TOKEN=

# Email (existing)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CONTACT_EMAIL=info@sarrenchemicals.com
```

**Step 6: Verify vitest runs (no tests yet)**

```bash
npm test
```

Expected: `No test files found` — that's fine.

**Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add admin panel dependencies and test setup"
```

---

## Task 2: Restructure Routes for Separate Admin Layout

Currently `src/app/layout.tsx` wraps all pages with `<Nav />` and `<Footer />`. The admin panel needs its own layout without those. The fix is to move public pages into a `(public)` route group.

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/(public)/layout.tsx`
- Move (not recreate): all public page directories into `src/app/(public)/`

**Step 1: Understand the current structure**

Current `src/app/` contains:
```
about/
api/
contact/
favicon.ico
globals.css
layout.tsx      ← has Nav + Footer
logistics/
page.tsx        ← homepage
products/
sell-surplus/
```

**Step 2: Create the (public) route group directory**

```bash
mkdir -p src/app/\(public\)
```

**Step 3: Move public page directories into (public)**

```bash
mv src/app/about src/app/\(public\)/about
mv src/app/contact src/app/\(public\)/contact
mv src/app/logistics src/app/\(public\)/logistics
mv src/app/products src/app/\(public\)/products
mv src/app/sell-surplus src/app/\(public\)/sell-surplus
mv src/app/page.tsx src/app/\(public\)/page.tsx
```

Note: `api/`, `favicon.ico`, `globals.css`, and `layout.tsx` stay at the root level.

**Step 4: Create (public)/layout.tsx with Nav + Footer**

Create `src/app/(public)/layout.tsx`:

```tsx
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
```

**Step 5: Simplify root layout.tsx**

Replace `src/app/layout.tsx` content with:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Sarren Chemicals — Industrial Chemical Distribution',
    template: '%s — Sarren Chemicals',
  },
  description: 'Buying and selling surplus, aged, and off-spec industrial chemicals since 1997. Inquiry-only pricing. Complete supplier confidentiality.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        {children}
      </body>
    </html>
  )
}
```

**Step 6: Verify the dev server still works**

```bash
npm run dev
```

Navigate to `http://localhost:3000` — homepage should render with Nav and Footer as before. All public routes should still work at the same URLs.

**Step 7: Commit**

```bash
git add src/app/
git commit -m "refactor: move public pages into (public) route group for admin layout isolation"
```

---

## Task 3: Session Library

**Files:**
- Create: `src/lib/session.ts`

**Step 1: Create src/lib/session.ts**

```typescript
import type { IronSessionOptions } from 'iron-session'

export interface SessionData {
  isLoggedIn: boolean
}

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'sarren-admin',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}
```

**Step 2: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat: add iron-session config for admin auth"
```

---

## Task 4: Products Library — Pure Functions + KV I/O

Split into two layers: pure data manipulation (testable) and KV I/O (thin wrappers).

**Files:**
- Create: `src/lib/products.ts`

**Step 1: Create src/lib/products.ts**

```typescript
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
  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
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
```

Note: `uuid` package is needed. Install it:

```bash
npm install uuid
npm install --save-dev @types/uuid
```

**Step 2: Commit**

```bash
git add src/lib/products.ts package.json package-lock.json
git commit -m "feat: add products library with pure data functions and KV I/O"
```

---

## Task 5: Tests for Products Pure Functions

**Files:**
- Create: `src/lib/__tests__/products.test.ts`

**Step 1: Create the test file**

```typescript
import { describe, it, expect } from 'vitest'
import {
  addCategoryToCatalog,
  updateCategoryInCatalog,
  deleteCategoryFromCatalog,
  addProductToCategory,
  updateProductInCatalog,
  deleteProductFromCatalog,
  isCategoryEmpty,
  type ProductCatalog,
} from '../products'

const emptyCatalog: ProductCatalog = { categories: [] }

const sampleCatalog: ProductCatalog = {
  categories: [
    {
      id: 'resins',
      title: 'Resins & Polymers',
      products: [
        { id: 'p1', label: 'Resin', name: 'Alkyd Resin', desc: 'Test desc' },
        { id: 'p2', label: 'Resin', name: 'Acrylic Emulsion', desc: 'Test desc 2' },
      ],
    },
    {
      id: 'solvents',
      title: 'Solvents',
      products: [],
    },
  ],
}

describe('addCategoryToCatalog', () => {
  it('adds a new category', () => {
    const result = addCategoryToCatalog(emptyCatalog, 'Resins & Polymers')
    expect(result.categories).toHaveLength(1)
    expect(result.categories[0].title).toBe('Resins & Polymers')
    expect(result.categories[0].products).toEqual([])
  })

  it('slugifies the category id', () => {
    const result = addCategoryToCatalog(emptyCatalog, 'Resins & Polymers')
    expect(result.categories[0].id).toBe('resins--polymers')
  })

  it('does not mutate the original catalog', () => {
    addCategoryToCatalog(emptyCatalog, 'New Cat')
    expect(emptyCatalog.categories).toHaveLength(0)
  })
})

describe('updateCategoryInCatalog', () => {
  it('updates the category title', () => {
    const result = updateCategoryInCatalog(sampleCatalog, 'resins', 'Polymers Only')
    const updated = result.categories.find((c) => c.id === 'resins')
    expect(updated?.title).toBe('Polymers Only')
  })

  it('leaves other categories unchanged', () => {
    const result = updateCategoryInCatalog(sampleCatalog, 'resins', 'New Title')
    const solvents = result.categories.find((c) => c.id === 'solvents')
    expect(solvents?.title).toBe('Solvents')
  })
})

describe('deleteCategoryFromCatalog', () => {
  it('removes the specified category', () => {
    const result = deleteCategoryFromCatalog(sampleCatalog, 'solvents')
    expect(result.categories).toHaveLength(1)
    expect(result.categories[0].id).toBe('resins')
  })

  it('does not mutate the original', () => {
    deleteCategoryFromCatalog(sampleCatalog, 'solvents')
    expect(sampleCatalog.categories).toHaveLength(2)
  })
})

describe('addProductToCategory', () => {
  it('adds a product to the correct category', () => {
    const result = addProductToCategory(sampleCatalog, 'solvents', {
      label: 'Solvent',
      name: 'MEK',
      desc: 'High-purity MEK',
    })
    const solvents = result.categories.find((c) => c.id === 'solvents')
    expect(solvents?.products).toHaveLength(1)
    expect(solvents?.products[0].name).toBe('MEK')
  })

  it('assigns a unique id to the new product', () => {
    const result = addProductToCategory(sampleCatalog, 'solvents', {
      label: 'Solvent',
      name: 'MEK',
      desc: 'Test',
    })
    const product = result.categories.find((c) => c.id === 'solvents')?.products[0]
    expect(product?.id).toBeTruthy()
    expect(typeof product?.id).toBe('string')
  })
})

describe('updateProductInCatalog', () => {
  it('updates the product name', () => {
    const result = updateProductInCatalog(sampleCatalog, 'p1', { name: 'Updated Alkyd' })
    const product = result.categories
      .flatMap((c) => c.products)
      .find((p) => p.id === 'p1')
    expect(product?.name).toBe('Updated Alkyd')
  })

  it('does not affect other products', () => {
    const result = updateProductInCatalog(sampleCatalog, 'p1', { name: 'Updated' })
    const product = result.categories
      .flatMap((c) => c.products)
      .find((p) => p.id === 'p2')
    expect(product?.name).toBe('Acrylic Emulsion')
  })
})

describe('deleteProductFromCatalog', () => {
  it('removes the specified product', () => {
    const result = deleteProductFromCatalog(sampleCatalog, 'p1')
    const products = result.categories.flatMap((c) => c.products)
    expect(products).toHaveLength(1)
    expect(products[0].id).toBe('p2')
  })
})

describe('isCategoryEmpty', () => {
  it('returns true for a category with no products', () => {
    expect(isCategoryEmpty(sampleCatalog, 'solvents')).toBe(true)
  })

  it('returns false for a category with products', () => {
    expect(isCategoryEmpty(sampleCatalog, 'resins')).toBe(false)
  })

  it('returns true for a non-existent category', () => {
    expect(isCategoryEmpty(sampleCatalog, 'doesnotexist')).toBe(true)
  })
})
```

**Step 2: Run tests**

```bash
npm test
```

Expected: All tests pass.

**Step 3: Commit**

```bash
git add src/lib/__tests__/products.test.ts
git commit -m "test: add unit tests for products pure functions"
```

---

## Task 6: PDFs Library — Pure Functions + KV I/O

**Files:**
- Create: `src/lib/pdfs.ts`

**Step 1: Create src/lib/pdfs.ts**

```typescript
import { kv } from '@vercel/kv'
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
```

**Step 2: Create tests**

Create `src/lib/__tests__/pdfs.test.ts`:

```typescript
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
```

**Step 3: Run tests**

```bash
npm test
```

Expected: All tests pass.

**Step 4: Commit**

```bash
git add src/lib/pdfs.ts src/lib/__tests__/pdfs.test.ts
git commit -m "feat: add pdfs library with pure functions and KV/Blob I/O"
```

---

## Task 7: Auth Middleware

**Files:**
- Create: `src/middleware.ts`

**Step 1: Create src/middleware.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

const PUBLIC_ADMIN_PATHS = new Set(['/admin', '/api/admin/login', '/api/admin/logout'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_ADMIN_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  if (!session.isLoggedIn) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path+', '/api/admin/:path*'],
}
```

**Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add auth middleware protecting /admin and /api/admin routes"
```

---

## Task 8: Login and Logout API Routes

**Files:**
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/logout/route.ts`

**Step 1: Create login route**

Create `src/app/api/admin/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password: string }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, response, sessionOptions)
  session.isLoggedIn = true
  await session.save()

  return response
}
```

**Step 2: Create logout route**

Create `src/app/api/admin/logout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, response, sessionOptions)
  session.destroy()

  return response
}
```

**Step 3: Commit**

```bash
git add src/app/api/admin/
git commit -m "feat: add admin login and logout API routes"
```

---

## Task 9: Products API Route

**Files:**
- Create: `src/app/api/admin/products/route.ts`

**Step 1: Create products API route**

```typescript
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
  revalidateTag('products')
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
  revalidateTag('products')
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
  revalidateTag('products')
  return NextResponse.json(catalog)
}
```

**Step 2: Commit**

```bash
git add src/app/api/admin/products/
git commit -m "feat: add admin products CRUD API route"
```

---

## Task 10: PDFs API Route

**Files:**
- Create: `src/app/api/admin/pdfs/route.ts`

**Step 1: Create PDFs API route**

```typescript
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
  revalidateTag('pdfs')
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
  revalidateTag('pdfs')
  return NextResponse.json(catalog)
}
```

**Step 2: Commit**

```bash
git add src/app/api/admin/pdfs/
git commit -m "feat: add admin PDFs API route with Blob upload and delete"
```

---

## Task 11: Admin Layout and Login Page

The admin has its own layout (no public Nav/Footer). It checks auth server-side and redirects to login if needed.

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

**Step 1: Create admin layout**

Create `src/app/admin/layout.tsx`:

```tsx
export const metadata = { title: 'Admin — Sarren Chemicals' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-offwhite">
      {children}
    </div>
  )
}
```

Note: Auth redirect is handled by middleware, not the layout.

**Step 2: Create login page**

Create `src/app/admin/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect password.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/images/logo.png" alt="Sarren Chemicals" className="h-10 w-auto mx-auto mb-6" />
          <h1 className="text-[28px] font-semibold text-navy">Admin Panel</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-border rounded p-8 space-y-5">
          <div>
            <label className="label mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy"
            />
          </div>

          {error && (
            <p className="text-red-600 text-[14px]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full justify-center"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add src/app/admin/
git commit -m "feat: add admin layout and login page"
```

---

## Task 12: Admin Dashboard

**Files:**
- Create: `src/app/admin/dashboard/page.tsx`

**Step 1: Create dashboard page**

```tsx
import Link from 'next/link'
import { getCatalog } from '@/lib/products'
import { getPdfCatalog } from '@/lib/pdfs'

async function handleLogout() {
  'use server'
  // Handled client-side — see LogoutButton component
}

export default async function AdminDashboardPage() {
  const [catalog, pdfCatalog] = await Promise.all([getCatalog(), getPdfCatalog()])

  const productCount = catalog.categories.reduce((sum, c) => sum + c.products.length, 0)
  const categoryCount = catalog.categories.length
  const pdfCount = pdfCatalog.documents.length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img src="/images/logo.png" alt="Sarren Chemicals" className="h-8 w-auto" />
          <nav className="flex gap-1">
            <Link href="/admin/dashboard" className="px-4 py-2 text-[14px] font-medium text-navy bg-offwhite rounded hover:no-underline">Dashboard</Link>
            <Link href="/admin/products" className="px-4 py-2 text-[14px] font-medium text-steel hover:text-navy hover:no-underline rounded">Products</Link>
            <Link href="/admin/pdfs" className="px-4 py-2 text-[14px] font-medium text-steel hover:text-navy hover:no-underline rounded">Documents</Link>
          </nav>
        </div>
        <LogoutButton />
      </div>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-8 py-12">
        <h1 className="text-[32px] mb-8">Dashboard</h1>

        <div className="grid grid-cols-3 gap-6">
          <StatCard label="Products" value={productCount} href="/admin/products" />
          <StatCard label="Categories" value={categoryCount} href="/admin/products" />
          <StatCard label="Documents" value={pdfCount} href="/admin/pdfs" />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <Link href="/admin/products" className="btn btn-primary justify-center hover:no-underline">
            Manage Products
          </Link>
          <Link href="/admin/pdfs" className="btn btn-outline justify-center hover:no-underline">
            Manage Documents
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="block bg-white border border-border rounded p-6 hover:border-steel hover:no-underline transition-colors">
      <p className="label mb-1">{label}</p>
      <p className="text-[40px] font-bold text-navy leading-none">{value}</p>
    </Link>
  )
}
```

**Step 2: Create LogoutButton client component**

Create `src/components/admin/LogoutButton.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <button
      onClick={handleLogout}
      className="text-[14px] text-steel hover:text-charcoal transition-colors"
    >
      Log out
    </button>
  )
}
```

**Step 3: Add LogoutButton import to dashboard**

Add to the top of `dashboard/page.tsx`:
```tsx
import LogoutButton from '@/components/admin/LogoutButton'
```

**Step 4: Commit**

```bash
git add src/app/admin/dashboard/ src/components/admin/
git commit -m "feat: add admin dashboard with product and PDF stats"
```

---

## Task 13: Admin Products Page

This is a fully client-side interactive page. Fetches product data from the API on load, handles add/edit/delete via forms.

**Files:**
- Create: `src/app/admin/products/page.tsx`
- Create: `src/components/admin/AdminNav.tsx` (shared nav for admin pages)

**Step 1: Create shared AdminNav component**

Create `src/components/admin/AdminNav.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/pdfs', label: 'Documents' },
  ]

  return (
    <div className="bg-white border-b border-border px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <img src="/images/logo.png" alt="Sarren Chemicals" className="h-8 w-auto" />
        <nav className="flex gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 text-[14px] font-medium rounded hover:no-underline transition-colors ${
                pathname === href
                  ? 'text-navy bg-offwhite'
                  : 'text-steel hover:text-navy'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <button
        onClick={handleLogout}
        className="text-[14px] text-steel hover:text-charcoal transition-colors"
      >
        Log out
      </button>
    </div>
  )
}
```

**Step 2: Create admin products page**

Create `src/app/admin/products/page.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import type { ProductCatalog, Category, Product } from '@/lib/products'

type ModalState =
  | { mode: 'none' }
  | { mode: 'add-category' }
  | { mode: 'edit-category'; category: Category }
  | { mode: 'add-product'; categoryId: string }
  | { mode: 'edit-product'; product: Product; categoryId: string }

export default function AdminProductsPage() {
  const [catalog, setCatalog] = useState<ProductCatalog | null>(null)
  const [modal, setModal] = useState<ModalState>({ mode: 'none' })
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then(setCatalog)
  }, [])

  async function saveCategory(title: string, id?: string) {
    const res = await fetch('/api/admin/products', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(id ? { type: 'category', id, title } : { type: 'category', title }),
    })
    const data = await res.json()
    setCatalog(data)
    setModal({ mode: 'none' })
  }

  async function saveProduct(
    product: { label: string; name: string; desc: string },
    categoryId: string,
    productId?: string
  ) {
    const res = await fetch('/api/admin/products', {
      method: productId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        productId
          ? { type: 'product', id: productId, ...product }
          : { type: 'product', categoryId, ...product }
      ),
    })
    const data = await res.json()
    setCatalog(data)
    setModal({ mode: 'none' })
  }

  async function deleteCategory(id: string) {
    if (!confirm('Delete this category? It must be empty first.')) return
    const res = await fetch(`/api/admin/products?type=category&id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to delete')
      return
    }
    const data = await res.json()
    setCatalog(data)
    setError('')
  }

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    const res = await fetch(`/api/admin/products?type=product&id=${id}`, { method: 'DELETE' })
    const data = await res.json()
    setCatalog(data)
  }

  if (!catalog) {
    return (
      <div className="min-h-screen">
        <AdminNav />
        <div className="max-w-[900px] mx-auto px-8 py-12 text-steel">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminNav />
      <div className="max-w-[900px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[32px]">Products</h1>
          <button
            className="btn btn-primary h-10 text-[14px]"
            onClick={() => setModal({ mode: 'add-category' })}
          >
            + Add Category
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded text-[14px]">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {catalog.categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-border rounded">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-[18px] font-semibold text-navy">{cat.title}</h2>
                <div className="flex gap-2">
                  <button
                    className="btn btn-outline h-8 text-[13px] px-4"
                    onClick={() => setModal({ mode: 'edit-category', category: cat })}
                  >
                    Edit
                  </button>
                  <button
                    className="h-8 px-4 text-[13px] border border-border rounded text-steel hover:text-red-600 hover:border-red-300 transition-colors"
                    onClick={() => deleteCategory(cat.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="divide-y divide-border">
                {cat.products.map((product) => (
                  <div key={product.id} className="flex items-start justify-between px-6 py-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="label">{product.label}</span>
                      <p className="font-medium text-navy mt-0.5">{product.name}</p>
                      <p className="text-[14px] text-steel mt-1 line-clamp-2">{product.desc}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        className="btn btn-outline h-8 text-[13px] px-3"
                        onClick={() => setModal({ mode: 'edit-product', product, categoryId: cat.id })}
                      >
                        Edit
                      </button>
                      <button
                        className="h-8 px-3 text-[13px] border border-border rounded text-steel hover:text-red-600 hover:border-red-300 transition-colors"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {cat.products.length === 0 && (
                  <p className="px-6 py-4 text-[14px] text-steel italic">No products yet.</p>
                )}
              </div>

              <div className="px-6 py-4 border-t border-border">
                <button
                  className="text-[14px] text-navy font-medium hover:underline"
                  onClick={() => setModal({ mode: 'add-product', categoryId: cat.id })}
                >
                  + Add Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {modal.mode === 'add-category' && (
        <CategoryModal
          onSave={(title) => saveCategory(title)}
          onClose={() => setModal({ mode: 'none' })}
        />
      )}
      {modal.mode === 'edit-category' && (
        <CategoryModal
          initialTitle={modal.category.title}
          onSave={(title) => saveCategory(title, modal.category.id)}
          onClose={() => setModal({ mode: 'none' })}
        />
      )}
      {(modal.mode === 'add-product' || modal.mode === 'edit-product') && (
        <ProductModal
          initialProduct={modal.mode === 'edit-product' ? modal.product : undefined}
          onSave={(p) =>
            saveProduct(
              p,
              modal.mode === 'add-product' ? modal.categoryId : modal.categoryId,
              modal.mode === 'edit-product' ? modal.product.id : undefined
            )
          }
          onClose={() => setModal({ mode: 'none' })}
        />
      )}
    </div>
  )
}

function CategoryModal({
  initialTitle = '',
  onSave,
  onClose,
}: {
  initialTitle?: string
  onSave: (title: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(initialTitle)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded border border-border w-full max-w-md p-6">
        <h3 className="text-[18px] font-semibold mb-4">
          {initialTitle ? 'Edit Category' : 'Add Category'}
        </h3>
        <label className="label mb-1.5 block">Category Name</label>
        <input
          className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy mb-4"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <button className="btn btn-outline h-9 text-[14px] px-5" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary h-9 text-[14px] px-5" onClick={() => title && onSave(title)}>Save</button>
        </div>
      </div>
    </div>
  )
}

function ProductModal({
  initialProduct,
  onSave,
  onClose,
}: {
  initialProduct?: Product
  onSave: (p: { label: string; name: string; desc: string }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initialProduct?.name ?? '')
  const [label, setLabel] = useState(initialProduct?.label ?? '')
  const [desc, setDesc] = useState(initialProduct?.desc ?? '')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded border border-border w-full max-w-lg p-6">
        <h3 className="text-[18px] font-semibold mb-4">
          {initialProduct ? 'Edit Product' : 'Add Product'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label mb-1.5 block">Product Name</label>
            <input
              className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Label / Tag</label>
            <input
              className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy"
              placeholder="e.g. Resin, Solvent, Pigment"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="label mb-1.5 block">Description</label>
            <textarea
              className="w-full border border-border rounded px-4 py-2.5 text-[15px] focus:outline-none focus:border-navy min-h-[100px]"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button className="btn btn-outline h-9 text-[14px] px-5" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary h-9 text-[14px] px-5"
            onClick={() => name && label && desc && onSave({ name, label, desc })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Update dashboard to use AdminNav**

Remove the inline nav from `dashboard/page.tsx` and replace with:
```tsx
import AdminNav from '@/components/admin/AdminNav'
```

Then replace the nav header div with `<AdminNav />`.

**Step 4: Commit**

```bash
git add src/app/admin/products/ src/components/admin/
git commit -m "feat: add admin products management page"
```

---

## Task 14: Admin PDFs Page

**Files:**
- Create: `src/app/admin/pdfs/page.tsx`

**Step 1: Create admin PDFs page**

```tsx
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
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </div>

        {/* Document list */}
        {!catalog ? (
          <p className="text-steel">Loading…</p>
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
```

**Step 2: Commit**

```bash
git add src/app/admin/pdfs/
git commit -m "feat: add admin PDF management page"
```

---

## Task 15: Update Public Products Page to Use KV

The public `/products` page currently has hardcoded data. Replace it with a KV fetch.

**Files:**
- Modify: `src/app/(public)/products/page.tsx`

**Step 1: Replace hardcoded data with KV fetch**

Replace the entire `products/page.tsx` with:

```tsx
import { getCatalog } from '@/lib/products'
import RfqForm from '@/components/RfqForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse Sarren Chemicals industrial chemical inventory. Submit an RFQ for pricing.',
}

export const revalidate = 0  // Always fetch fresh, or use: export const revalidate = 1800

export default async function ProductsPage() {
  const catalog = await getCatalog()

  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">Inventory</p>
          <h1 className="text-[40px] mb-4">Products</h1>
          <p className="text-steel text-[18px]">Browse available inventory by category. All pricing is inquiry-only — submit an RFQ for quotes.</p>
        </div>
      </div>

      {/* CATEGORY NAV */}
      {catalog.categories.length > 0 && (
        <div className="border-b border-border bg-white sticky top-[72px] z-50">
          <div className="container-content flex gap-0 overflow-x-auto">
            {catalog.categories.map(({ id, title }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-5 py-3 text-[14px] font-medium text-steel border-b-2 border-transparent hover:text-navy hover:border-navy hover:no-underline whitespace-nowrap transition-colors"
              >
                {title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCT CATEGORIES */}
      <section className="section-pad">
        <div className="container-content space-y-[72px]">
          {catalog.categories.length === 0 ? (
            <p className="text-steel text-[18px]">Products coming soon. Contact us for availability.</p>
          ) : (
            catalog.categories.map(({ id, title, products }) => (
              <div key={id} id={id}>
                <h2 className="mb-8 pb-4 border-b border-border">{title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map(({ id: pid, label, name, desc }) => (
                    <div key={pid} className="card flex flex-col">
                      <p className="label mb-3">{label}</p>
                      <h3 className="text-[18px] mb-2">{name}</h3>
                      <p className="text-[15px] text-steel flex-1">{desc}</p>
                      <a href="#rfq" className="btn btn-outline mt-5 h-10 text-[14px] self-start hover:no-underline">
                        Request a Quote
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* RFQ FORM */}
      <section className="section-alt section-pad" id="rfq">
        <div className="container-content max-w-[720px] mx-auto">
          <div className="section-header">
            <p className="label">Pricing Inquiry</p>
            <h2>Request a Quote</h2>
            <p>All pricing is by inquiry only. Fill out the form below and we&apos;ll respond within one business day.</p>
          </div>
          <RfqForm />
        </div>
      </section>
    </>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/\(public\)/products/page.tsx
git commit -m "feat: update public products page to fetch from Vercel KV"
```

---

## Task 16: Update Footer to Use Dynamic PDF Links

The footer currently has hardcoded PDF links. Replace with dynamic links from KV.

**Files:**
- Modify: `src/components/Footer.tsx`

**Step 1: Convert Footer to async server component with KV fetch**

Replace the hardcoded `pdfs` array at the top of `Footer.tsx`:

```tsx
// Remove this:
const pdfs = [
  { href: '/pdfs/sarren-line-card.pdf', label: 'Line Card (PDF)' },
  { href: '/pdfs/sarren-capability-statement.pdf', label: 'Capability Statement (PDF)' },
  { href: '/pdfs/sarren-sample-coa.pdf', label: 'Sample COA (PDF)' },
]
```

Convert the component to async and fetch from KV:

```tsx
import Link from 'next/link'
import { getPdfCatalog } from '@/lib/pdfs'

const pages = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/sell-surplus', label: 'Sell Your Surplus' },
  { href: '/logistics', label: 'Logistics' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default async function Footer() {
  const pdfCatalog = await getPdfCatalog()
  // ... rest of JSX unchanged, except replace pdfs.map(...) with pdfCatalog.documents.map(...)
```

Replace the resources `<ul>` with:

```tsx
<ul className="list-none flex flex-col gap-[10px]">
  {pdfCatalog.documents.map(({ id, name, url }) => (
    <li key={id}>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-white/80 text-[15px] hover:text-white hover:no-underline transition-colors">
        {name}
      </a>
    </li>
  ))}
  {pdfCatalog.documents.length === 0 && (
    <li className="text-white/40 text-[15px]">No documents available</li>
  )}
</ul>
```

**Step 2: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: update footer to show dynamic PDF links from Vercel KV"
```

---

## Task 17: Seed KV with Existing Product Data

The hardcoded product data from the old `products/page.tsx` needs to be loaded into Vercel KV once.

**Files:**
- Create: `scripts/seed-kv.ts`

**Step 1: Create seed script**

```typescript
// Run with: npx tsx scripts/seed-kv.ts
// Requires KV env vars to be set in .env.local

import { kv } from '@vercel/kv'

const catalog = {
  categories: [
    {
      id: 'resins',
      title: 'Resins & Polymers',
      products: [
        { id: crypto.randomUUID(), label: 'Resin', name: 'Alkyd Resin', desc: 'Short, medium, and long oil alkyds for architectural and industrial coatings. Available in drums and totes.' },
        { id: crypto.randomUUID(), label: 'Resin', name: 'Acrylic Emulsion', desc: 'Waterborne acrylic dispersions for interior and exterior paint formulations.' },
        { id: crypto.randomUUID(), label: 'Resin', name: 'Epoxy Resin', desc: 'Liquid epoxy resins for flooring, industrial coatings, and adhesive applications.' },
        { id: crypto.randomUUID(), label: 'Resin', name: 'Polyurethane Resin', desc: 'Moisture-cure and two-component polyurethane resins for protective coatings.' },
        { id: crypto.randomUUID(), label: 'Resin', name: 'Vinyl Acetate Polymer', desc: 'PVA dispersions and copolymers for adhesives, construction, and drymix applications.' },
      ],
    },
    {
      id: 'solvents',
      title: 'Solvents',
      products: [
        { id: crypto.randomUUID(), label: 'Solvent', name: 'Methyl Ethyl Ketone (MEK)', desc: 'High-purity MEK for coatings, adhesives, and cleaning applications. Drum and bulk available.' },
        { id: crypto.randomUUID(), label: 'Solvent', name: 'Butyl Acetate', desc: 'Industrial grade n-butyl acetate for lacquers, varnishes, and coatings formulations.' },
        { id: crypto.randomUUID(), label: 'Solvent', name: 'Propylene Glycol Methyl Ether (PM)', desc: 'Glycol ether solvent for waterborne and solventborne coating systems.' },
        { id: crypto.randomUUID(), label: 'Solvent', name: 'Mineral Spirits', desc: 'Aliphatic hydrocarbon solvent for alkyd-based paints and industrial cleaning.' },
      ],
    },
    {
      id: 'pigments',
      title: 'Pigments & Extenders',
      products: [
        { id: crypto.randomUUID(), label: 'Pigment', name: 'Titanium Dioxide (TiO₂)', desc: 'Rutile and anatase grades for architectural paint, industrial coatings, and plastics.' },
        { id: crypto.randomUUID(), label: 'Extender', name: 'Calcium Carbonate', desc: 'Coated and uncoated calcium carbonate for drymix, paint, and sealant applications.' },
        { id: crypto.randomUUID(), label: 'Extender', name: 'Talc', desc: 'Platy talc grades for barrier properties and sag resistance in coatings and sealants.' },
        { id: crypto.randomUUID(), label: 'Pigment', name: 'Iron Oxide Pigments', desc: 'Red, yellow, and black synthetic iron oxides for concrete, coatings, and construction.' },
      ],
    },
    {
      id: 'additives',
      title: 'Additives',
      products: [
        { id: crypto.randomUUID(), label: 'Additive', name: 'Defoamers', desc: 'Mineral oil and silicone-based defoamers for waterborne and solventborne systems.' },
        { id: crypto.randomUUID(), label: 'Additive', name: 'Rheology Modifiers', desc: 'HEUR, HMHEC, and clay-based thickeners for paints, adhesives, and sealants.' },
        { id: crypto.randomUUID(), label: 'Additive', name: 'Dispersants & Wetting Agents', desc: 'Polymeric dispersants for pigment grinding and stabilization in waterborne systems.' },
        { id: crypto.randomUUID(), label: 'Additive', name: 'Coalescents', desc: 'Texanol and alternative coalescents to aid film formation in latex paints.' },
      ],
    },
  ],
}

await kv.set('products', catalog)
console.log('✓ Products seeded to Vercel KV')
console.log(`  ${catalog.categories.length} categories`)
console.log(`  ${catalog.categories.reduce((s, c) => s + c.products.length, 0)} products`)

await kv.set('pdfs', { documents: [] })
console.log('✓ PDFs catalog initialized (empty)')

process.exit(0)
```

**Step 2: Add tsx dependency for running the script**

```bash
npm install --save-dev tsx
```

**Step 3: Add seed script to package.json**

```json
"seed": "tsx scripts/seed-kv.ts"
```

**Step 4: Instructions for running the seed**

When KV is provisioned and env vars are set in `.env.local`:
```bash
npm run seed
```

Expected output:
```
✓ Products seeded to Vercel KV
  4 categories
  17 products
✓ PDFs catalog initialized (empty)
```

**Step 5: Commit**

```bash
git add scripts/seed-kv.ts package.json package-lock.json
git commit -m "chore: add KV seed script to migrate hardcoded product data"
```

---

## Task 18: Final Verification

**Step 1: Run all tests**

```bash
cd sarren-next && npm test
```

Expected: All tests pass.

**Step 2: Start dev server and smoke test**

```bash
npm run dev
```

Verify each of these manually:
- [ ] `http://localhost:3000` — homepage renders with Nav and Footer
- [ ] `http://localhost:3000/products` — shows "Products coming soon" (KV is empty in local dev without seeding)
- [ ] `http://localhost:3000/admin` — shows login form
- [ ] Login with wrong password → shows "Incorrect password"
- [ ] Login with `ADMIN_PASSWORD` env value → redirects to `/admin/dashboard`
- [ ] Dashboard shows counts (0 while unseeded)
- [ ] Products page — add a category, add a product, verify it shows in `/products`
- [ ] PDFs page — upload a PDF, verify it appears in footer
- [ ] Log out — redirects to login
- [ ] Accessing `/admin/dashboard` while logged out → redirects to login

**Step 3: Build check**

```bash
npm run build
```

Expected: Successful build with no TypeScript errors.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete admin panel for client-managed products and PDFs"
```

---

## Deployment Checklist

Before deploying to Vercel:

1. **Provision Vercel KV** in the Vercel dashboard → Storage → Create Database
2. **Provision Vercel Blob** in the Vercel dashboard → Storage → Create Blob Store
3. **Set environment variables** in Vercel:
   - `ADMIN_PASSWORD` — strong password for the client
   - `SESSION_SECRET` — 32+ char random string (`openssl rand -hex 32`)
4. **Deploy** — `git push` triggers Vercel deploy
5. **Run seed** — after first deploy, run seed locally pointing at production KV:
   - Pull Vercel env vars: `vercel env pull .env.local`
   - Run: `npm run seed`
6. **Test login** at `https://sarrenchemicals.com/admin`
