# Spaceship Design System — Claude Context

## Project Summary

Design System with Storybook documentation, built with Tailwind v4 + TypeScript + motion/react.
Purpose: living style guide / component explorer used for prototyping and designer sharing.
Storybook is the primary documentation and exploration tool.

---

## Key Commands

```bash
npm run storybook      # start Storybook dev server (port 6006)
npx storybook build    # build static Storybook to storybook-static/
npm run lint           # ESLint
node scripts/generate-tokens.mjs   # regenerate tokens from Figma export
```

---

## Architecture

| Directory | Purpose | Styling rule |
|-----------|---------|--------------|
| `components/ui/` | DS components | CVA + CSS custom properties (`var(--token)`) ONLY |
| `components/patterns/` | Pattern compositions | Composes from `@/components/ui` exclusively |
| `components/playground/` | Playground components | CVA + tokens encouraged; relaxed DS enforcement |
| `components/docs/` | Documentation helpers (swatches, asset cards, players) | Viewer-style Tailwind zinc palette |
| `components/docs/pages/` | Full-page doc components used by Storybook stories | Tailwind zinc palette + DS token display |
| `components/shadcn/` | Shadcn UI primitives (badge, tooltip) | Used only by `components/docs/` — never by DS components |
| `stories/` | Storybook story files | No styling — just composition |
| `styles/globals.css` | `@theme` block wires tokens into Tailwind v4 | Source imported by `.storybook/preview.ts` |
| `styles/tokens.css` | Source of truth for all design tokens | — |

**Hard rules:**
- DS components (`components/ui/`) never import from `components/docs/`, `components/shadcn/`, or `lib/`.
- Patterns (`components/patterns/`) compose exclusively from `@/components/ui`.
- Stories (`stories/`) never contain implementation logic — keep thin wrappers around real components.

---

## Component Conventions

- **Radix primitives** — always build DS components on top of `@radix-ui/react-*` primitives when a matching primitive exists (Dialog, Popover, Select, Tabs, Checkbox, etc.). This ensures accessible keyboard handling, focus management, and ARIA semantics out of the box.
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

- Do not use Tailwind v3 bracket syntax (`bg-[var(--token)]`) — this project uses Tailwind v4 paren syntax (`bg-(--token)`). Every token reference in a component must use parens, not brackets.

- Do not use `text-[var(--font-size-*)]` for font size — `tailwind-merge` treats `text-*` as a color group and merges it incorrectly. Use the arbitrary property syntax `[font-size:var(--font-size-sm)]` or the v4 paren form `text-(length:--font-size-sm)` instead.

- Do not use `font-[var(--font-family-*)]` or `font-[var(--font-weight-*)]` — `tailwind-merge` collapses them. For font family, use `font-sans` (wired via `@theme`) or `font-(family-name:--font-family-secondary)`. For font weight, use `[font-weight:var(--font-weight-semibold)]`.

- Do not reference primitive tokens directly in components (`shadow-(--shadow-hard)`, `bg-(--orbit-blue-500)`) — always introduce a semantic token in `styles/tokens.css` and reference that instead.

- Do not re-declare a semantic token in the `[data-theme="dark"]` block if it already aliases a primitive via `:root` — the alias chain resolves automatically. Only override tokens whose dark-mode value differs from the light-mode alias.

- Do not use raw HTML `<input>` or `<button>` elements in demos or patterns when a DS component exists (`<ChatInputBox>`, `<Button>`, etc.) — patterns must compose from `@/components/ui` exclusively.

- Do not use `style={{ color: 'var(--token)' }}` or any inline `style=` for token values — always use `className` with paren syntax instead.

- Do not use the deleted button variants/surfaces (`outline`, `neo-brutalist`, `professional`) — the current canonical set is: variants `primary | secondary | ghost | success | destructive`; surfaces `default | shadow`.

- Do not omit `children?: React.ReactNode` from component interfaces that extend `HTMLMotionProps<'button'>` — React 19 no longer injects `children` implicitly through HTML element types.

- Do not spread `{...props}` AFTER explicit motion props (`whileHover`, `whileTap`, `transition`) in `motion.*` elements — spread props first so parent overrides can't accidentally clobber animation values. Correct order: `{...props}` then explicit motion props.

