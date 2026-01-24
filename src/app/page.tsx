'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle, X, ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatInterface } from '@/components/ChatInterface'

// Roles that animate
const ROLES = ['Product Designer', 'Design Engineer', 'Product Manager', 'Engineer']

// Page context for chat
const HOME_PAGE_CONTEXT = {
  page: 'Home',
  description: 'Portfolio homepage showing experience at Enterprise AI Group, SEEK, and Best Practice Software. Projects include RFP response system, ProductLite prototyping, and LLM Configurator.',
  suggestedQuestions: [
    "How has your role evolved with AI?",
    "What's your design philosophy?",
    "Tell me about your current work",
  ],
  followUpQuestions: [
    "What tools do you use?",
    "How do you prototype in code?",
    "What's Shape Up?",
    "Tell me about SEEK",
  ]
}

// Projects data - Case Studies
const PROJECTS = [
  {
    id: 'the-future-is-now',
    title: 'The Future is Now',
    description: 'AI has fundamentally changed how designers produce their work. This is my journey from Figma to shipping real code.',
    category: 'Article',
    year: '2025',
    showGitHubActivity: true,
  },
  {
    id: 'conflict-and-experiments',
    title: 'How I Handle Conflict',
    description: 'Disagreements aren\'t problems—they\'re opportunities. Turn product debates into experiments.',
    category: 'Article',
    year: '2025',
  },
  {
    id: 'rfp',
    title: 'Respond to RFP',
    description: 'One man army to win a deal. Demonstrating how AI augmentation enables a single designer to deliver enterprise-quality proposals.',
    category: 'Enterprise AI',
    year: '2025',
  },
  {
    id: 'productlite',
    title: 'ProductLite',
    description: 'Real code prototyping that enables rapid experimentation, user testing, and production-ready output.',
    category: 'Prototyping',
    year: '2025',
  },
  {
    id: 'configurator',
    title: 'Configurator',
    description: 'No-code LLM workflow tool prototype. Building complex AI pipelines without writing code.',
    category: 'No-Code AI',
    year: '2025',
  },
  {
    id: 'llm-features',
    title: 'Things I Built with LLMs',
    description: 'Feature Flags, LLM Chat, Dynamic Workflows—features that would be impossible in Figma, now real.',
    category: 'AI Development',
    year: '2025',
  },
]

// Contribution data showing transformation
const CONTRIBUTION_MONTHS = [
  { label: 'Jan 2024', data: [0, 0, 0, 0, 0, 0, 0] },
  { label: 'Feb', data: [0, 0, 1, 0, 0, 0, 0] },
  { label: 'Mar', data: [0, 1, 0, 0, 1, 0, 0] },
  { label: 'Apr', data: [0, 0, 1, 0, 0, 1, 0] },
  { label: 'May', data: [1, 0, 0, 1, 0, 0, 1] },
  { label: 'Jun', data: [0, 1, 1, 0, 1, 0, 1] },
  { label: 'Jul', data: [1, 0, 1, 1, 0, 2, 1] },
  { label: 'Aug', data: [1, 2, 1, 0, 2, 1, 1] },
  { label: 'Sep', data: [2, 1, 2, 1, 1, 2, 0] },
  { label: 'Oct', data: [1, 2, 3, 2, 1, 2, 2] },
  { label: 'Nov', data: [2, 3, 2, 3, 2, 1, 3] },
  { label: 'Dec', data: [3, 2, 4, 2, 3, 2, 2] },
  { label: 'Jan 2025', data: [2, 3, 3, 4, 2, 3, 3] },
  { label: 'Feb', data: [3, 4, 3, 2, 4, 3, 4] },
  { label: 'Mar', data: [4, 3, 4, 3, 4, 4, 3] },
  { label: 'Apr', data: [3, 4, 4, 4, 3, 4, 4] },
  { label: 'May', data: [4, 4, 3, 4, 4, 4, 4] },
  { label: 'Jun', data: [4, 4, 4, 4, 4, 3, 4] },
]

