'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MapPin, MessageCircle, Mail } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatPopup } from '@/components/ChatPopup'
import { useFeatureFlags } from '@/context/FeatureFlagContext'

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

export default function ContactPage() {
  const { flags } = useFeatureFlags()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio contact from ${formData.name}`)
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )
    window.location.href = `mailto:gareth.chainey@gmail.com?subject=${subject}&body=${body}`
  }

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
                <p className="text-xs text-muted uppercase tracking-widest mb-4">Let&apos;s Talk</p>
                <h1 className="text-4xl font-medium text-foreground mb-4">Contact</h1>
                <p className="text-lg text-muted max-w-2xl">
                  I&apos;m an Aussie based in New York City and always keen for a conversation — product,
                  design, AI, or whatever you&apos;re working on. No agenda required; say hello anytime.
                </p>
              </motion.div>
            </section>

            {/* Contact form */}
            <section className="p-8 border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                  <div>
                    <label htmlFor="name" className="block text-sm text-foreground mb-2">Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm text-foreground mb-2">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm text-foreground mb-2">Message</label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      className="w-full bg-transparent border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors resize-none"
                      placeholder="What would you like to discuss?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-cta)] text-white text-sm font-medium rounded hover:brightness-110 transition-all"
                  >
                    Send Message
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            </section>

            {/* Availability info */}
            <section className="border-b border-border">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <motion.div
                  className="p-6 md:border-r border-border"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <MapPin className="w-5 h-5 text-accent mb-3" />
                  <h3 className="font-medium text-foreground mb-1">Aussie in NYC</h3>
                  <p className="text-sm text-muted">Australian by background, living in New York City (Eastern Time).</p>
                </motion.div>

                <motion.div
                  className="p-6 md:border-r border-border border-t md:border-t-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <MessageCircle className="w-5 h-5 text-accent mb-3" />
                  <h3 className="font-medium text-foreground mb-1">Keen to connect</h3>
                  <p className="text-sm text-muted">Coffee in the city, a video call, or a message — whatever suits you.</p>
                </motion.div>

                <motion.div
                  className="p-6 border-t md:border-t-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Mail className="w-5 h-5 text-accent mb-3" />
                  <h3 className="font-medium text-foreground mb-1">Just talking</h3>
                  <p className="text-sm text-muted">Swap ideas, compare notes, or catch up — I&apos;m interested in the chat itself.</p>
                </motion.div>
              </div>
            </section>
          </main>

          <ChatPopup pageContext={CONTACT_PAGE_CONTEXT} defaultOpen />
        </div>
      </div>
    </div>
  )
}
