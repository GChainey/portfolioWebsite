'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ContentDialog } from './ContentDialog'
import { ShimmeringText } from './ui/shimmering-text'
import { projects } from '@/content/projects'

// Project card component for inline chat responses
function ProjectCard({ projectId }: { projectId: string }) {
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  return (
    <Link href={`/projects/${project.id}`} className="group block">
      <div className="my-2 p-3 border border-border rounded-lg hover:border-foreground/30 transition-colors bg-background">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted uppercase tracking-wide">{project.category}</span>
          <ArrowRight className="w-3 h-3 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
        </div>
        <h4 className="font-medium text-foreground group-hover:text-accent text-sm transition-colors">{project.title}</h4>
        <p className="text-xs text-muted mt-1 line-clamp-2">{project.description}</p>
      </div>
    </Link>
  )
}

// Parse message content and render project cards
function MessageContent({ content }: { content: string }) {
  // Match [[project:id]] pattern
  const parts = content.split(/(\[\[project:[^\]]+\]\])/g)

  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/\[\[project:([^\]]+)\]\]/)
        if (match) {
          return <ProjectCard key={i} projectId={match[1]} />
        }
        return part ? <span key={i}>{part}</span> : null
      })}
    </>
  )
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface DialogContent {
  title: string
  content: string
  link?: { href: string; label: string }
}

interface PageContext {
  page: string
  description: string
  suggestedQuestions: string[]
  followUpQuestions: string[]
}

interface ChatInterfaceProps {
  pageContext?: PageContext
}

const DEFAULT_CONTEXT: PageContext = {
  page: 'home',
  description: 'Portfolio homepage showing experience, projects, and GitHub activity',
  suggestedQuestions: [
    "How has your role evolved with AI?",
    "What's your design philosophy?",
    "What projects are you working on?",
  ],
  followUpQuestions: [
    "Tell me more about your AI workflow",
    "How do you balance speed vs quality?",
    "What tools do you use daily?",
  ]
}

const BASE_CONTEXT = `You represent Gareth Chainey. Keep responses to 2-3 sentences MAX. Be direct and conversational.

WHO GARETH IS:
- Product designer who now operates as a one-person product team: PM, Designer, QA, Engineer
- Uses AI (Claude, Cursor) to build real code, not just Figma mockups
- Creates "lite" versions of products for rapid testing and iteration

PHILOSOPHY:
- Shape Up, JTBD, Teresa Torres frameworks
- No bureaucracy—just do the thing
- Collaboration over handoff
- Early team buy-in, not late approval

AVAILABLE PROJECTS (you can link to these):
- the-future-is-now: Article about AI transformation journey
- conflict-and-experiments: How to handle disagreements with experiments
- rfp: Enterprise RFP response system
- productlite: Real code prototyping tool
- configurator: No-code LLM workflow builder
- llm-features: Features built with LLMs

TO LINK A PROJECT: Use [[project:id]] syntax. Example: "Check out my article on this transformation. [[project:the-future-is-now]]"
When someone asks about projects or examples, include a relevant project card!

EXAMPLE ANSWERS:
Q: How has your role evolved?
A: "I went from Figma to shipping real code. AI lets me be a one-person product team—PM, designer, QA, and engineer. [[project:the-future-is-now]]"

Q: What tools do you use?
A: "Claude for thinking, Cursor for coding. The stack changes weekly—I use whatever ships fastest."

Q: Show me an example project
A: "Here's ProductLite—a prototyping tool I built with AI: [[project:productlite]]"

Keep it SHORT. Answer like you're texting a colleague.`

export function ChatInterface({ pageContext = DEFAULT_CONTEXT }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFollowUps, setShowFollowUps] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Build context with page-specific info
  const fullContext = `${BASE_CONTEXT}

CURRENT PAGE CONTEXT:
The user is viewing: ${pageContext.page}
Page description: ${pageContext.description}
Focus answers on this context when relevant, but can reference other experience too.`

  const scrollToBottom = () => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setShowFollowUps(false)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: fullContext
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      setShowFollowUps(true)
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex-shrink-0">
        <h3 className="font-medium text-foreground">GarethLLM<sup className="text-xs text-muted ml-0.5">™</sup></h3>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto chat-scroll p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            {pageContext.suggestedQuestions.map((q, i) => (
              <motion.button
                key={i}
                onClick={() => sendMessage(q)}
                className="block w-full text-left text-sm p-3 border border-border rounded hover:bg-border/50 transition-colors text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-foreground text-background rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                    : 'bg-border text-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg'
                }`}
              >
                {msg.role === 'assistant' ? <MessageContent content={msg.content} /> : msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3"
          >
            <div className="max-w-[85%] p-3 text-sm bg-border text-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg">
              <ShimmeringText
                text="Thinking..."
                duration={1.5}
                spread={1.5}
              />
            </div>
          </motion.div>
        )}

        {/* Follow-up questions after response */}
        {showFollowUps && !isLoading && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-2"
          >
            <p className="text-xs text-muted">Follow up:</p>
            <div className="flex flex-wrap gap-2">
              {pageContext.followUpQuestions.map((q, i) => (
                <motion.button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 border border-border rounded-full hover:bg-border/50 transition-colors text-muted hover:text-foreground"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-transparent border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 text-sm font-medium rounded transition-all disabled:bg-neutral-200 disabled:text-neutral-400 disabled:dark:bg-neutral-700 disabled:dark:text-neutral-500 bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
