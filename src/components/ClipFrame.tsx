import type { CSSProperties } from 'react'

// Some recordings arrive with a frame of their own baked into the pixels. The site crops that
// off and draws every clip in one frame, so clips look the same wherever they were recorded.
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

// A cropped clip in the site's frame: rounded, hairline border, soft shadow, nothing else
export function ClipFrame({ src, crop }: { src: string; crop: ClipCrop }) {
  const { aspectRatio, video } = clipGeometry(crop)

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-background shadow-lg" style={{ aspectRatio }}>
      <video src={src} autoPlay loop muted playsInline style={video} />
    </div>
  )
}
