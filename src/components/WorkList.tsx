'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { getProjectById } from '@/content/projects'

const COMPANY: Record<string, string> = { enterpriseai: 'Enterprise AI', seek: 'SEEK', bestpractice: 'Best Practice' }

// A titled list of case studies or essays, one per row
export function WorkList({ label, note, ids, titleBorders }: { label: string; note?: string; ids: string[]; titleBorders: boolean }) {
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
