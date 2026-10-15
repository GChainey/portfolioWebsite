'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp, X } from 'lucide-react'
import { Caret, ReplayFrame, typeOut, useReplay } from './Replay'

// The Daisy prototype's assistant panel, rebuilt in the page, replaying a real run: two
// questions about the application, answered from the applicant's Statement of Environmental
// Effects. The answers are what the prototype's model returned (captured 2026-10-15).

const RUN = [
  {
    q: 'How far is the building from the riparian buffer?',
    a: 'According to the Statement of Environmental Effects, the proposed rural building is positioned more than 30 metres away from the riparian buffer zones.',
  },
  {
    q: 'Does it need bushfire protection?',
    a: 'According to the Statement of Environmental Effects, the site is in a bushfire-prone area. However, the proposed rural structure is a Class 10a building and is located more than 6 metres away from any other structure. Therefore, it does not require bushfire protection under the relevant bushfire controls for Class 10a buildings.\n\nIf further assessment is required, you may need to check the specific requirements of the NSW Rural Fire Service and the relevant standards (such as AS3959) for confirmation. However, based on the submitted statement, bushfire protection measures are not required for this application.',
  },
]
const SUGGESTIONS = [
  'What SEPPs apply to this development?',
  'How do I assess the EP&A Act provisions?',
  'What referrals are required for this project?',
  'Help me draft the recommendation',
]
const TABS = ['Chat', 'Analysis', 'Dev Info', 'Documents']

const W = 560
const H = 720

type Message = { role: 'user' | 'assistant'; text: string }

export function AskReplay() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const field = useRef<HTMLDivElement>(null)
  const send = useRef<HTMLSpanElement>(null)
  const list = useRef<HTMLDivElement>(null)

  // Keep the newest message in view, as the prototype does
  useEffect(() => {
    if (list.current) list.current.scrollTop = list.current.scrollHeight
  }, [messages, loading])

  const replay = useReplay({
    width: W,
    height: H,
    still: () => setMessages(RUN.flatMap(({ q, a }) => [{ role: 'user', text: q }, { role: 'assistant', text: a }] as Message[])),
    script: async (r) => {
      setMessages([]); setInput(''); setLoading(false)
      await r.move({ x: 420, y: 560 }, 0)
      await r.sleep(900)
      for (const [i, { q, a }] of RUN.entries()) {
        await r.click(field.current)
        setTyping(true)
        await typeOut(r, q, setInput, 30)
        setTyping(false)
        await r.sleep(350)
        await r.click(send.current)
        setInput('')
        setMessages((m) => [...m, { role: 'user', text: q }])
        setLoading(true)
        await r.move({ x: 520, y: 600 }, 600)
        await r.sleep(900)
        setLoading(false)
        setMessages((m) => [...m, { role: 'assistant', text: a }])
        await r.sleep(i === RUN.length - 1 ? 7000 : 3600)
      }
    },
  })

  const canSend = input.trim().length > 0
  return (
    <ReplayFrame replay={replay} aspectRatio="1 / 1" label="The assistant answering questions from the applicant's statement">
      <div className="flex h-full flex-col">
        <div className="shrink-0 p-4 pb-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-950">AI Assistant</h2>
            <span className="inline-flex h-8 w-8 items-center justify-center text-zinc-900"><X className="h-4 w-4" /></span>
          </div>
          <div className="mt-3 inline-flex h-9 items-center rounded-lg bg-zinc-100 p-1 text-zinc-500">
            {TABS.map((t) => (
              <span key={t} className={`rounded-md border px-3 py-1 text-sm font-medium ${t === 'Chat' ? 'border-zinc-200 bg-white text-zinc-900' : 'border-transparent'}`}>{t}</span>
            ))}
          </div>
        </div>

        <div ref={list} className="flex-1 space-y-4 overflow-hidden p-4">
          {messages.length === 0 && (
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <div key={s} className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900">{s}</div>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user' ? 'bg-black text-white' : 'border border-gray-200 bg-white text-gray-900'}`}>
                <p className="whitespace-pre-line text-sm">{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-md border border-gray-200 bg-white p-3">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-2 w-2 rounded-full bg-zinc-400" style={{ animation: `replay-bounce .9s ${d * 0.15}s ease-in-out infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 p-4">
          <div className="p-1">
            <div ref={field} className="flex w-full items-end rounded-md border border-gray-200 bg-white">
              <div className="flex-1 px-3 py-3 text-sm">
                {input ? <span className="text-zinc-900">{input}</span> : !typing && <span className="text-gray-400">Ask about PAN assessment requirements...</span>}
                {typing && <Caret />}
              </div>
              <span ref={send} className={`mb-2 mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${canSend ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-400'}`}>
                <ArrowUp className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </ReplayFrame>
  )
}
