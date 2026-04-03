# FolderTabs + Toolbar Merge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the `toolbar` row from `ArtifactPanelV2` into `FolderTabs` so the tab strip and its optional secondary toolbar row are owned by one component.

**Architecture:** Add `toolbar?: ReactNode` to `FolderTabs`. The prop renders a styled row below `TabsPrimitive.List` inside `TabsPrimitive.Root`. `ArtifactPanelV2` keeps its own `toolbar` prop but forwards it to `<FolderTabs>` instead of rendering inline.

**Tech Stack:** React, Radix Tabs (`@radix-ui/react-tabs`), CVA, Tailwind v4 paren syntax, `motion/react`.

---

### Task 1: Add `toolbar` prop to `FolderTabs`

**Files:**
- Modify: `components/ui/folder-tabs.tsx`

**Context:**
`FolderTabs` currently renders:
```tsx
<TabsPrimitive.Root value={value} onValueChange={handleChange}>
  <LayoutGroup>
    <TabsPrimitive.List className={...}>
      {leadingAction && (...)}
      {children}
    </TabsPrimitive.List>
  </LayoutGroup>
</TabsPrimitive.Root>
```

The toolbar row needs to go **after** the `LayoutGroup`, as a sibling inside `TabsPrimitive.Root`. Radix `Tabs.Root` allows arbitrary children alongside `Tabs.List`.

**Step 1: Add `toolbar` to `FolderTabsProps`**

In the `FolderTabsProps` interface (around line 61), add the new prop:

```tsx
export interface FolderTabsProps extends VariantProps<typeof folderTabsVariants> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disableMotion?: boolean;
  layoutId?: string;
  activeActions?: ReactNode;
  /** Action or nav element rendered before the tab list, separated by a right border. */
  leadingAction?: ReactNode;
  /** Optional row rendered below the tab strip — e.g. version selector, action bar. */
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}
```

**Step 2: Destructure `toolbar` in the component**

In `FolderTabs` function signature (around line 95), add `toolbar`:

```tsx
export function FolderTabs({
  value: controlledValue,
  defaultValue = '',
  onChange,
  disableMotion = false,
  surface,
  activeActions,
  leadingAction,
  toolbar,
  children,
  className,
}: FolderTabsProps) {
```

**Step 3: Render the toolbar row**

After the closing `</LayoutGroup>` tag and before `</TabsPrimitive.Root>`, add:

```tsx
      </LayoutGroup>
      {toolbar && (
        <div className="shrink-0 bg-(--bg-surface-secondary) border-b border-(--bg-surface-tertiary)">
          {toolbar}
        </div>
      )}
    </TabsPrimitive.Root>
```

**Step 4: Verify in Storybook**

Run Storybook and check that `FolderTabs` with no `toolbar` prop still renders identically to before. No visual change expected yet.

```bash
npm run storybook
```

Navigate to **Components / FolderTabs** — all existing stories should look unchanged.

**Step 5: Commit**

```bash
git add components/ui/folder-tabs.tsx
git commit -m "feat(folder-tabs): add toolbar prop — renders optional row below tab strip"
```

---

### Task 2: Update `ArtifactPanelV2` to forward `toolbar` to `FolderTabs`

**Files:**
- Modify: `components/patterns/ArtifactPanelV2.tsx`

**Context:**
Currently `ArtifactPanelV2` renders the toolbar inside the content card:

```tsx
{/* ── Content card ── */}
<div className="flex flex-col flex-1 min-h-0 rounded-b-lg shadow-border bg-(--bg-surface-base) overflow-clip">
  {/* Toolbar slot */}
  {toolbar && (
    <div className="shrink-0 bg-(--bg-surface-secondary) border-b border-(--bg-surface-tertiary)">
      {toolbar}
    </div>
  )}
  {/* Scrollable content + shimmer overlay */}
  ...
</div>
```

After the change, `toolbar` is forwarded to `<FolderTabs>` and the inline slot is removed from the content card.

**Step 1: Forward `toolbar` to `FolderTabs`**

Find the `<FolderTabs ...>` element (around line 86) and add the `toolbar` prop:

```tsx
<FolderTabs
  value={activeId}
  onChange={onSelect}
  surface="shadow-border"
  leadingAction={leadingAction}
  toolbar={toolbar}
>
```

**Step 2: Remove the toolbar slot from the content card**

Delete the entire toolbar conditional block inside the content card div (currently lines 110–115):

```tsx
{/* Remove this block entirely: */}
{toolbar && (
  <div className="shrink-0 bg-(--bg-surface-secondary) border-b border-(--bg-surface-tertiary)">
    {toolbar}
  </div>
)}
```

The content card after the change should go straight from the opening div to the scrollable content wrapper:

```tsx
<div className="flex flex-col flex-1 min-h-0 rounded-b-lg shadow-border bg-(--bg-surface-base) overflow-clip">
  {/* Scrollable content + shimmer overlay */}
  <div className="relative flex flex-1 min-h-0">
    ...
  </div>
</div>
```

**Step 3: Verify in Storybook**

Navigate to **Patterns / ArtifactPanelV2**:

- **Default** story — no toolbar, content card should look identical to before.
- **WithToolbar** story — toolbar should now appear below the tab strip (owned by `FolderTabs`), above the content card. Visually it should be pixel-identical to before since the styling is the same.

**Step 4: Lint check**

```bash
npm run lint
```

Expected: no new errors or warnings.

**Step 5: Commit**

```bash
git add components/patterns/ArtifactPanelV2.tsx
git commit -m "refactor(artifact-panel): forward toolbar prop to FolderTabs"
```
