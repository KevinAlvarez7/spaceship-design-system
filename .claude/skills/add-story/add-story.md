# Add Story Skill

## Trigger
Use this skill when the user says `/add-story`, "add a story", "create a story", "generate story", or asks to create a Storybook story for a component.

## Purpose
Generate a `stories/ui/{ComponentName}.stories.tsx` (or `stories/patterns/`) file for a DS component by reading its source file and inferring CVA variants, props, and meaningful story scenarios.

---

## Step 0 — Identify the component

If the user did not specify a component, ask which one.

Determine the source file path:
- DS component: `components/ui/{name}.tsx`
- Pattern: `components/patterns/{Name}.tsx`

Determine the story output path:
- DS component → `stories/ui/{ComponentName}.stories.tsx`
- Pattern → `stories/patterns/{ComponentName}.stories.tsx`

---

## Step 1 — Read the component source

Read the component file. Extract:
- **Exported component names** (e.g. `Button`, `ButtonV2`)
- **CVA variants object** — all `variants:` keys and their options
- **`defaultVariants`** — use as story `args` defaults
- **Props interface** — identify which props are interactive controls vs non-visual
- **Sub-components** (e.g. `ModalHeader`, `TabBarItem`) that compose with the main component
- Whether the component uses `motion/react` (needs `EXCLUDE_MOTION_PROPS`)
- Whether it uses `'use client'` (just note it — no impact on story)

---

## Step 2 — Plan the argTypes

For each CVA variant key:
```typescript
variantName: {
  control: { type: 'select' },
  options: [/* all variant options from CVA */],
  table: { category: 'Variants' },
},
```

For boolean props (`disabled`, `isActive`, etc.):
```typescript
propName: { control: 'boolean', table: { category: 'State' } },
```

For `disableMotion`:
```typescript
disableMotion: { control: 'boolean', table: { category: 'Motion' } },
```

For icon/slot props and sub-components — disable in Controls panel:
```typescript
iconProp: { table: { disable: true } },
```

If the component extends `HTMLMotionProps` — spread `EXCLUDE_MOTION_PROPS` into `argTypes`.

---

## Step 3 — Plan the stories

Always include:
- `Default` — minimal story with `args` defaults
- `AllVariants` — renders all CVA variant options side by side if there is a `variant` key
- Any other natural scenarios:
  - `Disabled` — if the component has a disabled state
  - `ShadowBorder` — if the component has `surface` variants
  - State-driven stories (controlled / uncontrolled) — if the component is interactive
  - With sub-components — if composed components are meaningful to show

For components with complex state (Modal open/close, controlled inputs):
- Use a wrapper function component inside the `render` function
- Don't use `args` for state — use `useState` inside `render`

---

## Step 4 — Write the story file

Follow this template exactly:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
// import { useState } from 'react';  // only if stories need state
// import { EXCLUDE_MOTION_PROPS } from '../_helpers/motion-argtypes';  // only if motion component
import { ComponentName } from '@/components/ui';  // adjust path for patterns

const meta = {
  title: 'Components/ComponentName',  // or 'Patterns/ComponentName'
  component: ComponentName,
  parameters: { layout: 'centered' },  // or 'fullscreen' for full-page patterns
  argTypes: {
    // ... argTypes from Step 2
  },
  args: {
    // ... defaultVariants + sensible defaults
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ... other stories
```

**Rules:**
- Use `satisfies Meta<typeof ComponentName>` — not `Meta<typeof ComponentName>`
- `args` on `meta` = shared defaults; `args` on individual stories override them
- Import from `@/components/ui` barrel for DS components (not individual files)
- Import from `@/components/patterns` barrel for patterns
- Width-constrained components (chat, card): add a decorator with `w-(--sizing-chat-default)` or appropriate width

---

## Step 5 — Verify

After writing the file, run:
```
npx storybook build
```

Fix any TypeScript or import errors. Common issues:
- Missing export from barrel → add to `components/ui/index.ts` or `components/patterns/index.ts`
- `HTMLMotionProps` noise → add `EXCLUDE_MOTION_PROPS` spread to `argTypes`
- Sub-component not exported → import directly from the file path

---

## Step 6 — Report

After completion, report:
- Story file path created
- Number of stories generated
- Any exports added to barrel files