- Do not import `HTMLMotionProps` noise into Storybook `argTypes` — always spread `EXCLUDE_MOTION_PROPS` from `stories/_helpers/motion-argtypes.ts` for motion components.

- Do not put implementation logic inside story files — stories should be thin wrappers. Only `useState` for controlled demos is acceptable. Any data, helpers, or mocks should live in `stories/_helpers/` or `lib/mocks/`.

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
- [ ] No `dark:` prefix anywhere in the file; no imports from `components/docs/` or `components/shadcn/`
- [ ] Story exists at `stories/ui/{ComponentName}.stories.tsx`

### Patterns (`components/patterns/`)

- [ ] Composes exclusively from `@/components/ui` components — no raw HTML where a DS component exists
- [ ] Layout-only styles (gap, padding, flex, grid) use tokens via Tailwind v4 paren syntax
- [ ] No inline `style={{ ... }}` with hardcoded values
- [ ] No Tailwind colour utilities (`text-zinc-*`, `bg-white`, `border-gray-*`, etc.)
- [ ] Story exists at `stories/patterns/{ComponentName}.stories.tsx`

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

TypeScript mirrors in `tokens/*.ts` (colors, spacing, typography, radius, shadow, motion) for doc page generation.

**Spacing:** No custom `--spacing-*` CSS variables — use Tailwind's built-in spacing scale directly (`px-4`, `gap-3`, `w-0.5`, etc.). The `tokens/spacing.ts` file documents the scale for the Spacing story page but carries no CSS variable dependencies.

**Radius:** No custom `--radius-*` CSS variables — use Tailwind's built-in border-radius scale directly (`rounded-sm`, `rounded-xl`, `rounded-full`, etc.). The `tokens/radius.ts` file documents the scale for the Radius story page but carries no CSS variable dependencies. Note: Tailwind's `rounded-3xl` = 24px.

**Dark mode:** `[data-theme="dark"]` on `<html>` — only semantic tokens are overridden (not primitives). Storybook theme toggle sets this attribute via `withThemeByDataAttribute`.

**Tailwind v4 wiring:** `@theme` block in `styles/globals.css` exposes tokens as Tailwind utilities.

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
3. Run `/add-story` to create `stories/ui/[ComponentName].stories.tsx`

### Add a token category
1. Add tokens to `styles/tokens.css`
2. Create `tokens/[name].ts` with typed definitions
3. Export from `tokens/index.ts`
4. Create `components/docs/pages/[Name]Page.tsx` (visualisation component)
5. Create `stories/foundations/[Name].stories.tsx` wrapping that page

### Add a token group to an existing category
1. Add CSS variable to `styles/tokens.css` (wire semantic → primitive)
2. Add group entry to `tokens/[category].ts` following the ` / ` naming convention
3. Verify in Storybook — the Foundations story renders automatically from the token data

### Add a pattern
1. Create `components/patterns/[Name].tsx`
2. Export from `components/patterns/index.ts`
3. Create `stories/patterns/[Name].stories.tsx`

---

## Skills Reference (auto-load)

Located in `.claude/skills/`. **Read the relevant skill file BEFORE starting work** when a task matches its trigger.

| Skill file | Trigger — read this skill when… |
|---|---|
| `.claude/skills/design-system-implementer/design-system-implementer.md` | Creating or modifying DS components, adding CVA variants, wiring tokens, refactoring styles into tokens, adding dark mode, or any task that turns design decisions into working code |
| `.claude/skills/design-system-explorer/design-system-explorer.md` | Auditing the design system, documenting tokens, planning component structure, writing a style guide, or exploring naming conventions |
| `.claude/skills/figma-to-code/figma-to-code.md` | A Figma URL appears, or the user says "build from Figma", "implement this design", "sync Figma", or mentions Figma variables/styles |
| `.claude/skills/graduate-component/graduate-component.md` | User says `/graduate`, "graduate component", "confirm as component", or wants to promote a playground version to `components/ui/` |
| `.claude/skills/add-story/add-story.md` | User says `/add-story`, "add a story", "create story for", or a new DS component was just created without a story |
| `.claude/skills/audit-stories/audit-stories.md` | User says `/audit-stories`, "check story coverage", "which components are missing stories" |
| `.claude/skills/ds-compliance/ds-compliance.md` | User says `/ds-compliance`, "check DS compliance", "lint this component", or wants token/style violations identified |

