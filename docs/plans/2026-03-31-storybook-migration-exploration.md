# Exploration: Storybook Migration for Spaceship Design System

## Context

The custom Next.js viewer (~11,650 lines) overlaps significantly with Storybook's core features (sidebar, component previews, props tables, code snippets). The goal is to rebuild on top of Storybook 8/9 while preserving key custom features: auto-discovery, token visualization, multi-version playground, DS compliance checks, and theme isolation.

This is an **exploration document** — mapping current features to Storybook mechanisms, identifying risks, estimating effort, and exploring how Claude Code skills can accelerate the workflow on top of either approach.

---

## Build Your Own Viewer vs Storybook

### Custom Viewer (status quo)

| | |
|---|---|
| **Pro** | Total control — UI, layouts, token pages, playground, graduation all do exactly what you designed |
| **Pro** | Auto-discovery: zero story files needed; adding a file to `components/ui/` is enough |
| **Pro** | First-class DS concepts baked in: token hierarchy, semantic tree, spacing bars, motion presets |
| **Pro** | Tight Figma workflow integration (token sync, graduation pipeline) |
| **Pro** | Next.js server capabilities: server actions, async Server Components, Shiki at build time |
| **Pro** | No framework version risk — you control the upgrade path |
| **Con** | ~11,650 lines of viewer code to maintain, debug, and extend |
| **Con** | Every feature (a11y panel, viewport testing, visual regression) has to be built from scratch |
| **Con** | Cold onboarding — new devs don't recognize it |
| **Con** | PropsTable is hand-authored — no automation from TypeScript types |
| **Con** | No testing integration (interaction tests, Chromatic, etc.) |
| **Con** | Skills and automation are written from scratch (no Storybook community to draw on) |

### Storybook

| | |
|---|---|
| **Pro** | Removes ~11K lines of viewer chrome that you maintain today |
| **Pro** | Free addon ecosystem: a11y, viewport, measure, backgrounds, interactions, visual testing (Chromatic) |
| **Pro** | ArgTypes auto-generation from TypeScript (partial — CVA variants still need manual help) |
| **Pro** | Team familiarity — industry-standard tool |
| **Pro** | URL-based story state — deep links to specific prop combinations |
| **Pro** | Testing integration: `@storybook/test` for interaction tests |
| **Pro** | Active community, regular updates, Figma plugin (`storybook-addon-figma`) |
| **Con** | Requires a `.stories.tsx` per component — explicit file instead of auto-discovery |
| **Con** | CVA's `VariantProps` generic doesn't resolve via static analysis — variant argTypes are manual |
| **Con** | `HTMLMotionProps` from Framer Motion pollutes the Controls panel with hundreds of inherited props |
| **Con** | No server actions — graduation pipeline needs to be rebuilt as HTTP middleware in a preset |
| **Con** | No async Server Components — Shiki code blocks need a client-side alternative |
| **Con** | Next.js 16.1 + React 19 compatibility unverified (Storybook 8 targets Next.js 15) |
| **Con** | Tailwind v4 `@theme` block compatibility unverified in Storybook's build pipeline |
| **Con** | Token visualization, DS compliance, multi-version playground all need custom story files or addons |

### Verdict (general)

The custom viewer wins on **workflow features** (graduation, auto-discovery, token viz). Storybook wins on **maintenance and ecosystem** (no viewer chrome to maintain, free testing/a11y/viewport tooling). The migration makes sense if the maintenance burden outweighs the workflow loss — but the CVA + Next.js 16 + Tailwind v4 compatibility stack is an unknown risk that must be prototyped first before committing.

---

## Evaluation: Prototyping for Designers at Scale

The core value proposition is **prototyping for designers** — turning design ideas into interactive, testable components fast — and it needs to **scale** (more designers, more components, more projects, faster cycles).

### The designer prototyping workflow

```
Figma design → Code prototype → Tweak variants → Test interactions → Graduate to DS → Discover & reuse
     1              2                3                  4                   5              6
```

