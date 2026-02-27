# Sarren Chemicals — Admin Panel Design
**Date:** 2026-02-27

---

## Overview

A password-protected custom admin panel embedded in the Next.js site at `/admin`. Allows the non-technical client to manage the product catalog and upload PDF documents without any developer involvement or access to Vercel.

---

## Approach

Custom `/admin` route within the existing Next.js (App Router) application. No third-party CMS accounts required. Storage via Vercel KV (product data + PDF metadata) and Vercel Blob (PDF files). All free-tier Vercel services.

---

## Architecture

```
sarren-next/
└── src/
    ├── app/
    │   ├── admin/
    │   │   ├── layout.tsx          ← auth guard, admin nav
    │   │   ├── page.tsx            ← login page
    │   │   ├── dashboard/page.tsx  ← overview
    │   │   ├── products/page.tsx   ← product management
    │   │   └── pdfs/page.tsx       ← PDF management
    │   ├── api/
    │   │   └── admin/
    │   │       ├── login/route.ts
    │   │       ├── logout/route.ts
    │   │       ├── products/route.ts
    │   │       └── pdfs/route.ts
    └── middleware.ts               ← protects /admin/* routes
```

**Storage:**
- **Vercel KV** — product catalog JSON + PDF metadata JSON
- **Vercel Blob** — actual PDF files (public CDN URLs)

**Public site integration:**
- `/products` page fetches product data from Vercel KV server-side
- Footer PDF links fetched from Vercel KV server-side
- ISR cache revalidation via cache tags after any admin save

---

## Authentication

- Single `ADMIN_PASSWORD` environment variable
- Login form at `/admin` — password field only
- On success: signed HTTP-only cookie set (7-day expiry)
- Cookie signed with `SESSION_SECRET` env var
- Next.js middleware checks cookie on all `/admin/*` requests
- Logout clears the cookie

**Client experience:** Visit the URL, enter the password, done.

---

## Product Management UI

Accessible at `/admin/products`.

- List view: categories collapsed/expanded, products within each
- Add category: name field, save
- Edit category: rename in place
- Delete category: confirmation required, blocked if products exist
- Add product: modal form — Name, Label/Tag, Description, Category
- Edit product: same form pre-populated
- Delete product: confirmation prompt

All saves POST to `/api/admin/products`, which writes to Vercel KV and revalidates the `"products"` cache tag.

---

## PDF Management UI

Accessible at `/admin/pdfs`.

- List view: uploaded PDFs with display name, upload date, download link, delete button
- Upload form: Display Name + file picker (PDF only)
- Upload flow: file → Vercel Blob → URL stored in KV alongside display name + timestamp
- Delete: removes from both Blob storage and KV

---

## Data Structures (Vercel KV)

```json
// Key: "products"
{
  "categories": [
    {
      "id": "resins",
      "title": "Resins & Polymers",
      "products": [
        {
          "id": "uuid",
          "label": "Resin",
          "name": "Alkyd Resin",
          "desc": "Short, medium, and long oil alkyds..."
        }
      ]
    }
  ]
}

// Key: "pdfs"
{
  "documents": [
    {
      "id": "uuid",
      "name": "Line Card 2026",
      "url": "https://blob.vercel-storage.com/...",
      "uploadedAt": "2026-02-27T00:00:00Z"
    }
  ]
}
```

---

## API Routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/admin/login` | POST | Validate password, set session cookie |
| `/api/admin/logout` | POST | Clear session cookie |
| `/api/admin/products` | GET, POST, PUT, DELETE | CRUD on product catalog in KV |
| `/api/admin/pdfs` | GET, POST, DELETE | List / upload to Blob / delete PDFs |

All routes (except login) protected by middleware cookie check.

---

## Environment Variables

Set once in Vercel dashboard — client never touches these:

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Client's login password |
| `SESSION_SECRET` | Random 32-char string for cookie signing |
| `KV_URL` | Auto-set when Vercel KV is provisioned |
| `KV_REST_API_URL` | Auto-set when Vercel KV is provisioned |
| `KV_REST_API_TOKEN` | Auto-set when Vercel KV is provisioned |
| `BLOB_READ_WRITE_TOKEN` | Auto-set when Vercel Blob is provisioned |

---

## Dependencies to Add

- `@vercel/kv` — Vercel KV client
- `@vercel/blob` — Vercel Blob client
- `iron-session` — signed cookie session management

---

## Constraints

- Admin panel is not publicly linked — accessed by direct URL only
- No user accounts — single shared password
- PDF file type enforced client-side and server-side (PDF only)
- Product data migrations (schema changes) handled by developer, not client
