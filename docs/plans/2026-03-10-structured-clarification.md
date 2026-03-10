# Structured Clarification Page — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a sequential, stage-gated clarification flow at `/patterns/structured-clarification` with pill-based single/multi-select and a drag-to-reorder priority list.

**Architecture:** Single `StructuredClarificationDemos.tsx` client component contains all local components (SingleSelect, MultiSelect, RankPriorities, ClarificationCard, StageSummary) — self-contained but extraction-ready with clean typed interfaces. A thin server `StructuredClarificationPage.tsx` wraps it and is registered in the viewer under section Pages, route patterns, standard layout.

**Tech Stack:** Next.js 16.1, React 19, Tailwind v4, motion/react, @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities (new), CVA, DS tokens.

**Reference:** Design doc at `docs/plans/2026-03-10-structured-clarification-design.md`

---

### Task 1: Install @dnd-kit packages

**Files:**
- Modify: `package.json` (via npm install)

**Step 1: Install the packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected: packages added under `dependencies` in `package.json`. No build errors.

**Step 2: Verify TypeScript can resolve them**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors mentioning @dnd-kit.

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @dnd-kit packages for drag-to-reorder"
```

---

### Task 2: Register the page in viewer-registry and patterns router

**Files:**
- Modify: `lib/viewer-registry.ts` (line ~66, Pages block)
- Modify: `app/patterns/[pattern]/page.tsx` (PATTERNS map + import)

**Step 1: Add registry entry**

In `lib/viewer-registry.ts`, in the `// Pages (bare layout, experiments)` block, add:

```ts
{ slug: 'structured-clarification', title: 'Structured Clarification', section: 'Pages', route: 'patterns', layout: 'standard', experiment: true },
```

Full Pages block after edit:

```ts
// Pages (bare layout, experiments)
{ slug: 'gravity-chat',              title: 'Gravity Chat',              section: 'Pages', route: 'patterns', layout: 'bare',     experiment: true },
{ slug: 'prototype-workspace',       title: 'Prototype Workspace',       section: 'Pages', route: 'patterns', layout: 'bare',     experiment: true },
{ slug: 'structured-clarification',  title: 'Structured Clarification',  section: 'Pages', route: 'patterns', layout: 'standard', experiment: true },
```

**Step 2: Add to PATTERNS map in page.tsx**

In `app/patterns/[pattern]/page.tsx`, add the import and map entry:

```ts
import { StructuredClarificationPage } from './StructuredClarificationPage';

const PATTERNS: Record<string, React.ComponentType> = {
  'chat':                        ChatPage,
  'preview-panel':               PreviewPanelPage,
  'preview-panel-header':        PreviewPanelHeaderPage,
  'editable-title':              EditableTitlePage,
  'shareable-link':              ShareableLinkPage,
  'sidebar-toggle':              SidebarTogglePage,
  'gravity-chat':                GravityChatPage,
  'prototype-workspace':         PrototypeWorkspacePage,
  'structured-clarification':    StructuredClarificationPage,  // ← add this
};
```

