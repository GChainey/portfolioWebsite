'use client'

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { deltaE, hexToHsv, rgbToHex } from '@/lib/color'
import { Next, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'

// Chapter XVIII. Free studies, kept free of shape by working only in vertical stripes. First four
// colours where none dominates, then a palette someone else chose with a theme to read into it,
// then the colours of autumn leaves taken from your own photo.

// A small seeded random, so a study can be shuffled and then kept
function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Stripe {
  color: number
  width: number
}

// Narrow stripes of varying width. `weights` sets how much of the study each colour gets.
function stripes(seed: number, count: number, weights: number[]): Stripe[] {
  const r = rng(seed)
  const total = weights.reduce((a, b) => a + b, 0)
  const out: Stripe[] = []
  let last = -1
  for (let i = 0; i < count; i++) {
    let color = last
    while (color === last) {
      let x = r() * total
      color = 0
      while (color < weights.length - 1 && x > weights[color]) x -= weights[color++]
      if (weights.filter((w) => w > 0).length < 2) break
    }
    out.push({ color, width: 1 + Math.floor(r() * (2 + weights[color] * 3)) })
    last = color
  }
  return out
}

function Stripes({ list, palette, className = '', squint = false, onStripe }: { list: Stripe[]; palette: string[]; className?: string; squint?: boolean; onStripe?: (i: number) => void }) {
  return (
    <div className={`flex h-72 overflow-hidden rounded-sm ring-1 ring-border ${className}`} role="img" aria-label="A study in vertical stripes">
      <div className="flex flex-1 transition-[filter]" style={{ filter: squint ? 'blur(10px)' : 'none', transform: squint ? 'scale(1.1)' : 'none' }}>
        {list.map((s, i) => (
          <div key={i} data-stripe={s.color} onClick={onStripe && (() => onStripe(i))} className={onStripe ? 'cursor-pointer' : ''} style={{ flexGrow: s.width, background: palette[s.color] }} />
        ))}
      </div>
    </div>
  )
}

// How loud each colour is in the study. A colour pulls the eye by how much room it has and by how far
// it stands from the others in light, hue and intensity together. A rough guide, not a judge.
function pullOf(palette: string[], area: number[]) {
  const apart = palette.map((h, i) => palette.reduce((a, o, j) => (j === i ? a : a + deltaE(h, o)), 0) / (palette.length - 1))
  const meanApart = apart.reduce((a, b) => a + b, 0) / apart.length || 1
  const pull = palette.map((_, i) => area[i] * (apart[i] / meanApart))
  const total = pull.reduce((a, b) => a + b, 0) || 1
  return pull.map((p) => p / total)
}

// Share of the area each colour covers
const shares = (list: Stripe[], n: number) => {
  const total = list.reduce((a, s) => a + s.width, 0)
  return Array.from({ length: n }, (_, c) => list.filter((s) => s.color === c).reduce((a, s) => a + s.width, 0) / total)
}

function PaletteEditor({ palette, onChange }: { palette: string[]; onChange: (p: string[]) => void }) {
  const [part, setPart] = useState(0)
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(palette[0]))
  const choose = (i: number) => {
    setPart(i)
    setHsv(hexToHsv(palette[i]))
  }
  return (
    <div className="w-full max-w-[22rem]">
      <div className="mb-4 flex gap-2">
        {palette.map((hex, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            aria-label={`Change colour ${i + 1}`}
            className={`h-10 w-10 rounded-sm ring-offset-2 ring-offset-background ${i === part ? 'ring-2 ring-accent' : 'ring-1 ring-border'}`}
            style={{ background: hex }}
          />
        ))}
      </div>
      <Picker
        value={hsv}
        onChange={(v) => {
          setHsv(v)
          onChange(palette.map((h, i) => (i === part ? hsvHex(v) : h)))
        }}
      />
    </div>
  )
}

