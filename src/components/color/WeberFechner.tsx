'use client'

import { useMemo, useState } from 'react'
import { hexToRgb, lightnessOf, multiply, oklchToHex, rgbToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'

// Chapter XX. Chevreul's grey scale, made by laying one thin tint over another. Albers says equal
// coats don't give equal steps, and that steps which look equal need light to grow geometrically.
// The screen can lay the coats exactly, and measure every step it makes.

const TINTS = [
  { id: 'grey', label: 'India ink', hex: '#d9d9d9' },
  { id: 'blue', label: 'Blue', hex: oklchToHex(0.9, 0.05, 240) },
  { id: 'rose', label: 'Rose', hex: oklchToHex(0.9, 0.05, 10) },
] as const
type TintId = (typeof TINTS)[number]['id']

// n coats of a tint, each passing on the same share of the light before it
function coats(tint: string, n: number): string {
  let hex = '#ffffff'
  for (let i = 0; i < n; i++) hex = multiply(hex, tint)
  return hex
}

// A coat of thin white on black: each covers the same share of what is still dark
function veils(n: number, cover = 0.12): string {
  const y = 1 - (1 - cover) ** n
  const v = 255 * (y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055)
  return rgbToHex([v, v, v])
}

// Steps between neighbours in perceptual lightness, as a share of the largest
function stepSizes(hexes: string[]) {
  const steps = hexes.slice(1).map((h, i) => Math.abs(lightnessOf(h) - lightnessOf(hexes[i])))
  const max = Math.max(...steps, 1e-6)
  return steps.map((s) => s / max)
}

// How uneven the steps are: 0 is perfectly even
function unevenness(hexes: string[]) {
  const steps = hexes.slice(1).map((h, i) => Math.abs(lightnessOf(h) - lightnessOf(hexes[i])))
  const mean = steps.reduce((a, b) => a + b, 0) / steps.length
  return Math.sqrt(steps.reduce((a, s) => a + (s - mean) ** 2, 0) / steps.length) / mean
}

function Scale({ hexes, labels, label }: { hexes: string[]; labels?: string[]; label: string }) {
  return (
    <figure>
      <div className="flex h-28 overflow-hidden rounded-sm ring-1 ring-border" role="img" aria-label={label}>
        {hexes.map((h, i) => (
          <div key={i} className="flex flex-1 items-end justify-center pb-1 text-[10px] tabular-nums" style={{ background: h, color: lightnessOf(h) > 0.6 ? '#111' : '#fff' }}>
            {labels?.[i]}
          </div>
        ))}
      </div>
      <figcaption className="mt-2 text-sm text-muted">{label}</figcaption>
    </figure>
  )
}

function StepBars({ hexes }: { hexes: string[] }) {
  return (
    <div>
      <div className="flex h-16 items-end gap-1" aria-hidden>
        {stepSizes(hexes).map((s, i) => (
          <div key={i} className="flex-1 rounded-t-sm bg-accent opacity-70" style={{ height: `${Math.max(3, s * 100)}%` }} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">How big each step looks, measured in perceptual lightness. Even steps make bars of equal height.</p>
    </div>
  )
}

export function WeberFechner() {
  return (
    <div className="space-y-20">
      <Chevreul />
      <AlbersRows />
      <TwoRows />
      <YourScale />
    </div>
  )
}

function Chevreul() {
  const [tintId, setTintId] = useState<TintId>('grey')
  const [medium, setMedium] = useState<'ink' | 'veil'>('ink')
  const tint = TINTS.find((t) => t.id === tintId)!.hex
  const counts = Array.from({ length: 10 }, (_, i) => i + 1)
  const hexes = counts.map((n) => (medium === 'ink' ? coats(tint, n) : veils(n)))
  const sizes = stepSizes(hexes)

  return (
    <Step n={1} title="Ten coats, ten stripes" quote="Lay a second tint on all the stripes except the first. As soon as the second is dry, lay a third one on all the stripes except the first and second, and so on all the rest, so as to have ten flat tints gradually increasing in depth from the first to the last.">
      <p className="mb-6 max-w-2xl text-muted">
        This is Chevreul&apos;s recipe, followed exactly. Stripe one has one coat, stripe ten has ten. Every coat is the
        same, so you might expect ten equal steps. Look at the edges between stripes as you go to the right.
      </p>
      <div className="mb-6 flex flex-wrap gap-6">
        <Segmented value={medium} options={[{ id: 'ink', label: 'Tint on white' }, { id: 'veil', label: 'White veils on black' }]} onChange={setMedium} />
        {medium === 'ink' && <Segmented value={tintId} options={TINTS.map(({ id, label }) => ({ id, label }))} onChange={setTintId} />}
      </div>
      <div className="max-w-2xl space-y-6">
        <Scale hexes={hexes} labels={counts.map(String)} label="Coats per stripe: 1, 2, 3 … 10" />
        <StepBars hexes={hexes} />
      </div>
      <p className="mt-6 max-w-2xl text-muted">
        The last step is {Math.round(sizes[sizes.length - 1] * 100)}% the size of the first.{' '}
        {medium === 'ink'
          ? 'Every coat is the same, but each one takes away a share of less and less light, so the increase in depth slows down.'
          : 'Every veil is the same, but each one covers a share of less and less black, so the increase in lightness slows down.'}{' '}
        Albers calls it a decreasing increase. The edges get softer as you go.
      </p>
    </Step>
  )
}

// Albers' own exercise: the same thin layer laid 1, 2, 3, 4, 5, 6 times in one row, and 1, 2, 4, 8, 16, 32
// times in the other. Ink on white keeps a little light from the paper's surface; veils of white on black
// each cover a share of what is still dark.
const ROWS = { arithmetic: [1, 2, 3, 4, 5, 6], geometric: [1, 2, 4, 8, 16, 32] }
function layered(n: number, medium: 'ink' | 'veil') {
  const y = medium === 'ink' ? 0.03 + 0.97 * 0.92 ** n : 1 - 0.94 ** n
  const v = 255 * (y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055)
  return rgbToHex([v, v, v])
}
// The contrast across each boundary, in perceptual lightness
const edges = (hexes: string[]) => hexes.slice(1).map((h, i) => Math.abs(lightnessOf(h) - lightnessOf(hexes[i])))

function EdgeBars({ values, max }: { values: number[]; max: number }) {
  return (
    <div className="flex h-12 items-end gap-1" aria-hidden>
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-t-sm bg-accent opacity-70" style={{ height: `${Math.max(3, (v / max) * 100)}%` }} />
      ))}
    </div>
  )
}

function AlbersRows() {
  const [medium, setMedium] = useState<'ink' | 'veil'>('veil')
  const [vote, setVote] = useState<'arithmetic' | 'geometric' | null>(null)
  const rows = {
    arithmetic: ROWS.arithmetic.map((n) => layered(n, medium)),
    geometric: ROWS.geometric.map((n) => layered(n, medium)),
  }
  const e = { arithmetic: edges(rows.arithmetic), geometric: edges(rows.geometric) }
  const max = Math.max(...e.arithmetic, ...e.geometric)
  // How much the last boundary keeps of the first: 1 means it stays as distinct
  const keep = (v: number[]) => v[v.length - 1] / v[0]
  const kept = { arithmetic: keep(e.arithmetic), geometric: keep(e.geometric) }
  const steadier = Math.abs(Math.log(kept.geometric)) < Math.abs(Math.log(kept.arithmetic)) ? 'geometric' : 'arithmetic'

  return (
    <Step n={2} title="Albers' two rows" quote="In an arithmetical order of contiguous mixtures, the boundaries gradually become softer, whereas in a geometric order the boundaries remain equally distinct.">
      <p className="mb-6 max-w-2xl text-muted">
        The exercise Albers sets. The same thin layer, laid 1, 2, 3, 4, 5 and 6 times in one row, and 1, 2, 4, 8, 16 and
        32 times in the other. Look only at the boundaries between steps. Which row keeps its boundaries equally sharp all
        the way along?
      </p>
      <div className="mb-6">
        <Segmented value={medium} options={[{ id: 'veil', label: 'White veils on black' }, { id: 'ink', label: 'Thin ink on white' }]} onChange={(m) => { setMedium(m); setVote(null) }} />
      </div>
      <div className="max-w-2xl space-y-4" data-medium={medium}>
        <Scale hexes={rows.arithmetic} labels={ROWS.arithmetic.map(String)} label="Row one" />
        <Scale hexes={rows.geometric} labels={ROWS.geometric.map(String)} label="Row two" />
      </div>
      {!vote ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Next onClick={() => setVote('arithmetic')}>Row one</Next>
          <Next onClick={() => setVote('geometric')}>Row two</Next>
        </div>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6" data-kept-arithmetic={kept.arithmetic.toFixed(2)} data-kept-geometric={kept.geometric.toFixed(2)}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-foreground">Row one, 1 to 6 layers</p>
              <EdgeBars values={e.arithmetic} max={max} />
              <p className="mt-2 text-xs text-muted">The last boundary is {Math.round(kept.arithmetic * 100)}% as sharp as the first.</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-foreground">Row two, 1 to 32 layers</p>
              <EdgeBars values={e.geometric} max={max} />
              <p className="mt-2 text-xs text-muted">The last boundary is {Math.round(kept.geometric * 100)}% as sharp as the first.</p>
            </div>
          </div>
          <p className="mt-6 text-foreground">
            {vote === steadier ? 'Your eye and the measurement agree. ' : 'The measurement disagrees with your eye. '}
            {medium === 'veil'
              ? 'With veils of white on black, the boundaries in row one soften step by step, and the boundaries in row two stay about as sharp. This is what Albers promised.'
              : 'With thin ink on white, row one hardly softens over six layers, and row two grows sharper at every step. Doubling the layers overshoots here, so row one is the steadier one. Albers says such studies are only theoretically true, and real materials stray from the rule.'}
          </p>
          <p className="mt-2 text-sm text-muted">Bars show how much the light changes across each boundary, measured in perceptual lightness. Both rows use the same scale.</p>
        </div>
      )}
    </Step>
  )
}

