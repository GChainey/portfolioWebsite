'use client'

import { useEffect, useRef, useState } from 'react'
import { hexToOklab, hexToOklch, oklabToHex, oklchToHex } from '@/lib/color'
import { Next, Segmented, Step, Swatch } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'

// Chapter VIII. The cause of most colour illusions: the after-image. Albers had his class stare at a
// paper circle and then move their eyes to a white one. A screen can swap the image under your eyes
// at exactly the right moment, so the after-image lands where you're already looking.

const COLOURS = [
  { id: 'red', label: 'Red', hex: '#e0301e' },
  { id: 'yellow', label: 'Yellow', hex: '#f6d21c' },
  { id: 'blue', label: 'Blue', hex: '#1d4fd8' },
  { id: 'green', label: 'Green', hex: '#1f9a48' },
  { id: 'own', label: 'Your own', hex: '' },
  { id: 'new', label: 'New colour', hex: '' },
] as const
type ColourId = (typeof COLOURS)[number]['id']

const DURATIONS = [
  { id: '15', label: '15 seconds' },
  { id: '30', label: '30 seconds' },
] as const

// Roughly what the eye sees afterwards: a pale colour on the opposite side of the hue circle
function predicted(hex: string) {
  const [, a, b] = hexToOklab(hex)
  return oklabToHex(0.86, -a * 0.35, -b * 0.35)
}

// A match counts if its hue is within this many degrees of the opposite of the stared colour
const MATCH_DEG = 45
const MATCH_L = 0.86
const MATCH_C = 0.07
const matchHex = (h: number) => oklchToHex(MATCH_L, MATCH_C, h)
const opposite = (hex: string) => (hexToOklch(hex)[2] + 180) % 360
const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360
  return Math.round(d > 180 ? 360 - d : d)
}

function newColour() {
  return oklchToHex(0.55 + Math.random() * 0.15, 0.14 + Math.random() * 0.06, Math.random() * 360)
}

type Phase = 'idle' | 'staring' | 'after'

// A countdown that flips to 'after' at zero. The swap happens in one frame.
function useStare(seconds: number) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [left, setLeft] = useState(seconds)
  const timer = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => () => clearInterval(timer.current), [])

  const start = () => {
    clearInterval(timer.current)
    const end = Date.now() + seconds * 1000
    setLeft(seconds)
    setPhase('staring')
    timer.current = setInterval(() => {
      const remaining = Math.ceil((end - Date.now()) / 1000)
      if (remaining <= 0) {
        clearInterval(timer.current)
        setPhase('after')
      } else setLeft(remaining)
    }, 100)
  }
  const reset = () => {
    clearInterval(timer.current)
    setPhase('idle')
    setLeft(seconds)
  }
  return { phase, left, start, reset }
}

export function AfterImage() {
  return (
    <div className="space-y-20">
      <RedCircle />
      <Diamonds />
      <Simultaneous />
    </div>
  )
}

function Dot() {
  return <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
}

function Countdown({ phase, left, after }: { phase: Phase; left: number; after: string }) {
  return (
    <p className="mt-4 h-6 text-sm text-foreground" aria-live="polite">
      {phase === 'staring' ? `Keep looking at the dot. ${left}` : phase === 'after' ? after : ''}
    </p>
  )
}

