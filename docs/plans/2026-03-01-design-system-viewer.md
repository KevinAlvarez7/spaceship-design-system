# Design System Viewer — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Scaffold a reusable Design System Viewer app (Next.js 15 + Tailwind v4) with a stable Shadcn/Tailwind viewer chrome, token CSS foundation, four initial DS components, and routes for tokens, typography, components, and patterns.

**Architecture:** Viewer chrome (sidebar, topbar, token tables, code blocks) uses plain Tailwind + Shadcn UI and never references DS CSS custom properties. DS tokens live in `styles/tokens.css` and are only consumed inside `<Preview>` wrappers and `components/ui/` DS components. TypeScript token mirror files in `tokens/` let the viewer iterate over tokens to render swatches and tables without hardcoding.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v4 (`@theme` CSS-first config), TypeScript, class-variance-authority, clsx, tailwind-merge, Shadcn UI (viewer chrome only, installed to `components/shadcn/`), Shiki (syntax highlighting).

**Design doc:** `docs/plans/2026-03-01-design-system-viewer-design.md`

---

## Critical Rules (Read Before Any Task)

- `components/ui/` = the design system. Uses CSS custom properties only. Never uses Tailwind color utilities like `bg-blue-500`.
- `components/shadcn/` = Shadcn-generated viewer UI. Never referenced by DS components.
- `components/viewer/` = custom viewer chrome built on top of Shadcn. Never references DS tokens.
- DS tokens only appear inside `<Preview>` wrappers. The viewer shell must remain stable.
- All DS component variants use `var(--token-name)` — never hardcoded hex or raw Tailwind values.
- All DS component files use named exports, never default exports.
- All DS component imports go through the barrel (`components/ui/index.ts`).

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `app/layout.tsx`, `app/page.tsx` (via CLI)

**Step 1: Run create-next-app in the repo root**

```bash
npx create-next-app@latest . \
  --typescript \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias "@/*" \
  --no-tailwind
```

When prompted "would you like to use Tailwind CSS", say **No** — we install v4 manually in Task 2.
When asked about the existing directory, say **Yes** to proceed.

**Step 2: Verify the project structure was created**

```bash
ls -1
```

Expected output includes: `app/`, `components/`, `lib/`, `next.config.ts`, `package.json`, `tsconfig.json`.

**Step 3: Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: Next.js default page renders without errors. Stop the server (`Ctrl+C`).

**Step 4: Commit**

```bash
git init
git add package.json tsconfig.json next.config.ts app/ public/ .eslintrc.json .gitignore
git commit -m "feat: initialize Next.js 15 project"
```

---

## Task 2: Install and Configure Tailwind v4

**Files:**
- Create: `postcss.config.mjs`
- Modify: `app/globals.css`

**Step 1: Install Tailwind v4**

```bash
npm install tailwindcss @tailwindcss/postcss
```

**Step 2: Create postcss config**

Create `postcss.config.mjs`:

```js
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

**Step 3: Replace globals.css**

Replace the entire contents of `app/globals.css` with:

```css
@import "tailwindcss";
```

(We add `@theme` wiring in Task 6 after tokens are defined.)

**Step 4: Remove any existing tailwind.config.ts if present**

```bash
rm -f tailwind.config.ts tailwind.config.js
```

**Step 5: Verify Tailwind v4 is working**

In `app/page.tsx`, replace the contents with:

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100">
      <p className="text-2xl font-bold text-zinc-900">Tailwind v4 works</p>
    </main>
  );
}
```

Run `npm run dev` and verify the page renders with the zinc background and bold text. Stop the server.

**Step 6: Commit**

```bash
git add postcss.config.mjs app/globals.css app/page.tsx
git commit -m "feat: configure Tailwind CSS v4"
```

---

## Task 3: Install Core DS Dependencies

**Files:**
- Modify: `package.json` (via npm)
- Create: `lib/utils.ts`

**Step 1: Install CVA, clsx, tailwind-merge**

```bash
npm install class-variance-authority clsx tailwind-merge
```

**Step 2: Create the cn() utility**

Create `lib/utils.ts`:

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 4: Commit**

```bash
git add lib/utils.ts package.json package-lock.json
git commit -m "feat: add CVA, clsx, tailwind-merge and cn() helper"
```

---

## Task 4: Configure Shadcn UI for Viewer Chrome

Shadcn components will be installed to `components/shadcn/` (not `components/ui/`) to keep them separate from our design system components.

**Files:**
- Create: `components.json`
- Create: `components/shadcn/` (populated by CLI)

**Step 1: Initialize Shadcn**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Zinc**
- CSS variables: **Yes**
- Global CSS file: `app/globals.css`
- Tailwind config: (it will detect v4 automatically)
- Components alias: change to `@/components/shadcn`
- Utils alias: `@/lib/utils`

**Step 2: Verify components.json was created**

```bash
cat components.json
```

Confirm `"ui": "@/components/shadcn"` in the aliases section. If the CLI set it to `@/components/ui`, manually edit `components.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components/shadcn",
    "utils": "@/lib/utils",
    "ui": "@/components/shadcn",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Step 3: Add the Shadcn components needed for the viewer**

```bash
npx shadcn@latest add button badge separator scroll-area tooltip
```

These install to `components/shadcn/`.

**Step 4: Verify no conflicts with components/ui/**

```bash
ls components/
```

Expected: `shadcn/` exists. `ui/` does NOT exist yet (we create it in Task 8).

**Step 5: Commit**

```bash
git add components.json components/shadcn/ app/globals.css
git commit -m "feat: configure Shadcn UI for viewer chrome (isolated to components/shadcn/)"
```

---

## Task 5: Create Token CSS Foundation

This is the source of truth for all design system values. Placeholder values are neutral and will be replaced with Figma output later.

**Files:**
- Create: `styles/tokens.css`

**Step 1: Create the styles directory and tokens.css**

Create `styles/tokens.css`:

```css
/* ============================================================
   SPACESHIP DESIGN SYSTEM — TOKEN FOUNDATION
   Source of truth for all design decisions.
   Replace placeholder values with Figma token output.
   ============================================================ */

