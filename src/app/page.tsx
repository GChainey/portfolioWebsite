'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, ArrowRight, FileText, LayoutGrid } from 'lucide-react'
import { Header } from '@/components/Header'
import { Gallery, GALLERY_LIVE } from '@/components/Gallery'
import { ChatInterface } from '@/components/ChatInterface'
import { Facehash } from 'facehash'
import { GitHubContributions } from '@/components/GitHubContributions'
import { ThinkerCard } from '@/components/ThinkerCard'
import { ShowcaseCarousel } from '@/components/ShowcaseCarousel'
import { HomeTiles } from '@/components/HomeTiles'
import { AutoplayShowcase } from '@/components/showcase/Autoplay'
import { CoverflowShowcase } from '@/components/showcase/Coverflow'
import { ScrollyShowcase } from '@/components/showcase/Scrolly'
import { BillboardShowcase } from '@/components/showcase/Billboard'
import { WallShowcase } from '@/components/showcase/Wall'
import { PRODUCT_SLIDES, AI_SLIDES } from '@/content/showcase'
import { writing, getProjectById } from '@/content/projects'
import { TestimonialCarousel } from '@/components/TestimonialCarousel'
import { useFeatureFlags, HOME_LAYOUTS, type HomeLayout } from '@/context/FeatureFlagContext'
import { thinkers } from '@/content/thinkers'
import { ParticleField } from '@/components/ParticleField'
import { Magnetic } from '@/components/Magnetic'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ExperienceDialog } from '@/components/ExperienceDialog'
import { PenflowSignature } from '@/components/PenflowSignature'
import { Signature } from '@/components/Signature'

// Typewriter sequence: target text + pause after reaching it (ms)
const TYPING_STEPS = [
  { text: 'Designer', pause: 1500 },
  { text: 'Designer?', pause: 1000 },
  { text: '', pause: 300 },
  { text: 'Engineer?', pause: 1000 },
  { text: '', pause: 300 },
  { text: 'Orchestrator', pause: 0 },
]
const CHAR_DELAY = 80

