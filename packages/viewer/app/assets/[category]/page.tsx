import { notFound }          from 'next/navigation';
import { Topbar }            from '@/components/viewer/Topbar';
import { LogoPage }          from './LogoPage';
import { IconsPage }         from './IconsPage';
import { IllustrationsPage } from './IllustrationsPage';
import { AnimationsPage }    from './AnimationsPage';
import { getEntry, getSlugsForRoute, buildTopbarTitle } from '@spaceship/design-system/registry';

const ASSETS: Record<string, React.ComponentType> = {
  logo:          LogoPage,
  icons:         IconsPage,
  illustrations: IllustrationsPage,
  animations:    AnimationsPage,
};

export function generateStaticParams() {
  return getSlugsForRoute('assets').map(slug => ({ category: slug }));
}

export default async function AssetPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const entry = getEntry('assets', category);
  if (!entry) notFound();
  const Component = ASSETS[category];
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
