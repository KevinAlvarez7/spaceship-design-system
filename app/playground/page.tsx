import Link from 'next/link';
import { Topbar } from '@/components/viewer/Topbar';
import { PAGE_REGISTRY, buildHref, type SidebarSection } from '@/lib/viewer-registry';

const PLAYGROUND_SECTIONS: SidebarSection[] = [
  'Playground Components',
  'Playground Patterns',
  'Playground Effects',
  'Playground Pages',
];

export default function PlaygroundPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Playground" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl space-y-10">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Playground</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Exploration space for effects, patterns, and full-page demos under active
              development. Items here are not handoff-ready — graduate them to the confirmed
              sections when they meet DS standards.
            </p>
          </div>

          {PLAYGROUND_SECTIONS.map(section => {
            const entries = PAGE_REGISTRY.filter(e => e.section === section);
            if (entries.length === 0) return null;
            const label = section.replace('Playground ', '');
            return (
              <section key={section}>
                <h2 className="text-base font-semibold text-zinc-800 mb-3">{label}</h2>
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
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
