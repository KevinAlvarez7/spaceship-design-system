# Assets Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an "Assets" viewer section (Logo, Icons, Illustrations, Animations) to the design system using a typed manifest, dynamic routing, and reusable viewer components.

**Architecture:** Mirrors `app/components/[component]/` routing exactly. A manifest file at `assets/index.ts` is the single source of truth — adding an asset means one entry there. Three new viewer components (`AssetGrid`, `AssetCard`, `AnimationPlayer`) handle rendering. Animation players (Lottie, Rive) are loaded via `next/dynamic` so they're zero-cost when unused.

**Tech Stack:** Next.js 16.1, TypeScript, Tailwind v4, lucide-react (already installed), `next/dynamic` for optional animation players.

---

### Task 1: Create the asset manifest

**Files:**
- Create: `assets/index.ts`

**Step 1: Create the manifest with types and empty categories**

```typescript
// assets/index.ts

export type AssetFormat =
  | 'svg'
  | 'png'
  | 'jpg'
  | 'lottie'     // .json — played by @lottiefiles/dotlottie-web
  | 'rive'       // .riv  — played by @rive-app/react-canvas
  | 'svg-anim';  // inline SVG with CSS / SMIL animation

export type AssetEntry = {
  name: string;
  filePath: string;         // relative to /public, e.g. '/assets/icons/arrow.svg'
  format: AssetFormat;
  description?: string;
  tags?: string[];
  dimensions?: { width: number; height: number };
};

export type AssetCategory = {
  title: string;
  assets: AssetEntry[];
};

export const ASSETS: Record<string, AssetCategory> = {
  logo: {
    title: 'Logo',
    assets: [],
  },
  icons: {
    title: 'Icons',
    assets: [],
  },
  illustrations: {
    title: 'Illustrations',
    assets: [],
  },
  animations: {
    title: 'Animations',
    assets: [],
  },
};
```

**Step 2: Verify TypeScript compiles**

Run: `npm run build`
Expected: Builds successfully with no type errors.

**Step 3: Commit**

```bash
git add assets/index.ts
git commit -m "feat(assets): add asset manifest with types and empty categories"
```

---

### Task 2: Create public asset directory structure

**Files:**
- Create: `public/assets/logo/.gitkeep`
- Create: `public/assets/icons/.gitkeep`
- Create: `public/assets/illustrations/.gitkeep`
- Create: `public/assets/animations/.gitkeep`

**Step 1: Create the directories with placeholder files**

```bash
mkdir -p public/assets/logo public/assets/icons public/assets/illustrations public/assets/animations
touch public/assets/logo/.gitkeep public/assets/icons/.gitkeep public/assets/illustrations/.gitkeep public/assets/animations/.gitkeep
```

**Step 2: Commit**

```bash
git add public/assets/
git commit -m "feat(assets): add public/assets directory structure"
```

---

### Task 3: Create AssetGrid viewer component

`AssetGrid` is a responsive grid wrapper. Viewer chrome only — Tailwind zinc palette, no DS tokens.

**Files:**
- Create: `components/viewer/AssetGrid.tsx`

**Step 1: Write the component**

```tsx
// components/viewer/AssetGrid.tsx
import { type AssetEntry } from '@/assets';
import { AssetCard } from './AssetCard';

interface AssetGridProps {
  assets: AssetEntry[];
  emptyCategory: string; // e.g. "icons" — used in the placeholder message
}

export function AssetGrid({ assets, emptyCategory }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
        <p className="text-sm text-zinc-400">
          No assets yet. Add files to{' '}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">
            public/assets/{emptyCategory}/
          </code>{' '}
          and register them in{' '}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs">
            assets/index.ts
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {assets.map(asset => (
        <AssetCard key={asset.filePath} asset={asset} />
      ))}
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Builds successfully.

**Step 3: Commit**

```bash
git add components/viewer/AssetGrid.tsx
git commit -m "feat(assets): add AssetGrid viewer component"
```

---

### Task 4: Create AssetCard viewer component

`AssetCard` renders the preview, light/dark toggle, copy, and download actions. Viewer chrome only.

**Files:**
- Create: `components/viewer/AssetCard.tsx`

**Step 1: Write the component**

```tsx
// components/viewer/AssetCard.tsx
'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type AssetEntry } from '@/assets';
import { AnimationPlayer } from './AnimationPlayer';

