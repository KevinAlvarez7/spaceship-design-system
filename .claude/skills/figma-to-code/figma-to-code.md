---
name: figma-to-code
description: >
  Use this skill whenever a Figma link, URL, or node ID appears — or when the user
  says anything like "build this from Figma", "implement this design", "translate
  this to code", "use this Figma frame", or pastes a figma.com URL. Also triggers
  when the user mentions Figma variables, styles, effects, Code Connect, or wants
  to sync a Figma component to their codebase. Trigger even when a Figma URL
  appears mid-conversation with no explicit instruction — the right move is always
  to fetch the design context first, then ask what they need.
---

# Figma to Code

Figma is a design specification tool. This skill is about reading that specification
accurately and translating it faithfully into code — using whatever the project
already has, not inventing a parallel system.

The core failure mode is treating Figma as a visual approximation and rebuilding
components from scratch. This skill exists to prevent that. When Figma data is
available, use it. When existing components are mapped, import them. When tokens
are defined, reference them. Never guess what you can read directly.

**If the project uses the design-system-in-code skill**, read it before generating
any code. That skill defines the output format (CVA, token references, barrel
imports). This skill handles the input pipeline — how to read Figma.

---

## What Figma Actually Gives You

Before you can translate a design to code, you need to understand what data the
Figma MCP exposes. Use all of it — not just the screenshot.

### Design Context (`get_design_context`)
The primary call. Returns:
- A screenshot of the selection for visual reference
- Component instances and their properties (variant values, text, boolean props)
- Auto-layout structure: direction, gap, padding, alignment, sizing mode
- Code Connect metadata if configured — the mapped component path in the codebase
- Fill references (which variable or raw value is applied to a fill)
- Stroke, border, and corner radius details

### Variable Definitions (`get_variable_defs`)
Returns every Figma variable applied in the selection:
- Variable name (e.g. `color/action/primary`)
- Collection it belongs to (e.g. `Primitives`, `Semantic`, `Dark`)
- Resolved value for the current mode

Variables are the design token source of truth in Figma. If a fill says
`color/action/primary`, that maps to a CSS custom property — not to its resolved
hex value. Always map the variable name, not the hex.

### Code Connect Map (`get_code_connect_map`)
Returns the codebase file path for each Figma component that has been connected.
This is the lookup table that prevents component recreation.

### Styles (via `get_design_context`)
Figma styles — Text Styles, Color Styles, Effect Styles — may appear alongside or
instead of variables depending on how the file is set up. They resolve similarly:
a Text Style `Heading/2XL` maps to a typography token, not to raw px values.

---

## Workflow: Figma Link → Code

### Step 1 — Fetch everything before writing anything

When a Figma link or node ID appears, make these calls immediately:

```
get_design_context(fileKey, nodeId)
  → screenshot, component tree, layout, Code Connect paths, fill/stroke refs

get_variable_defs(fileKey, nodeId)
  → all variable names and resolved values for the selection

get_code_connect_map(fileKey, nodeId)
  → component → file path mapping
```

Don't write code until all three are done. The screenshot prevents guessing about
visual intent. The variables prevent hardcoding. The Code Connect map prevents
recreation.

### Step 2 — Understand the project's token system

Before mapping anything, understand what the project's CSS custom properties look
like. If you can see the codebase, check `tokens.css`, `globals.css`, or any
`design-tokens` file. The variable names in Figma may or may not align with the
CSS custom property names in code.

**If they align** (e.g. Figma `color/action/primary` → CSS `--color-action-primary`),
mapping is automatic. The slash-separated Figma path converts to a hyphen-separated
CSS property name.

**If they don't align**, ask the user to clarify the mapping before proceeding.
Never guess. Never use the resolved hex value as a fallback — that breaks theming.
Use a placeholder: `/* TODO: map --figma-variable-name to correct CSS var */`

### Step 3 — Map what you found

For each element in the Figma selection, build a mental model of:

```
COMPONENTS:
  ✅ Button → src/components/ui/button.tsx (Code Connect — import, don't recreate)
  ⚠️  SearchField → no Code Connect mapping (flag to user, ask for path or direction)

VARIABLES / TOKENS:
  color/action/primary → --color-action-primary
  color/surface/base   → --color-surface-base
  space/6              → --space-6
  radius/md            → --radius-md

STYLES (if present instead of variables):
  Text Style "Body/Base" → [font-size:var(--font-size-base)] leading-(--line-height-base)
  Effect Style "Shadow/Card" → shadow-(--shadow-md)

LAYOUT:
  Frame: flex-col, gap-4, px-6 py-8
  Child: flex-row, gap-2, items-center
```

### Step 4 — Pre-flight summary before building

Show the user what you found before writing a line of code. This is the most
important checkpoint — mapping errors caught here are trivial to fix. Mapping
errors discovered in a 200-line output are painful.

```
📐 [Frame or component name]

Components:
  ✅ Button → @/components/ui/button (Code Connect)
  ✅ Input → @/components/ui/input (Code Connect)
  ⚠️  TagList → no Code Connect mapping — create new or specify path?

Tokens:
  color/action/primary → --color-action-primary ✓
  color/surface/base   → --color-surface-base ✓
  space/6              → --space-6 ✓
  font/heading         → ⚠️ no matching CSS var found — clarify mapping?

Layout: flex-col, gap-6, p-8

Ready to build. Correct anything before I proceed.
```

Wait for the user to confirm or correct before generating.

### Step 5 — Generate the code

