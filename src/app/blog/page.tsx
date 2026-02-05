'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { ReactNode, useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

// Helper to render inline markdown (bold, italic, code)
function renderMarkdown(text: string): ReactNode {
  const parts: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Match **bold**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)
    // Match `code`
    const codeMatch = remaining.match(/`(.+?)`/)

    // Find which comes first
    const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity
    const codeIndex = codeMatch ? remaining.indexOf(codeMatch[0]) : Infinity

    if (boldIndex === Infinity && codeIndex === Infinity) {
      // No more matches
      parts.push(remaining)
      break
    }

    if (boldIndex < codeIndex) {
      // Bold comes first
      if (boldIndex > 0) {
        parts.push(remaining.slice(0, boldIndex))
      }
      parts.push(<strong key={key++} className="font-semibold text-foreground">{boldMatch![1]}</strong>)
      remaining = remaining.slice(boldIndex + boldMatch![0].length)
    } else {
      // Code comes first
      if (codeIndex > 0) {
        parts.push(remaining.slice(0, codeIndex))
      }
      parts.push(<code key={key++} className="px-1.5 py-0.5 bg-border rounded text-sm font-mono">{codeMatch![1]}</code>)
      remaining = remaining.slice(codeIndex + codeMatch![0].length)
    }
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>
}