// Grey levels from near black to white, stepped evenly in physical light or by doubling it
const LEVELS = 8
const arithmetic = Array.from({ length: LEVELS }, (_, i) => 0.02 + (0.98 * i) / (LEVELS - 1))
const geometric = Array.from({ length: LEVELS }, (_, i) => 0.02 * (1 / 0.02) ** (i / (LEVELS - 1)))
const greyFromLight = (y: number) => {
  const v = 255 * (y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055)
  return rgbToHex([v, v, v])
}

function TwoRows() {
  const [order, setOrder] = useState<'ag' | 'ga'>('ag')
  const [vote, setVote] = useState<'top' | 'bottom' | null>(null)
  const rows = { a: arithmetic.map(greyFromLight), g: geometric.map(greyFromLight) }
  const [top, bottom] = order === 'ag' ? [rows.a, rows.g] : [rows.g, rows.a]
  const evenRow = order === 'ag' ? 'bottom' : 'top'

  return (
    <Step n={3} title="Which row steps evenly?" quote="The visual perception of an arithmetical progression depends upon a physical geometric progression.">
      <p className="mb-6 max-w-2xl text-muted">
        Both rows go from nearly black to white in eight steps. One adds the same amount of light at every step. The
        other doubles the light at every step. Which one looks like a staircase of equal steps?
      </p>
      <div className="max-w-2xl space-y-4">
        <Scale hexes={top} label="Top row" />
        <Scale hexes={bottom} label="Bottom row" />
      </div>
      {!vote ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Next onClick={() => setVote('top')}>The top row</Next>
          <Next onClick={() => setVote('bottom')}>The bottom row</Next>
        </div>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {vote === evenRow ? 'Yes. ' : 'Most people pick the other one. '}The {evenRow} row doubles the light each
            step, and it looks more even. The {evenRow === 'top' ? 'bottom' : 'top'} row adds equal light, and its
            steps crowd together in the light end. Measured, neither is perfect. Doubling overshoots, so its steps
            grow towards the lights. Modern colour science puts the eye somewhere between the Weber-Fechner logarithm and a cube
            root.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-foreground">Equal light added</p>
              <StepBars hexes={rows.a} />
            </div>
            <div>
              <p className="mb-2 text-sm text-foreground">Light doubled</p>
              <StepBars hexes={rows.g} />
            </div>
          </div>
          <Next onClick={() => { setOrder((o) => (o === 'ag' ? 'ga' : 'ag')); setVote(null) }}>Swap the rows and look again</Next>
        </div>
      )}
    </Step>
  )
}

