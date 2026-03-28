import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { DropdownMenuDemos } from './DropdownMenuDemos';

const CONTENT_PROPS: PropRow[] = [
  { name: 'align',       type: '"start" | "center" | "end"', default: '"end"',  description: 'Horizontal alignment of the content relative to the trigger.' },
  { name: 'sideOffset', type: 'number',                      default: '6',      description: 'Distance in pixels between trigger and content.' },
  { name: 'className',  type: 'string',                      default: '—',      description: 'Extra classes merged onto the visual container.' },
];

const ITEM_PROPS: PropRow[] = [
  { name: 'variant',   type: '"default" | "destructive"', default: '"default"', description: 'Color treatment — destructive renders error text and hover background.' },
  { name: 'onSelect',  type: '() => void',                default: '—',         description: 'Called when the item is selected (click or keyboard).' },
  { name: 'disabled',  type: 'boolean',                   default: 'false',     description: 'Prevents selection and dims the item.' },
  { name: 'className', type: 'string',                    default: '—',         description: 'Additional classes.' },
];

const USAGE = `import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Button,
} from '@spaceship/design-system';
import { MoreVertical, PenLine, Trash2 } from 'lucide-react';

function Example() {
  return (
    <DropdownMenu>
      {/* isolateScale keeps the button's bounding rect stable so the dropdown doesn't shift */}
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" surface="shadow" size="icon-md"
          isolateScale icon={<MoreVertical />} aria-label="Open menu" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => console.log('rename')}>
          <PenLine />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => console.log('delete')}>
          <Trash2 />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}`;

export function DropdownMenuPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Dropdown Menu</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Context menu attached to a trigger. Animates in with fade + scale and out with a
          fast fade. Supports keyboard navigation and a destructive item variant.
        </p>
      </div>

      <DropdownMenuDemos />

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">DropdownMenuContent props</h2>
        <PropsTable props={CONTENT_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">DropdownMenuItem props</h2>
        <PropsTable props={ITEM_PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
