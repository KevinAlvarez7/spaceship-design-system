---
name: design-system-explorer
description: >
  Use this skill for exploring, auditing, defining, and documenting design systems —
  before or independent of implementation. Triggers when the user wants to think
  through a design system, audit what exists, define token architecture, write a
  style guide, create design system documentation, explore naming conventions,
  plan component structure, or document design decisions. Also triggers for: "what
  should our design system look like", "audit our current styles", "document our
  tokens", "define our component library", "write a style guide", "plan our design
  system", "what tokens do we need", or any Figma audit request. Outputs go to
  Markdown files, Notion docs, or Figma annotations — this skill is about capturing
  and communicating design decisions, not implementing them in code.
---

# Design System Explorer

A design system is a shared language. Before any token gets defined or component
gets built, that language has to be understood — what does this product communicate,
who uses it, what are the visual and interactive principles that make it consistent?

This skill is the thinking and documentation layer. It helps you audit what exists,
define what should exist, and write it down in a form that designers, engineers, and
stakeholders can all reference. The output is documentation — Markdown files, Notion
pages, Figma annotations — not code.

---

## How to Start Any Exploration

Always begin by understanding what already exists and what problem the design system
is solving. Ask before assuming.

**Questions to answer first:**

- Does a design system (or partial one) already exist? Where is it documented?
- Is this greenfield or are we auditing/extending something?
- Who are the primary consumers — designers, engineers, both?
- What tools does the team use — Figma, Notion, GitHub, Storybook?
- Is Figma available to read directly? (If yes and MCP is available, offer to audit it)

The answers shape everything — the vocabulary you use, the level of detail you go into,
and what format the output takes.

---

## What a Design System Actually Contains

Design systems have three layers, each serving a different purpose:

### 1. Design Tokens — the atomic decisions

Tokens are named design decisions. Not `#3b82f6` — that's a value. `color.action.primary`
is a token — it carries meaning and can change without touching anything that uses it.

Every token has a **name**, a **value**, and a **role**:

```
Token name:  color/action/primary
Value:       #3b82f6
Role:        The primary interactive color — buttons, links, focus rings
```

Token categories to define:

| Category | What it captures |
|----------|-----------------|
| **Color** | Brand palette (primitives), semantic roles (action, surface, text, border, feedback) |
| **Typography** | Font families, size scale, weight scale, line heights, letter spacing |
| **Spacing** | Layout scale (used for padding, gap, margin) |
| **Radius** | Corner radius scale |
| **Shadow** | Elevation levels |
| **Motion** | Duration and easing values |
| **Breakpoints** | Responsive layout thresholds |

### 2. Components — the vocabulary

Components are reusable UI elements with defined contracts: what props they accept,
what states they have, how they behave. Documenting a component means documenting
its *decisions*, not just its appearance.

For each component, capture:
- **Variants** — what visual forms exist and when to use each
- **States** — default, hover, focus, active, disabled, loading, error
- **Sizes** — and when each size is appropriate
- **Anatomy** — the named parts (label, icon, container, indicator)
- **Usage rules** — when to use this vs an alternative
- **Accessibility** — keyboard behavior, ARIA roles, focus management

### 3. Patterns — the grammar

Patterns are recurring solutions to common problems — combinations of components
that solve a specific design challenge. Unlike components, patterns are more contextual
and may have more variation.

Examples: form layouts, empty states, loading states, navigation structures,
data table configurations, modal workflows.

---

## Output Formats

### Markdown Documentation

Use when: the team works in GitHub, a docs site, or a code-adjacent environment.

Structure for a token file:

```markdown
# Color Tokens

## Primitives
Raw palette values. These are never used directly in components.

| Token | Value | Notes |
|-------|-------|-------|
| `blue-500` | `#3b82f6` | Primary brand blue |
| `blue-600` | `#2563eb` | Darker variant |
| `zinc-900` | `#18181b` | Near-black |

## Semantic
Meaning-carrying aliases to primitives. These are what components use.

| Token | Aliases | Role |
|-------|---------|------|
| `color/action/primary` | `blue-500` | Primary CTA, links, focus rings |
| `color/surface/base` | `zinc-50` | Page background |
| `color/text/primary` | `zinc-900` | Body text |
| `color/destructive` | `red-500` | Error states, destructive actions |
```

Structure for a component doc:

```markdown
# Button

The primary interactive element. Use for actions, not navigation.

## Variants
- **Primary** — high-emphasis actions. Use once per section max.
- **Secondary** — medium-emphasis, secondary actions alongside a primary.
- **Outline** — low-emphasis, when visual weight needs reducing.
- **Ghost** — minimal, for toolbars and icon-adjacent contexts.
- **Destructive** — irreversible or dangerous actions only.

