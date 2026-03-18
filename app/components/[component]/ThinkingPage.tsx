import { Thinking, ThinkingShip, ThinkingLogo, ThinkingSaucer, ShimmerText, ShimmerDots } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'size',           type: '"caption-1" | "caption-2"',               default: '"caption-1"',  description: 'Typography scale: caption-1 = 16px/20px lh, caption-2 = 14px/16px lh.' },
  { name: 'surface',        type: '"default" | "shadow-border"',              default: '"default"',    description: 'shadow-border wraps the label in a pill-shaped shadow ring.' },
  { name: 'shimmerVariant', type: '"blob" | "linear" | "subtle"',            default: '"blob"',       description: 'Controls the shimmer style applied to both text and dots. subtle uses a secondary→white sweep instead of rainbow colours.' },
  { name: 'dots',           type: 'boolean',                                  default: 'true',         description: 'Append sequentially-animated dots after the label. Set to false when passing a label that already includes punctuation.' },
  { name: 'textScramble',   type: 'boolean',                                  default: 'false',        description: 'Cycle through themed loading labels (Thinking, Launching, Orbiting…) with a character-decode scramble effect every 3 s. Characters resolve left-to-right over ~900 ms. Bypasses ShimmerText — the decode animation is the visual effect. Overrides children. Disabled when disableMotion is set.' },
  { name: 'icon',           type: '"dots" | "spaceship" | "logo" | "saucer" | "saucer-upright"', default: '"dots"', description: 'Icon shown before the label. dots = 3×3 gravity grid. spaceship = mini animated saucer + asteroid streaks (20×20 viewBox). logo = SpaceshipLogoScene (saucer + beam sweep) at 20×24 px. saucer / saucer-upright = animated beam-less saucer from the Figma 32×32 export with horizontal weave + falling asteroids, tilted or upright.' },
  { name: 'disableMotion',  type: 'boolean',                                  default: 'false',        description: 'Renders a static dot grid and plain secondary-coloured text. No CSS animation.' },
  { name: 'children',       type: 'ReactNode',                                default: '"Thinking"',   description: 'Text label shown beside the dots. Omit trailing punctuation — the component appends its own animated dots by default.' },
  { name: 'className',       type: 'string',                                  default: '—',            description: 'Additional classes applied to the outer wrapper span.' },
];

const USAGE = `import { Thinking } from '@/components/ui';

// Default — caption-1, blob shimmer + rainbow dots
<Thinking />

// Subtle — secondary→white shimmer + dots
<Thinking shimmerVariant="subtle" />

// Linear — pure CSS rainbow sweep
<Thinking shimmerVariant="linear" />

// Custom label — dots appended automatically
<Thinking>Generating</Thinking>

// Custom label with own punctuation — opt out of auto-dots
<Thinking dots={false}>Almost there…</Thinking>

// caption-1 (16px text)
<Thinking size="caption-1" />

// Shadow-border surface — pill-shaped shadow ring
<Thinking surface="shadow-border" />

// Static — no CSS animation, plain secondary text
<Thinking disableMotion />

// Text scramble — character-decode effect cycling every 3 s
<Thinking textScramble />
<Thinking textScramble size="caption-2" />
<Thinking textScramble surface="shadow-border" />

// Text scramble is a no-op when motion is disabled
<Thinking textScramble disableMotion />

// Spaceship icon
<Thinking icon="spaceship" />
<Thinking icon="spaceship" size="caption-2" />
<Thinking icon="spaceship" textScramble />
<Thinking icon="spaceship" shimmerVariant="subtle" />
<Thinking icon="spaceship" disableMotion />

// Logo icon — full SpaceshipLogoScene saucer + beam
<Thinking icon="logo" />
<Thinking icon="logo" textScramble />

// Saucer icon — animated beam-less saucer (horizontal weave + falling asteroids)
<Thinking icon="saucer" />
<Thinking icon="saucer" textScramble />
<Thinking icon="saucer" disableMotion />

// Saucer upright
<Thinking icon="saucer-upright" />`;

