import type { Meta, StoryObj } from '@storybook/react';
import { Keycap, KeyCombo } from '@/components/ui';
import { EXCLUDE_MOTION_PROPS } from '../_helpers/motion-argtypes';

const meta = {
  title: 'Playground/Components/Keycap',
  component: Keycap,
  tags: ['experimental'],
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'lit'],
      table: { category: 'Variants' },
    },
    pressed: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disableMotion: {
      control: 'boolean',
      table: { category: 'Motion' },
    },
    children: { control: 'text' },
    ...EXCLUDE_MOTION_PROPS,
  },
  args: {
    children: '⌘',
    variant: 'default',
    pressed: false,
    disableMotion: false,
  },
} satisfies Meta<typeof Keycap>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── All Variants ─────────────────────────────────────────────────────────────

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Keycap variant="default">⌘</Keycap>
      <Keycap variant="lit">⌘</Keycap>
    </div>
  ),
};

// ─── Common Keys ──────────────────────────────────────────────────────────────

export const CommonKeys: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {['⌘', '⇧', '⌥', '⌃', '↵', '↑', '↓', '←', '→', 'esc'].map(key => (
        <Keycap key={key}>{key}</Keycap>
      ))}
    </div>
  ),
};

// ─── Pressed State ────────────────────────────────────────────────────────────

export const Pressed: Story = {
  args: { pressed: true, children: '↵' },
};

// ─── KeyCombo ─────────────────────────────────────────────────────────────────

export const KeyCombos: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <KeyCombo>
        <Keycap>⌘</Keycap>
        <Keycap>K</Keycap>
      </KeyCombo>
      <KeyCombo>
        <Keycap>⇧</Keycap>
        <Keycap>↵</Keycap>
      </KeyCombo>
      <KeyCombo separator="">
        <Keycap>↑</Keycap>
        <Keycap>↓</Keycap>
      </KeyCombo>
    </div>
  ),
};
