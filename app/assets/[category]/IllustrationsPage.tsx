'use client';

import { assetCategories } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';
import { SpaceshipPlanet, SpaceshipStar } from '@/components/effects';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

// ── SpaceshipPlanet props ──────────────────────────────────────────────────────

const PLANET_PROPS: PropRow[] = [
  { name: 'color',     type: 'string',              default: '—',    description: 'CSS fill color. Accepts var(--token) or any valid CSS color. Required.' },
  { name: 'size',      type: 'number',              default: '24',   description: 'Rendered diameter in pixels.' },
  { name: 'className', type: 'string',              default: '—',    description: 'Additional class names for positioning (e.g. absolute).' },
  { name: 'style',     type: 'React.CSSProperties', default: '—',    description: 'Inline styles for positioning (e.g. top, left).' },
];

const PLANET_USAGE = `import { SpaceshipPlanet } from '@/components/effects';

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

const PLANET_SAMPLES: { color: string; label: string }[] = [
  { color: '#C3A8FF', label: 'Lilac'  },
  { color: '#26E6B5', label: 'Mint'   },
  { color: '#3C7DFF', label: 'Blue'   },
  { color: '#F9614D', label: 'Coral'  },
  { color: '#F9C600', label: 'Yellow' },
  { color: '#ffffff', label: 'White'  },
];

// ── SpaceshipStar props ────────────────────────────────────────────────────────

const STAR_PROPS: PropRow[] = [
  { name: 'color',     type: 'string',              default: '#FFE156', description: 'CSS fill color. Accepts var(--token) or any valid CSS color.' },
  { name: 'size',      type: 'number',              default: '24',      description: 'Bounding-box size in pixels.' },
  { name: 'className', type: 'string',              default: '—',       description: 'Additional class names for positioning (e.g. absolute).' },
  { name: 'style',     type: 'React.CSSProperties', default: '—',       description: 'Inline styles for positioning (e.g. top, left).' },
];

const STAR_USAGE = `import { SpaceshipStar } from '@/components/effects';

// Default yellow star
<SpaceshipStar />

// Larger star
<SpaceshipStar size={32} />

// Custom color
<SpaceshipStar color="#F9614D" size={24} />

// Positioned absolutely inside a relative container
<SpaceshipStar
  size={24}
  style={{ position: 'absolute', top: 8, right: 28 }}
/>`;

const STAR_SAMPLES: { color: string; label: string }[] = [
  { color: '#FFE156', label: 'Yellow' },
  { color: '#F9C600', label: 'Gold'   },
  { color: '#C3A8FF', label: 'Lilac'  },
  { color: '#26E6B5', label: 'Mint'   },
  { color: '#F9614D', label: 'Coral'  },
  { color: '#ffffff', label: 'White'  },
];

// ── IllustrationsPage ──────────────────────────────────────────────────────────

export function IllustrationsPage() {
  return (
    <div className="max-w-3xl space-y-16">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Illustrations</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Illustration assets. Click a card to toggle light / dark preview background.
        </p>
      </div>

      {/* SpaceshipPlanet */}
      <section className="space-y-8">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-zinc-900">Spaceship Planet</h2>
            <ExperimentBadge />
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            A soft circle illustration with a shadow-border drop shadow and 10%-opacity black stroke.
            Pairs with SpaceshipLogoV2 as a decorative accent element.
          </p>
        </div>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h3>
          <div className="flex items-end gap-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
            {[16, 20, 24, 32].map(size => (
              <div key={size} className="flex flex-col items-center gap-2">
                <SpaceshipPlanet color="#C3A8FF" size={size} />
                <span className="text-xs text-zinc-400">{size}px</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Colors</h3>
          <div className="flex items-center gap-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
            {PLANET_SAMPLES.map(({ color, label }) => (
              <div key={color} className="flex flex-col items-center gap-2">
                <SpaceshipPlanet color={color} size={24} />
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Props</h3>
          <PropsTable props={PLANET_PROPS} />
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Usage</h3>
          <div className="relative rounded-lg border border-zinc-200 overflow-hidden text-sm">
            <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-4 py-2">
              <span className="text-xs text-zinc-400 font-mono">tsx</span>
            </div>
            <pre className="overflow-x-auto p-4 bg-white text-xs text-zinc-800 font-mono leading-relaxed m-0">
              <code>{PLANET_USAGE}</code>
            </pre>
          </div>
        </section>
      </section>

      {/* SpaceshipStar */}
      <section className="space-y-8">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-zinc-900">Spaceship Star</h2>
            <ExperimentBadge />
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            A 4-pointed star with curved concave edges, shadow-border drop shadow, and 10%-opacity
            black stroke. Pairs with SpaceshipLogoV2 as a decorative accent element.
          </p>
        </div>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h3>
          <div className="flex items-end gap-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
            {[16, 20, 24, 32].map(size => (
              <div key={size} className="flex flex-col items-center gap-2">
                <SpaceshipStar size={size} />
                <span className="text-xs text-zinc-400">{size}px</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Colors</h3>
          <div className="flex items-center gap-6 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
            {STAR_SAMPLES.map(({ color, label }) => (
              <div key={color} className="flex flex-col items-center gap-2">
                <SpaceshipStar color={color} size={24} />
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Props</h3>
          <PropsTable props={STAR_PROPS} />
        </section>

        <section>
          <h3 className="text-base font-semibold text-zinc-800 mb-3">Usage</h3>
          <div className="relative rounded-lg border border-zinc-200 overflow-hidden text-sm">
            <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-4 py-2">
              <span className="text-xs text-zinc-400 font-mono">tsx</span>
            </div>
            <pre className="overflow-x-auto p-4 bg-white text-xs text-zinc-800 font-mono leading-relaxed m-0">
              <code>{STAR_USAGE}</code>
            </pre>
          </div>
        </section>
      </section>

      {/* Asset grid — future illustration assets */}
      <AssetGrid assets={assetCategories.illustrations.assets} emptyCategory={assetCategories.illustrations.slug} />

    </div>
  );
}
