'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Clock, ArrowRight, ArrowUpRight, RotateCcw, LayoutGrid, FileText } from 'lucide-react'
import { Header } from '@/components/Header'
import { SiteFooter } from '@/components/SiteFooter'
import { ChatPopup } from '@/components/ChatPopup'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { CaseStudyContent, componentRegistry } from '@/components/CaseStudyContent'
import { TableOfContents } from '@/components/TableOfContents'
import { FixedTableOfContents } from '@/components/FixedTableOfContents'
import { ShimmeringText } from '@/components/ui/shimmering-text'
import { getProjectById, pageIsLive, projectHref, projects, type Project, type ContentBlock } from '@/content/projects'
import { GitHubContributions } from '@/components/GitHubContributions'
import { Backdrop, FramedMedia, GridFrame, MediaFrame } from '@/components/ClipFrame'
import { ReplayReel } from '@/components/replay/ReplayReel'
import { SHOWCASE_SECTIONS } from '@/content/home-showcase'
import { ImpactSentence } from '@/components/ImpactSentence'

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
    } else if (block.type === 'stats') {
      block.items.forEach(item => {
        wordCount += `${item.label} ${item.note ?? ''}`.split(/\s+/).length
      })
    } else if (block.type === 'comparison') {
      wordCount += [block.before, block.after].flat().join(' ').split(/\s+/).length
    }
  })
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}


// The article as plain text, for the model to summarise. Media and live components are left out.
function articleText(content: Project['content']): string {
  const asLines = (v: string | string[]) => [v].flat().join('; ')
  return content.map(block => {
    switch (block.type) {
      case 'heading': return `\n## ${block.content}`
      case 'text': return block.content
      case 'list': return block.items.map(item => `- ${item}`).join('\n')
      case 'stats': return block.items.map(i => `- ${i.value} ${i.label}${i.note ? ` (${i.note})` : ''}`).join('\n')
      case 'comparison': return `${block.beforeLabel ?? 'Before'}: ${asLines(block.before)}\n${block.afterLabel ?? 'Now'}: ${asLines(block.after)}`
      case 'table': return [block.headers, ...block.rows].map(row => row.join(' | ')).join('\n')
      default: return ''
    }
  }).filter(Boolean).join('\n\n')
}

// Leaves room in the chat API's context cap for the instructions around the article
const TLDR_ARTICLE_CHARS = 9500

// TLDR role options - who is reading
const TLDR_OPTIONS = [
  { id: 'recruiter', label: "I'm a recruiter", description: 'Skills, experience, impact' },
  { id: 'designer', label: "I'm a designer", description: 'Process, craft, decisions' },
  { id: 'founder', label: "I'm a founder", description: 'Value, speed, outcomes' },
  { id: 'engineer', label: "I'm an engineer", description: 'Tech stack, architecture' },
]

// Media and artifacts (like FunnelDiagram) that exist. A pending slot has nothing to show yet.
const isVisual = (b: ContentBlock) =>
  (b.type === 'component' && !b.pending) || ((b.type === 'image' || b.type === 'gif' || b.type === 'video' || b.type === 'embed') && !b.pending)

// What the picture or reel at the top of the page sits in: the colour backdrop and window, or
// the dotted canvas for a hero that asks for it
function HeroFrame({ grid, bar, url, children }: { grid: boolean; bar: boolean; url?: string; children: React.ReactNode }) {
  return grid ? <GridFrame>{children}</GridFrame> : <MediaFrame bar={bar} url={url}>{children}</MediaFrame>
}

