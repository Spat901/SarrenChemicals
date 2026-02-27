# Spline Hero Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Embed the "retrofuturism bg animation" Spline scene as the full-bleed background of the Home hero section, tinted with a navy overlay to match the brand palette.

**Architecture:** Install `@splinetool/react-spline`, wrap it in a client component with `next/dynamic` (ssr: false), and position it as an absolute background layer inside the existing hero section. A semi-transparent navy overlay sits between the animation and the text content to maintain brand colors and text legibility.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, `@splinetool/react-spline`

---

### Task 1: Install the Spline React package

**Files:**
- Modify: `sarren-next/package.json`

**Step 1: Install the package**

```bash
cd sarren-next && npm install @splinetool/react-spline
```

Expected output: `added 1 package` (or similar), no errors.

**Step 2: Verify install**

```bash
cat sarren-next/node_modules/@splinetool/react-spline/package.json | grep '"version"'
```

Expected: a version number printed.

**Step 3: Commit**

```bash
git add sarren-next/package.json sarren-next/package-lock.json
git commit -m "feat: add @splinetool/react-spline dependency"
```

---

### Task 2: Create the SplineHero client component

**Files:**
- Create: `sarren-next/src/components/SplineHero.tsx`

**Step 1: Create the component**

```tsx
'use client'

import dynamic from 'next/dynamic'

const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false })

export default function SplineHero() {
  return (
    <Spline
      scene="https://prod.spline.design/lBrpFkf2OKh8zVRPWJx2CrdC/scene.splinecode"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd sarren-next && npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add sarren-next/src/components/SplineHero.tsx
git commit -m "feat: add SplineHero background component"
```

---

### Task 3: Update the hero section in page.tsx

**Files:**
- Modify: `sarren-next/src/app/page.tsx`

**Step 1: Replace the hero section**

Current hero (lines 64–89):
```tsx
{/* HERO */}
<section className="relative bg-navy text-white py-[120px] overflow-hidden">
  <div
    className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
    style={{ backgroundImage: "url('/images/hero-industrial.jpg')" }}
  />
  <div className="container-content relative z-10">
    ...
  </div>
</section>
```

Replace with:
```tsx
{/* HERO */}
<section className="relative bg-navy text-white py-[120px] overflow-hidden">
  <SplineHero />
  <div className="absolute inset-0 bg-navy/65" />
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
```

**Step 2: Add the SplineHero import at the top of page.tsx** (below existing imports)

```tsx
import SplineHero from '@/components/SplineHero'
```

**Step 3: Verify TypeScript compiles**

```bash
cd sarren-next && npx tsc --noEmit
```

Expected: no errors.

**Step 4: Check it renders in the browser**

Open http://localhost:3000. Verify:
- Hero background shows the animated Spline scene
- Navy overlay is visible (animation visible but tinted navy)
- Headline, subtext, and both CTA buttons are readable and clickable
- No console errors

If the animation is too dark (not enough visible): lower overlay to `bg-navy/55`
If the animation overpowers the text: raise overlay to `bg-navy/75`

**Step 5: Commit**

```bash
git add sarren-next/src/app/page.tsx
git commit -m "feat: add Spline retrofuturism animation to hero section"
```
