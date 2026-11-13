'use client'

import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import { Fraunces } from 'next/font/google'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { Shader } from '@/components/showcase/ShaderWallWidgets'
import { getProjectById, projectHref, type Project } from '@/content/projects'
import { OTHER_ISSUES, type CaseStudyIssue as Issue, type IssueClip } from '@/content/case-study-issues'

// A case study as an issue (?style=issue), after Dia's release notes. It leads with the work: a
// wall of the real screens on a painted canvas, straight under the headline. Then the same three
// chapters for every study: the impact, the delight, and how AI made it possible. The painted
// canvases are Shader Wall's wallpaper, so the paint is the work too.

const display = Fraunces({ subsets: ['latin'], weight: ['500'], display: 'swap' })

const KICKER = 'text-[13px] uppercase leading-[18px] tracking-[0.22em]'
const pad = (n: number) => String(n).padStart(2, '0')

// A painted canvas: Shader Wall's wallpaper behind whatever sits on it
function Canvas({ palette, hue = 0, className = '', style, children }: { palette: number; hue?: number; className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      <Shader p={{ speed: 0.35, swirl: 0.5, grain: 0.35, hue, palette }} />
      <div className="relative h-full">{children}</div>
    </div>
  )
}

// A replay in a light window with a soft shadow
function Window({ clip, className = '', label }: { clip: IssueClip; className?: string; label?: string }) {
  return (
    <div role={label ? 'img' : undefined} aria-label={label} className={`overflow-hidden rounded-xl bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] ${className}`}>
      <RecordingReplay src={clip.src} region={clip.region} bare />
    </div>
  )
}

function ChapterHead({ n, name, title, aside }: { n: string; name: string; title: string; aside: string }) {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end md:gap-16">
      <div className="flex flex-col gap-5">
        <span className={`${KICKER} text-[#B45309]`}>Chapter {n} · {name}</span>
        <h2 className={`${display.className} max-w-[820px] text-[44px] leading-[1.02] tracking-[-0.02em] text-foreground text-balance md:text-[80px] md:leading-[80px]`}>{title}</h2>
      </div>
      <p className="max-w-[380px] text-lg leading-7 text-muted text-pretty">{aside}</p>
    </div>
  )
}

