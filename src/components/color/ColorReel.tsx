'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, RotateCcw } from 'lucide-react'
import { ShowcaseReel, reelDuration } from '@/components/showcase/ShowcaseReel'
import { COLOR_REEL_STUDIES, COLOR_REEL_STYLES, type ColorReelStyle } from '@/content/colorReel'

// A few of the studies as a reel, in three cuts and dark or light, with links to each. It plays once; the button runs it again.
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
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${value === o ? 'bg-foreground font-medium text-background' : 'text-muted hover:text-foreground'}`}
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
          <h1 className="text-2xl font-medium text-foreground">Interaction of Color, {COLOR_REEL_STUDIES.length} of the 25 studies</h1>
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
        {Math.floor(seconds / 60) ? `${Math.floor(seconds / 60)} minute${seconds >= 120 ? 's' : ''} ` : ''}{seconds % 60} seconds. Every scene is the real study replayed in the page, not a video.
      </p>
      <ul className="grid border-b border-border sm:grid-cols-2 lg:grid-cols-3">
        {COLOR_REEL_STUDIES.map((s) => (
          <li key={s.slug} className="border-b border-border sm:border-r [&:nth-child(2n)]:sm:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0">
            <Link href={`/color/${s.slug}`} className="group block px-8 py-6">
              <span className="text-xs uppercase tracking-widest text-muted">{s.study}</span>
              <span className="mt-2 block text-lg text-foreground group-hover:text-accent">{s.name}</span>
              <span className="mt-1 block text-sm text-muted">{s.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/color" className="group flex items-center justify-between border-b border-border px-8 py-6 text-foreground">
        <span className="group-hover:text-accent">All 25 studies</span>
        <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
      </Link>
    </div>
  )
}
