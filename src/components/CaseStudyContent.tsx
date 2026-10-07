'use client'

import { motion } from 'framer-motion'
import type { ContentBlock } from '@/content/projects'
import { slugify } from '@/components/TableOfContents'
import { FunnelDiagram } from '@/components/FunnelDiagram'
import { DemoCanvas } from '@/components/DemoCanvas'
import { IterationTimelapse } from '@/components/IterationTimelapse'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const componentRegistry: Record<string, React.ComponentType<any>> = {
  'funnel-diagram': FunnelDiagram,
  'demo-canvas': DemoCanvas,
  'iteration-timelapse': IterationTimelapse,
}

interface CaseStudyContentProps {
  blocks: ContentBlock[]
}


function MediaBlock({ block }: { block: ContentBlock & { type: 'image' | 'gif' | 'video' | 'embed' } }) {
  const aspectRatio = block.aspectRatio || '16/9'

  if (block.type === 'video') {
    return (
      <figure className="my-8">
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

export function CaseStudyContent({ blocks }: CaseStudyContentProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      {blocks.map((block, index) => {
        const delay = 0.1 + index * 0.05

        if (block.type === 'heading') {
          const Tag = block.level === 2 ? 'h2' : 'h3'
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
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

        if (block.type === 'component') {
          const Component = componentRegistry[block.componentId]
          if (!Component) return null
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
            >
              <MediaBlock block={block} />
            </motion.div>
          )
        }

        return null
      })}
    </div>
  )
}
