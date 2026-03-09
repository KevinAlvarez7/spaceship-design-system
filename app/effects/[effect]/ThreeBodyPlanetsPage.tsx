'use client';

import { ThreeBodyPlanets } from '@/components/effects';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';

// ── Props table ────────────────────────────────────────────────────────────────

const PROPS: PropRow[] = [
  { name: 'size',          type: 'number',                  default: '120',                     description: 'Container diameter in px. All three planets orbit within this boundary.' },
  { name: 'planetSize',    type: 'number',                  default: '14',                      description: 'Each planet diameter in px.' },
  { name: 'colors',        type: '[string, string, string]', default: "['#C3A8FF','#26E6B5','#3C7DFF']", description: 'Exactly 3 CSS colors, one per planet.' },
  { name: 'speed',         type: 'number',                  default: '1',                       description: 'Simulation speed multiplier. 0.5 = half speed, 2 = double speed.' },
  { name: 'disableMotion', type: 'boolean',                 default: 'false',                   description: 'Render a static equilateral triangle; no animation.' },
  { name: 'className',     type: 'string',                  default: '—',                       description: 'Additional class names for positioning.' },
  { name: 'style',         type: 'React.CSSProperties',     default: '—',                       description: 'Inline styles for positioning.' },
];

// ── Usage snippet ──────────────────────────────────────────────────────────────

const USAGE = `import { ThreeBodyPlanets } from '@/components/effects';

// Default — 120px container, 14px planets
<ThreeBodyPlanets />

// Larger container at 2× speed
<ThreeBodyPlanets size={160} speed={2} />

// Custom palette
<ThreeBodyPlanets
  colors={['#F9614D', '#F9C600', '#ffffff']}
/>

// Static fallback (no motion)
<ThreeBodyPlanets disableMotion />`;

// ── ThreeBodyPlanetsPage ───────────────────────────────────────────────────────

export function ThreeBodyPlanetsPage() {
  return (
    <div className="max-w-3xl space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Three Body Planets</h1>
          <ExperimentBadge />
        </div>
        <p className="mt-2 text-sm text-zinc-500">
          Three small planets orbiting each other in a tight cluster, mimicking the chaotic motion
          of the three-body problem. Driven by a real-time N-body physics simulation — genuinely
          aperiodic trajectories that never exactly repeat.
        </p>
      </div>

      {/* Sizes */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <div className="flex items-end gap-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          {[80, 120, 160, 200].map(s => (
            <div key={s} className="flex flex-col items-center gap-3">
              <ThreeBodyPlanets size={s} planetSize={Math.round(s * 0.12)} />
              <span className="text-xs text-zinc-400">{s}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* Speeds */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Speeds</h2>
        <div className="flex items-center gap-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          {[{ speed: 0.5, label: '0.5×' }, { speed: 1, label: '1×' }, { speed: 2, label: '2×' }].map(({ speed, label }) => (
            <div key={speed} className="flex flex-col items-center gap-3">
              <ThreeBodyPlanets size={120} planetSize={14} speed={speed} />
              <span className="text-xs text-zinc-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Colors */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Colors</h2>
        <div className="flex items-center gap-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          <div className="flex flex-col items-center gap-3">
            <ThreeBodyPlanets size={120} planetSize={14} />
            <span className="text-xs text-zinc-400">Default</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ThreeBodyPlanets size={120} planetSize={14} colors={['#F9614D', '#F9C600', '#ffffff']} />
            <span className="text-xs text-zinc-400">Warm</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ThreeBodyPlanets size={120} planetSize={14} disableMotion />
            <span className="text-xs text-zinc-400">Static</span>
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
