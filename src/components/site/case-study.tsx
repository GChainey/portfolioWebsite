'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { RfpLetter } from '@/components/stageshow/RfpLetter'
import { BpSegmented } from '@/components/stageshow/BpSegmented'
import { BpDetailsRow } from '@/components/stageshow/BpDetailsRow'
import { BpNextAvailable } from '@/components/stageshow/BpNextAvailable'
import { BpRepeat } from '@/components/stageshow/BpRepeat'
import { BpProviderDates } from '@/components/stageshow/BpProviderDates'
import { BpOldDialog } from '@/components/stageshow/BpOldDialog'
import { BpFinal } from '@/components/stageshow/BpFinal'
import { EaiNavigation } from '@/components/stageshow/EaiNavigation'
import { EaiSettingsDialog } from '@/components/stageshow/EaiSettingsDialog'
import { EaiOnward } from '@/components/stageshow/EaiOnward'
import { SeekAllTab } from '@/components/stageshow/SeekAllTab'
import { SeekCards } from '@/components/stageshow/SeekCards'
import { SeekConnect } from '@/components/stageshow/SeekConnect'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { Funnel, type FunnelData } from '@/components/site/funnel'
import { Contents } from '@/components/site/contents'
import { RichText } from '@/components/site/reference'
import { Phone } from '@/components/stageshow/kit/phone'
import { Compare } from '@/components/site/compare'
import { COL, GREY, Headline, INK, LINE, Mat, Rows, SHELL, Shell, WIDE } from '@/components/site/style'

// The short case study, in the draft's design: enough to get someone interested, built round three
// things: the impact, the craft, and what AI let me do that I couldn't before (where it applies;
// the pre-AI work leads on growth or craft). The text keeps to the 540px column; the work runs
// wider (up to 720) so it leads. Content in content/short-studies.ts, styles from ./style.

// The Stageshow scenes a moment can show, by name
const SCENES = {
  'rfp-letter': () => <RfpLetter bare />,
  'seek-all-tab': () => <SeekAllTab bare />,
  'seek-cards': () => <SeekCards bare />,
  'seek-connect': () => <SeekConnect bare />,
  'bp-segmented': () => <BpSegmented />,
  'bp-details-row': () => <BpDetailsRow />,
  'bp-next-available': () => <BpNextAvailable />,
  'bp-repeat': () => <BpRepeat />,
  'bp-provider-dates': () => <BpProviderDates />,
  'bp-old-dialog': () => <BpOldDialog />,
  'bp-final': () => <BpFinal />,
  'eai-navigation': () => <EaiNavigation />,
  'eai-settings-dialog': () => <EaiSettingsDialog />,
  'eai-onward': () => <EaiOnward />,
}

type Region = { x: number; y: number; width: number; height: number }
export type Media =
  | { replay: string; region?: Region; phone?: boolean; ground?: boolean } // an HTML replay, sharp at any size. phone: a phone-sized recording, shown in an iPhone on the grey (region crops off its own status bar). ground: the recording paints its own grey page, so it fills the shell with no white panel round it
  | { video: string; ratio: number } // the pre-AI work, which only exists as video. Below 1, a phone
  | { stills: string[] } // a few stills side by side, two to a row
  | { scene: keyof typeof SCENES } // a Stageshow scene
  | { image: string; ratio: number } // a cut-out still (phones on a transparent ground), standing on the grey
  | { funnel: FunnelData } // the interactive funnel: first release, or after the fixes
  | { before: string; after: string } // two phone recordings side by side: the original, then the fix

export type Block =
  | { moment: Media; line: string; was?: { media: Media; line: string } } // was: the old design at this point, one click away (Now | Before)
  | { lead: string; rest?: string; body?: string; rows?: [string, string][]; list?: string[]; id?: string }

export type Study = {
  slug: string
  label: string // what the work is called
  meta: string // company, year
  lead: string // the claim, ink
  rest: string // the rest of it, grey
  role?: string // what I did, first in the facts: a hiring manager's first question
  rows?: [string, string][] // the facts under the headline, the impact first: no big number
  blocks: Block[]
}

