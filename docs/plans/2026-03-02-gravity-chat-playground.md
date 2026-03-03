# Gravity Chat Playground — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-content-area playground page that layers `ChatInputBox` over `GravityWell`, with the input box as a static gravity attractor and a hidden circle-logo easter egg that lets the user detach a black hole cursor as a second gravity source.

**Architecture:** Single `page.tsx` file at `app/patterns/gravity-chat/page.tsx`. No new shared components — this is a one-off playground. State machine has two modes: `idle` (input box is a static attractor) and `blackHole` (cursor becomes second attractor). All gravity source updates go through a `sourcesRef` passed to `GravityWell` so there are zero React re-renders on mouse move.

**Tech Stack:** Next.js 15 App Router, React 19, `motion/react`, `GravityWell` (existing), `ChatInputBox` (existing), Tailwind v4, TypeScript.

---

## Coordinate system note

`GravityWell` draws on a canvas that fills its container via `position: absolute; inset: 0`. Gravity source `{ x, y }` values must be in **canvas-local coordinates** (origin at top-left of the container, not the viewport). The black hole cursor visual uses `position: fixed` and therefore viewport coordinates. Keep these two coordinate spaces separate.

---

### Task 1: Scaffold page with GravityWell filling content area

**Files:**
- Create: `app/patterns/gravity-chat/page.tsx`

**Step 1: Create the file**

```tsx
'use client';

import { useRef } from 'react';
import { GravityWell } from '@/components/effects/GravityWell/GravityWell';

type Source = { x: number; y: number; mass?: number };

export default function GravityChatPlayground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<Source[] | null>([]);

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden">
      <GravityWell
        sourcesRef={sourcesRef as React.RefObject<Source[] | null>}
        softness={150}
      />
    </div>
  );
}
```

**Step 2: Verify build passes**

```bash
npm run build
```

Expected: no TypeScript or build errors.

**Step 3: Commit**

```bash
git add app/patterns/gravity-chat/page.tsx
git commit -m "feat(patterns): scaffold gravity-chat playground page with GravityWell"
```

---

### Task 2: Add layout — circle logo and ChatInputBox centered at bottom

**Files:**
- Modify: `app/patterns/gravity-chat/page.tsx`

**Step 1: Add the layout elements**

Replace the return block with:

```tsx
return (
  <div ref={containerRef} className="relative flex-1 overflow-hidden">
    <GravityWell
      sourcesRef={sourcesRef as React.RefObject<Source[] | null>}
      softness={150}
    />

    {/* Positioned stack: circle logo above ChatInputBox */}
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-[520px]">
      {/* Circle logo — easter egg, covered in Task 3 */}
      <div className="w-10 h-10 rounded-full border-[1.5px] border-zinc-700" />

      {/* ChatInputBox wrapper — reset trigger covered in Task 3 */}
      <div className="w-full">
        <ChatInputBox placeholder="Explore any problems, prototype any ideas..." />
      </div>
    </div>
  </div>
);
```

Add the ChatInputBox import at the top:

```tsx
import { ChatInputBox } from '@/components/ui';
```

**Step 2: Verify it renders**

```bash
npm run dev
```

Navigate to `http://localhost:3000/patterns/gravity-chat`. Expected: GravityWell fills the content area (right of sidebar), ChatInputBox visible at bottom center, circle logo dot above it.

**Step 3: Commit**

```bash
git add app/patterns/gravity-chat/page.tsx
git commit -m "feat(patterns): add ChatInputBox and circle logo layout to gravity-chat"
```

---

### Task 3: Track input center and set static attractor source

**Files:**
- Modify: `app/patterns/gravity-chat/page.tsx`

**Step 1: Add refs and useEffect for input center tracking**

Add `inputWrapperRef` and `inputCenterRef`, then wire a `useEffect` that reads the input wrapper's bounding rect to compute the canvas-local center and writes it to `sourcesRef`.

Add to component body (before the return):

