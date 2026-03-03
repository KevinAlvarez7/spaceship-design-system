'use client';

import { SpaceshipDot, SpaceshipLogoV2 } from '@/components/effects';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

// ── Props table ────────────────────────────────────────────────────────────────

const PROPS: PropRow[] = [
  { name: 'color',     type: 'string',             default: '—',    description: 'CSS fill color. Accepts var(--token) or any valid CSS color.' },
  { name: 'size',      type: 'number',             default: '16',   description: 'Rendered diameter in pixels. Supported range: 16–24px.' },
  { name: 'className', type: 'string',             default: '—',    description: 'Additional class names for positioning (e.g. absolute).' },
  { name: 'style',     type: 'React.CSSProperties', default: '—',   description: 'Inline styles for positioning (e.g. top, left).' },
];

// ── Usage snippet ──────────────────────────────────────────────────────────────

const USAGE = `import { SpaceshipDot, SpaceshipLogo } from '@/components/effects';

<div style={{ position: 'relative', display: 'inline-block' }}>
  <SpaceshipLogo width={180} />
  <SpaceshipDot color="#F9614D" size={24} style={{ position: 'absolute', bottom: 24, left: -16 }} />
  <SpaceshipDot color="#26E6B5" size={16} style={{ position: 'absolute', top: 32, right: -12 }} />
  <SpaceshipDot color="#F9C600" size={12} style={{ position: 'absolute', top: 8,  right: 24  }} />
  <SpaceshipDot color="#3C7DFF" size={10} style={{ position: 'absolute', top: 56, left: 8   }} />
</div>`;

// ── Sample dots ───────────────────────────────────────────────────────────────

const SAMPLES: { color: string; label: string }[] = [
  { color: '#3C7DFF', label: 'Blue'   },
  { color: '#F9614D', label: 'Coral'  },
  { color: '#F9C600', label: 'Yellow' },
  { color: '#26E6B5', label: 'Mint'   },
  { color: '#ffffff', label: 'White'  },
  { color: '#18181b', label: 'Black'  },
];

// ── SpaceshipDotPage ──────────────────────────────────────────────────────────

export function SpaceshipDotPage() {
  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Spaceship Dot</h1>
          <ExperimentBadge />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          A mini circle illustration matching the SpaceshipLogo's bold SVG style —
          solid fill with a black outline. Placeable anywhere as a decorative accent.
        </p>
      </div>

      {/* Preview */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <div className="flex items-end gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          {[16, 18, 20, 22, 24].map(size => (
            <div key={size} className="flex flex-col items-center gap-2">
              <SpaceshipDot color="#3C7DFF" size={size} />
              <span className="text-xs text-zinc-400">{size}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* Colors */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Colors</h2>
        <div className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          {SAMPLES.map(({ color, label }) => (
            <div key={color} className="flex flex-col items-center gap-2">
              <SpaceshipDot color={color} size={24} />
              <span className="text-xs text-zinc-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Composition */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Composition</h2>
        <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 py-12">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <SpaceshipLogoV2 width={180} interactive={false} />
            {/* coral — bottom-left */}
            <SpaceshipDot color="#F9614D" size={24} style={{ position: 'absolute', bottom: 24, left: -16 }} />
            {/* mint — right */}
            <SpaceshipDot color="#26E6B5" size={16} style={{ position: 'absolute', top: 32, right: -12 }} />
            {/* yellow — top-right */}
            <SpaceshipDot color="#F9C600" size={12} style={{ position: 'absolute', top: 8, right: 24 }} />
            {/* blue — left */}
            <SpaceshipDot color="#3C7DFF" size={10} style={{ position: 'absolute', top: 56, left: 8 }} />
          </div>
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
