# FeedbackForm Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build `FeedbackForm` — a standalone DS component with a single trigger button that morphs into an inline textarea form via `AnimatePresence` + `layoutId`.

**Architecture:** Outer `AnimatePresence mode="popLayout"` swaps the trigger button keyed element against a form container keyed element. `LayoutGroup` scopes `layoutId="feedback-btn"` shared between the trigger and the submit button for the morph animation. `MotionConfig transition={springs.gentle}` sets the layout animation default; individual elements override with `springs.snappy`. Two render paths: motion (full animation) and static (`disableMotion`).

**Tech Stack:** React, motion/react (`AnimatePresence`, `LayoutGroup`, `MotionConfig`, `motion.*`), CVA, Tailwind v4, Lucide icons.

**Reference:** `components/ui/approval-card.tsx` lines 273–377 is the exact animation pattern — the motion path of `FeedbackForm` is a distilled version of those lines without the approve row, drag-resize, or color controls.

---

## Task 1: Create `components/ui/feedback-form.tsx`

**Files:**
- Create: `components/ui/feedback-form.tsx`

### Step 1: Create the file with the full component implementation

```typescript
'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup, MotionConfig } from 'motion/react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Pencil, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { springs } from '@/tokens/motion';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Local CVA for the trigger (collapsed) and submit (expanded) button shapes. */
const triggerVariants = cva(
  [
    'flex items-center justify-between w-full',
    'p-3 gap-1',
    'rounded-sm',
    'cursor-pointer select-none',
    'font-sans [font-weight:var(--font-weight-semibold)]',
    '[font-size:var(--font-size-sm)] leading-(--line-height-sm)',
    '[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:[stroke-width:2.75]',
  ],
  {
    variants: {
      role: {
        trigger: [
          'bg-(--bg-surface-base)',
          'text-(--text-primary)',
        ],
        submit: [
          'bg-(--bg-interactive-primary-default)',
          'text-(--text-inverse)',
          'hover:bg-(--bg-interactive-primary-hover)',
          'active:bg-(--bg-interactive-primary-pressed)',
          'transition-colors duration-(--duration-base)',
        ],
      },
      hasShadow: {
        true:  'shadow-(--shadow-border) hover:shadow-(--shadow-border-hover) transition-shadow duration-(--duration-base) ease-(--ease-in-out)',
        false: '',
      },
    },
    defaultVariants: { hasShadow: true },
  },
);

// ─── CVA ──────────────────────────────────────────────────────────────────────

export const feedbackFormVariants = cva(
  [
    'flex flex-col',
    'w-full',
    'font-sans',
  ],
  {
    variants: {
      surface: {
        default:         '',
        'shadow-border': '',
      },
    },
    defaultVariants: { surface: 'shadow-border' },
  },
);

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FeedbackFormProps
  extends VariantProps<typeof feedbackFormVariants> {
  onSubmit?: (message?: string) => void;
  onCancel?: () => void;
  /** Label for the trigger button and submit button. Default: 'Request Changes' */
  submitLabel?: string;
  /** Textarea placeholder text. Default: 'Describe the changes you'd like...' */
  placeholder?: string;
  disableMotion?: boolean;
  className?: string;
}

// ─── FeedbackForm ─────────────────────────────────────────────────────────────

export function FeedbackForm({
  onSubmit,
  onCancel,
  submitLabel  = 'Request Changes',
  placeholder  = "Describe the changes you'd like...",
  disableMotion = false,
  surface,
  className,
}: FeedbackFormProps) {
  const [open, setOpen]     = useState(false);
  const textareaRef         = useRef<HTMLTextAreaElement>(null);
  const hasShadow           = (surface ?? 'shadow-border') === 'shadow-border';

  // Auto-focus textarea when form opens.
  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open]);

  function handleCancel() {
    setOpen(false);
    onCancel?.();
  }

  function handleSubmit() {
    const message = textareaRef.current?.value;
    onSubmit?.(message || undefined);
    setOpen(false);
  }

  // ── Textarea classes (shared between motion and static paths) ─────────────
  const textareaClasses = cn(
    'w-full resize-none p-1',
    'font-(family-name:--font-family-secondary)',
    '[font-size:var(--font-size-base)] leading-6',
    'text-(--text-primary) placeholder:text-(--text-placeholder)',
    'bg-transparent outline-none',
  );

  // ── Static path ───────────────────────────────────────────────────────────
  if (disableMotion) {
    return (
      <div className={cn(feedbackFormVariants({ surface }), className)}>
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className={cn(
              triggerVariants({ role: 'trigger', hasShadow }),
              'transition-colors duration-(--duration-base) ease-in-out',
              'hover:bg-(--bg-surface-primary) active:bg-(--bg-surface-secondary)',
            )}
          >
            <span>{submitLabel}</span>
            <Pencil aria-hidden="true" />
          </button>
        ) : (
          <div className={cn(
            'flex flex-col rounded-sm overflow-hidden',
            'bg-(--bg-surface-base)',
            hasShadow && 'shadow-(--shadow-border)',
          )}>
            <div className="px-3 pt-3 pb-2">
              <textarea
                ref={textareaRef}
                placeholder={placeholder}
                rows={3}
                className={textareaClasses}
              />
            </div>
            <div className="flex items-center gap-2 px-3 pb-3">
              <Button variant="secondary" surface="flat" size="md" onClick={handleCancel} disableMotion className="flex-1 py-3">
                Cancel
              </Button>
              <button
                onClick={handleSubmit}
                className={cn(triggerVariants({ role: 'submit', hasShadow: false }), 'flex-1')}
                style={{ borderRadius: 4 }}
              >
                <span>{submitLabel}</span>
                <ArrowUp aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Motion path ───────────────────────────────────────────────────────────
  // relative: scopes mode="popLayout" absolute positioning of the exiting element.
  return (
    <div className={cn(feedbackFormVariants({ surface }), 'relative', className)}>
      <MotionConfig transition={springs.gentle}>
        <LayoutGroup>
          <AnimatePresence mode="popLayout" initial={false}>
            {!open ? (

              /* ── Trigger — full-width, shadow visible ── */
              <motion.button
                key="trigger"
                layoutId="feedback-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(true)}
                className={cn(
                  triggerVariants({ role: 'trigger', hasShadow }),
                  'hover:bg-(--bg-surface-primary) active:bg-(--bg-surface-secondary)',
                  'transition-colors duration-(--duration-base)',
                )}
                style={{ borderRadius: 4 }}
                transition={springs.snappy}
              >
                <motion.span layout="position">{submitLabel}</motion.span>
                <Pencil aria-hidden="true" />
              </motion.button>

            ) : (

              /* ── Form — overflow-hidden clips internal content ── */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'flex flex-col rounded-sm overflow-hidden',
                  'bg-(--bg-surface-base)',
                  hasShadow && 'shadow-(--shadow-border)',
                )}
                style={{ borderRadius: 4 }}
                transition={springs.snappy}
              >
                <div className="px-3 pt-3 pb-2">
                  <textarea
                    ref={textareaRef}
                    placeholder={placeholder}
                    rows={3}
                    className={textareaClasses}
                  />
                </div>
                <div className="flex items-center gap-2 px-3 pb-3">
                  <Button variant="secondary" surface="flat" size="md" onClick={handleCancel} className="flex-1 py-3">
                    Cancel
                  </Button>
                  <motion.button
                    layoutId="feedback-btn"
                    layoutDependency={false}
                    onClick={handleSubmit}
                    className={cn(triggerVariants({ role: 'submit', hasShadow: false }), 'flex-1')}
                    style={{ borderRadius: 4, willChange: 'transform' }}
                    transition={springs.snappy}
                  >
                    <motion.span layout="position">{submitLabel}</motion.span>
                    <ArrowUp aria-hidden="true" />
                  </motion.button>
                </div>
              </motion.div>

            )}
          </AnimatePresence>
        </LayoutGroup>
      </MotionConfig>
    </div>
  );
}
```

