'use client'

import { useEffect, useRef, useState } from 'react'
import { oklchToHex } from '@/lib/color'
import { Next, Step } from './parts'

// Chapter XIV. Four colours are like four tones of a tune. Move them all up or down in light by the
// same steps and the tune survives in a new key. Albers checks it by swapping the centres of the
// two groups, so each group carries a small copy of the other.

// Hue and chroma stay fixed; only lightness moves
const HUES = [35, 150, 265, 85]
const CHROMA = [0.09, 0.07, 0.08, 0.1]
const LOW = [0.36, 0.47, 0.3, 0.55]
// The order the squares are read in: top left, top right, bottom right, bottom left
const POS = ['top left', 'top right', 'bottom right', 'bottom left']

const hexes = (ls: number[]) => ls.map((L, i) => oklchToHex(Math.min(0.97, Math.max(0.05, L)), CHROMA[i], HUES[i]))

// Two by two, in reading order clockwise. `inset` is the other group, cut small and laid in the middle.
function Group({ colors, inset, label }: { colors: string[]; inset?: string[]; label: string }) {
  const order = [0, 1, 3, 2]
  return (
    <div role="img" aria-label={label} className="relative grid aspect-square w-full grid-cols-2 overflow-hidden rounded-sm ring-1 ring-border">
      {order.map((i) => (
        <div key={i} style={{ background: colors[i] }} />
      ))}
      {inset && (
        <div className="absolute left-1/2 top-1/2 grid h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 grid-cols-2">
          {order.map((i) => (
            <div key={i} style={{ background: inset[i] }} />
          ))}
        </div>
      )}
    </div>
  )
}

// Lightness heard as pitch: the same steps in light are the same steps in tone
function useTune() {
  const ctx = useRef<AudioContext | null>(null)
  return (ls: number[]) => {
    ctx.current ??= new AudioContext()
    const ac = ctx.current
    ls.forEach((L, i) => {
      const t = ac.currentTime + i * 0.38
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'triangle'
      // Two octaves across the whole lightness range
      osc.frequency.value = 196 * 2 ** (L * 2.4)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34)
      osc.connect(gain).connect(ac.destination)
      osc.start(t)
      osc.stop(t + 0.36)
    })
  }
}

function Slider({ label, value, onChange, min = 0.05, max = 0.95 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={0.005} value={value} onChange={(e) => onChange(+e.target.value)} className="accent-[var(--accent)]" />
    </label>
  )
}

export function Intervals() {
  return (
    <div className="space-y-20">
      <SameTune />
      <ByHand />
    </div>
  )
}

