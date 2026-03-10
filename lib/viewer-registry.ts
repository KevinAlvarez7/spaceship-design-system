export type SidebarSection =
  | 'Foundations'
  | 'Assets'
  | 'Typography'
  | 'Components'
  | 'Effects'
  | 'Patterns'
  | 'Pages';

export type RouteGroup =
  | 'tokens'
  | 'assets'
  | 'typography'
  | 'components'
  | 'effects'
  | 'patterns';

export type PageEntry = {
  slug: string;
  title: string;
  section: SidebarSection;
  route: RouteGroup;
  layout: 'standard' | 'bare';
  experiment?: true;
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

  // Components
  { slug: 'button',           title: 'Button',         section: 'Components', route: 'components', layout: 'standard' },
  { slug: 'chat-input-box',   title: 'Chat Input Box', section: 'Components', route: 'components', layout: 'standard' },
  { slug: 'chat-bubble',      title: 'Chat Bubble',    section: 'Components', route: 'components', layout: 'standard' },
  { slug: 'chat-message',     title: 'Chat Message',   section: 'Components', route: 'components', layout: 'standard' },
  { slug: 'chat-thread',      title: 'Chat Thread',    section: 'Components', route: 'components', layout: 'standard' },
  { slug: 'modal',            title: 'Modal',          section: 'Components', route: 'components', layout: 'standard' },
  { slug: 'tag',              title: 'Tag',            section: 'Components', route: 'components', layout: 'standard' },

  // Effects (all experiments)
  { slug: 'gravity-assist',    title: 'Gravity Assist',    section: 'Effects', route: 'effects', layout: 'standard', experiment: true },
  { slug: 'grid-background',   title: 'Grid Background',   section: 'Effects', route: 'effects', layout: 'standard', experiment: true },

  // Patterns
  { slug: 'chat',                   title: 'Chat',                  section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'preview-panel',          title: 'Preview Panel',         section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'preview-panel-header',   title: 'Preview Panel Header',  section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'editable-title',         title: 'Editable Title',        section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'shareable-link',         title: 'Shareable Link',        section: 'Patterns', route: 'patterns', layout: 'standard' },
  { slug: 'sidebar-toggle',         title: 'Sidebar Toggle',        section: 'Patterns', route: 'patterns', layout: 'standard' },

  // Pages (bare layout, experiments)
  { slug: 'gravity-chat',           title: 'Gravity Chat',           section: 'Pages', route: 'patterns', layout: 'bare', experiment: true },
  { slug: 'prototype-workspace',       title: 'Prototype Workspace',       section: 'Pages', route: 'patterns', layout: 'bare',     experiment: true },
  { slug: 'artifact-navigation',       title: 'Artifact Navigation',       section: 'Pages', route: 'patterns', layout: 'bare',     experiment: true },
  { slug: 'structured-clarification',  title: 'Structured Clarification',  section: 'Pages', route: 'patterns', layout: 'standard', experiment: true },
  { slug: 'clarification-chat', title: 'Clarification Chat', section: 'Pages', route: 'patterns', layout: 'bare', experiment: true },
];

export const SECTION_ORDER: SidebarSection[] = [
  'Foundations',
  'Assets',
  'Typography',
  'Components',
  'Effects',
  'Patterns',
  'Pages',
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
  effects:    'Effects',
  patterns:   'Patterns',
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
  children?: NavItem[];
};

/** Produces the sidebar nav array from PAGE_REGISTRY. */
export function buildNav(): NavItem[] {
  const sections: NavItem[] = [];

  for (const section of SECTION_ORDER) {
    const entries = PAGE_REGISTRY.filter(e => e.section === section);
    if (entries.length === 0) continue;

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
      if (entry.experiment) child.experiment = true;
      children.push(child);
    }

    sections.push({ label: section, children });
  }

  return sections;
}
