import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { EditableTitle } from '@/components/patterns';

function EditableTitleDemo() {
  const [title, setTitle] = useState('My Project');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="w-full max-w-md border border-zinc-200 rounded-lg overflow-hidden">
      <EditableTitle
        title={title}
        onTitleChange={setTitle}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      {sidebarOpen && (
        <div className="p-4 bg-zinc-50 text-sm text-zinc-500">Sidebar panel open</div>
      )}
    </div>
  );
}

const meta = {
  title: 'Patterns/EditableTitle',
  component: EditableTitleDemo,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof EditableTitleDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLongTitle: Story = {
  render: () => {
    const [title, setTitle] = useState('This is a much longer project title that wraps');
    return (
      <div className="w-full max-w-md border border-zinc-200 rounded-lg overflow-hidden">
        <EditableTitle
          title={title}
          onTitleChange={setTitle}
          onMenuClick={() => {}}
        />
      </div>
    );
  },
};
