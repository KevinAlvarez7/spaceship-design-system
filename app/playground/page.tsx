import Link from 'next/link';
import { Topbar } from '@/components/viewer/Topbar';
import { PAGE_REGISTRY, buildHref } from '@/lib/viewer-registry';

export default function PlaygroundPage() {
  const entries = PAGE_REGISTRY.filter(e => e.section === 'Playground');

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Playground" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl space-y-10">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Playground</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Full-page flow demos under active development. These are end-to-end
              compositions, not individual components.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {entries.map(entry => (
              <Link
                key={entry.slug}
                href={buildHref(entry)}
                className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-4 hover:border-violet-200 hover:shadow-sm transition-all"
              >
                <span className="text-sm font-medium text-zinc-900">{entry.title}</span>
                <span className="text-xs text-zinc-400 capitalize">{entry.layout} layout</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
