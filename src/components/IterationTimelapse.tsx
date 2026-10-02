'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { ROUNDS, TIMELAPSE_FRAMES, frameForRound } from '@/content/add-document-rounds'

interface IterationTimelapseProps {
  // How long each round stays on screen while playing.
  interval?: number
}

// Tailwind can't apply opacity to the CSS-variable colours, so mix them here.
const mix = (pct: number) => `color-mix(in srgb, var(--foreground) ${pct}%, transparent)`

// Scrub or play through the dialog as it looked after each round of feedback.
export function IterationTimelapse({ interval = 2200 }: IterationTimelapseProps) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(rootRef, { once: true, margin: '-200px' })
  const reduceMotion = useReducedMotion()

  const round = ROUNDS[index]
  const frame = frameForRound(round.n)
  const frameRound = Number(frame.match(/r(\d+)\.webp$/)?.[1])
  const maxChanges = Math.max(...ROUNDS.map((r) => r.changes.length))
  const atEnd = index === ROUNDS.length - 1

  // Start playing the first time it scrolls into view.
  useEffect(() => {
    if (isInView && !reduceMotion) setPlaying(true)
  }, [isInView, reduceMotion])

  useEffect(() => {
    if (!playing) return
    if (atEnd) {
      setPlaying(false)
      return
    }
    const t = setTimeout(() => setIndex((i) => i + 1), interval)
    return () => clearTimeout(t)
  }, [playing, index, atEnd, interval])

  const go = (i: number) => {
    setPlaying(false)
    setIndex(Math.max(0, Math.min(ROUNDS.length - 1, i)))
  }

  const togglePlay = () => {
    if (!playing && atEnd) setIndex(0)
    setPlaying((p) => !p)
  }

  return (
    <div ref={rootRef} className="not-prose my-8 rounded-xl border border-border overflow-hidden">
      {/* Stage */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10]" style={{ backgroundColor: mix(5) }}>
        {TIMELAPSE_FRAMES.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={src === frame ? `The Add document dialog after round ${round.n}: ${round.title}` : ''}
            aria-hidden={src !== frame}
            className="absolute inset-0 w-full h-full object-contain p-3 sm:p-6 transition-opacity duration-500"
            style={{ opacity: src === frame ? 1 : 0, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.12))' }}
          />
        ))}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs border border-border text-foreground tabular-nums" style={{ backgroundColor: 'var(--background)' }}>
          Round {round.n} / {ROUNDS.length}
        </div>
        {frameRound !== round.n && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs border border-border text-muted" style={{ backgroundColor: 'var(--background)' }}>
            No screenshot this round · showing round {frameRound}
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {/* Round */}
        <div className="min-h-[7.5rem]">
          <div className="text-xs text-muted mb-1">{round.theme} · {round.changes.length} {round.changes.length === 1 ? 'change' : 'changes'}</div>
          <h4 className="text-lg font-medium text-foreground mb-2">{round.title}</h4>
          <p className="font-mono text-sm text-muted line-clamp-3">“{round.feedback}”</p>
        </div>

        {/* Scrubber: one tick per round, as tall as its number of changes */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-foreground text-background hover:opacity-80 transition-opacity"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-px" />}
          </button>
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous round"
            className="shrink-0 p-1.5 rounded-md border border-border text-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="relative flex-1 h-10">
            <div className="absolute inset-0 flex items-end gap-[2px]" aria-hidden>
              {ROUNDS.map((r, i) => (
                <div
                  key={r.n}
                  className="flex-1 rounded-[2px] transition-colors"
                  style={{
                    height: `${20 + (r.changes.length / maxChanges) * 80}%`,
                    backgroundColor: i === index ? 'var(--accent)' : mix(i < index ? 50 : 14),
                  }}
                />
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={ROUNDS.length - 1}
              value={index}
              onChange={(e) => go(Number(e.target.value))}
              aria-label="Round"
              aria-valuetext={`Round ${round.n}: ${round.title}`}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={atEnd}
            aria-label="Next round"
            className="shrink-0 p-1.5 rounded-md border border-border text-muted hover:text-foreground disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
