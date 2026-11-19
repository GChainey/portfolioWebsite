'use client'

import { notFound } from 'next/navigation'
import { EaiResult } from '@/components/stageshow/EaiResult'
import { EaiNavigation } from '@/components/stageshow/EaiNavigation'
import { EaiSettingsDialog } from '@/components/stageshow/EaiSettingsDialog'
import { EaiOnward } from '@/components/stageshow/EaiOnward'
import { COL, Shell, WIDE } from '@/components/site/style'

// The Enterprise AI Stageshow scenes in the case study's shells, in story order, for filming (dev only):
// the end result, then each problem and its answer as its own moment
export default function EaiScenes() {
  if (process.env.NODE_ENV === 'production') notFound()
  const scenes = [
    ['result', <EaiResult key="r" />],
    ['navigation-problem', <EaiNavigation key="np" mode="problem" />],
    ['navigation-answer', <EaiNavigation key="na" mode="answer" />],
    ['settings-problem', <EaiSettingsDialog key="sp" mode="problem" />],
    ['settings-answer', <EaiSettingsDialog key="sa" mode="answer" />],
    ['onward-problem', <EaiOnward key="op" mode="problem" />],
    ['onward-answer', <EaiOnward key="oa" mode="answer" />],
  ] as const
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
