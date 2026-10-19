'use client'

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { deltaE, hexToOklch, inkOn, lightnessOf, oklchToHex, rgbToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'

// Chapter III. Albers' class collected paper because a paper is the same colour every time.
// A screen colour is too, so here you collect papers from a photo of your own, and then see
// what paint would have done to the same colour.

const STORE = 'color-papers'
const MAX = 40

function loadPapers(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || '[]')
    return Array.isArray(raw) ? raw.filter((h) => typeof h === 'string').slice(0, MAX) : []
  } catch {
    return []
  }
}

function savePapers(papers: string[]) {
  try {
    localStorage.setItem(STORE, JSON.stringify(papers))
  } catch {
    // Private windows can refuse storage. The collection still works for this visit.
  }
}

export function Paper() {
  const [papers, setPapers] = useState<string[]>([])
  useEffect(() => setPapers(loadPapers()), [])

  const update = (next: string[]) => {
    setPapers(next)
    savePapers(next)
  }
  const add = (hex: string) => update([hex, ...papers.filter((p) => p !== hex)].slice(0, MAX))

  return (
    <div className="space-y-20">
      <Collect onPick={add} />
      <Collection papers={papers} onChange={update} />
      <Choose papers={papers} />
      <PaintAgain />
    </div>
  )
}

// Strips of printers' waste: random colours until a photo is loaded
function wasteStrips(): string[][] {
  return Array.from({ length: 6 }, () => {
    const hue = Math.random() * 360
    return Array.from({ length: 9 }, (_, i) => oklchToHex(0.3 + Math.random() * 0.6, Math.random() * 0.18, (hue + i * (8 + Math.random() * 30)) % 360))
  })
}