**Step 3: Verify build compiles (import will fail until Task 3 creates the file — that's OK, skip this step and come back after Task 3 if you prefer)**

**Step 4: Commit after Task 3 instead** (group the registry + page files together)

---

### Task 3: Create StructuredClarificationPage.tsx (server component)

**Files:**
- Create: `app/patterns/[pattern]/StructuredClarificationPage.tsx`

**Step 1: Write the file**

```tsx
import { StructuredClarificationDemos } from './StructuredClarificationDemos';

export function StructuredClarificationPage() {
  return <StructuredClarificationDemos />;
}
```

**Why:** Page is a plain sync function (not async — no await). It delegates all interactivity to the Demos client component. The `"use client"` boundary lives in Demos.

**Step 2: Verify build resolves the import**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds (Demos file created in Task 4).

**Step 3: Commit registry + page files together**

```bash
git add lib/viewer-registry.ts app/patterns/[pattern]/page.tsx app/patterns/[pattern]/StructuredClarificationPage.tsx
git commit -m "feat: register structured-clarification page in viewer"
```

---

### Task 4: Create StructuredClarificationDemos.tsx

This is the main task. All types, question components, ClarificationCard, StageSummary, and orchestration live here.

**Files:**
- Create: `app/patterns/[pattern]/StructuredClarificationDemos.tsx`

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
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { springs } from '@/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
// Extraction-ready: move these + the 4 components below to
// components/patterns/ClarificationCard.tsx and update the import path.

type SingleSelectQuestion   = { type: 'single'; label: string; options: string[]; required?: boolean };
type MultiSelectQuestion    = { type: 'multi';  label: string; options: string[]; required?: boolean };
type RankPrioritiesQuestion = { type: 'rank';   label: string; items: string[] };
type Question = SingleSelectQuestion | MultiSelectQuestion | RankPrioritiesQuestion;

type Stage = {
  title: string;
  questions: Question[];
};

// question index → selected value(s)
type StageAnswers = Record<number, string | string[]>;

type ClarificationCardProps = {
  stage: Stage;
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

// ─── ClarificationCard ────────────────────────────────────────────────────────

function ClarificationCard({ stage, onSubmit }: ClarificationCardProps) {
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
    <div className="flex flex-col gap-6 rounded-xl p-6 bg-(--bg-surface-base) shadow-(--shadow-border)">
      <h2 className="[font-size:var(--font-size-base)] [font-weight:var(--font-weight-semibold)] text-(--text-primary)">
        {stage.title}
      </h2>
      <div className="flex flex-col gap-6">
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
          size="md"
          disabled={!complete}
          onClick={() => onSubmit(answers)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

// ─── StageSummary ─────────────────────────────────────────────────────────────

function StageSummary({ stage, answers }: { stage: Stage; answers: StageAnswers }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl p-5 bg-(--bg-surface-primary) shadow-(--shadow-border)">
      <h2 className="[font-size:var(--font-size-xs)] [font-weight:var(--font-weight-semibold)] text-(--text-tertiary) uppercase tracking-wider">
        {stage.title}
      </h2>
      <div className="flex flex-col gap-3">
        {stage.questions.map((q, i) => {
          const answer = answers[i];
          const chips = Array.isArray(answer) ? answer : answer ? [answer as string] : [];
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="[font-size:var(--font-size-xs)] text-(--text-secondary)">{q.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {chips.map(chip => (
                  <span
                    key={chip}
                    className="rounded-full px-2.5 py-1 [font-size:var(--font-size-xs)] bg-(--bg-interactive-secondary-default) text-(--text-secondary)"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page Orchestration ───────────────────────────────────────────────────────

export function StructuredClarificationDemos() {
  const [currentStage, setCurrentStage] = useState(0);
  const [submittedAnswers, setSubmittedAnswers] = useState<StageAnswers[]>([]);

  function handleSubmit(stageIndex: number, answers: StageAnswers) {
    setSubmittedAnswers(prev => {
      const next = [...prev];
      next[stageIndex] = answers;
      return next;
    });
    setCurrentStage(stageIndex + 1);
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {STAGES.map((stage, i) => {
        if (i > currentStage) return null;

        if (submittedAnswers[i]) {
          return (
            <motion.div
              key={`summary-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springs.interactive}
            >
              <StageSummary stage={stage} answers={submittedAnswers[i]} />
            </motion.div>
          );
        }

        return (
          <motion.div
            key={`card-${i}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.interactive}
          >
            <ClarificationCard
              stage={stage}
              onSubmit={answers => handleSubmit(i, answers)}
            />
          </motion.div>
        );
      })}

      {currentStage >= STAGES.length && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.interactive}
          className="flex flex-col items-center gap-2 py-8 text-(--text-tertiary)"
        >
          <p className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-secondary)">
            All stages complete
          </p>
          <p className="[font-size:var(--font-size-xs)]">Answers captured above</p>
        </motion.div>
      )}
    </div>
  );
}
```

**Step 2: Run build**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds with zero TypeScript errors.

**Step 3: Run lint**

```bash
npm run lint 2>&1 | tail -20
```

Expected: no new warnings or errors.

**Step 4: Token audit — grep for violations**

```bash
grep -n "#[0-9a-fA-F]\{3,6\}\|text-zinc\|bg-white\|border-gray\|text-white\|bg-\[var\|text-\[var" \
  app/patterns/\[pattern\]/StructuredClarificationDemos.tsx
```

Expected: no matches.

**Step 5: Commit**

```bash
git add app/patterns/\[pattern\]/StructuredClarificationDemos.tsx
git commit -m "feat: add structured-clarification page with SingleSelect, MultiSelect, RankPriorities"
```

---

### Task 5: Verify end-to-end in browser

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Navigate to the page**

Open: `http://localhost:3000/patterns/structured-clarification`

Expected:
- Page appears in sidebar under Pages section with Experiment badge
- Stage 1 card is visible with "Who is the primary user?" and "What pain points does this solve?"
- Pill chips are unselected (secondary background)
- Continue button is disabled (greyed out, no pointer events)
- Selecting one answer in SingleSelect enables chip highlight
- Continue remains disabled until BOTH required questions answered
- On Continue: Stage 1 collapses to summary with slide-in animation, Stage 2 appears
- Repeat for Stage 2
- Stage 3: RankPriorities list is draggable — position numbers update as you reorder
- Final Continue: completion message appears

**Step 3: Check dark mode**

Toggle theme (if applicable). Verify no hardcoded colours appear — all surfaces and text should invert correctly via semantic tokens.

---

## Extraction Checklist (for future)

When ClarificationCard is needed elsewhere:

1. Create `components/patterns/ClarificationCard.tsx`
2. Move from Demos: `SingleSelectQuestion`, `MultiSelectQuestion`, `RankPrioritiesQuestion`, `Question`, `Stage`, `StageAnswers`, `ClarificationCardProps`, `isStageComplete`, `PILL_BASE`, `PILL_SELECTED`, `PILL_UNSELECTED`, `SingleSelect`, `MultiSelect`, `SortableItem`, `RankPriorities`, `ClarificationCard`, `StageSummary`
3. Export them from `components/patterns/index.ts`
4. Update import in `StructuredClarificationDemos.tsx`
5. No logic changes needed — interfaces are already clean
