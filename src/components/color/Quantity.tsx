'use client'

import { useState } from 'react'
import { averageLight, deltaE, lightnessOf } from '@/lib/color'
import { Next, Segmented, Step } from './parts'

// Chapter XVI. One cast of four colours in four performances. Nothing changes but how much of each
// colour there is and where it sits, and the aim is four plates that look like four different casts.
// Then Schopenhauer's colour circle, where the amounts are set by light.

const CASTS = [
  { id: 'autumn', label: 'Cast A', colors: ['#d9a441', '#3d5a80', '#ece4d2', '#8c2f39'] },
  { id: 'sea', label: 'Cast B', colors: ['#1f4e5a', '#9cc5b8', '#e07a3f', '#2b2a33'] },
  { id: 'dusk', label: 'Cast C', colors: ['#c9a3c6', '#5f4b8b', '#f2d16b', '#6f7d6a'] },
] as const
type CastId = (typeof CASTS)[number]['id']

// Nested squares, outermost first. `sides` are the inner squares as fractions of the outer one.
interface Performance {
  order: number[]
  sides: [number, number, number]
}

const START: Performance[] = [
  { order: [0, 1, 2, 3], sides: [0.78, 0.56, 0.34] },
  { order: [1, 2, 3, 0], sides: [0.78, 0.56, 0.34] },
  { order: [2, 3, 0, 1], sides: [0.78, 0.56, 0.34] },
  { order: [3, 0, 1, 2], sides: [0.78, 0.56, 0.34] },
]

const areas = ({ sides: [a, b, c] }: Performance) => [1 - a * a, a * a - b * b, b * b - c * c, c * c]

// What the whole plate mixes to from across the room
function mixOf(p: Performance, colors: readonly string[]) {
  const parts: string[] = []
  areas(p).forEach((area, i) => {
    for (let k = 0; k < Math.round(area * 60); k++) parts.push(colors[p.order[i]])
  })
  return averageLight(...parts)
}

function shuffled(): Performance {
  const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5)
  const a = 0.5 + Math.random() * 0.45
  const b = a * (0.3 + Math.random() * 0.6)
  const c = b * (0.2 + Math.random() * 0.7)
  return { order, sides: [a, b, c] }
}

// Albers' own Homage arrangement: each square sits low in the one around it
function Plate({ p, colors, label }: { p: Performance; colors: readonly string[]; label: string }) {
  let left = 0
  let top = 0
  let size = 1
  const squares = [{ left, top, size, color: colors[p.order[0]] }]
  p.sides.forEach((s, i) => {
    const gap = size - s
    left += gap / 2
    top += gap * 0.7
    size = s
    squares.push({ left, top, size, color: colors[p.order[i + 1]] })
  })
  return (
    <div role="img" aria-label={label} className="relative aspect-square w-full overflow-hidden rounded-sm ring-1 ring-border">
      {squares.map((sq, i) => (
        <div
          key={i}
          className="absolute transition-all duration-500"
          style={{ left: `${sq.left * 100}%`, top: `${sq.top * 100}%`, width: `${sq.size * 100}%`, height: `${sq.size * 100}%`, background: sq.color }}
        />
      ))}
    </div>
  )
}

export function Quantity() {
  return (
    <div className="space-y-20">
      <FourPerformances />
      <Schopenhauer />
    </div>
  )
}

const RINGS = ['Outer square', 'Second square', 'Third square']

