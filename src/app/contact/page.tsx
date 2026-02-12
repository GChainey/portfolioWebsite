'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MapPin, Globe, Mail } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatInterface } from '@/components/ChatInterface'
import { Facehash } from 'facehash'
import { useFeatureFlags } from '@/context/FeatureFlagContext'

const CONTACT_PAGE_CONTEXT = {
  page: 'Contact',
  description: 'Contact page for reaching Gareth. He is currently based in Singapore. His wife is finishing her PhD, after which they plan to move to the United States. He is open to remote projects worldwide and in-person work in the USA.',
  suggestedQuestions: [
    'Where are you currently based?',
    'Are you open to remote work?',
    'When are you moving to the US?',
  ],
  followUpQuestions: [
    'What types of projects interest you?',
    'What\'s your ideal team setup?',
    'Are you open to contract work?',
    'What timezone do you work in?',
  ],
}

export default function ContactPage() {
  const [chatOpen, setChatOpen] = useState(true)
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
                <p className="text-xs text-muted uppercase tracking-widest mb-4">Get in Touch</p>
                <h1 className="text-4xl font-medium text-foreground mb-4">Contact</h1>
                <p className="text-lg text-muted max-w-2xl">
                  Open to remote projects worldwide and in-person work in the United States.
                  Currently based in Singapore.
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded hover:brightness-110 transition-all"
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
                  <h3 className="font-medium text-foreground mb-1">Based in Singapore</h3>
                  <p className="text-sm text-muted">Currently working from Singapore, GMT+8 timezone.</p>
                </motion.div>

                <motion.div
                  className="p-6 md:border-r border-border border-t md:border-t-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Globe className="w-5 h-5 text-accent mb-3" />
                  <h3 className="font-medium text-foreground mb-1">Moving to the USA</h3>
                  <p className="text-sm text-muted">Planning to relocate to the United States.</p>
                </motion.div>

                <motion.div
                  className="p-6 border-t md:border-t-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Mail className="w-5 h-5 text-accent mb-3" />
                  <h3 className="font-medium text-foreground mb-1">Open to Opportunities</h3>
                  <p className="text-sm text-muted">Remote projects worldwide or in-person work in the USA.</p>
                </motion.div>
              </div>
            </section>
          </main>

          {/* Chat toggle button */}
          <AnimatePresence>
            {!chatOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setChatOpen(true)}
                className="fixed bottom-6 right-6 z-50 shadow-lg hover:scale-110 transition-all"
              >
                <Facehash name="Gareth Chainey" size={48} showInitial enableBlink interactive={false} intensity3d="subtle" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 60%, var(--background))', borderRadius: '9999px' }} />
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
                  <ChatInterface pageContext={CONTACT_PAGE_CONTEXT} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
