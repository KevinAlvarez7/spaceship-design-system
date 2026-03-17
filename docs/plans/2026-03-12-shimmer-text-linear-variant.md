# ShimmerText Linear Variant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `variant="linear"` prop to `ShimmerText` that uses a pure-CSS left-to-right gradient sweep instead of the JS-driven radial blob animation.

**Architecture:** Two changes only — add a CSS class + keyframe to `globals.css`, then add a `variant` prop to `ShimmerText` that switches the rendered class. No new files, no new exports needed (component is already exported).

**Tech Stack:** Next.js 16 / Tailwind v4 / CSS `@keyframes` / TypeScript

---

### Task 1: Add the CSS class and keyframe

**Files:**
- Modify: `app/globals.css`

**Step 1: Add keyframe and class after the existing `.thinking-dot-3` rule**

Open `app/globals.css`. After line 141 (the `.thinking-dot-3` rule), append:

```css
@keyframes shimmer-text-sweep {
  from { background-position-x: 0%; }
  to   { background-position-x: 400%; }
}

.shimmer-text-linear {
  background: linear-gradient(90deg,
    var(--effect-thinking-1),
    var(--effect-thinking-2),
    var(--effect-thinking-3),
    var(--effect-thinking-4),
    var(--effect-thinking-5),
    var(--effect-thinking-1)
  );
  background-size: 400% 100%;
  animation: shimmer-text-sweep 6s linear infinite;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Notes:
- `background-size: 400%` makes each color band wide (gradual transitions).
- `6s` is slower/more languid than the blob variant.
- The gradient starts and ends with `--effect-thinking-1` so the loop is seamless.
- `to` value matches `background-size` width (400%) for a perfect loop.

**Step 2: Verify build still compiles**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — zero TypeScript errors.

---

### Task 2: Add variant prop to ShimmerText

**Files:**
- Modify: `components/ui/shimmer-text.tsx`

**Step 1: Update the interface and component**

Replace the full contents of `components/ui/shimmer-text.tsx` with:

```tsx
'use client';

import { useRef, type ReactNode } from 'react';
import { useAnimationFrame } from 'motion/react';
import { cn } from '@/lib/utils';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ShimmerTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  disableMotion?: boolean;
  /** Animation style. 'blob' = JS-driven radial blobs (default). 'linear' = pure-CSS sweep. */
  variant?: 'blob' | 'linear';
  children?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ShimmerText({
  disableMotion = false,
  variant = 'blob',
  children,
  className,
  ...props
}: ShimmerTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useAnimationFrame((time) => {
    // Only runs for blob variant
    if (disableMotion || variant !== 'blob' || !ref.current) return;

    const t   = (time / 1000 / 3) % 1;   // 3s wobble cycle
    const tau = t * 2 * Math.PI;

    // Sawtooth: each blob travels -50% → 150% (200% range), wraps every 4s
    const drift = (time / 1000 / 4) % 1;
    const g1x = -50 + (drift * 200) + Math.sin(tau) * 12;
    const g2x = -50 + (((drift + 0.333) % 1) * 200) + Math.sin(tau * 1.3 + 2.1) * 12;
    const g3x = -50 + (((drift + 0.666) % 1) * 200) + Math.sin(tau * 0.8 + 4.2) * 12;

    // Y wobble: Lissajous vertical motion
    const g1y = 50 + Math.cos(tau * 0.7) * 30;
    const g2y = 50 + Math.cos(tau * 0.9 + 0.8) * 30;
    const g3y = 50 + Math.cos(tau * 1.1 + 3.5) * 30;

    const el = ref.current;
    el.style.setProperty('--_g1-x', `${g1x}%`);
    el.style.setProperty('--_g1-y', `${g1y}%`);
    el.style.setProperty('--_g2-x', `${g2x}%`);
    el.style.setProperty('--_g2-y', `${g2y}%`);
    el.style.setProperty('--_g3-x', `${g3x}%`);
    el.style.setProperty('--_g3-y', `${g3y}%`);
  });

  if (disableMotion) {
    return (
      <span className={cn('text-(--text-secondary)', className)} {...props}>
        {children}
      </span>
    );
  }

  if (variant === 'linear') {
    return (
      <span className={cn('shimmer-text-linear', className)} {...props}>
        {children}
      </span>
    );
  }

  // variant === 'blob' (default)
  return (
    <span
      ref={ref}
      className={cn('thinking-text-animated', className)}
      {...props}
    >
      {children}
    </span>
  );
}
```

Key changes from the original:
- `variant?: 'blob' | 'linear'` added to props and defaulted to `'blob'`
- `useAnimationFrame` guard now also checks `variant !== 'blob'` so it's a no-op for linear
- `disableMotion` branch extracted to its own early return (cleaner, same behavior)
- `variant === 'linear'` branch renders `shimmer-text-linear` class — no ref, no JS
- Blob branch is the unchanged final return

**Step 2: Run build to verify no TypeScript errors**

```bash
npm run build
```

Expected: `✓ Compiled successfully` — zero errors.

---

### Task 3: Verify and commit

**Step 1: Token audit on changed files**

```bash
grep -n "#[0-9a-fA-F]\{3,6\}\|text-zinc\|bg-white\|border-gray\|text-white" \
  components/ui/shimmer-text.tsx app/globals.css
```

Expected: no matches in `shimmer-text.tsx`. `globals.css` should have no matches either (it uses only `var(--...)` token references).

**Step 2: Final build + lint**

```bash
npm run build && npm run lint
```

Expected: build passes clean; no new lint warnings (any existing warnings in unrelated files are pre-existing).

**Step 3: Commit**

```bash
git add app/globals.css components/ui/shimmer-text.tsx
git commit -m "feat(shimmer-text): add linear CSS sweep variant"
```
