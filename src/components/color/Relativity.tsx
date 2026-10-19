'use client'

import { useCallback, useEffect, useState } from 'react'
import { deltaE, hexToHsv, hexToOklab } from '@/lib/color'
import { Next, Segmented, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'
import { Plate, Tiles, type Study } from './Plate'

// Chapter IV. One colour made to look like two by the grounds around it. First Albers' kind of
// plate, then a test that measures how far the grounds move your eye, then your own study.

const PRESETS: { id: string; label: string; study: Study }[] = [
  { id: 'light', label: 'Light', study: { left: '#141414', right: '#f2f0ea', inner: '#8a8780' } },
  { id: 'hue', label: 'Hue', study: { left: '#e2902c', right: '#2f6db0', inner: '#a69a88' } },
  { id: 'both', label: 'Light and hue', study: { left: '#3a2458', right: '#f0d36a', inner: '#9a7f69' } },
]

const lightness = (hex: string) => hexToOklab(hex)[0]

export function Relativity() {
  return (
    <div className="space-y-20">
      <TwoFaces />
      <Match />
      <YourStudy />
    </div>
  )
}

function TwoFaces() {
  const [presetId, setPresetId] = useState(PRESETS[0].id)
  const [joined, setJoined] = useState(false)
  const preset = PRESETS.find((p) => p.id === presetId)!

  return (
    <Step n={1} title="One colour, two faces" quote="To begin the study of how color deceives and how to make use of this, the first exercise is to make one and the same color look different.">
      <p className="mb-6 max-w-2xl text-muted">
        The two small rectangles are the same colour, {preset.study.inner}. Albers names two ways a ground changes a
        colour, through light and through hue. Join the rectangles to check they match.
      </p>
      <div className="mb-6 flex flex-wrap items-center gap-6">
        <Segmented value={presetId} options={PRESETS} onChange={(id) => { setPresetId(id); setJoined(false) }} />
        <button onClick={() => setJoined((j) => !j)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
          {joined ? 'Separate them' : 'Join them'}
        </button>
      </div>
      <Plate study={preset.study} joined={joined} className="max-w-xl" />
    </Step>
  )
}

// The rectangle on the right starts a little off, and you set it to look like the one on the left
function startFor(inner: string): HSV {
  const hsv = hexToHsv(inner)
  const nudge = (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.08)
  return { ...hsv, v: Math.min(1, Math.max(0, hsv.v + nudge)) }
}

function Match() {
  const [round, setRound] = useState(0)
  const preset = PRESETS[round % PRESETS.length]
  const [guess, setGuess] = useState<HSV>(() => hexToHsv(preset.study.inner))
  const [done, setDone] = useState(false)

  // A random start has to wait for the browser, or the server and client disagree
  useEffect(() => {
    setGuess(startFor(preset.study.inner))
    setDone(false)
  }, [preset])

  const { left, right, inner } = preset.study
  const made = hsvHex(guess)
  const miss = deltaE(made, inner)
  const shift = lightness(made) - lightness(inner)
  const rightIsLighter = lightness(right) > lightness(left)

  return (
    <Step n={2} title="How far does it move?" quote={'They lead us to "see" and to "read" other colors than those with which we are confronted physically.'}>
      <p className="mb-6 max-w-2xl text-muted">
        Here the right rectangle is yours. Change it until it looks the same as the left one. Knowing the trick
        doesn&apos;t stop it working.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <Plate study={preset.study} rightInner={made} className="w-full max-w-md" />
        {!done && <Picker value={guess} onChange={setGuess} />}
      </div>

      {!done ? (
        <Next onClick={() => setDone(true)}>They look the same</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            They were the same colour, {inner}. You set yours to {made},{' '}
            {miss < 1.5 ? 'almost exactly the same.' : `${Math.abs(shift) < 0.01 ? 'a different hue' : shift > 0 ? 'lighter' : 'darker'} by ${miss.toFixed(1)}.`}
          </p>
          <p className="mt-2 text-sm text-muted">
            The right ground is {rightIsLighter ? 'lighter' : 'darker'} than the left, which makes the rectangle on
            it look {rightIsLighter ? 'darker' : 'lighter'}. So a match usually needs it set{' '}
            {rightIsLighter ? 'lighter' : 'darker'} than the real colour.
          </p>
          <div className="mt-6 flex max-w-sm gap-3 bg-[#808080] p-3">
            {[
              { hex: inner, label: 'The real colour' },
              { hex: made, label: 'Yours' },
            ].map(({ hex, label }) => (
              <figure key={label} className="flex-1">
                <div className="h-16" style={{ background: hex }} />
                <figcaption className="mt-1 text-xs text-white">{label}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">The two side by side on a neutral grey.</p>
          <Next onClick={() => setRound((r) => r + 1)}>Try another pair of grounds</Next>
        </div>
      )}
    </Step>
  )
}

const EDIT = [
  { id: 'left', label: 'Left ground' },
  { id: 'inner', label: 'Rectangles' },
  { id: 'right', label: 'Right ground' },
] as const
type Part = (typeof EDIT)[number]['id']

function YourStudy() {
  const [study, setStudy] = useState<Study>({ left: '#5b6b3a', right: '#c9b6d6', inner: '#8f8a6e' })
  const [part, setPart] = useState<Part>('inner')
  const [joined, setJoined] = useState(false)
  const [tiles, setTiles] = useState(false)
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(study.inner))
  const [sent, setSent] = useState(false)
  const [exhibition, setExhibition] = useState<{ shared: boolean; studies: Study[] } | null>(null)

  const choose = (p: Part) => {
    setPart(p)
    setHsv(hexToHsv(study[p]))
  }
  const change = (next: HSV) => {
    setHsv(next)
    setStudy((s) => ({ ...s, [part]: hsvHex(next) }))
    setSent(false)
  }

  const load = useCallback(() => {
    fetch('/api/color/studies')
      .then((r) => r.json())
      .then(setExhibition)
      .catch(() => setExhibition({ shared: false, studies: [] }))
  }, [])
  useEffect(load, [load])

  const send = async () => {
    setSent(true)
    await fetch('/api/color/studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(study),
    }).catch(() => null)
    load()
  }

  return (
    <>
      <Step n={3} title="Make your own" quote="As a practical study we ask that 2 small rectangles of the same color and the same size be placed on large grounds of very different color.">
        <p className="mb-6 max-w-2xl text-muted">
          Albers&apos; class worked this out by trial and error, with no rules to start from. Pick a part, change its
          colour, and join the rectangles to check your result. Muted colours change the most.
        </p>
        <div className="flex flex-wrap items-start gap-8">
          <div className="w-full max-w-md">
            {tiles ? <Tiles study={study} /> : <Plate study={study} joined={joined} />}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <button onClick={() => setJoined((j) => !j)} disabled={tiles} className="text-foreground underline underline-offset-4 hover:text-accent disabled:opacity-40">
                {joined ? 'Separate them' : 'Join them'}
              </button>
              <button onClick={() => setTiles((t) => !t)} className="text-foreground underline underline-offset-4 hover:text-accent">
                {tiles ? 'Back to the pair' : 'Show as tiles'}
              </button>
            </div>
          </div>
          <div className="w-full max-w-[22rem]">
            <div className="mb-4">
              <Segmented value={part} options={[...EDIT]} onChange={choose} />
            </div>
            <Picker value={hsv} onChange={change} />
          </div>
        </div>
        {tiles && (
          <blockquote className="mt-8 max-w-2xl font-serif text-lg italic leading-relaxed text-muted">
            Such studies shown separately in pairs may demonstrate clearly the desired effects. But interlocked in the
            tile pattern opposite, their illusional effects annul each other.
          </blockquote>
        )}
        <Next onClick={send} disabled={sent}>
          {sent ? 'Added' : 'Add it to the exhibition'}
        </Next>
      </Step>

      <Step n={4} title="The exhibition" quote="Soon, these first trials are collected and separated into groups of more and less promise.">
        {!exhibition ? null : !exhibition.shared ? (
          <p className="text-sm text-muted">Everyone&apos;s studies will show here once the site is connected to its database.</p>
        ) : exhibition.studies.length === 0 ? (
          <p className="text-sm text-muted">No studies yet. Yours can be the first.</p>
        ) : (
          <>
            <p className="mb-6 text-muted">Studies from other visitors, newest first. Hover over one to join its rectangles.</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {exhibition.studies.map((s, i) => (
                <HoverPlate key={i} study={s} />
              ))}
            </div>
          </>
        )}
      </Step>
    </>
  )
}

function HoverPlate({ study }: { study: Study }) {
  const [joined, setJoined] = useState(false)
  return (
    <button onMouseEnter={() => setJoined(true)} onMouseLeave={() => setJoined(false)} onFocus={() => setJoined(true)} onBlur={() => setJoined(false)} aria-label="Join the rectangles">
      <Plate study={study} joined={joined} />
    </button>
  )
}