**Why the motion choices are this way:**
- `MotionConfig transition={springs.gentle}` — sets the layout animation default for the container morph (gentle spring, ζ=0.95)
- `LayoutGroup` — scopes `layoutId="feedback-btn"` so it doesn't collide with ApprovalCard's `"request-btn"` if both are on the same page
- `AnimatePresence mode="popLayout" initial={false}` — `popLayout` removes the exiting element from layout flow immediately (popped to absolute) so the entering element can take over without a jump; `initial={false}` skips the mount animation on first render
- `layoutId="feedback-btn"` on BOTH the trigger button and the submit button — Motion sees the shared ID and interpolates positions/sizes between them using `springs.snappy`
- `layout="position"` on label spans — prevents the label text from stretching as the button changes width during the morph (only position animates, not size)
- `layoutDependency={false}` on submit button — prevents re-triggering a layout animation if the form's internal state changes (e.g. textarea resize on different browsers)
- `style={{ borderRadius: 4 }}` as inline style (not className) — Motion interpolates inline `borderRadius` during layout animation; if it were a Tailwind class, it would snap instead
- `willChange: 'transform'` on submit button — promotes the element to its own GPU layer before the layout morph starts, preventing mid-animation layer promotion that causes text jitter

### Step 2: Verify the file was created correctly

Visually confirm the file has the correct structure: `'use client'` → imports → `triggerVariants` → `feedbackFormVariants` → `FeedbackFormProps` → `FeedbackForm`. No hardcoded hex, no `dark:` prefix, no Tailwind color utilities.

### Step 3: Commit

```bash
git add components/ui/feedback-form.tsx
git commit -m "feat(feedback-form): add standalone FeedbackForm DS component"
```

---

## Task 2: Barrel export in `components/ui/index.ts`

**Files:**
- Modify: `components/ui/index.ts` (after the ApprovalCard block, line 36)

### Step 1: Add the exports

After the ApprovalCard export block (lines 35-36), add:

```typescript
export { FeedbackForm, feedbackFormVariants } from './feedback-form';
export type { FeedbackFormProps } from './feedback-form';
```

