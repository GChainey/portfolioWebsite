'use client'

import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { DESIGN_TO_CODE_DEMO } from '@/content/homepage-variant-data'

export function DesignToCodePanel() {
  return (
    <section className="grid md:grid-cols-2 gap-4 sm:gap-6">
      <figure className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="relative aspect-[16/10] bg-muted/20">
          <Image
            src={DESIGN_TO_CODE_DEMO.designImage}
            alt="Paper explorations for the Enterprise AI marketing site"
            fill
            className="object-cover object-left-top"
            sizes="(max-width:768px) 100vw, 50vw"
            priority
          />
        </div>
        <figcaption className="p-4 text-sm text-muted border-t border-border">{DESIGN_TO_CODE_DEMO.designCaption}</figcaption>
      </figure>

      <figure className="rounded-2xl border border-border overflow-hidden bg-card flex flex-col">
        <div className="relative aspect-[16/10] bg-muted/20">
          <Image
            src={DESIGN_TO_CODE_DEMO.livePoster}
            alt="Live marketing homepage with chat on a running shader"
            fill
            className="object-cover object-top"
            sizes="(max-width:768px) 100vw, 50vw"
            priority
          />
        </div>
        <figcaption className="p-4 text-sm text-muted border-t border-border flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex-1 min-w-[12rem]">{DESIGN_TO_CODE_DEMO.liveCaption}</span>
          <a
            href={DESIGN_TO_CODE_DEMO.liveSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-foreground hover:text-accent transition-colors shrink-0"
          >
            Open live prototype
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </figcaption>
      </figure>
    </section>
  )
}