export function FreeStudies() {
  return (
    <div className="space-y-20">
      <EqualRights />
      <Themes />
      <Leaves />
    </div>
  )
}

const ORDINAL = ['first', 'second', 'third', 'fourth']

function EqualRights() {
  const [palette, setPalette] = useState(['#c4572e', '#e8c87a', '#3d5a6c', '#9aa38a'])
  const [seed, setSeed] = useState(1)
  const [weights, setWeights] = useState([1, 1, 1, 1])
  const [edits, setEdits] = useState<Record<number, number>>({})
  const [brush, setBrush] = useState(0)
  const [squint, setSquint] = useState(false)
  const [votes, setVotes] = useState<number[]>([])
  useEffect(() => setSeed(Math.floor(Math.random() * 1e9)), [])
  const base = useMemo(() => stripes(seed, 46, weights), [seed, weights])
  const list = base.map((st, i) => (i in edits ? { ...st, color: edits[i] } : st))
  const area = shares(list, 4)
  const pull = pullOf(palette, area)
  const loudest = pull.indexOf(Math.max(...pull))
  const balanced = Math.max(...pull) < 0.34
  // Albers asks for constant alternation and recurrence: no colour should sit next to itself
  const touching = list.filter((st, i) => i > 0 && list[i - 1].color === st.color).length
  const missing = [0, 1, 2, 3].filter((c) => area[c] === 0)
  const tally = [0, 1, 2, 3].map((c) => votes.filter((v) => v === c).length)
  const top = Math.max(...tally)
  const reshuffle = (change: () => void) => {
    change()
    setEdits({})
  }

  return (
    <Step title="Four colours, equal rights" quote="The aim is to find an order in which, again relatively, all 4 colors are equally important, or, respectively, equally unimportant.">
      <p className="mb-6 max-w-2xl text-muted">
        Stripes all the same height take shape out of the way, so only colour is left. Change the four colours, give
        each more or less room, and paint single stripes, until none of them shouts. Albers judged these by eye, and so
        do you. The screen only helps you look.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-full max-w-md">
          <Stripes list={list} palette={palette} squint={squint} onStripe={(i) => setEdits((e) => ({ ...e, [i]: brush }))} />
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
            Tap a stripe to paint it with
            {palette.map((hex, i) => (
              <button
                key={i}
                onClick={() => setBrush(i)}
                aria-label={`Paint with colour ${i + 1}`}
                className={`h-7 w-7 rounded-sm ring-offset-2 ring-offset-background ${i === brush ? 'ring-2 ring-accent' : 'ring-1 ring-border'}`}
                style={{ background: hex }}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <button onClick={() => reshuffle(() => setSeed(Math.floor(Math.random() * 1e9)))} className="text-foreground underline underline-offset-4 hover:text-accent">
              Shuffle the stripes
            </button>
            <button onClick={() => setSquint((v) => !v)} aria-pressed={squint} className="text-foreground underline underline-offset-4 hover:text-accent">
              {squint ? 'Stop squinting' : 'Squint'}
            </button>
          </div>
          <div className="mt-6 space-y-3">
            {palette.map((hex, i) => (
              <label key={i} className="flex items-center gap-3 text-xs text-muted">
                <span className="h-4 w-4 shrink-0 rounded-sm ring-1 ring-border" style={{ background: hex }} />
                <input
                  type="range"
                  min={0.2}
                  max={3}
                  step={0.1}
                  value={weights[i]}
                  onChange={(e) => reshuffle(() => setWeights((w) => w.map((x, j) => (j === i ? +e.target.value : x))))}
                  aria-label={`Room for colour ${i + 1}`}
                  className="flex-1 accent-accent"
                />
                <span className="w-24 tabular-nums">{Math.round(area[i] * 100)}% of the area</span>
              </label>
            ))}
          </div>
        </div>
        <PaletteEditor palette={palette} onChange={setPalette} />
      </div>
      <div className="mt-8 max-w-2xl space-y-2">
        <p className="text-foreground" data-balanced={balanced} data-loudest={loudest}>
          {missing.length
            ? `The ${missing.map((c) => ORDINAL[c]).join(' and ')} colour has no stripes left. All four have to take part.`
            : balanced
              ? 'By area, light, hue and intensity together, none of the four is taking over. Squint and see if your eyes agree.'
              : `The ${ORDINAL[loudest]} colour pulls hardest, from its room and from how far it stands from the other three. Give it less room, or bring it closer to the others.`}
        </p>
        {touching > 0 && (
          <p className="text-sm text-muted">
            {touching} {touching === 1 ? 'pair' : 'pairs'} of stripes in the same colour touch, and read as one wide stripe.
            Albers wants the four to keep alternating.
          </p>
        )}
        <p className="text-sm text-muted">
          The measure is rough. Albers says equal is relative to what each of us likes and dislikes, so it can&apos;t be
          scored. The test that counts is other people&apos;s eyes.
        </p>
      </div>
      <div className="mt-10 max-w-2xl border-t border-border pt-6">
        <h3 className="mb-2 text-lg text-foreground">Ask people what they see first</h3>
        <p className="mb-4 text-sm text-muted">
          Show the study to someone for a moment and ask which colour they noticed first. Tap their answer. Ask a few
          people. If most name the same colour, that colour dominates.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {palette.map((hex, i) => (
            <button key={i} onClick={() => setVotes((v) => [...v, i])} aria-label={`They saw colour ${i + 1} first`} className="flex items-center gap-2 rounded border border-border px-2 py-1 text-sm text-foreground hover:border-accent">
              <span className="h-5 w-5 rounded-sm ring-1 ring-border" style={{ background: hex }} />
              {tally[i]}
            </button>
          ))}
          {votes.length > 0 && (
            <button onClick={() => setVotes([])} className="text-sm text-muted underline underline-offset-4 hover:text-accent">
              Clear
            </button>
          )}
        </div>
        {votes.length >= 3 && (
          <p className="mt-4 text-foreground">
            {top / votes.length > 0.5
              ? `${top} of ${votes.length} people saw the ${ORDINAL[tally.indexOf(top)]} colour first. It dominates. Change it and ask again.`
              : `No colour won a majority of ${votes.length} people. That is as close to equal rights as a study gets.`}
          </p>
        )}
      </div>
    </Step>
  )
}

const THEMES = [
  ['gay', 'sad'],
  ['young', 'old'],
  ['major', 'minor'],
  ['bright', 'dull'],
  ['early', 'late'],
  ['active', 'passive'],
] as const

// Palettes from other people: a few classic paper sets
const GIVEN = [
  ['#b23a2b', '#e9d8a6', '#264653', '#8d99ae', '#f4a261'],
  ['#5f0f40', '#9a031e', '#fb8b24', '#e36414', '#0f4c5c'],
  ['#355070', '#6d597a', '#b56576', '#e56b6f', '#eaac8b'],
  ['#283618', '#606c38', '#fefae0', '#dda15e', '#bc6c25'],
  ['#0b3954', '#bfd7ea', '#ff6663', '#e0ff4f', '#fefffe'],
]

function Themes() {
  const [theme, setTheme] = useState(0)
  const [given, setGiven] = useState(0)
  const [sides, setSides] = useState([
    { seed: 3, weights: [1, 1, 1, 1, 1] },
    { seed: 7, weights: [1, 1, 1, 1, 1] },
  ])
  useEffect(() => {
    setTheme(Math.floor(Math.random() * THEMES.length))
    setGiven(Math.floor(Math.random() * GIVEN.length))
  }, [])
  const palette = GIVEN[given]
  const lists = sides.map((s) => stripes(s.seed, 34, s.weights))
  const update = (i: number, change: Partial<(typeof sides)[number]>) => setSides((all) => all.map((s, j) => (j === i ? { ...s, ...change } : s)))

  return (
    <Step title="Someone else's palette" quote="To work with the preference of others, to subordinate to someone else's palette or instrumentation, should be not only permitted but encouraged.">
      <p className="mb-6 max-w-2xl text-muted">
        Here are five colours you didn&apos;t choose, and a pair of opposites. Using only these colours, make one study
        read as &ldquo;{THEMES[theme][0]}&rdquo; and the other as &ldquo;{THEMES[theme][1]}&rdquo;. You can change only
        how much of each colour there is, and how often it appears.
      </p>
      <div className="mb-6 flex flex-wrap gap-6 text-sm">
        <button onClick={() => setTheme((t) => (t + 1) % THEMES.length)} className="text-foreground underline underline-offset-4 hover:text-accent">
          Another pair of opposites
        </button>
        <button onClick={() => setGiven((g) => (g + 1) % GIVEN.length)} className="text-foreground underline underline-offset-4 hover:text-accent">
          Another palette
        </button>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {sides.map((s, i) => (
          <div key={i}>
            <p className="mb-2 font-serif text-2xl italic text-foreground">{THEMES[theme][i]}</p>
            <Stripes list={lists[i]} palette={palette} className="!h-56" />
            <div className="mt-4 space-y-2">
              {palette.map((hex, c) => (
                <label key={c} className="flex items-center gap-3">
                  <span className="h-4 w-4 shrink-0 rounded-sm ring-1 ring-border" style={{ background: hex }} />
                  <input
                    type="range"
                    min={0}
                    max={4}
                    step={0.1}
                    value={s.weights[c]}
                    onChange={(e) => update(i, { weights: s.weights.map((w, j) => (j === c ? +e.target.value : w)) })}
                    aria-label={`${THEMES[theme][i]}: amount of colour ${c + 1}`}
                    className="flex-1 accent-accent"
                  />
                </label>
              ))}
            </div>
            <button onClick={() => update(i, { seed: Math.floor(Math.random() * 1e9) })} className="mt-3 text-sm text-foreground underline underline-offset-4 hover:text-accent">
              Shuffle
            </button>
          </div>
        ))}
      </div>
      <BlindRead words={THEMES[theme]} lists={lists} palette={palette} />
    </Step>
  )
}

// Albers wants a theme to be read from colour alone. So show the two studies to someone else
// without the words, in a random order, and see if they can tell which is which.
function BlindRead({ words, lists, palette }: { words: readonly [string, string]; lists: Stripe[][]; palette: string[] }) {
  const [flip, setFlip] = useState<boolean | null>(null)
  const [guess, setGuess] = useState<number | null>(null)
  const [score, setScore] = useState({ right: 0, tries: 0 })
  const order = flip ? [1, 0] : [0, 1]
  const start = () => {
    setFlip(Math.random() < 0.5)
    setGuess(null)
  }
  const answer = (shown: number) => {
    if (guess !== null) return
    setGuess(shown)
    const right = order[shown] === 0
    setScore((s) => ({ right: s.right + (right ? 1 : 0), tries: s.tries + 1 }))
  }

  return (
    <div className="mt-10 max-w-2xl border-t border-border pt-6">
      <h3 className="mb-2 text-lg text-foreground">Can someone else read it?</h3>
      <p className="mb-4 text-sm text-muted">
        Hand the screen to someone. They see your two studies in a random order, without the words, and pick the one
        that feels &ldquo;{words[0]}&rdquo;. Albers warns these themes start discussions without end, so one person proves
        little. Ask several.
      </p>
      {flip === null ? (
        <Next onClick={start}>Hide the words</Next>
      ) : (
        <>
          <p className="mb-3 text-foreground">Which one feels &ldquo;{words[0]}&rdquo;?</p>
          <div className="grid grid-cols-2 gap-4">
            {order.map((side, shown) => (
              <button key={shown} onClick={() => answer(shown)} aria-label={`Study ${shown ? 'B' : 'A'}`} className={`rounded-sm text-left ${guess === shown ? 'ring-2 ring-accent ring-offset-2 ring-offset-background' : ''}`}>
                <Stripes list={lists[side]} palette={palette} className="!h-32" />
                <span className="mt-1 block text-xs text-muted">{guess === null ? (shown ? 'B' : 'A') : words[side]}</span>
              </button>
            ))}
          </div>
          {guess !== null && (
            <div className="flex flex-wrap items-center gap-4">
              <p className="mt-8 text-foreground">
                {order[guess] === 0 ? 'They read it.' : 'They read it the other way round.'} {score.right} of {score.tries} so far.
              </p>
              <Next onClick={start}>Next person</Next>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const DEFAULT_LEAVES = ['#8c2d19', '#d98e04', '#b5531c', '#e9c46a', '#5c3d2e', '#7a8b3a']

function Leaves() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [picked, setPicked] = useState<string[]>(DEFAULT_LEAVES)
  const [seed, setSeed] = useState(11)
  const list = useMemo(() => stripes(seed, 40, picked.map(() => 1)), [seed, picked])

  const load = (file: File) => {
    const img = new Image()
    img.onload = () => {
      const c = canvas.current!
      const scale = Math.min(1, 640 / img.width)
      c.width = img.width * scale
      c.height = img.height * scale
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(img.src)
      setHasPhoto(true)
      setPicked([])
    }
    img.src = URL.createObjectURL(file)
  }

  const pick = (e: MouseEvent<HTMLCanvasElement>) => {
    const c = canvas.current!
    const r = c.getBoundingClientRect()
    const x = Math.floor(((e.clientX - r.left) / r.width) * c.width)
    const y = Math.floor(((e.clientY - r.top) / r.height) * c.height)
    // Average a small patch, as a scrap of paper would
    const d = c.getContext('2d')!.getImageData(Math.max(0, x - 2), Math.max(0, y - 2), 5, 5).data
    const sum = [0, 0, 0]
    for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) sum[k] += d[i + k]
    const hex = rgbToHex(sum.map((s) => s / (d.length / 4)) as [number, number, number])
    setPicked((p) => [...p, hex].slice(-8))
  }

  return (
    <Step title="Fall leaves" quote="Always keep in mind the color before the shape.">
      <p className="mb-6 max-w-2xl text-muted">
        Albers&apos; students pressed autumn leaves and worked them in with their paper. Take a photo of leaves, or
        anything in season, and tap it to collect colours. Each one joins the stripes.
      </p>
      <label className="inline-block cursor-pointer rounded border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent">
        Choose a photo
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
      </label>
      <p className="mt-2 text-xs text-muted">Your photo stays in your browser. Nothing is uploaded.</p>
      <div className="mt-6 flex flex-wrap items-start gap-8">
        <canvas ref={canvas} onClick={pick} className={`max-w-md cursor-crosshair rounded-sm ${hasPhoto ? 'w-full' : 'hidden'}`} aria-label="Your photo. Tap to collect a colour." />
        <div className="w-full max-w-md">
          {picked.length > 1 ? (
            <Stripes list={list} palette={picked} />
          ) : (
            <p className="text-sm text-muted">Tap the photo at least twice to make a study.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {picked.map((hex, i) => (
              <button key={i} onClick={() => setPicked((p) => p.filter((_, j) => j !== i))} aria-label={`Remove ${hex}`} title="Remove" className="h-8 w-8 rounded-sm ring-1 ring-border" style={{ background: hex }} />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button onClick={() => setSeed(Math.floor(Math.random() * 1e9))} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
              Shuffle
            </button>
            {!hasPhoto && <span className="text-xs text-muted">Showing a set of autumn colours until you add a photo.</span>}
          </div>
        </div>
      </div>
      <Next onClick={() => setPicked(DEFAULT_LEAVES)} disabled={picked === DEFAULT_LEAVES}>
        Back to the default leaves
      </Next>
    </Step>
  )
}
