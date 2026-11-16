'use client'

import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { AppIconPicker } from '@/components/stageshow/AppIconPicker'
import { MarkedUp } from '@/components/MarkedUp'
import { CompaniesCard, type CompaniesVariant } from '@/components/site/companies'
import { LAST, FRAME } from '@/content/apps-table-notes'
import { COL, GREY, Headline, INK, LINE, SHADOW, SHELL, Shell, WIDE } from '@/components/site/style'

// Review (/draft/frames, dev server only): how a piece of work sits on the page. A was chosen and is
// now the site's Shell (components/site/style.tsx). The old Shell was a
// 4px grey ring around a white panel with its own shadow, and a scene inside paints its own grey,
// so you read grey, a shadow line, then grey again. Three ways out, each shown with a Stageshow
// scene and a marked-up screenshot, under today's for comparison.

type Variant = { id: string; name: string; note: string; frame: (children: ReactNode, kind: 'scene' | 'shot') => ReactNode }

// B: no plate. The page is the ground: the window sits straight on white with its own shadow and
// fades out at its foot instead of being cut by a box.
function NoPlate(children: ReactNode, kind: 'scene' | 'shot') {
  return kind === 'shot' ? (
    <div className="overflow-hidden rounded-[12px]" style={{ boxShadow: `0 0 0 1px ${LINE}, ${SHADOW}` }}>{children}</div>
  ) : (
    <div className="frames-noplate" style={{ ['--frame-ground' as string]: 'transparent', ['--mat' as string]: 'transparent' } as CSSProperties}>{children}</div>
  )
}

// C: a canvas. A pale dotted field, like a design tool's, with a hairline edge; the work sits on it
// as an artboard would.
function Canvas(children: ReactNode, kind: 'scene' | 'shot') {
  const dots: CSSProperties = {
    backgroundColor: '#FAFAFA',
    backgroundImage: 'radial-gradient(rgba(0,0,0,0.13) 1px, transparent 1px)',
    backgroundSize: '14px 14px',
    boxShadow: `inset 0 0 0 1px ${LINE}`,
    ['--frame-ground' as string]: 'transparent',
  }
  return (
    <div className="overflow-hidden rounded-[16px]" style={dots}>
      {kind === 'shot' ? <div className="px-6 pt-6"><div className="overflow-hidden rounded-t-[10px]" style={{ boxShadow: `0 0 0 1px ${LINE}, 0 12px 32px -12px rgba(0,0,0,0.18)` }}>{children}</div></div> : children}
    </div>
  )
}

// The Shell as it was before A was chosen, kept here so the comparison still shows it
const TODAY: Variant = {
  id: 'today', name: 'Before', note: 'A grey ring, a white panel with a shadow, then the scene’s own grey.',
  frame: (c) => (
    <div className="rounded-[20px] p-1" style={{ background: SHELL }}>
      <div className="overflow-hidden rounded-[16px] bg-white" style={{ boxShadow: SHADOW }}><div data-ss-fill>{c}</div></div>
    </div>
  ),
}

const VARIANTS: Variant[] = [
  TODAY,
  { id: 'a', name: 'A · One grey (chosen, now the Shell)', note: 'The ring and the ground are one surface. Nothing inside it but the work.', frame: (c, kind) => <Shell scene={kind === 'scene'}>{kind === 'scene' ? <div data-ss-fill>{c}</div> : c}</Shell> },
  { id: 'b', name: 'B · No plate', note: 'The page is the ground. The window keeps its own shadow and fades out at its foot.', frame: NoPlate },
  { id: 'c', name: 'C · Canvas', note: 'A pale dotted field with a hairline edge, the way a design tool shows an artboard.', frame: Canvas },
]

const COMPANY_VARIANTS: { key: string; id: CompaniesVariant; tiles?: 'white' | 'grey'; name: string; note: string }[] = [
  { key: 'before', id: 'before', name: 'Before (live today)', note: 'Three white panels, each with its own shadow, on a grey ring.' },
  { key: 'grey', id: 'grey', tiles: 'white', name: 'One grey, white logo tiles', note: 'No panels: the companies are columns on the grey, a hairline between them. The logo tiles are white.' },
  { key: 'grey-grey', id: 'grey', tiles: 'grey', name: 'One grey, grey logo tiles', note: 'The same, with the logo tiles in the card’s own grey and a hairline round them: pure grey.' },
  { key: 'flat', id: 'flat', name: 'Flat white', note: 'The white panels stay, inset 8px on the grey, with a hairline edge and no shadow.' },
]

function Pair({ v }: { v: Variant }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1" style={{ width: COL }}>
        <span>{v.name}</span>
        <span className="text-[13px] leading-[20px]" style={{ color: GREY }}>{v.note}</span>
      </div>
      <div className="flex flex-col gap-8" style={{ width: WIDE, marginInline: `calc((${COL} - ${WIDE}) / 2)` }}>
        <div data-ss-fill>{v.frame(<AppIconPicker still bare />, 'scene')}</div>
        {v.frame(<MarkedUp src="/case-studies/apps-table/last.webp" alt="The Apps table now, marked up" frame={FRAME} notes={LAST} />, 'shot')}
      </div>
    </section>
  )
}

export default function DraftFrames() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[15px] leading-[22px]" style={{ color: INK }}>
      <style>{`
        /* B: no plate, so the window fades out at its foot instead of meeting a box edge */
        .frames-noplate .ss-stage { -webkit-mask-image: linear-gradient(to bottom, #000 72%, transparent); mask-image: linear-gradient(to bottom, #000 72%, transparent); }
      `}</style>
      <main className="mx-auto flex max-w-[588px] flex-col gap-24 px-6 pb-24 pt-16">
        <header className="flex items-start justify-between">
          <Link href="/draft/details" className="transition-opacity hover:opacity-70">← Details</Link>
          <span style={{ color: GREY }}>Review</span>
        </header>
        <Headline as="h1" lead="How the work sits on the page." rest="Today’s, then three ways out." />
        {VARIANTS.map((v) => <Pair key={v.id} v={v} />)}

        <Headline lead="The company cards." rest="The same question, for the homepage’s three companies." />
        {COMPANY_VARIANTS.map((v) => (
          <section key={v.key} id={`companies-${v.key}`} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span>{v.name}</span>
              <span className="text-[13px] leading-[20px]" style={{ color: GREY }}>{v.note}</span>
            </div>
            <CompaniesCard variant={v.id} tiles={v.tiles} />
          </section>
        ))}
      </main>
    </div>
  )
}
