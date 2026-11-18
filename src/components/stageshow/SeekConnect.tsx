'use client'

import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Phone } from './kit/phone'
import { Bar } from './kit/window'
import './seek-all-tab.css'
import './seek-connect.css'

// SEEK, assumption 3 ("Too long to make a connection"), as a Stageshow scene beside SeekAllTab and
// SeekCards: the same phone, note and look. The phone is whole here (smaller, on a taller stage),
// because what opens has to stay in: a page's buttons and a sheet both live at the screen's foot.
//
// Story, ~15s loop: before the fix, a tap on a course pushes to its own page, and Enquire pushes
// again to a form page: two pages away from the list. The note switches to "After the fix" and the
// pages pop back to the list (the seen cause). The same tap now opens a sheet over the same page
// (it dims behind, the status bar too, as iOS does), a short summary with Enquire and Visit
// website; Enquire turns the sheet into the form in place. The payoff holds; then the sheet drops,
// the note switches back, and the loop starts where it began. Poster: the sheet with the form.
//
// Real words: the course and provider, the buttons, the form's title and first label, the note.

type Page = 'list' | 'course' | 'form'
type Sheet = 'none' | 'summary' | 'form'
type S = { fixed: boolean; page: Page; sheet: Sheet }

const initial: S = { fixed: false, page: 'list', sheet: 'none' }
const poster: S = { fixed: true, page: 'list', sheet: 'form' }
const REST = { wide: { x: 470, y: 600 }, compact: { x: 250, y: 560 } }
const ORDER: Page[] = ['list', 'course', 'form']

async function script(a: Act<S>) {
  await a.wait(1200)
  a.mark('tap')
  await a.click('card-1')
  await a.set({ page: 'course' })
  await a.wait(1300)
  await a.click('enquire-page')
  await a.set({ page: 'form' })
  await a.wait(1500)
  a.mark('fix')
  await a.set({ fixed: true, page: 'list' })
  await a.wait(1100)
  await a.click('card-1')
  await a.set({ sheet: 'summary' })
  await a.wait(1500)
  a.mark('enquire')
  await a.click('enquire-sheet')
  await a.set({ sheet: 'form' })
  await a.wait(2800)
  a.mark('reset')
  await a.set({ sheet: 'none', fixed: false })
  await a.wait(700)
  await a.move(a.layout === 'compact' ? REST.compact : REST.wide)
  await a.wait(300)
}

const MONARCH = '/stageshow/seek/logos/monarch.svg'

