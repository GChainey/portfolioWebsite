import { FACETS, type FacetId } from './facet-marks'

// One facet app icon: the tile, a hairline rim, the ink planes and any knock-outs in the tile
// colour. Colours come from --facet-tile and --facet-ink so a scene can restyle them.
export function FacetTile({ id, className, on }: { id: FacetId; className?: string; on?: boolean }) {
  const m = FACETS[id]
  return (
    <svg viewBox="0 0 100 100" className={className} data-on={on || undefined} aria-hidden>
      <rect width="100" height="100" rx="22" fill="var(--facet-tile, #f4f4f2)" />
      <rect x="0.5" y="0.5" width="99" height="99" rx="21.5" fill="none" stroke="rgb(9 9 11 / 0.08)" />
      {m.f.map((d, i) => <path key={i} d={d} fill="var(--facet-ink, #09090b)" />)}
      {m.h.map((d, i) => <path key={`h${i}`} d={d} fill="var(--facet-tile, #f4f4f2)" />)}
    </svg>
  )
}
