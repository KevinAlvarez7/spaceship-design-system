# Chat Interface DS Components Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `ChatBubble`, `ChatMessage`, and `ChatThread` as DS primitives, export them from the barrel, register viewer pages, and add a pattern demo.

**Architecture:** Three CVA components in `components/ui/`, each following the existing DS conventions (named exports, semantic tokens, `surface` variant, `motion/react` for animation). A pattern page in `app/patterns/chat/` composes them into a live demo. Viewer pages live in `app/components/[component]/` as named page components registered in the dynamic route.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, CVA, motion/react, react-markdown (new dep).

---

### Task 1: Install react-markdown

**Files:**
- Modify: `package.json` (via npm)

**Step 1: Install the package**

```bash
npm install react-markdown
```

Expected output: `added N packages` with no errors.

**Step 2: Verify the build still compiles**

```bash
npm run build
```

Expected: `✓ Compiled successfully` (or equivalent Next.js success output).

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(deps): add react-markdown for ChatMessage markdown rendering"
```

---

### Task 2: Create ChatBubble component

**Files:**
- Create: `components/ui/chat-bubble.tsx`
- Modify: `components/ui/index.ts`

**Step 1: Create the component file**

Create `components/ui/chat-bubble.tsx` with this exact content:

```tsx
"use client";

import { type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const chatBubbleVariants = cva(
  [
    'max-w-[75%] px-(--spacing-2xs) py-(--spacing-3xs)',
    'bg-(--bg-surface-brand-secondary)',
    'rounded-tl-(--radius-xl) rounded-bl-(--radius-xl) rounded-br-(--radius-xl)',
    'text-(length:--font-size-base) leading-(--line-height-base)',
    'font-(family-name:--font-family-secondary)',
    'text-(--text-primary)',
  ],
  {
    variants: {
      surface: {
        default: '',
        'shadow-border': 'shadow-(--shadow-border)',
      },
    },
    defaultVariants: {
      surface: 'shadow-border',
    },
  }
);

export interface ChatBubbleProps extends VariantProps<typeof chatBubbleVariants> {
  children: ReactNode;
  className?: string;
}

export function ChatBubble({ children, surface, className }: ChatBubbleProps) {
  return (
    <div className="flex w-full justify-end pl-(--spacing-2xl)">
      <div className={cn(chatBubbleVariants({ surface }), className)}>
        {children}
      </div>
    </div>
  );
}

export { chatBubbleVariants };
```

> **Token notes:**
> - `--spacing-2xl` = 64px — the left indent that prevents the bubble spanning full width
> - `--bg-surface-brand-secondary` = orbit-blue-100 (#e1ecff)
> - Top-right corner has no `rounded-tr-*` class — this gives the classic "sent" bubble shape from Figma
> - `surface: 'shadow-border'` is the default so bubbles always have depth

**Step 2: Export from barrel**

Add to the bottom of `components/ui/index.ts`:

```ts
export { ChatBubble, chatBubbleVariants } from './chat-bubble';
export type { ChatBubbleProps } from './chat-bubble';
```

**Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: no TypeScript errors.

**Step 4: Commit**

```bash
git add components/ui/chat-bubble.tsx components/ui/index.ts
git commit -m "feat(ui): add ChatBubble component"
```

---

### Task 3: Create ChatMessage component

**Files:**
- Create: `components/ui/chat-message.tsx`
- Modify: `components/ui/index.ts`

**Step 1: Create the component file**

Create `components/ui/chat-message.tsx` with this exact content:

```tsx
"use client";

import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  content: string;
  isStreaming?: boolean;
  disableMotion?: boolean;
  className?: string;
}

