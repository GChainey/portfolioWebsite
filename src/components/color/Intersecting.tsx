'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { deltaE, hexToHsv, lightnessOf, mixOklab } from '@/lib/color'
import { Next, Segmented, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'

// Chapter XV. A light red, a dark red and the middle red between them, as three overlapping sheets.
// Pull the dark sheet back and the strip of middle red widens until it splits into two colours,
// each half echoing the parent on the opposite side.

const PAIRS = [
  { id: 'red', label: 'Reds', light: '#e9a2a6', dark: '#7c1426' },
  { id: 'green', label: 'Greens', light: '#b9d7a3', dark: '#24502c' },
  { id: 'opposed', label: 'Orange and blue', light: '#f0b46a', dark: '#2a4f8a' },
] as const
type PairId = (typeof PAIRS)[number]['id']

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n))

// Light sheet on the left, middle sheet over it, dark sheet over that. `strip` is the share of the
// width where the middle shows.
function Sheets({ light, middle, dark, strip, onStrip }: { light: string; middle: string; dark: string; strip: number; onStrip?: (v: number) => void }) {
  const box = useRef<HTMLDivElement>(null)
  const start = 0.3
  const edge = start + strip

  const move = (e: PointerEvent) => {
    if (!onStrip) return
    const r = box.current!.getBoundingClientRect()
    onStrip(clamp((e.clientX - r.left) / r.width - start, 0.02, 0.6))
  }
  const keys = (e: KeyboardEvent) => {
    const d = { ArrowLeft: -0.02, ArrowRight: 0.02 }[e.key]
    if (!d || !onStrip) return
    e.preventDefault()
    onStrip(clamp(strip + d, 0.02, 0.6))
  }

  return (
    <div ref={box} className="relative h-56 w-full touch-none select-none overflow-hidden rounded-sm ring-1 ring-border sm:h-72" style={{ background: light }}>
      <div className="absolute inset-y-0" style={{ left: `${start * 100}%`, right: 0, background: middle }} />
      <div className="absolute inset-y-0 right-0" style={{ left: `${edge * 100}%`, background: dark }} />
      {onStrip && (
        <div
          role="slider"
          tabIndex={0}
          aria-label="Pull the dark sheet"
          aria-valuemin={2}
          aria-valuemax={60}
          aria-valuenow={Math.round(strip * 100)}
          onKeyDown={keys}
          onPointerDown={(e) => {
            ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
            move(e)
          }}
          onPointerMove={(e) => e.buttons && move(e)}
          className="absolute inset-y-0 w-10 -translate-x-1/2 cursor-ew-resize outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ left: `${edge * 100}%` }}
        >
          <span className="absolute left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow" />
        </div>
      )}
    </div>
  )
}

export function Intersecting() {
  return (
    <div className="space-y-20">
      <PullTheSheet />
      <FindTheMiddle />
      <Fluting />
    </div>
  )
}

function PullTheSheet() {
  const [pairId, setPairId] = useState<PairId>('red')
  const [strip, setStrip] = useState(0.04)
  const pair = PAIRS.find((p) => p.id === pairId)!
  const middle = mixOklab(pair.light, pair.dark)

  return (
    <Step n={1} title="Pull the dark sheet" quote="Then, very slowly, pull the dark sheet to the right, gradually making the narrow strip of the middle red wider.">
      <p className="mb-6 max-w-2xl text-muted">
        The middle colour here is exactly halfway between the other two. Drag the edge of the dark sheet to the right,
        slowly, and keep your eyes on the strip. As it widens it stops looking like one colour. Its left side darkens
        next to the light sheet and its right side lightens next to the dark one.
      </p>
      <div className="mb-6">
        <Segmented value={pairId} options={[...PAIRS]} onChange={setPairId} />
      </div>
      <div className="max-w-2xl">
        <Sheets light={pair.light} middle={middle} dark={pair.dark} strip={strip} onStrip={setStrip} />
      </div>
      <blockquote className="mt-6 max-w-2xl font-serif text-lg italic leading-relaxed text-muted">
        By staring at the middle red, observe that the wider it grows, the more it appears not as 1 but as 2 colors.
      </blockquote>
    </Step>
  )
}

