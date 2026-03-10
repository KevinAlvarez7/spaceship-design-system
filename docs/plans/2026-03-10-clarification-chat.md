# Clarification Chat Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a chat-embedded clarification flow where each stage appears as an interactive assistant turn, answers become a `ChatBubble`, and a typing indicator bridges stages — mirroring Claude Code's Q&A style.

**Architecture:** Single `"use client"` bare-layout page (`ClarificationChatPage.tsx`). State is a `ThreadItem[]` array that can hold assistant text, user bubbles, interactive stage cards, or a typing indicator. On stage submit, the card is replaced by a user bubble + typing item; after 800ms the typing item is replaced by the next stage card (or closing message). Question-type components (SingleSelect, MultiSelect, RankPriorities) are declared locally, extraction-ready.

**Tech Stack:** Next.js 16.1, React 19, Tailwind v4, motion/react, @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities (already installed), DS components from `@/components/ui`.

**Reference:** Design doc at `docs/plans/2026-03-10-clarification-chat-design.md`

---

### Task 1: Register the page

**Files:**
- Modify: `lib/viewer-registry.ts` (~line 71, Pages block)
- Modify: `app/patterns/[pattern]/page.tsx` (import + PATTERNS map)

**Step 1: Add registry entry**

In `lib/viewer-registry.ts`, append after `structured-clarification`:

```ts
{ slug: 'clarification-chat', title: 'Clarification Chat', section: 'Pages', route: 'patterns', layout: 'bare', experiment: true },
```

**Step 2: Update patterns router**

In `app/patterns/[pattern]/page.tsx`, add:

```ts
import { ClarificationChatPage } from './ClarificationChatPage';
```

And in the PATTERNS map:

```ts
'clarification-chat': ClarificationChatPage,
```

**Step 3: Commit (the import will fail until Task 2 — commit anyway, build happens after Task 2)**

```bash
git add lib/viewer-registry.ts "app/patterns/[pattern]/page.tsx"
git commit -m "feat: register clarification-chat page in viewer"
```

---

### Task 2: Create ClarificationChatPage.tsx

**Files:**
- Create: `app/patterns/[pattern]/ClarificationChatPage.tsx`

**Step 1: Write the complete file**

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChatThread, ChatBubble, ChatMessage, ChatInputBox, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
// Extraction-ready: these types + question components can move to
// components/patterns/ClarificationCard.tsx alongside the ones in
// StructuredClarificationDemos.tsx when extracted.

type SingleSelectQuestion   = { type: 'single'; label: string; options: string[]; required?: boolean };
type MultiSelectQuestion    = { type: 'multi';  label: string; options: string[]; required?: boolean };
type RankPrioritiesQuestion = { type: 'rank';   label: string; items: string[] };
type Question = SingleSelectQuestion | MultiSelectQuestion | RankPrioritiesQuestion;

type Stage = {
  title: string;
  questions: Question[];
};

type StageAnswers = Record<number, string | string[]>;

type ThreadItem =
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'user-bubble';    id: string; content: string }
  | { kind: 'stage-card';     id: string; stageIndex: number }
  | { kind: 'typing';         id: string };

type ClarificationStageCardProps = {
  stageIndex: number;
  onSubmit: (answers: StageAnswers) => void;
};

// ─── Stage Data ───────────────────────────────────────────────────────────────

