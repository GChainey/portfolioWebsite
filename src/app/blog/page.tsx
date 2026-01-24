'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/Header'

// Changelog entries - newest first
const CHANGELOG = [
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
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-8 pt-14 pb-12">

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
                      <li key={j}>{item.replace('- ', '')}</li>
                    ))}
                  </ul>
                )
              }
              return (
                <p key={i} className="text-muted leading-relaxed mb-4">
                  {paragraph}
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