export function ChatMessage({
  content,
  isStreaming = false,
  disableMotion = false,
  className,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        'w-full',
        'text-(length:--font-size-base) leading-(--line-height-base)',
        'font-(family-name:--font-family-secondary)',
        'text-(--text-primary)',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1',
        '[&_p]:mb-2 [&_p:last-child]:mb-0',
        '[&_strong]:[font-weight:var(--font-weight-semibold)]',
        '[&_code]:font-mono [&_code]:text-[0.875em] [&_code]:bg-(--bg-surface-secondary) [&_code]:px-1 [&_code]:rounded-(--radius-sm)',
        className
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
      {isStreaming && (
        disableMotion ? (
          <span className="inline-block w-0.5 h-5 bg-(--text-primary) ml-0.5 rounded-[1px] align-middle" />
        ) : (
          <motion.span
            className="inline-block w-0.5 h-5 bg-(--text-primary) ml-0.5 rounded-[1px] align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        )
      )}
    </div>
  );
}
```

> **Notes:**
> - Markdown styles are applied via Tailwind's arbitrary variant `[&_selector]` — no prose class needed
> - `isStreaming` appends a blinking cursor using `motion/react`; `disableMotion` renders a static cursor instead
> - The cursor renders after the markdown content block (standard pattern for streaming UIs)
> - `--bg-surface-secondary` is used for inline code background — verify this token exists in `styles/tokens.css`; if not, use `bg-(--bg-surface-raised)` instead

**Step 2: Export from barrel**

Add to `components/ui/index.ts`:

```ts
export { ChatMessage } from './chat-message';
export type { ChatMessageProps } from './chat-message';
```

**Step 3: Verify TypeScript compiles**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add components/ui/chat-message.tsx components/ui/index.ts
git commit -m "feat(ui): add ChatMessage component with markdown and streaming cursor"
```

---

### Task 4: Create ChatThread component

**Files:**
- Create: `components/ui/chat-thread.tsx`
- Modify: `components/ui/index.ts`

**Step 1: Create the component file**

Create `components/ui/chat-thread.tsx` with this exact content:

```tsx
"use client";

import { type ReactNode, useRef, useEffect, Children } from 'react';
import { cn } from '@/lib/utils';

export interface ChatThreadProps {
  children: ReactNode;
  className?: string;
}

export function ChatThread({ children, className }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const childCount = Children.count(children);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [childCount]);

  return (
    <div
      className={cn(
        'flex flex-col gap-(--spacing-3xs)',
        'overflow-y-auto',
        'px-(--spacing-2xs) pb-(--spacing-3xs) pt-(--spacing-xs)',
        className
      )}
    >
      {children}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
```

> **Notes:**
> - `Children.count(children)` triggers scroll whenever a new message is added
> - The sentinel `<div ref={bottomRef}>` is the scroll target — placed after all children
> - The consumer controls height (e.g., `className="h-full"` or `className="flex-1"`)
> - `gap-(--spacing-3xs)` = 12px between messages

**Step 2: Export from barrel**

Add to `components/ui/index.ts`:

```ts
export { ChatThread } from './chat-thread';
export type { ChatThreadProps } from './chat-thread';
```

**Step 3: Verify TypeScript compiles**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add components/ui/chat-thread.tsx components/ui/index.ts
git commit -m "feat(ui): add ChatThread scrollable container component"
```

---

### Task 5: Add viewer pages for all three components

**Files:**
- Create: `app/components/[component]/ChatBubblePage.tsx`
- Create: `app/components/[component]/ChatMessagePage.tsx`
- Create: `app/components/[component]/ChatMessageDemo.tsx`
- Create: `app/components/[component]/ChatThreadPage.tsx`
- Create: `app/components/[component]/ChatThreadDemo.tsx`
- Modify: `app/components/[component]/page.tsx`
- Modify: `components/viewer/Sidebar.tsx`

**Step 1: Create ChatBubblePage.tsx**

Create `app/components/[component]/ChatBubblePage.tsx`:

```tsx
import { ChatBubble } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'children',  type: 'ReactNode', default: '—',               description: 'Message content — text or any inline elements' },
  { name: 'surface',   type: '"default" | "shadow-border"', default: '"shadow-border"', description: 'Adds shadow-border treatment to the bubble' },
  { name: 'className', type: 'string',    default: '—',               description: 'Extra classes on the bubble element' },
];

