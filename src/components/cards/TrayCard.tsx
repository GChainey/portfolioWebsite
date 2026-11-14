import type { ReactNode } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'

// The card style chosen in Paper (page "Narrow homepage (to design)", after Dia's tray): a grey
// tray with the preview in a white card on it, and the details on the grey below. One component
// for a product, a case study or a feature; TestimonialTray is the same tray with a quote in the
// white card. Two sizes of type (15 and 24, a 48 for the one big figure), ink and one grey.

const INK = '#181818'
const GREY = '#666666'

export type TrayLink = { label: string; href: string; external?: boolean; primary?: boolean }

function Pill({ link }: { link: TrayLink }) {
  const cls = `inline-flex items-center rounded-full px-3 py-1.5 text-[15px] leading-[22px] transition-[transform,opacity] duration-150 ease-out active:scale-[0.97] ${link.primary ? 'bg-[#181818] text-white hover:opacity-85' : 'bg-white text-[#181818] shadow-[0_0_0_1px_#E2E2E2] hover:shadow-[0_0_0_1px_#C8C8C8]'}`
  return link.external
    ? <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>{link.label} ↗</a>
    : <Link href={link.href} className={cls}>{link.label} →</Link>
}

// The tray and its white card: the shared shell
function Tray({ card, children, className = '' }: { card: ReactNode; children: ReactNode; className?: string }) {
  return (
    <article className={`flex flex-col rounded-[26px] bg-[#F4F4F4] p-2 ${className}`} style={{ color: INK }}>
      <div className="overflow-hidden rounded-[20px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-16px_rgba(0,0,0,0.18)]">{card}</div>
      {children}
    </article>
  )
}

export function TrayCard({ preview, title, descriptor, summary, figure, facts, ticks, note, link, className }: {
  preview: ReactNode // a Stageshow scene designed at the card's size (about 520 wide), filling the white card
  title: string
  descriptor?: string // what it is, grey, on the title's right
  summary?: string
  figure?: { value: string; unit: string } // the one big number
  facts?: [label: string, value: string][]
  ticks?: string[]
  note?: string // grey, beside the link
  link?: TrayLink
  className?: string
}) {
  return (
    <Tray card={preview} className={className}>
      <div className="flex flex-col gap-5 px-5 pb-3.5 pt-[22px]">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-[24px] font-normal leading-[28px] tracking-[-0.02em]">{title}</h3>
          {descriptor && <span className="shrink-0 text-[15px] leading-[22px]" style={{ color: GREY }}>{descriptor}</span>}
        </div>
        {summary && <p className="text-[15px] leading-[22px]" style={{ color: GREY }}>{summary}</p>}
        {figure && (
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-[48px] leading-[52px] tracking-[-0.03em]">{figure.value}</span>
            <span className="text-[15px] leading-[22px]" style={{ color: GREY }}>{figure.unit}</span>
          </p>
        )}
        {facts && (
          <dl className="flex flex-col gap-2 text-[15px] leading-[22px]">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4"><dt style={{ color: GREY }}>{label}</dt><dd className="text-right">{value}</dd></div>
            ))}
          </dl>
        )}
        {ticks && (
          <ul className="flex flex-col gap-2.5 border-t border-[#E2E2E2] pt-[18px] text-[15px] leading-[22px]">
            {ticks.map((t) => <li key={t} className="flex items-center gap-3"><Check className="h-4 w-4 shrink-0" strokeWidth={2} />{t}</li>)}
          </ul>
        )}
        {(note || link) && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15px] leading-[22px]" style={{ color: GREY }}>{note}</span>
            {link && <Pill link={link} />}
          </div>
        )}
      </div>
    </Tray>
  )
}

export function TestimonialTray({ pull, rest, company, name, role, link, className }: {
  pull: string // the line that carries it, 24px
  rest?: string // more of the quote, word for word, grey
  company: string
  name: string
  role: string
  link?: TrayLink
  className?: string
}) {
  return (
    <Tray
      className={className}
      card={
        <blockquote className="flex flex-col gap-4 p-7">
          <p className="text-[24px] leading-[28px] tracking-[-0.02em] text-pretty">“{pull}”</p>
          {rest && <p className="text-[15px] leading-[22px]" style={{ color: GREY }}>{rest}</p>}
        </blockquote>
      }
    >
      <div className="flex items-center gap-3 px-4 pb-2 pt-3.5">
        <span className="rounded-md bg-[#E6E6E6] px-2 py-0.5 text-[12px] leading-4 tracking-[0.04em] text-[#525252]">{company}</span>
        <span className="flex-1 text-[15px] leading-[22px]" style={{ color: GREY }}>{name}, {role}</span>
        {link && <Pill link={link} />}
      </div>
    </Tray>
  )
}
