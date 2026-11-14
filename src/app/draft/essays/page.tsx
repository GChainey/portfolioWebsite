'use client'

import Link from 'next/link'
import { EssayCard, ESSAYS, GREY, Headline, INK, SHELL, SKILLS } from '../style'

// The essays in the draft's design (/draft/essays): the narrow column, a two-tone headline, then
// every essay as the same little card the homepage's Thoughts row uses, two to a row in one shell.
// Styles from ../style.

export default function DraftEssays() {
  return (
    <div className="min-h-screen bg-white text-[15px] leading-[22px]" style={{ color: INK }}>
      <main className="mx-auto flex max-w-[588px] flex-col gap-16 px-6 pb-24 pt-16">
        <header className="flex items-start justify-between">
          <Link href="/draft" className="transition-opacity hover:opacity-70">← Gareth Chainey</Link>
          <span className="tabular-nums" style={{ color: GREY }}>{ESSAYS.length} essays, {SKILLS.length} skills</span>
        </header>

        <Headline as="h1" lead="Essays." rest="How AI changes the way a product designer works." />

        <div className="grid grid-cols-1 gap-1 rounded-[20px] p-1 min-[480px]:grid-cols-2" style={{ background: SHELL }}>
          {ESSAYS.map((e) => <EssayCard key={e.title} essay={e} className="min-h-[200px]" />)}
        </div>

        <Headline lead="Skills." rest="Published on GitHub, for Claude Code, Codex, Cursor or any agent that reads SKILL.md." />

        <div className="-mt-8 grid grid-cols-1 gap-1 rounded-[20px] p-1 min-[480px]:grid-cols-2" style={{ background: SHELL }}>
          {SKILLS.map((e) => <EssayCard key={e.title} essay={e} className="min-h-[200px]" />)}
        </div>
      </main>
    </div>
  )
}
