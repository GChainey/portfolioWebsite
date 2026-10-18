'use client'

import { motion } from 'framer-motion'
import { CompanyLogo } from './CompanyLogo'
import { TESTIMONIALS } from '@/content/testimonials'

// Kind words, cut to the line that carries each one (content/testimonials.ts `pull`, word for
// word). One row on a wide screen; on a phone it scrolls sideways.
export function TestimonialSnippets({ borders }: { borders: boolean }) {
  return (
    <section className="border-b border-border" aria-label="Kind words from colleagues">
      <div className={`px-8 ${borders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
        <p className="text-xs text-muted uppercase tracking-widest">Kind words from colleagues</p>
      </div>
      <div className="flex overflow-x-auto snap-x snap-mandatory">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex min-w-[240px] flex-1 snap-start flex-col justify-between gap-6 p-6 border-r border-border last:border-r-0"
          >
            <blockquote className="text-lg font-medium leading-snug tracking-tight text-foreground text-balance">
              &ldquo;{t.pull}&rdquo;
            </blockquote>
            <figcaption className="text-sm">
              {t.linkedIn ? (
                <a href={t.linkedIn} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-accent transition-colors">{t.name}</a>
              ) : (
                <span className="text-foreground">{t.name}</span>
              )}
              <p className="text-muted">{t.role}</p>
              {t.logo && <CompanyLogo id={t.logo} className="mt-3 text-muted" />}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
