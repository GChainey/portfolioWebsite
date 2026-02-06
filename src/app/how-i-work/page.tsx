'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Monitor, Github, Mic, Triangle } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatInterface } from '@/components/ChatInterface'
import { useFeatureFlags } from '@/context/FeatureFlagContext'

const TOOLS = [
  {
    name: 'Conductor',
    description: 'Run multiple AI coding agents in parallel across separate workspaces.',
    icon: Monitor,
  },
  {
    name: 'GitHub',
    description: 'Issues as task inputs, feature branches for each workspace, merge when happy.',
    icon: Github,
  },
  {
    name: 'SuperWhisper',
    description: 'Voice-to-text for dictating instructions to agents hands-free.',
    icon: Mic,
  },
  {
    name: 'Vercel',
    description: 'Instant preview deployments to verify each change before merging.',
    icon: Triangle,
  },
]

// Full transcript kept for LLM context (not rendered on page)
const TRANSCRIPT_FOR_LLM = `
[0:00] Just an example of how I'm working right now is I have my website here. I have Conductor open up here. This is my portfolio website.
[0:12] What I'm doing is I'm just creating issues in here. For example, make CV also a page of an LLM integration, and I'll just copy in that and make a new workspace.
[0:27] And I'll just paste the link in and then go into voice mode and say the URL is what work we're gonna do next. It's about making my CV into an interactive page, read the ticket, and then create a feature branch that goes and does it.
[1:03] And now that's in here, and I run a setup — it's running a setup script, so it'll automatically run when it's ready.
[1:11] Now I have a few ones going. So when I have mobile feed, for example, where I'm trying something on mobile.
[2:08] So then if I go, for example, feed — this one here has a feed version, which I'm just thinking maybe for mobile, it'll be cool to have it as a feed where you can see, show me essays or all, and things are tagged correctly.
[2:25] You can click the essay. It opens it. You can read it. You can interact with the Gareth bot here. Right now the LLM is not connected to staging, but that's the example.
[3:01] So that's what Conductor lets me do — I have my separate items in my branches. I have my issues being made. What Conductor lets me do is create simultaneous sessions at once so I can read now what the plan is here.
[3:31] I'm expecting this interactive CV page to be ready soon. But I can just run multiple things at once, and then have them spin up their own local environment for me to test.
[3:43] And if I'm happy, then I can just merge it.
[3:50] So now one of these is done. I can click open up for the add contact page. I come in, I get contact, and now I have my get in touch page, which I can then verify.
[4:03] I can check that it works at day and night mode, change the theme color, see how Gareth LLM works.
[4:20] Now I can review the plan. While that's happening, I can — let's say I'm happy with that — I can just say push to remote and main, which it will now do.
[4:38] Create a CV route that displays Gareth's CV as a rich interactive page with AI chat for Q&A. The PDF is still downloadable.
[4:50] I'm kinda speed running this because I'm doing this demo. But as a designer, it's actually helpful to iterate and refine rather than one-shot something — it's easier for me to see something, decide I don't like something.
[5:11] So that one's done. I can now archive that, and that will now start going live on the first Vercel project I have, which is the website.
[5:24] So now we can go onto portfolio. We see a build is happening. I can go visit that.
[5:50] A few minutes have passed and there's a version of the site that might be working now.
[6:11] The CV. So now I click CV. Now I have my CV as a page where we have my experience that's coming through from HTML, as a designer. It's pulled in my kind words from colleagues for my testimonials.
[6:36] Again, just test theming. Theming's working, and I probably messed up the LLM so I can start asking these questions.
[6:45] But my plan here is that I will generate a bunch of questions from the LLM. I'll, through voice, answer them going up for a walk, put them up to transcribe, and then even capture some of the snippets.
[6:59] So if there's an audio bit, we can put that in there so it's a bit more human.
[7:06] And if I'm happy with that — I can say push that to remote and main, and then now I'm gonna have two new pages in the span of about ten minutes for both my CV and contact page, and I'm gonna start doing iterations.
`

const HOW_I_WORK_CONTEXT = {
  page: 'How I Work',
  description: `This page shows a video demo and essay about Gareth's AI-augmented workflow. He uses Conductor to run multiple AI coding agents in parallel, GitHub issues as task inputs, SuperWhisper for voice-to-text dictation, and Vercel for instant preview deployments.

His workflow: create an issue → open a Conductor workspace → paste the issue link → describe the task via voice → let the agent create a feature branch and build it → verify on a local preview → merge when happy. He can run multiple workspaces simultaneously — for example building a CV page and contact page at the same time — and ship both in about ten minutes.

He prefers iterating and refining over one-shotting, finding it easier as a designer to see something and decide what to change.

Here is the full transcript from the demo video for reference:
${TRANSCRIPT_FOR_LLM}`,
  suggestedQuestions: [
    'How do you use AI agents day-to-day?',
    'What is Conductor?',
    'How long does it take to ship a feature?',
  ],
  followUpQuestions: [
    'How do you handle iteration and refinement?',
    'What role does voice play in your workflow?',
    'How do you verify changes before merging?',
    'Can you run multiple features at once?',
    'What does your ideal design-to-code loop look like?',
  ],
}

