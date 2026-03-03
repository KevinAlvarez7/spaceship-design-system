# Semantic Color Token Hierarchy

**Date:** 2026-03-02
**Status:** Implemented

---

## Problem

The semantic token section on the Colors page was rendering all groups at the same `<h2>` level, even though group names encode a hierarchy via ` / ` delimiters (e.g., "Background / Interactive / Primary"). The flat list made it hard to scan related token groups.

---

## Solution

Introduced a three-level visual hierarchy driven by the ` / ` delimiter in group names.

### `lib/buildSemanticTree.ts`

Pure utility that transforms `SemanticColorGroup[]` into a tree by splitting group names on ` / `:

- 1 part → top-level node (`SemanticTreeNode`)
- 2 parts → child under a top-level node (`SemanticChild`)
- 3+ parts → grandchild under a child (`SemanticGrandchild`)

Exports `SemanticTreeNode`, `SemanticChild`, `SemanticGrandchild` types and `buildSemanticTree()`.

### `app/tokens/[category]/ColorPage.tsx`

Three rendering components:

| Component | Heading | Style |
|-----------|---------|-------|
| `SemanticGroupSection` | `<h2>` | `text-lg font-semibold text-zinc-900` |
| `ChildSection` | `<h3>` | `text-sm font-semibold text-zinc-700` |
| _(grandchild)_ | `<h4>` | `text-xs font-semibold text-zinc-500 uppercase tracking-wide` |

Each level indents with `pl-4 border-l-2 border-zinc-100`.

### `tokens/colors.ts`

Two sets of changes to align group names with the ` / ` convention:

**Split "Text" (flat → 2-level):**

| Before | After |
|--------|-------|
| `"Text"` (12 tokens) | `"Text"` (5 base tokens) |
| | `"Text / Interactive"` (3 tokens) |
| | `"Text / Status"` (4 tokens) |

**Collapsed Background / Interactive variants (2-level → 3-level):**

| Before | After |
|--------|-------|
| `"Background / Interactive Primary"` | `"Background / Interactive / Primary"` |
| `"Background / Interactive Secondary"` | `"Background / Interactive / Secondary"` |
| `"Background / Interactive Success"` | `"Background / Interactive / Success"` |
| `"Background / Interactive Error"` | `"Background / Interactive / Error"` |
| `"Background / Interactive Warning"` | `"Background / Interactive / Warning"` |

---

## Resulting tree

```
Text (5 tokens)
  ├ Interactive (3)
  └ Status (4)
Overlay (3 tokens)
Border (6 tokens)
  └ Input (2)
Background (0 tokens)
  ├ Status (5)
  ├ Surface (4)
  ├ Interactive (0)
  │   ├ Primary (4)
  │   ├ Secondary (4)
  │   ├ Success (4)
  │   ├ Error (4)
  │   └ Warning (4)
  ├ Input (1)
  └ Brand Surface (4)
```

---

## Edge cases

- **"Background / Interactive"** has no direct tokens — only the `<h3>` and its grandchildren render
- **"Border"** has both direct tokens (6) AND a child "Input" (2) — both render
- **"Overlay"** has no ` / ` — renders flat

---

## Files touched

| File | Action |
|------|--------|
| `lib/buildSemanticTree.ts` | Created, then extended to 3 levels |
| `app/tokens/[category]/ColorPage.tsx` | Modified — added `ChildSection` + grandchild rendering |
| `tokens/colors.ts` | Modified — split "Text" + renamed 5 Interactive groups |
