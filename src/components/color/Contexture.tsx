'use client'

import { useEffect, useState } from 'react'
import { oklchToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'

// Chapter II. We read words as shapes, not letter by letter, and colours the same way: by what
// is around them. First blur some type until only the word shapes are left, then count colours.

const LINES = ['INTERACTION OF COLOR', 'Interaction of Color']

const FACES = [
  { id: 'serif', label: 'Serif' },
  { id: 'sans', label: 'Sans-serif' },
] as const
type Face = (typeof FACES)[number]['id']

export function Contexture() {
  return (
    <div className="space-y-20">
      <WordPictures />
      <OneTone />
    </div>
  )
}

function WordPictures() {
  const [blur, setBlur] = useState(0)
  const [face, setFace] = useState<Face>('serif')
  const [half, setHalf] = useState(false)

  return (
    <Step title="Word pictures" quote="In reading we do not read letters but words, words as a whole, as a “word picture.”">
      <p className="mb-6 max-w-2xl text-muted">
        Blur the two lines until you can only just read one of them, or hide the bottom half of every letter.
        Capitals have the same height and much the same width, so their words lose their shape first.
      </p>
      <div className="mb-6 flex flex-wrap items-center gap-6">
        <Segmented value={face} options={[...FACES]} onChange={setFace} />
        <label className="flex items-center gap-3 text-sm text-muted">
          Blur
          <input type="range" min={0} max={8} step={0.25} value={blur} onChange={(e) => setBlur(+e.target.value)} className="w-40 accent-accent" />
        </label>
        <button onClick={() => setHalf((h) => !h)} className="text-sm text-foreground underline underline-offset-4 hover:text-accent">
          {half ? 'Show whole letters' : 'Hide the bottom half'}
        </button>
      </div>
      <div className="max-w-3xl space-y-6 overflow-hidden rounded-sm border border-border bg-[#f4f1ea] px-6 py-8 text-[#161616]">
        {LINES.map((line) => (
          <p
            key={line}
            className={`whitespace-nowrap text-[clamp(1.4rem,5vw,3rem)] leading-none ${face === 'serif' ? 'font-serif' : 'font-sans'}`}
            style={{
              filter: `blur(${blur}px)`,
              clipPath: half ? 'inset(0 0 52% 0)' : undefined,
            }}
          >
            {line}
          </p>
        ))}
      </div>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        Albers set the same pair in his book to make the point. On screen you can watch the capitals go first.
      </p>
    </Step>
  )
}

// Four centres, all one colour, each in a different chord of neighbours
const CENTRE = '#9a8a6f'
function chord(seed: number): string[] {
  // One leaning per chord, light or dark and one family of hue, so it pulls the centre one way
  const hue = (seed * 97) % 360
  const L = seed % 2 ? 0.28 + ((seed * 37) % 12) / 100 : 0.78 + ((seed * 37) % 12) / 100
  return [0, 1, 2, 3].map((i) => oklchToHex(Math.min(0.92, L + (i % 2 ? 0.04 : -0.04)), 0.1 + (i % 3) * 0.03, (hue + i * 12) % 360))
}

// Two light chords and two dark ones, in a random order
const newSeeds = () =>
  [0, 1, 2, 3]
    .map((i) => Math.floor(Math.random() * 500) * 2 + (i % 2))
    .sort(() => Math.random() - 0.5)

function OneTone() {
  const [seeds, setSeeds] = useState([1, 2, 3, 4])
  const [answer, setAnswer] = useState<number | null>(null)
  const [isolated, setIsolated] = useState(false)

  useEffect(() => setSeeds(newSeeds()), [])

  return (
    <Step title="One tone is not music" quote="We are able to hear a single tone. But we almost never (that is, without special devices) see a single color unconnected and unrelated to other colors.">
      <p className="mb-6 max-w-2xl text-muted">
        Each square sits in its own chord of colours. How many different colours are there in the four centres?
      </p>
      <div className="grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
        {seeds.map((seed, i) => {
          const c = chord(seed)
          return (
            <div key={i} className="relative grid aspect-square grid-cols-2 overflow-hidden rounded-sm ring-1 ring-border" style={{ background: isolated ? '#808080' : undefined }}>
              {!isolated && c.map((hex, j) => <div key={j} style={{ background: hex }} />)}
              <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2" style={{ background: CENTRE }} />
            </div>
          )
        })}
      </div>
      {answer === null ? (
        <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="How many colours">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} onClick={() => setAnswer(n)} className="rounded border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent">
              {n}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground">
            {answer === 1 ? 'Right. ' : `You said ${answer}. `}There is one colour, {CENTRE}, in all four.
          </p>
          <p className="mt-2 text-sm text-muted">
            Naming the colour is like spelling a word. It tells you nothing about how it reads in its chord. Take the
            neighbours away to see it alone, then give it new ones.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <button onClick={() => setIsolated((v) => !v)} className="text-foreground underline underline-offset-4 hover:text-accent">
              {isolated ? 'Give them their chords back' : 'Take the neighbours away'}
            </button>
          </div>
          <Next
            onClick={() => {
              setSeeds(newSeeds())
              setIsolated(false)
              setAnswer(null)
            }}
          >
            New chords
          </Next>
        </div>
      )}
    </Step>
  )
}