| Step | Custom Viewer | Storybook |
|------|--------------|-----------|
| 1. Figma → code | Figma MCP + `figma-to-code` skill | Figma MCP + `figma-to-code` skill (same) |
| 2. Code prototype | Playground: bare layout, full-page flows, real Next.js rendering | Story with `layout: 'fullscreen'` — iframe-based, no server components |
| 3. Tweak variants | Multi-version playground (v1/v2 pills), live code snippet, per-version controls | Separate story exports per version, Controls panel — flat, no grouping |
| 4. Test interactions | Nothing built-in — have to build from scratch | Free: `@storybook/test`, interaction testing, a11y addon, viewport addon |
| 5. Graduate to DS | One-click graduation pipeline (compliance, barrel, page gen, build verify) | Must rebuild as skill or addon |
| 6. Discover & reuse | Custom sidebar, auto-discovery, but unfamiliar to new designers | Industry-standard UI, search, deep links — designers already know it |

### What designers actually need vs what each tool provides

**For rapid prototyping (steps 1-3):** The custom viewer is stronger. The playground system was purpose-built for this — full-page bare layouts, multi-version comparison, real Next.js rendering (server components, real routing). Storybook renders in an iframe and can't do server components. For a designer sitting with a dev saying "try this variant," the custom playground is more fluid.

**For testing and validation (step 4):** Storybook is dramatically stronger. a11y checking, viewport testing, interaction tests, visual regression via Chromatic — all free. The custom viewer has none of this. For a DS that scales, these aren't nice-to-haves; they catch regressions before designers ship broken components.

**For promotion and quality (step 5):** The custom viewer is purpose-built for this. Graduation is uniquely yours. In Storybook, this becomes a skill or CLI tool — still automatable, but loses the in-UI experience.

**For discovery and adoption (step 6):** Storybook wins at scale. When you have 50+ components and multiple teams of designers, discoverability matters. Storybook's search, familiar UI, and deep-linkable story states make it easier for designers to find and understand components without training. The custom viewer requires onboarding.

### The scaling bottlenecks

As you scale, these are the things that break:

| Bottleneck | Custom Viewer | Storybook |
|-----------|--------------|-----------|
| **Onboarding new designers** | Must learn custom UI | Already know it |
| **Adding components** | Auto-discovery handles it (zero friction) | Need `.stories.tsx` per component (skill can automate) |
| **Quality at scale** | No a11y, no viewport, no visual regression — regressions slip through | Free addons catch issues automatically |
| **Multi-project reuse** | Viewer is tightly coupled to this repo | Storybook is standalone, composable across repos |
| **Designer self-service** | Playground is dev-centric (code snippets, CVA) | Controls panel is designer-friendly (dropdowns, toggles) |
| **Sharing prototypes** | Need the dev server running | `storybook build` → static site, share a URL |

### Recommendation for "prototyping for designers at scale"

**Use Storybook as the foundation, invest in skills to preserve the prototyping magic.**

Reasoning:
- Steps 4 and 6 (testing + discovery) are the scaling bottlenecks, and Storybook solves both for free
- Steps 2, 3, and 5 (prototype, tweak, graduate) are the custom viewer's strengths, but they can be preserved as **Claude Code skills** rather than in-UI features
- The graduation pipeline as a skill (`/graduate`) is actually more powerful than the in-UI version — it can be invoked from any context, composed with other skills, and doesn't require the viewer to be running
- The multi-version playground maps to Storybook stories (V1/V2 as separate stories) — less polished than custom version pills, but functional and designer-familiar
- **Static builds are critical for scale.** `storybook build` gives you a shareable URL with no dev server. Designers can review prototypes without local setup. The custom viewer requires `npm run dev`.

### What skills preserve from the custom viewer

The custom viewer's unique value collapses into 4 skills:

| Custom viewer feature | Becomes skill | Why it's better as a skill |
|----------------------|---------------|---------------------------|
| Graduation pipeline | `/graduate` | Works from any conversation, not just the viewer UI. Composable with `/figma-to-code`. |
| Auto-discovery | `/add-story` (auto-generates stories) | Run once per component. Same zero-friction, but the output is a standard `.stories.tsx` that Storybook understands. |
| DS compliance | `/ds-compliance` | Runs anytime, not just at graduation. Earlier feedback. Can be a lint rule too. |
| Multi-version playground | Storybook stories + `/add-story` | Less polished version pills, but designers already know the Storybook sidebar. |

