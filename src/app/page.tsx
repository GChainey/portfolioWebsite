'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle, X, ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatInterface } from '@/components/ChatInterface'
import { GitHubContributions } from '@/components/GitHubContributions'
import { ThinkerCard } from '@/components/ThinkerCard'
import { useFeatureFlags } from '@/context/FeatureFlagContext'
import { thinkers } from '@/content/thinkers'
import { ParticleField } from '@/components/ParticleField'
import { Magnetic } from '@/components/Magnetic'

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

// Bento grid projects - 4 curated case studies
const BENTO_PROJECTS = [
  {
    id: 'the-future-is-now',
    number: '01',
    title: 'The Future is Now',
    description: 'From Figma to shipping real code. My journey into AI-augmented design.',
    category: 'Article',
    href: '/projects/the-future-is-now',
    visual: 'github' as const,
  },
  {
    id: 'rfp',
    number: '02',
    title: 'Respond to RFP',
    description: 'One-person army winning enterprise deals with AI-powered prototypes.',
    category: 'Enterprise AI',
    href: '/projects/rfp',
    visual: 'icon' as const,
    icon: 'code',
  },
  {
    id: 'how-i-work',
    number: '03',
    title: 'How I Work',
    description: 'AI agents, parallel branches, voice-to-code. My daily workflow.',
    category: 'Process',
    href: '/how-i-work',
    visual: 'icon' as const,
    icon: 'workflow',
  },
  {
    id: 'creative-tooling',
    number: '04',
    title: 'Conjure Your Own Tools',
    description: 'Stop waiting for features. Build the creative tool you need, when you need it.',
    category: 'Article',
    href: '/projects/creative-tooling',
    visual: 'icon' as const,
    icon: 'sparkle',
  },
]

