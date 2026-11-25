import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CaseStudy } from '@/components/site/case-study'
import { PUBLISHED, studyBySlug } from '@/content/short-studies'

// A published short study (/work/seek, /work/bestpractice) on the template. Only the slugs in
// PUBLISHED are built; anything else 404s, and the drafts stay dev-only at /draft/<slug>.
export const dynamicParams = false
export const generateStaticParams = () => Object.keys(PUBLISHED).map((study) => ({ study }))

export function generateMetadata({ params }: { params: { study: string } }): Metadata {
  const study = studyBySlug(params.study)
  if (!study || !PUBLISHED[params.study]) return {}
  return { title: `${PUBLISHED[params.study]} | Gareth Chainey`, description: `${study.lead} ${study.rest}` }
}

export default function WorkStudy({ params }: { params: { study: string } }) {
  const study = PUBLISHED[params.study] ? studyBySlug(params.study) : undefined
  if (!study) notFound()
  return <CaseStudy study={study} />
}
