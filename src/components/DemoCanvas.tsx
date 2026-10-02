'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

interface DemoMode {
  label: string
  query?: string
}

interface DemoCanvasProps {
  src: string
  title: string
  modes?: DemoMode[]
  // The prototype is designed for a desktop window; render it at this size and scale to fit.
  width?: number
  height?: number
}

// A live HTML prototype on a dotted canvas, scaled down to fit the column.
export function DemoCanvas({ src, title, modes = [], width = 1280, height = 900 }: DemoCanvasProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [mode, setMode] = useState(0)
  // Bumping the key reloads the iframe so a demo replays from the start.
  const [run, setRun] = useState(0)

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / width))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [width])

  const query = modes[mode]?.query
  const url = query ? `${src}?${query}` : src

  return (
    <figure className="my-8 not-prose">
      <div
        className="rounded-xl border border-border p-3 sm:p-6"
        style={{
          backgroundColor: 'var(--card)',
          backgroundImage: 'radial-gradient(color-mix(in srgb, var(--foreground) 14%, transparent) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        {modes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            {modes.map((m, i) => (
              <button
                key={m.label}
                type="button"
                onClick={() => {
                  setMode(i)
                  setRun((r) => r + 1)
                }}
                className={`h-8 px-3 rounded-full text-sm border transition-colors ${
                  i === mode
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-background text-muted border-border hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {m.label}
              </button>
            ))}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group ml-auto inline-flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors"
            >
              Open full screen
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        )}
        <div
          ref={frameRef}
          className="relative w-full overflow-hidden rounded-lg border border-border bg-background shadow-xl"
          style={{ height: height * scale }}
        >
          <iframe
            key={run}
            src={url}
            title={title}
            loading="lazy"
            className="absolute top-0 left-0 border-0 origin-top-left"
            style={{ width, height, transform: `scale(${scale})` }}
          />
        </div>
      </div>
    </figure>
  )
}
