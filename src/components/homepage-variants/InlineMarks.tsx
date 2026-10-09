import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const linkClass =
  'inline-flex items-center gap-1.5 align-baseline rounded-sm underline decoration-border decoration-2 underline-offset-[0.2em] hover:decoration-accent transition-colors mx-0.5'

export function EnterpriseAIMark({ href }: { href?: string }) {
  const inner = (
    <>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="inline-block w-[1.05em] h-[1.05em] -translate-y-px shrink-0 text-foreground"
        fill="currentColor"
      >
        <path d="M2 4h8v2H4v4H2V4zm0 8h6v2H2v-2zm0 6h10v2H2v-2zm12-14h2v16h-2V4z" />
      </svg>
      <span>Enterprise AI</span>
    </>
  )
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {inner}
      </a>
    )
  }
  return <span className={`${linkClass} no-underline`}>{inner}</span>
}

export function DispatchMark({ href = 'https://www.dispatchmac.com' }: { href?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      <Image src="/products/dispatch.png" alt="" width={18} height={18} className="inline-block w-[1.05em] h-[1.05em] rounded-sm" />
      <span>Dispatch</span>
    </a>
  )
}

export function ShaderWallMark({ href = 'https://www.shaderwall.com' }: { href?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      <Image src="/products/shader-wall.png" alt="" width={18} height={18} className="inline-block w-[1.05em] h-[1.05em] rounded-sm" />
      <span>Shader Wall</span>
    </a>
  )
}

export function PositioningLine() {
  return (
    <p className="text-xl sm:text-2xl md:text-[1.65rem] leading-snug text-foreground font-medium max-w-3xl">
      Product designer in NYC, shaping enterprise AI at <EnterpriseAIMark href="https://enterpriseai.com" />, and shipping{' '}
      <DispatchMark /> and <ShaderWallMark /> on the side.
    </p>
  )
}

function ToolIcon({ children, label }: { children: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 align-baseline mx-0.5">
      <span className="inline-grid place-items-center w-[1.15em] h-[1.15em] rounded-[3px] border border-border bg-card text-[0.55em] font-semibold leading-none shrink-0 -translate-y-px">
        {children}
      </span>
      <span>{label}</span>
    </span>
  )
}

export function ThinkIntroParagraph() {
  return (
    <div className="space-y-5 text-lg sm:text-xl text-muted leading-relaxed max-w-3xl">
      <p>
        I still start in <ToolIcon label="Figma">Fg</ToolIcon> and <ToolIcon label="Paper">P</ToolIcon> for structure and taste,
        then move the idea into <ToolIcon label="Cursor">Cu</ToolIcon> and <ToolIcon label="Claude">Cl</ToolIcon> so the artefact is
        real HTML with real state.
      </p>
      <p>
        That shift is not vibe coding for me — it is how I run discovery, win RFPs, and give engineers something they can react to.
      </p>
      <p>
        When AI drafts UI, my job is judgment: spacing, words, what to reject, and when a prototype needs a state machine instead of
        another screenshot.
      </p>
      <p>
        This site, Dispatch, Shader Wall, and the Enterprise AI prototypes linked from the{' '}
        <Link href="/variants/showcase" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-accent">
          showcase variant
        </Link>{' '}
        are all built that way.
      </p>
    </div>
  )
}
