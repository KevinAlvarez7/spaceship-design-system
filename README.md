# Design System Viewer

A living style guide and component explorer built with Next.js 16.1, Tailwind v4, and TypeScript. Use it as a design playground to build, refine, and explore your design system before shipping to production.

## Architecture: Three Repos

```
Figma  →  DS Repo (source of truth)  →  Viewer (this repo) + Prod Repo (consumer)
```

| Repo | Role | Contains |
|------|------|----------|
| **DS Repo** | Single source of truth | `components/ui/`, `styles/tokens.css`, `tokens/*.ts`, `patterns/` |
| **Viewer** (this repo) | Design playground | Viewer chrome, preview pages, Claude Code skills |
| **Prod Repo** | Production codebase | Imports DS as a dependency (`npm install` or git dep) |

The viewer reads from the DS repo, lets you iterate on components with live preview, and pushes confirmed changes back. The production repo consumes the DS as a versioned dependency.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to explore the design system.

## Key Commands

```bash
npm run dev        # Start dev server with HMR
npm run build      # Production build (verify changes)
npm run lint       # ESLint
node scripts/generate-tokens.mjs   # Regenerate tokens from Figma export
```

## Making It Yours

### 1. Swap tokens
Edit `styles/tokens.css` — replace the primitive color scales (marked with comments) with your brand palette. Semantic tokens wire automatically.

### 2. Update branding
- `app/layout.tsx` — change the page title
- `components/viewer/Sidebar.tsx` — update the sidebar header label

### 3. Add components
1. Create `components/ui/[name].tsx` (CVA + CSS custom properties)
2. Export from `components/ui/index.ts`
3. Create `app/components/[name]/page.tsx` (viewer page)
4. Add entry to sidebar nav

## Conventions

See [CLAUDE.md](./CLAUDE.md) for full architecture rules, component conventions, and the DS enforcement checklist. Key rules:

- **DS components** (`components/ui/`) use CVA + `var(--token)` only — no Tailwind color utilities
- **Viewer chrome** (`components/viewer/`) uses plain Tailwind zinc palette
- **Tokens** follow a three-tier chain: Primitive → Semantic → Component
- **Named exports only** — no default exports for DS components

## Project Structure

```
app/                    # Viewer pages (components, tokens, patterns)
components/
  ui/                   # DS components (CVA + CSS vars only)
  viewer/               # Viewer chrome (Tailwind zinc only)
  shadcn/               # Shadcn UI (viewer infrastructure)
  patterns/             # Pattern examples
styles/
  tokens.css            # Token source of truth
tokens/                 # TypeScript mirrors for viewer iteration
scripts/                # Figma sync and generation scripts
.claude/skills/         # Claude Code workflow guides
docs/                   # Architecture decisions and conventions
```

## Claude Code Integration

This repo includes Claude Code skills for:
- **Design System Implementer** — building tokens and CVA components
- **Design System Explorer** — auditing and documenting the DS
- **Figma to Code** — translating Figma designs via MCP

See `.claude/skills/` for details.