// Changelog entries - newest first
const CHANGELOG = [
  {
    version: '1.1.1',
    date: '2026-02-05',
    title: 'Fix Chat Sidebar Animation',
    description: 'Removed the delayed entrance animation on the Gareth LLM chat sidebar on the Product Thinkers page so it appears immediately on load.',
    changes: [
      'Removed 1.5s delayed mount of chat sidebar on thinkers page',
      'Set `initial={false}` on sidebar motion component to skip entrance animation',
    ],
    aiTools: ['Claude Code'],
    branch: 'GChainey/fix-gareth-llm-animation',
  },
  {
    version: '1.1.0',
    date: '2026-02-05',
    title: 'New Essay: You Can Conjure Your Own Tools Now',
    description: 'Added a new article about how AI coding tools change creative practice — building custom tools on demand and preserving design iterations as living artifacts.',
    changes: [
      'Published essay on creative tooling and the shift from waiting for features to conjuring them',
      'Explores using feature branches and flags as a design canvas for iteration history',
      'New project entry accessible from the projects page',
    ],
    aiTools: ['Claude Code'],
    branch: 'GChainey/creative-tooling-post',
  },
  {
    version: '1.0.0',
    date: '2026-02-05',
    title: 'New Essay: The GUI Has to Earn Its Place',
    description: 'Added a new article exploring how chat interfaces are changing expectations for GUIs. Chat API now supports Anthropic for production.',
    changes: [
      'Published essay on changing expectations for GUIs in the age of chat',
      'New project entry accessible from the projects page',
      'Chat API supports Anthropic Haiku 4.5 in production, Groq in dev',
    ],
    aiTools: ['Claude Code'],
    branch: 'GChainey/Gui-essay',
  },
  {
    version: '0.9.0',
    date: '2026-02-05',
    title: 'Product Thinkers',
    description: 'Added a new section showcasing product thinkers who have shaped my approach to design and product work.',
    changes: [
      'Created `/thinkers` page with edge-touching card grid',
      'Added homepage preview section between Experience and Testimonials',
      'Features Teresa Torres, Spiek & Moesta, Ryan Singer, and Christopher Alexander',
      'Created thinkers content data model in `/src/content/thinkers.ts`',
      'Created reusable `ThinkerCard` component for homepage use',
    ],
    aiTools: ['Claude Code'],
    branch: 'GChainey/product-thinkers-page',
  },
  {
    version: '0.8.0',
    date: '2026-02-05',
    title: 'RFP Case Study',
    description: 'Built out the "Responding to an RFP" case study page with full narrative content and video placeholders for key feature demonstrations.',
    changes: [
      'Rewrote RFP case study with full narrative: situation, problem, approach, impact, and outcome',
      'Added TLDR section summarizing the one-person-army story',
      'Added 5 video placeholder sections for key feature demos (seed data, LLM chat, scale adaptation, rapid iteration, interactive workflows)',
      'Structured before/after impact comparison (without AI vs with AI)',
      'Updated project tags, description, and chat context for richer AI sidebar conversations',
    ],
    aiTools: ['Claude Code'],
    branch: 'GChainey/rfp-case-study',
  },
  {
    version: '0.7.0',
    date: '2026-01-24',
    title: 'Edge-Touching Cards & Feature Flags',
    description: 'Major visual refinement with cleaner card layouts and developer tools for design iteration.',
    changes: [
      'Implemented edge-touching card style (no gaps, shared borders)',
      'Added feature flag system with Cmd+K drawer for toggling design options',
      'Created shared GitHubContributions component for reuse across pages',
      'Testimonials now show as horizontal carousel (2 visible at a time)',
      'Projects page matches homepage shell styling with border-x',
      'Section title borders toggleable via feature flag',
      'Removed chat input border for cleaner alignment',
      'Added Experience section with timeline visualization',
      'Added Testimonials section with colleague quotes',
    ],
    aiTools: ['Claude Code'],
    branch: 'main',
    images: [
      '/blog/v7-homepage-light.png',
      '/blog/v7-homepage-dark.png',
      '/blog/v7-projects-light.png',
      '/blog/v7-projects-dark.png',
    ],
  },
  {
    version: '0.6.0',
    date: '2026-01-24',
    title: 'Theme System Overhaul & System Mode',
    description: 'Complete redesign of theming with accent colors and system preference support.',
    changes: [
      'Added theme dropdown with System/Day/Night mode options',
      'System mode automatically follows OS light/dark preference',
      'Added 16 Tailwind accent colors (amber, orange, red, rose, etc.)',
      'Accent color persists to localStorage',
      'Real-time system preference change detection',
      'Default to System mode with Amber accent',
    ],
    aiTools: ['Claude Code'],
    branch: 'feature/articles-and-improvements',
  },
  {
    version: '0.5.0',
    date: '2026-01-24',
    title: 'ElevenLabs UI & Shimmering Effects',
    description: 'Integrated ElevenLabs UI components for enhanced loading states.',
    changes: [
      'Added ShimmeringText component for loading states',
      'TLDR generation button shows shimmering "Generating summary..." text',
      'Chat interface uses shimmering "Thinking..." for AI responses',
      'Smooth shimmer animation with customizable colors',
    ],
    aiTools: ['Claude Code', 'ElevenLabs'],
    branch: 'feature/articles-and-improvements',
  },
  {
    version: '0.4.0',
    date: '2026-01-24',
    title: 'Chat Enhancements & Shared Components',
    description: 'Added project cards in chat and extracted shared components.',
    changes: [
      'Chat can now include project cards using [[project:id]] syntax',
      'Created shared Header component for consistent navigation',
      'Added hover accent colors on project card titles and arrows',
      'Fixed scroll-to-top behavior on article pages',
      'Added "Back to top" button in footers',
      'Fixed double border issues between sections',
      'Fixed dropdown transparency with proper bg-background',
    ],
    aiTools: ['Claude Code'],
    branch: 'feature/articles-and-improvements',
  },
  {
    version: '0.3.0',
    date: '2026-01-24',
    title: 'Two-Column Layout & Chat Sidebar',
    description: 'Major redesign focusing on storytelling and AI transformation narrative.',
    changes: [
      'Redesigned to two-column layout (main content + chat sidebar)',
      'Added "Gareth Chainey" as permanent title with animated role subtitle',
      'Created GitHub contributions visualization showing 2024→2025 transformation',
      'Implemented experience timeline with brand-colored highlights',
      'Updated chat interface with black bubbles in day mode',
      'Added Lucide icons for theme toggle (Sun/Moon)',
    ],
    aiTools: ['Claude Code', 'Agentation'],
    branch: 'feature/layout-v2-two-column-chat',
    pr: 'https://github.com/GChainey/portfolioWebsite/pull/2',
  },
  {
    version: '0.2.0',
    date: '2026-01-24',
    title: 'Theme System & GitHub Integration',
    description: 'Added dark/light mode theming and live GitHub activity feed.',
    changes: [
      'Implemented ThemeContext with system preference detection',
      'Added localStorage persistence for theme choice',
      'Created GitHubActivity component fetching live data',
      'Built contribution graph visualization',
      'Added recent activity feed with formatted dates',
    ],
    aiTools: ['Claude Code'],
    branch: 'main',
  },
  {
    version: '0.1.0',
    date: '2026-01-24',
    title: 'Initial Scaffolding',
    description: 'Set up the foundational project structure with Next.js 14.',
    changes: [
      'Initialized Next.js 14 with TypeScript and Tailwind CSS',
      'Configured Framer Motion for animations',
      'Set up Anthropic SDK for AI chat integration',
      'Created edge-to-edge grid layout system',
      'Built initial component structure',
    ],
    aiTools: ['Claude Code'],
    branch: 'main',
    image: '/blog/v1-grid-layout.png',
  },
]