function Video({ src }: { src: string }) {
  return <video src={src} autoPlay muted loop playsInline preload="metadata" className="block h-full w-full object-cover" />
}

// The iPhone 18 Pro from the Stageshow kit (Apple's geometry: titanium band, Dynamic Island, its own
// status bar), its outer width ÷ height
const IPHONE_RATIO = (402 + 26) / (874 + 26)

// A phone-sized recording in the iPhone, the recording filling the whole screen: its own status bar
// sits under the Dynamic Island, so a sheet's dimming covers it as iOS does
function IPhone({ src, region, width }: { src: string; region?: Region; width: number }) {
  return (
    <Phone width={width} frame="pro" status={false} className="case-phone" style={{ filter: 'drop-shadow(0 16px 24px rgba(0,0,0,0.12))' }}>
      <RecordingReplay src={src} region={region} bare />
    </Phone>
  )
}

// The phones are sized to the shell's height (24px clear above and below, and room for a label
// over a pair), so they're as big as the frame allows on any screen
function useFit(pad: number) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const fit = () => setWidth(Math.round((el.clientHeight - pad) * IPHONE_RATIO))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [pad])
  return [box, width] as const
}

function PhoneReplay({ src, region }: { src: string; region?: Region }) {
  const [box, width] = useFit(48)
  return (
    <div ref={box} className="flex aspect-[5/4] items-center justify-center rounded-[20px]" style={{ background: SHELL }}>
      {width > 0 && <IPhone src={src} region={region} width={width} />}
    </div>
  )
}

// The original and the fix, side by side: two phones on one grey, each labelled
function PhonePair({ before, after }: { before: string; after: string }) {
  const [box, width] = useFit(84)
  return (
    <div ref={box} className="flex aspect-[5/4] items-center justify-center gap-6 rounded-[20px] min-[600px]:gap-12" style={{ background: SHELL }}>
      {width > 0 && [['Before', before], ['After', after]].map(([label, src]) => (
        <div key={label} className="flex flex-col items-center gap-3">
          <span className="text-[13px] leading-[20px]" style={{ color: GREY }}>{label}</span>
          <IPhone src={src} width={Math.min(width, 280)} />
        </div>
      ))}
    </div>
  )
}

