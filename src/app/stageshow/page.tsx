'use client'

import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { PARKED_LIVE } from '@/content/parked'
import { RfpLetter } from '@/components/stageshow/RfpLetter'
import { ShaderWallPresets } from '@/components/stageshow/ShaderWallPresets'
import { TrayCard, TestimonialTray } from '@/components/cards/TrayCard'

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

        {/* The tray cards (components/cards/TrayCard) with Stageshow scenes as their previews, at the
            narrow homepage's 540px column */}
        <section className="pb-20">
          <h2 className="text-lg font-medium text-foreground">Cards: a scene in the white card, the details on the tray</h2>
          <p className="mt-1 text-muted">The style chosen in Paper. Each preview is a Stageshow scene, not a screenshot.</p>
          <div className="mt-8 flex flex-col gap-16" style={{ width: 'min(540px, 100%)' }}>
            <TrayCard
              preview={<ShaderWallPresets />}
              title="Shader Wall"
              descriptor="For your Mac desktop"
              summary="An agentic friendly native macOS app to set and create shaders as your background."
              ticks={['Tune it with sliders', 'Or ask your agent, over MCP', 'Click through the presets']}
              note="shaderwall.com"
              link={{ label: 'Visit Shader Wall', href: 'https://www.shaderwall.com', external: true }}
            />
            <TrayCard
              preview={<RfpLetter bare />}
              title="Winning a tender"
              descriptor="Enterprise AI, 2025"
              figure={{ value: '$2 million', unit: 'in deals won since, from this design' }}
              facts={[['Designers', '1, where it took 3 to 5'], ['A major feature', 'Days, not weeks'], ['Markets', '2, English and Polish']]}
              ticks={['Data that stays consistent', 'AI features that really answer', 'From council scale to state scale']}
              link={{ label: 'Read the case study', href: '/projects/rfp', primary: true }}
            />
            <TestimonialTray
              pull="Gareth is a pleasure to work with and an asset to any team."
              rest="He is diligent in discovery, passionate about the end user, empathetic, and collaborative in his approach."
              company="SEEK"
              name="Winnie Bamra"
              role="Senior Product Manager"
              link={{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/wbamra/', external: true }}
            />
          </div>
        </section>

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
