import type React from 'react';

// ─── UI components ────────────────────────────────────────────────────────────
import { Button } from '../components/ui/button';
import { ChatInputBox } from '../components/ui/chat-input-box';
import { ChatBubble } from '../components/ui/chat-bubble';
import { ChatMessage } from '../components/ui/chat-message';
import { ChatThread } from '../components/ui/chat-thread';
import { Modal } from '../components/ui/modal';
import { Tag } from '../components/ui/tag';
import { ApprovalCard } from '../components/ui/approval-card';
import { TaskList } from '../components/ui/task-list';
import { RadioGroup } from '../components/ui/radio-group';
import { CheckboxGroup } from '../components/ui/checkbox-group';
import { SortableList } from '../components/ui/sortable-list';
import { TabBar } from '../components/ui/tab-bar';
import { FolderTabs } from '../components/ui/folder-tabs';
import { ThinkingDots, ThinkingSaucer } from '../components/ui/thinking';
import { ShimmerText } from '../components/ui/shimmer-text';
import { DropdownMenu } from '../components/ui/dropdown-menu';
import { GravityWell } from '../components/ui/GravityWell';
import { GridBackground } from '../components/ui/GravityWell';

// ─── Pattern components ───────────────────────────────────────────────────────
import { ChatPanel } from '../components/patterns/ChatPanel';
import { ChatInputSlot } from '../components/patterns/ChatInputSlot';
import { PreviewPanel } from '../components/patterns/PreviewPanel';
import { PreviewPanelHeader } from '../components/patterns/PreviewPanelHeader';
import { EditableTitle } from '../components/patterns/EditableTitle';
import { ShareableLink } from '../components/patterns/ShareableLink';
import { ArtifactSegmentedControl } from '../components/patterns/ArtifactSegmentedControl';
import { ClarificationCard } from '../components/patterns/clarification-card';

// ─── Playground components ────────────────────────────────────────────────────
import { Button as ButtonV1 } from '../components/playground/button/v1';
import { HomepagePage } from '../components/playground/HomepagePage';
import { PrototypeWorkspacePage } from '../components/playground/PrototypeWorkspacePage';
import { ArtifactNavigationPage } from '../components/playground/ArtifactNavigationPage';
import { ClarificationChatDemoPage } from '../components/playground/ClarificationChatDemoPage';

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ComponentStatus = 'playground' | 'confirmed';

export type SidebarSection =
  | 'Foundations'
  | 'Assets'
  | 'Typography'
  | 'Components'
  | 'Patterns'
  | 'Playground Components'
  | 'Playground Patterns'
  | 'Playground Effects'
  | 'Playground Pages';

export type RouteGroup =
  | 'tokens'
  | 'assets'
  | 'typography'
  | 'components'
  | 'effects'
  | 'patterns'
  | 'playground';

export type ComponentMeta = {
  name: string;
  slug: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  group: 'ui' | 'patterns' | 'playground';
  title: string;
  section: SidebarSection;
  route: RouteGroup;
  layout: 'standard' | 'bare';
  status?: ComponentStatus;
  experiment?: true;
  interactive?: true;
  graduatedFrom?: { playground: string; version: string };
};

export type PageEntry = {
  slug: string;
  title: string;
  section: SidebarSection;
  route: RouteGroup;
  layout: 'standard' | 'bare';
  status?: ComponentStatus;
  experiment?: true;
};

export type NavItem = {
  label: string;
  href?: string;
  experiment?: true;
  playground?: true;
  children?: NavItem[];
};

