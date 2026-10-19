'use client'

import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { ShowcaseReel } from '@/components/showcase/ShowcaseReel'
import { COLOR_REEL, colorReelSeconds } from '@/content/colorReel'

// The whole series in one reel, dark or light. It plays once; the button runs it again.
const THEMES = ['dark', 'light'] as const
type Theme = (typeof THEMES)[number]

export function ColorReel() {
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const seconds = Math.round(colorReelSeconds())
  const play = () => { setDone(false); setRun((r) => r + 1) }

  // ?theme=light opens the light version
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('theme') === 'light') setTheme('light')
  }, [])

  return (
    <div className="border-x border-border">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-8 py-6">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-muted">Sizzle reel</p>
          <h1 className="text-2xl font-medium text-foreground">Interaction of Color, all 25 exercises</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-full bg-border/40 p-0.5">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => { setTheme(t); play() }}
                aria-pressed={theme === t}
                className={`rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${theme === t ? 'bg-foreground font-medium text-background' : 'text-muted hover:text-foreground'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={play}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors ${done ? 'border-accent text-accent' : 'border-border text-muted hover:text-foreground'}`}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Replay
          </button>
        </div>
      </div>
      <div className={theme === 'dark' ? 'bg-[#09090b]' : 'bg-white'}>
        <ShowcaseReel key={`${theme}-${run}`} scenes={COLOR_REEL} theme={theme} pageTheme={theme} dots={false} loop={false} onCycle={() => setDone(true)} />
      </div>
      <p className="border-b border-border px-8 py-4 text-xs text-muted">
        {Math.floor(seconds / 60)} minutes {seconds % 60} seconds. Every scene is the real exercise replayed in the page, not a video.
      </p>
    </div>
  )
}
