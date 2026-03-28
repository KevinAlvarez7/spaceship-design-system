import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { CheckboxGroupDemos } from './CheckboxGroupDemos';

const PROPS: PropRow[] = [
  { name: 'value',         type: 'string[]',                            default: '—',               description: 'Controlled array of selected values.' },
  { name: 'defaultValue',  type: 'string[]',                            default: '[]',              description: 'Initial selected values (uncontrolled).' },
  { name: 'onChange',      type: '(value: string[]) => void',           default: '—',               description: 'Called when selection changes.' },
  { name: 'dividers',      type: 'boolean',                             default: 'true',            description: 'Show a separator line between items.' },
  { name: 'surface',       type: '"default" | "shadow-border"',         default: '"shadow-border"', description: 'Surface treatment — adds shadow ring in shadow-border mode.' },
  { name: 'disableMotion', type: 'boolean',                             default: 'false',           description: 'Disables the spring animation on the check icon.' },
  { name: 'aria-label',    type: 'string',                              default: '—',               description: 'Accessible label for the group.' },
  { name: 'className',     type: 'string',                              default: '—',               description: 'Extra classes merged onto the root element.' },
  { name: 'children',      type: 'ReactNode',                           default: '—',               description: 'CheckboxItem elements.' },
];

const ITEM_PROPS: PropRow[] = [
  { name: 'value',     type: 'string',    default: '—',     description: 'The value this item represents.' },
  { name: 'disabled',  type: 'boolean',   default: 'false', description: 'Prevents toggling and dims the item.' },
  { name: 'children',  type: 'ReactNode', default: '—',     description: 'Item label content.' },
  { name: 'className', type: 'string',    default: '—',     description: 'Extra classes merged onto the item.' },
];

const USAGE = `import { CheckboxGroup, CheckboxItem } from '@/components/ui';

// Uncontrolled
<CheckboxGroup defaultValue={['notifications']} aria-label="Preferences">
  <CheckboxItem value="notifications">Email notifications</CheckboxItem>
  <CheckboxItem value="updates">Product updates</CheckboxItem>
  <CheckboxItem value="marketing">Marketing emails</CheckboxItem>
</CheckboxGroup>

// Controlled
const [selected, setSelected] = useState<string[]>(['notifications']);
<CheckboxGroup value={selected} onChange={setSelected} aria-label="Preferences">
  <CheckboxItem value="notifications">Email notifications</CheckboxItem>
  <CheckboxItem value="updates" disabled>Product updates (admin only)</CheckboxItem>
  <CheckboxItem value="marketing">Marketing emails</CheckboxItem>
</CheckboxGroup>`;

export function CheckboxGroupPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Checkbox Group</h1>
        <p className="mt-2 text-sm text-zinc-500">
          A vertically stacked set of multi-select checkboxes. Built on Radix UI
          Checkbox for accessible keyboard interaction and ARIA semantics.
        </p>
      </div>

      <CheckboxGroupDemos />

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">CheckboxGroup props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">CheckboxItem props</h2>
        <PropsTable props={ITEM_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