function RedCircle() {
  const [colourId, setColourId] = useState<ColourId>('red')
  const [own, setOwn] = useState<HSV>({ h: 280, s: 0.8, v: 0.75 })
  const [fresh, setFresh] = useState('#c23a8a')
  const [duration, setDuration] = useState<'15' | '30'>('30')
  const [inPlace, setInPlace] = useState(true)
  const [hue, setHue] = useState(0)
  const [checked, setChecked] = useState(false)
  const [round, setRound] = useState(0)
  const { phase, left, start, reset } = useStare(Number(duration))

  // A new colour is drawn after mount so the server and client render the same thing
  useEffect(() => {
    if (colourId === 'new') setFresh(newColour())
  }, [colourId, round])

  const predicting = colourId === 'new'
  const hex = colourId === 'own' ? hsvHex(own) : predicting ? fresh : COLOURS.find((c) => c.id === colourId)!.hex
  const after = phase === 'after'
  // In place: the coloured circle itself turns white. Albers' way: you move your eyes to the right.
  const leftFill = after && inPlace ? '#ffffff' : hex
  const gap = hueGap(hue, opposite(hex))
  const pick = (id: ColourId) => { setColourId(id); setChecked(false); reset() }
  const again = () => { setChecked(false); start() }

  const hueSlider = (label: string) => (
    <div className="mt-6 max-w-md">
      <p className="mb-3 text-sm text-foreground">{label}</p>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-full border border-border" style={{ background: matchHex(hue) }} />
        <input
          type="range"
          min={0}
          max={359}
          step={1}
          value={hue}
          onChange={(e) => { setHue(Number(e.target.value)); setChecked(false) }}
          aria-label="Hue of the pale tint"
          className="w-full accent-accent"
        />
      </div>
    </div>
  )

  return (
    <Step title="Stare, then look at white" quote="Now, by staring steadily at the marked center of the red circle (up to half a minute) one soon discovers how difficult it is to keep the eye fixed on a point.">
      <p className="mb-6 max-w-2xl text-muted">
        Choose a colour and press start. Look only at the dot in the coloured circle until the countdown ends. Albers&apos;
        class then moved their eyes to the white circle. Here the screen can turn the coloured circle white for you, at
        the exact moment, so you don&apos;t have to move. Then set the tint you saw.
      </p>
      <div className="mb-6 flex flex-wrap items-center gap-6">
        <Segmented value={colourId} options={COLOURS.map(({ id, label }) => ({ id, label }))} onChange={pick} />
        <Segmented value={duration} options={[...DURATIONS]} onChange={(d) => { setDuration(d); reset() }} />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={inPlace} onChange={(e) => setInPlace(e.target.checked)} className="accent-accent" />
          Swap it in place
        </label>
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-full max-w-xl">
          <div className="flex aspect-[2/1] items-center justify-around rounded-sm bg-black px-[8%]">
            <div className="relative aspect-square w-[34%] rounded-full" style={{ background: leftFill }} data-testid="stare-circle">
              <Dot />
            </div>
            {!inPlace && (
              <div className="relative aspect-square w-[34%] rounded-full bg-white">
                <Dot />
              </div>
            )}
          </div>
          <Countdown
            phase={phase}
            left={left}
            after={inPlace ? 'Now keep looking at the same dot.' : 'Now look at the dot in the white circle.'}
          />
        </div>
        {colourId === 'own' && phase === 'idle' && <Picker value={own} onChange={setOwn} />}
      </div>

      {predicting && phase === 'idle' && hueSlider('Before you stare, set the tint you expect to see afterwards.')}

      {phase === 'idle' && <Next onClick={start}>Start staring</Next>}
      {phase === 'staring' && <Next onClick={reset}>Stop</Next>}
      {after && (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          {!predicting && hueSlider('The tint fades in a few seconds. Set the colour you saw as closely as you can.')}
          {predicting && <p className="text-foreground">Was it the tint you predicted? Check it.</p>}
          {!checked ? (
            <Next onClick={() => setChecked(true)}>{predicting ? 'Check my prediction' : 'Check my match'}</Next>
          ) : (
            <>
              <p className="mt-6 text-foreground" data-testid="match-result">
                {gap <= MATCH_DEG
                  ? `Your tint is ${gap}° from the opposite of what you stared at. That counts as the after-image.`
                  : `Your tint is ${gap}° from the opposite of what you stared at. To count, get it within ${MATCH_DEG}°.`}
              </p>
              <div className="mt-6 flex flex-wrap gap-6">
                <Swatch hex={hex} label="What you stared at" />
                <Swatch hex={matchHex(hue)} label={predicting ? 'Your prediction' : 'Your match'} />
                <Swatch hex={predicted(hex)} label="Roughly what most people see after" />
              </div>
            </>
          )}
          <div className="flex flex-wrap gap-4">
            <Next onClick={again}>Try it again</Next>
            <Next onClick={() => { setColourId('new'); setRound((r) => r + 1); setChecked(false); reset() }}>
              {predicting ? 'Another new colour' : 'Predict a new colour'}
            </Next>
          </div>
        </div>
      )}
    </Step>
  )
}

// Yellow circles that touch and fill a white square. The leftover white between them is diamond shaped.
function CirclesSquare({ circles, size = 4 }: { circles: boolean; size?: number }) {
  return (
    <div className="relative grid aspect-square w-[38%] bg-white" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {Array.from({ length: size * size }, (_, i) => (
        <div key={i} className="aspect-square rounded-full" style={{ background: circles ? '#f6d21c' : 'transparent' }} />
      ))}
      <Dot />
    </div>
  )
}