const STAGES: Stage[] = [
  {
    title: 'Stage 1 — Problem Clarification',
    questions: [
      {
        type: 'single',
        label: 'Who is the primary user?',
        options: ['Government officer', 'Admin & ops', 'Public citizen', 'Internal developer'],
        required: true,
      },
      {
        type: 'multi',
        label: 'What pain points does this solve?',
        options: [
          'Too many manual steps',
          'Hard to find information',
          'Process takes too long',
          'Errors from copy-pasting',
          'No visibility into status',
        ],
        required: true,
      },
    ],
  },
  {
    title: 'Stage 2 — Solution Clarification',
    questions: [
      {
        type: 'single',
        label: 'What will this feature produce?',
        options: ['A form', 'A dashboard', 'An automated action', 'A report or export'],
        required: true,
      },
      {
        type: 'multi',
        label: 'Which constraints apply?',
        options: [
          'Must work on mobile',
          'WCAG AA accessible',
          'No new backend',
          'Fits existing design system',
        ],
        required: true,
      },
    ],
  },
  {
    title: 'Stage 3 — Implementation Confirmation',
    questions: [
      {
        type: 'rank',
        label: 'Rank what matters most',
        items: ['Correctness', 'Speed of delivery', 'Visual polish', 'Edge case handling', 'Test coverage'],
      },
      {
        type: 'single',
        label: 'Ready to proceed?',
        options: ['Yes, build it', 'Let me adjust the plan', 'Start with a skeleton only'],
        required: true,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isStageComplete(stage: Stage, answers: StageAnswers): boolean {
  return stage.questions.every((q, i) => {
    if (!('required' in q) || !q.required) return true;
    const answer = answers[i];
    if (q.type === 'single') return typeof answer === 'string' && answer.length > 0;
    if (q.type === 'multi') return Array.isArray(answer) && answer.length > 0;
    return true;
  });
}

function buildAnswerSummary(stage: Stage, answers: StageAnswers): string {
  const lines: string[] = [];
  stage.questions.forEach((q, i) => {
    const answer = answers[i];
    if (!answer || (Array.isArray(answer) && answer.length === 0)) return;
    const label = q.label.replace('?', '').trim();
    if (Array.isArray(answer)) {
      lines.push(q.type === 'rank'
        ? `${label}: ${answer.join(' › ')}`
        : `${label}: ${answer.join(' · ')}`
      );
    } else {
      lines.push(`${label}: ${answer}`);
    }
  });
  return lines.join('\n');
}

function buildClosingMessage(allAnswers: StageAnswers[]): string {
  const s0 = allAnswers[0] ?? {};
  const s1 = allAnswers[1] ?? {};
  const s2 = allAnswers[2] ?? {};

  const primaryUser    = s0[0] as string | undefined;
  const painPoints     = s0[1] as string[] | undefined;
  const featureOutput  = s1[0] as string | undefined;
  const constraints    = s1[1] as string[] | undefined;
  const priorities     = s2[0] as string[] | undefined;
  const readyToProceed = s2[1] as string | undefined;

  return `Thanks — I have everything I need. Here's what I'll build:

**Primary user:** ${primaryUser ?? '—'}
**Pain points:** ${painPoints?.join(', ') ?? '—'}
**Output:** ${featureOutput ?? '—'}
**Constraints:** ${constraints?.join(', ') ?? '—'}
**Priorities:** ${priorities?.join(' › ') ?? '—'}
**Approach:** ${readyToProceed ?? '—'}`;
}

// ─── Pill button shared classes ───────────────────────────────────────────────

const PILL_BASE = [
  'rounded-full px-3 py-1.5',
  '[font-size:var(--font-size-sm)] leading-(--line-height-sm)',
  'transition-colors duration-(--duration-base) ease-(--ease-in-out)',
  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-input-focus)',
].join(' ');

const PILL_SELECTED   = 'bg-(--bg-interactive-primary-default) text-(--text-inverse)';
const PILL_UNSELECTED = 'bg-(--bg-interactive-secondary-default) text-(--text-primary) hover:bg-(--bg-interactive-secondary-hover)';

// ─── SingleSelect ─────────────────────────────────────────────────────────────

function SingleSelect({
  question,
  value,
  onChange,
}: {
  question: SingleSelectQuestion;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
        {question.label}
      </p>
      <div className="flex flex-wrap gap-2">
        {question.options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(PILL_BASE, value === opt ? PILL_SELECTED : PILL_UNSELECTED)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── MultiSelect ──────────────────────────────────────────────────────────────

function MultiSelect({
  question,
  value,
  onChange,
}: {
  question: MultiSelectQuestion;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
        {question.label}
      </p>
      <div className="flex flex-wrap gap-2">
        {question.options.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(PILL_BASE, value.includes(opt) ? PILL_SELECTED : PILL_UNSELECTED)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── RankPriorities ───────────────────────────────────────────────────────────

function SortableItem({ id, index }: { id: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5',
        'bg-(--bg-interactive-secondary-default)',
        isDragging && 'opacity-50',
      )}
    >
      <span className="shrink-0 w-5 text-center [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-tertiary)">
        {index + 1}
      </span>
      <button
        type="button"
        className="shrink-0 cursor-grab active:cursor-grabbing text-(--text-tertiary) touch-none focus-visible:outline-none"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${id}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="[font-size:var(--font-size-sm)] text-(--text-primary)">{id}</span>
    </div>
  );
}

function RankPriorities({
  question,
  value,
  onChange,
}: {
  question: RankPrioritiesQuestion;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = value.indexOf(active.id as string);
      const newIndex = value.indexOf(over.id as string);
      onChange(arrayMove(value, oldIndex, newIndex));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
        {question.label}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {value.map((item, i) => (
              <SortableItem key={item} id={item} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
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
  );
}

// ─── ClarificationStageCard ───────────────────────────────────────────────────

function ClarificationStageCard({ stageIndex, onSubmit }: ClarificationStageCardProps) {
  const stage = STAGES[stageIndex];

  const [answers, setAnswers] = useState<StageAnswers>(() => {
    const init: StageAnswers = {};
    stage.questions.forEach((q, i) => {
      if (q.type === 'rank') init[i] = [...q.items];
    });
    return init;
  });

  function setAnswer(qi: number, value: string | string[]) {
    setAnswers(prev => ({ ...prev, [qi]: value }));
  }

  const complete = isStageComplete(stage, answers);

  return (
    <div className="max-w-lg">
      <div className="flex flex-col gap-4 rounded-xl p-4 bg-(--bg-surface-base) shadow-(--shadow-border)">
        <p className="[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)] text-(--text-tertiary) uppercase tracking-wider">
          {stage.title}
        </p>
        <div className="flex flex-col gap-5">
          {stage.questions.map((q, i) => {
            if (q.type === 'single') {
              return (
                <SingleSelect
                  key={i}
                  question={q}
                  value={answers[i] as string | undefined}
                  onChange={v => setAnswer(i, v)}
                />
              );
            }
            if (q.type === 'multi') {
              return (
                <MultiSelect
                  key={i}
                  question={q}
                  value={(answers[i] as string[] | undefined) ?? []}
                  onChange={v => setAnswer(i, v)}
                />
              );
            }
            if (q.type === 'rank') {
              return (
                <RankPriorities
                  key={i}
                  question={q}
                  value={(answers[i] as string[] | undefined) ?? q.items}
                  onChange={v => setAnswer(i, v)}
                />
              );
            }
            return null;
          })}
        </div>
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            disabled={!complete}
            onClick={() => onSubmit(answers)}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page Orchestration ───────────────────────────────────────────────────────

const INTRO_MESSAGE = "Before I start building, I have a few questions to make sure I understand the problem, the solution direction, and your priorities.";

const INITIAL_ITEMS: ThreadItem[] = [
  { kind: 'assistant-text', id: 'intro', content: INTRO_MESSAGE },
  { kind: 'stage-card',     id: 'stage-0', stageIndex: 0 },
];

export function ClarificationChatPage() {
  const [items, setItems]           = useState<ThreadItem[]>(INITIAL_ITEMS);
  const [allAnswers, setAllAnswers] = useState<StageAnswers[]>([]);
  const [inputValue, setInputValue] = useState('');

  const inputDisabled = items.some(i => i.kind === 'stage-card' || i.kind === 'typing');

  function handleStageSubmit(stageIndex: number, answers: StageAnswers) {
    const stage = STAGES[stageIndex];
    const summary = buildAnswerSummary(stage, answers);

    const newAllAnswers = [...allAnswers];
    newAllAnswers[stageIndex] = answers;
    setAllAnswers(newAllAnswers);

    // Replace stage-card → user bubble + typing indicator
    setItems(prev => [
      ...prev.filter(i => i.id !== `stage-${stageIndex}`),
      { kind: 'user-bubble', id: `answer-${stageIndex}`, content: summary },
      { kind: 'typing',      id: `typing-${stageIndex}` },
    ]);

    // After 800ms: swap typing → next stage card or closing message
    setTimeout(() => {
      const nextStageIndex = stageIndex + 1;
      setItems(prev => {
        const withoutTyping = prev.filter(i => i.id !== `typing-${stageIndex}`);
        if (nextStageIndex < STAGES.length) {
          return [
            ...withoutTyping,
            { kind: 'stage-card', id: `stage-${nextStageIndex}`, stageIndex: nextStageIndex },
          ];
        }
        return [
          ...withoutTyping,
          { kind: 'assistant-text', id: 'closing', content: buildClosingMessage(newAllAnswers) },
        ];
      });
    }, 800);
  }

  return (
    <div className="flex flex-col flex-1 size-full overflow-hidden bg-(--bg-surface-base)">
      <ChatThread className="flex-1 min-h-0">
        {items.map(item => {
          if (item.kind === 'assistant-text') {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springs.interactive}
              >
                <ChatMessage content={item.content} />
              </motion.div>
            );
          }
          if (item.kind === 'user-bubble') {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springs.interactive}
              >
                <ChatBubble>
                  <span className="whitespace-pre-wrap">{item.content}</span>
                </ChatBubble>
              </motion.div>
            );
          }
          if (item.kind === 'typing') {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <TypingIndicator />
              </motion.div>
            );
          }
          if (item.kind === 'stage-card') {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springs.interactive}
              >
                <ClarificationStageCard
                  stageIndex={item.stageIndex}
                  onSubmit={answers => handleStageSubmit(item.stageIndex, answers)}
                />
              </motion.div>
            );
          }
          return null;
        })}
      </ChatThread>

      <div className="px-4 pb-4 pt-2 shrink-0">
        <ChatInputBox
          size="sm"
          submitLabel="Send"
          placeholder={inputDisabled ? 'Answering questions...' : 'What would you like to change?'}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onSubmit={() => {}}
          disabled={inputDisabled}
        />
      </div>
    </div>
  );
}
```

**Step 2: Run build**

```bash
cd /path/to/repo && npm run build 2>&1 | tail -30
```

Expected: zero TypeScript errors, successful build.

**Step 3: Run lint**

```bash
npm run lint 2>&1 | tail -20
```

Expected: no new errors.

**Step 4: Token audit**

```bash
grep -n "#[0-9a-fA-F]\{3,6\}\|text-zinc\|bg-white\|border-gray\|text-white\|bg-\[var\|text-\[var" \
  "app/patterns/[pattern]/ClarificationChatPage.tsx"
```

Expected: no matches.

**Step 5: Commit**

```bash
git add "app/patterns/[pattern]/ClarificationChatPage.tsx"
git commit -m "feat: add clarification-chat page — Q&A embedded in chat thread"
```

---

### Task 3: Final verification

**Step 1: Confirm full build + lint + token audit clean**

```bash
npm run build 2>&1 | tail -10 && npm run lint 2>&1 | tail -10
```

**Step 2: Confirm git log**

```bash
git log --oneline -5
```

Expected: two new commits — register + page creation.

**Step 3: Manual smoke-test checklist**

Navigate to `http://localhost:3000/patterns/clarification-chat` (after `npm run dev`):

- [ ] Page appears in sidebar under Pages with Experiment badge
- [ ] Intro assistant message visible on load
- [ ] Stage 1 card visible below it, left-aligned, max-w-lg
- [ ] Continue button disabled until both questions answered
- [ ] On Continue: card disappears, user bubble appears right-aligned, 3-dot typing indicator appears
- [ ] After ~800ms: typing disappears, Stage 2 card slides in
- [ ] Same for Stage 2 → Stage 3
- [ ] Stage 3: RankPriorities list is draggable
- [ ] After Stage 3: closing assistant message renders with markdown summary of all answers
- [ ] ChatInputBox shows "Answering questions..." placeholder while Q&A in progress
- [ ] ChatInputBox enables with "What would you like to change?" after all stages complete
- [ ] Thread auto-scrolls to bottom as new items appear
