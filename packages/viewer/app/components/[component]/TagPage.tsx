import { Tag }        from '@spaceship/design-system';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

// Sample icons (inline SVG) for the demo
function CircleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="8" r="4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 8 6.5 11.5 13 5" />
    </svg>
  );
}

const PROPS: PropRow[] = [
  { name: 'variant',      type: '"neutral" | "success" | "warning" | "error" | "info"', default: '"neutral"',  description: 'Status color variant' },
  { name: 'size',         type: '"sm" | "md"',                                           default: '"md"',       description: 'Size of the tag' },
  { name: 'surface',      type: '"default" | "shadow-border"',                           default: '"default"',  description: 'Adds a shadow ring instead of a flat fill' },
  { name: 'leadingIcon',  type: 'ReactNode',                                             default: '—',          description: '16×16 icon rendered before the label' },
  { name: 'trailingIcon', type: 'ReactNode',                                             default: '—',          description: '16×16 icon rendered after the label' },
  { name: 'className',    type: 'string',                                                default: '—',          description: 'Additional classes' },
  { name: 'children',     type: 'ReactNode',                                             default: '—',          description: 'Tag label content' },
];

const USAGE = `import { Tag } from '@spaceship/design-system';

// Status variants
<Tag>Neutral</Tag>
<Tag variant="success">Success</Tag>
<Tag variant="warning">Warning</Tag>
<Tag variant="error">Error</Tag>
<Tag variant="info">Info</Tag>

// With icon
<Tag variant="success" leadingIcon={<CheckIcon />}>Done</Tag>

// Shadow-border surface
<Tag variant="info" surface="shadow-border">Info</Tag>`;

export function TagPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Tag</h1>
        <p className="mt-2 text-sm text-zinc-500">Pill-shaped status label with semantic color variants and optional icons.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="All status variants">
          <Tag variant="neutral">Neutral</Tag>
          <Tag variant="success">Success</Tag>
          <Tag variant="warning">Warning</Tag>
          <Tag variant="error">Error</Tag>
          <Tag variant="info">Info</Tag>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label="sm vs md">
          <Tag size="sm">Small</Tag>
          <Tag size="md">Medium</Tag>
          <Tag variant="success" size="sm">Small</Tag>
          <Tag variant="success" size="md">Medium</Tag>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With Icons</h2>
        <Preview label="leadingIcon and trailingIcon">
          <Tag variant="neutral"  leadingIcon={<CircleIcon />}>Neutral</Tag>
          <Tag variant="success"  leadingIcon={<CheckIcon  />}>Success</Tag>
          <Tag variant="warning"  leadingIcon={<CircleIcon />}>Warning</Tag>
          <Tag variant="error"    leadingIcon={<CircleIcon />}>Error</Tag>
          <Tag variant="info"     leadingIcon={<CircleIcon />}>Info</Tag>
          <Tag variant="success" trailingIcon={<CheckIcon  />}>Done</Tag>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Shadow-Border</h2>
        <Preview label="surface=&quot;shadow-border&quot;">
          <Tag variant="neutral" surface="shadow-border">Neutral</Tag>
          <Tag variant="success" surface="shadow-border">Success</Tag>
          <Tag variant="warning" surface="shadow-border">Warning</Tag>
          <Tag variant="error"   surface="shadow-border">Error</Tag>
          <Tag variant="info"    surface="shadow-border">Info</Tag>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
