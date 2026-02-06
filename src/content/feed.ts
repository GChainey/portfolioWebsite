import { projects, type Project, type TextBlock } from './projects'
import { thinkers, type Thinker } from './thinkers'
import { CHANGELOG, type ChangelogEntry } from './changelog'

export type FeedItemType = 'essay' | 'case-study' | 'thinker' | 'update'

export interface FeedItem {
  id: string
  type: FeedItemType
  title: string
  description: string
  year: string
  tags: string[]
  href?: string
  previewText?: string
}

export const FEED_TYPES: { value: FeedItemType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'essay', label: 'Essays' },
  { value: 'case-study', label: 'Case Studies' },
  { value: 'thinker', label: 'Thinkers' },
  { value: 'update', label: 'Updates' },
]

function projectToFeedItem(project: Project): FeedItem {
  const firstText = project.content.find((b) => b.type === 'text') as TextBlock | undefined

  return {
    id: `project-${project.id}`,
    type: project.category === 'Article' ? 'essay' : 'case-study',
    title: project.title,
    description: project.description,
    year: project.year,
    tags: project.tags,
    href: `/projects/${project.id}`,
    previewText: firstText?.content,
  }
}

function thinkerToFeedItem(thinker: Thinker): FeedItem {
  return {
    id: `thinker-${thinker.id}`,
    type: 'thinker',
    title: thinker.name,
    description: thinker.role,
    year: '2026',
    tags: thinker.tags,
    href: thinker.link,
    previewText: thinker.influence,
  }
}

function changelogToFeedItem(entry: ChangelogEntry): FeedItem {
  return {
    id: `update-${entry.version}`,
    type: 'update',
    title: entry.title,
    description: entry.description,
    year: entry.date.slice(0, 4),
    tags: entry.aiTools,
    href: '/blog',
    previewText: entry.changes.slice(0, 3).join(' · '),
  }
}

export function buildFeedItems(): FeedItem[] {
  const items: FeedItem[] = [
    ...projects.map(projectToFeedItem),
    ...thinkers.map(thinkerToFeedItem),
    ...CHANGELOG.map(changelogToFeedItem),
  ]

  // Sort by year descending, then by type priority
  const typePriority: Record<FeedItemType, number> = {
    essay: 0,
    'case-study': 1,
    thinker: 2,
    update: 3,
  }

  items.sort((a, b) => {
    const yearDiff = parseInt(b.year) - parseInt(a.year)
    if (yearDiff !== 0) return yearDiff
    return typePriority[a.type] - typePriority[b.type]
  })

  return items
}

export function getAllFeedTags(items: FeedItem[]): string[] {
  const tagSet = new Set<string>()
  for (const item of items) {
    for (const tag of item.tags) {
      tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
}