Write using the project's actual system:
- Import components from their Code Connect paths (barrel imports if that's the convention)
- Reference tokens as CSS custom properties (`var(--token-name)`)
- Translate auto-layout to Tailwind flex/grid utilities
- Translate Figma styles to the closest token-based equivalent

### Step 6 — Quality check

Before presenting:
- Every import path is real (confirmed by Code Connect or user)
- No hex values appear anywhere — only `var()` references
- No component was recreated that existed in Code Connect
- All Figma variables are mapped (no unresolved tokens remain)
- Layout direction, gap, and padding match the Figma frame

---

## Reading Different Figma Element Types

### Component instances with Code Connect
Import and use directly. Props come from Figma variant properties:

```tsx
// Figma: Button, Variant=Primary, Size=Large, Label="Get started"
import { Button } from '@/components/ui';
<Button variant="primary" size="lg">Get started</Button>
```

### Component instances without Code Connect
Flag to user. If they say "create it," follow the project's component format.
If they give a path, import from there.

### Auto-layout frames
These are your layout containers. Translate directly:

```
Figma auto-layout:
  direction: horizontal
  gap: 16 (from var space/4)
  padding: 24 (from var space/6)
  align: center

→ <div className="flex flex-row gap-(--space-4) p-(--space-6) items-center">
```

Use CSS custom properties when the value comes from a variable.
Use Tailwind scale utilities when it's a raw value that happens to be on the scale.
When in doubt, prefer the CSS var reference — it's more future-proof.

### Text nodes with Text Styles
Map the style name to the equivalent token classes. Use Tailwind v4 paren syntax:

```
Text Style: "Heading/XL" → [font-size:var(--font-size-xl)] [font-weight:var(--font-weight-semibold)] leading-(--line-height-tight)
Text Style: "Body/Base"  → [font-size:var(--font-size-base)] [font-weight:var(--font-weight-regular)] leading-(--line-height-base)
```

If no Text Style is applied and just raw values appear, map to the closest token.
If there's no close match, use the raw value with a TODO comment.

### Color fills with variables

Use Tailwind v4 paren syntax — NOT the v3 bracket syntax:

```
Fill: color/action/primary  → bg-(--bg-interactive-primary-default)
Fill: color/text/primary    → text-(--text-primary)
Stroke: color/border/default → border border-(--border-default)
```

### Effects (drop shadows, blurs)
Figma effect styles map to shadow tokens:

```
Effect Style: "Shadow/Card"  → shadow-(--shadow-md)
Effect Style: "Shadow/Small" → shadow-(--shadow-sm)
```

If no effect style is applied (raw shadow values), construct the layered shadow
as a CSS custom property if it's reused, or inline as a one-off.

### Icons
If Code Connect exists, import from that path.
If not, ask the user which icon library the project uses (Lucide, Heroicons, etc.)
and find the matching icon name. Never embed raw SVG unless explicitly asked.

### Images
Placeholder only. Never invent image URLs.
```tsx
<img src="" alt="[layer name from Figma]" />
{/* TODO: replace with actual image source */}
```

---

## Naming Conventions: How Figma Variables Map to CSS

The recommended convention aligns Figma collection/path names to CSS custom
property names. When a project follows this, mapping is automatic:

```
Figma Collection "Semantic"
  color/action/primary    →  --color-action-primary
  color/surface/base      →  --color-surface-base
  color/text/muted        →  --color-text-muted
  space/4                 →  --space-4
  radius/md               →  --radius-md
  shadow/card             →  --shadow-card

Rule: replace "/" with "-", prefix with "--"
```

**This project's token naming convention:** `--[category]-[role]-[modifier]-[state]`

```
Figma variable              →  CSS custom property
bg/interactive/primary      →  --bg-interactive-primary-default
bg/interactive/primary/hover →  --bg-interactive-primary-hover
text/primary                →  --text-primary
text/inverse                →  --text-inverse
border/input/default        →  --border-input-default
border/input/focus          →  --border-input-focus
spacing/xs                  →  --spacing-xs
radius/md                   →  --radius-md
shadow/border               →  --shadow-border
```

When reading Figma variables for this project, convert Figma paths to the
`--[category]-[role]-[modifier]-[state]` pattern. Do **not** use resolved hex values.

When the project doesn't follow this convention:
- Ask the user to describe the mapping, or show you an existing mapping file
- Never derive CSS values from the resolved hex — always from the variable name
- Consider suggesting alignment as a future improvement, but work with what exists now

---

## Handling Projects Without Code Connect

If Code Connect isn't configured, this workflow still applies — it just requires
more user input at Step 4:

For each Figma component with no Code Connect path:
1. Ask: "Do you have a `[ComponentName]` component? Where does it live?"
2. If yes → import from that path
3. If no → ask if they want to create it, and follow the design-system-in-code format

You can still map variables to tokens, still translate layout, still read styles.
Code Connect is a shortcut, not a requirement.

---

## Setting Up Code Connect (if the user asks)

```bash
npm install --save-dev @figma/code-connect
```

```tsx
// button.figma.tsx — one file per component
import figma from '@figma/code-connect';
import { Button } from './button';

figma.connect(Button, 'https://www.figma.com/file/FILE_ID?node-id=NODE_ID', {
  props: {
    variant: figma.enum('Variant', {
      Primary: 'primary', Secondary: 'secondary',
      Outline: 'outline', Ghost: 'ghost',
    }),
    size: figma.enum('Size', { Small: 'sm', Medium: 'md', Large: 'lg' }),
    children: figma.string('Label'),
  },
  example: ({ variant, size, children }) => (
    <Button variant={variant} size={size}>{children}</Button>
  ),
});
```

```bash
npx figma connect publish
```

Priority: connect Button, Input, Card, Badge first — these cover 80% of most UIs.
