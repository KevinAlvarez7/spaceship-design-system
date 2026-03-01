import { Input }      from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'size',        type: '"sm" | "md" | "lg"',   default: '"md"',      description: 'Height of the input' },
  { name: 'state',       type: '"default" | "error"',  default: '"default"', description: 'Validation state' },
  { name: 'placeholder', type: 'string',               default: '—',         description: 'Placeholder text' },
  { name: 'disabled',    type: 'boolean',              default: 'false',     description: 'Disables the input' },
];

const USAGE = `import { Input } from '@/components/ui';

<Input placeholder="Enter value" />
<Input state="error" placeholder="Invalid email" />
<Input disabled placeholder="Read only" />`;

export function InputPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Input</h1>
        <p className="mt-2 text-sm text-zinc-500">Single-line text input. Always pair with a visible label in production.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label="All sizes">
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Input size="sm" placeholder="Small" />
            <Input size="md" placeholder="Medium" />
            <Input size="lg" placeholder="Large" />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">States</h2>
        <Preview label="Validation states">
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Input state="default" placeholder="Default" />
            <Input state="error"   placeholder="Error state" />
            <Input disabled        placeholder="Disabled" />
          </div>
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
