'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { addLight, averageLight, hexToHsv, lightnessOf, multiply, oklchToHex } from '@/lib/color'
import { Next, Segmented, Step } from './parts'
import { Picker, hsvHex, type HSV } from './Picker'
import { Overlap } from './Transparence'

// Chapter X. Real mixtures, as opposed to the imagined ones of chapter IX. Light added to light gets
// lighter, paint mixed with paint gets darker. A screen is made of light, so the first one is real
// here, not a picture of it.

interface Disc {
  hex: string
  label: string
  x: number
  y: number
}

const LIGHTS: Disc[] = [
  { hex: '#ff0000', label: 'Red light', x: 40, y: 40 },
  { hex: '#00ff00', label: 'Green light', x: 60, y: 40 },
  { hex: '#0000ff', label: 'Blue light', x: 50, y: 60 },
]

const INKS: Disc[] = [
  { hex: '#00b7eb', label: 'Cyan ink', x: 40, y: 40 },
  { hex: '#ff1d8e', label: 'Magenta ink', x: 60, y: 40 },
  { hex: '#ffe500', label: 'Yellow ink', x: 50, y: 60 },
]

const clamp = (n: number) => Math.min(92, Math.max(8, n))

// Discs you can drag over each other. `blend` is how overlapping colours combine.
function Stage({ initial, ground, blend, label }: { initial: Disc[]; ground: string; blend: 'plus-lighter' | 'multiply'; label: string }) {
  const [discs, setDiscs] = useState(initial)
  const stage = useRef<HTMLDivElement>(null)

  const move = (i: number, x: number, y: number) => setDiscs((ds) => ds.map((d, j) => (j === i ? { ...d, x: clamp(x), y: clamp(y) } : d)))

  const drag = (i: number) => ({
    onPointerDown: (e: PointerEvent) => (e.target as HTMLElement).setPointerCapture(e.pointerId),
    onPointerMove: (e: PointerEvent) => {
      if (!e.buttons) return
      const r = stage.current!.getBoundingClientRect()
      move(i, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100)
    },
    onKeyDown: (e: KeyboardEvent) => {
      const d = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }[e.key]
      if (!d) return
      e.preventDefault()
      move(i, discs[i].x + d[0], discs[i].y + d[1])
    },
  })

  return (
    <div ref={stage} className="relative aspect-square w-full max-w-md touch-none select-none overflow-hidden rounded-sm ring-1 ring-border" style={{ background: ground, isolation: 'isolate' }} aria-label={label} role="group">
      {discs.map((d, i) => (
        <div
          key={d.label}
          {...drag(i)}
          tabIndex={0}
          role="slider"
          aria-label={`${d.label}, drag or use the arrow keys`}
          aria-valuetext={`${Math.round(d.x)}% across, ${Math.round(d.y)}% down`}
          className="absolute h-[44%] w-[44%] -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
          style={{ left: `${d.x}%`, top: `${d.y}%`, background: d.hex, mixBlendMode: blend }}
        />
      ))}
    </div>
  )
}

export function FactualMixtures() {
  return (
    <div className="space-y-20">
      <Step title="Mixing light" quote="In any such mixture where there is overlapping, it will be obvious that every one of these mixtures is lighter than any of the mixture parents.">
        <p className="mb-6 max-w-2xl text-muted">
          Your screen is three kinds of light, red, green and blue. Drag them over each other. Where two overlap you get a
          lighter colour, and where all three meet you get white.
        </p>
        <Stage initial={LIGHTS} ground="#000000" blend="plus-lighter" label="Three coloured lights on black" />
      </Step>

      <Step title="Mixing pigment" quote="On the contrary, the more color that is mixed, the more the mixture approaches a dark grey leaning toward black.">
        <p className="mb-6 max-w-2xl text-muted">
          Inks work the other way. Each one takes some light away from the white paper, so every overlap is darker
          than either ink. All three together come close to black.
        </p>
        <Stage initial={INKS} ground="#ffffff" blend="multiply" label="Three transparent inks on white" />
      </Step>

      <Compare />
      <InPaper />
    </div>
  )
}

const EDIT = [
  { id: 'a', label: 'First colour' },
  { id: 'b', label: 'Second colour' },
] as const
type Part = (typeof EDIT)[number]['id']

