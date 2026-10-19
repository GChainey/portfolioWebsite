'use client'

import { useEffect, useState } from 'react'
import { deltaE, hexToOklab, hexToHsv, mixOklab, oklchToHex } from '@/lib/color'
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
  { id: 'new', label: 'New grounds', left: '#5a5a5a', right: '#b0b0b0' },
] as const
type GroundId = (typeof GROUNDS)[number]['id']

// The test of a middle: halfway between the grounds in OKLab, and on the line between them
const MIDDLE_T = 0.07
const MIDDLE_OFF = 6
const isMiddle = (t: number, off: number) => Math.abs(t - 0.5) < MIDDLE_T && off < MIDDLE_OFF

// A dark and a light ground in two hues you haven't practised on, to test the skill on its own
function newGrounds() {
  const h = Math.random() * 360
  const h2 = (h + 60 + Math.random() * 120) % 360
  return { left: oklchToHex(0.32 + Math.random() * 0.08, 0.06 + Math.random() * 0.06, h), right: oklchToHex(0.78 + Math.random() * 0.08, 0.05 + Math.random() * 0.06, h2) }
}

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
    <Step title="Three colours look like two" quote="1 color is to show 2 faces which refer to the 2 colors of the reversed grounds, or, the changed color is to echo the 2 changing ones.">
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
  const [fresh, setFresh] = useState<{ left: string; right: string }>(GROUNDS[3])
  const [round, setRound] = useState(0)
  const g = groundId === 'new' ? fresh : GROUNDS.find((x) => x.id === groundId)!
  const [guess, setGuess] = useState<HSV>({ h: 0, s: 0.2, v: 0.5 })
  const [done, setDone] = useState(false)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    if (groundId === 'new') setFresh(newGrounds())
    setGuess(startGuess())
    setDone(false)
    setJoined(false)
  }, [groundId, round])

  const made = hsvHex(guess)
  const middle = mixOklab(g.left, g.right)
  const { t, off } = placeOn(g.left, g.right, made)

  return (
    <Step title="Find the middle colour" quote="After repeated trials it must be concluded that the only fitting color is the one which is topologically in the middle of the colors of the 2 grounds.">
      <p className="mb-6 max-w-2xl text-muted">
        Set the small rectangles so that each one looks like the ground on the other side. Most first tries land closer
        to one ground than the other. Complementary grounds are the hardest. When you can do the three, try new grounds:
        hues you haven&apos;t seen, with no help.
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
            {isMiddle(t, off)
              ? 'That is the middle. Each rectangle should now echo the ground across from it.'
              : `Yours sits ${Math.round(Math.min(1, Math.max(0, t)) * 100)}% of the way from the left ground to the right one${off > 6 ? ', and off to one side in hue' : ''}.`}
          </p>
          <Line a={g.left} b={g.right} t={t} made={made} middle={middle} />
          <p className="mt-4 text-sm text-muted">
            The middle is measured in OKLab, halfway between the two grounds in light and in hue. Your colour is{' '}
            {deltaE(made, middle).toFixed(1)} from it. It counts as the middle within {Math.round(MIDDLE_T * 100)}% of halfway
            and {MIDDLE_OFF} off the line.
          </p>
          {groundId === 'new' ? (
            <Next onClick={() => setRound((r) => r + 1)}>New grounds again</Next>
          ) : (
            <Next onClick={() => setGroundId(GROUNDS[(GROUNDS.findIndex((x) => x.id === groundId) + 1) % GROUNDS.length].id)}>Try other grounds</Next>
          )}
        </div>
      )}
    </Step>
  )
}

// The two grounds at each end of a line, the true middle and yours placed along it
function Line({ a, b, t, made, middle, label = 'Yours' }: { a: string; b: string; t: number; made: string; middle: string; label?: string }) {
  const pos = Math.min(1, Math.max(0, t)) * 100
  return (
    <div className="relative mx-4 mt-6 h-16 max-w-xl">
      <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
      {[
        { left: 0, hex: a, label: 'Ground' },
        { left: 100, hex: b, label: 'Ground' },
        { left: 50, hex: middle, label: 'Middle' },
        { left: pos, hex: made, label },
      ].map((m, i) => (
        <div key={i} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${m.left}%` }}>
          <div className={`h-8 w-8 rounded-sm ${i === 3 ? 'ring-2 ring-foreground' : 'ring-1 ring-border'}`} style={{ background: m.hex }} />
          <span className="mt-1 text-[10px] text-muted">{m.label}</span>
        </div>
      ))}
    </div>
  )
}

const SIDES = [
  { id: 'left', label: 'Dark ground' },
  { id: 'right', label: 'Light ground' },
] as const
type Side = (typeof SIDES)[number]['id']

// Albers lets the student change one ground or both when no paper sits in the middle
function MoveTheGrounds() {
  const inner = '#7f8a6a'
  const [grounds, setGrounds] = useState({ left: '#3b4a2b', right: '#e8d9c9' })
  const [side, setSide] = useState<Side>('right')
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv('#e8d9c9'))
  const [done, setDone] = useState(false)
  const { left, right } = grounds
  const { t, off } = placeOn(left, right, inner)

  const choose = (next: Side) => {
    setSide(next)
    setHsv(hexToHsv(grounds[next]))
  }
  const change = (next: HSV) => {
    setHsv(next)
    setGrounds((g) => ({ ...g, [side]: hsvHex(next) }))
    setDone(false)
  }

  return (
    <Step title="Or move the grounds" quote="Instead of pushing the in-between color to one or the other side, we must consider changing 1 or both of the grounds, either moving closer to or more distant from the in-between color.">
      <p className="mb-6 max-w-2xl text-muted">
        Here the rectangles are fixed and both grounds are yours. Move one or both until the small colour sits in the
        middle and echoes each ground on the other side. Judge it by eye first, then check.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <Plate study={{ left, right, inner }} className="w-full max-w-md" />
        <div className="w-full max-w-xs">
          <div className="mb-4">
            <Segmented value={side} options={[...SIDES]} onChange={choose} />
          </div>
          <Picker value={hsv} onChange={change} />
        </div>
      </div>
      {!done ? (
        <Next onClick={() => setDone(true)}>It sits in the middle</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {isMiddle(t, off)
              ? 'It does. The rectangles are halfway between your grounds.'
              : `The rectangles are ${Math.round(Math.min(1, Math.max(0, t)) * 100)}% of the way from the dark ground to the light one${off > MIDDLE_OFF ? `, and ${off.toFixed(0)} off the line in hue` : ''}. ${
                  t < 0.5 ? 'Move the dark ground further away, or the light one closer.' : 'Move the light ground further away, or the dark one closer.'
                }`}
          </p>
          <Line a={left} b={right} t={t} made={inner} middle={mixOklab(left, right)} label="Rectangles" />
        </div>
      )}
    </Step>
  )
}
