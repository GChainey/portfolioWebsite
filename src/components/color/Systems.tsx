'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { greyOf, hexToRgb, hsvToHex, lightnessOf, oklchToHex, rgbToHex } from '@/lib/color'
import { Segmented, Step } from './parts'

// Chapter XXIV. Albers saves colour systems for the end of the course. Three of them here:
// Goethe's triangle, built live from whichever three primaries you give it; Schopenhauer's
// circle, which weighs each colour by its light; and two modern hue wheels seen in grey.

// Paint-like mixing: a weighted geometric mean of the light each colour reflects
const toLin = (c: number) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const fromLin = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
function mixPaint(a: string, b: string, t = 0.5): string {
  const p = hexToRgb(a).map(toLin)
  const q = hexToRgb(b).map(toLin)
  return rgbToHex(p.map((v, i) => fromLin(Math.max(v, 1e-4) ** (1 - t) * Math.max(q[i], 1e-4) ** t)) as [number, number, number])
}

export function Systems() {
  return (
    <div className="space-y-20">
      <Goethe />
      <Schopenhauer />
      <Wheels />
    </div>
  )
}

const PRIMARY_SETS = [
  { id: 'paper', label: 'Painter’s', y: '#f3cf1f', r: '#d22a26', b: '#1f4fa8' },
  { id: 'muted', label: 'Earth', y: '#d9b44a', r: '#a8452f', b: '#3d5873' },
  { id: 'pastel', label: 'Pastel', y: '#f7e38c', r: '#ef8f88', b: '#8fb0e0' },
] as const
type SetId = (typeof PRIMARY_SETS)[number]['id']

interface Cell {
  points: string
  hex: string
  name: string
  kind: 'Primary' | 'Secondary' | 'Tertiary'
  from: string
}

// The triangle split into 9: corners are the primaries, the upright triangles between two corners the
// secondaries, and the 3 inverted ones a primary mixed with its complement, dominated by the primary.
function goetheCells(y: string, r: string, b: string): Cell[] {
  const W = 300
  const H = 260
  const pt = (row: number, col: number) => [W / 2 + (col - row / 2) * (W / 3), (row * H) / 3] as const
  const up = (row: number, col: number) => [pt(row, col), pt(row + 1, col), pt(row + 1, col + 1)]
  const down = (row: number, col: number) => [pt(row, col), pt(row, col + 1), pt(row + 1, col + 1)]
  const str = (ps: readonly (readonly [number, number])[]) => ps.map((p) => p.join(',')).join(' ')
  const green = mixPaint(y, b)
  const orange = mixPaint(y, r)
  const violet = mixPaint(r, b)
  return [
    { points: str(up(0, 0)), hex: y, name: 'Yellow', kind: 'Primary', from: '' },
    { points: str(up(1, 0)), hex: green, name: 'Green', kind: 'Secondary', from: 'yellow and blue' },
    { points: str(up(1, 1)), hex: orange, name: 'Orange', kind: 'Secondary', from: 'yellow and red' },
    { points: str(up(2, 0)), hex: b, name: 'Blue', kind: 'Primary', from: '' },
    { points: str(up(2, 1)), hex: violet, name: 'Violet', kind: 'Secondary', from: 'red and blue' },
    { points: str(up(2, 2)), hex: r, name: 'Red', kind: 'Primary', from: '' },
    { points: str(down(1, 0)), hex: mixPaint(y, violet, 0.35), name: 'Yellow tertiary', kind: 'Tertiary', from: 'yellow with its complement, violet' },
    { points: str(down(2, 0)), hex: mixPaint(b, orange, 0.35), name: 'Blue tertiary', kind: 'Tertiary', from: 'blue with its complement, orange' },
    { points: str(down(2, 1)), hex: mixPaint(r, green, 0.35), name: 'Red tertiary', kind: 'Tertiary', from: 'red with its complement, green' },
  ]
}

