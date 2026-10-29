'use client'

import { useState } from 'react'
import type { ContentBlock } from '@/content/projects'
import { slugify } from '@/components/TableOfContents'
import { FunnelDiagram } from '@/components/FunnelDiagram'
import { DemoCanvas } from '@/components/DemoCanvas'
import { IterationTimelapse } from '@/components/IterationTimelapse'
import { BrandBook } from '@/components/BrandBook'
import { ImageGrid } from '@/components/ImageGrid'
import { RewriteReplay } from '@/components/replay/RewriteReplay'
import { AskReplay } from '@/components/replay/AskReplay'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { ReplayVsVideo } from '@/components/replay/ReplayVsVideo'
import { FrameStripReplay } from '@/components/replay/FrameStripReplay'
import { FramedMedia, clipGeometry } from '@/components/ClipFrame'
import { FrameDialog } from '@/components/FrameDialog'
import { ArrowUpRight } from 'lucide-react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentRegistry: Record<string, React.ComponentType<any>> = {
  'funnel-diagram': FunnelDiagram,
  'demo-canvas': DemoCanvas,
  'iteration-timelapse': IterationTimelapse,
  'brand-book': BrandBook,
  'image-grid': ImageGrid,
  'rewrite-replay': RewriteReplay,
  'ask-replay': AskReplay,
  'recording-replay': RecordingReplay,
  'frame-strip': FrameStripReplay,
  'replay-vs-video': ReplayVsVideo,
}

interface CaseStudyContentProps {
  blocks: ContentBlock[]
}


type Media = ContentBlock & { type: 'image' | 'gif' | 'video' | 'embed' }

// A media slot that isn't live yet. It is a labelled placeholder until its file is dropped
// into public/, and from then on it plays the file, so a clip can be reviewed in place
// before it is switched on.
function PendingSlot({ block, aspectRatio }: { block: Media; aspectRatio: string }) {
  const [state, setState] = useState<'checking' | 'here' | 'missing'>('checking')
  const cover = 'absolute inset-0 w-full h-full object-cover'
  // A slot for a cropped clip takes the crop's shape, and plays the file cropped once it's in
  const clip = block.crop ? clipGeometry(block.crop) : null

  return (
    <figure className="my-8">
      <div
        className="relative w-full rounded-lg border border-dashed border-border overflow-hidden flex flex-col items-center justify-center text-center gap-2 p-6"
        style={{
          aspectRatio: clip?.aspectRatio ?? aspectRatio,
          backgroundImage: 'radial-gradient(color-mix(in srgb, var(--foreground) 14%, transparent) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <span className="font-mono text-xs uppercase tracking-widest text-accent">{block.type} to come</span>
        {block.alt && <span className="text-xl font-medium text-foreground">{block.alt}</span>}
        {block.brief && <span className="max-w-md text-sm text-muted">{block.brief}</span>}
        <span className="absolute bottom-3 left-4 font-mono text-xs text-muted">public{block.src}</span>

        {state !== 'missing' && block.type === 'video' && (
          <video
            src={block.src}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => setState('here')}
            onError={() => setState('missing')}
            className={clip ? undefined : cover}
            style={clip?.video}
          />
        )}
        {state !== 'missing' && (block.type === 'image' || block.type === 'gif') && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.src} alt="" onLoad={() => setState('here')} onError={() => setState('missing')} className={cover} />
        )}
        {state === 'here' && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full font-mono text-xs bg-background text-foreground border border-border">
            Pending: not on the live site
          </span>
        )}
      </div>
      {block.caption && <figcaption className="mt-2 text-sm text-muted text-center">{block.caption}</figcaption>}
    </figure>
  )
}

function MediaBlock({ block }: { block: Media }) {
  // Not ready for the live site, which skips it. The dev server shows where it goes.
  if (block.pending) {
    if (process.env.NODE_ENV !== 'development') return null
    return <PendingSlot block={block} aspectRatio={block.aspectRatio || '16/9'} />
  }

  return (
    <figure className="my-12">
      <FramedMedia block={block} />
      {block.caption && (
        <figcaption className="mt-3 text-center text-[15px] leading-5 text-muted">
          {block.caption}
        </figcaption>
      )}
      {block.live && <OpenLive src={block.live} title={block.alt || 'The page, running'} />}
    </figure>
  )
}

// Under a clip of a page: the page itself, opened in a dialog to scroll and use
function OpenLive({ src, title }: { src: string; title: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3 flex justify-center">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
      >
        Open the page and use it
        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
      <FrameDialog
        src={open ? src : null}
        title={title}
        hint="It’s the real page. Scroll it, click it, type into it."
        onClose={() => setOpen(false)}
      />
    </div>
  )
}