```tsx
const inputWrapperRef = useRef<HTMLDivElement>(null);
const inputCenterRef = useRef({ x: 0, y: 0 });

// Track input box center in canvas-local coords; update static source
useEffect(() => {
  function updateCenter() {
    if (!inputWrapperRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const inputRect = inputWrapperRef.current.getBoundingClientRect();
    inputCenterRef.current = {
      x: inputRect.left + inputRect.width / 2 - containerRect.left,
      y: inputRect.top + inputRect.height / 2 - containerRect.top,
    };
    // Write idle source — cast needed because React 19 makes RefObject.current readonly
    (sourcesRef as React.MutableRefObject<Source[] | null>).current = [
      { x: inputCenterRef.current.x, y: inputCenterRef.current.y, mass: 6 },
    ];
  }

  updateCenter();
  window.addEventListener('resize', updateCenter);
  return () => window.removeEventListener('resize', updateCenter);
}, []);
```

Add `useEffect` to the imports at the top:
```tsx
import { useRef, useEffect } from 'react';
```

Attach `inputWrapperRef` to the inner ChatInputBox wrapper div:
```tsx
<div ref={inputWrapperRef} className="w-full">
```

**Step 2: Verify the grid warps toward the input box**

```bash
npm run dev
```

Navigate to `/patterns/gravity-chat`. Expected: grid lines curve toward the ChatInputBox center. Move the browser window — grid should re-center after resize.

**Step 3: Commit**

```bash
git add app/patterns/gravity-chat/page.tsx
git commit -m "feat(patterns): wire static input attractor via sourcesRef"
```

---

### Task 4: Add state machine — mode, circle trigger, input reset, circle animation

**Files:**
- Modify: `app/patterns/gravity-chat/page.tsx`

**Step 1: Add mode state and modeRef**

```tsx
import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'motion/react';

type Mode = 'idle' | 'blackHole';
```

In component body:

```tsx
const [mode, setMode] = useState<Mode>('idle');
const modeRef = useRef<Mode>('idle');
const circleControls = useAnimation();
```

**Step 2: Sync modeRef and drive circle animation on mode change**

```tsx
useEffect(() => {
  modeRef.current = mode;

  if (mode === 'idle') {
    // Restore static source
    (sourcesRef as React.MutableRefObject<Source[] | null>).current = [
      { x: inputCenterRef.current.x, y: inputCenterRef.current.y, mass: 6 },
    ];
    // Spring back in — bouncier
    circleControls.start({
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 260, damping: 20 },
    });
  } else {
    // Collapse away — snappy
    circleControls.start({
      scale: 0,
      opacity: 0,
      transition: { type: 'spring', stiffness: 400, damping: 28 },
    });
  }
}, [mode, circleControls]);
```

**Step 3: Replace static circle div with motion.div**

```tsx
<motion.div
  animate={circleControls}
  initial={{ scale: 1, opacity: 1 }}
  whileHover={mode === 'idle' ? { scale: 0.6, transition: { type: 'spring', stiffness: 400, damping: 28 } } : undefined}
  className="w-10 h-10 rounded-full border-[1.5px] border-zinc-700 cursor-pointer"
  onHoverStart={() => { if (mode === 'idle') setMode('blackHole'); }}
/>
```

**Step 4: Add reset trigger to input wrapper**

```tsx
<div
  ref={inputWrapperRef}
  className="w-full"
  onMouseEnter={() => { if (mode === 'blackHole') setMode('idle'); }}
>
```

**Step 5: Verify state transitions**

```bash
npm run dev
```

