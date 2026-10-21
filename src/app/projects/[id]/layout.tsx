import { notFound } from 'next/navigation'
import { getProjectById, pageIsLive } from '@/content/projects'

// A page that's off (a case study before launch, a draft) is a real 404, not an empty page
export default function ProjectLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const project = getProjectById(params.id)
  if (!project || !pageIsLive(project)) notFound()
  return children
}
