# DS Compliance Skill

## Trigger
Use this skill when the user says `/ds-compliance`, "check DS compliance", "lint this component", "audit tokens in this file", or asks to verify a component follows the DS rules.

## Purpose
Run a targeted compliance check on one or more DS component or pattern files, reporting violations with line numbers.

---

## Step 0 — Identify target files

If the user specified a file, use it.
If the user specified a component name, resolve to `components/ui/{name}.tsx` or `components/patterns/{Name}.tsx`.
If no file specified, default to any recently modified files (check git status).

---

## Step 1 — Run automated checks

For each target file, grep for these violation patterns:

### 1a — Hardcoded hex values
```
grep -n "#[0-9a-fA-F]\{3,6\}" {file}
```
Violations: any hex colour not wrapped in a CSS variable.

### 1b — Tailwind colour utilities
```
grep -n "\btext-zinc\|\btext-white\|\btext-black\|\bbg-white\|\bbg-black\|\bbg-zinc\|\bborder-zinc\|\bborder-gray\|\btext-gray\|\bbg-gray\|\btext-slate\|\bbg-slate" {file}
```
Violations: hardcoded palette utilities instead of semantic token references.

### 1c — Tailwind v3 bracket syntax
```
grep -n "bg-\[var(\|text-\[var(\|border-\[var(\|shadow-\[var(" {file}
```
Violations: use paren syntax instead: `bg-(--token)`.

### 1d — Primitive token references
```
grep -n "var(--orbit-\|var(--neutral-\|var(--gravity-\|var(--cosmos-\|var(--aurora-" {file}
```
Violations: DS components must reference semantic tokens, never primitives.

### 1e — Inline style with token values
```
grep -n "style=\{.*var(--" {file}
```
Violations: use `className` with paren syntax, not inline `style=`.

### 1f — Missing `surface` variant
Check if file exports a CVA `cva(...)` call — if so, verify it includes a `surface` key in `variants:`.

### 1g — `dark:` Tailwind prefix
```
grep -n "\bdark:" {file}
```
Violations: theming uses `[data-theme="dark"]` CSS selectors, not `dark:` class prefix.

### 1h — Import from viewer or shadcn
```
grep -n "from '@/components/viewer/\|from '@/components/shadcn/" {file}
```
Violations: DS components must not depend on viewer or shadcn infrastructure.

### 1i — Props spread order on motion elements
Scan for `motion.` elements. Check that `{...props}` appears BEFORE explicit motion props (`whileHover`, `whileTap`, `initial`, `animate`, `exit`, `transition`).

---

## Step 2 — Manual review checklist

After the automated checks, quickly review:

- [ ] CVA base uses **array syntax** (not string concatenation)
- [ ] `compoundVariants` present if multi-axis logic exists (surface × variant/state)
- [ ] Interactive component: `motion/react` used, `disableMotion` prop accepted
- [ ] Spring calibration: `ζ = damping / (2 × √stiffness)` ≥ 0.7
- [ ] `willChange: 'transform'` on scale-animated motion elements
- [ ] Named exports only (no default export)
- [ ] Both component and `variants` exported
- [ ] Exported from `components/ui/index.ts`
- [ ] Has a story in `stories/ui/{ComponentName}.stories.tsx`

---

## Step 3 — Report

```
## DS Compliance: {filename}

### Automated violations
{file}:{line}  {rule}  {offending code}
... or "No violations found"

### Manual checklist
✓ CVA base array syntax
✓ surface variant present
✗ Missing compoundVariants for surface × disabled
✓ Named export
... etc

### Summary
{N} violations found. {action to fix or "Component is compliant."}
```

---

## Step 4 — Fix (optional)

If the user asks to fix violations, apply the corrections:
- Replace hex colours with semantic token references
- Replace Tailwind colour utilities with `text-(--token)` / `bg-(--token)` pattern
- Replace bracket syntax with paren syntax
- Move `{...props}` before explicit motion props

After fixing, re-run the grep checks to confirm zero violations.
