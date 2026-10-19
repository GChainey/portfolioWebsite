'use client'

import { useId, useState } from 'react'
import { averageLight, hexToHsv, hexToOklch, lightnessOf, oklchToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'

// Chapter XIII. Bezold changed his rug designs by changing one colour only. Here the same rug is
// drawn twice, the only difference is the colour of its lines, and the whole design shifts.

interface Rug {
  ground: string
  field: string
  motif: string
  line: string
}

// Rough share of the tile each colour covers, for the colour the whole rug mixes to
const AREA = { ground: 0.38, field: 0.27, motif: 0.11, line: 0.24 }

function rugMix(rug: Rug) {
  // Weight by repeating each colour in proportion to its area
  const parts: string[] = []
  ;(Object.keys(AREA) as (keyof Rug)[]).forEach((k) => {
    for (let i = 0; i < Math.round(AREA[k] * 100); i++) parts.push(rug[k])
  })
  return averageLight(...parts)
}

// One repeating tile: a diamond on a ground, a small square inside, everything outlined
function RugPattern({ rug, scale = 1, label, className = '' }: { rug: Rug; scale?: number; label: string; className?: string }) {
  const id = useId().replace(/:/g, '')
  const s = 32 * scale
  const w = 2.6 * scale
  return (
    <svg role="img" aria-label={label} className={`block w-full rounded-sm ring-1 ring-border ${className}`} viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`rug-${id}`} width={s} height={s} patternUnits="userSpaceOnUse">
          <rect width={s} height={s} fill={rug.ground} data-part="ground" />
          <polygon points={`${s / 2},${s * 0.08} ${s * 0.92},${s / 2} ${s / 2},${s * 0.92} ${s * 0.08},${s / 2}`} fill={rug.field} stroke={rug.line} strokeWidth={w} />
          <rect x={s * 0.4} y={s * 0.4} width={s * 0.2} height={s * 0.2} fill={rug.motif} stroke={rug.line} strokeWidth={w * 0.7} />
          <path d={`M0 0 L${s * 0.08} 0 M0 0 L0 ${s * 0.08} M${s} ${s} L${s * 0.92} ${s} M${s} ${s} L${s} ${s * 0.92}`} stroke={rug.line} strokeWidth={w} />
          <rect width={s} height={s} fill="none" stroke={rug.line} strokeWidth={w * 0.5} />
        </pattern>
      </defs>
      <rect width="320" height="240" fill={`url(#rug-${id})`} />
    </svg>
  )
}

const BASE: Omit<Rug, 'line'> = { ground: '#b2463a', field: '#2f5f8a', motif: '#e2b546' }

export function Bezold() {
  return (
    <div className="space-y-20">
      <OneLine />
      <Match />
      <YourRug />
    </div>
  )
}

const LINES = [
  { id: 'black', label: 'Black lines', hex: '#141414' },
  { id: 'white', label: 'White lines', hex: '#f4f1ea' },
] as const

function OneLine() {
  const [scale, setScale] = useState(1)
  return (
    <Step
      title="Change one colour, change the rug"
      quote="He recognized this effect when searching for a method by which he could change the color combinations of his rug designs entirely by adding or changing 1 color only."
    >
      <p className="mb-6 max-w-2xl text-muted">
        These two rugs use the same red, blue and yellow. Only the lines differ. With black lines the rug looks dark
        and rich. With white lines every colour looks lighter, as if it had been mixed with white. Make the pattern
        smaller and the effect gets stronger, because the eye starts mixing the lines into the colours.
      </p>
      <div className="grid max-w-3xl gap-4 sm:grid-cols-2">
        {LINES.map((l) => {
          const rug = { ...BASE, line: l.hex }
          return (
            <figure key={l.id}>
              <RugPattern rug={rug} scale={scale} label={`Rug with ${l.label.toLowerCase()}`} />
              <figcaption className="mt-2 flex items-center gap-3 text-sm text-muted">
                <span className="inline-block h-4 w-4 rounded-sm ring-1 ring-border" style={{ background: rugMix(rug) }} />
                {l.label}. The square is what the whole rug mixes to from a distance.
              </figcaption>
            </figure>
          )
        })}
      </div>
      <label className="mt-6 flex max-w-sm flex-col gap-2 text-sm text-muted">
        Pattern size
        <input type="range" min={0.35} max={2} step={0.05} value={scale} onChange={(e) => setScale(+e.target.value)} className="accent-[var(--accent)]" />
      </label>
      <p className="mt-6 max-w-2xl text-sm text-muted">
        On paper Bezold had to redraw a design to test a change. Here the same pattern redraws in an instant, so you
        can flip one colour back and forth and watch the rest of the rug move with it.
      </p>
    </Step>
  )
}

// The red ground, moved lighter or darker by `d` with its hue kept
const groundAt = (d: number) => {
  const [L, C, h] = hexToOklch(BASE.ground)
  return oklchToHex(L + d, C, h)
}

