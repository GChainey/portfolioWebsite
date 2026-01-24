# Portfolio Website - Claude Code Instructions

## Project Overview
This is Gareth Chainey's portfolio website built with Next.js 14, showcasing his transformation as a product designer embracing AI tools.

## Key Files
- `/src/app/blog/page.tsx` - Contains the **CHANGELOG** array that documents all development work
- `/src/content/projects.ts` - Project case study content
- `/src/context/ThemeContext.tsx` - Theme management (system/light/dark mode + accent colors)
- `/src/components/Header.tsx` - Shared navigation header
- `/src/components/ChatInterface.tsx` - AI chat sidebar with project card support

## Automatic Tasks

### Update Changelog After Significant Work
After completing significant features or bug fixes, **always update the CHANGELOG** in `/src/app/blog/page.tsx`:
1. Add a new entry at the top of the CHANGELOG array
2. Increment the version number appropriately (major.minor.patch)
3. Include date, title, description, changes array, and aiTools used
4. Group related changes into a single version when they're part of the same feature

Example entry format:
```typescript
{
  version: 'X.X.X',
  date: 'YYYY-MM-DD',
  title: 'Feature Name',
  description: 'Brief description of what was done.',
  changes: [
    'Specific change 1',
    'Specific change 2',
  ],
  aiTools: ['Claude Code'],
  branch: 'branch-name', // optional
}
```

### Versioning Guidelines
- **Major (X.0.0)**: Breaking changes or major redesigns
- **Minor (0.X.0)**: New features or significant enhancements
- **Patch (0.0.X)**: Bug fixes and small improvements

## Code Patterns

### Theme System
- Uses CSS variables for colors (`--background`, `--foreground`, `--accent`, etc.)
- Accent classes: `accent-amber`, `accent-blue`, etc. applied to `<html>`
- Mode: `system` | `light` | `dark` - stored in localStorage as `theme-mode`

### Project Cards in Chat
Chat can embed project cards using `[[project:id]]` syntax which renders a clickable card.

### Shared Components
- Always use `<Header />` component for navigation
- Use `group` class on parent for hover effects, then `group-hover:text-accent` for accent on hover
