'use client'

import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { GitHubActivity } from '@/components/GitHubActivity'
import { ChatInterface } from '@/components/ChatInterface'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Edge-to-edge grid layout */}
      <div className="grid grid-cols-12 min-h-screen">

        {/* Left sidebar - Navigation & Theme */}
        <div className="col-span-1 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <ThemeToggle />
          </div>
          <nav className="flex-1 flex flex-col justify-center">
            <motion.a
              href="#about"
              className="p-4 text-xs text-muted hover:text-foreground hover:bg-border/30 transition-colors border-b border-border writing-vertical"
              style={{ writingMode: 'vertical-rl' }}
              whileHover={{ backgroundColor: 'var(--border)' }}
            >
              About
            </motion.a>
            <motion.a
              href="#work"
              className="p-4 text-xs text-muted hover:text-foreground hover:bg-border/30 transition-colors border-b border-border"
              style={{ writingMode: 'vertical-rl' }}
              whileHover={{ backgroundColor: 'var(--border)' }}
            >
              Work
            </motion.a>
            <motion.a
              href="#github"
              className="p-4 text-xs text-muted hover:text-foreground hover:bg-border/30 transition-colors border-b border-border"
              style={{ writingMode: 'vertical-rl' }}
              whileHover={{ backgroundColor: 'var(--border)' }}
            >
              GitHub
            </motion.a>
            <motion.a
              href="#chat"
              className="p-4 text-xs text-muted hover:text-foreground hover:bg-border/30 transition-colors"
              style={{ writingMode: 'vertical-rl' }}
              whileHover={{ backgroundColor: 'var(--border)' }}
            >
              Chat
            </motion.a>
          </nav>
        </div>

        {/* Main content area */}
        <div className="col-span-11 grid grid-rows-[auto_1fr_auto]">

          {/* Header row */}
          <header className="grid grid-cols-11 border-b border-border">
            <div className="col-span-7 p-8">
              <motion.h1
                className="text-4xl md:text-5xl font-medium text-foreground tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Product Designer × AI
              </motion.h1>
            </div>
            <div className="col-span-4 p-8 border-l border-border flex items-center">
              <motion.p
                className="text-sm text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Transforming design impact through artificial intelligence
              </motion.p>
            </div>
          </header>

          {/* Main content grid */}
          <main className="grid grid-cols-11 grid-rows-2">

            {/* About section */}
            <section id="about" className="col-span-4 row-span-1 border-r border-b border-border p-8 flex flex-col justify-between">
              <div>
                <motion.p
                  className="text-xs text-muted uppercase tracking-widest mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  About
                </motion.p>
                <motion.h2
                  className="text-2xl font-medium text-foreground mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Gareth Chainey
                </motion.h2>
                <motion.p
                  className="text-muted leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  My role has fundamentally changed. Where I once spent hours on repetitive tasks,
                  I now orchestrate AI tools to multiply my output. The transformation isn&apos;t about
                  replacement—it&apos;s about amplification.
                </motion.p>
              </div>
              <motion.div
                className="mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-xs text-muted">Impact multiplier</p>
                <p className="text-3xl font-mono text-foreground">10×</p>
              </motion.div>
            </section>

            {/* Transformation visual */}
            <section className="col-span-4 row-span-1 border-r border-b border-border relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="font-mono text-accent/20 text-[8px] leading-none whitespace-pre select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {generateASCIIPattern()}
                </motion.div>
              </div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                <p className="text-xs text-muted uppercase tracking-widest mb-2">The Shift</p>
                <p className="text-foreground font-medium">From Manual to Augmented</p>
              </div>
            </section>

            {/* GitHub Activity */}
            <section id="github" className="col-span-3 row-span-2 border-b border-border">
              <GitHubActivity />
            </section>

            {/* Work showcase */}
            <section id="work" className="col-span-4 row-span-1 border-r border-b border-border p-8">
              <p className="text-xs text-muted uppercase tracking-widest mb-6">How I Work Now</p>
              <div className="space-y-4">
                {[
                  { tool: 'Claude', use: 'Code generation, writing, analysis' },
                  { tool: 'Cursor', use: 'AI-powered development' },
                  { tool: 'Midjourney', use: 'Visual exploration' },
                  { tool: 'Figma AI', use: 'Design automation' },
                ].map((item, i) => (
                  <motion.div
                    key={item.tool}
                    className="flex justify-between items-center py-2 border-b border-border last:border-0"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <span className="font-medium text-foreground">{item.tool}</span>
                    <span className="text-sm text-muted">{item.use}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Chat Interface */}
            <section id="chat" className="col-span-4 row-span-1 border-r border-b border-border">
              <ChatInterface />
            </section>

          </main>

          {/* Footer stats */}
          <footer className="grid grid-cols-11 border-t border-border">
            {[
              { label: 'Projects with AI', value: '50+' },
              { label: 'Time saved weekly', value: '20hrs' },
              { label: 'Productivity gain', value: '10×' },
              { label: 'Years in design', value: '8+' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="col-span-2 p-6 border-r border-border last:border-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
              >
                <p className="text-2xl font-mono text-foreground">{stat.value}</p>
                <p className="text-xs text-muted mt-1">{stat.label}</p>
              </motion.div>
            ))}
            <div className="col-span-3 p-6 flex items-center justify-end">
              <p className="text-xs text-muted">© 2024 Gareth Chainey</p>
            </div>
          </footer>

        </div>
      </div>
    </div>
  )
}

// Generate ASCII art pattern for visual interest
function generateASCIIPattern() {
  const chars = ['0', '1', ' ', '.', ':']
  const width = 60
  const height = 30
  let pattern = ''

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Create a circular gradient pattern
      const cx = width / 2
      const cy = height / 2
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      const maxDist = Math.sqrt(cx ** 2 + cy ** 2)
      const normalized = dist / maxDist

      if (normalized < 0.3) {
        pattern += chars[Math.floor(Math.random() * 2)]
      } else if (normalized < 0.6) {
        pattern += chars[2 + Math.floor(Math.random() * 2)]
      } else {
        pattern += ' '
      }
    }
    pattern += '\n'
  }
  return pattern
}
