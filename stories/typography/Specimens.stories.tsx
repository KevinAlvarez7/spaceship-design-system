import type { Meta, StoryObj } from '@storybook/react';
import { typeSpecimenGroups } from '@/tokens';

function TypeSpecimens() {
  return (
    <div className="p-8 space-y-8">
      {typeSpecimenGroups.map(({ group, specimens }) => (
        <div key={group}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">{group}</h2>
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
                <div className={specimen.className}>{specimen.sample}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: 'Typography/Specimens',
  component: TypeSpecimens,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TypeSpecimens>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
