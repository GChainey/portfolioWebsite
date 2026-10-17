'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ProductGrid } from '@/components/ProductCard'
import { products } from '@/content/projects'

// How the live homepage shows the work: products as a grid of logo cards, then the three case
// studies as tiles with a drawn accent icon. The parked alternatives sit beside it behind the
// homepage flag (Cmd+K, or ?home=).

interface ProjectCard {
  id: string
  number: string
  title: string
  description: string
  category: string
  href: string
  icon?: string
  comingSoon?: boolean // Not written up yet: the card shows, but doesn't link
}

// The three main projects, each framed around what AI made possible
const MAIN_PROJECTS: ProjectCard[] = [
  {
    id: 'rfp',
    number: '01',
    title: 'Utilising AI to Help Sales Win Deals',
    description: 'The features and flexibility that were only possible because of AI.',
    category: 'Enterprise AI',
    href: '/projects/rfp',
    icon: 'code',
  },
  {
    id: 'html-brand-website',
    number: '02',
    title: 'A Website Built from an HTML Brand',
    description: 'One tagline, ten wild variations, the brand as files an agent reads, and two rounds of testing the message.',
    category: 'Brand & Web',
    href: '/projects/html-brand-website',
    icon: 'sparkle',
  },
  {
    id: 'configurator',
    number: '03',
    title: 'Testing Whether It Works, Not Just How It Looks',
    description: 'A no-code builder prototyped on live models, to test feasibility and viability along with usability.',
    category: 'No-Code AI',
    href: '/projects/configurator',
    icon: 'workflow',
  },
]

function BentoCardVisual({ icon }: { icon?: string }) {
  const ease = [0.25, 0.1, 0.25, 1]

  switch (icon) {
    case 'code':
      return (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <motion.path
              d="M28 20L8 40L28 60"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.65 },
              }}
              transition={{ duration: 0.8, delay: 0.2, ease }}
            />
            <motion.path
              d="M52 20L72 40L52 60"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.45 },
              }}
              transition={{ duration: 0.8, delay: 0.4, ease }}
            />
            <motion.path
              d="M45 16L35 64"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1 },
              }}
              transition={{ duration: 0.6, delay: 0.6, ease }}
            />
          </svg>
        </motion.div>
      )
    case 'workflow':
      return (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
            <motion.circle
              cx="20" cy="30" r="12"
              stroke="var(--accent)"
              strokeWidth="2"
              fill="var(--accent)"
              fillOpacity="0.08"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.4 },
              }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            />
            <motion.path
              d="M32 30H48"
              stroke="var(--accent)"
              strokeWidth="2"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.5 },
              }}
              transition={{ duration: 0.4, delay: 0.5, ease }}
            />
            <motion.path
              d="M44 26L48 30L44 34"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.5 },
              }}
              transition={{ duration: 0.3, delay: 0.6, ease }}
            />
            <motion.circle
              cx="60" cy="30" r="12"
              stroke="var(--accent)"
              strokeWidth="2"
              fill="var(--accent)"
              fillOpacity="0.12"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.65 },
              }}
              transition={{ duration: 0.6, delay: 0.65, ease }}
            />
            <motion.path
              d="M72 30H88"
              stroke="var(--accent)"
              strokeWidth="2"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.75 },
              }}
              transition={{ duration: 0.4, delay: 0.85, ease }}
            />
            <motion.path
              d="M84 26L88 30L84 34"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.75 },
              }}
              transition={{ duration: 0.3, delay: 0.95, ease }}
            />
            <motion.circle
              cx="100" cy="30" r="12"
              stroke="var(--accent)"
              strokeWidth="2"
              fill="var(--accent)"
              fillOpacity="0.18"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1 },
              }}
              transition={{ duration: 0.6, delay: 1.0, ease }}
            />
          </svg>
        </motion.div>
      )
    case 'sparkle':
      return (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <motion.circle
              cx="40" cy="40" r="8"
              stroke="var(--accent)"
              strokeWidth="2.5"
              fill="var(--accent)"
              fillOpacity="0.15"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 1 },
              }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            />
            <motion.path
              d="M40 8V16"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.7 },
              }}
              transition={{ duration: 0.4, delay: 0.5, ease }}
            />
            <motion.path
              d="M40 64V72"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.65 },
              }}
              transition={{ duration: 0.4, delay: 0.6, ease }}
            />
            <motion.path
              d="M8 40H16"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.55 },
              }}
              transition={{ duration: 0.4, delay: 0.7, ease }}
            />
            <motion.path
              d="M64 40H72"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.5 },
              }}
              transition={{ duration: 0.4, delay: 0.8, ease }}
            />
            <motion.path
              d="M20 20L25 25"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.35 },
              }}
              transition={{ duration: 0.3, delay: 0.85, ease }}
            />
            <motion.path
              d="M55 55L60 60"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.3 },
              }}
              transition={{ duration: 0.3, delay: 0.9, ease }}
            />
            <motion.path
              d="M60 20L55 25"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.35 },
              }}
              transition={{ duration: 0.3, delay: 0.95, ease }}
            />
            <motion.path
              d="M25 55L20 60"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{
                hidden: { pathLength: 0, opacity: 0 },
                visible: { pathLength: 1, opacity: 0.3 },
              }}
              transition={{ duration: 0.3, delay: 1.0, ease }}
            />
          </svg>
        </motion.div>
      )
    default:
      return null
  }
}

export function HomeTiles({ titleBorders }: { titleBorders: boolean }) {
  return (
    <>
      {/* Products - things I've built and shipped */}
      {products.length > 0 && (
        <section className="border-b border-border">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className={`flex items-center justify-between px-8 ${titleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
              <p className="text-xs text-muted uppercase tracking-widest">Products</p>
              <p className="text-xs text-muted">Things I&apos;ve built and shipped</p>
            </div>

            <ProductGrid products={products} />
          </motion.div>
        </section>
      )}

      {/* The three main projects */}
      <section className="border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className={`flex items-center justify-between px-8 ${titleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
            <p className="text-xs text-muted uppercase tracking-widest">How design has changed with AI</p>
            <Link href="/projects" className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3">
            {MAIN_PROJECTS.map((project, index) => {
              const card = (
                <motion.div
                  className={`h-full border-border ${index === MAIN_PROJECTS.length - 1 ? '' : 'border-b md:border-b-0 md:border-r'}`}
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
                    <BentoCardVisual icon={project.icon} />
                  </div>

                  {/* Text content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted uppercase tracking-wide">{project.category}</span>
                      {project.comingSoon ? (
                        <span className="text-xs text-muted">Coming soon</span>
                      ) : (
                        <ArrowRight className="w-4 h-4 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                    <h3 className={`font-medium text-foreground mb-1 ${project.comingSoon ? '' : 'group-hover:text-accent transition-colors'}`}>{project.title}</h3>
                    <p className="text-sm text-muted line-clamp-2">{project.description}</p>
                  </div>
                </motion.div>
              )

              // Not written up yet: the card shows, but doesn't link
              return project.comingSoon ? (
                <div key={project.id}>{card}</div>
              ) : (
                <Link key={project.id} href={project.href} className="group block">
                  {card}
                </Link>
              )
            })}
          </div>
        </motion.div>
      </section>
    </>
  )
}