- Hover the circle dot → it collapses, gravity stays on input (no cursor yet — that's Task 5)
- Move mouse over the ChatInputBox → circle springs back with bounce

**Step 6: Commit**

```bash
git add app/patterns/gravity-chat/page.tsx
git commit -m "feat(patterns): add mode state machine and circle logo spring animations"
```

---

### Task 5: Mouse tracking and dual gravity sources in blackHole mode

**Files:**
- Modify: `app/patterns/gravity-chat/page.tsx`

**Step 1: Add global mousemove listener**

This updates `sourcesRef` with both sources (input center + cursor) in blackHole mode. Uses canvas-local coordinates for both.

```tsx
useEffect(() => {
  function onMouseMove(e: MouseEvent) {
    if (modeRef.current !== 'blackHole') return;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;
    const { x: ix, y: iy } = inputCenterRef.current;
    (sourcesRef as React.MutableRefObject<Source[] | null>).current = [
      { x: ix, y: iy, mass: 6 },
      { x: localX, y: localY, mass: 10 },
    ];
  }

  window.addEventListener('mousemove', onMouseMove);
  return () => window.removeEventListener('mousemove', onMouseMove);
}, []);
```

**Step 2: Verify dual gravity**

```bash
npm run dev
```

- Hover circle → collapse
- Move mouse around canvas → grid should now warp toward both the input box AND the cursor position
- Enter input box → grid snaps back to input-only

**Step 3: Commit**

```bash
git add app/patterns/gravity-chat/page.tsx
git commit -m "feat(patterns): add dual-source gravity in blackHole mode"
```

---

### Task 6: Black hole cursor visual

**Files:**
- Modify: `app/patterns/gravity-chat/page.tsx`

**Step 1: Add motion values for cursor**

```tsx
import { motion, useAnimation, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
```

In component body:

```tsx
const cursorX = useMotionValue(-200);
const cursorY = useMotionValue(-200);
const springX = useSpring(cursorX, { stiffness: 500, damping: 35 });
const springY = useSpring(cursorY, { stiffness: 500, damping: 35 });
```

**Step 2: Feed viewport coordinates into cursor motion values**

Update the `onMouseMove` handler from Task 5 to also set cursor motion values (cursor uses viewport coords — it's `position: fixed`):

```tsx
function onMouseMove(e: MouseEvent) {
  // Viewport coords for visual cursor
  cursorX.set(e.clientX);
  cursorY.set(e.clientY);

  if (modeRef.current !== 'blackHole') return;
  if (!containerRef.current) return;
  // Canvas-local coords for gravity sources
  const rect = containerRef.current.getBoundingClientRect();
  const localX = e.clientX - rect.left;
  const localY = e.clientY - rect.top;
  const { x: ix, y: iy } = inputCenterRef.current;
  (sourcesRef as React.MutableRefObject<Source[] | null>).current = [
    { x: ix, y: iy, mass: 6 },
    { x: localX, y: localY, mass: 10 },
  ];
}
```

Update the useEffect dependency array to include `cursorX, cursorY`:

```tsx
}, [cursorX, cursorY]);
```

**Step 3: Add cursor element and hide system cursor in blackHole mode**

Add `cursor-none` to the container when in blackHole mode:

```tsx
<div
  ref={containerRef}
  className={`relative flex-1 overflow-hidden${mode === 'blackHole' ? ' cursor-none' : ''}`}
>
```

Add the cursor element inside the container, before the positioned stack:

```tsx
<AnimatePresence>
  {mode === 'blackHole' && (
    <motion.div
      key="blackhole-cursor"
      className="pointer-events-none fixed z-50 w-4 h-4 rounded-full"
      style={{
        x: springX,
        y: springY,
        translateX: '-50%',
        translateY: '-50%',
        background: 'radial-gradient(circle, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.3) 60%, transparent 100%)',
        boxShadow: '0 0 0 1.5px rgba(9,9,11,0.8), 0 0 14px rgba(9,9,11,0.15)',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    />
  )}
</AnimatePresence>
```

**Step 4: Verify full interaction**

```bash
npm run dev
```

Full flow check:
1. Page loads → grid warps to input box center, circle logo visible above input
2. Hover circle → circle constricts and collapses, system cursor hides, small dark circle appears following mouse with spring lag
3. Move dark cursor around canvas → grid warps toward both cursor and input box
4. Move dark cursor into ChatInputBox → cursor disappears, system cursor returns, circle springs back with bounce, grid returns to input-only attractor

**Step 5: Commit**

```bash
git add app/patterns/gravity-chat/page.tsx
git commit -m "feat(patterns): add black hole cursor with spring physics"
```

---

### Task 7: Add sidebar nav entry

**Files:**
- Modify: `components/viewer/Sidebar.tsx`

**Step 1: Add entry to Patterns section**

In `Sidebar.tsx`, find the Patterns section in the `NAV` array (around line 52):

```tsx
{
  label: 'Patterns',
  children: [
    { label: 'Overview', href: '/patterns' },
  ],
},
```

Add the new entry:

```tsx
{
  label: 'Patterns',
  children: [
    { label: 'Overview',      href: '/patterns' },
    { label: 'Gravity Chat',  href: '/patterns/gravity-chat', experiment: true },
  ],
},
```

**Step 2: Verify nav link appears and routes correctly**

```bash
npm run dev
```

Expected: "Gravity Chat" with the experiment badge appears in the sidebar under Patterns. Clicking it navigates to the playground.

**Step 3: Final build check**

```bash
npm run build
```

Expected: clean build, no type errors.

**Step 4: Commit**

```bash
git add components/viewer/Sidebar.tsx
git commit -m "feat(sidebar): add Gravity Chat playground to Patterns nav"
```

---

## Complete file at end of Task 6

For reference, the final `app/patterns/gravity-chat/page.tsx`:

```tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useMotionValue, useSpring, AnimatePresence } from 'motion/react';
import { GravityWell } from '@/components/effects/GravityWell/GravityWell';
import { ChatInputBox } from '@/components/ui';

type Mode = 'idle' | 'blackHole';
type Source = { x: number; y: number; mass?: number };

export default function GravityChatPlayground() {
  const [mode, setMode] = useState<Mode>('idle');
  const modeRef = useRef<Mode>('idle');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputCenterRef = useRef({ x: 0, y: 0 });
  const sourcesRef = useRef<Source[] | null>([]);

  const circleControls = useAnimation();

  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 35 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 35 });

  // Sync modeRef + drive circle animation + restore idle source
  useEffect(() => {
    modeRef.current = mode;
    if (mode === 'idle') {
      (sourcesRef as React.MutableRefObject<Source[] | null>).current = [
        { x: inputCenterRef.current.x, y: inputCenterRef.current.y, mass: 6 },
      ];
      circleControls.start({
        scale: 1, opacity: 1,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      });
    } else {
      circleControls.start({
        scale: 0, opacity: 0,
        transition: { type: 'spring', stiffness: 400, damping: 28 },
      });
    }
  }, [mode, circleControls]);

  // Track input center in canvas-local coords
  useEffect(() => {
    function updateCenter() {
      if (!inputWrapperRef.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const inputRect = inputWrapperRef.current.getBoundingClientRect();
      inputCenterRef.current = {
        x: inputRect.left + inputRect.width / 2 - containerRect.left,
        y: inputRect.top + inputRect.height / 2 - containerRect.top,
      };
      if (modeRef.current === 'idle') {
        (sourcesRef as React.MutableRefObject<Source[] | null>).current = [
          { x: inputCenterRef.current.x, y: inputCenterRef.current.y, mass: 6 },
        ];
      }
    }
    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  // Global mouse tracking
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (modeRef.current !== 'blackHole') return;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const { x: ix, y: iy } = inputCenterRef.current;
      (sourcesRef as React.MutableRefObject<Source[] | null>).current = [
        { x: ix, y: iy, mass: 6 },
        { x: e.clientX - rect.left, y: e.clientY - rect.top, mass: 10 },
      ];
    }
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [cursorX, cursorY]);

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 overflow-hidden${mode === 'blackHole' ? ' cursor-none' : ''}`}
    >
      <GravityWell
        sourcesRef={sourcesRef as React.RefObject<Source[] | null>}
        softness={150}
      />

      <AnimatePresence>
        {mode === 'blackHole' && (
          <motion.div
            key="blackhole-cursor"
            className="pointer-events-none fixed z-50 w-4 h-4 rounded-full"
            style={{
              x: springX,
              y: springY,
              translateX: '-50%',
              translateY: '-50%',
              background: 'radial-gradient(circle, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.3) 60%, transparent 100%)',
              boxShadow: '0 0 0 1.5px rgba(9,9,11,0.8), 0 0 14px rgba(9,9,11,0.15)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          />
        )}
      </AnimatePresence>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-[520px]">
        <motion.div
          animate={circleControls}
          initial={{ scale: 1, opacity: 1 }}
          whileHover={mode === 'idle' ? { scale: 0.6, transition: { type: 'spring', stiffness: 400, damping: 28 } } : undefined}
          className="w-10 h-10 rounded-full border-[1.5px] border-zinc-700 cursor-pointer"
          onHoverStart={() => { if (mode === 'idle') setMode('blackHole'); }}
        />
        <div
          ref={inputWrapperRef}
          className="w-full"
          onMouseEnter={() => { if (mode === 'blackHole') setMode('idle'); }}
        >
          <ChatInputBox placeholder="Explore any problems, prototype any ideas..." />
        </div>
      </div>
    </div>
  );
}
```
