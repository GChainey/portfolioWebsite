'use client'

import { notFound, useParams } from 'next/navigation'
import { CaseStudy } from '@/components/site/case-study'
import { CompareTab } from '@/components/site/CompareTab'
import { studyBySlug } from '@/content/short-studies'

// A short case study on the template (/draft/daisy-assess, /draft/seek, …), dev server only
export default function DraftStudy() {
  const { study: slug } = useParams<{ study: string }>()
  const study = studyBySlug(slug)
  if (!study) notFound()
  return <>{<CaseStudy study={study} />}{slug === 'daisy-assess' && <CompareTab />}</>
}
