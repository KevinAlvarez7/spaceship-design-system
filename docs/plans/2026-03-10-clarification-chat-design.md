# Clarification Chat Page — Design Doc

**Date:** 2026-03-10
**Status:** Approved
**URL:** `/patterns/clarification-chat`

---

## Purpose

A chat-embedded demo of the structured clarification flow. Each stage renders as an interactive assistant turn inside a `ChatThread`. On Continue, answers appear as a right-aligned `ChatBubble`. Simulated typing delay between stages mimics Claude's response latency. Follows the Claude Code AskUserQuestion pattern: questions grouped per stage, user answers in one submit.

Complements the existing `/patterns/structured-clarification` card-only demo — this is the conversational variant.

---

## Registration

```ts
{ slug: 'clarification-chat', title: 'Clarification Chat', section: 'Pages', route: 'patterns', layout: 'bare', experiment: true }
```

- Bare layout (full viewport, no topbar `<main>` wrapper)
- Added to `PATTERNS` map in `app/patterns/[pattern]/page.tsx`

---

## File

```
app/patterns/[pattern]/ClarificationChatPage.tsx   ← single "use client" file, all logic inside
```

No server/client split needed — bare-layout pages are always client (see `PrototypeWorkspacePage`).

---

## Message Model

```ts
type ThreadItem =
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'user-bubble';    id: string; content: string }
  | { kind: 'stage-card';     id: string; stageIndex: number }
  | { kind: 'typing';         id: string }
```

- `assistant-text` → `<ChatMessage content={...} />`
- `user-bubble`    → `<ChatBubble>{content}</ChatBubble>`
- `stage-card`     → inline `<ClarificationStageCard>` with full interactivity
- `typing`         → 3 pulsing dots, replaced by next item after ~800ms

Initial thread state on mount:
```ts
[
  { kind: 'assistant-text', id: 'intro', content: "Before I start building, I have a few questions..." },
  { kind: 'stage-card',     id: 'stage-0', stageIndex: 0 },
]
```

### Submit flow (per stage)

1. User clicks Continue on stage card
2. Replace `stage-card` item with `user-bubble` (formatted answer summary)
3. Append `typing` item
4. After 800ms: remove `typing`, append next `stage-card` (or closing `assistant-text` for final)

---

## ClarificationStageCard Component

Inline component (not exported, extraction-ready). Left-aligned in thread, `max-w-lg`.

```
┌─────────────────────────────────────────┐
│ A few questions to clarify Stage N:     │  ← xs, tertiary, uppercase
│                                         │
│ [question label]                        │  ← sm, semibold, primary
│ [pill] [pill] [pill]                    │
│                                         │
│ [question label]                        │
│ [pill] [pill] [pill]                    │
│                   [Continue →]          │
└─────────────────────────────────────────┘
```

Tokens:
- Card: `bg-(--bg-surface-base) shadow-(--shadow-border) rounded-xl p-4`
- Continue: `<Button variant="primary" size="sm" disabled={!complete}>`
- Question types: same `SingleSelect`, `MultiSelect`, `RankPriorities` logic as `StructuredClarificationDemos`

### Answer summary format (for ChatBubble)

Stage 1 example:
```
Primary user: Government officer
Pain points: Too many manual steps · Process takes too long
```

Stage 3 RankPriorities:
```
Priorities: Correctness › Speed of delivery › Visual polish › …
Ready to proceed: Yes, build it
```

---

## Typing Indicator

Simple inline JSX, no new component:

```tsx
<div className="flex items-center gap-1 px-1 py-2">
  {[0, 1, 2].map(i => (
    <motion.span
      key={i}
      className="w-1.5 h-1.5 rounded-full bg-(--text-tertiary)"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
    />
  ))}
</div>
```

---

## Final State

After Stage 3 submit + typing delay, closing `assistant-text`:

```
Thanks — I have everything I need. Here's what I'll build:

**User:** [answer]
**Pain points:** [answers]
**Output:** [answer]
**Constraints:** [answers]
**Priorities:** [ranked list]
**Approach:** [answer]
```

Content is dynamically built from the submitted `StageAnswers[]`.

`ChatInputBox` at bottom: disabled while Q&A in progress, enabled after final message appears. Placeholder changes: "Answering questions..." → "What would you like to change?" after completion.

---

## Stage Data

Identical STAGES constant to `StructuredClarificationDemos` — same 3 stages, same questions, same required flags. The file does NOT import from `StructuredClarificationDemos`; it re-declares locally (both files are extraction candidates to `components/patterns/ClarificationCard.tsx`).

---

## DS Token Rules

Same rules as `StructuredClarificationDemos`:
- No Tailwind colour utilities, no hardcoded hex
- Tailwind v4 paren syntax throughout
- No inline `style={{ }}` for token values
- No `dark:` prefix
- dnd-kit `style={{ transform, transition }}` is the only intentional inline style exception
