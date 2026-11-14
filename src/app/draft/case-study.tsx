'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { RfpLetter } from '@/components/stageshow/RfpLetter'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { GREY, Headline, INK, Rows, SHELL, Shell } from './style'

// The short case study, in the draft's design: enough to get someone interested, built round three
// things: the impact, the craft, and what AI let me do that I couldn't before (where it applies;
// the pre-AI work leads on growth or craft). The text keeps to the 540px column; the work runs
// wider (up to 720) so it leads. Content in ./case-studies.ts, styles from ./style.

type Region = { x: number; y: number; width: number; height: number }
export type Media =
  | { replay: string; region?: Region } // an HTML replay, sharp at any size
  | { video: string; ratio: number } // the pre-AI work, which only exists as video. Below 1, a phone
  | { stills: string[] } // a few stills side by side, two to a row
  | { scene: 'rfp-letter' } // a Stageshow scene

export type Block =
  | { moment: Media; line: string }
  | { lead: string; rest?: string; body?: string; rows?: [string, string][] }

export type Study = {
  slug: string
  label: string // what the work is called
  meta: string // company, year
  lead: string // the claim, ink
  rest: string // the rest of it, grey
  figure?: { value: string; unit: string }
  rows?: [string, string][]
  blocks: Block[]
}

const COL = 'min(540px, calc(100vw - 48px))'
const WIDE = 'min(720px, calc(100vw - 48px))'

function Video({ src }: { src: string }) {
  return <video src={src} autoPlay muted loop playsInline preload="metadata" className="block h-full w-full object-cover" />
}

function Art({ media }: { media: Media }) {
  if ('replay' in media) return <Shell><div data-ss-fill><RecordingReplay src={media.replay} region={media.region} bare /></div></Shell>
  if ('scene' in media) return <Shell><div data-ss-fill><RfpLetter bare /></div></Shell>
  if ('video' in media) {
    // A phone recording stands on the grey, the height of a landscape clip
    if (media.ratio < 1) return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[20px] p-6" style={{ background: SHELL }}>
        <div className="h-full overflow-hidden rounded-[16px] bg-white" style={{ aspectRatio: media.ratio }}><Video src={media.video} /></div>
      </div>
    )
    return <Shell><div style={{ aspectRatio: media.ratio }}><Video src={media.video} /></div></Shell>
  }
  return (
    <div className="grid grid-cols-2 gap-1 rounded-[20px] p-1" style={{ background: SHELL }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {media.stills.map((s) => <img key={s} src={s} alt="" className="block w-full rounded-[16px] bg-white" />)}
    </div>
  )
}

// A moment: the work, wider than the text, one grey line under it on the column
function Moment({ media, line }: { media: Media; line: string }) {
  return (
    <figure className="flex flex-col gap-3" style={{ marginInline: `calc((${COL} - ${WIDE}) / 2)` }}>
      <Art media={media} />
      <figcaption className="self-center text-[13px] leading-[20px]" style={{ width: COL, color: GREY }}>{line}</figcaption>
    </figure>
  )
}

export function CaseStudy({ study }: { study: Study }) {
  const blocks: ReactNode[] = study.blocks.map((b, i) => 'moment' in b
    ? <Moment key={i} media={b.moment} line={b.line} />
    : (
      <section key={i} className="flex flex-col gap-4">
        <Headline lead={b.lead} rest={b.rest} />
        {b.body && <p className="text-pretty">{b.body}</p>}
        {b.rows && <Rows rows={b.rows} />}
      </section>
    ))
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[15px] leading-[22px]" style={{ color: INK }}>
      <main className="mx-auto flex max-w-[588px] flex-col gap-24 px-6 pb-24 pt-16">
        <header className="flex items-start justify-between gap-4">
          <Link href="/draft" className="transition-opacity hover:opacity-70">← Gareth Chainey</Link>
          <span className="text-right" style={{ color: GREY }}>{study.label}, {study.meta}</span>
        </header>

        <section className="flex flex-col gap-8">
          <Headline as="h1" lead={study.lead} rest={study.rest} />
          {study.figure && (
            <div className="flex flex-col gap-1">
              <span className="text-[40px] leading-[48px] tracking-[-0.02em] tabular-nums">{study.figure.value}</span>
              <span style={{ color: GREY }}>{study.figure.unit}</span>
            </div>
          )}
          {study.rows && <Rows rows={study.rows} />}
        </section>

        {blocks}
      </main>
    </div>
  )
}
