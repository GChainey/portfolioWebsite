'use client'

import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { PARKED_LIVE } from '@/content/parked'
import { RfpLetter } from '@/components/stageshow/RfpLetter'

// Parked Stageshow scenes (src/components/stageshow), kept to pull into the case study redesign.
// Dev server only, like /parked. A scene goes back into a case study as a component block, e.g.
// { type: 'component', componentId: 'rfp-letter-scene', caption: '…' } in src/content/projects.ts.
export default function StageshowPage() {
  if (!PARKED_LIVE) notFound()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-6 pb-20 pt-14">
        <div className="py-14">
          <h1 className="mb-5 text-5xl font-medium text-foreground">Stageshow scenes</h1>
          <p className="max-w-2xl text-xl leading-relaxed text-muted">
            Faux-UI scenes built with the Stageshow kit, parked for the case study redesign. Dev server only.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-medium text-foreground">RFP: the request for information letter</h2>
          <p className="mt-1 text-muted">
            Tick two reviewers&rsquo; issues in, and each is written into the letter. <code className="text-sm text-foreground">rfp-letter-scene</code>, from{' '}
            <code className="text-sm text-foreground">src/components/stageshow/RfpLetter.tsx</code>. Was the spotlight in &ldquo;5. Workflows that end somewhere real&rdquo;.
          </p>
          <RfpLetter />
        </section>
      </main>
    </div>
  )
}
