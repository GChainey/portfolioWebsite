import type { ReactNode } from 'react'
import { Lifeline } from '@/components/lifeline'
import { careerLifeline } from '@/content/lifeline-career'
import { VennSkills } from '@/components/VennSkills'

export interface Specimen {
  id: string
  title: string
  /** What this specimen is for — shown under the title in the playground. */
  description?: string
  /** Rendered inside the stage. Keep it to the component under test. */
  render: () => ReactNode
  /** Skip the stage's width constraint — for components that want the full page. */
  fullBleed?: boolean
}

/**
 * Drop experiments here. Each entry becomes a selectable specimen at /playground.
 * This file is the only thing you need to touch to try something new — the
 * harness in page.tsx handles the surrounding chrome, sizing and theming.
 */
export const specimens: Specimen[] = [
  {
    id: 'lifeline',
    title: 'Lifeline',
    description:
      'evilrabbit/lifeline, installed from its shadcn registry. Scrubs sideways on desktop, vertical on mobile. Career data from your CV.',
    fullBleed: true,
    render: () => (
      <div className="h-[600px] overflow-y-auto md:overflow-hidden">
        <Lifeline
          mode="embed"
          className="h-full"
          markers={careerLifeline.markers}
          birthYear={careerLifeline.birthYear}
          title="Gareth Chainey career timeline"
        />
      </div>
    ),
  },
  {
    id: 'venn-skills',
    title: 'Venn Skills',
    description: 'Interactive skills venn from the CV page. Hover the circles.',
    render: () => <VennSkills />,
  },
]
