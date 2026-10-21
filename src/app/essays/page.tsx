'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatPopup } from '@/components/ChatPopup'
import { SiteFooter } from '@/components/SiteFooter'
import { projectHref, writing } from '@/content/projects'

// The essays, one per row, in the homepage's look: a big heading, lots of space, no panels
const ESSAYS = writing.filter((p) => p.category === 'Article')

const PAGE_CONTEXT = {
  page: 'Essays',
  description: `Gareth's essays: ${ESSAYS.map((e) => e.title).join('; ')}. They are about how AI changes the way a product designer works.`,
  suggestedQuestions: ['Which essay should I start with?', 'What is agentic user testing?', 'Why record screens as HTML?'],
  followUpQuestions: ['How do you build your own tools?', 'When does a GUI earn its place?', 'How do you handle conflict?'],
}

const H1 = 'text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground'

export default function EssaysPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Header />
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-7xl flex-col pt-14">
        <main className="flex flex-1 flex-col">
          <div className="flex flex-col px-6 pb-24">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              aria-labelledby="essays"
              className="flex flex-col gap-6 pb-12 pt-24"
            >
              <h1 id="essays" className={H1}>Essays</h1>
              <p className="max-w-3xl text-[22px] leading-[34px] tracking-[-0.01em] text-muted text-pretty">
                How AI is changing the way I design, build and test, written as I go.
              </p>
            </motion.section>

            <ol className="flex max-w-4xl flex-col">
              {ESSAYS.map((essay, i) => (
                <motion.li
                  key={essay.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                  className="border-t border-border last:border-b"
                >
                  <Link href={projectHref(essay)!} className="group flex items-baseline gap-6 py-8">
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-foreground transition-colors group-hover:text-accent text-balance">{essay.title}</span>
                      <span className="text-base leading-[26px] text-muted text-pretty">{essay.description}</span>
                    </span>
                    <span className="hidden shrink-0 text-sm text-muted tabular-nums sm:block">{essay.year}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted transition-all group-hover:translate-x-1 group-hover:text-accent" />
                  </Link>
                </motion.li>
              ))}
            </ol>
          </div>

          <SiteFooter />
        </main>
      </div>

      <ChatPopup pageContext={PAGE_CONTEXT} />
    </div>
  )
}
