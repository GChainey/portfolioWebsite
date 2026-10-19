'use client'

import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { ShowcaseReel, reelDuration } from '@/components/showcase/ShowcaseReel'
import { COLOR_REEL_STYLES, type ColorReelStyle } from '@/content/colorReel'

// The whole series as a reel, in three cuts and dark or light. It plays once; the button runs it again.
const THEMES = ['dark', 'light'] as const
type Theme = (typeof THEMES)[number]
const STYLES = Object.keys(COLOR_REEL_STYLES) as ColorReelStyle[]

function Toggle<T extends string>({ options, value, onChange, label }: { options: readonly T[]; value: T; onChange: (v: T) => void; label: (v: T) => string }) {
  return (
    <div className="flex rounded-full bg-border/40 p-0.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${value === o ? 'bg-foreground font-medium text-background' : 'text-muted hover:text-foreground'}`}
        >
          {label(o)}
        </button>
      ))}
    </div>
  )
}

export function ColorReel() {
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const [style, setStyle] = useState<ColorReelStyle>('text')
  const { scenes } = COLOR_REEL_STYLES[style]
  const seconds = Math.round(reelDuration(scenes))
  const play = () => { setDone(false); setRun((r) => r + 1) }

  // ?theme=light and ?style=title|words open those versions
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.get('theme') === 'light') setTheme('light')
    const s = q.get('style') as ColorReelStyle | null
    if (s && STYLES.includes(s)) setStyle(s)
  }, [])

  return (
    <div className="border-x border-border">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-8 py-6">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest text-muted">Sizzle reel</p>
          <h1 className="text-2xl font-medium text-foreground">Interaction of Color, all 25 studies</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle options={STYLES} value={style} onChange={(s) => { setStyle(s); play() }} label={(s) => COLOR_REEL_STYLES[s].label} />
          <Toggle options={THEMES} value={theme} onChange={(t) => { setTheme(t); play() }} label={(t) => (t === 'dark' ? 'Dark' : 'Light')} />
          <button
            onClick={play}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors ${done ? 'border-accent text-accent' : 'border-border text-muted hover:text-foreground'}`}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Replay
          </button>
        </div>
      </div>
      <div className={theme === 'dark' ? 'bg-[#09090b]' : 'bg-white'}>
        <ShowcaseReel key={`${style}-${theme}-${run}`} scenes={scenes} theme={theme} pageTheme={theme} dots={false} loop={false} onCycle={() => setDone(true)} />
      </div>
      <p className="border-b border-border px-8 py-4 text-xs text-muted">
        {Math.floor(seconds / 60)} minutes {seconds % 60} seconds. Every scene is the real study replayed in the page, not a video.
      </p>
    </div>
  )
}
