import { notFound } from 'next/navigation';
import { Topbar }                    from '@/components/viewer/Topbar';
import { ComponentPlayground }       from '@/components/viewer/ComponentPlayground';
import { GravityAssistPage }         from './GravityAssistPage';
import { GridBackgroundPage }        from './GridBackgroundPage';
import { GravityChatPage }           from './GravityChatPage';
import { PrototypeWorkspacePage }    from './PrototypeWorkspacePage';
import { ArtifactNavigationPage }    from './ArtifactNavigationPage';
import { ClarificationChatDemoPage } from './ClarificationChatDemoPage';
import { getEntry, getSlugsForRoute, buildTopbarTitle } from '@/lib/viewer-registry';

const PLAYGROUND: Record<string, React.ComponentType> = {
  'gravity-assist':      GravityAssistPage,
  'grid-background':     GridBackgroundPage,
  'gravity-chat':        GravityChatPage,
  'prototype-workspace': PrototypeWorkspacePage,
  'artifact-navigation': ArtifactNavigationPage,
  'clarification-chat':  ClarificationChatDemoPage,
};

export function generateStaticParams() {
  return getSlugsForRoute('playground').map(slug => ({ slug }));
}

export default async function PlaygroundSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry('playground', slug);
  if (!entry) notFound();

  // Interactive playground entries render the props explorer
  if (entry.interactive) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar title={buildTopbarTitle(entry)} />
        <main className="flex-1 overflow-y-auto p-6">
          <ComponentPlayground slug={slug} />
        </main>
      </div>
    );
  }

  const Component = PLAYGROUND[slug];
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
