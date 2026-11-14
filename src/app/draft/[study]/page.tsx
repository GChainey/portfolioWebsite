'use client'

import { notFound, useParams } from 'next/navigation'
import { CaseStudy } from '../case-study'
import { studyBySlug } from '../case-studies'

// A short case study (/draft/daisy-assess, /draft/website, …), from ../case-studies
export default function DraftStudy() {
  const { study: slug } = useParams<{ study: string }>()
  const study = studyBySlug(slug)
  if (!study) notFound()
  return <CaseStudy study={study} />
}
