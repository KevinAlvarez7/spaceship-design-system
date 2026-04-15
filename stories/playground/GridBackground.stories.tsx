import type { Meta, StoryObj } from '@storybook/react';
import { InterfaceKit } from 'interface-kit/react';
import { GridBackground } from '@/components/effects';

const meta = {
  title: 'Playground/Components/GridBackground',
  component: GridBackground,
  tags: ['experimental'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Canvas-based grid background with optional dots, static grid lines, color rings, and paper texture.' } },
  },
  argTypes: {
    showDots:       { control: 'boolean', table: { category: 'Grid' } },
    showStaticGrid: { control: 'boolean', table: { category: 'Grid' } },
    step:           { control: { type: 'range', min: 8, max: 64, step: 4 }, table: { category: 'Grid' } },
    paperTexture:   { control: 'boolean', table: { category: 'Visual' } },
    lineWidth:      { control: { type: 'range', min: 0.1, max: 3, step: 0.1 }, table: { category: 'Visual' } },
    majorEvery:     { control: { type: 'range', min: 0, max: 10, step: 1 }, table: { category: 'Grid' } },
    background:     { control: 'text', table: { category: 'Visual' } },
    colorRing:      { table: { disable: true } },
    className:      { table: { disable: true } },
    style:          { table: { disable: true } },
  },
  args: {
    showDots: false,
    showStaticGrid: true,
    step: 28,
    paperTexture: true,
    lineWidth: 0.4,
    majorEvery: 0,
  },
  decorators: [
    (Story) => (
      <>
        <Story />
        {process.env.NODE_ENV === 'development' && <InterfaceKit />}
      </>
    ),
    (Story) => (
      <div className="relative w-full h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GridBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Dots ─────────────────────────────────────────────────────────────────────

export const Dots: Story = {
  args: { showDots: true, showStaticGrid: false },
};

// ─── Major Grid ───────────────────────────────────────────────────────────────

export const MajorGrid: Story = {
  args: { majorEvery: 4, majorLineWidth: 1.0 },
};

// ─── Color Ring ───────────────────────────────────────────────────────────────

export const ColorRing: Story = {
  args: {
    colorRing: ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1'],
    lineWidth: 0.8,
  },
};
