'use client'

import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Header } from '@/components/Header'
import { ShowcaseReel } from '@/components/showcase/ShowcaseReel'
import { SIZZLE, sizzleSeconds } from '@/content/sizzle'

// The sizzle reel of all the work, in three cuts. It plays once; the button runs it again.
const CUTS = ['30', '60', '90'] as const

export default function ReelPage() {
  const [cut, setCut] = useState<(typeof CUTS)[number]>('60')
  const [run, setRun] = useState(0)
  const [done, setDone] = useState(false)

  const play = (next = cut) => { setCut(next); setDone(false); setRun((r) => r + 1) }

  // ?cut=30 opens that cut
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('cut')
    if (c && (CUTS as readonly string[]).includes(c)) setCut(c as (typeof CUTS)[number])
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto pt-14">
        <div className="border-x border-border">
          <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-6 border-b border-border">
            <div>
              <p className="text-xs text-muted uppercase tracking-widest mb-1">Sizzle reel</p>
              <h1 className="text-2xl font-medium text-foreground">All the work, in {cut} seconds</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-border/40 rounded-full p-0.5">
                {CUTS.map((c) => (
                  <button key={c} onClick={() => play(c)} aria-pressed={cut === c} className={`px-4 py-1.5 text-sm rounded-full transition-colors tabular-nums ${cut === c ? 'bg-foreground text-background font-medium' : 'text-muted hover:text-foreground'}`}>
                    {c}s
                  </button>
                ))}
              </div>
              <button onClick={() => play()} className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm transition-colors ${done ? 'border-accent text-accent' : 'border-border text-muted hover:text-foreground'}`}>
                <RotateCcw className="w-3.5 h-3.5" /> Replay
              </button>
            </div>
          </div>
          <div className="bg-[#09090b]">
            <ShowcaseReel key={`${cut}-${run}`} scenes={SIZZLE[cut]} theme="dark" loop={false} onCycle={() => setDone(true)} />
          </div>
          <p className="px-8 py-4 text-xs text-muted border-b border-border">
            {Math.round(sizzleSeconds(cut))} seconds. Every scene is the real interface replayed in the page, Shader Wall runs live, and the website study and earlier work are video.
          </p>
        </div>
      </main>
    </div>
  )
}
