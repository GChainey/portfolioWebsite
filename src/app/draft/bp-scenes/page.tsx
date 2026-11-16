'use client'

import { notFound } from 'next/navigation'
import { BpSegmented } from '@/components/stageshow/BpSegmented'
import { BpDetailsRow } from '@/components/stageshow/BpDetailsRow'
import { BpNextAvailable } from '@/components/stageshow/BpNextAvailable'
import { COL, Shell, WIDE } from '@/components/site/style'

// The three Best Practice Stageshow scenes in the case study's shells, for filming (dev only).
export default function BpScenes() {
  if (process.env.NODE_ENV === 'production') notFound()
  const scenes = [['seg', <BpSegmented key="a" />], ['row', <BpDetailsRow key="b" />], ['next', <BpNextAvailable key="c" />]] as const
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