interface AssetCardProps {
  asset: AssetEntry;
}

export function AssetCard({ asset }: AssetCardProps) {
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    let text = asset.filePath;
    if (asset.format === 'svg' || asset.format === 'svg-anim') {
      try {
        const res = await fetch(asset.filePath);
        text = await res.text();
      } catch {
        // fall back to path if fetch fails
      }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const a = document.createElement('a');
    a.href = asset.filePath;
    a.download = asset.name;
    a.click();
  }

  const isAnimation = ['lottie', 'rive', 'svg-anim'].includes(asset.format);
  const isRaster = asset.format === 'png' || asset.format === 'jpg';

  return (
    <div className="rounded-lg border border-zinc-200 overflow-hidden bg-white">
      {/* Preview */}
      <button
        onClick={() => setDark(d => !d)}
        title="Toggle light / dark background"
        className={cn(
          'relative flex w-full items-center justify-center p-6 transition-colors min-h-32',
          dark ? 'bg-zinc-900' : 'bg-zinc-50'
        )}
      >
        {isAnimation ? (
          <AnimationPlayer asset={asset} />
        ) : isRaster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.filePath}
            alt={asset.name}
            className="max-h-20 max-w-full object-contain"
            width={asset.dimensions?.width}
            height={asset.dimensions?.height}
          />
        ) : (
          // SVG — render via <img> for isolation; copy will fetch the markup
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={asset.filePath}
            alt={asset.name}
            className="max-h-20 max-w-full object-contain"
            width={asset.dimensions?.width}
            height={asset.dimensions?.height}
          />
        )}
        <span className="absolute bottom-1 right-2 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100">
          {dark ? 'dark' : 'light'}
        </span>
      </button>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-zinc-800">{asset.name}</span>
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              onClick={handleCopy}
              title={asset.format === 'svg' || asset.format === 'svg-anim' ? 'Copy SVG' : 'Copy path'}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={handleDownload}
              title="Download"
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {asset.description && (
          <p className="mt-0.5 truncate text-xs text-zinc-400">{asset.description}</p>
        )}
        {asset.tags && asset.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {asset.tags.map(tag => (
              <span
                key={tag}
                className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Builds successfully (AnimationPlayer doesn't exist yet — TypeScript will error. That's expected. Proceed to Task 5 immediately.)

**Step 3: Commit after Task 5 passes build** (see Task 5 step 4)

---

### Task 5: Create AnimationPlayer viewer component

Handles all four animation formats. Lottie and Rive are loaded via `next/dynamic` so they're zero-cost when unused.

**Files:**
- Create: `components/viewer/AnimationPlayer.tsx`

**Step 1: Write the component**

```tsx
// components/viewer/AnimationPlayer.tsx
'use client';

import dynamic from 'next/dynamic';
import { type AssetEntry } from '@/assets';

// These are dynamically imported so they don't bloat pages that don't use them.
// Install the package first: npm install @lottiefiles/dotlottie-web
const LottiePlayer = dynamic(() => import('./players/LottiePlayer'), {
  ssr: false,
  loading: () => <AnimationFallback label="Loading Lottie…" />,
});

// Install the package first: npm install @rive-app/react-canvas
const RivePlayer = dynamic(() => import('./players/RivePlayer'), {
  ssr: false,
  loading: () => <AnimationFallback label="Loading Rive…" />,
});

interface AnimationPlayerProps {
  asset: AssetEntry;
}

function AnimationFallback({ label }: { label: string }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-zinc-300">
      <span className="text-xs text-zinc-400">{label}</span>
    </div>
  );
}

export function AnimationPlayer({ asset }: AnimationPlayerProps) {
  if (asset.format === 'lottie') {
    return <LottiePlayer src={asset.filePath} />;
  }

  if (asset.format === 'rive') {
    return <RivePlayer src={asset.filePath} />;
  }

  if (asset.format === 'svg-anim') {
    // Rendered as <img> — browser handles the SVG animation natively
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={asset.filePath}
        alt={asset.name}
        className="max-h-20 max-w-full object-contain"
        width={asset.dimensions?.width}
        height={asset.dimensions?.height}
      />
    );
  }

  return <AnimationFallback label="Unknown format" />;
}
```

**Step 2: Create stub player files so the dynamic imports resolve**

The actual player packages are not installed yet — these stubs let the build succeed and render a clear "install required" message.

```tsx
// components/viewer/players/LottiePlayer.tsx
'use client';

export default function LottiePlayer({ src }: { src: string }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-zinc-300">
      <span className="text-center text-[10px] text-zinc-400 px-2">
        Install <code>@lottiefiles/dotlottie-web</code>
      </span>
    </div>
  );
}
```

```tsx
// components/viewer/players/RivePlayer.tsx
'use client';

export default function RivePlayer({ src }: { src: string }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-zinc-300">
      <span className="text-center text-[10px] text-zinc-400 px-2">
        Install <code>@rive-app/react-canvas</code>
      </span>
    </div>
  );
}
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Builds and lints successfully with no type errors.

**Step 4: Commit Tasks 4 + 5 together**

```bash
git add components/viewer/AssetCard.tsx components/viewer/AnimationPlayer.tsx components/viewer/players/
git commit -m "feat(assets): add AssetCard and AnimationPlayer viewer components"
```

---

### Task 6: Create the four category page components

These are thin wrappers — each pulls its slice from the manifest and hands it to `AssetGrid`.

**Files:**
- Create: `app/assets/[category]/LogoPage.tsx`
- Create: `app/assets/[category]/IconsPage.tsx`
- Create: `app/assets/[category]/IllustrationsPage.tsx`
- Create: `app/assets/[category]/AnimationsPage.tsx`

**Step 1: Create all four files**

```tsx
// app/assets/[category]/LogoPage.tsx
import { ASSETS } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';

export function LogoPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Logo</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Official logo files. Click a card to toggle light / dark preview background.
        </p>
      </div>
      <AssetGrid assets={ASSETS.logo.assets} emptyCategory="logo" />
    </div>
  );
}
```

```tsx
// app/assets/[category]/IconsPage.tsx
import { ASSETS } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';

export function IconsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Icons</h1>
        <p className="mt-2 text-sm text-zinc-500">
          SVG icon set. Click a card to toggle light / dark preview background.
        </p>
      </div>
      <AssetGrid assets={ASSETS.icons.assets} emptyCategory="icons" />
    </div>
  );
}
```

```tsx
// app/assets/[category]/IllustrationsPage.tsx
import { ASSETS } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';

