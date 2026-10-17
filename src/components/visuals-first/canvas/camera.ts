// The camera: screen = world * z + (x, y).
export interface Cam { x: number; y: number; z: number }
export interface Rect { x: number; y: number; w: number; h: number }
export interface Insets { top: number; right: number; bottom: number; left: number }

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

// The camera that shows `r` inside the viewport, less its insets
export function camFor(r: Rect, vw: number, vh: number, inset: Insets, maxZ = 2): Cam {
  const aw = Math.max(40, vw - inset.left - inset.right)
  const ah = Math.max(40, vh - inset.top - inset.bottom)
  const z = Math.min(aw / r.w, ah / r.h, maxZ)
  return {
    z,
    x: inset.left + (aw - r.w * z) / 2 - r.x * z,
    y: inset.top + (ah - r.h * z) / 2 - r.y * z,
  }
}

// Zoom by `k` about a point on screen, keeping the world under it still
export function zoomAbout(c: Cam, k: number, sx: number, sy: number, minZ: number, maxZ: number): Cam {
  const z = clamp(c.z * k, minZ, maxZ)
  const f = z / c.z
  return { z, x: sx - (sx - c.x) * f, y: sy - (sy - c.y) * f }
}

// Smooth zoom and pan (van Wijk and Nuij): pulls back while it travels, then settles in, the way
// a map flies between places. Returns the path and how long it should take.
export function flight(a: Cam, b: Cam, vw: number, vh: number) {
  const view = (c: Cam) => [(vw / 2 - c.x) / c.z, (vh / 2 - c.y) / c.z, vw / c.z] as const
  const [ux0, uy0, w0] = view(a)
  const [ux1, uy1, w1] = view(b)
  const rho = Math.SQRT2
  const dx = ux1 - ux0
  const dy = uy1 - uy0
  const d2 = dx * dx + dy * dy
  let S: number
  let at: (t: number) => [number, number, number]
  if (d2 < 1e-6) {
    S = Math.log(w1 / w0) / rho
    at = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)]
  } else {
    const d1 = Math.sqrt(d2)
    const b0 = (w1 * w1 - w0 * w0 + 4 * d2) / (2 * w0 * 2 * d1)
    const b1 = (w1 * w1 - w0 * w0 - 4 * d2) / (2 * w1 * 2 * d1)
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0)
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1)
    S = (r1 - r0) / rho
    const c0 = Math.cosh(r0)
    at = (t) => {
      const s = t * S
      const u = (w0 / (2 * d1)) * (c0 * Math.tanh(rho * s + r0) - Math.sinh(r0))
      return [ux0 + u * dx, uy0 + u * dy, (w0 * c0) / Math.cosh(rho * s + r0)]
    }
  }
  const path = (t: number): Cam => {
    if (t >= 1) return b
    const [cx, cy, w] = at(t)
    const z = vw / w
    return { z, x: vw / 2 - cx * z, y: vh / 2 - cy * z }
  }
  const ms = clamp(Math.abs(S) * 900, 380, 1300)
  return { path, ms: Number.isFinite(ms) ? ms : 600 }
}
