'use client';

import { useState } from 'react';
import { assetCategories } from '@/assets';
import { AssetGrid } from '@/components/docs/AssetGrid';
import { SpaceshipLogoV2, SpaceshipLogoScene, SpaceshipPlanet, SpaceshipStar } from '@/components/effects';
import type { SceneDecoration } from '@/components/effects';
import { PropsTable, type PropRow } from '@/components/docs/PropsTable';

// ── Props tables ───────────────────────────────────────────────────────────────

const LOGO_PROPS: PropRow[] = [
  { name: 'width',           type: 'number',  default: '180',   description: 'Width of the saucer in pixels. Height scales proportionally.' },
  { name: 'interactive',     type: 'boolean', default: 'true',  description: 'When true, the ship flees from the cursor using spring physics.' },
  { name: 'fleeRadius',      type: 'number',  default: '300',   description: 'Distance in pixels at which the ship begins to flee the cursor.' },
  { name: 'maxDisplacement', type: 'number',  default: '100',   description: 'Maximum pixel offset the ship can be displaced from its origin.' },
  { name: 'beamDuration',    type: 'number',  default: '3',     description: 'Duration in seconds for one full beam sweep cycle.' },
  { name: 'beamSkewRange',   type: 'number',  default: '15',    description: 'Degrees of skew applied to each side of the beam sweep.' },
  { name: 'disableMotion',   type: 'boolean', default: 'false', description: 'Renders a static version with no animation or physics.' },
  { name: 'className',       type: 'string',  default: '—',     description: 'Additional class names applied to the outermost element.' },
];

const SCENE_PROPS: PropRow[] = [
  { name: 'width',           type: 'number',            default: '180',           description: 'Width in pixels. Height scales proportionally.' },
  { name: 'interactive',     type: 'boolean',           default: 'true',          description: 'When true, the entire scene flees from the cursor.' },
  { name: 'fleeRadius',      type: 'number',            default: 'width × 0.5',   description: 'Distance in pixels at which flee begins.' },
  { name: 'maxDisplacement', type: 'number',            default: '100',           description: 'Maximum pixel offset from origin.' },
  { name: 'beamDuration',    type: 'number',            default: '3',             description: 'Duration of one full beam sweep cycle in seconds.' },
  { name: 'beamSkewRange',   type: 'number',            default: '15',            description: 'Max skewX angle (degrees) for the beam sweep oscillation.' },
  { name: 'disableMotion',   type: 'boolean',           default: 'false',         description: 'Renders a static version with no animation or physics.' },
  { name: 'decorations',     type: 'SceneDecoration[]', default: '—',             description: 'Override the default planet/star decorations.' },
  { name: 'className',       type: 'string',            default: '—',             description: 'Additional class names on the outermost element.' },
];

const DECORATION_PROPS: PropRow[] = [
  { name: 'element',      type: 'React.ReactNode',                                                    default: '—',    description: 'The decoration element — typically SpaceshipPlanet or SpaceshipStar.' },
  { name: 'position',     type: '{ top?: number; right?: number; bottom?: number; left?: number }',   default: '—',    description: 'Absolute position offsets relative to the logo container. Scaled proportionally with width.' },
  { name: 'behind',       type: 'boolean',                                                            default: 'true', description: 'Renders behind the logo when true (z-index 5), in front when false (z-index 15).' },
  { name: 'fleeRotation', type: 'number',                                                             default: '180',  description: 'Degrees to spin when cursor enters the flee radius. Use 90 for planets, 180 (default) for stars.' },
];

// ── Usage snippets ─────────────────────────────────────────────────────────────

const LOGO_USAGE = `import { SpaceshipLogoV2, SpaceshipPlanet, SpaceshipStar } from '@/components/effects';

// Default — interactive flee + sweeping beam
<SpaceshipLogoV2 />

// Larger, with a slower beam sweep
<SpaceshipLogoV2 width={280} beamDuration={5} />

// Non-interactive (for headers, loading screens, etc.)
<SpaceshipLogoV2 interactive={false} />

// Fully static — no animations at all
<SpaceshipLogoV2 disableMotion />`;

