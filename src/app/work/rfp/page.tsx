'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { RfpLetter } from '@/components/stageshow/RfpLetter'
import { RecordingReplay } from '@/components/replay/RecordingReplay'
import { CompareTab } from '@/components/site/CompareTab'
import { EMAIL, GREY, Headline, INK, LINE, Moment, Rows } from '@/components/site/style'

// A short case study in the homepage's narrow design (/work/rfp): enough of the work to get someone
// interested and no more. The claim, the result, three moments that show it (a Stageshow scene and
// two replays) and what happened. The text keeps to the 540px column; the artefacts run wider
// (up to 720) so the work leads. Styles and Moment from components/site/style.

export default function RfpCaseStudy() {
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[15px] leading-[22px]" style={{ color: INK }}>
      <main className="mx-auto flex max-w-[588px] flex-col gap-24 px-6 pb-24 pt-16">
        <header className="flex items-start justify-between">
          <Link href="/" className="transition-opacity hover:opacity-70">← Gareth Chainey</Link>
          <span style={{ color: GREY }}>Enterprise AI, 2025</span>
        </header>

        <section className="flex flex-col gap-8">
          <Headline as="h1" lead="One designer answered a state government tender with a working product." rest="Up against vendors with whole teams." />
          <Rows rows={[['My role', 'Sole designer, working with sales. I designed and built it'], ['Deals won since', '$2 million'], ['Designers', '1, where it took 3 to 5'], ['A major feature', 'Days, not weeks'], ['Markets', '2, English and Polish']]} />
        </section>

        <Moment mat line="The working prototype we answered with: open an application and follow it through the council’s workflow.">
          <RecordingReplay src="/replays/rfp/overview.json" bare />
        </Moment>

        <section className="flex flex-col gap-4">
          <Headline lead="Why it worked." rest="People could use it, not just look at it." />
          <p>Before AI, I would have answered with Figma mock-ups and a lot of help. This time I built the product with Claude Code, connected to real models and one set of seed data, so the people judging the tender could try it for themselves.</p>
        </section>

        {/* The client sweep (prototypes/client-sweep): on the dev server only until it's signed off */}
        {process.env.NODE_ENV === 'development' && (
          <Moment mat line="One product, three clients: a council, the state and Poland, each with its own seed data.">
            <InViewVideo src="/case-studies/rfp/scale.mp4" poster="/case-studies/rfp/scale-poster.png" />
          </Moment>
        )}

        <Moment scene line="Tick a reviewer’s issue in, and it’s written into the request for information.">
          <RfpLetter bare />
        </Moment>

        <Moment mat line="Rough notes in a field, rewritten by a live model the way that council writes its reports.">
          <RecordingReplay src="/replays/rfp/spot-rewrite.json" region={{ x: 802, y: 117, width: 555, height: 336 }} bare />
        </Moment>

        <section className="flex flex-col gap-4">
          <Headline lead="What happened next." rest="The prototype outlived the tender." />
          <Rows rows={[['Today', 'Still iterated on'], ['Engineering', 'Kept building on it, no hand-off'], ['Design', 'Ahead of the build, not held to its limits']]} />
        </section>

        <footer className="flex flex-col gap-4 border-t pt-8" style={{ borderColor: LINE }}>
          <Headline lead="The rest is better as a conversation." rest={<>Write to me at <a href={`mailto:${EMAIL}`} className="underline decoration-[#c8c8c8] underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-current">{EMAIL}</a>.</>} />
          <Link href="/" className="self-start transition-opacity hover:opacity-70" style={{ color: GREY }}>← Back to the work</Link>
        </footer>
      </main>
      <CompareTab />
    </div>
  )
}

// Plays only while on screen; reduced motion keeps the poster
function InViewVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) el.play().catch(() => {}); else el.pause() }, { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" className="block aspect-[16/10] w-full object-cover" />
}
