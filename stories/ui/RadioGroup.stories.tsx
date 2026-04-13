import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadioGroup, RadioItem } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Single-select radio group built on Radix with accessible keyboard navigation and group-level surface variants.' } },
  },
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    disabled:      { control: 'boolean', table: { category: 'State' } },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    children:      { table: { disable: true } },
    value:         { table: { disable: true } },
    onValueChange: { table: { disable: true } },
  },
  args: {
    defaultValue: 'option-a',
    surface: 'default',
    disabled: false,
    disableMotion: false,
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioItem value="option-a">Option A</RadioItem>
      <RadioItem value="option-b">Option B</RadioItem>
      <RadioItem value="option-c">Option C</RadioItem>
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'Group',     padding: '—',         gap: '—', radius: 'rounded-xl' },
  { part: 'RadioItem', padding: 'px-4 py-3', gap: '—', radius: 'rounded-lg' },
  { part: 'Indicator', padding: '—',         gap: '—', radius: 'rounded-full', note: 'w-5 h-5 fixed size' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/radio-group.tsx"
      preview={
        <RadioGroup defaultValue="option-a">
          <RadioItem value="option-a">Option A</RadioItem>
          <RadioItem value="option-b">Option B</RadioItem>
          <RadioItem value="option-c">Option C</RadioItem>
        </RadioGroup>
      }
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
};

export const ShadowBorder: Story = {
  args: { surface: 'shadow-border' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithDisabledItem: Story = {
  render: () => (
    <RadioGroup defaultValue="option-a">
      <RadioItem value="option-a">Option A</RadioItem>
      <RadioItem value="option-b" disabled>Option B (disabled)</RadioItem>
      <RadioItem value="option-c">Option C</RadioItem>
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('option-a');
    return (
      <div className="flex flex-col gap-3">
        <RadioGroup value={value} onValueChange={setValue}>
          <RadioItem value="option-a">Option A</RadioItem>
          <RadioItem value="option-b">Option B</RadioItem>
          <RadioItem value="option-c">Option C</RadioItem>
        </RadioGroup>
        <p className="text-sm text-zinc-500">Selected: {value}</p>
      </div>
    );
  },
};

