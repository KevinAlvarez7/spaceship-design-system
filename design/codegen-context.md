# Spaceship DS — Pencil Code Generation Context

Paste this as a **Context node** on every Pencil canvas before generating code.

---

## Tech Stack

- React + TypeScript
- Tailwind v4 + motion/react
- CVA (`class-variance-authority`) for variants
- `cn()` helper from `@/lib/utils`

## Import Rules

```
import { Button, Tag, Modal, ... } from "@/components/ui"
import { ChatPanel, ArtifactPanelV2, ... } from "@/components/patterns"
```

## Styling Rules

- Tailwind v4 paren syntax: `bg-(--token-name)` NOT `bg-[var(--token-name)]`
- Font size: `text-(length:--font-size-sm)` NOT `text-[var(--font-size-sm)]`
- All colors via semantic CSS variables — never hardcoded hex
- No inline `style={{ color: 'var(--token)' }}` — always use className
- No `dark:` prefix — dark mode via `[data-theme="dark"]` on `<html>`
- No Tailwind color utilities (`text-white`, `bg-zinc-900`, `border-gray-*`)

## Component Rules

- CVA base uses array syntax: `cva(["class1", "class2"], { variants: {...} })`
- Every interactive component needs a `disableMotion?: boolean` prop
- Motion: `motion/react` with spring damping ratio ≥ 0.7
  - Spread `{...props}` BEFORE explicit motion props (`whileHover`, `whileTap`, etc.)
  - Add `style={{ willChange: 'transform' }}` on elements with scale animations
- Use `leadingIcon` / `trailingIcon` props for icon slots (not children)
- Radix UI primitives for accessibility (Dialog, Select, Checkbox, etc.)

## Available Variants

**Button:** variant (primary|secondary|ghost|success|destructive) × size (sm|md|lg|icon-sm|icon-md|icon-lg) × surface (flat|shadow)
**Tag:** variant (neutral|success|warning|error|info) × size (sm|md) × surface (default|shadow-border)

## Semantic Token Reference

Key token groups (full list in `styles/tokens.css`):
- Text: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-placeholder`, `--text-inverse`
- Bg: `--bg-surface-primary/secondary/tertiary/base/paper/fade`
- Interactive bg: `--bg-interactive-primary-default/hover/pressed/disabled`
- Border: `--border-default`, `--border-subtle`, `--border-input-default/focus`
- Shadow: `--shadow-border`, `--shadow-border-hover`, `--shadow-keycap`, `--shadow-keycap-hover`
- Sizing: `--sizing-chat-default` (428px), `--sizing-chat-panel` (560px)
