# Setting Up the Claude + Storybook Design System

A guide for designers and engineers who want to build their own AI-assisted design system using the same stack: **Claude Code + Storybook + Tailwind v4 + Design Tokens**.

---

## What This System Is

A workflow where Claude Code acts as a disciplined engineer embedded in your design system. It knows your token names, your component conventions, your Figma variable structure — and it enforces them every time it writes code. You stop explaining your system to AI; instead, the AI already knows it.

The three pillars:

1. **CLAUDE.md** — a plain text file at your repo root that tells Claude everything about your project. It replaces the "explain the codebase" conversation every time.
2. **Custom skills** — Markdown files in `.claude/skills/` that Claude reads before starting certain tasks. They contain step-by-step workflows for recurring jobs like "add a component", "check DS compliance", "implement a Figma design".
3. **Storybook** — the living style guide. Every component gets a story. Designers see the real thing, not a screenshot.

---

## Prerequisites

Before you start, install:

- **Node.js** (v18 or higher) — [nodejs.org](https://nodejs.org)
- **Claude Code** — the AI CLI that runs in your terminal. Install it from [claude.ai/code](https://claude.ai/code). Requires an Anthropic account.
- A code editor — VS Code recommended. The Claude Code VS Code extension gives you a sidebar chat and inline code suggestions.

---

## Step 1 — Set Up Your Project

If you're starting from scratch, initialize a TypeScript project with Storybook and Tailwind v4.

```bash
# Create project
mkdir my-design-system && cd my-design-system
npm init -y

# Install Storybook (this scaffolds everything)
npx storybook@latest init

# Install Tailwind v4
npm install tailwindcss@next @tailwindcss/vite

# Install core DS dependencies
npm install class-variance-authority clsx tailwind-merge
npm install motion
npm install @radix-ui/react-tooltip @radix-ui/react-dialog  # add others as needed

# Storybook addons
npm install --save-dev @storybook/addon-themes @storybook/addon-a11y @storybook/addon-docs
```

### Project structure to create

```
my-design-system/
├── .claude/
│   └── skills/          ← your custom skills live here
├── .storybook/
│   ├── main.ts
│   └── preview.tsx
├── components/
│   ├── ui/              ← DS components
│   │   └── index.ts     ← barrel export
│   └── patterns/        ← compositions of ui/ components
│       └── index.ts
├── stories/
│   ├── _helpers/        ← shared mock data, story utilities
│   ├── foundations/     ← Colors, Typography, Spacing pages
│   └── ui/              ← one .stories.tsx per component
├── styles/
│   ├── globals.css      ← Tailwind @theme wiring
│   └── tokens.css       ← your design tokens (source of truth)
├── tokens/              ← TypeScript mirrors of tokens (for doc pages)
├── lib/
│   └── utils.ts         ← cn() helper
└── CLAUDE.md            ← the brain
```

---

## Step 2 — Set Up Your Token System

Tokens are the foundation everything else builds on. Two files to create:

### `styles/tokens.css`

This is your source of truth. Three tiers:

```css
:root {
  /* ── Primitives ─────────────────────────────────────────────────
     Raw values. Never reference these directly in components.
  ─────────────────────────────────────────────────────────────── */
  --brand-blue-500: #3b82f6;
  --brand-blue-600: #2563eb;
  --neutral-50:     #fafafa;
  --neutral-900:    #18181b;

  /* ── Semantic ───────────────────────────────────────────────────
     Named roles. These are what components use.
     Pattern: --[category]-[role]-[modifier]-[state]
  ─────────────────────────────────────────────────────────────── */
  --bg-interactive-primary-default: var(--brand-blue-500);
  --bg-interactive-primary-hover:   var(--brand-blue-600);
  --bg-surface-default:             var(--neutral-50);
  --text-primary:                   var(--neutral-900);
  --text-inverse:                   #ffffff;
  --border-default:                 rgba(0, 0, 0, 0.08);

  /* ── Typography ─────────────────────────────────────────────── */
  --font-size-sm:   0.875rem;
  --font-size-base: 0.9375rem;
  --font-weight-regular:  400;
  --font-weight-semibold: 600;

  /* ── Shadows ─────────────────────────────────────────────────── */
  --shadow-border:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px rgba(0, 0, 0, 0.04);
}

/* Dark mode — override semantic tokens only, not primitives */
[data-theme="dark"] {
  --bg-surface-default: var(--neutral-900);
  --text-primary:       #fafafa;
  --border-default:     rgba(255, 255, 255, 0.08);
  --shadow-border:
    0px 0px 0px 1px rgba(255, 255, 255, 0.08),
    0px 1px 2px -1px rgba(255, 255, 255, 0.06),
    0px 2px 4px rgba(0, 0, 0, 0.20);
}
```

**The key rule:** components only ever reference semantic tokens — never primitives. When dark mode overrides `--text-primary`, every component using it updates automatically. No component files need to change.

### `styles/globals.css`

Wire your tokens into Tailwind so you can use paren syntax (`bg-(--token)`) in classNames:

```css
@import "tailwindcss";
@import "./tokens.css";

@theme {
  --color-bg-interactive-primary-default: var(--bg-interactive-primary-default);
  --color-bg-surface-default:             var(--bg-surface-default);
  --color-text-primary:                   var(--text-primary);
  --color-text-inverse:                   var(--text-inverse);
  --color-border-default:                 var(--border-default);
  --font-sans: 'Inter', sans-serif;
}
```

After this, use tokens in class names:
```tsx
// ✅ Tailwind v4 paren syntax
className="bg-(--bg-interactive-primary-default) text-(--text-inverse)"

// ❌ NOT this (Tailwind v3 bracket syntax — wrong version)
className="bg-[var(--bg-interactive-primary-default)]"
```

### `lib/utils.ts`

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Step 3 — Configure Storybook

### `.storybook/main.ts`

```ts
import path from 'path';
import { fileURLToPath } from 'url';
import { defineMain } from '@storybook/nextjs-vite/node';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineMain({
  framework: '@storybook/nextjs-vite',
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  docs: { autodocs: 'tag' },
  async viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '..'),  // enables @/components/ui imports
    };
    return config;
  },
});
```

### `.storybook/preview.tsx`

```tsx
import type { Preview, Renderer } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../styles/globals.css';  // loads your tokens into every story

const preview: Preview = {
  parameters: {
    layout: 'centered',
    options: {
      storySort: {
        order: ['Foundations', 'Components', 'Patterns', 'Playground'],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute<Renderer>({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',  // matches [data-theme="dark"] in tokens.css
    }),
  ],
};

export default preview;
```

This gives you a light/dark toggle in every story that applies your dark mode tokens automatically.

---

## Step 4 — Write Your CLAUDE.md

`CLAUDE.md` is a Markdown file at your repo root. Claude reads it at the start of every session. It replaces "let me explain the codebase" every time.

**What to put in it:**

- Project summary (what the repo is, what it's for, who uses it)
- Key commands (`npm run storybook`, `npm run lint`, etc.)
- Architecture table (which directory is for what, what styling rules apply)
- Component conventions (CVA array syntax, paren token syntax, motion pattern, etc.)
- Hard rules (what's forbidden and why)
- Token system explanation
- A "Mistakes to Avoid" section — add to this every time something goes wrong
- A "Before Marking Work Done" checklist
- A skills reference table pointing to your `.claude/skills/` files

The more specific, the better. Vague instructions produce vague results. Specific rules ("use paren syntax `bg-(--token)`, not bracket syntax `bg-[var(--token)]`") produce consistent output.

**Template to start from:**

```markdown
# [Project Name] — Claude Context

## Project Summary
[What this is, what it's for, who uses it]

## Key Commands
```bash
npm run storybook   # start dev server
npm run lint        # ESLint
```

## Architecture
| Directory | Purpose | Styling rule |
|-----------|---------|--------------|
| `components/ui/` | DS components | CVA + CSS custom properties (`var(--token)`) ONLY |
| `components/patterns/` | Pattern compositions | Composes from `@/components/ui` exclusively |
| `stories/` | Storybook stories | No styling — thin wrappers only |
| `styles/tokens.css` | Source of truth for all design tokens | — |

## Component Conventions
[Your specific rules here — see example repo for a full list]

## Token System
**Source of truth:** `styles/tokens.css`
Three-tier chain: Primitive → Semantic → Component
Rule: components use semantic tokens only.

## Mistakes to Avoid
[Add entries here every time Claude makes a mistake]

## Before Marking Work Done
1. `npm run lint` — must pass
2. `npx storybook build` — must produce clean build
3. Grep for hardcoded hex values in changed files
```

---

## Step 5 — Create Custom Skills

Skills are Markdown files in `.claude/skills/`. Claude reads them when a matching task comes up. They encode your team's process so you don't re-explain it every session.

### File structure

```
.claude/
└── skills/
    ├── design-system-implementer/
    │   └── design-system-implementer.md
    ├── add-story/
    │   └── add-story.md
    ├── ds-compliance/
    │   └── ds-compliance.md
    └── figma-to-code/
        └── figma-to-code.md
```

### How a skill file is structured

```markdown
---
name: skill-name
description: >
  One-paragraph description of when to use this skill.
  Claude reads this to decide whether to load the skill.
---

# Skill Title

What this skill is for and why it exists.

## Step 1 — [First action]
[Instructions]

## Step 2 — [Second action]
[Instructions]
```

### Skills to copy from this repo

Copy the following from `.claude/skills/` in this repo into your own project's `.claude/skills/`:

| Skill | What it does | Worth copying as-is? |
|-------|-------------|---------------------|
| `design-system-implementer/` | Full engineering guide for DS components — CVA, tokens, motion, dark mode | Yes — update token names to match yours |
| `ds-compliance/` | Automated checks for token violations, wrong syntax, missing variants | Yes — update primitive token prefixes in the grep patterns |
| `add-story/` | Generates Storybook story files from component CVA structure | Yes — minimal changes needed |
| `graduate-component/` | Promotes playground components to `components/ui/` with DS checklist | Yes — update paths if yours differ |
| `audit-stories/` | Coverage report: which components are missing stories | Yes — minimal changes needed |
| `figma-to-code/` | Reads Figma MCP context and translates to code using your tokens | Yes — update the token naming convention section |
| `design-system-explorer/` | Audit and document a design system (outputs docs, not code) | Yes — no changes needed |
| `ui-skills/shadow-border-skill.md` | Shadow-as-border technique for depth-aware borders | Yes — copy as reference |

**After copying**, update these things in each skill:
- **Token names** in examples (replace `--orbit-blue-500` with your own primitive prefix)
- **File paths** if your directory structure differs
- **DS enforcement checklist** to match your actual rules

### Register skills in CLAUDE.md

Add a skills reference table to your CLAUDE.md so Claude knows to read them:

```markdown
## Skills Reference

Located in `.claude/skills/`. Read the relevant skill file BEFORE starting work.

| Skill file | Trigger |
|---|---|
| `.claude/skills/design-system-implementer/design-system-implementer.md` | Creating or modifying DS components |
| `.claude/skills/figma-to-code/figma-to-code.md` | Any Figma URL appears |
| `.claude/skills/add-story/add-story.md` | Adding Storybook stories |
| `.claude/skills/ds-compliance/ds-compliance.md` | Checking token compliance |
| `.claude/skills/graduate-component/graduate-component.md` | Promoting a playground component |
```

---

## Step 6 — The Figma Workflow (Optional but Powerful)

If you want Claude to read Figma files directly:

1. Install the **Figma MCP server** — search "Figma MCP" for the official Figma-maintained server. It gives Claude tools to read design context, variable definitions, and Code Connect mappings from any Figma file.

2. Add the MCP server to Claude Code's settings. In VS Code, open the Claude Code settings panel and add the server under MCP Servers.

3. **Align your Figma variable names with your CSS tokens.** The mapping is automatic when Figma uses `bg/interactive/primary` and your CSS uses `--bg-interactive-primary-default`. Replace `/` with `-` and add `--`.

4. Once configured, pasting a Figma URL into chat triggers the `figma-to-code` skill automatically — Claude fetches the design, maps every variable to a CSS token, shows you a pre-flight summary, then generates the code.

---

## Daily Workflow

### Adding a new component

```
You: "Add a Badge component with variants: default, success, warning, destructive"

Claude: [reads design-system-implementer skill]
        [reads existing tokens.css and components/ui/button.tsx for reference]
        [creates components/ui/badge.tsx with CVA + tokens]
        [adds export to components/ui/index.ts]
        [runs /add-story → creates stories/ui/Badge.stories.tsx]
        [runs storybook build to verify]
```

### Checking a component

```
You: "/ds-compliance badge"

Claude: [reads ds-compliance skill]
        [greps badge.tsx for hex values, Tailwind color utilities, wrong syntax]
        [reports violations with line numbers]
        [optionally fixes them]
```

### From Figma to code

```
You: [paste Figma URL]

Claude: [reads figma-to-code skill]
        [fetches design context + variables from Figma MCP]
        [shows pre-flight: component mappings, token mappings, any gaps]
        [waits for your confirmation]
        [generates code using your actual components + tokens]
```

### Promoting a prototype

```
You: "/graduate button v2"

Claude: [reads graduate-component skill]
        [copies components/playground/button/v2.tsx → components/ui/button.tsx]
        [applies DS enforcement checklist]
        [adds to barrel export]
        [creates story]
        [runs build to verify]
```

---

## The Feedback Loop

The system improves over time. Whenever Claude makes a mistake:

1. Correct it
2. Add a "Mistakes to Avoid" entry to `CLAUDE.md` — specific, Do/Don't format
3. If it's a pattern that could appear in multiple places, grep for other instances

After a few weeks, `CLAUDE.md` becomes a comprehensive rules document that prevents every mistake that has ever happened. Future sessions start smarter.

**Example entry:**
```markdown
## Mistakes to Avoid

- Do not use Tailwind v3 bracket syntax (`bg-[var(--token)]`) — this project uses
  Tailwind v4 paren syntax (`bg-(--token)`). Every token reference must use parens.

- Do not reference primitive tokens directly in components (`bg-(--brand-blue-500)`) —
  always introduce a semantic token in `styles/tokens.css` first.
```

---

## What You'll End Up With

After setup:

- **Storybook** as your living style guide — every component documented, dark mode toggle built in, shareable via `npx storybook build`
- **Claude** that writes components in your exact style, using your exact token names, without being told every time
- **Figma → code pipeline** where designs translate directly to your component system
- **DS compliance checks** that catch token violations before they ship
- **A system that gets smarter** as you document mistakes

The investment is the upfront setup of `CLAUDE.md` and the skills. After that, it runs mostly on its own.