function VisualGallery({ blocks }: { blocks: ContentBlock[] }) {
  const visualBlocks = blocks.filter(isVisual)

  // Find the heading that precedes each visual block for context
  function getHeadingForVisual(visualIndex: number): string | null {
    const originalIndex = blocks.indexOf(visualBlocks[visualIndex])
    for (let i = originalIndex - 1; i >= 0; i--) {
      if (blocks[i].type === 'heading') {
        return (blocks[i] as { type: 'heading'; content: string }).content
      }
    }
    return null
  }

  return (
    <div className="space-y-8">
      {visualBlocks.map((block, index) => {
        const heading = getHeadingForVisual(index)

        // Component blocks (e.g. FunnelDiagram)
        if (block.type === 'component') {
          const Component = componentRegistry[block.componentId]
          if (!Component) return null
          return (
            <div
              key={index}
            >
              {heading && (
                <p className="text-xs text-muted uppercase tracking-widest mb-2">
                  {heading}
                </p>
              )}
              <Component {...(block.props || {})} />
              {block.caption && (
                <p className="mt-2 text-sm text-muted text-center">
                  {block.caption}
                </p>
              )}
            </div>
          )
        }

        // Media blocks
        const mediaBlock = block as ContentBlock & { type: 'image' | 'gif' | 'video' | 'embed' }

        return (
          <div
            key={index}
          >
            {heading && (
              <p className="text-xs text-muted uppercase tracking-widest mb-2">
                {heading}
              </p>
            )}
            <FramedMedia block={mediaBlock} />
            {mediaBlock.caption && (
              <p className="mt-2 text-sm text-muted text-center">
                {mediaBlock.caption}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ProjectPage() {
  const params = useParams()
  // Known on the first render, so the page doesn't flash empty. A page that's off is 404'd by the layout
  const found = getProjectById(params.id as string)
  const project = found && pageIsLive(found) ? found : null
  const [tldrOpen, setTldrOpen] = useState(false)
  const [tldrLength, setTldrLength] = useState('recruiter')
  const [tldrFocus, setTldrFocus] = useState('')
  const [tldrContent, setTldrContent] = useState<string | null>(null)
  const [tldrLoading, setTldrLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'case' | 'visual'>('case')

  // Scroll to top on mount - disable scroll restoration and force scroll
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    // Also run after a short delay for any async content
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)

    return () => clearTimeout(timer)
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
          context: `You are summarizing Gareth Chainey's case study "${project.title}" for a ${tldrLength}. The full article is below.

Original description: ${project.description}

Reader context: ${roleOption?.label} - they care about: ${roleOption?.description}
${rolePrompts[tldrLength] || ''}
${tldrFocus ? `Also specifically address: ${tldrFocus}` : ''}

Write 2-3 short paragraphs (under 150 words in total) tailored to what a ${tldrLength} would want to know. Write in the first person, as Gareth ("I built..."), the way the article does. Only use facts from the article. Be direct, specific, and compelling. Start straight in with the first paragraph: no title. Write in plain text: no markdown, headings, bold or bullet points.

<article>
${articleText(project.content).slice(0, TLDR_ARTICLE_CHARS)}
</article>`
        })
      })

      if (response.ok) {
        const data = await response.json()
        // The summary renders as plain text, so drop any markdown the model adds anyway
        setTldrContent(data.content.replace(/\*\*|__/g, '').replace(/^#+\s*/gm, '').trim())
        setTldrOpen(false) // Close dialog and show inline
      }
    } catch (error) {
      console.error('TLDR error:', error)
    } finally {
      setTldrLoading(false)
    }
  }


  if (!project) return null

  const isEssay = project.category === 'Article'
  // Its piece on the homepage, if it has one: its colour and what it made possible
  const piece = SHOWCASE_SECTIONS.flatMap((x) => x.pieces).find((x) => x.caseStudy === `/projects/${project.id}`)

  // The other essays, to read next
  const moreEssays = project.category === 'Article'
    ? projects.filter(p => p.category === 'Article' && p.id !== project.id && projectHref(p))
    : []

  const pageContext = {
    page: project.title,
    ...project.chatContext
  }

  // Read time and TLDR button
  const readTime = (
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
  )

  return (
    // The study's colour (the homepage's tint for it) is the mat its pictures and clips sit on
    <div className="min-h-screen bg-background transition-colors duration-700" style={{ ['--mat' as string]: piece?.tint }}>
      <Header />

      {/* Main content with chat sidebar */}
      <div className="max-w-7xl mx-auto pt-14">
        <div className="flex min-h-[calc(100vh-56px)]">

          {/* Main content */}
          <main className="flex-1 min-w-0 overflow-hidden flex flex-col">
            {/* A case study: left-aligned, in the homepage's look, with what it made possible up top */}
            {!isEssay && (
              <header className="px-6 pb-8 pt-24 sm:px-8">
                <div
                  // Centred, the title sits in the words' column: typeset's 37em at 18px
                  className="mx-auto flex max-w-[666px] flex-col gap-6"
                >
                  <p className="text-sm text-muted">{[project.category, project.year].join(' · ')}</p>
                  <h1 className="max-w-4xl text-[36px] font-medium leading-[1.1] tracking-[-0.025em] text-foreground text-balance md:text-[44px]">{project.title}</h1>
                  {!project.hideDescription && (
                    <p className="max-w-3xl text-[22px] leading-[34px] tracking-[-0.01em] text-muted text-pretty">{project.description}</p>
                  )}
                  {piece?.impact && (
                    // What it did, as a sentence on a black rule: the numbers in ink, the rest in grey
                    <ImpactSentence impact={piece.impact} className="border-l-2 border-foreground pl-5 text-[22px] leading-[32px] tracking-[-0.01em]" />
                  )}
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground transition-colors hover:text-accent">Visit {project.title} ↗</a>
                    )}
                    {readTime}
                  </div>
                </div>

                {/* The hero, as big as the column, on the study's mat */}
                <div
                  className="mx-auto mt-12 max-w-5xl"
                >
                  {project.heroReel ? (
                    // The reel straight on the study's colour: its app window is the only frame
                    <Backdrop className="p-2 sm:p-4">
                      <ReplayReel scenes={project.heroReel} />
                    </Backdrop>
                  ) : project.heroReplay ? (
                    <MediaFrame>
                      <RecordingReplay src={project.heroReplay} bar={false} />
                    </MediaFrame>
                  ) : project.showGitHubActivity ? (
                    <div className="flex justify-center"><GitHubContributions variant="full" animate /></div>
                  ) : project.heroImage ? (
                    <HeroFrame grid={project.heroFrame === 'grid'} bar={!!project.heroVideo} url={project.heroUrl}>
                      {project.heroVideo ? (
                        <video src={project.heroVideo} poster={project.heroImage} aria-label={project.title} autoPlay loop muted playsInline className="block h-auto w-full" />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.heroImage} alt={project.title} className="block h-auto w-full" />
                      )}
                    </HeroFrame>
                  ) : null}
                </div>
              </header>
            )}

            {/* An essay: centred, as it was */}
            {isEssay && (
            <header className="pt-24 pb-12 px-8">
              <div
                className="flex flex-col items-center text-center mx-auto max-w-5xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-muted uppercase tracking-widest">{project.category}</span>
                  <span className="text-xs text-muted">•</span>
                  <span className="text-xs text-muted">{project.year}</span>
                  {project.status && (
                    <>
                      <span className="text-xs text-muted">•</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        {project.status}
                      </span>
                    </>
                  )}
                </div>

                <h1 className="max-w-3xl text-4xl md:text-5xl font-medium text-foreground mb-4 hover-accent-text">
                  {project.title}
                </h1>

                {!project.hideDescription && (
                  <p className="text-xl text-muted max-w-2xl mb-6">
                    {project.description}
                  </p>
                )}

                {/* Live product CTA */}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 bg-[var(--accent-cta)] text-white text-sm font-medium rounded-full hover:brightness-110 transition-all group/cta"
                  >
                    Visit {project.title}
                    <ArrowUpRight className="w-4 h-4 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 transition-transform" />
                  </a>
                )}

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
                  <div
                    className="flex flex-col items-center mb-8"
                  >
                    <GitHubContributions variant="full" animate />
                  </div>
                )}


                {/* Hero Image for non-GitHub articles */}
                {project.heroReplay && (
                  <div className="w-full -mt-8">
                    <RecordingReplay src={project.heroReplay} bar={false} />
                  </div>
                )}

                {!project.showGitHubActivity && !project.heroReel && !project.heroReplay && project.heroImage && (
                  <div className="w-full mb-8">
                    {project.heroFrame === 'device' ? (
                      <Backdrop className="overflow-hidden">
                        <img src={project.heroImage} alt={project.title} className="block w-full h-auto" />
                      </Backdrop>
                    ) : (
                    <HeroFrame grid={project.heroFrame === 'grid'} bar={!!project.heroVideo && project.heroFrame !== 'reel'} url={project.heroUrl}>
                      {project.heroVideo ? (
                        <video
                          src={project.heroVideo}
                          poster={project.heroImage}
                          aria-label={project.title}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="block w-full h-auto"
                        />
                      ) : (
                        <img
                          src={project.heroImage}
                          alt={project.title}
                          className="block w-full h-auto"
                        />
                      )}
                    </HeroFrame>
                    )}
                  </div>
                )}

                {!project.heroReel && readTime}
              </div>

              {/* A reel of replays, full-bleed across the column: the product is the hero */}
              {project.heroReel && (
                <>
                  <div className="-mx-8 mt-10 mb-8 border-y border-border">
                    <ReplayReel scenes={project.heroReel} />
                  </div>
                  <div className="flex justify-center">{readTime}</div>
                </>
              )}
            </header>
            )}

            {/* View Mode Tabs: an essay with media. A case study is all pictures already */}
            {isEssay && project.content.some(isVisual) && (
              <div className="flex justify-center py-4">
                <div className="flex bg-border/40 rounded-full p-0.5">
                  <button
                    onClick={() => setViewMode('case')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-full transition-all ${
                      viewMode === 'case'
                        ? 'bg-foreground text-background font-medium'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Case
                  </button>
                  <button
                    onClick={() => setViewMode('visual')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-full transition-all ${
                      viewMode === 'visual'
                        ? 'bg-foreground text-background font-medium'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Visual
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            {/* The words in a centred column; pictures and clips take the full width */}
            <article className="p-8 w-full mx-auto max-w-[68rem]">
              {viewMode === 'visual' ? (
                <VisualGallery blocks={project.content} />
              ) : (
                <>
                  {/* Table of Contents - inline at top, becomes fixed when scrolled past */}
                  {!tldrContent && (
                    <div className="hidden lg:block mx-auto max-w-[666px]" data-inline-toc>
                      <TableOfContents blocks={project.content} />
                    </div>
                  )}

                  {tldrContent ? (
                    <div
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
                    </div>
                  ) : (
                    <CaseStudyContent blocks={project.content} />
                  )}
                </>
              )}
            </article>

            {/* More essays, in the Essays page's rows */}
            {moreEssays.length > 0 && (
              <section aria-labelledby="more-essays" className="pt-24 pb-24">
                <div className="max-w-3xl mx-auto px-8 flex flex-col gap-10">
                  <h2 id="more-essays" className="text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground">More essays</h2>
                  <ol className="flex flex-col">
                    {moreEssays.map((p) => (
                      <li key={p.id} className="border-t border-border last:border-b">
                        <Link href={projectHref(p)!} className="group flex items-baseline gap-6 py-8">
                          <span className="flex min-w-0 flex-1 flex-col gap-2">
                            <span className="text-[24px] font-medium leading-[30px] tracking-[-0.01em] text-foreground transition-colors group-hover:text-accent text-balance">{p.title}</span>
                            <span className="text-base leading-[26px] text-muted text-pretty">{p.description}</span>
                          </span>
                          <span className="hidden shrink-0 text-sm text-muted tabular-nums sm:block">{p.year}</span>
                          <ArrowRight className="h-4 w-4 shrink-0 self-center text-muted transition-all group-hover:translate-x-1 group-hover:text-accent" />
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            )}

            <SiteFooter />
          </main>

          <ChatPopup pageContext={pageContext} />
        </div>
      </div>

      {/* Fixed Table of Contents - rendered outside main to avoid overflow clipping */}
      {!tldrContent && viewMode === 'case' && (
        <FixedTableOfContents blocks={project.content} />
      )}

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
                      className="w-full py-3 bg-[var(--accent-cta)] text-white font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {tldrLoading ? (
                        <ShimmeringText
                          text="Generating summary..."
                          className="text-white"
                          shimmerColor="rgba(255,255,255,0.8)"
                          color="rgba(255,255,255,0.6)"
                          duration={1.5}
                          spread={1.5}
                        />
                      ) : 'Generate TLDR'}
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
                        className="flex-1 py-2 bg-[var(--accent-cta)] text-white rounded-lg hover:brightness-110 transition-all"
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
