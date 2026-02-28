# Sarren CRM Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a standalone internal CRM web app (`sarren-crm`) that stores leads in Neon PostgreSQL, receives leads automatically from the public sarren-next website, and sends email notifications on new leads.

**Architecture:** Separate Next.js (App Router) project at `/Users/jonlarkin/SarrenChemicals/sarren-crm/`. The public sarren-next website POSTs to `POST /api/leads` with an `X-API-Secret` header. The CRM saves to Neon PostgreSQL and sends email via SMTP/nodemailer. Auth uses iron-session with email + bcrypt password.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, `@neondatabase/serverless`, `iron-session`, `bcryptjs`, `nodemailer`, `uuid`, Vitest for tests.

**Design doc:** `docs/plans/2026-02-27-sarren-crm-design.md`

---

## Environment Variables

The CRM app (`sarren-crm/.env.local`) needs:

```
DATABASE_URL=          # Neon PostgreSQL connection string
SESSION_SECRET=        # 32+ char secret for iron-session
CRM_API_SECRET=        # Shared secret for sarren-next → CRM POST /api/leads
CRM_BASE_URL=          # e.g. https://sarren-crm.vercel.app (for email links)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CONTACT_EMAIL=         # Where lead notification emails are sent
```

The sarren-next app needs one new env var:

```
CRM_API_URL=           # e.g. https://sarren-crm.vercel.app/api/leads
CRM_API_SECRET=        # Same value as above
```

---

## Task 1: Scaffold the sarren-crm Next.js project

**Files:**
- Create: `sarren-crm/` (new Next.js project)
- Create: `sarren-crm/vitest.config.ts`
- Create: `sarren-crm/.env.local` (template)

**Step 1: Create the Next.js project**

Run from `/Users/jonlarkin/SarrenChemicals/`:

```bash
npx create-next-app@latest sarren-crm \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

When prompted: accept all defaults (App Router: yes, Turbopack: yes).

**Step 2: Install runtime dependencies**

```bash
cd sarren-crm
npm install @neondatabase/serverless iron-session bcryptjs nodemailer uuid
npm install --save-dev @types/bcryptjs @types/nodemailer @types/uuid vitest @vitejs/plugin-react @vitest/coverage-v8 tsx
```

**Step 3: Create vitest.config.ts**

```typescript
// sarren-crm/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**Step 4: Add test script to package.json**

Edit `sarren-crm/package.json` scripts:

```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "migrate": "tsx scripts/migrate.ts",
  "seed": "tsx scripts/seed.ts"
}
```

**Step 5: Create .env.local template**

```bash
# sarren-crm/.env.local
DATABASE_URL=
SESSION_SECRET=
CRM_API_SECRET=
CRM_BASE_URL=http://localhost:3001
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CONTACT_EMAIL=info@sarrenchemicals.com
```

**Step 6: Verify project starts**

```bash
npm run dev -- --port 3001
```

Expected: Next.js starts at http://localhost:3001 with default page.

**Step 7: Commit**

```bash
git add sarren-crm/
git commit -m "feat: scaffold sarren-crm Next.js project"
```

---

## Task 2: Database setup — schema and migrations

**Files:**
- Create: `sarren-crm/lib/db.ts`
- Create: `sarren-crm/lib/schema.sql`
- Create: `sarren-crm/scripts/migrate.ts`
- Create: `sarren-crm/scripts/seed.ts`

**Step 1: Create the Neon database client**

```typescript
// sarren-crm/lib/db.ts
import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)
```

**Step 2: Create schema.sql**

```sql
-- sarren-crm/lib/schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS companies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  industry   TEXT,
  website    TEXT,
  city       TEXT,
  state      TEXT,
  country    TEXT DEFAULT 'US',
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name  TEXT,
  email      TEXT,
  phone      TEXT,
  title      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  position INT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id        UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id        UUID REFERENCES companies(id) ON DELETE SET NULL,
  assigned_to       UUID REFERENCES users(id) ON DELETE SET NULL,
  stage_id          INT REFERENCES pipeline_stages(id) DEFAULT 1,
  source            TEXT NOT NULL,
  form_name         TEXT,
  form_email        TEXT,
  form_company      TEXT,
  form_phone        TEXT,
  product_interest  TEXT,
  message           TEXT,
  title             TEXT,
  deal_value        NUMERIC(12,2),
  close_probability INT CHECK (close_probability BETWEEN 0 AND 100),
  score             INT DEFAULT 0,
  expected_close    DATE,
  lost_reason       TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  type        TEXT NOT NULL,
  body        TEXT NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

**Step 3: Create migrate.ts**

```typescript
// sarren-crm/scripts/migrate.ts
import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sql = neon(process.env.DATABASE_URL!)
const schema = fs.readFileSync(path.resolve(process.cwd(), 'lib/schema.sql'), 'utf8')

async function migrate() {
  console.log('Running migrations...')
  await sql(schema)
  console.log('Done.')
}

migrate().catch(console.error)
```

Note: `dotenv` is available as a transitive dep; if not, install with `npm install dotenv`.

**Step 4: Create seed.ts**

```typescript
// sarren-crm/scripts/seed.ts
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sql = neon(process.env.DATABASE_URL!)

async function seed() {
  // Seed pipeline stages
  await sql`
    INSERT INTO pipeline_stages (name, position) VALUES
      ('New', 1),
      ('Contacted', 2),
      ('Quoted', 3),
      ('Closed Won', 4),
      ('Closed Lost', 5)
    ON CONFLICT (name) DO NOTHING
  `

  // Seed initial admin user (change email/password before using)
  const hash = await bcrypt.hash('changeme123', 12)
  await sql`
    INSERT INTO users (email, name, password_hash) VALUES
      ('admin@sarrenchemicals.com', 'Admin', ${hash})
    ON CONFLICT (email) DO NOTHING
  `

  console.log('Seeded pipeline stages and admin user.')
  console.log('IMPORTANT: Change the admin password immediately after first login.')
}

seed().catch(console.error)
```

**Step 5: Run migration and seed**

```bash
npm run migrate
npm run seed
```

Expected: "Running migrations... Done." and "Seeded pipeline stages and admin user."

**Step 6: Write a test for the db module**

```typescript
// sarren-crm/lib/db.test.ts
import { describe, it, expect, vi } from 'vitest'

