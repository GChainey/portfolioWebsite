'use client'

import { Check as Tick, Minus } from 'lucide-react'
import { Stage } from './kit/stage'
import type { Act } from './kit/act'
import { Bar, Window } from './kit/window'
import { Collapse } from './kit/motion/Collapse'
import { States } from './kit/motion/States'
import { Spinner } from './kit/parts/Spinner'
import './thesis-evidence.css'

// Thesis, bringing product thinking to the agentic era, as a Stageshow scene for its homepage card.
// A plan is a set of claims; each claim is a bet. Pick one and Thesis checks it against the tools
// the team already has (Dovetail for research, Amplitude for usage). Either the evidence is there
// and the claim reads Supported, or there's nothing yet and Thesis drafts a test to run now.
// The flow and the words follow the Thesis repo's evidence and test agents
// (src/lib/declaration-evidence-agent-mock.ts, declaration-test-agent-mock.ts).
//
// - Thesis's own look: dark, Geist, claims underlined in the plan by their state (amber untested,
//   green supported, blue being tested), the assumption in a side panel.
// - Filled: the window is the whole picture, edge to edge in the homepage card's frame.
// - Real words only on the story: the two claims, the two sources, what each found, the verdict and
//   the drafted test. The rest of the plan is bars. Dovetail and Amplitude are plain wordmarks (no
//   invented logos).
// - Plays once in view and holds on the payoff: the first claim supported, a test running on the
//   second. That's also the poster.

type Check = 'idle' | 'checking' | 'found' | 'done'
type S = { sel: 'a' | 'b'; a: Check; b: Check | 'running' }

const initial: S = { sel: 'a', a: 'idle', b: 'idle' }
const poster: S = { sel: 'b', a: 'done', b: 'running' }

async function script(a: Act<S>) {
  await a.wait(700)
  await a.click({ at: 'check-a', x: 0.5, y: 0.5 })
  a.set({ a: 'checking' })
  await a.wait(1300)
  a.set({ a: 'found' })
  await a.wait(700)
  a.set({ a: 'done' })
  await a.wait(1900)
  // The second claim: nothing to find, so Thesis drafts a test
  await a.click({ at: 'claim-b', x: 0.3, y: 0.5 })
  a.set({ sel: 'b' })
  await a.wait(900)
  await a.click({ at: 'check-b', x: 0.5, y: 0.5 })
  a.set({ b: 'checking' })
  await a.wait(1300)
  a.set({ b: 'found' })
  await a.wait(800)
  a.set({ b: 'done' })
  await a.wait(1500)
  await a.click({ at: 'start', x: 0.5, y: 0.5 })
  a.set({ b: 'running' })
  await a.wait(600)
  await a.move({ at: 'panel', x: 0.9, y: 0.95 })
  await a.wait(2000)
}

const CLAIMS = {
  a: 'Teams ship faster than they agree on what to ship.',
  b: 'Teams will pay once three people edit the same thesis.',
}

// What each source said, per claim. found: evidence (a tick); otherwise nothing yet (a dash)
const SOURCES: Record<'a' | 'b', { name: string; line: string; found: boolean }[]> = {
  a: [
    { name: 'Dovetail', line: '9 of 12 PMs named untested bets', found: true },
    { name: 'Amplitude', line: 'Deploys up 34%, planning flat', found: true },
  ],
  b: [
    { name: 'Dovetail', line: 'Nothing on paying yet', found: false },
    { name: 'Amplitude', line: 'No event to measure it', found: false },
  ],
}

type Tone = 'untested' | 'supported' | 'testing'
const tone = (c: Check | 'running', key: 'a' | 'b'): Tone => c === 'running' ? 'testing' : c === 'done' && key === 'a' ? 'supported' : 'untested'

function Claim({ id, s }: { id: 'a' | 'b'; s: S }) {
  return (
    <span className="te-claim" data-tone={tone(s[id], id)} data-sel={s.sel === id || undefined} data-target={`claim-${id}`} data-cursor="pointer">
      {CLAIMS[id]}
    </span>
  )
}

function Source({ name, line, found, state }: { name: string; line: string; found: boolean; state: Check | 'running' }) {
  const shown = state !== 'idle' && state !== 'checking'
  return (
    <div className="te-source">
      <div className="te-source__text">
        <div className="te-source__name">{name}</div>
        <div className="te-source__line" data-on={shown || undefined} data-found={found || undefined}>{line}</div>
      </div>
      <span className="te-source__mark">
        <States
          value={shown ? (found ? 'yes' : 'no') : 'wait'}
          align="end"
          states={{ wait: <Spinner size={14} />, yes: <Tick size={14} strokeWidth={2.5} className="te-yes" />, no: <Minus size={14} strokeWidth={2.5} className="te-no" /> }}
        />
      </span>
    </div>
  )
}

function Panel({ id, s }: { id: 'a' | 'b'; s: S }) {
  const state = s[id]
  const badge = state === 'running' ? 'testing' : state === 'checking' ? 'checking' : state === 'done' ? (id === 'a' ? 'supported' : 'none') : 'untested'
  return (
    <div className="te-panel__inner">
      <div className="te-panel__head">
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
      <div className="te-panel__claim">{CLAIMS[id]}</div>

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
            <span className="te-button te-button--primary" data-target="start" data-cursor="pointer" data-on={state === 'running' || undefined}>
              <States value={state === 'running' ? 'run' : 'start'} states={{ start: <span>Start test</span>, run: <span className="te-running"><Spinner size={12} />Running</span> }} />
            </span>
          </div>
        </Collapse>
      )}
    </div>
  )
}

export function ThesisEvidence({ filled = false }: { filled?: boolean } = {}) {
  return (
    <figure className={`not-prose te--bare${filled ? ' te--filled' : ''}`} role="img" aria-label="Thesis checks a claim against Dovetail and Amplitude and finds it supported, then finds nothing on a second claim and drafts a test to run">
      <Stage width={512} height={320} initial={initial} poster={poster} script={script} play="once" theme="dark" cursor={{ at: { x: 470, y: 300 } }} className="te">
        {(s) => (
          <Window title="Thesis" className="te-window">
            <div className="te-body">
              <article className="te-doc">
                <div className="te-doc__title">Product vision</div>
                <Bar w={128} h={5} tone={4} />
                <div className="te-doc__section">
                  <Bar w={44} h={5} tone={3} />
                  <p className="te-doc__para"><Claim id="a" s={s} /></p>
                  <Bar w="86%" h={5} tone={4} />
                  <Bar w="62%" h={5} tone={4} />
                </div>
                <div className="te-doc__section">
                  <Bar w={28} h={5} tone={3} />
                  <p className="te-doc__para"><Claim id="b" s={s} /></p>
                  <Bar w="78%" h={5} tone={4} />
                  <Bar w="54%" h={5} tone={4} />
                </div>
              </article>
              <aside className="te-panel" data-target="panel">
                {/* Both claims' panels stay mounted and crossfade, so picking the second claim
                    never re-lays the panel out under the cursor */}
                {(['a', 'b'] as const).map((id) => (
                  <div key={id} className="te-panel__slot" data-on={s.sel === id || undefined} aria-hidden={s.sel !== id || undefined}><Panel id={id} s={s} /></div>
                ))}
              </aside>
            </div>
          </Window>
        )}
      </Stage>
    </figure>
  )
}
