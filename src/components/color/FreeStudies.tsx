'use client'

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { hexToHsv, lightnessOf, rgbToHex } from '@/lib/color'
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

function Stripes({ list, palette, className = '' }: { list: Stripe[]; palette: string[]; className?: string }) {
  return (
    <div className={`flex h-72 overflow-hidden rounded-sm ring-1 ring-border ${className}`} role="img" aria-label="A study in vertical stripes">
      {list.map((s, i) => (
        <div key={i} style={{ flexGrow: s.width, background: palette[s.color] }} />
      ))}
    </div>
  )
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

function EqualRights() {
  const [palette, setPalette] = useState(['#c4572e', '#e8c87a', '#3d5a6c', '#9aa38a'])
  const [seed, setSeed] = useState(1)
  const [weights, setWeights] = useState([1, 1, 1, 1])
  useEffect(() => setSeed(Math.floor(Math.random() * 1e9)), [])
  const list = useMemo(() => stripes(seed, 46, weights), [seed, weights])
  const area = shares(list, 4)
  // Visual weight: area counts, but so does how far a colour stands out from the others in light
  const meanL = palette.reduce((a, h) => a + lightnessOf(h), 0) / 4
  const pull = palette.map((h, i) => area[i] * (0.6 + Math.abs(lightnessOf(h) - meanL) * 3))
  const pullTotal = pull.reduce((a, b) => a + b, 0)
  const loudest = pull.indexOf(Math.max(...pull))
  const balanced = Math.max(...pull) / pullTotal < 0.34

  return (
    <Step n={1} title="Four colours, equal rights" quote="The aim is to find an order in which, again relatively, all 4 colors are equally important, or, respectively, equally unimportant.">
      <p className="mb-6 max-w-2xl text-muted">
        Stripes all the same height take shape out of the way, so only colour is left. Shuffle the order, change the four
        colours, and give each one more or less room, until none of them shouts.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-full max-w-md">
          <Stripes list={list} palette={palette} />
          <button onClick={() => setSeed(Math.floor(Math.random() * 1e9))} className="mt-4 text-sm text-foreground underline underline-offset-4 hover:text-accent">
            Shuffle the stripes
          </button>
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
                  onChange={(e) => setWeights((w) => w.map((x, j) => (j === i ? +e.target.value : x)))}
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
      <p className="mt-8 max-w-2xl text-foreground">
        {balanced
          ? 'By area and by light, none of the four is taking over. Do your eyes agree?'
          : `The ${['first', 'second', 'third', 'fourth'][loudest]} colour carries the most weight, from its area and from how far its light stands apart from the others. Give it less room, or bring its light closer.`}
      </p>
      <p className="mt-2 text-sm text-muted">
        The screen can count area and light. It can&apos;t count taste. Albers says equal is relative to what each of us
        likes and dislikes.
      </p>
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
    <Step n={2} title="Someone else's palette" quote="To work with the preference of others, to subordinate to someone else's palette or instrumentation, should be not only permitted but encouraged.">
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
      <p className="mt-8 max-w-2xl text-sm text-muted">
        Show the two to someone without the words and ask which is which. Albers warns these themes start discussions
        without end, because everyone reads colour differently.
      </p>
    </Step>
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
    <Step n={3} title="Fall leaves" quote="Always keep in mind the color before the shape.">
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
