'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ContentDialog } from './ContentDialog'

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

EXAMPLE ANSWERS:
Q: How has your role evolved?
A: "I went from Figma to shipping real code. AI lets me be a one-person product team—PM, designer, QA, and engineer."

Q: What tools do you use?
A: "Claude for thinking, Cursor for coding. The stack changes weekly—I use whatever ships fastest."

Q: What's your philosophy?
A: "Shape Up and JTBD, simplified. No bureaucracy, just build. Get buy-in early, collaborate instead of handing off."

Keep it SHORT. Answer like you're texting a colleague.`

export function ChatInterface({ pageContext = DEFAULT_CONTEXT }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFollowUps, setShowFollowUps] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Build context with page-specific info
  const fullContext = `${BASE_CONTEXT}

CURRENT PAGE CONTEXT:
The user is viewing: ${pageContext.page}
Page description: ${pageContext.description}
Focus answers on this context when relevant, but can reference other experience too.`

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
        <h3 className="font-medium text-foreground">Ask me anything</h3>
        <p className="text-xs text-muted mt-1">Chat with AI to learn about my work</p>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto chat-scroll p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted">Try asking:</p>
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
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-1 p-3"
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-muted rounded-full"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
              />
            ))}
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

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-transparent border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded disabled:opacity-50 hover:brightness-110 transition-all"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
