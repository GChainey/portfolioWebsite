'use client'

import { Check } from 'lucide-react'
import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Bar, Text, Window } from './kit/window'
import { Row } from './kit/parts/Row'
import { Shader } from '@/components/showcase/ShaderWallWidgets'
import './shader-wall-presets.css'

// Shader Wall, as a Stageshow scene (after the skill's panel-annotation gold). The desktop is the
// product, so its wallpaper fills the frame; the app's Presets window is the tool, smaller, pinned
// left and running off the bottom over the desktop's edge. Designed at the tray card's size (520 wide). Beats: the cursor picks Forest Dusk and
// the desktop turns to it; then Set as wallpaper, which confirms on itself. Plays once in view;
// the still is the payoff, Forest Dusk set.
//
// Real strings: Presets, the three named presets, the button. The rest of the list is bars.

type Preset = 'mesh' | 'grain' | 'forest'
type S = { preset: Preset; set: boolean }

// Each preset's wallpaper, as a Shader Wall palette (components/showcase/ShaderWallWidgets)
const PRESETS: { id: Preset; name: string; palette: number }[] = [
  { id: 'mesh', name: 'Mesh Gradient', palette: 1 },
  { id: 'grain', name: 'Grain Gradient', palette: 3 },
  { id: 'forest', name: 'Forest Dusk', palette: 0 },
]

const initial: S = { preset: 'mesh', set: false }
const poster: S = { preset: 'forest', set: true }

async function script(a: Act<S>) {
  await a.wait(900)
  a.mark('pick')
  await a.click({ at: 'preset-forest', x: 0.4, y: 0.5 })
  a.put({ preset: 'forest' })
  await a.wait(1200)
  a.mark('set')
  await a.click({ at: 'set', x: 0.5, y: 0.5 })
  a.put({ set: true })
  await a.wait(2600)
}

// A preset's swatch: its palette as a small disc, the list's own imagery
function Swatch({ palette }: { palette: number }) {
  return <span className="swp-swatch" style={{ ['--swp-p' as string]: palette }}><Shader p={{ speed: 0.35, swirl: 0.5, grain: 0, hue: 0, palette }} /></span>
}

export function ShaderWallPresets({ className = '' }: { className?: string }) {
  return (
    <div className={`swp ${className}`} role="img" aria-label="Picking the Forest Dusk preset in Shader Wall turns the desktop to it, then Set as wallpaper">
      <Stage width={520} height={320} compact={{ below: 400, width: 358, height: 380 }} theme="dark" initial={initial} poster={poster} script={script} play="once" cursor={{ at: { wide: { x: 470, y: 280 }, compact: { x: 330, y: 350 } } }}>
        {(s) => (
          <>
            {/* The desktop: every preset's wallpaper mounted, the chosen one faded in over the rest */}
            <div className="swp-desktop" aria-hidden>
              {PRESETS.map((p) => (
                <div key={p.id} className="swp-wall" data-on={s.preset === p.id || undefined}>
                  <Shader p={{ speed: 0.35, swirl: 0.5, grain: 0.35, hue: 0, palette: p.palette }} />
                </div>
              ))}
            </div>

            <Window className="swp-win" lights="grey">
              <div className="swp-body">
                <Text className="swp-title">Presets</Text>
                <div className="swp-list">
                  {PRESETS.map((p) => (
                    <Row key={p.id} data-target={`preset-${p.id}`} data-cursor="pointer" selected={s.preset === p.id} pad={8} lead={<Swatch palette={p.palette} />} title={<Text>{p.name}</Text>} />
                  ))}
                  <Row pad={8} lead={<span className="swp-swatch swp-swatch--quiet" />} title={<Bar w={84} h={6} tone={3} />} />
                </div>
                <span className="swp-set" data-target="set" data-cursor="pointer" data-done={s.set || undefined}>
                  <span className="swp-set__idle">Set as wallpaper</span>
                  <span className="swp-set__done"><Check size={14} strokeWidth={2.5} />Wallpaper set</span>
                </span>
              </div>
            </Window>
          </>
        )}
      </Stage>
    </div>
  )
}
