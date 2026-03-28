import { Topbar } from '@/components/viewer/Topbar';
import { Preview } from '@/components/viewer/Preview';
import { typeSpecimenGroups } from '@spaceship/design-system';

export default function TypographyPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Typography" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {typeSpecimenGroups.map(({ group, specimens }) => (
          <Preview key={group} label={group}>
            <div className="max-w-3xl space-y-1">
              {specimens.map(specimen => (
                <div
                  key={specimen.name}
                  className="group flex items-baseline gap-6 rounded-lg border border-transparent px-4 py-4 hover:border-zinc-200 hover:bg-zinc-50 transition-all"
                >
                  <div className="w-24 flex-shrink-0">
                    <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-500">
                      {specimen.label}
                    </span>
                  </div>
                  <div className={specimen.className}>
                    {specimen.sample}
                  </div>
                </div>
              ))}
            </div>
          </Preview>
        ))}
      </main>
    </div>
  );
}
