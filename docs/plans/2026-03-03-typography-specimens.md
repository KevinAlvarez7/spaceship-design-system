# Typography Specimens Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the flat `typeSpecimens` list with a 14-specimen grouped type scale, add JetBrains Mono as a token, and update the typography viewer page to render one Preview block per group.

**Architecture:** Token data lives in `tokens/typography.ts` as a new `typeSpecimenGroups` array. Token values (new font family, updated line heights) live in `styles/tokens.css` and are exposed to Tailwind via `app/globals.css`. The viewer page consumes the groups array and renders a `<Preview>` per group.

**Tech Stack:** Next.js 16.1, Tailwind v4, TypeScript, `next/font/google`, CVA

---

### Task 1: Load JetBrains Mono font

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Add JetBrains Mono import and instantiation**

In `app/layout.tsx`, add `JetBrains_Mono` to the existing `next/font/google` import, then instantiate it below the existing `outfit` declaration:

```ts
import { Zilla_Slab, Outfit, JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-family-mono',
  display: 'swap',
});
```

**Step 2: Apply the variable class to `<body>`**

The `<body>` currently applies two variable classes. Add the third:

```tsx
<body className={`${zillaSlab.variable} ${outfit.variable} ${jetbrainsMono.variable} flex h-screen overflow-hidden bg-white`}>
```

**Step 3: Verify build passes**

```bash
npm run build
```

Expected: no errors mentioning `JetBrains_Mono` or font loading.

**Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(typography): load JetBrains Mono via next/font"
```

---

### Task 2: Add `--font-family-mono` token and expose to Tailwind

**Files:**
- Modify: `styles/tokens.css` (line ~178, the font-family block)
- Modify: `app/globals.css` (line ~47, the `@theme` typography section)

**Step 1: Add token to `styles/tokens.css`**

Find the existing font-family block (around line 178):
```css
--font-family-primary: 'Zilla Slab', Georgia, serif;
--font-family-secondary: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

Add the mono token immediately after:
```css
--font-family-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
```

**Step 2: Expose to Tailwind in `app/globals.css`**

Find the typography section in `@theme` (around line 47):
```css
/* ── Typography ── */
--font-sans:  var(--font-family-secondary);
--font-serif: var(--font-family-primary);
```

Add:
```css
--font-mono:  var(--font-family-mono);
```

**Step 3: Verify build passes**

```bash
npm run build
```

Expected: clean build. The Tailwind utility `font-mono` now resolves to JetBrains Mono.

**Step 4: Commit**

```bash
git add styles/tokens.css app/globals.css
git commit -m "feat(tokens): add --font-family-mono token and expose as font-mono"
```

---

### Task 3: Update line-height tokens for display sizes

**Files:**
- Modify: `styles/tokens.css` (lines 200–201, the `--line-height-5xl` and `--line-height-6xl` values)
- Modify: `tokens/typography.ts` (the `lineHeights` array)

**Step 1: Update `styles/tokens.css`**

Find (around line 200):
```css
--line-height-5xl: 1; /* auto / 100% */
--line-height-6xl: 1; /* auto / 100% */
```

Replace with:
```css
--line-height-5xl: 4.5rem;   /* 72px */
--line-height-6xl: 6.25rem;  /* 100px */
```

**Step 2: Update the display values in `tokens/typography.ts`**

In the `lineHeights` array, find the `5xl` and `6xl` entries and update their `value` fields (used only for viewer display):

```ts
{ name: '5xl', cssVar: '--line-height-5xl', value: '4.5rem / 72px' },
{ name: '6xl', cssVar: '--line-height-6xl', value: '6.25rem / 100px' },
```

**Step 3: Verify build passes**

```bash
npm run build
```

Expected: clean build.

**Step 4: Commit**

```bash
git add styles/tokens.css tokens/typography.ts
git commit -m "feat(tokens): set explicit line-height values for 5xl (72px) and 6xl (100px)"
```

---

### Task 4: Replace `typeSpecimens` with `typeSpecimenGroups` in the token file

**Files:**
- Modify: `tokens/typography.ts`

**Step 1: Add `TypeSpecimenGroup` type and the new export**

Add the new type and export to the bottom of `tokens/typography.ts`, keeping the old `typeSpecimens` export temporarily in place (it will be deleted in Task 5 once the page is updated):

