'use client'

import { Header } from '@/components/Header'
import { ReplayVsVideo } from '@/components/replay/ReplayVsVideo'

// The essay 'Screen recordings as HTML, not video' (html-not-video in projects.ts links here): the
// comparison needs the full width, so it is a page of its own. The comparison is also a component
// posts can embed ('replay-vs-video').
export default function ReplayVsVideoPage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header showBack />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-14">
        <div className="max-w-2xl py-14">
          <h1 className="mb-5 text-5xl font-medium text-foreground">Screen recordings as HTML, not video</h1>
          <p className="text-xl leading-relaxed text-muted">
            The recordings on this site aren&apos;t videos. They&apos;re the real page, recorded as HTML: its HTML and
            CSS once, then every change to it, played back by the browser. Here are four of them both ways. Flip
            between video and HTML, zoom in,
            or go full screen, where the difference shows most.
          </p>
        </div>

        <ReplayVsVideo />

        <div className="mt-16 grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="mb-4 text-xl font-medium text-foreground">What each file holds</h2>
            <ul className="space-y-2 text-muted">
              <li><span className="text-foreground">Video:</span> every pixel of every frame, 60 times a second</li>
              <li><span className="text-foreground">HTML:</span> the page once, then only what changes: a click, new text, a scroll</li>
              <li>A still screen costs the HTML almost nothing. Its size follows the changes, not the length or the resolution</li>
              <li>Text compresses well on the way to the browser. Video is already compressed, so it goes as it is</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-4 text-xl font-medium text-foreground">Why it&apos;s better</h2>
            <ul className="space-y-2 text-muted">
              <li><span className="text-foreground">Sharp at any size.</span> The browser draws the text, so zoom in and it stays crisp</li>
              <li><span className="text-foreground">Exact colours.</span> Mac browsers shift the colours of video; HTML matches the page around it</li>
              <li><span className="text-foreground">Editable after recording.</span> Captions timed to clicks, zooms and highlights, without another take</li>
            </ul>
          </section>
          <section className="md:col-span-2">
            <h2 className="mb-4 text-xl font-medium text-foreground">Where it doesn&apos;t work</h2>
            <ul className="space-y-2 text-muted">
              <li>Only web UIs: anything drawn on a canvas, like a game, doesn&apos;t record as HTML</li>
              <li>It records what is in the page, hidden values too, so check it before you publish</li>
              <li>It isn&apos;t a file you can post to social media; for that you still need a video</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
