'use client'

import { useEffect, useState } from 'react'
import { averageLight, deltaE, hexToHsv, hexToOklab, mixOklab, multiply, oklabToHex, oklchToHex } from '@/lib/color'
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
  { id: 'new', label: 'New pair', pair: { a: '#2f5fb3', b: '#efd34a' } },
]

// Where c sits on the straight line from a to b in OKLab: t is how far along (0 at a, 1 at b),
// off is how far c strays from the line, in the same units as deltaE.
export function between(a: string, b: string, c: string) {
  const p = hexToOklab(a)
  const q = hexToOklab(b)
  const r = hexToOklab(c)
  const d = q.map((v, i) => v - p[i])
  const e = r.map((v, i) => v - p[i])
  const len2 = d.reduce((s, v) => s + v * v, 0) || 1e-9
  const t = d.reduce((s, v, i) => s + v * e[i], 0) / len2
  const off = Math.sqrt(e.reduce((s, v, i) => s + (v - t * d[i]) ** 2, 0)) * 100
  return { t, off }
}

// A crossing reads as see-through when it lies between its parents and not off to one side
const T_MIN = 0.15
const T_MAX = 0.85
const OFF_MAX = 5
export const seeThrough = ({ t, off }: { t: number; off: number }) => t >= T_MIN && t <= T_MAX && off <= OFF_MAX

function newPair(): Pair {
  const h = Math.random() * 360
  const h2 = (h + 90 + Math.random() * 180) % 360
  const dark = Math.random() < 0.5
  return {
    a: oklchToHex(dark ? 0.45 : 0.8, 0.12, h),
    b: oklchToHex(dark ? 0.8 : 0.45, 0.12, h2),
  }
}

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
  const [fresh, setFresh] = useState<Pair>(PAIRS[0].pair)
  const [round, setRound] = useState(0)
  const { a, b } = pairId === 'new' ? fresh : PAIRS.find((p) => p.id === pairId)!.pair

  useEffect(() => {
    if (pairId === 'new') setFresh(newPair())
    setGuess(startGuess())
    setDone(false)
  }, [pairId, round])

  const mine = hsvHex(guess)
  const candidates = [
    { label: 'Yours', hex: mine },
    { label: 'Halfway, as the eye measures', hex: mixOklab(a, b, 0.5) },
    { label: 'Two filters on top of each other', hex: multiply(a, b) },
    { label: 'Two lights averaged', hex: averageLight(a, b) },
  ]
  const nearest = candidates.slice(1).reduce((best, c) => (deltaE(c.hex, mine) < deltaE(best.hex, mine) ? c : best))
  const place = between(a, b, mine)
  const passes = seeThrough(place)
  const lean = place.t < 0.4 ? 'the band' : place.t > 0.6 ? 'the strip' : 'neither parent'

  return (
    <Step title="Imagine the mixture" quote="It is a challenge to study color mixture in our imagination, that is, so to say, with closed eyes.">
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
          <p className="mb-4 max-w-2xl text-foreground" data-testid="transparence-result">
            {passes
              ? `Yours sits between the two parents, ${Math.round(place.t * 100)}% of the way from the band to the strip and ${place.off.toFixed(0)} off the line, so it can read as one seen through the other. It leans towards ${lean}.`
              : place.off > OFF_MAX
                ? `Yours is ${place.off.toFixed(0)} off the line between the parents. To read as see-through, keep it under ${OFF_MAX}, so it is made only of the two parents.`
                : `Yours is ${Math.round(place.t * 100)}% of the way from the band to the strip. To read as see-through, keep it between ${T_MIN * 100}% and ${T_MAX * 100}%, or it looks like one of the parents.`}
          </p>
          <p className="mb-6 max-w-2xl text-muted">
            On paper there is more than one believable answer. The screen can mix them three ways. Yours is nearest to
            &quot;{nearest.label.toLowerCase()}&quot;. Which one reads most as a transparent strip?
          </p>
          <div className="grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {candidates.map((c) => (
              <figure key={c.label}>
                <Overlap a={a} b={b} c={c.hex} />
                <figcaption className="mt-2 text-xs text-muted">{c.label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="flex flex-wrap gap-4">
            <Next onClick={() => setDone(false)}>Adjust mine</Next>
            <Next onClick={() => { setPairId('new'); setRound((r) => r + 1) }}>Try a new pair</Next>
          </div>
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
    <Step title="Work backwards" quote="This invites one to draw conclusions backward, that is, to guess, from a mixture and 1 mixture parent, the other mixture parent.">
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
