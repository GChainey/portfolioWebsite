'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ArrowRight, MessageCircle } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { cvData } from '@/content/cv'
import { getProjectsByCompanyId } from '@/content/projects'
import { ChatInterface } from '@/components/ChatInterface'

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

          {/* Dialog container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-7xl h-[92vh] bg-background border border-border rounded-lg shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header with company tabs */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-1">
                {companies.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => goTo(i)}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      i === currentIndex
                        ? 'bg-foreground/10 text-foreground font-medium'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {c.company}
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted hover:text-foreground hover:bg-border/50 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main body: content + chat */}
            <div className="flex-1 flex overflow-hidden">
              {/* Carousel content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden">
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

                    {/* Related projects */}
                    {relatedProjects.length > 0 && (
                      <div>
                        <p className="text-xs text-muted uppercase tracking-widest mb-3">Related work</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {relatedProjects.map((project) => (
                            <Link
                              key={project.id}
                              href={project.externalUrl || `/projects/${project.id}`}
                              className="group block border border-border rounded-lg overflow-hidden hover:border-foreground/30 transition-colors"
                            >
                              {/* Card placeholder image */}
                              <div className="aspect-[16/9] bg-border/30 flex items-center justify-center">
                                <div className="font-mono text-[8px] leading-none text-foreground/15 whitespace-pre select-none">
{`  ╔══════════════════╗
  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
  ║  ▓            ▓  ║
  ║  ▓   ${project.id.slice(0, 6).toUpperCase().padEnd(6)}   ▓  ║
  ║  ▓            ▓  ║
  ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
  ╚══════════════════╝`}
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-muted uppercase tracking-wide">{project.category}</span>
                                  <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                                </div>
                                <h3 className="font-medium text-foreground group-hover:text-accent transition-colors text-sm mb-1">
                                  {project.title}
                                </h3>
                                <p className="text-xs text-muted line-clamp-2">{project.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
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

              {/* Chat sidebar */}
              <AnimatePresence>
                {chatOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 380, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="flex-shrink-0 border-l border-border overflow-hidden"
                    style={{ minWidth: 0 }}
                  >
                    <div className="relative h-full flex flex-col w-[380px]">
                      <ChatInterface pageContext={getCompanyContext(company)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-border flex-shrink-0">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-xs text-muted">
                {currentIndex + 1} / {companies.length}
              </span>
              <button
                onClick={goNext}
                disabled={currentIndex === companies.length - 1}
                className="flex items-center gap-1 text-sm text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
