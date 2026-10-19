'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { hexToOklab, oklabToHex, oklchToHex } from '@/lib/color'
import { Segmented, Step } from './parts'

// Chapter XIX. Albers' class turned paintings into colour paper to learn their instrumentation:
// which colours, how much of each, not the brushwork. Here a painting is sorted into a few flat
// papers by clustering its colours, and then you choose the papers yourself and compare.

type Lab = [number, number, number]

const toLin = (c: number) => {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
function rgbToLab(r: number, g: number, b: number): Lab {
  ;[r, g, b] = [toLin(r), toLin(g), toLin(b)]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]
}
const dist = (p: Lab, q: Lab) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
}

// k-means in OKLab, started k-means++ style from a fixed seed so the same painting gives the same papers
function cluster(pixels: Lab[], k: number): Lab[] {
  const r = rng(42)
  const sample = Array.from({ length: Math.min(4000, pixels.length) }, () => pixels[Math.floor(r() * pixels.length)])
  const centres: Lab[] = [sample[Math.floor(r() * sample.length)]]
  while (centres.length < k) {
    const d = sample.map((p) => Math.min(...centres.map((c) => dist(p, c))))
    let x = r() * d.reduce((a, b) => a + b, 0)
    let i = 0
    while (i < d.length - 1 && x > d[i]) x -= d[i++]
    centres.push(sample[i])
  }
  for (let iter = 0; iter < 12; iter++) {
    const sums = centres.map(() => [0, 0, 0, 0])
    for (const p of sample) {
      const s = sums[nearest(p, centres)]
      s[0] += p[0]
      s[1] += p[1]
      s[2] += p[2]
      s[3]++
    }
    sums.forEach((s, i) => s[3] && (centres[i] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]))
  }
  return centres
}

function nearest(p: Lab, centres: Lab[]) {
  let best = 0
  for (let i = 1; i < centres.length; i++) if (dist(p, centres[i]) < dist(p, centres[best])) best = i
  return best
}

// Paint every pixel with its nearest paper, then smooth away specks so the areas read as cut paper
function paperise(pixels: Lab[], w: number, h: number, papers: Lab[]) {
  let labels = pixels.map((p) => nearest(p, papers))
  for (let pass = 0; pass < 2; pass++) {
    const next = labels.slice()
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const count = new Map<number, number>()
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const l = labels[(y + dy) * w + x + dx]
          count.set(l, (count.get(l) ?? 0) + 1)
        }
        let top = labels[y * w + x]
        count.forEach((n, l) => n > (count.get(top) ?? 0) && (top = l))
        next[y * w + x] = top
      }
    }
    labels = next
  }
  const area = papers.map(() => 0)
  labels.forEach((l) => area[l]++)
  return { labels, area: area.map((a) => a / labels.length) }
}

// Paintings to start with, painted on the spot: stand-ins until you bring your own reproduction
const DEFAULTS = [
  { id: 'night', label: 'Night sky' },
  { id: 'interior', label: 'Red interior' },
  { id: 'sunset', label: 'Sunset fields' },
] as const
type DefaultId = (typeof DEFAULTS)[number]['id']

