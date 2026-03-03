# Icon Sizes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show all three standard icon sizes (16/20/24px) with their stroke widths side by side inside each `LucideIconCard` on the Icons page.

**Architecture:** Add an `ICON_SIZES` constant to the registry as the single source of truth for size/strokeWidth pairs. Update `LucideIconCard` to iterate over that constant, rendering one icon column per size in the preview area. No changes needed to `IconsPage` or `assets/lucide-icons.ts` registry entries.

**Tech Stack:** Next.js 16, React, Tailwind v4, lucide-react, TypeScript

---

### Task 1: Add `ICON_SIZES` to the registry

**Files:**
- Modify: `assets/lucide-icons.ts`

**Step 1: Add the constant**

Open `assets/lucide-icons.ts`. Add this export after the `IconEntry` type:

```typescript
export const ICON_SIZES = [
  { label: 'sm', size: 16, strokeWidth: 2    },
  { label: 'md', size: 20, strokeWidth: 2.25 },
  { label: 'lg', size: 24, strokeWidth: 2.5  },
] as const;
```

Full file after edit:

```typescript
import type { LucideIcon } from 'lucide-react';
import { Check, ChevronRight, Copy, Download, Moon, Sun } from 'lucide-react';

export type IconEntry = {
  name: string;
  icon: LucideIcon;
  importName: string;
  tags?: string[];
};

export const ICON_SIZES = [
  { label: 'sm', size: 16, strokeWidth: 2    },
  { label: 'md', size: 20, strokeWidth: 2.25 },
  { label: 'lg', size: 24, strokeWidth: 2.5  },
] as const;

export const lucideIcons: IconEntry[] = [
  { name: 'Check',         icon: Check,        importName: 'Check',        tags: ['feedback', 'confirm'] },
  { name: 'Chevron Right', icon: ChevronRight,  importName: 'ChevronRight', tags: ['navigation', 'arrow'] },
  { name: 'Copy',          icon: Copy,          importName: 'Copy',         tags: ['action', 'clipboard'] },
  { name: 'Download',      icon: Download,      importName: 'Download',     tags: ['action', 'file'] },
  { name: 'Moon',          icon: Moon,          importName: 'Moon',         tags: ['theme', 'toggle'] },
  { name: 'Sun',           icon: Sun,           importName: 'Sun',          tags: ['theme', 'toggle'] },
];
```

**Step 2: Verify build**

```bash
npm run build
```

Expected: builds with no TypeScript errors.

**Step 3: Commit**

```bash
git add assets/lucide-icons.ts
git commit -m "feat(icons): add ICON_SIZES constant to registry"
```

---

### Task 2: Rewrite `LucideIconCard` preview area

**Files:**
- Modify: `components/viewer/LucideIconCard.tsx`

**Step 1: Replace the preview area**

The current preview renders one `<Icon>` centered. Replace the entire `<button>` contents with a flex row of three icon columns, one per size.

Full replacement for `LucideIconCard.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type IconEntry, ICON_SIZES } from '@/assets/lucide-icons';

interface LucideIconCardProps {
  entry: IconEntry;
}

export function LucideIconCard({ entry }: LucideIconCardProps) {
  const [dark, setDark] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = `import { ${entry.importName} } from 'lucide-react';`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (non-secure context or permission denied)
    }
  }

  const Icon = entry.icon;

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      {/* Preview — click to toggle light/dark background */}
      <button
        onClick={() => setDark(d => !d)}
        title="Toggle light / dark background"
        className={cn(
          'flex w-full items-center justify-around px-4 py-5 transition-colors',
          dark ? 'bg-zinc-900' : 'bg-zinc-50'
        )}
      >
        {ICON_SIZES.map(({ label, size, strokeWidth }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <Icon
              style={{ width: size, height: size }}
              strokeWidth={strokeWidth}
              className={dark ? 'text-white' : 'text-zinc-800'}
            />
            <span className={cn('text-[10px] leading-none', dark ? 'text-zinc-400' : 'text-zinc-400')}>
              {size}
            </span>
            <span className={cn('text-[10px] leading-none', dark ? 'text-zinc-500' : 'text-zinc-400/70')}>
              sw:{strokeWidth}
            </span>
          </div>
        ))}
      </button>

      {/* Footer */}
      <div className="border-t border-zinc-100 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-zinc-800">{entry.name}</span>
          <button
            onClick={handleCopy}
            title="Copy import statement"
            className="flex-shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            {copied
              ? <Check className="h-3.5 w-3.5 text-green-600" />
              : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {entry.tags.map(tag => (
              <span key={tag} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500">
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

Key changes from original:
- Removed `min-h-32` (height now comes from icon column content)
- `justify-around` spreads the three columns evenly
- Each column: icon + size label + stroke label, all `flex-col items-center gap-1.5`
- `style={{ width: size, height: size }}` for pixel-exact sizing
- `strokeWidth` prop passed directly to the Lucide icon

**Step 2: Verify build**

```bash
npm run build
```

Expected: builds cleanly, `/assets/icons` prerendered without errors.

**Step 3: Verify lint**

```bash
npm run lint
```

Expected: no new warnings beyond pre-existing ones in `Topbar.tsx` and `scripts/generate-tokens.mjs`.

**Step 4: Commit**

```bash
git add components/viewer/LucideIconCard.tsx
git commit -m "feat(icons): show all 3 standard sizes in LucideIconCard preview"
```