function SameTune() {
  const [key, setKey] = useState(0.3)
  const [swapped, setSwapped] = useState(false)
  const play = useTune()
  const high = LOW.map((L) => L + key)
  const low = hexes(LOW)
  const up = hexes(high)

  return (
    <Step
      n={1}
      title="The same tune in another key"
      quote={'The tune of "Good morning to you" consists of 4 tones. It can be sung in a high soprano, a low basso, and in all in-between voices.'}
    >
      <p className="mb-6 max-w-2xl text-muted">
        The group on the right is the group on the left with every colour raised by the same amount of light. The
        steps between them stay the same, so it reads as the same group in a higher key. Swap the centres to compare
        them the way Albers did, and play each group to hear its steps as pitch.
      </p>
      <div className="grid max-w-xl grid-cols-2 gap-4 sm:gap-8">
        <figure>
          <Group colors={low} inset={swapped ? up : undefined} label="The low group" />
          <figcaption className="mt-2 flex items-center justify-between text-sm text-muted">
            Low key
            <button onClick={() => play(LOW)} className="text-foreground underline underline-offset-4 hover:text-accent">
              Play
            </button>
          </figcaption>
        </figure>
        <figure>
          <Group colors={up} inset={swapped ? low : undefined} label="The same group, transposed" />
          <figcaption className="mt-2 flex items-center justify-between text-sm text-muted">
            {key >= 0 ? 'Higher' : 'Lower'} key
            <button onClick={() => play(high)} className="text-foreground underline underline-offset-4 hover:text-accent">
              Play
            </button>
          </figcaption>
        </figure>
      </div>
      <div className="mt-6 flex max-w-xl flex-wrap items-end gap-8">
        <div className="min-w-[14rem] flex-1">
          <Slider label="Key" value={key} min={-0.25} max={0.4} onChange={setKey} />
        </div>
        <button onClick={() => setSwapped((s) => !s)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
          {swapped ? 'Separate them' : 'Swap the centres'}
        </button>
      </div>
      <p className="mt-6 max-w-2xl text-sm text-muted">
        At the extremes the colours run out of room. Near white or black the steps squash together, and the key no
        longer holds.
      </p>
    </Step>
  )
}

function ByHand() {
  const [ls, setLs] = useState<number[]>([0.7, 0.7, 0.7, 0.7])
  const [done, setDone] = useState(false)
  const play = useTune()

  // A random start has to wait for the browser, or the server and client disagree
  useEffect(() => setLs(LOW.map(() => 0.6 + Math.random() * 0.3)), [])

  const offsets = ls.map((L, i) => L - LOW[i])
  const key = offsets.reduce((a, b) => a + b, 0) / 4
  // How far each step strays from a clean transposition, in lightness points
  const miss = Math.sqrt(offsets.reduce((sum, o) => sum + (o - key) ** 2, 0) / 4) * 100
  const exact = LOW.map((L) => L + key)

  return (
    <Step n={2} title="Transpose it by hand" quote="The only way in which the 2 groups can be compared easily and accurately is to superimpose 1 group on the other.">
      <p className="mb-6 max-w-2xl text-muted">
        Make a higher version of the low group. Each slider moves one square. The low group sits small in the middle
        of yours, so you can compare every boundary. When the inner and outer groups feel like the same tune, stop.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-full max-w-xs">
          <Group colors={hexes(ls)} inset={hexes(LOW)} label="Your group, with the low group in the centre" />
          <div className="mt-2 flex gap-4 text-sm">
            <button onClick={() => play(LOW)} className="text-foreground underline underline-offset-4 hover:text-accent">
              Play the low group
            </button>
            <button onClick={() => play(ls)} className="text-foreground underline underline-offset-4 hover:text-accent">
              Play yours
            </button>
          </div>
        </div>
        <div className="grid w-full max-w-xs gap-4">
          {ls.map((L, i) => (
            <Slider key={i} label={`Square ${i + 1}, ${POS[i]}`} value={L} onChange={(v) => { setLs((prev) => prev.map((p, j) => (j === i ? v : p))); setDone(false) }} />
          ))}
        </div>
      </div>

      {!done ? (
        <Next onClick={() => setDone(true)}>Same tune, higher key</Next>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {miss < 2
              ? 'A clean transposition. Every step moved by the same amount of light.'
              : `Your steps are off by about ${miss.toFixed(1)} points of lightness on average.`}{' '}
            You raised the group by {Math.round(key * 100)} points.
          </p>
          <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
            <figure>
              <Group colors={hexes(ls)} label="Yours" />
              <figcaption className="mt-2 text-sm text-muted">Yours</figcaption>
            </figure>
            <figure>
              <Group colors={hexes(exact)} label="An exact transposition by the same amount" />
              <figcaption className="mt-2 text-sm text-muted">Exact, same key</figcaption>
            </figure>
          </div>
          <ul className="mt-6 space-y-1 text-sm text-muted">
            {offsets.map((o, i) => (
              <li key={i}>
                Square {i + 1} moved {Math.round(o * 100)}
                {Math.abs(o - key) > 0.03 ? `, ${o > key ? 'too far' : 'not far enough'}` : ', about right'}.
              </li>
            ))}
          </ul>
          <Next onClick={() => { setLs(exact); setDone(false) }}>Snap mine to the exact key</Next>
        </div>
      )}
    </Step>
  )
}