function FourPerformances() {
  const [castId, setCastId] = useState<CastId>('autumn')
  const [plays, setPlays] = useState<Performance[]>(START)
  const [current, setCurrent] = useState(0)
  const [judged, setJudged] = useState(false)
  const colors = CASTS.find((c) => c.id === castId)!.colors
  const p = plays[current]

  const update = (next: Performance) => {
    setPlays((ps) => ps.map((q, i) => (i === current ? next : q)))
    setJudged(false)
  }
  const swap = (i: number, j: number) => {
    const order = [...p.order]
    ;[order[i], order[j]] = [order[j], order[i]]
    update({ ...p, order })
  }
  const setSide = (i: number, v: number) => {
    const sides = [...p.sides] as Performance['sides']
    sides[i] = v
    // Each square has to fit inside the one around it
    for (let k = 1; k < 3; k++) sides[k] = Math.min(sides[k], sides[k - 1] - 0.04)
    for (let k = 1; k >= 0; k--) sides[k] = Math.max(sides[k], sides[k + 1] + 0.04)
    update({ ...p, sides })
  }

  const mixes = plays.map((q) => mixOf(q, colors))
  let closest = Infinity
  let pair = [0, 1]
  mixes.forEach((a, i) => mixes.forEach((b, j) => {
    if (j > i && deltaE(a, b) < closest) {
      closest = deltaE(a, b)
      pair = [i, j]
    }
  }))

  return (
    <Step
      n={1}
      title="One cast, four performances"
      quote={'A set of 4 colors is to be considered—singly as "actors," together as "cast." They are to be presented in 4 different arrangements—as "performances."'}
    >
      <p className="mb-6 max-w-2xl text-muted">
        Every plate uses the same four colours. Change the order of the squares and how big each one is until the
        four plates look like four different sets of colours. Albers asks which distribution of quantities
        best hides that it is the same cast.
      </p>
      <div className="mb-6 flex flex-wrap items-center gap-6">
        <Segmented value={castId} options={CASTS.map(({ id, label }) => ({ id, label }))} onChange={(id) => { setCastId(id); setJudged(false) }} />
        <div className="flex gap-1" aria-label="The cast">
          {colors.map((hex) => (
            <span key={hex} className="h-6 w-6 rounded-sm ring-1 ring-border" style={{ background: hex }} />
          ))}
        </div>
      </div>

      <div className="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
        {plays.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-pressed={i === current}
            className={`rounded-sm p-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${i === current ? 'ring-2 ring-accent' : ''}`}
          >
            <Plate p={q} colors={colors} label={`Performance ${i + 1}`} />
            <span className="mt-2 block text-left text-xs text-muted">Performance {i + 1}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid max-w-3xl gap-8 sm:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm text-foreground">Order, outside to centre</h3>
          <ol className="space-y-2">
            {p.order.map((ci, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-muted">
                <span className="h-6 w-6 rounded-sm ring-1 ring-border" style={{ background: colors[ci] }} />
                <span className="flex-1">{i === 3 ? 'Centre' : RINGS[i]}</span>
                <button onClick={() => swap(i, i - 1)} disabled={i === 0} aria-label="Move outward" className="px-2 hover:text-accent disabled:opacity-30">
                  ↑
                </button>
                <button onClick={() => swap(i, i + 1)} disabled={i === 3} aria-label="Move inward" className="px-2 hover:text-accent disabled:opacity-30">
                  ↓
                </button>
              </li>
            ))}
          </ol>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm text-foreground">Sizes</h3>
          {['Second square', 'Third square', 'Centre'].map((label, i) => (
            <label key={label} className="flex flex-col gap-1 text-sm text-muted">
              {label}
              <input type="range" min={0.08} max={0.96} step={0.01} value={p.sides[i]} onChange={(e) => setSide(i, +e.target.value)} className="accent-[var(--accent)]" />
            </label>
          ))}
          <button onClick={() => update(shuffled())} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
            Shuffle this performance
          </button>
        </div>
      </div>

      {!judged ? (
        <Next onClick={() => setJudged(true)}>Four different casts</Next>
      ) : (
        <div className="mt-8 max-w-3xl border-t border-border pt-6">
          <p className="mb-4 text-muted">Seen from across the room, each plate mixes to one colour. The further apart these are, the less the plates give away that they share a cast.</p>
          <div className="flex gap-3">
            {mixes.map((hex, i) => (
              <figure key={i} className="flex-1">
                <div className="h-14 rounded-sm ring-1 ring-border" style={{ background: hex }} />
                <figcaption className="mt-1 text-xs text-muted">{i + 1}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-foreground">
            {closest < 6
              ? `Performances ${pair[0] + 1} and ${pair[1] + 1} are too alike. Give one colour far more room in one of them.`
              : closest < 12
                ? `A good spread. Performances ${pair[0] + 1} and ${pair[1] + 1} are the closest pair.`
                : 'Four different climates from the same four colours.'}
          </p>
        </div>
      )}
    </Step>
  )
}

const CIRCLE = [
  { name: 'Yellow', hex: '#f2d22e', s: 3 },
  { name: 'Orange', hex: '#ec8a2c', s: 4 },
  { name: 'Red', hex: '#d23a2f', s: 6 },
  { name: 'Violet', hex: '#6b3fa0', s: 9 },
  { name: 'Blue', hex: '#2f62b5', s: 8 },
  { name: 'Green', hex: '#3d9a4a', s: 6 },
]
const OPPOSITES = [
  [0, 3],
  [1, 4],
  [2, 5],
]

type System = 'goethe' | 'schopenhauer' | 'measured'

function Schopenhauer() {
  const [system, setSystem] = useState<System>('goethe')
  // Measured: each colour's area is the inverse of its lightness, so every colour carries the same light
  const share = CIRCLE.map((c) => (system === 'goethe' ? 1 : system === 'schopenhauer' ? c.s : 6 / lightnessOf(c.hex)))
  const total = share.reduce((a, b) => a + b, 0)

  let at = 0
  const stops = CIRCLE.map((c, i) => {
    const from = (at / total) * 360
    at += share[i]
    return `${c.hex} ${from}deg ${(at / total) * 360}deg`
  }).join(', ')

  return (
    <Step n={2} title="Schopenhauer's circle" quote="Thus yellow, the lightest color, appears in the smaller amount, and its opposite, violet, as the darkest, in the largest amount.">
      <p className="mb-6 max-w-2xl text-muted">
        Goethe gave six colours equal shares of his circle. Schopenhauer, to Goethe&apos;s dismay, gave each pair of
        opposites a third and split it by light: yellow 3 to violet 9, orange 4 to blue 8, red 6 to green 6. Switch
        between them, then try a version a screen can measure.
      </p>
      <div className="mb-6">
        <Segmented
          value={system}
          options={[
            { id: 'goethe', label: 'Goethe, equal' },
            { id: 'schopenhauer', label: 'Schopenhauer, 3:4:6:9:8:6' },
            { id: 'measured', label: 'Measured' },
          ]}
          onChange={setSystem}
        />
      </div>
      <div className="flex flex-wrap items-center gap-10">
        <div
          role="img"
          aria-label={`${system === 'goethe' ? 'Goethe' : system === 'schopenhauer' ? 'Schopenhauer' : 'Measured'} colour circle`}
          className="aspect-square w-64 rounded-full ring-1 ring-border transition-[background] duration-700"
          style={{ background: `conic-gradient(${stops})` }}
        />
        <div className="w-full max-w-xs space-y-4">
          <h3 className="text-sm text-foreground">Light times area, for each pair of opposites</h3>
          {OPPOSITES.map(([a, b]) => {
            const wa = lightnessOf(CIRCLE[a].hex) * share[a]
            const wb = lightnessOf(CIRCLE[b].hex) * share[b]
            const max = Math.max(wa, wb)
            return (
              <div key={a} className="space-y-1">
                {[
                  [a, wa],
                  [b, wb],
                ].map(([i, w]) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-12">{CIRCLE[i].name}</span>
                    <span className="h-3 rounded-sm transition-all duration-500" style={{ width: `${(w / max) * 70}%`, background: CIRCLE[i].hex }} />
                  </div>
                ))}
              </div>
            )
          })}
          <p className="text-xs text-muted">
            {system === 'goethe'
              ? 'With equal shares, yellow carries far more light than violet, and orange more than blue.'
              : system === 'schopenhauer'
                ? "Schopenhauer's figures turn the imbalance round. Measured on screen, violet now carries more light than yellow. His numbers came from judgement, not a meter."
                : 'Here each area is set from measured lightness, so every pair carries the same light. Compare how it feels with his.'}
          </p>
        </div>
      </div>
    </Step>
  )
}
