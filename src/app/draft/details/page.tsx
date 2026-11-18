'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { AppIconPicker } from '@/components/stageshow/AppIconPicker'
import { AppIconSetup } from '@/components/stageshow/AppIconSetup'
import { MarkedUp } from '@/components/MarkedUp'
import { FIRST, FRAME, LAST } from '@/content/apps-table-notes'
import { GREY, Headline, INK, LINE, Moment } from '@/components/site/style'

// Details (/draft/details, dev server only): one long page of small features, each a few lines and
// the work itself, about craft and delight rather than outcomes. Each detail is a hero, then an
// example of it in use. Add a detail to DETAILS; they read top to bottom, newest first.

type Detail = {
  id: string
  where: string // the product, and when
  lead: string // the headline's claim, in ink
  rest: string // the rest of it, in grey
  body: ReactNode
  shots: { node: ReactNode; line: ReactNode; scene?: boolean }[]
}

// A live HTML page (a shader running for real), square, in the shell's grey corners
function LiveFrame({ src, title }: { src: string; title: string }) {
  return <iframe src={src} title={title} loading="lazy" className="block aspect-square w-full border-0" />
}

const DETAILS: Detail[] = [
  {
    id: 'posters',
    where: 'Poster studies, 2026',
    lead: 'A poster for every night out.',
    rest: 'Type, a shader, a tool to tune it, then a clip.',
    body: (
      <>
        <p>After a gig or a talk I make the poster it should have had, to practise type and colour. Each one goes the same way: find the type or the image, put a shader and a colour on it, build a small tool to tune the shader, then export it as a clip to post.</p>
        <p>The shaders are real: Paper&apos;s Lens Distortion and Halftone Dots, running live, here too.</p>
      </>
    ),
    shots: [
      { scene: true, node: <LiveFrame src="/posters/whyte/explainer/index.html?live&v=5" title="How the David Whyte poster was made, running live" />, line: <>David Whyte, New York: Irish letters, moodboards, a lens on stained-glass light, type on the lens, and the studio that makes it breathe. Live, not a video. <Link href="/creative/whyte" className="underline decoration-[#EBEBEB] underline-offset-4 hover:decoration-current">How it was made</Link></> },
      { scene: true, node: <LiveFrame src="/posters/saetia/explainer/index.html?live&v=4" title="How the Saetia poster was made, running live" />, line: <>Saetia, Brooklyn: from a moodboard to 32 AI variations, an accident in the type, a style, a shader and the tool that moves it. Live, not a video. <Link href="/creative/saetia" className="underline decoration-[#EBEBEB] underline-offset-4 hover:decoration-current">How it was made</Link></> },
    ],
  },
  {
    id: 'app-icons',
    where: 'Enterprise AI workspace, 2026',
    lead: 'App icons, drawn from what the app already knows.',
    rest: 'No form to fill in.',
    body: (
      <>
        <p>By the time an app needs an icon, someone has already made it. It has a name, it says what it does, it knows the documents it checks. So the icon step reads that and draws a facet icon from each idea it finds, and shows you which word each one came from.</p>
        <p>Every icon is a facet: one solid shape cut into flat planes, one gap width, no strokes.</p>
      </>
    ),
    shots: [
      { scene: true, node: <AppIconPicker still bare />, line: 'Change it where it lives: point at one and the header, breadcrumb and sidebar show it.' },
      { scene: true, node: <AppIconSetup bare />, line: 'Setting it up: each word lights up as the icon it gave is drawn.' },
    ],
  },
  {
    id: 'apps-table',
    where: 'Enterprise AI workspace, 2026',
    lead: 'The Apps table, first and last.',
    rest: 'Nine weeks apart.',
    body: <p>The first version was the table every admin page has. Every number was true, and none of them told the person who owns the apps where to go next.</p>,
    shots: [
      { node: <MarkedUp src="/case-studies/apps-table/first.webp" alt="The first Apps table: four totals, then each app with a Live or Draft badge, submissions, completion, when it was edited and a Settings button" frame={FRAME} notes={FIRST} />, line: 'First, 8 September.' },
      { node: <MarkedUp src="/case-studies/apps-table/last.webp" alt="The Apps table now: tabs for All, Live, On trial and Drafts, one card of paying clients, runs and trials, then each app with its client logos, money earned a month and a 12-week sparkline" frame={FRAME} notes={LAST} />, line: 'Last, 13 November.' },
    ],
  },
]

export default function DraftDetails() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[15px] leading-[22px]" style={{ color: INK }}>
      <main className="mx-auto flex max-w-[588px] flex-col gap-24 px-6 pb-24 pt-16">
        <header className="flex items-start justify-between">
          <Link href="/" className="transition-opacity hover:opacity-70">← Gareth Chainey</Link>
          <span style={{ color: GREY }}>Details</span>
        </header>

        <section className="flex flex-col gap-4">
          <Headline as="h1" lead="Small details." rest="The parts of the work nobody asks for, and everyone notices." />
        </section>

        {DETAILS.map((d) => (
          <article key={d.id} id={d.id} className="flex scroll-mt-16 flex-col gap-12 border-t pt-12" style={{ borderColor: LINE }}>
            <div className="flex flex-col gap-4">
              <span className="text-[13px] leading-[20px]" style={{ color: GREY }}>{d.where}</span>
              <Headline lead={d.lead} rest={d.rest} />
              <div className="flex flex-col gap-3">{d.body}</div>
            </div>
            {d.shots.map((s, i) => (
              <Moment key={i} line={s.line} scene={s.scene}>{s.node}</Moment>
            ))}
          </article>
        ))}
      </main>
    </div>
  )
}
