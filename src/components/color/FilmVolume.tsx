'use client'

import { useState } from 'react'
import { hexToRgb, mixOklab, rgbToHex } from '@/lib/color'
import { Step } from './parts'

// Chapter XVII. Two colours that come from nature rather than from the eye: film colour, a thin
// veil between us and things, and volume colour, which deepens with the depth of a clear liquid.
// Paper can only show the results. Here they are simulated, so depth and distance can be changed.

// Clear liquids absorb light per channel. Light that travels through depth d keeps t^d of itself.
const toLin = (c: number) => {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const fromLin = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.max(0, c) ** (1 / 2.4) - 0.055)

// `tint` is what one unit of depth lets through, per channel, in linear light
function throughLiquid(under: string, tint: number[], depth: number) {
  const t = tint
  const u = hexToRgb(under).map(toLin)
  return rgbToHex(u.map((c, i) => fromLin(c * t[i] ** depth)) as [number, number, number])
}

function Slider({ label, value, min, max, step = 0.01, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <label className="flex max-w-sm flex-col gap-1 text-sm text-muted">
      {label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} className="accent-[var(--accent)]" />
    </label>
  )
}

export function FilmVolume() {
  return (
    <div className="space-y-20">
      <Film />
      <Coffee />
      <Pool />
      <TracingPaper />
    </div>
  )
}

const SKY = '#a9c4de'
const RIDGES = [{ surface: '#3f6a34' }, { surface: '#4c5f2e' }, { surface: '#5a4a35' }, { surface: '#2f5a2c' }]

