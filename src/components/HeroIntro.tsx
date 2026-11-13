'use client'

import Link from 'next/link'
import { Fragment } from 'react'
import { GitHubContributions } from '@/components/GitHubContributions'

// The homepage hero as a short, clear introduction (?hero=intro), after justinschueler.com: a
// narrow column, one family at two sizes (15 and 24), soft ink and one grey. The statement lights
// up word by word, in reading order, from a faint ghost; everything around it waits in a fog and
// clears as the sentence finishes, so the sentence is read first. People who prefer less motion
// get it all at once.

const INK = '#181818'
const GREY = '#666666'

// The statement, as runs: plain words, or words that link
type Run = { text: string; href?: string }
const STATEMENT: Run[] = [
  { text: 'I’m Gareth, an Aussie product designer in New York. I design by building: ' },
  { text: 'working prototypes', href: '#work' },
  { text: ', made with AI, that help small teams win big deals.' },
]

const WORD_START = 0.3 // s before the first word
const WORD_STEP = 0.04 // s between words
const WORD_TIME = 0.9 // s for each word to light up
const FOG_TIME = 2.2

const CSS = `
.hi-word { display: inline-block; opacity: .15; animation: hi-word ${WORD_TIME}s cubic-bezier(.23,1,.32,1) forwards; }
@keyframes hi-word { to { opacity: 1 } }
.hi-fog { animation: hi-fog ${FOG_TIME}s cubic-bezier(.23,1,.32,1) backwards; }
@keyframes hi-fog { from { opacity: .2; filter: blur(8px) } to { opacity: 1; filter: none } }
.hi-link { text-decoration-line: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; text-decoration-color: #c8c8c8; transition: text-decoration-color 150ms ease; }
@media (hover: hover) and (pointer: fine) { .hi-link:hover { text-decoration-color: ${INK}; } }
@media (prefers-reduced-motion: reduce) { .hi-word, .hi-fog { animation: none; opacity: 1; } }
`

// Split the runs into words, each with its place in reading order, keeping punctuation with the
// word before it (a run that starts with a comma joins the last word)
function words() {
  let i = 0
  return STATEMENT.map((run) => ({
    run,
    words: run.text.split(/(\s+)/).filter(Boolean).map((w) => (/^\s+$/.test(w) ? { space: true as const, w } : { space: false as const, w, i: i++ })),
  }))
}

export function HeroIntro() {
  const runs = words()
  const total = runs.reduce((n, r) => n + r.words.filter((w) => !w.space).length, 0)
  // The fog starts clearing a little before the last word lands
  const fogDelay = WORD_START + total * WORD_STEP + WORD_TIME - 0.6

  const lit = (run: (typeof runs)[number]) =>
    run.words.map((w, k) => w.space
      ? <Fragment key={k}>{w.w}</Fragment>
      : <span key={k} className="hi-word" style={{ animationDelay: `${WORD_START + w.i * WORD_STEP}s` }}>{w.w}</span>)

  return (
    <section className="mx-auto flex w-full max-w-[588px] flex-col gap-20 px-6 pb-24 pt-28 md:pt-36" style={{ color: INK }}>
      <style>{CSS}</style>

      <h1 className="text-[24px] font-normal leading-[28px] tracking-[-0.02em] text-pretty">
        {runs.map((r, k) => r.run.href
          ? <Link key={k} href={r.run.href} className="hi-link">{lit(r)}</Link>
          : <Fragment key={k}>{lit(r)}</Fragment>)}
      </h1>

      <div className="hi-fog flex flex-col gap-10" style={{ animationDelay: `${fogDelay}s` }}>
        <div className="flex flex-col gap-3 text-[15px] leading-[22px]">
          <h2 className="font-normal" style={{ color: GREY }}>Now</h2>
          <p>
            Lead product designer at{' '}
            <Link href="/about" className="hi-link">Enterprise AI Group</Link>, a one-person product team building the prototypes that win its deals.
          </p>
        </div>
        <GitHubContributions variant="full" animate />
      </div>
    </section>
  )
}
