'use client'

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

// Tints of the accent colour. Tailwind's /opacity modifiers don't apply to our CSS-variable colours.
const accentTint = (percent: number) => `color-mix(in srgb, var(--accent) ${percent}%, transparent)`

export function FunnelDiagram({
  title = 'MVP release',
  stages = defaultStages,
  caption,
}: FunnelDiagramProps) {
  // Collect stages that have assumptions, alternating sides
  const assumptionStages = stages
    .map((stage, i) => ({ stage, index: i }))
    .filter(({ stage }) => stage.assumption)

  // SVG dimensions. The SVG renders 1:1, so these are also pixels.
  const svgWidth = 400
  const funnelTopWidth = 280
  const funnelBottomWidth = 100
  const funnelStartY = 50
  const stageHeight = 72
  const stageGap = 4
  const svgHeight = funnelStartY + stages.length * (stageHeight + stageGap) - stageGap + 28
  const centerX = svgWidth / 2

  // Assumption cards sit this far from their stage, joined by a dashed connector
  const connectorLength = 28
  // Space kept between a card and the diagram's border
  const edgePadding = 20

  function getStageWidth(index: number): number {
    const progress = index / (stages.length - 1)
    return funnelTopWidth - progress * (funnelTopWidth - funnelBottomWidth)
  }

  function getStageBottomWidth(index: number): number {
    return index === stages.length - 1 ? getStageWidth(index) * 0.7 : getStageWidth(index + 1)
  }

  function getStageY(index: number): number {
    return funnelStartY + index * (stageHeight + stageGap)
  }

  function getStagePath(i: number): string {
    const topWidth = getStageWidth(i)
    const bottomWidth = getStageBottomWidth(i)
    const y = getStageY(i)

    const tl = `${centerX - topWidth / 2},${y}`
    const tr = `${centerX + topWidth / 2},${y}`
    const br = `${centerX + bottomWidth / 2},${y + stageHeight}`
    const bl = `${centerX - bottomWidth / 2},${y + stageHeight}`

    return `M${tl} L${tr} L${br} L${bl} Z`
  }

  // Distance from the funnel's centre line to a stage's edge, halfway down the stage
  function getStageHalfWidth(index: number): number {
    return (getStageWidth(index) + getStageBottomWidth(index)) / 4
  }

  function getStageColors(stage: FunnelStage) {
    if (stage.highlight) {
      return {
        fill: 'var(--accent)',
        fillOpacity: 0.15,
        stroke: 'var(--accent)',
        strokeOpacity: 0.3,
        textFill: 'var(--accent)',
        textOpacity: 0.8,
      }
    }

    return {
      fill: 'none',
      fillOpacity: 0.04,
      stroke: 'var(--foreground)',
      strokeOpacity: 0.08,
      textFill: 'var(--muted-foreground)',
      textOpacity: 0.6,
    }
  }

  const assumptionCard = (assumption: string) => (
    <div
      className="rounded-lg border px-3 py-2.5"
      style={{ borderColor: accentTint(30), backgroundColor: accentTint(8) }}
    >
      <p className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-1">Assumption</p>
      <p className="text-xs text-foreground leading-relaxed font-medium">{assumption}</p>
    </div>
  )

  return (
    <figure className="my-10">
      <div className="relative w-full rounded-xl overflow-hidden border border-border">
        <div className="relative" style={{ height: `${svgHeight}px` }}>
          {/* Funnel, centred */}
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="absolute left-1/2 top-0 -translate-x-1/2 max-w-full"
            style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
            xmlns="http://www.w3.org/2000/svg"
          >
            {title && (
              <text
                x={centerX}
                y={30}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize="18"
                fontWeight="700"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {title}
              </text>
            )}

            {stages.map((stage, i) => {
              const y = getStageY(i)
              const path = getStagePath(i)
              const colors = getStageColors(stage)

              return (
                <g key={i}>
                  <path
                    d={path}
                    fill={colors.fill}
                    fillOpacity={colors.fillOpacity}
                    stroke={colors.stroke}
                    strokeWidth={1}
                    strokeOpacity={colors.strokeOpacity}
                    strokeLinejoin="round"
                  />
                  <text
                    x={centerX}
                    y={y + stageHeight / 2 + 5}
                    textAnchor="middle"
                    fill={colors.textFill}
                    fillOpacity={colors.textOpacity}
                    fontSize="13"
                    fontWeight={stage.highlight ? '700' : '500'}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {stage.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Assumption cards beside their stage, alternating sides (wider screens) */}
          {assumptionStages.map(({ stage, index }, assumptionIdx) => {
            const isLeft = assumptionIdx % 2 === 0
            const side = isLeft ? 'right' : 'left'
            const halfWidth = getStageHalfWidth(index)
            const midY = getStageY(index) + stageHeight / 2

            return (
              <div key={index} className="hidden sm:block">
                {/* Dashed connector from the stage's edge to the card */}
                <div
                  className="absolute border-t border-dashed"
                  style={{
                    top: `${midY}px`,
                    [side]: `calc(50% + ${halfWidth}px)`,
                    width: `${connectorLength}px`,
                    borderColor: accentTint(45),
                  }}
                />
                <div
                  className="absolute -translate-y-1/2"
                  style={{
                    top: `${midY}px`,
                    [side]: `calc(50% + ${halfWidth + connectorLength}px)`,
                    maxWidth: `min(220px, calc(50% - ${halfWidth + connectorLength + edgePadding}px))`,
                  }}
                >
                  {assumptionCard(stage.assumption!)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Narrow screens: no room beside the funnel, so the assumptions follow it */}
        {assumptionStages.length > 0 && (
          <div className="sm:hidden grid gap-2 px-4 pb-4">
            {assumptionStages.map(({ stage, index }) => (
              <div key={index}>{assumptionCard(stage.assumption!)}</div>
            ))}
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