export function IllustrationsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Illustrations</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Illustration assets. Click a card to toggle light / dark preview background.
        </p>
      </div>
      <AssetGrid assets={ASSETS.illustrations.assets} emptyCategory="illustrations" />
    </div>
  );
}
```

```tsx
// app/assets/[category]/AnimationsPage.tsx
import { ASSETS } from '@/assets';
import { AssetGrid } from '@/components/viewer/AssetGrid';

export function AnimationsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Animations</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Animation assets — Lottie, Rive, and SVG animations. Install player packages as needed.
        </p>
      </div>
      <AssetGrid assets={ASSETS.animations.assets} emptyCategory="animations" />
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Builds successfully.

**Step 3: Commit**

```bash
git add app/assets/
git commit -m "feat(assets): add Logo, Icons, Illustrations, and Animations page components"
```

---

### Task 7: Create the dynamic route

**Files:**
- Create: `app/assets/[category]/page.tsx`

**Step 1: Write the dynamic route**

```tsx
// app/assets/[category]/page.tsx
import { notFound }          from 'next/navigation';
import { Topbar }            from '@/components/viewer/Topbar';
import { LogoPage }          from './LogoPage';
import { IconsPage }         from './IconsPage';
import { IllustrationsPage } from './IllustrationsPage';
import { AnimationsPage }    from './AnimationsPage';

const PAGES: Record<string, { title: string; Component: React.ComponentType }> = {
  logo:          { title: 'Logo',          Component: LogoPage },
  icons:         { title: 'Icons',         Component: IconsPage },
  illustrations: { title: 'Illustrations', Component: IllustrationsPage },
  animations:    { title: 'Animations',    Component: AnimationsPage },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map(category => ({ category }));
}

export default async function AssetPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const page = PAGES[category];
  if (!page) notFound();
  const { title, Component } = page;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={`Assets / ${title}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Builds successfully. Four static params generated for `logo`, `icons`, `illustrations`, `animations`.

