# SarrenChemicals Next.js Build — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the full SarrenChemicals website as a Next.js 14 App Router application with TypeScript and Tailwind CSS — 6 pages, 3 forms, downloadable PDFs, and a clean modern industrial design.

**Architecture:** Next.js 14 App Router (`src/app/` structure). Each page is a React Server Component. Forms use a Next.js API route (`/api/contact`) to send email via nodemailer. Tailwind CSS for all styling using a custom design token config. No client-side state management needed — forms use controlled components with minimal `"use client"` only where needed.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, nodemailer (form email), no UI library.

**Design Reference:** `docs/plans/2026-02-26-sarren-chemicals-website-design.md`

**Existing static HTML files** in the project root are reference/draft only — ignore them. The Next.js app lives in a new `sarren-next/` subdirectory.

---

## Design Tokens (Tailwind config)

```js
// tailwind.config.ts colors to add under `extend.colors`:
navy: '#1B3A6B',
'navy-dark': '#152f59',
offwhite: '#F5F6F7',
steel: '#8A9BAE',
charcoal: '#1C2530',
border: '#D8DDE3',
```

---

## Project Structure (Target)

```
sarren-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (nav + footer)
│   │   ├── page.tsx            # Home
│   │   ├── globals.css
│   │   ├── products/
│   │   │   └── page.tsx
│   │   ├── sell-surplus/
│   │   │   └── page.tsx
│   │   ├── logistics/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── contact/
│   │           └── route.ts    # Form email handler
│   └── components/
│       ├── Nav.tsx
│       ├── Footer.tsx
│       ├── Hero.tsx
│       ├── PageHero.tsx
│       ├── ProductCard.tsx
│       ├── RfqForm.tsx
│       ├── SurplusForm.tsx
│       └── ContactForm.tsx
├── public/
│   └── pdfs/                   # PDF placeholder dir
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Task 1: Scaffold Next.js App

**Directory:** `/Users/jonlarkin/SarrenChemicals/sarren-next/`

**Step 1: Run create-next-app**

```bash
cd /Users/jonlarkin/SarrenChemicals
npx create-next-app@latest sarren-next \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias \
  --yes
```

Expected: Project created at `sarren-next/` with App Router, TypeScript, Tailwind, ESLint.

**Step 2: Install nodemailer**

```bash
cd sarren-next
npm install nodemailer
npm install --save-dev @types/nodemailer
```

**Step 3: Update tailwind.config.ts to add design tokens**

Open `sarren-next/tailwind.config.ts` and update the `extend.colors` section:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#1B3A6B',
        'navy-dark': '#152f59',
        offwhite: '#F5F6F7',
        steel: '#8A9BAE',
        charcoal: '#1C2530',
        border: '#D8DDE3',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [],
}
export default config
```

**Step 4: Replace globals.css**

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-size: 17px;
    -webkit-font-smoothing: antialiased;
  }
  body {
    @apply text-charcoal bg-white font-sans;
  }
  h1 { @apply text-[52px] font-bold leading-[1.15] text-navy; }
  h2 { @apply text-[36px] font-semibold leading-[1.2] text-navy; }
  h3 { @apply text-[22px] font-semibold leading-[1.3] text-navy; }
  p  { @apply text-[17px] leading-relaxed text-charcoal; }
  a  { @apply text-navy no-underline; }
  a:hover { @apply underline; }
}

@layer components {
  .label {
    @apply block text-[13px] font-medium uppercase tracking-[0.08em] text-steel;
  }
  .btn {
    @apply inline-flex items-center h-12 px-7 rounded font-semibold text-[15px] cursor-pointer transition-colors duration-150 border-2 border-transparent no-underline;
  }
  .btn:hover { @apply no-underline; }
  .btn-primary {
    @apply bg-navy text-white border-navy hover:bg-navy-dark hover:border-navy-dark;
  }
  .btn-outline {
    @apply bg-transparent text-navy border-navy hover:bg-navy hover:text-white;
  }
  .btn-white {
    @apply bg-white text-navy border-white hover:bg-offwhite;
  }
  .section-pad {
    @apply py-24;
  }
  .section-alt {
    @apply bg-offwhite;
  }
  .container-content {
    @apply max-w-content mx-auto px-8;
  }
  .card {
    @apply bg-white border border-border rounded p-7 hover:border-steel transition-colors duration-150;
  }
  .form-label {
    @apply block text-[13px] font-medium uppercase tracking-[0.08em] text-steel mb-2;
  }
  .form-input {
    @apply w-full h-12 px-4 border border-border rounded font-sans text-base text-charcoal bg-white transition-colors duration-150 focus:outline-none focus:border-navy;
  }
  .form-textarea {
    @apply w-full px-4 py-4 border border-border rounded font-sans text-base text-charcoal bg-white transition-colors duration-150 focus:outline-none focus:border-navy resize-y min-h-[140px];
  }
  .form-select {
    @apply w-full h-12 px-4 border border-border rounded font-sans text-base text-charcoal bg-white transition-colors duration-150 focus:outline-none focus:border-navy;
  }
  .section-header {
    @apply mb-14;
  }
  .section-header .label {
    @apply mb-3;
  }
  .section-header h2 {
    @apply mb-4;
  }
  .section-header p {
    @apply text-steel text-[18px];
  }
}

