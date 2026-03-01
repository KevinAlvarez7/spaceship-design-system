import { Badge }      from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'variant',   type: '"default" | "primary" | "secondary" | "destructive" | "outline"', default: '"default"', description: 'Visual style' },
  { name: 'className', type: 'string',    default: '—', description: 'Additional classes' },
  { name: 'children',  type: 'ReactNode', default: '—', description: 'Badge label content' },
];

const USAGE = `import { Badge } from '@/components/ui';

<Badge>Default</Badge>
<Badge variant="primary">New</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Beta</Badge>`;

export function BadgePage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Badge</h1>
        <p className="mt-2 text-sm text-zinc-500">Compact label for status, category, or count.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="All variants">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
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