describe('db', () => {
  it('throws if DATABASE_URL is not set', async () => {
    const originalEnv = process.env.DATABASE_URL
    delete process.env.DATABASE_URL
    await expect(import('./db')).rejects.toThrow('DATABASE_URL')
    process.env.DATABASE_URL = originalEnv
  })
})
```

**Step 7: Run tests**

```bash
npm test
```

Expected: 1 test passes.

**Step 8: Commit**

```bash
git add sarren-crm/
git commit -m "feat: add Neon DB client, schema, migration and seed scripts"
```

---

## Task 3: Authentication — session, login API, middleware, login page

**Files:**
- Create: `sarren-crm/lib/session.ts`
- Create: `sarren-crm/lib/session.test.ts`
- Create: `sarren-crm/app/api/auth/login/route.ts`
- Create: `sarren-crm/app/api/auth/logout/route.ts`
- Create: `sarren-crm/middleware.ts`
- Create: `sarren-crm/app/login/page.tsx`

**Step 1: Write failing tests for session config**

```typescript
// sarren-crm/lib/session.test.ts
import { describe, it, expect } from 'vitest'
import { sessionOptions } from './session'

describe('sessionOptions', () => {
  it('has cookieName set', () => {
    expect(sessionOptions.cookieName).toBe('sarren_crm_session')
  })

  it('has password set', () => {
    expect(typeof sessionOptions.password).toBe('string')
    expect((sessionOptions.password as string).length).toBeGreaterThan(0)
  })

  it('cookie is httpOnly', () => {
    expect(sessionOptions.cookieOptions?.httpOnly).toBe(true)
  })

  it('cookie maxAge is 7 days', () => {
    expect(sessionOptions.cookieOptions?.maxAge).toBe(60 * 60 * 24 * 7)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- lib/session.test.ts
```

Expected: FAIL — "Cannot find module './session'"

**Step 3: Create lib/session.ts**

```typescript
// sarren-crm/lib/session.ts
import type { IronSessionOptions } from 'iron-session'

export interface SessionData {
  userId: string
  email: string
  name: string
}

export const sessionOptions: IronSessionOptions = {
  cookieName: 'sarren_crm_session',
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  },
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- lib/session.test.ts
```

Expected: 4 tests pass.

**Step 5: Create login API route**

```typescript
// sarren-crm/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import bcrypt from 'bcryptjs'
import { sql } from '@/lib/db'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const rows = await sql`
      SELECT id, email, name, password_hash FROM users WHERE email = ${email} LIMIT 1
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash as string)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    const session = await getIronSession<SessionData>(req, res, sessionOptions)
    session.userId = user.id as string
    session.email = user.email as string
    session.name = user.name as string
    await session.save()

    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
```

**Step 6: Create logout API route**

```typescript
// sarren-crm/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  session.destroy()
  return res
}
```

**Step 7: Create middleware.ts**

```typescript
// sarren-crm/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/leads']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check session
  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)

  if (!session.userId) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

**Step 8: Create login page**

```typescript
// sarren-crm/app/login/page.tsx
'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6F7]">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm p-8 border border-[#8A9BAE]/20">
        <h1 className="text-2xl font-bold text-[#1B3A6B] mb-2">Sarren CRM</h1>
        <p className="text-[#8A9BAE] text-sm mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1C2530] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-[#8A9BAE]/40 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1C2530] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-[#8A9BAE]/40 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B3A6B] text-white py-2 rounded text-sm font-medium hover:bg-[#1B3A6B]/90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 9: Verify login flow manually**

```bash
npm run dev -- --port 3001
```

Visit http://localhost:3001 — should redirect to http://localhost:3001/login.
Enter `admin@sarrenchemicals.com` / `changeme123` → should redirect to `/dashboard` (404 is fine, page doesn't exist yet).

**Step 10: Commit**

```bash
git add sarren-crm/
git commit -m "feat: add auth — session config, login/logout API, middleware, login page"
```

---

## Task 4: Lead ingestion API + email notification

**Files:**
- Create: `sarren-crm/lib/email.ts`
- Create: `sarren-crm/lib/email.test.ts`
- Create: `sarren-crm/lib/lead-score.ts`
- Create: `sarren-crm/lib/lead-score.test.ts`
- Create: `sarren-crm/app/api/leads/route.ts`

**Step 1: Write failing tests for lead scoring**

```typescript
// sarren-crm/lib/lead-score.test.ts
import { describe, it, expect } from 'vitest'
import { calculateScore } from './lead-score'

describe('calculateScore', () => {
  it('returns 0 for an empty lead', () => {
    expect(calculateScore({ source: 'contact' })).toBe(0)
  })

  it('adds 30 for rfq source', () => {
    expect(calculateScore({ source: 'rfq' })).toBe(30)
  })

  it('adds 10 for product_interest', () => {
    expect(calculateScore({ source: 'contact', product_interest: 'TiO2' })).toBe(10)
  })

  it('adds 20 for deal_value', () => {
    expect(calculateScore({ source: 'contact', deal_value: 5000 })).toBe(20)
  })

  it('caps at 100', () => {
    expect(calculateScore({
      source: 'rfq',
      product_interest: 'TiO2',
      deal_value: 50000,
    })).toBeLessThanOrEqual(100)
  })

  it('rfq + product_interest = 40', () => {
    expect(calculateScore({ source: 'rfq', product_interest: 'TiO2' })).toBe(40)
  })
})
```

**Step 2: Run test to verify it fails**

```bash
npm test -- lib/lead-score.test.ts
```

Expected: FAIL — "Cannot find module './lead-score'"

**Step 3: Create lib/lead-score.ts**

```typescript
// sarren-crm/lib/lead-score.ts

interface LeadScoreInput {
  source: string
  product_interest?: string | null
  deal_value?: number | null
}

export function calculateScore(lead: LeadScoreInput): number {
  let score = 0

  if (lead.source === 'rfq') score += 30
  if (lead.product_interest) score += 10
  if (lead.deal_value && lead.deal_value > 0) score += 20

  return Math.min(score, 100)
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- lib/lead-score.test.ts
```

Expected: 6 tests pass.

**Step 5: Write failing tests for email builder**

```typescript
// sarren-crm/lib/email.test.ts
import { describe, it, expect } from 'vitest'
import { buildLeadNotificationEmail } from './email'

describe('buildLeadNotificationEmail', () => {
  const lead = {
    id: 'abc-123',
    source: 'rfq',
    form_name: 'Jane Smith',
    form_email: 'jane@acme.com',
    form_company: 'Acme Paints',
    product_interest: 'TiO2',
    message: 'Need 20 drums',
  }

  it('builds a subject with source and company', () => {
    const { subject } = buildLeadNotificationEmail(lead, 'http://localhost:3001')
    expect(subject).toContain('RFQ')
    expect(subject).toContain('Acme Paints')
  })

  it('includes lead id in body', () => {
    const { text } = buildLeadNotificationEmail(lead, 'http://localhost:3001')
    expect(text).toContain('abc-123')
  })

  it('includes CRM link in body', () => {
    const { text } = buildLeadNotificationEmail(lead, 'http://localhost:3001')
    expect(text).toContain('http://localhost:3001/leads/abc-123')
  })

  it('handles surplus source', () => {
    const { subject } = buildLeadNotificationEmail({ ...lead, source: 'surplus' }, 'http://localhost:3001')
    expect(subject).toContain('Surplus')
  })

  it('handles contact source', () => {
    const { subject } = buildLeadNotificationEmail({ ...lead, source: 'contact' }, 'http://localhost:3001')
    expect(subject).toContain('Contact')
  })
})
```

**Step 6: Run test to verify it fails**

```bash
npm test -- lib/email.test.ts
```

Expected: FAIL — "Cannot find module './email'"

**Step 7: Create lib/email.ts**

```typescript
// sarren-crm/lib/email.ts
import nodemailer from 'nodemailer'

interface LeadEmailInput {
  id: string
  source: string
  form_name?: string | null
  form_email?: string | null
  form_company?: string | null
  form_phone?: string | null
  product_interest?: string | null
  message?: string | null
}

const SOURCE_LABELS: Record<string, string> = {
  rfq: 'RFQ',
  surplus: 'Surplus',
  contact: 'Contact',
}

export function buildLeadNotificationEmail(
  lead: LeadEmailInput,
  baseUrl: string
): { subject: string; text: string } {
  const sourceLabel = SOURCE_LABELS[lead.source] ?? lead.source.toUpperCase()
  const company = lead.form_company ?? 'Unknown Company'
  const name = lead.form_name ?? 'Unknown'

  const subject = `New ${sourceLabel} Lead — ${company} / ${name}`

  const lines = [
    `New lead received from the Sarren Chemicals website.`,
    ``,
    `SOURCE: ${sourceLabel}`,
    `NAME: ${lead.form_name ?? '—'}`,
    `EMAIL: ${lead.form_email ?? '—'}`,
    `COMPANY: ${lead.form_company ?? '—'}`,
    `PHONE: ${lead.form_phone ?? '—'}`,
    `PRODUCT INTEREST: ${lead.product_interest ?? '—'}`,
    ``,
    `MESSAGE:`,
    lead.message ?? '(no message)',
    ``,
    `─────────────────────────`,
    `View in CRM: ${baseUrl}/leads/${lead.id}`,
  ]

  return { subject, text: lines.join('\n') }
}

export function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendLeadNotification(lead: LeadEmailInput): Promise<void> {
  const baseUrl = process.env.CRM_BASE_URL ?? 'http://localhost:3001'
  const { subject, text } = buildLeadNotificationEmail(lead, baseUrl)

  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"Sarren CRM" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL ?? 'info@sarrenchemicals.com',
    subject,
    text,
  })
}
```

**Step 8: Run tests to verify they pass**

```bash
npm test -- lib/email.test.ts lib/lead-score.test.ts
```

Expected: 11 tests pass.

**Step 9: Create the lead ingestion API route**

```typescript
// sarren-crm/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { calculateScore } from '@/lib/lead-score'
import { sendLeadNotification } from '@/lib/email'

export async function POST(req: NextRequest) {
  // Validate API secret
  const secret = req.headers.get('x-api-secret')
  if (!secret || secret !== process.env.CRM_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json() as {
      source: string
      name?: string
      email?: string
      company?: string
      phone?: string
      product?: string
      material?: string
      message?: string
      subject?: string
    }

    const { source, name, email, company, phone, message, subject } = body
    const product_interest = body.product ?? body.material ?? null

    if (!source) {
      return NextResponse.json({ error: 'source is required' }, { status: 400 })
    }

    const score = calculateScore({ source, product_interest })

    const rows = await sql`
      INSERT INTO leads (
        source, form_name, form_email, form_company, form_phone,
        product_interest, message, score, stage_id
      ) VALUES (
        ${source},
        ${name ?? null},
        ${email ?? null},
        ${company ?? null},
        ${phone ?? null},
        ${product_interest},
        ${message ?? subject ?? null},
        ${score},
        1
      )
      RETURNING id
    `

    const lead = rows[0]

    // Log "Form submitted" activity
    await sql`
      INSERT INTO activities (lead_id, type, body)
      VALUES (${lead.id}, 'note', 'Lead created from website form submission.')
    `

    // Send email notification (non-blocking — don't fail the request if email fails)
    sendLeadNotification({
      id: lead.id as string,
      source,
      form_name: name ?? null,
      form_email: email ?? null,
      form_company: company ?? null,
      form_phone: phone ?? null,
      product_interest,
      message: message ?? subject ?? null,
    }).catch(err => console.error('Failed to send lead notification email:', err))

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 })
  } catch (err) {
    console.error('Lead ingestion error:', err)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }
}
```

**Step 10: Test the endpoint manually**

```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -H "X-API-Secret: your-secret-here" \
  -d '{"source":"rfq","name":"Test User","email":"test@example.com","company":"Test Co","product":"TiO2","message":"Need pricing"}'
```

Expected: `{"ok":true,"id":"<uuid>"}` with status 201.

**Step 11: Commit**

```bash
git add sarren-crm/
git commit -m "feat: add lead ingestion API, email notification, and lead scoring"
```

---

## Task 5: Shared layout and navigation

**Files:**
- Modify: `sarren-crm/app/layout.tsx`
- Create: `sarren-crm/app/dashboard/layout.tsx` (authenticated shell)
- Create: `sarren-crm/components/Sidebar.tsx`

**Step 1: Create Sidebar component**

```typescript
// sarren-crm/components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/leads', label: 'Leads' },
  { href: '/companies', label: 'Companies' },
  { href: '/contacts', label: 'Contacts' },
]

export default function Sidebar() {
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <aside className="w-56 min-h-screen bg-[#1B3A6B] flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <span className="text-white font-bold text-lg">Sarren CRM</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded text-sm transition-colors ${
                active
                  ? 'bg-white/15 text-white font-medium'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
```

**Step 2: Create authenticated shell layout**

```typescript
// sarren-crm/app/(app)/layout.tsx
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F5F6F7]">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

Note: All authenticated pages (dashboard, leads, companies, contacts) go under `app/(app)/` using a route group.

**Step 3: Move page structure**

The following pages will be created under `app/(app)/` in subsequent tasks:
- `app/(app)/dashboard/page.tsx`
- `app/(app)/leads/page.tsx`
- `app/(app)/leads/[id]/page.tsx`
- `app/(app)/companies/page.tsx`
- `app/(app)/companies/[id]/page.tsx`
- `app/(app)/contacts/page.tsx`

**Step 4: Update root layout to use minimal styling**

Edit `sarren-crm/app/layout.tsx` — remove default Next.js boilerplate, keep minimal:

```typescript
// sarren-crm/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sarren CRM',
  description: 'Sarren Chemicals internal CRM',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

**Step 5: Add root redirect**

```typescript
// sarren-crm/app/page.tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
```

**Step 6: Verify layout renders**

```bash
npm run dev -- --port 3001
```

Visit http://localhost:3001 → redirects to /login. Log in → redirects to /dashboard (shows sidebar + "page not found" for now).

**Step 7: Commit**

```bash
git add sarren-crm/
git commit -m "feat: add authenticated app shell layout and sidebar navigation"
```

---

## Task 6: Companies API + UI

**Files:**
- Create: `sarren-crm/app/api/companies/route.ts`
- Create: `sarren-crm/app/api/companies/[id]/route.ts`
- Create: `sarren-crm/app/(app)/companies/page.tsx`
- Create: `sarren-crm/app/(app)/companies/[id]/page.tsx`

**Step 1: Create companies API (list + create)**

```typescript
// sarren-crm/app/api/companies/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql`
    SELECT c.*, COUNT(l.id) AS lead_count
    FROM companies c
    LEFT JOIN leads l ON l.company_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, industry, website, city, state, country, notes } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO companies (name, industry, website, city, state, country, notes)
    VALUES (${name.trim()}, ${industry ?? null}, ${website ?? null},
            ${city ?? null}, ${state ?? null}, ${country ?? 'US'}, ${notes ?? null})
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
```

**Step 2: Create companies detail API**

```typescript
// sarren-crm/app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rows = await sql`SELECT * FROM companies WHERE id = ${id} LIMIT 1`
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const contacts = await sql`SELECT * FROM contacts WHERE company_id = ${id} ORDER BY first_name`
  const leads = await sql`
    SELECT l.*, ps.name AS stage_name
    FROM leads l
    LEFT JOIN pipeline_stages ps ON ps.id = l.stage_id
    WHERE l.company_id = ${id}
    ORDER BY l.created_at DESC
  `

  return NextResponse.json({ company: rows[0], contacts, leads })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, industry, website, city, state, country, notes } = body

  const rows = await sql`
    UPDATE companies
    SET name = COALESCE(${name ?? null}, name),
        industry = COALESCE(${industry ?? null}, industry),
        website = COALESCE(${website ?? null}, website),
        city = COALESCE(${city ?? null}, city),
        state = COALESCE(${state ?? null}, state),
        country = COALESCE(${country ?? null}, country),
        notes = COALESCE(${notes ?? null}, notes),
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}
```

**Step 3: Create companies list page**

```typescript
// sarren-crm/app/(app)/companies/page.tsx
import Link from 'next/link'

async function getCompanies() {
  const res = await fetch(`${process.env.CRM_BASE_URL}/api/companies`, { cache: 'no-store' })
  return res.json()
}

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C2530]">Companies</h1>
      </div>

      <div className="bg-white rounded-lg border border-[#8A9BAE]/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F6F7] border-b border-[#8A9BAE]/20">
            <tr>
              <th className="text-left px-4 py-3 text-[#1C2530] font-medium">Company</th>
              <th className="text-left px-4 py-3 text-[#1C2530] font-medium">Industry</th>
              <th className="text-left px-4 py-3 text-[#1C2530] font-medium">Location</th>
              <th className="text-left px-4 py-3 text-[#1C2530] font-medium">Leads</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c: Record<string, unknown>) => (
              <tr key={c.id as string} className="border-b border-[#8A9BAE]/10 hover:bg-[#F5F6F7] transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/companies/${c.id}`} className="font-medium text-[#1B3A6B] hover:underline">
                    {c.name as string}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[#8A9BAE]">{(c.industry as string) ?? '—'}</td>
                <td className="px-4 py-3 text-[#8A9BAE]">
                  {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-4 py-3 text-[#8A9BAE]">{c.lead_count as string}</td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#8A9BAE]">No companies yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 4: Create company detail page**

```typescript
// sarren-crm/app/(app)/companies/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'

async function getCompany(id: string) {
  const res = await fetch(`${process.env.CRM_BASE_URL}/api/companies/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getCompany(id)
  if (!data) notFound()

  const { company, contacts, leads } = data

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <Link href="/companies" className="text-sm text-[#8A9BAE] hover:text-[#1B3A6B]">← Companies</Link>
        <h1 className="text-2xl font-bold text-[#1C2530] mt-1">{company.name}</h1>
        {company.industry && <p className="text-[#8A9BAE] text-sm">{company.industry}</p>}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Contacts */}
        <div className="bg-white rounded-lg border border-[#8A9BAE]/20 p-5">
          <h2 className="font-semibold text-[#1C2530] mb-3">Contacts ({contacts.length})</h2>
          {contacts.length === 0 ? (
            <p className="text-sm text-[#8A9BAE]">No contacts yet.</p>
          ) : (
            <ul className="space-y-2">
              {contacts.map((c: Record<string, unknown>) => (
                <li key={c.id as string} className="text-sm">
                  <span className="font-medium text-[#1C2530]">{c.first_name as string} {c.last_name as string}</span>
                  {c.title && <span className="text-[#8A9BAE]"> · {c.title as string}</span>}
                  {c.email && <div className="text-[#8A9BAE]">{c.email as string}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Leads */}
        <div className="bg-white rounded-lg border border-[#8A9BAE]/20 p-5">
          <h2 className="font-semibold text-[#1C2530] mb-3">Leads ({leads.length})</h2>
          {leads.length === 0 ? (
            <p className="text-sm text-[#8A9BAE]">No leads yet.</p>
          ) : (
            <ul className="space-y-2">
              {leads.map((l: Record<string, unknown>) => (
                <li key={l.id as string} className="text-sm">
                  <Link href={`/leads/${l.id}`} className="font-medium text-[#1B3A6B] hover:underline">
                    {(l.title as string) ?? (l.product_interest as string) ?? 'Untitled lead'}
                  </Link>
                  <span className="text-[#8A9BAE] ml-2">{l.stage_name as string}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add sarren-crm/
git commit -m "feat: add companies API routes and companies list/detail pages"
```

---

## Task 7: Contacts API + UI

**Files:**
- Create: `sarren-crm/app/api/contacts/route.ts`
- Create: `sarren-crm/app/api/contacts/[id]/route.ts`
- Create: `sarren-crm/app/(app)/contacts/page.tsx`

**Step 1: Create contacts API**

```typescript
// sarren-crm/app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')

  const rows = q
    ? await sql`
        SELECT c.*, co.name AS company_name
        FROM contacts c
        LEFT JOIN companies co ON co.id = c.company_id
        WHERE c.first_name ILIKE ${'%' + q + '%'}
           OR c.last_name ILIKE ${'%' + q + '%'}
           OR c.email ILIKE ${'%' + q + '%'}
        ORDER BY c.first_name ASC
      `
    : await sql`
        SELECT c.*, co.name AS company_name
        FROM contacts c
        LEFT JOIN companies co ON co.id = c.company_id
        ORDER BY c.first_name ASC
      `

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { first_name, last_name, email, phone, title, company_id } = body

  if (!first_name?.trim()) {
    return NextResponse.json({ error: 'first_name is required' }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO contacts (first_name, last_name, email, phone, title, company_id)
    VALUES (${first_name.trim()}, ${last_name ?? null}, ${email ?? null},
            ${phone ?? null}, ${title ?? null}, ${company_id ?? null})
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
```

```typescript
// sarren-crm/app/api/contacts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { first_name, last_name, email, phone, title, company_id } = body

  const rows = await sql`
    UPDATE contacts
    SET first_name = COALESCE(${first_name ?? null}, first_name),
        last_name = COALESCE(${last_name ?? null}, last_name),
        email = COALESCE(${email ?? null}, email),
        phone = COALESCE(${phone ?? null}, phone),
        title = COALESCE(${title ?? null}, title),
        company_id = COALESCE(${company_id ?? null}, company_id),
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}
```

**Step 2: Create contacts list page**

```typescript
// sarren-crm/app/(app)/contacts/page.tsx
import Link from 'next/link'

async function getContacts() {
  const res = await fetch(`${process.env.CRM_BASE_URL}/api/contacts`, { cache: 'no-store' })
  return res.json()
}

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1C2530] mb-6">Contacts</h1>

      <div className="bg-white rounded-lg border border-[#8A9BAE]/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F6F7] border-b border-[#8A9BAE]/20">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Name</th>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Company</th>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Title</th>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Email</th>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Phone</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c: Record<string, unknown>) => (
              <tr key={c.id as string} className="border-b border-[#8A9BAE]/10 hover:bg-[#F5F6F7]">
                <td className="px-4 py-3 font-medium text-[#1C2530]">
                  {c.first_name as string} {c.last_name as string}
                </td>
                <td className="px-4 py-3 text-[#8A9BAE]">
                  {c.company_id
                    ? <Link href={`/companies/${c.company_id}`} className="text-[#1B3A6B] hover:underline">{c.company_name as string}</Link>
                    : '—'
                  }
                </td>
                <td className="px-4 py-3 text-[#8A9BAE]">{(c.title as string) ?? '—'}</td>
                <td className="px-4 py-3 text-[#8A9BAE]">{(c.email as string) ?? '—'}</td>
                <td className="px-4 py-3 text-[#8A9BAE]">{(c.phone as string) ?? '—'}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#8A9BAE]">No contacts yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add sarren-crm/
git commit -m "feat: add contacts API routes and contacts list page"
```

---

## Task 8: Leads list API + UI

**Files:**
- Create: `sarren-crm/app/api/leads/[id]/route.ts`
- Create: `sarren-crm/app/(app)/leads/page.tsx`

**Step 1: Create leads CRUD API**

```typescript
// sarren-crm/app/api/leads/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { calculateScore } from '@/lib/lead-score'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rows = await sql`
    SELECT l.*,
           ps.name AS stage_name,
           u.name AS assigned_to_name,
           co.name AS company_name,
           c.first_name || ' ' || COALESCE(c.last_name, '') AS contact_name
    FROM leads l
    LEFT JOIN pipeline_stages ps ON ps.id = l.stage_id
    LEFT JOIN users u ON u.id = l.assigned_to
    LEFT JOIN companies co ON co.id = l.company_id
    LEFT JOIN contacts c ON c.id = l.contact_id
    WHERE l.id = ${id}
    LIMIT 1
  `
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const activities = await sql`
    SELECT a.*, u.name AS user_name
    FROM activities a
    LEFT JOIN users u ON u.id = a.user_id
    WHERE a.lead_id = ${id}
    ORDER BY a.occurred_at DESC
  `

  return NextResponse.json({ lead: rows[0], activities })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const {
    title, stage_id, assigned_to, contact_id, company_id,
    deal_value, close_probability, expected_close, lost_reason,
    product_interest,
  } = body

  // Recalculate score if relevant fields changed
  let scoreUpdate = null
  if (product_interest !== undefined || deal_value !== undefined || stage_id !== undefined) {
    const existing = await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1`
    if (existing.length > 0) {
      const lead = existing[0]
      scoreUpdate = calculateScore({
        source: lead.source as string,
        product_interest: product_interest ?? lead.product_interest as string | null,
        deal_value: deal_value ?? lead.deal_value as number | null,
      })
      // Bonus: stage advanced beyond "New"
      const newStage = stage_id ?? lead.stage_id
      if (typeof newStage === 'number' && newStage > 1) scoreUpdate = Math.min(scoreUpdate + 20, 100)
    }
  }

  const rows = await sql`
    UPDATE leads
    SET title = COALESCE(${title ?? null}, title),
        stage_id = COALESCE(${stage_id ?? null}, stage_id),
        assigned_to = COALESCE(${assigned_to ?? null}, assigned_to),
        contact_id = COALESCE(${contact_id ?? null}, contact_id),
        company_id = COALESCE(${company_id ?? null}, company_id),
        deal_value = COALESCE(${deal_value ?? null}, deal_value),
        close_probability = COALESCE(${close_probability ?? null}, close_probability),
        expected_close = COALESCE(${expected_close ?? null}, expected_close),
        lost_reason = COALESCE(${lost_reason ?? null}, lost_reason),
        score = COALESCE(${scoreUpdate}, score),
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}
```

**Step 2: Create leads list page**

```typescript
// sarren-crm/app/(app)/leads/page.tsx
import Link from 'next/link'

const SOURCE_LABELS: Record<string, string> = {
  rfq: 'RFQ',
  surplus: 'Surplus',
  contact: 'Contact',
}

const SOURCE_COLORS: Record<string, string> = {
  rfq: 'bg-blue-100 text-blue-800',
  surplus: 'bg-green-100 text-green-800',
  contact: 'bg-gray-100 text-gray-700',
}

async function getLeads() {
  const res = await fetch(`${process.env.CRM_BASE_URL}/api/leads`, { cache: 'no-store' })
  return res.json()
}

export default async function LeadsPage() {
  const leads = await getLeads()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1C2530]">Leads</h1>
      </div>

      <div className="bg-white rounded-lg border border-[#8A9BAE]/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F6F7] border-b border-[#8A9BAE]/20">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Lead</th>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Company</th>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Source</th>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Score</th>
              <th className="text-left px-4 py-3 font-medium text-[#1C2530]">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l: Record<string, unknown>) => (
              <tr key={l.id as string} className="border-b border-[#8A9BAE]/10 hover:bg-[#F5F6F7]">
                <td className="px-4 py-3">
                  <Link href={`/leads/${l.id}`} className="font-medium text-[#1B3A6B] hover:underline">
                    {(l.title as string) ?? (l.product_interest as string) ?? (l.form_company as string) ?? 'New Lead'}
                  </Link>
                  <div className="text-[#8A9BAE] text-xs">{l.form_name as string}</div>
                </td>
                <td className="px-4 py-3 text-[#8A9BAE]">{(l.form_company as string) ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SOURCE_COLORS[l.source as string] ?? 'bg-gray-100 text-gray-700'}`}>
                    {SOURCE_LABELS[l.source as string] ?? l.source as string}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#8A9BAE]">{(l.stage_name as string) ?? 'New'}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-[#1C2530]">{l.score as number}</span>
                </td>
                <td className="px-4 py-3 text-[#8A9BAE] text-xs">
                  {new Date(l.created_at as string).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#8A9BAE]">No leads yet. Submit a form on the public website to see leads appear here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 3: Update GET /api/leads to also return list**

Add a `GET` handler to `sarren-crm/app/api/leads/route.ts`:

```typescript
export async function GET() {
  const rows = await sql`
    SELECT l.*,
           ps.name AS stage_name,
           u.name AS assigned_to_name
    FROM leads l
    LEFT JOIN pipeline_stages ps ON ps.id = l.stage_id
    LEFT JOIN users u ON u.id = l.assigned_to
    ORDER BY l.created_at DESC
  `
  return NextResponse.json(rows)
}
```

**Step 4: Commit**

```bash
git add sarren-crm/
git commit -m "feat: add leads list API and UI"
```

---

## Task 9: Lead detail page + activity logging

**Files:**
- Create: `sarren-crm/app/(app)/leads/[id]/page.tsx`
- Create: `sarren-crm/app/api/activities/route.ts`

**Step 1: Create activities API**

```typescript
// sarren-crm/app/api/activities/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(
    req,
    new Response(),
    sessionOptions
  )

  const body = await req.json()
  const { lead_id, type, body: activityBody, occurred_at } = body

  if (!lead_id || !type || !activityBody) {
    return NextResponse.json({ error: 'lead_id, type, and body are required' }, { status: 400 })
  }

  const rows = await sql`
    INSERT INTO activities (lead_id, user_id, type, body, occurred_at)
    VALUES (
      ${lead_id},
      ${session.userId ?? null},
      ${type},
      ${activityBody},
      ${occurred_at ?? 'now()'}
    )
    RETURNING *
  `
  return NextResponse.json(rows[0], { status: 201 })
}
```

**Step 2: Create lead detail page**

```typescript
// sarren-crm/app/(app)/leads/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LeadDetailClient from './LeadDetailClient'

async function getLead(id: string) {
  const res = await fetch(`${process.env.CRM_BASE_URL}/api/leads/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

async function getStages() {
  const { sql } = await import('@/lib/db')
  return sql`SELECT * FROM pipeline_stages ORDER BY position`
}

async function getUsers() {
  const { sql } = await import('@/lib/db')
  return sql`SELECT id, name FROM users ORDER BY name`
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [data, stages, users] = await Promise.all([getLead(id), getStages(), getUsers()])
  if (!data) notFound()

  return <LeadDetailClient lead={data.lead} activities={data.activities} stages={stages} users={users} />
}
```

**Step 3: Create LeadDetailClient component**

```typescript
// sarren-crm/app/(app)/leads/[id]/LeadDetailClient.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const ACTIVITY_TYPES = ['note', 'call', 'email', 'meeting', 'quote_sent']

const SOURCE_LABELS: Record<string, string> = {
  rfq: 'RFQ',
  surplus: 'Surplus',
  contact: 'Contact',
}

interface Stage { id: number; name: string }
interface User { id: string; name: string }
interface Activity {
  id: string
  type: string
  body: string
  occurred_at: string
  user_name?: string
}
interface Lead {
  id: string
  source: string
  title?: string
  stage_id: number
  stage_name?: string
  assigned_to?: string
  assigned_to_name?: string
  company_id?: string
  company_name?: string
  form_name?: string
  form_email?: string
  form_company?: string
  form_phone?: string
  product_interest?: string
  message?: string
  deal_value?: number
  close_probability?: number
  score: number
  expected_close?: string
  created_at: string
}

export default function LeadDetailClient({
  lead: initialLead,
  activities: initialActivities,
  stages,
  users,
}: {
  lead: Lead
  activities: Activity[]
  stages: Stage[]
  users: User[]
}) {
  const router = useRouter()
  const [lead, setLead] = useState(initialLead)
  const [activities, setActivities] = useState(initialActivities)
  const [activityType, setActivityType] = useState('note')
  const [activityBody, setActivityBody] = useState('')
  const [saving, setSaving] = useState(false)

  async function updateField(field: string, value: string | number | null) {
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) {
      const updated = await res.json()
      setLead(prev => ({ ...prev, ...updated }))
    }
  }

  async function logActivity(e: React.FormEvent) {
    e.preventDefault()
    if (!activityBody.trim()) return
    setSaving(true)

    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: lead.id, type: activityType, body: activityBody }),
    })

    if (res.ok) {
      const newActivity = await res.json()
      setActivities(prev => [newActivity, ...prev])
      setActivityBody('')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-4">
        <Link href="/leads" className="text-sm text-[#8A9BAE] hover:text-[#1B3A6B]">← Leads</Link>
      </div>

      <div className="flex gap-6">
        {/* Left panel */}
        <div className="w-80 space-y-4">
          <div className="bg-white rounded-lg border border-[#8A9BAE]/20 p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-[#8A9BAE] uppercase tracking-wide">Title</label>
              <input
                defaultValue={lead.title ?? ''}
                onBlur={e => updateField('title', e.target.value || null)}
                placeholder="Add a title…"
                className="w-full mt-1 text-sm border border-[#8A9BAE]/30 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#8A9BAE] uppercase tracking-wide">Stage</label>
              <select
                value={lead.stage_id}
                onChange={e => updateField('stage_id', Number(e.target.value))}
                className="w-full mt-1 text-sm border border-[#8A9BAE]/30 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#8A9BAE] uppercase tracking-wide">Assigned to</label>
              <select
                value={lead.assigned_to ?? ''}
                onChange={e => updateField('assigned_to', e.target.value || null)}
                className="w-full mt-1 text-sm border border-[#8A9BAE]/30 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-[#8A9BAE] uppercase tracking-wide">Deal Value ($)</label>
                <input
                  type="number"
                  defaultValue={lead.deal_value ?? ''}
                  onBlur={e => updateField('deal_value', e.target.value ? Number(e.target.value) : null)}
                  className="w-full mt-1 text-sm border border-[#8A9BAE]/30 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
                />
              </div>
              <div className="w-20">
                <label className="text-xs font-medium text-[#8A9BAE] uppercase tracking-wide">Score</label>
                <div className="mt-1 text-sm font-bold text-[#1B3A6B] px-2 py-1">{lead.score}</div>
              </div>
            </div>
          </div>

          {/* Original form data */}
          <div className="bg-white rounded-lg border border-[#8A9BAE]/20 p-5">
            <h3 className="text-xs font-medium text-[#8A9BAE] uppercase tracking-wide mb-3">Original Submission</h3>
            <div className="space-y-1 text-sm">
              <div><span className="text-[#8A9BAE]">Source:</span> <span className="font-medium">{SOURCE_LABELS[lead.source] ?? lead.source}</span></div>
              {lead.form_name && <div><span className="text-[#8A9BAE]">Name:</span> {lead.form_name}</div>}
              {lead.form_email && <div><span className="text-[#8A9BAE]">Email:</span> {lead.form_email}</div>}
              {lead.form_company && <div><span className="text-[#8A9BAE]">Company:</span> {lead.form_company}</div>}
              {lead.form_phone && <div><span className="text-[#8A9BAE]">Phone:</span> {lead.form_phone}</div>}
              {lead.product_interest && <div><span className="text-[#8A9BAE]">Product:</span> {lead.product_interest}</div>}
              {lead.message && (
                <div className="mt-2">
                  <span className="text-[#8A9BAE]">Message:</span>
                  <p className="mt-1 text-[#1C2530] whitespace-pre-wrap bg-[#F5F6F7] rounded p-2">{lead.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel — activity timeline */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-[#8A9BAE]/20 p-5">
            <h2 className="font-semibold text-[#1C2530] mb-4">Activity</h2>

            {/* Log activity form */}
            <form onSubmit={logActivity} className="mb-6 space-y-2">
              <div className="flex gap-2">
                <select
                  value={activityType}
                  onChange={e => setActivityType(e.target.value)}
                  className="text-sm border border-[#8A9BAE]/30 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B]"
                >
                  {ACTIVITY_TYPES.map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={activityBody}
                onChange={e => setActivityBody(e.target.value)}
                placeholder="Log a note, call, or email…"
                rows={3}
                className="w-full text-sm border border-[#8A9BAE]/30 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1B3A6B] resize-none"
              />
              <button
                type="submit"
                disabled={saving || !activityBody.trim()}
                className="bg-[#1B3A6B] text-white text-sm px-4 py-1.5 rounded hover:bg-[#1B3A6B]/90 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Log activity'}
              </button>
            </form>

            {/* Timeline */}
            <div className="space-y-4">
              {activities.map(a => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#8A9BAE] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-[#8A9BAE] mb-0.5">
                      <span className="font-medium capitalize">{a.type.replace('_', ' ')}</span>
                      <span>·</span>
                      <span>{new Date(a.occurred_at).toLocaleString()}</span>
                      {a.user_name && <><span>·</span><span>{a.user_name}</span></>}
                    </div>
                    <p className="text-sm text-[#1C2530] whitespace-pre-wrap">{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Commit**

```bash
git add sarren-crm/
git commit -m "feat: add lead detail page with activity logging"
```

---

## Task 10: Dashboard

**Files:**
- Create: `sarren-crm/app/(app)/dashboard/page.tsx`

**Step 1: Create dashboard page**

```typescript
// sarren-crm/app/(app)/dashboard/page.tsx
import Link from 'next/link'
import { sql } from '@/lib/db'

async function getDashboardData() {
  const [leadStats, recentActivities, staleleads] = await Promise.all([
    sql`
      SELECT
        COUNT(*) FILTER (WHERE created_at > now() - interval '30 days') AS leads_this_month,
        COUNT(*) FILTER (WHERE stage_id NOT IN (4,5)) AS open_leads,
        COUNT(*) AS total_leads
      FROM leads
    `,
    sql`
      SELECT a.*, l.form_company, l.form_name, l.title, l.product_interest
      FROM activities a
      JOIN leads l ON l.id = a.lead_id
      ORDER BY a.occurred_at DESC
      LIMIT 10
    `,
    sql`
      SELECT l.*, ps.name AS stage_name
      FROM leads l
      LEFT JOIN pipeline_stages ps ON ps.id = l.stage_id
      WHERE l.stage_id NOT IN (4,5)
        AND l.id NOT IN (
          SELECT DISTINCT lead_id FROM activities
          WHERE occurred_at > now() - interval '5 days'
        )
      ORDER BY l.created_at ASC
      LIMIT 10
    `,
  ])

  return {
    stats: leadStats[0],
    recentActivities,
    staleLeads: staleleads,
  }
}

export default async function DashboardPage() {
  const { stats, recentActivities, staleLeads } = await getDashboardData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#1C2530]">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Leads This Month', value: stats.leads_this_month },
          { label: 'Open Leads', value: stats.open_leads },
          { label: 'Total Leads', value: stats.total_leads },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-lg border border-[#8A9BAE]/20 p-5">
            <div className="text-3xl font-bold text-[#1B3A6B]">{card.value}</div>
            <div className="text-sm text-[#8A9BAE] mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-lg border border-[#8A9BAE]/20 p-5">
          <h2 className="font-semibold text-[#1C2530] mb-4">Recent Activity</h2>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-[#8A9BAE]">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivities.map((a: Record<string, unknown>) => (
                <li key={a.id as string} className="text-sm">
                  <Link href={`/leads/${a.lead_id}`} className="font-medium text-[#1B3A6B] hover:underline">
                    {(a.title as string) ?? (a.product_interest as string) ?? (a.form_company as string) ?? 'Lead'}
                  </Link>
                  <span className="text-[#8A9BAE] mx-1">·</span>
                  <span className="text-[#8A9BAE] capitalize">{(a.type as string).replace('_', ' ')}</span>
                  <div className="text-[#8A9BAE] text-xs">{new Date(a.occurred_at as string).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Needs attention */}
        <div className="bg-white rounded-lg border border-[#8A9BAE]/20 p-5">
          <h2 className="font-semibold text-[#1C2530] mb-4">Needs Follow-up</h2>
          <p className="text-xs text-[#8A9BAE] mb-3">Open leads with no activity in 5+ days</p>
          {staleLeads.length === 0 ? (
            <p className="text-sm text-[#8A9BAE]">All leads have recent activity.</p>
          ) : (
            <ul className="space-y-2">
              {staleLeads.map((l: Record<string, unknown>) => (
                <li key={l.id as string} className="text-sm">
                  <Link href={`/leads/${l.id}`} className="font-medium text-[#1B3A6B] hover:underline">
                    {(l.title as string) ?? (l.product_interest as string) ?? (l.form_company as string) ?? 'Lead'}
                  </Link>
                  <span className="text-[#8A9BAE] ml-2 text-xs">{l.stage_name as string}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add sarren-crm/
git commit -m "feat: add dashboard with lead stats, recent activity, and stale leads"
```

---

## Task 11: Integrate sarren-next — POST leads to CRM

**Files:**
- Modify: `sarren-next/src/app/api/contact/route.ts`

**Step 1: Read the existing contact route**

Read `sarren-next/src/app/api/contact/route.ts` in full before editing.

**Step 2: Add CRM lead forwarding after email send**

Add this helper function and call it in the POST handler after `transporter.sendMail()` succeeds:

```typescript
// Add at the top of route.ts, after imports:
async function forwardToCRM(type: FormType, data: Record<string, string>): Promise<void> {
  const crmUrl = process.env.CRM_API_URL
  const crmSecret = process.env.CRM_API_SECRET

  if (!crmUrl || !crmSecret) return  // CRM not configured — skip silently

  await fetch(crmUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Secret': crmSecret,
    },
    body: JSON.stringify({ source: type, ...data }),
  })
}
```

Then in the `POST` handler, after the `sendMail` call:

```typescript
// After: await transporter.sendMail(...)
// Add:
forwardToCRM(type, data).catch(err =>
  console.error('Failed to forward lead to CRM:', err)
)
```

Make the CRM forwarding non-blocking (`.catch`) so that if the CRM is down, the website form still works.

**Step 3: Add env vars to sarren-next**

Add to `sarren-next/.env.local`:

```
CRM_API_URL=http://localhost:3001/api/leads
CRM_API_SECRET=<same value as CRM's CRM_API_SECRET>
```

**Step 4: Test end-to-end**

1. Start CRM on port 3001: `cd sarren-crm && npm run dev -- --port 3001`
2. Start sarren-next on port 3000: `cd sarren-next && npm run dev`
3. Submit an RFQ form at http://localhost:3000
4. Check CRM leads list at http://localhost:3001/leads — new lead should appear

**Step 5: Run all tests**

```bash
cd sarren-crm && npm test
cd sarren-next && npm test
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add sarren-next/src/app/api/contact/route.ts sarren-next/.env.local
git commit -m "feat: forward leads from sarren-next public forms to sarren-crm API"
```

---

## Task 12: Final checks and deployment prep

**Files:**
- Create: `sarren-crm/.env.production.example`

**Step 1: Run full test suite**

```bash
cd sarren-crm && npm test
```

Expected: All tests pass.

**Step 2: Build check**

```bash
cd sarren-crm && npm run build
```

Expected: Build completes without errors.

**Step 3: Create production env example**

```bash
# sarren-crm/.env.production.example
DATABASE_URL=postgresql://...@....neon.tech/neondb?sslmode=require
SESSION_SECRET=<32+ random characters>
CRM_API_SECRET=<shared secret with sarren-next>
CRM_BASE_URL=https://sarren-crm.vercel.app
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=notifications@sarrenchemicals.com
SMTP_PASS=<smtp password>
CONTACT_EMAIL=info@sarrenchemicals.com
```

**Step 4: Deploy to Vercel**

```bash
cd sarren-crm
npx vercel --prod
```

Set all env vars in the Vercel dashboard before deploying:
- Settings → Environment Variables → add all from `.env.production.example`

**Step 5: Run migration against production Neon DB**

```bash
DATABASE_URL=<production-url> npm run migrate
DATABASE_URL=<production-url> npm run seed
```

**Step 6: Update sarren-next production env vars**

In the sarren-next Vercel dashboard, add:
- `CRM_API_URL` = `https://sarren-crm.vercel.app/api/leads`
- `CRM_API_SECRET` = same value as CRM's `CRM_API_SECRET`

**Step 7: Final commit**

```bash
git add sarren-crm/.env.production.example
git commit -m "docs: add production environment variable template"
```

---

## Summary of Files Created

```
sarren-crm/
├── app/
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── leads/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── LeadDetailClient.tsx
│   │   ├── companies/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── contacts/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── leads/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── companies/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── contacts/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── activities/route.ts
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Sidebar.tsx
├── lib/
│   ├── db.ts
│   ├── db.test.ts
│   ├── email.ts
│   ├── email.test.ts
│   ├── lead-score.ts
│   ├── lead-score.test.ts
│   ├── schema.sql
│   └── session.ts
│   └── session.test.ts
├── middleware.ts
├── scripts/
│   ├── migrate.ts
│   └── seed.ts
├── vitest.config.ts
└── .env.local
```

**Modified in sarren-next:**
- `src/app/api/contact/route.ts` — add `forwardToCRM()` call
