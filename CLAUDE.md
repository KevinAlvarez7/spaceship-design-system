# Spaceship Design System — Claude Context

## Project Summary

Design System Viewer built with Next.js 16.1 + Tailwind v4 + TypeScript.
Purpose: living style guide / component explorer, reusable across projects.
The viewer renders DS tokens and components in isolation; it is not a product UI.

---

## Key Commands

```bash
npm run dev        # start dev server
npm run build      # production build (run to verify changes)
npm run lint       # ESLint
node scripts/generate-tokens.mjs   # regenerate tokens from Figma export
```

---

## Architecture: Viewer / DS Separation (critical rule)

| Directory | Purpose | Styling rule |
|-----------|---------|--------------|
| `components/ui/` | DS components | CVA + CSS custom properties (`var(--token)`) ONLY |
| `components/viewer/` | Viewer chrome | Plain Tailwind zinc palette ONLY |
| `components/shadcn/` | Shadcn UI primitives | Viewer infrastructure — never referenced by DS components |
| `components/patterns/` | Pattern examples | Lives inside viewer; uses DS components |
| `components/playground/` | Playground components | CVA + tokens encouraged; relaxed DS enforcement |

**Hard rules:**
- DS tokens (`var(--color-*)`, `var(--space-*)`, etc.) only appear inside `<Preview>` wrappers or DS component internals.
- Viewer chrome (Sidebar, Topbar, layout) never uses DS tokens.
- DS components never import from `components/viewer/` or `components/shadcn/`.
- Playground items (`app/playground/`, `components/playground/`) use `route: 'playground'` and a `Playground *` section in the viewer registry. Confirmed items use their own routes.

---

## Component Conventions

- **Named exports only** — no default exports for DS components.
- All DS imports through the barrel: `import { Button } from "@/components/ui"`.
- Use **CVA** (`class-variance-authority`) for variants; `cn()` for class composition.
- Never hardcode hex values — always `var(--token-name)`.
- No `dark:` Tailwind variants — theming is handled via `[data-theme="dark"]` on `<html>`.
- **Tailwind v4 paren syntax** — `bg-(--token-name)` not `bg-[var(--token-name)]`.
- **Array syntax for base classes** — pass an array to `cva()` base, not a string.
- **`surface` variant** — every component that can appear on different backgrounds must have a `surface` variant (`default` / `shadow-border` at minimum).
- **`compoundVariants`** — use for multi-axis logic (e.g., `surface × state` or `surface × variant` border/shadow switching).
- **Motion pattern** — interactive components use `motion/react`; always accept a `disableMotion` prop.
- **Motion prop spread** — in `motion.*` elements, `{...props}` must come BEFORE explicit motion props (`initial`, `whileHover`, `whileTap`, `transition`) so component values always win.
- **Spring calibration** — keep damping ratio ζ ≥ 0.7 to avoid visible oscillation. Formula: `ζ = damping / (2 × √(stiffness))`. E.g., `{ stiffness: 400, damping: 30 }` → ζ = 0.75.
- **GPU layer promotion** — `motion.*` elements with scale animations need `style={{ willChange: 'transform' }}` to prevent text jitter from mid-animation layer promotion.
- **Icon pattern** — use `leadingIcon` / `trailingIcon` props + `ICON_CLASSES` record + `IconSlot` helper.
- **Section separators** — use `// ─── Name ──────...` (single em-dash line, padded to ~col 80) for sub-sections within a component block.
- **Multi-component files** — use `// ━━━ ComponentName — brief description ━━━...` (double thick line, padded to ~col 80) as a divider between major component blocks in a shared file.
- **Section order within a block** — Types → Constants → Helpers → Hooks → CVA → Props → Component. Group each component's CVA + Props + Component together; shared infra (constants, helpers) stays at the top of the file.
- **Helper docs** — add a one-line JSDoc comment above non-obvious helper functions (physics, math, animation).

---

## Mistakes to Avoid

