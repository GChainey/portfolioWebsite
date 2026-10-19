'use client'

import { useState } from 'react'
import { hexToRgb, mixOklab, rgbToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'

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
      <WhichKind />
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
const TEA = [0.9, 0.62, 0.3]
const MILK = '#f3efe4'
type Liquid = 'coffee' | 'tea' | 'milk'
const LIQUIDS: { id: Liquid; label: string }[] = [
  { id: 'coffee', label: 'Coffee' },
  { id: 'tea', label: 'Tea' },
  { id: 'milk', label: 'Milk' },
]
const VESSELS = [
  { name: 'The percolator stem', depth: 1.2, w: 'w-6' },
  { name: 'The cup', depth: 4, w: 'w-24' },
  { name: 'The glass jug', depth: 11, w: 'w-40' },
]

// A clear liquid darkens with depth. Milk is cloudy: it sends light back from just under its top,
// so what you see is a surface colour, the same in any container.
function pour(liquid: Liquid, depth: number) {
  if (liquid === 'milk') return MILK
  return throughLiquid('#fbfaf6', liquid === 'tea' ? TEA : COFFEE, depth)
}

function Coffee() {
  const [liquid, setLiquid] = useState<Liquid>('coffee')
  const [strength, setStrength] = useState(1)
  const [depth, setDepth] = useState(6)
  const shown = VESSELS.map((v) => pour(liquid, v.depth * strength))

  return (
    <Step n={2} title="Volume colour" quote="Though all 3 containers hold the same coffee, the containers show this coffee in 3 different browns: lightest in the stem, darker in the cup, darkest in the silex glass.">
      <p className="mb-6 max-w-2xl text-muted">
        The same liquid in three containers, seen against white. Only the depth of liquid changes. Then pour your own
        glass, and try a cloudy liquid as well as clear ones.
      </p>
      <div className="mb-6">
        <Segmented value={liquid} options={LIQUIDS} onChange={setLiquid} />
      </div>
      <div className="flex flex-wrap items-end gap-6" data-liquid={liquid}>
        {VESSELS.map((v, i) => (
          <figure key={v.name}>
            <div data-vessel={i} data-color={shown[i]} className={`h-36 ${v.w} rounded-b-md ring-1 ring-border`} style={{ background: shown[i] }} />
            <figcaption className="mt-2 w-28 text-xs text-muted">{v.name}</figcaption>
          </figure>
        ))}
        <figure>
          <div className="h-36 w-28 rounded-b-md ring-1 ring-border" style={{ background: pour(liquid, depth * strength) }} />
          <figcaption className="mt-2 w-28 text-xs text-muted">Yours</figcaption>
        </figure>
      </div>
      <div className="mt-6 grid max-w-xl gap-4 sm:grid-cols-2">
        <Slider label="Depth of your glass" value={depth} min={0.5} max={20} step={0.1} onChange={setDepth} />
        <Slider label={liquid === 'milk' ? 'How rich the milk is' : 'How strong it is'} value={strength} min={0.3} max={2} onChange={setStrength} />
      </div>
      <p className="mt-6 max-w-2xl text-sm text-muted">
        {liquid === 'milk'
          ? 'Milk is the same white in every container and at every depth. It is cloudy, so light comes back from just under the top and never travels through it. That is surface colour, not volume colour.'
          : 'Deeper means darker and stronger in hue. Light has to pass through the liquid to reach you, and every bit of depth takes some away. That is volume colour.'}
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


// Albers names his own examples. A student who has understood the chapter can sort them.
type Kind = 'surface' | 'film' | 'volume'
const KINDS: { id: Kind; label: string }[] = [
  { id: 'surface', label: 'Surface' },
  { id: 'film', label: 'Film' },
  { id: 'volume', label: 'Volume' },
]
const CASES: { thing: string; kind: Kind; why: string }[] = [
  { thing: 'A red apple on the table', kind: 'surface', why: 'Light bounces off its skin. Its colour stays put however far you stand.' },
  { thing: 'Hills on the horizon on a hazy day', kind: 'film', why: 'Air sits between you and them as a thin blue veil, thicker the further they are.' },
  { thing: 'Coffee in a tall glass jug', kind: 'volume', why: 'A clear liquid. The deeper it is, the darker it reads.' },
  { thing: 'Three coats of gouache, one on top of another', kind: 'surface', why: 'Albers: gouache, oil and pastel hardly change when layered. They are opaque.' },
  { thing: 'A white ceiling tinted green by a lawn outside the window', kind: 'film', why: 'Light from the lawn lays a veil over the ceiling. The paint has not changed.' },
  { thing: 'The water over the bottom step of a pool', kind: 'volume', why: 'Each step down adds depth of clear water, so more blue.' },
  { thing: 'A glass of milk', kind: 'surface', why: 'Cloudy, so light comes back from its top. Albers: it stays the same white in any container.' },
  { thing: 'Three washes of watercolour, one on top of another', kind: 'volume', why: 'Watercolour is clear. Each layer adds depth, so the colour gets darker and heavier.' },
  { thing: 'The sun, white at noon and full red at sunset', kind: 'film', why: 'More air lies in front of it at sunset. The sun has not changed.' },
]

function WhichKind() {
  const [answers, setAnswers] = useState<(Kind | null)[]>(() => CASES.map(() => null))
  const [checked, setChecked] = useState(false)
  const score = answers.filter((a, i) => a === CASES[i].kind).length

  return (
    <Step n={5} title="Which kind is it?" quote="This demonstrates that only transparent fluids present volume color.">
      <p className="mb-6 max-w-2xl text-muted">
        Albers separates three ways a colour can reach you. Sort each of these. Ask yourself whether the colour belongs to
        a surface, to a veil in front of something, or to the depth of something clear.
      </p>
      <ol className="max-w-2xl space-y-4">
        {CASES.map((c, i) => {
          const right = answers[i] === c.kind
          return (
            <li key={c.thing} data-case={i} className="border-t border-border pt-4">
              <p className="mb-2 text-foreground">{c.thing}</p>
              <Segmented
                value={answers[i] ?? ('' as Kind)}
                options={KINDS}
                onChange={(v) => {
                  if (checked) return
                  setAnswers((a) => a.map((x, j) => (j === i ? v : x)))
                }}
              />
              {checked && (
                <p className={`mt-2 text-sm ${right ? 'text-foreground' : 'text-muted'}`}>
                  {right ? 'Yes. ' : `It is ${c.kind} colour. `}
                  {c.why}
                </p>
              )}
            </li>
          )
        })}
      </ol>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        {!checked ? (
          <Next onClick={() => setChecked(true)} disabled={answers.some((a) => a === null)}>
            Check
          </Next>
        ) : (
          <>
            <p data-score={score} className="text-foreground">
              {score} of {CASES.length}.{' '}
              {score === CASES.length ? 'You can tell all three apart.' : 'Read the ones you missed, then try again.'}
            </p>
            <Next
              onClick={() => {
                setAnswers(CASES.map(() => null))
                setChecked(false)
              }}
            >
              Try again
            </Next>
          </>
        )}
      </div>
    </Step>
  )
}
