'use client'

import Link from 'next/link'
import { MarkedUp, type Note } from '@/components/MarkedUp'
import { GREY, Headline, INK, Moment } from '@/components/site/style'

// The craft beat for a short case study (/draft/apps-table): the workspace's Apps table as it was
// first built and as it is now, marked up in red the way you would on a whiteboard. Both are
// screenshots of the prototypes repo at that commit, sidebar collapsed: first 5e04e01 (8 Sep),
// last 470858c (13 Nov). The thirteen Paper designs between them (A to M, "One app, many clients")
// are left out on purpose. Notes are placed in the screenshot's own 1200 × 900 pixels.

const FRAME: [number, number] = [1200, 900]

const FIRST: Note[] = [
  { text: 'True, but where do I go?', at: [330, 86], ring: { cx: 626, cy: 208, rx: 548, ry: 76 }, arrow: { from: [712, 110], to: [756, 136] } },
  { text: '“Live” shouts on every row', at: [372, 512], width: 240, align: 'right', ring: { cx: 675, cy: 556, rx: 44, ry: 178 } },
  { text: 'No money, no trend', at: [600, 742], ring: { cx: 879, cy: 532, rx: 150, ry: 200 } },
  { text: 'Six identical buttons', at: [880, 742], width: 300, align: 'right', ring: { cx: 1106, cy: 556, rx: 58, ry: 182 } },
]

const LAST: Note[] = [
  { text: 'Status became tabs', at: [486, 150], ring: { cx: 253, cy: 168, rx: 190, ry: 34 }, arrow: { from: [480, 172], to: [448, 170] } },
  { text: 'Clients, money, trend', at: [760, 372], ring: { cx: 903, cy: 446, rx: 272, ry: 30 } },
  { text: 'No buttons: the row opens the app', at: [600, 826], width: 560, align: 'right', arrow: { from: [1172, 826], to: [1176, 768] } },
]

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

        <Moment line="First, 8 September: a list of apps with their status and counts.">
          <MarkedUp src="/case-studies/apps-table/first.webp" alt="The first Apps table: four totals, then each app with a Live or Draft badge, submissions, completion, when it was edited and a Settings button" frame={FRAME} notes={FIRST} />
        </Moment>

        <Moment line="Last, 13 November: who uses each app, what it earns, and whether use is growing.">
          <MarkedUp src="/case-studies/apps-table/last.webp" alt="The Apps table now: tabs for All, Live, On trial and Drafts, one card of paying clients, runs and trials, then each app with its client logos, money earned a month and a 12-week sparkline" frame={FRAME} notes={LAST} />
        </Moment>
      </main>
    </div>
  )
}
