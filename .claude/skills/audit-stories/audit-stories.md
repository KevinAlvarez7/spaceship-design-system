# Audit Stories Skill

## Trigger
Use this skill when the user says `/audit-stories`, "audit stories", "check story coverage", "which components are missing stories", or asks for a coverage report.

## Purpose
Scan `components/ui/` and `components/patterns/` to identify:
1. Components with **no story** (`stories/ui/` or `stories/patterns/`)
2. Stories that exist but are **incomplete** (only `Default`, no variant stories)

---

## Step 1 — Inventory DS components

List all files in `components/ui/` (excluding `index.ts` and hook files like `use-*.ts`).

For each file, note the exported component names.

---

## Step 2 — Inventory pattern components

List all files in `components/patterns/` (excluding `index.ts`, `artifact-types.ts`, and `ClarificationForm.tsx` helpers).

---

## Step 3 — Inventory existing stories

List all files in `stories/ui/` and `stories/patterns/`.

For each story file, count named exports (= number of stories) and note if it has only `Default` (incomplete).

---

## Step 4 — Compute coverage

Cross-reference the component inventory vs story inventory.

Produce a report:

```
## Story Coverage Report

### Missing stories (components with no story)
- components/ui/foo.tsx  →  stories/ui/Foo.stories.tsx  [MISSING]
- ...

### Incomplete stories (only Default, no variant stories)
- stories/ui/Bar.stories.tsx  →  1 story (Default only)
- ...

### Complete stories
- stories/ui/Button.stories.tsx  →  6 stories ✓
- ...

### Summary
- Total components: N
- With stories: N
- Missing: N
- Incomplete: N
- Coverage: N%
```

---

## Step 5 — Suggest next actions

For each missing story, suggest running `/add-story {ComponentName}`.

For incomplete stories, note which CVA variants are present in the component but not represented as stories.
