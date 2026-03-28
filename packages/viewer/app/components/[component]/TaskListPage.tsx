import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }    from '@/components/viewer/CodeBlock';
import { TaskListDemos } from './TaskListDemos';

const PROPS: PropRow[] = [
  { name: 'items',           type: 'string[]',                        default: '—',         description: 'Ordered list of task label strings.' },
  { name: 'completedCount',  type: 'number',                          default: '0',         description: 'Number of tasks that have been completed (from the start of the list).' },
  { name: 'isActive',        type: 'boolean',                         default: 'auto',      description: 'Whether a task is currently in progress. Defaults to true when completedCount < items.length.' },
  { name: 'updatedAt',       type: 'string',                          default: '—',         description: 'Optional timestamp shown in the header (e.g. "Updated 2m ago").' },
  { name: 'defaultExpanded', type: 'boolean',                         default: 'true',      description: 'Whether the task list body is expanded on initial render.' },
  { name: 'surface',         type: '"default" | "shadow-border"',     default: '"default"', description: 'Surface treatment — adds shadow and border in shadow-border mode.' },
  { name: 'disableMotion',   type: 'boolean',                         default: 'false',     description: 'Disables expand/collapse and icon animations.' },
  { name: 'className',       type: 'string',                          default: '—',         description: 'Extra classes merged onto the root element.' },
];

const USAGE = `import { TaskList } from '@spaceship/design-system';

const items = [
  'Set up project repository',
  'Design database schema',
  'Implement authentication',
  'Build API endpoints',
];

<TaskList
  items={items}
  completedCount={2}
  isActive
  updatedAt="Updated 2m ago"
/>`;

export function TaskListPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Task List</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Collapsible progress tracker for ordered task sequences. Shows completed,
          in-progress, and pending states with an animated progress fill in the header.
        </p>
      </div>

      <TaskListDemos />

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
