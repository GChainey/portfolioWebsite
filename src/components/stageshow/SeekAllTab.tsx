'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Phone } from './kit/phone'
import { Bar } from './kit/window'
import { Scroll } from './kit/motion/Scroll'
import './seek-all-tab.css'

// SEEK, assumption 1 (the All tab), as a Stageshow scene: only the solution. The courses module on a
// career page, on an iPhone (the kit's, with its own status bar and island), in SEEK's current look
// (recreations/seek/seek.css: Inter for SEEK Sans, ink, muted, the blue active tab).
//
// Story, ~12s loop: the first release shows one qualification per tab, and a tap on TAFE / VET
// swaps the whole list (the friction). Then the fix: an All tab grows in at the front, the others
// make room, it takes the underline, and the list becomes every qualification grouped under its
// heading; a short scroll shows them on one page. The note beside the phone names each version,
// and is the seen cause of the reset. Poster: the payoff, All selected, scrolled, the note on it.
//
// - A lone phone in the column: centred, pinned a gutter from the top, off the bottom. The note
//   names the version in the top-left corner, at the same gutter (wide only).
// - Real words only on the story: the tabs, the group headings, a provider on the first card of
//   each list, the note. Everything else is a bar. Cards are the first release's text-only cards:
//   the logos came later (assumption 2), so they stay out of this one.

type Sel = 'ug' | 'vet' | 'all'
type S = { all: boolean; sel: Sel }

const REST = { wide: { x: 590, y: 470 }, compact: { x: 250, y: 470 } }

const initial: S = { all: false, sel: 'ug' }
const poster: S = { all: true, sel: 'all' }

async function script(a: Act<S>) {
  await a.wait(1300)
  a.mark('tap')
  await a.click('tab-vet')
  a.set({ sel: 'vet' })
  await a.wait(1700)
  a.mark('fix')
  a.set({ all: true })
  await a.wait(550)
  a.set({ sel: 'all' })
  await a.wait(1500)
  a.mark('scroll')
  await a.scroll('list', 'grp-vet', { duration: 1100, offset: 12 })
  await a.wait(2400)
  a.mark('reset')
  await a.scroll('list', 0, { duration: 700 })
  await a.wait(250)
  a.set({ all: false, sel: 'ug' })
  await a.wait(700)
  // The finger lifts back to where it rested, so the loop's seam is still
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide)
  await a.wait(200)
}

// A first-release card: text only, the provider's name on top (real on the first card only)
function Card({ name, w }: { name?: string; w: number[] }) {
  return (
    <div className="sat-card">
      {name ? <div className="sat-card__title">{name}</div> : <Bar w={w[0]} h={9} r={4} tone={3} className="sat-card__bar" />}
      <Bar w={w[1]} h={7} r={3} tone={2} className="sat-card__sub" />
      <div className="sat-card__facts">
        <Bar w={w[2]} h={7} r={3} tone={2} />
        <Bar w={w[3]} h={7} r={3} tone={2} />
        <Bar w={w[4]} h={7} r={3} tone={2} />
      </div>
    </div>
  )
}

// One heading over a row of cards that runs off the screen's edge
function Group({ title, under = false, first, widths, target }: { title?: string; under?: boolean; first?: string; widths: number[][]; target?: string }) {
  return (
    <section className="sat-group" data-target={target}>
      {title ? <div className={`sat-group__title${under ? ' sat-group__title--under' : ''}`}>{title}</div> : <Bar w={190} h={11} r={5} tone={3} className="sat-group__bar" />}
      <div className="sat-rail">
        <Card name={first} w={widths[0]} />
        <Card w={widths[1]} />
      </div>
    </section>
  )
}

const W1 = [[0, 132, 112, 168, 120], [118, 150, 104, 156, 128]]
const W2 = [[0, 118, 120, 150, 112], [126, 140, 96, 160, 118]]
const W3 = [[0, 140, 108, 162, 124], [110, 128, 116, 146, 104]]

const TABS: { id: string; label: string }[] = [
  { id: 'tab-ug', label: 'Undergraduate' },
  { id: 'tab-vet', label: 'TAFE / VET' },
  { id: 'tab-boot', label: 'Bootcamps' },
]

function Screen({ s }: { s: S }) {
  return (
    <div className="sat-screen">
      <header className="sat-bar">
        <span className="sat-wordmark">seek</span>
        <span className="sat-bar__end">
          <Bar w={46} h={8} r={4} tone={2} />
          <span className="sat-menu"><i /><i /><i /></span>
        </span>
      </header>
      <div className="sat-module">
        <div className="sat-title">Software developer courses</div>
        <nav className="sat-tabs" data-target="tabs">
          <span className="sat-all" data-in={s.all || undefined}>
            <span className="sat-tab" data-on={s.sel === 'all' || undefined} data-target="tab-all">All</span>
          </span>
          {TABS.map((t, i) => {
            const on = (t.id === 'tab-ug' && s.sel === 'ug') || (t.id === 'tab-vet' && s.sel === 'vet')
            return (
              <span key={t.id} className="sat-tab" data-on={on || undefined} data-target={t.id} data-cursor={i === 1 ? 'pointer' : undefined}>{t.label}</span>
            )
          })}
          {/* More qualifications run on past the screen: a placeholder, never a word cut by the edge */}
          <span className="sat-tab sat-tab--more"><Bar w={64} h={8} r={4} tone={2} /></span>
        </nav>
      </div>
      <Scroll name="list" bar="none" className="sat-scroller">
        <div className="sat-stack">
          <div className="sat-layer" data-show={s.sel === 'ug' || undefined}>
            <Group title="Bachelor of Information Technology" first="Monash University" widths={W1} />
            <Group widths={W2} />
          </div>
          <div className="sat-layer" data-show={s.sel === 'vet' || undefined}>
            <Group title="Diploma of Information Technology" first="Upskilled" widths={W2} />
            <Group widths={W3} />
          </div>
          <div className="sat-layer" data-show={s.sel === 'all' || undefined}>
            <Group title="Undergraduate" under first="Monash University" widths={W1} />
            <Group title="TAFE / VET" under first="Upskilled" widths={W2} target="grp-vet" />
            <Group title="Bootcamps" under first="Le Wagon" widths={W3} />
            <Group widths={W1} />
            <Group widths={W2} />
          </div>
        </div>
      </Scroll>
    </div>
  )
}

// The note in the top-left corner: which version this is, and what it means. Both are always
// mounted, stacked in one cell, and crossfade, so neither jumps nor vanishes
function Note({ s }: { s: S }) {
  return (
    <div className="sat-note">
      <span className="sat-note__text" data-show={!s.all || undefined}><b>The first release</b><span>One qualification at a time</span></span>
      <span className="sat-note__text" data-show={s.all || undefined}><b>After the fix</b><span>Every qualification on one scroll</span></span>
    </div>
  )
}

export function SeekAllTab({ bare = false }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose sat--bare' : 'my-8 not-prose'} role="img" aria-label="SEEK's courses module: the first release shows one qualification per tab; the fix adds an All tab, so every qualification is grouped on one scroll">
      <Stage
        width={720}
        height={520}
        compact={{ below: 600, width: 358, height: 520 }}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        fill={!bare}
        cursor={{ at: REST, style: 'touch' }}
        className="sat"
      >
        {(s, _rect, layout) => {
          const wide = layout !== 'compact'
          return (
            <>
              <div className="sat-phone" data-layout={layout}>
                <Phone width={wide ? 340 : 310} frame="pro">
                  <Screen s={s} />
                </Phone>
              </div>
              <Note s={s} />
            </>
          )
        }}
      </Stage>
    </figure>
  )
}
