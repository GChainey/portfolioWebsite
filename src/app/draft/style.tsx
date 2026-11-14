import type { ReactNode } from 'react'
import Link from 'next/link'
import { projectHref, writing } from '@/content/projects'

// The draft's whole style, after the "Polar, taken apart" audit (Paper file "Fancy unity"), turned
// to a light page. Fewer parts, each used the same way everywhere:
//
// Type    one weight (400); four sizes: 13 caption, 15 body, 24 headline and figure, 40 the one
//         big number. Hierarchy comes from size and grey, never bold. A headline is two sentences
//         at the same size, the first in ink, the second grey. Numbers are tabular.
// Colour  white page, #F4F4F4 shell, #EBEBEB hairline, #181818 ink, #666 grey. No hue.
// Surface shell (radius 20, #F4F4F4, 4px padding) holding panels (radius 16, white, one shadow),
//         so the corners run parallel. Artefacts sit in a shell; nothing else gets a box.
// Rows    label grey on the left, value ink on the right; one hairline between groups.
// Space   4 8 12 16 24 32 48 64 96 only.

export const INK = '#181818'
export const GREY = '#666666'
export const LINE = '#EBEBEB'
export const SHELL = '#F4F4F4'
export const SHADOW = '0 1px 2px rgba(0,0,0,0.04), 0 16px 40px -16px rgba(0,0,0,0.16)'

// A two-tone headline: the claim in ink, the rest in grey, one size
export function Headline({ lead, rest, as: Tag = 'h2' }: { lead: ReactNode; rest?: ReactNode; as?: 'h1' | 'h2' | 'p' }) {
  return (
    <Tag className="text-[24px] font-normal leading-[30px] tracking-[-0.02em] text-pretty">
      {lead}{rest && <> <span style={{ color: GREY }}>{rest}</span></>}
    </Tag>
  )
}

// The shell and its panel: the one framed surface
export function Shell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] p-1 ${className}`} style={{ background: SHELL }}>
      <div className="overflow-hidden rounded-[16px] bg-white" style={{ boxShadow: SHADOW }}>{children}</div>
    </div>
  )
}

// Label grey on the left, value ink on the right, a hairline above
export function Rows({ rows }: { rows: [label: string, value: ReactNode][] }) {
  return (
    <dl className="flex flex-col">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 border-t py-3" style={{ borderColor: LINE }}>
          <dt style={{ color: GREY }}>{k}</dt>
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
