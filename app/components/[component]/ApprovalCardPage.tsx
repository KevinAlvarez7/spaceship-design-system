import { ApprovalCardDemos } from './ApprovalCardDemos';
import { PropsTable, type PropRow } from '@/components/viewer/PropsTable';
import { CodeBlock }  from '@/components/viewer/CodeBlock';

const PROPS: PropRow[] = [
  { name: 'plan',          type: 'ApprovalPlan', default: '—',               description: 'Plan data: title, steps, risk summary, total estimate' },
  { name: 'onApprove',     type: '() => void',   default: '—',               description: 'Called when the user clicks "Approve plan"' },
  { name: 'onReject',      type: '() => void',   default: '—',               description: 'Called when the user clicks "Request changes"' },
  { name: 'surface',       type: '"default" | "shadow-border"', default: '"shadow-border"', description: 'Visual treatment of the card container' },
  { name: 'disableMotion', type: 'boolean',       default: 'false',          description: 'Disables motion animations' },
  { name: 'className',     type: 'string',        default: '—',              description: 'Additional classes applied to the root element' },
];

const USAGE = `import { ApprovalCard } from '@/components/ui';
import type { ApprovalPlan } from '@/components/ui';

const plan: ApprovalPlan = {
  title: 'Relief Teacher Booking System',
  totalEstimate: '4 weeks',
  steps: [
    { title: 'Project setup',  timeEstimate: '1 day',  riskLevel: 'safe' },
    { title: 'Core features',  timeEstimate: '2 weeks', riskLevel: 'low'  },
    { title: 'QA and launch',  timeEstimate: '3 days', riskLevel: 'low'  },
  ],
  riskSummary: {
    overallRisk: 'low',
    notes: ['No external services connected', 'Mock data only'],
  },
};

<ApprovalCard
  plan={plan}
  onApprove={() => console.log('approved')}
  onReject={() => console.log('rejected')}
/>`;

export function ApprovalCardPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Approval Card</h1>
        <p className="mt-2 text-sm text-zinc-500">
          A scrollable plan card with per-step risk and time estimates, a security overview,
          and sticky approve / reject actions. Designed for use as a bottom-sheet overlay in ChatPanel.
        </p>
      </div>

      <ApprovalCardDemos />

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
