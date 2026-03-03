'use client';

import { GridBackground } from '@/components/effects';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

// ── Props table ────────────────────────────────────────────────────────────────

const PROPS: PropRow[] = [
  { name: 'background',       type: 'string',              default: 'var(--neutral-50)',          description: 'Canvas fill color. Set to "transparent" to skip the fill entirely.' },
  { name: 'dotColor',         type: 'string',              default: 'var(--effect-gravity-dot)',   description: 'Color of the static dot grid.' },
  { name: 'staticGridColor',  type: 'string',              default: 'var(--effect-gravity-grid)',  description: 'Color of the faint static line grid.' },
  { name: 'showDots',         type: 'boolean',             default: 'true',                        description: 'Toggle the dot grid layer.' },
  { name: 'showStaticGrid',   type: 'boolean',             default: 'true',                        description: 'Toggle the static line grid layer.' },
  { name: 'step',             type: 'number',              default: '38',                          description: 'Pixel spacing between dots and grid lines.' },
  { name: 'className',        type: 'string',              default: '—',                           description: 'Additional class names.' },
  { name: 'style',            type: 'React.CSSProperties', default: '—',                           description: 'Inline styles.' },
];

// ── Usage snippet ──────────────────────────────────────────────────────────────

const USAGE = `import { GridBackground } from '@/components/effects';

// Full background layer — fill a positioned container
<div style={{ position: 'relative', height: 300 }}>
  <GridBackground />
  <div style={{ position: 'relative', zIndex: 1 }}>Content</div>
</div>

// Dots only
<GridBackground showStaticGrid={false} />

// Lines only
<GridBackground showDots={false} />

// Composed under GravityWell (suppress GravityWell's own static layers)
<div style={{ position: 'relative', height: 300 }}>
  <GridBackground />
  <GravityWell
    background="transparent"
    showDots={false}
    showStaticGrid={false}
  />
</div>`;

// ── GridBackgroundPage ─────────────────────────────────────────────────────────

export function GridBackgroundPage() {
  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Grid Background</h1>
          <ExperimentBadge />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          A static canvas layer that renders the dot grid and line grid used inside GravityWell.
          Use it standalone as a textured background, or compose it beneath a GravityWell with
          its own static layers disabled.
        </p>
      </div>

      {/* Default */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 220 }}>
          <GridBackground />
        </div>
      </section>

      {/* Layers */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Layers</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-zinc-400 mb-2">Dots only</p>
            <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 140 }}>
              <GridBackground showStaticGrid={false} />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-2">Lines only</p>
            <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 140 }}>
              <GridBackground showDots={false} />
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-2">Both</p>
            <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 140 }}>
              <GridBackground />
            </div>
          </div>
        </div>
      </section>

      {/* Step size */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Step size</h2>
        <div className="grid grid-cols-3 gap-3">
          {[24, 38, 56].map(step => (
            <div key={step}>
              <p className="text-xs text-zinc-400 mb-2">{step}px</p>
              <div className="relative rounded-lg border border-zinc-200 overflow-hidden" style={{ height: 140 }}>
                <GridBackground step={step} />
              </div>
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