@media (max-width: 640px) {
  h1 { font-size: 36px; }
  h2 { font-size: 28px; }
}
```

**Step 5: Create public/pdfs directory**

```bash
mkdir -p sarren-next/public/pdfs
cat > sarren-next/public/pdfs/README.md << 'EOF'
# PDF Downloads

Place the following files in this directory:

- `sarren-line-card.pdf` — Product line card
- `sarren-capability-statement.pdf` — Capability statement
- `sarren-sample-coa.pdf` — Sample Certificate of Analysis

These are linked from the footer of all pages.
EOF
```

**Step 6: Delete default Next.js placeholder content**

Delete `src/app/page.tsx` content (we'll rewrite it in Task 4).
Delete `src/app/globals.css` content (already replaced in Step 4).
Remove any default boilerplate from the page.

**Step 7: Verify dev server starts**

```bash
cd sarren-next && npm run dev
```

Expected: Server starts on http://localhost:3000 without errors.

**Step 8: Commit**

```bash
cd /Users/jonlarkin/SarrenChemicals/sarren-next
git add .
git commit -m "chore: scaffold Next.js app with Tailwind and design tokens"
```

---

## Task 2: Nav Component (`src/components/Nav.tsx`)

**File:** Create `src/components/Nav.tsx`

This is a Client Component (needs `"use client"` for mobile menu state).

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/sell-surplus', label: 'Sell Your Surplus' },
  { href: '/logistics', label: 'Logistics' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-border">
      <div className="max-w-content mx-auto px-8 h-[72px] flex items-center justify-between">
        <Link href="/" className="text-[20px] font-bold text-navy tracking-tight hover:no-underline">
          Sarren Chemicals
        </Link>

        {/* Mobile toggle */}
        <button
          className="flex md:hidden flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span className="block w-6 h-[2px] bg-charcoal transition-transform" />
          <span className="block w-6 h-[2px] bg-charcoal transition-transform" />
          <span className="block w-6 h-[2px] bg-charcoal transition-transform" />
        </button>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-9 list-none items-center">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`text-[14px] font-medium uppercase tracking-[0.04em] hover:text-navy hover:no-underline transition-colors ${
                  pathname === href ? 'text-navy font-semibold' : 'text-charcoal'
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li className="ml-4">
            <Link href="/contact#rfq" className="btn btn-primary">
              Request a Quote
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute left-0 right-0 bg-white border-b border-border z-[99] px-8 py-6 flex flex-col gap-5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-[14px] font-medium uppercase tracking-[0.04em] hover:text-navy hover:no-underline ${
                pathname === href ? 'text-navy font-semibold' : 'text-charcoal'
              }`}
            >
              {label}
            </Link>
          ))}
          <Link href="/contact#rfq" className="btn btn-primary w-full justify-center" onClick={() => setOpen(false)}>
            Request a Quote
          </Link>
        </div>
      )}
    </nav>
  )
}
```

**Commit:**
```bash
git add src/components/Nav.tsx
git commit -m "feat: add Nav component with mobile menu"
```

---

## Task 3: Footer Component (`src/components/Footer.tsx`)

**File:** Create `src/components/Footer.tsx`

Server Component (no interactivity needed).

```tsx
import Link from 'next/link'

const pages = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/sell-surplus', label: 'Sell Your Surplus' },
  { href: '/logistics', label: 'Logistics' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const pdfs = [
  { href: '/pdfs/sarren-line-card.pdf', label: 'Line Card (PDF)' },
  { href: '/pdfs/sarren-capability-statement.pdf', label: 'Capability Statement (PDF)' },
  { href: '/pdfs/sarren-sample-coa.pdf', label: 'Sample COA (PDF)' },
]

export default function Footer() {
  return (
    <footer className="bg-navy text-white pt-16 pb-8">
      <div className="max-w-content mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Brand */}
          <div>
            <span className="text-[20px] font-bold text-white">Sarren Chemicals</span>
            <p className="text-white/70 text-[15px] mt-4 max-w-[280px]">
              Buying and selling surplus, aged, and off-spec chemicals since 1997. Confidential. Reliable. Experienced.
            </p>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/50 mb-4">Pages</h4>
            <ul className="list-none flex flex-col gap-[10px]">
              {pages.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/80 text-[15px] hover:text-white hover:no-underline transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/50 mb-4">Resources</h4>
            <ul className="list-none flex flex-col gap-[10px]">
              {pdfs.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-white/80 text-[15px] hover:text-white hover:no-underline transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/50 mb-4">Contact</h4>
            <ul className="list-none flex flex-col gap-[10px]">
              <li>
                <a href="mailto:info@sarrenchemicals.com" className="text-white/80 text-[15px] hover:text-white hover:no-underline transition-colors">
                  info@sarrenchemicals.com
                </a>
              </li>
              <li>
                <a href="tel:+1-XXX-XXX-XXXX" className="text-white/80 text-[15px] hover:text-white hover:no-underline transition-colors">
                  (XXX) XXX-XXXX
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[13px] text-white/40">
          <span>&copy; {new Date().getFullYear()} Sarren Chemicals. All rights reserved.</span>
          <span>No supplier names are displayed on this site.</span>
        </div>
      </div>
    </footer>
  )
}
```

**Commit:**
```bash
git add src/components/Footer.tsx
git commit -m "feat: add Footer component"
```

---

## Task 4: Root Layout (`src/app/layout.tsx`)

**File:** Overwrite `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

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
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

**Commit:**
```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: add root layout with nav and footer"
```

---

## Task 5: Home Page (`src/app/page.tsx`)

**File:** Overwrite `src/app/page.tsx`

This is a Server Component. Sections:
1. Hero (navy bg, industrial photo overlay)
2. What We Supply (4-column product category grid)
3. How It Works (3-step process)
4. Sell Your Surplus CTA band (navy bg)
5. Trust Bar (4 stats)

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sarren Chemicals — Industrial Chemical Distribution',
  description: 'Reliable surplus chemical buying and selling since 1997. Submit an RFQ or sell us your surplus inventory.',
}

const categories = [
  {
    slug: 'resins',
    label: 'Category',
    title: 'Resins & Polymers',
    desc: 'Alkyd, acrylic, epoxy, and polyurethane resins for coatings and adhesives.',
  },
  {
    slug: 'solvents',
    label: 'Category',
    title: 'Solvents',
    desc: 'Ketones, esters, glycol ethers, and aromatic solvents in bulk and drum quantities.',
  },
  {
    slug: 'pigments',
    label: 'Category',
    title: 'Pigments & Extenders',
    desc: 'TiO₂, calcium carbonate, talc, and specialty pigments for paint and coatings.',
  },
  {
    slug: 'additives',
    label: 'Category',
    title: 'Additives',
    desc: 'Defoamers, rheology modifiers, dispersants, and coalescents for formulations.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Browse & Inquire',
    desc: 'Find what you need in our product categories and submit a Request for Quote. No account required.',
  },
  {
    num: '02',
    title: 'We Respond Promptly',
    desc: 'Our team reviews your inquiry and follows up with availability, pricing, and packaging options.',
  },
  {
    num: '03',
    title: 'Receive Your Order',
    desc: 'We arrange freight and deliver to your facility. Packaging options include drums, totes, and bulk.',
  },
]

const stats = [
  { value: '25+', label: 'Years in Business' },
  { value: '100%', label: 'Supplier Confidentiality' },
  { value: 'Bulk', label: 'Drums · Totes · Tankers' },
  { value: 'USA', label: 'Nationwide Distribution' },
]

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative bg-navy text-white py-[120px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
          style={{ backgroundImage: "url('/images/hero-industrial.jpg')" }}
        />
        <div className="container-content relative z-10">
          <div className="max-w-[680px]">
            <p className="label text-white/50 mb-4">Chemical Distribution Since 1997</p>
            <h1 className="text-white mb-6">
              Reliable Supply.<br />
              Competitive Pricing.<br />
              Complete Confidentiality.
            </h1>
            <p className="text-white/85 text-[19px] mb-10 max-w-[60ch]">
              We buy and sell surplus, aged, and off-spec industrial chemicals. Inquiry-only pricing. No supplier names disclosed.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/products" className="btn btn-white">Browse Products</Link>
              <Link href="/contact#rfq" className="btn border-2 border-white/50 text-white hover:bg-white hover:text-navy hover:no-underline">
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE SUPPLY */}
      <section className="section-pad">
        <div className="container-content">
          <div className="section-header">
            <p className="label">Product Categories</p>
            <h2>What We Supply</h2>
            <p>We carry a broad range of industrial chemicals across key categories. All pricing is inquiry-only.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(({ slug, label, title, desc }) => (
              <div key={slug} className="card flex flex-col">
                <p className="label mb-3">{label}</p>
                <h3 className="mb-2">{title}</h3>
                <p className="text-[15px] text-steel flex-1">{desc}</p>
                <Link href={`/products#${slug}`} className="btn btn-outline mt-6 h-10 text-[14px] self-start">
                  View Products
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/products" className="btn btn-primary">View Full Product List</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-pad section-alt">
        <div className="container-content">
          <div className="section-header">
            <p className="label">Process</p>
            <h2>How It Works</h2>
          </div>
          <div className="flex border border-border rounded bg-white">
            {steps.map(({ num, title, desc }, i) => (
              <div
                key={num}
                className={`flex-1 p-7 relative ${i < steps.length - 1 ? 'border-r border-border' : ''}`}
              >
                <p className="text-[13px] font-bold text-steel tracking-[0.1em] mb-4">{num}</p>
                <h3 className="text-[20px] mb-2">{title}</h3>
                <p className="text-[15px] text-steel max-w-none">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELL YOUR SURPLUS */}
      <section className="bg-navy section-pad">
        <div className="container-content">
          <div className="flex items-center justify-between gap-12 flex-wrap">
            <div className="max-w-[560px]">
              <p className="label text-white/50 mb-3">For Sellers</p>
              <h2 className="text-white mb-4">Have Surplus Inventory?</h2>
              <p className="text-white/80">
                We purchase surplus, aged, and off-spec chemicals confidentially. Quick turnaround, fair pricing, and complete discretion.
              </p>
            </div>
            <Link href="/sell-surplus" className="btn btn-white flex-shrink-0">
              Tell Us What You Have
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-offwhite border-t border-border border-b py-12">
        <div className="container-content">
          <div className="flex justify-center gap-20 flex-wrap">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-[42px] font-bold text-navy leading-none mb-2">{value}</div>
                <div className="text-[13px] font-medium uppercase tracking-[0.08em] text-steel">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
```

**Commit:**
```bash
git add src/app/page.tsx
git commit -m "feat: add home page"
```

---

## Task 6: Products Page (`src/app/products/page.tsx`)

**Files:**
- Create: `src/app/products/page.tsx`
- Create: `src/components/RfqForm.tsx`

**Step 1: Create `src/components/RfqForm.tsx`** (Client Component for form state)

```tsx
'use client'

import { useState, FormEvent } from 'react'

export default function RfqForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rfq', ...data }),
      })
      if (res.ok) {
        setStatus('sent')
        ;(e.target as HTMLFormElement).reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="rfq-name" className="form-label">Full Name</label>
          <input type="text" id="rfq-name" name="name" required placeholder="Jane Smith" className="form-input" />
        </div>
        <div>
          <label htmlFor="rfq-company" className="form-label">Company</label>
          <input type="text" id="rfq-company" name="company" required placeholder="Acme Coatings Co." className="form-input" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="rfq-email" className="form-label">Email</label>
          <input type="email" id="rfq-email" name="email" required placeholder="jane@company.com" className="form-input" />
        </div>
        <div>
          <label htmlFor="rfq-phone" className="form-label">Phone</label>
          <input type="tel" id="rfq-phone" name="phone" placeholder="(555) 000-0000" className="form-input" />
        </div>
      </div>
      <div>
        <label htmlFor="rfq-product" className="form-label">Product(s) of Interest</label>
        <input type="text" id="rfq-product" name="product" required placeholder="e.g. Alkyd Resin, TiO₂" className="form-input" />
      </div>
      <div>
        <label htmlFor="rfq-qty" className="form-label">Estimated Quantity &amp; Packaging</label>
        <input type="text" id="rfq-qty" name="quantity" placeholder="e.g. 5 drums, 1 tote, bulk" className="form-input" />
      </div>
      <div>
        <label htmlFor="rfq-notes" className="form-label">Additional Notes</label>
        <textarea id="rfq-notes" name="notes" placeholder="Spec requirements, timeline, application details..." className="form-textarea" />
      </div>
      <button
        type="submit"
        disabled={status === 'sending' || status === 'sent'}
        className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Sent! We\'ll be in touch.' : 'Submit Request for Quote'}
      </button>
      {status === 'error' && (
        <p className="text-red-600 text-sm">Something went wrong. Please email us directly at info@sarrenchemicals.com</p>
      )}
      <p className="text-[13px] text-steel">No supplier names are shared. All inquiries are handled confidentially.</p>
    </form>
  )
}
```

**Step 2: Create `src/app/products/page.tsx`**

```tsx
import Link from 'next/link'
import RfqForm from '@/components/RfqForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse Sarren Chemicals industrial chemical inventory. Submit an RFQ for pricing.',
}

