import { Preview } from '@/components/viewer/Preview';
import { ShareableLink } from '@/components/patterns';

export function ShareableLinkPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Shareable Link</h1>
        <p className="mt-2 text-sm text-zinc-500">Displays a URL with a copy-to-clipboard action and optional share button.</p>
      </div>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label="Default">
          <ShareableLink url="spaceship.design/prototype/abc123" />
          <ShareableLink url="spaceship.design/prototype/abc123" shareLabel="Share" />
        </Preview>
      </section>
    </div>
  );
}
