import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { COLOR_CHAPTERS, COLOR_LIVE } from '@/content/color'

// Interaction of Color, one chapter at a time. Content is src/content/color.ts.
export default function ColorPage() {
  if (!COLOR_LIVE) notFound()

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header showBack />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-14">
        <div className="py-14">
          <p className="mb-4 text-xs uppercase tracking-widest text-muted">A series, {COLOR_CHAPTERS.length} chapters so far</p>
          <h1 className="mb-5 text-5xl font-medium text-foreground">Interaction of Color</h1>
          <p className="max-w-2xl text-xl leading-relaxed text-muted">
            I&apos;m reading Josef Albers&apos; book a chapter at a time and rebuilding each exercise for the
            browser. Albers worked with sheets of coloured paper. On a screen you can change a colour and see the
            effect straight away.
          </p>
        </div>

        <Link href="/color/reel" className="group mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
          <span aria-hidden>▶</span>
          <span className="group-hover:text-accent">Watch a few of them in a short reel</span>
        </Link>

        <ol className="border-t border-border">
          {COLOR_CHAPTERS.map((c) => (
            <li key={c.slug} className="border-b border-border">
              <Link href={`/color/${c.slug}`} className="group grid grid-cols-[3rem_1fr] gap-4 py-6">
                <span className="font-serif text-2xl text-muted">{c.numeral}</span>
                <span>
                  <span className="block text-xl text-foreground group-hover:text-accent">{c.title}</span>
                  <span className="mt-1 block text-muted">{c.blurb}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </div>
  )
}
