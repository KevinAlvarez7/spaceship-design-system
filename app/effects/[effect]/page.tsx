import { notFound } from 'next/navigation';
import { Topbar }            from '@/components/viewer/Topbar';
import { GravityAssistPage } from './GravityAssistPage';
import { SpaceshipLogoPage } from './SpaceshipLogoPage';

const PAGES: Record<string, { title: string; Component: React.ComponentType }> = {
  'gravity-assist':  { title: 'Gravity Assist',  Component: GravityAssistPage },
  'spaceship-logo':  { title: 'Spaceship Logo',  Component: SpaceshipLogoPage },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map(effect => ({ effect }));
}

export default async function EffectPage({
  params,
}: {
  params: Promise<{ effect: string }>;
}) {
  const { effect } = await params;
  const page = PAGES[effect];
  if (!page) notFound();
  const { title, Component } = page;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={`Effects / ${title}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