const USAGE = `import { ChatBubble } from '@/components/ui';

<ChatBubble>I know my problem statement, let's build the prototype!</ChatBubble>

// Without shadow
<ChatBubble surface="default">Short reply</ChatBubble>`;

export function ChatBubblePage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Bubble</h1>
        <p className="mt-2 text-sm text-zinc-500">
          User message bubble. Always right-aligned with brand-secondary background and a flat top-right corner.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default (shadow-border)</h2>
        <Preview label='surface="shadow-border"'>
          <ChatBubble>I know my problem statement, let's build the prototype!</ChatBubble>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Flat (no shadow)</h2>
        <Preview label='surface="default"'>
          <ChatBubble surface="default">Improve the prototype</ChatBubble>
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

**Step 2: Create ChatMessageDemo.tsx**

Create `app/components/[component]/ChatMessageDemo.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ChatMessage } from '@/components/ui';

const FULL_TEXT = `Here's what I built:

**Core screens:**
- Kiosk scan state with sample data
- Officer exception console
- Audit trail view

Ready to click through immediately.`;

export function ChatMessageStreamingDemo() {
  const [displayed, setDisplayed] = useState('');
  const [streaming, setStreaming] = useState(true);

  useEffect(() => {
    if (!streaming) return;
    if (displayed.length >= FULL_TEXT.length) {
      setStreaming(false);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayed(FULL_TEXT.slice(0, displayed.length + 3));
    }, 30);
    return () => clearTimeout(timer);
  }, [displayed, streaming]);

  function restart() {
    setDisplayed('');
    setStreaming(true);
  }

  return (
    <div className="space-y-4">
      <ChatMessage content={displayed} isStreaming={streaming} />
      {!streaming && (
        <button
          onClick={restart}
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ↺ Replay
        </button>
      )}
    </div>
  );
}
```

**Step 3: Create ChatMessagePage.tsx**

Create `app/components/[component]/ChatMessagePage.tsx`:

```tsx
import { ChatMessage } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { ChatMessageStreamingDemo } from './ChatMessageDemo';

const PROPS: PropRow[] = [
  { name: 'content',       type: 'string',  default: '—',     description: 'Markdown string to render' },
  { name: 'isStreaming',   type: 'boolean', default: 'false', description: 'Appends an animated blinking cursor while true' },
  { name: 'disableMotion', type: 'boolean', default: 'false', description: 'Renders a static cursor instead of animated' },
  { name: 'className',     type: 'string',  default: '—',     description: 'Extra classes on the wrapper div' },
];

const STATIC_MD = `I'll spin up a low-fi interface with the core screens and sample data.

**What's built:**
- Kiosk scan state
- Officer exception console
- Audit trail

Ready to start vibing! 🎨`;

const USAGE = `import { ChatMessage } from '@/components/ui';

// Static
<ChatMessage content={markdownString} />

// Streaming — update content as tokens arrive, flip isStreaming off when done
<ChatMessage content={partialContent} isStreaming={isStreaming} />`;

export function ChatMessagePage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Message</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Assistant response block. Renders markdown and optionally shows an animated streaming cursor.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Static markdown</h2>
        <Preview label="isStreaming={false}">
          <ChatMessage content={STATIC_MD} />
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Streaming simulation</h2>
        <Preview label="isStreaming={true}">
          <ChatMessageStreamingDemo />
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

**Step 4: Create ChatThreadDemo.tsx**

Create `app/components/[component]/ChatThreadDemo.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { ChatThread, ChatBubble, ChatMessage } from '@/components/ui';

type Message = { role: 'user' | 'assistant'; content: string };

const SEED: Message[] = [
  { role: 'user',      content: 'What can you help me build?' },
  { role: 'assistant', content: 'I can help you prototype ideas, explore problems, and build interactive demos. What are you working on?' },
  { role: 'user',      content: 'I need a dashboard for logistics tracking.' },
  { role: 'assistant', content: 'Great choice! A **logistics dashboard** could include:\n\n- Real-time shipment map\n- Status timeline per order\n- Exception alerts\n\nShall I start with a low-fi wireframe?' },
];

