# Experiment Badge System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a reusable `ExperimentBadge` viewer component and an `experiment` flag on nav items so any page can be labelled as exploratory — used immediately for the Gravity Well effect.

**Architecture:** `NavItem` gains an optional `experiment?: true` metadata field. `NavLink` renders an inline amber chip when the flag is set. A standalone `ExperimentBadge` viewer component handles the page-header badge. `GravityWellPage` imports and uses it.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4 (viewer chrome uses plain zinc/amber palette — no DS tokens).

---

### Task 1: Create ExperimentBadge viewer component

**Files:**
- Create: `components/viewer/ExperimentBadge.tsx`

**Step 1: Create the file**

```tsx
// components/viewer/ExperimentBadge.tsx
export function ExperimentBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
      Experiment
    </span>
  );
}
```

**Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add components/viewer/ExperimentBadge.tsx
git commit -m "feat(viewer): add ExperimentBadge component"
```

---

### Task 2: Add experiment flag to NavItem and render badge in sidebar

**Files:**
- Modify: `components/viewer/Sidebar.tsx`

**Step 1: Extend the NavItem type**

In `Sidebar.tsx`, change the `NavItem` type from:

```ts
type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
};
```

To:

```ts
type NavItem = {
  label: string;
  href?: string;
  experiment?: true;
  children?: NavItem[];
};
```

**Step 2: Update NavLink to render the chip**

Replace the current `NavLink` function:

```tsx
function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const isActive = item.href ? pathname === item.href : false;

  if (!item.href) return null;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors',
        isActive
          ? 'bg-zinc-100 text-zinc-900 font-medium'
          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'
      )}
    >
      <span>{item.label}</span>
      {item.experiment && (
        <span className="ml-2 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-600">
          Experiment
        </span>
      )}
    </Link>
  );
}
```

Note: `justify-between` is added to the link, and the label is wrapped in `<span>` so the badge floats right.

**Step 3: Flag the Gravity Well nav entry**

In the `NAV` array, update the Effects section:

```ts
{
  label: 'Effects',
  children: [
    { label: 'Gravity Well', href: '/effects/gravity-well', experiment: true },
  ],
},
```

**Step 4: Verify types**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add components/viewer/Sidebar.tsx
git commit -m "feat(viewer): add experiment flag to NavItem and sidebar badge"
```

---

### Task 3: Add ExperimentBadge to GravityWellPage header

**Files:**
- Modify: `app/effects/[effect]/GravityWellPage.tsx`

**Step 1: Import ExperimentBadge**

Add to the import block at the top of `GravityWellPage.tsx`:

```ts
import { ExperimentBadge } from '@/components/viewer/ExperimentBadge';
```

**Step 2: Update the page header**

The current header block (around line 451) is:

```tsx
{/* Header */}
<div>
  <h1 className="text-2xl font-bold text-zinc-900">Gravity Well</h1>
  <p className="mt-2 text-sm text-zinc-500">
    An analytic gravitational displacement field. Each vertex finds its target
    analytically — no springs, no velocity accumulation, just math.
  </p>
</div>
```

Replace with:

```tsx
{/* Header */}
<div>
  <div className="flex items-center gap-3">
    <h1 className="text-2xl font-bold text-zinc-900">Gravity Well</h1>
    <ExperimentBadge />
  </div>
  <p className="mt-2 text-sm text-zinc-500">
    An analytic gravitational displacement field. Each vertex finds its target
    analytically — no springs, no velocity accumulation, just math.
  </p>
</div>
```

**Step 3: Verify types and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: clean compile and successful build.

**Step 4: Commit**

```bash
git add app/effects/[effect]/GravityWellPage.tsx
git commit -m "feat(effects): label Gravity Well as experiment in page header"
```