:root {
  /* ── Color Primitives ─────────────────────────────────────
     Raw palette values. Never reference these in components.
     ──────────────────────────────────────────────────────── */
  --blue-50:   #eff6ff;
  --blue-100:  #dbeafe;
  --blue-200:  #bfdbfe;
  --blue-400:  #60a5fa;
  --blue-500:  #3b82f6;
  --blue-600:  #2563eb;
  --blue-700:  #1d4ed8;

  --zinc-50:   #fafafa;
  --zinc-100:  #f4f4f5;
  --zinc-200:  #e4e4e7;
  --zinc-300:  #d4d4d8;
  --zinc-400:  #a1a1aa;
  --zinc-500:  #71717a;
  --zinc-600:  #52525b;
  --zinc-700:  #3f3f46;
  --zinc-800:  #27272a;
  --zinc-900:  #18181b;
  --zinc-950:  #09090b;

  --red-400:   #f87171;
  --red-500:   #ef4444;
  --red-600:   #dc2626;

  --green-400: #4ade80;
  --green-500: #22c55e;

  --yellow-400: #facc15;
  --yellow-500: #eab308;

  --white: #ffffff;

  /* ── Semantic: Color ──────────────────────────────────────
     Named roles. These are what components use.
     ──────────────────────────────────────────────────────── */

  /* Action */
  --color-action-primary:        var(--blue-500);
  --color-action-primary-hover:  var(--blue-600);
  --color-action-primary-active: var(--blue-700);

  /* Surface */
  --color-surface-base:    var(--zinc-50);
  --color-surface-raised:  var(--white);
  --color-surface-overlay: var(--white);
  --color-surface-sunken:  var(--zinc-100);

  /* Text */
  --color-text-primary:   var(--zinc-900);
  --color-text-secondary: var(--zinc-600);
  --color-text-muted:     var(--zinc-400);
  --color-text-disabled:  var(--zinc-300);
  --color-text-inverse:   var(--white);
  --color-text-on-action: var(--white);

  /* Border */
  --color-border-default: var(--zinc-200);
  --color-border-strong:  var(--zinc-300);
  --color-border-focus:   var(--blue-500);

  /* Feedback */
  --color-destructive:         var(--red-500);
  --color-destructive-hover:   var(--red-600);
  --color-success:             var(--green-500);
  --color-warning:             var(--yellow-500);

  /* ── Semantic: Typography ─────────────────────────────────
     Font decisions made once, used everywhere.
     Replace font-family values with your actual fonts.
     ──────────────────────────────────────────────────────── */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 0.9375rem;  /* 15px */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.375rem;   /* 22px */
  --text-2xl:  1.75rem;    /* 28px */
  --text-3xl:  2.25rem;    /* 36px */

  --font-regular:  400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  --leading-none:    1;
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;

  --tracking-tight:  -0.02em;
  --tracking-normal:  0em;
  --tracking-wide:    0.02em;
  --tracking-wider:   0.05em;

  /* ── Semantic: Spacing ────────────────────────────────────
     Base-4 scale. Use these for padding, gap, margin.
     ──────────────────────────────────────────────────────── */
  --space-0:  0;
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */

  /* ── Semantic: Shape ──────────────────────────────────────*/
  --radius-none: 0;
  --radius-sm:   0.25rem;   /* 4px */
  --radius-md:   0.375rem;  /* 6px */
  --radius-lg:   0.5rem;    /* 8px */
  --radius-xl:   0.75rem;   /* 12px */
  --radius-2xl:  1rem;      /* 16px */
  --radius-full: 9999px;

  /* ── Semantic: Elevation ──────────────────────────────────
     Layered shadows. Avoid single-value harsh shadows.
     ──────────────────────────────────────────────────────── */
  --shadow-none: none;
  --shadow-sm:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-md:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 2px 4px -1px rgba(0, 0, 0, 0.08),
    0px 4px 8px rgba(0, 0, 0, 0.06);
  --shadow-lg:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 4px 8px -2px rgba(0, 0, 0, 0.12),
    0px 12px 24px rgba(0, 0, 0, 0.08);
  --shadow-xl:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 8px 16px -4px rgba(0, 0, 0, 0.16),
    0px 24px 48px rgba(0, 0, 0, 0.12);

  /* ── Semantic: Motion ─────────────────────────────────────*/
  --duration-instant:  50ms;
  --duration-fast:     100ms;
  --duration-base:     200ms;
  --duration-slow:     300ms;
  --duration-slower:   500ms;

  --ease-linear:      linear;
  --ease-in:          cubic-bezier(0.4, 0, 1, 1);
  --ease-out:         cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out:      cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring:      cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ── Dark Mode ────────────────────────────────────────────────
   Override semantic tokens only. Primitives never change.
   Components need zero modifications — they inherit via chain.
   ─────────────────────────────────────────────────────────── */
[data-theme="dark"] {
  /* Surface */
  --color-surface-base:    var(--zinc-950);
  --color-surface-raised:  var(--zinc-900);
  --color-surface-overlay: var(--zinc-800);
  --color-surface-sunken:  #050505;

  /* Text */
  --color-text-primary:   var(--zinc-50);
  --color-text-secondary: var(--zinc-400);
  --color-text-muted:     var(--zinc-600);
  --color-text-disabled:  var(--zinc-700);

  /* Border */
  --color-border-default: var(--zinc-800);
  --color-border-strong:  var(--zinc-700);

  /* Shadows shift to lighter rings in dark mode */
  --shadow-sm:
    0px 0px 0px 1px rgba(255, 255, 255, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.4),
    0px 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md:
    0px 0px 0px 1px rgba(255, 255, 255, 0.06),
    0px 2px 4px -1px rgba(0, 0, 0, 0.5),
    0px 4px 8px rgba(0, 0, 0, 0.4);
  --shadow-lg:
    0px 0px 0px 1px rgba(255, 255, 255, 0.06),
    0px 4px 8px -2px rgba(0, 0, 0, 0.6),
    0px 12px 24px rgba(0, 0, 0, 0.5);
}
```

**Step 2: Commit**

```bash
git add styles/tokens.css
git commit -m "feat: add design token foundation (CSS custom properties)"
```

---

## Task 6: Wire Tokens into globals.css

**Files:**
- Modify: `app/globals.css`

**Step 1: Update globals.css to import tokens and wire @theme**

Replace `app/globals.css` with:

```css
@import "tailwindcss";
@import "../styles/tokens.css";

@theme {
  /* Colors — DS tokens wired into Tailwind utilities */
  --color-action-primary:        var(--color-action-primary);
  --color-action-primary-hover:  var(--color-action-primary-hover);
  --color-surface-base:          var(--color-surface-base);
  --color-surface-raised:        var(--color-surface-raised);
  --color-text-primary:          var(--color-text-primary);
  --color-text-secondary:        var(--color-text-secondary);
  --color-text-muted:            var(--color-text-muted);
  --color-border-default:        var(--color-border-default);
  --color-destructive:           var(--color-destructive);

  /* Typography */
  --font-sans: var(--font-family-base);
  --font-mono: var(--font-family-mono);

  /* Radius */
  --radius-sm:   var(--radius-sm);
  --radius-md:   var(--radius-md);
  --radius-lg:   var(--radius-lg);
  --radius-xl:   var(--radius-xl);
  --radius-full: var(--radius-full);
}

/* Base layer resets */
@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background-color: var(--color-surface-base);
    color: var(--color-text-primary);
    font-family: var(--font-family-base);
    font-size: var(--text-base);
    line-height: var(--leading-normal);
  }
}
```

**Step 2: Verify it compiles**

```bash
npm run build
```

Expected: build succeeds without Tailwind errors.

**Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: wire design tokens into Tailwind v4 @theme and base layer"
```