export function ChatThreadDemo() {
  const [messages, setMessages] = useState<Message[]>(SEED);
  const [input, setInput] = useState('');

  function addMessage() {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', content: input },
      { role: 'assistant', content: `Got it — you said: *"${input}"*. I'll work on that now.` },
    ]);
    setInput('');
  }

  return (
    <div className="flex flex-col h-[480px] gap-3">
      <ChatThread className="flex-1">
        {messages.map((msg, i) =>
          msg.role === 'user'
            ? <ChatBubble key={i}>{msg.content}</ChatBubble>
            : <ChatMessage key={i} content={msg.content} />
        )}
      </ChatThread>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMessage()}
          placeholder="Type a message and press Enter…"
          className="flex-1 rounded border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-300"
        />
        <button
          onClick={addMessage}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

> **Note:** The input/button in the demo are plain HTML styled with Tailwind zinc (this is viewer chrome, not DS components). The pattern page will use `ChatInputBox` instead.

**Step 5: Create ChatThreadPage.tsx**

Create `app/components/[component]/ChatThreadPage.tsx`:

```tsx
import { Preview } from '@/components/viewer/Preview';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock } from '@/components/viewer/CodeBlock';
import { ChatThreadDemo } from './ChatThreadDemo';

const PROPS: PropRow[] = [
  { name: 'children',  type: 'ReactNode', default: '—', description: 'ChatBubble and ChatMessage elements to render in sequence' },
  { name: 'className', type: 'string',    default: '—', description: 'Apply height constraints here (e.g. h-full, flex-1)' },
];

const USAGE = `import { ChatThread, ChatBubble, ChatMessage } from '@/components/ui';

<ChatThread className="flex-1">
  <ChatBubble>User message</ChatBubble>
  <ChatMessage content="Assistant reply with **markdown**." />
  <ChatBubble>Another user message</ChatBubble>
  <ChatMessage content={streamingContent} isStreaming={isStreaming} />
</ChatThread>`;

export function ChatThreadPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Thread</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Scrollable message container. Automatically scrolls to the bottom when new messages are added.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Interactive demo</h2>
        <Preview label="type a message and press Enter">
          <ChatThreadDemo />
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

**Step 6: Register the new pages in the dynamic route**

Modify `app/components/[component]/page.tsx` — add three imports and three PAGES entries:

```tsx
// Add these imports alongside the existing ones:
import { ChatBubblePage }  from './ChatBubblePage';
import { ChatMessagePage } from './ChatMessagePage';
import { ChatThreadPage }  from './ChatThreadPage';
```

```tsx
// Add these entries to the PAGES record:
'chat-bubble':  { title: 'Chat Bubble',  Component: ChatBubblePage },
'chat-message': { title: 'Chat Message', Component: ChatMessagePage },
'chat-thread':  { title: 'Chat Thread',  Component: ChatThreadPage },
```

**Step 7: Add Sidebar nav entries**

In `components/viewer/Sidebar.tsx`, find the `Components` section and add three entries after `Chat Input Box`:

```tsx
{ label: 'Chat Bubble',  href: '/components/chat-bubble' },
{ label: 'Chat Message', href: '/components/chat-message' },
{ label: 'Chat Thread',  href: '/components/chat-thread' },
```

**Step 8: Verify build**

```bash
npm run build
```

Expected: clean build, all three routes included in `generateStaticParams`.

**Step 9: Commit**

```bash
git add \
  app/components/[component]/ChatBubblePage.tsx \
  app/components/[component]/ChatMessagePage.tsx \
  app/components/[component]/ChatMessageDemo.tsx \
  app/components/[component]/ChatThreadPage.tsx \
  app/components/[component]/ChatThreadDemo.tsx \
  app/components/[component]/page.tsx \
  components/viewer/Sidebar.tsx
