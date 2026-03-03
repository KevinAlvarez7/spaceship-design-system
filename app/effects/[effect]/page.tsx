import { notFound } from 'next/navigation';
import { Topbar }            from '@/components/viewer/Topbar';
import { GravityAssistPage }    from './GravityAssistPage';
import { SpaceshipLogoPage }    from './SpaceshipLogoPage';
import { SpaceshipDotPage }     from './SpaceshipDotPage';
import { GridBackgroundPage }   from './GridBackgroundPage';
import { SpaceshipLogoV2Page }  from './SpaceshipLogoV2Page';
import { SpaceshipPlanetPage }  from './SpaceshipPlanetPage';
import { SpaceshipStarPage }    from './SpaceshipStarPage';
import { SpaceshipLogoScenePage } from './SpaceshipLogoScenePage';
import { getEntry, getSlugsForRoute, buildTopbarTitle } from '@/lib/viewer-registry';

const EFFECTS: Record<string, React.ComponentType> = {
  'gravity-assist':    GravityAssistPage,
  'spaceship-logo':    SpaceshipLogoPage,
  'spaceship-dot':     SpaceshipDotPage,
  'grid-background':   GridBackgroundPage,
  'spaceship-logo-v2': SpaceshipLogoV2Page,
  'spaceship-planet':  SpaceshipPlanetPage,
  'spaceship-star':         SpaceshipStarPage,
  'spaceship-logo-scene':   SpaceshipLogoScenePage,
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
