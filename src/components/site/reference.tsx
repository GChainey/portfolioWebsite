'use client'

import { Fragment, useState } from 'react'
import { GREY, INK, LINE, SHADOW } from './style'

// A reference in running text: an underlined phrase that shows a small card on hover or focus
// (what it is and why it matters here) and opens the source on click. Written in content as
// [the words](https://link), with the card's words in REFERENCES by link.

type Ref = { title: string; by: string; note: string }

export const REFERENCES: Record<string, Ref> = {
  'https://en.wikipedia.org/wiki/A_Pattern_Language': {
    title: 'A Pattern Language',
    by: 'Christopher Alexander, 1977',
    note: 'Design as a set of patterns, each a solution to a problem that keeps coming back, that combine into a whole. Reuse the pattern and the whole stays coherent as it grows.',
  },
}

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'

function Reference({ href, children }: { href: string; children: string }) {
  const [open, setOpen] = useState(false)
  const ref = REFERENCES[href]
  return (
    <span className="relative inline-block" onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)} onPointerLeave={() => setOpen(false)}>
      <a href={href} target="_blank" rel="noopener noreferrer" onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
        className="underline decoration-[#BDBDBD] underline-offset-[3px] transition-[text-decoration-color] duration-150 hover:decoration-current">
        {children}
      </a>
      {ref && (
        <span role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 block w-[280px] rounded-[12px] bg-white p-3 text-[13px] leading-[20px]"
          style={{
            boxShadow: SHADOW, outline: `1px solid ${LINE}`, color: INK,
            opacity: open ? 1 : 0, transform: open ? 'none' : 'translateY(4px) scale(0.97)', transformOrigin: 'bottom left',
            transition: `opacity 150ms ease, transform 150ms ${EASE_OUT}`,
          }}>
          <span className="block">{ref.title}</span>
          <span className="block" style={{ color: GREY }}>{ref.by}</span>
          <span className="mt-2 block text-pretty" style={{ color: GREY }}>{ref.note}</span>
        </span>
      )}
    </span>
  )
}

// Text with [words](link) references in it
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  return <>{parts.map((p, i) => {
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    return m ? <Reference key={i} href={m[2]}>{m[1]}</Reference> : <Fragment key={i}>{p}</Fragment>
  })}</>
}
