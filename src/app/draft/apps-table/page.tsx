'use client'
/* eslint-disable @next/next/no-img-element -- the screenshots are already sized webps */

import Link from 'next/link'
import { MarkedUp } from '@/components/MarkedUp'
import { Compare } from '@/components/site/compare'
import { FIRST, FRAME, LAST } from '@/content/apps-table-notes'
import { GREY, Headline, INK, Moment } from '@/components/site/style'

// The craft beat for a short case study (/draft/apps-table): the workspace's Apps table as it was
// first built and as it is now, marked up in red the way you would on a whiteboard. Both are
// screenshots of the prototypes repo at that commit, sidebar collapsed: first 5e04e01 (8 Sep),
// last 470858c (13 Nov). The thirteen Paper designs between them (A to M, "One app, many clients")
// are left out on purpose. The notes are in content/apps-table-notes.ts.

export default function DraftAppsTable() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[15px] leading-[22px]" style={{ color: INK }}>
      <main className="mx-auto flex max-w-[588px] flex-col gap-24 px-6 pb-24 pt-16">
        <header className="flex items-start justify-between">
          <Link href="/" className="transition-opacity hover:opacity-70">← Gareth Chainey</Link>
          <span style={{ color: GREY }}>Enterprise AI, 2026</span>
        </header>

        <section className="flex flex-col gap-4">
          <Headline as="h1" lead="The Apps table, first and last." rest="Nine weeks apart." />
          <p>The first version was the table every admin page has. Every number was true, and none of them told the person who owns the apps where to go next.</p>
        </section>

        <Moment mat line="First and last, one over the other.">
          <Compare
            label="Compare the first Apps table with the latest"
            beforeLabel="First, 8 Sep"
            afterLabel="Last, 13 Nov"
            before={<img src="/case-studies/apps-table/first.webp" alt="" className="block h-full w-full" draggable={false} />}
            after={<img src="/case-studies/apps-table/last.webp" alt="" className="block w-full" style={{ aspectRatio: '4 / 3' }} draggable={false} />}
          />
        </Moment>

        <Moment mat line="First, 8 September: a list of apps with their status and counts.">
          <MarkedUp src="/case-studies/apps-table/first.webp" alt="The first Apps table: four totals, then each app with a Live or Draft badge, submissions, completion, when it was edited and a Settings button" frame={FRAME} notes={FIRST} />
        </Moment>

        <Moment mat line="Last, 13 November: who uses each app, what it earns, and whether use is growing.">
          <MarkedUp src="/case-studies/apps-table/last.webp" alt="The Apps table now: tabs for All, Live, On trial and Drafts, one card of paying clients, runs and trials, then each app with its client logos, money earned a month and a 12-week sparkline" frame={FRAME} notes={LAST} />
        </Moment>
      </main>
    </div>
  )
}
