import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ChatInputBox } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const meta = {
  title: 'Components/ChatInputBox',
  component: ChatInputBox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Auto-expanding textarea for chat interfaces with send/stop controls and keyboard submission.' } },
  },
  decorators: [
    (Story) => (
      <div className="w-(--sizing-chat-default)">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    size: {
      control: { type: 'select' },
      options: ['md', 'sm'],
      table: { category: 'Variants' },
    },
    disabled:     { control: 'boolean', table: { category: 'State' } },
    placeholder:  { control: 'text' },
    submitLabel:  { control: 'text' },
    stopLabel:    { control: 'text' },
    onSubmit:     { table: { disable: true } },
    onStop:       { table: { disable: true } },
  },
  args: {
    surface: 'shadow-border',
    size: 'md',
    disabled: false,
    placeholder: 'Explore any problems, prototype any ideas…',
  },
} satisfies Meta<typeof ChatInputBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'ChatInputBox',  padding: 'p-3', radius: 'rounded-lg' },
  { part: 'Textarea wrap', padding: 'p-1', radius: '—' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/chat-input-box.tsx"
      preview={<ChatInputBox placeholder="Explore any problems, prototype any ideas…" />}
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
  decorators: [],
};

export const Small: Story = {
  args: { size: 'sm' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="w-(--sizing-chat-default) flex flex-col gap-3">
        <ChatInputBox
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onSubmit={(v) => { setValue(''); alert(`Submitted: ${v}`); }}
        />
        <p className="text-xs text-zinc-400">Characters: {value.length}</p>
      </div>
    );
  },
};

