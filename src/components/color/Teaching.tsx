'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { hexToOklch, lightnessOf, oklchToHex } from '@/lib/color'
import { Segmented, Step } from './parts'
import { Plate, type Study } from './Plate'

// Chapter XXV. Albers ends with a few words he wants used carefully. Three of them made into
// things to try: relativity, factual against actual, and variant against variety.

export function Teaching() {
  return (
    <div className="space-y-20">
      <Relativity />
      <FactualActual />
      <Variants />
    </div>
  )
}

function Relativity() {
  const [spread, setSpread] = useState(0.6)
  const [measure, setMeasure] = useState(false)
  const middle = 50
  const short = middle * (1 - spread * 0.8)
  const long = Math.min(100, middle * (1 + spread))
  const greyMid = oklchToHex(0.6, 0, 0)
  const greyLight = oklchToHex(0.6 + spread * 0.38, 0, 0)
  const greyDark = oklchToHex(0.6 - spread * 0.5, 0, 0)

  const Bar = ({ w, mark }: { w: number; mark?: boolean }) => (
    <div className="relative h-3">
      <div className={`h-full rounded-sm ${mark ? 'bg-accent' : 'bg-current text-muted'}`} style={{ width: `${w}%` }} />
    </div>
  )

  return (
    <Step n={1} title="Relativity" quote="The length of any object is relative to the length of longer or shorter objects. Thus, any in-between length, seen in 2 different relationships, presents 2 different values.">
      <p className="mb-6 max-w-2xl text-muted">
        The coloured bars are the same length and the middle squares are the same grey. Pull their neighbours further
        apart and watch the same thing take two values.
      </p>
      <div className="grid max-w-2xl gap-10 sm:grid-cols-2">
        {[
          { label: 'Beside a shorter one', other: short, ground: greyLight },
          { label: 'Beside a longer one', other: long, ground: greyDark },
        ].map(({ label, other, ground }) => (
          <figure key={label} className="relative">
            <div className="space-y-2">
              <Bar w={other} />
              <Bar w={middle} mark />
              <Bar w={other} />
            </div>
            {measure && <div className="pointer-events-none absolute -bottom-2 -top-2 border-r border-dashed border-foreground" style={{ left: `${middle}%` }} />}
            <div className="mt-6 flex aspect-[2/1] items-center justify-center rounded-sm" style={{ background: ground }}>
              <div className="h-1/3 w-1/6" style={{ background: greyMid }} />
            </div>
            <figcaption className="mt-2 text-sm text-muted">{label}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-end gap-8">
        <label className="block w-full max-w-sm text-sm text-muted">
          How different the neighbours are
          <input type="range" min={0} max={1} step={0.01} value={spread} onChange={(e) => setSpread(Number(e.target.value))} className="mt-2 block w-full accent-accent" />
        </label>
        <button onClick={() => setMeasure((m) => !m)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
          {measure ? 'Hide the ruler' : 'Measure the bars'}
        </button>
      </div>
      <p className="mt-6 max-w-2xl text-sm text-muted">
        Albers uses three hands: one holding a sheet of paper, one a book, one a pile of books. The middle hand feels
        heavy next to the first and light next to the third. A colour behaves the same way.
      </p>
    </Step>
  )
}

const ILLUSIONS: { id: string; label: string; actual: string; papers: { hex: string; name: string }[]; draw: () => JSX.Element }[] = [
  {
    id: 'one-as-two',
    label: '1 looks like 2',
    actual: 'Two small rectangles of different colours.',
    papers: [
      { hex: '#3a2458', name: 'Left ground' },
      { hex: '#9a7f69', name: 'Both small rectangles' },
      { hex: '#f0d36a', name: 'Right ground' },
    ],
    draw: () => <Plate study={{ left: '#3a2458', right: '#f0d36a', inner: '#9a7f69' }} />,
  },
  {
    id: 'transparent',
    label: 'Opaque looks clear',
    actual: 'A sheet of blue and a sheet of yellow, overlapping. You can see one through the other.',
    papers: [
      { hex: '#2d5aa8', name: 'Blue' },
      { hex: '#5f8f6a', name: 'Green, cut to the overlap' },
      { hex: '#ecd04a', name: 'Yellow' },
    ],
    draw: () => (
      <svg viewBox="0 0 300 220" className="w-full rounded-sm ring-1 ring-border" aria-hidden>
        <rect width="300" height="220" fill="#f4f1ea" />
        <rect x="30" y="30" width="150" height="110" fill="#2d5aa8" />
        <rect x="120" y="80" width="150" height="110" fill="#ecd04a" />
        <rect x="120" y="80" width="60" height="60" fill="#5f8f6a" />
      </svg>
    ),
  },
  {
    id: 'vanish',
    label: 'An edge disappears',
    actual: 'One soft grey-green square, with no clear edge.',
    papers: [
      { hex: oklchToHex(0.6, 0.05, 305), name: 'Grey-violet' },
      { hex: oklchToHex(0.6, 0.05, 150), name: 'Grey-green' },
    ],
    draw: () => (
      <svg viewBox="0 0 300 220" className="w-full rounded-sm ring-1 ring-border" aria-hidden>
        <rect width="300" height="220" fill={oklchToHex(0.6, 0.05, 305)} />
        <rect x="90" y="50" width="120" height="120" fill={oklchToHex(0.6, 0.05, 150)} />
      </svg>
    ),
  },
]

function FactualActual() {
  const [id, setId] = useState(ILLUSIONS[0].id)
  const [factual, setFactual] = useState(false)
  const ill = ILLUSIONS.find((i) => i.id === id)!

  return (
    <Step n={2} title="Factual and actual" quote="When we see opaque color as transparent or perceive opacity as translucence, then the optical reception in our eye has changed in our mind to something different. These effects we call actual facts.">
      <p className="mb-6 max-w-2xl text-muted">
        The actual fact is what you see. The factual fact is what is there. Switch between them.
      </p>
      <div className="mb-6 flex flex-wrap gap-6">
        <Segmented value={id} options={ILLUSIONS} onChange={(v) => setId(v)} />
        <Segmented
          value={factual ? 'factual' : 'actual'}
          options={[
            { id: 'actual', label: 'Actual' },
            { id: 'factual', label: 'Factual' },
          ]}
          onChange={(v) => setFactual(v === 'factual')}
        />
      </div>
      <motion.div key={`${id}-${factual}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md">
        {factual ? (
          <div className="flex flex-wrap gap-4 bg-[#808080] p-4">
            {ill.papers.map((p) => (
              <figure key={p.name} className="w-24">
                <div className="h-20" style={{ background: p.hex }} />
                <figcaption className="mt-1 text-xs text-white">
                  {p.name}
                  <br />
                  {p.hex}, lightness {(lightnessOf(p.hex) * 100).toFixed(0)}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          ill.draw()
        )}
      </motion.div>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        {factual ? `${ill.papers.length} flat, opaque papers, laid out on a neutral grey.` : `What most people see: ${ill.actual.toLowerCase()}`}
      </p>
    </Step>
  )
}

// A variant keeps the scheme: every colour turns by the same hue and keeps its lightness, so the
// relationships, and the effect, survive. Variety changes one detail for the sake of change.
function variant(s: Study): Study {
  const turn = 40 + Math.random() * 280
  const t = (hex: string) => {
    const [L, C, h] = hexToOklch(hex)
    return oklchToHex(L, C, h + turn)
  }
  return Math.random() < 0.5 ? { left: t(s.left), right: t(s.right), inner: t(s.inner) } : { left: t(s.right), right: t(s.left), inner: t(s.inner) }
}

function variety(s: Study): Study {
  const keys = ['left', 'right', 'inner'] as const
  const k = keys[Math.floor(Math.random() * 3)]
  const [L, C, h] = hexToOklch(s[k])
  return { ...s, [k]: oklchToHex(Math.min(0.95, Math.max(0.15, L + (Math.random() - 0.5) * 0.5)), C + Math.random() * 0.1, h + (Math.random() - 0.5) * 120) }
}

const ORIGINAL: Study = { left: '#e2902c', right: '#2f6db0', inner: '#a69a88' }

function Variants() {
  const [made, setMade] = useState<{ kind: 'Variant' | 'Variety'; study: Study }[]>([])
  const add = (kind: 'Variant' | 'Variety') => setMade((m) => [{ kind, study: kind === 'Variant' ? variant(ORIGINAL) : variety(ORIGINAL) }, ...m].slice(0, 6))

  return (
    <Step n={3} title="Variants, not variety" quote="As variety usually concerns changes of details, variant means a more thorough re-doing of a whole or of a part within a given scheme.">
      <p className="mb-6 max-w-2xl text-muted">
        Start from one study: a muted colour pushed two ways by an orange and a blue ground. A variant re-does all
        three colours and keeps how they relate. Variety changes one detail at random. See which ones still work.
      </p>
      <div className="grid max-w-3xl gap-6 sm:grid-cols-[14rem_1fr]">
        <figure>
          <Plate study={ORIGINAL} />
          <figcaption className="mt-2 text-sm text-muted">The study</figcaption>
        </figure>
        <div>
          <div className="mb-4 flex flex-wrap gap-3">
            <button onClick={() => add('Variant')} className="rounded border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent">
              Make a variant
            </button>
            <button onClick={() => add('Variety')} className="rounded border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent">
              Add some variety
            </button>
          </div>
          {made.length === 0 ? (
            <p className="text-sm text-muted">Nothing made yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {made.map((m, i) => (
                <motion.figure key={made.length - i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <Plate study={m.study} />
                  <figcaption className="mt-1 text-xs text-muted">{m.kind}</figcaption>
                </motion.figure>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="mt-6 max-w-2xl text-sm text-muted">
        Variants nearly always keep the two faces of the middle colour, because its lightness against each ground
        hasn&apos;t moved. Variety usually breaks it.
      </p>
    </Step>
  )
}
