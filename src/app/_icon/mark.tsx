// The site mark: a G in the "facet" style of the prototypes' app icons (admin-app-icons.js). Solid
// planes, no strokes, one 4.6 gap between planes, drawn in a 100-unit box. The G's bar and spur are
// their own plane, one gap off its bowl. Shared by icon.tsx (tab) and apple-icon.tsx (home screen).

const GAP = 4.6
const SIZE = 58 // the G's box, centred
const STROKE = 13
const CORNER = 29 // half the box: the bowl's left side is a full round
const BAR = 0.25 // how far the bar reaches into the counter

function gPath() {
  const x0 = 50 - SIZE / 2
  const y0 = 50 - SIZE / 2
  const x1 = x0 + SIZE
  const y1 = y0 + SIZE
  const r = CORNER
  const ri = CORNER - STROKE
  const end = x1 - STROKE - GAP // the bottom arm stops one gap short of the spur
  const bowl = [
    `M${x1} ${y0} L${x0 + r} ${y0} A${r} ${r} 0 0 0 ${x0} ${y0 + r} L${x0} ${y1 - r}`,
    `A${r} ${r} 0 0 0 ${x0 + r} ${y1} L${end} ${y1} L${end} ${y1 - STROKE} L${x0 + r} ${y1 - STROKE}`,
    `A${ri} ${ri} 0 0 1 ${x0 + STROKE} ${y1 - r} L${x0 + STROKE} ${y0 + r}`,
    `A${ri} ${ri} 0 0 1 ${x0 + r} ${y0 + STROKE} L${x1} ${y0 + STROKE}Z`,
  ].join(' ')
  const ym = 50 - STROKE / 2
  const bx = x1 - STROKE - (SIZE - 2 * STROKE) * BAR
  const spur = `M${x1} ${ym} L${bx} ${ym} L${bx} ${ym + STROKE} L${x1 - STROKE} ${ym + STROKE} L${x1 - STROKE} ${y1} L${x1} ${y1}Z`
  return `${bowl} ${spur}`
}

const D = gPath()

export function Mark({ size, rounded }: { size: number; rounded: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx={rounded ? 22.5 : 0} fill="#d97706" />
      <path d={D} fill="#ffffff" />
    </svg>
  )
}