### What skills ADD beyond either approach

Skills on top of Storybook create workflows that neither tool has alone:

- **`/prototype`** — "Take this Figma URL, generate the component AND story, open it in Storybook." End-to-end in one command.
- **`/iterate`** — "Create v2 of this component from a new Figma frame." Generates a new story variant alongside v1.
- **`/review-prototype`** — "Run a11y, viewport, and compliance checks on this story." Combines Storybook addons with DS-specific checks.
- **`/ship-component`** — "Graduate v2 to `components/ui/`, update barrel, run build, create PR." The graduation pipeline as a composable skill.

This is more powerful than either the custom viewer or vanilla Storybook because **skills compose** — a designer can go from Figma to a reviewed, graduated component in a single conversation.

---

## Current State: What We Have

| Area | Lines | Files | Key files |
|------|-------|-------|-----------|
| Viewer chrome | ~1,644 | 19 | `components/viewer/` (Sidebar, Topbar, Preview, ViewerShell, PropsTable, CodeBlock, ComponentPlayground, GraduateDialog, PropsPanel) |
| Viewer pages | ~8,913 | many | `app/components/`, `app/tokens/`, `app/patterns/`, `app/playground/`, `app/assets/` |
| Registry + libs | ~1,094 | 6 | `lib/viewer-registry.ts`, `lib/discover-components.ts`, `lib/playground-config.ts`, `lib/use-playground-state.ts` |

---

## Feature-by-Feature Migration Map

### 1. Theme Isolation — LOW effort

**Current:** `data-theme` attribute on `<html>`, viewer chrome uses zinc palette, DS uses tokens only, `<Preview>` wrapper provides isolation.

**Storybook:** Use `@storybook/addon-themes` with `withThemeByDataAttribute`:
```ts
// .storybook/preview.ts
import { withThemeByDataAttribute } from '@storybook/addon-themes';
export const decorators = [
  withThemeByDataAttribute({
    themes: { light: 'light', dark: 'dark' },
    defaultTheme: 'light',
    attributeName: 'data-theme',
    parentSelector: 'html',
  }),
];
```

Storybook's iframe architecture **automatically** isolates Manager UI (sidebar/toolbar) from DS tokens in the Preview. This is actually stricter isolation than what we have today.

Import `styles/tokens.css` and `app/globals.css` in `.storybook/preview.ts` so DS components render correctly.

**Preview wrapper decorator** replaces the dot-grid `<Preview>` component:
```tsx
export const withPreviewWrapper = (Story) => (
  <div className="relative min-h-32 p-8 bg-white [background-image:radial-gradient(circle,_#d4d4d8_1px,_transparent_1px)] [background-size:20px_20px]">
    <div className="flex flex-wrap items-center gap-4 h-full justify-center">
      <Story />
    </div>
  </div>
);
```

**Custom addon needed:** No.

---

### 2. Token Visualization Pages — LOW effort

**Current:** 6 token pages (Color, Spacing, Radius, Shadow, Motion, Typography) reading from TypeScript token mirrors in `tokens/*.ts`. Custom components: `TokenSwatch`, `ColorPaletteRow`, `buildSemanticTree`.

**Storybook:** Create MDX docs-only pages or CSF docs-only stories:
```tsx
// docs/foundations/Colors.stories.tsx
export default { title: 'Foundations/Colors', tags: ['docs-only'] };
export const Page = () => <ColorPage />;
```

The existing React visualization components (`ColorPage`, `SpacingPage`, etc.) are **fully portable** — they're self-contained components that read from TypeScript mirrors. Zero modifications needed.

Sidebar ordering via `.storybook/main.ts`:
```ts
sidebar: { order: ['Foundations', 'Assets', 'Typography', 'Components', 'Patterns', 'Playground'] }
```

**Custom addon needed:** No.

---

### 3. Asset Management — LOW effort

