# Composition Table — Live Edit & Source Write

**Date:** 2026-04-13  
**Status:** Approved

## Problem

The Composition story shows padding/radius data in an editable table, but edits are disconnected from reality: you can't see how a change looks on the actual component, and saving requires manually copying code and pasting it into the source file.

## Goal

1. Move Composition to the top of each component's docs page (before other stories)
2. Render the real component in a live preview pane that updates as you edit table cells
3. Let "Save" write changed class values directly to the component's source `.tsx` file, triggering Storybook HMR

---

## Architecture

### CompositionTable props (new)

```ts
<CompositionTable
  entries={COMPOSITION}
  sourcePath="components/ui/button.tsx"   // path relative to project root
  preview={<Button size="md">Button</Button>}   // real component node
/>
```

### Two-panel layout

```
┌─────────────────────────────────────────────────────┐
│  Editable table (Part / Variant / Padding / Radius)  │
├─────────────────────────────────────────────────────┤
│  Preview                         [Reset]  [Save]     │
│  ┌────────────────────────────────────────────────┐ │
│  │  rendered component                            │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Live preview — CSS injection

- Each `CompositionTable` instance has a stable `uid` (React `useId`)
- Preview component is wrapped in `<div data-preview={uid}>`
- On any cell edit, diff initial vs current values and inject a `<style>` tag:

```css
[data-preview="uid"] .py-2  { padding-top: 12px !important; padding-bottom: 12px !important; }
[data-preview="uid"] .rounded-sm { border-radius: 8px !important; }
```

- A lookup map (`TAILWIND_VALUES`) covers all padding and radius Tailwind classes used in the DS
- The preview sees the effect immediately; the source file is untouched until Save

### Save → Vite middleware

A custom Vite plugin added to `.storybook/main.ts → viteFinal` registers a dev-only request handler:

```
POST /composition-write
Content-Type: application/json

{
  "path": "components/ui/button.tsx",
  "replacements": [
    { "old": "py-2 px-3", "new": "py-3 px-4" },
    { "old": "rounded-sm", "new": "rounded-md" }
  ]
}
```

- Middleware reads the file, applies each string replacement in order, writes it back
- Storybook HMR detects the file change and reloads the story
- Only changed values are sent (no-op rows are skipped)
- In production builds the middleware is absent — Save button is hidden

### Story changes (20 files)

Each story's `Composition` export gains two new props:

```tsx
export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/button.tsx"
      preview={<Button size="md">Button</Button>}
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true } },
};
```

The story itself moves to `parameters.docs.order: 0` (or is renamed with a leading underscore) so it sorts to the top in autodocs.

---

## Story ordering — "Composition first"

Storybook autodocs renders named story exports in declaration order. Moving the `Composition` export to be the **first named export** in each story file places it at the top of the docs page automatically. No config change needed.

---

## Files to create/modify

| File | Change |
|---|---|
| `components/docs/CompositionTable.tsx` | Add `preview`, `sourcePath` props; CSS injection; Save/Reset logic; `fetch POST /composition-write` |
| `.storybook/main.ts` | Add `compositionWritePlugin()` to `viteFinal` |
| `stories/ui/*.stories.tsx` (all 18 with Composition) | Move `Composition` export to top; add `sourcePath` + `preview` props |

---

## Tailwind class → CSS value map

Covers all padding and radius classes currently used in the DS:

**Padding (px values from Tailwind default scale):**
`p-1→4px, p-2→8px, p-3→12px, p-4→16px, px-1→4px, px-2→8px, px-3→12px, px-4→16px, px-1.5→6px, px-2.5→10px, px-3.5→14px, py-1→4px, py-1.5→6px, py-2→8px, py-2.5→10px, py-3→12px, py-4→16px, py-0.5→2px, gap-1→4px, gap-1.5→6px, gap-2→8px, gap-3→12px`

**Radius:** same map already in `RADIUS_CSS` in `CompositionTable.tsx`

---

## Constraints

- Middleware only active in dev (`command === 'serve'` in Vite plugin)
- Save is disabled / hidden in static Storybook build
- Replacements are exact string matches within the file — safe because DS class strings are always quoted in CVA arrays or className strings
- Reset reverts table state and clears injected `<style>` tag
