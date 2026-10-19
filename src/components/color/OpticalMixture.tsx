'use client'

import { useEffect, useRef, useState } from 'react'
import { averageLight, multiply } from '@/lib/color'
import { Segmented, Step } from './parts'

// Chapter XII. Two colours seen at once, too small to separate, merge into a third in the eye. The
// Impressionists painted with it, and printing still depends on it. A screen can draw dots down to
// the size of its own pixels, which are themselves an optical mixture.

const PAIRS = [
  { id: 'yellow-blue', label: 'Yellow and blue', a: '#f2d230', b: '#2c55c4' },
  { id: 'red-green', label: 'Red and green', a: '#d93a2b', b: '#2f9a4a' },
  { id: 'orange-violet', label: 'Orange and violet', a: '#f08a24', b: '#6a3fa3' },
]

// The same scatter every time, so the server and the browser agree
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function useCanvas(draw: (ctx: CanvasRenderingContext2D, size: number) => void, deps: unknown[]) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const size = canvas.clientWidth
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false
    draw(ctx, size)
  }, deps)
  return ref
}

export function OpticalMixture() {
  return (
    <div className="space-y-20">
      <Dots />
      <Halftone />
    </div>
  )
}

function Dots() {
  const [pairId, setPairId] = useState(PAIRS[0].id)
  const [size, setSize] = useState(12)
  const [share, setShare] = useState(0.5)
  const [squint, setSquint] = useState(false)
  const { a, b } = PAIRS.find((p) => p.id === pairId)!

  const ref = useCanvas(
    (ctx, w) => {
      const rand = seeded(7)
      const n = Math.ceil(w / size)
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          ctx.fillStyle = rand() < share ? a : b
          ctx.fillRect(x * size, y * size, size, size)
        }
      }
    },
    [a, b, size, share],
  )

  const eye = averageLight(...Array.from({ length: 20 }, (_, i) => (i < share * 20 ? a : b)))

  return (
    <Step n={1} title="Mixed in the eye" quote="Instead of using green paint mixed mechanically from yellow and blue, they applied yellow and blue unmixed in small dots, so that they became mixed only in our perception, as an impression.">
      <p className="mb-6 max-w-2xl text-muted">
        These are only two colours. Make the dots smaller and they stop being dots and become one colour. At the
        smallest size each dot is a single point on your screen. You can also change how much of each there is.
      </p>
      <div className="mb-6">
        <Segmented value={pairId} options={PAIRS.map(({ id, label }) => ({ id, label }))} onChange={setPairId} />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <canvas
          ref={ref}
          className="aspect-square w-full max-w-md rounded-sm ring-1 ring-border transition-[filter]"
          style={{ filter: squint ? 'blur(3px)' : 'none' }}
          role="img"
          aria-label={`Dots of two colours, ${size} pixels across`}
        />
        <div className="w-full max-w-xs space-y-6">
          <label className="block text-sm text-muted">
            <span className="mb-1 flex justify-between">
              <span className="text-foreground">Dot size</span>
              <span>{size}px</span>
            </span>
            <input type="range" min={1} max={32} step={1} value={size} onChange={(e) => setSize(Number(e.target.value))} aria-label="Dot size" className="w-full accent-accent" />
          </label>
          <label className="block text-sm text-muted">
            <span className="mb-1 flex justify-between">
              <span className="text-foreground">Share of the first colour</span>
              <span>{Math.round(share * 100)}%</span>
            </span>
            <input type="range" min={0.1} max={0.9} step={0.05} value={share} onChange={(e) => setShare(Number(e.target.value))} aria-label="Share of the first colour" className="w-full accent-accent" />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={squint} onChange={(e) => setSquint(e.target.checked)} className="accent-accent" />
            Squint
          </label>
          <div className="flex gap-3">
            {[
              { hex: eye, label: 'Mixed in the eye' },
              { hex: multiply(a, b), label: 'Mixed as paint' },
            ].map(({ hex, label }) => (
              <figure key={label} className="flex-1">
                <div className="h-20 rounded-sm ring-1 ring-border" style={{ background: hex }} />
                <figcaption className="mt-1 text-xs text-muted">{label}</figcaption>
              </figure>
            ))}
          </div>
          <p className="text-xs text-muted">
            Mixing in the eye loses less light than mixing paint, which is why Impressionist colour looks so bright.
          </p>
        </div>
      </div>
    </Step>
  )
}