function Diamonds() {
  const [inPlace, setInPlace] = useState(true)
  const { phase, left, start, reset } = useStare(30)
  const after = phase === 'after'

  return (
    <Step title="Yellow diamonds" quote="Instead of seeing the complement of the yellow circles (blue), diamond shapes are seen, the leftover shapes of the circles, in yellow.">
      <p className="mb-6 max-w-2xl text-muted">
        The same again with yellow circles that fill a white square. You might expect blue circles afterwards. Look for
        the shapes between them instead. Albers calls it a double, reversed after-image.
      </p>
      <label className="mb-6 flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={inPlace} onChange={(e) => { setInPlace(e.target.checked); reset() }} className="accent-accent" />
        Swap it in place
      </label>
      <div className="w-full max-w-xl">
        <div className="flex aspect-[2/1] items-center justify-around rounded-sm bg-black px-[6%]">
          <CirclesSquare circles={!(after && inPlace)} />
          {!inPlace && (
            <div className="relative aspect-square w-[38%] bg-white">
              <Dot />
            </div>
          )}
        </div>
        <Countdown phase={phase} left={left} after={inPlace ? 'Keep looking. Where are the yellow shapes now?' : 'Now look at the dot in the empty square.'} />
      </div>
      {phase === 'idle' && <Next onClick={start}>Start staring</Next>}
      {phase === 'staring' && <Next onClick={reset}>Stop</Next>}
      {after && <Next onClick={start}>Try it again</Next>}
    </Step>
  )
}

const GROUNDS = [
  { id: 'red', label: 'Red ground', hex: '#d2301f' },
  { id: 'green', label: 'Green ground', hex: '#2c8a3e' },
  { id: 'blue', label: 'Blue ground', hex: '#2552c8' },
  { id: 'yellow', label: 'Yellow ground', hex: '#e8c21a' },
] as const
type GroundId = (typeof GROUNDS)[number]['id']

const GREY_L = 0.62
const MAX_TINT = 0.07

// Grey pushed a little towards or away from the ground's own hue
function tinted(ground: string, amount: number) {
  const [, , h] = hexToOklch(ground)
  return amount >= 0 ? oklchToHex(GREY_L, amount * MAX_TINT, h) : oklchToHex(GREY_L, -amount * MAX_TINT, (h + 180) % 360)
}

function Simultaneous() {
  const [groundId, setGroundId] = useState<GroundId>('red')
  const [amount, setAmount] = useState(0)
  const [done, setDone] = useState(false)
  const ground = GROUNDS.find((g) => g.id === groundId)!.hex
  const inner = tinted(ground, amount)

  return (
    <Step title="It happens all the time" quote="The fact that the after-image or simultaneous contrast is a psycho-physiological phenomenon should prove that no normal eye, not even the most trained one, is foolproof against color deception.">
      <p className="mb-6 max-w-2xl text-muted">
        You don&apos;t need to stare. A ground casts its after-image on whatever sits on it, straight away. The square
        starts as a neutral grey. Move the slider until it looks neutral grey to you.
      </p>
      <div className="mb-6">
        <Segmented value={groundId} options={GROUNDS.map(({ id, label }) => ({ id, label }))} onChange={(id) => { setGroundId(id); setAmount(0); setDone(false) }} />
      </div>
      <div className="relative aspect-[3/2] w-full max-w-md rounded-sm" style={{ background: ground }}>
        <div className="absolute left-1/2 top-1/2 h-1/3 w-1/4 -translate-x-1/2 -translate-y-1/2" style={{ background: inner }} />
      </div>
      <label className="mt-6 block max-w-md text-sm text-muted">
        <span className="mb-2 flex justify-between">
          <span>Away from the ground&apos;s colour</span>
          <span>Towards it</span>
        </span>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.02}
          value={amount}
          onChange={(e) => { setAmount(Number(e.target.value)); setDone(false) }}
          aria-label="Tint of the small square"
          className="w-full accent-accent"
        />
      </label>
      {!done ? (
        <Next onClick={() => setDone(true)}>It looks grey</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {Math.abs(amount) < 0.08
              ? 'You left it almost neutral. On this ground most people see a tint of the opposite colour.'
              : amount > 0
                ? `You added ${Math.round(amount * 100)}% of the ground's own colour to cancel the after-image it casts.`
                : `You added the opposite of the ground's colour. Most people need to go the other way, towards the ground.`}
          </p>
          <div className="mt-6 flex max-w-sm gap-3 bg-[#808080] p-3">
            {[
              { hex: tinted(ground, 0), label: 'Neutral grey' },
              { hex: inner, label: 'Yours' },
            ].map(({ hex, label }) => (
              <figure key={label} className="flex-1">
                <div className="h-16" style={{ background: hex }} />
                <figcaption className="mt-1 text-xs text-white">{label}</figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">The two side by side on a neutral grey, away from the ground.</p>
        </div>
      )}
    </Step>
  )
}
