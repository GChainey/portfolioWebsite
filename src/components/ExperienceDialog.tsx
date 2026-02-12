'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, MessageCircle } from 'lucide-react'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { cvData } from '@/content/cv'
import { getProjectsByCompanyId } from '@/content/projects'
import { ChatInterface } from '@/components/ChatInterface'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface ExperienceDialogProps {
  isOpen: boolean
  onClose: () => void
  initialCompanyId?: string
}

function getCompanyContext(company: typeof cvData.experience[0]) {
  return {
    page: company.company,
    description: `Experience at ${company.company}. ${company.companyDescription} Role: ${company.role} (${company.period}). ${company.highlights.join(' ')}`,
    suggestedQuestions: [
      `What was your role at ${company.company}?`,
      `What did you achieve at ${company.company}?`,
      `Tell me about the work at ${company.company}`,
    ],
    followUpQuestions: [
      'What was the biggest challenge?',
      'What did you learn?',
      'How did this role shape your career?',
    ],
  }
}

export function ExperienceDialog({ isOpen, onClose, initialCompanyId = 'enterpriseai' }: ExperienceDialogProps) {
  const companies = cvData.experience
  const initialIndex = Math.max(0, companies.findIndex(c => c.id === initialCompanyId))
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)
  const [chatOpen, setChatOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset to initial company when dialog opens
  useEffect(() => {
    if (isOpen) {
      const idx = Math.max(0, companies.findIndex(c => c.id === initialCompanyId))
      setCurrentIndex(idx)
      setDirection(0)
      setChatOpen(true)
    }
  }, [isOpen, initialCompanyId, companies])

  const goTo = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
    scrollRef.current?.scrollTo({ top: 0 })
  }, [currentIndex])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex(currentIndex - 1)
    }
  }, [currentIndex])

  const goNext = useCallback(() => {
    if (currentIndex < companies.length - 1) {
      setDirection(1)
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, companies.length])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && !chatOpen) goPrev()
      if (e.key === 'ArrowRight' && !chatOpen) goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, goPrev, goNext, chatOpen])

  const company = companies[currentIndex]
  const relatedProjects = getProjectsByCompanyId(company.id)

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog container - two column layout */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-7xl h-[92vh] bg-background dark:bg-[color-mix(in_srgb,var(--foreground)_3%,var(--background))] border border-border rounded-lg shadow-2xl dark:shadow-none overflow-hidden flex"
          >
            {/* Column 1: Header + Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header with title and tabs */}
              <div className="flex items-center gap-4 px-6 py-3 flex-shrink-0">
                <h2 className="font-medium text-foreground">Work Experience</h2>
                <Tabs value={company.id} onValueChange={(id) => {
                  const idx = companies.findIndex(c => c.id === id)
                  if (idx >= 0) goTo(idx)
                }}>
                  <TabsList className="h-auto w-auto">
                    {companies.map((c) => (
                      <TabsTrigger key={c.id} value={c.id}>
                        {c.company}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {/* Scrollable content */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={company.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="p-6"
                  >
                    {/* Company info */}
                    <div className="mb-6">
                      <h2 className="text-2xl font-medium text-foreground mb-1">{company.company}</h2>
                      <p className="text-sm text-muted">{company.role} · {company.location}</p>
                      <p className="text-xs text-muted mt-0.5">{company.period}</p>
                    </div>

                    {/* Synopsis */}
                    <p className="text-sm text-muted leading-relaxed mb-6">{company.companyDescription}</p>

                    {/* Hero placeholder image */}
                    <div className="mb-8 rounded-lg border border-border overflow-hidden bg-border/30">
                      <div className="aspect-[16/9] flex items-center justify-center">
                        <div className="text-center">
                          <div className="font-mono text-[10px] leading-none text-foreground/15 whitespace-pre select-none mb-3">
{`    ╔════════════════════════════════════╗
    ║                                    ║
    ║     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     ║
    ║     ▓                        ▓     ║
    ║     ▓    PROTOTYPE / DEMO    ▓     ║
    ║     ▓                        ▓     ║
    ║     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     ║
    ║                                    ║
    ╚════════════════════════════════════╝`}
                          </div>
                          <p className="text-xs text-muted">Case study imagery coming soon</p>
                        </div>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="mb-8">
                      <p className="text-xs text-muted uppercase tracking-widest mb-3">Key achievements</p>
                      <ul className="space-y-2">
                        {company.highlights.map((highlight, i) => (
                          <li key={i} className="text-sm text-muted flex gap-2">
                            <span className="text-foreground/40 flex-shrink-0 mt-0.5">&#8226;</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Inline case studies */}
                    {relatedProjects.length > 0 && relatedProjects.map((project) => (
                      <div key={project.id} className="mt-10 pt-10 border-t border-border">
                        <span className="text-xs text-muted uppercase tracking-widest">{project.category}</span>
                        <h3 className="text-xl font-medium text-foreground mt-2 mb-2">{project.title}</h3>
                        <p className="text-sm text-muted leading-relaxed mb-6">{project.description}</p>

                        {/* Hero image placeholder */}
                        <div className="mb-4 rounded-lg border border-border overflow-hidden bg-border/30">
                          <div className="aspect-[16/9] flex items-center justify-center">
                            <div className="text-center">
                              <div className="font-mono text-[10px] leading-none text-foreground/15 whitespace-pre select-none mb-3">
{`    ╔════════════════════════════════════╗
    ║                                    ║
    ║     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     ║
    ║     ▓                        ▓     ║
    ║     ▓    ${project.title.slice(0, 16).toUpperCase().padEnd(16)}    ▓     ║
    ║     ▓                        ▓     ║
    ║     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     ║
    ║                                    ║
    ╚════════════════════════════════════╝`}
                              </div>
                              <p className="text-xs text-muted">Hero image coming soon</p>
                            </div>
                          </div>
                        </div>

                        {/* Detail image placeholders - two side by side */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="rounded-lg border border-border overflow-hidden bg-border/30">
                            <div className="aspect-[4/3] flex items-center justify-center">
                              <div className="text-center">
                                <div className="font-mono text-[8px] leading-none text-foreground/15 whitespace-pre select-none mb-2">
{`  ╔══════════════════╗
  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
  ║  ▓            ▓  ║
  ║  ▓  SCREEN 1  ▓  ║
  ║  ▓            ▓  ║
  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
  ╚══════════════════╝`}
                                </div>
                                <p className="text-[10px] text-muted">UI screenshot</p>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border border-border overflow-hidden bg-border/30">
                            <div className="aspect-[4/3] flex items-center justify-center">
                              <div className="text-center">
                                <div className="font-mono text-[8px] leading-none text-foreground/15 whitespace-pre select-none mb-2">
{`  ╔══════════════════╗
  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
  ║  ▓            ▓  ║
  ║  ▓  SCREEN 2  ▓  ║
  ║  ▓            ▓  ║
  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
  ╚══════════════════╝`}
                                </div>
                                <p className="text-[10px] text-muted">UI screenshot</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Wide detail image placeholder */}
                        <div className="mb-6 rounded-lg border border-border overflow-hidden bg-border/30">
                          <div className="aspect-[21/9] flex items-center justify-center">
                            <div className="text-center">
                              <div className="font-mono text-[8px] leading-none text-foreground/15 whitespace-pre select-none mb-2">
{`  ╔══════════════════════════════════════════════╗
  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
  ║  ▓                                      ▓  ║
  ║  ▓         WORKFLOW / INTERACTION        ▓  ║
  ║  ▓                                      ▓  ║
  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
  ╚══════════════════════════════════════════════╝`}
                              </div>
                              <p className="text-[10px] text-muted">Workflow or interaction detail</p>
                            </div>
                          </div>
                        </div>

                        <Link
                          href={project.externalUrl || `/projects/${project.id}`}
                          className="group inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors"
                        >
                          View full case study
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Chat toggle button */}
            <AnimatePresence>
              {!chatOpen && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setChatOpen(true)}
                  className="absolute bottom-6 right-6 z-10 p-4 bg-[var(--selection-bg)] text-[var(--selection-text)] rounded-full shadow-lg hover:scale-105 hover:brightness-110 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Column 2: Chat sidebar (full height) */}
            <AnimatePresence>
              {chatOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 380, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="flex-shrink-0 border-l border-border overflow-hidden flex flex-col"
                  style={{ minWidth: 0 }}
                >
                  <div className="w-[380px] flex flex-col h-full">
                    {/* Chat header */}
                    <div className="flex items-center justify-between px-4 py-4 flex-shrink-0">
                      <h3 className="font-medium text-foreground">GarethLLM<sup className="text-xs text-muted ml-0.5">™</sup></h3>
                      <button
                        onClick={onClose}
                        className="p-2 text-muted hover:text-foreground hover:bg-border/50 rounded transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex-1 min-h-0">
                      <ChatInterface pageContext={getCompanyContext(company)} hideHeader />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
