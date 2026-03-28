import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { TabBarDemos } from './TabBarDemos';

const TAB_BAR_PROPS: PropRow[] = [
  { name: 'value',         type: 'string',                              default: '—',          description: 'Controlled selected tab value.' },
  { name: 'defaultValue',  type: 'string',                              default: '""',         description: 'Uncontrolled initial selected value.' },
  { name: 'onChange',      type: '(value: string) => void',             default: '—',          description: 'Called when the selected tab changes.' },
  { name: 'surface',       type: '"default" | "shadow-border"',         default: '"default"',  description: 'Adds a shadow ring around the track.' },
  { name: 'disableMotion', type: 'boolean',                             default: 'false',      description: 'Disables the sliding layout animation.' },
  { name: 'layoutId',      type: 'string',                              default: 'auto',       description: 'Motion layout ID for the active indicator. Auto-generated if omitted.' },
  { name: 'className',     type: 'string',                              default: '—',          description: 'Additional classes on the track container.' },
  { name: 'children',      type: 'ReactNode',                           default: '—',          description: 'TabBarItem elements.' },
];

const TAB_BAR_ITEM_PROPS: PropRow[] = [
  { name: 'value',        type: 'string',    default: '—',     description: 'Unique value identifying this tab.' },
  { name: 'disabled',     type: 'boolean',   default: 'false', description: 'Prevents selection and reduces opacity.' },
  { name: 'leadingIcon',  type: 'ReactNode', default: '—',     description: '16×16 icon rendered before the label.' },
  { name: 'trailingIcon', type: 'ReactNode', default: '—',     description: '16×16 icon rendered after the label.' },
  { name: 'badge',        type: 'ReactNode', default: '—',     description: 'Arbitrary content after the label (e.g. status dot).' },
  { name: 'className',    type: 'string',    default: '—',     description: 'Additional classes on the tab button.' },
  { name: 'children',     type: 'ReactNode', default: '—',     description: 'Tab label content.' },
];

const USAGE = `import { TabBar, TabBarItem } from '@spaceship/design-system';

// Uncontrolled
<TabBar defaultValue="preview">
  <TabBarItem value="preview" leadingIcon={<Eye />}>Preview</TabBarItem>
  <TabBarItem value="code"    leadingIcon={<Code2 />}>Code</TabBarItem>
  <TabBarItem value="docs"    leadingIcon={<FileText />}>Docs</TabBarItem>
</TabBar>

// Controlled
const [tab, setTab] = useState('preview');

<TabBar value={tab} onChange={setTab}>
  <TabBarItem value="preview">Preview</TabBarItem>
  <TabBarItem value="code">Code</TabBarItem>
</TabBar>

// With status badge
<TabBar value={tab} onChange={setTab}>
  <TabBarItem value="layers" badge={<span className="size-1.5 rounded-full bg-(--bg-interactive-success-default)" />}>
    Layers
  </TabBarItem>
</TabBar>`;

export function TabBarPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Tab Bar</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Chrome-style segmented tab track with a sliding active indicator. Supports icons,
          badges, disabled states, and controlled or uncontrolled selection.
        </p>
      </div>

      <TabBarDemos />

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">TabBar Props</h2>
        <PropsTable props={TAB_BAR_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">TabBarItem Props</h2>
        <PropsTable props={TAB_BAR_ITEM_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
