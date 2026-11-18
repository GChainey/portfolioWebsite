'use client'

import { Check as Tick, ChevronLeft, Minus } from 'lucide-react'
import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Phone } from './kit/phone'
import { Collapse } from './kit/motion/Collapse'
import { States } from './kit/motion/States'
import { Spinner } from './kit/parts/Spinner'
import './thesis-evidence.css'

// Thesis, bringing product thinking to the agentic era, as a Stageshow scene for its homepage card.
// Thesis started as a phone app, so it's shown on two iPhones, light, in its mobile look. Each is a
// claim from the plan, a bet. Check its evidence and Thesis searches the tools the team already
// has (Dovetail for research, Amplitude for usage):
// - left, the evidence is there: both sources come back with a finding and the claim reads Supported
// - right, there's nothing yet: Thesis drafts a test, and it starts running
// The flow and the words follow the Thesis repo's evidence and test agents
// (src/lib/declaration-evidence-agent-mock.ts, declaration-test-agent-mock.ts) and its phone frames
// (public/paper-frames/isolates/declaration-investigate.html, declaration-create-tests.html).
//
// - Two phones at one height, running off the card's foot; the drafted test always stays in shot.
// - Real logos: Dovetail's mark from dovetail.com, Amplitude's app icon from amplitude.com
//   (public/brands/). No invented marks.
// - Plays once in view and holds on the payoff, both outcomes side by side. That's the poster too.

type Check = 'idle' | 'checking' | 'found' | 'done' | 'running'
type S = { a: Check; b: Check }

const initial: S = { a: 'idle', b: 'idle' }
const poster: S = { a: 'done', b: 'running' }

async function script(a: Act<S>) {
  await a.wait(700)
  await a.click({ at: 'check-a', x: 0.5, y: 0.5 })
  a.set({ a: 'checking' })
  await a.wait(1300)
  a.set({ a: 'found' })
  await a.wait(700)
  a.set({ a: 'done' })
  await a.wait(1600)
  await a.click({ at: 'check-b', x: 0.5, y: 0.5 })
  a.set({ b: 'checking' })
  await a.wait(1300)
  a.set({ b: 'found' })
  await a.wait(800)
  a.set({ b: 'done' })
  await a.wait(1500)
  await a.click({ at: 'start', x: 0.5, y: 0.5 })
  a.set({ b: 'running' })
  await a.wait(2400)
}

const CLAIMS = {
  a: 'Teams ship faster than they agree on what to ship.',
  b: 'Teams will pay once three people edit the same thesis.',
}

const LOGO = { Dovetail: '/brands/dovetail.svg', Amplitude: '/brands/amplitude.png' } as const

// What each source said, per claim. found: evidence (a tick); otherwise nothing yet (a dash)
const SOURCES: Record<'a' | 'b', { name: keyof typeof LOGO; line: string; found: boolean }[]> = {
  a: [
    { name: 'Dovetail', line: '9 of 12 PMs named untested bets', found: true },
    { name: 'Amplitude', line: 'Deploys up 34%, planning flat', found: true },
  ],
  b: [
    { name: 'Dovetail', line: 'Nothing on paying yet', found: false },
    { name: 'Amplitude', line: 'No event to measure it', found: false },
  ],
}

function Source({ name, line, found, state }: { name: keyof typeof LOGO; line: string; found: boolean; state: Check }) {
  const shown = state !== 'idle' && state !== 'checking'
  return (
    <div className="te-source">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO[name]} alt="" className="te-logo" />
      <div className="te-source__text">
        <div className="te-source__name">{name}</div>
        <div className="te-source__line" data-on={shown || undefined} data-found={found || undefined}>{line}</div>
      </div>
      <span className="te-source__mark">
        <States
          value={shown ? (found ? 'yes' : 'no') : 'wait'}
          align="end"
          states={{ wait: <Spinner size={20} />, yes: <Tick size={20} strokeWidth={2.5} className="te-yes" />, no: <Minus size={20} strokeWidth={2.5} className="te-no" /> }}
        />
      </span>
    </div>
  )
}

function Screen({ id, state }: { id: 'a' | 'b'; state: Check }) {
  const badge = state === 'running' ? 'testing' : state === 'checking' ? 'checking' : state === 'done' ? (id === 'a' ? 'supported' : 'none') : 'untested'
  return (
    <div className="te-screen">
      <div className="te-nav"><ChevronLeft size={22} strokeWidth={2.25} />Product vision</div>
      <div className="te-head">
        <span className="te-label">Assumption</span>
        <States
          value={badge}
          align="end"
          states={{
            untested: <span className="te-badge" data-tone="untested">Untested</span>,
            checking: <span className="te-badge">Checking</span>,
            supported: <span className="te-badge" data-tone="supported">Supported</span>,
            none: <span className="te-badge">No evidence</span>,
            testing: <span className="te-badge" data-tone="testing">Testing</span>,
          }}
        />
      </div>
      <div className="te-claim" data-tone={state === 'running' ? 'testing' : state === 'done' && id === 'a' ? 'supported' : 'untested'}>{CLAIMS[id]}</div>

      <Collapse open={state === 'idle'}>
        <div className="te-actions">
          <span className="te-button" data-target={`check-${id}`} data-cursor="pointer">Check evidence</span>
        </div>
      </Collapse>

      <Collapse open={state !== 'idle'}>
        <div className="te-sources">
          {SOURCES[id].map((src) => <Source key={src.name} {...src} state={state} />)}
        </div>
      </Collapse>

      {id === 'b' && (
        <Collapse open={state === 'done' || state === 'running'}>
          <div className="te-test">
            <div className="te-test__title">Paid pilot with 5 teams</div>
            <div className="te-test__meta">Drafted test · Prototype · 2 weeks</div>
            <span className="te-button te-button--small" data-target="start" data-cursor="pointer" data-on={state === 'running' || undefined}>
              <States value={state === 'running' ? 'run' : 'start'} states={{ start: <span>Start test</span>, run: <span className="te-running"><Spinner size={16} />Running</span> }} />
            </span>
          </div>
        </Collapse>
      )}
    </div>
  )
}

export function ThesisEvidence({ filled = false }: { filled?: boolean } = {}) {
  return (
    <figure className={`not-prose te--bare${filled ? ' te--filled' : ''}`} role="img" aria-label="Thesis on two phones: one claim checked against Dovetail and Amplitude comes back supported; another finds nothing, so Thesis drafts a test and starts it">
      <Stage width={560} height={350} initial={initial} poster={poster} script={script} play="once" cursor={{ at: { x: 530, y: 330 }, style: 'touch' }} className="te">
        {(s) => (
          <div className="te-phones">
            <Phone width={262} className="te-phone"><Screen id="a" state={s.a} /></Phone>
            <Phone width={262} className="te-phone"><Screen id="b" state={s.b} /></Phone>
          </div>
        )}
      </Stage>
    </figure>
  )
}
