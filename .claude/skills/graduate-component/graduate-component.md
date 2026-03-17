# Graduate Component Skill

## Trigger
Use this skill when the user says `/graduate`, "graduate component", "confirm as component", "promote to DS", or asks to move a playground component into `components/ui/`.

## Purpose
Graduate a versioned playground component into a confirmed DS component by:
1. Copying its source file to `components/ui/`
2. Exporting it from the barrel
3. Updating the viewer registry
4. Generating a viewer page

---

## Step 0 — Gather parameters

If the user did not specify a slug and version, ask:
- Which playground component? (e.g. `pg-button`)
- Which version? (e.g. `v1`)

Example invocation: `/graduate pg-button v1`

---

## Step 1 — Read the config

Read `lib/playground-config.ts`. Find the config for the given slug. Locate the specified version inside `versions[]`.

Extract:
- `config.componentName` — e.g. `Button`
- `config.importPath` — e.g. `@/components/ui`
- `version.sourcePath` — e.g. `components/playground/button/v1.tsx`
- `version.controls` — for the viewer page props table
- `version.label` — e.g. `v1`

If `sourcePath` is missing, tell the user and stop — the version file must exist before graduation.

---

## Step 2 — Copy source to `components/ui/`

Read `{version.sourcePath}`.

Write it to `components/ui/{lowercase-componentName}.tsx`.
- Example: `Button` → `components/ui/button.tsx`

Adjust the file as needed to pass the DS Enforcement Checklist:
- All colours/spacing/radius/shadow use semantic tokens (`var(--token)`) — no hardcoded hex, no Tailwind colour utilities
- Only semantic tokens — never primitive tokens (`--orbit-blue-500`)
- CVA base uses **array syntax**
- Component has a `surface` variant (`default` / `shadow-border` at minimum)
- `compoundVariants` handle border/shadow switching
- Interactive components use `motion/react` with `disableMotion` prop
- `motion.*` elements spread `{...props}` before explicit motion props; `willChange: 'transform'` on scale animations; spring ζ ≥ 0.7
- Icon props use `leadingIcon` / `trailingIcon` + `ICON_CLASSES` + `IconSlot`
- Named export only; `variants` function also exported

---

## Step 3 — Update barrel export

Read `components/ui/index.ts`.

Add an export line for the new component. Match the style of existing lines:
```typescript
export { Button, buttonVariants } from './button';
```

Only add lines that don't already exist.

---

## Step 4 — Update viewer registry

Read `lib/viewer-registry.ts`.

**Graduation is a copy + promote operation — never remove or mutate the playground entry.**

1. **Keep** the existing playground entry (e.g. `slug: 'pg-button'`) exactly as-is. The playground page must remain navigable with its version switcher after graduation.

2. **Check** if a confirmed entry already exists in `'Components'` with the component's lowercase slug (e.g. `slug: 'button'`).

3. If **not found**, add a new confirmed entry in the `'Components'` section alongside the existing entries:
```typescript
{ slug: 'button', title: 'Button', section: 'Components', route: 'components', layout: 'standard' },
```

4. If **found**, leave it as-is (the component page file gets updated in Step 5).

---

## Step 5 — Generate viewer page

Check if `app/components/[component]/` directory exists with pages for this component.

### 5a — Create `{Name}Page.tsx`

Create `app/components/{lowercase-name}/{Name}Page.tsx`.

Use the component's controls to generate variant showcase sections. Template:

```typescript
import { ComponentName, componentNameVariants } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';

// Props table derived from version.controls
const PROPS = [
  // One entry per control
];

export function ComponentNamePage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-zinc-900">ComponentName</h1>
        <p className="text-zinc-500">Description from config or a sensible default.</p>
      </div>

      {/* Variants section */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Variants</h2>
        <Preview>
          {/* Render each variant option */}
        </Preview>
      </section>

      {/* Props */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      {/* Usage */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">Usage</h2>
        <CodeBlock language="tsx" code={`import { ComponentName } from '@/components/ui';\n\n<ComponentName />`} />
      </section>
    </div>
  );
}
```

Adapt the template to the actual component — use the controls to enumerate variants, sizes, etc.

### 5b — Create or update `page.tsx`

Check if `app/components/{lowercase-name}/page.tsx` exists.

If it doesn't exist, create it:
```typescript
import { ComponentNamePage } from './ComponentNamePage';

export default function Page() {
  return <ComponentNamePage />;
}
```

If it exists, read it and add the new page component to the existing pattern.

---

## Step 6 — Verify

Run `npm run build`. If there are TypeScript errors, fix them and re-run.

Run `npm run lint`. Fix any new warnings.

---

## Step 7 — Report

After all steps complete, report:
- Files created/modified
- Where to find the new component page in the viewer
- Any DS checklist items that needed adjustment during graduation
