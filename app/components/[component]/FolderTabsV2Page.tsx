import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { FolderTabsV2Demos } from './FolderTabsV2Demos';

const FOLDER_TABS_V2_PROPS: PropRow[] = [
  { name: 'value',         type: 'string',                              default: '—',          description: 'Controlled selected tab value.' },
  { name: 'defaultValue',  type: 'string',                              default: '""',         description: 'Uncontrolled initial selected value.' },
  { name: 'onChange',      type: '(value: string) => void',             default: '—',          description: 'Called when the selected tab changes.' },
  { name: 'leadingAction', type: 'ReactNode',                           default: '—',          description: 'Action button rendered before the tab list, separated by a divider. Not part of tab selection.' },
  { name: 'surface',       type: '"default" | "shadow-border"',         default: '"default"',  description: 'Adds a shadow ring around the container.' },
  { name: 'disableMotion', type: 'boolean',                             default: 'false',      description: 'Disables the sliding layout animation.' },
  { name: 'layoutId',      type: 'string',                              default: 'auto',       description: 'Motion layout ID for the active indicator. Auto-generated if omitted.' },
  { name: 'className',     type: 'string',                              default: '—',          description: 'Additional classes on the container.' },
  { name: 'children',      type: 'ReactNode',                           default: '—',          description: 'FolderTabV2 elements.' },
];

const FOLDER_TAB_V2_PROPS: PropRow[] = [
  { name: 'value',       type: 'string',    default: '—',     description: 'Unique value identifying this tab.' },
  { name: 'disabled',    type: 'boolean',   default: 'false', description: 'Prevents selection and reduces opacity.' },
  { name: 'leadingIcon', type: 'ReactNode', default: '—',     description: '16×16 icon rendered before the label.' },
  { name: 'children',    type: 'ReactNode', default: '—',     description: 'Tab label. Omit to render an icon-only tab (32×32).' },
  { name: 'className',   type: 'string',    default: '—',     description: 'Additional classes on the tab button.' },
];

const USAGE = `import { FolderTabsV2, FolderTabV2, Button } from '@/components/ui';
import { FileText, Monitor, FolderOpen } from 'lucide-react';

// With leading action + shadow-border (Figma reference)
<FolderTabsV2
  defaultValue="prototype"
  surface="shadow-border"
  leadingAction={
    <Button variant="ghost" size="icon-sm" disableMotion aria-label="Open folder">
      <FolderOpen />
    </Button>
  }
>
  <FolderTabV2 value="brief"     leadingIcon={<FileText />}>Product Brief</FolderTabV2>
  <FolderTabV2 value="prototype" leadingIcon={<Monitor />}>Prototype</FolderTabV2>
  <FolderTabV2 value="risks"     leadingIcon={<FileText />}>Security Risks</FolderTabV2>
</FolderTabsV2>

// Controlled
const [tab, setTab] = useState('preview');

<FolderTabsV2 value={tab} onChange={setTab} surface="shadow-border">
  <FolderTabV2 value="preview" leadingIcon={<Eye />}>Preview</FolderTabV2>
  <FolderTabV2 value="code"    leadingIcon={<Code2 />}>Code</FolderTabV2>
</FolderTabsV2>`;

export function FolderTabsV2Page() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Folder Tabs V2</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Compact segmented tab strip with a sliding active indicator. Supports an optional leading
          action button (separated by a divider), icon-label tabs, icon-only tabs, and both controlled
          and uncontrolled selection.
        </p>
      </div>

      <FolderTabsV2Demos />

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">FolderTabsV2 Props</h2>
        <PropsTable props={FOLDER_TABS_V2_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">FolderTabV2 Props</h2>
        <PropsTable props={FOLDER_TAB_V2_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
