import { Thinking, ThinkingSaucer, ShimmerText, ShimmerDots } from '@spaceship/design-system';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'surface',        type: '"default" | "shadow-border"',              default: '"default"',    description: 'shadow-border wraps the label in a pill-shaped shadow ring.' },
  { name: 'shimmerVariant', type: '"blob" | "linear" | "subtle"',            default: '"blob"',       description: 'Controls the shimmer style applied to both text and dots. subtle uses a secondary→white sweep instead of rainbow colours.' },
  { name: 'dots',           type: 'boolean',                                  default: 'true',         description: 'Append sequentially-animated dots after the label. Set to false when passing a label that already includes punctuation.' },
  { name: 'textScramble',   type: 'boolean',                                  default: 'false',        description: 'Cycle through themed loading labels (Thinking, Launching, Orbiting…) with a character-decode scramble effect every 3 s. Characters resolve left-to-right over ~900 ms. Bypasses ShimmerText — the decode animation is the visual effect. Overrides children. Disabled when disableMotion is set.' },
  { name: 'disableMotion',  type: 'boolean',                                  default: 'false',        description: 'Renders a static saucer and plain secondary-coloured text. No CSS animation.' },
  { name: 'children',       type: 'ReactNode',                                default: '"Thinking"',   description: 'Text label shown beside the dots. Omit trailing punctuation — the component appends its own animated dots by default.' },
  { name: 'className',       type: 'string',                                  default: '—',            description: 'Additional classes applied to the outer wrapper span.' },
];

const USAGE = `import { Thinking } from '@spaceship/design-system';

// Default — saucer icon, blob shimmer
<Thinking />

// Subtle — secondary→white shimmer + dots
<Thinking shimmerVariant="subtle" />

// Linear — pure CSS rainbow sweep
<Thinking shimmerVariant="linear" />

// Custom label — dots appended automatically
<Thinking>Generating</Thinking>

// Custom label with own punctuation — opt out of auto-dots
<Thinking dots={false}>Almost there…</Thinking>

// Shadow-border surface — pill-shaped shadow ring
<Thinking surface="shadow-border" />

// Static — no CSS animation, plain secondary text
<Thinking disableMotion />

// Text scramble — character-decode effect cycling every 3 s
<Thinking textScramble />
<Thinking textScramble surface="shadow-border" />

// Text scramble is a no-op when motion is disabled
<Thinking textScramble disableMotion />`;

const SAUCER_PROPS: PropRow[] = [
  { name: 'size',          type: '"lg" | "xl"',                       default: '"lg"',      description: 'Icon size: lg = 24px, xl = 28px.' },
  { name: 'surface',       type: '"default" | "shadow-border"',       default: '"default"', description: 'shadow-border adds a rounded shadow ring around the icon.' },
  { name: 'duration',      type: 'number',                            default: '4',         description: 'Exposed for API consistency; internal animation speeds are fixed.' },
  { name: 'disableMotion', type: 'boolean',                           default: 'false',     description: 'Skips the patrol animation and renders a static centered saucer.' },
  { name: 'className',     type: 'string',                            default: '—',         description: 'Additional classes merged via cn().' },
];

const SAUCER_USAGE = `import { ThinkingSaucer } from '@spaceship/design-system';

// Default — lg (24px), patrol animation
<ThinkingSaucer />

// Sizes
<ThinkingSaucer size="lg" />
<ThinkingSaucer size="xl" />

// Surface
<ThinkingSaucer surface="shadow-border" />

// Static — no animation
<ThinkingSaucer disableMotion />`;

const SHIMMER_PROPS: PropRow[] = [
  { name: 'variant',       type: '"blob" | "linear" | "subtle"', default: '"blob"',  description: 'Animation style. blob = JS-driven radial blobs that drift and wobble organically. linear = pure-CSS rainbow sweep, no JS. subtle = secondary→white CSS sweep, no JS.' },
  { name: 'disableMotion', type: 'boolean',            default: 'false',  description: 'Renders plain secondary-coloured text with no animation.' },
  { name: 'children',      type: 'ReactNode',          default: '—',      description: 'Text content to apply the shimmer effect to.' },
  { name: 'className',     type: 'string',             default: '—',      description: 'Additional classes merged via cn().' },
];

