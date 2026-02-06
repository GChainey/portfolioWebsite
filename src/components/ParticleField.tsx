'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  depth: number
  phase: number
  phaseSpeed: number
}

const CONFIG = {
  particleCount: 80,
  mobileParticleCount: 40,
  connectionDistance: 130,
  mouseRadius: 200,
  mouseForce: 0.025,
  friction: 0.988,
  baseSpeed: 0.3,
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  return m
    ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
    : [217, 119, 6]
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    particles: [] as Particle[],
    mouse: { x: -9999, y: -9999 },
    accent: [217, 119, 6] as [number, number, number],
    frame: 0,
    time: 0,
    w: 0,
    h: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return
    const state = stateRef.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Resize canvas to match parent
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      state.w = rect.width
      state.h = rect.height
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // Create particles
    const count =
      window.innerWidth < 768
        ? CONFIG.mobileParticleCount
        : CONFIG.particleCount
    state.particles = Array.from({ length: count }, () => ({
      x: Math.random() * state.w,
      y: Math.random() * state.h,
      vx: (Math.random() - 0.5) * CONFIG.baseSpeed,
      vy: (Math.random() - 0.5) * CONFIG.baseSpeed,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.2,
      depth: Math.random(),
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: Math.random() * 0.015 + 0.005,
    }))

    // Read accent color from CSS variable
    const readAccent = () => {
      const val = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim()
      if (val) state.accent = hexToRgb(val)
    }
    readAccent()

    // Watch for theme/accent changes
    const observer = new MutationObserver(readAccent)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Track mouse relative to canvas
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      state.mouse = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
    const onMouseLeave = () => {
      state.mouse = { x: -9999, y: -9999 }
    }
    window.addEventListener('mousemove', onMouseMove)
    canvas.parentElement?.addEventListener('mouseleave', onMouseLeave)

    // Organic flow noise (simple sine-based, not true Perlin but looks organic)
    const flowX = (x: number, y: number, t: number) =>
      Math.sin(x * 0.003 + t * 0.3) *
      Math.cos(y * 0.005 + t * 0.2) *
      0.12
    const flowY = (x: number, y: number, t: number) =>
      Math.cos(x * 0.005 + t * 0.2) *
      Math.sin(y * 0.003 + t * 0.3) *
      0.12

    // Main render loop
    const animate = () => {
      state.time += 0.008
      const { w, h, accent, mouse, particles, time } = state
      const [r, g, b] = accent
      ctx.clearRect(0, 0, w, h)

      // Update particles
      for (const p of particles) {
        // Organic drift based on position and time
        const speedMult = 0.3 + p.depth * 0.7
        p.vx += flowX(p.x, p.y, time) * speedMult
        p.vy += flowY(p.x, p.y, time) * speedMult

        // Mouse attraction
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < CONFIG.mouseRadius && dist > 1) {
          const force =
            (1 - dist / CONFIG.mouseRadius) *
            CONFIG.mouseForce *
            (0.5 + p.depth * 0.5)
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Friction
        p.vx *= CONFIG.friction
        p.vy *= CONFIG.friction

        // Move
        p.x += p.vx
        p.y += p.vy

        // Wrap edges (softer than bouncing)
        if (p.x < -20) p.x = w + 20
        if (p.x > w + 20) p.x = -20
        if (p.y < -20) p.y = h + 20
        if (p.y > h + 20) p.y = -20

        // Pulse phase
        p.phase += p.phaseSpeed
      }

      // Draw connections between nearby particles
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const bb = particles[j]
          const ddx = a.x - bb.x
          const ddy = a.y - bb.y
          const d = Math.sqrt(ddx * ddx + ddy * ddy)
          if (d < CONFIG.connectionDistance) {
            const alpha = (1 - d / CONFIG.connectionDistance) * 0.15
            // Fade at edges of canvas
            const edgeFade = Math.min(
              Math.min(a.y, bb.y) / 60,
              Math.min(h - a.y, h - bb.y) / 60,
              1
            )
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(bb.x, bb.y)
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * Math.max(0, edgeFade)})`
            ctx.stroke()
          }
        }
      }

      // Subtle radial glow around mouse cursor
      if (mouse.x > -1000 && mouse.y > -1000) {
        const grad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          CONFIG.mouseRadius
        )
        grad.addColorStop(0, `rgba(${r},${g},${b},0.04)`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, CONFIG.mouseRadius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // Draw particles
      for (const p of particles) {
        const pulsedOpacity = p.opacity + Math.sin(p.phase) * 0.12
        const edgeFade = Math.min(p.y / 60, (h - p.y) / 60, 1)

        // Spotlight: particles near mouse glow brighter
        const mouseDist = Math.sqrt(
          (p.x - mouse.x) ** 2 + (p.y - mouse.y) ** 2
        )
        const mouseGlow =
          mouseDist < CONFIG.mouseRadius
            ? (1 - mouseDist / CONFIG.mouseRadius) * 0.4
            : 0

        const finalOpacity = Math.max(
          0,
          (pulsedOpacity + mouseGlow) * Math.max(0, edgeFade)
        )
        const size = p.radius * (0.8 + p.depth * 0.4)

        // Soft glow halo
        ctx.beginPath()
        ctx.arc(p.x, p.y, size * 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${finalOpacity * 0.08})`
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${finalOpacity})`
        ctx.fill()
      }

      state.frame = requestAnimationFrame(animate)
    }

    // Respect reduced motion preference
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      state.frame = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(state.frame)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', resize)
      canvas.parentElement?.removeEventListener('mouseleave', onMouseLeave)
      observer.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}
