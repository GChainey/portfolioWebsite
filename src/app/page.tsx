'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChatInterface } from '@/components/ChatInterface'

// Experience data with brand colors
const EXPERIENCE = [
  {
    id: 'eai',
    role: 'Product Designer',
    company: 'Enterprise AI Group',
    type: 'Contract',
    period: 'Mar 2025 - Present',
    duration: '11 mos',
    location: 'Sydney, NSW · Remote',
    description: 'Building a no-code AI tool to help business professionals. Creating high quality working prototypes to win deals, test with users, and aid collaboration with engineering.',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      bg: 'from-sky-500/10 to-sky-600/5',
    }
  },
  {
    id: 'seek',
    role: 'Senior Product Designer',
    company: 'SEEK',
    type: 'Full-time',
    period: 'May 2022 - Sep 2024',
    duration: '2 yrs 5 mos',
    location: 'Melbourne, VIC',
    description: "Australia's leading job marketplace. Deep understanding of B2C behaviour, achieved year-on-year growth in revenue and organic visits.",
    colors: {
      primary: '#e11d73',
      secondary: '#be185d',
      bg: 'from-pink-500/10 to-pink-600/5',
    }
  },
  {
    id: 'bestpractice',
    role: 'User Experience Designer',
    company: 'Best Practice Software',
    type: 'Full-time',
    period: 'Oct 2019 - Apr 2022',
    duration: '2 yrs 7 mos',
    location: 'Brisbane, QLD',
    description: "Australia's leading medical practice management system. Deep work in medical prescribing and appointment workflows. Set up user interview and testing infrastructure.",
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      bg: 'from-violet-500/10 to-violet-600/5',
    }
  },
]

// Roles that animate
const ROLES = ['Product Designer', 'Product Manager', 'Developer', 'Prototyper', 'AI Augmented']

// Contribution data showing transformation
// Before AI (2023): mostly empty
// After AI (2024-2025): active
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
  const [activeExperience, setActiveExperience] = useState(0)

  // Cycle through roles
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      {/* Two column layout */}
      <div className="grid grid-cols-12 min-h-screen">

        {/* Main content - left side */}
        <main className="col-span-8 border-r border-border overflow-y-auto">

          {/* Header with name and animated role */}
          <header className="p-8 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <motion.h1
                  className="text-4xl md:text-5xl font-medium text-foreground tracking-tight mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Gareth Chainey
                </motion.h1>

                <motion.div
                  className="h-8 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={roleIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-xl text-muted"
                    >
                      {ROLES[roleIndex]}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Dev Blog</span>
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* The Shift + Contributions visualization */}
          <section className="p-8 border-b border-border">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <p className="text-xs text-muted uppercase tracking-widest mb-2">The Shift</p>
                <h2 className="text-2xl font-medium text-foreground">From Manual to Augmented</h2>
                <p className="text-muted mt-2">My GitHub contributions tell the story of AI transformation</p>
              </div>

              {/* Contribution Graph - Larger and Centered */}
              <div className="flex flex-col items-center">
                {/* Month labels */}
                <div className="flex gap-[3px] mb-2 text-[10px] text-muted">
                  {CONTRIBUTION_MONTHS.map((month, i) => (
                    <div key={i} className="w-4 text-center">
                      {i % 3 === 0 ? month.label.split(' ')[0].slice(0, 1) : ''}
                    </div>
                  ))}
                </div>

                {/* Year markers */}
                <div className="flex w-full justify-between mb-1 px-1">
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
                          className="w-4 h-4 rounded-sm bg-foreground"
                          style={{ opacity: level === 0 ? 0.08 : level * 0.22 }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: level === 0 ? 0.08 : level * 0.22, scale: 1 }}
                          transition={{ delay: 0.5 + (mi * 7 + di) * 0.008 }}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Day labels */}
                <div className="flex flex-col gap-[3px] text-[10px] text-muted mt-2">
                  <div className="flex justify-between w-full">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-6 text-xs text-muted">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="w-3 h-3 rounded-sm bg-foreground"
                        style={{ opacity: level === 0 ? 0.08 : level * 0.22 }}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>

                {/* Transformation indicator */}
                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <p className="text-sm text-muted">
                    <span className="text-foreground/40">Early 2024: Learning AI tools</span>
                    <span className="mx-3">→</span>
                    <span className="text-foreground">2025: Building daily with AI</span>
                  </p>
                </motion.div>
              </div>
            </motion.div>
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

          {/* Experience Timeline */}
          <section className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-xs text-muted uppercase tracking-widest mb-8">Experience</p>

              <div className="space-y-0">
                {EXPERIENCE.map((exp, index) => (
                  <motion.div
                    key={exp.id}
                    className={`relative p-6 -mx-6 cursor-pointer transition-all duration-500 rounded-lg ${
                      activeExperience === index
                        ? `bg-gradient-to-r ${exp.colors.bg}`
                        : 'hover:bg-border/30'
                    }`}
                    onClick={() => setActiveExperience(index)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    {/* Timeline line */}
                    {index < EXPERIENCE.length - 1 && (
                      <div className="absolute left-9 top-16 bottom-0 w-px bg-border" />
                    )}

                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div
                        className="w-3 h-3 rounded-full mt-2 flex-shrink-0 transition-colors duration-500"
                        style={{
                          backgroundColor: activeExperience === index ? exp.colors.primary : 'var(--muted)'
                        }}
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3
                              className="font-medium text-lg transition-colors duration-500"
                              style={{
                                color: activeExperience === index ? exp.colors.primary : 'var(--foreground)'
                              }}
                            >
                              {exp.role}
                            </h3>
                            <p className="text-foreground">
                              {exp.company} · {exp.type}
                            </p>
                          </div>
                        </div>

                        <p className="text-sm text-muted mb-1">{exp.period} · {exp.duration}</p>
                        <p className="text-sm text-muted mb-3">{exp.location}</p>

                        <AnimatePresence>
                          {activeExperience === index && (
                            <motion.p
                              className="text-muted leading-relaxed"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              {exp.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="p-8 border-t border-border mt-auto">
            <p className="text-xs text-muted">© 2025 Gareth Chainey</p>
          </footer>
        </main>

        {/* Chat sidebar - right side */}
        <aside className="col-span-4 flex flex-col h-screen sticky top-0">
          <ChatInterface />
        </aside>
      </div>
    </div>
  )
}
