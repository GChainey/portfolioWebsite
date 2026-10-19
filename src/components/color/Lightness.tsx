'use client'

import { useEffect, useMemo, useState } from 'react'
import { greyOf, hexToOklch, lightnessOf, oklchToHex } from '@/lib/color'
import { Next, Step } from './parts'

// Chapter V. Which of two colours is darker? Albers' students got 60% wrong. Here every answer is
// measured, then you build a grey scale with even steps, then find the most typical blue.

const PAIRS = 10

interface Pair {
  a: string
  b: string
}

// Two different hues, close in lightness but never equal, and often different in strength
function makePair(): Pair {
  const L = 0.42 + Math.random() * 0.36
  const gap = (0.025 + Math.random() * 0.045) * (Math.random() < 0.5 ? -1 : 1)
  const h = Math.random() * 360
  const make = (l: number, hue: number) => {
    for (let c = 0.05 + Math.random() * 0.17; ; c -= 0.01) {
      const hex = oklchToHex(l, Math.max(0, c), hue)
      // oklchToHex trims chroma to fit, so check the lightness survived the rounding
      if (Math.abs(lightnessOf(hex) - l) < 0.008 || c <= 0) return hex
    }
  }
  return { a: make(L, h), b: make(L + gap, (h + 90 + Math.random() * 180) % 360) }
}

type Vote = 'a' | 'b' | 'unsure'

export function Lightness() {
  return (
    <div className="space-y-20">
      <Darker />
      <GreyScale />
      <Typical />
    </div>
  )
}