export function CaseStudyIssue({ issue, project }: { issue: Issue; project: Project }) {
  const { impact, delight, ai } = issue
  const [main] = issue.wall
  const others = OTHER_ISSUES.filter((o) => o.id !== issue.id)

  return (
    <article className="flex flex-col items-center pb-32">
      {/* The painting, hung a little crooked, under the header */}
      <div className="w-[calc(100%+48px)] -rotate-[1.2deg] bg-white px-6 pb-6 shadow-[0_40px_60px_-30px_rgba(0,0,0,0.25)]">
        <Canvas palette={3} className="h-[160px] md:h-[240px]" />
      </div>

      {/* The masthead */}
      <header className="flex max-w-[780px] flex-col items-center gap-7 px-6 pb-16 pt-20 text-center md:pt-24">
        <span className={`${KICKER} text-foreground`}>Gareth, lately · No. {pad(issue.number)} · {issue.kicker}</span>
        <h1 className={`${display.className} text-[56px] leading-[1] tracking-[-0.02em] text-foreground text-balance md:text-[104px] md:leading-[100px]`}>{issue.title}</h1>
        <p className="text-xl leading-8 text-foreground text-pretty md:text-[22px] md:leading-[33px]">{issue.intro}</p>
        <Link href={`/projects/${project.id}`} className="text-sm text-muted transition-colors hover:text-foreground">Or read the full case study →</Link>
      </header>

      {/* The work, first: the real screens on the canvas. Phones get the main one, big */}
      <div className="w-full max-w-[1360px] px-4 md:px-6">
        <Canvas palette={issue.palette} className="rounded-[24px] md:hidden">
          <div className="p-5"><Window clip={main} label={main.label} /></div>
        </Canvas>
        <Canvas palette={issue.palette} className="hidden aspect-[1360/880] rounded-[32px] md:block">
          {/* The main clip last, so it sits on top */}
          {issue.wall.slice(1).concat(main).map((c) => (
            <div key={c.src + c.left} className="absolute" style={{ left: `${c.left}%`, top: `${c.top}%`, width: `${c.width}%`, transform: c.tilt ? `rotate(${c.tilt}deg)` : undefined }}>
              <Window clip={c} label={c.label} />
            </div>
          ))}
        </Canvas>
      </div>

      <div className="flex w-full max-w-[1328px] flex-col gap-40 px-6 pt-40 md:px-6">
        {/* Chapter one: what it did */}
        <section className="flex flex-col gap-14">
          <ChapterHead n="one" name="The impact" title={impact.title} aside={impact.aside} />
          <div className={`grid grid-cols-1 border-t border-foreground ${impact.numbers.length > 3 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            {impact.numbers.map((n, i) => (
              <div key={n.value} className={`flex flex-col gap-2 py-8 md:pr-8 ${i ? 'border-t border-border md:border-l md:border-t-0 md:pl-8' : ''}`}>
                <span className={`${display.className} text-[72px] leading-none tracking-[-0.03em] text-foreground md:text-[96px]`}>{n.value}</span>
                <span className="text-lg leading-[26px] text-foreground">{n.label}</span>
              </div>
            ))}
          </div>
          {impact.produced && (
            <figure className="flex flex-col gap-5">
              <div className="flex flex-col items-center gap-6 rounded-[28px] p-6 md:flex-row md:p-12" style={{ background: 'var(--mat, #E6EEE7)' }}>
                {impact.produced.clips.map((c) => <Window key={c.src} clip={c} className="w-full md:flex-1" />)}
              </div>
              <figcaption className="text-center text-[15px] leading-[22px] text-muted text-balance">{impact.produced.caption}</figcaption>
            </figure>
          )}
        </section>

        {/* Chapter two: the moments people lean in for */}
        <section className="flex flex-col gap-14">
          <ChapterHead n="two" name="The delight" title={delight.title} aside={delight.aside} />
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {delight.tiles.slice(0, 1).map((t) => (
              <figure key={t.src} className="flex flex-col gap-4 md:flex-[1.35]">
                <Canvas palette={3} className="rounded-[28px]"><div className="p-6 md:p-11"><Window clip={t} /></div></Canvas>
                <figcaption className="text-base leading-6 text-foreground">{t.caption}</figcaption>
              </figure>
            ))}
            <div className="flex flex-col gap-6 md:flex-1">
              {delight.tiles.slice(1).map((t, i) => (
                <figure key={t.src} className="flex flex-col gap-4">
                  <Canvas palette={i ? 3 : 0} hue={i ? -30 : 0} className="rounded-[28px]"><div className="p-6 md:p-8"><Window clip={t} /></div></Canvas>
                  <figcaption className="text-base leading-6 text-foreground">{t.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Chapter three: what AI did, in the product and in the making of it */}
        <section className="flex flex-col gap-14">
          <ChapterHead n="three" name="How AI made it possible" title={ai.title} aside={ai.aside} />
          {ai.pair && (
            <figure className="flex flex-col gap-5">
              <Canvas palette={issue.palette} className="rounded-[28px]">
                <div className="flex flex-col items-center gap-8 p-6 md:flex-row md:p-14">
                  {ai.pair.clips.map((c) => (
                    <div key={c.src} className="flex w-full flex-col gap-3 md:flex-1">
                      <span className={`${KICKER} text-white`}>{c.label}</span>
                      <Window clip={c} />
                    </div>
                  ))}
                </div>
              </Canvas>
              <figcaption className="text-center text-[15px] leading-[22px] text-muted text-balance">{ai.pair.caption}</figcaption>
            </figure>
          )}
          <div className="flex flex-col gap-6 md:flex-row">
            {ai.prompt ? (
              <div className="flex flex-col gap-4 rounded-[28px] bg-[#141311] p-9 md:flex-[1.2]">
                <span className="font-mono text-[15px] leading-6 text-[#D97706]">claude</span>
                <p className="font-mono text-[17px] leading-7 text-[#F5F1EA]">&gt; {ai.prompt.text}</p>
                <p className="font-mono text-[15px] leading-6 text-[#8C857A]">⏺ {ai.prompt.result}</p>
                <p className="pt-2 text-sm text-[#8C857A]">{ai.prompt.caption}</p>
              </div>
            ) : process.env.NODE_ENV === 'development' && (
              // Dev server only, like a pending clip: the real prompt goes here, word for word
              <div className="flex flex-col justify-center gap-2 rounded-[28px] border border-dashed border-border p-9 md:flex-[1.2]">
                <span className={`${KICKER} text-[#B45309]`}>Prompt to come</span>
                <p className="text-base leading-6 text-muted">The prompt given to Claude Code, word for word, and what it changed. Set ai.prompt in content/case-study-issues.ts.</p>
              </div>
            )}
            {ai.team && (
              <div className="flex flex-col overflow-hidden rounded-[28px] border border-border md:flex-1">
                <div className="flex flex-1 flex-col gap-2.5 bg-[#FAFAFA] px-9 py-8">
                  <span className={`${KICKER} text-muted`}>Before AI, it would have taken</span>
                  <p className="text-lg leading-7 text-muted">{ai.team.before}</p>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 border-t border-border px-9 py-8">
                  <span className={`${KICKER} text-[#B45309]`}>With AI, it took</span>
                  <p className="text-lg leading-7 text-foreground">{ai.team.after}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className={`${KICKER} text-foreground`}>Made by Gareth, with Claude Code</span>
            <span className="-rotate-[4deg] text-[36px] font-bold leading-none text-foreground" style={{ fontFamily: 'var(--font-signature)' }}>Gareth</span>
          </div>
        </section>

        {/* The rest of the changes, as a list */}
        {issue.more && (
          <section className="flex flex-col">
            <h2 className={`${display.className} self-center pb-16 text-[48px] leading-none tracking-[-0.02em] text-foreground md:text-[72px]`}>What else changed</h2>
            {issue.more.map((m, i) => (
              <div key={m.title} className={`flex flex-col gap-3 py-8 md:flex-row md:gap-10 ${i < issue.more!.length - 1 ? 'border-b border-border' : ''}`}>
                <h3 className="text-2xl leading-[34px] tracking-[-0.01em] text-foreground md:w-[560px] md:shrink-0 md:text-[26px]">{m.title}</h3>
                <p className="text-lg leading-7 text-foreground">{m.text}</p>
              </div>
            ))}
          </section>
        )}

        {/* The next issues */}
        <section className="flex flex-col gap-10">
          <h2 className={`${display.className} text-[44px] leading-[48px] tracking-[-0.02em] text-foreground`}>More issues</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {others.map((o) => {
              const p = getProjectById(o.id)
              const href = p ? projectHref(p) : null
              const card = (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.image} alt="" className="h-[240px] w-full rounded-2xl bg-[#F5F5F5] object-cover object-top" />
                  <span className={`${KICKER} text-muted`}>No. {pad(o.number)} · {o.label}</span>
                  <span className={`${display.className} text-[26px] leading-[30px] tracking-[-0.01em] text-foreground`}>{o.title}</span>
                </>
              )
              return href
                ? <Link key={o.id} href={href} className="group flex flex-col gap-3.5 transition-opacity hover:opacity-80">{card}</Link>
                : <div key={o.id} className="flex flex-col gap-3.5">{card}</div>
            })}
          </div>
        </section>
      </div>
    </article>
  )
}