function Collect({ onPick }: { onPick: (hex: string) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [strips, setStrips] = useState<string[][]>([])
  const [hover, setHover] = useState<string | null>(null)

  useEffect(() => setStrips(wasteStrips()), [])

  const load = (file: File | undefined) => {
    if (!file) return
    const img = new Image()
    img.onload = () => {
      const c = canvas.current!
      const scale = Math.min(1, 900 / img.width)
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(img.src)
      setHasPhoto(true)
    }
    img.src = URL.createObjectURL(file)
  }

  // The average of a small patch, so one stray pixel of noise doesn't decide the colour
  const sample = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    const c = canvas.current!
    const r = c.getBoundingClientRect()
    const x = Math.round(((e.clientX - r.left) / r.width) * c.width)
    const y = Math.round(((e.clientY - r.top) / r.height) * c.height)
    const size = 5
    const data = c.getContext('2d')!.getImageData(Math.max(0, x - 2), Math.max(0, y - 2), size, size).data
    const sum = [0, 0, 0]
    let n = 0
    for (let i = 0; i < data.length; i += 4) {
      sum[0] += data[i]
      sum[1] += data[i + 1]
      sum[2] += data[i + 2]
      n++
    }
    return rgbToHex([sum[0] / n, sum[1] / n, sum[2] / n])
  }, [])

  return (
    <Step title="Collect your papers" quote="Sources easily accessible for many kinds of color paper are waste strips found at printers and bookbinders… Also, instead of full sheets of paper, just cutouts from magazines, from advertisements and illustrations.">
      <p className="mb-6 max-w-2xl text-muted">
        Load a photo of a magazine, a street, a shelf of packaging, anything with colour in it. On a phone you can take
        one now. Click anywhere on it to cut out a paper. Until then, here are some printers&apos; waste strips.
      </p>
      <label className="mb-6 inline-block cursor-pointer rounded border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent">
        {hasPhoto ? 'Load another photo' : 'Load a photo'}
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => load(e.target.files?.[0])} />
      </label>

      <div className="flex flex-wrap items-start gap-6">
        <canvas
          ref={canvas}
          onClick={(e) => onPick(sample(e))}
          onMouseMove={(e) => setHover(sample(e))}
          onMouseLeave={() => setHover(null)}
          className={`max-h-[28rem] w-full max-w-xl cursor-crosshair rounded-sm ${hasPhoto ? '' : 'hidden'}`}
          aria-label="Your photo. Click to cut out a paper."
        />
        {!hasPhoto && (
          <div className="w-full max-w-xl space-y-1">
            {strips.map((strip, i) => (
              <div key={i} className="flex h-10 gap-px" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 0.6}deg)` }}>
                {strip.map((hex) => (
                  <button key={hex} onClick={() => onPick(hex)} aria-label={`Keep ${hex}`} className="flex-1 outline-none transition-transform hover:z-10 hover:scale-110 focus-visible:ring-2 focus-visible:ring-accent" style={{ background: hex }} />
                ))}
              </div>
            ))}
          </div>
        )}
        {hasPhoto && (
          <figure aria-live="polite">
            <div className="h-24 w-24 rounded-sm border border-border" style={{ background: hover ?? 'transparent' }} />
            <figcaption className="mt-2 font-mono text-xs text-muted">{hover ?? 'Point at the photo'}</figcaption>
          </figure>
        )}
      </div>
    </Step>
  )
}

const SORTS = [
  { id: 'added', label: 'As collected' },
  { id: 'light', label: 'Light to dark' },
  { id: 'hue', label: 'By hue' },
] as const
type Sort = (typeof SORTS)[number]['id']

function Collection({ papers, onChange }: { papers: string[]; onChange: (p: string[]) => void }) {
  const [sort, setSort] = useState<Sort>('added')
  const shown =
    sort === 'light'
      ? [...papers].sort((a, b) => lightnessOf(b) - lightnessOf(a))
      : sort === 'hue'
        ? [...papers].sort((a, b) => {
            const [, ca, ha] = hexToOklch(a)
            const [, cb, hb] = hexToOklch(b)
            // Greys have no real hue, so they go at the end
            return (ca < 0.03 ? 999 : ha) - (cb < 0.03 ? 999 : hb)
          })
        : papers

  return (
    <Step title="Your palette" quote="We can choose from a large collection of tones, displayed in front of us, and can thus constantly compare neighboring and contrasting colors. This offers a training which no palette can provide.">
      {papers.length === 0 ? (
        <p className="text-sm text-muted">No papers yet. Cut some out above.</p>
      ) : (
        <>
          <p className="mb-6 max-w-2xl text-muted">
            {papers.length} {papers.length === 1 ? 'paper' : 'papers'}, kept in this browser for your next visit. Sort
            them to compare neighbours. Click one to throw it away.
          </p>
          <Segmented value={sort} options={[...SORTS]} onChange={setSort} />
          <ul className="mt-6 grid max-w-3xl grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {shown.map((hex) => (
              <li key={hex}>
                <button
                  onClick={() => onChange(papers.filter((p) => p !== hex))}
                  aria-label={`Throw away ${hex}`}
                  className="group flex aspect-[3/4] w-full items-end p-1.5 text-left font-mono text-[10px] outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  style={{ background: hex, color: inkOn(hex) }}
                >
                  <span className="opacity-70 group-hover:hidden">{hex}</span>
                  <span className="hidden group-hover:inline">Remove</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Step>
  )
}

// Albers' reason for a big collection: you learn by choosing, not mixing. A colour is shown, and
// you find the paper nearest to it by eye. The nearest is measured, so the choice can be scored.
const MIN_PAPERS = 6
const CHOOSE_ROUNDS = 3

function nudge(hex: string): string {
  const [L, C, h] = hexToOklch(hex)
  return oklchToHex(Math.min(0.95, Math.max(0.1, L + (Math.random() - 0.5) * 0.08)), Math.max(0, C + (Math.random() - 0.5) * 0.05), h + (Math.random() - 0.5) * 20)
}

function Choose({ papers }: { papers: string[] }) {
  const [target, setTarget] = useState<string | null>(null)
  const [pick, setPick] = useState<string | null>(null)
  const [scores, setScores] = useState<boolean[]>([])

  const next = () => {
    setTarget(nudge(papers[Math.floor(Math.random() * papers.length)]))
    setPick(null)
  }
  const nearest = target ? papers.reduce((best, p) => (deltaE(p, target) < deltaE(best, target) ? p : best), papers[0]) : null
  const choose = (hex: string) => {
    if (pick || !nearest) return
    setPick(hex)
    setScores([...scores, hex === nearest])
  }
  const done = scores.length >= CHOOSE_ROUNDS && !!pick

  return (
    <Step title="Find it in your papers" quote="In solving our problems again and again we must find just the right color which demonstrates a desired effect.">
      {papers.length < MIN_PAPERS ? (
        <p className="text-sm text-muted">Collect at least {MIN_PAPERS} papers above, then come back. You&apos;ll be shown a colour and find the paper nearest to it.</p>
      ) : !target ? (
        <>
          <p className="mb-2 max-w-2xl text-muted">
            A colour will appear on a neutral grey. Find the paper in your collection that is nearest to it, by eye.
            Nothing is mixed, only chosen. There are {CHOOSE_ROUNDS} rounds.
          </p>
          <Next onClick={next}>Show me a colour</Next>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-start gap-8">
            <div className="bg-[#808080] p-5">
              <div className="h-28 w-28" style={{ background: target }} />
              <p className="mt-2 text-xs text-white">Find this</p>
            </div>
            <ul className="grid max-w-xl flex-1 grid-cols-6 gap-2 bg-[#808080] p-5 sm:grid-cols-8" aria-label="Your papers">
              {papers.map((hex) => (
                <li key={hex}>
                  <button
                    onClick={() => choose(hex)}
                    disabled={!!pick}
                    aria-label={`Choose ${hex}`}
                    className={`aspect-[3/4] w-full outline-none focus-visible:ring-2 focus-visible:ring-accent ${pick && hex === nearest ? 'ring-2 ring-white' : ''} ${pick === hex && hex !== nearest ? 'ring-2 ring-black' : ''}`}
                    style={{ background: hex }}
                  />
                </li>
              ))}
            </ul>
          </div>
          {pick && nearest && (
            <div className="mt-6 max-w-2xl" aria-live="polite">
              <p className="text-foreground">
                {pick === nearest
                  ? 'You found the nearest paper.'
                  : `The nearest paper is ringed in white. Yours is ${deltaE(pick, target).toFixed(1)} away, the nearest ${deltaE(nearest, target).toFixed(1)}.`}
              </p>
              {done ? (
                <>
                  <p className="mt-2 text-sm text-muted">
                    You found the nearest paper {scores.filter(Boolean).length} times out of {scores.length}. Distances are
                    measured in OKLab, where about 2 is the smallest difference you can see side by side.
                  </p>
                  <Next onClick={() => { setScores([]); next() }}>Again</Next>
                </>
              ) : (
                <Next onClick={next}>Next colour ({scores.length + 1} of {CHOOSE_ROUNDS})</Next>
              )}
            </div>
          )}
        </>
      )}
    </Step>
  )
}

// Paint changes with every coat: thinner or thicker, and the brush leaves marks. Drawn as many
// translucent strokes over white paper, then averaged, so two coats can be measured.
function paint(c: HTMLCanvasElement, hex: string): string {
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#f6f4ee'
  ctx.fillRect(0, 0, c.width, c.height)
  const thickness = 0.35 + Math.random() * 0.4
  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = thickness * (0.3 + Math.random() * 0.7)
    ctx.fillStyle = hex
    const y = Math.random() * c.height
    ctx.beginPath()
    ctx.ellipse(c.width / 2 + (Math.random() - 0.5) * 30, y, c.width * (0.45 + Math.random() * 0.1), 4 + Math.random() * 10, (Math.random() - 0.5) * 0.08, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  const d = ctx.getImageData(0, 0, c.width, c.height).data
  const sum = [0, 0, 0]
  for (let i = 0; i < d.length; i += 4) {
    sum[0] += d[i]
    sum[1] += d[i + 1]
    sum[2] += d[i + 2]
  }
  const n = d.length / 4
  return rgbToHex([sum[0] / n, sum[1] / n, sum[2] / n])
}

const PAINT = '#3f6aa8'

function PaintAgain() {
  const first = useRef<HTMLCanvasElement>(null)
  const second = useRef<HTMLCanvasElement>(null)
  const [means, setMeans] = useState<[string, string] | null>(null)

  const repaint = useCallback(() => setMeans([paint(first.current!, PAINT), paint(second.current!, PAINT)]), [])
  useEffect(repaint, [repaint])

  return (
    <Step title="The same colour, twice" quote="Color paper permits a repeated use of precisely the same color without the slightest change in tone, light, or surface quality.">
      <p className="mb-6 max-w-2xl text-muted">
        On the left, one blue painted twice. Every coat goes on a little thinner or thicker. On the right, the same blue
        cut twice from paper.
      </p>
      <div className="grid max-w-2xl grid-cols-2 gap-6">
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">Paint</p>
          <div className="flex gap-2">
            <canvas ref={first} width={160} height={200} className="aspect-[4/5] w-1/2 rounded-sm" />
            <canvas ref={second} width={160} height={200} className="aspect-[4/5] w-1/2 rounded-sm" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-muted">Paper</p>
          <div className="flex gap-2">
            <div className="aspect-[4/5] w-1/2 rounded-sm" style={{ background: PAINT }} />
            <div className="aspect-[4/5] w-1/2 rounded-sm" style={{ background: PAINT }} />
          </div>
        </div>
      </div>
      {means && (
        <p className="mt-6 max-w-2xl text-sm text-muted">
          Measured over the whole patch, the two painted blues are {deltaE(means[0], means[1]).toFixed(1)} apart, and
          neither is the blue in the tube. The two papers are 0 apart, every time.
        </p>
      )}
      <Next onClick={repaint}>Paint it again</Next>
    </Step>
  )
}