function Darker() {
  const [pairs, setPairs] = useState<Pair[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [grey, setGrey] = useState(false)

  useEffect(() => setPairs(Array.from({ length: PAIRS }, makePair)), [])

  const i = votes.length
  const done = pairs.length > 0 && i >= pairs.length
  const darker = (p: Pair): 'a' | 'b' => (lightnessOf(p.a) < lightnessOf(p.b) ? 'a' : 'b')
  const decided = votes.filter((v) => v !== 'unsure').length
  const right = votes.filter((v, j) => v !== 'unsure' && v === darker(pairs[j])).length
  const wrongPct = decided ? Math.round(((decided - right) / decided) * 100) : 0

  const restart = () => {
    setPairs(Array.from({ length: PAIRS }, makePair))
    setVotes([])
    setGrey(false)
  }

  return (
    <Step n={1} title="Which is darker?" quote="We confront them with several pairs of color, from which they are to select and to record which color in a pair is the darker.">
      <p className="mb-6 max-w-2xl text-muted">
        Click the darker of each pair. If you can&apos;t tell, say so. Albers counted not voting as a good answer.
      </p>
      {!done && pairs[i] && (
        <>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted">
            Pair {i + 1} of {pairs.length}
          </p>
          <div className="flex max-w-xl overflow-hidden rounded-sm ring-1 ring-border">
            {(['a', 'b'] as const).map((side) => (
              <button
                key={side}
                onClick={() => setVotes([...votes, side])}
                aria-label={side === 'a' ? 'The left one is darker' : 'The right one is darker'}
                className="aspect-square flex-1 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent"
                style={{ background: pairs[i][side] }}
              />
            ))}
          </div>
          <Next onClick={() => setVotes([...votes, 'unsure'])}>I can&apos;t tell</Next>
        </>
      )}
      {done && (
        <div className="max-w-2xl">
          <p className="text-xl text-foreground">
            {decided === 0
              ? 'You didn’t vote on any of them.'
              : `You got ${right} of ${decided} right, so ${wrongPct}% wrong. Albers' students got 60% wrong.`}
          </p>
          <p className="mt-2 text-sm text-muted">
            {votes.filter((v) => v === 'unsure').length} not sure. Each pair is measured in perceptual lightness, which no
            one could do in 1963. Turn them grey to see what the hues were hiding.
          </p>
          <button onClick={() => setGrey((g) => !g)} className="mt-4 text-sm text-foreground underline underline-offset-4 hover:text-accent">
            {grey ? 'Back to colour' : 'Show them in grey'}
          </button>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {pairs.map((p, j) => {
              const v = votes[j]
              const ok = v === darker(p)
              return (
                <li key={j}>
                  <div className="flex h-14 overflow-hidden rounded-sm ring-1 ring-border">
                    {(['a', 'b'] as const).map((side) => (
                      <div key={side} className="relative flex-1" style={{ background: grey ? greyOf(p[side]) : p[side] }}>
                        {darker(p) === side && <span className="absolute bottom-1 left-1 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" />}
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-muted">{v === 'unsure' ? 'Not sure' : ok ? 'Right' : 'Wrong'}</p>
                </li>
              )
            })}
          </ul>
          <p className="mt-2 text-xs text-muted">The dot marks the darker one.</p>
          <Next onClick={restart}>Ten new pairs</Next>
        </div>
      )}
    </Step>
  )
}

const STEPS = 7

// The middle greys start uneven, the way magazine cutouts come: lots of very light and very dark
function startScale(): number[] {
  const inner = Array.from({ length: STEPS - 2 }, () => 0.15 + Math.random() * 0.75).sort((x, y) => y - x)
  return [1, ...inner, 0]
}
const greyAt = (L: number) => oklchToHex(L, 0, 0)

function GreyScale() {
  const [scale, setScale] = useState<number[]>(() => Array.from({ length: STEPS }, (_, i) => 1 - i / (STEPS - 1)))
  const [checked, setChecked] = useState(false)
  useEffect(() => setScale(startScale()), [])

  const gaps = scale.slice(1).map((L, i) => scale[i] - L)
  const ideal = 1 / (STEPS - 1)
  const unevenness = Math.sqrt(gaps.reduce((s, g) => s + (g - ideal) ** 2, 0) / gaps.length) / ideal
  const score = Math.max(0, Math.round(100 - unevenness * 100))

  const set = (i: number, L: number) => {
    setScale(scale.map((v, j) => (j === i ? L : v)))
    setChecked(false)
  }

  return (
    <Step n={2} title="A grey scale with even steps" quote="The softer the steps appear, and the more equal the steps are, the more valuable and convincing the study. As any lines or empty spaces between the steps interfere with a direct comparison, such separating in-betweens prove nonsensical.">
      <p className="mb-6 max-w-2xl text-muted">
        White and black are fixed. Set the five greys between them so every step looks the same size. The steps touch,
        with no lines between them, as Albers asks.
      </p>
      <div className="flex max-w-2xl overflow-hidden rounded-sm ring-1 ring-border">
        {scale.map((L, i) => (
          <div key={i} className="h-36 flex-1" style={{ background: greyAt(L) }} />
        ))}
      </div>
      <div className="mt-4 flex max-w-2xl">
        {scale.map((L, i) => (
          <div key={i} className="flex flex-1 justify-center">
            {i > 0 && i < STEPS - 1 && (
              <input
                type="range"
                min={0}
                max={1}
                step={0.005}
                value={L}
                onChange={(e) => set(i, +e.target.value)}
                aria-label={`Grey ${i}`}
                className="h-24 w-6 accent-accent [writing-mode:vertical-lr] [direction:rtl]"
              />
            )}
          </div>
        ))}
      </div>
      {!checked ? (
        <Next onClick={() => setChecked(true)}>The steps look even</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">Your scale is {score}% even.</p>
          <p className="mt-2 text-sm text-muted">
            Measured as perceptual lightness. Below, your steps on top, truly even ones underneath.
          </p>
          <div className="mt-4 flex max-w-2xl flex-col overflow-hidden rounded-sm ring-1 ring-border">
            <div className="flex">
              {scale.map((L, i) => (
                <div key={i} className="h-14 flex-1" style={{ background: greyAt(L) }} />
              ))}
            </div>
            <div className="flex">
              {scale.map((_, i) => (
                <div key={i} className="h-14 flex-1" style={{ background: greyAt(1 - i * ideal) }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Step>
  )
}

// Shades and tints of one hue, from pale to deep and muted to strong
function blues(): string[] {
  const cells: string[] = []
  for (let i = 0; i < 16; i++) cells.push(oklchToHex(0.3 + Math.random() * 0.55, 0.04 + Math.random() * 0.2, 245 + (Math.random() - 0.5) * 30))
  return cells
}

function Typical() {
  const [cells, setCells] = useState<string[]>([])
  const [pick, setPick] = useState<string | null>(null)
  useEffect(() => setCells(blues()), [])

  const strongest = useMemo(() => cells.reduce((best, c) => (hexToOklch(c)[1] > hexToOklch(best)[1] ? c : best), cells[0]), [cells])

  return (
    <Step n={3} title="The bluest blue" quote="The exercise in color intensity consists of sorting all possible shades and tints within a hue. From these is chosen the most typical hue (the bluest blue, the greenest green, etc.).">
      <p className="mb-6 max-w-2xl text-muted">Pick the bluest blue. There&apos;s no right answer, which is the point.</p>
      <div className="grid max-w-xl grid-cols-4 gap-2 sm:grid-cols-8" role="radiogroup" aria-label="Blues">
        {cells.map((hex) => (
          <button
            key={hex}
            role="radio"
            aria-checked={pick === hex}
            aria-label={hex}
            onClick={() => setPick(hex)}
            className={`aspect-square rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-accent ${pick === hex ? 'ring-2 ring-foreground' : ''}`}
            style={{ background: hex }}
          />
        ))}
      </div>
      {pick && (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {pick === strongest ? 'You picked the strongest blue, the one with the most colour in it.' : 'You didn’t pick the strongest blue, which is marked below.'}
          </p>
          <p className="mt-2 text-sm text-muted">
            People agree on lighter and darker after some practice. They rarely agree on the most typical colour, because
            strength isn&apos;t the same as typical, and everyone has their own blue.
          </p>
          <div className="mt-4 flex gap-6">
            {[
              { hex: pick, label: 'Yours' },
              { hex: strongest, label: 'The strongest' },
            ].map(({ hex, label }) => (
              <figure key={label}>
                <div className="h-20 w-20 rounded-sm" style={{ background: hex }} />
                <figcaption className="mt-1 text-xs text-muted">{label}</figcaption>
              </figure>
            ))}
          </div>
          <Next
            onClick={() => {
              setCells(blues())
              setPick(null)
            }}
          >
            Another set
          </Next>
        </div>
      )}
    </Step>
  )
}