type Product = { label: string; name: string; desc: string }
type Category = { id: string; title: string; products: Product[] }

const categories: Category[] = [
  {
    id: 'resins',
    title: 'Resins & Polymers',
    products: [
      { label: 'Resin', name: 'Alkyd Resin', desc: 'Short, medium, and long oil alkyds for architectural and industrial coatings. Available in drums and totes.' },
      { label: 'Resin', name: 'Acrylic Emulsion', desc: 'Waterborne acrylic dispersions for interior and exterior paint formulations.' },
      { label: 'Resin', name: 'Epoxy Resin', desc: 'Liquid epoxy resins for flooring, industrial coatings, and adhesive applications.' },
      { label: 'Resin', name: 'Polyurethane Resin', desc: 'Moisture-cure and two-component polyurethane resins for protective coatings.' },
      { label: 'Resin', name: 'Vinyl Acetate Polymer', desc: 'PVA dispersions and copolymers for adhesives, construction, and drymix applications.' },
    ],
  },
  {
    id: 'solvents',
    title: 'Solvents',
    products: [
      { label: 'Solvent', name: 'Methyl Ethyl Ketone (MEK)', desc: 'High-purity MEK for coatings, adhesives, and cleaning applications. Drum and bulk available.' },
      { label: 'Solvent', name: 'Butyl Acetate', desc: 'Industrial grade n-butyl acetate for lacquers, varnishes, and coatings formulations.' },
      { label: 'Solvent', name: 'Propylene Glycol Methyl Ether (PM)', desc: 'Glycol ether solvent for waterborne and solventborne coating systems.' },
      { label: 'Solvent', name: 'Mineral Spirits', desc: 'Aliphatic hydrocarbon solvent for alkyd-based paints and industrial cleaning.' },
    ],
  },
  {
    id: 'pigments',
    title: 'Pigments & Extenders',
    products: [
      { label: 'Pigment', name: 'Titanium Dioxide (TiO₂)', desc: 'Rutile and anatase grades for architectural paint, industrial coatings, and plastics.' },
      { label: 'Extender', name: 'Calcium Carbonate', desc: 'Coated and uncoated calcium carbonate for drymix, paint, and sealant applications.' },
      { label: 'Extender', name: 'Talc', desc: 'Platy talc grades for barrier properties and sag resistance in coatings and sealants.' },
      { label: 'Pigment', name: 'Iron Oxide Pigments', desc: 'Red, yellow, and black synthetic iron oxides for concrete, coatings, and construction.' },
    ],
  },
  {
    id: 'additives',
    title: 'Additives',
    products: [
      { label: 'Additive', name: 'Defoamers', desc: 'Mineral oil and silicone-based defoamers for waterborne and solventborne systems.' },
      { label: 'Additive', name: 'Rheology Modifiers', desc: 'HEUR, HMHEC, and clay-based thickeners for paints, adhesives, and sealants.' },
      { label: 'Additive', name: 'Dispersants & Wetting Agents', desc: 'Polymeric dispersants for pigment grinding and stabilization in waterborne systems.' },
      { label: 'Additive', name: 'Coalescents', desc: 'Texanol and alternative coalescents to aid film formation in latex paints.' },
    ],
  },
]

