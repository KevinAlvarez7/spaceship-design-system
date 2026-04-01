import type { ClarificationQuestion, ClarificationAnswer } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Question = ClarificationQuestion;

export type Stage = {
  title: string;
  questions: Question[];
};

/** Per-question answer (matches ClarificationCard.onSubmit return type). */
export type StageAnswers = ClarificationAnswer[];

// ─── Stage Data ───────────────────────────────────────────────────────────────

export const STAGES: Stage[] = [
  {
    title: 'Problem Clarification',
    questions: [
      {
        label: 'Who is the primary user?',
        options: ['Internal team', 'External customer', 'Admin / ops', 'API consumer', 'Others'],
      },
      {
        label: "What's the main pain point?",
        options: ['Too slow', 'Too complex', 'Missing feature', 'Unreliable', 'Others'],
      },
    ],
  },
  {
    title: 'Solution Clarification',
    questions: [
      {
        label: 'What will this feature produce?',
        options: ['Dashboard / UI', 'API endpoint', 'Background job', 'Report / export', 'Others'],
      },
      {
        label: 'Which constraint matters most?',
        options: ['Ship fast', 'High quality', 'Low cost', 'Compatibility', 'Others'],
      },
    ],
  },
  {
    title: 'Implementation Confirmation',
    questions: [
      {
        label: "What's your top priority?",
        options: ['Performance', 'Simplicity', 'Extensibility', 'Security', 'Others'],
      },
      {
        label: 'Ready to proceed?',
        options: ['Yes, build it', 'Need more detail', 'Change scope', 'Start smaller', 'Others'],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function answerToString(q: Question, ans: ClarificationAnswer): string {
  if (!ans) return 'Skipped';
  const opts = 'options' in q ? q.options : [];
  if (ans.type === 'single') {
    if (ans.index < 0) return 'Skipped';
    const label = opts[ans.index] ?? 'Unknown';
    return ans.freeText ? `${label}: ${ans.freeText}` : label;
  }
  if (ans.type === 'multi') {
    if (ans.indices.length === 0) return 'Skipped';
    const labels = ans.indices.map(i => opts[i]).filter(Boolean).join(', ');
    return ans.freeText ? `${labels}: ${ans.freeText}` : labels;
  }
  if (ans.type === 'rank') {
    return ans.order.join(' → ');
  }
  return 'Skipped';
}

export function buildAnswerSummary(stage: Stage, answers: StageAnswers): string {
  return stage.questions
    .map((q, i) => {
      const label = q.label.replace(/\?$/, '');
      const value = answerToString(q, answers[i] ?? null);
      return `${label}: ${value}`;
    })
    .join('\n');
}

export function buildClosingMessage(allAnswers: StageAnswers[]): string {
  const flat = STAGES.flatMap((stage, si) =>
    stage.questions.map((q, qi) => ({
      label: q.label.replace(/\?$/, ''),
      value: answerToString(q, allAnswers[si]?.[qi] ?? null),
    }))
  );
  return [
    "Thanks — I have everything I need. Here's what I'll build:\n",
    ...flat.map(f => `**${f.label}:** ${f.value}`),
  ].join('\n');
}
