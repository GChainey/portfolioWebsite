// The site mark: the cube from the prototypes' facet app icons (admin-app-icons.js, "vendor-onboarding").
// Black on a grey card, three flat planes, one gap between them, in a 100-unit box.
// Shared by icon.tsx (tab) and apple-icon.tsx (home screen).

const CUBE =
  'M50 21.66 L72.25 34.50 L50 47.34 L27.75 34.50Z M74.55 64.17 L52.30 77.02 L52.30 51.33 L74.55 38.48Z M25.45 38.48 L47.70 51.33 L47.70 77.02 L25.45 64.17Z'

const INK = '#09090b'
const CARD = '#f4f4f5'

export function Mark({ size, rounded }: { size: number; rounded: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="0.5" y="0.5" width="99" height="99" rx={rounded ? 16 : 0} fill={CARD} stroke={rounded ? 'rgba(9,9,11,0.08)' : 'none'} />
      {/* A touch bigger than in the set, centred, so it holds in a tab */}
      <g transform="translate(50 50) scale(1.1) translate(-50 -49.34)">
        <path d={CUBE} fill={INK} />
      </g>
    </svg>
  )
}
