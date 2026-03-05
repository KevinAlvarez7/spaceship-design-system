# Design System Workflow — Architecture & Status

## Overview

Full design-to-production workflow:

```
Figma → Import Tokens → Create Components → Refine with Viewer → Explore Patterns → Export to Prod
```

## Architecture: Three Repos

```
Figma  →  DS Repo (source of truth)  →  Viewer + Prod Repo
```

### DS Repo (single source of truth)
- Contains: `components/ui/`, `styles/tokens.css`, `tokens/*.ts`, `components/patterns/`, `lib/utils.ts`
- Published as a package (or consumed via git dependency)
- All design system changes go through PRs here

### Viewer (design playground)
- Contains: viewer chrome, preview pages, Claude Code skills, Figma sync scripts
- Reads from DS repo (local path dependency during dev)
- Pushes refinements back to DS repo as branches/PRs
- Never goes to production

### Prod Repo (consumer)
- Installs DS as a dependency: `npm install @brand/ui` or git dependency with tags
- Standard consumer relationship — same as any other package
- Engineers review DS updates via version bumps

## Stage Status

| Stage | Status | Notes |
|-------|--------|-------|
| 1. Import Tokens from Figma | READY | `scripts/generate-tokens.mjs` + Figma MCP skills |
| 2. Create Components | READY | `design-system-implementer` + `figma-to-code` skills |
| 3. Refine with Live Viewer | READY | HMR + Preview surfaces + DS enforcement checklist |
| 4. Explore Patterns & Pages | READY | Pattern pages, sidebar nav, dynamic routing |
| 5. Export to Prod | PLANNED | Three-repo architecture decided, not yet implemented |

## Stage 5: Implementation Path

### Viewer ↔ DS Repo connection
1. **Now:** Local path dependency (`file:../design-system`)
2. **Later:** Git submodule or npm workspace

### Prod Repo ← DS Repo consumption
1. **Now:** Git dependency with tags (`github:org/design-system#v1.0.0`)
2. **Later:** Published npm package (`@brand/ui@^1.0.0`)

## Key Decisions

- **Single source of truth:** DS repo owns all tokens and components. No duplication.
- **One-way flow:** Viewer → DS repo → Prod repo. Eng does not edit DS files in prod repo.
- **Viewer is disposable:** If you lose the viewer, the DS is safe in its own repo. Rebuild viewer anytime.
- **Claude Code stays in viewer:** Skills, exploration, dev tooling don't pollute DS or prod repos.
- **Tag-based releases:** Even before npm publishing, git tags give prod stable reference points.

## Iteration Notes

_Add friction points and discoveries here as you work._
