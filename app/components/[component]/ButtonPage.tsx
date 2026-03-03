import { Button }     from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';
import { Plus, ChevronRight, Search, Trash2, Check, ArrowRight, Settings, X, Download, Mail } from 'lucide-react';

const PROPS: PropRow[] = [
  { name: 'variant',       type: '"primary" | "secondary" | "ghost" | "success" | "destructive"', default: '"primary"', description: 'Visual style' },
  { name: 'size',          type: '"sm" | "md" | "icon-sm" | "icon"', default: '"sm"', description: 'Padding scale (sm/md) or square icon-only size (icon-sm/icon). No padding on icon sizes.' },
  { name: 'surface',       type: '"default" | "shadow"', default: '"default"', description: 'Surface treatment: default (flat) or shadow (border shadow ring)' },
  { name: 'leadingIcon',   type: 'ReactNode',            default: '—',         description: 'Icon rendered before children. Auto-sized to match button size.' },
  { name: 'trailingIcon',  type: 'ReactNode',            default: '—',         description: 'Icon rendered after children. Auto-sized to match button size.' },
  { name: 'disabled',      type: 'boolean',              default: 'false',     description: 'Prevents interaction, reduces opacity. Also disables motion.' },
  { name: 'disableMotion', type: 'boolean',              default: 'false',     description: 'Opt out of spring hover/press animation. Renders a plain <button> with no motion overhead.' },
  { name: 'className',     type: 'string',               default: '—',         description: 'Additional classes merged via cn()' },
];

