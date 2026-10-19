'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { COKE_RED, COKE_REDS } from '@/content/color'
import { deltaE, describeMiss, inkOn, nameOf, NAME_COUNT, oklchToHex } from '@/lib/color'
import { Picker, hsvHex, type HSV } from './Picker'
import { Next, Step, Swatch } from './parts'

// Chapter I. Three tries at remembering a colour, each one easier than the last on paper:
// a colour from its name, a colour everyone has seen, and a colour you saw two seconds ago.

const randomHue = () => Math.round(Math.random() * 360)
// Grey to start, so the picker doesn't suggest an answer
const blank = (): HSV => ({ h: randomHue(), s: 0, v: 0.55 })

// "Hundreds of reds in front of them": hue across, lightness down, as much chroma as fits
function redField(): string[] {
  const cols = 16
  const rows = 10
  const cells: string[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push(oklchToHex(0.4 + (r / (rows - 1)) * 0.34, 0.26, 10 + (c / (cols - 1)) * 36))
  }
  // The real one is in there somewhere
  let nearest = 0
  cells.forEach((hex, i) => {
    if (deltaE(hex, COKE_RED) < deltaE(cells[nearest], COKE_RED)) nearest = i
  })
  cells[nearest] = COKE_RED
  return cells
}

function randomTarget() {
  return oklchToHex(0.45 + Math.random() * 0.4, 0.06 + Math.random() * 0.14, randomHue())
}

const FLASH_MS = 2000
const ROUNDS = 3

export function Recollection() {
  const [step, setStep] = useState(1)
  const [said, setSaid] = useState<HSV>({ h: 0, s: 0, v: 0.55 })
  const [coke, setCoke] = useState<string | null>(null)
  const field = useMemo(redField, [])

  // A random starting hue has to wait for the browser, or the server and client disagree
  useEffect(() => setSaid(blank()), [])

  const saidHex = hsvHex(said)

  return (
    <div className="space-y-20">
      <Step n={1} title='Say "red"' quote='If one says "Red" (the name of a color) and there are 50 people listening, it can be expected that there will be 50 reds in their minds.'>
        <p className="mb-6 text-muted">Make the red you thought of.</p>
        <div className="flex flex-wrap items-start gap-8">
          <Picker value={said} onChange={setSaid} />
          <Swatch hex={saidHex} label="Your red" />
        </div>
        {step === 1 && (
          <Next onClick={() => setStep(2)} disabled={said.s < 0.05}>
            That&apos;s my red
          </Next>
        )}
      </Step>

      {step >= 2 && (
        <Step n={2} title="Now Coca-Cola red" quote="Even if all the listeners have hundreds of reds in front of them from which to choose the Coca-Cola red, they will again select quite different colors.">
          <p className="mb-6 text-muted">
            Pick it from memory. One of these {field.length} reds is the real one.
          </p>
          <div className="grid max-w-2xl grid-cols-[repeat(16,minmax(0,1fr))] gap-[3px]" role="radiogroup" aria-label="Reds">
            {field.map((hex, i) => (
              <button
                key={i}
                role="radio"
                aria-checked={coke === hex}
                aria-label={`Red ${i + 1}`}
                disabled={step > 2}
                onClick={() => setCoke(hex)}
                className={`aspect-square rounded-[2px] outline-none transition-transform focus-visible:ring-2 focus-visible:ring-accent ${
                  coke === hex ? 'z-10 scale-125 ring-2 ring-foreground' : step === 2 ? 'hover:scale-110' : ''
                }`}
                style={{ background: hex }}
              />
            ))}
          </div>
          {step === 2 && (
            <Next onClick={() => setStep(3)} disabled={!coke}>
              That&apos;s Coca-Cola red
            </Next>
          )}
        </Step>
      )}

      {step >= 3 && coke && <Reveal said={saidHex} coke={coke} />}

      {step >= 3 && <Flash />}
    </div>
  )
}

