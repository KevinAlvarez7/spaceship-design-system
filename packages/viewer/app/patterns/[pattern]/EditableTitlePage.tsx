import { Preview } from '@/components/viewer/Preview';
import { EditableTitleDemos } from './EditableTitleDemos';

export function EditableTitlePage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Editable Title</h1>
        <p className="mt-2 text-sm text-zinc-500">Inline-editable heading that switches between display and edit modes on click.</p>
      </div>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Variants</h2>
        <Preview label="Variants">
          <EditableTitleDemos />
        </Preview>
      </section>
    </div>
  );
}
