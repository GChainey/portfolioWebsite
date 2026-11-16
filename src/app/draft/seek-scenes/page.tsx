'use client'

import { notFound } from 'next/navigation'
import { SeekAllTab } from '@/components/stageshow/SeekAllTab'
import { SeekCards } from '@/components/stageshow/SeekCards'
import { SeekConnect } from '@/components/stageshow/SeekConnect'
import { Shell } from '@/components/site/style'

// Dev-only preview of the SEEK Stageshow scenes in the case study's shell, for filming
// (/draft/seek-scenes). Each sits at the moment column's width
export default function SeekScenes() {
  if (process.env.NODE_ENV === 'production') notFound()
  return (
    <main className="mx-auto flex max-w-[768px] flex-col gap-16 px-6 py-16">
      {[['all-tab', <SeekAllTab key="a" bare />], ['cards', <SeekCards key="c" bare />], ['connect', <SeekConnect key="n" bare />]].map(([id, el]) => (
        <section key={id as string} id={id as string}><Shell scene><div data-ss-fill>{el}</div></Shell></section>
      ))}
    </main>
  )
}
