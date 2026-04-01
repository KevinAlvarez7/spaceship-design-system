'use client';

import { Topbar } from '@/components/viewer/Topbar';
import { PAGE_REGISTRY, buildHref, type PageEntry } from '@/lib/viewer-registry';

function IframeThumbnail({ href, title }: { href: string; title: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <iframe
        src={href}
        title={title}
        tabIndex={-1}
        aria-hidden="true"
        loading="lazy"
        className="border-0 pointer-events-none"
        style={{
          width: 1440,
          height: 900,
          transform: 'scale(0.3)',
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}

export default function PlaygroundPage() {
  const entries = PAGE_REGISTRY.filter(e => e.section === 'Playground');

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Playground" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl space-y-10">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Playground</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Full-page flow demos under active development. These are end-to-end
              compositions, not individual components.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {entries.map(entry => (
              <a
                key={entry.slug}
                href={buildHref(entry)}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                  <IframeThumbnail href={buildHref(entry)} title={entry.title} />
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <span className="text-sm font-semibold text-zinc-900">{entry.title}</span>
                  {entry.description && (
                    <span className="text-xs text-zinc-500">{entry.description}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
