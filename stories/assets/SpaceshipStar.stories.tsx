import type { Meta, StoryObj } from '@storybook/react';
import { SpaceshipStar } from '@/components/effects';

const meta = {
  title: 'Assets/Logo/SpaceshipStar',
  component: SpaceshipStar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Decorative 4-pointed star used as a scene element alongside the saucer logo.',
      },
    },
  },
  argTypes: {
    color: {
      control: { type: 'color' },
      table: { category: 'Appearance' },
    },
    size: {
      control: { type: 'number' },
      table: { category: 'Sizing' },
    },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
  },
  args: {
    color: '#FFE156',
    size: 24,
  },
} satisfies Meta<typeof SpaceshipStar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── All Sizes ────────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <SpaceshipStar size={12} />
      <SpaceshipStar size={18} />
      <SpaceshipStar size={24} />
      <SpaceshipStar size={32} />
    </div>
  ),
};

// ─── Custom Colors ────────────────────────────────────────────────────────────

export const CustomColors: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <SpaceshipStar color="#FFE156" size={32} />
      <SpaceshipStar color="#FF6B6B" size={32} />
      <SpaceshipStar color="#26E6B5" size={32} />
      <SpaceshipStar color="#C3A8FF" size={32} />
    </div>
  ),
};
