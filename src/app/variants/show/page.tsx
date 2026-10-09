'use client'

import Link from 'next/link'
import { VariantChrome } from '@/components/homepage-variants/VariantChrome'
import { PositioningLine } from '@/components/homepage-variants/InlineMarks'
import { BentoWorkCard } from '@/components/homepage-variants/BentoWorkCard'
import { SHOW_CARDS, VARIANT_OPEN_TO } from '@/content/homepage-variant-data'

export default function ShowVariantPage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <VariantChrome variant="show" label="Show" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <div className="mb-10 sm:mb-12">
          <p className="text-xs text-muted uppercase tracking-widest mb-4">Variant A · Visual-first</p>
          <PositioningLine />
          <p className="mt-6 text-base text-muted max-w-2xl leading-relaxed">{VARIANT_OPEN_TO}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get in touch
            </Link>
            <Link
              href="/cv"
              className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              CV
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-flow-dense gap-3 sm:gap-4">
          {SHOW_CARDS.map((card) => (
            <BentoWorkCard key={card.id} card={card} />
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted">
          Unlisted preview ·{' '}
          <Link href="/variants" className="underline underline-offset-2 hover:text-accent">
            All variants
          </Link>
        </p>
      </main>
    </div>
  )
}
