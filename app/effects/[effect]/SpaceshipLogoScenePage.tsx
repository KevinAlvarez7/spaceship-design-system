'use client';

import { useState } from 'react';
import { SpaceshipLogoScene, SpaceshipPlanet, SpaceshipStar } from '@/components/effects';
import type { SceneDecoration } from '@/components/effects';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

// ── Props tables ───────────────────────────────────────────────────────────────

const SCENE_PROPS: PropRow[] = [
  { name: 'width',           type: 'number',              default: '180',   description: 'Width in pixels. Height scales proportionally.' },
  { name: 'interactive',     type: 'boolean',             default: 'true',  description: 'When true, the entire scene flees from the cursor.' },
  { name: 'fleeRadius',      type: 'number',              default: 'width × 0.5',   description: 'Distance in pixels at which flee begins.' },
  { name: 'maxDisplacement', type: 'number',              default: '100',   description: 'Maximum pixel offset from origin.' },
  { name: 'beamDuration',    type: 'number',              default: '3',     description: 'Duration of one full beam sweep cycle in seconds.' },
  { name: 'beamSkewRange',   type: 'number',              default: '15',    description: 'Max skewX angle (degrees) for the beam sweep oscillation.' },
  { name: 'disableMotion',   type: 'boolean',             default: 'false', description: 'Renders a static version with no animation or physics.' },
  { name: 'decorations',     type: 'SceneDecoration[]',   default: '—',     description: 'Override the default planet/star decorations.' },
  { name: 'className',       type: 'string',              default: '—',     description: 'Additional class names on the outermost element.' },
];

const DECORATION_PROPS: PropRow[] = [
  { name: 'element',      type: 'React.ReactNode',                                   default: '—',    description: 'The decoration element — typically SpaceshipPlanet or SpaceshipStar.' },
  { name: 'position',     type: '{ top?: number; right?: number; bottom?: number; left?: number }', default: '—', description: 'Absolute position offsets relative to the logo container. Scaled proportionally with width.' },
  { name: 'behind',       type: 'boolean',                                           default: 'true', description: 'Renders behind the logo when true (z-index 5), in front when false (z-index 15).' },
  { name: 'fleeRotation', type: 'number',                                            default: '180',  description: 'Degrees to spin when cursor enters the flee radius. Use 90 for planets, 180 (default) for stars.' },
];

// ── Usage snippet ──────────────────────────────────────────────────────────────

const USAGE = `import { SpaceshipLogoScene } from '@/components/effects';
import type { SceneDecoration } from '@/components/effects';

// Default — interactive flee + 4 decorations (no beam)
<SpaceshipLogoScene />

// Larger variant
<SpaceshipLogoScene width={280} />

// Non-interactive (for headers, loading screens, etc.)
<SpaceshipLogoScene interactive={false} />

// Custom decorations
const myDecorations: SceneDecoration[] = [
  { element: <SpaceshipPlanet color="#FF6B6B" size={28} />, position: { top: 60, left: -36 } },
  { element: <SpaceshipStar size={18} />,                   position: { top: -12, right: 20 } },
];
<SpaceshipLogoScene decorations={myDecorations} />`;

// ── Toggle button ──────────────────────────────────────────────────────────────

function Toggle({
  label,
  active,
  onChange,
}: {
  label: string;
  active: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={
        active
          ? 'bg-white text-zinc-900 shadow-sm rounded px-3 py-1 text-xs'
          : 'text-zinc-500 hover:text-zinc-700 px-3 py-1 text-xs'
      }
    >
      {label}
    </button>
  );
}

// ── Custom decorations override ────────────────────────────────────────────────

const CUSTOM_DECORATIONS: SceneDecoration[] = [
  { element: <SpaceshipPlanet color="#FF6B6B" size={28} />, position: { top: 60, left: -36 }, behind: true },
  { element: <SpaceshipPlanet color="#FFB347" size={18} />, position: { top: 8, right: -40 }, behind: true },
  { element: <SpaceshipStar size={22} />,                   position: { top: -14, left: 50 }, behind: true },
  { element: <SpaceshipStar size={12} />,                   position: { top: 4,  left: 72 }, behind: true },
];

// ── SpaceshipLogoScenePage ─────────────────────────────────────────────────────

export function SpaceshipLogoScenePage() {
  const [interactive, setInteractive] = useState(true);
  const [darkBg, setDarkBg] = useState(false);

  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Spaceship Logo Scene</h1>
          <ExperimentBadge />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          A composite component that renders SpaceshipLogoV2 surrounded by decorative planets and
          stars. The entire scene — logo and all decorations — flees together when the cursor
          approaches, creating the illusion they're all part of a single object.
        </p>
      </div>

      {/* Preview */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Preview</h2>
        <div
          className="relative flex items-center justify-center rounded-lg border border-zinc-200 overflow-hidden"
          style={{
            height: 320,
            background: darkBg ? '#18181b' : '#fafafa',
          }}
        >
          <SpaceshipLogoScene
            width={180}
            interactive={interactive}
          />
        </div>
        <div className="flex items-center gap-0.5 bg-zinc-100 rounded-md p-0.5 mt-3 w-fit">
          <Toggle label="Interactive" active={interactive} onChange={setInteractive} />
          <Toggle label="Dark bg" active={darkBg} onChange={setDarkBg} />
        </div>
      </section>

      {/* Custom decorations demo */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Custom decorations</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Pass a <code className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">decorations</code> array
          to override the default planets and stars.
        </p>
        <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 py-16">
          <SpaceshipLogoScene
            width={180}
            interactive={false}
            decorations={CUSTOM_DECORATIONS}
          />
        </div>
      </section>

      {/* Props — SceneDecoration */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-1">SceneDecoration</h2>
        <p className="text-sm text-zinc-500 mb-3">Shape of each entry in the <code className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">decorations</code> prop.</p>
        <PropsTable props={DECORATION_PROPS} />
      </section>

      {/* Props — SpaceshipLogoScene */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={SCENE_PROPS} />
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <div className="relative rounded-lg border border-zinc-200 overflow-hidden text-sm">
          <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-4 py-2">
            <span className="text-xs text-zinc-400 font-mono">tsx</span>
          </div>
          <pre className="overflow-x-auto p-4 bg-white text-xs text-zinc-800 font-mono leading-relaxed m-0">
            <code>{USAGE}</code>
          </pre>
        </div>
      </section>

    </div>
  );
}