const SAUCER_PROPS: PropRow[] = [
  { name: 'variant',       type: '"tilted" | "upright"',              default: '"tilted"',  description: 'Saucer orientation. tilted = Figma angled disc. upright = level disc.' },
  { name: 'size',          type: '"sm" | "md" | "lg"',               default: '"lg"',      description: 'Icon size: sm = 16px, md = 20px, lg = 24px.' },
  { name: 'surface',       type: '"default" | "shadow-border"',       default: '"default"', description: 'shadow-border adds a rounded shadow ring around the icon.' },
  { name: 'duration',      type: 'number',                            default: '4',         description: 'Exposed for API consistency; internal animation speeds are fixed.' },
  { name: 'disableMotion', type: 'boolean',                           default: 'false',     description: 'Skips weave + asteroid animation and fades in statically.' },
  { name: 'className',     type: 'string',                            default: '—',         description: 'Additional classes merged via cn().' },
];

const SAUCER_USAGE = `import { ThinkingSaucer } from '@/components/ui';

// Default — lg (24px), tilted, animated
<ThinkingSaucer />

// Upright orientation
<ThinkingSaucer variant="upright" />

// Sizes
<ThinkingSaucer size="sm" />
<ThinkingSaucer size="md" />
<ThinkingSaucer size="lg" />

// Surface
<ThinkingSaucer surface="shadow-border" />

// Static — no weave or asteroids
<ThinkingSaucer disableMotion />`;

const SHIMMER_PROPS: PropRow[] = [
  { name: 'variant',       type: '"blob" | "linear" | "subtle"', default: '"blob"',  description: 'Animation style. blob = JS-driven radial blobs that drift and wobble organically. linear = pure-CSS rainbow sweep, no JS. subtle = secondary→white CSS sweep, no JS.' },
  { name: 'disableMotion', type: 'boolean',            default: 'false',  description: 'Renders plain secondary-coloured text with no animation.' },
  { name: 'children',      type: 'ReactNode',          default: '—',      description: 'Text content to apply the shimmer effect to.' },
  { name: 'className',     type: 'string',             default: '—',      description: 'Additional classes merged via cn().' },
];