// ━━━ Component Registry ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const COMPONENT_REGISTRY: ComponentMeta[] = [
  // ─── UI Components ──────────────────────────────────────────────────────────
  {
    name: 'Button',
    slug: 'button',
    component: Button,
    group: 'ui',
    title: 'Button',
    section: 'Components',
    route: 'components',
    layout: 'standard',
    graduatedFrom: { playground: 'pg-button', version: 'v1' },
  },
  {
    name: 'ChatInputBox',
    slug: 'chat-input-box',
    component: ChatInputBox,
    group: 'ui',
    title: 'Chat Input Box',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'ChatBubble',
    slug: 'chat-bubble',
    component: ChatBubble,
    group: 'ui',
    title: 'Chat Bubble',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'ChatMessage',
    slug: 'chat-message',
    component: ChatMessage,
    group: 'ui',
    title: 'Chat Message',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'ChatThread',
    slug: 'chat-thread',
    component: ChatThread,
    group: 'ui',
    title: 'Chat Thread',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'Modal',
    slug: 'modal',
    component: Modal,
    group: 'ui',
    title: 'Modal',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'Tag',
    slug: 'tag',
    component: Tag,
    group: 'ui',
    title: 'Tag',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'ApprovalCard',
    slug: 'approval-card',
    component: ApprovalCard,
    group: 'ui',
    title: 'Approval Card',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'TaskList',
    slug: 'task-list',
    component: TaskList,
    group: 'ui',
    title: 'Task List',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'RadioGroup',
    slug: 'radio-group',
    component: RadioGroup,
    group: 'ui',
    title: 'Radio Group',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'CheckboxGroup',
    slug: 'checkbox-group',
    component: CheckboxGroup,
    group: 'ui',
    title: 'Checkbox Group',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'SortableList',
    slug: 'sortable-list',
    component: SortableList,
    group: 'ui',
    title: 'Sortable List',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'TabBar',
    slug: 'tab-bar',
    component: TabBar,
    group: 'ui',
    title: 'Tab Bar',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'FolderTabs',
    slug: 'folder-tabs',
    component: FolderTabs,
    group: 'ui',
    title: 'Folder Tabs',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'ThinkingDots',
    slug: 'thinking-dots',
    component: ThinkingDots,
    group: 'ui',
    title: 'Thinking Dots',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'Thinking',
    slug: 'thinking',
    component: ThinkingSaucer,
    group: 'ui',
    title: 'Thinking',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'ShimmerText',
    slug: 'shimmer-text',
    component: ShimmerText,
    group: 'ui',
    title: 'Shimmer Text',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },
  {
    name: 'DropdownMenu',
    slug: 'dropdown-menu',
    component: DropdownMenu,
    group: 'ui',
    title: 'Dropdown Menu',
    section: 'Components',
    route: 'components',
    layout: 'standard',
  },

  // ─── Patterns ───────────────────────────────────────────────────────────────
  {
    name: 'ChatPanel',
    slug: 'chat-panel',
    component: ChatPanel,
    group: 'patterns',
    title: 'Chat Panel',
    section: 'Patterns',
    route: 'patterns',
    layout: 'bare',
  },
  {
    name: 'Chat',
    slug: 'chat',
    component: ChatPanel,
    group: 'patterns',
    title: 'Chat',
    section: 'Patterns',
    route: 'patterns',
    layout: 'standard',
  },
  {
    name: 'ChatInputSlot',
    slug: 'chat-input-slot',
    component: ChatInputSlot,
    group: 'patterns',
    title: 'Chat Input Slot',
    section: 'Patterns',
    route: 'patterns',
    layout: 'standard',
  },
  {
    name: 'PreviewPanel',
    slug: 'preview-panel',
    component: PreviewPanel,
    group: 'patterns',
    title: 'Preview Panel',
    section: 'Patterns',
    route: 'patterns',
    layout: 'standard',
  },
  {
    name: 'PreviewPanelHeader',
    slug: 'preview-panel-header',
    component: PreviewPanelHeader,
    group: 'patterns',
    title: 'Preview Panel Header',
    section: 'Patterns',
    route: 'patterns',
    layout: 'standard',
  },
  {
    name: 'EditableTitle',
    slug: 'editable-title',
    component: EditableTitle,
    group: 'patterns',
    title: 'Editable Title',
    section: 'Patterns',
    route: 'patterns',
    layout: 'standard',
  },
  {
    name: 'ShareableLink',
    slug: 'shareable-link',
    component: ShareableLink,
    group: 'patterns',
    title: 'Shareable Link',
    section: 'Patterns',
    route: 'patterns',
    layout: 'standard',
  },
  {
    name: 'ArtifactSegmentedControl',
    slug: 'artifact-segmented-control',
    component: ArtifactSegmentedControl,
    group: 'patterns',
    title: 'Artifact Panel',
    section: 'Patterns',
    route: 'patterns',
    layout: 'standard',
  },
  {
    name: 'ClarificationCard',
    slug: 'clarification-card',
    component: ClarificationCard,
    group: 'patterns',
    title: 'Clarification Card',
    section: 'Patterns',
    route: 'patterns',
    layout: 'standard',
  },

  // ─── Playground Components ───────────────────────────────────────────────────
  {
    name: 'ButtonV1',
    slug: 'pg-button',
    component: ButtonV1,
    group: 'playground',
    title: 'Button',
    section: 'Playground Components',
    route: 'playground',
    layout: 'standard',
    status: 'playground',
    interactive: true,
  },
  {
    name: 'Tag',
    slug: 'pg-tag',
    component: Tag,
    group: 'playground',
    title: 'Tag',
    section: 'Playground Components',
    route: 'playground',
    layout: 'standard',
    status: 'playground',
    interactive: true,
  },
  {
    name: 'ThinkingDots',
    slug: 'pg-thinking-dots',
    component: ThinkingDots,
    group: 'playground',
    title: 'Thinking Dots',
    section: 'Playground Components',
    route: 'playground',
    layout: 'standard',
    status: 'playground',
    interactive: true,
  },

  // ─── Playground Effects ───────────────────────────────────────────────────────
  {
    name: 'GravityWell',
    slug: 'gravity-assist',
    component: GravityWell,
    group: 'playground',
    title: 'Gravity Assist',
    section: 'Playground Effects',
    route: 'playground',
    layout: 'standard',
    status: 'playground',
  },
  {
    name: 'GridBackground',
    slug: 'grid-background',
    component: GridBackground,
    group: 'playground',
    title: 'Grid Background',
    section: 'Playground Effects',
    route: 'playground',
    layout: 'standard',
    status: 'playground',
  },

  // ─── Playground Pages ─────────────────────────────────────────────────────────
  {
    name: 'HomepagePage',
    slug: 'homepage',
    component: HomepagePage,
    group: 'playground',
    title: 'Homepage',
    section: 'Playground Pages',
    route: 'playground',
    layout: 'bare',
    status: 'playground',
  },
  {
    name: 'PrototypeWorkspacePage',
    slug: 'prototype-workspace',
    component: PrototypeWorkspacePage,
    group: 'playground',
    title: 'Prototype Workspace',
    section: 'Playground Pages',
    route: 'playground',
    layout: 'bare',
    status: 'playground',
  },
  {
    name: 'ArtifactNavigationPage',
    slug: 'artifact-navigation',
    component: ArtifactNavigationPage,
    group: 'playground',
    title: 'Artifact Navigation',
    section: 'Playground Pages',
    route: 'playground',
    layout: 'bare',
    status: 'playground',
  },
  {
    name: 'ClarificationChatDemoPage',
    slug: 'clarification-chat',
    component: ClarificationChatDemoPage,
    group: 'playground',
    title: 'Clarification Chat',
    section: 'Playground Pages',
    route: 'playground',
    layout: 'bare',
    status: 'playground',
  },
];

