'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { RfpLetter } from '@/components/stageshow/RfpLetter'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { GREY, Headline, INK, Rows, Shell } from '../style'

// A short case study in the draft's narrow design (/draft/rfp): enough of the work to get someone
// interested and no more. The claim, the result, three moments that show it (a Stageshow scene and
// two replays) and what happened. The text keeps to the 540px column; the artefacts run wider
// (up to 720) so the work leads. Styles from ../style.

const COL = 'min(540px, calc(100vw - 48px))'
const WIDE = 'min(720px, calc(100vw - 48px))'

// A moment: the work in a shell, wider than the text, one grey line under it on the column
function Moment({ children, line }: { children: ReactNode; line: string }) {
  return (
    <figure className="flex flex-col gap-3" style={{ marginInline: `calc((${COL} - ${WIDE}) / 2)` }}>
      <Shell><div data-ss-fill>{children}</div></Shell>
      <figcaption className="self-center text-[13px] leading-[20px]" style={{ width: COL, color: GREY }}>{line}</figcaption>
    </figure>
  )
}

export default function DraftRfp() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[15px] leading-[22px]" style={{ color: INK }}>
      <main className="mx-auto flex max-w-[588px] flex-col gap-24 px-6 pb-24 pt-16">
        <header className="flex items-start justify-between">
          <Link href="/draft" className="transition-opacity hover:opacity-70">← Gareth Chainey</Link>
          <span style={{ color: GREY }}>Enterprise AI, 2025</span>
        </header>

        <section className="flex flex-col gap-8">
          <Headline as="h1" lead="One designer answered a state government tender with a working product." rest="Up against vendors with whole teams." />
          <div className="flex flex-col gap-1">
            <span className="text-[40px] leading-[48px] tracking-[-0.02em] tabular-nums">$2 million</span>
            <span style={{ color: GREY }}>in deals won since, from this design</span>
          </div>
          <Rows rows={[['Designers', '1, where it took 3 to 5'], ['A major feature', 'Days, not weeks'], ['Markets', '2, English and Polish']]} />
        </section>

        <Moment line="The working prototype we answered with: open an application and follow it through the council’s workflow.">
          <RecordingReplay src="/replays/rfp/overview.json" bare />
        </Moment>

        <section className="flex flex-col gap-4">
          <Headline lead="Why it worked." rest="People could use it, not just look at it." />
          <p>Before AI, I would have answered with Figma mock-ups and a lot of help. This time I built the product with Claude Code, connected to real models and one set of seed data, so the people judging the tender could try it for themselves.</p>
        </section>

        <Moment line="Tick a reviewer’s issue in, and it’s written into the request for information.">
          <RfpLetter bare />
        </Moment>

        <Moment line="Rough notes in a field, rewritten by a live model the way that council writes its reports.">
          <RecordingReplay src="/replays/rfp/spot-rewrite.json" region={{ x: 802, y: 117, width: 555, height: 336 }} bare />
        </Moment>

        <section className="flex flex-col gap-4">
          <Headline lead="What happened next." rest="The prototype outlived the tender." />
          <Rows rows={[['Today', 'Still iterated on'], ['Engineering', 'Kept building on it, no hand-off'], ['Design', 'Ahead of the build, not held to its limits']]} />
        </section>
      </main>
    </div>
  )
}
