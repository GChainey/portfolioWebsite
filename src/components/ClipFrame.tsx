import type { CSSProperties, ReactNode } from 'react'
import type { MediaBlock } from '@/content/projects'

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

// The backdrop on its own, for something that needs no window: a phone, a device mock-up
export function Backdrop({ className = '', style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ ...style, background: BACKDROP }}>
      {children}
    </div>
  )
}

// How a product site would show it: a padded backdrop, then a window, then the picture or clip.
// A screen recording gets a browser bar with its address; a still or an embed gets the window
// alone. The window is always light, like the apps in it.
export function MediaFrame({ bar, url, children }: { bar?: boolean; url?: string; children: ReactNode }) {
  return (
    <Backdrop className="p-4 sm:p-8">
      <div className="overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/10">
        {bar && (
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
        )}
        {children}
      </div>
    </Backdrop>
  )
}

// The dotted canvas the live demos sit on, for a picture or clip that is dark and has a look of
// its own, which the colour washes would fight with
export function GridFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-xl border border-border p-3 sm:p-6"
      style={{
        backgroundColor: 'var(--card)',
        backgroundImage: 'radial-gradient(color-mix(in srgb, var(--foreground) 14%, transparent) 1px, transparent 1px)',
        backgroundSize: '16px 16px',
      }}
    >
      <div className="overflow-hidden rounded-lg border border-border bg-background shadow-xl">{children}</div>
    </div>
  )
}

// A cropped clip in the frame, keeping the shape of its crop
export function ClipFrame({ src, crop, url }: { src: string; crop: ClipCrop; url?: string }) {
  const { aspectRatio, video } = clipGeometry(crop)

  return (
    <MediaFrame bar url={url}>
      <div className="relative w-full overflow-hidden" style={{ aspectRatio }}>
        <video src={src} autoPlay loop muted playsInline style={video} />
      </div>
    </MediaFrame>
  )
}

// Every picture and clip in a case study or essay, in the one frame
export function FramedMedia({ block }: { block: MediaBlock }) {
  const aspectRatio = block.aspectRatio || '16/9'
  const fill = 'block w-full h-full object-cover'

  if (block.type === 'video' && block.crop) {
    return <ClipFrame src={block.src} crop={block.crop} url={block.url} />
  }

  // A portrait screen recording: the phone stands on the backdrop, with no window around it
  if (block.type === 'video' && block.frame === 'phone') {
    return (
      <Backdrop className="flex items-center justify-center" style={{ aspectRatio }}>
        <video src={block.src} autoPlay loop muted playsInline className="h-[88%] w-auto rounded-[14.6%/7.1%] shadow-2xl" />
      </Backdrop>
    )
  }

  // A device mock-up on a transparent background stands on the backdrop the same way
  if (block.type === 'image' && block.frame === 'device') {
    return (
      <Backdrop className="overflow-hidden" style={{ aspectRatio }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={block.src} alt={block.alt || ''} className={fill} />
      </Backdrop>
    )
  }

  return (
    <MediaFrame bar={block.type === 'video'} url={block.url}>
      <div className="relative w-full" style={{ aspectRatio }}>
        {block.type === 'video' ? (
          <video src={block.src} autoPlay loop muted playsInline className={fill} />
        ) : block.type === 'embed' ? (
          <iframe
            src={block.src}
            className="block w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.src} alt={block.alt || ''} className={fill} />
        )}
      </div>
    </MediaFrame>
  )
}
