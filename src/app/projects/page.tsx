'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { GitHubContributions } from '@/components/GitHubContributions'
import { useFeatureFlags } from '@/context/FeatureFlagContext'
import { projects } from '@/content/projects'

export default function ProjectsPage() {
  const { flags } = useFeatureFlags()

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header />

      <div className="max-w-7xl mx-auto pt-14">
        <main className="border-x border-border min-h-[calc(100vh-56px)]">
          {/* Header section */}
          <section className={`p-8 ${flags.sectionTitleBorders ? 'border-b border-border' : ''}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-medium text-foreground mb-4">Projects</h1>
              <p className="text-lg text-muted max-w-2xl">
                Case studies and experiments in AI-augmented design and development.
              </p>
            </motion.div>
          </section>

          {/* Projects grid - edges touching */}
          <section className="border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {projects.map((project, index) => {
                const isOdd = index % 2 === 1
                const isLastRow = index >= projects.length - (projects.length % 2 === 0 ? 2 : 1)

                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group block"
                  >
                    <motion.div
                      className={`${!isOdd ? 'md:border-r border-border' : ''} ${!isLastRow ? 'border-b border-border' : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Card visual */}
                      <div className="h-48 bg-border/50 flex items-center justify-center overflow-hidden">
                        {project.showGitHubActivity ? (
                          <GitHubContributions variant="card" monthsToShow={12} />
                        ) : (
                          <div className="font-mono text-[8px] leading-none text-foreground/20 group-hover:text-foreground/40 transition-colors whitespace-pre select-none">
{`    ╔══════════════════╗
    ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
    ║  ▓            ▓  ║
    ║  ▓   ${project.id.slice(0, 6).toUpperCase().padEnd(6)}   ▓  ║
    ║  ▓            ▓  ║
    ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
    ╚══════════════════╝`}
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted uppercase tracking-wide">{project.category}</span>
                            {project.year && (
                              <>
                                <span className="text-xs text-muted">•</span>
                                <span className="text-xs text-muted">{project.year}</span>
                              </>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="font-medium text-lg text-foreground group-hover:text-accent transition-colors mb-2">
                          {project.title}
                        </h3>
                        <p className="text-sm text-muted">{project.description}</p>

                        {project.tags && project.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {project.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-xs border border-border rounded text-muted"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