---

## Task 7: Create TypeScript Token Mirrors

These files mirror `tokens.css` as typed objects. The viewer iterates over them to render swatches and tables without hardcoding any values.

**Files:**
- Create: `tokens/colors.ts`
- Create: `tokens/typography.ts`
- Create: `tokens/spacing.ts`
- Create: `tokens/radius.ts`
- Create: `tokens/shadow.ts`
- Create: `tokens/motion.ts`
- Create: `tokens/index.ts`

**Step 1: Create tokens/colors.ts**

```ts
export type ColorToken = {
  name: string;
  cssVar: string;
  description?: string;
};

export const colorPrimitives: ColorToken[] = [
  { name: 'blue-50',    cssVar: '--blue-50' },
  { name: 'blue-100',   cssVar: '--blue-100' },
  { name: 'blue-200',   cssVar: '--blue-200' },
  { name: 'blue-400',   cssVar: '--blue-400' },
  { name: 'blue-500',   cssVar: '--blue-500' },
  { name: 'blue-600',   cssVar: '--blue-600' },
  { name: 'blue-700',   cssVar: '--blue-700' },
  { name: 'zinc-50',    cssVar: '--zinc-50' },
  { name: 'zinc-100',   cssVar: '--zinc-100' },
  { name: 'zinc-200',   cssVar: '--zinc-200' },
  { name: 'zinc-300',   cssVar: '--zinc-300' },
  { name: 'zinc-400',   cssVar: '--zinc-400' },
  { name: 'zinc-500',   cssVar: '--zinc-500' },
  { name: 'zinc-600',   cssVar: '--zinc-600' },
  { name: 'zinc-700',   cssVar: '--zinc-700' },
  { name: 'zinc-800',   cssVar: '--zinc-800' },
  { name: 'zinc-900',   cssVar: '--zinc-900' },
  { name: 'zinc-950',   cssVar: '--zinc-950' },
  { name: 'red-400',    cssVar: '--red-400' },
  { name: 'red-500',    cssVar: '--red-500' },
  { name: 'red-600',    cssVar: '--red-600' },
  { name: 'green-500',  cssVar: '--green-500' },
  { name: 'yellow-500', cssVar: '--yellow-500' },
];

export type SemanticColorGroup = {
  group: string;
  tokens: ColorToken[];
};

export const colorSemantic: SemanticColorGroup[] = [
  {
    group: 'Action',
    tokens: [
      { name: 'action-primary',        cssVar: '--color-action-primary',        description: 'Primary CTA, links, focus rings' },
      { name: 'action-primary-hover',  cssVar: '--color-action-primary-hover',  description: 'Hover state for primary action' },
      { name: 'action-primary-active', cssVar: '--color-action-primary-active', description: 'Pressed/active state' },
    ],
  },
  {
    group: 'Surface',
    tokens: [
      { name: 'surface-base',    cssVar: '--color-surface-base',    description: 'Page / app background' },
      { name: 'surface-raised',  cssVar: '--color-surface-raised',  description: 'Cards, popovers, raised elements' },
      { name: 'surface-overlay', cssVar: '--color-surface-overlay', description: 'Modals, dialogs' },
      { name: 'surface-sunken',  cssVar: '--color-surface-sunken',  description: 'Input backgrounds, inset areas' },
    ],
  },
  {
    group: 'Text',
    tokens: [
      { name: 'text-primary',   cssVar: '--color-text-primary',   description: 'Body text, headings' },
      { name: 'text-secondary', cssVar: '--color-text-secondary', description: 'Supporting text, labels' },
      { name: 'text-muted',     cssVar: '--color-text-muted',     description: 'Placeholders, captions' },
      { name: 'text-disabled',  cssVar: '--color-text-disabled',  description: 'Disabled state text' },
      { name: 'text-inverse',   cssVar: '--color-text-inverse',   description: 'Text on dark surfaces' },
      { name: 'text-on-action', cssVar: '--color-text-on-action', description: 'Text on action-primary backgrounds' },
    ],
  },
  {
    group: 'Border',
    tokens: [
      { name: 'border-default', cssVar: '--color-border-default', description: 'Default dividers, input borders' },
      { name: 'border-strong',  cssVar: '--color-border-strong',  description: 'Emphasized borders' },
      { name: 'border-focus',   cssVar: '--color-border-focus',   description: 'Focus ring color' },
    ],
  },
  {
    group: 'Feedback',
    tokens: [
      { name: 'destructive',       cssVar: '--color-destructive',       description: 'Error, delete, danger' },
      { name: 'destructive-hover', cssVar: '--color-destructive-hover', description: 'Hover on destructive' },
      { name: 'success',           cssVar: '--color-success',           description: 'Success states' },
      { name: 'warning',           cssVar: '--color-warning',           description: 'Warning states' },
    ],
  },
];
```

**Step 2: Create tokens/typography.ts**

