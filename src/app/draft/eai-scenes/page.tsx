'use client'

import { notFound } from 'next/navigation'
import { EaiNavigation } from '@/components/stageshow/EaiNavigation'
import { EaiSettingsDialog } from '@/components/stageshow/EaiSettingsDialog'
import { EaiOnward } from '@/components/stageshow/EaiOnward'
import { COL, Shell, WIDE } from '@/components/site/style'

// The Enterprise AI Stageshow scenes in the case study's shells, for filming (dev only)
export default function EaiScenes() {
  if (process.env.NODE_ENV === 'production') notFound()
  const scenes = [['navigation', <EaiNavigation key="n" />], ['settings-dialog', <EaiSettingsDialog key="s" />], ['onward', <EaiOnward key="o" />]] as const
  return (
    <main className="mx-auto flex max-w-[588px] flex-col gap-24 px-6 py-16">
      {scenes.map(([id, el]) => (
        <section key={id} id={id} style={{ marginInline: `calc((${COL} - ${WIDE}) / 2)` }}>
          <Shell scene><div data-ss-fill>{el}</div></Shell>
        </section>
      ))}
    </main>
  )
}