function BentoCardVisual({ icon }: { icon?: string }) {
  switch (icon) {
    case 'code':
      return (
        <div className="text-accent/20 group-hover:text-accent/40 transition-colors">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M28 20L8 40L28 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M52 20L72 40L52 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M45 16L35 64" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
      )
    case 'workflow':
      return (
        <div className="text-accent/20 group-hover:text-accent/40 transition-colors">
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
            <circle cx="20" cy="30" r="12" stroke="currentColor" strokeWidth="2"/>
            <circle cx="60" cy="30" r="12" stroke="currentColor" strokeWidth="2"/>
            <circle cx="100" cy="30" r="12" stroke="currentColor" strokeWidth="2"/>
            <path d="M32 30H48" stroke="currentColor" strokeWidth="2"/>
            <path d="M72 30H88" stroke="currentColor" strokeWidth="2"/>
            <path d="M44 26L48 30L44 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M84 26L88 30L84 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )
    case 'sparkle':
      return (
        <div className="text-accent/20 group-hover:text-accent/40 transition-colors">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M40 8V16M40 64V72M8 40H16M64 40H72" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            <path d="M20 20L25 25M55 55L60 60M60 20L55 25M25 55L20 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="40" cy="40" r="8" stroke="currentColor" strokeWidth="2.5"/>
          </svg>
        </div>
      )
    default:
      return null
  }
}

// Experience data
const EXPERIENCE = [
  {
    company: 'Enterprise AI Group',
    role: 'Product Designer',
    period: '2024 – Present',
    description: 'Building AI-powered enterprise solutions. One-person product team delivering prototypes that win deals.',
  },
  {
    company: 'SEEK',
    role: 'Senior Product Designer',
    period: '2021 – 2024',
    description: 'Led discovery and design for candidate-facing products. Built AI resume tools and skills-based course finders.',
  },
  {
    company: 'Best Practice Software',
    role: 'UX Designer',
    period: '2018 – 2021',
    description: 'Designed cloud-based practice management SaaS. Prototyping, validation, workshops, and component libraries.',
  },
]

// Testimonials data
const TESTIMONIALS = [
  {
    name: 'Winnie Bamra',
    role: 'Senior Product Manager',
    company: 'Ex-SpaceX · SEEK',
    content: 'Gareth is a pleasure to work with and an asset to any team. He is diligent in discovery, passionate about the end user, empathetic, and collaborative in his approach. He is excellent at leading user interviews, enabling the team to collect and extract actionable insights.',
  },
  {
    name: 'Richard Simms',
    role: 'Principal Product Designer',
    company: 'SEEK',
    content: 'A talented senior UX designer who can independently drive projects forward. His designs reflected a deep understanding of our users, combined with a mastery of UX principles. Meticulous attention to detail and craft are evident in everything he produces.',
  },
  {
    name: 'Ahmed Hakeem',
    role: 'Staff Engineer',
    company: 'SEEK',
    content: "A developer's best friend. I have many fond memories bouncing ideas around and jamming out features end to end from fake door tests to deployment. At every step Gareth was inquisitive, collaborative and open to thinking on their feet.",
  },
  {
    name: 'David Deville',
    role: 'Senior Content Designer',
    company: 'SEEK',
    content: "Gareth goes above and beyond designing for customer needs. Fast experimentation, elegant designs and constant iteration resulted in products like an AI-powered resume generator that genuinely helped candidates. A positive, creative and likeable teammate.",
  },
  {
    name: 'Henry Vesander',
    role: 'Chief Product Officer',
    company: 'Best Practice Software',
    content: 'An outstanding UX/product designer. I hired him to build a cloud-based practice management SaaS. He is a driven individual that can be trusted in getting the job done once given guidance and a brief. I definitely recommend Gareth!',
  },
]


export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [roleIndex, setRoleIndex] = useState(0)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMounted, setChatMounted] = useState(false)
  const { flags } = useFeatureFlags()

  // Track client-side mount to prevent hydration issues with animations
  useEffect(() => {
    setMounted(true)
  }, [])

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


  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header />

      {/* Main content with chat sidebar */}
      <div className="max-w-7xl mx-auto pt-14">
        <div className="flex min-h-[calc(100vh-56px)]">

          {/* Main content */}
          <main className="flex-1 min-w-0 border-x border-border overflow-hidden">

            {/* Hero Section - Centered */}
            <section className="relative py-24 px-8 border-b border-border overflow-hidden">
              {flags.particleField && <ParticleField />}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Tagline */}
                <motion.p
                  className="text-sm text-muted uppercase tracking-widest mb-4"
                  initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  The future is Now
                </motion.p>

                {/* Animated Role */}
                <motion.div
                  className="h-12 mb-8"
                  initial={mounted ? { opacity: 0 } : { opacity: 1 }}
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
                  initial={mounted ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <GitHubContributions variant="full" animate />

                  {/* CTA */}
                  <Magnetic strength={0.25} radius={100} disabled={!flags.particleField}>
                    <Link
                      href="/projects/the-future-is-now"
                      className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-full hover:brightness-110 transition-all group"
                    >
                      Read how
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Magnetic>
                </motion.div>
              </div>
            </section>

            {/* About section */}
            <section className="p-8 border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p className="text-xs text-muted uppercase tracking-widest mb-4">About</p>
                <p className="text-lg text-muted leading-relaxed max-w-2xl">
                  I help scale-ups create high quality prototypes to win deals.
                  My role has transformed—I now orchestrate AI tools to multiply output
                  and deliver 10× the impact.
                </p>
              </motion.div>
            </section>

            {/* Projects Bento Grid */}
            <section className="border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className={`flex items-center justify-between px-8 ${flags.sectionTitleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
                  <p className="text-xs text-muted uppercase tracking-widest">Projects</p>
                  <Link href="/projects" className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {BENTO_PROJECTS.map((project, index) => {
                    const isLeft = index % 2 === 0
                    const isTopRow = index < 2

                    return (
                      <Link
                        key={project.id}
                        href={project.href}
                        className="group block"
                      >
                        <motion.div
                          className={`${isLeft ? 'md:border-r border-border' : ''} ${isTopRow ? 'border-b border-border' : ''}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          {/* Visual area */}
                          <div className="h-48 md:h-56 bg-border/30 flex items-center justify-center overflow-hidden relative">
                            <span className="absolute top-4 right-4 text-xs font-mono text-muted/60">
                              {project.number}
                            </span>
                            {project.visual === 'github' ? (
                              <GitHubContributions variant="card" monthsToShow={12} />
                            ) : (
                              <BentoCardVisual icon={project.icon} />
                            )}
                          </div>

                          {/* Text content */}
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted uppercase tracking-wide">{project.category}</span>
                              <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="font-medium text-foreground group-hover:text-accent transition-colors mb-1">{project.title}</h3>
                            <p className="text-sm text-muted line-clamp-2">{project.description}</p>
                          </div>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            </section>

            {/* Experience section */}
            <section className="p-8 border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <p className="text-xs text-muted uppercase tracking-widest mb-6">Experience</p>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-border" />

                  <div className="space-y-8">
                    {EXPERIENCE.map((exp, index) => (
                      <motion.div
                        key={exp.company}
                        className="flex gap-6 relative"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.12 }}
                      >
                        {/* Timeline dot */}
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-foreground border-4 border-background z-10 mt-1" />

                        <div className="flex-1 pb-2">
                          <div className="flex items-baseline gap-3 mb-1">
                            <h3 className="font-medium text-foreground">{exp.company}</h3>
                            <span className="text-xs text-muted">{exp.period}</span>
                          </div>
                          <p className="text-sm text-muted mb-2">{exp.role}</p>
                          <p className="text-sm text-muted">{exp.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Product Thinkers section */}
            <section className="border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className={`flex items-center justify-between px-8 ${flags.sectionTitleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
                  <p className="text-xs text-muted uppercase tracking-widest">Product Thinkers</p>
                  <Link href="/thinkers" className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                  {thinkers.map((thinker, index) => (
                    <div
                      key={thinker.id}
                      className={`p-5 ${index % 2 === 0 ? 'md:border-r border-border' : ''} ${index < thinkers.length - (thinkers.length % 2 === 0 ? 2 : 1) ? 'border-b border-border' : ''}`}
                    >
                      <ThinkerCard thinker={thinker} index={index} />
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Testimonials section */}
            <section className="border-b border-border overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className={`px-8 ${flags.sectionTitleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
                  <p className="text-xs text-muted uppercase tracking-widest">Kind words from colleagues</p>
                </div>

                {/* Horizontal carousel - 2 visible at a time */}
                <div className="overflow-x-auto scrollbar-hide scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
                  <div className="flex" style={{ width: `${TESTIMONIALS.length * 50}%` }}>
                    {TESTIMONIALS.map((testimonial, index) => (
                      <motion.div
                        key={testimonial.name}
                        className={`flex-shrink-0 p-5 ${index === 0 ? 'pl-8' : ''} ${index < TESTIMONIALS.length - 1 ? 'border-r border-border' : ''}`}
                        style={{ width: `${100 / TESTIMONIALS.length}%`, scrollSnapAlign: 'start' }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.08 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-foreground font-medium text-sm flex-shrink-0">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                            <p className="text-xs text-muted">{testimonial.role} · {testimonial.company}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">{testimonial.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Footer */}
            <footer className="p-8 mt-auto flex items-center justify-between">
              <p className="text-xs text-muted">© 2025 Gareth Chainey</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                ↑ Back to top
              </button>
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
                className="fixed bottom-6 right-6 z-50 p-4 bg-[var(--selection-bg)] text-[var(--selection-text)] rounded-full shadow-lg hover:scale-105 hover:brightness-110 transition-all"
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
