import { notFound } from 'next/navigation';
import { Topbar }         from '@/components/viewer/Topbar';
import { ColorPage }      from './ColorPage';
import { TypographyPage } from './TypographyPage';
import { SpacingPage }    from './SpacingPage';
import { RadiusPage }     from './RadiusPage';
import { ShadowPage }     from './ShadowPage';
import { MotionPage }     from './MotionPage';
import { getEntry, getSlugsForRoute, buildTopbarTitle } from '@/lib/viewer-registry';

const TOKENS: Record<string, React.ComponentType> = {
  colors:     ColorPage,
  typography: TypographyPage,
  spacing:    SpacingPage,
  radius:     RadiusPage,
  shadow:     ShadowPage,
  motion:     MotionPage,
};

export function generateStaticParams() {
  return getSlugsForRoute('tokens').map(slug => ({ category: slug }));
}

export default async function TokenCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const entry = getEntry('tokens', category);
  if (!entry) notFound();
  const Component = TOKENS[category];
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