### Step 2: Commit

```bash
git add components/ui/index.ts
git commit -m "chore: export FeedbackForm from ui barrel"
```

---

## Task 3: Create `stories/ui/FeedbackForm.stories.tsx`

**Files:**
- Create: `stories/ui/FeedbackForm.stories.tsx`

### Step 1: Create the story file

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { FeedbackForm } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const meta = {
  title: 'Components/FeedbackForm',
  component: FeedbackForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Expandable feedback button that morphs into an inline textarea form. Click the trigger to expand; Cancel or submit to collapse.',
      },
    },
  },
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    submitLabel:   { control: 'text' },
    placeholder:   { control: 'text' },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    onSubmit:      { table: { disable: true } },
    onCancel:      { table: { disable: true } },
  },
  args: {
    surface: 'shadow-border',
    submitLabel: 'Request Changes',
    placeholder: "Describe the changes you'd like...",
    disableMotion: false,
  },
  render: (args) => (
    <div className="w-80">
      <FeedbackForm {...args} />
    </div>
  ),
} satisfies Meta<typeof FeedbackForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabels: Story = {
  args: {
    submitLabel: 'Send Feedback',
    placeholder: 'What would you like to change?',
  },
};

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};

export const DisableMotion: Story = {
  args: { disableMotion: true },
};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'FeedbackForm',   padding: '—',              gap: '—',     radius: '—',          note: 'outer wrapper, position relative' },
  { part: 'Trigger button', padding: 'p-3',            gap: 'gap-1', radius: 'rounded-sm', note: 'collapsed state, full width' },
  { part: 'Form container', padding: '—',              gap: '—',     radius: 'rounded-sm', note: 'expanded state, overflow-hidden' },
  { part: 'Textarea area',  padding: 'px-3 pt-3 pb-2', gap: '—',     radius: '—' },
  { part: 'Button row',     padding: 'px-3 pb-3',      gap: 'gap-2', radius: '—',          note: 'Cancel + Submit' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/feedback-form.tsx"
      preview={
        <div className="w-80">
          <FeedbackForm disableMotion />
        </div>
      }
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};
```

### Step 2: Commit

```bash
git add stories/ui/FeedbackForm.stories.tsx
git commit -m "feat(feedback-form): add FeedbackForm story with Composition table"
```

---

## Task 4: Verify

### Step 1: Lint

```bash
npm run lint
```

Expected: no new errors or warnings related to `feedback-form.tsx` or `FeedbackForm.stories.tsx`.

If lint errors appear: the most common issues are `[font-size:var(...)]` vs `text-[var(...)]` (check all font-size references in feedback-form.tsx) and `bg-(--token)` vs `bg-[var(--token)]` (check all color classes).

### Step 2: Storybook build

```bash
npx storybook build
```

Expected: clean build with no TypeScript errors. The CompositionTable import must resolve — if it fails, verify the import path matches how other stories import it (check `stories/ui/ApprovalCard.stories.tsx` line 3 as the reference).

### Step 3: DS enforcement checklist

Run this mentally on `components/ui/feedback-form.tsx`:
- [ ] All colours use `var(--token)` with paren syntax (`bg-(--token)`) — no hex, no Tailwind color utilities
- [ ] CVA base uses array syntax (first arg to `cva()` is `[...]`)
- [ ] `surface` variant present on `feedbackFormVariants`
- [ ] `disableMotion` path renders zero `motion.*` elements
- [ ] `willChange: 'transform'` on the submit `motion.button` with `layoutId`
- [ ] Spring damping ratios: `springs.gentle` (ζ=0.95) and `springs.snappy` (ζ=1.0) both ≥ 0.7
- [ ] Named export only (`export function FeedbackForm`)
- [ ] `feedbackFormVariants` exported
- [ ] Both added to `components/ui/index.ts`
- [ ] No `dark:` prefix anywhere
- [ ] No `text-[var(--font-size-*)]` — uses `[font-size:var(--font-size-*)]` instead
- [ ] Story at `stories/ui/FeedbackForm.stories.tsx`

### Step 4: Token audit

```bash
grep -n "#[0-9a-fA-F]\{3,6\}\|text-zinc\|bg-white\|border-gray\|text-white" components/ui/feedback-form.tsx
```

Expected: no matches.

### Step 5: Visual smoke-test in Storybook (manual)

Start `npm run storybook` and verify:
1. Default story: collapsed trigger with "Request Changes" + Pencil icon, shadow-border visible
2. Click trigger: form expands, textarea auto-focuses, button row shows Cancel + "Request Changes" with ArrowUp
3. Button morph: the "Request Changes" button smoothly springs from full-width trigger position into the compact submit position (shared layoutId)
4. Click Cancel: form collapses back to trigger with reverse morph
5. Type text + click "Request Changes": `onSubmit` fires (check Actions panel), form collapses, textarea resets on next open
6. DefaultSurface: no shadow-border on either trigger or form
7. DisableMotion: instant swap, no animation
