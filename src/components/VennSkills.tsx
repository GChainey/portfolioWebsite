'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Zone = 'product' | 'design' | 'engineering'

interface VennSkill {
  name: string
  zones: Zone[]
}

const vennSkills: VennSkill[] = [
  // Product only
  { name: 'Shape Up', zones: ['product'] },
  { name: 'Jobs-to-be-Done', zones: ['product'] },
  { name: 'Continuous Discovery', zones: ['product'] },
  { name: 'Teresa Torres OST', zones: ['product'] },
  { name: 'HEART Framework', zones: ['product'] },
  { name: 'Customer Discovery', zones: ['product'] },
  { name: 'Hiring', zones: ['product'] },
  { name: 'Mentorship', zones: ['product'] },
  // Design only
  { name: 'UX Design', zones: ['design'] },
  { name: 'Interaction Design', zones: ['design'] },
  { name: 'Design Systems', zones: ['design'] },
  // Engineering only
  { name: 'Next.js', zones: ['engineering'] },
  { name: 'React', zones: ['engineering'] },
  { name: 'TypeScript', zones: ['engineering'] },
  { name: 'Tailwind CSS', zones: ['engineering'] },
  { name: 'Vercel', zones: ['engineering'] },
  { name: 'Git', zones: ['engineering'] },
  // Product + Design
  { name: 'Product Design', zones: ['product', 'design'] },
  { name: 'User Research', zones: ['product', 'design'] },
  { name: 'Rapid Experimentation', zones: ['product', 'design'] },
  // Product + Engineering
  { name: 'LLM API Integration', zones: ['product', 'engineering'] },
  // Design + Engineering
  { name: 'Framer Motion', zones: ['design', 'engineering'] },
  { name: 'Prototyping', zones: ['design', 'engineering'] },
  // All three
  { name: 'Claude', zones: ['product', 'design', 'engineering'] },
  { name: 'Claude Code', zones: ['product', 'design', 'engineering'] },
  { name: 'Cursor', zones: ['product', 'design', 'engineering'] },
  { name: 'Cross-functional Collaboration', zones: ['product', 'design', 'engineering'] },
]

const zoneOrder: Zone[] = ['product', 'design', 'engineering']

const zoneConfig: Record<Zone, { cx: number; cy: number; label: string; labelPos: { x: number; y: number }; color: string }> = {
  product: { cx: 200, cy: 190, label: 'Product', labelPos: { x: 125, y: 75 }, color: '#f59e0b' },
  design: { cx: 360, cy: 190, label: 'Design', labelPos: { x: 435, y: 75 }, color: '#a78bfa' },
  engineering: { cx: 280, cy: 310, label: 'Engineering', labelPos: { x: 280, y: 448 }, color: '#60a5fa' },
}

const RADIUS = 120

function zonesMatch(a: Zone[], b: Zone[]) {
  if (a.length !== b.length) return false
  return a.every((z, i) => z === b[i])
}

function getSkillStyle(skill: VennSkill, activeZones: Zone[] | null): React.CSSProperties | undefined {
  if (!activeZones) return undefined

  const colors = zoneOrder
    .filter(z => skill.zones.includes(z))
    .map(z => zoneConfig[z].color)

  if (colors.length === 1) {
    return { borderColor: `${colors[0]}50` }
  }

  // Gradient border using background-clip trick (works with border-radius)
  const mutedColors = colors.map(c => `${c}60`)
  return {
    borderColor: 'transparent',
    backgroundImage: `linear-gradient(var(--background), var(--background)), linear-gradient(135deg, ${mutedColors.join(', ')})`,
    backgroundOrigin: 'padding-box, border-box',
    backgroundClip: 'padding-box, border-box',
  }
}

export function VennSkills() {
  const [activeZones, setActiveZones] = useState<Zone[] | null>(null)
  const vennRef = useRef<HTMLDivElement>(null)
  const [vennHeight, setVennHeight] = useState<number>(0)

  useEffect(() => {
    const el = vennRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setVennHeight(entry.contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())

    const hit: Zone[] = []
    for (const zone of zoneOrder) {
      const config = zoneConfig[zone]
      const dx = pt.x - config.cx
      const dy = pt.y - config.cy
      if (dx * dx + dy * dy <= RADIUS * RADIUS) {
        hit.push(zone)
      }
    }

    if (hit.length === 0) {
      setActiveZones(null)
      return
    }

    // Toggle off if same selection
    if (activeZones && zonesMatch(activeZones, hit)) {
      setActiveZones(null)
    } else {
      setActiveZones(hit)
    }
  }

  const visibleSkills = activeZones
    ? vennSkills.filter(s => activeZones.every(z => s.zones.includes(z)))
    : vennSkills

  const activeCount = visibleSkills.length

  const title = activeZones
    ? activeZones.map(z => zoneConfig[z].label).join(' + ')
    : 'All Skills'

  const selectionKey = activeZones ? activeZones.join('+') : 'all'

  return (
    <div className="flex gap-6 items-start">
      {/* Venn diagram - 2/3 width */}
      <div className="flex-[2] min-w-0" ref={vennRef}>
        <svg
          viewBox="0 0 560 450"
          className="w-full cursor-pointer"
          role="img"
          aria-label="Venn diagram of Product, Design, and Engineering skills"
          onClick={handleSvgClick}
        >
          {zoneOrder.map((zone) => {
            const config = zoneConfig[zone]
            const isActive = activeZones?.includes(zone) ?? false
            const isInactive = activeZones !== null && !isActive
            return (
              <g key={zone}>
                <circle
                  cx={config.cx}
                  cy={config.cy}
                  r={RADIUS}
                  fill={config.color}
                  fillOpacity={isActive ? 0.2 : isInactive ? 0.03 : 0.07}
                  stroke={config.color}
                  strokeOpacity={isActive ? 0.8 : isInactive ? 0.12 : 0.25}
                  strokeWidth={isActive ? 2.5 : 1}
                  style={{ transition: 'all 0.4s ease' }}
                />
                <text
                  x={config.labelPos.x}
                  y={config.labelPos.y}
                  textAnchor="middle"
                  fill={isActive ? config.color : isInactive ? 'var(--border)' : 'var(--muted)'}
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.12em',
                    fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.4s ease',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                >
                  {config.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Skills column - 1/3 width, capped to Venn height */}
      <div className="flex-1 min-w-0 flex flex-col py-4" style={{ maxHeight: vennHeight || undefined }}>
        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.p
            key={selectionKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs uppercase tracking-widest mb-3 flex-shrink-0"
            style={{ color: !activeZones ? 'var(--muted)' : undefined }}
          >
            {activeZones
              ? activeZones.map((z, i) => (
                  <span key={z}>
                    {i > 0 && <span style={{ color: 'var(--muted)' }}> + </span>}
                    <span style={{ color: zoneConfig[z].color }}>{zoneConfig[z].label}</span>
                  </span>
                ))
              : 'All Skills'}
          </motion.p>
        </AnimatePresence>

        {/* Tags */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectionKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-1.5 content-start"
            >
              {visibleSkills.map((skill) => (
                <span
                  key={skill.name}
                  className={`px-2.5 py-1 text-xs border rounded w-fit ${
                    activeZones
                      ? 'text-foreground'
                      : 'border-border text-muted'
                  }`}
                  style={getSkillStyle(skill, activeZones)}
                >
                  {skill.name}
                </span>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {activeZones && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted mt-2 flex-shrink-0"
            >
              {activeCount} skills
              {' · '}
              <button
                onClick={() => setActiveZones(null)}
                className="hover:text-foreground transition-colors"
              >
                Show all
              </button>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
