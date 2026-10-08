'use client'

import Link from 'next/link'
import { VariantChrome } from '@/components/homepage-variants/VariantChrome'
import { ThinkIntroParagraph } from '@/components/homepage-variants/InlineMarks'
import { DesignToCodePanel } from '@/components/homepage-variants/DesignToCodePanel'
import { DecisionRecordCard } from '@/components/homepage-variants/DecisionRecordCard'
import { VelocityStrip } from '@/components/homepage-variants/VelocityStrip'
import { DECISION_RECORDS, VARIANT_OPEN_TO } from '@/content/homepage-variant-data'

export default function ThinkVariantPage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <VariantChrome variant="think" label="Think" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <div className="mb-10 sm:mb-14">
          <p className="text-xs text-muted uppercase tracking-widest mb-4">Variant B · AI-native</p>
          <ThinkIntroParagraph />
          <p className="mt-8 text-base text-muted max-w-2xl leading-relaxed">{VARIANT_OPEN_TO}</p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get in touch
            </Link>
          </div>
        </div>

        <section className="mb-14 sm:mb-16">
          <h2 className="text-sm font-medium text-foreground mb-1">Paper → live code</h2>
          <p className="text-sm text-muted mb-5 max-w-2xl">
            One thread from the Enterprise AI marketing work: explorations on canvas, then the same idea as shipped HTML.
          </p>
          <DesignToCodePanel />
        </section>

        <section className="mb-14 sm:mb-16">
          <h2 className="text-sm font-medium text-foreground mb-1">Decision records</h2>
          <p className="text-sm text-muted mb-5">Where AI helped, what I pushed back on, and what shipped.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {DECISION_RECORDS.map((record) => (
              <DecisionRecordCard key={record.projectId} record={record} />
            ))}
          </div>
        </section>

        <VelocityStrip />

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
