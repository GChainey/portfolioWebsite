'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatInterface } from '@/components/ChatInterface'
import { useFeatureFlags } from '@/context/FeatureFlagContext'
import { thinkers } from '@/content/thinkers'

const THINKERS_PAGE_CONTEXT = {
  page: 'Product Thinkers',
  description: 'Page showcasing the product thinkers who have influenced Gareth\'s approach to design and product work. Features Teresa Torres (Continuous Discovery Habits, Opportunity Solution Trees), Chris Spiek & Bob Moesta (Jobs-to-be-Done, Switch Framework, Forces of Progress), Ryan Singer (Shape Up, shaping, appetite), and Christopher Alexander (A Pattern Language, timeless design principles).',
  suggestedQuestions: [
    'Why does Teresa Torres resonate with you?',
    'How do you use JTBD in your work?',
    'What\'s Shape Up and why do you like it?',
  ],
  followUpQuestions: [
    'How does Christopher Alexander relate to product?',
    'What\'s the forces of progress model?',
    'How do these ideas show up in your projects?',
    'What books would you recommend?',
  ],
}

function getInitials(name: string, initials?: string): string {
  if (initials) return initials
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
}

export default function ThinkersPage() {
  const [chatOpen, setChatOpen] = useState(true)
  const { flags } = useFeatureFlags()

  // Close chat on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setChatOpen(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header showBack />

      <div className="max-w-7xl mx-auto pt-14">
        <div className="flex min-h-[calc(100vh-56px)]">

          <main className="flex-1 min-w-0 border-x border-border">
            {/* Header section */}
            <section className={`p-8 ${flags.sectionTitleBorders ? 'border-b border-border' : ''}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs text-muted uppercase tracking-widest mb-4">Influences</p>
                <h1 className="text-4xl font-medium text-foreground mb-4">Product Thinkers</h1>
                <p className="text-lg text-muted max-w-2xl">
                  The people whose ideas have shaped how I think about product, design, and building software.
                </p>
              </motion.div>
            </section>

            {/* Thinkers grid - edge-touching */}
            <section className="border-b border-border">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {thinkers.map((thinker, index) => {
                  const isOdd = index % 2 === 1
                  const isLastRow = index >= thinkers.length - (thinkers.length % 2 === 0 ? 2 : 1)

                  return (
                    <motion.div
                      key={thinker.id}
                      className={`p-6 ${!isOdd ? 'md:border-r border-border' : ''} ${!isLastRow ? 'border-b border-border' : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-full bg-border flex items-center justify-center text-foreground font-medium text-lg flex-shrink-0">
                          {getInitials(thinker.name, thinker.initials)}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground text-lg">
                            {thinker.name}
                          </h3>
                          <p className="text-sm text-muted">{thinker.role}</p>
                        </div>
                      </div>

                      <p className="text-sm text-muted leading-relaxed mb-4">
                        {thinker.influence}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {thinker.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs border border-border rounded text-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          </main>

          {/* Chat toggle button */}
          <AnimatePresence>
            {!chatOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setChatOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-[var(--selection-bg)] text-[var(--selection-text)] rounded-full shadow-lg hover:scale-105 hover:brightness-110 transition-all"
              >
                <MessageCircle className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Chat sidebar */}
          <AnimatePresence>
            {chatOpen && (
              <motion.aside
                initial={false}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="flex-shrink-0 h-[calc(100vh-56px)] sticky top-14 border-r border-border"
                style={{ minWidth: 0 }}
              >
                <div className="relative h-full flex flex-col w-[380px]">
                  <button
                    onClick={() => setChatOpen(false)}
                    className="absolute top-4 right-4 z-10 p-1.5 text-muted hover:text-foreground hover:bg-border/50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ChatInterface pageContext={THINKERS_PAGE_CONTEXT} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