<!-- Populated from git history and docs/plans/ corrections. Add new entries as they occur. -->

- Do not use Tailwind v3 bracket syntax (`bg-[var(--token)]`) — this project uses Tailwind v4 paren syntax (`bg-(--token)`). Every token reference in a component must use parens, not brackets.

- Do not use `text-[var(--font-size-*)]` for font size — `tailwind-merge` treats `text-*` as a color group and merges it incorrectly. Use the arbitrary property syntax `[font-size:var(--font-size-sm)]` or the v4 paren form `text-(length:--font-size-sm)` instead.

- Do not use `font-[var(--font-family-*)]` or `font-[var(--font-weight-*)]` — `tailwind-merge` collapses them. For font family, use `font-sans` (wired via `@theme`) or `font-(family-name:--font-family-secondary)`. For font weight, use `[font-weight:var(--font-weight-semibold)]`.

- Do not reference primitive tokens directly in components (`shadow-(--shadow-hard)`, `bg-(--orbit-blue-500)`) — always introduce a semantic token in `styles/tokens.css` and reference that instead.

- Do not re-declare a semantic token in the `[data-theme="dark"]` block if it already aliases a primitive via `:root` — the alias chain resolves automatically. Only override tokens whose dark-mode value differs from the light-mode alias.

- Do not use raw HTML `<input>` or `<button>` elements in demos or patterns when a DS component exists (`<ChatInputBox>`, `<Button>`, etc.) — patterns must compose from `@/components/ui` exclusively.

- Do not mark viewer page component functions `async` unless they actually await something — viewer page components are synchronous; the `async` keyword causes a React type mismatch.

- Do not use `style={{ color: 'var(--token)' }}` or any inline `style=` for token values — always use `className` with paren syntax instead.

- Do not render DS token content outside a `<Preview>` wrapper in viewer pages — DS tokens only appear inside `<Preview>` so theme isolation works correctly.

- Do not use the deleted button variants/surfaces (`outline`, `neo-brutalist`, `professional`) — the current canonical set is: variants `primary | secondary | ghost | success | destructive`; surfaces `default | shadow`.

- Do not omit `children?: React.ReactNode` from component interfaces that extend `HTMLMotionProps<'button'>` — React 19 no longer injects `children` implicitly through HTML element types.

- Do not spread `{...props}` AFTER explicit motion props (`whileHover`, `whileTap`, `transition`) in `motion.*` elements — spread props first so parent overrides can't accidentally clobber animation values. Correct order: `{...props}` then explicit motion props.

- Do not remove or mutate playground registry entries during graduation — graduation is a copy + promote operation. The playground entry (`pg-button`) and its versions must remain accessible after a version is graduated to `components/ui/`. Keep the playground entry intact and add a new confirmed entry alongside it.

---

## DS Enforcement Checklist

Run this checklist mentally before submitting any DS component or pattern.

### DS components (`components/ui/`)

- [ ] All colours, spacing, radius, shadow use semantic tokens (`var(--token)`) — no hardcoded hex, no Tailwind colour utilities (`text-white`, `bg-zinc-900`, etc.)
- [ ] Only semantic tokens used — never primitive tokens (`--orbit-blue-500`, `--neutral-200`)
- [ ] CVA base uses **array syntax**, not string concatenation
- [ ] Component has a `surface` variant (`default` / `shadow-border` at minimum)
- [ ] `compoundVariants` handle border/shadow switching across `surface × state/variant` axes
- [ ] Interactive components use `motion/react` with a `disableMotion` prop fallback
- [ ] `motion.*` elements spread `{...props}` before explicit motion props; use `willChange: 'transform'` on scale animations; spring damping ratio ≥ 0.7
- [ ] Icon props use `leadingIcon` / `trailingIcon` + `ICON_CLASSES` record + `IconSlot` helper
- [ ] Named export only; variants function also exported; both added to `components/ui/index.ts`
- [ ] No Tailwind colour utilities anywhere in the file
- [ ] No `dark:` prefix anywhere in the file; no imports from `components/viewer/` or `components/shadcn/`

