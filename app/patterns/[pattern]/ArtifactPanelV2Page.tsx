import { Preview } from '@/components/viewer/Preview';
import {
  ArtifactPanelV2BasicDemo,
  ArtifactPanelV2NoToolbarDemo,
  ArtifactPanelV2WithEditsDemo,
  ArtifactPanelV2PrototypeToolbarDemo,
} from './ArtifactPanelV2Demos';

export function ArtifactPanelV2Page() {
  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Artifact Panel V2</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Multi-artifact panel using FolderTabsV2 for tab navigation with a flexible toolbar
          slot in the content card header. Toolbar content varies per artifact type — the
          consumer provides the appropriate toolbar ReactNode based on the active artifact.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Basic (with toolbar)</h2>
        <Preview label="Full MOCK_ARTIFACTS — toolbar switches between Document and Prototype variants">
          <ArtifactPanelV2BasicDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Prototype toolbar</h2>
        <Preview label="Brief + Prototype subset — starts on Prototype tab">
          <ArtifactPanelV2PrototypeToolbarDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With edit indicators</h2>
        <Preview label="Blink dots on Security and Prototype — clicking clears the indicator">
          <ArtifactPanelV2WithEditsDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">No toolbar</h2>
        <Preview label="Toolbar prop omitted — content card fills the full height">
          <ArtifactPanelV2NoToolbarDemo />
        </Preview>
      </section>
    </div>
  );
}
