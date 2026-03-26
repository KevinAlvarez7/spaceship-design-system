import { notFound } from 'next/navigation';
import { Topbar }      from '@/components/viewer/Topbar';
import { ButtonPage }  from './ButtonPage';
import { ChatInputBoxPage } from './ChatInputBoxPage';
import { ChatBubblePage }  from './ChatBubblePage';
import { ChatMessagePage } from './ChatMessagePage';
import { ChatThreadPage }  from './ChatThreadPage';
import { ModalPage }       from './ModalPage';
import { TagPage }         from './TagPage';
import { TabBarPage }      from './TabBarPage';
import { FolderTabsPage } from './FolderTabsPage';
import { ThinkingDotsPage } from './ThinkingDotsPage';
import { ThinkingPage } from './ThinkingPage';
import { TaskListPage } from './TaskListPage';
import { DropdownMenuPage } from './DropdownMenuPage';
import { ApprovalCardPage } from './ApprovalCardPage';
import { buildTopbarTitle } from '@/lib/viewer-registry';
import { discoverComponentEntries, getComponentEntry } from '@/lib/discover-components';

const COMPONENTS: Record<string, React.ComponentType> = {
  button:           ButtonPage,
  'chat-input-box': ChatInputBoxPage,
  'chat-bubble':    ChatBubblePage,
  'chat-message':   ChatMessagePage,
  'chat-thread':    ChatThreadPage,
  modal:            ModalPage,
  tag:              TagPage,
  'tab-bar':        TabBarPage,
  'folder-tabs':    FolderTabsPage,
  'thinking-dots':  ThinkingDotsPage,
  'thinking':       ThinkingPage,
  'task-list':      TaskListPage,
  'dropdown-menu':  DropdownMenuPage,
  'approval-card':  ApprovalCardPage,
};

function StubPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
      <p className="text-sm text-zinc-500">Viewer page coming soon.</p>
    </div>
  );
}

export function generateStaticParams() {
  return discoverComponentEntries().map(e => ({ component: e.slug }));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;
  const entry = getComponentEntry(component);
  if (!entry) notFound();

  const Component = COMPONENTS[component];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={buildTopbarTitle(entry)} />
      <main className="flex-1 overflow-y-auto p-8">
        {Component ? <Component /> : <StubPage title={entry.title} />}
      </main>
    </div>
  );
}