// [label](url) in a paragraph becomes a link
function withLinks(text: string): React.ReactNode {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\))/g)
  if (parts.length === 1) return text
  return parts.map((part, i) => {
    const m = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part)
    if (!m) return part
    const external = /^https?:/.test(m[2])
    return (
      <a key={i} href={m[2]} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="transition-colors hover:text-accent">
        {m[1]}
      </a>
    )
  })
}

// Words read in a centred column; pictures, clips and live pieces take the full width. Typeset
// styles the words; the cards, clips and live pieces opt out with not-typeset. The column is 37em
// of the body size, not of each element's own (a heading's em is bigger)
const READ = 'mx-auto w-full max-w-[calc(var(--typeset-size)*37)]'

export function CaseStudyContent({ blocks }: CaseStudyContentProps) {
  return (
    <div className="typeset typeset-article">
      {blocks.map((block, index) => {

        if (block.type === 'heading') {
          const Tag = block.level === 2 ? 'h2' : 'h3'
          return (
            <Tag
              key={index}
              id={slugify(block.content)}
              className={`${READ} scroll-mt-24 text-balance`}
            >
              {block.content}
            </Tag>
          )
        }

        if (block.type === 'text') {
          return (
            <p
              key={index}
              className={`${READ} text-pretty`}
            >
              {withLinks(block.content)}
            </p>
          )
        }

        if (block.type === 'list') {
          const List = block.ordered ? 'ol' : 'ul'
          return (
            <List
              key={index}
              className={READ}
            >
              {block.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </List>
          )
        }

        if (block.type === 'stats') {
          return (
            <div
              key={index}
              className={`not-typeset ${READ} grid grid-cols-1 sm:grid-cols-2 gap-3 my-10`}
            >
              {block.items.map((item, i) => (
                <div key={i} className="rounded-2xl border border-border bg-background p-6">
                  <p className="text-[40px] leading-[44px] font-medium text-foreground tracking-[-0.03em] tabular-nums">{item.value}</p>
                  <p className="mt-3 text-foreground">{item.label}</p>
                  {item.note && <p className="mt-1 text-sm text-muted">{item.note}</p>}
                </div>
              ))}
            </div>
          )
        }

        // The old way and the new way, side by side: the old in a quiet card, the new on the
        // study's mat
        if (block.type === 'comparison') {
          const sides = [
            { label: block.beforeLabel ?? 'Before', lines: [block.before].flat(), now: false },
            { label: block.afterLabel ?? 'Now', lines: [block.after].flat(), now: true },
          ]
          return (
            <div
              key={index}
              className={`not-typeset ${READ} my-8 grid grid-cols-1 gap-3 sm:grid-cols-2`}
            >
              {sides.map(({ label, lines, now }) => (
                <div
                  key={label}
                  className={`rounded-2xl p-5 ${now ? '' : 'border border-border'}`}
                  style={now ? { background: 'var(--mat, #EEF0F3)' } : undefined}
                >
                  <p className={`mb-3 text-sm font-medium ${now ? 'text-foreground' : 'text-muted'}`}>{label}</p>
                  <ul className="space-y-2">
                    {lines.map((line) => (
                      <li key={line} className={`text-[15px] leading-[23px] ${now ? 'text-foreground' : 'text-muted'}`}>{line}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )
        }

        if (block.type === 'table') {
          return (
            <figure key={index} className={`${READ} my-8`}>
              <div className="overflow-x-auto">
                <table className="tabular-nums">
                  <thead>
                    <tr>
                      {block.headers.map((header, i) => (
                        <th key={header} className={i === 0 ? 'text-left' : 'text-right'}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={row[0]} className={r === block.highlight ? 'text-accent' : 'text-foreground'}>
                        {row.map((cell, i) => (
                          <td key={i} className={i === 0 ? 'text-left' : 'text-right'}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {block.caption && <figcaption className="text-center">{block.caption}</figcaption>}
            </figure>
          )
        }

        if (block.type === 'component') {
          const Component = componentRegistry[block.componentId]
          if (!Component) return null
          if (block.pending && process.env.NODE_ENV !== 'development') return null
          // A clip says what it shows before it shows it, so its caption is its title card
          const titled = block.componentId === 'recording-replay' && !!block.caption
          return (
            <div
              key={index}
              className="not-typeset"
            >
              <Component {...(block.props || {})} {...(titled ? { title: block.caption } : {})} />
              {block.caption && !titled && (
                // The component brings its own margin, so the caption is pulled up under it
                <p className="-mt-5 mb-10 text-center text-[15px] leading-5 text-muted">{block.caption}</p>
              )}
              {block.live && <div className="-mt-5 mb-8"><OpenLive src={block.live} title={block.caption || 'The page, running'} /></div>}
            </div>
          )
        }

        if (block.type === 'image' || block.type === 'gif' || block.type === 'video' || block.type === 'embed') {
          return (
            <div
              key={index}
              className="not-typeset"
            >
              <MediaBlock block={block} />
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
