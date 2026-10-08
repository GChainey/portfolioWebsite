'use client'

import Image from 'next/image'
import { ScaledFrame } from '@/components/ScaledFrame'
import { DESIGN_TO_CODE_DEMO } from '@/content/homepage-variant-data'

export function DesignToCodePanel() {
  return (
    <section className="grid md:grid-cols-2 gap-4 sm:gap-6">
      <figure className="rounded-2xl border border-border overflow-hidden bg-card">
        <div className="relative aspect-[16/10]">
          <Image src={DESIGN_TO_CODE_DEMO.designImage} alt="" fill className="object-cover object-left-top" sizes="(max-width:768px) 100vw, 50vw" />
        </div>
        <figcaption className="p-4 text-sm text-muted border-t border-border">{DESIGN_TO_CODE_DEMO.designCaption}</figcaption>
      </figure>
      <figure className="rounded-2xl border border-border overflow-hidden bg-card p-3 sm:p-4">
        <ScaledFrame src={DESIGN_TO_CODE_DEMO.liveSrc} title="Live marketing shader prototype" width={1280} height={800} passive />
        <figcaption className="pt-3 text-sm text-muted">{DESIGN_TO_CODE_DEMO.liveCaption}</figcaption>
      </figure>
    </section>
  )
}