export default function Home() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMounted, setChatMounted] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Cycle through roles
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  // Mount chat but don't auto-open on homepage
  useEffect(() => {
    const timer = setTimeout(() => {
      setChatMounted(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % PROJECTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Scroll carousel when index changes
  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = 288 + 16
      carouselRef.current.scrollTo({
        left: carouselIndex * cardWidth,
        behavior: 'smooth'
      })
    }
  }, [carouselIndex])

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header />

      {/* Main content with chat sidebar */}
      <div className="max-w-7xl mx-auto pt-14">
        <div className="flex min-h-[calc(100vh-56px)]">

          {/* Main content */}
          <main className="flex-1 min-w-0 border-x border-border overflow-hidden">

            {/* Hero Section - Centered */}
            <section className="py-24 px-8 border-b border-border">
              <div className="flex flex-col items-center text-center">
                {/* Tagline */}
                <motion.p
                  className="text-sm text-muted uppercase tracking-widest mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  The future is Now
                </motion.p>

                {/* Animated Role */}
                <motion.div
                  className="h-12 mb-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.h1
                      key={roleIndex}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.4 }}
                      className="text-4xl md:text-5xl font-medium text-foreground"
                    >
                      {ROLES[roleIndex]}
                    </motion.h1>
                  </AnimatePresence>
                </motion.div>

                {/* GitHub Contributions - Centered */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center"
                >
                  {/* Year markers */}
                  <div className="flex justify-between mb-1 px-1" style={{ width: `${CONTRIBUTION_MONTHS.length * 19}px` }}>
                    <span className="text-xs text-muted">2024</span>
                    <span className="text-xs text-muted">2025</span>
                  </div>

                  {/* Grid */}
                  <div className="flex gap-[3px]">
                    {CONTRIBUTION_MONTHS.map((month, mi) => (
                      <div key={mi} className="flex flex-col gap-[3px]">
                        {month.data.map((level, di) => (
                          <motion.div
                            key={`${mi}-${di}`}
                            className="w-4 h-4 rounded-sm bg-accent"
                            initial={{ opacity: 0.1 }}
                            animate={{ opacity: level === 0 ? 0.1 : 0.3 + level * 0.175 }}
                            transition={{ delay: 0.8 + (mi * 7 + di) * 0.015, duration: 0.3 }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted">
                    <span>Less</span>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className="w-3 h-3 rounded-sm bg-accent"
                          style={{ opacity: level === 0 ? 0.1 : 0.3 + level * 0.175 }}
                        />
                      ))}
                    </div>
                    <span>More</span>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/projects/the-future-is-now"
                    className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-full hover:brightness-110 transition-all group"
                  >
                    Read how
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </section>

            {/* About section */}
            <section className="p-8 border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-xs text-muted uppercase tracking-widest mb-4">About</p>
                <p className="text-lg text-muted leading-relaxed max-w-2xl">
                  I help scale-ups create high quality prototypes to win deals.
                  My role has transformed—I now orchestrate AI tools to multiply output
                  and deliver 10× the impact.
                </p>
              </motion.div>
            </section>

            {/* Projects Carousel */}
            <section className="py-8 border-b border-border overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <div className="flex items-center justify-between px-8 mb-6">
                  <p className="text-xs text-muted uppercase tracking-widest">Projects</p>
                  <div className="flex gap-1">
                    {PROJECTS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCarouselIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === carouselIndex ? 'bg-foreground' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div
                  ref={carouselRef}
                  className="overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{ scrollSnapType: 'x mandatory' }}
                >
                  <div className="flex gap-4 px-8 pb-4">
                    {PROJECTS.map((project, index) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                      >
                        <motion.div
                          className="flex-shrink-0 w-72 border border-border rounded-lg overflow-hidden hover:border-foreground/30 transition-colors cursor-pointer group"
                          style={{ scrollSnapAlign: 'start' }}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          {/* Card visual - GitHub activity or ASCII placeholder */}
                          <div className="h-40 bg-border/50 flex items-center justify-center overflow-hidden">
                            {project.showGitHubActivity ? (
                              <div className="flex gap-[2px] p-4">
                                {CONTRIBUTION_MONTHS.slice(0, 12).map((month, mi) => (
                                  <div key={mi} className="flex flex-col gap-[2px]">
                                    {month.data.map((level, di) => (
                                      <div
                                        key={`${mi}-${di}`}
                                        className="w-2.5 h-2.5 rounded-sm bg-accent"
                                        style={{ opacity: level === 0 ? 0.1 : 0.3 + level * 0.175 }}
                                      />
                                    ))}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="font-mono text-[8px] leading-none text-foreground/20 group-hover:text-foreground/40 transition-colors whitespace-pre select-none">
{`    ╔══════════════════╗
    ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
    ║  ▓            ▓  ║
    ║  ▓   ${project.id.slice(0, 4).toUpperCase().padEnd(4)}   ▓  ║
    ║  ▓            ▓  ║
    ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
    ╚══════════════════╝`}
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted">{project.category}</span>
                              <span className="text-xs text-muted">{project.year}</span>
                            </div>
                            <h3 className="font-medium text-foreground mb-1">{project.title}</h3>
                            <p className="text-sm text-muted line-clamp-2">{project.description}</p>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Footer */}
            <footer className="p-8 border-t border-border mt-auto">
              <p className="text-xs text-muted">© 2025 Gareth Chainey</p>
            </footer>
          </main>

          {/* Chat toggle button */}
          <AnimatePresence>
            {chatMounted && !chatOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setChatOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-accent text-white rounded-full shadow-lg hover:scale-105 hover:brightness-110 transition-all"
              >
                <MessageCircle className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Chat sidebar */}
          <AnimatePresence>
            {chatMounted && chatOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
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
                  <ChatInterface pageContext={HOME_PAGE_CONTEXT} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