// 0 adds equal light per step, 1 multiplies it by an equal ratio
function scaleFor(curve: number, base: string) {
  const [r, g, b] = hexToRgb(base).map((c) => c / 255)
  return Array.from({ length: LEVELS }, (_, i) => {
    const t = i / (LEVELS - 1)
    const y = (1 - curve) * (0.02 + 0.98 * t) + curve * 0.02 * 50 ** t
    const v = (c: number) => {
      const lin = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      const out = Math.min(1, y * lin)
      return 255 * (out <= 0.0031308 ? 12.92 * out : 1.055 * out ** (1 / 2.4) - 0.055)
    }
    return rgbToHex([v(r), v(g), v(b)])
  })
}

function YourScale() {
  const [curve, setCurve] = useState(0.15)
  const [base, setBase] = useState<'grey' | 'blue' | 'rose'>('grey')
  const [done, setDone] = useState(false)
  const baseHex = { grey: '#ffffff', blue: '#8fb4ff', rose: '#ffb0b8' }[base]
  const hexes = useMemo(() => scaleFor(curve, baseHex), [curve, baseHex])
  const best = useMemo(() => {
    let pick = 0
    for (let c = 0; c <= 1.0001; c += 0.01) if (unevenness(scaleFor(c, baseHex)) < unevenness(scaleFor(pick, baseHex))) pick = c
    return pick
  }, [baseHex])

  return (
    <Step n={4} title="Make an even scale" quote="We think and “feel” that we read steps of equal height.">
      <p className="mb-6 max-w-2xl text-muted">
        Move the slider from adding light towards multiplying it, until every step looks the same height. Judge by the
        edges between the stripes. Then check your eye against the measurement.
      </p>
      <div className="mb-6">
        <Segmented value={base} options={[{ id: 'grey', label: 'Grey' }, { id: 'blue', label: 'Blue' }, { id: 'rose', label: 'Rose' }]} onChange={(b) => { setBase(b); setDone(false) }} />
      </div>
      <div className="max-w-2xl">
        <Scale hexes={hexes} label="Your scale" />
        <label className="mt-6 block text-sm text-muted">
          From adding light to multiplying it
          <input type="range" min={0} max={1} step={0.01} value={curve} onChange={(e) => { setCurve(+e.target.value); setDone(false) }} className="mt-2 block w-full accent-accent" />
        </label>
      </div>
      {!done ? (
        <Next onClick={() => setDone(true)}>The steps look even</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            Yours is {Math.round(unevenness(hexes) * 100)}% uneven. The most even setting measures{' '}
            {Math.round(unevenness(scaleFor(best, baseHex)) * 100)}%, at {Math.round(best * 100)}% of the way to multiplying.
          </p>
          <div className="mt-6">
            <StepBars hexes={hexes} />
          </div>
          <p className="mt-4 text-sm text-muted">
            Albers warns that even a measured, even scale doesn&apos;t look level, because its neighbours change each
            stripe. Wide stripes start to look fluted, like a Doric column.
          </p>
        </div>
      )}
    </Step>
  )
}
