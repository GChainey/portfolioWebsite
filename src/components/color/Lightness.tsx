'use client'

import { useEffect, useMemo, useState } from 'react'
import { greyOf, hexToOklch, hexToRgb, lightnessOf, oklchToHex } from '@/lib/color'
import { Next, Step } from './parts'

// Chapter V. Which of two colours is darker? Albers' students got 60% wrong. Here every answer is
// measured, then you build a grey scale with even steps, then sort the shades of one blue and place the most typical.

const PAIRS = 10

interface Pair {
  a: string
  b: string
}

// CIE L*, the lightness the darkroom and Munsell's "value" measure, from luminance
function lstar(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    c /= 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const Y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y
}

// Two different hues, close in lightness but never equal, and often different in strength. A pair
// only counts if two measures of lightness, OKLab and CIE L*, agree on which is darker by a clear
// margin, so the answer key can't be argued with.
function makePair(): Pair {
  for (;;) {
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
    const pair = { a: make(L, h), b: make(L + gap, (h + 90 + Math.random() * 180) % 360) }
    const ok = Math.sign(lightnessOf(pair.a) - lightnessOf(pair.b))
    const lab = lstar(pair.a) - lstar(pair.b)
    if (ok !== 0 && Math.sign(lab) === ok && Math.abs(lab) >= 2) return pair
  }
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
  // The pairs you couldn't call, or called wrong: Albers' "colors about which we cannot say immediately"
  const hard = done ? pairs.filter((p, j) => votes[j] === 'unsure' || votes[j] !== darker(p)) : []

  const restart = () => {
    setPairs(Array.from({ length: PAIRS }, makePair))
    setVotes([])
    setGrey(false)
  }

  return (
    <Step title="Which is darker?" quote="We confront them with several pairs of color, from which they are to select and to record which color in a pair is the darker.">
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
          {hard.length > 0 && <AfterImageCheck pairs={hard} />}
          <Next onClick={restart}>Ten new pairs</Next>
        </div>
      )}
    </Step>
  )
}

const STARE_S = 20

