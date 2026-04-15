import type { Meta, StoryObj } from '@storybook/react';
import { SpaceshipPlanet } from '@/components/effects';

const meta = {
  title: 'Assets/Logo/SpaceshipPlanet',
  component: SpaceshipPlanet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Decorative planet used as a scene element alongside the saucer logo.',
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
    color: '#C3A8FF',
    size: 24,
  },
} satisfies Meta<typeof SpaceshipPlanet>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── All Sizes ────────────────────────────────────────────────────────────────

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      <SpaceshipPlanet color="#C3A8FF" size={16} />
      <SpaceshipPlanet color="#C3A8FF" size={24} />
      <SpaceshipPlanet color="#C3A8FF" size={32} />
      <SpaceshipPlanet color="#C3A8FF" size={48} />
    </div>
  ),
};

// ─── Custom Colors ────────────────────────────────────────────────────────────

export const CustomColors: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <SpaceshipPlanet color="#C3A8FF" size={32} />
      <SpaceshipPlanet color="#26E6B5" size={32} />
      <SpaceshipPlanet color="#FF6B6B" size={32} />
      <SpaceshipPlanet color="#FFB347" size={32} />
    </div>
  ),
};
