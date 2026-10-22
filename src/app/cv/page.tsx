'use client'

import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatPopup } from '@/components/ChatPopup'
import { SiteFooter } from '@/components/SiteFooter'
import { cvData } from '@/content/cv'

// The CV in the homepage's look: big headings, lots of space, no panels. Everything is on the page
// (no dialogs), so it reads top to bottom and prints as it looks

const CV_PAGE_CONTEXT = {
  page: 'CV',
  description: cvData.llmContext,
  suggestedQuestions: [
    "What's your biggest achievement?",
    'How do you work with engineers?',
    'Tell me about your AI transformation',
  ],
  followUpQuestions: [
    'What was your impact at SEEK?',
    'How do you approach user research?',
    "What's your technical stack?",
    'Tell me about your design philosophy',
    'What frameworks do you use?',
  ],
}

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
}

const H1 = 'text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground'
const H2 = 'text-[28px] font-medium leading-[34px] tracking-[-0.02em] text-foreground'

export default function CVPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Header />
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-7xl flex-col pt-14">
        <main className="flex flex-1 flex-col">
          <div className="flex flex-col px-6">
            <motion.section {...reveal} aria-labelledby="cv" className="flex flex-col gap-6 pb-12 pt-24">
              <h1 id="cv" className={H1}>{cvData.name}</h1>
              <p className="max-w-3xl text-[22px] leading-[34px] tracking-[-0.01em] text-muted text-pretty">{cvData.summary}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href="/GarethChaineyCV.pdf"
                  download="GarethChaineyCV.pdf"
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
                >
                  <Download className="h-4 w-4" />
                  Download the PDF
                </a>
                <span className="text-sm text-muted">{cvData.location}</span>
              </div>
            </motion.section>

            <motion.section {...reveal} aria-labelledby="experience" className="flex flex-col gap-10 py-16">
              <h2 id="experience" className={H2}>Experience</h2>
              {/* A timeline: one dot per job on a quiet line */}
              <ol className="relative flex max-w-3xl flex-col gap-14">
                <span aria-hidden className="absolute bottom-2 left-[7px] top-2 w-[2px] bg-border" />
                {cvData.experience.map((exp) => (
                  <li key={exp.id} className="relative flex gap-6">
                    <span aria-hidden className="z-10 mt-2 h-4 w-4 shrink-0 rounded-full border-4 border-background bg-foreground" />
                    <div className="flex flex-col gap-1">
                      <span className="flex flex-wrap items-baseline gap-x-3">
                        <span className="text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-foreground">{exp.company}</span>
                        <span className="text-sm text-muted">{exp.period}</span>
                      </span>
                      <span className="text-base text-muted">{exp.role} · {exp.location}</span>
                      <p className="mt-2 text-base leading-[26px] text-muted">{exp.companyDescription}</p>
                      <ul className="mt-3 flex flex-col gap-2.5">
                        {exp.highlights.map((h) => (
                          <li key={h} className="flex gap-3 text-base leading-[26px] text-foreground">
                            <span aria-hidden className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-muted" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.section>

            <div className="grid grid-cols-1 gap-16 py-16 md:grid-cols-2">
              <motion.section {...reveal} aria-labelledby="education" className="flex flex-col gap-8">
                <h2 id="education" className={H2}>Education</h2>
                <ul className="flex flex-col gap-6">
                  {cvData.education.map((edu) => (
                    <li key={edu.id} className="flex flex-col gap-1">
                      <span className="text-[18px] font-medium leading-6 text-foreground">{edu.title}</span>
                      <span className="text-sm text-muted">{[edu.institution, edu.year].filter(Boolean).join(' · ')}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>

              <motion.section {...reveal} aria-labelledby="skills" className="flex flex-col gap-8">
                <h2 id="skills" className={H2}>Skills</h2>
                <dl className="flex flex-col gap-6">
                  {cvData.skills.map((g) => (
                    <div key={g.category} className="flex flex-col gap-2">
                      <dt className="text-[18px] font-medium leading-6 text-foreground">{g.category}</dt>
                      <dd className="text-base leading-[26px] text-muted">{g.items.join(', ')}</dd>
                    </div>
                  ))}
                </dl>
              </motion.section>
            </div>

            <motion.section {...reveal} aria-labelledby="kind-words" className="flex flex-col gap-10 pb-24 pt-16">
              <h2 id="kind-words" className={H2}>Kind words</h2>
              <ul className="grid grid-cols-1 gap-x-16 gap-y-12 md:grid-cols-2">
                {cvData.testimonials.map((t) => (
                  <li key={t.name} className="flex flex-col gap-4">
                    <blockquote className="text-[18px] leading-[28px] text-foreground text-pretty">“{t.content}”</blockquote>
                    <span className="text-sm text-muted">
                      {t.linkedIn ? (
                        <a href={t.linkedIn} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground transition-colors hover:text-accent">{t.name}</a>
                      ) : (
                        <span className="font-medium text-foreground">{t.name}</span>
                      )}
                      {' · '}{t.role}, {t.company}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>

          <SiteFooter />
        </main>
      </div>

      <ChatPopup pageContext={CV_PAGE_CONTEXT} />
    </div>
  )
}
