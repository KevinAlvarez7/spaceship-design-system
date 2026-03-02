import { Button }     from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'variant',   type: '"primary" | "secondary" | "outline" | "ghost" | "destructive"', default: '"primary"', description: 'Visual style' },
  { name: 'size',      type: '"sm" | "md" | "lg"',  default: '"md"',   description: 'Height and padding scale' },
  { name: 'surface',   type: '"default" | "neo-brutalist" | "professional"', default: '"default"', description: 'Surface treatment: default (no border), neo-brutalist (hard shadow + border), professional (soft shadow ring)' },
  { name: 'disabled',  type: 'boolean',              default: 'false',  description: 'Prevents interaction, reduces opacity' },
  { name: 'className', type: 'string',               default: '—',      description: 'Additional classes merged via cn()' },
];

const USAGE = `import { Button } from '@/components/ui';

<Button variant="primary" size="md">Get started</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive" size="sm">Delete</Button>`;

export function ButtonPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Button</h1>
        <p className="mt-2 text-sm text-zinc-500">Primary interactive element. Use for actions, not navigation. One primary per section maximum.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="All variants">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label="All sizes">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled</h2>
        <Preview label="Disabled state">
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="outline"   disabled>Disabled</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Neo-Brutalist Surface</h2>
        <Preview label='surface="neo-brutalist"'>
          <Button variant="primary"   surface="neo-brutalist">Primary</Button>
          <Button variant="secondary" surface="neo-brutalist">Secondary</Button>
          <Button variant="outline"   surface="neo-brutalist">Outline</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Professional Surface</h2>
        <Preview label='surface="professional"'>
          <Button variant="primary"   surface="professional">Primary</Button>
          <Button variant="secondary" surface="professional">Secondary</Button>
          <Button variant="outline"   surface="professional">Outline</Button>
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