## Sizes
- **sm** (h-8) — compact contexts, data tables, inline actions
- **md** (h-10) — default for most UI
- **lg** (h-12) — hero sections, prominent CTAs

## States
All variants support: default, hover, focus-visible, active, disabled.
Disabled buttons should retain their visual form at reduced opacity.

## Don'ts
- Don't use more than one Primary per section
- Don't use Button for page navigation — use a Link
- Don't truncate button labels — if it wraps, the label is too long
```

### Notion Documentation

Use when: the team uses Notion for specs, runbooks, or team wikis.

Structure mirrors the Markdown approach but use Notion-native formatting:
- Use **database tables** for token lists (allows filtering by category, status)
- Use **callout blocks** for usage rules and warnings
- Use **toggle blocks** for detailed variant specs
- Use **synced blocks** for content that needs to appear in multiple places (e.g. a token that's referenced in multiple component specs)
- Create a **master index page** linking to each token category and component

Recommended Notion structure:
```
Design System (root page)
├── 📐 Foundations
│   ├── Color Tokens
│   ├── Typography
│   ├── Spacing
│   ├── Radius & Shadow
│   └── Motion
├── 🧩 Components
│   ├── Button
│   ├── Input
│   ├── Card
│   └── ...
├── 🗺️ Patterns
│   ├── Forms
│   ├── Navigation
│   └── Feedback
└── 📋 Decisions Log
    └── (dated entries for why decisions were made)
```

### Figma Annotations

Use when: the team lives in Figma and decisions need to be visible alongside designs.

For Figma annotation, output structured text the designer can paste into:
- **Variable descriptions** — what each variable is for, when to use it
- **Component property descriptions** — what each variant/prop controls
- **Usage notes** — embedded in component frames as annotation layers
- **Token mapping comments** — linking Figma variable names to their code equivalents

If Figma MCP is available, offer to read the file first to audit what's already
documented and what's missing, before writing new annotations.

---

## Auditing an Existing System

When something already exists, the job is to understand it before adding to it.

### If Figma is available (MCP)

Read the file directly:
1. Use `get_variable_defs` to extract all variables — list them, identify gaps
2. Use `get_design_context` on key components to understand what's documented
3. Look for: inconsistent naming, missing semantic layer, raw values used instead of variables

Report back:
```
Audit findings:

✅ Primitive colors defined (12 values across 3 hues)
⚠️  Semantic layer is partial — action colors exist but surface/text/border missing
❌  No spacing tokens — all padding is raw px values in components
❌  Typography: 4 different font sizes used but none are tokenized

Recommendation: Define semantic color tokens first (highest leverage),
then introduce spacing scale.
```

### If no Figma access

Ask the user to share:
- Screenshots or descriptions of current UI patterns
- Any existing token files (CSS variables, design-tokens.json, etc.)
- Which inconsistencies bother them most

Then work from what's shared to identify gaps and recommend structure.

---

## Naming Conventions

Good naming is the hardest part of a design system. Names should communicate role,
not value. `color/action/primary` is good. `blue` or `primary-blue` are not —
they encode the value into the name, which breaks when the value changes.

### Token naming pattern

```
[category]/[role]/[modifier]

color/action/primary      ← semantic
color/surface/raised      ← semantic
color/text/muted          ← semantic
blue/500                  ← primitive (named by position in scale, not meaning)
space/4                   ← spacing (named by scale step)
radius/md                 ← by size position
shadow/card               ← by use case
```

### Component naming pattern

```
[ComponentName]           ← PascalCase, single noun
ButtonGroup               ← compound when necessary
InputField vs Input       ← prefer shorter unless ambiguous
```

### Variant naming pattern

```
Prefer role over appearance:
✅ variant="primary"      ← communicates hierarchy
❌ variant="blue"         ← communicates color, breaks on retheme

Prefer descriptive over relative:
✅ size="sm" | "md" | "lg"
❌ size="small" | "medium" | "large"  (fine but verbose)
❌ size="compact" | "default" | "spacious" (too vague)
```

---

## Decisions Log

Always recommend keeping a decisions log — dated entries explaining *why* a decision
was made, not just *what* was decided. This is the most underrated part of any
design system because it prevents revisiting decisions that were already debated.

```markdown
## 2024-03-15 — Why we use semantic token names

Decision: All components reference semantic tokens, never primitives.
Reason: Multiple rebrand attempts have shown that primitive references
require touching every component file. Semantic references only require
updating the alias.
Alternatives considered: Primitive references (rejected), inline values (rejected).
```

---

## Reference Files

Read when needed:
- `references/token-categories.md` — Full token taxonomy with examples per category
- `references/component-doc-template.md` — Reusable template for documenting any component
