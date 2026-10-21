'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatPopup } from '@/components/ChatPopup'
import { SiteFooter } from '@/components/SiteFooter'

const EMAIL = 'gareth.chainey@gmail.com'

const CONTACT_PAGE_CONTEXT = {
  page: 'Contact',
  description: 'Contact page for reaching Gareth. He is an Australian product designer based in New York City. He is genuinely interested in talking — about product, design, AI, what you are building, or career in general. Happy to meet for coffee in NYC, jump on a call, or exchange emails. No pitch required.',
  suggestedQuestions: [
    'Where are you based now?',
    'What do you like talking about?',
    'Can we meet up in NYC?',
  ],
  followUpQuestions: [
    'What are you working on lately?',
    'How do you like to connect with people?',
    'What timezone are you in?',
    'What kind of conversations do you enjoy?',
  ],
}

// Contact, in the homepage's look: a big heading, lots of space, no panels
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as const },
})

const H1 = 'text-[36px] font-medium leading-[40px] tracking-[-0.02em] text-foreground'
const FIELD = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted transition-colors focus:border-accent focus:outline-none'

const WAYS = [
  { title: 'Aussie in NYC', body: 'Australian, living in New York City, on Eastern Time.' },
  { title: 'Coffee or a call', body: 'Coffee in the city, a video call or an email, whatever suits you.' },
  { title: 'No pitch needed', body: 'Product, design, AI, or what you’re building. Happy to just talk.' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  // The form writes the email for you, in your own mail app
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio contact from ${formData.name}`)
    const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
  }

  return (
    <div className="min-h-screen bg-background overflow-x-clip">
      <Header />
      <div className="mx-auto flex min-h-[calc(100vh-56px)] max-w-7xl flex-col pt-14">
        <main className="flex flex-1 flex-col">
          <div className="flex flex-col px-6 pb-24">
            <motion.section {...reveal()} aria-labelledby="contact" className="flex flex-col gap-6 pb-12 pt-24">
              <h1 id="contact" className={H1}>Say hello</h1>
              <p className="max-w-3xl text-[22px] leading-[34px] tracking-[-0.01em] text-muted text-pretty">
                Always keen for a conversation. Write below, or email{' '}
                <a href={`mailto:${EMAIL}`} className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">{EMAIL}</a>.
              </p>
            </motion.section>

            <div className="grid grid-cols-1 gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
              <motion.form {...reveal(0.1)} onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">Name</span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className={FIELD}
                    placeholder="Your name"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className={FIELD}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">Message</span>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    className={`${FIELD} resize-none`}
                    placeholder="What would you like to talk about?"
                  />
                </label>
                <button
                  type="submit"
                  className="group inline-flex items-center gap-2 self-start rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
                >
                  Write the email
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </motion.form>

              <motion.ul {...reveal(0.2)} className="flex flex-col gap-10">
                {WAYS.map((w) => (
                  <li key={w.title} className="flex flex-col gap-1">
                    <span className="text-[20px] font-medium leading-[26px] tracking-[-0.01em] text-foreground">{w.title}</span>
                    <span className="text-base leading-[26px] text-muted">{w.body}</span>
                  </li>
                ))}
              </motion.ul>
            </div>
          </div>

          <SiteFooter />
        </main>
      </div>

      <ChatPopup pageContext={CONTACT_PAGE_CONTEXT} />
    </div>
  )
}