function paintDefault(ctx: CanvasRenderingContext2D, id: DefaultId, w: number, h: number) {
  const r = rng(id.length * 977 + 3)
  const stroke = (x: number, y: number, len: number, angle: number, width: number, color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }
  const jitter = (hex: string, amt = 0.04) => {
    const [L, a, b] = hexToOklab(hex)
    return oklabToHex(L + (r() - 0.5) * amt * 2, a + (r() - 0.5) * amt, b + (r() - 0.5) * amt)
  }
  if (id === 'night') {
    ctx.fillStyle = '#1d3461'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 1800; i++) {
      const x = r() * w
      const y = r() * h * 0.75
      const a = Math.sin(x / 40) + Math.cos(y / 30)
      stroke(x, y, 10, a, 4, jitter(r() < 0.75 ? '#2c5aa0' : '#7aa5d6', 0.06))
    }
    for (let s = 0; s < 9; s++) {
      const cx = r() * w
      const cy = r() * h * 0.5
      for (let i = 0; i < 60; i++) stroke(cx, cy, 6 + r() * 14, r() * Math.PI * 2, 3, jitter(i % 3 ? '#f2d64b' : '#fff3b0'))
    }
    ctx.fillStyle = '#efc94c'
    ctx.beginPath()
    ctx.arc(w * 0.85, h * 0.15, w * 0.06, 0, Math.PI * 2)
    ctx.fill()
    for (let i = 0; i < 900; i++) stroke(r() * w, h * 0.72 + r() * h * 0.28, 8, -0.2, 4, jitter(r() < 0.6 ? '#22334a' : '#3e5c3a', 0.05))
    for (let i = 0; i < 500; i++) {
      const y = h * 0.2 + r() * h * 0.8
      stroke(w * 0.15 + (r() - 0.5) * w * 0.12 * ((y - h * 0.2) / h), y, 14, -Math.PI / 2 + (r() - 0.5) * 0.6, 5, jitter('#1b2a1a', 0.05))
    }
  } else if (id === 'interior') {
    ctx.fillStyle = '#b8282b'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c63a2e'
    ctx.fillRect(0, h * 0.62, w, h * 0.38)
    ctx.fillStyle = '#2f5d8a'
    for (let i = 0; i < 14; i++) {
      ctx.beginPath()
      ctx.ellipse(r() * w, r() * h, 12 + r() * 20, 6 + r() * 10, r() * 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#e9e2cf'
    ctx.fillRect(w * 0.58, h * 0.08, w * 0.3, h * 0.36)
    ctx.fillStyle = '#4f8a4b'
    ctx.fillRect(w * 0.6, h * 0.1, w * 0.26, h * 0.32)
    ctx.fillStyle = '#e8b33a'
    ctx.fillRect(w * 0.1, h * 0.5, w * 0.34, h * 0.06)
    ctx.fillStyle = '#e9e2cf'
    ctx.beginPath()
    ctx.arc(w * 0.27, h * 0.45, w * 0.05, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1f1c1c'
    ctx.fillRect(w * 0.08, h * 0.56, w * 0.02, h * 0.3)
    ctx.fillRect(w * 0.42, h * 0.56, w * 0.02, h * 0.3)
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55)
    sky.addColorStop(0, '#3b2c5e')
    sky.addColorStop(0.6, '#d9644a')
    sky.addColorStop(1, '#f2b45a')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ffe08a'
    ctx.beginPath()
    ctx.arc(w * 0.35, h * 0.5, w * 0.08, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#4a2f4f'
    ctx.beginPath()
    ctx.moveTo(0, h * 0.55)
    for (let x = 0; x <= w; x += 10) ctx.lineTo(x, h * 0.52 + Math.sin(x / 50) * h * 0.04)
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.fill()
    for (let i = 0; i < 2500; i++) {
      const y = h * 0.6 + r() * h * 0.4
      stroke(r() * w, y, 6 + (y / h) * 10, -Math.PI / 2 + (r() - 0.5) * 0.5, 3, jitter(r() < 0.5 ? '#c9a23a' : r() < 0.6 ? '#7d6a2a' : '#a8462f', 0.05))
    }
  }
}

const W = 320

// Albers' students cut from a paper collection, not from the painting. The collection is fixed: ten
// hues at four strengths, and eight greys. You match by eye, and the paper is never exactly the
// reproduction's colour, which is the point.
const COLLECTION: string[] = [
  ...[[0.35, 0.08], [0.55, 0.15], [0.72, 0.13], [0.86, 0.06]].flatMap(([L, C]) => Array.from({ length: 10 }, (_, i) => oklchToHex(L, C, 20 + i * 36))),
  ...[0.12, 0.25, 0.38, 0.5, 0.62, 0.74, 0.86, 0.97].map((L) => oklchToHex(L, 0.005, 80)),
]

// The climate of a set of pixels: how light, how much light varies, how intense, how warm.
// Warmth leans towards red and yellow (positive a and b) or towards blue and green.
interface Climate {
  light: number
  spread: number
  intensity: number
  warmth: number
}
function climateOf(colors: Lab[]): Climate {
  const n = colors.length || 1
  const light = colors.reduce((a, p) => a + p[0], 0) / n
  const spread = Math.sqrt(colors.reduce((a, p) => a + (p[0] - light) ** 2, 0) / n)
  const intensity = colors.reduce((a, p) => a + Math.hypot(p[1], p[2]), 0) / n
  const warmth = colors.reduce((a, p) => a + 0.5 * p[1] + p[2], 0) / n
  return { light, spread, intensity, warmth }
}
const climateOfMosaic = (labels: number[], papers: Lab[]) => climateOf(labels.map((l) => papers[l]))

// How far two climates are apart, scaled so 1 is about the smallest change you would notice in a picture
const CLIMATE_UNIT = { light: 0.04, spread: 0.03, intensity: 0.02, warmth: 0.02 }
function climateGap(a: Climate, b: Climate) {
  return (Object.keys(CLIMATE_UNIT) as (keyof Climate)[]).map((key) => ({ key, gap: (b[key] - a[key]) / CLIMATE_UNIT[key] }))
}
const CLIMATE_WORDS: Record<keyof Climate, [string, string]> = {
  light: ['darker', 'lighter'],
  spread: ['flatter in light', 'more contrasty'],
  intensity: ['duller', 'more intense'],
  warmth: ['cooler', 'warmer'],
}

function useSource() {
  const [source, setSource] = useState<{ pixels: Lab[]; w: number; h: number; url: string } | null>(null)
  const read = useCallback((draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, aspect: number) => {
    const c = document.createElement('canvas')
    c.width = W
    c.height = Math.round(W * aspect)
    const ctx = c.getContext('2d')!
    draw(ctx, c.width, c.height)
    const d = ctx.getImageData(0, 0, c.width, c.height).data
    const pixels: Lab[] = []
    for (let i = 0; i < d.length; i += 4) pixels.push(rgbToLab(d[i], d[i + 1], d[i + 2]))
    setSource({ pixels, w: c.width, h: c.height, url: c.toDataURL() })
  }, [])
  return { source, read }
}

function Mosaic({ labels, papers, w, h, label }: { labels: number[]; papers: Lab[]; w: number; h: number; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')!
    const img = ctx.createImageData(w, h)
    const rgb = papers.map((p) => {
      const n = parseInt(oklabToHex(...p).slice(1), 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    })
    labels.forEach((l, i) => {
      img.data.set([...rgb[l], 255], i * 4)
    })
    ctx.putImageData(img, 0, 0)
  }, [labels, papers, w, h])
  return <canvas ref={ref} role="img" aria-label={label} className="w-full rounded-sm ring-1 ring-border" />
}

function Instrumentation({ papers, area }: { papers: Lab[]; area: number[] }) {
  const order = papers.map((_, i) => i).sort((a, b) => area[b] - area[a])
  return (
    <div className="flex h-10 overflow-hidden rounded-sm ring-1 ring-border" role="img" aria-label="The papers, sized by how much of the painting each covers">
      {order.map((i) => (
        <div key={i} title={`${Math.round(area[i] * 100)}%`} style={{ flexGrow: area[i], background: oklabToHex(...papers[i]) }} />
      ))}
    </div>
  )
}

function ClimateReport({ painting, yours, machine }: { painting: Climate; yours: Climate; machine: Climate }) {
  const gaps = climateGap(painting, yours)
  const off = gaps.filter((g) => Math.abs(g.gap) >= 1.5).sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
  const total = (gs: { gap: number }[]) => Math.hypot(...gs.map((g) => g.gap))
  const yoursAway = total(gaps)
  const machineAway = total(climateGap(painting, machine))
  return (
    <div className="pt-4" data-climate-off={off.length}>
      <p className="text-foreground">
        {off.length === 0
          ? 'Your papers keep the painting\'s climate: its light, its contrast, its intensity and its warmth.'
          : `Your version is ${off.map((g) => CLIMATE_WORDS[g.key][g.gap > 0 ? 1 : 0]).join(', ')} than the painting.`}
      </p>
      <p className="mt-2 text-sm text-muted">
        {yoursAway <= machineAway
          ? 'That is closer to the painting\'s climate than the machine got.'
          : 'The machine is closer in climate. It may be missing what you saw, though. Albers asked for the feel, not the numbers.'}
      </p>
    </div>
  )
}

export function Masters() {
  const { source, read } = useSource()
  const [which, setWhich] = useState<DefaultId | 'yours'>('night')
  const [k, setK] = useState(6)
  const [mine, setMine] = useState<Lab[]>([])

  useEffect(() => {
    if (which !== 'yours') read((ctx, w, h) => paintDefault(ctx, which, w, h), 0.75)
    setMine([])
  }, [which, read])

  const upload = (file: File) => {
    const img = new Image()
    img.onload = () => {
      read((ctx, w, h) => ctx.drawImage(img, 0, 0, w, h), img.height / img.width)
      URL.revokeObjectURL(img.src)
      setWhich('yours')
    }
    img.src = URL.createObjectURL(file)
  }

  const machine = useMemo(() => {
    if (!source) return null
    const papers = cluster(source.pixels, k)
    return { papers, ...paperise(source.pixels, source.w, source.h, papers) }
  }, [source, k])
  const yours = useMemo(() => (source && mine.length > 1 ? { papers: mine, ...paperise(source.pixels, source.w, source.h, mine) } : null), [source, mine])

  const [probe, setProbe] = useState<{ x: number; y: number; color: Lab } | null>(null)
  const pick = (e: MouseEvent<HTMLImageElement>) => {
    if (!source) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = Math.floor(((e.clientX - r.left) / r.width) * source.w)
    const y = Math.floor(((e.clientY - r.top) / r.height) * source.h)
    // A small patch, the way the eye averages brushwork into one colour
    const patch: Lab[] = []
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const p = source.pixels[Math.min(source.h - 1, Math.max(0, y + dy)) * source.w + Math.min(source.w - 1, Math.max(0, x + dx))]
      patch.push(p)
    }
    const avg = [0, 1, 2].map((i) => patch.reduce((a, p) => a + p[i], 0) / patch.length) as Lab
    setProbe({ x: (x / source.w) * 100, y: (y / source.h) * 100, color: avg })
  }
  const addPaper = (hex: string) => {
    const lab = hexToOklab(hex) as Lab
    setMine((m) => (m.some((p) => oklabToHex(...p) === hex) ? m : [...m, lab].slice(0, 10)))
  }
  const climates = useMemo(() => {
    if (!source || !machine) return null
    return {
      painting: climateOf(source.pixels),
      machine: climateOfMosaic(machine.labels, machine.papers),
      yours: yours ? climateOfMosaic(yours.labels, yours.papers) : null,
    }
  }, [source, machine, yours])

  return (
    <div className="space-y-20">
      <Step n={1} title="A painting in paper" quote="We transfer paintings by masters into color paper, in order to identify their color instrumentation.">
        <p className="mb-6 max-w-2xl text-muted">
          Start with one of these painted stand-ins, or bring a reproduction of a painting you love. The screen sorts
          every pixel into a few flat papers. Albers wanted the climate of a painting, not its details, so fewer papers
          is often truer.
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Segmented value={which} options={[...DEFAULTS, ...(which === 'yours' ? [{ id: 'yours' as const, label: 'Yours' }] : [])]} onChange={setWhich} />
          <label className="cursor-pointer rounded border border-border px-3 py-1.5 text-sm text-foreground hover:border-accent hover:text-accent">
            Use your own painting
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </div>
        <p className="mb-6 text-xs text-muted">Your image stays in your browser. Nothing is uploaded.</p>
        {source && machine && (
          <>
            <div className="grid gap-6 sm:grid-cols-2">
              <figure>
                <img src={source.url} alt="The painting" className="w-full rounded-sm ring-1 ring-border" />
                <figcaption className="mt-2 text-sm text-muted">The reproduction</figcaption>
              </figure>
              <figure>
                <Mosaic labels={machine.labels} papers={machine.papers} w={source.w} h={source.h} label={`The painting in ${k} papers`} />
                <figcaption className="mt-2 text-sm text-muted">In {k} papers</figcaption>
              </figure>
            </div>
            <label className="mt-6 block max-w-md text-sm text-muted">
              Number of papers: {k}
              <input type="range" min={2} max={16} value={k} onChange={(e) => setK(+e.target.value)} className="mt-2 block w-full accent-accent" />
            </label>
          </>
        )}
      </Step>

      {source && machine && (
        <Step n={2} title="Its instrumentation" quote="We try to give a general impression only as to climate, temperature, aroma, or sound of their work—not minute details.">
          <p className="mb-6 max-w-2xl text-muted">
            The same papers, sized by how much of the painting each one covers. This is the painter&apos;s
            instrumentation, which colours and how much of each. Try two papers, then sixteen, and see when the climate
            of the painting arrives.
          </p>
          <div className="max-w-2xl">
            <Instrumentation papers={machine.papers} area={machine.area} />
          </div>
        </Step>
      )}

      {source && machine && (
        <Step n={3} title="Choose the papers yourself" quote="It is another means of learning to develop a sensitive and critical eye for color relatedness.">
          <p className="mb-6 max-w-2xl text-muted">
            A machine picks the colours that cover the most. A painter might pick a small yellow that carries the whole
            picture. Albers&apos; students worked from a box of papers, not from the painting. Tap the painting to look
            closely at a spot, then choose the nearest paper from the collection. You will rarely find an exact match.
            Aim for the climate, not the details.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <figure>
              <div className="relative">
                <img src={source.url} alt="The painting. Tap to look closely at a spot." onClick={pick} className="w-full cursor-crosshair rounded-sm ring-1 ring-border" />
                {probe && <span className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white" style={{ left: `${probe.x}%`, top: `${probe.y}%` }} />}
              </div>
              <figcaption className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                {probe ? (
                  <>
                    <span className="h-6 w-10 rounded-sm ring-1 ring-border" style={{ background: oklabToHex(...probe.color) }} />
                    The painting there
                  </>
                ) : (
                  'Tap the painting to look at a spot'
                )}
              </figcaption>
            </figure>
            <figure>
              {yours ? (
                <Mosaic labels={yours.labels} papers={yours.papers} w={source.w} h={source.h} label="The painting in your papers" />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-sm text-sm text-muted ring-1 ring-border">Choose two or more papers</div>
              )}
              <figcaption className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                {mine.length === 0 ? 'Your papers will show here' : `Your ${mine.length} papers:`}
                {mine.map((p, i) => (
                  <button key={i} onClick={() => setMine((m) => m.filter((_, j) => j !== i))} aria-label="Remove this paper" title="Remove" className="h-6 w-6 rounded-sm ring-1 ring-border" style={{ background: oklabToHex(...p) }} />
                ))}
              </figcaption>
            </figure>
          </div>
          <div className="mt-6 max-w-2xl">
            <p className="mb-2 text-sm text-muted">The paper collection. Tap a paper to use it. Up to ten.</p>
            <div className="grid grid-cols-10 gap-1" data-collection={COLLECTION.length}>
              {COLLECTION.map((hex) => (
                <button key={hex} onClick={() => addPaper(hex)} aria-label={`Paper ${hex}`} className="aspect-square rounded-sm ring-1 ring-border hover:ring-2 hover:ring-accent" style={{ background: hex }} />
              ))}
            </div>
          </div>
          {yours && climates?.yours && (
            <div className="mt-8 max-w-2xl space-y-3">
              <p className="text-sm text-foreground">Yours</p>
              <Instrumentation papers={yours.papers} area={yours.area} />
              <p className="pt-2 text-sm text-foreground">The machine&apos;s, with {k} papers</p>
              <Instrumentation papers={machine.papers} area={machine.area} />
              <ClimateReport painting={climates.painting} yours={climates.yours} machine={climates.machine} />
            </div>
          )}
        </Step>
      )}
    </div>
  )
}
