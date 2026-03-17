# DS Platform Shell: Extract DS Content into Workspace Package

## Status: DEFERRED — needs deeper discussion on dynamic rendering

The design system viewer is evolving into a **reusable authoring platform** (shell) — like UIFork but for the full DS lifecycle (tokens, playground, versioning, graduation, compliance, Figma sync). To make the shell content-agnostic, we need to separate "shell" (the platform) from "content" (the user's DS components/tokens).

Currently everything is interleaved in one Next.js app. This plan extracts DS content into `packages/ds-core/` as an npm workspace package, establishing the boundary that enables the shell to be dropped into any repo.

**What this enables (future):** CLI scaffolding (`npx create-spaceship-ds`), config-driven content discovery, multi-brand DS support, installable shell.

### Open question (blocking implementation)

How should the shell **render** components from an external production repo at runtime? The viewer pages currently use static imports (`import { Button } from '@/components/ui'`). For the shell to work with any repo, it needs either:
1. **Config-driven generated pages** — graduation generates pages with imports from `config.importPath`
2. **Dynamic component registry** — auto-discovery + `React.lazy` / `next/dynamic` for arbitrary component paths
3. **Plugin/preset model** — like Storybook's CSF, where users write "stories" that the shell renders

This needs a deeper conversation before committing to an architecture.

### Reference: UIFork (comparable tool)
- https://github.com/sambernhardt/uifork
- File-based versioning (`Button.v1.tsx`, `Button.v2.tsx`)
- Watch server monitors filesystem for new versions
- Wrapper pattern with dynamic imports based on active version
- Our vision is bigger: full DS lifecycle (tokens, compliance, graduation, Figma sync)

---

## What Moves vs. What Stays

| Moves to `packages/ds-core/` | Stays in root (shell) |
|---|---|
| `components/ui/*.tsx` (18 components + barrel) | `components/viewer/`, `components/shadcn/`, `components/effects/` |
| `components/patterns/` (8 pattern files + barrel) | `tokens/colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `shadow.ts` (viewer display data) |
| `components/playground/` (experimental versions) | Viewer display portion of `tokens/motion.ts` |
| `styles/tokens.css` (CSS token definitions) | All `app/` pages (viewer routing/rendering) |
| `lib/utils.ts` (cn utility) | `lib/viewer-registry.ts`, `lib/playground-config.ts` (shell orchestration) |
| Runtime motion presets from `tokens/motion.ts` (springs, scales) | `app/actions/graduate.ts`, `scripts/generate-tokens.mjs` (shell tooling) |
| Animation CSS classes from `app/globals.css` (thinking, shimmer) | |

**Why playground + patterns move:** The shell is a reusable platform. Users store their explorations (playground experiments) and composition examples (patterns) alongside their DS components — it's all their content. The shell provides the engines (playground version switching, graduation pipeline, pattern rendering) but not the content itself.

---

## Package Structure

```
packages/ds-core/
  package.json              # manifest with exports map
  tsconfig.json             # no path aliases — relative imports only
  tsup.config.ts            # ESM, DTS, "use client" banner
  src/
    index.ts                # top-level barrel: components + patterns + cn + springs/scales
    components/             # ← from components/ui/
      *.tsx (18 files)
      index.ts              # component barrel
    patterns/               # ← from components/patterns/
      *.tsx (8 files)
      index.ts              # pattern barrel
    playground/             # ← from components/playground/
      index.ts              # playground barrel
      button/
        v1.tsx, v2.tsx
    lib/
      utils.ts              # cn() utility
    motion.ts               # runtime: springs, scales, SpringPreset, ScalePreset
    styles/
      tokens.css            # ← from styles/tokens.css
      animations.css        # ← extracted from app/globals.css lines 79-193
```

## Files to Modify (shell side)

| File | Changes |
|------|---------|
| `package.json` | Add `"workspaces": ["packages/*"]`, add `"@spaceship/ds-core": "workspace:*"` dependency |
| `tsconfig.json` | Add `@spaceship/ds-core` path alias for dev-time resolution |
| `app/globals.css` | Import CSS from `@spaceship/ds-core/styles/*`, add `@source` for package, remove inline animation CSS |
| `tokens/motion.ts` | Remove runtime exports (springs, scales), keep only viewer display data; import types from package |
| `lib/playground-config.ts` | Update imports from `@/components/playground/*` → `@spaceship/ds-core/playground/*`, update `importPath` strings |
| ~45 shell files | Rewrite `@/components/ui` → `@spaceship/ds-core`, `@/components/patterns` → `@spaceship/ds-core/patterns` |
| `app/actions/graduate.ts` | Write to `packages/ds-core/src/components/`, rewrite import paths in graduated source |
| `scripts/generate-tokens.mjs` | Update token CSS output path to `packages/ds-core/src/styles/tokens.css` |

## Deleted After Verification (Step 12)

| Path | Reason |
|------|---------|
| `components/ui/` (entire directory) | Moved to `packages/ds-core/src/components/` |
| `components/patterns/` (entire directory) | Moved to `packages/ds-core/src/patterns/` |
| `components/playground/` (entire directory) | Moved to `packages/ds-core/src/playground/` |
| `styles/tokens.css` | Moved to `packages/ds-core/src/styles/` |
| `styles/animations.css` | Moved to `packages/ds-core/src/styles/` |

---

## Implementation Steps

### Step 1: Prep — split `tokens/motion.ts`

Split into runtime (moves) and viewer display (stays):
- **Runtime exports** (`springs`, `scales`, `SpringPreset`, `ScalePreset`) → will be copied to `packages/ds-core/src/motion.ts`
- **Viewer display** (`durationTokens`, `easingTokens`, `MotionToken`, `springPresetTokens`, `scalePresetTokens`, `FramerMotionToken`) → stays in `tokens/motion.ts`
- Update `tokens/index.ts` barrel — keep re-exporting viewer display, remove runtime re-exports
- Update all `@/tokens` imports in DS components: those using only `springs`/`scales` don't need changing yet (will be rewritten in Step 5)

### Step 2: Prep — extract animation CSS

Move lines 79-193 from `app/globals.css` into a new `styles/animations.css` file.
Add `@import "../styles/animations.css"` to `app/globals.css` in place of the inline CSS.
Verify dev server — animations still work.

### Step 3: Create workspace package structure

1. Add `"workspaces": ["packages/*"]` to root `package.json`
2. Create `packages/ds-core/` directory structure (see Package Structure above)
3. Write `package.json`:
   - Name: `@spaceship/ds-core`
   - `"private": true` (internal for now)
   - `"type": "module"`
   - `exports`:
     - `"."` → `dist/index.js` (components + cn + springs/scales)
     - `"./patterns"` → `dist/patterns/index.js`
     - `"./playground/*"` → `dist/playground/*`
     - `"./styles"` → `src/styles/tokens.css`
     - `"./styles/animations.css"` → `src/styles/animations.css`
   - Dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `motion`, `react-markdown`, `react-use-measure`, `@dnd-kit/*`
   - Peer deps: `react`, `react-dom`
4. Write `tsconfig.json` (no path aliases, relative imports)
5. Write `tsup.config.ts` (ESM, DTS, `"use client"` banner, external react, multiple entry points: `src/index.ts`, `src/patterns/index.ts`)

### Step 4: Copy content into package

**Components:**
1. Copy all 18 `.tsx` files from `components/ui/` → `packages/ds-core/src/components/`
2. Copy `components/ui/index.ts` → `packages/ds-core/src/components/index.ts`

**Patterns:**
3. Copy all 8 `.tsx` files from `components/patterns/` → `packages/ds-core/src/patterns/`
4. Copy `components/patterns/index.ts` → `packages/ds-core/src/patterns/index.ts`

**Playground:**
5. Copy `components/playground/` → `packages/ds-core/src/playground/` (preserving directory structure)

**Supporting files:**
6. Copy `lib/utils.ts` → `packages/ds-core/src/lib/utils.ts`
7. Copy runtime half of `tokens/motion.ts` → `packages/ds-core/src/motion.ts`
8. Copy `styles/tokens.css` → `packages/ds-core/src/styles/tokens.css`
9. Move `styles/animations.css` → `packages/ds-core/src/styles/animations.css`

### Step 5: Rewrite imports inside package

**Component files (18 files):**
- `import { cn } from '@/lib/utils'` → `import { cn } from '../lib/utils'`
- `import { springs } from '@/tokens'` → `import { springs } from '../motion'`
- `import { springs, scales } from '@/tokens'` → `import { springs, scales } from '../motion'`
- Internal `./sibling` imports stay as-is

**Pattern files (8 files):**
- `import { Button } from '@/components/ui'` → `import { Button } from '../components'`
- `import { cn } from '@/lib/utils'` → `import { cn } from '../lib/utils'`
- `import { springs } from '@/tokens'` → `import { springs } from '../motion'`
- Pattern cross-references (`from './PreviewPanelHeader'`) stay as-is
- `ArtifactContentRenderer.tsx` imports from `@/app/patterns/_shared/artifactData` — this is a **shell→content cross-boundary import**. Move `artifactData.ts` types into the package or use a shared type file.

**Playground files:**
- `import { cn } from '@/lib/utils'` → `import { cn } from '../../lib/utils'`
- `import { springs, scales } from '@/tokens'` → `import { springs, scales } from '../../motion'`

Create top-level barrel `packages/ds-core/src/index.ts`:
```ts
export * from './components';
export { cn } from './lib/utils';
export { springs, scales } from './motion';
export type { SpringPreset, ScalePreset } from './motion';
```

Create `packages/ds-core/src/patterns/index.ts` (mirror of current `components/patterns/index.ts`).

Build: `cd packages/ds-core && npx tsup` — verify `dist/` output.

### Step 6: Link workspace + add path alias

1. Add to root `package.json` dependencies: `"@spaceship/ds-core": "workspace:*"`
2. Run `npm install`
3. Add to root `tsconfig.json` paths:
   ```json
   "@spaceship/ds-core": ["./packages/ds-core/src/index.ts"],
   "@spaceship/ds-core/*": ["./packages/ds-core/src/*"]
   ```

### Step 7: Rewire CSS imports

Update `app/globals.css`:
```css
@import "tailwindcss";
@import "@spaceship/ds-core/styles/tokens.css";
@import "@spaceship/ds-core/styles/animations.css";

@source "../packages/ds-core/src/**";
@source not "../.claude/**";
@source not "../docs/**";
@source not "../CLAUDE.md";
@source not "../.worktrees/**";
```

Remove old `@import "../styles/tokens.css"` and the animation CSS (already extracted in Step 2).

### Step 8: Add temporary bridge re-exports

To allow incremental import migration:

`components/ui/index.ts` → `export * from '@spaceship/ds-core';`
`components/patterns/index.ts` → `export * from '@spaceship/ds-core/patterns';`
`lib/utils.ts` → keep as-is (bridge: `cn` still importable from `@/lib/utils`)

This means both old and new import paths resolve during migration.

### Step 9: Rewire all shell imports

Batch rewrite across ~45 files:

| Directory | Files | Change |
|-----------|-------|--------|
| `app/components/[component]/` | ~20 page/demo files | `from '@/components/ui'` → `from '@spaceship/ds-core'` |
| `app/patterns/[pattern]/` | ~15 files | `from '@/components/ui'` → `from '@spaceship/ds-core'`; `from '@/components/patterns'` → `from '@spaceship/ds-core/patterns'` |
| `app/playground/[slug]/` | ~5 files | `from '@/components/ui'` → `from '@spaceship/ds-core'`; `from '@/components/patterns'` → `from '@spaceship/ds-core/patterns'` |
| `lib/playground-config.ts` | 1 file | `from '@/components/ui'` → `from '@spaceship/ds-core'`; `from '@/components/playground/*'` → `from '@spaceship/ds-core/playground/*'`; update `importPath` strings |
| `app/patterns/_shared/` | type imports | `from '@/components/ui'` → `from '@spaceship/ds-core'` |

Also update `tokens/motion.ts` viewer file to import types from the package:
```ts
import type { SpringPreset, ScalePreset } from '@spaceship/ds-core';
```

Pattern/playground page files that imported `springs` from `@/tokens`:
- `app/patterns/` files → `import { springs } from '@spaceship/ds-core'`
- `app/playground/` files → same

### Step 10: Update graduation pipeline

In `app/actions/graduate.ts`:
- Component target: `components/ui/{slug}.tsx` → `packages/ds-core/src/components/{slug}.tsx`
- Barrel target: `components/ui/index.ts` → `packages/ds-core/src/components/index.ts`
- Also update `packages/ds-core/src/index.ts` (top-level barrel re-export)
- **Import rewriting:** after copying source, rewrite `@/lib/utils` → `../lib/utils` and `@/tokens` → `../motion`
- Generated viewer page import path: already driven by `importPath` from config (updated in Step 9 to `@spaceship/ds-core`)
- Add DS package build step to `verifyGraduation`: `npm run --workspace=@spaceship/ds-core build` before `npm run build`

### Step 11: Update `generate-tokens.mjs`

Change token CSS output path:
- `styles/tokens.css` → `packages/ds-core/src/styles/tokens.css`

### Step 12: Cleanup

After full verification:
1. Delete `components/ui/` directory (moved to package)
2. Delete `components/patterns/` directory (moved to package)
3. Delete `components/playground/` directory (moved to package)
4. Delete `styles/tokens.css` (moved to package)
5. Delete `styles/animations.css` (moved to package)
6. Remove `app/patterns/_shared/artifactData.ts` if types were moved to package
7. Update root `npm run dev` script to also watch DS package: `"dev": "npm run --workspace=@spaceship/ds-core dev & next dev"`

---

## Key Design Decisions

- **No config file yet.** Premature — there's one consumer. The workspace reference IS the config. Add `spaceship.config.ts` when the shell becomes installable.
- **CSS shipped as raw source** (not bundled by tsup). Consuming app's Tailwind/PostCSS processes it. Standard pattern for Tailwind component libraries.
- **`"use client"` banner in tsup output.** All DS components use hooks/motion — they must be client components.
- **Playground + patterns move to DS package.** They're user content (explorations + composition examples), not shell infrastructure. The shell provides the engines; the package holds the content.
- **Multiple entry points:** `@spaceship/ds-core` (components), `@spaceship/ds-core/patterns` (patterns), `@spaceship/ds-core/playground/*` (playground versions). Clean separation without barrel bloat.
- **Bridge re-exports** during migration prevent a big-bang. Old paths still work while we migrate incrementally.
- **`artifactData` types** — the pattern `ArtifactContentRenderer` currently imports from `@/app/patterns/_shared/artifactData`. This type definition moves into the DS package since it's needed by a pattern component.

---

## Verification

1. `cd packages/ds-core && npm run build` — package builds with no errors, `dist/` has `index.js`, `index.d.ts`, `patterns/index.js`
2. `npm run build` (root) — full Next.js build passes with zero errors
3. `npm run lint` — no new lint errors from the migration
4. `npm run dev` — smoke test:
   - All component pages render correctly (imports from `@spaceship/ds-core` resolve)
   - Pattern pages compose DS components (imports from `@spaceship/ds-core/patterns` resolve)
   - Playground version switching works (`lib/playground-config.ts` finds playground components)
   - Dark mode toggle applies token overrides (CSS imports working)
   - ThinkingDots/ShimmerText animations play (animation CSS loaded from package)
5. Graduate a playground component → verify it writes to `packages/ds-core/src/components/`
6. Confirm no remaining `@/components/ui` or `@/components/patterns` or `@/components/playground` imports: `grep -r "from '@/components/ui'" app/ lib/ components/` should return nothing
