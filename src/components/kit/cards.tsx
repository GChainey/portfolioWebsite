import type { ReactNode } from 'react'
import { GeistSans } from 'geist/font/sans'
import { cn } from '@/lib/utils'
import {
  ArrowUp, Check, ChevronDown, ChevronUp, CreditCard, Database, FileText, Filter, LayoutDashboard,
  LayoutTemplate, List, Search, Trash2, Users, BarChart3, X, Download, Plus,
} from 'lucide-react'

// The pieces on the component wall, rebuilt from the Enterprise AI products: their labels, data
// and styling. They are pictures of the apps, so they stay in the apps' light theme whatever the
// site's mode, and nothing inside them is interactive: the whole card opens the app.

const NAVY = '#0d2a44' // Configurator's primary
const AI_PURPLE = '#7c3aed' // what AI is looking at

function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn(GeistSans.className, 'rounded-xl border border-[#e4e4e7] bg-white p-4 text-[12px] leading-snug text-[#09090b]', className)}>{children}</div>
}

function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-[13px] font-semibold">{children}</p>
      {sub && <p className="mt-0.5 text-[#71717a]">{sub}</p>}
    </div>
  )
}

function Button({ children, dark, navy, className = '' }: { children: ReactNode; dark?: boolean; navy?: boolean; className?: string }) {
  const tone = navy ? 'text-white' : dark ? 'bg-[#09090b] text-white' : 'border border-[#e4e4e7] bg-white text-[#09090b]'
  return (
    <span className={cn('inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium', tone, className)} style={navy ? { background: NAVY } : undefined}>
      {children}
    </span>
  )
}

function Field({ label, value, placeholder, avatar }: { label: string; value?: string; placeholder?: string; avatar?: string }) {
  return (
    <div>
      <p className="mb-1 text-[#52525b]">{label}</p>
      <div className="flex items-center gap-1.5 truncate rounded-lg border border-[#e4e4e7] bg-[#fafafa] px-2.5 py-1.5">
        {avatar && <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#ede9fe] text-[7px] font-semibold text-[#6d28d9]">{avatar}</span>}
        <span className={`truncate ${value ? '' : 'text-[#a1a1aa]'}`}>{value ?? placeholder}</span>
      </div>
    </div>
  )
}

function Dot({ ok }: { ok: boolean }) {
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ok ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
}

function Todo({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e4e7] px-1.5 py-0.5 text-[11px] font-medium">
      <Dot ok={ok} />{label}
    </span>
  )
}

function Toggle({ on }: { on?: boolean }) {
  return (
    <span className={`relative inline-block h-[18px] w-8 shrink-0 rounded-full ${on ? 'bg-[#09090b]' : 'bg-[#e4e4e7]'}`}>
      <span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm ${on ? 'left-[16px]' : 'left-[2px]'}`} />
    </span>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="inline-block rounded-md bg-[#e8eef5] px-1.5 py-0.5 text-[11px] font-medium" style={{ color: NAVY }}>{children}</span>
}

function Done({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2">
      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[#16a34a] text-white"><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
      {children}
    </p>
  )
}

// ── Daisy Assess ──────────────────────────────────────────────────────────────

const QUEUE = [
  { id: 'DA2025/0586', address: '10 Station Road, Auburn', type: 'Residential complex', todo: [['Document Validation', false], ['Clearance Summary', false], ['Invoice', false]], est: 'Est +10', late: true, owner: null },
  { id: 'DA2025/0587', address: '100 River Road, Meadowbank', type: 'Residential complex', todo: [['Clearance Summary', true], ['Invoice', true]], est: 'Est 5', late: false, owner: 'MJ' },
  { id: 'DA2025/0579', address: '45 Pitt Street, Merrylands', type: 'Dwelling House', todo: [['Assessments', true], ['Conditions', true], ['Review', true]], est: 'On time', late: false, owner: 'SM' },
] as const

function Queue() {
  return (
    <Surface className="p-0">
      <div className="flex items-center justify-between border-b border-[#f4f4f5] px-4 py-2.5 text-[11px] text-[#71717a]">
        <span>Application</span><span>Due / Est.</span>
      </div>
      {QUEUE.map((a, i) => (
        <div key={a.id} className={`px-4 py-3 ${i < QUEUE.length - 1 ? 'border-b border-[#f4f4f5]' : ''}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold">{a.id}</p>
              <p className="truncate text-[11px] text-[#71717a]">{a.address}</p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-[#52525b]"><Dot ok={!a.late} />{a.est}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {a.todo.map(([label, ok]) => <Todo key={label} label={label} ok={ok} />)}
          </div>
        </div>
      ))}
    </Surface>
  )
}

