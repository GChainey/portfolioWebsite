'use client'

import { Header } from '@/components/Header'
import { ReplayVsVideo } from '@/components/replay/ReplayVsVideo'

// The replay-vs-video comparison on a page of its own, to link to from a post. Unlisted: the
// site doesn't link here. The comparison is also a component posts can embed ('replay-vs-video').
export default function ReplayVsVideoPage() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header showBack />
      <main className="mx-auto max-w-5xl px-6 pb-24 pt-14">
        <div className="max-w-2xl py-14">
          <h1 className="mb-5 text-5xl font-medium text-foreground">Screen recordings as replays, not video</h1>
          <p className="text-xl leading-relaxed text-muted">
            The recordings on this site aren&apos;t videos. They&apos;re replays of the real page: its HTML and CSS,
            and every change to it. Here is the same clip both ways.
          </p>
        </div>

        <ReplayVsVideo />

        <div className="mt-16 grid gap-10 md:grid-cols-2">
          <section>
            <h2 className="mb-4 text-xl font-medium text-foreground">What each file holds</h2>
            <ul className="space-y-2 text-muted">
              <li><span className="text-foreground">Video:</span> every pixel of every frame, 60 times a second</li>
              <li><span className="text-foreground">Replay:</span> the page once, then only what changes: a click, new text, a scroll</li>
              <li>A still screen costs a replay almost nothing. Its size follows the changes, not the length or the resolution</li>
              <li>Text compresses well on the way to the browser. Video is already compressed, so it goes as it is</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-4 text-xl font-medium text-foreground">Why it&apos;s better</h2>
            <ul className="space-y-2 text-muted">
              <li><span className="text-foreground">Sharp at any size.</span> The browser draws the text, so zoom in and it stays crisp</li>
              <li><span className="text-foreground">Exact colours.</span> Mac browsers shift the colours of video; a replay matches the page around it</li>
              <li><span className="text-foreground">Editable after recording.</span> Captions timed to clicks, zooms and highlights, without another take</li>
            </ul>
          </section>
          <section className="md:col-span-2">
            <h2 className="mb-4 text-xl font-medium text-foreground">Where it doesn&apos;t work</h2>
            <ul className="space-y-2 text-muted">
              <li>Only web UIs: anything drawn on a canvas, like a game, doesn&apos;t replay</li>
              <li>It records what is in the page, hidden values too, so check it before you publish</li>
              <li>It isn&apos;t a file you can post to social media; for that you still need a video</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
