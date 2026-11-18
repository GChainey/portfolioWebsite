'use client'

import { notFound } from 'next/navigation'
import { BpSegmented } from '@/components/stageshow/BpSegmented'
import { BpDetailsRow } from '@/components/stageshow/BpDetailsRow'
import { BpNextAvailable } from '@/components/stageshow/BpNextAvailable'
import { BpRepeat } from '@/components/stageshow/BpRepeat'
import { BpProviderDates } from '@/components/stageshow/BpProviderDates'
import { BpOldDialog } from '@/components/stageshow/BpOldDialog'
import { BpFinal } from '@/components/stageshow/BpFinal'
import { COL, Shell, WIDE } from '@/components/site/style'

// The three Best Practice Stageshow scenes in the case study's shells, for filming (dev only).
export default function BpScenes() {
  if (process.env.NODE_ENV === 'production') notFound()
  // In the study's order
  const scenes = [['old', <BpOldDialog key="o" />], ['row', <BpDetailsRow key="b" />], ['seg', <BpSegmented key="a" />], ['repeat', <BpRepeat key="d" />], ['next', <BpNextAvailable key="c" />], ['dates', <BpProviderDates key="e" />], ['final', <BpFinal key="f" />]] as const
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
