'use client'

import { motion } from 'framer-motion'
import type { ContentBlock } from '@/content/projects'
import { slugify } from '@/components/TableOfContents'

interface CaseStudyContentProps {
  blocks: ContentBlock[]
}


function MediaBlock({ block }: { block: ContentBlock & { type: 'image' | 'gif' | 'video' | 'embed' } }) {
  const aspectRatio = block.aspectRatio || '16/9'

  if (block.type === 'video') {
    return (
      <figure className="my-8">
        <div
          className="relative w-full bg-border/30 rounded-lg overflow-hidden"
          style={{ aspectRatio }}
        >
          <video
            src={block.src}
            autoPlay
            loop
            muted
            playsInline
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
        className="relative w-full bg-border/30 rounded-lg overflow-hidden"
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
          return (
            <motion.ul
              key={index}
              className="list-disc list-inside text-muted mb-6 space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay }}
            >
              {block.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </motion.ul>
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