export default function ProductsPage() {
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
      <div className="border-b border-border bg-white sticky top-[72px] z-50">
        <div className="container-content flex gap-0 overflow-x-auto">
          {categories.map(({ id, title }) => (
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

      {/* PRODUCT CATEGORIES */}
      <section className="section-pad">
        <div className="container-content space-y-[72px]">
          {categories.map(({ id, title, products }) => (
            <div key={id} id={id}>
              <h2 className="mb-8 pb-4 border-b border-border">{title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(({ label, name, desc }) => (
                  <div key={name} className="card flex flex-col">
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
          ))}
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

**Commit:**
```bash
git add src/app/products/page.tsx src/components/RfqForm.tsx
git commit -m "feat: add products page with category grid and RFQ form"
```

---

## Task 7: Sell Your Surplus Page (`src/app/sell-surplus/page.tsx`)

**Files:**
- Create: `src/app/sell-surplus/page.tsx`
- Create: `src/components/SurplusForm.tsx`

**Step 1: Create `src/components/SurplusForm.tsx`**

```tsx
'use client'

import { useState, FormEvent } from 'react'

export default function SurplusForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'surplus', ...data }),
      })
      if (res.ok) {
        setStatus('sent')
        ;(e.target as HTMLFormElement).reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="s-name" className="form-label">Full Name</label>
          <input type="text" id="s-name" name="name" required placeholder="John Smith" className="form-input" />
        </div>
        <div>
          <label htmlFor="s-company" className="form-label">Company</label>
          <input type="text" id="s-company" name="company" required placeholder="Your Company" className="form-input" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="s-email" className="form-label">Email</label>
          <input type="email" id="s-email" name="email" required placeholder="john@company.com" className="form-input" />
        </div>
        <div>
          <label htmlFor="s-phone" className="form-label">Phone</label>
          <input type="tel" id="s-phone" name="phone" placeholder="(555) 000-0000" className="form-input" />
        </div>
      </div>
      <div>
        <label htmlFor="s-material" className="form-label">Material Description</label>
        <input type="text" id="s-material" name="material" required placeholder="e.g. Alkyd Resin, Off-spec TiO₂" className="form-input" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="s-qty" className="form-label">Quantity &amp; Packaging</label>
          <input type="text" id="s-qty" name="quantity" placeholder="e.g. 20 drums, 2 totes" className="form-input" />
        </div>
        <div>
          <label htmlFor="s-location" className="form-label">Material Location</label>
          <input type="text" id="s-location" name="location" placeholder="City, State" className="form-input" />
        </div>
      </div>
      <div>
        <label htmlFor="s-condition" className="form-label">Material Condition</label>
        <select id="s-condition" name="condition" className="form-select">
          <option value="">Select condition...</option>
          <option>Surplus / Excess Stock</option>
          <option>Aged / Near Expiry</option>
          <option>Off-Spec</option>
          <option>Unknown / Mixed</option>
        </select>
      </div>
      <div>
        <label htmlFor="s-notes" className="form-label">Additional Details</label>
        <textarea id="s-notes" name="notes" placeholder="Lot numbers, test data, reason for sale, urgency..." className="form-textarea" />
      </div>
      <button
        type="submit"
        disabled={status === 'sending' || status === 'sent'}
        className="btn btn-primary w-full justify-content-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Received! We\'ll be in touch.' : 'Submit Surplus Inquiry'}
      </button>
      {status === 'error' && (
        <p className="text-red-600 text-sm">Something went wrong. Please email us at info@sarrenchemicals.com</p>
      )}
      <p className="text-[13px] text-steel">All submissions are handled in strict confidence. No information is shared without your consent.</p>
    </form>
  )
}
```

**Step 2: Create `src/app/sell-surplus/page.tsx`**

```tsx
import SurplusForm from '@/components/SurplusForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sell Your Surplus',
  description: 'Sell your surplus chemicals to Sarren Chemicals. Fast, confidential, fair pricing.',
}

const reasons = [
  {
    title: 'Complete Confidentiality',
    desc: 'Your company name and supplier information are never disclosed. We operate with full discretion.',
  },
  {
    title: 'Fast Turnaround',
    desc: 'We respond to surplus inquiries promptly. Most transactions are completed within days, not weeks.',
  },
  {
    title: 'Fair Market Pricing',
    desc: 'We offer competitive pricing for aged, off-spec, and surplus inventory. No lowball offers.',
  },
]

export default function SellSurplusPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">For Sellers</p>
          <h1 className="text-[40px] mb-4">Sell Us Your Surplus</h1>
          <p className="text-steel text-[18px]">We purchase surplus, aged, and off-spec chemicals quickly and confidentially. Tell us what you have.</p>
        </div>
      </div>

      {/* WHY SELL */}
      <section className="section-pad section-alt">
        <div className="container-content">
          <div className="section-header text-center max-w-[600px] mx-auto">
            <p className="label">Why Sarren</p>
            <h2>Quick. Confidential. Fair.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reasons.map(({ title, desc }) => (
              <div key={title} className="card text-center">
                <h3 className="mb-2">{title}</h3>
                <p className="text-[15px] mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="section-pad">
        <div className="container-content max-w-[720px] mx-auto">
          <div className="section-header">
            <p className="label">Surplus Intake</p>
            <h2>Tell Us What You Have</h2>
            <p>Fill out the form below. We&apos;ll review and follow up within one business day.</p>
          </div>
          <SurplusForm />
        </div>
      </section>
    </>
  )
}
```

**Commit:**
```bash
git add src/app/sell-surplus/page.tsx src/components/SurplusForm.tsx
git commit -m "feat: add sell your surplus page with intake form"
```

---

## Task 8: Logistics Page (`src/app/logistics/page.tsx`)

**File:** Create `src/app/logistics/page.tsx`

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logistics & Packaging',
  description: 'Sarren Chemicals packaging and freight options — drums, totes, bulk tankers, and nationwide shipping.',
}

const packaging = [
  { icon: '🛢', title: 'Drums', desc: '55-gallon steel and poly drums. Closed-head and open-head available. UN-rated where required.' },
  { icon: '📦', title: 'Totes (IBCs)', desc: '275 and 330-gallon intermediate bulk containers. Ideal for larger volumes without bulk tanker logistics.' },
  { icon: '🚛', title: 'Bulk Tanker', desc: 'Full and partial tanker loads for high-volume liquid materials. Inquire for scheduling and minimums.' },
  { icon: '🎒', title: 'Bags & Super Sacks', desc: '50 lb bags and 1-ton supersacks for dry materials including pigments, fillers, and drymix components.' },
]

const freightPoints = [
  'LTL and full truckload arrangements',
  'Hazmat-compliant shipping documentation',
  'SDS provided with every shipment',
  'COA available on request',
]

export default function LogisticsPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">Shipping &amp; Packaging</p>
          <h1 className="text-[40px] mb-4">Logistics &amp; Packaging</h1>
          <p className="text-steel text-[18px]">We ship nationwide in a variety of packaging configurations to meet your volume and handling requirements.</p>
        </div>
      </div>

      {/* PACKAGING OPTIONS */}
      <section className="section-pad">
        <div className="container-content">
          <div className="section-header">
            <p className="label">Packaging</p>
            <h2>Available Packaging Formats</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packaging.map(({ icon, title, desc }) => (
              <div key={title} className="card text-center">
                <div className="text-[40px] mb-4">{icon}</div>
                <h3 className="mb-2">{title}</h3>
                <p className="text-[15px] mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREIGHT */}
      <section className="section-pad section-alt">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="label mb-4">Shipping</p>
              <h2 className="mb-4">Nationwide Freight</h2>
              <p className="mt-4">We arrange freight to your facility across the contiguous United States. LTL, FTL, and tanker shipments coordinated through our carrier network.</p>
              <ul className="mt-6 flex flex-col gap-3 list-none">
                {freightPoints.map((point) => (
                  <li key={point} className="flex gap-3 items-start">
                    <span className="text-navy font-bold mt-[2px]">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card">
              <p className="label mb-4">Documentation</p>
              <h3 className="mb-4">What We Provide</h3>
              <p className="text-[15px]">Every shipment comes with complete documentation including Safety Data Sheet (SDS), bill of lading, and Certificate of Analysis upon request. Hazmat manifests provided where applicable.</p>
              <Link href="/contact" className="btn btn-outline mt-6 h-10 text-[14px] inline-flex hover:no-underline">
                Contact for Logistics Questions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
```

**Commit:**
```bash
git add src/app/logistics/page.tsx
git commit -m "feat: add logistics and packaging page"
```

---

## Task 9: About Page (`src/app/about/page.tsx`)

**File:** Create `src/app/about/page.tsx`

```tsx
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Sarren Chemicals — surplus chemical trading since 1997.',
}

const highlights = [
  { title: 'Established 1997', desc: 'Over two decades of experience navigating the surplus chemical market, building relationships, and delivering value on both sides of every transaction.' },
  { title: 'Confidentiality First', desc: 'No supplier names. No disclosed sources. We handle every transaction with discretion — it\'s not a policy, it\'s the foundation of how we operate.' },
  { title: 'Nationwide Reach', desc: 'We source and deliver across the contiguous United States, coordinating freight for drums, totes, and bulk tanker shipments.' },
]

const industries = [
  { title: 'Paint Manufacturers', desc: 'Architectural and industrial paint producers sourcing resins, solvents, pigments, and additives.' },
  { title: 'Adhesive Blenders', desc: 'Formulators of pressure-sensitive, structural, and reactive adhesive systems.' },
  { title: 'Drymix Producers', desc: 'Construction product manufacturers using fillers, polymers, and additives in drymix formulations.' },
  { title: 'Resin Users', desc: 'Industrial formulators requiring alkyd, acrylic, epoxy, or polyurethane resins in bulk.' },
  { title: 'Surplus Holders', desc: 'Manufacturers and distributors with excess, aged, or off-spec inventory looking to recover value.' },
]

export default function AboutPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">Our Story</p>
          <h1 className="text-[40px] mb-4">About Sarren Chemicals</h1>
          <p className="text-steel text-[18px]">Buying and selling surplus, aged, and off-spec chemicals since 1997.</p>
        </div>
      </div>

      {/* STORY */}
      <section className="section-pad">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            <div>
              <p className="label mb-4">Who We Are</p>
              <h2>A Trusted Partner in the Chemical Supply Chain</h2>
              <p className="mt-6">Sarren Chemicals has operated as a specialized chemical trading company for over 25 years. We connect buyers who need quality surplus material with sellers looking to recover value from off-spec or excess inventory.</p>
              <p className="mt-4">Our expertise spans resins, solvents, pigments, and additives — the building blocks used by paint manufacturers, adhesive blenders, drymix producers, and resin formulators across the United States.</p>
              <p className="mt-4">We operate with complete supplier confidentiality. The names of our sources are never disclosed — to anyone.</p>
            </div>
            <div className="flex flex-col gap-6">
              {highlights.map(({ title, desc }) => (
                <div key={title} className="card">
                  <h3 className="mb-2">{title}</h3>
                  <p className="text-[15px]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="section-pad section-alt">
        <div className="container-content">
          <div className="section-header text-center max-w-[560px] mx-auto">
            <p className="label">Industries Served</p>
            <h2>Who We Work With</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map(({ title, desc }) => (
              <div key={title} className="card">
                <h3 className="mb-2">{title}</h3>
                <p className="text-[15px] mt-2">{desc}</p>
              </div>
            ))}
            <div className="card">
              <Link href="/contact" className="hover:no-underline">
                <h3 className="mb-2">Not Sure?</h3>
                <p className="text-[15px] mt-2">Get in touch. If we can help, we will. If we can&apos;t, we&apos;ll say so.</p>
                <p className="mt-4 font-semibold text-navy text-[15px]">Contact us →</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy section-pad">
        <div className="container-content text-center max-w-[560px] mx-auto">
          <p className="label text-white/50 mb-4">Ready to Work Together?</p>
          <h2 className="text-white mb-4">Let&apos;s Talk</h2>
          <p className="text-white/80 mb-10">Whether you&apos;re buying or selling, we&apos;re straightforward to work with. Reach out and we&apos;ll respond promptly.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/products#rfq" className="btn btn-white hover:no-underline">Request a Quote</Link>
            <Link href="/sell-surplus" className="btn border-2 border-white/40 text-white hover:bg-white hover:text-navy hover:no-underline">Sell Your Surplus</Link>
          </div>
        </div>
      </section>
    </>
  )
}
```

**Commit:**
```bash
git add src/app/about/page.tsx
git commit -m "feat: add about page"
```

---

## Task 10: Contact Page (`src/app/contact/page.tsx`)

**Files:**
- Create: `src/app/contact/page.tsx`
- Create: `src/components/ContactForm.tsx`

**Step 1: Create `src/components/ContactForm.tsx`**

```tsx
'use client'

import { useState, FormEvent } from 'react'

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact', ...data }),
      })
      if (res.ok) {
        setStatus('sent')
        ;(e.target as HTMLFormElement).reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="c-name" className="form-label">Full Name</label>
          <input type="text" id="c-name" name="name" required placeholder="Jane Smith" className="form-input" />
        </div>
        <div>
          <label htmlFor="c-company" className="form-label">Company</label>
          <input type="text" id="c-company" name="company" placeholder="Acme Co." className="form-input" />
        </div>
      </div>
      <div>
        <label htmlFor="c-email" className="form-label">Email</label>
        <input type="email" id="c-email" name="email" required placeholder="jane@company.com" className="form-input" />
      </div>
      <div>
        <label htmlFor="c-subject" className="form-label">Subject</label>
        <select id="c-subject" name="subject" className="form-select">
          <option value="">Select a topic...</option>
          <option>Product Inquiry / RFQ</option>
          <option>Sell My Surplus</option>
          <option>Logistics Question</option>
          <option>General Inquiry</option>
        </select>
      </div>
      <div>
        <label htmlFor="c-message" className="form-label">Message</label>
        <textarea id="c-message" name="message" required placeholder="How can we help?" className="form-textarea" />
      </div>
      <button
        type="submit"
        disabled={status === 'sending' || status === 'sent'}
        className="btn btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : status === 'sent' ? 'Message sent!' : 'Send Message'}
      </button>
      {status === 'error' && (
        <p className="text-red-600 text-sm">Something went wrong. Please email us directly at info@sarrenchemicals.com</p>
      )}
    </form>
  )
}
```

**Step 2: Create `src/app/contact/page.tsx`**

```tsx
import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Sarren Chemicals — get in touch for inquiries, quotes, and surplus.',
}

const pdfs = [
  { href: '/pdfs/sarren-line-card.pdf', label: 'Download Line Card (PDF)' },
  { href: '/pdfs/sarren-capability-statement.pdf', label: 'Capability Statement (PDF)' },
  { href: '/pdfs/sarren-sample-coa.pdf', label: 'Sample COA (PDF)' },
]

export default function ContactPage() {
  return (
    <>
      {/* PAGE HERO */}
      <div className="bg-offwhite border-b border-border py-16">
        <div className="container-content">
          <p className="label mb-3">Get In Touch</p>
          <h1 className="text-[40px] mb-4">Contact Us</h1>
          <p className="text-steel text-[18px]">Reach out for product inquiries, surplus purchases, logistics questions, or anything else.</p>
        </div>
      </div>

      <section className="section-pad">
        <div className="container-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">
            {/* FORM */}
            <div>
              <h2 className="mb-8" id="rfq">Send a Message</h2>
              <ContactForm />
            </div>

            {/* CONTACT INFO */}
            <div>
              <h2 className="mb-8">Contact Information</h2>
              <div className="flex flex-col gap-6">
                <div className="card">
                  <p className="label mb-2">Email</p>
                  <a href="mailto:info@sarrenchemicals.com" className="text-[17px] font-medium hover:no-underline">info@sarrenchemicals.com</a>
                </div>
                <div className="card">
                  <p className="label mb-2">Phone</p>
                  <a href="tel:+1-XXX-XXX-XXXX" className="text-[17px] font-medium hover:no-underline">(XXX) XXX-XXXX</a>
                </div>
                <div className="card">
                  <p className="label mb-3">Resources</p>
                  <ul className="list-none flex flex-col gap-3">
                    {pdfs.map(({ href, label }) => (
                      <li key={href}>
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[15px] hover:no-underline">↓ {label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <p className="label mb-2">Looking to Sell?</p>
                  <p className="text-[15px] mb-4">Have surplus or off-spec inventory? Use our dedicated form for faster processing.</p>
                  <Link href="/sell-surplus" className="btn btn-outline h-10 text-[14px] inline-flex hover:no-underline">Sell Your Surplus →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
```

**Commit:**
```bash
git add src/app/contact/page.tsx src/components/ContactForm.tsx
git commit -m "feat: add contact page with form and info sidebar"
```

---

## Task 11: API Route — Form Email Handler (`src/app/api/contact/route.ts`)

**File:** Create `src/app/api/contact/route.ts`

This sends form submissions to info@sarrenchemicals.com via nodemailer. Uses environment variables for SMTP config.

**Step 1: Create `.env.local` template**

```bash
cat > sarren-next/.env.local.example << 'EOF'
# SMTP configuration for form email delivery
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
CONTACT_EMAIL=info@sarrenchemicals.com
EOF
```

**Step 2: Create `src/app/api/contact/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type FormType = 'rfq' | 'surplus' | 'contact'

function buildSubject(type: FormType, data: Record<string, string>): string {
  switch (type) {
    case 'rfq': return `RFQ — ${data.product ?? 'Unknown product'} from ${data.company ?? data.name}`
    case 'surplus': return `Surplus Inquiry — ${data.material ?? 'Unknown material'} from ${data.company ?? data.name}`
    case 'contact': return `Contact Form — ${data.subject ?? 'General'} from ${data.name}`
  }
}

function buildBody(type: FormType, data: Record<string, string>): string {
  const lines = Object.entries(data)
    .filter(([key]) => key !== 'type')
    .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
  return `Form: ${type.toUpperCase()}\n\n${lines.join('\n')}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string> & { type: FormType }
    const { type, ...data } = body

    if (!type || !data.email || !data.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Sarren Chemicals Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL ?? 'info@sarrenchemicals.com',
      replyTo: data.email,
      subject: buildSubject(type, data),
      text: buildBody(type, data),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact form error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
```

**Step 3: Add `.env.local` to `.gitignore`**

Verify `.gitignore` has `.env.local` (Next.js adds this by default).

**Step 4: Commit**

```bash
git add src/app/api/contact/route.ts .env.local.example
git commit -m "feat: add contact API route with nodemailer email handler"
```

---

## Task 12: Final Verification

**Step 1: Run dev server and verify all pages load**

```bash
cd /Users/jonlarkin/SarrenChemicals/sarren-next
npm run dev
```

Check each route:
- http://localhost:3000 — Home
- http://localhost:3000/products — Products + RFQ form
- http://localhost:3000/sell-surplus — Surplus form
- http://localhost:3000/logistics — Logistics
- http://localhost:3000/about — About
- http://localhost:3000/contact — Contact

**Step 2: Run build**

```bash
npm run build
```

Expected: Build completes with 0 errors. All 6 pages are static/SSR.

**Step 3: Check for TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

**Step 4: Check ESLint**

```bash
npm run lint
```

Expected: No errors (warnings acceptable).

**Step 5: Final commit**

```bash
git add .
git commit -m "chore: verify build passes — site complete"
```

---

## Checklist Before Done

- [ ] All 6 pages load without console errors
- [ ] Nav active state highlights correct page on each route
- [ ] Mobile nav opens/closes correctly
- [ ] All 3 forms render correctly
- [ ] API route at /api/contact exists
- [ ] PDF links in footer reference correct paths
- [ ] No supplier names anywhere in content
- [ ] No pricing shown anywhere
- [ ] TypeScript build: 0 errors
- [ ] ESLint: 0 errors
