import { ShimmerText, ShimmerDots } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';

const SHIMMER_PROPS: PropRow[] = [
  { name: 'variant',       type: '"blob" | "linear" | "subtle"', default: '"blob"',  description: 'Animation style. blob = JS-driven radial blobs. linear = pure-CSS sweep. subtle = muted secondary→white sweep.' },
  { name: 'dots',          type: 'boolean',                       default: 'false',   description: 'Render three animated bounce dots inline after the text.' },
  { name: 'disableMotion', type: 'boolean',                       default: 'false',   description: 'Renders plain secondary text with no animation.' },
  { name: 'className',     type: 'string',                        default: '—',       description: 'Extra classes merged onto the span.' },
  { name: 'children',      type: 'ReactNode',                     default: '—',       description: 'Text content to animate.' },
];

const DOTS_PROPS: PropRow[] = [
  { name: 'variant',       type: '"rainbow" | "subtle"', default: '"rainbow"', description: 'rainbow = cycling hue sweep. subtle = secondary→white sweep.' },
  { name: 'disableMotion', type: 'boolean',               default: 'false',    description: 'Renders a static ellipsis character.' },
  { name: 'className',     type: 'string',                default: '—',        description: 'Extra classes merged onto the span.' },
];

const USAGE = `import { ShimmerText, ShimmerDots } from '@/components/ui';

// Default (blob variant)
<ShimmerText>Thinking</ShimmerText>

// With inline dots
<ShimmerText dots>Thinking</ShimmerText>

// Linear CSS sweep
<ShimmerText variant="linear">Generating</ShimmerText>

// Subtle sweep
<ShimmerText variant="subtle">Processing</ShimmerText>

// Standalone dots
<ShimmerDots />
<ShimmerDots variant="subtle" />`;

export function ShimmerTextPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Shimmer Text</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Animated gradient text for streaming / loading states. Three variants:
          blob (JS-driven radial), linear (CSS sweep), and subtle (muted sweep).
          Pairs with ShimmerDots for inline loading indicators.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">variant=&quot;blob&quot;</h2>
        <Preview label="Default — JS-driven radial blobs drift across the text">
          <ShimmerText className="text-xl font-semibold">Thinking</ShimmerText>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">variant=&quot;linear&quot;</h2>
        <Preview label="Pure-CSS left-to-right sweep">
          <ShimmerText variant="linear" className="text-xl font-semibold">Generating</ShimmerText>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">variant=&quot;subtle&quot;</h2>
        <Preview label="Muted secondary-to-white sweep">
          <ShimmerText variant="subtle" className="text-xl font-semibold">Processing</ShimmerText>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With dots</h2>
        <Preview label="dots={true} appends animated bounce dots inline">
          <ShimmerText dots className="text-xl font-semibold">Thinking</ShimmerText>
          <ShimmerText variant="linear" dots className="text-xl font-semibold">Generating</ShimmerText>
          <ShimmerText variant="subtle" dots className="text-xl font-semibold">Processing</ShimmerText>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">ShimmerDots standalone</h2>
        <Preview label="Use ShimmerDots inline in sentences or as a standalone loader">
          <span className="text-(--text-primary) text-sm">Claude is thinking<ShimmerDots className="ml-0.5" /></span>
          <span className="text-(--text-secondary) text-sm">Claude is thinking<ShimmerDots variant="subtle" className="ml-0.5" /></span>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">ShimmerText props</h2>
        <PropsTable props={SHIMMER_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">ShimmerDots props</h2>
        <PropsTable props={DOTS_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
