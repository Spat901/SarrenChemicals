# Molecular Canvas Hero Background — Design Doc
Date: 2026-02-27

## Goal
Replace the Spline iframe hero background with a custom HTML5 Canvas animation depicting a DNA double helix with molecular elements, rendered in brand colors at balanced (~35%) opacity.

## Visual Elements
- **DNA strands** — two sinusoidal curves offset 180° from each other, scrolling upward in a loop. Color: Steel Gray `#8A9BAE`
- **Atom nodes** — small filled circles at crest/trough of each strand. Color: Off-White `#F5F6F7` with soft glow
- **Base pair rungs** — horizontal lines connecting the two strands at each node. Color: Steel Gray, slightly more transparent
- **Floating hexagons** — 6–8 benzene-ring hexagons scattered across canvas, slowly rotating and drifting. Stroked outlines in `#8A9BAE` at ~20% opacity

## Animation
- Single `offset` counter increments each `requestAnimationFrame`
- Drives all movement: strands scroll upward, hexagons drift and rotate
- Canvas cleared and redrawn each frame (no retained state)
- Animation loop cancelled on component unmount (cleanup)

## Color Palette
- Navy background: `#1B3A6B` (from section `bg-navy`)
- Strands + rungs: `#8A9BAE` (Steel Gray) at 35% opacity
- Nodes: `#F5F6F7` (Off-White) at 40% opacity
- Hexagons: `#8A9BAE` at 20% opacity

## Visibility
Balanced — animation clearly visible but not distracting. Text remains the primary focus.

## Files
- **Delete:** `sarren-next/src/components/SplineHero.tsx`
- **Create:** `sarren-next/src/components/MolecularCanvas.tsx` — `'use client'` canvas component
- **Modify:** `sarren-next/src/app/page.tsx` — swap SplineHero + overlay + watermark cover for `<MolecularCanvas />`

## Hero Section After Change
```tsx
<section className="relative bg-navy text-white py-[120px] overflow-hidden">
  <MolecularCanvas />
  <div className="container-content relative z-10">
    {/* text content unchanged */}
  </div>
</section>
```

## What's Removed
- `SplineHero` component (iframe)
- `bg-navy/65` overlay div
- Watermark cover div
- `@splinetool/react-spline` and `@splinetool/runtime` dependencies (optional cleanup)
