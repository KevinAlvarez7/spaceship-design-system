import { Topbar } from '@/components/viewer/Topbar';

export default function PatternsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Patterns" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-zinc-900">Patterns</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Reusable compositions of components. Add patterns to{' '}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">components/patterns/</code>
            {' '}and register them here.
          </p>
          <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <p className="text-sm text-zinc-400">No patterns yet. Build a form, empty state, or card grid and add it here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
