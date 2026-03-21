'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface FunnelStage {
  label: string
  highlight?: boolean
  assumption?: string
}

interface FunnelDiagramProps {
  title?: string
  stages: FunnelStage[]
  caption?: string
}

const defaultStages: FunnelStage[] = [
  { label: 'Impressions', highlight: false },
  { label: 'Find the right course (tabs)', highlight: true, assumption: 'Too much friction to find a course' },
  { label: 'Select a course', highlight: true, assumption: 'Missing design details' },
  { label: 'Course information', highlight: false },
  { label: 'Lead/Link', highlight: true, assumption: 'Too long to make a connection' },
]

type ThemeKey = 'accent' | 'subtle' | 'minimal' | 'outline'

const themeLabels: Record<ThemeKey, string> = {
  accent: 'Accent',
  subtle: 'Subtle',
  minimal: 'Minimal',
  outline: 'Outline',
}

const ease = [0.22, 1, 0.36, 1] as const

export function FunnelDiagram({
  title = 'MVP release',
  stages = defaultStages,
  caption,
}: FunnelDiagramProps) {
  const [themeKey, setThemeKey] = useState<ThemeKey>('accent')
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  // Collect stages that have assumptions, alternating sides
  const assumptionStages = stages
    .map((stage, i) => ({ stage, index: i }))
    .filter(({ stage }) => stage.assumption)

  // SVG dimensions
  const svgWidth = 400
  const svgHeight = 480
  const funnelTopWidth = 280
  const funnelBottomWidth = 100
  const funnelStartY = 50
  const stageHeight = 72
  const stageGap = 4
  const centerX = svgWidth / 2

  function getStageWidth(index: number): number {
    const progress = index / (stages.length - 1)
    return funnelTopWidth - progress * (funnelTopWidth - funnelBottomWidth)
  }

  function getStageY(index: number): number {
    return funnelStartY + index * (stageHeight + stageGap)
  }

  function getStagePath(i: number): string {
    const topWidth = getStageWidth(i)
    const bottomWidth = getStageWidth(i + (i < stages.length - 1 ? 1 : 0))
    const actualBottomWidth = i === stages.length - 1 ? topWidth * 0.7 : bottomWidth
    const y = getStageY(i)

    const tl = `${centerX - topWidth / 2},${y}`
    const tr = `${centerX + topWidth / 2},${y}`
    const br = `${centerX + actualBottomWidth / 2},${y + stageHeight}`
    const bl = `${centerX - actualBottomWidth / 2},${y + stageHeight}`

    return `M${tl} L${tr} L${br} L${bl} Z`
  }

  function getStageColors(stage: FunnelStage) {
    const isHighlight = stage.highlight

    if (themeKey === 'outline') {
      return {
        fill: 'none',
        fillOpacity: 0,
        stroke: 'var(--foreground)',
        strokeWidth: 1,
        strokeOpacity: isHighlight ? 0.6 : 0.15,
        textFill: 'var(--foreground)',
        textOpacity: isHighlight ? 0.9 : 0.5,
      }
    }

    if (themeKey === 'minimal') {
      return {
        fill: 'none',
        fillOpacity: 0,
        stroke: isHighlight ? 'var(--accent)' : 'var(--border)',
        strokeWidth: 1.5,
        strokeOpacity: isHighlight ? 0.4 : 0.2,
        textFill: isHighlight ? 'var(--accent)' : 'var(--muted-foreground)',
        textOpacity: isHighlight ? 0.7 : 0.5,
      }
    }

    // accent & subtle
    if (isHighlight) {
      return {
        fill: 'var(--accent)',
        fillOpacity: 0.15,
        stroke: 'var(--accent)',
        strokeWidth: 1,
        strokeOpacity: 0.3,
        textFill: 'var(--accent)',
        textOpacity: 0.8,
      }
    }

    return {
      fill: themeKey === 'subtle' ? 'var(--foreground)' : 'none',
      fillOpacity: 0.04,
      stroke: 'var(--foreground)',
      strokeWidth: 1,
      strokeOpacity: 0.08,
      textFill: 'var(--muted-foreground)',
      textOpacity: 0.6,
    }
  }

  // Calculate vertical position as percentage for assumption cards
  function getStageVerticalPercent(index: number): number {
    const y = getStageY(index) + stageHeight / 2
    return (y / svgHeight) * 100
  }

  return (
    <figure className="my-10" ref={containerRef}>
      <div
        className={`relative w-full rounded-xl overflow-hidden border border-border/10 ${
          themeKey === 'subtle' ? 'bg-secondary/30' : 'bg-transparent'
        }`}
      >
        {/* Layout: assumption cards on sides, funnel in center */}
        <div className="relative flex items-start">
          {/* Left assumption cards */}
          <div className="relative w-1/4 flex-shrink-0" style={{ height: `${svgHeight}px` }}>
            {assumptionStages
              .filter((_, i) => i % 2 === 0)
              .map(({ stage, index }, cardIdx) => {
                const topPercent = getStageVerticalPercent(index)
                const animDelay = 0.15 + stages.length * 0.2 + 0.3 + cardIdx * 0.25
                return (
                  <motion.div
                    key={index}
                    className="absolute right-0 w-full pr-3"
                    style={{ top: `${topPercent}%`, transform: 'translateY(-50%)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ delay: animDelay, duration: 0.5, ease }}
                  >
                    <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-accent/50 font-semibold mb-1">
                        Assumption
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                        {stage.assumption}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
          </div>

          {/* Center funnel SVG */}
          <div className="flex-1 flex-shrink-0">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full"
              style={{ height: `${svgHeight}px` }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Title */}
              {title && (
                <motion.text
                  x={centerX}
                  y={30}
                  textAnchor="middle"
                  fill="var(--foreground)"
                  fontSize="18"
                  fontWeight="700"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {title}
                </motion.text>
              )}

              {/* Funnel stages */}
              {stages.map((stage, i) => {
                const y = getStageY(i)
                const path = getStagePath(i)
                const colors = getStageColors(stage)
                const baseDelay = 0.15 + i * 0.2

                return (
                  <g key={i}>
                    {/* Stroke draws in */}
                    <motion.path
                      d={path}
                      fill="none"
                      stroke={colors.stroke}
                      strokeWidth={colors.strokeWidth}
                      strokeOpacity={colors.strokeOpacity}
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                      transition={{ delay: baseDelay, duration: 0.6, ease }}
                    />

                    {/* Fill */}
                    <motion.path
                      d={path}
                      fill={colors.fill}
                      fillOpacity={colors.fillOpacity}
                      stroke="none"
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: baseDelay + 0.4, duration: 0.3, ease }}
                    />

                    {/* Label */}
                    <motion.text
                      x={centerX}
                      y={y + stageHeight / 2 + 5}
                      textAnchor="middle"
                      fill={colors.textFill}
                      fillOpacity={colors.textOpacity}
                      fontSize="13"
                      fontWeight={stage.highlight ? '700' : '500'}
                      fontFamily="system-ui, -apple-system, sans-serif"
                      initial={{ opacity: 0 }}
                      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: baseDelay + 0.5, duration: 0.3 }}
                    >
                      {stage.label}
                    </motion.text>

                    {/* Dashed connector lines to assumption cards */}
                    {stage.assumption && (() => {
                      const assumptionIdx = assumptionStages.findIndex(a => a.index === i)
                      const isLeft = assumptionIdx % 2 === 0
                      const stageWidth = getStageWidth(i)
                      const edgeX = isLeft
                        ? centerX - stageWidth / 2
                        : centerX + stageWidth / 2
                      const lineEndX = isLeft ? 0 : svgWidth
                      const midY = y + stageHeight / 2
                      const connectorDelay = 0.15 + stages.length * 0.2 + 0.15 + assumptionIdx * 0.25

                      return (
                        <motion.line
                          x1={edgeX}
                          y1={midY}
                          x2={lineEndX}
                          y2={midY}
                          stroke="var(--accent)"
                          strokeWidth="1"
                          strokeDasharray="3,3"
                          strokeOpacity={0.25}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                          transition={{ delay: connectorDelay, duration: 0.4, ease }}
                        />
                      )
                    })()}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Right assumption cards */}
          <div className="relative w-1/4 flex-shrink-0" style={{ height: `${svgHeight}px` }}>
            {assumptionStages
              .filter((_, i) => i % 2 === 1)
              .map(({ stage, index }, cardIdx) => {
                const topPercent = getStageVerticalPercent(index)
                const animDelay = 0.15 + stages.length * 0.2 + 0.3 + (cardIdx * 2 + 1) * 0.25
                return (
                  <motion.div
                    key={index}
                    className="absolute left-0 w-full pl-3"
                    style={{ top: `${topPercent}%`, transform: 'translateY(-50%)' }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: animDelay, duration: 0.5, ease }}
                  >
                    <div className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-accent/50 font-semibold mb-1">
                        Assumption
                      </p>
                      <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                        {stage.assumption}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
          </div>
        </div>

        {/* Theme toggle */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg border border-border/20 p-1">
          {(Object.keys(themeLabels) as ThemeKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setThemeKey(key)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                themeKey === key
                  ? 'bg-foreground/10 text-foreground font-medium'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {themeLabels[key]}
            </button>
          ))}
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