function Goethe() {
  const [setId, setSetId] = useState<SetId>('paper')
  const [picked, setPicked] = useState(0)
  const [only, setOnly] = useState<Cell['kind'] | null>(null)
  const s = PRIMARY_SETS.find((p) => p.id === setId)!
  const cells = goetheCells(s.y, s.r, s.b)
  const cell = cells[picked]

  return (
    <Step n={1} title="Goethe's triangle" quote="Goethe's arrangement of 9 basic colors is probably the only one demonstrating the relatedness of primary to secondary plus tertiary colors in 2 dimensions.">
      <p className="mb-6 max-w-2xl text-muted">
        Give it three primaries and the triangle mixes the rest, the way paint mixes. Choose a triangle to see where
        it comes from, or show one group at a time.
      </p>
      <div className="mb-6 flex flex-wrap gap-6">
        <Segmented value={setId} options={[...PRIMARY_SETS]} onChange={setSetId} />
        <Segmented
          value={only ?? 'all'}
          options={[
            { id: 'all', label: 'All nine' },
            { id: 'Primary', label: 'Primaries' },
            { id: 'Secondary', label: 'Secondaries' },
            { id: 'Tertiary', label: 'Tertiaries' },
          ]}
          onChange={(v) => setOnly(v === 'all' ? null : (v as Cell['kind']))}
        />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <svg viewBox="-4 -4 308 268" className="w-full max-w-sm" role="group" aria-label="Goethe's colour triangle">
          {cells.map((c, i) => (
            <motion.polygon
              key={i}
              points={c.points}
              fill={c.hex}
              stroke={i === picked ? 'var(--foreground)' : 'var(--background)'}
              strokeWidth={i === picked ? 3 : 2}
              strokeLinejoin="round"
              animate={{ opacity: !only || only === c.kind ? 1 : 0.08 }}
              onClick={() => setPicked(i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setPicked(i)}
              tabIndex={0}
              role="button"
              aria-label={c.name}
              className="cursor-pointer outline-none"
            />
          ))}
        </svg>
        <div className="max-w-xs">
          <div className="h-24 w-24 rounded-sm ring-1 ring-border" style={{ background: cell.hex }} />
          <p className="mt-3 text-foreground">{cell.name}</p>
          <p className="text-sm text-muted">
            {cell.kind}
            {cell.from && `, from ${cell.from}`}. {cell.hex}
          </p>
        </div>
      </div>
    </Step>
  )
}

// Yellow round to green, in Schopenhauer's twelfths: each pair of opposites shares a third of the circle
const RING = [
  { name: 'Yellow', hex: '#f3cf1f', q: 3 },
  { name: 'Orange', hex: '#ec8a1e', q: 4 },
  { name: 'Red', hex: '#d22a26', q: 6 },
  { name: 'Violet', hex: '#5b2f8a', q: 9 },
  { name: 'Blue', hex: '#1f4fa8', q: 8 },
  { name: 'Green', hex: '#2f8f3c', q: 6 },
]

function arc(start: number, end: number, r = 100, inner = 58) {
  const p = (a: number, rad: number) => `${(110 + rad * Math.sin(a)).toFixed(2)},${(110 - rad * Math.cos(a)).toFixed(2)}`
  const large = end - start > Math.PI ? 1 : 0
  return `M${p(start, r)} A${r},${r} 0 ${large} 1 ${p(end, r)} L${p(end, inner)} A${inner},${inner} 0 ${large} 0 ${p(start, inner)} Z`
}

function Schopenhauer() {
  const [weighted, setWeighted] = useState(true)
  const total = RING.reduce((n, c) => n + (weighted ? c.q : 1), 0)
  let at = 0
  const segments = RING.map((c) => {
    const size = ((weighted ? c.q : 1) / total) * Math.PI * 2
    const seg = { ...c, start: at, end: at + size }
    at += size
    return seg
  })

  return (
    <Step n={2} title="Schopenhauer's quantities" quote="Thus yellow, the lightest color, appears in the smaller amount, and its opposite, violet, as the darkest, in the largest amount.">
      <p className="mb-6 max-w-2xl text-muted">
        Goethe gave his six colours equal shares. Schopenhauer weighed them by their light, 3 : 4 : 6 : 9 : 8 : 6,
        so each pair of opposites balances. The bars multiply each colour&apos;s area by its measured lightness.
      </p>
      <Segmented
        value={weighted ? 'schopenhauer' : 'goethe'}
        options={[
          { id: 'goethe', label: 'Equal sixths' },
          { id: 'schopenhauer', label: "Schopenhauer's quantities" },
        ]}
        onChange={(v) => setWeighted(v === 'schopenhauer')}
      />
      <div className="mt-6 flex flex-wrap items-center gap-10">
        <svg viewBox="0 0 220 220" className="w-full max-w-[16rem]" role="img" aria-label={weighted ? "Schopenhauer's colour circle" : "Goethe's colour circle"}>
          {segments.map((s) => (
            <motion.path key={s.name} d={arc(s.start, s.end)} fill={s.hex} initial={false} animate={{ d: arc(s.start, s.end) }} transition={{ duration: 0.6 }} />
          ))}
        </svg>
        <div className="w-full max-w-xs space-y-3 text-sm">
          {[
            [0, 3],
            [1, 4],
            [2, 5],
          ].map(([a, b]) => {
            const weight = (i: number) => (weighted ? RING[i].q : 1) * lightnessOf(RING[i].hex)
            const max = Math.max(weight(a), weight(b))
            return (
              <div key={a}>
                <p className="mb-1 text-muted">
                  {RING[a].name} and {RING[b].name}
                </p>
                {[a, b].map((i) => (
                  <motion.div key={i} className="mb-1 h-3 rounded-sm" style={{ background: RING[i].hex }} initial={false} animate={{ width: `${(weight(i) / max) * 100}%` }} />
                ))}
              </div>
            )
          })}
          <p className="text-xs text-muted">Light times area, for each pair. Closer bars mean a better balance.</p>
        </div>
      </div>
    </Step>
  )
}

const HUES = Array.from({ length: 12 }, (_, i) => i * 30)

function Wheels() {
  const [grey, setGrey] = useState(false)
  const wheels = [
    { name: 'HSV, the usual picker', colours: HUES.map((h) => hsvToHex(h, 1, 1)) },
    { name: 'OKLCH, a perceptual space', colours: HUES.map((h) => oklchToHex(0.72, 0.13, h + 20)) },
  ]

  return (
    <Step n={3} title="Equal steps, unequal light" quote="Besides the difference in measurements within these systems, we point out their practical value for industrial uses. We also show the limitations of the systems, particularly in connection with painting.">
      <p className="mb-6 max-w-2xl text-muted">
        Two twelve-step hue wheels. Both are evenly spaced by their own measure. Turn them grey to see which one
        keeps its light steady as the hue turns.
      </p>
      <button onClick={() => setGrey((g) => !g)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
        {grey ? 'Back to colour' : 'Show them in grey'}
      </button>
      <div className="mt-6 grid max-w-2xl gap-10 sm:grid-cols-2">
        {wheels.map((w) => {
          const Ls = w.colours.map(lightnessOf)
          const spread = (Math.max(...Ls) - Math.min(...Ls)) * 100
          return (
            <figure key={w.name}>
              <svg viewBox="0 0 220 220" className="w-full max-w-[14rem]" role="img" aria-label={w.name}>
                {w.colours.map((hex, i) => (
                  <path key={i} d={arc((i * Math.PI) / 6, ((i + 1) * Math.PI) / 6)} fill={grey ? greyOf(hex) : hex} />
                ))}
              </svg>
              <figcaption className="mt-3 text-sm">
                <span className="block text-foreground">{w.name}</span>
                <span className="text-muted">Lightness varies by {spread.toFixed(0)} points of 100.</span>
              </figcaption>
            </figure>
          )
        })}
      </div>
      <p className="mt-8 max-w-2xl text-sm text-muted">
        HSV calls every one of its colours full brightness, yet its yellow is far lighter than its blue. A space built
        on how people see can hold lightness still, but only by giving up the strongest colours.
      </p>
      <p className="mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-muted">
        Whereas the primary colors for the colorist (painters, designers) are, as we know, yellow-red-blue, the
        physicist has 3 other primaries (not including yellow), and the psychologist counts 4 primaries (the fourth
        being green), plus 2 neutrals, white and black.
      </p>
      <div className="mt-4 grid max-w-2xl gap-3 text-sm sm:grid-cols-3">
        {[
          { who: 'Colourist', hexes: ['#f3cf1f', '#d22a26', '#1f4fa8'] },
          { who: 'Physicist', hexes: ['#ff0000', '#00ff00', '#0000ff'] },
          { who: 'Psychologist', hexes: ['#d22a26', '#f3cf1f', '#2f8f3c', '#1f4fa8', '#ffffff', '#111111'] },
        ].map(({ who, hexes }) => (
          <div key={who}>
            <div className="flex h-8 overflow-hidden rounded-sm ring-1 ring-border">
              {hexes.map((h) => (
                <div key={h} className="flex-1" style={{ background: h }} />
              ))}
            </div>
            <p className="mt-1 text-muted">{who}</p>
          </div>
        ))}
      </div>
    </Step>
  )
}