function Compare() {
  const [pair, setPair] = useState({ a: '#d8432b', b: '#2f73c9' })
  const [part, setPart] = useState<Part>('a')
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(pair.a))

  const choose = (p: Part) => {
    setPart(p)
    setHsv(hexToHsv(pair[p]))
  }
  const change = (next: HSV) => {
    setHsv(next)
    setPair((s) => ({ ...s, [part]: hsvHex(next) }))
  }

  const results = [
    { hex: addLight(pair.a, pair.b), label: 'As light', note: 'Projected on top of each other' },
    { hex: averageLight(pair.a, pair.b), label: 'On a spinning disc', note: 'Half and half, spun fast' },
    { hex: multiply(pair.a, pair.b), label: 'As paint', note: 'Like two glazes, one on the other' },
  ]
  const marks = [
    { hex: pair.a, label: '1', parent: true },
    { hex: pair.b, label: '2', parent: true },
    ...results.map((r) => ({ hex: r.hex, label: r.label, parent: false })),
  ]

  return (
    <Step title="Lighter, between, or darker" quote="Mixtures gain light only in direct color, whereas mixtures of reflected colors lose light.">
      <p className="mb-6 max-w-2xl text-muted">
        Pick any two colours. The screen mixes them three ways: as light, as paint, and as the psychologist&apos;s
        spinning disc, which mixes in the eye. The scale below shows how light each one is.
      </p>
      <div className="flex flex-wrap items-start gap-8">
        <div className="w-full max-w-md">
          <div className="flex gap-3">
            {[pair.a, pair.b].map((hex, i) => (
              <figure key={i} className="flex-1">
                <div className="h-20 rounded-sm ring-1 ring-border" style={{ background: hex }} />
                <figcaption className="mt-1 text-xs text-muted">Colour {i + 1}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {results.map((r) => (
              <figure key={r.label}>
                <div className="h-24 rounded-sm ring-1 ring-border" style={{ background: r.hex }} />
                <figcaption className="mt-1 text-xs text-foreground">{r.label}</figcaption>
                <p className="text-xs text-muted">{r.note}</p>
              </figure>
            ))}
          </div>
        </div>
        <div className="w-full max-w-[22rem]">
          <div className="mb-4">
            <Segmented value={part} options={[...EDIT]} onChange={choose} />
          </div>
          <Picker value={hsv} onChange={change} />
        </div>
      </div>

      <div className="mt-10 max-w-2xl" aria-label="Lightness of each colour, dark to light">
        <div className="relative h-20">
          <div className="absolute inset-x-0 top-9 h-2 rounded-full" style={{ background: 'linear-gradient(to right, #000, #fff)' }} />
          {marks.map((m, i) => (
            <div key={m.label} className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: `${(lightnessOf(m.hex) * 100).toFixed(1)}%`, top: m.parent ? 0 : 44 }}>
              {m.parent ? (
                <>
                  <span className="text-xs text-muted">{m.label}</span>
                  <span className="mt-0.5 h-5 w-5 rounded-full ring-2 ring-foreground" style={{ background: m.hex }} />
                </>
              ) : (
                <>
                  <span className="h-5 w-5 rounded-sm ring-1 ring-border" style={{ background: m.hex }} />
                  <span className={`mt-0.5 whitespace-nowrap text-[10px] text-muted ${i === 3 ? 'translate-y-3' : ''}`}>{m.label}</span>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between text-xs text-muted">
          <span>Darker</span>
          <span>Lighter</span>
        </div>
      </div>
    </Step>
  )
}

// Chapter X's exercise: the same two effects, but made as an illusion with opaque colours, the way
// the class does it in paper. One thin colour crosses a grey; the crossing has to look lighter than
// both (like light) or darker than both (like paint), and then the study is reversed.
const KINDS = [
  { id: 'lighter', label: 'Lighter, like light' },
  { id: 'darker', label: 'Darker, like paint' },
] as const
type Kind = (typeof KINDS)[number]['id']

// Near white and near black rather than pure, so a crossing can still be lighter or darker than both
const GREYS = [
  { id: 'light', label: 'With a light grey', hex: '#d4d2cd' },
  { id: 'dark', label: 'With a dark grey', hex: '#3b3a37' },
] as const
type GreyId = (typeof GREYS)[number]['id']

// How much lighter or darker than both parents the crossing must be, in OKLab lightness
export const MARGIN = 0.03

export function verdict(kind: Kind, a: string, b: string, c: string) {
  const L = lightnessOf(c)
  const hi = Math.max(lightnessOf(a), lightnessOf(b))
  const lo = Math.min(lightnessOf(a), lightnessOf(b))
  return kind === 'lighter' ? { ok: L >= hi + MARGIN, by: L - hi } : { ok: L <= lo - MARGIN, by: lo - L }
}

function thinColour() {
  return oklchToHex(0.55 + Math.random() * 0.1, 0.1 + Math.random() * 0.05, Math.random() * 360)
}

function InPaper() {
  const [thin, setThin] = useState('#4f7fb8')
  const [round, setRound] = useState(0)
  const [greyId, setGreyId] = useState<GreyId>('light')
  const [kind, setKind] = useState<Kind>('lighter')
  const [guess, setGuess] = useState<HSV>(() => hexToHsv('#7f8fa3'))
  const [made, setMade] = useState<Record<Kind, boolean>>({ lighter: false, darker: false })
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (round > 0) setThin(thinColour())
    setMade({ lighter: false, darker: false })
    setChecked(false)
  }, [round, greyId])

  const grey = GREYS.find((g) => g.id === greyId)!.hex
  const mine = hsvHex(guess)
  const v = verdict(kind, thin, grey, mine)
  const model = kind === 'lighter' ? addLight(thin, grey) : multiply(thin, grey)
  const pct = (n: number) => Math.round(Math.abs(n) * 100)

  const check = () => {
    setChecked(true)
    if (v.ok) setMade((m) => ({ ...m, [kind]: true }))
  }

  return (
    <Step title="Now make it in paper" quote="Additive and subtractive mixtures should be made in appropriate studies in transparence illusions.">
      <p className="mb-6 max-w-2xl text-muted">
        Albers asks for these mixtures as illusions, with opaque papers: one thin colour mixing with white or black,
        and then the first study reversed. Set the square where the colour crosses the grey. To read as light, it has to
        be lighter than both parents. To read as paint, darker than both. Make one, then the other.
      </p>
      <div className="mb-6 flex flex-wrap gap-4">
        <Segmented value={kind} options={[...KINDS]} onChange={(k) => { setKind(k); setChecked(false) }} />
        <Segmented value={greyId} options={GREYS.map(({ id, label }) => ({ id, label }))} onChange={setGreyId} />
      </div>
      <div className="flex flex-wrap items-start gap-8">
        <Overlap a={thin} b={grey} c={mine} className="max-w-md" />
        <Picker value={guess} onChange={(g) => { setGuess(g); setChecked(false) }} />
      </div>
      <Next onClick={check}>Check this study</Next>
      {checked && (
        <div className="mt-8 max-w-2xl border-t border-border pt-6">
          <p className="text-foreground" data-testid="paper-result">
            {v.ok
              ? `Yes. The crossing is ${pct(v.by)} points ${kind === 'lighter' ? 'lighter' : 'darker'} than both parents, so it reads as ${kind === 'lighter' ? 'light added to light' : 'one glaze over another'}.`
              : `Not yet. The crossing must be at least ${pct(MARGIN)} points ${kind === 'lighter' ? 'lighter than the lighter' : 'darker than the darker'} parent, and it is ${v.by >= 0 ? `only ${pct(v.by)} points ${kind === 'lighter' ? 'lighter' : 'darker'}` : `${pct(v.by)} points ${kind === 'lighter' ? 'darker' : 'lighter'} instead`}.`}
          </p>
          <div className="mt-6 grid max-w-xl grid-cols-2 gap-4">
            <figure>
              <Overlap a={thin} b={grey} c={mine} />
              <figcaption className="mt-2 text-xs text-muted">Yours</figcaption>
            </figure>
            <figure>
              <Overlap a={thin} b={grey} c={model} />
              <figcaption className="mt-2 text-xs text-muted">{kind === 'lighter' ? 'The two as real light' : 'The two as real glazes'}</figcaption>
            </figure>
          </div>
        </div>
      )}
      <p className="mt-6 text-sm text-muted" data-testid="paper-progress">
        {made.lighter && made.darker
          ? 'Both studies made, the first and its reverse. Try the other grey, or a new colour.'
          : `Made: ${made.lighter ? 'lighter' : 'not lighter yet'}, ${made.darker ? 'darker' : 'not darker yet'}.`}
      </p>
      <Next onClick={() => setRound((r) => r + 1)}>Try a new colour</Next>
    </Step>
  )
}
