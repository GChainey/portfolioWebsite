// Company wordmarks, drawn in the current text colour so they follow the theme.
// The files are single-colour SVGs in public/logos, used as a mask over a filled box.
const LOGOS = {
  spacex: { label: 'SpaceX', src: '/logos/spacex.svg', ratio: 400 / 50, height: 11 },
  seek: { label: 'SEEK', src: '/logos/seek.svg', ratio: 170 / 68, height: 26 },
  bestpractice: { label: 'Best Practice', src: '/logos/best-practice.svg', ratio: 299 / 68, height: 22 },
} as const

export type CompanyLogoId = keyof typeof LOGOS

// Each mark has its own height so the three sit at the same visual weight
export function CompanyLogo({ id, className = '' }: { id: CompanyLogoId; className?: string }) {
  const { label, src, ratio, height } = LOGOS[id]
  const mask = `url(${src}) center / contain no-repeat`

  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{ height, width: height * ratio, mask, WebkitMask: mask }}
    />
  )
}
