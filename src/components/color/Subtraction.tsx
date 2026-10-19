'use client'

import { useEffect, useState } from 'react'
import { deltaE, hexToHsv, hexToOklab, oklabToHex, oklchToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'
import { Plate } from './Plate'

// Chapter VII. A ground takes its own hue and light away from the colours on it. Three reds lose one
// of their number on a matching ground. Then you use that to make two different colours look alike.

const SETS = {
  reds: ['#d2452c', '#b5263e', '#8c1d28'],
  light: ['#f1d9c4', '#e6e0b8', '#d6e3cf'],
  dark: ['#3b2a3f', '#2a3b45', '#3e3324'],
}
type SetId = keyof typeof SETS

const GROUNDS = [
  { id: 'white', label: 'White', hex: '#f6f4ee' },
  { id: 'red', label: 'Another red', hex: '#e0603e' },
  { id: '0', label: 'Same as the first', hex: SETS.reds[0] },
  { id: '1', label: 'Same as the second', hex: SETS.reds[1] },
  { id: '2', label: 'Same as the third', hex: SETS.reds[2] },
] as const
type GroundId = (typeof GROUNDS)[number]['id']

export function Subtraction() {
  return (
    <div className="space-y-20">
      <ThreeReds />
      <AnyGround />
      <LookAlike />
    </div>
  )
}

function Samples({ ground, colors, className = '' }: { ground: string; colors: string[]; className?: string }) {
  return (
    <div className={`flex aspect-[2/1] items-center justify-center gap-[6%] rounded-sm ring-1 ring-border ${className}`} style={{ background: ground }}>
      {colors.map((hex, i) => (
        <div key={i} className="aspect-square w-[14%]" style={{ background: hex }} />
      ))}
    </div>
  )
}

function ThreeReds() {
  const [groundId, setGroundId] = useState<GroundId>('white')
  const ground = GROUNDS.find((g) => g.id === groundId)!
  return (
    <Step n={1} title="Three reds" quote="When placed on a red ground equal to 1 of the 3 samples, only 2 of the reds will “show,” and the lost one is absorbed, subtracted.">
      <p className="mb-6 max-w-2xl text-muted">
        On white they are all just red. On another red their differences show. On a ground the same as one of them, that
        one disappears.
      </p>
      <div className="mb-6">
        <Segmented value={groundId} options={GROUNDS.map(({ id, label }) => ({ id, label }))} onChange={setGroundId} />
      </div>
      <Samples ground={ground.hex} colors={SETS.reds} className="max-w-xl" />
    </Step>
  )
}

const SET_OPTIONS: { id: SetId; label: string }[] = [
  { id: 'reds', label: 'Reds' },
  { id: 'light', label: 'Light colours' },
  { id: 'dark', label: 'Dark colours' },
]

function AnyGround() {
  const [setId, setSetId] = useState<SetId>('light')
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv('#f3efe6'))
  return (
    <Step n={2} title="Any ground" quote="Any ground subtracts its own hue from colors which it carries and therefore influences.">
      <p className="mb-6 max-w-2xl text-muted">
        Move the ground and watch it pull its own hue and its own light out of the samples. Light samples on a light
        ground run together, and so do dark ones on a dark ground.
      </p>
      <div className="mb-6">
        <Segmented value={setId} options={SET_OPTIONS} onChange={setSetId} />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <Samples ground={hsvHex(hsv)} colors={SETS[setId]} className="w-full max-w-md" />
        <Picker value={hsv} onChange={setHsv} />
      </div>
    </Step>
  )
}

// A rough model of simultaneous contrast: a ground pushes the colour on it away from itself, in light
// and in hue. Good enough to say whether two colours have been brought closer together.
const PUSH = 0.35
function apparent(color: string, ground: string): string {
  const c = hexToOklab(color)
  const g = hexToOklab(ground)
  const [L, a, b] = c.map((v, i) => v + PUSH * (v - g[i]))
  return oklabToHex(Math.min(1, Math.max(0, L)), a, b)
}

const PAIR = { a: '#9a8670', b: '#7c8a86' }
const START = '#d9d6cf'
const EDIT = [
  { id: 'left', label: 'Left ground' },
  { id: 'right', label: 'Right ground' },
] as const
type Side = (typeof EDIT)[number]['id']

// Alike enough: the model says the difference you see has shrunk to under half
const ALIKE = 0.5

