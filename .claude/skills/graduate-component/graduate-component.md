# Graduate Component Skill

## Trigger
Use this skill when the user says `/graduate`, "graduate component", "confirm as component", "promote to DS", or asks to move a playground component into `components/ui/`.

## Purpose
Graduate a versioned playground component into a confirmed DS component by:
1. Copying its source file to `components/ui/`
2. Exporting it from the barrel
3. Creating a Storybook story

Graduation is a **copy + promote** operation — playground entries remain intact.

---

## Step 0 — Gather parameters

If the user did not specify a component name and version, ask:
- Which playground component? (e.g. `button`)
- Which version? (e.g. `v1`)

Example invocation: `/graduate button v1`

---

## Step 1 — Read the source

Read `components/playground/{component}/{version}.tsx`.

Extract:
- Component name (e.g. `Button`)
- CVA variants (variant, size, surface, etc.)
- Props interface

---

## Step 2 — Copy source to `components/ui/`

Write the file to `components/ui/{lowercase-name}.tsx`.

Adjust the file to pass the DS Enforcement Checklist:
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

## Step 4 — Create Storybook story

Create `stories/ui/{ComponentName}.stories.tsx`.

Use the `/add-story` skill to generate it, or follow this pattern:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from '@/components/ui';
import { EXCLUDE_MOTION_PROPS } from '../_helpers/motion-argtypes';

const meta = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: [/* CVA options */],
      table: { category: 'Variants' },
    },
    // ... other argTypes
    ...EXCLUDE_MOTION_PROPS,
  },
  args: { /* defaults */ },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AllVariants: Story = { render: () => (/* ... */) };
```

---

## Step 5 — Verify

Run `npm run build`. Fix any TypeScript errors.
Run `npx storybook build`. Fix any story errors.

---

## Step 6 — Report

After all steps complete, report:
- Files created/modified
- The story location: `stories/ui/{ComponentName}.stories.tsx`
- Any DS checklist items adjusted during graduation
