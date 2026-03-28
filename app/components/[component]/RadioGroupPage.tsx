import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { RadioGroupDemos } from './RadioGroupDemos';

const PROPS: PropRow[] = [
  { name: 'value',         type: 'string',                              default: '—',               description: 'Controlled selected value.' },
  { name: 'defaultValue',  type: 'string',                              default: '""',              description: 'Initial selected value (uncontrolled).' },
  { name: 'onChange',      type: '(value: string) => void',             default: '—',               description: 'Called when selection changes.' },
  { name: 'dividers',      type: 'boolean',                             default: 'true',            description: 'Show a separator line between items.' },
  { name: 'indicator',     type: '"radio" | "none"',                    default: '"radio"',         description: 'Render the radio circle indicator, or hide it.' },
  { name: 'surface',       type: '"default" | "shadow-border"',         default: '"shadow-border"', description: 'Surface treatment — adds shadow ring in shadow-border mode.' },
  { name: 'disableMotion', type: 'boolean',                             default: 'false',           description: 'Disables the spring animation on the indicator dot.' },
  { name: 'aria-label',    type: 'string',                              default: '—',               description: 'Accessible label for the radio group.' },
  { name: 'className',     type: 'string',                              default: '—',               description: 'Extra classes merged onto the root element.' },
  { name: 'children',      type: 'ReactNode',                           default: '—',               description: 'RadioItem elements.' },
];

const ITEM_PROPS: PropRow[] = [
  { name: 'value',    type: 'string',    default: '—',     description: 'The value this item represents.' },
  { name: 'disabled', type: 'boolean',   default: 'false', description: 'Prevents selection and dims the item.' },
  { name: 'children', type: 'ReactNode', default: '—',     description: 'Item label content.' },
  { name: 'className', type: 'string',   default: '—',     description: 'Extra classes merged onto the item.' },
];

const USAGE = `import { RadioGroup, RadioItem } from '@/components/ui';

// Uncontrolled
<RadioGroup defaultValue="starter" aria-label="Plan">
  <RadioItem value="starter">Starter</RadioItem>
  <RadioItem value="pro">Pro</RadioItem>
  <RadioItem value="enterprise">Enterprise</RadioItem>
</RadioGroup>

// Controlled
const [plan, setPlan] = useState('starter');
<RadioGroup value={plan} onChange={setPlan} aria-label="Plan">
  <RadioItem value="starter">Starter</RadioItem>
  <RadioItem value="pro">Pro</RadioItem>
  <RadioItem value="enterprise" disabled>Enterprise</RadioItem>
</RadioGroup>

// indicator="none" — row highlight only
<RadioGroup defaultValue="starter" indicator="none" aria-label="Plan">
  <RadioItem value="starter">Starter</RadioItem>
  <RadioItem value="pro">Pro</RadioItem>
</RadioGroup>`;

export function RadioGroupPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Radio Group</h1>
        <p className="mt-2 text-sm text-zinc-500">
          A vertically stacked set of mutually exclusive options. Built on
          Radix UI RadioGroup for accessible keyboard navigation and ARIA semantics.
        </p>
      </div>

      <RadioGroupDemos />

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">RadioGroup props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">RadioItem props</h2>
        <PropsTable props={ITEM_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
