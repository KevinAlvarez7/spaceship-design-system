import { notFound } from 'next/navigation';
import { Topbar }         from '@/components/viewer/Topbar';
import { ColorPage }      from './ColorPage';
import { TypographyPage } from './TypographyPage';
import { SpacingPage }    from './SpacingPage';
import { RadiusPage }     from './RadiusPage';
import { ShadowPage }     from './ShadowPage';
import { MotionPage }     from './MotionPage';

const PAGES: Record<string, { title: string; Component: React.ComponentType }> = {
  colors:     { title: 'Colors',     Component: ColorPage },
  typography: { title: 'Typography', Component: TypographyPage },
  spacing:    { title: 'Spacing',    Component: SpacingPage },
  radius:     { title: 'Radius',     Component: RadiusPage },
  shadow:     { title: 'Shadow',     Component: ShadowPage },
  motion:     { title: 'Motion',     Component: MotionPage },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map(category => ({ category }));
}

export default async function TokenCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const page = PAGES[category];
  if (!page) notFound();
  const { title, Component } = page;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={`Tokens / ${title}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
