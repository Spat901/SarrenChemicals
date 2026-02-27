# Molecular Canvas Hero Animation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Spline iframe hero background with a custom HTML5 Canvas animation of a DNA double helix with molecular elements, drawn in brand colors.

**Architecture:** A `'use client'` React component mounts a `<canvas>` element absolutely positioned behind the hero text. A single `requestAnimationFrame` loop redraws two sinusoidal DNA strands, atom nodes, base-pair rungs, and floating hexagons each frame using a shared `offset` counter. No external dependencies needed.

**Tech Stack:** Next.js 16 App Router, TypeScript, HTML5 Canvas API, CSS (no new npm packages)

---

### Task 1: Create MolecularCanvas component

**Files:**
- Create: `sarren-next/src/components/MolecularCanvas.tsx`

**Step 1: Create the file with the full canvas animation**

Write `/Users/jonlarkin/SarrenChemicals/sarren-next/src/components/MolecularCanvas.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'

interface Hexagon {
  x: number
  y: number
  radius: number
  rot: number
  rotSpeed: number
  driftX: number
  driftY: number
}

function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rotation: number) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = rotation + (Math.PI / 3) * i
    if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
    else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle))
  }
  ctx.closePath()
  ctx.strokeStyle = 'rgba(138, 155, 174, 0.2)'
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawHelix(ctx: CanvasRenderingContext2D, w: number, h: number, offset: number) {
  const cx = w * 0.72
  const amp = 80
  const wl = 120
  const nodeR = 4

  // Base pair rungs
  ctx.strokeStyle = 'rgba(138, 155, 174, 0.2)'
  ctx.lineWidth = 1
  for (let y = -wl; y < h + wl; y += 18) {
    const phase = ((y + offset) / wl) * Math.PI * 2
    const x1 = cx + Math.sin(phase) * amp
    const x2 = cx + Math.sin(phase + Math.PI) * amp
    if (Math.abs(x1 - x2) < amp * 0.9) {
      ctx.beginPath()
      ctx.moveTo(x1, y)
      ctx.lineTo(x2, y)
      ctx.stroke()
    }
  }

  // Strand 1
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(138, 155, 174, 0.35)'
  ctx.lineWidth = 1.5
  for (let y = -wl; y < h + wl; y += 2) {
    const x = cx + Math.sin(((y + offset) / wl) * Math.PI * 2) * amp
    y === -wl ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Strand 2
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(138, 155, 174, 0.35)'
  ctx.lineWidth = 1.5
  for (let y = -wl; y < h + wl; y += 2) {
    const x = cx + Math.sin(((y + offset) / wl) * Math.PI * 2 + Math.PI) * amp
    y === -wl ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Nodes on both strands
  ctx.fillStyle = 'rgba(245, 246, 247, 0.45)'
  for (let y = -wl; y < h + wl; y += wl / 4) {
    const phase = ((y + offset) / wl) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx + Math.sin(phase) * amp, y, nodeR, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + Math.sin(phase + Math.PI) * amp, y, nodeR, 0, Math.PI * 2)
    ctx.fill()
  }
}

export default function MolecularCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let offset = 0

    const hexagons: Hexagon[] = Array.from({ length: 8 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 20 + Math.random() * 30,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.005,
      driftX: (Math.random() - 0.5) * 0.3,
      driftY: (Math.random() - 0.5) * 0.3,
    }))

    function resize() {
      canvas!.width = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      hexagons.forEach(h => {
        h.rot += h.rotSpeed
        h.x += h.driftX
        h.y += h.driftY
        if (h.x < -h.radius) h.x = canvas!.width + h.radius
        if (h.x > canvas!.width + h.radius) h.x = -h.radius
        if (h.y < -h.radius) h.y = canvas!.height + h.radius
        if (h.y > canvas!.height + h.radius) h.y = -h.radius
        drawHex(ctx!, h.x, h.y, h.radius, h.rot)
      })

      drawHelix(ctx!, canvas!.width, canvas!.height, offset)
      offset += 0.5
      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true"
    />
  )
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd /Users/jonlarkin/SarrenChemicals/sarren-next && npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
cd /Users/jonlarkin/SarrenChemicals && git add sarren-next/src/components/MolecularCanvas.tsx && git commit -m "feat: add MolecularCanvas DNA helix animation component"
```

---

### Task 2: Update page.tsx hero section

**Files:**
- Modify: `sarren-next/src/app/page.tsx`

**Step 1: Read the current file** to confirm exact line numbers of the hero section (lines ~64–70).

**Step 2: Replace the import**

Change:
```tsx
import SplineHero from '@/components/SplineHero'
```
To:
```tsx
import MolecularCanvas from '@/components/MolecularCanvas'
```

**Step 3: Replace the hero background layers**

Change the hero section opening from:
```tsx
<section className="relative bg-navy text-white py-[120px] overflow-hidden">
  <SplineHero />
  <div className="absolute inset-0 bg-navy/65" />
  {/* Cover Spline watermark badge */}
  <div className="absolute bottom-0 right-0 w-48 h-12 bg-navy z-[2]" />
```

To:
```tsx
<section className="relative bg-navy text-white py-[120px] overflow-hidden">
  <MolecularCanvas />
```

**Step 4: Verify TypeScript compiles**

```bash
cd /Users/jonlarkin/SarrenChemicals/sarren-next && npx tsc --noEmit
```

Expected: no errors.

**Step 5: Verify visually**

Open http://localhost:3000. Check:
- DNA helix animation visible on the right side of the hero
- Floating hexagons drifting across the background
- Headline and CTAs fully readable
- No console errors

**Step 6: Commit**

```bash
cd /Users/jonlarkin/SarrenChemicals && git add sarren-next/src/app/page.tsx && git commit -m "feat: replace Spline iframe with MolecularCanvas hero animation"
```

---

### Task 3: Delete SplineHero and clean up Spline packages

**Files:**
- Delete: `sarren-next/src/components/SplineHero.tsx`
- Modify: `sarren-next/package.json`

**Step 1: Delete the SplineHero component**

```bash
rm /Users/jonlarkin/SarrenChemicals/sarren-next/src/components/SplineHero.tsx
```

**Step 2: Remove Spline npm packages**

```bash
cd /Users/jonlarkin/SarrenChemicals/sarren-next && npm uninstall @splinetool/react-spline @splinetool/runtime
```

Expected: packages removed, no errors.

**Step 3: Verify TypeScript still compiles (no orphan imports)**

```bash
cd /Users/jonlarkin/SarrenChemicals/sarren-next && npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
cd /Users/jonlarkin/SarrenChemicals && git add sarren-next/src/components/SplineHero.tsx sarren-next/package.json sarren-next/package-lock.json && git commit -m "chore: remove SplineHero component and Spline dependencies"
```
