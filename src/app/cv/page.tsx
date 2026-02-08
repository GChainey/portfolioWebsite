'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Download } from 'lucide-react'
import { Header } from '@/components/Header'
import { ChatInterface } from '@/components/ChatInterface'
import { useFeatureFlags } from '@/context/FeatureFlagContext'
import { cvData } from '@/content/cv'
import { VennSkills } from '@/components/VennSkills'

const CV_PAGE_CONTEXT = {
  page: 'CV',
  description: cvData.llmContext,
  suggestedQuestions: [
    "What's your biggest achievement?",
    "How do you work with engineers?",
    "Tell me about your AI transformation",
  ],
  followUpQuestions: [
    "What was your impact at SEEK?",
    "How do you approach user research?",
    "What's your technical stack?",
    "Tell me about your design philosophy",
    "What frameworks do you use?",
  ],
}

export default function CVPage() {
  const [chatOpen, setChatOpen] = useState(true)
  const { flags } = useFeatureFlags()

  useEffect(() => {
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
                <p className="text-xs text-muted uppercase tracking-widest mb-4">Curriculum Vitae</p>
                <h1 className="text-4xl font-medium text-foreground mb-4">{cvData.name}</h1>
                <p className="text-lg text-muted max-w-2xl mb-2">
                  {cvData.summary}
                </p>
                <p className="text-sm text-muted mb-6">{cvData.location}</p>
                <a
                  href="/GarethChaineyCV.pdf"
                  download="GarethChaineyCV.pdf"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-full hover:brightness-110 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </motion.div>
            </section>

            {/* Experience section */}
            <section className="p-8 border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-xs text-muted uppercase tracking-widest mb-6">Experience</p>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-border" />

                  <div className="space-y-8">
                    {cvData.experience.map((exp, index) => (
                      <motion.div
                        key={exp.id}
                        className="flex gap-6 relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        {/* Timeline dot */}
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-foreground border-4 border-background z-10 mt-1" />

                        <div className="flex-1 pb-2">
                          <div className="flex items-baseline gap-3 mb-1">
                            <h3 className="font-medium text-foreground">{exp.company}</h3>
                            <span className="text-xs text-muted">{exp.period}</span>
                          </div>
                          <p className="text-sm text-muted mb-1">{exp.role} · {exp.location}</p>
                          <p className="text-sm text-muted mb-3">{exp.companyDescription}</p>
                          <ul className="space-y-2">
                            {exp.highlights.map((highlight, i) => (
                              <li key={i} className="text-sm text-muted flex gap-2">
                                <span className="text-foreground/40 flex-shrink-0 mt-1">&#8226;</span>
                                <span>{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Education section */}
            <section className="p-8 border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs text-muted uppercase tracking-widest mb-6">Education</p>
                <div className="space-y-4">
                  {cvData.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex items-baseline gap-3">
                        <h3 className="font-medium text-foreground text-sm">{edu.title}</h3>
                        <span className="text-xs text-muted">{edu.year}</span>
                      </div>
                      {edu.institution && (
                        <p className="text-sm text-muted">{edu.institution}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Skills Venn diagram */}
            <section className="px-8 py-6 border-b border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
              >
                <p className="text-xs text-muted uppercase tracking-widest mb-4">Skills</p>
                <VennSkills />
              </motion.div>
            </section>

            {/* Testimonials section */}
            <section className="border-b border-border overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className={`px-8 ${flags.sectionTitleBorders ? 'py-4 border-b border-border' : 'pt-8 pb-4'}`}>
                  <p className="text-xs text-muted uppercase tracking-widest">Kind words from colleagues</p>
                </div>

                <div className="overflow-x-auto scrollbar-hide scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
                  <div className="flex" style={{ width: `${cvData.testimonials.length * 50}%` }}>
                    {cvData.testimonials.map((testimonial, index) => (
                      <motion.div
                        key={testimonial.name}
                        className={`flex-shrink-0 p-5 ${index === 0 ? 'pl-8' : ''} ${index < cvData.testimonials.length - 1 ? 'border-r border-border' : ''}`}
                        style={{ width: `${100 / cvData.testimonials.length}%`, scrollSnapAlign: 'start' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 + index * 0.1 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-foreground font-medium text-sm flex-shrink-0">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                            <p className="text-xs text-muted">{testimonial.role} · {testimonial.company}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted leading-relaxed">{testimonial.content}</p>
                      </motion.div>
                    ))}
                  </div>
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
                  <ChatInterface pageContext={CV_PAGE_CONTEXT} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
