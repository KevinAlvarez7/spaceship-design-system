import 'server-only';
import fs from 'fs';
import path from 'path';
import { PAGE_REGISTRY } from './viewer-registry';
import type { PageEntry } from './viewer-registry';

// ─── Exclusion rules ─────────────────────────────────────────────────────────

const EXCLUDE_FILES = new Set(['index.ts', 'index.tsx']);
const EXCLUDE_PREFIXES = ['use-'];

// ─── Extra entries ───────────────────────────────────────────────────────────

/**
 * Additional registry entries for sub-components that live inside a shared file
 * (e.g. ThinkingDots lives in thinking.tsx but has its own viewer page).
 */
const EXTRA_ENTRIES: PageEntry[] = [
  { slug: 'thinking-dots', title: 'Thinking Dots', section: 'Components', route: 'components', layout: 'standard' },
];

// ─── Metadata overrides ───────────────────────────────────────────────────────

/** Per-slug metadata that auto-generation can't infer from the filename alone. */
const COMPONENT_OVERRIDES: Partial<Record<string, Partial<PageEntry>>> = {
  button: { graduatedFrom: { playground: 'pg-button', version: 'v1' } },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ─── Discovery ───────────────────────────────────────────────────────────────

let _cache: PageEntry[] | null = null;

/** Returns PageEntry[] for all component files in components/ui/. */
export function discoverComponentEntries(): PageEntry[] {
  if (_cache) return _cache;

  // Slugs already registered in the static registry (e.g. clarification-card under Patterns)
  const existingSlugs = new Set(PAGE_REGISTRY.map(e => e.slug));

  const dir = path.join(process.cwd(), 'components/ui');
  const files = fs.readdirSync(dir);

  const entries: PageEntry[] = files
    .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
    .filter(f => !EXCLUDE_FILES.has(f))
    .filter(f => !EXCLUDE_PREFIXES.some(prefix => f.startsWith(prefix)))
    .map((f): PageEntry => {
      const slug = f.replace(/\.tsx?$/, '');
      const override = COMPONENT_OVERRIDES[slug] ?? {};
      return {
        slug,
        title: slugToTitle(slug),
        section: 'Components',
        route:   'components',
        layout:  'standard',
        ...override,
      };
    })
    .filter(entry => !existingSlugs.has(entry.slug));

  // Append extra entries for multi-component files
  const discoveredSlugs = new Set(entries.map(e => e.slug));
  for (const extra of EXTRA_ENTRIES) {
    if (!existingSlugs.has(extra.slug) && !discoveredSlugs.has(extra.slug)) {
      entries.push(extra);
    }
  }

  entries.sort((a, b) => a.title.localeCompare(b.title));

  _cache = entries;
  return entries;
}

/** Returns the PageEntry for a specific component slug, or undefined if not found. */
export function getComponentEntry(slug: string): PageEntry | undefined {
  return discoverComponentEntries().find(e => e.slug === slug);
}