function Logo({ src, size, fill = true }: { src: string; size: number; fill?: boolean }) {
  return (
    <span className={`scn-logo${fill ? ' scn-logo--fill' : ''}`} style={{ width: size, height: size, borderRadius: size / 5 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" />
    </span>
  )
}

function Header() {
  return (
    <header className="sat-bar">
      <span className="sat-wordmark">seek</span>
      <span className="sat-bar__end">
        <Bar w={46} h={8} r={4} tone={2} />
        <span className="sat-menu"><i /><i /><i /></span>
      </span>
    </header>
  )
}

// A card as it is after assumption 2 shipped: logo, course name, provider, facts
function Card({ logo, course, provider, w, target }: { logo: string; course?: string; provider?: string; w: number[]; target?: string }) {
  return (
    <div className="scn-card" data-target={target} data-cursor={target ? 'pointer' : undefined}>
      <Logo src={logo} size={40} />
      <div className="scn-card__course">{course ?? <Bar w={w[0]} h={9} r={4} tone={3} />}</div>
      <div className="scn-card__prov">{provider ?? <Bar w={w[1]} h={7} r={3} tone={2} />}</div>
      <div className="sat-card__facts">
        <Bar w={w[2]} h={7} r={3} tone={2} />
        <Bar w={w[3]} h={7} r={3} tone={2} />
      </div>
    </div>
  )
}

function ListPage() {
  return (
    <>
      <Header />
      <div className="sat-module">
        <div className="sat-title">Software developer courses</div>
        <nav className="sat-tabs">
          <span className="sat-tab" data-on>All</span>
          <span className="sat-tab">Undergraduate</span>
          <span className="sat-tab">TAFE / VET</span>
          <span className="sat-tab sat-tab--more"><Bar w={64} h={8} r={4} tone={2} /></span>
        </nav>
      </div>
      <div className="scn-list">
        <section className="sat-group">
          <div className="sat-group__title sat-group__title--under">Undergraduate</div>
          <div className="sat-rail">
            <Card target="card-1" logo={MONARCH} course="Bachelor of Computer Science" provider="Monarch Institute" w={[0, 0, 150, 112]} />
            <Card logo="/stageshow/seek/logos/swinburne.svg" w={[150, 100, 140, 104]} />
          </div>
        </section>
        <section className="sat-group">
          <div className="sat-group__title sat-group__title--under">TAFE / VET</div>
          <div className="sat-rail">
            <Card logo="/stageshow/seek/logos/upskilled.svg" w={[140, 96, 150, 120]} />
            <Card logo="/stageshow/seek/logos/torrens.png" w={[120, 110, 130, 100]} />
          </div>
        </section>
        <section className="sat-group">
          <div className="sat-group__title sat-group__title--under">Bootcamps</div>
          <div className="sat-rail">
            <Card logo="/stageshow/seek/logos/lewagon.svg" w={[130, 90, 140, 110]} />
            <Card logo="/stageshow/seek/logos/monarch.svg" w={[120, 100, 130, 96]} />
          </div>
        </section>
      </div>
    </>
  )
}

// The first release: the course's own page, its buttons pinned at the foot
function CoursePage() {
  return (
    <>
      <Header />
      <div className="scn-page__body">
        <div className="scn-back"><span className="scn-chev" /><Bar w={150} h={8} r={4} tone={2} /></div>
        <Logo src={MONARCH} size={52} />
        <div className="scn-page__title">Bachelor of Computer Science</div>
        <div className="scn-page__prov">Monarch Institute</div>
        <div className="scn-facts">
          {[[70, 110], [84, 120], [60, 96]].map(([l, r], i) => <div key={i} className="scn-facts__row"><Bar w={l} h={7} r={3} tone={2} /><Bar w={r} h={7} r={3} tone={3} /></div>)}
        </div>
        <Bar w={130} h={10} r={5} tone={3} className="scn-gap" />
        <div className="scn-para">
          <Bar w="100%" h={7} r={3} tone={2} /><Bar w="92%" h={7} r={3} tone={2} /><Bar w="96%" h={7} r={3} tone={2} /><Bar w="60%" h={7} r={3} tone={2} />
        </div>
        <Bar w={150} h={10} r={5} tone={3} className="scn-gap" />
        <div className="scn-para">
          <Bar w="94%" h={7} r={3} tone={2} /><Bar w="100%" h={7} r={3} tone={2} /><Bar w="72%" h={7} r={3} tone={2} />
        </div>
        <Bar w={110} h={10} r={5} tone={3} className="scn-gap" />
        <div className="scn-para">
          <Bar w="98%" h={7} r={3} tone={2} /><Bar w="86%" h={7} r={3} tone={2} /><Bar w="90%" h={7} r={3} tone={2} /><Bar w="50%" h={7} r={3} tone={2} />
        </div>
      </div>
      <div className="scn-dock">
        <span className="scn-btn scn-btn--primary" data-target="enquire-page" data-cursor="pointer">Enquire</span>
        <span className="scn-btn">Visit website</span>
      </div>
    </>
  )
}

function Fields({ phone = true }: { phone?: boolean }) {
  return (
    <div className="scn-fields">
      <label className="scn-field"><span className="scn-label">Email</span><span className="scn-input" /></label>
      <div className="scn-field-row">
        <label className="scn-field"><Bar w={64} h={7} r={3} tone={3} className="scn-label-bar" /><span className="scn-input" /></label>
        <label className="scn-field"><Bar w={60} h={7} r={3} tone={3} className="scn-label-bar" /><span className="scn-input" /></label>
      </div>
      {phone && <label className="scn-field"><Bar w={48} h={7} r={3} tone={3} className="scn-label-bar" /><span className="scn-input" /></label>}
    </div>
  )
}

// The first release: a second page, the form
function FormPage() {
  return (
    <>
      <Header />
      <div className="scn-page__body">
        <div className="scn-back"><span className="scn-chev" /><Bar w={170} h={8} r={4} tone={2} /></div>
        <div className="scn-page__title scn-page__title--form">Enquire about this course</div>
        <div className="scn-para scn-para--tight"><Bar w="90%" h={7} r={3} tone={2} /><Bar w="55%" h={7} r={3} tone={2} /></div>
        <Fields />
        <label className="scn-field scn-field--gap"><Bar w={120} h={7} r={3} tone={3} className="scn-label-bar" /><span className="scn-input scn-input--select"><Bar w={130} h={8} r={4} tone={2} /><span className="scn-caret" /></span></label>
        <label className="scn-field scn-field--gap"><Bar w={90} h={7} r={3} tone={3} className="scn-label-bar" /><span className="scn-input scn-input--area" /></label>
        <div className="scn-consent"><span className="scn-box" /><div className="scn-para scn-para--flush"><Bar w="92%" h={7} r={3} tone={2} /><Bar w="64%" h={7} r={3} tone={2} /></div></div>
      </div>
      <div className="scn-dock">
        <span className="scn-btn scn-btn--primary scn-btn--wide">Send enquiry</span>
      </div>
    </>
  )
}

function Screen({ s }: { s: S }) {
  const at = ORDER.indexOf(s.page)
  const pos = (p: Page) => { const d = ORDER.indexOf(p) - at; return d === 0 ? 'here' : d > 0 ? 'ahead' : 'behind' }
  return (
    <div className="sat-screen scn-screen">
      <div className="scn-page" data-pos={pos('list')}><ListPage /></div>
      <div className="scn-page" data-pos={pos('course')}><CoursePage /></div>
      <div className="scn-page" data-pos={pos('form')}><FormPage /></div>
    </div>
  )
}

// The fix: one sheet over the same page. Its summary and its form share one cell and crossfade,
// so the sheet keeps its height and nothing in it stretches
function Sheet({ s }: { s: S }) {
  const open = s.sheet !== 'none'
  return (
    <>
      <div className="scn-scrim" data-open={open || undefined} />
      <div className="scn-sheet" data-open={open || undefined}>
        <span className="scn-grab" />
        <div className="scn-sheet__head">
          <Logo src={MONARCH} size={44} />
          <div className="scn-sheet__titles">
            <span className="scn-sheet__title">Bachelor of Computer Science</span>
            <span className="scn-sheet__prov">Monarch Institute</span>
          </div>
          <span className="scn-x" />
        </div>
        <div className="scn-sheet__cell">
          <div className="scn-sheet__layer" data-show={s.sheet !== 'form' || undefined}>
            <div className="scn-para scn-para--tight"><Bar w="96%" h={7} r={3} tone={2} /><Bar w="88%" h={7} r={3} tone={2} /><Bar w="60%" h={7} r={3} tone={2} /></div>
            <div className="scn-checks">
              {[150, 128, 170].map((w, i) => <div key={i} className="scn-check"><span className="scn-tick" /><Bar w={w} h={7} r={3} tone={2} /></div>)}
            </div>
            <div className="scn-btns">
              <span className="scn-btn scn-btn--primary" data-target="enquire-sheet" data-cursor="pointer">Enquire</span>
              <span className="scn-btn">Visit website</span>
            </div>
          </div>
          <div className="scn-sheet__layer" data-show={s.sheet === 'form' || undefined}>
            <Fields phone={false} />
            <div className="scn-btns"><span className="scn-btn scn-btn--primary scn-btn--wide">Send enquiry</span></div>
          </div>
        </div>
      </div>
    </>
  )
}

function Note({ s }: { s: S }) {
  return (
    <div className="sat-note">
      <span className="sat-note__text" data-show={!s.fixed || undefined}><b>Before the fix</b><span>A page for the course, another for the form</span></span>
      <span className="sat-note__text" data-show={s.fixed || undefined}><b>After the fix</b><span>A sheet on the same page, the form in it</span></span>
    </div>
  )
}

export function SeekConnect({ bare = false }: { bare?: boolean } = {}) {
  return (
    <figure className={bare ? 'not-prose sat--bare' : 'my-8 not-prose'} role="img" aria-label="Enquiring about a SEEK course: before the fix a course opened its own page and the form another; after it, the course opens in a sheet over the same page and the form opens in the sheet">
      <Stage
        width={720}
        height={700}
        compact={{ below: 600, width: 358, height: 680 }}
        initial={initial}
        poster={poster}
        script={script}
        play="loop"
        fill={!bare}
        cursor={{ at: REST, style: 'touch' }}
        className="sat scn"
      >
        {(s, _rect, layout) => {
          const wide = layout !== 'compact'
          return (
            <>
              <div className="sat-phone scn-phone" data-layout={layout}>
                <Phone width={wide ? 320 : 310} frame="pro">
                  <Screen s={s} />
                  <Sheet s={s} />
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
