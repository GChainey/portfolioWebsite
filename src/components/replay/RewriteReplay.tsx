'use client'

import { useRef, useState } from 'react'
import { Copy, Redo, Sparkles, Undo, X } from 'lucide-react'
import { Caret, ReplayFrame, typeOut, useReplay } from './Replay'

// The Daisy prototype's field editor, rebuilt in the page, replaying a real run: rough notes
// typed, Rewrite, undo, redo. The rewritten text is what the prototype's model returned for
// these notes (captured 2026-10-15).

const NOTES = '- 2 storey house w/ attached garage\n- rear deck, 3m off the back boundary\n- 1 tree removed, 2 natives planted\n- under the 8.5m height limit'
const REWRITTEN =
  'The proposal seeks consent for the construction of a two-storey dwelling with an attached garage. The development includes the provision of a rear deck, which is proposed to be set back three metres from the rear boundary. The application also involves the removal of one tree on the site, with two native species to be planted as part of the landscape works. The proposed building height does not exceed the maximum height limit of 8.5 metres identified in the Cumberland Local Environmental Plan 2021.'

const W = 560
const H = 340

export function RewriteReplay() {
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<'empty' | 'notes' | 'rewritten' | 'undone'>('empty')
  const rewrite = useRef<HTMLSpanElement>(null)
  const undo = useRef<HTMLSpanElement>(null)
  const redo = useRef<HTMLSpanElement>(null)

  const replay = useReplay({
    width: W,
    height: H,
    still: () => { setText(REWRITTEN); setStep('rewritten') },
    script: async (r) => {
      setText(''); setStep('empty'); setBusy(false)
      await r.move({ x: 470, y: 250 }, 0)
      setTyping(true)
      await r.sleep(600)
      await typeOut(r, NOTES, setText)
      setTyping(false); setStep('notes')
      await r.sleep(700)
      await r.click(rewrite.current)
      setBusy(true)
      await r.move({ x: 300, y: 300 }, 900)
      await r.sleep(800)
      setBusy(false); setText(REWRITTEN); setStep('rewritten')
      await r.sleep(4200)
      await r.click(undo.current)
      setText(NOTES); setStep('undone')
      await r.sleep(1700)
      await r.click(redo.current)
      setText(REWRITTEN); setStep('rewritten')
      await r.move({ x: 470, y: 290 }, 700)
      await r.sleep(3400)
    },
  })

  const icon = 'inline-flex h-7 items-center justify-center rounded-md px-2 text-zinc-900'
  return (
    <ReplayFrame replay={replay} label="The Rewrite feature: rough notes rewritten to the council's report standard">
      <div className="p-4">
        <div className="mb-2 flex h-7 items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-900">Editing: Proposal Description</h3>
          <div className="flex items-center gap-1">
            <span ref={rewrite} className={`inline-flex h-7 items-center gap-1 rounded-md bg-white px-2 text-xs font-medium text-zinc-900 shadow-sm ring-1 ring-black/10 ${step === 'empty' ? 'opacity-50' : ''}`}>
              <Sparkles className="h-3 w-3" /> Rewrite
            </span>
            <span ref={undo} className={`${icon} ${step === 'rewritten' ? '' : 'opacity-40'}`}><Undo className="h-3 w-3" /></span>
            <span ref={redo} className={`${icon} ${step === 'undone' ? '' : 'opacity-40'}`}><Redo className="h-3 w-3" /></span>
            <span className={icon}><Copy className="h-3 w-3" /></span>
            <span className={icon}><X className="h-3 w-3" /></span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-md border border-zinc-200 bg-white" style={{ height: H - 32 - 36 }}>
          {busy && (
            <div className="absolute inset-0 z-[1]" style={{
              background: 'linear-gradient(90deg, transparent, rgba(147,51,234,.15), rgba(147,51,234,.25), rgba(147,51,234,.15), transparent)',
              backgroundSize: '1200px 100%', animation: 'replay-shimmer 2s ease-in-out infinite',
            }} />
          )}
          <div className="h-full whitespace-pre-wrap px-[14px] py-3 text-[15px] leading-[1.6] text-zinc-900">
            {text || (!typing && <span className="text-zinc-400">Empty field - type here or use chat to add content</span>)}
            {typing && <Caret />}
          </div>
        </div>
      </div>
    </ReplayFrame>
  )
}