const USAGE = `import { Button } from '@/components/ui';
import { Plus, ArrowRight, Search } from 'lucide-react';

<Button variant="primary">Get started</Button>
<Button variant="secondary" size="md">Cancel</Button>
<Button variant="success">Confirm</Button>
<Button variant="destructive">Delete</Button>

{/* Leading icon */}
<Button variant="primary" leadingIcon={<Plus />}>New item</Button>

{/* Trailing icon */}
<Button variant="secondary" trailingIcon={<ArrowRight />}>Continue</Button>

{/* Leading + trailing */}
<Button variant="ghost" leadingIcon={<Search />} trailingIcon={<ChevronRight />}>Search</Button>

{/* Icon only — square, no children */}
<Button size="icon-sm" variant="ghost" aria-label="Settings"><Settings /></Button>
<Button size="icon" variant="primary" aria-label="Add"><Plus /></Button>

{/* Opt out of spring animation */}
<Button variant="primary" disableMotion>Submit</Button>`;

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
          <Button variant="ghost">Ghost</Button>
          <Button variant="success">Success</Button>
          <Button variant="destructive">Destructive</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label="sm (default) / md">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Leading Icon</h2>
        <Preview label="All variants with leadingIcon">
          <Button variant="primary"     leadingIcon={<Plus />}>New item</Button>
          <Button variant="secondary"   leadingIcon={<Search />}>Search</Button>
          <Button variant="ghost"       leadingIcon={<Mail />}>Compose</Button>
          <Button variant="success"     leadingIcon={<Check />}>Confirm</Button>
          <Button variant="destructive" leadingIcon={<Trash2 />}>Delete</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Trailing Icon</h2>
        <Preview label="All variants with trailingIcon">
          <Button variant="primary"     trailingIcon={<ArrowRight />}>Continue</Button>
          <Button variant="secondary"   trailingIcon={<ChevronRight />}>Next</Button>
          <Button variant="ghost"       trailingIcon={<ChevronRight />}>Explore</Button>
          <Button variant="success"     trailingIcon={<Check />}>Done</Button>
          <Button variant="destructive" trailingIcon={<X />}>Cancel</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Leading + Trailing Icons</h2>
        <Preview label="Both icons">
          <Button variant="primary"   leadingIcon={<Search />}   trailingIcon={<ChevronRight />}>Search results</Button>
          <Button variant="secondary" leadingIcon={<Settings />} trailingIcon={<ChevronRight />}>Settings</Button>
          <Button variant="ghost"     leadingIcon={<Mail />}     trailingIcon={<X />}>Inbox</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Icon Only</h2>
        <p className="text-sm text-zinc-500 mb-3">Square sizes with no padding. Always include <code className="text-xs bg-zinc-100 px-1 rounded">aria-label</code> for accessibility.</p>
        <Preview label="icon-sm (36×36) / icon (48×48)">
          <Button size="icon-sm" variant="ghost" aria-label="Settings"><Settings /></Button>
          <Button size="icon"    variant="ghost" aria-label="Settings"><Settings /></Button>
        </Preview>
        <Preview label="All variants at size=&quot;icon&quot;">
          <Button size="icon" variant="primary"     aria-label="Add"><Plus /></Button>
          <Button size="icon" variant="secondary"   aria-label="Download"><Download /></Button>
          <Button size="icon" variant="ghost"       aria-label="Search"><Search /></Button>
          <Button size="icon" variant="success"     aria-label="Confirm"><Check /></Button>
          <Button size="icon" variant="destructive" aria-label="Delete"><Trash2 /></Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Icon Sizing</h2>
        <p className="text-sm text-zinc-500 mb-3">Icons are automatically sized to match the button — no manual <code className="text-xs bg-zinc-100 px-1 rounded">h-4 w-4</code> needed.</p>
        <Preview label="sm (16px icon) / md (20px icon)">
          <Button size="sm" leadingIcon={<Plus />}>Small</Button>
          <Button size="md" leadingIcon={<Plus />}>Medium</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Icons + Shadow Surface</h2>
        <Preview label='surface="shadow" with icons'>
          <Button variant="primary"   surface="shadow" leadingIcon={<Plus />}>New</Button>
          <Button variant="secondary" surface="shadow" trailingIcon={<ArrowRight />}>Continue</Button>
          <Button size="icon" variant="primary"   surface="shadow" aria-label="Add"><Plus /></Button>
          <Button size="icon" variant="secondary" surface="shadow" aria-label="Search"><Search /></Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Icons Disabled</h2>
        <Preview label="Disabled icon buttons">
          <Button disabled leadingIcon={<Plus />}>Add item</Button>
          <Button disabled size="icon"    variant="primary"   aria-label="Add"><Plus /></Button>
          <Button disabled size="icon"    variant="secondary" aria-label="Download"><Download /></Button>
          <Button disabled size="icon-sm" variant="ghost"     aria-label="Search"><Search /></Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled</h2>
        <Preview label="Disabled state">
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="ghost"     disabled>Disabled</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Shadow Surface</h2>
        <Preview label='surface="shadow"'>
          <Button variant="primary"   surface="shadow">Primary</Button>
          <Button variant="secondary" surface="shadow">Secondary</Button>
          <Button variant="success"   surface="shadow">Success</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion Effects</h2>
        <p className="text-sm text-zinc-500 mb-3">Hover to scale up, click and hold to scale down. Each surface has tuned spring physics.</p>
        <Preview label="default surface — hover: 1.03×, tap: 0.97×">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </Preview>
        <Preview label='shadow — hover: 1.02×, tap: 0.98× (restrained)'>
          <Button variant="primary"   surface="shadow">Primary</Button>
          <Button variant="secondary" surface="shadow">Secondary</Button>
          <Button variant="success"   surface="shadow">Success</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion Disabled</h2>
        <p className="text-sm text-zinc-500 mb-3">Use <code className="text-xs bg-zinc-100 px-1 rounded">disableMotion</code> to render a plain button with no animation overhead.</p>
        <Preview label="disableMotion — no spring animation">
          <Button variant="primary"   disableMotion>Primary</Button>
          <Button variant="secondary" disableMotion>Secondary</Button>
          <Button variant="ghost"     disableMotion>Ghost</Button>
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
