import { notFound } from 'next/navigation';
import { Topbar }            from '@/components/viewer/Topbar';
import { GravityAssistPage }    from './GravityAssistPage';
import { GridBackgroundPage }   from './GridBackgroundPage';
import { getEntry, getSlugsForRoute, buildTopbarTitle } from '@spaceship/design-system/registry';

const EFFECTS: Record<string, React.ComponentType> = {
  'gravity-assist':  GravityAssistPage,
  'grid-background': GridBackgroundPage,
};

export function generateStaticParams() {
  return getSlugsForRoute('effects').map(slug => ({ effect: slug }));
}

export default async function EffectPage({
  params,
}: {
  params: Promise<{ effect: string }>;
}) {
  const { effect } = await params;
  const entry = getEntry('effects', effect);
  if (!entry) notFound();
  const Component = EFFECTS[effect];
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
