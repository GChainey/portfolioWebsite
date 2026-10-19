'use client'

import { useEffect, useState } from 'react'
import { averageLight, deltaE, hexToHsv, hexToOklab, mixOklab, multiply, oklabToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'

// Chapter IX. Paper can't be mixed, so the class imagines the mixture and finds a paper for it.
// Put in the right place, an opaque paper reads as two colours seen through each other.
// The screen can also do the mixing for real, so you can compare your imagined mixture with it.

interface Pair {
  a: string
  b: string
}

const PAIRS: { id: string; label: string; pair: Pair }[] = [
  { id: 'blue-yellow', label: 'Blue and yellow', pair: { a: '#2f5fb3', b: '#efd34a' } },
  { id: 'red-blue', label: 'Red and blue', pair: { a: '#c8323a', b: '#3a4fae' } },
  { id: 'black-white', label: 'Black and white', pair: { a: '#1c1c1c', b: '#f4f2ec' } },
  { id: 'pink-ochre', label: 'Pink and ochre', pair: { a: '#e9a3b6', b: '#b98a2e' } },
]

// Albers' placement: parent A as a horizontal band, a vertical strip crossing it. Where the strip
// crosses the band it is the mixture, below the band it is parent B.
export function Overlap({ a, b, c, className = '' }: { a: string; b: string; c: string; className?: string }) {
  return (
    <svg viewBox="0 0 300 260" className={`w-full rounded-sm ring-1 ring-border ${className}`} role="img" aria-label="Two colours overlapping, with their mixture where they cross">
      <rect width="300" height="260" fill="#fbfaf7" />
      <rect x="20" y="30" width="260" height="110" fill={a} />
      <rect x="95" y="30" width="110" height="110" fill={c} />
      <rect x="95" y="140" width="110" height="100" fill={b} />
    </svg>
  )
}

const startGuess = (): HSV => ({ h: Math.random() * 360, s: 0.15, v: 0.55 })

export function Transparence() {
  return (
    <div className="space-y-20">
      <Imagine />
      <Backwards />
    </div>
  )
}

function Imagine() {
  const [pairId, setPairId] = useState(PAIRS[0].id)
  const [guess, setGuess] = useState<HSV>({ h: 0, s: 0.15, v: 0.55 })
  const [done, setDone] = useState(false)
  const { a, b } = PAIRS.find((p) => p.id === pairId)!.pair

  useEffect(() => {
    setGuess(startGuess())
    setDone(false)
  }, [pairId])

  const mine = hsvHex(guess)
  const candidates = [
    { label: 'Yours', hex: mine },
    { label: 'Halfway, as the eye measures', hex: mixOklab(a, b, 0.5) },
    { label: 'Two filters on top of each other', hex: multiply(a, b) },
    { label: 'Two lights averaged', hex: averageLight(a, b) },
  ]
  const nearest = candidates.slice(1).reduce((best, c) => (deltaE(c.hex, mine) < deltaE(best.hex, mine) ? c : best))

  return (
    <Step n={1} title="Imagine the mixture" quote="It is a challenge to study color mixture in our imagination, that is, so to say, with closed eyes.">
      <p className="mb-6 max-w-2xl text-muted">
        Here are two &quot;colour parents&quot;. Set the square where they cross to the colour you think they would make.
        If it&apos;s right, the strip stops looking like three papers and starts to look see-through.
      </p>
      <div className="mb-6">
        <Segmented value={pairId} options={PAIRS.map(({ id, label }) => ({ id, label }))} onChange={setPairId} />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <Overlap a={a} b={b} c={mine} className="max-w-md" />
        {!done && <Picker value={guess} onChange={setGuess} />}
      </div>
      {!done ? (
        <Next onClick={() => setDone(true)}>It looks see-through</Next>
      ) : (
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-6 max-w-2xl text-foreground">
            On paper there is no right answer, only more and less believable ones. The screen can mix them three ways.
            Yours is nearest to &quot;{nearest.label.toLowerCase()}&quot;. Which one reads most as a transparent strip?
          </p>
          <div className="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {candidates.map((c) => (
              <figure key={c.label}>
                <Overlap a={a} b={b} c={c.hex} />
                <figcaption className="mt-2 text-xs text-muted">{c.label}</figcaption>
              </figure>
            ))}
          </div>
          <Next onClick={() => setDone(false)}>Adjust mine</Next>
        </div>
      )}
    </Step>
  )
}

const BACKWARDS = [
  { id: 'green', label: 'A green from blue', a: '#2f5fb3', c: '#5f8f6a' },
  { id: 'violet', label: 'A violet from red', a: '#c8323a', c: '#7a4074' },
  { id: 'grey', label: 'A grey from white', a: '#f4f2ec', c: '#8c8a86' },
]

// The parent that would put c exactly halfway between a and it
function missingParent(a: string, c: string) {
  const p = hexToOklab(a)
  const q = hexToOklab(c)
  return oklabToHex(2 * q[0] - p[0], 2 * q[1] - p[1], 2 * q[2] - p[2])
}

function Backwards() {
  const [id, setId] = useState(BACKWARDS[0].id)
  const task = BACKWARDS.find((t) => t.id === id)!
  const [guess, setGuess] = useState<HSV>(() => hexToHsv('#808080'))
  const [done, setDone] = useState(false)

  useEffect(() => {
    setGuess(startGuess())
    setDone(false)
  }, [id])

  const mine = hsvHex(guess)
  const answer = missingParent(task.a, task.c)
  const miss = deltaE(mine, answer)

  return (
    <Step n={2} title="Work backwards" quote="This invites one to draw conclusions backward, that is, to guess, from a mixture and 1 mixture parent, the other mixture parent.">
      <p className="mb-6 max-w-2xl text-muted">
        Now you have one parent and the mixture. Find the other parent, the strip below the band, so the square looks
        like the two seen through each other.
      </p>
      <div className="mb-6">
        <Segmented value={id} options={BACKWARDS.map(({ id, label }) => ({ id, label }))} onChange={setId} />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <Overlap a={task.a} b={mine} c={task.c} className="max-w-md" />
        {!done && <Picker value={guess} onChange={setGuess} />}
      </div>
      {!done ? (
        <Next onClick={() => setDone(true)}>That&apos;s the other parent</Next>
      ) : (
        <div className="mt-8 border-t border-border pt-6">
          <p className="mb-6 max-w-2xl text-foreground">
            {miss < 6
              ? 'Very close to the parent that puts the mixture exactly halfway.'
              : `The parent that puts the mixture exactly halfway is ${answer}. Yours is ${miss.toFixed(0)} away, so the mixture leans towards ${
                  deltaE(task.c, mine) < deltaE(task.c, task.a) ? 'your parent' : 'the band'
                }.`}
          </p>
          <div className="grid max-w-xl grid-cols-2 gap-4">
            <figure>
              <Overlap a={task.a} b={mine} c={task.c} />
              <figcaption className="mt-2 text-xs text-muted">Yours</figcaption>
            </figure>
            <figure>
              <Overlap a={task.a} b={answer} c={task.c} />
              <figcaption className="mt-2 text-xs text-muted">Exactly halfway</figcaption>
            </figure>
          </div>
          <Next onClick={() => setDone(false)}>Adjust mine</Next>
        </div>
      )}
    </Step>
  )
}