```ts
export type TypographyToken = {
  name: string;
  cssVar: string;
  value: string;
};

export const fontFamilies: TypographyToken[] = [
  { name: 'base', cssVar: '--font-family-base', value: 'Inter, system-ui, sans-serif' },
  { name: 'mono', cssVar: '--font-family-mono', value: 'JetBrains Mono, monospace' },
];

export const fontSizes: TypographyToken[] = [
  { name: 'xs',   cssVar: '--text-xs',   value: '0.75rem / 12px' },
  { name: 'sm',   cssVar: '--text-sm',   value: '0.875rem / 14px' },
  { name: 'base', cssVar: '--text-base', value: '0.9375rem / 15px' },
  { name: 'lg',   cssVar: '--text-lg',   value: '1.125rem / 18px' },
  { name: 'xl',   cssVar: '--text-xl',   value: '1.375rem / 22px' },
  { name: '2xl',  cssVar: '--text-2xl',  value: '1.75rem / 28px' },
  { name: '3xl',  cssVar: '--text-3xl',  value: '2.25rem / 36px' },
];

export const fontWeights: TypographyToken[] = [
  { name: 'regular',  cssVar: '--font-regular',  value: '400' },
  { name: 'medium',   cssVar: '--font-medium',   value: '500' },
  { name: 'semibold', cssVar: '--font-semibold', value: '600' },
  { name: 'bold',     cssVar: '--font-bold',     value: '700' },
];

export const lineHeights: TypographyToken[] = [
  { name: 'none',    cssVar: '--leading-none',    value: '1' },
  { name: 'tight',   cssVar: '--leading-tight',   value: '1.25' },
  { name: 'snug',    cssVar: '--leading-snug',    value: '1.375' },
  { name: 'normal',  cssVar: '--leading-normal',  value: '1.5' },
  { name: 'relaxed', cssVar: '--leading-relaxed', value: '1.625' },
];

export const letterSpacings: TypographyToken[] = [
  { name: 'tight',  cssVar: '--tracking-tight',  value: '-0.02em' },
  { name: 'normal', cssVar: '--tracking-normal', value: '0em' },
  { name: 'wide',   cssVar: '--tracking-wide',   value: '0.02em' },
  { name: 'wider',  cssVar: '--tracking-wider',  value: '0.05em' },
];

export type TypeSpecimen = {
  name: string;
  label: string;
  className: string;
  sample: string;
};

export const typeSpecimens: TypeSpecimen[] = [
  {
    name: 'display',
    label: 'Display',
    className: 'text-[var(--text-3xl)] font-[var(--font-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]',
    sample: 'The quick brown fox',
  },
  {
    name: 'heading-xl',
    label: 'Heading XL',
    className: 'text-[var(--text-2xl)] font-[var(--font-bold)] leading-[var(--leading-tight)]',
    sample: 'Design systems scale quality',
  },
  {
    name: 'heading-lg',
    label: 'Heading LG',
    className: 'text-[var(--text-xl)] font-[var(--font-semibold)] leading-[var(--leading-snug)]',
    sample: 'Tokens, Components, Patterns',
  },
  {
    name: 'heading-md',
    label: 'Heading MD',
    className: 'text-[var(--text-lg)] font-[var(--font-semibold)] leading-[var(--leading-snug)]',
    sample: 'Consistent, scalable UI',
  },
  {
    name: 'body-base',
    label: 'Body Base',
    className: 'text-[var(--text-base)] font-[var(--font-regular)] leading-[var(--leading-normal)]',
    sample: 'The primary reading size. Used for paragraphs, descriptions, and most UI content.',
  },
  {
    name: 'body-sm',
    label: 'Body SM',
    className: 'text-[var(--text-sm)] font-[var(--font-regular)] leading-[var(--leading-normal)]',
    sample: 'Secondary body text. Form labels, supporting descriptions, sidebar content.',
  },
  {
    name: 'label',
    label: 'Label',
    className: 'text-[var(--text-sm)] font-[var(--font-medium)] leading-[var(--leading-normal)] tracking-[var(--tracking-wide)]',
    sample: 'Form label · UI label · Tag',
  },
  {
    name: 'caption',
    label: 'Caption',
    className: 'text-[var(--text-xs)] font-[var(--font-regular)] leading-[var(--leading-normal)] text-[var(--color-text-muted)]',
    sample: 'Timestamp · Metadata · Fine print',
  },
  {
    name: 'mono',
    label: 'Mono',
    className: 'text-[var(--text-sm)] font-[var(--font-regular)] leading-[var(--leading-relaxed)] font-[family-name:var(--font-family-mono)]',
    sample: 'const token = "var(--color-action-primary)";',
  },
];
```

**Step 3: Create tokens/spacing.ts**

```ts
export type SpacingToken = {
  name: string;
  cssVar: string;
  remValue: string;
  pxValue: string;
};

export const spacingTokens: SpacingToken[] = [
  { name: 'space-0',  cssVar: '--space-0',  remValue: '0',       pxValue: '0px' },
  { name: 'space-1',  cssVar: '--space-1',  remValue: '0.25rem', pxValue: '4px' },
  { name: 'space-2',  cssVar: '--space-2',  remValue: '0.5rem',  pxValue: '8px' },
  { name: 'space-3',  cssVar: '--space-3',  remValue: '0.75rem', pxValue: '12px' },
  { name: 'space-4',  cssVar: '--space-4',  remValue: '1rem',    pxValue: '16px' },
  { name: 'space-5',  cssVar: '--space-5',  remValue: '1.25rem', pxValue: '20px' },
  { name: 'space-6',  cssVar: '--space-6',  remValue: '1.5rem',  pxValue: '24px' },
  { name: 'space-8',  cssVar: '--space-8',  remValue: '2rem',    pxValue: '32px' },
  { name: 'space-10', cssVar: '--space-10', remValue: '2.5rem',  pxValue: '40px' },
  { name: 'space-12', cssVar: '--space-12', remValue: '3rem',    pxValue: '48px' },
  { name: 'space-16', cssVar: '--space-16', remValue: '4rem',    pxValue: '64px' },
  { name: 'space-20', cssVar: '--space-20', remValue: '5rem',    pxValue: '80px' },
  { name: 'space-24', cssVar: '--space-24', remValue: '6rem',    pxValue: '96px' },
];
```

**Step 4: Create tokens/radius.ts**

```ts
export type RadiusToken = {
  name: string;
  cssVar: string;
  value: string;
};

export const radiusTokens: RadiusToken[] = [
  { name: 'none', cssVar: '--radius-none', value: '0' },
  { name: 'sm',   cssVar: '--radius-sm',   value: '4px' },
  { name: 'md',   cssVar: '--radius-md',   value: '6px' },
  { name: 'lg',   cssVar: '--radius-lg',   value: '8px' },
  { name: 'xl',   cssVar: '--radius-xl',   value: '12px' },
  { name: '2xl',  cssVar: '--radius-2xl',  value: '16px' },
  { name: 'full', cssVar: '--radius-full', value: '9999px' },
];
```

**Step 5: Create tokens/shadow.ts**

```ts
export type ShadowToken = {
  name: string;
  cssVar: string;
  description: string;
};

export const shadowTokens: ShadowToken[] = [
  { name: 'none', cssVar: '--shadow-none', description: 'No elevation' },
  { name: 'sm',   cssVar: '--shadow-sm',   description: 'Subtle depth. Inputs, inline elements.' },
  { name: 'md',   cssVar: '--shadow-md',   description: 'Cards, dropdowns, popovers.' },
  { name: 'lg',   cssVar: '--shadow-lg',   description: 'Dialogs, modals, floating panels.' },
  { name: 'xl',   cssVar: '--shadow-xl',   description: 'Commanding elevation. Full-screen overlays.' },
];
```

**Step 6: Create tokens/motion.ts**

```ts
export type MotionToken = {
  name: string;
  cssVar: string;
  value: string;
};

export const durationTokens: MotionToken[] = [
  { name: 'instant', cssVar: '--duration-instant', value: '50ms' },
  { name: 'fast',    cssVar: '--duration-fast',    value: '100ms' },
  { name: 'base',    cssVar: '--duration-base',    value: '200ms' },
  { name: 'slow',    cssVar: '--duration-slow',    value: '300ms' },
  { name: 'slower',  cssVar: '--duration-slower',  value: '500ms' },
];

export const easingTokens: MotionToken[] = [
  { name: 'linear',    cssVar: '--ease-linear',   value: 'linear' },
  { name: 'ease-in',   cssVar: '--ease-in',        value: 'cubic-bezier(0.4, 0, 1, 1)' },
  { name: 'ease-out',  cssVar: '--ease-out',       value: 'cubic-bezier(0, 0, 0.2, 1)' },
  { name: 'ease-in-out', cssVar: '--ease-in-out',  value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  { name: 'spring',    cssVar: '--ease-spring',    value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
];
```

