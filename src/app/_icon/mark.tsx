// The site mark: a G in the "facet" style of the prototypes' app icons (admin-app-icons.js): a black
// mark on a grey card, solid planes, no strokes, one 4.6 gap between planes, drawn in a 100-unit box.
// The G is a ring with its right side cut away and a bar laid in, one gap clear of the ring below it.
// Shared by icon.tsx (tab) and apple-icon.tsx (home screen).

const GAP = 4.6
const R = 28.7 * 1.08 // the set's marks fill 21.3..78.7; a touch bigger so it holds in a tab
const STROKE = 12 * 1.08
const BAR = 12 * 1.08 // the bar's height, centred on the middle
const TOP = 50 - 15 * 1.08 // where the ring's top end is cut flat
const BAR_FROM = 50 + 2 * 1.08 // the bar's inner end, just past the centre

const INK = '#09090b'
const CARD = '#f4f4f5'

const f = (n: number) => n.toFixed(2)

function gPath() {
  const ri = R - STROKE
  const bottom = 50 + BAR / 2 + GAP // where the ring's lower end is cut flat
  const xAt = (r: number, y: number) => 50 + Math.sqrt(r * r - (y - 50) ** 2)
  // Ring: outer arc from the top cut round the left to the bottom cut, back along the inner arc
  const ring = [
    `M${f(xAt(R, TOP))} ${f(TOP)}`,
    `A${f(R)} ${f(R)} 0 1 0 ${f(xAt(R, bottom))} ${f(bottom)}`,
    `L${f(xAt(ri, bottom))} ${f(bottom)}`,
    `A${f(ri)} ${f(ri)} 0 1 1 ${f(xAt(ri, TOP))} ${f(TOP)}Z`,
  ].join(' ')
  const t = 50 - BAR / 2
  const bar = `M${f(BAR_FROM)} ${f(t)} L${f(50 + R)} ${f(t)} L${f(50 + R)} ${f(t + BAR)} L${f(BAR_FROM)} ${f(t + BAR)}Z`
  return `${ring} ${bar}`
}

const D = gPath()

export function Mark({ size, rounded }: { size: number; rounded: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="0.5" y="0.5" width="99" height="99" rx={rounded ? 16 : 0} fill={CARD} stroke={rounded ? 'rgba(9,9,11,0.08)' : 'none'} />
      <path d={D} fill={INK} />
    </svg>
  )
}
