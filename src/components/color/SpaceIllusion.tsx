'use client'

import { useEffect, useState } from 'react'
import { deltaE, hexToHsv, hexToOklch, lightnessOf, mixOklab, oklchToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'
import { Overlap } from './Transparence'

// Chapter XI. A mixture that leans towards one parent makes that parent look in front. The one
// mixture that leans towards neither, the middle mixture, sits flat in the plane. Albers measured
// it with bar diagrams on the blackboard. Here the diagram draws itself from the colours.

const PAIRS = [
  { id: 'yellow-blue', label: 'Yellow and blue', a: '#f0d55a', b: '#2f4f9e' },
  { id: 'pink-green', label: 'Pink and green', a: '#f0b2bf', b: '#2f6f4a' },
  { id: 'white-red', label: 'White and red', a: '#f5f1e8', b: '#a3262c' },
]

export function SpaceIllusion() {
  return (
    <div className="space-y-20">
      <OnTop />
      <Middle />
      <Grid />
    </div>
  )
}

// Albers' diagram: the lighter parent as the top bar, the darker as the bottom one, and the
// mixture between them, placed by how light it is.
function Bars({ a, b, c }: { a: string; b: string; c: string }) {
  const [la, lb, lc] = [a, b, c].map(lightnessOf)
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
  // Rounded so the server and the browser draw the same thing
  const y = (l: number) => Math.round(12 + (1 - (l - lo) / Math.max(hi - lo, 0.001)) * 96)
  return (
    <svg viewBox="0 0 160 120" className="w-40" role="img" aria-label="The mixture placed between its parents by lightness">
      <line x1="80" y1="4" x2="80" y2="116" stroke="currentColor" className="text-border" strokeDasharray="2 3" />
      {[
        { l: la, hex: a },
        { l: lb, hex: b },
      ].map((p, i) => (
        <rect key={i} x="20" y={y(p.l) - 5} width="120" height="10" fill={p.hex} stroke="currentColor" className="text-border" />
      ))}
      <rect x="35" y={Math.min(Math.max(y(lc), 4), 116) - 5} width="90" height="10" fill={c} stroke="currentColor" className="text-foreground" strokeWidth="1.5" />
      <line x1="10" y1="60" x2="150" y2="60" stroke="currentColor" className="text-muted" strokeWidth="0.5" />
    </svg>
  )
}

function OnTop() {
  const [pairId, setPairId] = useState(PAIRS[0].id)
  const [t, setT] = useState(0.3)
  const { a, b, label } = PAIRS.find((p) => p.id === pairId)!
  const c = mixOklab(a, b, t)
  const [nameA, nameB] = label.toLowerCase().split(' and ')

  const reading =
    Math.abs(t - 0.5) < 0.06
      ? 'Neither. The square sits flat, as a colour of its own.'
      : t < 0.5
        ? `The ${nameA} band. The mixture belongs to it, so it reads as in front of the ${nameB} strip.`
        : `The ${nameB} strip. The mixture belongs to it, so it reads as lying over the ${nameA} band.`

  return (
    <Step title="Which one is on top?" quote="When 1 color is read as appearing above or below another in the transparence studies, a third deception is recognized: space-illusion.">
      <p className="mb-6 max-w-2xl text-muted">
        Slide the mixture from one parent to the other. Watch the edges of the square. The softer edge joins it to a
        parent, the harder edge separates it, and the colours seem to stack in space.
      </p>
      <div className="mb-6">
        <Segmented value={pairId} options={PAIRS.map(({ id, label }) => ({ id, label }))} onChange={setPairId} />
      </div>
      <div className="flex flex-wrap items-center gap-8">
        <Overlap a={a} b={b} c={c} className="max-w-md" />
        <Bars a={a} b={b} c={c} />
      </div>
      <label className="mt-6 block max-w-md text-sm text-muted">
        <span className="mb-2 flex justify-between capitalize">
          <span>{nameA}</span>
          <span>{nameB}</span>
        </span>
        <input type="range" min={0} max={1} step={0.01} value={t} onChange={(e) => setT(Number(e.target.value))} aria-label="Where the mixture sits between its parents" className="w-full accent-accent" />
      </label>
      <p className="mt-4 max-w-2xl text-foreground">What reads as on top: {reading}</p>
    </Step>
  )
}

// A parent moved lighter or darker by `d`, keeping its hue and chroma
function shift(hex: string, d: number) {
  const [L, C, h] = hexToOklch(hex)
  return oklchToHex(Math.min(0.97, Math.max(0.08, L + d)), C, h)
}

// How evenly a mixture sits between its parents: equal distance overall, and halfway in light
function measure(a: string, b: string, c: string) {
  const toA = deltaE(c, a)
  const toB = deltaE(c, b)
  const [la, lb, lc] = [a, b, c].map(lightnessOf)
  const at = (la - lc) / (la - lb || 0.001)
  const balance = Math.abs(toA - toB) / Math.max(toA + toB, 0.001)
  return { toA, toB, at, balance, middle: balance < 0.12 && at > 0.4 && at < 0.6 }
}

// A pair nobody has seen before, for the transfer round: two hues well apart, one light, one dark
function randomPair() {
  const h = Math.random() * 360
  return {
    id: 'new',
    label: 'New pair',
    a: oklchToHex(0.78 + Math.random() * 0.1, 0.1, h),
    b: oklchToHex(0.32 + Math.random() * 0.12, 0.12, (h + 90 + Math.random() * 180) % 360),
  }
}

function Middle() {
  const [pair, setPair] = useState(PAIRS[1])
  const [guess, setGuess] = useState<HSV>({ h: 0, s: 0.2, v: 0.5 })
  const [moveA, setMoveA] = useState(0)
  const [moveB, setMoveB] = useState(0)
  const [done, setDone] = useState(false)
  const [rounds, setRounds] = useState<{ label: string; middle: boolean }[]>([])

  useEffect(() => {
    // Start near one parent, never near the answer: a random grey can land on the middle by chance
    setGuess(hexToHsv(mixOklab(pair.a, pair.b, Math.random() < 0.5 ? 0.15 : 0.85)))
    setMoveA(0)
    setMoveB(0)
    setDone(false)
  }, [pair])

  const a = shift(pair.a, moveA)
  const b = shift(pair.b, moveB)
  const c = hsvHex(guess)
  const m = measure(a, b, c)
  const middle = mixOklab(a, b, 0.5)
  const lighterIsA = lightnessOf(a) > lightnessOf(b)
  // Which way the mixture leans in light: towards the lighter parent means it is too light
  const tooLight = lighterIsA ? m.at < 0.5 : m.at > 0.5

  const commit = () => {
    setDone(true)
    setRounds((r) => [...r, { label: pair.label, middle: m.middle }])
  }

  return (
    <Step title="Find the middle mixture" quote="Since the middle mixture presupposes equidistance from the color parents, it therefore depends equally upon the absence of any predominance of the color parents.">
      <p className="mb-6 max-w-2xl text-muted">
        Now choose the mixture yourself. Aim for the one that belongs to neither parent, so both edges look equally
        hard and the square looks flat. Albers&apos; class often couldn&apos;t find the right paper, so he had them move
        the parents instead. You can do both.
      </p>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Segmented value={pair.id} options={PAIRS.map(({ id, label }) => ({ id, label }))} onChange={(id) => setPair(PAIRS.find((p) => p.id === id)!)} />
        <button onClick={() => setPair(randomPair())} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
          A pair you haven&apos;t seen
        </button>
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <Overlap a={a} b={b} c={c} className="max-w-md" />
        {!done ? (
          <div className="w-full max-w-xs space-y-5">
            <Picker value={guess} onChange={setGuess} />
            {[
              { label: 'Top parent', value: moveA, set: setMoveA },
              { label: 'Bottom parent', value: moveB, set: setMoveB },
            ].map((s) => (
              <label key={s.label} className="block text-sm text-muted">
                <span className="mb-1 flex justify-between">
                  <span className="text-foreground">{s.label}</span>
                  <span>{s.value === 0 ? 'as given' : s.value > 0 ? 'lighter' : 'darker'}</span>
                </span>
                <input type="range" min={-0.15} max={0.15} step={0.01} value={s.value} onChange={(e) => s.set(Number(e.target.value))} aria-label={`${s.label}: lighter or darker`} className="w-full accent-accent" />
              </label>
            ))}
          </div>
        ) : (
          <Bars a={a} b={b} c={c} />
        )}
      </div>
      {!done ? (
        <Next onClick={commit}>That&apos;s the middle</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {m.middle
              ? `A middle mixture. It is ${m.toA.toFixed(0)} from one parent and ${m.toB.toFixed(0)} from the other, and ${Math.round(m.at * 100)}% of the way in light.`
              : `Not yet the middle. It is ${m.toA.toFixed(0)} from the top parent and ${m.toB.toFixed(0)} from the bottom one, and ${Math.round(m.at * 100)}% of the way from top to bottom in light. ${
                  Math.abs(m.at - 0.5) < 0.1 ? 'The light is right, so the hue leans.' : `It is too ${tooLight ? 'light' : 'dark'}: choose a ${tooLight ? 'darker' : 'lighter'} middle, or move the ${tooLight ? 'lighter' : 'darker'} parent ${tooLight ? 'up' : 'down'} so the gap evens out.`
                }`}
          </p>
          <p className="mt-2 text-sm text-muted">
            The diagram is Albers&apos; blackboard check: your mixture is the outlined bar, placed by its light between the
            two parents. A middle mixture sits on the centre line. The measure: equal distance to both parents within
            12%, and between 40% and 60% of the way in light.
          </p>
          <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
            <figure>
              <Overlap a={a} b={b} c={c} />
              <figcaption className="mt-2 text-xs text-muted">Yours</figcaption>
            </figure>
            <figure>
              <Overlap a={a} b={b} c={middle} />
              <figcaption className="mt-2 text-xs text-muted">The measured middle</figcaption>
            </figure>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6">
            <Next onClick={() => setDone(false)}>Adjust mine</Next>
            <Next onClick={() => setPair(randomPair())}>Try a pair you haven&apos;t seen</Next>
          </div>
          {rounds.length > 1 && (
            <p className="mt-6 text-sm text-muted" data-testid="rounds">
              {rounds.filter((r) => r.middle).length} of {rounds.length} tries found the middle.
            </p>
          )}
        </div>
      )}
    </Step>
  )
}

const YELLOW = '#efcf3a'
const VERTICALS = ['#2f8a55', '#6b4a9a', '#c8353a']
// How much of the yellow each horizontal row keeps where it crosses: Albers' plate XI-3 has yellow
// in front at the top, behind at the bottom, and the middle mixture in between.
const ALBERS_ROWS = [0.75, 0.5, 0.25]
const ROWS = [
  { id: 'top', label: 'Top row' },
  { id: 'middle', label: 'Middle row' },
  { id: 'bottom', label: 'Bottom row' },
]

function Grid() {
  const [rows, setRows] = useState(ALBERS_ROWS)
  const x = (i: number) => 50 + i * 80
  const y = (j: number) => 55 + j * 75

  return (
    <Step title="Yellow in front, behind, and level" quote="Such a differentiation makes us read the top yellow stripe in front of the vertical stripes, and the bottom yellow behind the vertical stripes.">
      <p className="mb-6 max-w-2xl text-muted">
        In Albers&apos; plate XI-3, three yellow stripes cross three others. Each crossing is a mixture. Set how much
        yellow each row keeps. More yellow brings the yellow forward, less sends it behind. At the middle you can read
        it either way.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <svg viewBox="0 0 300 300" className="w-full max-w-md rounded-sm ring-1 ring-border" role="img" aria-label="Three yellow stripes crossing green, violet and red stripes">
          <rect width="300" height="300" fill="#fbfaf7" />
          {rows.map((_, j) => (
            <rect key={`h${j}`} x="20" y={y(j)} width="260" height="40" fill={YELLOW} />
          ))}
          {VERTICALS.map((hex, i) => (
            <rect key={`v${i}`} x={x(i)} y="20" width="40" height="260" fill={hex} />
          ))}
          {rows.map((keep, j) =>
            VERTICALS.map((hex, i) => <rect key={`${i}${j}`} x={x(i)} y={y(j)} width="40" height="40" fill={mixOklab(hex, YELLOW, keep)} />),
          )}
        </svg>
        <div className="w-full max-w-xs space-y-5">
          {ROWS.map((r, j) => (
            <label key={r.id} className="block text-sm text-muted">
              <span className="mb-1 flex justify-between">
                <span className="text-foreground">{r.label}</span>
                <span>{Math.round(rows[j] * 100)}% yellow</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={rows[j]}
                onChange={(e) => setRows((rs) => rs.map((v, k) => (k === j ? Number(e.target.value) : v)))}
                aria-label={`${r.label}: how much yellow the crossings keep`}
                className="w-full accent-accent"
              />
            </label>
          ))}
          <button onClick={() => setRows(ALBERS_ROWS)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
            Back to Albers&apos; plate
          </button>
        </div>
      </div>
    </Step>
  )
}
