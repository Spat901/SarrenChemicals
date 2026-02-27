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
    if (y === -wl) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()

  // Strand 2
  ctx.beginPath()
  ctx.strokeStyle = 'rgba(138, 155, 174, 0.35)'
  ctx.lineWidth = 1.5
  for (let y = -wl; y < h + wl; y += 2) {
    const x = cx + Math.sin(((y + offset) / wl) * Math.PI * 2 + Math.PI) * amp
    if (y === -wl) ctx.moveTo(x, y); else ctx.lineTo(x, y)
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
    let hexagons: Hexagon[] = []

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
      offset += 0.2
      animId = requestAnimationFrame(draw)
    }

    resize()

    hexagons = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas!.width,
      y: Math.random() * canvas!.height,
      radius: 20 + Math.random() * 30,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.005,
      driftX: (Math.random() - 0.5) * 0.3,
      driftY: (Math.random() - 0.5) * 0.3,
    }))

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