git commit -m "feat(viewer): add ChatBubble, ChatMessage, ChatThread viewer pages"
```

---

### Task 6: Create Chat pattern demo page

**Files:**
- Create: `app/patterns/chat/page.tsx`
- Modify: `components/viewer/Sidebar.tsx`

**Step 1: Create the pattern page**

Create `app/patterns/chat/page.tsx`:

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatThread, ChatBubble, ChatMessage, ChatInputBox } from '@/components/ui';

type Message =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; streaming?: boolean };

const INITIAL: Message[] = [
  { role: 'user',      content: 'I know my problem statement, let\'s build the prototype!' },
  { role: 'assistant', content: 'I\'ll spin up a low-fi interface with the core screens (Kiosk scan state, Officer exception console, Audit trail) and sample data so you can click through immediately.' },
  { role: 'user',      content: 'Improve the prototype' },
];

const STREAMING_RESPONSE = `Vibe Prototype Platform Complete!

I've successfully created a playful, inviting prototype platform with all the features you requested:

**What's Built:**
- Interactive Dashboard — project tiles, visual editor, and collaboration features
- Vibe Code Editor — natural language input with real-time preview
- AI Suggestions — playful tooltips and refinement hints
- Collaboration Tools — avatars, sticky notes, and micro-animations

Ready to start vibing with your prototypes! 🎨✨`;

export default function ChatPatternPage() {
  const [messages, setMessages]       = useState<Message[]>(INITIAL);
  const [inputValue, setInputValue]   = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming]  = useState(true);
  const streamIndexRef                = useRef(0);

  // Simulate streaming the last assistant message on mount
  useEffect(() => {
    if (!isStreaming) return;
    if (streamIndexRef.current >= STREAMING_RESPONSE.length) {
      setIsStreaming(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: STREAMING_RESPONSE },
      ]);
      return;
    }
    const timer = setTimeout(() => {
      streamIndexRef.current += 4;
      setStreamedText(STREAMING_RESPONSE.slice(0, streamIndexRef.current));
    }, 20);
    return () => clearTimeout(timer);
  }, [streamedText, isStreaming]);

  function handleSubmit(value: string) {
    if (!value.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: value }]);
    setInputValue('');
    // Simulate a short assistant reply
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Got it — I'll work on that now. Give me a moment to process *"${value}"*.` },
      ]);
    }, 800);
  }

  return (
    <div className="flex flex-col h-full">
      <ChatThread className="flex-1 min-h-0">
        {messages.map((msg, i) =>
          msg.role === 'user'
            ? <ChatBubble key={i}>{msg.content}</ChatBubble>
            : <ChatMessage key={i} content={msg.content} />
        )}
        {isStreaming && (
          <ChatMessage content={streamedText} isStreaming />
        )}
      </ChatThread>

      <div className="px-(--spacing-2xs) pb-(--spacing-3xs) shrink-0">
        <ChatInputBox
          size="sm"
          submitLabel="Send"
          placeholder="Iterate further..."
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onSubmit={handleSubmit}
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}
```

**Step 2: Add Sidebar entry**

In `components/viewer/Sidebar.tsx`, find the `Patterns` children array and add after `Gravity Chat`:

```tsx
{ label: 'Chat', href: '/patterns/chat' },
```

**Step 3: Verify build**

```bash
npm run build
```

Expected: clean build, no TypeScript errors.

**Step 4: Commit**

```bash
git add app/patterns/chat/page.tsx components/viewer/Sidebar.tsx
git commit -m "feat(patterns): add Chat pattern demo page"
```

---

## Verification Checklist

After all tasks complete, run:

```bash
npm run build && npm run lint
```

Then open `npm run dev` and verify:
- `/components/chat-bubble` — shows two preview variants (shadow-border, flat)
- `/components/chat-message` — shows static markdown + streaming replay demo
- `/components/chat-thread` — shows interactive thread with input
- `/patterns/chat` — shows full chat layout with streaming on mount, then live input

## Token Verification

Before building, grep for `--bg-surface-secondary` in `styles/tokens.css`:

```bash
grep "bg-surface-secondary" styles/tokens.css
```

If not found, replace `bg-(--bg-surface-secondary)` in `chat-message.tsx` with `bg-(--bg-surface-raised)` or remove the inline code background entirely.
