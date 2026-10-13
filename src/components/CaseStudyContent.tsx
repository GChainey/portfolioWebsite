'use client'

import { useState } from 'react'
import { motion, MotionConfig } from 'framer-motion'
import type { ContentBlock } from '@/content/projects'
import { slugify } from '@/components/TableOfContents'
import { FunnelDiagram } from '@/components/FunnelDiagram'
import { DemoCanvas } from '@/components/DemoCanvas'
import { IterationTimelapse } from '@/components/IterationTimelapse'
import { ClipFrame, clipGeometry } from '@/components/ClipFrame'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentRegistry: Record<string, React.ComponentType<any>> = {
  'funnel-diagram': FunnelDiagram,
  'demo-canvas': DemoCanvas,
  'iteration-timelapse': IterationTimelapse,
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
  const aspectRatio = block.aspectRatio || '16/9'

  // Not ready for the live site, which skips it. The dev server shows where it goes.
  if (block.pending) {
    if (process.env.NODE_ENV !== 'development') return null
    return <PendingSlot block={block} aspectRatio={aspectRatio} />
  }

  if (block.type === 'video') {
    return (
      <figure className="my-8">
        {block.crop ? (
          <ClipFrame src={block.src} crop={block.crop} url={block.url} />
        ) : (
          <div
            className={`relative w-full bg-secondary rounded-lg overflow-hidden ${block.frame === 'phone' ? 'flex items-center justify-center' : ''}`}
            style={{ aspectRatio }}
          >
            <video
              src={block.src}
              autoPlay
              loop
              muted
              playsInline
              className={block.frame === 'phone' ? 'h-[88%] w-auto rounded-[14.6%/7.1%]' : 'w-full h-full object-cover'}
            />
          </div>
        )}
        {block.caption && (
          <figcaption className="mt-2 text-sm text-muted text-center">
            {block.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  if (block.type === 'embed') {
    return (
      <figure className="my-8">
        <div
          className="relative w-full bg-border/30 rounded-lg overflow-hidden"
          style={{ aspectRatio }}
        >
          <iframe
            src={block.src}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {block.caption && (
          <figcaption className="mt-2 text-sm text-muted text-center">
            {block.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  // Image or GIF
  return (
    <figure className="my-8">
      <div
        className="relative w-full bg-secondary rounded-lg overflow-hidden"
        style={{ aspectRatio }}
      >
        <img
          src={block.src}
          alt={block.alt || ''}
          className="w-full h-full object-cover"
        />
      </div>
      {block.caption && (
        <figcaption className="mt-2 text-sm text-muted text-center">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

const ease = [0.25, 0.1, 0.25, 1] as const

// Each block comes in the first time it is scrolled to, so the page builds as it is read:
// the paragraph, then the clip, then the card that goes with it. The blocks already on screen
// when the page opens come in one after another.
const reveal = (index: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -12% 0px' },
  transition: { duration: 0.5, ease, delay: index < 6 ? 0.1 + index * 0.06 : 0 },
})

export function CaseStudyContent({ blocks }: CaseStudyContentProps) {
  return (
    // Visitors who ask for reduced motion get the fades without the movement
    <MotionConfig reducedMotion="user">
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      {blocks.map((block, index) => {

        if (block.type === 'heading') {
          const Tag = block.level === 2 ? 'h2' : 'h3'
          return (
            <motion.div
              key={index}
              {...reveal(index)}
            >
              <Tag
                id={slugify(block.content)}
                className={`font-medium text-foreground scroll-mt-24 ${
                  block.level === 2 ? 'text-2xl mt-12 mb-4' : 'text-xl mt-8 mb-3'
                }`}
              >
                {block.content}
              </Tag>
            </motion.div>
          )
        }

        if (block.type === 'text') {
          return (
            <motion.p
              key={index}
              className="text-muted leading-relaxed mb-4"
              {...reveal(index)}
            >
              {block.content}
            </motion.p>
          )
        }

        if (block.type === 'list') {
          const List = block.ordered ? motion.ol : motion.ul
          return (
            <List
              key={index}
              className={`${block.ordered ? 'list-decimal' : 'list-disc'} list-inside text-muted mb-6 space-y-2`}
              {...reveal(index)}
            >
              {block.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </List>
          )
        }

        if (block.type === 'stats') {
          return (
            <motion.div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-8"
              {...reveal(index)}
            >
              {block.items.map((item, i) => (
                <div key={i} className="border border-border rounded-lg p-5 bg-border/20">
                  <p className="text-4xl md:text-5xl font-medium text-foreground tracking-tight">{item.value}</p>
                  <p className="mt-4 text-foreground">{item.label}</p>
                  {item.note && <p className="mt-1 text-sm text-muted">{item.note}</p>}
                </div>
              ))}
            </motion.div>
          )
        }

        // Read like a diff: what came out, in grey with a minus, and what went in, lit with a plus
        if (block.type === 'comparison') {
          const sides = [
            { label: block.beforeLabel ?? 'Before', lines: [block.before].flat(), now: false },
            { label: block.afterLabel ?? 'Now', lines: [block.after].flat(), now: true },
          ]
          return (
            <motion.div
              key={index}
              className="my-6 overflow-hidden rounded-xl border border-border"
              // The old way lands first, then the new way answers it
              initial="hidden"
              whileInView="shown"
              viewport={{ once: true, margin: '0px 0px -18% 0px' }}
              variants={{ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.3, staggerChildren: 0.45 } } }}
            >
              {sides.map(({ label, lines, now }) => (
                <motion.div
                  key={label}
                  variants={{ hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } }}
                  className={`px-4 py-4 sm:px-5 ${now ? 'border-t border-border' : ''}`}
                  // Tailwind can't apply opacity to the CSS-variable colours, so mix them here
                  style={{ backgroundColor: `color-mix(in srgb, var(${now ? '--accent' : '--foreground'}) ${now ? 9 : 3}%, transparent)` }}
                >
                  <p className={`pl-7 mb-1.5 text-xs uppercase tracking-widest ${now ? 'text-accent' : 'text-muted'}`}>{label}</p>
                  <ul className="space-y-1.5">
                    {lines.map((line) => (
                      <li key={line} className="flex gap-3 leading-relaxed">
                        <span className={`w-4 shrink-0 text-center font-mono ${now ? 'text-accent' : 'text-muted'}`} aria-hidden>
                          {now ? '+' : '−'}
                        </span>
                        <span className={now ? 'text-foreground' : 'text-muted'}>{line}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          )
        }

        if (block.type === 'component') {
          const Component = componentRegistry[block.componentId]
          if (!Component) return null
          return (
            <motion.div
              key={index}
              {...reveal(index)}
            >
              <Component {...(block.props || {})} />
              {block.caption && (
                <p className="mt-2 text-sm text-muted text-center">{block.caption}</p>
              )}
            </motion.div>
          )
        }

        if (block.type === 'image' || block.type === 'gif' || block.type === 'video' || block.type === 'embed') {
          return (
            <motion.div
              key={index}
              {...reveal(index)}
            >
              <MediaBlock block={block} />
            </motion.div>
          )
        }

        return null
      })}
    </div>
    </MotionConfig>
  )
}
