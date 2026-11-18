'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { RfpLetter } from '@/components/stageshow/RfpLetter'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { COL, GREY, Headline, INK, LINE, Mat, Rows, SHELL, Shell, WIDE } from '@/components/site/style'

// The short case study, in the draft's design: enough to get someone interested, built round three
// things: the impact, the craft, and what AI let me do that I couldn't before (where it applies;
// the pre-AI work leads on growth or craft). The text keeps to the 540px column; the work runs
// wider (up to 720) so it leads. Content in content/short-studies.ts, styles from ./style.

type Region = { x: number; y: number; width: number; height: number }
export type Media =
  | { replay: string; region?: Region } // an HTML replay, sharp at any size
  | { video: string; ratio: number; fill?: boolean } // the pre-AI work, which only exists as video. Below 1, a phone; fill: the clip itself edge to edge, no device (a posted clip)
  | { stills: string[] } // a few stills side by side, two to a row
  | { scene: 'rfp-letter' } // a Stageshow scene
  | { live: string; ratio: number; title: string; mat?: boolean } // a live HTML page (a shader running for real), framed; mat for a tool on the grey
  | { image: string; alt: string } // one still, in the shell

export type Block =
  | { moment: Media; line: string }
  | { lead: string; rest?: string; body?: string; rows?: [string, string][] }

export type Study = {
  slug: string
  label: string // what the work is called
  meta: string // company, year
  lead: string // the claim, ink
  rest: string // the rest of it, grey
  rows?: [string, string][] // the facts under the headline, the impact first: no big number
  blocks: Block[]
}

function Video({ src }: { src: string }) {
  return <video src={src} autoPlay muted loop playsInline preload="metadata" className="block h-full w-full object-cover" />
}

// A live page in an iframe: the real thing, sharp at any size. Loads when near the screen.
function Live({ src, ratio, title }: { src: string; ratio: number; title: string }) {
  return <iframe src={src} title={title} loading="lazy" className="block w-full border-0" style={{ aspectRatio: ratio }} />
}

function Art({ media }: { media: Media }) {
  if ('live' in media) {
    if (media.mat) return <Mat><Live src={media.live} ratio={media.ratio} title={media.title} /></Mat>
    return <div className="overflow-hidden rounded-[20px]" style={{ background: SHELL }}><Live src={media.live} ratio={media.ratio} title={media.title} /></div>
  }
  // eslint-disable-next-line @next/next/no-img-element
  if ('image' in media) return <Shell><img src={media.image} alt={media.alt} className="block w-full" /></Shell>
  if ('replay' in media) return <Mat><RecordingReplay src={media.replay} region={media.region} bare /></Mat>
  if ('scene' in media) return <Shell scene><div data-ss-fill><RfpLetter bare /></div></Shell>
  if ('video' in media) {
    if (media.fill) return <div className="overflow-hidden rounded-[20px]" style={{ aspectRatio: media.ratio, background: SHELL }}><Video src={media.video} /></div>
    // A phone recording stands on the grey, the height of a landscape clip
    // (inset absolutely: a percentage height inside an aspect-ratio box isn't definite, so h-full let
    // the clip grow to its own size)
    if (media.ratio < 1) return (
      <div className="relative aspect-[16/10] rounded-[20px]" style={{ background: SHELL }}>
        <div className="absolute inset-y-6 left-1/2 -translate-x-1/2 overflow-hidden rounded-[16px] bg-white" style={{ aspectRatio: media.ratio, boxShadow: `0 0 0 1px ${LINE}` }}><Video src={media.video} /></div>
      </div>
    )
    return <Mat><div style={{ aspectRatio: media.ratio }}><Video src={media.video} /></div></Mat>
  }
  return (
    <div className="grid grid-cols-2 gap-3 rounded-[20px] p-3" style={{ background: SHELL }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {media.stills.map((s) => <img key={s} src={s} alt="" className="block w-full rounded-[8px] bg-white" style={{ boxShadow: `0 0 0 1px ${LINE}` }} />)}
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
          <Link href="/" className="transition-opacity hover:opacity-70">← Gareth Chainey</Link>
          <span className="text-right" style={{ color: GREY }}>{study.label}, {study.meta}</span>
        </header>

        <section className="flex flex-col gap-8">
          <Headline as="h1" lead={study.lead} rest={study.rest} />
          {study.rows && <Rows rows={study.rows} />}
        </section>

        {blocks}
      </main>
    </div>
  )
}