**Step 3: Commit**

```bash
git add app/assets/[category]/page.tsx
git commit -m "feat(assets): add dynamic [category] route for assets section"
```

---

### Task 8: Add Assets section to Sidebar + final verification

**Files:**
- Modify: `components/viewer/Sidebar.tsx`

**Step 1: Add the Assets section to the NAV array**

In `components/viewer/Sidebar.tsx`, find the `NAV` array and add the Assets section after `Foundations` (or wherever makes most sense in your nav order):

```typescript
// Add this block to the NAV array in Sidebar.tsx
{
  label: 'Assets',
  children: [
    { label: 'Logo',           href: '/assets/logo' },
    { label: 'Icons',          href: '/assets/icons' },
    { label: 'Illustrations',  href: '/assets/illustrations' },
    { label: 'Animations',     href: '/assets/animations' },
  ],
},
```

The full NAV array should look like:

```typescript
const NAV: NavItem[] = [
  {
    label: 'Foundations',
    children: [
      { label: 'Colors',      href: '/tokens/colors' },
      { label: 'Typography',  href: '/tokens/typography' },
      { label: 'Spacing',     href: '/tokens/spacing' },
      { label: 'Radius',      href: '/tokens/radius' },
      { label: 'Shadow',      href: '/tokens/shadow' },
      { label: 'Motion',      href: '/tokens/motion' },
    ],
  },
  {
    label: 'Assets',
    children: [
      { label: 'Logo',          href: '/assets/logo' },
      { label: 'Icons',         href: '/assets/icons' },
      { label: 'Illustrations', href: '/assets/illustrations' },
      { label: 'Animations',    href: '/assets/animations' },
    ],
  },
  // ... rest unchanged
];
```

**Step 2: Final build + lint verification**

Run: `npm run build && npm run lint`
Expected: Both pass with no errors or warnings.

**Step 3: Smoke test in dev server**

Run: `npm run dev`
- Navigate to `/assets/logo` — should show "Assets / Logo" topbar and empty-state placeholder
- Navigate to `/assets/icons` — same
- Navigate to `/assets/illustrations` — same
- Navigate to `/assets/animations` — same
- Verify all four sidebar links are present and highlight correctly when active
- Navigate to a non-existent category like `/assets/foobar` — should show 404

**Step 4: Commit**

```bash
git add components/viewer/Sidebar.tsx
git commit -m "feat(assets): add Assets section to sidebar nav"
```

---

## How to Add Your First Asset

Once the above is complete, here is how to add a real asset (e.g. `spaceship-logo.svg`):

1. Copy the file to `public/assets/logo/spaceship-logo.svg`
2. Add an entry to `assets/index.ts`:

```typescript
logo: {
  title: 'Logo',
  assets: [
    {
      name: 'Spaceship Logo',
      filePath: '/assets/logo/spaceship-logo.svg',
      format: 'svg',
      description: 'Primary wordmark',
      tags: ['primary', 'wordmark'],
      dimensions: { width: 200, height: 48 },
    },
  ],
},
```

3. Reload the dev server — the card appears immediately.

## How to Enable Lottie / Rive Players

When you're ready to add real animation assets:

**Lottie:**
```bash
npm install @lottiefiles/dotlottie-web
```
Then replace the stub in `components/viewer/players/LottiePlayer.tsx` with the real player implementation.

**Rive:**
```bash
npm install @rive-app/react-canvas
```
Then replace the stub in `components/viewer/players/RivePlayer.tsx` with the real player implementation.
