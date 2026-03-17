'use client';

import { useState } from 'react';
import { Button, ClarificationCard, type ClarificationQuestion, type ClarificationAnswers } from '@/components/ui';

const QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'Who is the primary user of this feature?',
    options: ['Government officer', 'Admin & ops', 'Public citizen', 'Internal developer'],
  },
  {
    type: 'multi',
    label: 'Which pain points does this solve?',
    options: [
      'Too many manual steps',
      'Hard to find information',
      'Process takes too long',
      'Errors from copy-pasting',
      'No visibility into status',
    ],
  },
  {
    type: 'rank',
    label: 'Rank what matters most in this build',
    items: ['Correctness', 'Speed of delivery', 'Visual polish', 'Edge case handling'],
  },
];

export function ClarificationCardDemos() {
  const [key, setKey] = useState(0);
  const [result, setResult] = useState<ClarificationAnswers | null>(null);

  function handleSubmit(answers: ClarificationAnswers) {
    setResult(answers);
  }

  function handleReset() {
    setKey(k => k + 1);
    setResult(null);
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="w-full max-w-sm">
        <ClarificationCard
          key={key}
          questions={QUESTIONS}
          onSubmit={handleSubmit}
          onClose={handleReset}
        />
      </div>

      {result && (
        <div className="flex flex-col gap-2 w-full max-w-sm">
          <p className="[font-size:var(--font-size-sm)] text-(--text-tertiary)">Submitted answers:</p>
          <pre className="[font-size:var(--font-size-xs)] text-(--text-primary) bg-(--bg-surface-primary) rounded-lg p-3 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
          <Button variant="ghost" size="sm" onClick={handleReset} className="self-start">
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
