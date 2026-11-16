'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { RfpLetter } from '@/components/stageshow/RfpLetter'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { Funnel, type FunnelData } from '@/components/site/funnel'
import { COL, GREY, Headline, INK, LINE, Mat, Rows, SHELL, Shell, WIDE } from '@/components/site/style'

// The short case study, in the draft's design: enough to get someone interested, built round three
// things: the impact, the craft, and what AI let me do that I couldn't before (where it applies;
// the pre-AI work leads on growth or craft). The text keeps to the 540px column; the work runs
// wider (up to 720) so it leads. Content in content/short-studies.ts, styles from ./style.

type Region = { x: number; y: number; width: number; height: number }
export type Media =
  | { replay: string; region?: Region; phone?: number; ground?: boolean } // an HTML replay, sharp at any size. phone: its width ÷ height, shown as a phone on the grey. ground: the recording paints its own grey page, so it fills the shell with no white panel round it
  | { video: string; ratio: number } // the pre-AI work, which only exists as video. Below 1, a phone
  | { stills: string[] } // a few stills side by side, two to a row
  | { scene: 'rfp-letter' } // a Stageshow scene
  | { image: string; ratio: number } // a cut-out still (phones on a transparent ground), standing on the grey
  | { funnel: FunnelData } // the interactive funnel: first release, or after the fixes
  | { hero: { desktop: string; desktopRatio: number; phone: string; phoneRatio: number; phoneReplay?: boolean } } // desktop and phone together; the phone a video or an HTML replay

export type Block =
  | { moment: Media; line: string }
  | { lead: string; rest?: string; body?: string; rows?: [string, string][]; list?: string[]; id?: string }

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

function Art({ media }: { media: Media }) {
  if ('funnel' in media) return <Funnel data={media.funnel} />
  if ('hero' in media) {
    // The desktop as a window on the grey, the phone standing in front of its right edge
    const h = media.hero
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-[24px]" style={{ background: SHELL }}>
        <div className="absolute left-[5%] top-[8%] w-[74%] overflow-hidden rounded-[10px] bg-white" style={{ aspectRatio: h.desktopRatio, boxShadow: `0 0 0 1px ${LINE}` }}><Video src={h.desktop} /></div>
        {h.phoneReplay
          ? <div className="absolute bottom-[8%] right-[5%] h-[84%] overflow-hidden rounded-[20px] bg-white" style={{ aspectRatio: h.phoneRatio, boxShadow: `0 0 0 1px ${LINE}, 0 16px 32px -12px rgba(0,0,0,0.25)` }}><RecordingReplay src={h.phone} bare /></div>
          : <div className="absolute bottom-[8%] right-[5%] h-[84%] overflow-hidden" style={{ aspectRatio: h.phoneRatio, borderRadius: '15% / 7.2%', filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.18))' }}><Video src={h.phone} /></div>}
      </div>
    )
  }
  if ('image' in media) return (
    <div className="rounded-[20px] p-3 min-[600px]:p-6" style={{ background: SHELL }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media.image} alt="" className="block w-full" style={{ aspectRatio: media.ratio }} />
    </div>
  )
  if ('replay' in media && media.phone) return (
    // A phone-sized replay stands on the grey as a plain screen (no drawn bezel): rounded like a
    // phone, a hairline edge, one soft shadow. A taller frame than a landscape clip, so it reads
    <div className="relative aspect-[5/4] rounded-[20px]" style={{ background: SHELL }}>
      <div className="absolute inset-y-6 left-1/2 -translate-x-1/2 overflow-hidden rounded-[28px] bg-white" style={{ aspectRatio: media.phone, boxShadow: `0 0 0 1px ${LINE}, 0 16px 32px -16px rgba(0,0,0,0.2)` }}>
        <RecordingReplay src={media.replay} bare />
      </div>
    </div>
  )
  if ('replay' in media && media.ground) return <div className="overflow-hidden rounded-[24px]" style={{ background: SHELL }}><RecordingReplay src={media.replay} region={media.region} bare /></div>
  if ('replay' in media) return <Mat><RecordingReplay src={media.replay} region={media.region} bare /></Mat>
  if ('scene' in media) return <Shell scene><div data-ss-fill><RfpLetter bare /></div></Shell>
  if ('video' in media) {
    // A phone recording stands on the grey, the height of a landscape clip. The recording is the
    // phone, bezel and all, on black: round it to the bezel's corners so the black doesn't show
    if (media.ratio < 1) return (
      <div className="relative aspect-[16/10] rounded-[20px]" style={{ background: SHELL }}>
        <div className="absolute inset-y-6 left-1/2 -translate-x-1/2 overflow-hidden" style={{ aspectRatio: media.ratio, borderRadius: '15% / 7.2%' }}><Video src={media.video} /></div>
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
      <section key={i} id={b.id} className="flex scroll-mt-16 flex-col gap-4">
        <Headline lead={b.lead} rest={b.rest} />
        {b.body && <p className="text-pretty">{b.body}</p>}
        {b.rows && <Rows rows={b.rows} />}
        {b.list && <ul className="flex list-disc flex-col gap-2 pl-5 text-pretty marker:text-[#666666]">{b.list.map((li) => <li key={li}>{li}</li>)}</ul>}
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
