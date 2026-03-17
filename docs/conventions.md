# Token & Viewer Conventions

Prescriptive guidance for adding tokens, creating viewer pages, and exporting from Figma. Follow these rules so the system stays consistent without needing manual coordination.

---

## Token Group Naming

### Delimiter

Use ` / ` (space-slash-space) as the hierarchy separator in `tokens/colors.ts` group names. The string is split on this exact delimiter by `buildSemanticTree` — whitespace matters.

```ts
// correct
group: 'Background / Interactive / Primary'

// wrong — no spaces around slash
group: 'Background/Interactive/Primary'
```

### Nesting levels

Up to three levels are supported:

| Depth | Example group name | Rendered as |
|-------|--------------------|-------------|
| 1 — parent | `"Text"` | `<h2>` |
| 2 — child | `"Text / Interactive"` | `<h3>` nested under Text |
| 3 — grandchild | `"Background / Interactive / Primary"` | `<h4>` nested under Interactive |

A group string with 4+ ` / ` segments is not handled — the extra segments are joined into the grandchild label. Avoid going deeper than 3.

### When to split vs. stay flat

Split a group when tokens fall into clear sub-categories. Keep it flat when there is no meaningful sub-grouping.

| Situation | Rule |
|-----------|------|
| Group has 8+ tokens with a natural sub-axis (status, role, state) | Split into children |
| Group has 3–6 homogeneous tokens | Keep flat |
| Group has no logical children (e.g., Overlay) | Keep flat — `"Overlay"` is fine |

**Example of a correct split:** The original `"Text"` group had 12 tokens. Because Interactive and Status tokens serve distinct purposes, it was split into `"Text"` (5 base tokens), `"Text / Interactive"` (3), and `"Text / Status"` (4).

### Empty parent nodes

A parent group can have zero direct tokens and exist only as a container for children. `buildSemanticTree` handles this correctly — only the `<h2>` heading renders, followed by indented children.

```ts
// "Background" has no top-level tokens of its own
{ group: 'Background / Status',   tokens: [...] }
{ group: 'Background / Surface',  tokens: [...] }
{ group: 'Background / Input',    tokens: [...] }
```

---

## Current Semantic Color Tree

Reference table of all groups in `tokens/colors.ts` and their position in the tree.

```
Text (5 tokens)
  ├ Interactive (3)
  └ Status (4)
Overlay (3 tokens)
Border (6 tokens)
  └ Input (2)
Background (0 tokens)
  ├ Status (5)
  ├ Surface (4)
  ├ Interactive (0)
  │   ├ Primary (4)
  │   ├ Secondary (4)
  │   ├ Success (4)
  │   ├ Error (4)
  │   └ Warning (4)
  ├ Input (1)
  └ Brand Surface (4)
```

**Notable edge cases:**
- `Background / Interactive` has zero direct tokens — only its grandchildren render.
- `Border` has both direct tokens (6) and a child group `Border / Input` (2); both render correctly.
- `Overlay` has no ` / ` delimiter and renders flat.

---

## Viewer Visual Hierarchy

These class names are applied in `app/tokens/[category]/ColorPage.tsx` and must stay in sync if the viewer is extended to other token categories.

| Level | Element | Tailwind classes |
|-------|---------|-----------------|
| 1 — parent | `<h2>` | `text-lg font-semibold text-zinc-900` |
| 2 — child | `<h3>` | `text-sm font-semibold text-zinc-700` |
| 3 — grandchild | `<h4>` | `text-xs font-semibold text-zinc-500 uppercase tracking-wide` |

Each nesting level wraps its content in:

```tsx
<div className="pl-4 border-l-2 border-zinc-100 ...">
```

This applies at both the child level (wrapping child token rows and grandchildren) and the grandchild level (wrapping grandchild token rows).

---

## Token Naming

### Semantic tokens (CSS variables)

Pattern: `--[category]-[role]-[modifier]`