### Patterns (`components/patterns/`)

- [ ] Composes exclusively from `@/components/ui` components — no raw HTML where a DS component exists
- [ ] Layout-only styles (gap, padding, flex, grid) use tokens via Tailwind v4 paren syntax
- [ ] No inline `style={{ ... }}` with hardcoded values
- [ ] No Tailwind colour utilities (`text-zinc-*`, `bg-white`, `border-gray-*`, etc.)

### Viewer exclusion

`components/viewer/` and `components/shadcn/` are exempt — they use plain Tailwind zinc palette intentionally.

---

## Token System

**Source of truth:** `styles/tokens.css`

Three-tier chain:
```
Primitive  →  Semantic  →  Component
(--orbit-blue-500)  (--text-interactive-default)  (--button-label-color)
```

- **Primitive tokens:** `--[scale]-[step]` (e.g., `--orbit-blue-500`, `--neutral-200`)
- **Semantic tokens:** `--[category]-[role]-[modifier]` (e.g., `--text-interactive-disabled`, `--bg-status-success`)
- **Spacing tokens:** `--spacing-[px]` where `[px]` is the pixel value (e.g., `--spacing-24` = 24px / 1.5rem). Add a new token if the value doesn't exist — never use `h-[2.25rem]` or `p-[16px]`.
- **Rule:** components use semantic tokens only — never reference primitives directly.
- **No hardcoded rem/px values** — add a spacing token to `styles/tokens.css` and `tokens/spacing.ts` if one doesn't exist.

TypeScript mirrors in `tokens/*.ts` (colors, spacing, typography, radius, shadow, motion) for viewer iteration and page generation.

**Spacing:** No custom `--spacing-*` CSS variables — use Tailwind's built-in spacing scale directly (`px-4`, `gap-3`, `w-0.5`, etc.). The `tokens/spacing.ts` file documents the scale for the viewer page but carries no CSS variable dependencies.

**Radius:** No custom `--radius-*` CSS variables — use Tailwind's built-in border-radius scale directly (`rounded-sm`, `rounded-xl`, `rounded-full`, etc.). The `tokens/radius.ts` file documents the scale for the viewer page but carries no CSS variable dependencies. Note: Tailwind's `rounded-3xl` = 24px (what was formerly `--radius-4xl`).

**Dark mode:** `[data-theme="dark"]` on `<html>` — only semantic tokens are overridden (not primitives).

**Tailwind v4 wiring:** `@theme` block in `app/globals.css` exposes tokens as Tailwind utilities.

**Token group naming in `tokens/*.ts`:** Use ` / ` (space-slash-space) as hierarchy separator.
Up to 3 levels: `"Background / Interactive / Primary"`.

---

## Figma Workflow

1. Use Figma MCP (`get_variable_defs`) to pull variable definitions.
2. Export to `/tmp/figma_vars.json`.
3. Run `node scripts/generate-tokens.mjs` to update `tokens/colors.ts`.
4. Review diff, then update `styles/tokens.css` with new semantic wiring.

**Naming convention:** Figma `color/action/primary` → CSS `--color-action-primary`.

---

## How to Extend

### Add a DS component
1. Create `components/ui/[name].tsx` (named export, CVA + CSS vars)
2. Export from `components/ui/index.ts`
3. Create `app/components/[name]/page.tsx` (viewer page)
4. Add entry to sidebar nav in `components/viewer/Sidebar.tsx`

### Add a token category
1. Add tokens to `styles/tokens.css`
2. Create `tokens/[name].ts` with typed definitions
3. Export from `tokens/index.ts`
4. Create `app/tokens/[category]/page.tsx`
5. Add entry to sidebar nav in `components/viewer/Sidebar.tsx`

