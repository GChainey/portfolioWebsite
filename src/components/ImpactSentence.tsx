import { DecodeText, type Segment } from '@/components/DecodeText'

type Impact = { value?: string; label: string }[]

// What a piece did, as one sentence: the numbers in ink, the rest in grey. "1 designer where it
// took 3 to 5, plus engineers. Days, not weeks, for a major feature." A label that starts with
// punctuation hangs straight off its number
export function impactSegments(impact: Impact): Segment[] {
  return impact.flatMap((m, i) => {
    const lead = i ? ' ' : ''
    if (!m.value) return [{ text: `${lead}${m.label}.`, ink: true }]
    return [{ text: `${lead}${m.value}`, ink: true }, { text: `${/^[,:;]/.test(m.label) ? '' : ' '}${m.label}.` }]
  })
}

export function ImpactSentence({ impact, decode = false, className = '' }: { impact: Impact; decode?: boolean; className?: string }) {
  const segments = impactSegments(impact)
  return (
    <p className={`text-pretty text-muted ${className}`}>
      {decode ? (
        <DecodeText segments={segments} />
      ) : (
        segments.map((s, i) => <span key={i} className={s.ink ? 'font-medium text-foreground' : undefined}>{s.text}</span>)
      )}
    </p>
  )
}
