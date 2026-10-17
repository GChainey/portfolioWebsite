import { SCREENS, mixed, type Screen } from '@/content/screens'

// The wall's layout, worked out once from the data so the drift and the dive can be pure
// arithmetic: no measuring the DOM while it moves. Plane units are CSS px before the plane's
// own scale and tilt.

export const CW = 280 // a column's width
export const GAP = 20 // between tiles and columns
export const COLS = 11 // odd, so one column sits on the plane's centre line
export const CENTER = Math.floor(COLS / 2)
export const RADIUS = 6
export const PLANE_H = 2400
export const TARGET_ID = 'rfp-caseload' // the screen the camera dives into: Daisy Assess, the RFP reel's opening frame

export interface WallTile { s: Screen; h: number; y: number }
export interface WallCol { x: number; tiles: WallTile[]; L: number; copies: number; dir: 1 | -1; speed: number; phase: number }
export interface Wall { cols: WallCol[]; width: number; target: WallTile }

// px a second, a little different for each column so the wall never moves as one sheet
const SPEEDS = [15, 21, 17, 24, 14, 22, 18, 25, 16, 20, 23]

const heightOf = (s: Screen) => Math.round((CW * s.h) / s.w)

export function buildWall(): Wall {
  const target = SCREENS.find((s) => s.id === TARGET_ID) ?? SCREENS[0]
  const rest = mixed(SCREENS.filter((s) => s.id !== target.id))
  const lists: Screen[][] = Array.from({ length: COLS }, () => [])
  const heights = new Array(COLS).fill(0)
  // Each screen goes to the shortest column, starting from a column that steps on by five, so
  // projects and shapes scatter instead of lining up
  rest.forEach((s, i) => {
    let best = (i * 5) % COLS
    for (let k = 0; k < COLS; k++) {
      const c = (best + k) % COLS
      if (heights[c] < heights[best] - 60) best = c
    }
    lists[best].push(s)
    heights[best] += heightOf(s) + GAP
  })
  // The poster sits in the middle of the centre column
  lists[CENTER].splice(Math.floor(lists[CENTER].length / 2), 0, target)

  const cols = lists.map((list, c) => {
    let y = 0
    const tiles = list.map((s) => {
      const h = heightOf(s)
      const t = { s, h, y }
      y += h + GAP
      return t
    })
    const L = y // one loop: every tile and its gap
    return {
      x: c * (CW + GAP),
      tiles,
      L,
      copies: Math.ceil(PLANE_H / L) + 1,
      dir: (c % 2 === 0 ? 1 : -1) as 1 | -1,
      speed: SPEEDS[c % SPEEDS.length],
      phase: ((c * 0.37) % 1) * L,
    }
  })
  const centre = cols[CENTER].tiles.find((t) => t.s.id === target.id)!
  return { cols, width: COLS * CW + (COLS - 1) * GAP, target: centre }
}
