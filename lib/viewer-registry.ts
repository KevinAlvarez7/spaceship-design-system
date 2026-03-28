export type ComponentStatus = 'playground' | 'confirmed';

export type SidebarSection =
  | 'Foundations'
  | 'Assets'
  | 'Typography'
  // Confirmed (handoff-ready)
  | 'Components'
  | 'Patterns'
  // Playground (exploration)
  | 'Playground';

export type RouteGroup =
  | 'tokens'
  | 'assets'
  | 'typography'
  | 'components'
  | 'patterns'
  | 'playground';

export type PageEntry = {
  slug: string;
  title: string;
  section: SidebarSection;
  route: RouteGroup;
  layout: 'standard' | 'bare';
  status?: ComponentStatus;
  experiment?: true;
  interactive?: true;
  graduatedFrom?: { playground: string; version: string };
};

export const PAGE_REGISTRY: PageEntry[] = [
  // Foundations (tokens)
  { slug: 'colors',     title: 'Colors',     section: 'Foundations', route: 'tokens', layout: 'standard' },
  { slug: 'typography', title: 'Typography', section: 'Foundations', route: 'tokens', layout: 'standard' },
  { slug: 'spacing',    title: 'Spacing',    section: 'Foundations', route: 'tokens', layout: 'standard' },
  { slug: 'radius',     title: 'Radius',     section: 'Foundations', route: 'tokens', layout: 'standard' },
  { slug: 'shadow',     title: 'Shadow',     section: 'Foundations', route: 'tokens', layout: 'standard' },
  { slug: 'motion',     title: 'Motion',     section: 'Foundations', route: 'tokens', layout: 'standard' },

  // Assets
  { slug: 'logo',          title: 'Logo',          section: 'Assets', route: 'assets', layout: 'standard' },
  { slug: 'icons',         title: 'Icons',         section: 'Assets', route: 'assets', layout: 'standard' },
  { slug: 'illustrations', title: 'Illustrations', section: 'Assets', route: 'assets', layout: 'standard' },
  { slug: 'animations',    title: 'Animations',    section: 'Assets', route: 'assets', layout: 'standard' },

  // Typography (standalone page)
  { slug: 'specimens', title: 'Specimens', section: 'Typography', route: 'typography', layout: 'standard' },

  // Patterns (confirmed) — Components section is auto-discovered at server time
  { slug: 'chat',                       title: 'Chat',                  section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'preview-panel',              title: 'Preview Panel',         section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'preview-panel-header',       title: 'Preview Panel Header',  section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'editable-title',             title: 'Editable Title',        section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'shareable-link',             title: 'Shareable Link',        section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'clarification-card',         title: 'Clarification Card',    section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'artifact-segmented-control', title: 'Artifact Panel',        section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'chat-panel',                 title: 'Chat Panel',            section: 'Patterns', route: 'patterns', layout: 'bare' },

  // Playground (full-page flow demos only)
  { slug: 'homepage',            title: 'Homepage',            section: 'Playground', route: 'playground', layout: 'bare', status: 'playground' },
  { slug: 'prototype-workspace', title: 'Prototype Workspace', section: 'Playground', route: 'playground', layout: 'bare', status: 'playground' },
  { slug: 'artifact-navigation', title: 'Artifact Navigation', section: 'Playground', route: 'playground', layout: 'bare', status: 'playground' },
  { slug: 'clarification-chat',  title: 'Clarification Chat',  section: 'Playground', route: 'playground', layout: 'bare', status: 'playground' },
];

export const SECTION_ORDER: SidebarSection[] = [
  // Foundations
  'Foundations',
  'Assets',
  'Typography',
  // Confirmed (UI + UX)
  'Components',
  'Patterns',
  // Playground
  'Playground',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getEntriesForRoute(route: RouteGroup): PageEntry[] {
  return PAGE_REGISTRY.filter(e => e.route === route);
}

export function getEntry(route: RouteGroup, slug: string): PageEntry | undefined {
  return PAGE_REGISTRY.find(e => e.route === route && e.slug === slug);
}

export function getSlugsForRoute(route: RouteGroup): string[] {
  return getEntriesForRoute(route).map(e => e.slug);
}

/** Compute the URL for a page entry. Typography is a standalone route. */
export function buildHref(entry: PageEntry): string {
  if (entry.route === 'typography') return '/typography';
  return `/${entry.route}/${entry.slug}`;
}

const ROUTE_DISPLAY: Record<RouteGroup, string> = {
  tokens:     'Tokens',
  assets:     'Assets',
  typography: 'Typography',
  components: 'Components',
  patterns:   'Patterns',
  playground: 'Playground',
};

/** Compute the topbar title string, e.g. "Components / Button". */
export function buildTopbarTitle(entry: PageEntry): string {
  return `${ROUTE_DISPLAY[entry.route]} / ${entry.title}`;
}

// ─── Sidebar nav builder ─────────────────────────────────────────────────────

export type NavItem = {
  label: string;
  href?: string;
  experiment?: true;
  playground?: true;
  children?: NavItem[];
};

const PLAYGROUND_SECTIONS = new Set<SidebarSection>(['Playground']);

/** Produces the sidebar nav array from PAGE_REGISTRY plus auto-discovered component entries. */
export function buildNav(componentEntries: PageEntry[] = []): NavItem[] {
  const sections: NavItem[] = [];

  for (const section of SECTION_ORDER) {
    const staticEntries = PAGE_REGISTRY.filter(e => e.section === section);
    const entries = section === 'Components'
      ? [...componentEntries]
      : staticEntries;
    if (entries.length === 0) continue;

    const isPlayground = PLAYGROUND_SECTIONS.has(section);
    const children: NavItem[] = [];

    // Patterns section gets a prepended "Overview" link
    if (section === 'Patterns') {
      children.push({ label: 'Overview', href: '/patterns' });
    }

    for (const entry of entries) {
      const child: NavItem = {
        label: entry.title,
        href: buildHref(entry),
      };
      if (isPlayground) child.playground = true;
      else if (entry.experiment) child.experiment = true;
      children.push(child);
    }

    const sectionItem: NavItem = { label: section, children };
    if (isPlayground) sectionItem.playground = true;
    sections.push(sectionItem);
  }

  return sections;
}