const SHIMMER_USAGE = `import { ShimmerText, ShimmerDots } from '@/components/ui';

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
          A composed &ldquo;thinking&rdquo; label that pairs ThinkingDots with animated text.
          The text cycles through a slanted shimmer highlight and rainbow gradient via
          CSS <code>@keyframes</code>. The trailing dots animate sequentially — appearing
          one by one then fading — inside the same gradient clip, so they sweep through
          the same rainbow colours as the text.
        </p>
      </div>

      {/* Sizes */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <div className="space-y-4">
          <Preview justify="start" label='size="caption-1" — 16px / 20px line height'>
            <Thinking size="caption-1" />
          </Preview>
          <Preview justify="start" label='size="caption-2" — 14px / 16px line height'>
            <Thinking size="caption-2" />
          </Preview>
        </div>
      </section>

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
          <Preview justify="start" label='textScramble + size="caption-2"'>
            <Thinking textScramble size="caption-2" />
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

      {/* Spaceship Icon */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Spaceship Icon</h2>
        <p className="text-sm text-zinc-500 mb-4">
          An alternative to the gravity-grid icon: a mini saucer weaving sinusoidally as it
          flies toward the upper-right, dodging asteroid streaks that fall diagonally across
          the 20&times;20 viewBox. Use <code>icon=&quot;spaceship&quot;</code> to activate.
        </p>
        <div className="space-y-4">
          <Preview justify="start" label='icon="spaceship" — caption-1 + caption-2'>
            <Thinking icon="spaceship" size="caption-1" />
            <Thinking icon="spaceship" size="caption-2" />
          </Preview>
          <Preview justify="start" label='icon="spaceship" + textScramble'>
            <Thinking icon="spaceship" textScramble />
          </Preview>
          <Preview justify="start" label='icon="spaceship" + shimmerVariant="subtle"'>
            <Thinking icon="spaceship" shimmerVariant="subtle" />
          </Preview>
          <Preview justify="start" label='icon="spaceship" + disableMotion — static ship, no streaks'>
            <ThinkingShip size="sm" disableMotion />
            <Thinking icon="spaceship" disableMotion />
          </Preview>
        </div>
      </section>

      {/* Logo Icon */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Logo Icon</h2>
        <p className="text-sm text-zinc-500 mb-4">
          The full SpaceshipLogoScene artwork — saucer + animated beam sweep — rendered at 20&times;24&thinsp;px
          as a thinking indicator. Use <code>icon=&quot;logo&quot;</code> to activate.
        </p>
        <div className="space-y-4">
          <Preview justify="start" label='icon="logo" — saucer + beam sweep'>
            <Thinking icon="logo" />
          </Preview>
          <Preview justify="start" label='icon="logo" + textScramble'>
            <Thinking icon="logo" textScramble />
          </Preview>
          <Preview justify="start" label='icon="logo" + disableMotion — static saucer'>
            <ThinkingLogo disableMotion />
            <Thinking icon="logo" disableMotion />
          </Preview>
        </div>
      </section>

      {/* Saucer Icon */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Saucer Icon</h2>
        <p className="text-sm text-zinc-500 mb-4">
          A beam-less inline saucer sourced from the Figma 32&times;32 export, animated with a horizontal
          weave and falling asteroid streaks. Some asteroids render behind the saucer and some in front,
          creating a simple depth effect. Two orientations: <code>icon=&quot;saucer&quot;</code> (tilted) and{' '}
          <code>icon=&quot;saucer-upright&quot;</code> (level disc).
        </p>
        <div className="space-y-4">
          <Preview justify="start" label='icon="saucer" — tilted (caption-1 + caption-2)'>
            <Thinking icon="saucer" size="caption-1" />
            <Thinking icon="saucer" size="caption-2" />
          </Preview>
          <Preview justify="start" label='icon="saucer-upright" — level disc'>
            <Thinking icon="saucer-upright" size="caption-1" />
            <Thinking icon="saucer-upright" size="caption-2" />
          </Preview>
          <Preview justify="start" label='icon="saucer" + textScramble'>
            <Thinking icon="saucer" textScramble />
          </Preview>
          <Preview justify="start" label='icon="saucer" + disableMotion — static, no weave or asteroids'>
            <ThinkingSaucer disableMotion />
            <Thinking icon="saucer" disableMotion />
            <Thinking icon="saucer-upright" disableMotion />
          </Preview>
        </div>
      </section>

      {/* ThinkingSaucer standalone */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">ThinkingSaucer — Standalone</h2>
        <p className="text-sm text-zinc-500 mb-4">
          The saucer icon can also be used standalone. Defaults to <code>lg</code> (24&times;24&thinsp;px).
          Asteroids wrap vertically on a 48-unit cycle; z-order is static (deterministic behind/front split
          for SSR safety).
        </p>
        <div className="space-y-4">
          <Preview justify="start" label="Sizes — sm (16px) · md (20px) · lg (24px)">
            <ThinkingSaucer size="sm" />
            <ThinkingSaucer size="md" />
            <ThinkingSaucer size="lg" />
          </Preview>
          <Preview justify="start" label='variant="upright" — level disc at sm · md · lg'>
            <ThinkingSaucer variant="upright" size="sm" />
            <ThinkingSaucer variant="upright" size="md" />
            <ThinkingSaucer variant="upright" size="lg" />
          </Preview>
          <Preview justify="start" label='surface="shadow-border" — tilted + upright'>
            <ThinkingSaucer surface="shadow-border" />
            <ThinkingSaucer variant="upright" surface="shadow-border" />
          </Preview>
          <Preview justify="start" label="disableMotion — static saucer, no animation">
            <ThinkingSaucer size="sm" disableMotion />
            <ThinkingSaucer size="md" disableMotion />
            <ThinkingSaucer size="lg" disableMotion />
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
        <Preview justify="start" label="disableMotion — static dots, plain secondary text, across all sizes">
          <Thinking disableMotion size="caption-1" />
          <Thinking disableMotion size="caption-2" />
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
