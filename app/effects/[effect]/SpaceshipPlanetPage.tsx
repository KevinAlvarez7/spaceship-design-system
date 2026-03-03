'use client';

import { SpaceshipPlanet } from '@/components/effects';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

// ── Props table ────────────────────────────────────────────────────────────────

const PROPS: PropRow[] = [
  { name: 'color',     type: 'string',              default: '—',    description: 'CSS fill color. Accepts var(--token) or any valid CSS color. Required.' },
  { name: 'size',      type: 'number',              default: '24',   description: 'Rendered diameter in pixels.' },
  { name: 'className', type: 'string',              default: '—',    description: 'Additional class names for positioning (e.g. absolute).' },
  { name: 'style',     type: 'React.CSSProperties', default: '—',    description: 'Inline styles for positioning (e.g. top, left).' },
];

// ── Usage snippet ──────────────────────────────────────────────────────────────

const USAGE = `import { SpaceshipPlanet } from '@/components/effects';

// Lilac planet at default size
<SpaceshipPlanet color="#C3A8FF" />

// Mint planet, larger
<SpaceshipPlanet color="#26E6B5" size={32} />

// Positioned absolutely inside a relative container
<SpaceshipPlanet
  color="#C3A8FF"
  size={32}
  style={{ position: 'absolute', bottom: 40, left: -20 }}
/>`;

// ── Sample colors ─────────────────────────────────────────────────────────────

const SAMPLES: { color: string; label: string }[] = [
  { color: '#C3A8FF', label: 'Lilac'  },
  { color: '#26E6B5', label: 'Mint'   },
  { color: '#3C7DFF', label: 'Blue'   },
  { color: '#F9614D', label: 'Coral'  },
  { color: '#F9C600', label: 'Yellow' },
  { color: '#ffffff', label: 'White'  },
];

// ── SpaceshipPlanetPage ────────────────────────────────────────────────────────

export function SpaceshipPlanetPage() {
  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Spaceship Planet</h1>
          <ExperimentBadge />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          A soft circle illustration with a shadow-border drop shadow and 10%-opacity black stroke.
          Pairs with SpaceshipLogoV2 as a decorative accent element.
        </p>
      </div>

      {/* Sizes */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <div className="flex items-end gap-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          {[16, 20, 24, 32].map(size => (
            <div key={size} className="flex flex-col items-center gap-2">
              <SpaceshipPlanet color="#C3A8FF" size={size} />
              <span className="text-xs text-zinc-400">{size}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* Colors */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Colors</h2>
        <div className="flex items-center gap-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          {SAMPLES.map(({ color, label }) => (
            <div key={color} className="flex flex-col items-center gap-2">
              <SpaceshipPlanet color={color} size={24} />
              <span className="text-xs text-zinc-400">{label}</span>
            </div>
          ))}
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
