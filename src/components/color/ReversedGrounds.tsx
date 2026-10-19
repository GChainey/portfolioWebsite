'use client'

import { useEffect, useState } from 'react'
import { deltaE, hexToOklab, hexToHsv, mixOklab } from '@/lib/color'
import { Next, Segmented, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'
import { Plate, type Study } from './Plate'

// Chapter VI. One colour that looks like the opposite ground on each side: on the light ground it
// reads like the dark one, and on the dark ground like the light one. It only works with the
// colour in the middle, so you hunt for it, then the screen measures where you landed.

const GROUNDS = [
  { id: 'same', label: 'Same hue', left: '#2f5a3a', right: '#a9cf8f' },
  { id: 'different', label: 'Two hues', left: '#5a3d7a', right: '#e3b36b' },
  { id: 'opposite', label: 'Complementary', left: '#c4472f', right: '#2f8a86' },
] as const
type GroundId = (typeof GROUNDS)[number]['id']

const EXAMPLE: Study = { left: '#6b3d8f', right: '#c9a6d9', inner: mixOklab('#6b3d8f', '#c9a6d9') }

// Where a colour sits on the line from a to b: 0 at a, 1 at b, and how far off the line it is
function placeOn(a: string, b: string, x: string) {
  const [p, q, r] = [a, b, x].map(hexToOklab)
  const d = q.map((v, i) => v - p[i])
  const len2 = d.reduce((s, v) => s + v * v, 0)
  const t = d.reduce((s, v, i) => s + v * (r[i] - p[i]), 0) / len2
  return { t, off: deltaE(x, mixOklab(a, b, Math.min(1, Math.max(0, t)))) }
}

export function ReversedGrounds() {
  return (
    <div className="space-y-20">
      <Example />
      <FindTheMiddle />
      <MoveTheGrounds />
    </div>
  )
}

function Example() {
  const [joined, setJoined] = useState(false)
  return (
    <Step n={1} title="Three colours look like two" quote="1 color is to show 2 faces which refer to the 2 colors of the reversed grounds, or, the changed color is to echo the 2 changing ones.">
      <p className="mb-6 max-w-2xl text-muted">
        The small rectangle on the dark violet looks like the light ground, and the one on the light violet looks like
        the dark ground. They are one colour.
      </p>
      <button onClick={() => setJoined((j) => !j)} className="mb-6 text-sm text-foreground underline underline-offset-4 hover:text-accent">
        {joined ? 'Separate them' : 'Join them'}
      </button>
      <Plate study={EXAMPLE} joined={joined} className="max-w-xl" />
    </Step>
  )
}

const startGuess = (): HSV => ({ h: Math.random() * 360, s: 0.1 + Math.random() * 0.3, v: 0.3 + Math.random() * 0.5 })

function FindTheMiddle() {
  const [groundId, setGroundId] = useState<GroundId>('same')
  const g = GROUNDS.find((x) => x.id === groundId)!
  const [guess, setGuess] = useState<HSV>({ h: 0, s: 0.2, v: 0.5 })
  const [done, setDone] = useState(false)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    setGuess(startGuess())
    setDone(false)
    setJoined(false)
  }, [groundId])

  const made = hsvHex(guess)
  const middle = mixOklab(g.left, g.right)
  const { t, off } = placeOn(g.left, g.right, made)

  return (
    <Step n={2} title="Find the middle colour" quote="After repeated trials it must be concluded that the only fitting color is the one which is topologically in the middle of the colors of the 2 grounds.">
      <p className="mb-6 max-w-2xl text-muted">
        Set the small rectangles so that each one looks like the ground on the other side. Most first tries land closer
        to one ground than the other. Complementary grounds are the hardest.
      </p>
      <div className="mb-6">
        <Segmented value={groundId} options={GROUNDS.map(({ id, label }) => ({ id, label }))} onChange={setGroundId} />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-full max-w-md">
          <Plate study={{ left: g.left, right: g.right, inner: made }} joined={joined} />
          <button onClick={() => setJoined((j) => !j)} className="mt-4 text-sm text-foreground underline underline-offset-4 hover:text-accent">
            {joined ? 'Separate them' : 'Join them'}
          </button>
        </div>
        {!done && <Picker value={guess} onChange={setGuess} />}
      </div>
      {!done ? (
        <Next onClick={() => setDone(true)}>Each one echoes the other ground</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {Math.abs(t - 0.5) < 0.07 && off < 6
              ? 'That is very close to the middle.'
              : `Yours sits ${Math.round(Math.min(1, Math.max(0, t)) * 100)}% of the way from the left ground to the right one${off > 6 ? ', and off to one side in hue' : ''}.`}
          </p>
          <Line a={g.left} b={g.right} t={t} made={made} middle={middle} />
          <p className="mt-4 text-sm text-muted">
            The middle is measured in OKLab, halfway between the two grounds in light and in hue. Your colour is{' '}
            {deltaE(made, middle).toFixed(1)} from it.
          </p>
          <Next onClick={() => setGroundId(GROUNDS[(GROUNDS.findIndex((x) => x.id === groundId) + 1) % GROUNDS.length].id)}>Try other grounds</Next>
        </div>
      )}
    </Step>
  )
}