export default function HowIWorkPage() {
  const [chatOpen, setChatOpen] = useState(true)
  const { flags } = useFeatureFlags()

  // Scroll to top on mount
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background transition-colors duration-700">
      <Header showBack />

      <div className="max-w-7xl mx-auto pt-14">
        <div className="flex min-h-[calc(100vh-56px)]">

          <main className="flex-1 min-w-0 border-x border-border">
            {/* Header section */}
            <section className={`p-8 ${flags.sectionTitleBorders ? 'border-b border-border' : ''}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs text-muted uppercase tracking-widest mb-4">Process</p>
                <h1 className="text-4xl font-medium text-foreground mb-4">How I Work</h1>
                <p className="text-lg text-muted max-w-2xl">
                  A demo of my AI-augmented design and development workflow — shipping multiple features in parallel using Conductor, GitHub, SuperWhisper, and Vercel.
                </p>
              </motion.div>
            </section>

            {/* Video hero */}
            <section className="border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative w-full" style={{ paddingBottom: '59.1%' }}>
                  <iframe
                    allow="clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                    src="https://supercut.ai/embed/enterpriseAI/DWpiz7jQyKdd79-Pz3U06T?embed=sidebar"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: 0,
                      left: 0,
                    }}
                    title="Conductor Workflow Demo"
                  />
                </div>
              </motion.div>
            </section>

            {/* Tools section */}
            <section className="border-b border-border">
              <div className={`px-8 ${flags.sectionTitleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
                <p className="text-xs text-muted uppercase tracking-widest">Tools</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                {TOOLS.map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    className={`p-6 ${index < TOOLS.length - 1 ? 'border-b md:border-b-0 md:border-r border-border' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <tool.icon className="w-5 h-5 text-accent mb-3" />
                    <h3 className="font-medium text-foreground mb-1">{tool.name}</h3>
                    <p className="text-sm text-muted">{tool.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Essay section */}
            <section className="border-b border-border">
              <div className={`px-8 ${flags.sectionTitleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
                <p className="text-xs text-muted uppercase tracking-widest">The Shift</p>
              </div>
              <motion.div
                className="p-8 pt-4 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="space-y-6 text-muted">
                  <p>
                    A year ago, my workflow looked like every other designer's: Figma files, handoff specs, waiting for eng capacity. I'd design something, explain it, wait weeks, then tweak it based on what actually got built. The feedback loop was measured in sprints.
                  </p>
                  <p>
                    Now I ship features in ten minutes.
                  </p>
                  <p>
                    The change wasn't learning to code — it was learning to direct AI agents. I write a GitHub issue describing what I want. I open a workspace in Conductor, paste the link, and talk through the task using SuperWhisper. The agent creates a feature branch, writes the code, and spins up a preview. I check it, give feedback, iterate. When it looks right, I merge.
                  </p>
                  <p>
                    The key insight is parallelism. While one agent builds a contact page, another is working on the CV page, and a third is experimenting with a mobile feed layout. Each workspace is isolated — its own branch, its own preview URL. I can context-switch between them, review what's ready, send back what needs work.
                  </p>
                  <p>
                    This changes what it means to design. I don't hand off static mockups anymore. I iterate on the real thing, in the browser, with actual data. When I don't like something, I describe the change and watch it happen. The gap between imagination and implementation has collapsed.
                  </p>
                  <p>
                    There's a design philosophy embedded in this workflow too. I prefer iteration over one-shotting. It's easier to see something, decide what I don't like, and refine — rather than trying to get it perfect upfront. The speed of this loop makes that practical in a way it never was before.
                  </p>
                  <p>
                    I'm still a designer. I still care about typography, hierarchy, interaction feel. But now I have leverage. The bottleneck isn't implementation capacity — it's my own clarity about what I want to build.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* Footer */}
            <footer className="p-8 flex items-center justify-between">
              <p className="text-xs text-muted">&copy; 2025 Gareth Chainey</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs text-muted hover:text-foreground transition-colors"
              >
                &uarr; Back to top
              </button>
            </footer>
          </main>

          {/* Chat toggle button */}
          <AnimatePresence>
            {!chatOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setChatOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-accent text-white rounded-full shadow-lg hover:scale-105 hover:brightness-110 transition-all"
              >
                <MessageCircle className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Chat sidebar */}
          <AnimatePresence>
            {chatOpen && (
              <motion.aside
                initial={false}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="flex-shrink-0 h-[calc(100vh-56px)] sticky top-14 border-r border-border"
                style={{ minWidth: 0 }}
              >
                <div className="relative h-full flex flex-col w-[380px]">
                  <button
                    onClick={() => setChatOpen(false)}
                    className="absolute top-4 right-4 z-10 p-1.5 text-muted hover:text-foreground hover:bg-border/50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <ChatInterface pageContext={HOW_I_WORK_CONTEXT} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
