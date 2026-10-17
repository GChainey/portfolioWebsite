'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { PRODUCTS } from '@/content/work'
import { WorkLink } from '@/components/showcase/shared'

// The three products, after the case studies and clearly smaller: a poster, a name, a line
// and the way out to the product.
export function Products({ reduced }: { reduced: boolean }) {
  return (
    <section className="border-y border-border" aria-label="Products">
      <div className="flex items-center justify-between gap-4 border-b border-border px-8 py-4">
        <p className="text-xs uppercase tracking-widest text-muted">Products</p>
        <p className="text-xs text-muted">Three I built</p>
      </div>
      <div className="grid md:grid-cols-3">
        {PRODUCTS.map((w, i) => (
          <motion.div
            key={w.id}
            className={`border-border ${i < PRODUCTS.length - 1 ? 'border-b md:border-b-0 md:border-r' : ''}`}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <WorkLink item={w} className="flex h-full flex-col p-6 focus-visible:outline-none">
              <div className="dv-poster relative overflow-hidden rounded-lg bg-card" style={{ aspectRatio: '16 / 10' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.poster} alt={`${w.name}: ${w.title}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
              </div>
              <p className="mt-5 flex items-center gap-2 text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: w.accent }} />
                <span className="text-foreground">{w.name}</span>
                <span>· {w.kicker.split(' · ')[1] ?? w.kicker}</span>
              </p>
              <h3 className="mt-2 text-base font-medium leading-snug text-foreground text-balance">{w.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted text-pretty">{w.summary}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm text-foreground transition-colors group-hover:text-accent group-focus-visible:text-accent">
                {w.cta}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </WorkLink>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
