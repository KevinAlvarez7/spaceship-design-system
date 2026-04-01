import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { CheckboxGroup, CheckboxItem } from '@/components/ui';

const meta = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  parameters: { layout: 'centered' },
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
    defaultValue: ['option-a'],
    surface: 'default',
    disabled: false,
    disableMotion: false,
  },
  render: (args) => (
    <CheckboxGroup {...args}>
      <CheckboxItem value="option-a">Option A</CheckboxItem>
      <CheckboxItem value="option-b">Option B</CheckboxItem>
      <CheckboxItem value="option-c">Option C</CheckboxItem>
    </CheckboxGroup>
  ),
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ShadowBorder: Story = {
  args: { surface: 'shadow-border' },
};

export const MultipleSelected: Story = {
  args: { defaultValue: ['option-a', 'option-c'] },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithDisabledItem: Story = {
  render: () => (
    <CheckboxGroup defaultValue={['option-a']}>
      <CheckboxItem value="option-a">Option A</CheckboxItem>
      <CheckboxItem value="option-b" disabled>Option B (disabled)</CheckboxItem>
      <CheckboxItem value="option-c">Option C</CheckboxItem>
    </CheckboxGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState(['option-a']);
    return (
      <div className="flex flex-col gap-3">
        <CheckboxGroup value={value} onValueChange={setValue}>
          <CheckboxItem value="option-a">Option A</CheckboxItem>
          <CheckboxItem value="option-b">Option B</CheckboxItem>
          <CheckboxItem value="option-c">Option C</CheckboxItem>
        </CheckboxGroup>
        <p className="text-sm text-zinc-500">Selected: {value.join(', ') || 'none'}</p>
      </div>
    );
  },
};
