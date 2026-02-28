# Sarren Chemicals CRM — Design Document
**Date:** 2026-02-27

---

## Overview

A standalone internal CRM web application for the Sarren Chemicals team. Stores leads in Neon PostgreSQL. Receives lead data automatically from the public sarren-next website when a form is submitted. Sends email notifications on new leads via SMTP/nodemailer.

---

## Decisions

| Decision | Choice |
|---|---|
| Deployment | Separate Next.js project (`sarren-crm`), deployed to Vercel |
| Tech stack | Next.js (App Router), TypeScript, Tailwind CSS |
| Database | Neon PostgreSQL (`@neondatabase/serverless` driver, no ORM) |
| Auth | iron-session, email + bcrypt password, 7-day cookie |
| Users | 2–5 team members, all with equal access (no roles) |
| Lead capture | sarren-next POSTs to `/api/leads` with `X-API-Secret` header |
| Email | SMTP / nodemailer (same as existing sarren-next contact form) |
| Data model | Option 2 — Standard normalized CRM |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PUBLIC WEBSITE                           │
│                      sarren-next (Vercel)                       │
│                                                                 │
│   RFQ Form ──┐                                                  │
│   Surplus Form─┼──► POST /api/leads  ──────────────────────────┼──►┐
│   Contact Form─┘    (with X-API-Secret header)                  │   │
└─────────────────────────────────────────────────────────────────┘   │
                                                                       │
┌─────────────────────────────────────────────────────────────────┐   │
│                       CRM APPLICATION                           │   │
│                     sarren-crm (Vercel)                         │◄──┘
│                                                                 │
│  Next.js App Router                                             │
│                                                                 │
│  API Routes (src/app/api/)                                      │
│  ├── POST /api/leads          ← receives from public site       │
│  │     ├── INSERT into Neon DB                                  │
│  │     └── Send email via SMTP/nodemailer                       │
│  ├── GET/PATCH /api/leads/[id]                                  │
│  ├── GET/POST /api/companies                                    │
│  ├── GET/POST /api/contacts                                     │
│  ├── POST /api/activities                                       │
│  └── POST /api/auth/login                                       │
│                                                                 │
│  CRM UI (src/app/)                                              │
│  ├── /login                                                     │
│  ├── /dashboard                                                 │
│  ├── /leads                                                     │
│  ├── /leads/[id]                                                │
│  ├── /companies                                                 │
│  ├── /companies/[id]                                            │
│  └── /contacts                                                  │
│                                                                 │
│                    ┌──────────────────┐                         │
│                    │  Neon PostgreSQL  │                         │
│                    │  (serverless)     │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

**Integration security:** sarren-next includes an `X-API-Secret` header on all `POST /api/leads` requests. The CRM validates this against `CRM_API_SECRET` env var before accepting any data.

---

## Database Schema

```sql
-- ─────────────────────────────────────────────────────
-- USERS  (CRM team members)
-- ─────────────────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────
-- COMPANIES  (buyer organizations)
-- ─────────────────────────────────────────────────────
CREATE TABLE companies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  industry   TEXT,          -- e.g. 'paint', 'adhesives', 'drymix'
  website    TEXT,
  city       TEXT,
  state      TEXT,
  country    TEXT DEFAULT 'US',
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────
-- CONTACTS  (individual people at a company)
-- ─────────────────────────────────────────────────────
CREATE TABLE contacts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name  TEXT,
  email      TEXT,
  phone      TEXT,
  title      TEXT,          -- e.g. 'Procurement Manager'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────
-- PIPELINE STAGES  (lookup / ordered list)
-- ─────────────────────────────────────────────────────
CREATE TABLE pipeline_stages (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,  -- 'New', 'Contacted', 'Quoted', 'Closed Won', 'Closed Lost'
  position INT NOT NULL           -- display order
);

-- Default stages (seeded on init):
-- 1: New (position 1)
-- 2: Contacted (position 2)
-- 3: Quoted (position 3)
-- 4: Closed Won (position 4)
-- 5: Closed Lost (position 5)

-- ─────────────────────────────────────────────────────
-- LEADS  (individual inquiries / opportunities)
-- ─────────────────────────────────────────────────────
CREATE TABLE leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id        UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id        UUID REFERENCES companies(id) ON DELETE SET NULL,
  assigned_to       UUID REFERENCES users(id) ON DELETE SET NULL,
  stage_id          INT REFERENCES pipeline_stages(id) DEFAULT 1,

  -- From public website form (captured automatically)
  source            TEXT NOT NULL,       -- 'rfq' | 'surplus' | 'contact'
  form_name         TEXT,                -- contact name at time of submit
  form_email        TEXT,                -- email at time of submit
  form_company      TEXT,                -- company name at time of submit
  form_phone        TEXT,
  product_interest  TEXT,                -- product or material name
  message           TEXT,                -- original message body

  -- Entered internally by team
  title             TEXT,                -- short label e.g. "TiO2 RFQ - Sherwin 2026"
  deal_value        NUMERIC(12,2),       -- estimated $ value
  close_probability INT CHECK (close_probability BETWEEN 0 AND 100),
  score             INT DEFAULT 0,       -- lead score (0–100)
  expected_close    DATE,
  lost_reason       TEXT,

  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────
-- ACTIVITIES  (communication history log)
-- ─────────────────────────────────────────────────────
CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  type        TEXT NOT NULL,  -- 'note' | 'call' | 'email' | 'meeting' | 'quote_sent'
  body        TEXT NOT NULL,
  occurred_at TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);
```

