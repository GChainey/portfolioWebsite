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

const DETAILS: Detail[] = [
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