**Current:** `AssetGrid` + `AssetCard` with light/dark toggle, SVG copy, download, tags. `LucideIconCard` for icon display.

**Storybook:** Render existing components as stories. They use plain Tailwind zinc and `navigator.clipboard` — works in Storybook's preview iframe out of the box.

Configure `staticDirs: ['../public']` in `.storybook/main.ts` to serve asset files.

**Custom addon needed:** No.

---

### 4. Bare Layout Mode — LOW effort

**Current:** `layout: 'bare'` pages bypass Topbar for full-page flow compositions (Homepage, Prototype Workspace, etc.).

**Storybook:** `parameters: { layout: 'fullscreen' }` on the story. For truly chrome-free rendering, use Storybook's `layoutCustomisations` API to hide sidebar/toolbar for tagged stories.

**Custom addon needed:** No.

---

### 5. Component Stories (replacing auto-discovery) — MEDIUM effort

**Current:** `discover-components.ts` scans `components/ui/` at build time and auto-generates sidebar entries without manual files.

**Storybook:** Write one `.stories.tsx` per component. This is the standard Storybook pattern. The auto-discovery "magic" is traded for explicit story files, but:
- Story files are the natural place to define `argTypes`, decorators, and multiple story variants
- A future graduation pipeline could generate story files as output
- Storybook's sidebar auto-title infers hierarchy from file paths

**One-time migration cost:** ~22 story files for existing `components/ui/` components + ~10 for patterns.

**Alternative (not recommended):** Storybook's `experimental_indexers` API could replicate auto-discovery, but it's unstable, poorly documented, and requires CSF transpilation at build time.

**Custom addon needed:** No.

---

### 6. Props Tables (auto-generated) — MEDIUM effort

> This is one of the biggest wins of the migration — replacing ~hundreds of lines of manual `PropsTable` definitions with auto-generated docs.

**Current:** Manually authored `PropsTable` with hand-typed `PropRow` arrays.

**Storybook:** `@storybook/addon-docs` auto-generates ArgTypes from TypeScript types via `react-docgen-typescript`.

**The CVA problem:** `VariantProps<typeof buttonVariants>` is a complex generic that static analysis cannot resolve. Variant props (`variant`, `size`, `surface`) will NOT auto-generate.

**Hybrid approach:**
1. Use `react-docgen-typescript` for basic props (`className`, `children`, `disabled`, `disableMotion`)
2. Manually specify CVA variant argTypes per story file
3. Optionally build a helper that extracts variant options from CVA configs programmatically
4. Add JSDoc comments to prop interfaces for auto-generated descriptions
5. Filter inherited `HTMLMotionProps` noise with `argTypes` exclusion patterns

**Custom addon needed:** No (just configuration + manual argTypes).

---

### 7. Multi-Version Playground — MEDIUM effort

**Current:** `PlaygroundComponentConfig` with `versions: PlaygroundVersion[]`, version pill switcher, per-version controls via `PropsPanel`, localStorage-backed state, code snippet generation.

**Storybook:** Each version becomes a separate named story export:
```tsx
// components/playground/button/Button.stories.tsx
export const V1: Story = {
  render: (args) => <ButtonV1 {...args}>Button</ButtonV1>,
  argTypes: { /* v1-specific controls */ },
  parameters: { playground: { version: 'v1', sourcePath: '...' } },
};
export const V2: Story = {
  render: (args) => <ButtonV2 {...args}>Button</ButtonV2>,
  argTypes: { /* v2-specific controls */ },
  parameters: { playground: { version: 'v2', sourcePath: '...' } },
};
```

Storybook's sidebar naturally shows V1/V2 as child stories — the sidebar IS the version switcher.

