'use client'

import { useMemo } from 'react'
import { mixed, SCREENS } from '@/content/screens'
import { CASE_STUDIES } from '@/content/work'
import { WorkLink } from '@/components/showcase/shared'
import { ScreenTile, useInView } from '../shared'
import { ChapterText, KICKER, ABOUT, ABOUT_SUB } from './bits'

// Phones and narrow windows: no 3D and no dive. Two columns of screens drifting past each other,
// then the case studies stacked, each with its poster.
export function PhoneHome({ reduced }: { reduced: boolean }) {
  const [left, right] = useMemo(() => {
    const all = mixed(SCREENS)
    return [all.filter((_, i) => i % 2 === 0).slice(0, 22), all.filter((_, i) => i % 2 === 1).slice(0, 22)]
  }, [])
  const [wallRef, wallSeen] = useInView<HTMLDivElement>('100px')

  return (
    <>
      <section className="border-b border-border" aria-label="Screens">
        <div className="px-8 pb-6 pt-12">
          <p className="text-xs uppercase tracking-widest text-muted">{KICKER}</p>
          <h2 className="mt-4 text-[28px] font-medium leading-[1.12] tracking-[-0.022em] text-foreground text-balance">{ABOUT}</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">{ABOUT_SUB}</p>
        </div>
        <div ref={wallRef} className="relative h-[560px] overflow-hidden">
          <div className="grid grid-cols-2 gap-3 px-4">
            {[left, right].map((list, c) => (
              <div
                key={c}
                className="flex flex-col"
                style={{
                  animation: reduced ? undefined : `${c ? 'dvp-down' : 'dvp-up'} ${c ? 150 : 130}s linear infinite`,
                  animationPlayState: wallSeen ? 'running' : 'paused',
                }}
              >
                {[...list, ...list].map((s, i) => (
                  <div key={`${i}-${s.id}`} className="pb-3" aria-hidden={i >= list.length || undefined}>
                    <ScreenTile screen={s} className="dvp-tile rounded-md" play={wallSeen} />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20" style={{ background: 'linear-gradient(var(--background), color-mix(in srgb, var(--background) 0%, transparent))' }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28" style={{ background: 'linear-gradient(color-mix(in srgb, var(--background) 0%, transparent), var(--background))' }} />
        </div>
      </section>

      {CASE_STUDIES.map((w, i) => (
        <article key={w.id} className="flex flex-col border-b border-border px-8 py-14">
          <WorkLink item={w} className="mb-8 block overflow-hidden rounded-xl" tabIndex={-1}>
            <div className="dv-stage relative overflow-hidden rounded-xl bg-card" style={{ aspectRatio: '16 / 10' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={w.poster} alt={`${w.name}: ${w.title}`} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
            </div>
          </WorkLink>
          <ChapterText item={w} index={i} reduced={reduced} size="sm" />
        </article>
      ))}
    </>
  )
}

export const PHONE_CSS = `
  @keyframes dvp-up { from { transform: translate3d(0,0,0) } to { transform: translate3d(0,-50%,0) } }
  @keyframes dvp-down { from { transform: translate3d(0,-50%,0) } to { transform: translate3d(0,0,0) } }
  .dvp-tile { box-shadow: 0 0 0 1px color-mix(in srgb, var(--foreground) 9%, transparent); }
`