```css
--text-primary
--text-interactive-disabled
--bg-interactive-primary-default
--bg-status-success
--border-input-focus
```

- **category**: `text`, `bg`, `border`, `overlay`
- **role**: describes the purpose (`interactive`, `status`, `surface`, `input`, `brand`)
- **modifier**: state or variant (`default`, `hover`, `pressed`, `disabled`, `primary`, `secondary`, `success`, `error`, `warning`, `info`)

### Primitive tokens (CSS variables)

Pattern: `--[scale]-[step]`

```css
--orbit-blue-500
--neutral-200
--lumen-yellow-700
```

### Spacing tokens (CSS variables)

Pattern: `--spacing-[px]` where `[px]` is the pixel value.

```css
--spacing-4    /* 4px  / 0.25rem */
--spacing-8    /* 8px  / 0.5rem  */
--spacing-16   /* 16px / 1rem    */
--spacing-24   /* 24px / 1.5rem  */
--spacing-36   /* 36px / 2.25rem */
--spacing-48   /* 48px / 3rem    */
```

Using the pixel value as the index makes every token self-documenting and allows inserting new values at any position without renaming collisions.

### Rule

**Never reference primitive tokens directly in components.** Components must use semantic tokens only. Primitives exist to back semantic tokens in `styles/tokens.css`.

---

## Component Creation Rules

Rules for authoring new files in `components/ui/` and `components/patterns/`. These supplement the checklist in `CLAUDE.md`.

### DS Components (`components/ui/`)

**Styling**
- All colours, spacing, radius, shadow must use semantic tokens — no hardcoded hex, no Tailwind colour utilities (`text-white`, `bg-zinc-900`, `border-gray-200`, etc.)
- Use Tailwind v4 **paren syntax**: `bg-(--bg-interactive-primary-default)` — NOT `bg-[var(--token)]`
- Only semantic tokens; never primitive tokens (`--orbit-blue-500`, `--neutral-200`) in component files
- **No hardcoded rem/px in Tailwind arbitrary values** — if a dimension doesn't have a spacing token, add one to `styles/tokens.css` and `tokens/spacing.ts` before using it. Never use `h-[2.25rem]` or `p-[16px]` — always `h-(--spacing-36)` or `p-(--spacing-16)`.

**CVA structure**
- Pass an **array** to `cva()` base — not a concatenated string
- Every component that renders on a background must include a `surface` variant (`default` / `shadow-border` at minimum)
- Use `compoundVariants` for any logic that depends on two variant axes simultaneously (e.g., `surface × state` border/shadow switching)

**Motion**
- Interactive components import from `motion/react`, not `framer-motion`
- Always accept a `disableMotion?: boolean` prop; fall back to a plain HTML element when true or when `disabled`

**Icons**
- Accept `leadingIcon` and `trailingIcon` props (type `ReactNode`)
- Use an `ICON_CLASSES` record keyed by size variant to auto-scale svg dimensions
- Render icons through an `IconSlot` helper component

**Exports**
- Named export only for the component — no default exports
- Export the CVA variants function (e.g., `buttonVariants`) for composition
- Add both to `components/ui/index.ts`

**Forbidden**
- No `dark:` prefix — theming is handled by `[data-theme="dark"]` on `<html>` via semantic token overrides
- No imports from `components/viewer/` or `components/shadcn/`

### Patterns (`components/patterns/`)

Patterns compose DS components — they are **not** DS components themselves.

- **Compose from DS components only** — import from `@/components/ui`; never recreate a component inline with raw HTML when a DS component exists
- **Tokens for layout** — gap, padding, and structural spacing may reference tokens via paren syntax: `gap-(--spacing-24)`
- **No hardcoded values** — no inline `style={{ color: '#...' }}` or `style={{ padding: '16px' }}`
- **No Tailwind colour utilities** — `text-zinc-*`, `bg-white`, `border-gray-*`, etc. are forbidden; use DS tokens instead