### Data Captured From Public Website Forms

The following fields are populated automatically when `POST /api/leads` is called from sarren-next:

| Field | Source |
|---|---|
| `source` | Form type (`rfq`, `surplus`, `contact`) |
| `form_name` | Submitter's name field |
| `form_email` | Submitter's email field |
| `form_company` | Company name field (if present) |
| `form_phone` | Phone field (if present) |
| `product_interest` | Product or material name field |
| `message` | Message body |
| `created_at` | Server timestamp |

### Data Entered Internally by Team

| Field | Entered in CRM |
|---|---|
| `title` | Short internal label for the opportunity |
| `stage_id` | Pipeline stage (dropdown) |
| `assigned_to` | Team member responsible |
| `contact_id` | Link to a `contacts` record |
| `company_id` | Link to a `companies` record |
| `deal_value` | Estimated $ value |
| `close_probability` | 0–100% |
| `expected_close` | Target close date |
| `lost_reason` | Why the deal was lost |
| `score` | Auto-calculated + manually adjustable |
| Activities | Calls, emails, notes, meetings |

---

## Lead Scoring (Simple, Application-Level)

Score is recalculated and stored on `leads.score` whenever lead data changes. Points:

| Condition | Points |
|---|---|
| Source = `rfq` | +30 |
| `deal_value` entered | +20 |
| `product_interest` filled | +10 |
| Activity logged within 48h of creation | +20 |
| Stage advanced past "New" | +20 |

Maximum: 100. Score displayed as a badge on the lead list and detail page.

---

## Email Notification Workflow

Triggered by `POST /api/leads` after successful DB insert:

```
sarren-next form submit
  └─► POST /api/leads (CRM)
        ├─► Validate X-API-Secret header
        ├─► INSERT into leads table
        ├─► nodemailer.sendMail()
        │     To: CONTACT_EMAIL env var
        │     Subject: "New [RFQ/Surplus/Contact] Lead — {form_company} / {form_name}"
        │     Body: all form fields + CRM link
        └─► 200 OK
```

Email body includes a direct link to the lead detail page: `{CRM_BASE_URL}/leads/{id}`.

---

## Authentication

- `users` table stores team members (created via a seed script — no self-registration UI)
- Login: email + bcrypt-hashed password
- Session: iron-session HTTP-only cookie, 7-day TTL
- Middleware: protects all routes except `/login` and `POST /api/leads`
- `POST /api/leads` is protected by `X-API-Secret` header (not user session)

---

## CRM UI — Pages

### `/login`
Email + password form. On success, sets iron-session cookie and redirects to `/dashboard`.

---

### `/dashboard`
- Summary stat cards: Total leads (this month), Open leads, Leads by stage
- Recent activity feed (last 10 activities across all leads)
- Attention needed: leads with no activity in >5 days

---

### `/leads`
- Table view: Title/product, Company, Source badge, Stage, Score, Assigned, Created
- Filters: Stage, Source, Assigned to
- Sort: Created date, Score, Deal value
- "New Lead" button for manual entries

---

### `/leads/[id]`
Split-panel layout:

**Left panel — Lead info (all editable inline):**
- Title, Stage (dropdown), Assigned to (dropdown)
- Deal value, Close probability, Expected close date
- Score badge
- Contact link (search/link to existing or create new)
- Company link (search/link to existing or create new)
- Original form submission (read-only): Source, form fields, message

**Right panel — Activity timeline:**
- Chronological log of all activities
- "Log Activity" button: type selector (note/call/email/meeting/quote_sent) + text body
- First activity auto-logged as "Form submitted" on lead creation

---

### `/companies`
- Searchable list of all companies
- Click row → company detail

### `/companies/[id]`
- Company details (editable)
- All contacts at this company
- All leads associated with this company

### `/contacts`
- Searchable list of all contacts
- Shows linked company, email, phone

---

## Data Normalization Notes

- `form_name`, `form_email`, `form_company` are preserved verbatim on the lead (immutable audit trail of what was submitted)
- Once the team links a lead to a `contacts` record and a `companies` record, those are the authoritative records
- A contact can exist without a company (for individual buyers)
- A lead can exist without a linked contact (stays as raw form data until qualified)

---

## Future Extensions (Not in Scope)

The following were considered but excluded per YAGNI. Add when real need emerges:

- Sample request tracking (`sample_requests` table)
- MSDS/SDS/COA document tracking per product per lead
- Product catalog mirror from Vercel KV
- Pipeline/kanban board view
- Lead assignment notifications
- CSV export
