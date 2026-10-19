'use client'

import { useEffect, useState } from 'react'
import { Reorder } from 'framer-motion'
import { hexToOklch, lightnessOf, oklchToHex } from '@/lib/color'
import { Next, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'
import { Plate } from './Plate'

// Chapter XXI. Warm and cool are readings, not measurements. First sort some colours by
// temperature and compare with a number the screen can compute, then watch one violet change
// temperature with its neighbour, then rate colours on Albers' other polarities.

// A rough, measurable stand-in for warmth: how far a colour leans to orange rather than blue,
// times how much colour it has. Albers would say this is a fact, and temperature a reading.
const warmth = (hex: string) => {
  const [, C, h] = hexToOklch(hex)
  return C * Math.cos(((h - 50) * Math.PI) / 180)
}

const SET = [
  oklchToHex(0.62, 0.2, 28),
  oklchToHex(0.8, 0.15, 85),
  oklchToHex(0.55, 0.14, 300),
  oklchToHex(0.6, 0.13, 150),
  oklchToHex(0.5, 0.15, 260),
  oklchToHex(0.72, 0.16, 55),
  oklchToHex(0.65, 0.09, 200),
  oklchToHex(0.48, 0.17, 350),
]

function shuffle<T>(a: T[]): T[] {
  const out = [...a]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function Temperature() {
  return (
    <div className="space-y-20">
      <Sort />
      <WithinHue />
      <Neighbours />
      <Polarities />
    </div>
  )
}

function Sort() {
  const [order, setOrder] = useState(SET)
  const [done, setDone] = useState(false)
  useEffect(() => setOrder(shuffle(SET)), [])

  const move = (i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrder(next)
  }
  const measured = [...SET].sort((a, b) => warmth(b) - warmth(a))
  const agree = order.filter((h, i) => Math.abs(measured.indexOf(h) - i) <= 1).length

  return (
    <Step n={1} title="Warm to cool" quote="As any temperature can be read higher or lower in comparison with other temperatures, these qualifications are only relative.">
      <p className="mb-6 max-w-2xl text-muted">
        Put these eight colours in order, warmest at the top. Drag them, or use the arrows. The green and the violet are
        the hard ones. Albers calls them temperature neutrals.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <Reorder.Group axis="y" values={order} onReorder={(o) => { setOrder(o); setDone(false) }} className="w-full max-w-xs space-y-2">
          {order.map((hex, i) => (
            <Reorder.Item key={hex} value={hex} className="flex cursor-grab items-center gap-2 active:cursor-grabbing">
              <div className="h-10 flex-1 rounded-sm ring-1 ring-border" style={{ background: hex }} />
              <button onClick={() => move(i, -1)} aria-label={`Move colour ${i + 1} warmer`} className="px-2 text-muted hover:text-accent">↑</button>
              <button onClick={() => move(i, 1)} aria-label={`Move colour ${i + 1} cooler`} className="px-2 text-muted hover:text-accent">↓</button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
        {done && (
          <div className="w-full max-w-xs">
            <p className="mb-2 text-sm text-muted">Measured, warmest first</p>
            <div className="space-y-2">
              {measured.map((hex) => (
                <div key={hex} className="flex h-10 items-center justify-end rounded-sm px-3 text-xs ring-1 ring-border" style={{ background: hex, color: lightnessOf(hex) > 0.68 ? '#111' : '#fff' }}>
                  {order.indexOf(hex) === measured.indexOf(hex) ? 'same place' : `you: ${order.indexOf(hex) + 1}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {!done ? (
        <Next onClick={() => setDone(true)}>That&apos;s my order</Next>
      ) : (
        <p className="mt-8 max-w-2xl text-foreground">
          {agree} of 8 are within one place of the measurement. The measurement only asks how far each hue leans towards
          orange or blue. It can&apos;t ask how a colour feels, which is why Albers says theories of temperature end in
          personal beliefs.
        </p>
      )}
    </Step>
  )
}

// Four reds and four blues, each family running from leaning one way to leaning the other.
// The painter's convention: a red leaning to orange is warm, one leaning to blue is cool; a blue
// leaning to violet (towards red) is warm, one leaning to green is cool.
const FAMILIES = [
  { name: 'reds', ask: 'the coolest red', hues: [40, 28, 15, 0], answer: 3, why: 'leans towards blue' },
  { name: 'blues', ask: 'the warmest blue', hues: [215, 235, 255, 280], answer: 3, why: 'leans towards red' },
] as const

function WithinHue() {
  const [orders, setOrders] = useState<number[][]>(FAMILIES.map((f) => f.hues.map((_, i) => i)))
  const [picks, setPicks] = useState<(number | null)[]>([null, null])
  useEffect(() => setOrders(FAMILIES.map((f) => shuffle(f.hues.map((_, i) => i)))), [])
  const done = picks.every((p) => p !== null)

  return (
    <Step n={2} title="Warm blues and cool reds" quote="Therefore, there are also warm blues and cool reds possible within their own hues.">
      <p className="mb-6 max-w-2xl text-muted">
        Temperature works inside a single hue too. In each row, choose {FAMILIES.map((f) => f.ask).join(' and ')}.
      </p>
      <div className="space-y-6">
        {FAMILIES.map((f, r) => (
          <div key={f.name}>
            <p className="mb-2 text-sm text-foreground">Choose {f.ask}</p>
            <div className="flex max-w-md gap-2">
              {orders[r].map((i) => {
                const hex = oklchToHex(0.55, 0.17, f.hues[i])
                const chosen = picks[r] === i
                const answer = done && i === f.answer
                return (
                  <button
                    key={i}
                    onClick={() => !done && setPicks((p) => p.map((x, j) => (j === r ? i : x)))}
                    aria-label={`${f.name} ${orders[r].indexOf(i) + 1}`}
                    aria-pressed={chosen}
                    className={`h-16 flex-1 rounded-sm ring-offset-2 ring-offset-background ${chosen ? 'ring-2 ring-accent' : 'ring-1 ring-border'}`}
                    style={{ background: hex }}
                  >
                    {answer && <span className="text-xs text-white">this one</span>}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {done && (
        <p className="mt-8 max-w-2xl text-foreground" role="status">
          {FAMILIES.map((f, r) => (picks[r] === f.answer ? `Your ${f.ask.replace('the ', '')} ${f.why}, as painters read it.` : `Painters would pick the one that ${f.why}.`)).join(' ')}{' '}
          Every red here is a red and every blue a blue. Temperature is how each one leans compared with the others.
        </p>
      )}
    </Step>
  )
}

function Neighbours() {
  const [inner, setInner] = useState<HSV>({ h: 285, s: 0.35, v: 0.6 })
  const [vote, setVote] = useState<'left' | 'right' | 'same' | null>(null)
  const study = { left: oklchToHex(0.55, 0.2, 28), right: oklchToHex(0.5, 0.15, 260), inner: hsvHex(inner) }

  return (
    <Step n={3} title="A violet with two temperatures" quote="But when these temperature indicators, red and blue, are combined with color neutrals, as whites, blacks, and greys, and with their mixtures, particularly in mixtures with the temperature neutrals green and violet, then personal interpretations of temperatures may easily become disparate.">
      <p className="mb-6 max-w-2xl text-muted">
        The two small rectangles are the same violet. One sits on red, the other on blue. Which one feels warmer?
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <Plate study={study} className="w-full max-w-md" />
        {vote && <Picker value={inner} onChange={setInner} />}
      </div>
      {!vote ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Next onClick={() => setVote('left')}>The one on red</Next>
          <Next onClick={() => setVote('right')}>The one on blue</Next>
          <Next onClick={() => setVote('same')}>They feel the same</Next>
        </div>
      ) : (
        <div className="mt-8 max-w-2xl">
          <p className="text-foreground">
            {vote === 'right'
              ? 'That fits the after-image. Next to blue the violet shows its red, so it reads warm.'
              : vote === 'left'
                ? 'The after-image predicts the other one. Next to red the violet shows its blue, so it should read cool.'
                : 'The after-image predicts the one on blue reads warmer, because next to blue the violet shows its red.'}
          </p>
          <p className="mt-2 text-sm text-muted">
            Change the violet with the picker. Move it towards red or blue and see where it stops changing sides.
          </p>
        </div>
      )}
    </Step>
  )
}

const POLES = [
  ['warm', 'cool'],
  ['light', 'heavy'],
  ['soft', 'hard'],
  ['wet', 'dry'],
  ['early', 'late'],
] as const

const SAMPLES = [oklchToHex(0.85, 0.06, 220), oklchToHex(0.45, 0.12, 40), oklchToHex(0.7, 0.14, 130)]

function Polarities() {
  const [ratings, setRatings] = useState<number[][]>(SAMPLES.map(() => POLES.map(() => 0.5)))
  const [done, setDone] = useState(false)
  const heaviest = ratings.map((r) => r[1]).indexOf(Math.max(...ratings.map((r) => r[1])))
  const darkest = SAMPLES.map(lightnessOf).indexOf(Math.min(...SAMPLES.map(lightnessOf)))
  const set = (c: number, p: number, v: number) => setRatings((r) => r.map((row, i) => (i === c ? row.map((x, j) => (j === p ? v : x)) : row)))

  return (
    <Step n={4} title="Humidity in colour" quote="Light-dark and light-heavy lead easily to soft-hard comparisons; or, quick-slow and early-late connect with young-old, and with warm-cool, as well as with wet-dry.">
      <p className="mb-6 max-w-2xl text-muted">
        Place each colour between the two words of each pair. There are no right answers here. Afterwards you&apos;ll
        see which of your readings follow the one thing the screen can measure, light.
      </p>
      <div className="grid gap-8 md:grid-cols-3">
        {SAMPLES.map((hex, c) => (
          <div key={hex}>
            <div className="mb-4 h-24 rounded-sm ring-1 ring-border" style={{ background: hex }} />
            {POLES.map(([a, b], p) => (
              <label key={a} className="mb-3 block text-xs text-muted">
                <span className="flex justify-between">
                  <span>{a}</span>
                  <span>{b}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={ratings[c][p]}
                  onChange={(e) => set(c, p, +e.target.value)}
                  aria-label={`Colour ${c + 1}, ${a} to ${b}`}
                  className="block w-full accent-accent"
                />
              </label>
            ))}
            {done && (
              <p className="text-xs text-muted">
                Lightness {Math.round(lightnessOf(hex) * 100)}. You put it {Math.round(ratings[c][1] * 100)}% of the way to heavy.
              </p>
            )}
          </div>
        ))}
      </div>
      {!done ? (
        <Next onClick={() => setDone(true)}>Done</Next>
      ) : (
        <p className="mt-8 max-w-2xl text-foreground">
          {heaviest === darkest
            ? 'Your heaviest colour is also the darkest one measured, so light to heavy followed lightness.'
            : 'Your heaviest colour is not the darkest one measured, so for you weight came from something other than light.'}{' '}
          Albers says these chains of polarities start from light-dark and warm-cool, and end in readings people argue
          about.
        </p>
      )}
    </Step>
  )
}
