'use client'

import { notFound, useParams } from 'next/navigation'
import { CaseStudy } from '@/components/site/case-study'
import { creativeBySlug } from '@/content/creative'

// A creative study on the short case-study template (/creative/saetia), dev server only
export default function CreativeStudy() {
  const { slug } = useParams<{ slug: string }>()
  const study = creativeBySlug(slug)
  if (!study) notFound()
  return <CaseStudy study={study} />
}
