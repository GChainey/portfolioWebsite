'use client'

import { useEffect, useState } from 'react'
import { greyOf, lightnessOf, oklchToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'

// Chapter XXIII. Two neighbouring colours at exactly the same lightness lose the edge between them.
// First the clouds Albers points to, then his last exercise: tune a grey-green until its
// triangles dissolve into a grey-violet ground, and measure how close you got.

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="block w-full max-w-sm text-sm text-muted">
      {label}
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 block w-full accent-accent" />
    </label>
  )
}

export function Vanishing() {
  return (
    <div className="space-y-20">
      <Clouds />
      <Triangles />
    </div>
  )
}

const SKY = oklchToHex(0.56, 0.13, 255)

function Clouds() {
  const [shade, setShade] = useState(0.8)
  const under = oklchToHex(shade, 0.006, 255)
  const diff = (shade - lightnessOf(SKY)) * 100

  return (
    <Step n={1} title="Where the cloud ends" quote="These shades merge, or even hinge, with the same but here very close blue. Why very close? This grey is of the same light intensity as the neighboring blue below.">
      <p className="mb-6 max-w-2xl text-muted">
        Cumulus clouds in full sun are white on top and grey underneath. Darken the grey until you can&apos;t see
        where the cloud stops and the sky starts.
      </p>
      <svg viewBox="0 0 400 220" className="w-full max-w-xl rounded-sm ring-1 ring-border" role="img" aria-label="A cloud against blue sky">
        <rect width="400" height="220" fill={SKY} />
        <g fill={under}>
          <ellipse cx="130" cy="140" rx="70" ry="34" />
          <ellipse cx="210" cy="132" rx="90" ry="42" />
          <ellipse cx="290" cy="142" rx="66" ry="30" />
        </g>
        <g fill="#fbfbf8">
          <ellipse cx="150" cy="104" rx="52" ry="40" />
          <ellipse cx="215" cy="86" rx="60" ry="52" />
          <ellipse cx="278" cy="110" rx="46" ry="34" />
          <rect x="110" y="106" width="210" height="16" />
        </g>
      </svg>
      <div className="mt-6">
        <Slider label="The grey under the cloud" value={shade} min={0.35} max={0.95} step={0.002} onChange={setShade} />
      </div>
      <p className="mt-3 text-sm text-foreground">
        {Math.abs(diff) < 1.5
          ? 'Equal in lightness. The lower edge has gone.'
          : `The grey is ${Math.abs(diff).toFixed(0)} points ${diff > 0 ? 'lighter' : 'darker'} than the sky.`}
      </p>
    </Step>
  )
}

const GROUND = oklchToHex(0.58, 0.05, 305)
const GREEN = (L: number) => oklchToHex(L, 0.05, 150)
const VIEWS = [
  { id: 'colour', label: 'Colour' },
  { id: 'grey', label: 'Greyscale' },
  { id: 'blur', label: 'Squint' },
] as const
type View = (typeof VIEWS)[number]['id']

function Pattern({ ground, figure, blur = false }: { ground: string; figure: string; blur?: boolean }) {
  const cols = 7
  const rows = 4
  return (
    <svg viewBox={`0 0 ${cols * 40} ${rows * 40}`} className="w-full rounded-sm ring-1 ring-border" style={blur ? { filter: 'blur(3px)' } : undefined} aria-hidden>
      <rect width={cols * 40} height={rows * 40} fill={ground} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = (i % cols) * 40 + 8
        const y = Math.floor(i / cols) * 40 + 8
        return <polygon key={i} points={`${x},${y + 24} ${x + 12},${y} ${x + 24},${y + 24}`} fill={figure} />
      })}
    </svg>
  )
}

function Triangles() {
  const target = lightnessOf(GROUND)
  const [L, setL] = useState(target)
  const [done, setDone] = useState(false)
  const [view, setView] = useState<View>('grey')

  // Start a little off, at random, once the browser is here
  useEffect(() => {
    setL(target + (Math.random() < 0.5 ? -1 : 1) * (0.08 + Math.random() * 0.08))
  }, [target])

  const figure = GREEN(L)
  const miss = (lightnessOf(figure) - target) * 100
  const shown = done && view === 'grey' ? { ground: greyOf(GROUND), figure: greyOf(figure) } : { ground: GROUND, figure }

  return (
    <Step n={2} title="Make the triangles vanish" quote="I invite serious color students to alter the reproduced grey-violet and grey-green of this study toward equal light-intensity so that the small triangles of the underlying design almost dissolve into the ground. It is a most difficult task, but worth trying.">
      <p className="mb-6 max-w-2xl text-muted">
        The hue stays put. Change only the lightness of the grey-green until the triangles are as hard to see as
        you can make them. It takes patience. Look away now and then and come back.
      </p>
      <div className="max-w-xl">
        <Pattern ground={shown.ground} figure={shown.figure} blur={done && view === 'blur'} />
      </div>

      {!done ? (
        <>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <Slider label="Lightness of the triangles" value={L} min={0.3} max={0.86} step={0.001} onChange={setL} />
            <div className="flex gap-2">
              {[
                { d: -0.002, label: 'Slightly darker' },
                { d: 0.002, label: 'Slightly lighter' },
              ].map(({ d, label }) => (
                <button key={label} onClick={() => setL((l) => l + d)} className="rounded border border-border px-3 py-1.5 text-sm text-muted hover:text-foreground">
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Next onClick={() => setDone(true)}>They&apos;ve vanished</Next>
        </>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {Math.abs(miss) < 1
              ? `Within ${Math.abs(miss).toFixed(1)} points of equal. That is about as close as an eye gets.`
              : `Your triangles are ${Math.abs(miss).toFixed(1)} points ${miss > 0 ? 'lighter' : 'darker'} than the ground.`}
          </p>
          <p className="mt-2 text-sm text-muted">
            Albers checked with an after-image, because a camera gets lightness wrong. A screen can measure it. In
            greyscale only lightness is left, so any edge you still see there is a lightness difference.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Segmented value={view} options={[...VIEWS]} onChange={setView} />
            <button onClick={() => setL(target)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
              Set them exactly equal
            </button>
            <button onClick={() => setDone(false)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
              Keep adjusting
            </button>
          </div>
        </div>
      )}
    </Step>
  )
}