### Add a token group to an existing category
1. Add CSS variable to `styles/tokens.css` (wire semantic → primitive)
2. Add group entry to `tokens/[category].ts` following the ` / ` naming convention
3. Verify in viewer — tree renders automatically from group name

---

## Skills Reference (auto-load)

Located in `.claude/skills/`. **Read the relevant skill file BEFORE starting work** when a task matches its trigger.

| Skill file | Trigger — read this skill when… |
|---|---|
| `.claude/skills/design-system-implementer/design-system-implementer.md` | Creating or modifying DS components, adding CVA variants, wiring tokens, refactoring styles into tokens, adding dark mode, or any task that turns design decisions into working code |
| `.claude/skills/design-system-explorer/design-system-explorer.md` | Auditing the design system, documenting tokens, planning component structure, writing a style guide, or exploring naming conventions |
| `.claude/skills/figma-to-code/figma-to-code.md` | A Figma URL appears, or the user says "build from Figma", "implement this design", "sync Figma", or mentions Figma variables/styles |
| `.claude/skills/graduate-component/graduate-component.md` | User says `/graduate`, "graduate component", "confirm as component", or wants to promote a playground version to `components/ui/` |

**How to auto-load:** Use the `Read` tool on the skill file path before proceeding with the task. Do not use the `Skill` tool — these are project-local files, not plugin skills.

---

## Design Docs Reference

| File | Purpose |
|------|---------|
| `docs/plans/2026-03-01-design-system-viewer-design.md` | Architecture decisions |
| `docs/plans/2026-03-01-design-system-viewer.md` | Implementation plan |
| `docs/plans/2026-03-02-semantic-color-hierarchy.md` | Semantic color hierarchy decisions |
| `docs/conventions.md` | Token naming, viewer hierarchy, extension conventions |

---

## Project Structure

```
spaceship-design-system/
├── app/
│   ├── globals.css          # @theme block wires tokens into Tailwind v4
│   ├── layout.tsx           # root layout (theme provider)
│   ├── page.tsx             # home / redirect
│   ├── components/          # DS component viewer pages
│   ├── tokens/              # token viewer pages (colors, spacing, etc.)
│   ├── typography/          # typography viewer page
│   └── patterns/            # pattern examples
├── components/
│   ├── ui/                  # DS components (CVA + CSS vars only)
│   │   └── index.ts         # barrel export
│   ├── viewer/              # Viewer chrome (Tailwind zinc only)
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── Preview.tsx      # wraps DS tokens in isolation
│   ├── shadcn/              # Shadcn UI (viewer infra only)
│   └── patterns/            # reusable pattern examples
├── styles/
│   └── tokens.css           # source of truth for all design tokens
├── tokens/                  # TypeScript mirrors of tokens (for viewer)
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── radius.ts
│   ├── shadow.ts
│   ├── motion.ts
│   └── index.ts
├── scripts/
│   └── generate-tokens.mjs  # Figma → tokens sync script
└── docs/
    ├── conventions.md
    └── plans/
```

---

## Before Marking Work Done

Run these checks before considering any DS component or pattern task complete:

1. `npm run build` — must pass with zero TypeScript errors
2. `npm run lint` — must pass with no new warnings
3. Mental checklist scan — re-read the DS Enforcement Checklist above and verify each item
4. Token audit — grep the changed files for hardcoded hex values and Tailwind colour utilities:
   `grep -n "#[0-9a-fA-F]\{3,6\}\|text-zinc\|bg-white\|border-gray\|text-white" [changed-file]`
5. If a component was added to `components/ui/` — confirm it's exported from `components/ui/index.ts`

---

## Feedback Loop

When a mistake is found (wrong syntax, broken convention, architectural violation):
1. Fix it
2. Add an entry to the **Mistakes to Avoid** section above — specific, actionable, Do/Don't format
3. If the mistake is about a pattern that appears in multiple files, grep for other occurrences before closing

This file is a living document. Every correction makes future sessions better.
