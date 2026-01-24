'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle, X, Clock, ArrowRight, RotateCcw } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatInterface } from '@/components/ChatInterface'
import { CaseStudyContent } from '@/components/CaseStudyContent'
import { getProjectById, projects, type Project } from '@/content/projects'

// Calculate read time from content blocks
function calculateReadTime(content: Project['content']): number {
  const wordsPerMinute = 200
  let wordCount = 0
  content.forEach(block => {
    if (block.type === 'text' || block.type === 'heading') {
      wordCount += block.content.split(/\s+/).length
    } else if (block.type === 'list') {
      block.items.forEach(item => {
        wordCount += item.split(/\s+/).length
      })
    }
  })
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

// Contribution data for GitHub visualization
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

// TLDR role options - who is reading
const TLDR_OPTIONS = [
  { id: 'recruiter', label: "I'm a recruiter", description: 'Skills, experience, impact' },
  { id: 'designer', label: "I'm a designer", description: 'Process, craft, decisions' },
  { id: 'founder', label: "I'm a founder", description: 'Value, speed, outcomes' },
  { id: 'engineer', label: "I'm an engineer", description: 'Tech stack, architecture' },
]

export default function ProjectPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [chatOpen, setChatOpen] = useState(true)
  const [chatMounted, setChatMounted] = useState(true)
  const [tldrOpen, setTldrOpen] = useState(false)
  const [tldrLength, setTldrLength] = useState('recruiter')
  const [tldrFocus, setTldrFocus] = useState('')
  const [tldrContent, setTldrContent] = useState<string | null>(null)
  const [tldrLoading, setTldrLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      const p = getProjectById(params.id as string)
      setProject(p || null)
    }
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [params.id])

  const generateTldr = async () => {
    if (!project) return
    setTldrLoading(true)

    const roleOption = TLDR_OPTIONS.find(o => o.id === tldrLength)
    const rolePrompts: Record<string, string> = {
      recruiter: 'Focus on: skills demonstrated, years of experience, measurable impact, technologies used, and team collaboration. What would make this person a strong hire?',
      designer: 'Focus on: design process, craft decisions, user research, iteration approach, and design system thinking. What makes their design approach interesting?',
      founder: 'Focus on: business value delivered, speed of execution, problem-solving ability, and entrepreneurial mindset. Would you want this person on your founding team?',
      engineer: 'Focus on: technical architecture, tech stack choices, code quality, scalability considerations, and engineering trade-offs. What technical skills do they bring?',
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Summarize this article for me` }],
          context: `You are summarizing "${project.title}" for a ${tldrLength}.

Original description: ${project.description}

Reader context: ${roleOption?.label} - they care about: ${roleOption?.description}
${rolePrompts[tldrLength] || ''}
${tldrFocus ? `Also specifically address: ${tldrFocus}` : ''}

Write 2-3 short paragraphs tailored to what a ${tldrLength} would want to know. Be direct, specific, and compelling.`
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTldrContent(data.content)
        setTldrOpen(false) // Close dialog and show inline
      }
    } catch (error) {
      console.error('TLDR error:', error)
    } finally {
      setTldrLoading(false)
    }
  }


  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Project not found</p>
      </div>
    )
  }

  const pageContext = {
    page: project.title,
    ...project.chatContext
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header showBack />

      {/* Main content with chat sidebar */}
      <div className="max-w-7xl mx-auto pt-14">
        <div className="flex min-h-[calc(100vh-56px)]">

          {/* Main content */}
          <main className="flex-1 min-w-0 border-x border-border overflow-hidden">
            {/* Project Header - Centered */}
            <header className="py-16 px-8 border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center max-w-3xl mx-auto"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-muted uppercase tracking-widest">{project.category}</span>
                  <span className="text-xs text-muted">•</span>
                  <span className="text-xs text-muted">{project.year}</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-medium text-foreground mb-4 hover-accent-text">
                  {project.title}
                </h1>

                <p className="text-xl text-muted max-w-2xl mb-6">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs border border-border rounded-full text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* GitHub Activity - inside header for featured articles */}
                {project.showGitHubActivity && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center mb-8"
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
                              transition={{ delay: 0.5 + (mi * 7 + di) * 0.01, duration: 0.3 }}
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
                  </motion.div>
                )}

                {/* Hero Image for non-GitHub articles */}
                {!project.showGitHubActivity && project.heroImage && (
                  <div className="w-full mb-8">
                    <img
                      src={project.heroImage}
                      alt={project.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                {/* Read time and TLDR button */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Clock className="w-4 h-4" />
                    <span>{tldrContent ? 'TLDR' : `${calculateReadTime(project.content)} min read`}</span>
                  </div>
                  {tldrContent ? (
                    <button
                      onClick={() => setTldrContent(null)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-accent border border-accent/50 rounded-full hover:bg-accent/10 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Show full article
                    </button>
                  ) : (
                    <button
                      onClick={() => setTldrOpen(true)}
                      className="px-3 py-1.5 text-sm text-muted hover:text-accent border border-border hover:border-accent/50 rounded-full transition-colors"
                    >
                      Too long?
                    </button>
                  )}
                </div>
              </motion.div>
            </header>

            {/* Content */}
            <article className="p-8">
              {tldrContent ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <div className="mb-6 px-4 py-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Showing TLDR version • <button onClick={() => setTldrContent(null)} className="underline hover:no-underline font-medium">View full article</button>
                    </p>
                  </div>
                  <div className="prose prose-neutral dark:prose-invert">
                    <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">{tldrContent}</p>
                  </div>
                </motion.div>
              ) : (
                <CaseStudyContent blocks={project.content} />
              )}
            </article>

            {/* Related Projects - shown on featured articles */}
            {project.featured && (
              <section className="p-8 border-t border-border">
                <h2 className="text-xl font-medium text-foreground mb-6">Explore the Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects
                    .filter(p => p.id !== project.id && !p.featured)
                    .map((p) => (
                      <Link
                        key={p.id}
                        href={`/projects/${p.id}`}
                        className="group border border-border rounded-lg overflow-hidden hover:border-foreground/30 transition-colors"
                      >
                        {/* Visual placeholder */}
                        <div className="h-32 bg-border/30 flex items-center justify-center overflow-hidden">
                          <div className="font-mono text-[7px] leading-none text-foreground/20 group-hover:text-foreground/40 transition-colors whitespace-pre select-none">
{`  ┌────────────────────────────┐
  │  ░░░░░░░░░░░░░░░░░░░░░░░░  │
  │  ░░  ┌──────────────┐  ░░  │
  │  ░░  │   ${p.id.slice(0, 8).toUpperCase().padEnd(8)}   │  ░░  │
  │  ░░  │   ────────   │  ░░  │
  │  ░░  │   ▪ ▪ ▪ ▪    │  ░░  │
  │  ░░  └──────────────┘  ░░  │
  │  ░░░░░░░░░░░░░░░░░░░░░░░░  │
  └────────────────────────────┘`}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs text-muted uppercase tracking-widest">{p.category}</span>
                              <h3 className="font-medium text-foreground mt-1">
                                {p.title}
                              </h3>
                              <p className="text-sm text-muted mt-1 line-clamp-2">{p.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform flex-shrink-0 mt-1" />
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="p-8 border-t border-border">
              <p className="text-xs text-muted">© 2025 Gareth Chainey</p>
            </footer>
          </main>

          {/* Chat sidebar */}
          {chatOpen ? (
            <aside className="flex-shrink-0 w-[380px] h-[calc(100vh-56px)] sticky top-14 border-l border-border">
              <div className="relative h-full flex flex-col">
                <button
                  onClick={() => setChatOpen(false)}
                  className="absolute top-4 right-4 z-10 p-1.5 text-muted hover:text-foreground hover:bg-border/50 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <ChatInterface pageContext={pageContext} />
              </div>
            </aside>
          ) : (
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-6 right-6 z-50 p-4 bg-accent text-white rounded-full shadow-lg hover:scale-105 hover:brightness-110 transition-all"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* TLDR Mode Dialog */}
      <AnimatePresence>
        {tldrOpen && (
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
              onClick={() => setTldrOpen(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-background border border-border rounded-lg shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-medium text-foreground">TLDR Mode</h2>
                <button
                  onClick={() => setTldrOpen(false)}
                  className="p-2 text-muted hover:text-foreground hover:bg-border/50 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {!tldrContent ? (
                  <>
                    {/* Role options */}
                    <div>
                      <label className="text-sm text-muted mb-3 block">Who are you?</label>
                      <div className="grid grid-cols-2 gap-2">
                        {TLDR_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setTldrLength(option.id)}
                            className={`p-3 text-left border rounded-lg transition-colors ${
                              tldrLength === option.id
                                ? 'border-accent bg-accent/10 text-foreground'
                                : 'border-border text-muted hover:border-accent/50 hover:text-foreground'
                            }`}
                          >
                            <div className="font-medium text-sm">{option.label}</div>
                            <div className="text-xs opacity-70">{option.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Focus area */}
                    <div>
                      <label className="text-sm text-muted mb-2 block">Anything specific? (optional)</label>
                      <input
                        type="text"
                        value={tldrFocus}
                        onChange={(e) => setTldrFocus(e.target.value)}
                        placeholder="e.g., AI experience, leadership, remote work..."
                        className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>

                    {/* Generate button */}
                    <button
                      onClick={generateTldr}
                      disabled={tldrLoading}
                      className="w-full py-3 bg-accent text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {tldrLoading ? 'Generating...' : 'Generate TLDR'}
                    </button>
                  </>
                ) : (
                  <>
                    {/* TLDR Result */}
                    <div className="p-4 bg-border/30 rounded-lg">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">{tldrContent}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setTldrContent(null)
                          setTldrFocus('')
                        }}
                        className="flex-1 py-2 border border-border text-muted hover:text-foreground hover:border-accent/50 rounded-lg transition-colors"
                      >
                        Try different options
                      </button>
                      <button
                        onClick={() => setTldrOpen(false)}
                        className="flex-1 py-2 bg-accent text-white rounded-lg hover:brightness-110 transition-all"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
