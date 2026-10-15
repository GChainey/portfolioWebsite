'use client'

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { FrameDialog } from '@/components/FrameDialog'

interface BrandBookProps {
  // The Finder prototype, which reads the kit's files from beside it
  finder: string
  // The human brand book's cover
  cover: string
  pages: number
  files: number
}

// The window the Finder prototype is drawn for, before it is scaled to fit
const FINDER_W = 1280
const FINDER_H = 800

// What the agent reads first, so the folder opens on something worth reading
const AGENT_START = 'agent/verbal/positioning.md'
const HUMAN_START = 'human/Enterprise_AI_Brand_Guidelines_v3.0.pdf'

// The same brand in its two formats. Each card opens the brand's folder in a Finder window:
// the agent card on the files an agent builds from, the human card on the PDF.
export function BrandBook({ finder, cover, pages, files }: BrandBookProps) {
  const [open, setOpen] = useState<string | null>(null)
  const { resolvedMode } = useTheme()

  return (
    <figure className="my-8 not-prose">
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setOpen(HUMAN_START)}
          className="group text-left rounded-xl border border-border bg-card overflow-hidden hover:border-accent/50 transition-colors"
        >
          <div className="aspect-video overflow-hidden border-b border-border bg-border/30">
            <img src={cover} alt="The cover of the Enterprise AI brand guidelines" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
          </div>
          <div className="p-4">
            <span className="text-xs uppercase tracking-wide text-muted">For people</span>
            <p className="mt-1 font-medium text-foreground group-hover:text-accent transition-colors">Brand Guidelines v3.0</p>
            <p className="text-sm text-muted">PDF, {pages} pages. Read it, then rebuild it by hand.</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setOpen(AGENT_START)}
          className="group text-left rounded-xl border border-accent/40 bg-card overflow-hidden hover:border-accent transition-colors"
        >
          <div className="aspect-video overflow-hidden border-b border-border bg-[#1e1e1e] p-4 sm:p-5 font-mono text-[11px] sm:text-xs leading-relaxed text-[#d4d4d8] relative">
            <FolderTree />
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-sans font-medium text-[#1d1d1f] shadow-lg group-hover:-translate-y-0.5 transition-transform">
              Open the folder
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="p-4">
            <span className="text-xs uppercase tracking-wide text-accent">For agents</span>
            <p className="mt-1 font-medium text-foreground group-hover:text-accent transition-colors">brand_atomic_system/</p>
            <p className="text-sm text-muted">{files} files of Markdown, YAML, CSS and JSON. An agent builds from it.</p>
          </div>
        </button>
      </div>

      <FrameDialog
        src={open ? `${finder}?file=${encodeURIComponent(open)}&theme=${resolvedMode}` : null}
        title="The Enterprise AI brand kit in a Finder window"
        width={FINDER_W}
        height={FINDER_H}
        hint="Click a file to read it. Arrow keys move, Space opens Quick Look."
        bare
        onClose={() => setOpen(null)}
      />
    </figure>
  )
}

function FolderTree() {
  const rows: [number, string, boolean?][] = [
    [0, 'brand_atomic_system/', true],
    [1, 'readme.md'],
    [1, 'magic_trick.md'],
    [1, 'human/', true],
    [1, 'agent/', true],
    [2, 'verbal/', true],
    [3, 'positioning.md  messaging.md'],
    [3, 'voice.md  concepts.md  audience.yaml'],
    [2, 'visual/', true],
    [3, 'colors_and_type.css  tokens/  motion/'],
    [3, 'components/  assets/  fonts/'],
  ]
  return (
    <div aria-hidden>
      {rows.map(([depth, name, dir], i) => (
        <div key={i} className="whitespace-nowrap overflow-hidden text-ellipsis" style={{ paddingLeft: depth * 14 }}>
          <span className={dir ? 'text-[#7cc1f6]' : ''}>{name}</span>
        </div>
      ))}
    </div>
  )
}
