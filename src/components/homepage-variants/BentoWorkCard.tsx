'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ShowCard } from '@/content/homepage-variant-data'
import { cn } from '@/lib/utils'

const spanClass: Record<ShowCard['span'], string> = {
  hero: 'md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[420px]',
  wide: 'md:col-span-2 min-h-[220px]',
  tall: 'md:row-span-2 min-h-[280px]',
  default: 'min-h-[200px]',
}

interface BentoWorkCardProps {
  card: ShowCard
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
        'group relative flex flex-col overflow-hidden rounded-[1.25rem] sm:rounded-[1.5rem]',
        'bg-card border border-border shadow-sm',
        'transition-transform duration-500 ease-out hover:-translate-y-1 hover:shadow-md',
        spanClass[card.span],
      )}
    >
      <div className="absolute inset-0 z-0">
        {card.liveSrc ? (
          <iframe
            src={card.liveSrc}
            title={card.title}
            className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-[1.02] origin-center"
            loading="lazy"
            tabIndex={-1}
          />
        ) : card.image ? (
          <Image src={card.image} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, 50vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-border/40 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-background/10" />
      </div>

      {card.metric ? (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur px-2.5 py-1 text-[11px] font-mono text-muted border border-border">
          {card.metric}
        </span>
      ) : null}

      <div className="relative z-10 mt-auto p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base sm:text-lg font-medium text-foreground group-hover:text-accent transition-colors">{card.title}</h2>
          <ArrowUpRight className="w-4 h-4 shrink-0 text-muted group-hover:text-accent transition-colors" />
        </div>
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
          <div className="overflow-hidden">
            <p className="pt-2 text-sm text-muted leading-relaxed">
              <span className="text-foreground/90">{card.hoverProblem}</span>
              <span className="block mt-1.5 text-xs uppercase tracking-wide text-muted">{card.hoverRole}</span>
            </p>
          </div>
        </div>
      </div>
    </Wrapper>
  )
}
