import { Preview } from '@/components/viewer/Preview';
import { ArtifactSegmentedControlDemos } from './ArtifactSegmentedControlDemos';

export function ArtifactSegmentedControlPage() {
  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Artifact Panel</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Multi-artifact panel with a tab bar header for switching between document types.
          Uses the TabBar DS component for the segmented control, with animated content
          transitions and status indicators.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Interactive Demo</h2>
        <Preview label="Artifact panel with tab navigation">
          <ArtifactSegmentedControlDemos />
        </Preview>
      </section>
    </div>
  );
}
