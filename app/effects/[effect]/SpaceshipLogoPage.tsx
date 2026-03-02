'use client';

import { useState } from 'react';
import { SpaceshipLogo } from '@/components/effects';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

// ── Props table ────────────────────────────────────────────────────────────────

const PROPS: PropRow[] = [
  { name: 'width',           type: 'number',  default: '180',   description: 'Width of the saucer in pixels. Height scales proportionally.' },
  { name: 'interactive',     type: 'boolean', default: 'true',  description: 'When true, the ship flees from the cursor using spring physics.' },
  { name: 'fleeRadius',      type: 'number',  default: '300',   description: 'Distance in pixels at which the ship begins to flee the cursor.' },
  { name: 'maxDisplacement', type: 'number',  default: '100',   description: 'Maximum pixel offset the ship can be displaced from its origin.' },
  { name: 'beamDuration',    type: 'number',  default: '3',     description: 'Duration in seconds for one full beam sweep cycle.' },
  { name: 'beamSkewRange',   type: 'number',  default: '15',    description: 'Degrees of skew applied to each side of the beam sweep.' },
  { name: 'disableMotion',   type: 'boolean', default: 'false', description: 'Renders a static version with no animation or physics.' },
  { name: 'className',       type: 'string',  default: '—',     description: 'Additional class names applied to the outermost element.' },
];

// ── Usage snippet ──────────────────────────────────────────────────────────────

const USAGE = `import { SpaceshipLogo } from '@/components/effects';

// Default — interactive flee + sweeping beam
<SpaceshipLogo />

// Larger, with a slower beam sweep
<SpaceshipLogo width={280} beamDuration={5} />

// Non-interactive (for headers, loading screens, etc.)
<SpaceshipLogo interactive={false} />

// Fully static — no animations at all
<SpaceshipLogo disableMotion />`;

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

// ── SpaceshipLogoPage ──────────────────────────────────────────────────────────

export function SpaceshipLogoPage() {
  const [interactive, setInteractive] = useState(true);
  const [beamActive, setBeamActive] = useState(true);
  const [darkBg, setDarkBg] = useState(false);

  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Spaceship Logo</h1>
          <ExperimentBadge />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          An animated version of the Spaceship logo. The ship flees from the cursor
          using spring physics, banks in the direction of movement, and sweeps a tractor
          beam left-to-right. The beam hides whenever the cursor gets close.
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
          <SpaceshipLogo
            width={180}
            interactive={interactive}
            disableMotion={!beamActive && !interactive}
          />
        </div>
        <div className="flex items-center gap-0.5 bg-zinc-100 rounded-md p-0.5 mt-3 w-fit">
          <Toggle label="Interactive" active={interactive} onChange={setInteractive} />
          <Toggle label="Beam" active={beamActive} onChange={setBeamActive} />
          <Toggle label="Dark bg" active={darkBg} onChange={setDarkBg} />
        </div>
      </section>

      {/* Props */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
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