**Step 7: Create tokens/index.ts**

```ts
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './shadow';
export * from './motion';
```

**Step 8: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 9: Commit**

```bash
git add tokens/
git commit -m "feat: add TypeScript token mirrors for viewer iteration"
```

---

## Task 8: Build Button DS Component

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/index.ts`

**Step 1: Create components/ui/button.tsx**

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base: structural and behavioral only. No colors, no token values.
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-[var(--font-medium)] transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--color-border-focus)]',
    'disabled:pointer-events-none disabled:opacity-50',
    'cursor-pointer select-none',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-[var(--color-action-primary)] text-[var(--color-text-on-action)]',
          'hover:bg-[var(--color-action-primary-hover)]',
          'active:bg-[var(--color-action-primary-active)]',
        ],
        secondary: [
          'bg-[var(--color-surface-sunken)] text-[var(--color-text-primary)]',
          'border border-[var(--color-border-default)]',
          'hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-border-strong)]',
        ],
        outline: [
          'border border-[var(--color-action-primary)] text-[var(--color-action-primary)]',
          'hover:bg-[var(--color-action-primary)] hover:text-[var(--color-text-on-action)]',
        ],
        ghost: [
          'text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-surface-sunken)]',
        ],
        destructive: [
          'bg-[var(--color-destructive)] text-[var(--color-text-inverse)]',
          'hover:bg-[var(--color-destructive-hover)]',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-[var(--text-sm)] rounded-[var(--radius-md)]',
        md: 'h-10 px-4 text-[var(--text-sm)] rounded-[var(--radius-md)]',
        lg: 'h-12 px-6 text-[var(--text-base)] rounded-[var(--radius-lg)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
```

**Step 2: Create components/ui/index.ts**

```ts
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';
```

**Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add components/ui/
git commit -m "feat: add Button DS component with CVA variants"
```

---

## Task 9: Build Input, Card, Badge DS Components

**Files:**
- Create: `components/ui/input.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/badge.tsx`
- Modify: `components/ui/index.ts`

**Step 1: Create components/ui/input.tsx**

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  [
    'w-full rounded-[var(--radius-md)] border',
    'bg-[var(--color-surface-sunken)] px-3',
    'text-[var(--color-text-primary)]',
    'placeholder:text-[var(--color-text-muted)]',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--color-border-focus)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'h-8  text-[var(--text-sm)]',
        md: 'h-10 text-[var(--text-sm)]',
        lg: 'h-12 text-[var(--text-base)]',
      },
      state: {
        default: 'border-[var(--color-border-default)] focus-visible:ring-[var(--color-border-focus)]',
        error:   'border-[var(--color-destructive)]    focus-visible:ring-[var(--color-destructive)]',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

export function Input({ className, size, state, ...props }: InputProps) {
  return (
    <input
      className={cn(inputVariants({ size, state }), className)}
      {...props}
    />
  );
}

export { inputVariants };
```

**Step 2: Create components/ui/card.tsx**

```tsx
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border border-[var(--color-border-default)]',
        'bg-[var(--color-surface-raised)] shadow-[var(--shadow-sm)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-[var(--space-1)] p-[var(--space-6)]', className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-[var(--text-lg)] font-[var(--font-semibold)] text-[var(--color-text-primary)]',
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-[var(--text-sm)] text-[var(--color-text-secondary)]', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-[var(--space-6)] pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center p-[var(--space-6)] pt-0', className)} {...props} />
  );
}
```

**Step 3: Create components/ui/badge.tsx**

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-[var(--radius-full)] px-2.5 py-0.5 text-[var(--text-xs)] font-[var(--font-medium)] transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]',
        primary:     'bg-[var(--color-action-primary)] text-[var(--color-text-on-action)]',
        secondary:   'bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]',
        destructive: 'bg-[var(--color-destructive)] text-[var(--color-text-inverse)]',
        outline:     'border border-[var(--color-action-primary)] text-[var(--color-action-primary)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
```

**Step 4: Update components/ui/index.ts**

```ts
export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

export { Input, inputVariants } from './input';
export type { InputProps } from './input';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';
```

**Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add components/ui/
git commit -m "feat: add Input, Card, Badge DS components"
```

---

## Task 10: Build Root Layout with Viewer Shell

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/viewer/Sidebar.tsx`
- Create: `components/viewer/Topbar.tsx`

**Step 1: Install lucide-react**

```bash
npm install lucide-react
```

**Step 2: Create components/viewer/Sidebar.tsx**

Plain Tailwind only — no DS tokens.

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
};

const NAV: NavItem[] = [
  {
    label: 'Foundations',
    children: [
      { label: 'Colors',      href: '/tokens/colors' },
      { label: 'Typography',  href: '/tokens/typography' },
      { label: 'Spacing',     href: '/tokens/spacing' },
      { label: 'Radius',      href: '/tokens/radius' },
      { label: 'Shadow',      href: '/tokens/shadow' },
      { label: 'Motion',      href: '/tokens/motion' },
    ],
  },
  {
    label: 'Typography',
    children: [
      { label: 'Specimens', href: '/typography' },
    ],
  },
  {
    label: 'Components',
    children: [
      { label: 'Button', href: '/components/button' },
      { label: 'Input',  href: '/components/input' },
      { label: 'Card',   href: '/components/card' },
      { label: 'Badge',  href: '/components/badge' },
    ],
  },
  {
    label: 'Patterns',
    children: [
      { label: 'Overview', href: '/patterns' },
    ],
  },
];

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.href ? pathname === item.href : false;

  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      className={cn(
        'block rounded-md px-3 py-1.5 text-sm transition-colors',
        isActive
          ? 'bg-zinc-100 text-zinc-900 font-medium'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
      )}
    >
      {item.label}
    </Link>
  );
}

function NavSection({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        {item.label}
        <ChevronRight className={cn('h-3 w-3 transition-transform', open && 'rotate-90')} />
      </button>
      {open && item.children && (
        <div className="mt-1 space-y-0.5">
          {item.children.map(child => (
            <NavLink key={child.href} item={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4">
        <span className="text-sm font-semibold text-zinc-900 tracking-tight">Spaceship DS</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {NAV.map(section => (
          <NavSection key={section.label} item={section} />
        ))}
      </nav>
    </aside>
  );
}
```

**Step 3: Create components/viewer/Topbar.tsx**

