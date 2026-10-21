'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { ChatPopup } from '@/components/ChatPopup'
import { ThinkerCard } from '@/components/ThinkerCard'
import { ExperienceDialog } from '@/components/ExperienceDialog'
import { SiteFooter } from '@/components/SiteFooter'
import { EXPERIENCE } from '@/content/experience'
import { thinkers } from '@/content/thinkers'

// About: the old homepage's About, Experience and Product thinkers, in the new homepage's look:
// big headings, lots of space, no panels or rules between them.

const PAGE_CONTEXT = {
  page: 'About',
  description: 'Gareth\'s About page: what he does now (prototypes that win deals, orchestrating AI tools), where he has worked (Enterprise AI Group, SEEK, Best Practice Software) and the product thinkers who shaped how he works.',
  suggestedQuestions: ['What do you do at Enterprise AI Group?', 'What did you work on at SEEK?', 'Who has influenced how you work?'],
  followUpQuestions: ['How has AI changed your role?', 'What was Best Practice Software like?', 'Why Shape Up?'],
}

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
}

const H2 = 'text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground'

export default function AboutPage() {
  const [dialog, setDialog] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Header />
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-7xl flex-col pt-14">
        <main className="flex flex-1 flex-col">
          <div className="flex flex-col px-6">
            <motion.section {...reveal} aria-labelledby="about" className="flex flex-col gap-6 pb-12 pt-24">
              <h1 id="about" className={H2}>About</h1>
              <p className="max-w-3xl text-[22px] leading-[34px] tracking-[-0.01em] text-muted text-pretty">
                I help scale-ups create high quality prototypes to win deals. My role has transformed—I now orchestrate AI
                tools to multiply output and deliver 10× the impact.
              </p>
            </motion.section>

            <motion.section {...reveal} aria-labelledby="experience" className="flex flex-col gap-10 py-24">
              <div className="flex items-end justify-between gap-8">
                <h2 id="experience" className={H2}>Experience</h2>
                <Link href="/cv" className="text-sm text-muted transition-colors hover:text-foreground">See the CV →</Link>
              </div>
              {/* A timeline: one dot per job on a quiet line */}
              <ol className="relative flex max-w-3xl flex-col gap-10">
                <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-[2px] bg-border" />
                {EXPERIENCE.map((exp, i) => (
                  <motion.li
                    key={exp.id}
                    className="relative flex gap-6"
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.12 }}
                  >
                    <span aria-hidden className="z-10 mt-2 h-4 w-4 shrink-0 rounded-full border-4 border-background bg-foreground" />
                    <button onClick={() => setDialog(exp.id)} className="group flex flex-col gap-1 text-left">
                      <span className="flex flex-wrap items-baseline gap-x-3">
                        <span className="text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-foreground transition-colors group-hover:text-accent">{exp.company}</span>
                        <span className="text-sm text-muted">{exp.period}</span>
                      </span>
                      <span className="text-base text-muted">{exp.role}</span>
                      <span className="mt-1 text-base leading-[26px] text-muted">{exp.description}</span>
                    </button>
                  </motion.li>
                ))}
              </ol>
            </motion.section>

            <motion.section {...reveal} aria-labelledby="thinkers" className="flex flex-col gap-10 py-24">
              <div className="flex items-end justify-between gap-8">
                <h2 id="thinkers" className={H2}>Product thinkers</h2>
                <Link href="/thinkers" className="text-sm text-muted transition-colors hover:text-foreground">More on each →</Link>
              </div>
              <div className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
                {thinkers.map((t, i) => <ThinkerCard key={t.id} thinker={t} index={i} />)}
              </div>
            </motion.section>
          </div>

          <SiteFooter />
        </main>
      </div>

      <ExperienceDialog isOpen={dialog !== null} onClose={() => setDialog(null)} initialCompanyId={dialog ?? 'enterpriseai'} />
      <ChatPopup pageContext={PAGE_CONTEXT} />
    </div>
  )
}