function FindTheMiddle() {
  const pair = PAIRS[0]
  const truth = mixOklab(pair.light, pair.dark)
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(mixOklab(pair.light, pair.dark, 0.25)))
  const [done, setDone] = useState(false)

  // Start somewhere off the middle, toward one parent or the other. Random, so it waits for the browser.
  useEffect(() => setHsv(hexToHsv(mixOklab(pair.light, pair.dark, Math.random() < 0.5 ? 0.2 : 0.8))), [pair.light, pair.dark])
  const yours = hsvHex(hsv)

  // Where yours sits on the way from light to dark, by lightness: 0 is the light parent, 1 the dark
  const L1 = lightnessOf(pair.light)
  const L2 = lightnessOf(pair.dark)
  const at = (L1 - lightnessOf(yours)) / (L1 - L2)
  const miss = deltaE(yours, truth)

  return (
    <Step n={2} title="Find the middle yourself" quote="A true middle mixture is distinguished by being equidistant—in light and in hue—from either mixture parent.">
      <p className="mb-6 max-w-2xl text-muted">
        Choose the red for the middle sheet. Albers&apos; test: in a true middle, the two halves of the strip look
        equally strong. If the strip mostly looks like one of the parents, your red leans toward that parent.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-full max-w-md">
          <Sheets light={pair.light} middle={yours} dark={pair.dark} strip={0.4} />
        </div>
        {!done && <Picker value={hsv} onChange={setHsv} />}
      </div>
      {!done ? (
        <Next onClick={() => setDone(true)}>That&apos;s the middle</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            Your red is {Math.round(clamp(at, -1, 2) * 100)}% of the way from the light red to the dark one.{' '}
            {miss < 3 ? 'That is a true middle.' : at < 0.45 ? 'The light parent dominates.' : at > 0.55 ? 'The dark parent dominates.' : 'Right in light, but the hue has drifted.'}
          </p>
          <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
            <figure>
              <Sheets light={pair.light} middle={yours} dark={pair.dark} strip={0.4} />
              <figcaption className="mt-2 text-sm text-muted">Yours</figcaption>
            </figure>
            <figure>
              <Sheets light={pair.light} middle={truth} dark={pair.dark} strip={0.4} />
              <figcaption className="mt-2 text-sm text-muted">The measured middle, {truth}</figcaption>
            </figure>
          </div>
          <Next onClick={() => setDone(false)}>Try again</Next>
        </div>
      )}
    </Step>
  )
}

function Fluting() {
  const [steps, setSteps] = useState(5)
  const [pairId, setPairId] = useState<PairId>('red')
  const pair = PAIRS.find((p) => p.id === pairId)!
  // Light outside, dark in the middle, like the reproduction XV-2
  const ramp = Array.from({ length: steps }, (_, i) => mixOklab(pair.light, pair.dark, i / (steps - 1)))
  const bands = [...ramp, ...ramp.slice(0, -1).reverse()]

  return (
    <Step n={3} title="The fluted column" quote="This direct reading of the mixture constituents leads us to a new deception: an illusion of volume.">
      <p className="mb-6 max-w-2xl text-muted">
        Every band below is flat. Each one sits between a lighter and a darker neighbour, so each one splits like the
        strip did, and together they look curved, like the grooves of a Doric column. A screen can make the steps
        exactly even, which a stack of papers rarely can.
      </p>
      <div className="mb-6 flex flex-wrap items-end gap-8">
        <Segmented value={pairId} options={[...PAIRS]} onChange={setPairId} />
        <label className="flex w-56 flex-col gap-1 text-sm text-muted">
          {steps} steps
          <input type="range" min={3} max={9} value={steps} onChange={(e) => setSteps(+e.target.value)} className="accent-[var(--accent)]" />
        </label>
      </div>
      <div role="img" aria-label="Flat bands stepping from light to dark and back" className="flex h-64 max-w-2xl overflow-hidden rounded-sm ring-1 ring-border">
        {bands.map((hex, i) => (
          <div key={i} className="flex-1" style={{ background: hex }} />
        ))}
      </div>
    </Step>
  )
}