The toggle sets `data-theme` on `<html>`, which only affects DS tokens (inside `<Preview>` wrappers). The viewer chrome itself is plain Tailwind and never responds to this attribute.

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function Topbar({ title }: { title: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('ds-preview-theme') as 'light' | 'dark' | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ds-preview-theme', next);
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <h1 className="text-sm font-medium text-zinc-700">{title}</h1>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">Preview theme</span>
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors"
          aria-label="Toggle DS preview theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
```

**Step 4: Update app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/viewer/Sidebar';

export const metadata: Metadata = {
  title: 'Spaceship Design System',
  description: 'Living style guide and component explorer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-white">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
```

**Step 5: Update app/page.tsx to redirect**

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/tokens/colors');
}
```

**Step 6: Verify dev server**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: sidebar renders, page redirects to `/tokens/colors` (404 for now — fine). Stop server.

**Step 7: Commit**

```bash
git add app/ components/viewer/Sidebar.tsx components/viewer/Topbar.tsx package.json package-lock.json
git commit -m "feat: add viewer shell — sidebar nav, topbar theme toggle, root layout"
```

---

## Task 11: Build Preview Wrapper Component

**Files:**
- Create: `components/viewer/Preview.tsx`

**Step 1: Create components/viewer/Preview.tsx**

```tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Surface = 'white' | 'subtle' | 'dark';

const surfaces: Record<Surface, { label: string; className: string }> = {
  white:  { label: 'White',  className: 'bg-white' },
  subtle: { label: 'Subtle', className: 'bg-zinc-50' },
  dark:   { label: 'Dark',   className: 'bg-zinc-900' },
};

interface PreviewProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export function Preview({ children, className, label }: PreviewProps) {
  const [surface, setSurface] = useState<Surface>('white');

  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2">
        <span className="text-xs text-zinc-400">{label ?? 'Preview'}</span>
        <div className="flex items-center gap-1">
          {(Object.keys(surfaces) as Surface[]).map(s => (
            <button
              key={s}
              onClick={() => setSurface(s)}
              className={cn(
                'rounded px-2 py-1 text-xs transition-colors',
                surface === s
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200 font-medium'
                  : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              {surfaces[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* DS tokens are safe inside this boundary */}
      <div
        className={cn(
          'relative min-h-32 p-8',
          surfaces[surface].className,
          '[background-image:radial-gradient(circle,_#d4d4d8_1px,_transparent_1px)]',
          '[background-size:20px_20px]',
          className
        )}
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/viewer/Preview.tsx
git commit -m "feat: add Preview isolation wrapper with dot-grid and surface selector"
```

---

## Task 12: Build Viewer Utility Components

**Files:**
- Create: `components/viewer/TokenSwatch.tsx`
- Create: `components/viewer/PropsTable.tsx`
- Create: `components/viewer/CodeBlock.tsx`

**Step 1: Create components/viewer/TokenSwatch.tsx**

```tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TokenSwatchProps {
  cssVar: string;
  name: string;
  description?: string;
}

export function TokenSwatch({ cssVar, name, description }: TokenSwatchProps) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(`var(${cssVar})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-left hover:border-zinc-300 hover:shadow-sm transition-all w-full"
      title={`Copy var(${cssVar})`}
    >
      <div
        className="h-10 w-10 flex-shrink-0 rounded-md border border-black/10"
        style={{ background: `var(${cssVar})` }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-zinc-800 truncate">{name}</div>
        <div className="text-xs text-zinc-400 font-mono truncate">{cssVar}</div>
        {description && (
          <div className="text-xs text-zinc-400 mt-0.5 truncate">{description}</div>
        )}
      </div>
      <span className={cn('text-xs flex-shrink-0 transition-opacity', copied ? 'text-green-600 opacity-100' : 'text-zinc-400 opacity-0 group-hover:opacity-100')}>
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  );
}
```

**Step 2: Create components/viewer/PropsTable.tsx**

```tsx
export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export function PropsTable({ props }: { props: PropRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Prop</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Type</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Default</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {props.map(row => (
            <tr key={row.name} className="bg-white hover:bg-zinc-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-zinc-800">{row.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-blue-600">{row.type}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-400">{row.default ?? '—'}</td>
              <td className="px-4 py-3 text-xs text-zinc-600">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 3: Install Shiki**

```bash
npm install shiki
```

**Step 4: Create components/viewer/CodeBlock.tsx**

Note on `dangerouslySetInnerHTML`: Shiki is a server-side syntax highlighter that processes our own static code strings — not user input. The HTML it produces contains only span elements with class names for syntax coloring. This usage is safe because the content source is controlled (our own `code` prop, hardcoded in page files) and never user-supplied.

```tsx
import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export async function CodeBlock({ code, lang = 'tsx' }: CodeBlockProps) {
  // Safe: Shiki generates HTML from our own static code strings, not user input.
  const html = await codeToHtml(code, {
    lang,
    theme: 'github-light',
  });

  return (
    <div className="relative rounded-lg border border-zinc-200 overflow-hidden text-sm">
      <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-4 py-2">
        <span className="text-xs text-zinc-400 font-mono">{lang}</span>
      </div>
      {/* Safe: content is Shiki-generated HTML from static code strings */}
      <div
        className="overflow-x-auto p-4 bg-white [&>pre]:!bg-transparent [&>pre]:!m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
```

**Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add components/viewer/ package.json package-lock.json
git commit -m "feat: add TokenSwatch, PropsTable, CodeBlock viewer components"
```

---

## Task 13: Build Token Pages

**Files:**
- Create: `app/tokens/[category]/page.tsx`
- Create: `app/tokens/[category]/ColorPage.tsx`
- Create: `app/tokens/[category]/TypographyPage.tsx`
- Create: `app/tokens/[category]/SpacingPage.tsx`
- Create: `app/tokens/[category]/RadiusPage.tsx`
- Create: `app/tokens/[category]/ShadowPage.tsx`
- Create: `app/tokens/[category]/MotionPage.tsx`

**Step 1: Create app/tokens/[category]/page.tsx**

```tsx
import { notFound } from 'next/navigation';
import { Topbar }         from '@/components/viewer/Topbar';
import { ColorPage }      from './ColorPage';
import { TypographyPage } from './TypographyPage';
import { SpacingPage }    from './SpacingPage';
import { RadiusPage }     from './RadiusPage';
import { ShadowPage }     from './ShadowPage';
import { MotionPage }     from './MotionPage';

const PAGES: Record<string, { title: string; Component: React.ComponentType }> = {
  colors:     { title: 'Colors',     Component: ColorPage },
  typography: { title: 'Typography', Component: TypographyPage },
  spacing:    { title: 'Spacing',    Component: SpacingPage },
  radius:     { title: 'Radius',     Component: RadiusPage },
  shadow:     { title: 'Shadow',     Component: ShadowPage },
  motion:     { title: 'Motion',     Component: MotionPage },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map(category => ({ category }));
}

export default async function TokenCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const page = PAGES[category];
  if (!page) notFound();
  const { title, Component } = page;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={`Tokens / ${title}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
```

**Step 2: Create app/tokens/[category]/ColorPage.tsx**

```tsx
import { TokenSwatch } from '@/components/viewer/TokenSwatch';
import { colorPrimitives, colorSemantic } from '@/tokens';

export function ColorPage() {
  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-1">Primitives</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Raw palette values. Never reference these directly in components — use semantic tokens.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {colorPrimitives.map(token => (
            <TokenSwatch key={token.cssVar} {...token} />
          ))}
        </div>
      </div>

      {colorSemantic.map(group => (
        <div key={group.group}>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">{group.group}</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.tokens.map(token => (
              <TokenSwatch key={token.cssVar} {...token} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 3: Create app/tokens/[category]/TypographyPage.tsx**

```tsx
import { fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacings } from '@/tokens';

function TokenTable({ title, rows }: { title: string; rows: { name: string; cssVar: string; value: string }[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">CSS Var</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map(row => (
              <tr key={row.cssVar} className="bg-white hover:bg-zinc-50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-800">{row.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{row.cssVar}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TypographyPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <TokenTable title="Font Families"   rows={fontFamilies} />
      <TokenTable title="Font Sizes"      rows={fontSizes} />
      <TokenTable title="Font Weights"    rows={fontWeights} />
      <TokenTable title="Line Heights"    rows={lineHeights} />
      <TokenTable title="Letter Spacing"  rows={letterSpacings} />
    </div>
  );
}
```

**Step 4: Create app/tokens/[category]/SpacingPage.tsx**

```tsx
import { spacingTokens } from '@/tokens';

export function SpacingPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Spacing Scale</h2>
      <div className="space-y-3">
        {spacingTokens.map(token => (
          <div key={token.cssVar} className="flex items-center gap-4">
            <div className="w-20 text-xs font-mono text-zinc-400 flex-shrink-0">{token.pxValue}</div>
            <div className="w-28 text-xs font-mono text-zinc-400 flex-shrink-0">{token.cssVar}</div>
            <div className="h-4 rounded-sm bg-blue-200 flex-shrink-0" style={{ width: `var(${token.cssVar})` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 5: Create app/tokens/[category]/RadiusPage.tsx**

```tsx
import { radiusTokens } from '@/tokens';

export function RadiusPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Border Radius Scale</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {radiusTokens.map(token => (
          <div key={token.cssVar} className="flex flex-col items-center gap-3 p-4 rounded-lg border border-zinc-200 bg-white">
            <div
              className="h-14 w-14 bg-blue-100 border-2 border-blue-300"
              style={{ borderRadius: `var(${token.cssVar})` }}
            />
            <div className="text-center">
              <div className="text-sm font-medium text-zinc-800">{token.name}</div>
              <div className="text-xs font-mono text-zinc-400">{token.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 6: Create app/tokens/[category]/ShadowPage.tsx**

```tsx
import { shadowTokens } from '@/tokens';

export function ShadowPage() {
  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold text-zinc-900 mb-4">Elevation Scale</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shadowTokens.map(token => (
          <div key={token.cssVar} className="flex flex-col items-center gap-4 p-6 rounded-lg border border-zinc-100 bg-zinc-50">
            <div
              className="h-16 w-16 rounded-xl bg-white"
              style={{ boxShadow: `var(${token.cssVar})` }}
            />
            <div className="text-center">
              <div className="text-sm font-semibold text-zinc-800">{token.name}</div>
              <div className="text-xs font-mono text-zinc-400 mt-0.5">{token.cssVar}</div>
              <div className="text-xs text-zinc-500 mt-1">{token.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 7: Create app/tokens/[category]/MotionPage.tsx**

```tsx
import { durationTokens, easingTokens } from '@/tokens';

function SimpleTable({ title, rows }: { title: string; rows: { name: string; cssVar: string; value: string }[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">{title}</h2>
      <div className="overflow-x-auto rounded-lg border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">CSS Var</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map(t => (
              <tr key={t.cssVar} className="bg-white hover:bg-zinc-50">
                <td className="px-4 py-3 font-mono text-xs text-zinc-800">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{t.cssVar}</td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">{t.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function MotionPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <SimpleTable title="Duration" rows={durationTokens} />
      <SimpleTable title="Easing"   rows={easingTokens} />
    </div>
  );
}
```

**Step 8: Verify dev server**

```bash
npm run dev
```

Navigate to `http://localhost:3000/tokens/colors`. Expected: color swatches render in a grid. Clicking copies `var(--token-name)`. Stop server.

**Step 9: Commit**

```bash
git add app/tokens/
git commit -m "feat: add all token pages (colors, typography, spacing, radius, shadow, motion)"
```

---

## Task 14: Build Typography Specimens Page

**Files:**
- Create: `app/typography/page.tsx`

**Step 1: Create app/typography/page.tsx**

```tsx
import { Topbar } from '@/components/viewer/Topbar';
import { typeSpecimens } from '@/tokens';

export default function TypographyPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Typography" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl space-y-1">
          {typeSpecimens.map(specimen => (
            <div
              key={specimen.name}
              className="group flex items-baseline gap-6 rounded-lg border border-transparent px-4 py-4 hover:border-zinc-200 hover:bg-zinc-50 transition-all"
            >
              <div className="w-24 flex-shrink-0">
                <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-500">
                  {specimen.label}
                </span>
              </div>
              <div
                className={specimen.className}
                style={{ color: 'var(--color-text-primary)' }}
              >
                {specimen.sample}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/typography/
git commit -m "feat: add typography specimens page"
```

---

## Task 15: Build Component Pages

**Files:**
- Create: `app/components/[component]/page.tsx`
- Create: `app/components/[component]/ButtonPage.tsx`
- Create: `app/components/[component]/InputPage.tsx`
- Create: `app/components/[component]/CardPage.tsx`
- Create: `app/components/[component]/BadgePage.tsx`

**Step 1: Create app/components/[component]/page.tsx**

```tsx
import { notFound } from 'next/navigation';
import { Topbar }      from '@/components/viewer/Topbar';
import { ButtonPage }  from './ButtonPage';
import { InputPage }   from './InputPage';
import { CardPage }    from './CardPage';
import { BadgePage }   from './BadgePage';

const PAGES: Record<string, { title: string; Component: React.ComponentType }> = {
  button: { title: 'Button', Component: ButtonPage },
  input:  { title: 'Input',  Component: InputPage },
  card:   { title: 'Card',   Component: CardPage },
  badge:  { title: 'Badge',  Component: BadgePage },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map(component => ({ component }));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;
  const page = PAGES[component];
  if (!page) notFound();
  const { title, Component } = page;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={`Components / ${title}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
```

**Step 2: Create app/components/[component]/ButtonPage.tsx**

```tsx
import { Button }     from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'variant',   type: '"primary" | "secondary" | "outline" | "ghost" | "destructive"', default: '"primary"', description: 'Visual style' },
  { name: 'size',      type: '"sm" | "md" | "lg"',  default: '"md"',   description: 'Height and padding scale' },
  { name: 'disabled',  type: 'boolean',              default: 'false',  description: 'Prevents interaction, reduces opacity' },
  { name: 'className', type: 'string',               default: '—',      description: 'Additional classes merged via cn()' },
];

const USAGE = `import { Button } from '@/components/ui';

<Button variant="primary" size="md">Get started</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive" size="sm">Delete</Button>`;

export function ButtonPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Button</h1>
        <p className="mt-2 text-sm text-zinc-500">Primary interactive element. Use for actions, not navigation. One primary per section maximum.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="All variants">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label="All sizes">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled</h2>
        <Preview label="Disabled state">
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>Disabled</Button>
          <Button variant="outline"   disabled>Disabled</Button>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
```

**Step 3: Create app/components/[component]/InputPage.tsx**

```tsx
import { Input }      from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'size',        type: '"sm" | "md" | "lg"',   default: '"md"',      description: 'Height of the input' },
  { name: 'state',       type: '"default" | "error"',  default: '"default"', description: 'Validation state' },
  { name: 'placeholder', type: 'string',               default: '—',         description: 'Placeholder text' },
  { name: 'disabled',    type: 'boolean',              default: 'false',     description: 'Disables the input' },
];

const USAGE = `import { Input } from '@/components/ui';

<Input placeholder="Enter value" />
<Input state="error" placeholder="Invalid email" />
<Input disabled placeholder="Read only" />`;

export function InputPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Input</h1>
        <p className="mt-2 text-sm text-zinc-500">Single-line text input. Always pair with a visible label in production.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Sizes</h2>
        <Preview label="All sizes">
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Input size="sm" placeholder="Small" />
            <Input size="md" placeholder="Medium" />
            <Input size="lg" placeholder="Large" />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">States</h2>
        <Preview label="Validation states">
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Input state="default" placeholder="Default" />
            <Input state="error"   placeholder="Error state" />
            <Input disabled        placeholder="Disabled" />
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
```

**Step 4: Create app/components/[component]/CardPage.tsx**

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'className', type: 'string',     default: '—', description: 'Additional classes for the card container' },
  { name: 'children',  type: 'ReactNode',  default: '—', description: 'Card content' },
];

const USAGE = `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Supporting description</CardDescription>
  </CardHeader>
  <CardContent>Content goes here.</CardContent>
  <CardFooter>
    <Button size="sm">Action</Button>
  </CardFooter>
</Card>`;

export function CardPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Card</h1>
        <p className="mt-2 text-sm text-zinc-500">Surface container for grouped content. Composed of CardHeader, CardTitle, CardDescription, CardContent, CardFooter.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label="Card with all sub-components">
          <div className="w-full max-w-sm">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Supporting description text for context.</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Card body content. Use for the primary content of this card.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="secondary">Cancel</Button>
              </CardFooter>
            </Card>
          </div>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
```

**Step 5: Create app/components/[component]/BadgePage.tsx**

```tsx
import { Badge }      from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'variant',   type: '"default" | "primary" | "secondary" | "destructive" | "outline"', default: '"default"', description: 'Visual style' },
  { name: 'className', type: 'string',    default: '—', description: 'Additional classes' },
  { name: 'children',  type: 'ReactNode', default: '—', description: 'Badge label content' },
];

const USAGE = `import { Badge } from '@/components/ui';

<Badge>Default</Badge>
<Badge variant="primary">New</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Beta</Badge>`;

export function BadgePage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Badge</h1>
        <p className="mt-2 text-sm text-zinc-500">Compact label for status, category, or count.</p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="All variants">
          <Badge>Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
```

**Step 6: Verify dev server**

```bash
npm run dev
```

Navigate to `/components/button`. Expected: variants render in Preview wrapper, props table and code block below. Stop server.

**Step 7: Commit**

```bash
git add app/components/
git commit -m "feat: add component pages (Button, Input, Card, Badge)"
```

---

## Task 16: Patterns Page Stub + Final Verification

**Files:**
- Create: `app/patterns/page.tsx`
- Create: `components/patterns/index.ts`

**Step 1: Create app/patterns/page.tsx**

```tsx
import { Topbar } from '@/components/viewer/Topbar';

export default function PatternsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Patterns" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-zinc-900">Patterns</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Reusable compositions of components. Add patterns to{' '}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">components/patterns/</code>
            {' '}and register them here.
          </p>
          <div className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <p className="text-sm text-zinc-400">No patterns yet. Build a form, empty state, or card grid and add it here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Create components/patterns/index.ts**

```ts
// Add pattern composition exports here as you build them.
// Example: export { FormPattern } from './FormPattern';
```

**Step 3: Full production build**

```bash
npm run build
```

Expected: build succeeds. Fix any TypeScript errors before proceeding. Shadcn CSS variable warnings are acceptable.

**Step 4: Full navigation pass (dev server)**

```bash
npm run dev
```

Visit each route and verify:

| Route | Check |
|-------|-------|
| `/tokens/colors` | Color swatches in grid. Click to copy. |
| `/tokens/typography` | Five tables render. |
| `/tokens/spacing` | Spacing bars visible, proportional width. |
| `/tokens/radius` | Radius demos render, shapes vary correctly. |
| `/tokens/shadow` | Shadow demos on white squares. |
| `/tokens/motion` | Two tables for duration and easing. |
| `/typography` | Type specimens stacked with labels. |
| `/components/button` | All variants, sizes, disabled in Preview. Props table. Code block. |
| `/components/input` | Sizes and states in Preview. |
| `/components/card` | Card with sub-components in Preview. |
| `/components/badge` | All variants in Preview. |
| `/patterns` | Placeholder renders. |

Check theme toggle: click the moon/sun in the Topbar. DS components inside Preview wrappers should shift between light and dark token values. Viewer chrome (sidebar, topbar) should NOT change.

**Step 5: Final commit**

```bash
git add app/patterns/ components/patterns/
git commit -m "feat: complete design system viewer scaffold — all routes, DS components, viewer chrome"
```

---

## Extending the System Later

### Add a new DS component

1. Create `components/ui/[component].tsx` — CVA + `var(--token)` only
2. Export from `components/ui/index.ts`
3. Create `app/components/[component]/[Component]Page.tsx` with Preview, PropsTable, CodeBlock
4. Add entry to `PAGES` map in `app/components/[component]/page.tsx`
5. Add nav link to `components/viewer/Sidebar.tsx`

### Add a new token category

1. Add CSS vars to `styles/tokens.css`
2. Create `tokens/[category].ts` mirror
3. Export from `tokens/index.ts`
4. Create `app/tokens/[category]/[Category]Page.tsx`
5. Add entry to `PAGES` map in `app/tokens/[category]/page.tsx`
6. Add nav link to `components/viewer/Sidebar.tsx`

### Port tokens from Figma

Use the `figma-to-code` skill (in `figma-to-code/figma-to-code.md`). Mapping rule:
```
Figma variable      →  CSS custom property
color/action/primary → --color-action-primary
space/4              → --space-4
```
Update only `styles/tokens.css` and the corresponding `tokens/*.ts` mirror. DS components need zero changes.