function Status() {
  return (
    <Surface>
      <div className="flex items-center gap-2 rounded-lg border border-[#e4e4e7] px-2.5 py-1.5 text-[#a1a1aa]">
        <Search className="h-3.5 w-3.5" />Search applications…
      </div>
      <div className="mt-2 flex gap-2">
        <Button><Filter className="h-3 w-3" />Type</Button>
        <Button><Filter className="h-3 w-3" />Status <span className="rounded bg-[#f4f4f5] px-1 text-[10px] text-[#52525b]">Active</span></Button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-1.5 py-0.5 text-[11px] font-medium text-[#2563eb]">Lodgement</span>
        <span className="rounded-md border border-[#d4d4d8] bg-[#fafafa] px-1.5 py-0.5 text-[11px] font-medium">Assessment</span>
        <span className="ml-auto"><Button>Assign Worker</Button></span>
      </div>
    </Surface>
  )
}

function Assistant() {
  return (
    <Surface className="flex flex-col p-0">
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-[13px] font-semibold">AI Assistant</p>
        <X className="h-3.5 w-3.5 text-[#71717a]" />
      </div>
      <div className="mx-4 mt-2 flex gap-0.5 rounded-lg bg-[#f4f4f5] p-0.5 text-[11px] text-[#71717a]">
        {['Chat', 'Analysis', 'Dev Info', 'Documents'].map((t, i) => (
          <span key={t} className={`flex-1 rounded-md py-1 text-center ${i === 0 ? 'bg-white font-medium text-[#09090b] shadow-sm' : ''}`}>{t}</span>
        ))}
      </div>
      <div className="space-y-2 px-4 py-3">
        <p className="ml-6 rounded-lg bg-[#09090b] px-2.5 py-2 text-white">Rewrite Proposal Description to the Cumberland City Council report standard</p>
        <p className="mr-6 rounded-lg border border-[#e4e4e7] px-2.5 py-2">Rewritten to the Cumberland City Council report standard. Use undo to go back to your notes.</p>
      </div>
      <div className="mx-3 mb-3 flex items-center justify-between rounded-lg border border-[#e4e4e7] py-1.5 pl-2.5 pr-1.5">
        <span className="text-[#a1a1aa]">Ask about this application…</span>
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#09090b] text-white"><ArrowUp className="h-3 w-3" /></span>
      </div>
    </Surface>
  )
}

function Ask() {
  return (
    <Surface>
      <Title sub="Answers come from the applicant’s own documents">Ask about this application</Title>
      <p className="ml-8 rounded-lg bg-[#09090b] px-2.5 py-2 text-white">How high can it be built?</p>
      <div className="mr-4 mt-2 rounded-lg border border-[#e4e4e7] px-2.5 py-2">
        <p>The maximum building height in this R2 Low Density Residential zone is 8.5 metres.</p>
        <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#f4f4f5] px-1.5 py-0.5 text-[10px] text-[#52525b]"><FileText className="h-3 w-3" />Cumberland Local Environmental Plan 2021 · p. 14</p>
      </div>
    </Surface>
  )
}

function Determination() {
  const rows = [['Application Number', 'DA2025/0579'], ['Applicant', 'Sarah Mitchell'], ['Property Address', '45 Pitt Street, Merrylands'], ['Proposed Development', 'Secondary Dwelling'], ['Determination', 'APPROVED']]
  return (
    <Surface className="p-0">
      <div className="flex items-start justify-between px-4 pt-3">
        <div>
          <p className="text-[13px] font-semibold">Determination Letter</p>
          <p className="text-[11px] text-[#71717a]">DA2025/0579 · 45 Pitt Street</p>
        </div>
        <span className="rounded-md bg-[#dcfce7] px-1.5 py-0.5 text-[10px] font-medium text-[#15803d]">Approved</span>
      </div>
      <div className="m-3 rounded-lg border border-[#f4f4f5] bg-[#fafafa] p-3">
        <div className="flex items-center gap-2 border-b-2 border-[#0b7a3b] pb-2">
          <CouncilMark />
          <div>
            <p className="text-[11px] font-semibold text-[#0b7a3b]">Cumberland City Council</p>
            <p className="text-[9px] text-[#71717a]">16 Memorial Avenue, Merrylands NSW 2160</p>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] font-semibold tracking-wide text-[#0b7a3b]">NOTICE OF DETERMINATION</p>
        <div className="mt-2 overflow-hidden rounded-md border border-[#e4e4e7] bg-white text-[10px]">
          {rows.map(([k, v], i) => (
            <div key={k} className={`flex gap-2 px-2 py-1 ${i < rows.length - 1 ? 'border-b border-[#f4f4f5]' : ''}`}>
              <span className="w-[46%] shrink-0 font-medium">{k}</span>
              <span className={`truncate ${v === 'APPROVED' ? 'font-semibold text-[#0b7a3b]' : ''}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-[#f4f4f5] bg-[#fafafa] px-3 py-2.5">
        <Button><Download className="h-3 w-3" />Download</Button>
        <Button dark>Download and Complete</Button>
      </div>
    </Surface>
  )
}

function CouncilMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" aria-hidden>
      <path d="M19 6.5A9 9 0 1 0 19 17.5" fill="none" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
      <path d="M16.5 8.5A5.5 5.5 0 1 0 16.5 15.5" fill="none" stroke="#0891b2" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function Application() {
  return (
    <Surface>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold">Application Details</p>
        <ChevronUp className="h-3.5 w-3.5 text-[#71717a]" />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Application Number" value="DA2025/0579" />
        <Field label="Council Officer" value="Sarah Mitchell" avatar="SM" />
        <div className="col-span-2"><Field label="Land" value="45 Pitt Street, Merrylands NSW 2160" /></div>
        <Field label="Applicant" value="Sarah Mitchell" avatar="SM" />
        <Field label="Owner" value="Michael James" avatar="MJ" />
        <div className="col-span-2"><Field label="Estimated Cost of Works" value="$29,235,532.07" /></div>
      </div>
    </Surface>
  )
}

function Stat({ title, action, value, caption, bar, tone, status }: {
  title: string; action?: string; value: string; caption: string; bar: number; tone: 'green' | 'amber'; status: string
}) {
  const colours = { green: ['#15803d', '#dcfce7'], amber: ['#b45309', '#fef3c7'] }[tone]
  return (
    <Surface>
      <div className="flex h-6 items-center justify-between">
        <p className="text-[13px] font-semibold">{title}</p>
        {action && <Button className="h-6 py-0">{action}</Button>}
      </div>
      <p className="mt-2 text-[22px] font-semibold leading-tight tracking-tight">{value}</p>
      <p className="text-[#71717a]">{caption}</p>
      <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-[#f4f4f5]">
        <span className="block h-full rounded-full" style={{ width: `${bar}%`, background: tone === 'amber' ? '#f59e0b' : '#a1a1aa' }} />
      </span>
      <span className="mt-3 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium" style={{ color: colours[0], background: colours[1] }}>{status}</span>
    </Surface>
  )
}

function CaseTime() {
  return <Stat title="Average case time" value="104 days" caption="of 120-day target · this year" bar={87} tone="green" status="16 days inside target" />
}

function Workload() {
  return <Stat title="Team workload" action="Balance" value="84%" caption="of team capacity" bar={84} tone="amber" status="Uneven · 1 person over capacity" />
}

const RFI = [
  { doc: 'Site Survey Plan', text: 'Survey does not show the drainage easement along the northern boundary.', who: 'MJ', step: 'Lodgement', on: true },
  { doc: 'Architectural Plans', text: 'Rear setback is not dimensioned on the ground floor plan. The DCP requires a minimum of 6 m.', who: 'JE', step: 'Assessments', on: true },
  { doc: 'Architectural Plans', text: 'Finished floor levels are not shown relative to the 1% AEP flood level.', who: 'EW', step: 'Engineering referral', on: false },
]

function Rfi() {
  return (
    <Surface className="p-0">
      <div className="p-4 pb-3">
        <p className="text-[13px] font-semibold">Issues to include</p>
        <p className="mt-0.5 text-[#71717a]">Flagged by three officers at different steps</p>
      </div>
      {RFI.map((r) => (
        <div key={r.text} className="flex gap-2.5 border-t border-[#f4f4f5] px-4 py-2.5">
          <span className={`mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[4px] ${r.on ? 'bg-[#09090b] text-white' : 'border border-[#a1a1aa]'}`}>{r.on && <Check className="h-2.5 w-2.5" strokeWidth={3} />}</span>
          <div className="min-w-0">
            <p className="font-medium">{r.doc}</p>
            <p className="text-[11px] text-[#52525b]">{r.text}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#71717a]">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#f4f4f5] text-[7px] font-semibold text-[#52525b]">{r.who}</span>{r.step}
            </p>
          </div>
        </div>
      ))}
      <div className="flex justify-end border-t border-[#f4f4f5] bg-[#fafafa] px-4 py-2.5">
        <Button dark>Request for information</Button>
      </div>
    </Surface>
  )
}

function Clearance() {
  const checks = [['Zoning', true, 'R2 Low Density Residential'], ['Flood', false, 'Medium risk. Floor 500 mm above flood level'], ['Heritage', false, 'Heritage item 40 m away'], ['Bushfire', true, 'Not bushfire-prone'], ['BASIX', true, 'Certificate 1234567S']] as const
  return (
    <Surface className="p-0">
      <div className="p-4 pb-2">
        <p className="text-[13px] font-semibold">Clearance Summary</p>
        <p className="mt-0.5 text-[#71717a]">DA2025/0579 · Lot 5 DP 123456</p>
      </div>
      {checks.map(([check, pass, note]) => (
        <div key={check} className="flex items-start gap-2.5 border-t border-[#f4f4f5] px-4 py-2">
          <span className={`mt-px rounded-md px-1.5 text-[10px] font-medium leading-4 ${pass ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fef3c7] text-[#b45309]'}`}>{pass ? 'Pass' : 'Check'}</span>
          <span className="min-w-0"><span className="block font-medium">{check}</span><span className="block text-[11px] text-[#71717a]">{note}</span></span>
        </div>
      ))}
    </Surface>
  )
}

// ── Configurator ──────────────────────────────────────────────────────────────

function TemplateMatch() {
  const rows = [['Client onboarding (KYC)', 100], ['Campaign email', 0], ['Candidate screening', 0], ['Invoice approval', 0]] as const
  return (
    <Surface>
      <div className="flex items-center justify-between">
        <Tag>Template match · Jev</Tag>
        <ChevronUp className="h-3.5 w-3.5 text-[#71717a]" />
      </div>
      <p className="mt-2 text-[14px] font-semibold leading-tight" style={{ color: NAVY }}>This looks like the Client onboarding (KYC) template</p>
      <p className="mt-1.5 text-[#52525b]">Capture the business, collect ID, write the KYC summary, approve the account.</p>
      <div className="mt-3 space-y-1.5">
        {rows.map(([name, pct]) => (
          <div key={name} className="flex items-center gap-2 text-[11px]">
            <span className={`w-[42%] shrink-0 truncate ${pct ? 'font-semibold' : 'text-[#52525b]'}`} style={pct ? { color: NAVY } : undefined}>{name}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eef0f3]">
              <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: NAVY }} />
            </span>
            <span className="w-8 shrink-0 text-right font-mono text-[10px] text-[#52525b]">{pct}%</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <Button className="rounded-full">Build my own</Button>
        <Button navy className="rounded-full">Use the template</Button>
      </div>
    </Surface>
  )
}

function ProcessCard() {
  return (
    <div className="space-y-2">
      <Surface className="py-2.5"><Done>Read it: 10 steps across 6 tools</Done></Surface>
      <Surface>
        <div className="flex items-center justify-between"><Tag>Business process card</Tag><ChevronDown className="h-3.5 w-3.5 text-[#71717a]" /></div>
        <p className="mt-2 text-[15px] font-semibold" style={{ color: NAVY }}>New business account setup</p>
        <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
          <span className="text-[#71717a]">Goal</span><span>Get to a decision without anybody chasing the paperwork.</span>
          <span className="text-[#71717a]">Audience</span><span>The person submitting, and the one or two people who review it.</span>
          <span className="text-[#71717a]">Outcome</span><span>A decision on record, with everything it was based on attached to it.</span>
        </div>
        <span className="mt-3 inline-block rounded-full border border-[#e4e4e7] px-2 py-0.5 text-[10px] text-[#71717a]">◦ Show prompt</span>
      </Surface>
    </div>
  )
}

function Steps() {
  const steps = [['Role', 'Form'], ['CVs', 'Upload'], ['Screen', 'Compose'], ['Shortlist', 'Approval']]
  return (
    <Surface className="p-0">
      <div className="flex items-center gap-2 rounded-t-xl bg-black px-3 py-2 text-white">
        <span className="h-3.5 w-3.5 rotate-45 bg-[#ffcc00]" />
        <span className="text-[12px] font-semibold">CommBank</span>
        <span className="text-[11px] text-white/60">/ Candidate screening</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 p-3">
        {steps.map(([name, kind], i) => (
          <div key={name} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${i === 0 ? 'bg-[#ffcc00]' : 'border border-[#e4e4e7]'}`}>
            <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${i === 0 ? 'bg-black text-white' : 'bg-[#f4f4f5]'}`}>{i + 1}</span>
            <span><span className="block font-semibold leading-tight">{name}</span><span className="block font-mono text-[9px] text-[#52525b]">{kind}</span></span>
          </div>
        ))}
      </div>
    </Surface>
  )
}

function FormFields() {
  const fields = [['Role title', 'Short text', true], ['Must-haves', 'Long text', true], ['Nice-to-haves', 'Long text', false], ['Location', 'Short text', false], ['Work rights', 'Choice', false]] as const
  return (
    <Surface>
      <Title sub="Each time it runs, the person running it fills these in.">The form they fill in</Title>
      <div className="space-y-1.5">
        {fields.map(([name, type, req]) => (
          <div key={name} className="flex items-center gap-1.5 text-[11px]">
            <span className="min-w-0 flex-1 truncate rounded-md border border-[#e4e4e7] px-2 py-1">{name}</span>
            <span className="flex w-[74px] shrink-0 items-center justify-between rounded-md border border-[#e4e4e7] px-1.5 py-1">{type}<ChevronDown className="h-2.5 w-2.5" /></span>
            <span className={`grid h-3 w-3 shrink-0 place-items-center rounded-[3px] ${req ? 'bg-[#2563eb] text-white' : 'border border-[#a1a1aa]'}`}>{req && <Check className="h-2 w-2" strokeWidth={4} />}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] font-medium underline" style={{ color: NAVY }}>+ Add field</p>
      <div className="mt-3 flex items-center justify-between border-t border-[#f4f4f5] pt-3">
        <span className="text-[11px] text-[#71717a]">Changes show in the app</span>
        <Button navy className="rounded-full">Next: cvs</Button>
      </div>
    </Surface>
  )
}

function BrandRead() {
  const clients = [['Qantas', '#e0001b'], ['Nike', '#f05a28'], ['CommBank', '#ffcc00']]
  return (
    <Surface>
      <div className="flex flex-wrap gap-1.5">
        {clients.map(([name, colour], i) => (
          <span key={name} className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${i === 1 ? 'border-[1.5px]' : 'border border-[#e4e4e7]'}`} style={i === 1 ? { borderColor: NAVY, color: NAVY } : undefined}>
            <span className="h-2 w-2 rounded-full" style={{ background: colour }} />{name}
          </span>
        ))}
        <span className="px-1 py-0.5 text-[11px] text-[#71717a]">+ Add client</span>
      </div>
      <div className="mt-3 space-y-1.5 rounded-lg border border-[#e4e4e7] p-2.5">
        <Done>
          <span className="flex flex-1 items-center gap-1.5">Brand read from nike.com
            <span className="ml-auto flex gap-0.5">{['#f05a28', '#111', '#e4e4e7', '#fafafa'].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-[2px] border border-black/10" style={{ background: c }} />)}</span>
          </span>
        </Done>
        <Done>The Nike assistant, in Nike’s voice</Done>
      </div>
      <p className="mt-2.5 text-[#52525b]">Done. <b className="text-[#09090b]">Candidate screening</b> for <b className="text-[#09090b]">Nike</b>: same four steps, their brand.</p>
    </Surface>
  )
}

function ClientAssistant() {
  return (
    <Surface className="p-0">
      <div className="flex items-center gap-2 border-b border-[#f4f4f5] px-3 py-2.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-black"><span className="h-2.5 w-2.5 rotate-45 bg-[#ffcc00]" /></span>
        <span><span className="block font-semibold leading-tight">CommBank assistant</span><span className="block text-[10px] text-[#71717a]">Helping with Role</span></span>
      </div>
      <p className="m-3 rounded-lg bg-[#f4f4f5] px-2.5 py-2">Hi, I’m the CommBank assistant. I know what candidate screening is for and which step you’re on. Ask me anything.</p>
      <div className="flex flex-wrap justify-end gap-1 px-3 text-[10px]">
        <span className="rounded-full border border-[#e4e4e7] px-2 py-0.5">What goes in this step?</span>
        <span className="rounded-full border border-[#e4e4e7] px-2 py-0.5">What’s still missing?</span>
      </div>
      <div className="m-3 flex items-center justify-between rounded-full border border-[#e4e4e7] py-1 pl-3 pr-1">
        <span className="text-[#a1a1aa]">Ask the CommBank assistant…</span>
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#ffcc00]"><ArrowUp className="h-3 w-3 rotate-45" /></span>
      </div>
    </Surface>
  )
}

function Models() {
  const models = [['gpt-4.1', 6.0, false], ['gpt-4.1-mini', 7.2, true], ['gpt-5-mini', 21, false], ['gpt-5-nano', 29, false]] as const
  return (
    <Surface>
      <Title sub="Time to build a four-step app on each">Model behind every call</Title>
      <div className="space-y-1.5">
        {models.map(([name, s, on]) => (
          <div key={name} className={`rounded-lg border px-2.5 py-1.5 ${on ? 'border-[1.5px]' : 'border-[#e4e4e7]'}`} style={on ? { borderColor: NAVY } : undefined}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <span className={`grid h-3 w-3 place-items-center rounded-full border ${on ? '' : 'border-[#a1a1aa]'}`} style={on ? { borderColor: NAVY } : undefined}>{on && <span className="h-1.5 w-1.5 rounded-full" style={{ background: NAVY }} />}</span>
                {name}
              </span>
              <span className="font-mono text-[11px] text-[#52525b]">~{s.toFixed(1)}s</span>
            </div>
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-[#eef0f3]"><span className="block h-full rounded-full" style={{ width: `${(s / 29) * 100}%`, background: on ? NAVY : '#a1a1aa' }} /></span>
          </div>
        ))}
      </div>
    </Surface>
  )
}

// A QR code's look: the three finder squares and a fixed scatter of modules
function QrCode() {
  const n = 25
  const finder = (x: number, y: number) => x < 8 && y < 8 || x >= n - 8 && y < 8 || x < 8 && y >= n - 8
  const cells: ReactNode[] = []
  let seed = 7
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    seed = (seed * 9301 + 49297) % 233280
    if (!finder(x, y) && seed / 233280 > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />)
  }
  const eye = (x: number, y: number) => (
    <g key={`e${x}${y}`}>
      <rect x={x + 0.5} y={y + 0.5} width={6} height={6} fill="none" stroke="currentColor" strokeWidth={1} />
      <rect x={x + 2} y={y + 2} width={3} height={3} />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-full w-full" fill="currentColor" shapeRendering="crispEdges" aria-hidden>
      {cells}{eye(0, 0)}{eye(n - 7, 0)}{eye(0, n - 7)}
    </svg>
  )
}

function Qr() {
  return (
    <Surface className="text-center">
      <div className="mx-auto h-28 w-28 rounded-lg border border-[#e4e4e7] p-2"><QrCode /></div>
      <p className="mt-3 text-[13px] font-semibold">Open it on your phone</p>
      <p className="mt-1 text-[#71717a]">Scan to run Candidate screening for CommBank, as their team would.</p>
      <Button navy className="mt-3 rounded-full">Open the app</Button>
    </Surface>
  )
}

// ── Workspace settings ────────────────────────────────────────────────────────

function SettingsNav() {
  const manage = [[LayoutDashboard, 'Overview'], [Users, 'People and Access'], [CreditCard, 'Plan and Billing'], [BarChart3, 'Usage']] as const
  const features = [[FileText, 'AI Document Review'], [List, 'Document Checklist'], [Database, 'AI Chatbot'], [LayoutTemplate, 'AI Document Creation']] as const
  const row = (Icon: typeof FileText, label: string, active = false) => (
    <p key={label} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${active ? 'bg-[#f4f4f5] font-medium' : 'text-[#52525b]'}`}>
      <Icon className="h-3.5 w-3.5" />{label}
    </p>
  )
  return (
    <Surface className="bg-[#fafafa]">
      <p className="mb-3 text-[13px] font-semibold">Workspace settings</p>
      <p className="mb-1 px-2 text-[11px] text-[#71717a]">Manage</p>
      {manage.map(([Icon, label]) => row(Icon, label))}
      <p className="mb-1 mt-3 px-2 text-[11px] text-[#71717a]">Enable features for your apps</p>
      {features.map(([Icon, label], i) => row(Icon, label, i === 0))}
    </Surface>
  )
}

function FeatureTable() {
  const apps = [['Coca-Cola vending issues', true], ['Identity verification', false]] as const
  return (
    <Surface className="p-0">
      <div className="p-4 pb-3">
        <p className="text-[13px] font-semibold">AI Document Review</p>
        <p className="mt-1 text-[#71717a]">Extract information from documents submitted in your app and check it against your rules.</p>
      </div>
      <div className="flex border-y border-[#f4f4f5] bg-[#fafafa] px-4 py-1.5 text-[11px] text-[#71717a]">
        <span className="flex-1">App</span><span className="w-14">Enabled</span><span className="w-12 text-right">Setup</span>
      </div>
      {apps.map(([name, on], i) => (
        <div key={name} className={`flex items-center px-4 py-2.5 ${i === 0 ? 'border-b border-[#f4f4f5]' : ''}`}>
          <span className="min-w-0 flex-1 truncate pr-2 font-medium">{name}</span>
          <span className="w-14"><Toggle on={on} /></span>
          <span className="w-12 text-right"><span className={`rounded-md border px-1.5 py-1 text-[11px] ${on ? 'border-[#e4e4e7] font-medium' : 'border-[#f4f4f5] bg-[#fafafa] text-[#a1a1aa]'}`}>Set up</span></span>
        </div>
      ))}
    </Surface>
  )
}

function Preferences() {
  return (
    <Surface className="p-0">
      <div className="flex items-start justify-between gap-3 p-4">
        <span><span className="block text-[13px] font-semibold">Notifications</span><span className="block text-[#71717a]">Daily digest of submissions that need you.</span></span>
        <Toggle on />
      </div>
      <div className="flex items-start justify-between gap-3 border-t border-[#f4f4f5] p-4">
        <span><span className="block text-[13px] font-semibold">Sign-in &amp; security</span><span className="block text-[#71717a]">Microsoft Entra ID · last signed in 2 minutes ago</span></span>
        <Button>Manage</Button>
      </div>
    </Surface>
  )
}

function Metrics() {
  return (
    <Surface className="p-0">
      <div className="p-4">
        <p className="text-[13px] font-semibold">Workspace metrics</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <span><span className="block text-[22px] font-semibold leading-tight tracking-tight">1,284</span><span className="text-[#71717a]">submissions</span></span>
          <span><span className="block text-[22px] font-semibold leading-tight tracking-tight">76%</span><span className="text-[#71717a]">completion</span></span>
        </div>
        <div className="mt-3 flex items-end gap-1" aria-hidden>
          {[612, 578, 430, 402].map((n, i) => (
            <span key={i} className="flex-1 rounded-t-[3px] bg-[#e4e4e7]" style={{ height: n / 10, background: i === 3 ? '#09090b' : undefined }} />
          ))}
        </div>
        <div className="mt-1 flex gap-1 text-[9px] text-[#71717a]">
          {['Details', 'Upload', 'Review', 'Submit'].map((l) => <span key={l} className="flex-1 truncate">{l}</span>)}
        </div>
      </div>
      <div className="flex justify-end border-t border-[#f4f4f5] bg-[#fafafa] px-4 py-2.5"><Button>View analytics</Button></div>
    </Surface>
  )
}

// ── AI Document Review ────────────────────────────────────────────────────────

function IdPreview() {
  return (
    <Surface className="p-0">
      <div className="flex items-center justify-between px-4 pt-3">
        <p className="text-[13px] font-semibold">What AI looks at</p>
        <X className="h-3.5 w-3.5 text-[#71717a]" />
      </div>
      <div className="m-3 overflow-hidden rounded-lg border border-[#e4e4e7]">
        <div className="flex items-center gap-1.5 border-b border-[#f4f4f5] bg-[#fafafa] px-2.5 py-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#a1a1aa]" />
          <span className="font-semibold">New York State</span><span className="text-[11px] text-[#71717a]">Driver License</span>
        </div>
        <div className="flex gap-2.5 p-2.5">
          <div className="grid h-16 w-12 shrink-0 place-items-end overflow-hidden rounded-md border border-[#e4e4e7] bg-[#f4f4f5]">
            <svg viewBox="0 0 48 64" className="w-full" aria-hidden><circle cx="24" cy="26" r="9" fill="#a1a1aa" /><path d="M6 64c0-12 8-20 18-20s18 8 18 20z" fill="#a1a1aa" /></svg>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
            <span className="col-span-2"><span className="block text-[10px] text-[#71717a]">Name</span>Jane Doe</span>
            <span className="-m-1 rounded-md border-[1.5px] p-1" style={{ borderColor: AI_PURPLE, background: '#f5f3ff' }}><span className="block text-[10px] text-[#71717a]">Date of birth</span>03/14/1998</span>
            <span><span className="block text-[10px] text-[#71717a]">Expires</span>03/14/2030</span>
            <span><span className="block text-[10px] text-[#71717a]">ID</span>123 456 789</span>
            <span><span className="block text-[10px] text-[#71717a]">Class</span>D</span>
          </div>
        </div>
      </div>
    </Surface>
  )
}

function Rules() {
  const rules = ['Holder is 18 or over', 'License hasn’t expired', 'Name matches the applicant', 'Address matches the application']
  return (
    <Surface>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold">Rules</p>
        <span className="flex items-center gap-1 text-[11px] text-[#52525b]">Suggested rules<ChevronDown className="h-3 w-3" /></span>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#e4e4e7]">
        {rules.map((r, i) => (
          <div key={r} className={`flex items-center gap-3 border-b border-[#f4f4f5] px-2.5 py-2 ${i === 0 ? 'bg-[#f4f4f5]' : ''}`}>
            <span className="w-2 text-[#71717a]">{i + 1}</span>
            <span className="flex-1">{r}</span>
            {i === 0 && <Trash2 className="h-3 w-3 text-[#71717a]" />}
          </div>
        ))}
        <div className="flex items-center gap-3 px-2.5 py-1.5 text-[#a1a1aa]">
          <Plus className="h-3 w-3" /><span className="flex-1 truncate">Add a rule</span>
          <span className="rounded-md border border-[#e4e4e7] px-1.5 py-0.5 text-[11px]">Add</span>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-[#71717a]">Each rule is one check AI runs on every upload. If it isn’t true, a person checks the document.</p>
    </Surface>
  )
}

export const KIT_CARDS: Record<string, () => JSX.Element> = {
  queue: Queue,
  status: Status,
  assistant: Assistant,
  ask: Ask,
  determination: Determination,
  application: Application,
  'template-match': TemplateMatch,
  'process-card': ProcessCard,
  steps: Steps,
  'form-fields': FormFields,
  'brand-read': BrandRead,
  'client-assistant': ClientAssistant,
  models: Models,
  qr: Qr,
  'settings-nav': SettingsNav,
  preferences: Preferences,
  metrics: Metrics,
  'case-time': CaseTime,
  workload: Workload,
  rfi: Rfi,
  clearance: Clearance,
  'feature-table': FeatureTable,
  'id-preview': IdPreview,
  rules: Rules,
}

// The ghost cards at the wall's edges, where the stack runs off the page. Drawn in the site's
// colours rather than the apps', so they recede in either mode
export function SkeletonCard({ h }: { h: number }) {
  const bar = 'color-mix(in srgb, var(--foreground) 7%, var(--background))'
  const block = 'color-mix(in srgb, var(--foreground) 4%, var(--background))'
  return (
    <div className="rounded-xl border border-border p-4" style={{ height: h, background: 'color-mix(in srgb, var(--foreground) 1.5%, var(--background))' }} aria-hidden>
      <div className="h-2.5 w-1/2 rounded-full" style={{ background: bar }} />
      <div className="mt-2 h-2 w-3/4 rounded-full" style={{ background: block }} />
      <div className="mt-4 h-7 rounded-lg" style={{ background: block }} />
      <div className="mt-2 h-7 rounded-lg" style={{ background: block }} />
      {h > 200 && <div className="mt-2 h-16 rounded-lg" style={{ background: block }} />}
    </div>
  )
}
