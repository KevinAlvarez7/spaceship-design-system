# ChatInputBox Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `ChatInputBox` DS component with `professional` and `neo-brutalist` surface variants for experimenting with distinct design treatments.

**Architecture:** Single CVA component with a `surface` prop that controls both the container wrapper and the internal `Button`. Uses a native `<textarea>` (not the existing `Input` — that's single-line). Reuses the existing `Button` DS component with a matching `surface` value.

**Tech Stack:** Next.js 16 · TypeScript · Tailwind v4 · CVA · CSS custom properties

---

### Task 1: Create `components/ui/chat-input-box.tsx`

**Files:**
- Create: `components/ui/chat-input-box.tsx`

**Step 1: Create the file with this exact content**

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from './button';

const chatInputBoxVariants = cva(
  [
    'w-full flex flex-col gap-3 p-3',
    'bg-[var(--bg-surface-primary)]',
  ],
  {
    variants: {
      surface: {
        professional: [
          'rounded-[var(--radius-sm)]',
          'shadow-[var(--shadow-border)]',
        ],
        'neo-brutalist': [
          'rounded-[var(--radius-sm)]',
          'border-2 border-[var(--border-default)]',
          'shadow-[var(--shadow-neo-brutalist)]',
        ],
      },
    },
    defaultVariants: {
      surface: 'professional',
    },
  }
);

export interface ChatInputBoxProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'>,
    VariantProps<typeof chatInputBoxVariants> {
  onSubmit?: (value: string) => void;
  containerClassName?: string;
}

function UpArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 12V4M8 4L4 8M8 4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RightArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 8h8M12 8l-4-4M12 8l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChatInputBox({
  surface = 'professional',
  onSubmit,
  containerClassName,
  className,
  value,
  onChange,
  placeholder = 'Explore any problems, prototype any ideas...',
  disabled,
  ...props
}: ChatInputBoxProps) {
  function handleSubmit() {
    if (typeof value === 'string') onSubmit?.(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className={cn(chatInputBoxVariants({ surface }), containerClassName)}>
      <textarea
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className={cn(
          'w-full resize-none bg-transparent',
          'text-[length:var(--font-size-base)] leading-[var(--line-height-base)]',
          'font-[family-name:var(--font-family-secondary)]',
          'text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)]',
          'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          surface={surface}
          disabled={disabled}
          onClick={handleSubmit}
        >
          Explore
          {surface === 'neo-brutalist' ? <RightArrowIcon /> : <UpArrowIcon />}
        </Button>
      </div>
    </div>
  );
}

export { chatInputBoxVariants };
```

**Step 2: Verify the build compiles**

Run: `npm run build 2>&1 | tail -20`
Expected: no TypeScript errors related to `chat-input-box.tsx`

**Step 3: Commit**

```bash
git add components/ui/chat-input-box.tsx
git commit -m "feat(chat-input-box): add ChatInputBox DS component with professional and neo-brutalist surfaces"
```

---

### Task 2: Export from barrel `components/ui/index.ts`

**Files:**
- Modify: `components/ui/index.ts`

**Step 1: Add these three lines after the Badge export**

```ts
export { ChatInputBox, chatInputBoxVariants } from './chat-input-box';
export type { ChatInputBoxProps } from './chat-input-box';
```

**Step 2: Verify build still compiles**

Run: `npm run build 2>&1 | tail -20`
Expected: clean

**Step 3: Commit**

```bash
git add components/ui/index.ts
git commit -m "feat(chat-input-box): export ChatInputBox from ui barrel"
```

---

### Task 3: Create viewer page `app/components/[component]/ChatInputBoxPage.tsx`

**Files:**
- Create: `app/components/[component]/ChatInputBoxPage.tsx`

**Step 1: Create the file with this exact content**

```tsx
'use client';

import { useState } from 'react';
import { ChatInputBox } from '@/components/ui';
import { Preview }    from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'surface',            type: '"professional" | "neo-brutalist"', default: '"professional"', description: 'Surface treatment — controls container and button styling' },
  { name: 'placeholder',        type: 'string',   default: '"Explore any problems..."', description: 'Textarea placeholder text' },
  { name: 'value',              type: 'string',   default: '—', description: 'Controlled textarea value' },
  { name: 'onChange',           type: '(e) => void', default: '—', description: 'Textarea change handler' },
  { name: 'onSubmit',           type: '(value: string) => void', default: '—', description: 'Called on Explore click or Cmd/Ctrl+Enter' },
  { name: 'disabled',           type: 'boolean',  default: 'false', description: 'Disables textarea and button' },
  { name: 'containerClassName', type: 'string',   default: '—', description: 'Extra classes on the container div' },
];

const USAGE = `import { ChatInputBox } from '@/components/ui';

// Professional
<ChatInputBox
  surface="professional"
  value={value}
  onChange={e => setValue(e.target.value)}
  onSubmit={val => console.log(val)}
/>

// Neo-brutalist
<ChatInputBox
  surface="neo-brutalist"
  value={value}
  onChange={e => setValue(e.target.value)}
  onSubmit={val => console.log(val)}
/>`;

function ControlledDemo({ surface }: { surface: 'professional' | 'neo-brutalist' }) {
  const [value, setValue] = useState('');
  return (
    <ChatInputBox
      surface={surface}
      value={value}
      onChange={e => setValue(e.target.value)}
      onSubmit={val => console.log('submit:', val)}
      className="w-full max-w-lg"
    />
  );
}

export function ChatInputBoxPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Input Box</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Multiline text input with a submit button. Two surface treatments for design experimentation.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Professional</h2>
        <Preview label='surface="professional"'>
          <ControlledDemo surface="professional" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Neo-brutalist</h2>
        <Preview label='surface="neo-brutalist"'>
          <ControlledDemo surface="neo-brutalist" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Disabled</h2>
        <Preview label="disabled">
          <ChatInputBox surface="professional" disabled placeholder="Disabled state" className="w-full max-w-lg" />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Props</h2>
        <PropsTable props={PROPS} />
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Usage</h2>
        <CodeBlock code={USAGE} lang="tsx" />
      </section>
    </div>
  );
}
```

**Note:** The viewer page uses `'use client'` because it has `useState`. This follows the existing pattern — check `app/components/[component]/ButtonPage.tsx` if you see a similar pattern there, otherwise this is fine because Next.js App Router supports client components inside server-rendered pages.

**Step 2: Verify the build**

Run: `npm run build 2>&1 | tail -20`
Expected: clean

**Step 3: Commit**

```bash
git add app/components/\[component\]/ChatInputBoxPage.tsx
git commit -m "feat(chat-input-box): add viewer page with professional and neo-brutalist previews"
```

---

### Task 4: Wire into the component router `app/components/[component]/page.tsx`

**Files:**
- Modify: `app/components/[component]/page.tsx`

**Step 1: Add the import at line 6 (after the BadgePage import)**

```tsx
import { ChatInputBoxPage } from './ChatInputBoxPage';
```

**Step 2: Add the entry to the PAGES record (after `badge:`)**

```ts
'chat-input-box': { title: 'Chat Input Box', Component: ChatInputBoxPage },
```

The full updated `PAGES` block should look like:

```ts
const PAGES: Record<string, { title: string; Component: React.ComponentType }> = {
  button:          { title: 'Button',         Component: ButtonPage },
  input:           { title: 'Input',          Component: InputPage },
  card:            { title: 'Card',           Component: CardPage },
  badge:           { title: 'Badge',          Component: BadgePage },
  'chat-input-box': { title: 'Chat Input Box', Component: ChatInputBoxPage },
};
```

**Step 3: Verify build**

Run: `npm run build 2>&1 | tail -20`
Expected: clean, and `chat-input-box` appears in the static params output

**Step 4: Commit**

```bash
git add app/components/\[component\]/page.tsx
git commit -m "feat(chat-input-box): register chat-input-box route in component page router"
```

---

### Task 5: Add nav entry to `components/viewer/Sidebar.tsx`

**Files:**
- Modify: `components/viewer/Sidebar.tsx`

**Step 1: Add `Chat Input Box` to the Components children array**

The Components section should become:

```ts
{
  label: 'Components',
  children: [
    { label: 'Button',         href: '/components/button' },
    { label: 'Input',          href: '/components/input' },
    { label: 'Card',           href: '/components/card' },
    { label: 'Badge',          href: '/components/badge' },
    { label: 'Chat Input Box', href: '/components/chat-input-box' },
  ],
},
```

**Step 2: Final build verification**

Run: `npm run build 2>&1 | tail -20`
Expected: clean build, no errors

Run: `npm run lint 2>&1 | tail -10`
Expected: no lint errors

**Step 3: Commit**

```bash
git add components/viewer/Sidebar.tsx
git commit -m "feat(chat-input-box): add Chat Input Box to sidebar nav"
```

---

### Task 6: Visual verification

**Step 1: Start the dev server**

Run: `npm run dev`

**Step 2: Open the viewer**

Navigate to: `http://localhost:3000/components/chat-input-box`

**Verify checklist:**
- [ ] Professional variant renders with subtle shadow elevation, no hard border
- [ ] Neo-brutalist variant renders with `border-2 + 2px offset shadow`
- [ ] Explore button on professional shows up-arrow ↑
- [ ] Explore button on neo-brutalist shows right-arrow →
- [ ] Typing in each textarea updates the value
- [ ] Disabled state greys out both textarea and button
- [ ] Both variants are visually distinct and clearly different from each other
- [ ] "Chat Input Box" appears in the sidebar under Components and is clickable
