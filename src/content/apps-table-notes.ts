import type { Note } from '@/components/MarkedUp'

// The Apps table, first and last (prototypes repo 5e04e01, 8 Sep, and 470858c, 13 Nov), and the red
// marker notes on each, placed in the screenshot's own 1200 × 900 pixels. Used by /draft/apps-table
// and /draft/details.

export const FRAME: [number, number] = [1200, 900]

export const FIRST: Note[] = [
  { text: 'True, but where do I go?', at: [330, 86], ring: { cx: 626, cy: 208, rx: 548, ry: 76 }, arrow: { from: [712, 110], to: [756, 136] } },
  { text: '“Live” shouts on every row', at: [372, 512], width: 240, align: 'right', ring: { cx: 675, cy: 556, rx: 44, ry: 178 } },
  { text: 'No money, no trend', at: [600, 742], ring: { cx: 879, cy: 532, rx: 150, ry: 200 } },
  { text: 'Six identical buttons', at: [880, 742], width: 300, align: 'right', ring: { cx: 1106, cy: 556, rx: 58, ry: 182 } },
]

export const LAST: Note[] = [
  { text: 'Status became tabs', at: [486, 150], ring: { cx: 253, cy: 168, rx: 190, ry: 34 }, arrow: { from: [480, 172], to: [448, 170] } },
  { text: 'Clients, money, trend', at: [760, 372], ring: { cx: 903, cy: 446, rx: 272, ry: 30 } },
  { text: 'No buttons: the row opens the app', at: [600, 826], width: 560, align: 'right', arrow: { from: [1172, 826], to: [1176, 768] } },
]