// Page context for chat
const HOME_PAGE_CONTEXT = {
  page: 'Home',
  description: 'Portfolio homepage showing experience at Enterprise AI Group, SEEK, and Best Practice Software. Products built and shipped include Dispatch, Shader Wall and Thesis. Projects include RFP response system, ProductLite prototyping, and LLM Configurator.',
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

// Plain lists that close the page: the earlier jobs, the essays, then the small studies
const EARLIER_WORK = ['seek-case-study-1', 'bestpractice-case-study-1']
const SMALL_STUDIES = ['eai-settings', 'add-document']
const ESSAYS = writing.filter((p) => p.category === 'Article').map((p) => p.id)

const COMPANY: Record<string, string> = { enterpriseai: 'Enterprise AI', seek: 'SEEK', bestpractice: 'Best Practice' }

// A titled list of case studies or essays, one per row
function WorkList({ label, note, ids, titleBorders }: { label: string; note?: string; ids: string[]; titleBorders: boolean }) {
  const items = ids.map(getProjectById).filter((p) => p !== undefined)

  return (
    <section className="border-b border-border">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className={`flex items-center justify-between px-8 ${titleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
          <p className="text-xs text-muted uppercase tracking-widest">{label}</p>
          {note && <p className="text-xs text-muted">{note}</p>}
        </div>

        {items.map((project, index) => (
          <Link
            key={project.id}
            href={project.externalUrl || `/projects/${project.id}`}
            className={`group flex items-center gap-6 px-8 py-4 ${index < items.length - 1 ? 'border-b border-border' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">{project.title}</h3>
              <p className="text-sm text-muted line-clamp-1">{project.description}</p>
            </div>
            <span className="hidden sm:block shrink-0 text-xs text-muted">
              {[project.companyId && COMPANY[project.companyId], project.year].filter(Boolean).join(' · ')}
            </span>
            <ArrowRight className="shrink-0 w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </motion.div>
    </section>
  )
}

// Experience data
const EXPERIENCE = [
  {
    id: 'enterpriseai',
    company: 'Enterprise AI Group',
    role: 'Lead Product Designer',
    period: 'May 2025 – Present',
    description: 'Building AI-powered enterprise solutions. One-person product team delivering prototypes that win deals.',
  },
  {
    id: 'seek',
    company: 'SEEK',
    role: 'Senior Product Designer',
    period: 'May 2022 – Sep 2024',
    description: 'Led discovery and design for candidate-facing products. Built AI resume tools and skills-based course finders.',
  },
  {
    id: 'bestpractice',
    company: 'Best Practice Software',
    role: 'UX Designer',
    period: 'Oct 2019 – May 2022',
    description: 'Designed cloud-based practice management SaaS. Prototyping, validation, workshops, and component libraries.',
  },
]

// Testimonials data
const TESTIMONIALS = [
  {
    name: 'Winnie Bamra',
    role: 'Senior Product Manager',
    company: 'Ex-SpaceX · SEEK',
    logo: 'spacex' as const,
    linkedIn: 'https://www.linkedin.com/in/wbamra/',
    content: 'Gareth is a pleasure to work with and an asset to any team. He is diligent in discovery, passionate about the end user, empathetic, and collaborative in his approach. He is excellent at leading user interviews, enabling the team to collect and extract actionable insights.',
  },
  {
    name: 'Richard Simms',
    role: 'Principal Product Designer',
    company: 'SEEK',
    logo: 'seek' as const,
    linkedIn: 'https://www.linkedin.com/in/richardsimms/',
    content: 'A talented senior UX designer who can independently drive projects forward. His designs reflected a deep understanding of our users, combined with a mastery of UX principles. Meticulous attention to detail and craft are evident in everything he produces.',
  },
  {
    name: 'Ahmed Hakeem',
    role: 'Staff Engineer',
    company: 'SEEK',
    logo: 'seek' as const,
    linkedIn: 'https://www.linkedin.com/in/meds/',
    content: "A developer's best friend. I have many fond memories bouncing ideas around and jamming out features end to end from fake door tests to deployment. At every step Gareth was inquisitive, collaborative and open to thinking on their feet.",
  },
  {
    name: 'David Deville',
    role: 'Senior Content Designer',
    company: 'SEEK',
    logo: 'seek' as const,
    linkedIn: 'https://www.linkedin.com/in/david-deville-98b287b8/',
    content: "Gareth goes above and beyond designing for customer needs. Fast experimentation, elegant designs and constant iteration resulted in products like an AI-powered resume generator that genuinely helped candidates. A positive, creative and likeable teammate.",
  },
  {
    name: 'Henry Vesander',
    role: 'Chief Product Officer',
    company: 'Best Practice Software',
    logo: 'bestpractice' as const,
    linkedIn: 'https://www.linkedin.com/in/henrikvesander/',
    content: 'An outstanding UX/product designer. I hired him to build a cloud-based practice management SaaS. He is a driven individual that can be trusted in getting the job done once given guidance and a brief. I definitely recommend Gareth!',
  },
]


export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [suffix, setSuffix] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMounted, setChatMounted] = useState(false)
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState('enterpriseai')
  // The page as written, or nothing but the gallery
  const [view, setView] = useState<'page' | 'visuals'>('page')
  const { flags } = useFeatureFlags()
  // ?home=<layout> overrides the flag, so a variant can be linked to
  const [homeOverride, setHomeOverride] = useState<HomeLayout | null>(null)
  const homeLayout = homeOverride ?? flags.homeLayout

  useEffect(() => {
    const home = new URLSearchParams(window.location.search).get('home') as HomeLayout | null
    if (home && HOME_LAYOUTS.includes(home)) setHomeOverride(home)
    // #work: jump to the work, again as the hero above it finishes loading, unless the visitor scrolls first
    if (window.location.hash === '#work') {
      let moved = false
      const stop = () => { moved = true }
      window.addEventListener('wheel', stop, { once: true })
      window.addEventListener('touchstart', stop, { once: true })
      ;[300, 900, 1800, 3000].forEach((ms) => setTimeout(() => { if (!moved) document.getElementById('work')?.scrollIntoView() }, ms))
    }
  }, [])

  // Track client-side mount to prevent hydration issues with animations
  useEffect(() => {
    setMounted(true)
  }, [])

  // Typewriter effect
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []
    let time = 800 // initial delay before typing starts
    let current = ''

    for (const step of TYPING_STEPS) {
      const target = step.text
      // Find common prefix length
      let common = 0
      while (common < current.length && common < target.length && current[common] === target[common]) {
        common++
      }
      // Delete back to common prefix
      for (let i = current.length; i > common; i--) {
        const text = current.substring(0, i - 1)
        timeouts.push(setTimeout(() => setSuffix(text), time))
        time += CHAR_DELAY
      }
      // Type forward to target
      for (let i = common + 1; i <= target.length; i++) {
        const text = target.substring(0, i)
        timeouts.push(setTimeout(() => setSuffix(text), time))
        time += CHAR_DELAY
      }
      current = target
      time += step.pause
    }
    // Done typing, show tooltip after 1s, then open chat
    timeouts.push(setTimeout(() => setTypingDone(true), time))
    timeouts.push(setTimeout(() => setShowTooltip(true), time + 1000))
    timeouts.push(setTimeout(() => setChatMounted(true), time + 1000))
    timeouts.push(setTimeout(() => setChatOpen(true), time + 1500))

    return () => timeouts.forEach(clearTimeout)
  }, [])



  const thinkersSection = (
    <>
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
    </>
  )

  const testimonialsSection = (
    <>
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

          <TestimonialCarousel testimonials={TESTIMONIALS} />
        </motion.div>
      </section>
    </>
  )

  const experienceSection = (
    <>
      {/* Experience section */}
      <section className="p-8 border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-muted uppercase tracking-widest">Experience</p>
            <button
              onClick={() => { setSelectedCompanyId('enterpriseai'); setExperienceDialogOpen(true) }}
              className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1"
            >
              View <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-border" />

            <div className="space-y-8">
              {EXPERIENCE.map((exp, index) => (
                <motion.div
                  key={exp.company}
                  className="flex gap-6 relative cursor-pointer group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  onClick={() => { setSelectedCompanyId(exp.id); setExperienceDialogOpen(true) }}
                >
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-4 h-4 rounded-full bg-foreground border-4 border-background z-10 mt-1" />

                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">{exp.company}</h3>
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

      <ExperienceDialog
        isOpen={experienceDialogOpen}
        onClose={() => setExperienceDialogOpen(false)}
        initialCompanyId={selectedCompanyId}
      />
    </>
  )

  return (
    <div className="min-h-screen bg-background transition-colors duration-700 overflow-x-clip">
      <Header />

      {/* Main content with chat sidebar */}
      <div className="max-w-7xl mx-auto pt-14">
        <div className="flex min-h-[calc(100vh-56px)]">

          {/* Main content */}
          {/* The scroll story runs out of this column to the window's edges, so it can't be clipped */}
          <main className={`flex-1 min-w-0 border-x border-border ${homeLayout === 'scrolly' ? '' : 'overflow-clip'}`}>

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
                  className="mb-8"
                  initial={mounted ? { opacity: 0 } : { opacity: 1 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-4xl md:text-5xl font-medium text-foreground whitespace-nowrap">
                    <span>Product </span>
                    <span className="relative inline">
                      {suffix}
                      {!typingDone && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                          className="inline-block w-[3px] h-[1em] bg-foreground ml-0.5 align-baseline translate-y-[0.1em]"
                        />
                      )}
                      {/* Asterisk tooltip pinned to top-right of last character */}
                      <AnimatePresence>
                        {showTooltip && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                            className="absolute -top-3 -right-4"
                          >
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-lg font-bold text-foreground cursor-default hover:opacity-60 transition-opacity">
                                    *
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-sm bg-card text-foreground border border-border shadow-lg max-w-xs">
                                  Gareth Chainey&#8482; is still professionally licensed as a product designer
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </h1>
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
                  <div className="mt-8">
                    <Magnetic strength={0.25} radius={100} disabled={!flags.particleField}>
                      <Link
                        href="/projects/rfp"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-cta)] text-white text-sm font-medium rounded-full hover:brightness-110 transition-all group"
                      >
                        Read how
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Magnetic>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Page or visuals - the same switch the case studies have. The gallery isn't live yet. */}
            {GALLERY_LIVE && (
              <div className="flex justify-center py-4 border-b border-border">
                <div className="flex bg-border/40 rounded-full p-0.5">
                  {([
                    { id: 'page', label: 'Page', icon: FileText },
                    { id: 'visuals', label: 'Visuals', icon: LayoutGrid },
                  ] as const).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setView(id)}
                      aria-pressed={view === id}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-full transition-all ${
                        view === id ? 'bg-foreground text-background font-medium' : 'text-muted hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {view === 'visuals' ? (
              <section className="p-8 border-b border-border">
                <Gallery filters />
              </section>
            ) : (
              <>
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

            {/* The work. Tiles are live; the carousels and five showcase variants are parked to
                compare (Cmd+K, ?home=scrolly etc, or the launchpad at /showcase) */}
            {/* #work: the launchpad (/showcase) links straight here */}
            <div id="work" className="scroll-mt-14">
            {homeLayout === 'tiles' ? (
              <HomeTiles titleBorders={flags.sectionTitleBorders} />
            ) : homeLayout === 'autoplay' ? (
              <AutoplayShowcase borders={flags.sectionTitleBorders} />
            ) : homeLayout === 'coverflow' ? (
              <CoverflowShowcase borders={flags.sectionTitleBorders} />
            ) : homeLayout === 'scrolly' ? (
              <ScrollyShowcase borders={flags.sectionTitleBorders} />
            ) : homeLayout === 'billboard' ? (
              <BillboardShowcase />
            ) : homeLayout === 'wall' ? (
              <WallShowcase />
            ) : (
              <>
                <ShowcaseCarousel label="Products" note="Things I've built and shipped" slides={PRODUCT_SLIDES} titleBorders={flags.sectionTitleBorders} />
                <ShowcaseCarousel label="How design has changed with AI" note="Three case studies" slides={AI_SLIDES} titleBorders={flags.sectionTitleBorders} />
              </>
            )}
            </div>

            {experienceSection}

            {testimonialsSection}
            {thinkersSection}

            {/* The reading closes the page: earlier work, essays, then the small studies */}
            <WorkList label="Earlier work" note="SEEK and Best Practice" ids={EARLIER_WORK} titleBorders={flags.sectionTitleBorders} />
            <WorkList label="Essays" ids={ESSAYS} titleBorders={flags.sectionTitleBorders} />
            <WorkList label="Small studies" note="For the curious" ids={SMALL_STUDIES} titleBorders={flags.sectionTitleBorders} />

              </>
            )}

            {/* Footer */}
            <footer className="p-8 mt-auto">
              {flags.signatureVariant === 'clippath' && <Signature className="mb-4" />}
              {flags.signatureVariant === 'penflow' && <PenflowSignature className="mb-4" />}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">© 2025 Gareth Chainey</p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-xs text-muted hover:text-foreground transition-colors"
                >
                  ↑ Back to top
                </button>
              </div>
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
                className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg hover:scale-110 transition-all"
              >
                <Facehash name="GarethLLM" size={48} showInitial enableBlink interactive={false} intensity3d="subtle" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 60%, var(--background))', borderRadius: '9999px' }} />
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
