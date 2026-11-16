import { COMPANY_MARKS } from '@/content/company-marks'
import { GREY, INK, LINE, SHADOW, SHELL } from './style'

// Each company as a little card, the three side by side across the column: its mark (the facet
// style of the prototypes' app icons, content/company-marks), the name, what the company is, then
// the role and years. The EAI line is a placeholder until we write it
export const COMPANIES: { name: string; mark: string; about: string; role: string; years: string }[] = [
  { name: 'Enterprise AI Group', mark: 'eai', about: 'A platform where consultants build apps with agents', role: 'Lead product designer', years: '2025 – now' },
  { name: 'SEEK', mark: 'seek', about: 'Australia’s largest job marketplace', role: 'Senior product designer', years: '2022 – 2024' },
  { name: 'Best Practice', mark: 'best-practice', about: 'Australia’s largest practice management platform', role: 'Product designer', years: '2019 – 2022' },
]

// Every logo is the dot version (content/company-marks: the marks redrawn on SEEK's 5 × 5 dot grid).
// tiles: the logo tiles on the one-grey card, white or the card's own grey with a hairline.
//
// before: white panels with a shadow on a grey ring (the homepage until 15 Nov)
// grey:   one grey, the companies as columns on it, a hairline between them; the marks turn white
//         (the lines darken a step, since the page's hairline vanishes on the grey)
// flat:   the white panels kept, inset 8px on the grey (12px corners, concentric), a hairline edge, no shadow
export type CompaniesVariant = 'before' | 'grey' | 'flat'

function Mark({ id, tile }: { id: string; tile: string }) {
  const m = COMPANY_MARKS[id]
  return (
    <svg viewBox="0 0 100 100" className="h-10 w-10 shrink-0" aria-hidden>
      <rect width="100" height="100" rx="22" fill={tile} />
      <rect x=".75" y=".75" width="98.5" height="98.5" rx="21.25" fill="none" stroke={INK} strokeOpacity=".08" strokeWidth="1.5" />
      <path d={m.f} fill={INK} />
      {m.h && <path d={m.h} fill={tile} />}
    </svg>
  )
}

function Company({ c, tile, onGrey = false }: { c: (typeof COMPANIES)[number]; tile: string; onGrey?: boolean }) {
  return (
    <>
      <Mark id={`${c.mark}-dots`} tile={tile} />
      <div className="flex flex-col gap-1">
        <h3 className="font-normal">{c.name}</h3>
        <p className="text-[13px] leading-[20px] text-pretty" style={{ color: GREY }}>{c.about}</p>
      </div>
      <div className="mt-auto flex flex-col border-t pt-3 text-[13px] leading-[20px]" style={{ borderColor: onGrey ? 'rgba(0,0,0,0.08)' : LINE, color: GREY }}>
        <span>{c.role}</span>
        <span className="tabular-nums">{c.years}</span>
      </div>
    </>
  )
}

export function CompaniesCard({ variant = 'grey', tiles = 'white' }: { variant?: CompaniesVariant; tiles?: 'white' | 'grey' }) {
  if (variant === 'grey') {
    return (
      <div className="grid grid-cols-1 rounded-[20px] min-[480px]:grid-cols-3" style={{ background: SHELL }}>
        {COMPANIES.map((c, i) => (
          <article
            key={c.name}
            className={`flex flex-col gap-6 p-4 min-[480px]:min-h-[176px] ${i ? 'border-t min-[480px]:border-l min-[480px]:border-t-0' : ''}`}
            style={{ borderColor: 'rgba(0,0,0,0.07)' }}
          >
            <Company c={c} tile={tiles === 'white' ? '#fff' : SHELL} onGrey />
          </article>
        ))}
      </div>
    )
  }
  const flat = variant === 'flat'
  return (
    <div className={`grid grid-cols-1 rounded-[20px] min-[480px]:grid-cols-3 ${flat ? 'gap-2 p-2' : 'gap-1 p-1'}`} style={{ background: SHELL }}>
      {COMPANIES.map((c) => (
        <article
          key={c.name}
          className={`flex flex-col gap-6 bg-white min-[480px]:min-h-[176px] ${flat ? 'rounded-[12px] p-3' : 'rounded-[16px] p-4'}`}
          style={{ boxShadow: flat ? `0 0 0 1px ${LINE}` : SHADOW }}
        >
          <Company c={c} tile={SHELL} />
        </article>
      ))}
    </div>
  )
}

// A company as a hover card, for its name in a sentence (the homepage's .dr-peek): the mark on a
// white tile, the name, what the company is, then the role and years, on one grey. Spans only, so it
// can sit inside a line of text
export function CompanyPeek({ name }: { name: string }) {
  const c = COMPANIES.find((x) => x.name === name)
  if (!c) return null
  return (
    <span className="dr-peek-card dr-co-card" aria-hidden>
      <span className="dr-co-row">
        <Mark id={`${c.mark}-dots`} tile="#fff" />
        <span className="dr-co-text">
          <span className="dr-co-name" style={{ color: INK }}>{c.name}</span>
          <span>{c.about}</span>
        </span>
      </span>
      <span className="dr-co-role">{c.role} · {c.years}</span>
    </span>
  )
}
