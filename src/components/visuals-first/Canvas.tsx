'use client'

import { SCREENS } from '@/content/screens'
import { Bleed, useReducedMotion } from './shared'
import { Board } from './canvas/Board'
import { Presented } from './canvas/Slides'
import { WORLD } from './canvas/layout'

// D · Canvas: the work the way a designer keeps it. Every screen sits on one design canvas,
// a frame per project, with colleagues' words pinned to it as comments. It drifts until you
// take hold of it: drag, zoom, jump to a frame. Below it the three case studies are presented
// one frame at a time, then the products.

const CSS = `
.cv-viewport { --cv-bg: color-mix(in srgb, var(--foreground) 3%, var(--background)); background: var(--cv-bg); cursor: grab; touch-action: pan-y; -webkit-tap-highlight-color: transparent; }
.cv-viewport[data-dragging] { cursor: grabbing; }
.cv-viewport[data-dragging] .cv-board { pointer-events: none; }
.cv-viewport:focus-visible { box-shadow: inset 0 0 0 2px var(--accent); }
.cv-dots { left: 0; top: 0; right: -128px; bottom: -128px; background-image: radial-gradient(circle, color-mix(in srgb, var(--foreground) 16%, transparent) 1px, transparent 1.3px); }
.cv-layer { transform-origin: 0 0; --iz: 1; }
.cv-frame {
  border-radius: calc(4px * var(--iz));
  background: color-mix(in srgb, var(--c) 5%, color-mix(in srgb, var(--foreground) 3%, var(--cv-bg)));
  box-shadow: inset 0 0 0 calc(1px * var(--iz)) color-mix(in srgb, var(--c) 28%, transparent);
}
.cv-board { cursor: default; }
.cv-art { box-shadow: 0 0 0 calc(1px * var(--iz)) color-mix(in srgb, var(--foreground) 9%, transparent), 0 14px 36px -18px rgba(0,0,0,0.5); }
.cv-board:hover .cv-art { box-shadow: 0 0 0 calc(2px * var(--iz)) var(--c), 0 14px 36px -18px rgba(0,0,0,0.5); }
.cv-name {
  position: absolute; left: 0; bottom: 100%; max-width: 100%;
  margin-bottom: calc(5px * var(--iz)); font-size: calc(11px * var(--iz)); line-height: 1.25;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--muted);
  opacity: 0; transition: opacity 200ms ease; pointer-events: none;
}
.cv-layer[data-names="1"] .cv-name { opacity: 1; }
.cv-board:hover .cv-name { color: var(--foreground); }
.cv-panel {
  background: color-mix(in srgb, var(--background) 94%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 10%, transparent), 0 10px 30px -12px rgba(0,0,0,0.4);
  border-radius: 10px;
}
.cv-chip { display: flex; align-items: center; gap: 6px; flex-shrink: 0; height: 28px; padding: 0 10px; border-radius: 7px; font-size: 12px; white-space: nowrap; color: var(--muted); transition: background-color 150ms, color 150ms; }
.cv-chip:hover { color: var(--foreground); background: color-mix(in srgb, var(--foreground) 6%, transparent); }
.cv-chip.is-on { color: var(--foreground); background: color-mix(in srgb, var(--foreground) 10%, transparent); }
.cv-chip:focus-visible, .cv-icon:focus-visible, .cv-zoom:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.cv-scroll { scrollbar-width: none; }
.cv-scroll::-webkit-scrollbar { display: none; }
.cv-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 6px; color: var(--muted); transition: background-color 150ms, color 150ms; }
.cv-icon:hover, .cv-zoom:hover { color: var(--foreground); background: color-mix(in srgb, var(--foreground) 7%, transparent); }
.cv-zoom { height: 28px; padding: 0 8px; border-radius: 6px; font-size: 11px; color: var(--foreground); transition: background-color 150ms; }
`

export function CanvasHome() {
  const reduced = useReducedMotion()
  const projects = new Set(SCREENS.map((s) => s.project)).size
  const toCaseStudy = (id: string) => document.getElementById(`cv-${id}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })

  return (
    <>
      <style>{CSS}</style>

      {/* What this is, in a line, and what's on the canvas */}
      <div className="flex flex-col gap-1.5 border-b border-border px-8 py-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <p className="text-sm text-foreground text-pretty">
          I help scale-ups create high quality prototypes to win deals, <span className="text-muted">orchestrating AI tools to multiply output.</span>
        </p>
        <p className="shrink-0 font-mono text-xs text-muted tabular-nums">
          {SCREENS.length} screens · {projects} projects · {WORLD.pins.length} comments
        </p>
      </div>

      <Bleed label="Every screen, on one canvas" className="z-20 border-b border-border">
        {() => (
          <div className="h-[70svh] min-h-[460px] sm:h-[82vh] sm:min-h-[560px] max-h-[1000px]">
            <Board reduced={reduced} onCaseStudy={toCaseStudy} />
          </div>
        )}
      </Bleed>

      <Presented />
    </>
  )
}
