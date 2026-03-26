import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { FolderTabsDemos } from './FolderTabsDemos';

const FOLDER_TABS_PROPS: PropRow[] = [
  { name: 'value',         type: 'string',                              default: '—',          description: 'Controlled selected tab value.' },
  { name: 'defaultValue',  type: 'string',                              default: '""',         description: 'Uncontrolled initial selected value.' },
  { name: 'onChange',      type: '(value: string) => void',             default: '—',          description: 'Called when the selected tab changes.' },
  { name: 'activeActions', type: 'ReactNode',                           default: '—',          description: 'Content rendered inline within the active tab on the right side. Use the value from onChange to vary actions per tab.' },
  { name: 'surface',       type: '"default" | "shadow-border"',         default: '"default"',  description: 'Adds a shadow ring around the container.' },
  { name: 'disableMotion', type: 'boolean',                             default: 'false',      description: 'Disables layout animation — active tab snaps instantly.' },
  { name: 'layoutId',      type: 'string',                              default: 'auto',       description: 'Motion layout ID for the active tab. Auto-generated if omitted.' },
  { name: 'className',     type: 'string',                              default: '—',          description: 'Additional classes on the container.' },
  { name: 'children',      type: 'ReactNode',                           default: '—',          description: 'FolderTab elements.' },
];

const FOLDER_TAB_PROPS: PropRow[] = [
  { name: 'value',       type: 'string',    default: '—',     description: 'Unique value identifying this tab.' },
  { name: 'disabled',    type: 'boolean',   default: 'false', description: 'Prevents selection and reduces opacity.' },
  { name: 'leadingIcon', type: 'ReactNode', default: '—',     description: '16×16 icon rendered before the label — visible on all tabs.' },
  { name: 'className',   type: 'string',    default: '—',     description: 'Additional classes on the tab button.' },
  { name: 'children',    type: 'ReactNode', default: '—',     description: 'Tab label content.' },
];

const USAGE = `import { FolderTabs, FolderTab } from '@/components/ui';
import { Button } from '@/components/ui';
import { RefreshCw, ExternalLink, Code2, Eye } from 'lucide-react';

// Uncontrolled
<FolderTabs defaultValue="code">
  <FolderTab value="code"    leadingIcon={<Code2 />}>Code</FolderTab>
  <FolderTab value="preview" leadingIcon={<Eye />}>Preview</FolderTab>
</FolderTabs>

// Shared actions inline in the active tab
const [tab, setTab] = useState('code');

<FolderTabs
  value={tab}
  onChange={setTab}
  activeActions={
    <>
      <Button variant="secondary" size="icon-sm" leadingIcon={<RefreshCw />} />
      <Button variant="secondary" size="icon-sm" leadingIcon={<ExternalLink />} />
    </>
  }
>
  <FolderTab value="code"    leadingIcon={<Code2 />}>Code</FolderTab>
  <FolderTab value="preview" leadingIcon={<Eye />}>Preview</FolderTab>
</FolderTabs>

// Different actions per tab
const tabActions = { code: <Button ... />, preview: <Button ... /> };

<FolderTabs value={tab} onChange={setTab} activeActions={tabActions[tab]}>
  <FolderTab value="code"    leadingIcon={<Code2 />}>Code</FolderTab>
  <FolderTab value="preview" leadingIcon={<Eye />}>Preview</FolderTab>
</FolderTabs>`;

export function FolderTabsPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Folder Tabs</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Compact tab pattern where the active tab expands to fill available width with a white
          background, while inactive tabs shrink to their content with a gray background. An optional
          set of action buttons appears inline within the active tab on the right side.
        </p>
      </div>

      <FolderTabsDemos />

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">FolderTabs Props</h2>
        <PropsTable props={FOLDER_TABS_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">FolderTab Props</h2>
        <PropsTable props={FOLDER_TAB_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