// Albers' tie-breaker for a pair you can't call. One sheet covers the corner of the other. Stare at
// the covering corner, then the top sheet is lifted. If the uncovered patch looks lighter than the
// rest of the bottom sheet, the top sheet was the darker one. Then the sheets swap and you look
// again, because often only one of the two orders shows it.
function AfterImageCheck({ pairs }: { pairs: Pair[] }) {
  const [which, setWhich] = useState(0)
  const [swapped, setSwapped] = useState(false)
  const [phase, setPhase] = useState<'ready' | 'staring' | 'lifted'>('ready')
  const [left, setLeft] = useState(STARE_S)
  const [answers, setAnswers] = useState<('top' | 'bottom' | 'none')[]>([])

  const pair = pairs[which % pairs.length]
  const [bottom, top] = swapped ? [pair.b, pair.a] : [pair.a, pair.b]
  const topIsDarker = lightnessOf(top) < lightnessOf(bottom)

  useEffect(() => {
    if (phase !== 'staring') return
    if (left <= 0) {
      setPhase('lifted')
      return
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, left])

  const start = () => {
    setLeft(STARE_S)
    setPhase('staring')
  }
  const answer = (a: 'lighter' | 'darker' | 'same') => {
    setAnswers([...answers, a === 'lighter' ? 'top' : a === 'darker' ? 'bottom' : 'none'])
    setPhase('ready')
    setSwapped((v) => !v)
  }
  const verdicts = answers.map((a, i) => {
    // Answers alternate between the two orders: b on top first, then a
    const onTop = i % 2 === 0 ? 'b' : 'a'
    const underneath = onTop === 'a' ? 'b' : 'a'
    if (a === 'none') return null
    const darkerSaid = a === 'top' ? onTop : underneath
    return darkerSaid === (lightnessOf(pair.a) < lightnessOf(pair.b) ? 'a' : 'b')
  })

  return (
    <div className="mt-12 max-w-2xl border-t border-border pt-8">
      <h3 className="mb-2 text-lg text-foreground">Settle a hard pair with an after-image</h3>
      <blockquote className="mb-4 font-serif italic leading-relaxed text-muted">
        Focus longer than the eye wants to on the covering corner of the upper paper and then quickly remove this upper
        sheet. If the area now appears lighter, then the upper paper is the darker, and vice versa.
      </blockquote>
      <p className="mb-6 text-sm text-muted">
        This is one of the {pairs.length} {pairs.length === 1 ? 'pair' : 'pairs'} you couldn&apos;t call or called wrong.
        Stare at the dot for {STARE_S} seconds without moving your eyes. The screen lifts the top sheet for you.
      </p>
      <div className="inline-block bg-[#808080] p-6">
        <div className="relative h-64 w-64" style={{ background: bottom }}>
          {phase !== 'lifted' && <div className="absolute bottom-0 right-0 h-[55%] w-[55%]" style={{ background: top }} />}
          <span className="absolute left-[45%] top-[45%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black ring-1 ring-white" />
        </div>
      </div>
      <div className="mt-4" aria-live="polite">
        {phase === 'ready' && answers.length < 2 && (
          <Next onClick={start}>{answers.length ? 'Swap the sheets and stare again' : `Start the ${STARE_S} seconds`}</Next>
        )}
        {phase === 'staring' && <p className="text-sm text-muted">Keep looking at the dot. {left}</p>}
        {phase === 'lifted' && (
          <div>
            <p className="mb-3 text-foreground">Does the patch that was covered look lighter or darker than the rest?</p>
            <div className="flex flex-wrap gap-3">
              {(['lighter', 'darker', 'same'] as const).map((a) => (
                <button key={a} onClick={() => answer(a)} className="rounded border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent">
                  {a === 'same' ? 'I see no difference' : `It looks ${a}`}
                </button>
              ))}
            </div>
          </div>
        )}
        {answers.length === 2 && phase === 'ready' && (
          <div>
            <p className="text-foreground">
              {verdicts.every((v) => v === null)
                ? 'Neither order showed you a difference.'
                : verdicts.some((v) => v === false)
                  ? 'At least one order pointed you the wrong way.'
                  : verdicts.every((v) => v === true)
                    ? 'Both orders pointed you to the darker one.'
                    : 'One order pointed you to the darker one. Albers found that often only one does.'}
            </p>
            <p className="mt-2 text-sm text-muted">
              Measured, the {topIsDarker ? 'colour now on top' : 'colour now underneath'} is the darker one by{' '}
              {Math.abs(lstar(pair.a) - lstar(pair.b)).toFixed(1)} points of lightness out of 100.
            </p>
            {pairs.length > 1 && (
              <Next
                onClick={() => {
                  setWhich((w) => w + 1)
                  setAnswers([])
                  setSwapped(false)
                }}
              >
                Another hard pair
              </Next>
            )}
          </div>
        )}
      </div>
    </div>
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
    <Step title="A grey scale with even steps" quote="The softer the steps appear, and the more equal the steps are, the more valuable and convincing the study. As any lines or empty spaces between the steps interfere with a direct comparison, such separating in-betweens prove nonsensical.">
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
            Measured as perceptual lightness. Below, your steps on top, measured even ones underneath.
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

const TONES = 8

// Shades and tints of one blue, from pale to deep and muted to strong. Each tone is at least 0.05
// apart in OKLab lightness from its neighbours, and CIE L* agrees on the order, so the sort has
// one right answer.
function blues(): string[] {
  for (;;) {
    const Ls = Array.from({ length: TONES }, (_, i) => 0.3 + (i / (TONES - 1)) * 0.6 + (Math.random() - 0.5) * 0.03)
    const cells = Ls.map((L) => oklchToHex(L, 0.03 + Math.random() * 0.2, 255 + (Math.random() - 0.5) * 12))
    const byOk = [...cells].sort((x, y) => lightnessOf(y) - lightnessOf(x))
    const byL = [...cells].sort((x, y) => lstar(y) - lstar(x))
    const spaced = byOk.slice(1).every((c, i) => lightnessOf(byOk[i]) - lightnessOf(c) >= 0.05)
    if (spaced && byOk.every((c, i) => c === byL[i]) && new Set(cells).size === TONES) return shuffle(cells)
  }
}

function shuffle<T>(xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Albers' exercise in two parts: sort the shades and tints of one hue by lightness, which has an
// answer, then place the most typical one within the row, which is taste.
function Typical() {
  const [cells, setCells] = useState<string[]>([])
  const [row, setRow] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [pick, setPick] = useState<string | null>(null)
  useEffect(() => setCells(blues()), [])

  const key = useMemo(() => [...cells].sort((x, y) => lightnessOf(y) - lightnessOf(x)), [cells])
  const placed = row.filter((c, i) => c === key[i]).length
  const sorted = checked && placed === TONES
  const strongest = useMemo(() => cells.reduce((best, c) => (hexToOklch(c)[1] > hexToOklch(best)[1] ? c : best), cells[0]), [cells])
  const left = cells.filter((c) => !row.includes(c))

  const restart = () => {
    setCells(blues())
    setRow([])
    setChecked(false)
    setPick(null)
  }

  return (
    <Step title="Sort the blues, then find the bluest" quote="The exercise in color intensity consists of sorting all possible shades and tints within a hue. From these is chosen the most typical hue (the bluest blue, the greenest green, etc.) and it is placed within the group accordingly.">
      <p className="mb-6 max-w-2xl text-muted">
        First sort these {TONES} blues from lightest to darkest. Click them in order. Some are strong and some are
        muted, which makes it harder.
      </p>
      <div className="max-w-xl bg-[#808080] p-4">
        <div className="grid grid-cols-8 gap-2" aria-label="Blues to sort">
          {cells.map((hex) => (
            <button
              key={hex}
              onClick={() => setRow([...row, hex])}
              disabled={row.includes(hex) || checked}
              aria-label={`Place ${hex}`}
              className={`aspect-square rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-accent ${row.includes(hex) ? 'opacity-0' : ''}`}
              style={{ background: hex }}
            />
          ))}
        </div>
        <ol className="mt-4 grid grid-cols-8 gap-2" aria-label="Your order, lightest first">
          {Array.from({ length: TONES }, (_, i) => {
            const hex = row[i]
            const wrong = checked && hex !== key[i]
            return (
              <li key={i}>
                <button
                  onClick={() => (sorted && hex ? setPick(hex) : !checked && hex && setRow(row.slice(0, i)))}
                  disabled={!hex || (checked && !sorted)}
                  aria-label={hex ? (sorted ? `Choose ${hex} as the bluest` : `Take back ${hex}`) : `Place ${i + 1}`}
                  className={`relative block aspect-square w-full rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-accent ${hex ? '' : 'border border-dashed border-white/50'} ${pick === hex && hex ? 'ring-2 ring-white' : ''}`}
                  style={{ background: hex }}
                >
                  {wrong && <span className="absolute inset-x-0 bottom-0 h-1 bg-black" />}
                </button>
              </li>
            )
          })}
        </ol>
        <p className="mt-2 text-xs text-white">Lightest on the left. Click a placed blue to take it and the ones after it back.</p>
      </div>

      {!checked ? (
        <Next onClick={() => setChecked(true)} disabled={left.length > 0}>
          That&apos;s my order
        </Next>
      ) : !sorted ? (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {placed} of {TONES} in the right place. The ones marked with a bar are out of order.
          </p>
          <p className="mt-2 text-sm text-muted">The measured order, lightest first:</p>
          <div className="mt-2 flex max-w-xl gap-2 bg-[#808080] p-3">
            {key.map((hex) => (
              <div key={hex} className="h-10 flex-1" style={{ background: hex }} />
            ))}
          </div>
          <Next onClick={() => { setRow([]); setChecked(false) }}>Sort them again</Next>
        </div>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">All {TONES} in the right order. Now click the bluest blue in your row.</p>
          {pick && (
            <>
              <p className="mt-4 text-foreground">
                Yours sits {ordinal(key.indexOf(pick) + 1)} from the light end.{' '}
                {pick === strongest ? 'It is also the strongest, the one with the most colour in it.' : `The strongest sits ${ordinal(key.indexOf(strongest) + 1)}.`}
              </p>
              <p className="mt-2 text-sm text-muted">
                The order has one right answer. The bluest blue doesn&apos;t. People agree on lighter and darker after some
                practice, and rarely on the most typical colour, because strength isn&apos;t the same as typical.
              </p>
            </>
          )}
          <Next onClick={restart}>Another set</Next>
        </div>
      )}
    </Step>
  )
}

const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`
