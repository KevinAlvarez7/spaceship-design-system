import { Preview } from '@/components/viewer/Preview';
import { ClarificationCardDemos } from './ClarificationCardDemos';

export function ClarificationCardPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Clarification Card</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Paginated card presenting one clarification question at a time. Supports
          single-select, multi-select, and rank-priorities question types. Collapses into
          a read-only summary after all questions are answered.
        </p>
      </div>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Interactive Demo</h2>
        <Preview label="Clarification Card">
          <ClarificationCardDemos />
        </Preview>
      </section>
    </div>
  );
}
