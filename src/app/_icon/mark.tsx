// The site mark: GC in the "facet" style of the prototypes' app icons (admin-app-icons.js). Solid
// planes, no strokes, one 4.6 gap between planes, drawn in a 100-unit box. The G's bar and spur are
// their own plane, one gap off its bowl. Shared by icon.tsx (tab) and apple-icon.tsx (home screen).

const GAP = 4.6
const MARGIN = 14 // each side
const HEIGHT = 52
const STROKE = 11
const CORNER = 18
const BAR = 0.65 // how far the G's bar reaches into its counter

// A C on a rounded box, open on the right; `bottomEnd` lets the G stop its bottom arm short
function bowl(x0: number, y0: number, w: number, h: number, bottomEnd = x0 + w) {
  const x1 = x0 + w
  const y1 = y0 + h
  const r = CORNER
  const ri = CORNER - STROKE
  return [
    `M${x1} ${y0} L${x0 + r} ${y0} A${r} ${r} 0 0 0 ${x0} ${y0 + r} L${x0} ${y1 - r}`,
    `A${r} ${r} 0 0 0 ${x0 + r} ${y1} L${bottomEnd} ${y1} L${bottomEnd} ${y1 - STROKE} L${x0 + r} ${y1 - STROKE}`,
    `A${ri} ${ri} 0 0 1 ${x0 + STROKE} ${y1 - r} L${x0 + STROKE} ${y0 + r}`,
    `A${ri} ${ri} 0 0 1 ${x0 + r} ${y0 + STROKE} L${x1} ${y0 + STROKE}Z`,
  ].join(' ')
}

function gcPath() {
  const w = (100 - 2 * MARGIN - GAP) / 2
  const y0 = 50 - HEIGHT / 2
  const y1 = 50 + HEIGHT / 2
  const gx = MARGIN
  const cx = MARGIN + w + GAP
  const sx = gx + w // the G's right edge
  const ym = 50 - STROKE / 2
  const bx = sx - STROKE - (w - 2 * STROKE) * BAR
  const g = bowl(gx, y0, w, HEIGHT, sx - STROKE - GAP)
  const spur = `M${sx} ${ym} L${bx} ${ym} L${bx} ${ym + STROKE} L${sx - STROKE} ${ym + STROKE} L${sx - STROKE} ${y1} L${sx} ${y1}Z`
  return [g, spur, bowl(cx, y0, w, HEIGHT)].join(' ')
}

const D = gcPath()

export function Mark({ size, rounded }: { size: number; rounded: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" rx={rounded ? 22.5 : 0} fill="#d97706" />
      <path d={D} fill="#ffffff" />
    </svg>
  )
}
