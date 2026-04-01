import { notFound } from 'next/navigation';
import { Topbar }                    from '@/components/viewer/Topbar';
import { ChatPage }                  from './ChatPage';
import { PreviewPanelPage }          from './PreviewPanelPage';
import { PreviewPanelHeaderPage }    from './PreviewPanelHeaderPage';
import { EditableTitlePage }         from './EditableTitlePage';
import { ShareableLinkPage }         from './ShareableLinkPage';
import { ClarificationCardPage }        from './ClarificationCardPage';
import { ClarificationCardKeycapPage } from './ClarificationCardKeycapPage';
import { ArtifactSegmentedControlPage } from './ArtifactSegmentedControlPage';
import { ArtifactPanelV2Page }       from './ArtifactPanelV2Page';
import { ChatPanelPage }             from './ChatPanelPage';
import { getEntry, getSlugsForRoute, buildTopbarTitle } from '@/lib/viewer-registry';

const PATTERNS: Record<string, React.ComponentType> = {
  'chat':                         ChatPage,
  'preview-panel':                PreviewPanelPage,
  'preview-panel-header':         PreviewPanelHeaderPage,
  'editable-title':               EditableTitlePage,
  'shareable-link':               ShareableLinkPage,
  'clarification-card':           ClarificationCardPage,
  'clarification-card-keycap':   ClarificationCardKeycapPage,
  'artifact-segmented-control':   ArtifactSegmentedControlPage,
  'artifact-panel-v2':            ArtifactPanelV2Page,
  'chat-panel':                   ChatPanelPage,
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

  if (entry.layout === 'bare') {
    return <Component />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={buildTopbarTitle(entry)} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
