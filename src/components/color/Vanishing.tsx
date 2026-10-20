'use client'

import { useEffect, useRef, useState } from 'react'
import { greyOf, hexToOklab, lightnessOf, oklchToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'

// Chapter XXIII. Two neighbouring colours at exactly the same light intensity lose the edge between
// them. First the clouds Albers points to. Then his last exercise, with both colours in your hands:
// tune a grey-green and a grey-violet until the triangles dissolve, checked the way vision scientists
// check equal light, by flicker, which only a screen can do. Then a fresh pair, by eye alone.
//
// Every plate sits on a fixed neutral mat, so the site's light or dark theme isn't a third colour.

const MAT = '#7a7a7a'
// Within this many points of 100 in lightness the edge is gone for most eyes
const EQUAL = 1

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block w-full text-sm text-muted">
      {label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 block w-full accent-accent" />
    </label>
  )
}

function Mat({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-sm p-4 sm:p-6 ${className}`} style={{ background: MAT }}>
      {children}
    </div>
  )
}

export function Vanishing() {
  return (
    <div className="space-y-20">
      <Clouds />
      <Triangles />
      <FreshPairs />
    </div>
  )
}

const SKY = oklchToHex(0.56, 0.13, 255)

function Clouds() {
  const [shade, setShade] = useState(0.8)
  const under = oklchToHex(shade, 0.006, 255)
  const diff = (lightnessOf(under) - lightnessOf(SKY)) * 100

  return (
    <Step title="Where the cloud ends" quote="These shades merge, or even hinge, with the same but here very close blue. Why very close? This grey is of the same light intensity as the neighboring blue below.">
      <p className="mb-6 max-w-2xl text-muted">
        Cumulus clouds in full sun are white on top and grey underneath. Darken the grey until you can&apos;t see
        where the cloud stops and the sky starts.
      </p>
      <Mat className="max-w-xl">
        <svg viewBox="0 0 400 220" className="block w-full" role="img" aria-label="A cloud against blue sky">
          <rect width="400" height="220" fill={SKY} />
          <g fill={under}>
            <ellipse cx="130" cy="140" rx="70" ry="34" />
            <ellipse cx="210" cy="132" rx="90" ry="42" />
            <ellipse cx="290" cy="142" rx="66" ry="30" />
          </g>
          <g fill="#fbfbf8">
            <ellipse cx="150" cy="104" rx="52" ry="40" />
            <ellipse cx="215" cy="86" rx="60" ry="52" />
            <ellipse cx="278" cy="110" rx="46" ry="34" />
            <rect x="110" y="106" width="210" height="16" />
          </g>
        </svg>
      </Mat>
      <div className="mt-6 max-w-sm">
        <Slider label="The grey under the cloud" value={shade} min={0.35} max={0.95} step={0.002} onChange={setShade} />
      </div>
      <p className="mt-3 text-sm text-foreground" role="status">
        {Math.abs(diff) < 1.5
          ? 'Equal in lightness. The lower edge has gone.'
          : `The grey is ${Math.abs(diff).toFixed(0)} points ${diff > 0 ? 'lighter' : 'darker'} than the sky.`}
      </p>
    </Step>
  )
}

interface Paper {
  h: number // hue, degrees
  c: number // chroma: 0 is grey
  L: number // lightness, 0 to 1
}
const hexOf = (p: Paper) => oklchToHex(p.L, p.c, p.h)

// How far apart two colours are in hue and chroma alone, lightness left out, in points of 100
const hueGap = (a: string, b: string) => {
  const [, a1, b1] = hexToOklab(a)
  const [, a2, b2] = hexToOklab(b)
  return Math.hypot(a1 - a2, b1 - b2) * 100
}
// Lightness gap in points of 100, measured on the colours the screen actually shows
const lightGap = (a: string, b: string) => (lightnessOf(a) - lightnessOf(b)) * 100

function Pattern({ ground, figure, blur = false }: { ground: string; figure: string; blur?: boolean }) {
  const cols = 7
  const rows = 4
  return (
    <svg viewBox={`0 0 ${cols * 40} ${rows * 40}`} className="block w-full" style={blur ? { filter: 'blur(3px)' } : undefined} aria-hidden>
      <rect width={cols * 40} height={rows * 40} fill={ground} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = (i % cols) * 40 + 8
        const y = Math.floor(i / cols) * 40 + 8
        return <polygon key={i} points={`${x},${y + 24} ${x + 12},${y} ${x + 24},${y + 24}`} fill={figure} />
      })}
    </svg>
  )
}

function PaperControls({ name, paper, onChange }: { name: string; paper: Paper; onChange: (p: Paper) => void }) {
  return (
    <fieldset className="w-full max-w-[16rem] space-y-3">
      <legend className="mb-2 flex items-center gap-2 text-sm text-foreground">
        <span className="inline-block h-4 w-4 rounded-sm ring-1 ring-border" style={{ background: hexOf(paper) }} />
        {name}
      </legend>
      <Slider label={`${name}: hue`} value={paper.h} min={0} max={360} step={1} onChange={(h) => onChange({ ...paper, h })} />
      <Slider label={`${name}: greyness`} value={0.14 - paper.c} min={0} max={0.14} step={0.002} onChange={(g) => onChange({ ...paper, c: 0.14 - g })} />
      <Slider label={`${name}: lightness`} value={paper.L} min={0.3} max={0.86} step={0.001} onChange={(L) => onChange({ ...paper, L })} />
      <div className="flex gap-2">
        {[
          { d: -0.002, label: 'Darker' },
          { d: 0.002, label: 'Lighter' },
        ].map(({ d, label }) => (
          <button key={label} onClick={() => onChange({ ...paper, L: paper.L + d })} aria-label={`${name}: a touch ${label.toLowerCase()}`} className="rounded border border-border px-2.5 py-1 text-xs text-muted hover:text-foreground">
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

// Heterochromatic flicker photometry. Two colours swap in place many times a second. Where their
// lightness differs, the patch flickers; where it is equal, the eye can't follow the change of hue at
// that speed and the flicker nearly stops. The patch is small and only runs when asked, for 20 seconds.
const FLICKER_HZ = 15
const SLOW_HZ = 1.5
const RUN_MS = 20000

function Flicker({ a, b }: { a: string; b: string }) {
  const [on, setOn] = useState(false)
  const [slow, setSlow] = useState(false)
  const patch = useRef<HTMLDivElement>(null)
  const colours = useRef([a, b])
  colours.current = [a, b]

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setSlow(true)
  }, [])

  useEffect(() => {
    if (!on) return
    const hz = slow ? SLOW_HZ : FLICKER_HZ
    const start = performance.now()
    let frame = 0
    const tick = (t: number) => {
      if (t - start > RUN_MS) return setOn(false)
      const phase = Math.floor(((t - start) / 1000) * hz * 2) % 2
      if (patch.current) patch.current.style.background = colours.current[phase]
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [on, slow])

  return (
    <div className="max-w-sm rounded-sm border border-border p-4">
      <p className="text-sm text-foreground">Flicker check</p>
      <p className="mt-1 text-xs text-muted">
        The two colours swap {slow ? 'slowly' : `${FLICKER_HZ} times a second`} in a small patch. Tune the
        lightness until the flicker is as weak as you can get it. Skip this if flashing light affects you.
      </p>
      <div className="mt-3 flex items-center gap-4">
        <div className="rounded-sm p-3" style={{ background: MAT }}>
          <div ref={patch} className="h-24 w-24" style={{ background: a }} aria-hidden />
        </div>
        <div className="space-y-2 text-sm">
          <button onClick={() => setOn((o) => !o)} className="block rounded border border-border px-3 py-1.5 text-foreground hover:border-accent hover:text-accent">
            {on ? 'Stop' : 'Start flicker'}
          </button>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} className="accent-accent" />
            Slow swap instead
          </label>
        </div>
      </div>
      {slow && <p className="mt-2 text-xs text-muted">A slow swap can&apos;t null the flicker. Watch for the patch getting lighter or darker as it swaps.</p>}
    </div>
  )
}

const VIEWS = [
  { id: 'colour', label: 'Colour' },
  { id: 'grey', label: 'Greyscale' },
  { id: 'blur', label: 'Squint' },
] as const
type View = (typeof VIEWS)[number]['id']

// Albers' reproduced pair: a grey-violet ground and grey-green triangles
const ALBERS = { ground: { h: 305, c: 0.05, L: 0.58 }, figure: { h: 150, c: 0.05, L: 0.58 } }

function Triangles() {
  const [ground, setGround] = useState<Paper>(ALBERS.ground)
  const [figure, setFigure] = useState<Paper>(ALBERS.figure)
  const [done, setDone] = useState(false)
  const [view, setView] = useState<View>('grey')

  // Both papers start off equal, at random, once the browser is here
  useEffect(() => {
    const off = (Math.random() < 0.5 ? -1 : 1) * (0.06 + Math.random() * 0.06)
    setGround({ ...ALBERS.ground, L: 0.58 - off / 2 })
    setFigure({ ...ALBERS.figure, L: 0.58 + off / 2 })
  }, [])

  const g = hexOf(ground)
  const f = hexOf(figure)
  const miss = lightGap(f, g)
  const apart = hueGap(f, g)
  const shown = done && view === 'grey' ? { ground: greyOf(g), figure: greyOf(f) } : { ground: g, figure: f }

  return (
    <Step title="Make the triangles vanish" quote="I invite serious color students to alter the reproduced grey-violet and grey-green of this study toward equal light-intensity so that the small triangles of the underlying design almost dissolve into the ground. It is a most difficult task, but worth trying.">
      <p className="mb-6 max-w-2xl text-muted">
        Both papers are yours. Change either one, its hue, greyness or lightness, until the triangles are as hard
        to see as you can make them. It only works between neighbouring, muted colours. Strong opposite hues
        vibrate instead. It takes patience, so look away now and then and come back.
      </p>
      <Mat className="max-w-xl">
        <Pattern ground={shown.ground} figure={shown.figure} blur={done && view === 'blur'} />
      </Mat>

      {!done ? (
        <>
          <div className="mt-6 flex flex-wrap gap-8">
            <PaperControls name="Ground" paper={ground} onChange={setGround} />
            <PaperControls name="Triangles" paper={figure} onChange={setFigure} />
            <Flicker a={g} b={f} />
          </div>
          {apart > 18 && (
            <p className="mt-4 max-w-2xl text-sm text-muted">
              These hues are far apart and strong. Albers says the effect isn&apos;t possible between very contrasting
              hues. Grey them down or bring the hues closer.
            </p>
          )}
          <Next onClick={() => setDone(true)}>They&apos;ve vanished</Next>
        </>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground" role="status">
            {Math.abs(miss) <= EQUAL
              ? `Equal: within ${Math.abs(miss).toFixed(1)} points of 100. That is as close as an eye gets.`
              : `Not yet equal. Your triangles are ${Math.abs(miss).toFixed(1)} points ${miss > 0 ? 'lighter' : 'darker'} than the ground.`}
          </p>
          <p className="mt-2 text-sm text-muted">
            Albers checked with an after-image, because a camera gets lightness wrong. A screen can measure it, and
            the flicker check is how vision scientists find equal light by eye. In greyscale only lightness is
            left, so any edge you still see there is a lightness difference.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Segmented value={view} options={[...VIEWS]} onChange={setView} />
            <button onClick={() => setFigure({ ...figure, L: figure.L - miss / 100 })} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
              Set them exactly equal
            </button>
            <button onClick={() => setDone(false)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
              Keep adjusting
            </button>
          </div>
        </div>
      )}
    </Step>
  )
}

// A neighbouring, muted pair: hues 20 to 50 degrees apart, the triangles started well off
function freshPair(): { ground: Paper; figure: Paper } {
  const h = Math.random() * 360
  const L = 0.45 + Math.random() * 0.3
  const c = 0.04 + Math.random() * 0.05
  const off = (Math.random() < 0.5 ? -1 : 1) * (0.07 + Math.random() * 0.08)
  return { ground: { h, c, L }, figure: { h: (h + 20 + Math.random() * 30) % 360, c, L: L + off } }
}

const ROUNDS = 3

// The transfer test: new colours, one lightness control, no flicker, no greyscale, no numbers until
// you commit. If the first exercise taught the eye, these land close too.
function FreshPairs() {
  const [pair, setPair] = useState(() => ({ ground: ALBERS.ground, figure: ALBERS.figure }))
  const [L, setL] = useState(ALBERS.figure.L)
  const [results, setResults] = useState<number[]>([])
  const [committed, setCommitted] = useState(false)

  const next = () => {
    const p = freshPair()
    setPair(p)
    setL(p.figure.L)
    setCommitted(false)
  }
  useEffect(next, [])

  const g = hexOf(pair.ground)
  const f = hexOf({ ...pair.figure, L })
  const miss = lightGap(f, g)
  const finished = results.length >= ROUNDS
  const mean = results.length ? results.reduce((s, x) => s + x, 0) / results.length : 0

  return (
    <Step title="By eye alone" quote="As the selection of the papers here demands patience, so their presentation demands skill and cleanliness.">
      <p className="mb-6 max-w-2xl text-muted">
        {ROUNDS} new pairs of neighbouring colours. This time there is no flicker, no greyscale and no number until
        you commit. Only the lightness of the triangles moves.
      </p>
      <Mat className="max-w-xl">
        <Pattern ground={g} figure={f} />
      </Mat>
      {!finished && (
        <div className="mt-6 max-w-sm">
          <Slider label="Lightness of the triangles" value={L} min={0.25} max={0.9} step={0.001} onChange={(v) => !committed && setL(v)} />
        </div>
      )}
      {!committed && !finished ? (
        <Next onClick={() => { setCommitted(true); setResults((r) => [...r, Math.abs(miss)]) }}>
          Pair {results.length + 1} of {ROUNDS}: they&apos;ve vanished
        </Next>
      ) : (
        <div className="mt-6 max-w-2xl" role="status">
          {committed && (
            <p className="text-foreground">
              {Math.abs(miss) <= EQUAL ? 'Equal. ' : ''}
              {Math.abs(miss).toFixed(1)} points {miss > 0 ? 'lighter' : 'darker'} than the ground.
            </p>
          )}
          {finished ? (
            <>
              <p className="mt-2 text-foreground">
                Average gap over {ROUNDS} pairs: {mean.toFixed(1)} points. {mean <= 2 ? 'Your eye has learned this.' : mean <= 4 ? 'Close. Another round will tighten it.' : 'Still loose. Try step 2 again with the flicker check, then come back.'}
              </p>
              <Next onClick={() => { setResults([]); next() }}>Three more pairs</Next>
            </>
          ) : (
            <Next onClick={next}>Next pair</Next>
          )}
        </div>
      )}
    </Step>
  )
}