const BLOG_POST = {
  title: 'Building My Portfolio with AI: A Development Journal',
  subtitle: 'Documenting the iterative process of creating this site with Claude Code',
  date: '2026-01-24',
  content: `
## The Experiment

This portfolio website is itself a demonstration of how I work—using AI tools to multiply my output and ship faster. Every line of code, every design decision, and every iteration was done in collaboration with Claude Code.

## Why Document This?

As a product designer embracing AI, I wanted to show not just the end result, but the process. This changelog captures:

- **Real iterations** — How the design evolved from complex to simple
- **AI collaboration** — What tools were used and how
- **Decision making** — Why certain approaches were chosen

## The Stack

- **Next.js 14** with App Router for the framework
- **Tailwind CSS** for styling with CSS variables for theming
- **Framer Motion** for animations
- **Anthropic SDK** for the AI chat feature
- **Lucide React** for icons

## Key Learnings

### 1. Start Complex, Simplify Later

The initial design had a 12-column nested grid with multiple sections. Through iteration, we simplified to a clean two-column layout that tells a better story.

### 2. Let the Data Tell the Story

The GitHub contributions visualization isn't just decoration—it shows the transformation from empty (early 2024) to active (2025), matching the narrative of adopting AI tools.

### 3. AI Speeds Up Iteration

What would normally take days of back-and-forth happened in a single session. The AI could implement changes, see feedback, and iterate immediately.

## What's Next

- Add more blog posts documenting specific projects
- Implement the chat feature with working API credits
- Add project case studies
- Deploy to production
  `,
}

