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

**Hard rules:**
- DS tokens (`var(--color-*)`, `var(--space-*)`, etc.) only appear inside `<Preview>` wrappers or DS component internals.
- Viewer chrome (Sidebar, Topbar, layout) never uses DS tokens.
- DS components never import from `components/viewer/` or `components/shadcn/`.

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
- **Icon pattern** — use `leadingIcon` / `trailingIcon` props + `ICON_CLASSES` record + `IconSlot` helper.

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
- **Rule:** components use semantic tokens only — never reference primitives directly.

TypeScript mirrors in `tokens/*.ts` (colors, spacing, typography, radius, shadow, motion) for viewer iteration and page generation.

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

## Skills Reference

Located in `.claude/skills/`:

| Skill | Use for |
|-------|---------|
| `design-system-implementer/` | Building tokens and CVA components |
| `design-system-explorer/` | Auditing and documenting the design system |
| `figma-to-code/` | Translating Figma designs to code via MCP |

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
