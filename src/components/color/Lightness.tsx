'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ALBERS_DARKER_TEST } from '@/content/color'
import { averageGrey, cieLightness, greyOf, hexToHsv, hexToOklch, inkOn, lightnessOf, oklchToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'

// Chapter V. Which of two colours is darker, when they are different hues. A test scored against
// Albers' classes, his after-image trick for the pairs you can't decide, a pair of your own for a
// shared collection, and the start of his grey ladders.

type Pair = [string, string]

// Each pair is two different hues about 0.03 apart in OKLab lightness, never equal, and CIE L*
// puts every one in the same order. Darker first; the test shuffles sides.
const PAIRS: Pair[] = [
  ['#376ceb', '#bb6802'],
  ['#de3d30', '#4b9f50'],
  ['#8951bf', '#238b8b'],
  ['#c57fa6', '#aea536'],
  ['#d84497', '#839770'],
  ['#9a4729', '#466f98'],
  ['#82c5a8', '#f5a3b5'],
  ['#8d1a1e', '#2249b7'],
]

const shuffle = <T,>(xs: T[]) => {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const darkerSide = ([a, b]: Pair) => (lightnessOf(a) < lightnessOf(b) ? 0 : 1)
const fmtL = (hex: string) => lightnessOf(hex).toFixed(2)

function PairSwatch({ pair, onPick, className = '', show = (hex: string) => hex }: { pair: Pair; onPick?: (side: 0 | 1) => void; className?: string; show?: (hex: string) => string }) {
  return (
    <div className={`flex overflow-hidden rounded-sm ring-1 ring-border ${className}`}>
      {pair.map((hex, i) =>
        onPick ? (
          <button
            key={i}
            onClick={() => onPick(i as 0 | 1)}
            aria-label={i ? 'The right one is darker' : 'The left one is darker'}
            className="aspect-square flex-1 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
            style={{ background: show(hex) }}
          />
        ) : (
          <div key={i} className="aspect-square flex-1" style={{ background: show(hex) }} />
        )
      )}
    </div>
  )
}

export function Lightness() {
  const [missed, setMissed] = useState<number[]>([])
  return (
    <div className="space-y-20">
      <WhichIsDarker onDone={setMissed} />
      <AfterImage missed={missed} />
      <YourPair />
      <GreyLadder />
    </div>
  )
}

type Answer = 0 | 1 | 'skip'
type Shown = { index: number; pair: Pair }

const VIEWS = [
  { id: 'colour', label: 'Colour' },
  { id: 'filter', label: 'Desaturate filter' },
  { id: 'lightness', label: 'Measured lightness' },
] as const
type View = (typeof VIEWS)[number]['id']

function WhichIsDarker({ onDone }: { onDone: (missed: number[]) => void }) {
  const [shown, setShown] = useState<Shown[]>(() => PAIRS.map((pair, index) => ({ index, pair })))
  const [answers, setAnswers] = useState<Answer[]>([])
  const [view, setView] = useState<View>('colour')

  // Order and sides are random, which has to wait for the browser or server and client disagree
  const deal = useCallback(() => {
    setShown(shuffle(PAIRS.map((pair, index) => ({ index, pair: (Math.random() < 0.5 ? pair : [pair[1], pair[0]]) as Pair }))))
    setAnswers([])
    setView('colour')
  }, [])
  useEffect(deal, [deal])

  const done = answers.length === shown.length
  const answer = (a: Answer) => {
    const next = [...answers, a]
    setAnswers(next)
    if (next.length === shown.length) onDone(shown.filter((s, i) => next[i] !== darkerSide(s.pair)).map((s) => s.index))
  }

  const right = answers.filter((a, i) => a === darkerSide(shown[i].pair)).length
  const skipped = answers.filter((a) => a === 'skip').length
  const wrong = answers.length - right - skipped
  const decided = right + wrong
  const current = shown[answers.length]

  return (
    <Step n={1} title="Which is darker?" quote="If one is not able to distinguish the difference between a higher tone and a lower tone, one probably should not make music.">
      <p className="mb-6 max-w-2xl text-muted">
        {shown.length} pairs, each of two different hues. One colour in every pair is darker, because Albers never
        uses equal light intensity, so there is always an answer. The darker one is the heavier one, with more black
        or less white. If you&apos;re in doubt, don&apos;t vote. Albers encourages it.
      </p>

      {!done && current ? (
        <>
          <p className="mb-3 text-xs uppercase tracking-widest text-muted">
            Pair {answers.length + 1} of {shown.length}
          </p>
          <PairSwatch pair={current.pair} onPick={answer} className="max-w-xl" />
          <div className="mt-6 flex flex-wrap gap-3">
            {(
              [
                [0, 'Left is darker'],
                [1, 'Right is darker'],
                ['skip', "I can't tell"],
              ] as const
            ).map(([a, label]) => (
              <button
                key={label}
                onClick={() => answer(a)}
                className="rounded border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">Or click the one you think is darker.</p>
        </>
      ) : (
        <div className="max-w-3xl border-t border-border pt-6">
          <p className="text-foreground">
            You got {right} right and {wrong} wrong, and didn&apos;t vote on {skipped}.
            {decided > 0 && ` That is ${Math.round((right / decided) * 100)}% right, not counting the pairs you left.`}
          </p>
          {decided === 0 && (
            <p className="mt-2 text-sm text-muted">You abstained on every pair. Albers says not voting can have a positive meaning.</p>
          )}
          <Score you={decided > 0 ? Math.round((right / decided) * 100) : null} />

          <div className="mt-10 mb-4 flex flex-wrap items-center gap-4">
            <Segmented value={view} options={VIEWS} onChange={setView} />
          </div>
          <ViewNote view={view} />
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
            {shown.map((s, i) => {
              const dark = darkerSide(s.pair)
              const a = answers[i]
              const filterFlips = (lightnessOf(averageGrey(s.pair[0])) < lightnessOf(averageGrey(s.pair[1])) ? 0 : 1) !== dark
              return (
                <figure key={s.index}>
                  <PairSwatch pair={s.pair} show={view === 'filter' ? averageGrey : view === 'lightness' ? greyOf : undefined} />
                  <figcaption className="mt-2 text-xs">
                    <span className="block text-foreground">
                      {dark ? 'Right' : 'Left'} is darker. {a === 'skip' ? 'You left it.' : a === dark ? 'You got it.' : 'You missed it.'}
                    </span>
                    <span className="block font-mono text-muted">
                      L {fmtL(s.pair[0])} · {fmtL(s.pair[1])}
                    </span>
                    {view === 'filter' && filterFlips && <span className="block text-accent">The filter flips it</span>}
                  </figcaption>
                </figure>
              )
            })}
          </div>
          <blockquote className="mt-10 max-w-2xl font-serif text-lg italic leading-relaxed text-muted">
            Another unavoidable question is: will a photograph of these colors reveal their true relationship and thus
            give the final proof? The answer again is No.
          </blockquote>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            Film registers light differently from the retina, Albers explains, and a greyscale conversion is the same
            kind of machine. The lightness numbers are a model of an average eye, not your eye. That is why his next
            task is to look again and again.
          </p>
          <Next onClick={deal}>Try a new order</Next>
        </div>
      )}
    </Step>
  )
}

function Score({ you }: { you: number | null }) {
  const rows = [
    ...(you === null ? [] : [{ label: 'You', right: you }]),
    { label: "Albers' classes", right: ALBERS_DARKER_TEST.right },
  ]
  return (
    <div className="mt-6 max-w-xl space-y-3">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 text-sm">
          <span className="text-muted">{r.label}</span>
          <div className="flex h-6 overflow-hidden rounded-sm bg-border">
            <motion.div className="h-full bg-foreground" initial={{ width: 0 }} animate={{ width: `${r.right}%` }} transition={{ duration: 0.6 }} />
          </div>
          <span />
          <span className="-mt-2 text-xs text-muted">
            {r.right}% right, {100 - r.right}% wrong
          </span>
        </div>
      ))}
      <p className="pt-1 text-xs text-muted">
        Albers reports the same result for his basic colour class over a number of years: {ALBERS_DARKER_TEST.wrong}% of
        answers wrong and {ALBERS_DARKER_TEST.right}% right, not counting the undecided cases. That is worse than a
        coin toss.
      </p>
    </div>
  )
}

function ViewNote({ view }: { view: View }) {
  const flips = PAIRS.filter((p) => lightnessOf(averageGrey(p[0])) > lightnessOf(averageGrey(p[1]))).length
  const agree = PAIRS.every((p) => cieLightness(p[0]) < cieLightness(p[1]))
  return (
    <p className="max-w-2xl text-sm text-muted">
      {view === 'colour' && 'The pairs as you saw them, with each colour\'s OKLab lightness (L, from 0 for black to 1 for white) underneath.'}
      {view === 'filter' &&
        `A quick desaturate filter averages R, G and B. It gets ${flips} of these ${PAIRS.length} pairs the wrong way round, because it counts blue as bright as green.`}
      {view === 'lightness' &&
        `Each colour as a grey of the same OKLab lightness. ${agree ? 'CIE L*, the older measure, puts every pair in the same order.' : ''}`}
    </p>
  )
}

// Albers' diagram: two sheets as diamonds, B overlapping A's right corner. C is the corner of the
// lower sheet that the upper one covers.
const A_PTS = '80,15 125,60 80,105 35,60'
const B_PTS = '120,15 165,60 120,105 75,60'
const C_PTS = '100,35 125,60 100,85 75,60'
const STARE_MS = 15000

type Seen = 'lighter' | 'darker' | 'unsure'

function AfterImage({ missed }: { missed: number[] }) {
  const [pick, setPick] = useState(0)
  const [round, setRound] = useState<0 | 1>(0)
  const [phase, setPhase] = useState<'ready' | 'staring' | 'removed'>('ready')
  const [seen, setSeen] = useState<Seen[]>([])

  // A and B swap between pairs so A isn't always the darker one
  const [first, second] = PAIRS[pick]
  const A = pick % 2 ? second : first
  const B = pick % 2 ? first : second
  const top = round === 0 ? 'B' : 'A'
  const under = round === 0 ? 'A' : 'B'

  useEffect(() => {
    if (phase !== 'staring') return
    const t = setTimeout(() => setPhase('removed'), STARE_MS)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (!missed.length) return
    setPick(missed[0])
    setRound(0)
    setPhase('ready')
    setSeen([])
  }, [missed])

  const choose = (i: number) => {
    setPick(i)
    setRound(0)
    setPhase('ready')
    setSeen([])
  }
  const answer = (s: Seen) => {
    const next = [...seen, s]
    setSeen(next)
    if (round === 0) {
      setRound(1)
      setPhase('ready')
    }
  }

  // C looking lighter than the sheet it belongs to means the sheet that covered it is the darker
  const verdict = (s: Seen, upper: 'A' | 'B') => {
    const other = upper === 'A' ? 'B' : 'A'
    return s === 'unsure' ? 'no answer' : `${s === 'lighter' ? upper : other} is darker`
  }
  const trulyDarker = lightnessOf(A) < lightnessOf(B) ? 'A' : 'B'
  const finished = seen.length === 2

  return (
    <Step n={2} title="When you can't decide" quote="In cases where a decision seems impossible, an after-image effect may be helpful.">
      <p className="mb-6 max-w-2xl text-muted">
        Put one sheet over the corner of the other. Look at the covering corner longer than your eye wants to, then
        take the top sheet away. If the uncovered corner, C, now looks lighter than the rest of its sheet, the top
        sheet was the darker one. Then do it again the other way round.
      </p>

      <div className="mb-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-muted">Pick a pair{missed.length ? '. The dots mark the ones you missed or left' : ''}</p>
        <div className="flex flex-wrap gap-2">
          {PAIRS.map((p, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              aria-label={`Pair ${i + 1}${missed.includes(i) ? ', one you missed or left' : ''}`}
              aria-pressed={i === pick}
              className={`relative rounded-sm p-0.5 ring-1 transition-colors ${i === pick ? 'ring-accent' : 'ring-border hover:ring-foreground'}`}
            >
              <span className="flex h-6 w-12 overflow-hidden rounded-[2px]">
                <span className="flex-1" style={{ background: p[0] }} />
                <span className="flex-1" style={{ background: p[1] }} />
              </span>
              {missed.includes(i) && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      </div>

      {!finished && (
        <p className="mb-3 text-xs uppercase tracking-widest text-muted">
          Round {round + 1} of 2: {top} on top of {under}
        </p>
      )}
      <div className="relative w-full max-w-xl overflow-hidden rounded-sm bg-[#808080]">
        <svg viewBox="0 0 200 120" className="block w-full" role="img" aria-label={`Sheet ${top} over a corner of sheet ${under}`}>
          {(round === 0 ? (['A', 'B'] as const) : (['B', 'A'] as const)).map((sheet) =>
            phase === 'removed' && sheet === top ? null : (
              <polygon key={sheet} points={sheet === 'A' ? A_PTS : B_PTS} fill={sheet === 'A' ? A : B} />
            )
          )}
          {phase === 'removed' && <polygon points={C_PTS} fill="none" stroke={inkOn(under === 'A' ? A : B)} strokeOpacity={0.5} strokeWidth={0.4} strokeDasharray="1.5 1.5" />}
          {phase !== 'staring' && (
            <>
              {(phase === 'ready' || under === 'A') && <text x={52} y={62} fontSize={6} fill={inkOn(A)}>A</text>}
              {(phase === 'ready' || under === 'B') && <text x={143} y={62} fontSize={6} fill={inkOn(B)}>B</text>}
              {phase === 'removed' && <text x={98} y={78} fontSize={6} fill={inkOn(under === 'A' ? A : B)}>C</text>}
            </>
          )}
          {phase !== 'ready' && (
            <g stroke="#fff" strokeWidth={0.6}>
              <line x1={97} y1={60} x2={103} y2={60} />
              <line x1={100} y1={57} x2={100} y2={63} />
            </g>
          )}
        </svg>
        {phase === 'staring' && (
          <motion.span
            className="absolute bottom-0 left-0 h-1 bg-white/70"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: STARE_MS / 1000, ease: 'linear' }}
          />
        )}
      </div>

      {!finished && phase === 'ready' && (
        <>
          <p className="mt-4 max-w-2xl text-sm text-muted">
            Press start, then keep your eyes on the cross for {STARE_MS / 1000} seconds. {top} disappears by itself, so
            you don&apos;t have to look away.
          </p>
          <Next onClick={() => setPhase('staring')}>Start</Next>
        </>
      )}
      {phase === 'staring' && <p className="mt-4 text-sm text-foreground">Keep looking at the cross.</p>}
      {!finished && phase === 'removed' && (
        <>
          <p className="mt-4 text-sm text-foreground">Quickly, before it fades: does C look lighter or darker than the rest of {under}?</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {(
              [
                ['lighter', 'C looks lighter'],
                ['darker', 'C looks darker'],
                ['unsure', "I can't tell"],
              ] as const
            ).map(([s, label]) => (
              <button
                key={s}
                onClick={() => answer(s)}
                className="rounded border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {label}
              </button>
            ))}
            <button onClick={() => setPhase('ready')} className="px-2 text-sm text-muted underline underline-offset-4 hover:text-foreground">
              Look again
            </button>
          </div>
        </>
      )}

      {finished && (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="text-muted">B on top of A</dt>
            <dd className="text-foreground">C looked {seen[0] === 'unsure' ? 'no different' : seen[0]}, so {verdict(seen[0], 'B')}</dd>
            <dt className="text-muted">A on top of B</dt>
            <dd className="text-foreground">C looked {seen[1] === 'unsure' ? 'no different' : seen[1]}, so {verdict(seen[1], 'A')}</dd>
            <dt className="text-muted">Measured</dt>
            <dd className="text-foreground">
              {trulyDarker} is darker, L {fmtL(trulyDarker === 'A' ? A : B)} against {fmtL(trulyDarker === 'A' ? B : A)}
            </dd>
          </dl>
          <blockquote className="mt-6 font-serif text-lg italic leading-relaxed text-muted">
            Frequently only 1 of the 2 reversed comparisons reveals the true relationship.
          </blockquote>
          <Next onClick={() => choose((pick + 1) % PAIRS.length)}>Try another pair</Next>
        </div>
      )}
    </Step>
  )
}

const SIDES = [
  { id: 'a', label: 'Left colour' },
  { id: 'b', label: 'Right colour' },
] as const
type Side = (typeof SIDES)[number]['id']

// Albers' pairs are always two different hues, so near-greys and near-neighbours don't count
function sameHue(a: string, b: string) {
  const x = hexToOklch(a)
  const y = hexToOklch(b)
  if (x.C < 0.03 || y.C < 0.03) return true
  const gap = Math.abs(x.h - y.h) % 360
  return Math.min(gap, 360 - gap) < 30
}

function YourPair() {
  const [pair, setPair] = useState<{ a: string; b: string }>({ a: '#c9a227', b: '#5a4fa0' })
  const [side, setSide] = useState<Side>('a')
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(pair.a))
  const [revealed, setRevealed] = useState(false)
  const [sent, setSent] = useState(false)
  const [collection, setCollection] = useState<{ shared: boolean; pairs: { a: string; b: string }[] } | null>(null)

  const chooseSide = (s: Side) => {
    setSide(s)
    setHsv(hexToHsv(pair[s]))
  }
  const change = (next: HSV) => {
    setHsv(next)
    setPair((p) => ({ ...p, [side]: hsvHex(next) }))
    setSent(false)
    setRevealed(false)
  }

  const load = useCallback(() => {
    fetch('/api/color/pairs')
      .then((r) => r.json())
      .then(setCollection)
      .catch(() => setCollection({ shared: false, pairs: [] }))
  }, [])
  useEffect(load, [load])

  const send = async () => {
    setSent(true)
    await fetch('/api/color/pairs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pair),
    }).catch(() => null)
    load()
  }

  const tooAlike = sameHue(pair.a, pair.b)
  const gap = lightnessOf(pair.a) - lightnessOf(pair.b)

  return (
    <>
      <Step n={3} title="Find your own" quote="By this experience we are led to the next task: To find colors about which we cannot say immediately which is the lighter or darker.">
        <p className="mb-6 max-w-2xl text-muted">
          Start with two hues that are easy to rank, then change one until you can&apos;t say which is darker. Keep
          them two different hues. Add it to the collection, then check what the measure says.
        </p>
        <div className="flex flex-wrap items-start gap-8">
          <div className="w-full max-w-md">
            <PairSwatch pair={[pair.a, pair.b]} />
            {revealed && <PairSwatch pair={[pair.a, pair.b]} show={greyOf} className="mt-2 h-10 [&>*]:aspect-auto" />}
            <div className="mt-4 text-sm">
              <button onClick={() => setRevealed((r) => !r)} className="text-foreground underline underline-offset-4 hover:text-accent">
                {revealed ? 'Hide the answer' : 'Show which is darker'}
              </button>
            </div>
            {revealed && (
              <p className="mt-3 text-sm text-foreground">
                {Math.abs(gap) < 0.01
                  ? `They are almost equal, L ${fmtL(pair.a)} and ${fmtL(pair.b)}. Albers' pairs never are, so there's always an answer. Move one a little.`
                  : `The ${gap < 0 ? 'left' : 'right'} one is darker, L ${fmtL(gap < 0 ? pair.a : pair.b)} against ${fmtL(gap < 0 ? pair.b : pair.a)}.`}
              </p>
            )}
          </div>
          <div className="w-full max-w-[22rem]">
            <div className="mb-4">
              <Segmented value={side} options={SIDES} onChange={chooseSide} />
            </div>
            <Picker value={hsv} onChange={change} />
          </div>
        </div>
        {tooAlike && <p className="mt-6 text-sm text-muted">These are too close in hue, or one is nearly grey. Albers&apos; pairs are two different hues.</p>}
        <Next onClick={send} disabled={sent || tooAlike}>
          {sent ? 'Added' : "I can't tell. Add it to the collection"}
        </Next>
      </Step>

      <Step n={4} title="The collection" quote="These colors are collected and pasted in pairs, and observed again and again until their light-dark relationship is clearly recognized.">
        {!collection ? null : !collection.shared ? (
          <p className="text-sm text-muted">Everyone&apos;s pairs will show here once the site is connected to its database.</p>
        ) : collection.pairs.length === 0 ? (
          <p className="text-sm text-muted">No pairs yet. Yours can be the first.</p>
        ) : (
          <Collection pairs={collection.pairs} />
        )}
      </Step>
    </>
  )
}

function Collection({ pairs }: { pairs: { a: string; b: string }[] }) {
  const [picked, setPicked] = useState<Record<number, 0 | 1>>({})
  const judged = Object.keys(picked).length
  const right = Object.entries(picked).filter(([i, s]) => s === darkerSide([pairs[+i].a, pairs[+i].b])).length
  return (
    <>
      <p className="mb-6 max-w-2xl text-muted">
        Pairs other visitors couldn&apos;t rank, newest first. Click the one you think is darker in each.
        {judged > 0 && ` So far you've got ${right} of ${judged} right.`}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
        {pairs.map((p, i) => {
          const pair: Pair = [p.a, p.b]
          const pick = picked[i]
          return (
            <figure key={i}>
              <PairSwatch pair={pair} onPick={pick === undefined ? (s) => setPicked((x) => ({ ...x, [i]: s })) : undefined} />
              {pick !== undefined && (
                <>
                  <PairSwatch pair={pair} show={greyOf} className="mt-1 h-4 [&>*]:aspect-auto" />
                  <figcaption className="mt-2 text-xs text-foreground">
                    {pick === darkerSide(pair) ? 'You got it.' : 'You missed it.'}{' '}
                    <span className="font-mono text-muted">
                      L {fmtL(p.a)} · {fmtL(p.b)}
                    </span>
                  </figcaption>
                </>
              )}
            </figure>
          )
        })}
      </div>
    </>
  )
}

// Equal steps of OKLab lightness, from light to dark
const STEPS = Array.from({ length: 9 }, (_, i) => oklchToHex(0.78 - i * 0.05, 0, 0))

function GreyLadder() {
  const [pool, setPool] = useState<number[]>(() => STEPS.map((_, i) => i))
  const [ladder, setLadder] = useState<number[]>([])
  const [checked, setChecked] = useState(false)

  const deal = useCallback(() => {
    setPool(shuffle(STEPS.map((_, i) => i)))
    setLadder([])
    setChecked(false)
  }, [])
  useEffect(deal, [deal])

  const place = (i: number) => {
    setLadder((l) => [...l, i])
    setChecked(false)
  }
  const takeBack = (i: number) => {
    setLadder((l) => l.filter((x) => x !== i))
    setChecked(false)
  }
  const inPlace = ladder.filter((step, pos) => step === pos).length

  return (
    <Step n={5} title="A grey ladder" quote="To this end, we study gradation by producing so-called grey steps, grey scales, grey ladders.">
      <p className="mb-6 max-w-2xl text-muted">
        Albers&apos; class collects as many greys as they can and arranges them into even steps between white and
        black. Here are {STEPS.length} greys in equal steps of lightness. Click them from lightest to darkest to build
        the ladder. Click a placed step to take it back.
      </p>
      <div className="flex min-h-16 flex-wrap gap-3">
        {pool
          .filter((i) => !ladder.includes(i))
          .map((i) => (
            <button
              key={i}
              onClick={() => place(i)}
              aria-label={`Grey ${pool.indexOf(i) + 1}`}
              className="h-16 w-16 rounded-sm ring-1 ring-border outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent"
              style={{ background: STEPS[i] }}
            />
          ))}
      </div>
      <div className="mt-8 flex max-w-2xl overflow-hidden rounded-sm ring-1 ring-border">
        {STEPS.map((_, pos) => {
          const step = ladder[pos]
          return step === undefined ? (
            <div key={pos} className="h-28 flex-1 border-l border-dashed border-border first:border-l-0" />
          ) : (
            <button key={pos} onClick={() => takeBack(step)} aria-label={`Step ${pos + 1}, take it back`} className="relative h-28 flex-1" style={{ background: STEPS[step] }}>
              {checked && step !== pos && (
                <span aria-label="Out of place" className="absolute bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full" style={{ background: inkOn(STEPS[step]) }} />
              )}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex max-w-2xl justify-between text-xs text-muted">
        <span>Lighter</span>
        <span>Darker</span>
      </div>

      {checked ? (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {inPlace === STEPS.length ? 'Every step is in its place.' : `${inPlace} of ${STEPS.length} steps are in their place. The dots mark the others.`}
          </p>
          <p className="mt-2 text-sm text-muted">
            Albers has his class collect greys in paper rather than buy a set, because commercial grey sets usually
            offer too few greys, or, worse, unequal steps.
          </p>
          <Next onClick={deal}>Shuffle again</Next>
        </div>
      ) : (
        <Next onClick={() => setChecked(true)} disabled={ladder.length < STEPS.length}>
          Check the ladder
        </Next>
      )}
      <p className="mt-10 max-w-2xl text-sm text-muted">
        The pages I have so far stop partway through the gradation studies, so this is only the start of them.
      </p>
    </Step>
  )
}