function Reveal({ said, coke }: { said: string; coke: string }) {
  const miss = deltaE(coke, COKE_RED)
  const names = [said, coke, COKE_RED].map(nameOf)

  return (
    <Step n={3} title="How close?" quote="And no one can be sure that he has found the precise red shade.">
      <div className="flex flex-wrap gap-6">
        <Disc hex={said} label="The red you thought of" />
        <Disc hex={coke} label="Coca-Cola red, from memory" />
        <Disc hex={COKE_RED} label="Coca-Cola red" sign />
      </div>
      <dl className="mt-8 grid max-w-2xl gap-x-8 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
        <dt className="text-muted">Your Coca-Cola red</dt>
        <dd className="text-foreground">
          {miss < 0.5 ? 'Exactly right' : `${describeMiss(miss)}. You were off by ${miss.toFixed(1)}.`}
        </dd>
        <dt className="text-muted">The names</dt>
        <dd className="text-foreground">
          {new Set(names).size === 1
            ? `All three are called "${names[0]}", so the name can't tell them apart.`
            : `They're called "${names[0]}", "${names[1]}" and "${names[2]}", using a list of ${NAME_COUNT} everyday names.`}
        </dd>
      </dl>
      <p className="mt-4 max-w-2xl text-xs text-muted">
        The distance is in OKLab, multiplied by 100. Most people can see a difference of about 2 between two colours
        placed side by side.
      </p>

      <div className="mt-12 max-w-2xl">
        <h3 className="mb-1 text-sm text-foreground">Even Coca-Cola has more than one</h3>
        <p className="mb-4 text-sm text-muted">
          Coca-Cola doesn&apos;t publish a screen value for its red. I measured these three on coca-cola.com. The
          sign above uses the first one.
        </p>
        <div className="flex overflow-hidden rounded-sm">
          {COKE_REDS.map(({ hex, where }) => (
            <div key={hex} className="flex h-28 flex-1 flex-col justify-end p-3 text-xs text-white" style={{ background: hex }}>
              <span>{where}</span>
              <span className="font-mono opacity-80">{hex}</span>
            </div>
          ))}
        </div>
      </div>

      <Pool said={said} coke={coke} />
    </Step>
  )
}

// Everyone else's answers, so the 50 listeners are real people
function Pool({ said, coke }: { said: string; coke: string }) {
  const [pool, setPool] = useState<{ shared: boolean; said: string[]; coke: string[] } | null>(null)

  useEffect(() => {
    const post = fetch('/api/color/reds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ said, coke }),
    }).catch(() => null)
    post
      .then(() => fetch('/api/color/reds'))
      .then((r) => r.json())
      .then(setPool)
      .catch(() => setPool({ shared: false, said: [], coke: [] }))
  }, [said, coke])

  if (!pool) return null
  if (!pool.shared) {
    return <p className="mt-10 text-sm text-muted">Everyone&apos;s reds will show here once the site is connected to its database.</p>
  }

  return (
    <div className="mt-12 grid gap-10 md:grid-cols-2">
      <Crowd title={`"Red", from ${pool.said.length} people`} colors={pool.said} />
      <Crowd title={`Coca-Cola red, from ${pool.coke.length} people`} colors={pool.coke} target={COKE_RED} />
    </div>
  )
}

function Crowd({ title, colors, target }: { title: string; colors: string[]; target?: string }) {
  // Sorted by lightness so the spread reads at a glance
  const sorted = useMemo(() => [...colors].sort((a, b) => deltaE(a, '#000') - deltaE(b, '#000')), [colors])
  return (
    <div>
      <h3 className="mb-3 text-sm text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-[3px]">
        {sorted.map((hex, i) => (
          <span key={i} className="h-6 w-6 rounded-[2px]" style={{ background: hex }} title={hex} />
        ))}
      </div>
      {target && (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span className="h-3 w-3 rounded-full" style={{ background: target }} /> The real one
        </p>
      )}
    </div>
  )
}

type Round = { target: string; guess: string }