// Method of adjustment: set a plain patch until it looks like the red inside the rug. Done once
// with white lines and once with black, the two settings show which way the lines pulled the red.
function Match() {
  const [round, setRound] = useState(0)
  const [d, setD] = useState(0)
  const [settings, setSettings] = useState<number[]>([])
  const line = LINES[round % 2]
  const rug = { ...BASE, line: line.hex }
  const finished = settings.length === 2
  // Black lines come first, then white
  const [black, white] = settings

  const commit = () => {
    setSettings((s) => [...s, d])
    setD(0)
    setRound((r) => r + 1)
  }

  return (
    <Step title="How far did the red move?" quote="Apparently, there is so far no clear recognition of the optical-perceptual conditions involved.">
      <p className="mb-6 max-w-2xl text-muted">
        Measure it on yourself. Move the slider until the plain patch looks like the red ground inside the rug, not the
        red you know it is. You&apos;ll do it twice, once with white lines and once with black. Both rugs use exactly the
        same red, {BASE.ground}.
      </p>
      {!finished ? (
        <>
          <p className="mb-4 text-sm text-foreground">
            {round + 1} of 2: {line.label.toLowerCase()}
          </p>
          <div className="flex max-w-3xl flex-wrap items-center gap-6 bg-[#808080] p-6">
            <div className="w-full max-w-xs">
              <RugPattern rug={rug} scale={0.55} label={`Rug with ${line.label.toLowerCase()}`} />
            </div>
            <div className="h-32 w-32 shrink-0" style={{ background: groundAt(d) }} aria-label="The patch you are setting" role="img" />
          </div>
          <label className="mt-6 block max-w-md text-sm text-muted">
            <span className="mb-1 flex justify-between">
              <span>Darker</span>
              <span>Lighter</span>
            </span>
            <input type="range" min={-0.2} max={0.2} step={0.005} value={d} onChange={(e) => setD(Number(e.target.value))} aria-label="The patch: lighter or darker" className="w-full accent-accent" />
          </label>
          <Next onClick={commit}>The patch matches the rug&apos;s red</Next>
        </>
      ) : (
        <div className="max-w-2xl">
          <div className="grid max-w-md grid-cols-3 gap-3 bg-[#808080] p-3">
            {[
              { hex: groundAt(white), label: 'Your match, white lines' },
              { hex: BASE.ground, label: 'The real red' },
              { hex: groundAt(black), label: 'Your match, black lines' },
            ].map(({ hex, label }) => (
              <figure key={label}>
                <div className="h-16" style={{ background: hex }} />
                <figcaption className="mt-1 text-xs text-white">{label}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-6 text-foreground" data-testid="verdict">
            {white - black > 0.015
              ? `You saw the Bezold Effect. With white lines you set the red ${Math.round((white - black) * 100)} points lighter than with black lines. The lines pulled the red towards themselves.`
              : black - white > 0.015
                ? 'You set the red lighter with black lines than with white. That is contrast, the opposite of Bezold. Make the pattern finer or step back and try again: the effect needs lines too thin to see as separate shapes.'
                : 'You set both reds about the same, so the lines didn’t move the red for you at this size. Step back from the screen and try again.'}
          </p>
          <p className="mt-2 text-sm text-muted">
            Contrast pushes a colour away from its neighbour. Bezold&apos;s effect does the opposite: fine lines that touch
            everything pull every colour towards them, as if mixed in.
          </p>
          <Next onClick={() => { setSettings([]); setRound(0) }}>Measure again</Next>
        </div>
      )}
    </Step>
  )
}

const PARTS = [
  { id: 'line', label: 'Lines' },
  { id: 'ground', label: 'Ground' },
  { id: 'field', label: 'Diamonds' },
  { id: 'motif', label: 'Centres' },
] as const
type Part = (typeof PARTS)[number]['id']

function YourRug() {
  const [rug, setRug] = useState<Rug>({ ground: '#3f6f4a', field: '#c86a3a', motif: '#f0dca0', line: '#1d1d3a' })
  const [before, setBefore] = useState<Rug | null>(null)
  const [part, setPart] = useState<Part>('line')
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(rug.line))
  const [showBefore, setShowBefore] = useState(false)

  const choose = (p: Part) => {
    setPart(p)
    setHsv(hexToHsv(rug[p]))
    setBefore(rug)
  }
  const change = (next: HSV) => {
    if (!before) setBefore(rug)
    setHsv(next)
    setRug((r) => ({ ...r, [part]: hsvHex(next) }))
  }

  const shown = showBefore && before ? before : rug
  const shift = before ? lightnessOf(rugMix(rug)) - lightnessOf(rugMix(before)) : 0

  return (
    <Step title="Your rug" quote="There is a special kind of optical mixture, the Bezold Effect, named after its discoverer, Wilhelm von Bezold (1837–1907).">
      <p className="mb-6 max-w-2xl text-muted">
        Pick one part of the rug and change only that colour. Hold the button below to see the rug as it was before
        your change. Lines work best, because they touch every other colour.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-full max-w-md">
          <RugPattern rug={shown} scale={0.7} label="Your rug" />
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <button
              onPointerDown={() => setShowBefore(true)}
              onPointerUp={() => setShowBefore(false)}
              onPointerLeave={() => setShowBefore(false)}
              onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setShowBefore(true)}
              onKeyUp={() => setShowBefore(false)}
              disabled={!before}
              className="select-none text-foreground underline underline-offset-4 hover:text-accent disabled:opacity-40"
            >
              Hold to see it before
            </button>
            {before && (
              <span className="text-muted">
                {Math.abs(shift) < 0.01
                  ? 'The whole rug mixes to about the same lightness.'
                  : `The whole rug now reads ${shift > 0 ? 'lighter' : 'darker'} by ${Math.round(Math.abs(shift) * 100)} points.`}
              </span>
            )}
          </div>
        </div>
        <div className="w-full max-w-[22rem]">
          <div className="mb-4">
            <Segmented value={part} options={[...PARTS]} onChange={choose} />
          </div>
          <Picker value={hsv} onChange={change} />
          <div className="mt-4 flex gap-2" aria-label="Quick colours">
            {['#141414', '#f4f1ea', '#e2b546', '#2f5f8a'].map((hex) => (
              <button
                key={hex}
                aria-label={`Set ${part} to ${hex}`}
                onClick={() => change(hexToHsv(hex))}
                className="h-7 w-7 rounded-sm ring-1 ring-border transition-transform hover:scale-110"
                style={{ background: hex }}
              />
            ))}
          </div>
        </div>
      </div>
    </Step>
  )
}
