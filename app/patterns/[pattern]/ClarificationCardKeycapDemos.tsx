'use client';

import { useState } from 'react';
import { ClarificationCardKeycap } from '@/components/ui';
import type { ClarificationQuestion, ClarificationAnswer } from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

// ─── Question sets ────────────────────────────────────────────────────────────

const SINGLE_QUESTIONS: ClarificationQuestion[] = [{
  type: 'single',
  label: 'Who is the primary user of this feature?',
  options: ['Internal team', 'External customer', 'Admin / ops', 'API consumer', 'Others'],
}];

const MULTI_QUESTIONS: ClarificationQuestion[] = [{
  type: 'multi',
  label: 'Which constraints must we design around?',
  options: [
    'Must work on mobile',
    'Simple enough for non-tech users',
    'No new accounts needed',
    'Must comply with data regulations',
    'Others',
  ],
  freeText: true,
}];

const RANK_QUESTIONS: ClarificationQuestion[] = [{
  type: 'rank',
  label: 'Rank these features by importance for v1',
  items: [
    'Job posting form',
    'Automatic notifications',
    'One-tap accept / decline',
    'Double-booking prevention',
  ],
}];

const FREE_TEXT_QUESTIONS: ClarificationQuestion[] = [{
  type: 'single',
  label: 'Which tech stack will you use?',
  options: ['Next.js + TypeScript', 'React + Vite', 'SvelteKit', 'Remix', 'Others'],
  freeText: true,
}];

const MIXED_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is the primary user?',
    options: ['Internal team', 'External customer', 'Admin / ops', 'API consumer', 'Others'],
  },
  {
    type: 'multi',
    label: 'What are the main pain points?',
    options: ['Too slow', 'Too complex', 'Missing feature', 'Unreliable', 'Others'],
    freeText: true,
  },
  {
    type: 'rank',
    label: 'Rank these goals by priority',
    items: ['Ship fast', 'High quality', 'Low cost', 'Security'],
  },
];

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

function SingleDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="w-(--sizing-chat-default)">
      <ClarificationCardKeycap key={key} questions={SINGLE_QUESTIONS} onSubmit={() => setKey(k => k + 1)} />
    </div>
  );
}

function MultiDemo() {
  const [key, setKey]       = useState(0);
  const [result, setResult] = useState<ClarificationAnswer[] | null>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-(--sizing-chat-default)">
      <ClarificationCardKeycap key={key} questions={MULTI_QUESTIONS} onSubmit={answers => setResult(answers)} />
      {result && <ResultBlock result={result} onReset={() => { setKey(k => k + 1); setResult(null); }} />}
    </div>
  );
}

function RankDemo() {
  const [key, setKey]       = useState(0);
  const [result, setResult] = useState<ClarificationAnswer[] | null>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-(--sizing-chat-default)">
      <ClarificationCardKeycap key={key} questions={RANK_QUESTIONS} onSubmit={answers => setResult(answers)} />
      {result && <ResultBlock result={result} onReset={() => { setKey(k => k + 1); setResult(null); }} />}
    </div>
  );
}

function FreeTextDemo() {
  const [key, setKey]       = useState(0);
  const [result, setResult] = useState<ClarificationAnswer[] | null>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-(--sizing-chat-default)">
      <ClarificationCardKeycap key={key} questions={FREE_TEXT_QUESTIONS} onSubmit={answers => setResult(answers)} />
      {result && <ResultBlock result={result} onReset={() => { setKey(k => k + 1); setResult(null); }} />}
    </div>
  );
}

function MixedDemo() {
  const [key, setKey]       = useState(0);
  const [result, setResult] = useState<ClarificationAnswer[] | null>(null);
  return (
    <div className="flex flex-col items-center gap-4 w-(--sizing-chat-default)">
      <ClarificationCardKeycap key={key} questions={MIXED_QUESTIONS} onSubmit={answers => setResult(answers)} />
      {result && <ResultBlock result={result} onReset={() => { setKey(k => k + 1); setResult(null); }} />}
    </div>
  );
}

function SurfaceDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="w-(--sizing-chat-default)">
      <ClarificationCardKeycap
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

export function ClarificationCardKeycapDemos() {
  return (
    <>
      <section>
        <h2 className="text-sm font-medium text-zinc-700 mb-3">Single select</h2>
        <Preview label="Hint bar shows live key press state — try 1–5, ↑↓, ↵, →">
          <SingleDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-700 mb-3">Multi-select</h2>
        <Preview label="Number keys toggle options on/off — hint bar shows toggle hint">
          <MultiDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-700 mb-3">Rank</h2>
        <Preview label="Drag to reorder — keyboard: Space to grab, ↑↓ to move, Space to drop">
          <RankDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-700 mb-3">Free text (Others)</h2>
        <Preview label='Select "Others" to reveal an inline text input in the same row'>
          <FreeTextDemo />
        </Preview>
      </section>

      <section>
        <h2 className="text-sm font-medium text-zinc-700 mb-3">Mixed flow</h2>
        <Preview label="Single → multi → rank — ⇧↵ submits on the last question">
          <MixedDemo />
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