export default function BlogPage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [zoom, setZoom] = useState(100) // 100 = 100% (actual size)

  const openLightbox = (images: string[], index: number) => {
    setLightboxImages(images)
    setLightboxIndex(index)
    setLightboxImage(images[index])
    setZoom(100) // Start at 100% zoom
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    setLightboxImages([])
    setLightboxIndex(0)
    setZoom(100)
  }

  const goToPrev = useCallback(() => {
    const newIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length
    setLightboxIndex(newIndex)
    setLightboxImage(lightboxImages[newIndex])
  }, [lightboxIndex, lightboxImages])

  const goToNext = useCallback(() => {
    const newIndex = (lightboxIndex + 1) % lightboxImages.length
    setLightboxIndex(newIndex)
    setLightboxImage(lightboxImages[newIndex])
  }, [lightboxIndex, lightboxImages])

  const zoomIn = () => setZoom(z => Math.min(z + 25, 200))
  const zoomOut = () => setZoom(z => Math.max(z - 25, 25))
  const fitToScreen = () => setZoom(50) // Fit to viewport

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === '+' || e.key === '=') zoomIn()
      if (e.key === '-') zoomOut()
      if (e.key === '0') setZoom(100)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxImage, goToPrev, goToNext])

  return (
    <div className="min-h-screen bg-background">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between p-4 bg-black/50">
              {/* Zoom controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={zoomOut}
                  className="p-2 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10"
                  title="Zoom out (-)"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white/70 text-sm w-16 text-center">{zoom}%</span>
                <button
                  onClick={zoomIn}
                  className="p-2 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10"
                  title="Zoom in (+)"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={fitToScreen}
                  className="p-2 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10 ml-2"
                  title="Fit to screen"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="px-2 py-1 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10 text-sm"
                  title="Actual size (0)"
                >
                  100%
                </button>
              </div>

              {/* Image counter */}
              {lightboxImages.length > 1 && (
                <div className="text-white/70 text-sm">
                  {lightboxIndex + 1} / {lightboxImages.length}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="p-2 text-white/70 hover:text-white transition-colors rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable image area */}
            <div
              className="flex-1 overflow-auto flex items-start justify-center p-4"
              onClick={closeLightbox}
            >
              {/* Navigation arrows */}
              {lightboxImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToPrev() }}
                    className="fixed left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors rounded-full bg-black/50 hover:bg-black/70 z-10"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNext() }}
                    className="fixed right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors rounded-full bg-black/50 hover:bg-black/70 z-10"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              {/* Image */}
              <motion.div
                key={lightboxImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: `${zoom}%`,
                  minWidth: zoom > 100 ? `${zoom}%` : 'auto',
                }}
                className="flex-shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightboxImage}
                  alt="Lightbox image"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
      <div className="max-w-4xl mx-auto px-8 pt-24 pb-12">

        {/* Blog Post */}
        <article className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs text-muted uppercase tracking-widest mb-4">
              Development Journal
            </p>
            <h1 className="text-4xl font-medium text-foreground mb-4">
              {BLOG_POST.title}
            </h1>
            <p className="text-xl text-muted mb-6">
              {BLOG_POST.subtitle}
            </p>
            <p className="text-sm text-muted mb-8">
              {BLOG_POST.date}
            </p>
          </motion.div>

          <motion.div
            className="prose prose-neutral dark:prose-invert max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {BLOG_POST.content.split('\n\n').map((paragraph, i) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={i} className="text-2xl font-medium text-foreground mt-12 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                )
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={i} className="text-xl font-medium text-foreground mt-8 mb-3">
                    {paragraph.replace('### ', '')}
                  </h3>
                )
              }
              if (paragraph.startsWith('- ')) {
                return (
                  <ul key={i} className="list-disc list-inside text-muted mb-4 space-y-1">
                    {paragraph.split('\n').map((item, j) => (
                      <li key={j}>{renderMarkdown(item.replace('- ', ''))}</li>
                    ))}
                  </ul>
                )
              }
              return (
                <p key={i} className="text-muted leading-relaxed mb-4">
                  {renderMarkdown(paragraph)}
                </p>
              )
            })}
          </motion.div>
        </article>

        {/* Changelog */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-medium text-foreground mb-8">
              Changelog
            </h2>

            <div className="space-y-8">
              {CHANGELOG.map((entry, index) => (
                <motion.div
                  key={entry.version}
                  className="relative pl-8 pb-8 border-l border-border last:pb-0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {/* Version dot */}
                  <div className="absolute left-0 top-0 w-4 h-4 -translate-x-1/2 rounded-full bg-foreground" />

                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="inline-block px-2 py-0.5 text-xs font-mono bg-border rounded mr-2">
                        v{entry.version}
                      </span>
                      <span className="text-sm text-muted">{entry.date}</span>
                    </div>
                    {entry.pr && (
                      <a
                        href={entry.pr}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted hover:text-foreground transition-colors"
                      >
                        View PR →
                      </a>
                    )}
                  </div>

                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {entry.title}
                  </h3>

                  <p className="text-muted mb-4">
                    {entry.description}
                  </p>

                  <ul className="space-y-1 mb-4">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="text-sm text-muted flex items-start gap-2">
                        <span className="text-foreground/50">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">Built with:</span>
                    {entry.aiTools.map((tool) => (
                      <span
                        key={tool}
                        className="inline-block px-2 py-0.5 text-xs bg-accent/10 text-accent rounded"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>

                  {entry.image && (
                    <button
                      onClick={() => openLightbox([entry.image!], 0)}
                      className="mt-4 rounded-lg overflow-hidden border border-border block w-full hover:border-accent transition-colors cursor-zoom-in h-48"
                    >
                      <Image
                        src={entry.image}
                        alt={`Screenshot of v${entry.version}`}
                        width={800}
                        height={500}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  )}

                  {entry.images && entry.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {entry.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => openLightbox(entry.images!, i)}
                          className="rounded-lg overflow-hidden border border-border hover:border-accent transition-colors cursor-zoom-in h-32"
                        >
                          <Image
                            src={img}
                            alt={`Screenshot ${i + 1} of v${entry.version}`}
                            width={400}
                            height={250}
                            className="w-full h-full object-cover object-top"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <p className="text-xs text-muted">
            © 2025 Gareth Chainey · Built iteratively with AI
          </p>
        </footer>
      </div>
    </div>
  )
}
