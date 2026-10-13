import type { CSSProperties } from 'react'

// Some recordings arrive with a frame of their own baked into the pixels. The site crops that
// off and draws every clip in one frame, so clips look the same wherever they were recorded
// and the frame can follow the site's theme.
//
// browser-window: the Daisy workspace's export, 1600x1000, the app inside a browser window on
// a grey backdrop. The crop keeps the app and drops the backdrop, shadow and title bar.
const CROPS = {
  'browser-window': { sourceWidth: 1600, sourceHeight: 1000, x: 72, y: 65, width: 1456, height: 908 },
} as const

export type ClipCrop = keyof typeof CROPS

// The box a cropped clip sits in, and where the video goes inside it so only the crop shows
export function clipGeometry(crop: ClipCrop): { aspectRatio: string; video: CSSProperties } {
  const c = CROPS[crop]
  return {
    aspectRatio: `${c.width} / ${c.height}`,
    video: {
      position: 'absolute',
      maxWidth: 'none',
      width: `${(c.sourceWidth / c.width) * 100}%`,
      left: `${(-c.x / c.width) * 100}%`,
      top: `${(-c.y / c.height) * 100}%`,
    },
  }
}

// Soft washes of the accent colour, bled into pink, sky and straw, over a tinted base. It
// follows the accent the visitor picked and reads in both themes.
const wash = (color: string, at: string, reach: string) => `radial-gradient(ellipse at ${at}, ${color}, transparent ${reach})`
const tint = (other: string, strength: number) =>
  `color-mix(in srgb, color-mix(in srgb, var(--accent), ${other}) ${strength}%, transparent)`

const BACKDROP = [
  wash('color-mix(in srgb, var(--accent) 60%, transparent)', '8% 0%', '55%'),
  wash(tint('#f472b6', 50), '100% 10%', '50%'),
  wash(tint('#38bdf8', 42), '85% 100%', '55%'),
  wash(tint('#fde68a', 48), '0% 100%', '50%'),
  'color-mix(in srgb, var(--accent) 28%, var(--background))',
].join(', ')

// A cropped clip the way a product site would show it: a padded backdrop, then a browser
// window with its address bar, then the app. The window is always light, like the apps in it.
export function ClipFrame({ src, crop, url }: { src: string; crop: ClipCrop; url?: string }) {
  const { aspectRatio, video } = clipGeometry(crop)

  return (
    <div className="rounded-2xl p-4 sm:p-8" style={{ background: BACKDROP }}>
      <div className="overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-center gap-3 h-8 sm:h-9 px-3 bg-[#f4f4f5] border-b border-[#e4e4e7]">
          <span className="flex shrink-0 gap-1.5" aria-hidden>
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="w-2.5 h-2.5 rounded-full bg-[#d4d4d8]" />
            ))}
          </span>
          {url && (
            <span className="mx-auto min-w-0 max-w-[60%] truncate rounded-md bg-white px-3 py-0.5 text-[11px] leading-4 text-[#71717a] ring-1 ring-[#e4e4e7]">
              {url}
            </span>
          )}
          {/* Balances the dots so the address stays centred */}
          <span className="w-[42px] shrink-0" aria-hidden />
        </div>
        <div className="relative w-full overflow-hidden" style={{ aspectRatio }}>
          <video src={src} autoPlay loop muted playsInline style={video} />
        </div>
      </div>
    </div>
  )
}
