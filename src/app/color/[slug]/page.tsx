import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Recollection } from '@/components/color/Recollection'
import { Relativity } from '@/components/color/Relativity'
import { Contexture } from '@/components/color/Contexture'
import { Paper } from '@/components/color/Paper'
import { Lightness } from '@/components/color/Lightness'
import { ReversedGrounds } from '@/components/color/ReversedGrounds'
import { Subtraction } from '@/components/color/Subtraction'
import { AfterImage } from '@/components/color/AfterImage'
import { Transparence } from '@/components/color/Transparence'
import { FactualMixtures } from '@/components/color/FactualMixtures'
import { SpaceIllusion } from '@/components/color/SpaceIllusion'
import { OpticalMixture } from '@/components/color/OpticalMixture'
import { Bezold } from '@/components/color/Bezold'
import { Intervals } from '@/components/color/Intervals'
import { Intersecting } from '@/components/color/Intersecting'
import { Quantity } from '@/components/color/Quantity'
import { FilmVolume } from '@/components/color/FilmVolume'
import { FreeStudies } from '@/components/color/FreeStudies'
import { Masters } from '@/components/color/Masters'
import { WeberFechner } from '@/components/color/WeberFechner'
import { Temperature } from '@/components/color/Temperature'
import { Vibrating } from '@/components/color/Vibrating'
import { Vanishing } from '@/components/color/Vanishing'
import { Systems } from '@/components/color/Systems'
import { Teaching } from '@/components/color/Teaching'
import { COLOR_CHAPTERS, COLOR_LIVE, type ColorChapter } from '@/content/color'

// One page per chapter of Interaction of Color: the exercise, then what it taught me.
// A new chapter is an entry in COLOR_CHAPTERS and a component here.
const EXERCISES: Record<string, () => JSX.Element> = {
  recollection: Recollection,
  relativity: Relativity,
  'contexture': Contexture,
  'paper': Paper,
  'lightness': Lightness,
  'reversed-grounds': ReversedGrounds,
  'subtraction': Subtraction,
  'after-image': AfterImage,
  'transparence': Transparence,
  'factual-mixtures': FactualMixtures,
  'space': SpaceIllusion,
  'optical-mixture': OpticalMixture,
  'bezold': Bezold,
  'intervals': Intervals,
  'intersecting': Intersecting,
  'quantity': Quantity,
  'film-volume': FilmVolume,
  'free-studies': FreeStudies,
  'masters': Masters,
  'weber-fechner': WeberFechner,
  'temperature': Temperature,
  'vibrating': Vibrating,
  'vanishing': Vanishing,
  'systems': Systems,
  'teaching': Teaching,
}

export function generateStaticParams() {
  return COLOR_CHAPTERS.map((c) => ({ slug: c.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const chapter = COLOR_CHAPTERS.find((c) => c.slug === params.slug)
  return chapter ? { title: `${chapter.numeral}. ${chapter.title} | Interaction of Color | Gareth Chainey` } : {}
}

export default function ColorChapterPage({ params }: { params: { slug: string } }) {
  const index = COLOR_CHAPTERS.findIndex((c) => c.slug === params.slug)
  const chapter = COLOR_CHAPTERS[index]
  const Exercise = EXERCISES[params.slug]
  if (!COLOR_LIVE || !chapter || !Exercise) notFound()
  const prev = COLOR_CHAPTERS[index - 1]
  const next = COLOR_CHAPTERS[index + 1]

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header showBack />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-14">
        <div className="py-14">
          <nav aria-label="Interaction of Color series" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-widest text-muted">
            <Link href="/color" className="hover:text-foreground">
              Interaction of Color
            </Link>
            <span aria-hidden>·</span>
            <ol className="flex flex-wrap gap-x-3 gap-y-1 font-serif text-sm normal-case tracking-normal">
              {COLOR_CHAPTERS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/color/${c.slug}`}
                    title={c.title}
                    aria-current={c.slug === chapter.slug ? 'page' : undefined}
                    className={c.slug === chapter.slug ? 'text-accent' : 'hover:text-foreground'}
                  >
                    {c.numeral}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="mt-4 flex items-baseline gap-4 hyphens-auto break-words text-4xl font-medium text-foreground sm:text-5xl" lang="en">
            <span className="font-serif font-normal text-muted">{chapter.numeral}</span>
            {chapter.title}
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-muted">{chapter.blurb}</p>
        </div>

        <Exercise />

        <section className="mt-20 border-t border-border pt-10">
          <h2 className="mb-4 text-3xl font-medium text-foreground">What I learned</h2>
          <ul className="max-w-2xl list-disc space-y-2 pl-5 text-muted">
            {chapter.learned.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-muted">
            From chapter {chapter.numeral} of Josef Albers, <em>Interaction of Color</em> (1963).
          </p>
        </section>

        <nav aria-label="More chapters" className="mt-16 grid gap-4 border-t border-border pt-10 sm:grid-cols-2">
          {prev ? <ChapterLink chapter={prev} label="Previous chapter" /> : <span />}
          {next ? (
            <ChapterLink chapter={next} label="Next chapter" alignEnd />
          ) : (
            <Link href="/color" className="group rounded border border-border p-5 sm:text-right">
              <span className="text-xs uppercase tracking-widest text-muted">The series</span>
              <span className="mt-2 block text-foreground group-hover:text-accent">All chapters so far</span>
            </Link>
          )}
        </nav>
      </main>
    </div>
  )
}

function ChapterLink({ chapter, label, alignEnd }: { chapter: ColorChapter; label: string; alignEnd?: boolean }) {
  return (
    <Link href={`/color/${chapter.slug}`} className={`group rounded border border-border p-5 ${alignEnd ? 'sm:text-right' : ''}`}>
      <span className="text-xs uppercase tracking-widest text-muted">{label}</span>
      <span className="mt-2 block text-foreground group-hover:text-accent">
        <span className="font-serif text-muted">{chapter.numeral}</span> {chapter.title}
      </span>
    </Link>
  )
}
