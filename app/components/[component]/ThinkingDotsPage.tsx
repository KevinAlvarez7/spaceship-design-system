import { ThinkingDots } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'pattern',       type: '"diagonal" | "radial" | "radial-pull" | "horizontal" | "random" | "breathe" | "breathe-x"', default: '"diagonal"', description: 'Wave animation pattern — controls the path of the travelling gravity point across the 3×3 grid. breathe = rectangle perimeter, push lap then pull lap. breathe-x = X-shaped diagonals, push lap then pull lap. radial-pull = full push orbit → rest → full pull orbit.' },
  { name: 'duration',      type: 'number',                                          default: '2.6',        description: 'Animation cycle duration in seconds. Controls the speed of the gravity point travel.' },
  { name: 'size',          type: '"sm" | "md" | "lg"',                              default: '"md"',       description: 'Bounding box size: sm = 16px, md = 20px, lg = 24px.' },
  { name: 'surface',       type: '"default" | "shadow-border"',                     default: '"default"',  description: 'Adds a subtle shadow ring around the wrapper span.' },
  { name: 'disableMotion', type: 'boolean',                                         default: 'false',      description: 'Renders a static grid with no animation. Zero JS animation overhead.' },
  { name: 'className',     type: 'string',                                          default: '—',          description: 'Additional classes applied to the outer wrapper span.' },
];

const USAGE = `import { ThinkingDots } from '@/components/ui';

// Default — diagonal pattern, md size — gravity arcs diagonally, lines curve toward it
<ThinkingDots />

// Radial ripple, large
<ThinkingDots pattern="radial" size="lg" />

// Inline with text
<span className="flex items-center gap-2">
  <ThinkingDots size="sm" />
  <span className="text-(--text-secondary) [font-size:var(--font-size-sm)]">
    Agent is thinking...
  </span>
</span>

// Slow — gravity arc and spatial rainbow clearly visible
<ThinkingDots duration={3.0} size="lg" />

// Fast pulse (1.2 s cycle)
<ThinkingDots duration={1.2} />

// Shadow surface
<ThinkingDots surface="shadow-border" />

// Static — grey dots, straight lines, no animation
<ThinkingDots disableMotion />`;

const PATTERNS = ['diagonal', 'radial', 'radial-pull', 'horizontal', 'random', 'breathe', 'breathe-x'] as const;

export function ThinkingDotsPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Thinking Dots</h1>
        <p className="mt-2 text-sm text-zinc-500">
          A lightweight 3×3 dot-grid loading indicator for agent thinking states.
          A single virtual gravity point travels through the grid on a pattern-defined
          path. Lines arc as quadratic Bézier curves pulled toward the gravity point,
          then relax back to straight as it moves away. Dots brighten and sweep through
          a spatial rainbow — colour determined by the angle from the gravity point to
          each dot — creating concentric colour rings that travel with the gravity point.
          Designed to sit inline with text or float independently.
        </p>
      </div>

      {/* Animation Patterns */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Animation Patterns</h2>
        <p className="text-sm text-zinc-500 mb-3">
          Each pattern defines the path of the virtual gravity point across the grid.
          <code> breathe</code> traces a rectangle perimeter (TL→TR→BR→BL);
          <code> breathe-x</code> traces X-shaped diagonals (TL→BR→TR→BL). Both
          alternate push and pull on consecutive laps — the grid expands outward on
          the first half of each cycle, then contracts inward on the second.
        </p>
        <div className="space-y-4">
          {PATTERNS.map(pat => (
            <Preview key={pat} label={`pattern="${pat}"`}>
              <ThinkingDots pattern={pat} size="md" />
            </Preview>
          ))}
        </div>
      </section>

      {/* Colour Sweep */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Colour Sweep</h2>
        <p className="text-sm text-zinc-500 mb-3">
          Colour is determined spatially by the angle from the gravity point to each dot,
          creating concentric rainbow rings that rotate and travel with the gravity point.
          Dots are grey at rest; rainbow colour sweeps through each dot as the gravity
          point approaches, then fades back to grey as it recedes.
        </p>
        <div className="space-y-4">
          {PATTERNS.map(pat => (
            <Preview key={pat} label={`pattern="${pat}" · size="lg"`}>
              <ThinkingDots pattern={pat} size="lg" />
            </Preview>
          ))}
        </div>
      </section>

      {/* Line Bending */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Line Bending</h2>
        <p className="text-sm text-zinc-500 mb-3">
          Lines animate as quadratic Bézier curves whose control points are displaced
          toward the moving gravity point. Displacement uses an inverse-distance pull
          with quadratic rim taper — lines near the gravity point arc strongly toward
          it, while distant lines stay straight. As the gravity point moves through the
          grid, it pulls the nearest lines into smooth curves that travel with it.
          Slower durations make the arcing motion more visible.
        </p>
        <Preview label='duration={3.0} — slow, visible gravity arc · size="lg"'>
          <ThinkingDots duration={3.0} size="lg" />
        </Preview>
      </section>

      {/* Sizes */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label='size="sm" (16px) · size="md" (20px) · size="lg" (24px)'>
          <ThinkingDots size="sm" />
          <ThinkingDots size="md" />
          <ThinkingDots size="lg" />
        </Preview>
      </section>

      {/* Speed */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Speed</h2>
        <Preview label="duration=1.2 (fast) · duration=1.8 (default) · duration=3.0 (slow)">
          <ThinkingDots duration={1.2} />
          <ThinkingDots duration={1.8} />
          <ThinkingDots duration={3.0} />
        </Preview>
      </section>

      {/* Surface */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Surface</h2>
        <Preview label='surface="default" · surface="shadow-border"'>
          <ThinkingDots surface="default" />
          <ThinkingDots surface="shadow-border" />
        </Preview>
      </section>

      {/* Inline composition */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Inline Composition</h2>
        <Preview label="Inline with text — sm · md · lg">
          <span className="flex flex-col items-center gap-3">
            <span className="flex items-center gap-1.5">
              <ThinkingDots size="sm" />
              <span className="text-(--text-secondary) [font-size:var(--font-size-xs)]">Agent is thinking...</span>
            </span>
            <span className="flex items-center gap-2">
              <ThinkingDots size="md" />
              <span className="text-(--text-secondary) [font-size:var(--font-size-sm)]">Agent is thinking...</span>
            </span>
            <span className="flex items-center gap-2">
              <ThinkingDots size="lg" />
              <span className="text-(--text-secondary) [font-size:var(--font-size-base)]">Agent is thinking...</span>
            </span>
          </span>
        </Preview>
      </section>

      {/* Static */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Static</h2>
        <Preview label="disableMotion — grey dots, straight lines, no JS animation">
          <ThinkingDots disableMotion size="sm" />
          <ThinkingDots disableMotion size="md" />
          <ThinkingDots disableMotion size="lg" />
        </Preview>
      </section>

      {/* Props */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
