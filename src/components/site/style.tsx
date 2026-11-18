import type { ReactNode } from 'react'
import Link from 'next/link'
import { projectHref, writing } from '@/content/projects'

// The draft's whole style, after the "Polar, taken apart" audit (Paper file "Fancy unity"), turned
// to a light page. Fewer parts, each used the same way everywhere:
//
// Type    one weight (400); three sizes: 13 caption, 15 body, 24 headline. No big numbers: a case
//         study's impact is the first of its rows, the same size as the rest. Hierarchy comes from size and grey, never bold. A headline is two sentences
//         at the same size, the first in ink, the second grey. Numbers are tabular.
// Colour  white page, #F4F4F4 shell, #EBEBEB hairline, #181818 ink, #666 grey. No hue.
// Surface shell (radius 20, #F4F4F4, 4px padding) holding panels (radius 16, white, one shadow),
//         so the corners run parallel. Artefacts sit in a shell; nothing else gets a box.
// Rows    label grey on the left, value ink on the right; one hairline between groups.
// Space   4 8 12 16 24 32 48 64 96 only.

export const EMAIL = 'gareth.chainey@gmail.com'

export const INK = '#181818'
export const GREY = '#666666'
export const LINE = '#EBEBEB'
export const SHELL = '#F4F4F4'
export const SHADOW = '0 1px 2px rgba(0,0,0,0.04), 0 16px 40px -16px rgba(0,0,0,0.16)'

// A two-tone headline: the claim in ink, the rest in grey, one size
// stacked: the claim on its own line and the rest under it, so a page of them scans (case studies)
export function Headline({ lead, rest, as: Tag = 'h2', id, stacked = false }: { lead: ReactNode; rest?: ReactNode; as?: 'h1' | 'h2' | 'p'; id?: string; stacked?: boolean }) {
  return (
    <Tag id={id} className="scroll-mt-16 text-[24px] font-normal leading-[30px] tracking-[-0.02em] text-pretty">
      {lead}{rest && (stacked ? <span className="block" style={{ color: GREY }}>{rest}</span> : <> <span style={{ color: GREY }}>{rest}</span></>)}
    </Tag>
  )
}

// The shell: the one framed surface, one grey. Recordings, screenshots and video sit inset on it
// (12px, concentric 8px corners, a hairline edge, no shadow); a Stageshow scene paints the same grey
// as its own ground, so it fills the shell edge to edge (scene). Never a white panel with a shadow
// inside the grey: that read as a second, different grey (reviewed at /draft/frames, option A).
export function Shell({ children, className = '', scene = false }: { children: ReactNode; className?: string; scene?: boolean }) {
  if (scene) return <div className={`overflow-hidden rounded-[20px] ${className}`} style={{ background: SHELL, ['--frame-ground' as string]: SHELL }}>{children}</div>
  return (
    <div className={`rounded-[20px] p-3 ${className}`} style={{ background: SHELL }}>
      <div className="overflow-hidden rounded-[8px] bg-white" style={{ boxShadow: `0 0 0 1px ${LINE}` }}>{children}</div>
    </div>
  )
}

// The text column, and the wider measure the work runs at so it leads
export const COL = 'min(540px, calc(100vw - 48px))'
export const WIDE = 'min(720px, calc(100vw - 48px))'

// The product on the grey with room round it: a whole screen (a replay, a screenshot) inset 32px
// (12px on a phone) instead of the shell's 12, same hairline edge, no shadow. Full product edge to
// edge in the shell looked cramped and narrow
export function Mat({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[24px] p-3 min-[600px]:p-8" style={{ background: SHELL }}>
      <div className="overflow-hidden rounded-[10px] bg-white" style={{ boxShadow: `0 0 0 1px ${LINE}` }}>{children}</div>
    </div>
  )
}

// A moment: the work wider than the text, one grey line under it on the column. mat: a whole
// product screen, on the mat; scene: a Stageshow scene, filling the shell; otherwise in the shell
export function Moment({ children, line, scene = false, mat = false }: { children: ReactNode; line: ReactNode; scene?: boolean; mat?: boolean }) {
  return (
    <figure className="flex flex-col gap-3" style={{ marginInline: `calc((${COL} - ${WIDE}) / 2)` }}>
      {mat ? <Mat>{children}</Mat> : <Shell scene={scene}><div data-ss-fill>{children}</div></Shell>}
      <figcaption className="self-center text-[13px] leading-[20px]" style={{ width: COL, color: GREY }}>{line}</figcaption>
    </figure>
  )
}

// Label grey on the left, value ink on the right, a hairline above
export function Rows({ rows }: { rows: [label: string, value: ReactNode][] }) {
  return (
    <dl className="flex flex-col">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 border-t py-3" style={{ borderColor: LINE }}>
          <dt className="shrink-0" style={{ color: GREY }}>{k}</dt>
          <dd className="text-right tabular-nums">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

// An essay as a little card: title and year, then its leading line under a hairline. The draft's
// Thoughts row and its essays page share it
export type Essay = { title: string; date: string; href: string; body: string; external?: boolean }
export function EssayCard({ essay, className = '' }: { essay: Essay; className?: string }) {
  return (
    <Link href={essay.href} {...(essay.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`flex flex-col gap-6 rounded-[16px] bg-white p-4 transition-transform duration-150 ease-out active:scale-[0.99] ${className}`}>
      <div className="flex flex-col">
        <h3 className="font-normal text-pretty">{essay.title}</h3>
        <span className="text-[13px] leading-[20px] tabular-nums" style={{ color: GREY }}>{essay.date}</span>
      </div>
      <p className="mt-auto line-clamp-4 border-t pt-3 text-[13px] leading-[20px]" style={{ borderColor: LINE, color: GREY }}>{essay.body}</p>
    </Link>
  )
}

// Every essay, in the order the essays page lists them
export const ESSAYS: Essay[] = writing.filter((p) => p.category === 'Article').map((p) => ({ title: p.title, date: String(p.year ?? ''), href: projectHref(p) ?? '/essays', body: p.description }))

// The agent skills published on GitHub (GChainey/skills), as cards beside the essays. Recording
// Studio, the timeline editor for recordings, ships inside html-recording
const SKILLS_REPO = 'https://github.com/GChainey/skills/tree/main/skills'
export const SKILLS: Essay[] = [
  { title: 'html-recording', date: 'Skill · 2026', href: `${SKILLS_REPO}/html-recording`, external: true, body: 'Record a page or prototype as HTML instead of video: the real page, replayed, sharp at any zoom and around 1% of the size.' },
  { title: 'Recording Studio', date: 'Skill · 2026', href: `${SKILLS_REPO}/html-recording`, external: true, body: 'A timeline editor for those recordings: trim, cut, speed up, zoom that follows the mouse, captions. Part of html-recording.' },
  { title: 'sizzle-reel', date: 'Skill · 2026', href: `${SKILLS_REPO}/sizzle-reel`, external: true, body: 'A feature video the way Cursor makes them: a short card, then a demo of exactly that, repeated. Exported as MP4 or HTML.' },
  { title: 'design-principles-review', date: 'Skill · 2026', href: `${SKILLS_REPO}/design-principles-review`, external: true, body: 'Critique a UI against the 13 graphic design principles, with a measured style audit and a fix-first list.' },
]
