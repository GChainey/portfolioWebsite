'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ShowCard } from '@/content/homepage-variant-data'
import { cn } from '@/lib/utils'

const spanClass: Record<ShowCard['span'], string> = {
  hero: 'md:col-span-2 md:row-span-2',
  wide: 'md:col-span-2',
  full: 'md:col-span-4',
  tall: 'md:row-span-2',
  default: '',
}

interface BentoWorkCardProps {
  card: ShowCard
}

function CardMedia({ card }: { card: ShowCard }) {
  if (card.posterImage) {
    return (
      <Image
        src={card.posterImage}
        alt=""
        fill
        className="object-cover object-top"
        sizes="(max-width:768px) 100vw, 40vw"
      />
    )
  }

  if (card.liveSrc) {
    return (
      <iframe
        src={card.liveSrc}
        title={card.title}
        className="absolute inset-0 w-full h-full border-0 pointer-events-none"
        loading="eager"
        tabIndex={-1}
      />
    )
  }

  if (card.image) {
    return (
      <Image
        src={card.image}
        alt=""
        fill
        className="object-cover object-top"
        sizes="(max-width:768px) 100vw, 40vw"
      />
    )
  }

  return <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-border/40 to-background" />
}

export function BentoWorkCard({ card }: BentoWorkCardProps) {
  const Wrapper = card.external ? 'a' : Link
  const wrapperProps = card.external
    ? { href: card.href, target: '_blank' as const, rel: 'noopener noreferrer' }
    : { href: card.href }

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'group flex flex-col overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem]',
        'bg-card border border-border shadow-sm',
        'transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        spanClass[card.span],
      )}
    >
      <div className="relative w-full aspect-[16/10] min-h-[200px] sm:min-h-[220px] overflow-hidden bg-muted/20 border-b border-border">
        <CardMedia card={card} />
        {card.liveSrc && !card.posterImage ? (
          <span className="absolute top-2.5 left-2.5 z-10 rounded-full bg-background/90 backdrop-blur px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide text-muted border border-border">
            Live
          </span>
        ) : null}
        {card.metric ? (
          <span className="absolute top-2.5 right-2.5 z-10 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-[11px] font-mono text-muted border border-border">
            {card.metric}
          </span>
        ) : null}
      </div>

      <div className="relative z-10 p-4 sm:p-5 bg-card">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h2 className="text-base sm:text-lg font-medium text-foreground group-hover:text-accent transition-colors">{card.title}</h2>
          <ArrowUpRight className="w-4 h-4 shrink-0 text-muted group-hover:text-accent transition-colors" />
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{card.hoverProblem}</p>
        <p className="mt-2 text-xs uppercase tracking-wide text-muted leading-relaxed">{card.hoverRole}</p>
      </div>
    </Wrapper>
  )
}
