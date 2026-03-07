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

## Claude Code Integration

Claude Code needs to edit DS files AND see the result in the viewer. Two approaches:

### Path A: Claude Code in viewer, edits DS repo side-by-side

```
~/projects/
  viewer/              ← Claude Code runs here
    .claude/skills/    ← skills live here, never leave
    CLAUDE.md          ← tells Claude where DS files are
    app/               ← viewer pages
    components/viewer/ ← viewer chrome
  design-system/       ← Claude Code edits files here
    components/ui/     ← DS components (edited by Claude)
    styles/tokens.css  ← tokens (edited by Claude)
    package.json       ← publishable, no .claude/
```

- Viewer's `CLAUDE.md` instructs Claude Code to edit `../design-system/` for DS changes
- Viewer imports DS via `"@brand/ui": "file:../design-system"` — HMR picks up edits instantly
- Claude Code commits/pushes branches on the DS repo for review
- `.claude/` never exists in the DS repo — it stays 100% clean
- **Pro:** DS repo has zero Claude/viewer baggage. Cleanest publishable package.
- **Con:** Claude Code works across two directories; needs clear CLAUDE.md guidance.

### Path B: Claude Code in DS repo, exclude from publish

```
design-system/
  .claude/skills/      ← lives here
  CLAUDE.md            ← lives here
  components/ui/       ← DS components
  styles/tokens.css    ← tokens
  package.json         ← "files" field excludes .claude/
    "files": ["components/", "styles/", "tokens/", "lib/"]
```

- Everything in one working directory — simplest for Claude Code
- `package.json` `"files"` field whitelists only publishable directories
- Or `.npmignore` excludes `.claude/`, `docs/`, viewer-related files
- Prod repo installs the package → only gets the whitelisted files
- **Pro:** Single working directory, no cross-repo file access needed.
- **Con:** DS repo contains dev tooling files (though they're excluded from publish).

### What never goes to prod (either path)

| Excluded from publish | Why |
|---|---|
| `.claude/` | Claude Code skills, dev tooling |
| `CLAUDE.md` | Development conventions |
| `docs/` | Architecture decisions, plans |
| `scripts/` | Figma sync, token generation |
| Viewer files | Only exist in viewer repo |

### Recommendation

**Start with Path A** if you want the DS repo to be a pristine, publishable library with zero dev tooling. Claude Code runs in the viewer and reaches into the DS repo.

**Start with Path B** if you want simplicity — one directory, one context window, and use `package.json "files"` to keep the published output clean.

Either way: `.claude/` and Claude skills **never reach the production repo**.

## Iteration Notes

_Add friction points and discoveries here as you work._