function Flash() {
  const [phase, setPhase] = useState<'idle' | 'showing' | 'recall' | 'scored'>('idle')
  const [target, setTarget] = useState('')
  const [guess, setGuess] = useState<HSV>({ h: 0, s: 0, v: 0.55 })
  const [rounds, setRounds] = useState<Round[]>([])

  const start = () => {
    setTarget(randomTarget())
    setGuess(blank())
    setPhase('showing')
  }

  useEffect(() => {
    if (phase !== 'showing') return
    const t = setTimeout(() => setPhase('recall'), FLASH_MS)
    return () => clearTimeout(t)
  }, [phase])

  const submit = () => {
    setRounds((r) => [...r, { target, guess: hsvHex(guess) }])
    setPhase('scored')
  }

  const last = rounds[rounds.length - 1]
  const done = rounds.length >= ROUNDS
  const average = rounds.reduce((sum, r) => sum + deltaE(r.target, r.guess), 0) / (rounds.length || 1)

  return (
    <Step n={4} title="Seen two seconds ago" quote="It is hard, if not impossible, to remember distinct colors. This underscores the important fact that the visual memory is very poor in comparison with our auditory memory.">
      <p className="mb-6 text-muted">
        This time there&apos;s no name or brand to go on. You see a colour for two seconds, then make it again.
        There are {ROUNDS} rounds.
      </p>

      {phase === 'idle' && <Next onClick={start}>Show me a colour</Next>}

      {phase === 'showing' && (
        <div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-sm" style={{ background: target }}>
          <motion.span
            className="absolute bottom-0 left-0 h-1 bg-white/70"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: FLASH_MS / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {phase === 'recall' && (
        <>
          <div className="flex flex-wrap items-start gap-8">
            <Picker value={guess} onChange={setGuess} />
            <Swatch hex={hsvHex(guess)} label="Your colour" />
          </div>
          <Next onClick={submit} disabled={guess.s < 0.02}>
            That&apos;s it
          </Next>
        </>
      )}

      {phase === 'scored' && last && (
        <>
          <div className="flex max-w-2xl overflow-hidden rounded-sm">
            {[
              { hex: last.target, label: 'What you saw' },
              { hex: last.guess, label: 'What you made' },
            ].map(({ hex, label }) => (
              <div key={label} className="flex h-48 flex-1 items-end p-4 text-sm" style={{ background: hex, color: inkOn(hex) }}>
                {label} · {nameOf(hex)}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-foreground">
            {describeMiss(deltaE(last.target, last.guess))}. You were off by {deltaE(last.target, last.guess).toFixed(1)}.
          </p>
          {done ? (
            <div className="mt-8 max-w-2xl border-t border-border pt-6">
              <p className="text-foreground">
                Your average miss over {rounds.length} rounds was {average.toFixed(1)}. {describeMiss(average)}.
              </p>
              <p className="mt-2 text-sm text-muted">
                Albers notes that most people can sing back a melody after hearing it once or twice. Two seconds of
                looking isn&apos;t enough to remake a colour.
              </p>
              <Next onClick={() => { setRounds([]); start() }}>Again</Next>
            </div>
          ) : (
            <Next onClick={start}>Next colour ({rounds.length + 1} of {ROUNDS})</Next>
          )}
        </>
      )}
    </Step>
  )
}

// The round sign with the white name in the middle. The real one is Coca-Cola's, redrawn as SVG
// in the red measured from coca-cola.com.
function Disc({ hex, label, sign }: { hex: string; label: string; sign?: boolean }) {
  return (
    <figure className="w-40">
      {sign ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/color/coca-cola-sign.svg" alt="The Coca-Cola sign" className="h-40 w-40" />
      ) : (
        <div className="h-40 w-40 rounded-full" style={{ background: hex }} />
      )}
      <figcaption className="mt-3 text-sm text-foreground">{label}</figcaption>
      <p className="font-mono text-xs text-muted">{hex}</p>
    </figure>
  )
}