```ts
export type TypeSpecimenGroup = {
  group: string;
  specimens: TypeSpecimen[];
};

export const typeSpecimenGroups: TypeSpecimenGroup[] = [
  {
    group: 'Displays',
    specimens: [
      {
        name: 'display-1',
        label: 'Display 1',
        className: 'font-serif [font-size:var(--font-size-6xl)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-6xl)]',
        sample: 'The quick brown fox',
      },
      {
        name: 'display-2',
        label: 'Display 2',
        className: 'font-serif [font-size:var(--font-size-5xl)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-5xl)]',
        sample: 'The quick brown fox',
      },
      {
        name: 'display-3',
        label: 'Display 3',
        className: 'font-serif [font-size:var(--font-size-4xl)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-4xl)]',
        sample: 'The quick brown fox',
      },
    ],
  },
  {
    group: 'Headings',
    specimens: [
      {
        name: 'h1',
        label: 'H1',
        className: 'font-sans [font-size:var(--font-size-3xl)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-3xl)]',
        sample: 'Design systems scale quality',
      },
      {
        name: 'h2',
        label: 'H2',
        className: 'font-sans [font-size:var(--font-size-2xl)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-2xl)]',
        sample: 'Design systems scale quality',
      },
      {
        name: 'h3',
        label: 'H3',
        className: 'font-sans [font-size:var(--font-size-xl)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-xl)]',
        sample: 'Tokens, Components, Patterns',
      },
      {
        name: 'h4',
        label: 'H4',
        className: 'font-sans [font-size:var(--font-size-lg)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-lg)]',
        sample: 'Consistent, scalable UI',
      },
      {
        name: 'h5',
        label: 'H5',
        className: 'font-sans [font-size:var(--font-size-base)] [font-weight:var(--font-weight-bold)] [line-height:var(--line-height-base)]',
        sample: 'Consistent, scalable UI',
      },
    ],
  },
  {
    group: 'Body',
    specimens: [
      {
        name: 'body-lg',
        label: 'Body LG',
        className: 'font-sans [font-size:var(--font-size-lg)] [font-weight:var(--font-weight-regular)] [line-height:var(--line-height-lg)]',
        sample: 'The primary reading size. Used for paragraphs, descriptions, and most UI content.',
      },
      {
        name: 'body-base',
        label: 'Body Base',
        className: 'font-sans [font-size:var(--font-size-base)] [font-weight:var(--font-weight-regular)] [line-height:var(--line-height-base)]',
        sample: 'The primary reading size. Used for paragraphs, descriptions, and most UI content.',
      },
      {
        name: 'body-sm',
        label: 'Body SM',
        className: 'font-sans [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-regular)] [line-height:var(--line-height-sm)]',
        sample: 'Secondary body text. Form labels, supporting descriptions, sidebar content.',
      },
    ],
  },
  {
    group: 'Captions',
    specimens: [
      {
        name: 'caption-1',
        label: 'Caption 1',
        // 16px / 20px — uses --line-height-sm (1.25rem = 20px) intentionally, not --line-height-base (24px)
        className: 'font-sans [font-size:var(--font-size-base)] [font-weight:var(--font-weight-semibold)] [line-height:var(--line-height-sm)]',
        sample: 'Form label · UI label · Tag',
      },
      {
        name: 'caption-2',
        label: 'Caption 2',
        className: 'font-sans [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] [line-height:var(--line-height-sm)]',
        sample: 'Form label · UI label · Tag',
      },
      {
        name: 'caption-3',
        label: 'Caption 3',
        className: 'font-sans [font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)] [line-height:var(--line-height-xs)]',
        sample: 'Timestamp · Metadata · Fine print',
      },
    ],
  },
  {
    group: 'Code',
    specimens: [
      {
        name: 'code-1',
        label: 'Code 1',
        className: 'font-mono [font-size:var(--font-size-base)] [font-weight:var(--font-weight-regular)] [line-height:var(--line-height-base)]',
        sample: 'const greeting = "Hello, world!";',
      },
      {
        name: 'code-2',
        label: 'Code 2',
        className: 'font-mono [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-regular)] [line-height:var(--line-height-sm)]',
        sample: 'const greeting = "Hello, world!";',
      },
    ],
  },
];
```

**Step 2: Update `fontFamilies` to include mono**

Find the `fontFamilies` array (around line 9) and add:
```ts
{ name: 'mono', cssVar: '--font-family-mono', value: 'JetBrains Mono, ui-monospace, monospace' },
```

**Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: clean build. Both `typeSpecimens` and `typeSpecimenGroups` are exported at this point.

**Step 4: Commit**

```bash
git add tokens/typography.ts
git commit -m "feat(tokens): add typeSpecimenGroups with 14 specimens across 5 groups"
```

---

### Task 5: Update typography viewer page

**Files:**
- Modify: `app/typography/page.tsx`

**Step 1: Replace the page content entirely**

The full new file:

```tsx
import { Topbar } from '@/components/viewer/Topbar';
import { Preview } from '@/components/viewer/Preview';
import { typeSpecimenGroups } from '@/tokens';

export default function TypographyPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Typography" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {typeSpecimenGroups.map(({ group, specimens }) => (
          <Preview key={group} label={group}>
            <div className="max-w-3xl space-y-1">
              {specimens.map(specimen => (
                <div
                  key={specimen.name}
                  className="group flex items-baseline gap-6 rounded-lg border border-transparent px-4 py-4 hover:border-zinc-200 hover:bg-zinc-50 transition-all"
                >
                  <div className="w-24 flex-shrink-0">
                    <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-500">
                      {specimen.label}
                    </span>
                  </div>
                  <div className={specimen.className}>
                    {specimen.sample}
                  </div>
                </div>
              ))}
            </div>
          </Preview>
        ))}
      </main>
    </div>
  );
}
```

**Step 2: Remove the old `typeSpecimens` export from `tokens/typography.ts`**

Delete lines 60–109 in `tokens/typography.ts` (the `typeSpecimens` array). The `TypeSpecimen` type and `TypeSpecimenGroup` type both stay — they are still used.

**Step 3: Verify build and lint pass**

```bash
npm run build && npm run lint
```

Expected: clean build and lint. No references to `typeSpecimens` remain in the source.

**Step 4: Commit**

```bash
git add app/typography/page.tsx tokens/typography.ts
git commit -m "feat(typography): render grouped type specimens in viewer page"
```

---

### Task 6: Final verification

**Step 1: Run full build**

```bash
npm run build
```

Expected: exits 0 with no errors or warnings about missing fonts, unused exports, or type errors.

**Step 2: Start dev server and visually confirm**

```bash
npm run dev
```

Open `http://localhost:3000/typography`. Verify:
- 5 Preview blocks visible: Displays, Headings, Body, Captions, Code
- Displays render in Zilla Slab (serif) at large sizes
- Headings render in Outfit Bold in descending sizes
- Body renders in Outfit Regular
- Captions render in Outfit SemiBold
- Code renders in JetBrains Mono (monospaced)
- Row hover effect still works

**Step 3: Commit if any last-minute fixes were made, otherwise done**
