'use client';

import { useState } from 'react';
import { ClarificationCard } from '@/components/ui';
import type { ClarificationAnswer } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';
import {
  STEP_1_QUESTIONS,
  STEP_2_QUESTIONS,
  IMPL_QUESTIONS,
} from '@/app/_shared/clarification-chat.mock';

// ─── Result display helper ────────────────────────────────────────────────────

function ResultBlock({ result, onReset }: { result: ClarificationAnswer[]; onReset: () => void }) {
  return (
    <div className="w-full flex flex-col gap-2">
      <pre className="[font-size:var(--font-size-xs)] text-(--text-primary) bg-(--bg-surface-secondary) rounded-lg p-3 overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
      <button
        type="button"
        onClick={onReset}
        className="[font-size:var(--font-size-xs)] text-(--text-tertiary) hover:text-(--text-secondary) text-center"
      >
        Reset
      </button>
    </div>
  );
}

// ─── Demos ────────────────────────────────────────────────────────────────────

function Step1Demo() {
  const [key, setKey]       = useState(0);
  const [result, setResult] = useState<ClarificationAnswer[] | null>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-(--sizing-chat-default)">
      <ClarificationCard key={key} questions={STEP_1_QUESTIONS} onSubmit={answers => setResult(answers)} />
      {result && <ResultBlock result={result} onReset={() => { setKey(k => k + 1); setResult(null); }} />}
    </div>
  );
}

function Step2Demo() {
  const [key, setKey]       = useState(0);
  const [result, setResult] = useState<ClarificationAnswer[] | null>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-(--sizing-chat-default)">
      <ClarificationCard key={key} questions={STEP_2_QUESTIONS} onSubmit={answers => setResult(answers)} />
      {result && <ResultBlock result={result} onReset={() => { setKey(k => k + 1); setResult(null); }} />}
    </div>
  );
}

function ImplDemo() {
  const [key, setKey]       = useState(0);
  const [result, setResult] = useState<ClarificationAnswer[] | null>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-(--sizing-chat-default)">
      <ClarificationCard key={key} questions={IMPL_QUESTIONS} onSubmit={answers => setResult(answers)} />
      {result && <ResultBlock result={result} onReset={() => { setKey(k => k + 1); setResult(null); }} />}
    </div>
  );
}

function SurfaceDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="w-(--sizing-chat-default)">
      <ClarificationCard
        key={key}
        surface="default"
        questions={[{
          type: 'single',
          label: 'Which approach fits best?',
          options: ['Quick patch', 'Full refactor', 'Feature flag rollout', 'Hotfix + follow-up', 'Others'],
        }]}
        onSubmit={() => setKey(k => k + 1)}
      />
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function ClarificationCardDemos() {
  return (
    <>
      <section>
        <h2 className="text-sm font-medium text-zinc-700 mb-3">Step 1 — Problem clarification</h2>
        <Preview label="5 questions: single (freeText), multi, single, single (freeText), rank — auto-advances on single-select">
          <Step1Demo />
        </Preview>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-700 mb-3">Step 2 — Solution clarification</h2>
        <Preview label="5 questions: single, single, rank, multi, single">
          <Step2Demo />
        </Preview>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-700 mb-3">Implementation questions</h2>
        <Preview label="5 questions: single (freeText), single, multi, single, rank">
          <ImplDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-700 mb-3">surface=&quot;default&quot;</h2>
        <Preview label="Flat surface, no shadow-border ring">
          <SurfaceDemo />
        </Preview>
      </section>
    </>
  );
}
