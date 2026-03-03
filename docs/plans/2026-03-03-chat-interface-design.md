# Chat Interface DS Components — Design

**Date:** 2026-03-03
**Status:** Approved

## Overview

Add three new DS primitives that compose into a full chat interface, based on the Figma design at node `11195:14717`. The `ChatInputBox` (size `sm`) serves as the input base.

## Components

### `ChatBubble` (`components/ui/chat-bubble.tsx`)

User message bubble — always right-aligned.

**Visual:**
- Right-aligned row: full-width flex with `justify-end`, leading padding (`pl`) to prevent full-width stretch
- Background: `bg-(--bg-surface-brand-secondary)`
- Border radius: all corners `rounded-(--radius-xl)` except top-right (0) — classic "sent" bubble shape
- Shadow: `shadow-(--shadow-border)`
- Padding: `px-(--spacing-2xs) py-(--spacing-3xs)`
- Max width: `max-w-[75%]`
- Typography: body-base, `text-(--text-primary)`, `font-(family-name:--font-family-secondary)`

**API:**
```tsx
interface ChatBubbleProps {
  children: ReactNode;
  surface?: 'default' | 'shadow-border';
  className?: string;
}
```

**CVA variants:** `surface` (`default` / `shadow-border`).

---

### `ChatMessage` (`components/ui/chat-message.tsx`)

Assistant response block — full-width, markdown-rendered, with optional streaming cursor.

**Visual:**
- Full-width, no background
- Typography: body-base, `text-(--text-primary)`, `font-(family-name:--font-family-secondary)`
- Markdown: paragraphs, `ul`/`ol` lists, bold, inline code — styled via semantic tokens
- Streaming cursor: animated blinking `|` appended using `motion/react` when `isStreaming={true}`

**API:**
```tsx
interface ChatMessageProps {
  content: string;
  isStreaming?: boolean;
  disableMotion?: boolean;
  className?: string;
}
```

**Dependency:** `react-markdown` (new, ~15kb gzipped).

---

### `ChatThread` (`components/ui/chat-thread.tsx`)

Scrollable message container.

**Visual:**
- `overflow-y-auto`, `flex flex-col`, `gap-(--spacing-3xs)`
- Padding: `px-(--spacing-2xs) pb-(--spacing-3xs) pt-(--spacing-xs)`
- Auto-scrolls to bottom when children count changes via `useEffect`

**API:**
```tsx
interface ChatThreadProps {
  children: ReactNode;
  className?: string;
}
```

---

## Pattern Demo

`app/patterns/chat/page.tsx`

- Pre-seeded conversation (2 user bubbles + 2 assistant messages)
- Live streaming simulation on the last assistant message (typewriter via `setInterval`)
- `ChatInputBox size="sm"` pinned at bottom
- Full-height layout matching the gravity-chat pattern structure

## Viewer Pages

- `app/components/chat-bubble/page.tsx`
- `app/components/chat-message/page.tsx`
- `app/components/chat-thread/page.tsx`

Each page added to `components/viewer/Sidebar.tsx` nav.

## New Dependency

- `react-markdown` — markdown rendering for `ChatMessage`

## Files Changed

| Action | Path |
|--------|------|
| Create | `components/ui/chat-bubble.tsx` |
| Create | `components/ui/chat-message.tsx` |
| Create | `components/ui/chat-thread.tsx` |
| Modify | `components/ui/index.ts` |
| Create | `app/components/chat-bubble/page.tsx` |
| Create | `app/components/chat-message/page.tsx` |
| Create | `app/components/chat-thread/page.tsx` |
| Create | `app/patterns/chat/page.tsx` |
| Modify | `components/viewer/Sidebar.tsx` |
