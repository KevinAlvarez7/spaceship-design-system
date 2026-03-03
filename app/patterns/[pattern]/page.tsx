import { notFound } from 'next/navigation';
import { ChatPage }               from './ChatPage';
import { PreviewPanelPage }       from './PreviewPanelPage';
import { PreviewPanelHeaderPage } from './PreviewPanelHeaderPage';
import { EditableTitlePage }      from './EditableTitlePage';
import { ShareableLinkPage }      from './ShareableLinkPage';
import { SidebarTogglePage }      from './SidebarTogglePage';
import { GravityChatPage }        from './GravityChatPage';
import { PrototypeWorkspacePage } from './PrototypeWorkspacePage';
import { getEntry, getSlugsForRoute } from '@/lib/viewer-registry';

const PATTERNS: Record<string, React.ComponentType> = {
  'chat':                   ChatPage,
  'preview-panel':          PreviewPanelPage,
  'preview-panel-header':   PreviewPanelHeaderPage,
  'editable-title':         EditableTitlePage,
  'shareable-link':         ShareableLinkPage,
  'sidebar-toggle':         SidebarTogglePage,
  'gravity-chat':           GravityChatPage,
  'prototype-workspace':    PrototypeWorkspacePage,
};

export function generateStaticParams() {
  return getSlugsForRoute('patterns').map(slug => ({ pattern: slug }));
}

export default async function PatternPage({
  params,
}: {
  params: Promise<{ pattern: string }>;
}) {
  const { pattern } = await params;
  const entry = getEntry('patterns', pattern);
  if (!entry) notFound();
  const Component = PATTERNS[pattern];
  if (!Component) notFound();

  // All patterns use bare layout — rendered directly without Topbar
  return <Component />;
}