const SCENE_USAGE = `import { SpaceshipLogoScene } from '@/components/effects';
import type { SceneDecoration } from '@/components/effects';

// Default — interactive flee + 4 decorations
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

// ── Custom decorations override ────────────────────────────────────────────────

const CUSTOM_DECORATIONS: SceneDecoration[] = [
  { element: <SpaceshipPlanet color="#FF6B6B" size={28} />, position: { top: 60, left: -36 }, behind: true },
  { element: <SpaceshipPlanet color="#FFB347" size={18} />, position: { top: 8, right: -40 }, behind: true },
  { element: <SpaceshipStar size={22} />,                   position: { top: -14, left: 50 }, behind: true },
  { element: <SpaceshipStar size={12} />,                   position: { top: 4,  left: 72 }, behind: true },
];

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

// ── LogoPage ───────────────────────────────────────────────────────────────────

export function LogoPage() {
  const [logoInteractive, setLogoInteractive] = useState(true);
  const [beamActive, setBeamActive] = useState(true);
  const [logoDarkBg, setLogoDarkBg] = useState(false);
  const [sceneInteractive, setSceneInteractive] = useState(true);
  const [sceneDarkBg, setSceneDarkBg] = useState(false);

  return (
    <div className="max-w-3xl space-y-16">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Logo</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Official logo components — the standalone logo and the full scene with decorative planets and stars.
        </p>
      </div>

      {/* ── SpaceshipLogoV2 ── */}
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">SpaceshipLogoV2</h2>
          <p className="mt-2 text-sm text-zinc-500">
            The standalone logo. Uses shadow-border drop shadows and 10%-opacity black strokes for a
            lighter look. Supports cursor-flee physics, beam sweep, and banking rotation.
          </p>
        </div>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Preview</h3>
          <div
            className="relative flex items-center justify-center rounded-lg border border-zinc-200 overflow-hidden"
            style={{ height: 320, background: logoDarkBg ? '#18181b' : '#fafafa' }}
          >
            <SpaceshipLogoV2
              width={180}
              interactive={logoInteractive}
              disableMotion={!beamActive && !logoInteractive}
            />
          </div>
          <div className="flex items-center gap-0.5 bg-zinc-100 rounded-md p-0.5 mt-3 w-fit">
            <Toggle label="Interactive" active={logoInteractive} onChange={setLogoInteractive} />
            <Toggle label="Beam" active={beamActive} onChange={setBeamActive} />
            <Toggle label="Dark bg" active={logoDarkBg} onChange={setLogoDarkBg} />
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Props</h3>
          <PropsTable props={LOGO_PROPS} />
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Usage</h3>
          <div className="relative rounded-lg border border-zinc-200 overflow-hidden text-sm">
            <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-4 py-2">
              <span className="text-xs text-zinc-400 font-mono">tsx</span>
            </div>
            <pre className="overflow-x-auto p-4 bg-white text-xs text-zinc-800 font-mono leading-relaxed m-0">
              <code>{LOGO_USAGE}</code>
            </pre>
          </div>
        </section>
      </section>

      {/* ── SpaceshipLogoScene ── */}
      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">SpaceshipLogoScene</h2>
          <p className="mt-2 text-sm text-zinc-500">
            A composite component that renders SpaceshipLogoV2 surrounded by decorative planets and
            stars. The entire scene flees together when the cursor approaches, creating the illusion
            they&apos;re all part of a single object.
          </p>
        </div>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Preview</h3>
          <div
            className="relative flex items-center justify-center rounded-lg border border-zinc-200 overflow-hidden"
            style={{ height: 320, background: sceneDarkBg ? '#18181b' : '#fafafa' }}
          >
            <SpaceshipLogoScene width={180} interactive={sceneInteractive} />
          </div>
          <div className="flex items-center gap-0.5 bg-zinc-100 rounded-md p-0.5 mt-3 w-fit">
            <Toggle label="Interactive" active={sceneInteractive} onChange={setSceneInteractive} />
            <Toggle label="Dark bg" active={sceneDarkBg} onChange={setSceneDarkBg} />
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Custom decorations</h3>
          <p className="text-sm text-zinc-500 mb-4">
            Pass a <code className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">decorations</code> array to override the default planets and stars.
          </p>
          <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 py-16">
            <SpaceshipLogoScene width={180} interactive={false} decorations={CUSTOM_DECORATIONS} />
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-1">SceneDecoration</h3>
          <p className="text-sm text-zinc-500 mb-3">Shape of each entry in the <code className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded">decorations</code> prop.</p>
          <PropsTable props={DECORATION_PROPS} />
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Props</h3>
          <PropsTable props={SCENE_PROPS} />
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Usage</h3>
          <div className="relative rounded-lg border border-zinc-200 overflow-hidden text-sm">
            <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-4 py-2">
              <span className="text-xs text-zinc-400 font-mono">tsx</span>
            </div>
            <pre className="overflow-x-auto p-4 bg-white text-xs text-zinc-800 font-mono leading-relaxed m-0">
              <code>{SCENE_USAGE}</code>
            </pre>
          </div>
        </section>
      </section>

      {/* Asset grid — static logo files */}
      <AssetGrid assets={assetCategories.logo.assets} emptyCategory={assetCategories.logo.slug} />

    </div>
  );
}
