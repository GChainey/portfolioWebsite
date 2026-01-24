'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChatInterface } from '@/components/ChatInterface'
import { CaseStudyContent } from '@/components/CaseStudyContent'
import { getProjectById, type Project } from '@/content/projects'

export default function ProjectPage() {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMounted, setChatMounted] = useState(false)

  useEffect(() => {
    if (params.id) {
      const p = getProjectById(params.id as string)
      setProject(p || null)
    }
  }, [params.id])

  // Animate in chat sidebar after page loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setChatMounted(true)
      setChatOpen(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

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
      {/* Fixed Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-medium text-foreground">
            Gareth Chainey
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/cv" className="text-sm text-muted hover:text-foreground transition-colors">
              CV
            </Link>
            <Link href="/projects" className="text-sm text-muted hover:text-foreground transition-colors">
              Projects
            </Link>
            <Link href="/blog" className="text-sm text-muted hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-sm text-muted hover:text-foreground transition-colors">
              Contact
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main content with chat sidebar */}
      <div className="max-w-7xl mx-auto pt-14">
        <div className="flex min-h-[calc(100vh-56px)]">

          {/* Main content */}
          <main className="flex-1 min-w-0 border-x border-border overflow-hidden">
            {/* Back link */}
            <div className="p-6 border-b border-border">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </div>

            {/* Project Header */}
            <header className="p-8 border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-muted uppercase tracking-widest">{project.category}</span>
                  <span className="text-xs text-muted">•</span>
                  <span className="text-xs text-muted">{project.year}</span>
                </div>

                <h1 className="text-4xl md:text-5xl font-medium text-foreground mb-4">
                  {project.title}
                </h1>

                <p className="text-xl text-muted max-w-2xl">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs border border-border rounded-full text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </header>

            {/* Hero Image */}
            {project.heroImage && (
              <div className="border-b border-border">
                <img
                  src={project.heroImage}
                  alt={project.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Content */}
            <article className="p-8">
              <CaseStudyContent blocks={project.content} />
            </article>

            {/* Footer */}
            <footer className="p-8 border-t border-border">
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
                  <ChatInterface pageContext={pageContext} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
