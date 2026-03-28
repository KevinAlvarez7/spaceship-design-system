import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { SortableListDemos } from './SortableListDemos';

const PROPS: PropRow[] = [
  { name: 'items',       type: 'string[]',                            default: '—',               description: 'Ordered list of item ID strings.' },
  { name: 'onReorder',   type: '(items: string[]) => void',           default: '—',               description: 'Called with the new order after a drag completes.' },
  { name: 'renderItem',  type: '(item: string, index: number) => ReactNode', default: '—',        description: 'Custom row renderer. Defaults to a plain text label.' },
  { name: 'dividers',    type: 'boolean',                             default: 'true',            description: 'Show a separator line between items.' },
  { name: 'surface',     type: '"default" | "shadow-border"',         default: '"shadow-border"', description: 'Surface treatment — adds shadow ring in shadow-border mode.' },
  { name: 'className',   type: 'string',                              default: '—',               description: 'Extra classes merged onto the root element.' },
];

const USAGE = `import { SortableList } from '@/components/ui';
import { useState } from 'react';

const [items, setItems] = useState([
  'Authentication',
  'Data models',
  'API endpoints',
  'Frontend views',
]);

<SortableList items={items} onReorder={setItems} />

// Custom row content
<SortableList
  items={items}
  onReorder={setItems}
  renderItem={(item, index) => (
    <div className="flex items-center gap-2 flex-1">
      <span className="text-xs text-zinc-400 w-4">{index + 1}</span>
      <span>{item}</span>
    </div>
  )}
/>`;

export function SortableListPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Sortable List</h1>
        <p className="mt-2 text-sm text-zinc-500">
          A drag-to-reorder list. Powered by dnd-kit with pointer and keyboard sensor
          support for accessible drag interactions.
        </p>
      </div>

      <SortableListDemos />

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
