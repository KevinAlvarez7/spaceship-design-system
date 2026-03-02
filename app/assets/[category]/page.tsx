import { notFound }          from 'next/navigation';
import { Topbar }            from '@/components/viewer/Topbar';
import { LogoPage }          from './LogoPage';
import { IconsPage }         from './IconsPage';
import { IllustrationsPage } from './IllustrationsPage';
import { AnimationsPage }    from './AnimationsPage';

const PAGES: Record<string, { title: string; Component: React.ComponentType }> = {
  logo:          { title: 'Logo',          Component: LogoPage },
  icons:         { title: 'Icons',         Component: IconsPage },
  illustrations: { title: 'Illustrations', Component: IllustrationsPage },
  animations:    { title: 'Animations',    Component: AnimationsPage },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map(category => ({ category }));
}

export default async function AssetPage({
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
      <Topbar title={`Assets / ${title}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
