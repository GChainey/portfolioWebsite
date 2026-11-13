'use client'

import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { Header } from '@/components/Header'
import { sizzleSeconds } from '@/content/sizzle'

// Launchpad for comparing the homepage designs, the older showcase variants and the sizzle reels.
// A design opens the homepage with ?design=<design>; an older variant opens it scrolled to the work
// (?home=<variant>#work). Nothing links here.

// The homepage under the hero (HomeDesign in context/FeatureFlagContext.tsx)
const DESIGNS = [
  { id: 'showcase', name: 'Showcase', tag: 'Live now', note: 'Each section a row of ¾ cards, the next one peeking, impact under each.' },
  { id: 'strip', name: 'One strip', tag: 'New', note: 'Every piece in one sideways strip, pictures only. The section title changes as you go; click a piece for its words.' },
  { id: 'horizontal', name: 'Horizontal', tag: 'Parked', note: 'A piece\'s clips run sideways, section by section.' },
  { id: 'vertical', name: 'Vertical', tag: 'Parked', note: 'Every piece and its clips straight down the page.' },
  { id: 'website', name: 'Website', tag: 'Parked', note: 'One big picture per piece.' },
  { id: 'list', name: 'List', tag: 'Parked', note: 'The earlier list, kind words between the pieces.' },
] as const

const VARIANTS = [
  { id: 'tiles', name: 'Tiles', tag: 'Parked', note: 'The tiles that were live before the showcase.' },
  { id: 'carousel', name: 'Carousels', tag: 'Parked', note: 'One large preview at a time, products then case studies.' },
  { id: 'autoplay', name: '1 · Autoplay', tag: 'Better carousel', note: 'Each reel plays through and hands over to the next. The read slides over the stage.' },
  { id: 'coverflow', name: '2 · Coverflow', tag: 'Better carousel', note: 'All six on one draggable track, neighbours either side, filter by kind.' },
  { id: 'scrolly', name: '3 · Scroll story', tag: 'Favourite', note: 'Full width. Features and thinking scroll past a stage that stays put and plays.' },
  { id: 'billboard', name: '4 · Billboard', tag: 'Maximal', note: 'Dark, full width, each piece in its own colour, headlines landing word by word.' },
  { id: 'wall', name: '5 · The wall', tag: 'Maximal', note: 'Everything playing at once. Click a tile and it grows into the whole piece.' },
] as const

// Two ways to read a case study (?style= on its page, components/CaseStudyIssue)
const STYLES = [
  { href: '/projects/rfp', image: 'style-classic', name: 'The article', tag: 'Current', note: 'The case study as written: a hero reel, then the story with clips between the paragraphs.' },
  { href: '/projects/rfp?style=issue', image: 'style-issue', name: 'The issue', tag: 'New', note: 'After Dia’s release notes: the work first, then three chapters, the impact, the delight and how AI made it possible. RFP only so far.' },
] as const

const CUTS = ['30', '60', '90'] as const

export default function ShowcaseLaunchpad() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-7xl mx-auto pt-14">
        <div className="border-x border-border">
          <div className="px-8 py-10 border-b border-border">
            <p className="text-xs text-muted uppercase tracking-widest mb-2">Launchpad</p>
            <h1 className="text-3xl font-medium tracking-tight text-foreground mb-2">Ways to show the work</h1>
            <p className="text-muted max-w-2xl">Each opens the homepage in that design. It only changes this one visit; the flag drawer (⌘K) keeps a choice.</p>
          </div>

          {/* The designs */}
          <div className="px-8 pt-10 pb-4">
            <p className="text-xs text-muted uppercase tracking-widest">Homepage designs</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-border">
            {DESIGNS.map((v, i) => (
              <Link
                key={v.id}
                href={`/?design=${v.id}`}
                className={`group block p-6 border-b border-border ${i % 3 !== 2 ? 'lg:border-r' : ''} ${i % 2 === 0 ? 'sm:max-lg:border-r' : ''}`}
              >
                <div className="relative overflow-hidden rounded-xl border border-border bg-[#fafafa]" style={{ aspectRatio: '16 / 10' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/showcase/variants/design-${v.id}.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">{v.tag}</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-foreground group-hover:text-accent transition-colors">{v.name}</h2>
                    <p className="mt-1 text-sm text-muted">{v.note}</p>
                  </div>
                  <ArrowRight className="mt-1 w-4 h-4 shrink-0 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          {/* The case study styles */}
          <div className="px-8 pt-10 pb-4">
            <p className="text-xs text-muted uppercase tracking-widest">Case study styles</p>
          </div>
          <div className="grid sm:grid-cols-2 border-t border-border">
            {STYLES.map((v, i) => (
              <Link key={v.href} href={v.href} className={`group block p-6 border-b border-border ${i === 0 ? 'sm:border-r' : ''}`}>
                <div className="relative overflow-hidden rounded-xl border border-border bg-[#fafafa]" style={{ aspectRatio: '16 / 10' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/showcase/variants/${v.image}.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">{v.tag}</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-foreground group-hover:text-accent transition-colors">{v.name}</h2>
                    <p className="mt-1 text-sm text-muted">{v.note}</p>
                  </div>
                  <ArrowRight className="mt-1 w-4 h-4 shrink-0 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          {/* The older variants of the work, on the page as written */}
          <div className="px-8 pt-10 pb-4">
            <p className="text-xs text-muted uppercase tracking-widest">Older layouts of the work</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-t border-border">
            {VARIANTS.map((v, i) => (
              <Link
                key={v.id}
                href={`/?home=${v.id}#work`}
                className={`group block p-6 border-b border-border ${i % 3 !== 2 ? 'lg:border-r' : ''} ${i % 2 === 0 ? 'sm:max-lg:border-r' : ''}`}
              >
                <div className="relative overflow-hidden rounded-xl border border-border bg-black" style={{ aspectRatio: '16 / 10' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/showcase/variants/${v.id}.webp`} alt="" className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">{v.tag}</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-foreground group-hover:text-accent transition-colors">{v.name}</h2>
                    <p className="mt-1 text-sm text-muted">{v.note}</p>
                  </div>
                  <ArrowRight className="mt-1 w-4 h-4 shrink-0 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>

          {/* The reels */}
          <div className="px-8 pt-10 pb-4">
            <p className="text-xs text-muted uppercase tracking-widest">Sizzle reels</p>
          </div>
          <div className="grid sm:grid-cols-3 border-t border-border">
            {CUTS.map((c, i) => (
              <Link key={c} href={`/reel?cut=${c}`} className={`group block p-6 border-b border-border ${i < CUTS.length - 1 ? 'sm:border-r' : ''}`}>
                <div
                  className="relative flex items-center justify-center overflow-hidden rounded-xl border border-border"
                  style={{ aspectRatio: '16 / 10', background: 'radial-gradient(ellipse 80% 70% at 70% 30%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 70%), #09090b' }}
                >
                  <span className="text-6xl font-semibold tracking-tighter text-white">{c}<span className="text-white/50 text-3xl">s</span></span>
                  <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:scale-110">
                    <Play className="w-4 h-4 translate-x-px" />
                  </span>
                </div>
                <div className="mt-4">
                  <h2 className="font-medium text-foreground group-hover:text-accent transition-colors">{c} second cut</h2>
                  <p className="mt-1 text-sm text-muted">{Math.round(sizzleSeconds(c))} seconds{c === '90' ? ', earlier work included' : c === '60' ? ', products then case studies' : ', one beat per piece'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