// ━━━ Page Registry ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PAGE_REGISTRY: PageEntry[] = [
  // Foundations (tokens)
  { slug: 'colors',     title: 'Colors',     section: 'Foundations', route: 'tokens',     layout: 'standard' },
  { slug: 'typography', title: 'Typography', section: 'Foundations', route: 'tokens',     layout: 'standard' },
  { slug: 'spacing',    title: 'Spacing',    section: 'Foundations', route: 'tokens',     layout: 'standard' },
  { slug: 'radius',     title: 'Radius',     section: 'Foundations', route: 'tokens',     layout: 'standard' },
  { slug: 'shadow',     title: 'Shadow',     section: 'Foundations', route: 'tokens',     layout: 'standard' },
  { slug: 'motion',     title: 'Motion',     section: 'Foundations', route: 'tokens',     layout: 'standard' },
  // Assets
  { slug: 'logo',          title: 'Logo',          section: 'Assets', route: 'assets', layout: 'standard' },
  { slug: 'icons',         title: 'Icons',         section: 'Assets', route: 'assets', layout: 'standard' },
  { slug: 'illustrations', title: 'Illustrations', section: 'Assets', route: 'assets', layout: 'standard' },
  { slug: 'animations',    title: 'Animations',    section: 'Assets', route: 'assets', layout: 'standard' },
  // Typography
  { slug: 'specimens', title: 'Specimens', section: 'Typography', route: 'typography', layout: 'standard' },
];

// ━━━ Constants ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SECTION_ORDER: SidebarSection[] = [
  // Foundations
  'Foundations',
  'Assets',
  'Typography',
  // Confirmed (UI + UX)
  'Components',
  'Patterns',
  // Playground
  'Playground Components',
  'Playground Patterns',
  'Playground Effects',
  'Playground Pages',
];

// ━━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Returns all ComponentMeta entries for a given route group. */
export function getEntriesForRoute(route: RouteGroup): ComponentMeta[] {
  return COMPONENT_REGISTRY.filter(e => e.route === route);
}

/** Finds a single entry by route + slug, searching both registries. */
export function getEntry(route: RouteGroup, slug: string): ComponentMeta | PageEntry | undefined {
  const component = COMPONENT_REGISTRY.find(e => e.route === route && e.slug === slug);
  if (component) return component;
  return PAGE_REGISTRY.find(e => e.route === route && e.slug === slug);
}

/** Returns all slugs for a given route group (from COMPONENT_REGISTRY). */
export function getSlugsForRoute(route: RouteGroup): string[] {
  return getEntriesForRoute(route).map(e => e.slug);
}

/** Compute the URL for a page entry. Typography is a standalone route. */
export function buildHref(entry: ComponentMeta | PageEntry): string {
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
  playground: 'Playground',
};

/** Compute the topbar title string, e.g. "Components / Button". */
export function buildTopbarTitle(entry: ComponentMeta | PageEntry): string {
  return `${ROUTE_DISPLAY[entry.route]} / ${entry.title}`;
}

// ━━━ Sidebar Nav Builder ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PLAYGROUND_SECTIONS = new Set<SidebarSection>([
  'Playground Components',
  'Playground Patterns',
  'Playground Effects',
  'Playground Pages',
]);

/** Produces the sidebar nav array from COMPONENT_REGISTRY and PAGE_REGISTRY. */
export function buildNav(): NavItem[] {
  const sections: NavItem[] = [];

  for (const section of SECTION_ORDER) {
    // Determine which entries belong to this section
    let entries: Array<ComponentMeta | PageEntry>;

    if (section === 'Foundations' || section === 'Assets' || section === 'Typography') {
      entries = PAGE_REGISTRY.filter(e => e.section === section);
    } else {
      entries = COMPONENT_REGISTRY.filter(e => e.section === section);
      // Sort Components section alphabetically by title
      if (section === 'Components') {
        entries = [...entries].sort((a, b) => a.title.localeCompare(b.title));
      }
    }

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