const SHIMMER_USAGE = `import { ShimmerText, ShimmerDots } from '@spaceship/design-system';

// Default — blob variant, JS-driven radial blobs
<ShimmerText>Thinking</ShimmerText>

// Linear — pure CSS rainbow sweep
<ShimmerText variant="linear">Thinking</ShimmerText>

// Subtle — secondary→white CSS sweep
<ShimmerText variant="subtle">Thinking</ShimmerText>

// Subtle dots
<ShimmerDots variant="subtle" />

// Static — no animation, plain secondary text
<ShimmerText disableMotion>Thinking</ShimmerText>`;

export function ThinkingPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Thinking</h1>
        <p className="mt-2 text-sm text-zinc-500">
          A composed &ldquo;thinking&rdquo; label that pairs a tilted saucer icon with animated text.
          The text cycles through a slanted shimmer highlight and rainbow gradient via
          CSS <code>@keyframes</code>. The trailing dots animate sequentially — appearing
          one by one then fading — inside the same gradient clip, so they sweep through
          the same rainbow colours as the text.
        </p>
      </div>

      {/* Surface */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Surface</h2>
        <Preview justify="start" label='surface="default" · surface="shadow-border"'>
          <Thinking surface="default" />
          <Thinking surface="shadow-border" />
        </Preview>
      </section>

      {/* Custom Label */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Custom Label</h2>
        <Preview justify="start" label="Custom children — dots appended automatically">
          <Thinking>Generating</Thinking>
          <Thinking>Searching</Thinking>
          <Thinking>Analyzing</Thinking>
        </Preview>
        <div className="mt-4">
          <Preview justify="start" label='dots={false} — label controls its own punctuation'>
            <Thinking dots={false}>Almost there…</Thinking>
          </Preview>
        </div>
      </section>

      {/* Text Scramble */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Text Scramble</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Cycles through spaceship-themed labels every 3&thinsp;s. Each label transition runs
          a character-decode scramble: random symbols resolve left-to-right over ~900&thinsp;ms,
          revealing the new word. Disabled automatically when <code>disableMotion</code> is set.
        </p>
        <div className="space-y-4">
          <Preview justify="start" label="textScramble — default">
            <Thinking textScramble />
          </Preview>
          <Preview justify="start" label='textScramble + surface="shadow-border"'>
            <Thinking textScramble surface="shadow-border" />
          </Preview>
        </div>
      </section>

      {/* Shimmer Variant */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Shimmer Variant</h2>
        <div className="space-y-4">
          <Preview justify="start" label='shimmerVariant="blob" (default) — JS-driven radial blobs'>
            <Thinking shimmerVariant="blob" />
          </Preview>
          <Preview justify="start" label='shimmerVariant="linear" — pure CSS rainbow sweep'>
            <Thinking shimmerVariant="linear" />
          </Preview>
          <Preview justify="start" label='shimmerVariant="subtle" — secondary→white sweep'>
            <Thinking shimmerVariant="subtle" />
          </Preview>
        </div>
      </section>

      {/* ThinkingSaucer standalone */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">ThinkingSaucer — Standalone</h2>
        <p className="text-sm text-zinc-500 mb-4">
          The saucer icon can also be used standalone. Defaults to <code>lg</code> (24&times;24&thinsp;px).
          Animates with a 4-corner patrol: translates to each corner of its bounding box, pauses,
          and rocks left-right (CSS <code>rotateY</code> with perspective) as if scanning the area.
        </p>
        <div className="space-y-4">
          <Preview justify="start" label="Sizes — lg (24px) · xl (28px)">
            <ThinkingSaucer size="lg" />
            <ThinkingSaucer size="xl" />
          </Preview>
          <Preview justify="start" label='surface="shadow-border"'>
            <ThinkingSaucer surface="shadow-border" />
          </Preview>
          <Preview justify="start" label="disableMotion — static saucer, no animation">
            <ThinkingSaucer size="lg" disableMotion />
            <ThinkingSaucer size="xl" disableMotion />
          </Preview>
        </div>
      </section>

      {/* ThinkingSaucer Props */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">ThinkingSaucer Props</h2>
        <PropsTable props={SAUCER_PROPS} />
      </section>

      {/* ThinkingSaucer Usage */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">ThinkingSaucer Usage</h2>
        <CodeBlock code={SAUCER_USAGE} lang="tsx" />
      </section>

      {/* Static */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Static</h2>
        <Preview justify="start" label="disableMotion — static saucer, plain secondary text">
          <Thinking disableMotion />
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

      {/* ── ShimmerText ───────────────────────────────────────────────────────── */}
      <div className="border-t border-zinc-200 pt-10">
        <h1 className="text-2xl font-bold text-zinc-900">ShimmerText</h1>
        <p className="mt-2 text-sm text-zinc-500">
          An inline text shimmer that applies an animated gradient clip to its children.
          Two animation styles: <code>blob</code> drives three radial gradient blobs
          via a JS <code>useAnimationFrame</code> loop — organic, drifting motion.
          <code> linear</code> uses a pure-CSS <code>background-position</code> sweep —
          wider colour bands, fixed tempo, zero JS overhead.
        </p>
      </div>

      {/* Variant comparison */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variant Comparison</h2>
        <div className="space-y-4">
          <Preview label='variant="blob" (default) — JS-driven radial blobs'>
            <ShimmerText>Thinking</ShimmerText>
          </Preview>
          <Preview label='variant="linear" — pure CSS rainbow sweep'>
            <ShimmerText variant="linear">Thinking</ShimmerText>
          </Preview>
          <Preview label='variant="subtle" — secondary→white CSS sweep'>
            <ShimmerText variant="subtle">Thinking</ShimmerText>
          </Preview>
        </div>
      </section>

      {/* Subtle Variant */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Subtle Variant</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Monochrome shimmer from <code>--text-secondary</code> to white — quieter than the rainbow
          variants, suitable for less prominent loading states.
        </p>
        <div className="space-y-4">
          <Preview label="ShimmerText + ShimmerDots — subtle variant, side by side">
            <ShimmerText variant="subtle">Thinking</ShimmerText>
            <ShimmerDots variant="subtle" />
          </Preview>
          <Preview label="ShimmerText subtle — custom labels">
            <ShimmerText variant="subtle">Generating</ShimmerText>
            <ShimmerText variant="subtle">Searching</ShimmerText>
            <ShimmerText variant="subtle">Analyzing</ShimmerText>
          </Preview>
        </div>
      </section>

      {/* Custom text */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Custom Text</h2>
        <div className="space-y-4">
          <Preview label='variant="blob"'>
            <ShimmerText>Generating</ShimmerText>
            <ShimmerText>Searching</ShimmerText>
            <ShimmerText>Analyzing</ShimmerText>
          </Preview>
          <Preview label='variant="linear"'>
            <ShimmerText variant="linear">Generating</ShimmerText>
            <ShimmerText variant="linear">Searching</ShimmerText>
            <ShimmerText variant="linear">Analyzing</ShimmerText>
          </Preview>
        </div>
      </section>

      {/* Static */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Static</h2>
        <Preview label="disableMotion — plain secondary text, no animation, both variants">
          <ShimmerText disableMotion>Thinking</ShimmerText>
          <ShimmerText variant="linear" disableMotion>Thinking</ShimmerText>
        </Preview>
      </section>

      {/* Props */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={SHIMMER_PROPS} />
      </section>

      {/* Usage */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={SHIMMER_USAGE} lang="tsx" />
      </section>
    </div>
  );
}
