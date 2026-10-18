'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Facehash } from 'facehash'
import { CompanyLogo } from './CompanyLogo'
import { splitHighlights, type Testimonial } from '@/content/testimonials'

// A colleague's words between two pieces of work: the whole quote, word for word, with its best
// phrases (content/testimonials.ts `highlights`) marked in the accent as it scrolls into view.
const MARK = 'color-mix(in srgb, var(--accent) 32%, transparent)'

export function KindWord({ t }: { t: Testimonial }) {
  const [marked, setMarked] = useState(false)
  let n = 0

  return (
    <motion.figure
      className="px-8 py-16 border-b border-border"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-25% 0px' }}
      onViewportEnter={() => setMarked(true)}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <blockquote className="max-w-4xl text-2xl md:text-3xl leading-snug tracking-tight text-muted text-pretty">
        &ldquo;
        {splitHighlights(t).map((run, i) => {
          if (!run.hit) return <span key={i}>{run.text}</span>
          const delay = 0.3 + n++ * 0.35
          return (
            <span
              key={i}
              className="text-foreground"
              style={{
                backgroundImage: `linear-gradient(${MARK}, ${MARK})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 88%',
                backgroundSize: `${marked ? 100 : 0}% 0.45em`,
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone',
                transition: `background-size .9s cubic-bezier(.2,.7,.2,1) ${delay}s`,
              }}
            >
              {run.text}
            </span>
          )
        })}
        &rdquo;
      </blockquote>
      <figcaption className="mt-8 flex items-center gap-3">
        <Facehash
          name={t.name}
          size={40}
          showInitial
          interactive={false}
          intensity3d="subtle"
          style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 45%, var(--background))', borderRadius: '9999px', flexShrink: 0 }}
        />
        <div className="min-w-0">
          {t.linkedIn ? (
            <a href={t.linkedIn} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-accent transition-colors">{t.name}</a>
          ) : (
            <p className="font-medium text-foreground">{t.name}</p>
          )}
          <p className="text-sm text-muted">{t.role} · {t.company}</p>
        </div>
        {t.logo && <CompanyLogo id={t.logo} className="ml-auto text-muted" />}
      </figcaption>
    </motion.figure>
  )
}
