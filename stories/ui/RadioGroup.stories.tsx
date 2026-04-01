import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { RadioGroup, RadioItem } from '@/components/ui';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
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
