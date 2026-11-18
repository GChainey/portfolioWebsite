'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Phone } from './kit/phone'
import { Bar } from './kit/window'
import './seek-all-tab.css'
import './seek-cards.css'

// SEEK, assumption 2 ("Missing design details"), as a Stageshow scene beside SeekAllTab: the same
// phone, frame, note and loop. The courses module with the All tab (assumption 1 already shipped),
// its cards as the first release drew them: text only, the provider's name on the line where the
// course should be. The fix: each card gains the provider's logo, the course name takes the top
// line and the provider slides down under it. No cursor: nothing is tapped, the cards change.
//
// Story, ~10s loop: before (held long enough to see every card reads the same) → the fix, card by
// card → hold → the note switches back to "Before the fix", the seen cause of the reset.
// Poster: after the fix.
//
// Real words on the card in view (provider, course) and the note; the cards cut by the screen's
// edge and the second row carry only their logos (the story) and bars.

type S = { fixed: boolean }
const initial: S = { fixed: false }
const poster: S = { fixed: true }

async function script(a: Act<S>) {
  await a.wait(2600)
  a.mark('fix')
  await a.set({ fixed: true })
  await a.wait(4800)
  a.mark('reset')
  await a.set({ fixed: false })
  await a.wait(2600)
}

type Logo = { src: string; fill?: boolean }
const L = (f: string, fill = false): Logo => ({ src: `/stageshow/seek/logos/${f}`, fill })

// A card that changes: the logo row opens above, the course name rises into the top line, and the
// provider's name moves down from it to the line under (two copies crossfading on one path, bold
// above and regular below, so no weight is ever animated). The first release's second line fades.
function Card({ logo, course, provider, oldSub, w, fixed }: { logo: Logo; course?: string; provider?: string; oldSub?: string; w: number[]; fixed: boolean }) {
  return (
    <div className="scd-card" data-fixed={fixed || undefined}>
      <div className="scd-logo-wrap">
        <div className="scd-logo-in">
          <span className={`scd-logo${logo.fill ? ' scd-logo--fill' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt="" />
          </span>
        </div>
      </div>
      <div className="scd-lines">
        <span className="scd-course">{course ?? <Bar w={w[0]} h={9} r={4} tone={3} />}</span>
        <span className="scd-prov scd-prov--top">{provider ?? <Bar w={w[1]} h={8} r={4} tone={3} />}</span>
        <span className="scd-prov scd-prov--sub">{provider ?? <Bar w={w[1]} h={8} r={4} tone={2} />}</span>
        <span className="scd-oldsub">{oldSub ?? <Bar w={w[2]} h={7} r={3} tone={2} />}</span>
      </div>
      <div className="sat-card__facts scd-facts">
        <Bar w={w[3]} h={7} r={3} tone={2} />
        <Bar w={w[4]} h={7} r={3} tone={2} />
        <Bar w={w[5]} h={7} r={3} tone={2} />
      </div>
    </div>
  )
}

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
        <nav className="sat-tabs">
          <span className="sat-tab" data-on>All</span>
          <span className="sat-tab">Undergraduate</span>
          <span className="sat-tab">TAFE / VET</span>
          <span className="sat-tab sat-tab--more"><Bar w={64} h={8} r={4} tone={2} /></span>
        </nav>
      </div>
      <div className="scd-list">
        <section className="sat-group">
          <div className="sat-group__title sat-group__title--under">Undergraduate</div>
          <div className="sat-rail scd-rail">
            <Card fixed={s.fixed} logo={L('monarch.svg', true)} course="Bachelor of Computer Science" provider="Monarch Institute" oldSub="Monarch Institute Online" w={[0, 0, 0, 112, 168, 120]} />
            {/* Cut by the screen's edge: its logo is the story, its words are filler */}
            <Card fixed={s.fixed} logo={L('swinburne.svg', true)} w={[150, 118, 132, 104, 156, 128]} />
          </div>
        </section>
        <section className="sat-group">
          <div className="sat-group__title sat-group__title--under">TAFE / VET</div>
          <div className="sat-rail scd-rail">
            <Card fixed={s.fixed} logo={L('upskilled.svg')} w={[150, 112, 128, 120, 150, 112]} />
            <Card fixed={s.fixed} logo={L('torrens.png')} w={[136, 120, 110, 96, 160, 118]} />
          </div>
        </section>
      </div>
    </div>
  )
}

function Note({ s }: { s: S }) {
  return (
    <div className="sat-note">
      <span className="sat-note__text" data-show={!s.fixed || undefined}><b>Before the fix</b><span>Text only, the provider where the course goes</span></span>
      <span className="sat-note__text" data-show={s.fixed || undefined}><b>After the fix</b><span>The logo, then the course name</span></span>
    </div>
  )
}

export function SeekCards({ bare = false }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose sat--bare' : 'my-8 not-prose'} role="img" aria-label="SEEK's course cards: before the fix they were text only, with the provider's name where the course name should be; after it, each card leads with the provider's logo and the course name, with the provider under it">
      <Stage
        width={720}
        height={520}
        compact={{ below: 600, width: 358, height: 520 }}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        fill={!bare}
        className="sat scd"
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
