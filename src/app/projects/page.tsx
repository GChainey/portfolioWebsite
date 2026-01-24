'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { projects } from '@/content/projects'

export default function ProjectsPage() {
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
            <Link href="/projects" className="text-sm text-foreground">
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

      <div className="max-w-7xl mx-auto pt-14 px-6">
        <div className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-medium text-foreground mb-4">Projects</h1>
            <p className="text-lg text-muted max-w-2xl">
              Case studies and experiments in AI-augmented design and development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {projects.map((project, index) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <motion.div
                  className="border border-border rounded-lg overflow-hidden hover:border-foreground/30 transition-colors cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Placeholder visual */}
                  <div className="h-48 bg-border/50 flex items-center justify-center overflow-hidden">
                    <div className="font-mono text-[10px] leading-none text-foreground/20 group-hover:text-foreground/40 transition-colors whitespace-pre select-none">
{`      ╔════════════════════════╗
      ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
      ║  ▓                ▓  ║
      ║  ▓   ${project.id.slice(0, 6).toUpperCase().padEnd(6)}     ▓  ║
      ║  ▓                ▓  ║
      ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
      ╚════════════════════════╝`}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-muted uppercase tracking-widest">{project.category}</span>
                      <span className="text-xs text-muted">•</span>
                      <span className="text-xs text-muted">{project.year}</span>
                    </div>
                    <h2 className="text-xl font-medium text-foreground mb-2">{project.title}</h2>
                    <p className="text-muted">{project.description}</p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs border border-border rounded text-muted"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