**What's lost:**
- `PropsPanel` grouped controls layout (Storybook Controls panel is flat, though `argTypes` categories help)
- localStorage persistence of control state (Storybook doesn't persist across sessions)
- Custom code snippet format (Storybook's auto-generated source differs from the current `generateCodeSnippet`)

**Custom addon needed:** No for basic functionality. Small panel addon if you want custom code snippets or graduation button integration.

---

### 8. DS Compliance Checks — LOW-MEDIUM effort

**Current:** Built into the graduation action. Regex-based checks for hardcoded hex, Tailwind color utilities, primitive token references, `dark:` prefixes, forbidden imports.

**Storybook:** Extract compliance checks into a **standalone ESLint plugin** that runs independently. This is actually better than the current approach — you get feedback at lint time rather than only at graduation time. The compliance logic is portable regex patterns over source text.

**Custom addon needed:** No — becomes an ESLint plugin instead.

---

## Technical Risks

### 1. Next.js 16.1 + React 19 Compatibility
The project uses bleeding-edge Next.js 16.1 and React 19.2.3. Storybook 8 officially supports Next.js 15. Storybook 9 (June 2025) targets React 19 but has known module resolution issues. **Must verify** that `@storybook/nextjs` or `@storybook/nextjs-vite` works with Next.js 16.1.

### 2. Tailwind v4 Support
Tailwind v4's `@theme` block and paren syntax (`bg-(--token)`) need correct PostCSS processing in Storybook's build. Verify `@tailwindcss/postcss` integrates with Storybook's Vite/Webpack config.

### 3. Motion/React (Framer Motion)
Components use `motion/react` (v12). Renders fine in iframes, but `HTMLMotionProps` inheritance pollutes ArgTypes with hundreds of props. Needs aggressive filtering.

### 4. Shiki Server Components
Current `CodeBlock` uses async Server Components with Shiki. Storybook's code blocks use their own syntax highlighting. The custom `CodeBlock` component would need to be replaced or adapted to run client-side.

---

## Migration Phases

| Phase | Scope | Effort | Dependencies |
|-------|-------|--------|--------------|
| **1. Foundation** | `.storybook/` config, Tailwind v4 + token CSS, theme decorator, sidebar ordering, static dirs | 1-2 weeks | Verify Next.js 16 + Tailwind v4 compat |
| **2. Token + Asset Pages** | Migrate 6 token pages + 4 asset pages as docs-only stories | 1 week | Phase 1 |
| **3. Component Stories** | Write ~22 `.stories.tsx` for `components/ui/`, ~10 for patterns. Configure argTypes for CVA. | 2-3 weeks | Phase 1 |
| **4. Playground Stories** | Migrate playground configs to per-version story files | 1-2 weeks | Phase 3 |
| **5. Decommission** | Remove old viewer chrome, registry, discovery system. Keep `components/ui/` and `components/patterns/` untouched. | 1 week | Phase 4 |

**Total: ~6-9 weeks** for one developer.

---

## What Gets Deleted vs Kept

### Deleted (viewer-specific code)
- `components/viewer/` — Sidebar, Topbar, ViewerShell, Preview, PropsTable, CodeBlock, ComponentPlayground, PropsPanel, GraduateDialog
- `lib/viewer-registry.ts`, `lib/discover-components.ts`, `lib/playground-config.ts`, `lib/use-playground-state.ts`
- All viewer page files in `app/components/`, `app/tokens/`, `app/patterns/`, `app/playground/`, `app/assets/`

### Kept (DS core — untouched)
- `components/ui/` — all DS components
- `components/patterns/` — all pattern compositions
- `components/playground/` — playground component versions
- `styles/tokens.css` — token source of truth
- `tokens/*.ts` — TypeScript token mirrors
- `app/globals.css` — Tailwind v4 `@theme` wiring

### Repurposed (viewer components used in Storybook)
- `components/viewer/TokenSwatch.tsx`, `ColorPaletteRow.tsx` — used inside docs-only stories
- `components/viewer/AssetCard.tsx`, `AssetGrid.tsx`, `LucideIconCard.tsx` — used inside asset stories
- Token page components (`ColorPage`, `SpacingPage`, etc.) — rendered inside docs-only stories

---

## What Storybook Gives You For Free

- **Addon ecosystem:** a11y, viewport, interactions, visual testing, backgrounds, measure
- **Auto-generated docs:** ArgTypes from TypeScript (partial — CVA needs manual help)
- **Controls panel:** Interactive prop manipulation without custom `PropsPanel`
- **Search:** Built-in story search
- **Keyboard navigation:** Built-in
- **URL-based state:** Deep links to specific stories with specific args
- **Testing integration:** `@storybook/test` for interaction tests, visual regression with Chromatic
- **Team familiarity:** Industry-standard tool

---

## Open Questions

1. **Storybook 8 vs 9?** Storybook 9 (June 2025) has better React 19 support but is newer. Need to test both with the current stack.
2. **Framework adapter:** `@storybook/nextjs` (Webpack) vs `@storybook/nextjs-vite`? Vite is faster but may have Tailwind v4 quirks.
3. **Keep Next.js app alongside Storybook?** The Next.js app currently serves as the viewer. After migration, do we keep `app/` for anything (landing page, deployment)?

---

## Skills Layer: Workflow Automation on Top of Storybook

Claude Code skills can replace or augment the custom automation that currently lives in the viewer (graduation pipeline, page generation, compliance checks). These work regardless of whether you use Storybook or the custom viewer.

### Skills That Already Exist (upgrade these)

| Skill | Current behavior | Upgraded behavior (Storybook) |
|-------|-----------------|-------------------------------|
| `add-component` | Creates `components/ui/[name].tsx` + viewer page | Also generates `[name].stories.tsx` with argTypes scaffold |
| `graduate-component` | Runs the graduation server action + generates Next.js page | Copies file to `components/ui/` + generates `.stories.tsx` + updates barrel |
| `figma-to-code` | Implements component from Figma URL | Same + auto-generates story with variants inferred from Figma |
| `design-system-implementer` | Implements DS component with CVA + tokens | Same + appends story scaffold at end |

### New Skills to Build

**`/add-story`** — Given a component name or file path, generate a complete `.stories.tsx`:
- Reads the component's CVA config and extracts variant options
- Scaffolds a story per variant group (Default, Sizes, Surfaces, Icons, Motion, Disabled)
- Wires argTypes for CVA variants manually (working around `VariantProps` limitation)
- Adds `disableMotion` toggle to all interactive stories
- Outputs the file alongside the component

**`/audit-stories`** — Scan `components/ui/` and report which components are missing stories or have incomplete argTypes. Useful after the initial migration to track coverage gaps.

**`/sync-tokens-to-storybook`** — After running `node scripts/generate-tokens.mjs` (Figma token sync), update the TypeScript mirrors AND verify the token pages in Storybook still render correctly. Replaces the manual step of checking the viewer after a token sync.

**`/ds-compliance`** — Run DS compliance checks (hardcoded hex, Tailwind color utilities, primitive tokens, `dark:` prefixes, forbidden imports) on any file or directory. Previously baked into the graduation pipeline; now a standalone skill that can be called at any point.

**`/storybook-setup`** — For new projects starting fresh. Installs Storybook with the right configuration for this stack (Next.js + Tailwind v4 + CVA + motion/react), sets up `withThemeByDataAttribute`, imports token CSS, configures sidebar ordering, adds `react-docgen-typescript`, and filters motion prop noise. One command, zero config decisions.

### How Skills Make Storybook More Viable

The main friction with Storybook is the explicit story file requirement — you lose auto-discovery. Skills close this gap:

- **Creating a component?** `add-component` + `add-story` run together. Zero extra effort compared to auto-discovery.
- **Implementing from Figma?** `figma-to-code` generates both component and story in one shot.
- **Not sure what's missing?** `/audit-stories` shows the gaps in seconds.
- **Token sync?** `/sync-tokens-to-storybook` handles the verification step automatically.

The graduation pipeline's most valuable parts (compliance checks, barrel update, story/page generation) all become skills — meaning they work from any Claude Code conversation, not just inside the viewer UI.

---

## Verification

After migration:
1. Every component in `components/ui/` has a `.stories.tsx` with working Controls
2. Theme toggle switches light/dark correctly in Storybook toolbar
3. All 6 token visualization pages render with correct data
4. Asset gallery pages render with copy/download working
5. Playground stories show per-version controls
6. `npm run build` still passes (Next.js build for the DS package itself)
7. Storybook builds cleanly: `npx storybook build`