// A small made-up picture to print: a warm sky behind a cool ball
function picture(u: number, v: number): [number, number, number] {
  const sky: [number, number, number] = [0.98 - v * 0.2, 0.75 - v * 0.45, 0.45 + v * 0.2]
  const dx = u - 0.5
  const dy = v - 0.55
  const r = Math.hypot(dx, dy)
  if (r > 0.3) return sky
  const shade = Math.max(0, 1 - Math.hypot(dx + 0.1, dy + 0.12) / 0.42)
  return [0.1 + shade * 0.5, 0.35 + shade * 0.55, 0.55 + shade * 0.45]
}

const INKS = [
  { channel: 0, colour: '#00aeef', angle: 15 },
  { channel: 1, colour: '#ec008c', angle: 75 },
  { channel: 2, colour: '#fff200', angle: 0 },
]

function Halftone() {
  const [cell, setCell] = useState(10)
  const [mode, setMode] = useState<'grey' | 'colour'>('colour')

  const ref = useCanvas(
    (ctx, w) => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, w)
      ctx.globalCompositeOperation = 'multiply'
      const inks = mode === 'grey' ? [{ channel: -1, colour: '#111111', angle: 45 }] : INKS
      for (const ink of inks) {
        const t = (ink.angle * Math.PI) / 180
        const [cos, sin] = [Math.cos(t), Math.sin(t)]
        ctx.fillStyle = ink.colour
        const span = Math.ceil((w * 1.5) / cell)
        for (let i = -span; i <= span; i++) {
          for (let j = -span; j <= span; j++) {
            // Centre of this cell in the rotated screen, back in picture space
            const x = w / 2 + (i * cos - j * sin) * cell
            const y = w / 2 + (i * sin + j * cos) * cell
            if (x < -cell || y < -cell || x > w + cell || y > w + cell) continue
            const rgb = picture(Math.min(1, Math.max(0, x / w)), Math.min(1, Math.max(0, y / w)))
            const amount = ink.channel < 0 ? 1 - (0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2]) : 1 - rgb[ink.channel]
            const radius = Math.sqrt(amount) * cell * 0.62
            if (radius < 0.2) continue
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over'
    },
    [cell, mode],
  )

  return (
    <Step n={2} title="Printed dots" quote="In the first case, 3 or 4 color plates subdivided into tiny printing dots mix to innumerable color shades and tints.">
      <p className="mb-6 max-w-2xl text-muted">
        Every printed picture is an optical mixture. In colour there are only three inks, cyan, magenta and yellow,
        each on its own angled grid. In black and white there is one ink and the white of the paper. Make the screen
        finer and the dots turn into a picture.
      </p>
      <div className="mb-6">
        <Segmented
          value={mode}
          options={[
            { id: 'colour', label: 'Three inks' },
            { id: 'grey', label: 'Black ink only' },
          ]}
          onChange={setMode}
        />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <canvas ref={ref} className="aspect-square w-full max-w-md rounded-sm ring-1 ring-border" role="img" aria-label="A picture printed as halftone dots" />
        <label className="block w-full max-w-xs text-sm text-muted">
          <span className="mb-1 flex justify-between">
            <span className="text-foreground">Screen</span>
            <span>{cell}px</span>
          </span>
          <input type="range" min={2} max={28} step={1} value={cell} onChange={(e) => setCell(Number(e.target.value))} aria-label="Halftone screen size" className="w-full accent-accent" />
          <span className="mt-1 flex justify-between text-xs">
            <span>Fine</span>
            <span>Coarse</span>
          </span>
        </label>
      </div>
    </Step>
  )
}
