'use client'

import { useState } from 'react'
import { contrastRatio, lightnessOf, oklchToHex } from '@/lib/color'
import { Segmented, Step } from './parts'

// Chapter XXII. Two hues far apart, at nearly the same lightness, make their shared edge shimmer.
// First find where it starts, then see what the same pair does to text in an interface.

const PAIRS = [
  { id: 'red-green', label: 'Red and green', a: 25, b: 145 },
  { id: 'blue-orange', label: 'Blue and orange', a: 260, b: 55 },
  { id: 'magenta-green', label: 'Magenta and green', a: 345, b: 150 },
] as const
type PairId = (typeof PAIRS)[number]['id']

// Both colours sit around one lightness, `gap` apart, with as much chroma as fits
function pairColours(pair: (typeof PAIRS)[number], gap: number) {
  const mid = 0.62
  return { ground: oklchToHex(mid - gap / 2, 0.2, pair.b), figure: oklchToHex(mid + gap / 2, 0.2, pair.a) }
}

export function Vibrating() {
  const [pairId, setPairId] = useState<PairId>('red-green')
  const [gap, setGap] = useState(0.3)
  const pair = PAIRS.find((p) => p.id === pairId)!
  const { ground, figure } = pairColours(pair, gap)

  return (
    <div className="space-y-20">
      <FindTheEdge pairId={pairId} setPairId={setPairId} gap={gap} setGap={setGap} ground={ground} figure={figure} />
      <InAnInterface ground={ground} figure={figure} />
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block max-w-sm text-sm text-muted">
      {label}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 block w-full accent-accent"
      />
    </label>
  )
}

function FindTheEdge({
  pairId,
  setPairId,
  gap,
  setGap,
  ground,
  figure,
}: {
  pairId: PairId
  setPairId: (p: PairId) => void
  gap: number
  setGap: (g: number) => void
  ground: string
  figure: string
}) {
  const [large, setLarge] = useState(false)
  const diff = Math.abs(lightnessOf(figure) - lightnessOf(ground)) * 100

  return (
    <Step n={1} title="Make the edge vibrate" quote="The conditions for these varying effects occur between colors which are contrasting in their hues but also close or similar in light intensity.">
      <p className="mb-6 max-w-2xl text-muted">
        Pick two contrasting hues, then bring them closer in lightness. Somewhere near the left end of the slider
        the edges start to double, shimmer, or cast a shadow on one side. Some people see it and some don&apos;t.
      </p>
      <div className="mb-6 flex flex-wrap items-end gap-8">
        <Segmented value={pairId} options={[...PAIRS]} onChange={setPairId} />
        <button onClick={() => setLarge((l) => !l)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
          {large ? 'Make it smaller' : 'Make it larger'}
        </button>
      </div>
      <div className={`overflow-hidden rounded-sm ring-1 ring-border ${large ? 'max-w-3xl' : 'max-w-sm'}`} style={{ background: ground }} aria-hidden>
        <div className="flex aspect-[3/2] items-center justify-center gap-[6%] px-[10%]">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3/5 flex-1" style={{ background: figure }} />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <Slider label="Difference in lightness" value={gap} min={0} max={0.4} step={0.005} onChange={setGap} />
      </div>
      <dl className="mt-4 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
        <dt className="text-muted">Lightness apart</dt>
        <dd className="text-foreground">{diff.toFixed(0)} of 100</dd>
        <dt className="text-muted">Colours</dt>
        <dd className="text-foreground">
          {figure} on {ground}
        </dd>
      </dl>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        {diff < 6
          ? 'This is the vibrating zone. The hues fight and nothing settles the edge.'
          : diff < 15
            ? 'Close. Look at the edges rather than the bars.'
            : 'The lightness difference holds the edge still.'}
      </p>
    </Step>
  )
}

const AA = 4.5

function InAnInterface({ ground, figure }: { ground: string; figure: string }) {
  const ratio = contrastRatio(ground, figure)
  const passes = ratio >= AA

  return (
    <Step n={2} title="Now read it" quote="One finds it rarely used except for a screaming effect in advertising, and as a result it is unpleasant, disliked, and avoided.">
      <p className="mb-6 max-w-2xl text-muted">
        The same pair as a banner. Albers&apos; screaming advert is also an accessibility failure. The contrast
        guideline for text on screens measures lightness, not hue, so a vibrating pair almost never passes.
      </p>
      <div className="max-w-xl rounded-sm p-6 ring-1 ring-border sm:p-8" style={{ background: ground, color: figure }}>
        <p className="text-3xl font-medium">Sale ends tonight</p>
        <p className="mt-2 text-base">Everything in store, half price, until midnight.</p>
      </div>
      <p className="mt-4 text-sm text-foreground">
        Contrast ratio {ratio.toFixed(2)} to 1.{' '}
        {passes ? `That passes the ${AA} to 1 minimum for body text.` : `Body text needs at least ${AA} to 1, so this fails.`}
      </p>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Slide the difference up in step 1 until it passes. The hues stay the same, and the vibration goes before
        the text becomes comfortable to read.
      </p>
    </Step>
  )
}