function Art({ media }: { media: Media }) {
  if ('funnel' in media) return <Funnel data={media.funnel} />
  if ('before' in media) return <PhonePair before={media.before} after={media.after} />
  if ('image' in media) return (
    <div className="rounded-[20px] p-3 min-[600px]:p-6" style={{ background: SHELL }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={media.image} alt="" className="block w-full" style={{ aspectRatio: media.ratio }} />
    </div>
  )
  if ('replay' in media && media.phone) return <PhoneReplay src={media.replay} region={media.region} />
  if ('replay' in media && media.ground) return <div className="overflow-hidden rounded-[24px]" style={{ background: SHELL }}><RecordingReplay src={media.replay} region={media.region} bare /></div>
  if ('replay' in media) return <Mat><RecordingReplay src={media.replay} region={media.region} bare /></Mat>
  if ('scene' in media) { const Scene = SCENES[media.scene]; return <Shell scene><div data-ss-fill><Scene /></div></Shell> }
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
    // Stills paint their own grey ground, so they sit straight on the shell: no card round each
    <div className="grid grid-cols-2 gap-3 rounded-[20px] p-3" style={{ background: SHELL }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {media.stills.map((s) => <img key={s} src={s} alt="" className="block w-full" />)}
    </div>
  )
}

// A moment: the work, wider than the text, one grey line under it on the column. With `was`, a
// small Now | Before | Compare switch sits under the work: the new design shows first and the old
// one is a click away, so the page scans as the good work (Gareth, 2026-11-16). Compare lays the
// old over the new with a wipe to drag across (components/site/compare)
type View = 'Now' | 'Before' | 'Compare'
function Moment({ media, line, was }: { media: Media; line: string; was?: { media: Media; line: string } }) {
  const [view, setView] = useState<View>('Now')
  // The frame keeps the new design's height when it shows the old one, so the page doesn't jump
  const frame = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()
  const pick = (v: View) => { if (v !== 'Now' && frame.current && view === 'Now') setHeight(frame.current.offsetHeight); setView(v) }
  const before = view === 'Before' && was
  const shown = before ? was : { media, line }
  return (
    <figure className="flex flex-col gap-3" style={{ marginInline: `calc((${COL} - ${WIDE}) / 2)` }}>
      <div ref={frame} key={view} className="flex animate-[moment-in_200ms_ease-out] flex-col justify-center rounded-[20px]"
        style={before ? { minHeight: height, background: SHELL } : undefined}>
        {view === 'Compare' && was
          ? (
            <div className="overflow-hidden rounded-[20px]">
              <Compare
                after={<Art media={media} />}
                before={<div className="flex h-full flex-col justify-center rounded-[20px]" style={{ background: SHELL }}><Art media={was.media} /></div>}
              />
            </div>
          )
          : <Art media={shown.media} />}
      </div>
      <figcaption className="flex items-start justify-between gap-4 self-center text-[13px] leading-[20px]" style={{ width: COL, color: GREY }}>
        <span className="text-pretty">{shown.line}</span>
        {was && (
          <span role="tablist" aria-label="Now, before, or compare the two" className="grid shrink-0 grid-cols-3 rounded-full p-0.5" style={{ boxShadow: `0 0 0 1px ${LINE}` }}>
            {(['Now', 'Before', 'Compare'] as const).map((t) => {
              const on = t === view
              return (
                <button key={t} role="tab" aria-selected={on} onClick={() => pick(t)}
                  className="rounded-full px-3 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]"
                  style={{ background: on ? INK : 'transparent', color: on ? '#fff' : GREY }}>{t}</button>
              )
            })}
          </span>
        )}
      </figcaption>
    </figure>
  )
}

// A section's id: the one it was given (links point at those), else its headline as a slug
const slug = (t: string) => t.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48)

export function CaseStudy({ study }: { study: Study }) {
  const sections = study.blocks.flatMap((b) => 'lead' in b ? [{ id: b.id ?? slug(b.lead), label: b.lead.replace(/\.$/, '') }] : [])
  const blocks: ReactNode[] = study.blocks.map((b, i) => 'moment' in b
    ? <Moment key={i} media={b.moment} line={b.line} was={b.was} />
    : (
      <section key={i} id={b.id ?? slug(b.lead)} className="flex scroll-mt-16 flex-col gap-4">
        <Headline lead={b.lead} rest={b.rest} stacked />
        {b.body && <p className="text-pretty"><RichText text={b.body} /></p>}
        {b.rows && <Rows rows={b.rows} />}
        {b.list && <ul className="flex list-disc flex-col gap-2 pl-5 text-pretty marker:text-[#666666]">{b.list.map((li) => <li key={li}><RichText text={li} /></li>)}</ul>}
      </section>
    ))
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[15px] leading-[22px]" style={{ color: INK }}>
      <main className="mx-auto flex max-w-[588px] flex-col gap-24 px-6 pb-24 pt-16">
        <header className="flex items-start justify-between gap-4">
          <Link href="/" className="transition-opacity hover:opacity-70">← Gareth Chainey</Link>
          <span className="text-right" style={{ color: GREY }}>{study.label}, {study.meta}</span>
        </header>

        <section id="study-top" className="flex flex-col gap-8">
          <Headline as="h1" lead={study.lead} rest={study.rest} stacked />
          {(study.role || study.rows) && <Rows rows={[...(study.role ? [['My role', study.role] as [string, string]] : []), ...(study.rows ?? [])]} />}
        </section>

        {blocks}
      </main>
      <Contents sections={sections} after="study-top" />
      {/* The recordings carry their own status bar and safe area: the kit's would double them */}
      <style>{'.case-phone .ss-phone__content{padding-top:0!important}.case-phone .ss-phone__home{display:none}@keyframes moment-in{from{opacity:0}to{opacity:1}}'}</style>
    </div>
  )
}
