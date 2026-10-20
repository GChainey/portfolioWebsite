// Colour maths for the Interaction of Color exercises. Distances are in OKLab, which is close
// enough to how far apart two colours look that one number can stand for "how wrong was I".

export type RGB = [number, number, number]

export function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function rgbToHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

export const isHex = (s: unknown): s is string => typeof s === 'string' && /^#[0-9a-f]{6}$/i.test(s)

// h 0–360, s and v 0–1
export function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255
  }
  return rgbToHex([f(5), f(3), f(1)])
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255)
  const v = Math.max(r, g, b)
  const d = v - Math.min(r, g, b)
  const h = d === 0 ? 0 : v === r ? ((g - b) / d + 6) % 6 : v === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: h * 60, s: v === 0 ? 0 : d / v, v }
}

const toLinear = (c: number) => {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const fromLinear = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

export function hexToOklab(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map(toLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToRgb(L: number, a: number, b: number): RGB | null {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  if (rgb.some((c) => c < -0.0001 || c > 1.0001)) return null
  return rgb.map((c) => fromLinear(Math.min(1, Math.max(0, c)))) as RGB
}

// Lightness 0–1, chroma ~0–0.37, hue in degrees. Out-of-gamut colours lose chroma until they fit.
export function oklchToHex(L: number, C: number, h: number): string {
  const rad = (h * Math.PI) / 180
  for (let c = C; c >= 0; c -= 0.005) {
    const rgb = oklabToRgb(L, c * Math.cos(rad), c * Math.sin(rad))
    if (rgb) return rgbToHex(rgb)
  }
  return rgbToHex(oklabToRgb(L, 0, 0) ?? [0, 0, 0])
}

// 0 is identical. Around 2 is the smallest difference most people can see side by side.
export function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = hexToOklab(a)
  const [l2, a2, b2] = hexToOklab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2) * 100
}

export function describeMiss(d: number): string {
  if (d < 2) return 'You can\'t tell them apart side by side'
  if (d < 5) return 'Close enough that you\'d only see it side by side'
  if (d < 10) return 'A different shade'
  if (d < 20) return 'The same family, but a different colour'
  return 'A different colour'
}

// About 30 everyday colour names, as Albers counts them. Each colour gets the nearest one.
const NAMES: [string, string][] = [
  ['red', '#d7261e'], ['crimson', '#b0103a'], ['maroon', '#7a1a1f'], ['pink', '#f4a6b8'],
  ['rose', '#e0577a'], ['magenta', '#c8248f'], ['purple', '#6e2a8e'], ['violet', '#8c6bd6'],
  ['lavender', '#c4b3e6'], ['navy', '#1d2a5c'], ['blue', '#2457c5'], ['sky blue', '#7fc2ea'],
  ['turquoise', '#2bbfb3'], ['teal', '#14706e'], ['green', '#2f9a3a'], ['olive', '#6f6f24'],
  ['lime', '#9ccc2e'], ['mint', '#a8e3c2'], ['yellow', '#f5d327'], ['gold', '#d4a017'],
  ['beige', '#e4d5b4'], ['orange', '#f07a1a'], ['coral', '#f0705a'], ['salmon', '#f19a85'],
  ['peach', '#f7c39b'], ['brown', '#7a4a26'], ['tan', '#c19a6b'], ['white', '#f7f7f5'],
  ['grey', '#8a8a8a'], ['black', '#161616'],
]
export const NAME_COUNT = NAMES.length

export function nameOf(hex: string): string {
  let best = NAMES[0]
  let bestD = Infinity
  for (const n of NAMES) {
    const d = deltaE(hex, n[1])
    if (d < bestD) {
      bestD = d
      best = n
    }
  }
  return best[0]
}

// Text that stays readable on top of a swatch
export const inkOn = (hex: string) => (hexToOklab(hex)[0] > 0.68 ? '#111' : '#fff')
