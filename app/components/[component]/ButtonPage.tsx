import { Button }     from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';
import { Plus, ChevronRight, Search, Trash2, ArrowRight, Mail, X, Settings, Download, Check } from 'lucide-react';

const PROPS: PropRow[] = [
  { name: 'variant',       type: '"primary" | "secondary" | "ghost" | "success" | "destructive"', default: '"primary"',  description: 'Visual style' },
  { name: 'size',          type: '"sm" | "md" | "lg" | "icon-sm" | "icon-md" | "icon-lg"', default: '"md"', description: 'Padding scale (sm/md/lg) or square icon-only size (icon-sm/icon-md/icon-lg).' },
  { name: 'surface',       type: '"default" | "shadow"',                          default: '"default"',   description: 'Surface treatment: flat or shadow ring' },
  { name: 'icon',          type: 'ReactNode',                                     default: '—',           description: 'Icon for icon-only buttons (size="icon-lg" or "icon-sm"). Exclusive with leadingIcon/trailingIcon.' },
  { name: 'leadingIcon',   type: 'ReactNode',                                     default: '—',           description: 'Icon rendered before children. Auto-sized to match button size.' },
  { name: 'trailingIcon',  type: 'ReactNode',                                     default: '—',           description: 'Icon rendered after children. Auto-sized to match button size.' },
  { name: 'disabled',      type: 'boolean',                                       default: 'false',       description: 'Prevents interaction, reduces opacity. Also disables motion.' },
  { name: 'disableMotion', type: 'boolean',                                       default: 'false',       description: 'Opt out of spring animation. Renders a plain <button>.' },
  { name: 'className',     type: 'string',                                        default: '—',           description: 'Additional classes merged via cn()' },
];

const USAGE = `import { Button } from '@/components/ui';
import { Plus, ArrowRight, Check, Trash2, Settings } from 'lucide-react';

<Button variant="primary">Get started</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Dismiss</Button>
<Button variant="success" leadingIcon={<Check />}>Save</Button>
<Button variant="destructive">Delete</Button>

{/* Sizes (md is default) */}
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

{/* Leading icon */}
<Button variant="primary" leadingIcon={<Plus />}>New item</Button>

{/* Trailing icon */}
<Button variant="secondary" trailingIcon={<ArrowRight />}>Explore</Button>

{/* Icon only — always include aria-label */}
<Button size="icon-sm"  variant="ghost"   icon={<Settings />} aria-label="Settings" />
<Button size="icon-md"  variant="ghost"   icon={<Settings />} aria-label="Settings" />
<Button size="icon-lg"  variant="primary" icon={<Plus />}     aria-label="Add" />

{/* Opt out of spring animation */}
<Button variant="primary" disableMotion>Submit</Button>`;

