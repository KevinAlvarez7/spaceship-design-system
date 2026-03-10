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
