'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import type { Project } from '@/content/projects'

const ease = [0.25, 0.1, 0.25, 1]

// Animated accent visuals, matching the draw-in treatment used on the home bento cards
function ProductVisual({ visual }: { visual?: Project['productVisual'] }) {
  switch (visual) {
    // Dispatch — a signal leaving a hub and fanning out to its destinations
    case 'dispatch':
      return (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <svg width="140" height="80" viewBox="0 0 140 80" fill="none">
            <motion.circle
              cx="24" cy="40" r="11"
              stroke="var(--accent)"
              strokeWidth="2"
              fill="var(--accent)"
              fillOpacity="0.15"
              variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            />
            {[
              { d: 'M38 40C58 40 68 14 96 14', opacity: 0.4, delay: 0.5 },
              { d: 'M38 40H96', opacity: 0.75, delay: 0.6 },
              { d: 'M38 40C58 40 68 66 96 66', opacity: 0.55, delay: 0.7 },
            ].map((path) => (
              <motion.path
                key={path.d}
                d={path.d}
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: path.opacity } }}
                transition={{ duration: 0.5, delay: path.delay, ease }}
              />
            ))}
            {[
              { cy: 14, opacity: 0.4, delay: 0.95 },
              { cy: 40, opacity: 0.75, delay: 1.05 },
              { cy: 66, opacity: 0.55, delay: 1.15 },
            ].map((dot) => (
              <motion.circle
                key={dot.cy}
                cx="106" cy={dot.cy} r="6"
                fill="var(--accent)"
                variants={{ hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: dot.opacity } }}
                transition={{ duration: 0.35, delay: dot.delay, ease }}
              />
            ))}
          </svg>
        </motion.div>
      )

    // Thesis — stacked lines of an argument resolving into a single conclusion
    case 'thesis':
      return (
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <svg width="140" height="80" viewBox="0 0 140 80" fill="none">
            {[
              { y: 14, x2: 78, opacity: 0.3, delay: 0.2 },
              { y: 28, x2: 92, opacity: 0.45, delay: 0.32 },
              { y: 42, x2: 66, opacity: 0.6, delay: 0.44 },
            ].map((line) => (
              <motion.path
                key={line.y}
                d={`M24 ${line.y}H${line.x2}`}
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
                variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: line.opacity } }}
                transition={{ duration: 0.5, delay: line.delay, ease }}
              />
            ))}
            <motion.path
              d="M24 58H116"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 0.35 } }}
              transition={{ duration: 0.5, delay: 0.6, ease }}
            />
            <motion.path
              d="M24 70H104"
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinecap="round"
              variants={{ hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } }}
              transition={{ duration: 0.6, delay: 0.72, ease }}
            />
          </svg>
        </motion.div>
      )

    default:
      return null
  }
}

interface ProductCardProps {
  product: Project
  index?: number
  className?: string
}

export function ProductCard({ product, index = 0, className = '' }: ProductCardProps) {
  return (
    <motion.div
      className={`group relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Visual area */}
      <div className="h-48 md:h-56 bg-border/30 flex items-center justify-center overflow-hidden relative">
        {product.status && (
          <span className="absolute top-4 left-4 flex items-center gap-1.5 text-xs text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {product.status}
          </span>
        )}
        <ProductVisual visual={product.productVisual} />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted uppercase tracking-wide">{product.category}</span>
            {product.year && (
              <>
                <span className="text-xs text-muted">•</span>
                <span className="text-xs text-muted">{product.year}</span>
              </>
            )}
          </div>
        </div>

        <h3 className="font-medium text-lg text-foreground group-hover:text-accent transition-colors mb-2">
          {product.title}
        </h3>
        <p className="text-sm text-muted">{product.description}</p>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 text-xs border border-border rounded text-muted">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Two destinations: the case study (whole card) and the live product */}
        <div className="flex items-center gap-4 mt-4">
          {/* Stretched link — makes the entire card a target for the case study */}
          <Link
            href={`/projects/${product.id}`}
            className="text-sm text-muted hover:text-accent transition-colors flex items-center gap-1 before:absolute before:inset-0 before:content-['']"
          >
            Read case study
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>

          {product.liveUrl && (
            <a
              href={product.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 text-sm text-muted hover:text-accent transition-colors flex items-center gap-1"
            >
              Visit {product.title}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