export function ButtonPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Button</h1>
        <p className="mt-2 text-sm text-zinc-500">Primary interactive element. Radial cursor-fill hover animation with scale spring. Use for actions, not navigation.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="primary / secondary / ghost / success / destructive">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="success">Success</Button>
          <Button variant="destructive">Destructive</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label="sm / md (default) / lg">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Leading Icon</h2>
        <Preview label="All variants with leadingIcon">
          <Button variant="primary"     leadingIcon={<Plus />}>New item</Button>
          <Button variant="secondary"   leadingIcon={<Search />}>Search</Button>
          <Button variant="ghost"       leadingIcon={<Search />}>Search</Button>
          <Button variant="success"     leadingIcon={<Check />}>Save</Button>
          <Button variant="destructive" leadingIcon={<Trash2 />}>Delete</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Trailing Icon</h2>
        <Preview label="All variants with trailingIcon">
          <Button variant="primary"     trailingIcon={<ArrowRight />}>Continue</Button>
          <Button variant="secondary"   trailingIcon={<ChevronRight />}>Explore</Button>
          <Button variant="ghost"       trailingIcon={<ChevronRight />}>Explore</Button>
          <Button variant="success"     trailingIcon={<Check />}>Confirm</Button>
          <Button variant="destructive" trailingIcon={<X />}>Cancel</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Leading + Trailing Icons</h2>
        <Preview label="Both icons">
          <Button variant="primary"   leadingIcon={<Search />}  trailingIcon={<ChevronRight />}>Search results</Button>
          <Button variant="secondary" leadingIcon={<Mail />}    trailingIcon={<X />}>Inbox</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Icon Only</h2>
        <p className="text-sm text-zinc-500 mb-3">Square sizes with no padding. Always include <code className="text-xs bg-zinc-100 px-1 rounded">aria-label</code> for accessibility.</p>
        <Preview label="icon-sm (28×28) / icon-md (36×36) / icon-lg (44×44)">
          <Button size="icon-sm" variant="ghost"    icon={<Settings />} aria-label="Settings" />
          <Button size="icon-md" variant="ghost"    icon={<Settings />} aria-label="Settings" />
          <Button size="icon-lg" variant="ghost"    icon={<Settings />} aria-label="Settings" />
        </Preview>
        <Preview label="All variants at size=&quot;icon-lg&quot;">
          <Button size="icon-lg" variant="primary"     icon={<Plus />}     aria-label="Add" />
          <Button size="icon-lg" variant="secondary"   icon={<Search />}   aria-label="Search" />
          <Button size="icon-lg" variant="ghost"       icon={<Search />}   aria-label="Search" />
          <Button size="icon-lg" variant="success"     icon={<Check />}    aria-label="Confirm" />
          <Button size="icon-lg" variant="destructive" icon={<Trash2 />}   aria-label="Delete" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Shadow Surface</h2>
        <Preview label='surface="shadow"'>
          <Button variant="primary"     surface="shadow">Primary</Button>
          <Button variant="secondary"   surface="shadow">Secondary</Button>
          <Button variant="ghost"       surface="shadow">Ghost</Button>
          <Button variant="success"     surface="shadow">Success</Button>
          <Button variant="destructive" surface="shadow">Destructive</Button>
        </Preview>
        <Preview label='surface="shadow" with icons'>
          <Button variant="primary"    surface="shadow" leadingIcon={<Plus />}>New</Button>
          <Button variant="secondary"  surface="shadow" trailingIcon={<ArrowRight />}>Continue</Button>
          <Button size="icon-lg"          surface="shadow" variant="ghost"    icon={<Settings />} aria-label="Settings" />
          <Button size="icon-lg"          surface="shadow" variant="primary"  icon={<Download />} aria-label="Download" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled</h2>
        <Preview label="Disabled state">
          <Button disabled>Disabled</Button>
          <Button variant="secondary"   disabled>Disabled</Button>
          <Button variant="ghost"       disabled>Disabled</Button>
          <Button variant="success"     disabled>Disabled</Button>
          <Button variant="destructive" disabled>Disabled</Button>
          <Button size="icon-lg" variant="ghost" icon={<Check />} disabled aria-label="Check" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion</h2>
        <p className="text-sm text-zinc-500 mb-3">Hover triggers a radial fill expanding from the cursor entry point. Press scales down to 0.97×. Spring: stiffness 400, damping 30 (ζ ≈ 0.75).</p>
        <Preview label="Radial fill — hover to see the animation">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="success">Success</Button>
          <Button variant="destructive">Destructive</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Motion Disabled</h2>
        <p className="text-sm text-zinc-500 mb-3">Use <code className="text-xs bg-zinc-100 px-1 rounded">disableMotion</code> to render a plain button with no animation overhead.</p>
        <Preview label="disableMotion — no spring animation">
          <Button variant="primary"     disableMotion>Primary</Button>
          <Button variant="secondary"   disableMotion>Secondary</Button>
          <Button variant="ghost"       disableMotion>Ghost</Button>
          <Button variant="destructive" disableMotion>Destructive</Button>
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