**How to auto-load:** Use the `Read` tool on the skill file path before proceeding with the task. Do not use the `Skill` tool — these are project-local files, not plugin skills.

---

## Design Docs Reference

| File | Purpose |
|------|---------|
| `docs/plans/2026-03-01-design-system-viewer-design.md` | Original architecture decisions |
| `docs/plans/2026-03-02-semantic-color-hierarchy.md` | Semantic color hierarchy decisions |
| `docs/plans/2026-03-31-storybook-migration-exploration.md` | Storybook migration exploration — trade-offs and rationale |
| `docs/conventions.md` | Token naming and extension conventions |

---

## Project Structure

```
spaceship-design-system/
├── .storybook/
│   ├── main.ts              # Storybook config (framework, addons, viteFinal)
│   ├── preview.ts           # global decorators, story sort, CSS import
│   └── preview-head.html    # Google Fonts <link> tags
├── stories/
│   ├── _helpers/
│   │   ├── motion-argtypes.ts   # EXCLUDE_MOTION_PROPS for motion components
│   │   └── mocks.ts             # shared mock data (artifacts, questions)
│   ├── foundations/         # Colors, Typography, Spacing, Radius, Shadow, Motion
│   ├── assets/              # Logo, Icons, Illustrations, Animations
│   ├── typography/          # Type Specimens
│   ├── ui/                  # one .stories.tsx per DS component
│   ├── patterns/            # one .stories.tsx per pattern component
│   └── playground/          # Button v1/v2, full-page flow stories
├── components/
│   ├── ui/                  # DS components (CVA + CSS vars only)
│   │   └── index.ts         # barrel export
│   ├── patterns/            # reusable pattern compositions
│   │   └── index.ts         # barrel export
│   ├── docs/                # documentation display components
│   │   ├── TokenSwatch.tsx
│   │   ├── ColorPaletteRow.tsx
│   │   ├── AssetCard.tsx + AssetGrid.tsx
│   │   ├── LucideIconCard.tsx
│   │   ├── AnimationPlayer.tsx + players/
│   │   ├── PropsTable.tsx
│   │   ├── ExperimentBadge.tsx
│   │   └── pages/           # full-page doc components (used by stories)
│   ├── shadcn/              # badge.tsx + tooltip.tsx (used by docs only)
│   └── playground/          # playground button versions
│       └── button/v1.tsx, v2.tsx
├── styles/
│   ├── globals.css          # @theme block wires tokens into Tailwind v4
│   └── tokens.css           # source of truth for all design tokens
├── tokens/                  # TypeScript mirrors of tokens (for doc pages)
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   ├── radius.ts
│   ├── shadow.ts
│   ├── motion.ts
│   └── index.ts
├── lib/
│   ├── utils.ts             # cn() helper
│   ├── buildSemanticTree.ts # semantic token tree builder (used by ColorPage)
│   └── mocks/               # mock data for playground demo pages
├── assets/                  # asset manifests (logos, illustrations, animations, icons)
├── scripts/
│   └── generate-tokens.mjs  # Figma → tokens sync script
└── docs/
    ├── conventions.md
    └── plans/
```

---

## Before Marking Work Done

Run these checks before considering any DS component or pattern task complete:

1. `npm run lint` — must pass with no new warnings
2. `npx storybook build` — must produce a clean static build
3. Mental checklist scan — re-read the DS Enforcement Checklist above and verify each item
4. Token audit — grep the changed files for hardcoded hex values and Tailwind colour utilities:
   `grep -n "#[0-9a-fA-F]\{3,6\}\|text-zinc\|bg-white\|border-gray\|text-white" [changed-file]`
5. If a component was added to `components/ui/` — confirm it's exported from `components/ui/index.ts`
6. If a component was added — confirm a story exists at `stories/ui/{ComponentName}.stories.tsx`

---

## Feedback Loop

When a mistake is found (wrong syntax, broken convention, architectural violation):
1. Fix it
2. Add an entry to the **Mistakes to Avoid** section above — specific, actionable, Do/Don't format
3. If the mistake is about a pattern that appears in multiple files, grep for other occurrences before closing

This file is a living document. Every correction makes future sessions better.
