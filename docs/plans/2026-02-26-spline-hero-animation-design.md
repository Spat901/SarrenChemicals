# Spline Hero Animation — Design Doc
Date: 2026-02-26

## Goal
Embed the Spline "retrofuturism bg animation" scene as the full-bleed background of the Home hero section, tinted to match the Sarren Chemicals navy color palette.

## Spline Scene
- Preview URL: https://my.spline.design/retrofuturismbganimation-lBrpFkf2OKh8zVRPWJx2CrdC/
- Scene file: https://prod.spline.design/lBrpFkf2OKh8zVRPWJx2CrdC/scene.splinecode

## Approach
Option A — `@splinetool/react-spline` React package, dynamically imported (no SSR).

## Layer Stack (hero section)
```
<section> relative bg-navy overflow-hidden
  ├── Layer 1: SplineScene (absolute inset-0, w-full h-full, pointer-events-none)
  ├── Layer 2: Navy overlay div (absolute inset-0, bg-navy/65)
  └── Layer 3: Hero text content (relative z-10) — unchanged
```

## Color Matching
- Brand navy: `#1B3A6B`
- Overlay: `bg-navy/65` (65% opacity) — tints animation to navy palette, ~35% animation bleeds through for visual interest
- Adjust opacity class if too subtle (lower %) or too strong (raise %)

## Files Changed
- `sarren-next/package.json` — add `@splinetool/react-spline`
- `sarren-next/src/components/SplineHero.tsx` — new client component wrapping dynamic Spline import
- `sarren-next/src/app/page.tsx` — replace hero background div with SplineHero + overlay

## Performance
- `next/dynamic` with `ssr: false` — no server-side rendering penalty
- `pointer-events-none` on Spline canvas — CTAs remain fully clickable
- Remove existing `hero-industrial.jpg` overlay div
