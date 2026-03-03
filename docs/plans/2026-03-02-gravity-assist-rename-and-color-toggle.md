# Gravity Assist Rename + Color Mode Toggle Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Export `GravityAssist` as a barrel alias for `GravityWell`, rename the viewer page to "Gravity Assist", and add a Neutral / Rainbow color mode toggle above the preview canvas.

**Architecture:** The component source file (`GravityWell.tsx`) is untouched — aliases are added in the barrel only. The viewer page is renamed and extended with a `ColorMode` type, a `ColorModeToggle` pill component, and `colorMode` state that controls whether `lineColors` is passed to the canvas. All four changes touch different files and can be done sequentially with a commit per task.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4 (viewer chrome — plain zinc palette only, no DS tokens).

---

### Task 1: Add GravityAssist barrel alias

**Files:**
- Modify: `components/effects/index.ts`

**Step 1: Add two lines to the barrel**

Current contents of `components/effects/index.ts`:
```ts
export { GravityWell } from './GravityWell';
export type { GravityWellProps } from './GravityWell';

export { GravityWellBackground } from './GravityWell';
export type { GravityWellBackgroundProps } from './GravityWell';
```

Replace with:
```ts
export { GravityWell } from './GravityWell';
export type { GravityWellProps } from './GravityWell';

export { GravityWell as GravityAssist } from './GravityWell';
export type { GravityWellProps as GravityAssistProps } from './GravityWell';

export { GravityWellBackground } from './GravityWell';
export type { GravityWellBackgroundProps } from './GravityWell';
```

**Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add components/effects/index.ts
git commit -m "feat(effects): export GravityAssist as alias for GravityWell"
```

---

### Task 2: Rename viewer page to Gravity Assist

**Files:**
- Rename: `app/effects/[effect]/GravityWellPage.tsx` → `app/effects/[effect]/GravityAssistPage.tsx`
- Modify: `app/effects/[effect]/page.tsx`

**Step 1: Rename the file**

```bash
mv app/effects/\[effect\]/GravityWellPage.tsx app/effects/\[effect\]/GravityAssistPage.tsx
```

**Step 2: Update the contents of GravityAssistPage.tsx**

Make the following find-and-replace changes inside the renamed file:

1. Change the import from `GravityWell` to `GravityAssist`:
   ```ts
   // Before:
   import { GravityWell } from '@/components/effects';
   // After:
   import { GravityAssist } from '@/components/effects';
   ```

2. Change the component name:
   ```ts
   // Before:
   export function GravityWellPage() {
   // After:
   export function GravityAssistPage() {
   ```

3. Change `<GravityWell` to `<GravityAssist` inside `PreviewArea` (one occurrence, around line 378):
   ```tsx
   // Before:
   <GravityWell
   // After:
   <GravityAssist
   ```
   Also close tag — it's self-closing so just the opening tag changes.

4. Change the page `<h1>` text (around line 454):
   ```tsx
   // Before:
   <h1 className="text-2xl font-bold text-zinc-900">Gravity Well</h1>
   // After:
   <h1 className="text-2xl font-bold text-zinc-900">Gravity Assist</h1>
   ```

5. Change the fullscreen modal `<h1>` text (around line 581):
   ```tsx
   // Before:
   <h1 className="text-5xl font-bold tracking-tight text-zinc-800 mb-3">
     Gravity Well
   </h1>
   // After:
   <h1 className="text-5xl font-bold tracking-tight text-zinc-800 mb-3">
     Gravity Assist
   </h1>
   ```

**Step 3: Update page.tsx**

Full new contents of `app/effects/[effect]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { Topbar }            from '@/components/viewer/Topbar';
import { GravityAssistPage } from './GravityAssistPage';

const PAGES: Record<string, { title: string; Component: React.ComponentType }> = {
  'gravity-assist': { title: 'Gravity Assist', Component: GravityAssistPage },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map(effect => ({ effect }));
}

export default async function EffectPage({
  params,
}: {
  params: Promise<{ effect: string }>;
}) {
  const { effect } = await params;
  const page = PAGES[effect];
  if (!page) notFound();
  const { title, Component } = page;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={`Effects / ${title}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
```

**Step 4: Verify types and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: clean compile, `/effects/gravity-assist` appears in the build output. `/effects/gravity-well` no longer appears (it 404s now — that's expected for a dev viewer).

**Step 5: Commit**

```bash
git add app/effects/\[effect\]/GravityAssistPage.tsx app/effects/\[effect\]/page.tsx
git commit -m "feat(effects): rename Gravity Well viewer to Gravity Assist"
```

---

### Task 3: Update Sidebar

**Files:**
- Modify: `components/viewer/Sidebar.tsx`

**Step 1: Update the Effects nav entry**

Find this entry in the `NAV` array (around line 44):
```ts
{ label: 'Gravity Well', href: '/effects/gravity-well', experiment: true },
```

Replace with:
```ts
{ label: 'Gravity Assist', href: '/effects/gravity-assist', experiment: true },
```

**Step 2: Verify types**

```bash
npx tsc --noEmit
```

Expected: no errors.

**Step 3: Commit**

```bash
git add components/viewer/Sidebar.tsx
git commit -m "feat(viewer): update sidebar nav to Gravity Assist"
```

---

### Task 4: Add ColorMode toggle to the viewer page

**Files:**
- Modify: `app/effects/[effect]/GravityAssistPage.tsx`

This task adds four things to the file: a `ColorMode` type, a `ColorModeToggle` component, `colorMode` state in both `GravityAssistPage` and `FullScreenModal`, and wires `colorMode` through `PreviewAreaProps` → `PreviewArea`.

**Step 1: Add the ColorMode type**

After the existing `type DemoMode = ...` line (around line 10), add:
```ts
type ColorMode = 'neutral' | 'rainbow';
```

**Step 2: Add the ColorModeToggle component**

Add this function directly after the `ModeToggle` component (around line 300):

```tsx
// ── ColorModeToggle ──────────────────────────────────────────────────────────

function ColorModeToggle({
  colorMode,
  onChange,
}: {
  colorMode: ColorMode;
  onChange: (m: ColorMode) => void;
}) {
  return (
    <div className="flex gap-0.5 bg-zinc-100 rounded-md p-0.5 text-xs">
      {(['neutral', 'rainbow'] as ColorMode[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={
            colorMode === m
              ? 'bg-white text-zinc-900 shadow-sm rounded px-3 py-1 capitalize'
              : 'text-zinc-500 hover:text-zinc-700 px-3 py-1 capitalize'
          }
        >
          {m}
        </button>
      ))}
    </div>
  );
}
```

**Step 3: Add colorMode to PreviewAreaProps and PreviewArea**

In the `PreviewAreaProps` interface, add `colorMode: ColorMode` as a new field:
```ts
interface PreviewAreaProps {
  radius: number;
  mass: number;
  softness: number;
  spring: number;
  colorMode: ColorMode;   // ← add this
  mode: DemoMode;
  containerRef: React.RefObject<HTMLDivElement | null>;
  sourcesRef: React.MutableRefObject<GravitySources | null>;
  dragCards: CardDef[];
  handlePointerDown: (e: React.PointerEvent, id: string) => void;
  animCardElsRef: React.MutableRefObject<(HTMLElement | null)[]>;
  handleImpactClick: (e: React.MouseEvent) => void;
  className?: string;
}
```

In the `PreviewArea` function signature, destructure `colorMode`:
```tsx
function PreviewArea({
  radius, mass, softness, spring,
  colorMode,
  mode,
  containerRef, sourcesRef,
  dragCards, handlePointerDown,
  animCardElsRef, handleImpactClick,
  className = 'h-[480px]',
}: PreviewAreaProps) {
```

Inside `PreviewArea`, replace the hardcoded `lineColors={BRAND_COLORS}` prop on `<GravityAssist>`:
```tsx
// Before:
lineColors={BRAND_COLORS}
// After:
lineColors={colorMode === 'rainbow' ? BRAND_COLORS : []}
```

**Step 4: Add colorMode state to GravityAssistPage**

In `GravityAssistPage`, add `colorMode` state alongside the existing state declarations:
```ts
const [colorMode, setColorMode] = useState<ColorMode>('rainbow');
```

In the Preview section JSX, add a `ColorModeToggle` row above `<PreviewArea>` and pass `colorMode` to it:
```tsx
{/* Preview */}
<section>
  <h2 className="text-base font-semibold text-zinc-800 mb-3">Preview</h2>
  <div className="flex items-center gap-3 mb-3">
    <ColorModeToggle colorMode={colorMode} onChange={setColorMode} />
  </div>
  <PreviewArea
    radius={radius} mass={mass} softness={softness} spring={springRaw / 100}
    colorMode={colorMode}
    mode={mode}
    containerRef={containerRef} sourcesRef={sourcesRef}
    dragCards={dragCards} handlePointerDown={handlePointerDown}
    animCardElsRef={animCardElsRef} handleImpactClick={handleImpactClick}
  />
  <div className="flex items-center gap-3 mt-3">
    <ModeToggle mode={mode} onChange={setMode} />
    <button
      onClick={() => setFullscreen(true)}
      className="text-sm text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 rounded-md px-4 py-2 transition-colors"
    >
      Open Full Screen
    </button>
  </div>
</section>
```

**Step 5: Add colorMode state to FullScreenModal**

In `FullScreenModal`, add `colorMode` state alongside the existing `mode` state:
```ts
const [colorMode, setColorMode] = useState<ColorMode>('rainbow');
```

Pass `colorMode` to `<PreviewArea>` inside the modal:
```tsx
<PreviewArea
  radius={radius} mass={mass} softness={softness} spring={spring}
  colorMode={colorMode}
  mode={mode}
  containerRef={containerRef} sourcesRef={sourcesRef}
  dragCards={dragCards} handlePointerDown={handlePointerDown}
  animCardElsRef={animCardElsRef} handleImpactClick={handleImpactClick}
  className="w-full h-full rounded-none border-none"
/>
```

Add `<ColorModeToggle>` to the overlay controls row, alongside the existing `<ModeToggle>`:
```tsx
<div className="flex items-end gap-6 pointer-events-auto">
  <Slider label="Radius"   value={radius}    min={60}  max={600} onChange={onRadiusChange} />
  <Slider label="Mass"     value={mass}      min={1}   max={50}  onChange={onMassChange} />
  <Slider label="Softness" value={softness}  min={1}   max={100} onChange={onSoftnessChange} />
  <Slider label="Spring"   value={springRaw} min={1}   max={20}  onChange={onSpringRawChange} />
  <ColorModeToggle colorMode={colorMode} onChange={setColorMode} />
  <ModeToggle mode={mode} onChange={setMode} />
</div>
```

**Step 6: Verify types and build**

```bash
npx tsc --noEmit
npm run build
```

Expected: clean compile and successful build.

**Step 7: Commit**

```bash
git add app/effects/\[effect\]/GravityAssistPage.tsx
git commit -m "feat(effects): add neutral/rainbow color mode toggle to Gravity Assist"
```
