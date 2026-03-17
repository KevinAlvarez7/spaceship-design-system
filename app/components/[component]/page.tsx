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
import { getEntry, getSlugsForRoute, buildTopbarTitle } from '@/lib/viewer-registry';

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
};

export function generateStaticParams() {
  return getSlugsForRoute('components').map(slug => ({ component: slug }));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;
  const entry = getEntry('components', component);
  if (!entry) notFound();
  const Component = COMPONENTS[component];
  if (!Component) notFound();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={buildTopbarTitle(entry)} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