---

## Adding New Tokens

Follow these steps in order:

### 1. If sourcing from Figma

Run the generator script first to sync raw values:

```bash
node scripts/generate-tokens.mjs
```

This updates `tokens/colors.ts` with new primitive entries. Review the diff before continuing.

### 2. Add the group entry to `tokens/colors.ts`

Choose a group name following the naming rules above. Add it in a logical position (adjacent to related groups):

```ts
{
  group: 'Text / Link',
  tokens: [
    { name: 'text-link-default',  cssVar: '--text-link-default',  description: 'text / link / default' },
    { name: 'text-link-visited',  cssVar: '--text-link-visited',  description: 'text / link / visited' },
  ],
},
```

No changes to `buildSemanticTree` or `ColorPage` are needed — the tree renders automatically from the group name.

### 3. Add the CSS variable to `styles/tokens.css`

Wire the semantic token to a primitive:

```css
--text-link-default: var(--orbit-blue-500);
--text-link-visited: var(--cosmic-lilac-600);
```

### 4. Verify in the viewer

Run the dev server and open the Colors token page. Confirm the new group appears at the correct nesting level and the swatch resolves to the right color.

---

---

## Playground Rules

Playground (`app/playground/`, `components/playground/`) is a **relaxed** space for exploration. The goal is speed of iteration, not handoff quality.

### What's relaxed

- `surface` variant is optional — components don't need to handle multiple backgrounds
- `compoundVariants` not required — skip if the logic doesn't demand it
- `disableMotion` prop not required — motion can be hardwired
- Tailwind colour utilities (`text-zinc-*`, `bg-white`) are allowed in playground page files
- Layout may use inline `style={}` for one-off values that don't warrant new tokens

### What still applies

- No hardcoded hex values inside `components/playground/` barrel components (use tokens or Tailwind)
- `@/` absolute imports for DS components, effects, shared utilities — no relative `../../` leaks
- Named exports only — no default exports
- Every new playground entry must be registered in `lib/viewer-registry.ts` with `route: 'playground'` and the appropriate `Playground *` section

### File locations

| Concern | Location |
|---------|---------|
| Full-page playground demos | `app/playground/[slug]/` |
| Reusable playground components | `components/playground/` |
| Shared mock data and utilities | `app/patterns/_shared/` (shared with confirmed patterns) |

---

## Graduation Checklist

When a playground item is ready to become confirmed (handoff-ready), work through this list before moving it:

**Registry**
- [ ] Change `route` from `'playground'` to the target route (`'components'` or `'patterns'`)
- [ ] Change `section` from `'Playground *'` to `'Components'` or `'Patterns'`
- [ ] Remove `status: 'playground'` from the entry

**File migration**
- [ ] Move page file from `app/playground/[slug]/` to the appropriate route directory
- [ ] Move component file from `components/playground/` to `components/ui/`
- [ ] Export from `components/ui/index.ts`

**DS enforcement (components only)**
- [ ] All colours use semantic tokens — no Tailwind colour utilities, no hardcoded hex
- [ ] `surface` variant present (`default` / `shadow-border` at minimum)
- [ ] `compoundVariants` added for any multi-axis border/shadow logic
- [ ] `disableMotion` prop added to interactive components
- [ ] Motion prop spread order: `{...props}` before explicit motion props
- [ ] CVA base uses array syntax
- [ ] `willChange: 'transform'` on scale-animated elements

**Verification**
- [ ] `npm run build` passes with zero TypeScript errors
- [ ] `npm run lint` passes with no new warnings
- [ ] Token audit: no hardcoded hex or Tailwind colour utilities in changed files

---

## What This File Is Not

This file documents **how to follow the conventions** going forward. It is not a changelog. For the history of *why* these conventions were introduced, see:

- `docs/plans/2026-03-02-semantic-color-hierarchy.md`