// The two grounds at each end of a line, the true middle and yours placed along it
function Line({ a, b, t, made, middle }: { a: string; b: string; t: number; made: string; middle: string }) {
  const pos = Math.min(1, Math.max(0, t)) * 100
  return (
    <div className="relative mx-4 mt-6 h-16 max-w-xl">
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      {[
        { left: 0, hex: a, label: 'Ground' },
        { left: 100, hex: b, label: 'Ground' },
        { left: 50, hex: middle, label: 'Middle' },
        { left: pos, hex: made, label: 'Yours' },
      ].map((m, i) => (
        <div key={i} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${m.left}%` }}>
          <div className={`h-8 w-8 rounded-sm ${m.label === 'Yours' ? 'ring-2 ring-foreground' : 'ring-1 ring-border'}`} style={{ background: m.hex }} />
          <span className="mt-1 text-[10px] text-muted">{m.label}</span>
        </div>
      ))}
    </div>
  )
}

function MoveTheGrounds() {
  const inner = '#7f8a6a'
  const [left, setLeft] = useState('#3b4a2b')
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv('#e8d9c9'))
  const [measure, setMeasure] = useState(false)
  const right = hsvHex(hsv)
  const { t, off } = placeOn(left, right, inner)

  return (
    <Step n={3} title="Or move a ground" quote="Instead of pushing the in-between color to one or the other side, we must consider changing 1 or both of the grounds, either moving closer to or more distant from the in-between color.">
      <p className="mb-6 max-w-2xl text-muted">
        Here the rectangles are fixed and the light ground is yours. Move it until the small colour sits in the middle.
        Turn on the measure if you want help, after you&apos;ve tried by eye.
      </p>
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {['#3b4a2b', '#2b3a4a', '#4a2b3a'].map((hex) => (
          <button key={hex} onClick={() => setLeft(hex)} aria-label={`Dark ground ${hex}`} className={`h-8 w-8 rounded-sm ${left === hex ? 'ring-2 ring-foreground' : 'ring-1 ring-border'}`} style={{ background: hex }} />
        ))}
        <span className="self-center pl-2 text-muted">The dark ground</span>
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <Plate study={{ left, right, inner }} className="w-full max-w-md" />
        <div className="w-full max-w-xs">
          <Picker value={hsv} onChange={setHsv} />
          <label className="mt-4 flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={measure} onChange={(e) => setMeasure(e.target.checked)} className="accent-accent" />
            Measure it
          </label>
          {measure && (
            <p className="mt-2 max-w-xs text-sm text-foreground">
              The rectangles are {Math.round(Math.min(1, Math.max(0, t)) * 100)}% of the way from the dark ground to yours
              {off > 6 ? `, and ${off.toFixed(0)} off the line in hue` : ''}.
            </p>
          )}
        </div>
      </div>
    </Step>
  )
}