// Two grounds that, in the model, make a and b look the same: their difference has to be
// (1 + PUSH) / PUSH times the difference between a and b. Scaled down until both fit the screen.
function solution(a: string, b: string) {
  const p = hexToOklab(a)
  const q = hexToOklab(b)
  const k = (1 + PUSH) / PUSH
  const fits = (lab: number[]) => {
    const hex = oklabToHex(lab[0], lab[1], lab[2])
    const back = hexToOklab(hex)
    return Math.hypot(...back.map((v, i) => v - lab[i])) < 0.01
  }
  for (let scale = 1; scale > 0.2; scale -= 0.05) {
    const mid = p.map((v, i) => (v + q[i]) / 2)
    const half = p.map((v, i) => ((v - q[i]) * k * scale) / 2)
    const left = mid.map((v, i) => v + half[i])
    const right = mid.map((v, i) => v - half[i])
    if (fits(left) && fits(right)) return { left: oklabToHex(left[0], left[1], left[2]), right: oklabToHex(right[0], right[1], right[2]) }
  }
  return { left: START, right: START }
}

// Two colours you haven't practised on, different in light and in hue
function newPair() {
  const L = 0.55 + Math.random() * 0.15
  const h = Math.random() * 360
  return { a: oklchToHex(L + 0.04, 0.05, h), b: oklchToHex(L - 0.04, 0.05, (h + 140 + Math.random() * 80) % 360) }
}

function LookAlike() {
  const [pair, setPair] = useState(PAIR)
  const [round, setRound] = useState(0)
  const [grounds, setGrounds] = useState({ left: START, right: START })
  const [side, setSide] = useState<Side>('left')
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(START))
  const [joined, setJoined] = useState(false)
  const [done, setDone] = useState(false)

  // A new pair has to wait for the browser, or the server and client disagree
  useEffect(() => {
    if (round === 0) return
    setPair(newPair())
    setGrounds({ left: START, right: START })
    setHsv(hexToHsv(START))
    setDone(false)
  }, [round])

  const choose = (s: Side) => {
    setSide(s)
    setHsv(hexToHsv(grounds[s]))
  }
  const change = (next: HSV) => {
    setHsv(next)
    setGrounds((g) => ({ ...g, [side]: hsvHex(next) }))
  }
  const showSolution = () => {
    const g = solution(pair.a, pair.b)
    setGrounds(g)
    setHsv(hexToHsv(g[side]))
  }

  // On any one shared ground the difference reads the same, so that is the baseline
  const actual = deltaE(apparent(pair.a, START), apparent(pair.b, START))
  const seen = deltaE(apparent(pair.a, grounds.left), apparent(pair.b, grounds.right))
  const alike = seen < actual * ALIKE

  return (
    <Step n={3} title="Make two colours look alike" quote="Still more exciting is the next task, the reverse of the first: to make 2 different colors look alike.">
      <p className="mb-6 max-w-2xl text-muted">
        {round === 0
          ? 'The left rectangle is a warm, lighter grey. The right one is a cool, darker grey.'
          : 'A new pair. One is a little lighter than the other, and they differ in hue.'}{' '}
        Give each a ground that takes away what makes it different. A warm ground takes warmth away. A dark ground makes
        a colour look lighter.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-full max-w-md">
          <Plate study={{ left: grounds.left, right: grounds.right, inner: pair.a }} rightInner={pair.b} joined={joined} />
          <button onClick={() => setJoined((j) => !j)} className="mt-4 text-sm text-foreground underline underline-offset-4 hover:text-accent">
            {joined ? 'Separate them' : 'Join them'}
          </button>
        </div>
        <div className="w-full max-w-[22rem]">
          <div className="mb-4">
            <Segmented value={side} options={[...EDIT]} onChange={choose} />
          </div>
          <Picker value={hsv} onChange={change} />
        </div>
      </div>
      {!done ? (
        <Next onClick={() => setDone(true)}>They look alike</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            On one shared ground the two look about {actual.toFixed(1)} apart. On your grounds they look about {seen.toFixed(1)} apart
            {seen < actual - 0.1 ? `, ${Math.round((1 - seen / actual) * 100)}% closer.` : seen > actual + 0.1 ? ', further apart than before.' : ', no closer than before.'}{' '}
            {alike ? 'That counts as alike.' : `To count as alike, get it under ${(actual * ALIKE).toFixed(1)}.`}
          </p>
          <p className="mt-2 text-sm text-muted">
            This uses a rough model of contrast, in which each ground pushes its colour away from itself by about a third. Your eye
            is the real judge. Join the rectangles to see the difference that is still there.
          </p>
          <div className="mt-6 flex max-w-sm gap-3 bg-[#808080] p-3">
            {[
              { hex: pair.a, label: 'Left' },
              { hex: pair.b, label: 'Right' },
            ].map(({ hex, label }) => (
              <figure key={label} className="flex-1">
                <div className="h-16" style={{ background: hex }} />
                <figcaption className="mt-1 text-xs text-white">{label}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">The two side by side on a neutral grey.</p>
          <div className="flex flex-wrap gap-x-4">
            <Next onClick={() => setDone(false)}>Keep adjusting</Next>
            <Next onClick={showSolution}>Show one solution</Next>
            <Next onClick={() => setRound((r) => r + 1)}>Try a new pair</Next>
          </div>
        </div>
      )}
    </Step>
  )
}