function Film() {
  const [haze, setHaze] = useState(0.35)
  // Each ridge further back has more air in front of it
  const ridges = RIDGES.map((r, i) => {
    const distance = RIDGES.length - 1 - i
    return { ...r, color: mixOklab(r.surface, SKY, 1 - Math.exp(-haze * distance * 1.1)) }
  })

  return (
    <Step n={1} title="Film colour" quote="They appear as a thin, transparent, translucent layer between the eye and an object, independent of the object's surface color.">
      <p className="mb-6 max-w-2xl text-muted">
        All four ridges are green and brown forest. The air between you and them adds a veil of sky, and the further
        away a ridge is, the thicker the veil. Change how hazy the day is.
      </p>
      <svg role="img" aria-label="Four ridges of hills fading into the distance" viewBox="0 0 400 200" className="block w-full max-w-2xl rounded-sm ring-1 ring-border">
        <rect width="400" height="200" fill={SKY} />
        {ridges.map((r, i) => {
          // Further ridges sit higher, so each nearer one covers only the foot of the one behind
          const y = 60 + i * 34
          const wave = i % 2 ? 1 : -1
          return (
            <path
              key={i}
              d={`M0 200 L0 ${y + 14 * wave} Q 70 ${y - 22 * wave} 140 ${y} T 280 ${y + 6} T 400 ${y - 10 * wave} L400 200 Z`}
              fill={r.color}
            />
          )
        })}
      </svg>
      <div className="mt-6">
        <Slider label="Haze" value={haze} min={0} max={1} onChange={setHaze} />
      </div>
      <div className="mt-6 flex gap-3">
        {ridges.map((r, i) => (
          <figure key={i}>
            <div className="flex h-10 w-16 overflow-hidden rounded-sm ring-1 ring-border">
              <div className="flex-1" style={{ background: r.surface }} />
              <div className="flex-1" style={{ background: r.color }} />
            </div>
            <figcaption className="mt-1 text-xs text-muted">{i === 0 ? 'Furthest' : i === RIDGES.length - 1 ? 'Nearest' : ''}</figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">Each pair is the forest as it is, then as it reaches you.</p>
    </Step>
  )
}

const COFFEE = [0.86, 0.68, 0.5]
const VESSELS = [
  { name: 'The percolator stem', depth: 1.2, w: 'w-6' },
  { name: 'The cup', depth: 4, w: 'w-24' },
  { name: 'The glass jug', depth: 11, w: 'w-40' },
]

function Coffee() {
  const [strength, setStrength] = useState(1)
  const [depth, setDepth] = useState(6)

  return (
    <Step n={2} title="Volume colour" quote="Though all 3 containers hold the same coffee, the containers show this coffee in 3 different browns: lightest in the stem, darker in the cup, darkest in the silex glass.">
      <p className="mb-6 max-w-2xl text-muted">
        The same coffee in three containers, seen against white. Only the depth of liquid changes. Then pour your own
        glass.
      </p>
      <div className="flex flex-wrap items-end gap-6">
        {VESSELS.map((v) => (
          <figure key={v.name}>
            <div className={`h-36 ${v.w} rounded-b-md ring-1 ring-border`} style={{ background: throughLiquid('#fbfaf6', COFFEE, v.depth * strength) }} />
            <figcaption className="mt-2 w-28 text-xs text-muted">{v.name}</figcaption>
          </figure>
        ))}
        <figure>
          <div className="h-36 w-28 rounded-b-md ring-1 ring-border" style={{ background: throughLiquid('#fbfaf6', COFFEE, depth * strength) }} />
          <figcaption className="mt-2 w-28 text-xs text-muted">Yours</figcaption>
        </figure>
      </div>
      <div className="mt-6 grid max-w-xl gap-4 sm:grid-cols-2">
        <Slider label="Depth of your glass" value={depth} min={0.5} max={20} step={0.1} onChange={setDepth} />
        <Slider label="How strong the coffee is" value={strength} min={0.3} max={2} onChange={setStrength} />
      </div>
      <p className="mt-6 max-w-2xl text-sm text-muted">
        Milk would look the same white in every container. Only clear liquids show volume colour, because light has to
        pass through them to reach you.
      </p>
    </Step>
  )
}

const WATER = [0.8, 0.93, 0.97]

function Pool() {
  const [tint, setTint] = useState(1)
  const steps = 7

  return (
    <Step n={3} title="Steps into the pool" quote="Observing the white or blue steps within the water, we will discover that with each step down the blue of the water increases progressively.">
      <p className="mb-6 max-w-2xl text-muted">
        White steps of equal depth, going down into blue water. Each step adds the same depth, so the same amount of
        blue. Watch the boundaries between steps. They get softer the deeper you go. Chapter XX explains why.
      </p>
      <div
        role="img"
        aria-label="White pool steps getting bluer with depth"
        className="flex max-w-2xl flex-col overflow-hidden rounded-sm ring-1 ring-border"
        style={{ background: throughLiquid('#ffffff', WATER, (steps + 2) * 2 * tint) }}
      >
        {Array.from({ length: steps }, (_, i) => (
          <div key={i} className="h-9" style={{ background: throughLiquid('#ffffff', WATER, (i + 1) * 2 * tint), marginLeft: `${i * 6}%` }} />
        ))}
      </div>
      <div className="mt-6">
        <Slider label="How blue the water is" value={tint} min={0.3} max={2.5} onChange={setTint} />
      </div>
    </Step>
  )
}

// Each sheet reflects some light and lets some through. Stacking sheets is worked out one at a time,
// counting the light that bounces between them.
function layers(n: number, r = 0.3, t = 0.62) {
  let R = 0
  let T = 1
  for (let i = 0; i < n; i++) {
    const denom = 1 - r * R
    const nextR = r + (t * t * R) / denom
    T = (T * t) / denom
    R = nextR
  }
  return { R, T }
}

function TracingPaper() {
  const [count, setCount] = useState(4)
  const grey = (v: number) => {
    const c = fromLin(Math.min(1, v))
    return rgbToHex([c, c, c * 0.97])
  }
  const rows = Array.from({ length: count }, (_, i) => layers(i + 1))

  return (
    <Step n={4} title="Tracing paper, both ways" quote="By looking through several layers against the light, the paper becomes darker. However, the same layers seen from the direction of the light will appear whiter.">
      <p className="mb-6 max-w-2xl text-muted">
        One sheet, then two, then more, stacked like steps. Against a window, every sheet takes some light away.
        Lying on a dark desk, every sheet sends more light back. The same paper goes both ways at once.
      </p>
      <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
        <figure>
          <div className="flex h-28 overflow-hidden rounded-sm ring-1 ring-border">
            {rows.map(({ T }, i) => (
              <div key={i} className="flex-1" style={{ background: grey(T) }} />
            ))}
          </div>
          <figcaption className="mt-2 text-sm text-muted">Held up against the light</figcaption>
        </figure>
        <figure>
          <div className="flex h-28 overflow-hidden rounded-sm ring-1 ring-border">
            {rows.map(({ R }, i) => (
              <div key={i} className="flex-1" style={{ background: grey(R + 0.02) }} />
            ))}
          </div>
          <figcaption className="mt-2 text-sm text-muted">Lying on a dark desk, lit from the front</figcaption>
        </figure>
      </div>
      <div className="mt-6">
        <Slider label={`${count} sheets`} value={count} min={1} max={10} step={1} onChange={setCount} />
      </div>
    </Step>
  )
}
