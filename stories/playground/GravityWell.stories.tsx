import type { Meta, StoryObj } from '@storybook/react';
import { GravityWellBackground } from '@/components/effects';

const meta = {
  title: 'Playground/Components/GravityWell',
  component: GravityWellBackground,
  tags: ['experimental'],
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Physics-based gravity well effect — grid lines warp toward cursor/touch position. GravityWellBackground wraps content with the effect as a background layer.' } },
  },
  argTypes: {
    radius:          { control: { type: 'range', min: 50, max: 400, step: 10 }, table: { category: 'Physics' } },
    mass:            { control: { type: 'range', min: 0.1, max: 5, step: 0.1 }, table: { category: 'Physics' } },
    spring:          { control: { type: 'range', min: 0.01, max: 0.5, step: 0.01 }, table: { category: 'Physics' } },
    attractStrength: { control: { type: 'range', min: 0, max: 10, step: 0.5 }, table: { category: 'Physics' } },
    repelStrength:   { control: { type: 'range', min: 0, max: 10, step: 0.5 }, table: { category: 'Physics' } },
    cols:            { control: { type: 'range', min: 8, max: 40, step: 1 }, table: { category: 'Grid' } },
    rows:            { control: { type: 'range', min: 8, max: 30, step: 1 }, table: { category: 'Grid' } },
    disableMouse:    { control: 'boolean', table: { category: 'Physics' } },
    background:      { control: 'text', table: { category: 'Visual' } },
    lineColorBase:   { control: 'color', table: { category: 'Visual' } },
    lineColorActive: { control: 'color', table: { category: 'Visual' } },
    sources:         { table: { disable: true } },
    className:       { table: { disable: true } },
    style:           { table: { disable: true } },
    children:        { table: { disable: true } },
  },
  args: {
    radius: 160,
    mass: 1,
    spring: 0.08,
    disableMouse: false,
  },
  decorators: [
    (Story) => (
      <div className="relative w-full h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GravityWellBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Repulsion ────────────────────────────────────────────────────────────────

export const Repulsion: Story = {
  args: {
    attractStrength: 0,
    repelStrength: 6,
    radius: 200,
  },
};

// ─── Strong Pull ──────────────────────────────────────────────────────────────

export const StrongPull: Story = {
  args: {
    attractStrength: 8,
    radius: 120,
    spring: 0.04,
  },
};
