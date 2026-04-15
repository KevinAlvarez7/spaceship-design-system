import type { Meta, StoryObj } from '@storybook/react';
import { SpaceshipLogoScene, SpaceshipPlanet, SpaceshipStar } from '@/components/effects';
import type { SceneDecoration } from '@/components/effects';

const CUSTOM_DECORATIONS: SceneDecoration[] = [
  { element: <SpaceshipPlanet color="#FF6B6B" size={28} />, position: { top: 60, left: -36 }, behind: true },
  { element: <SpaceshipPlanet color="#FFB347" size={18} />, position: { top: 8, right: -40 }, behind: true },
  { element: <SpaceshipStar size={22} />,                   position: { top: -14, left: 50 }, behind: true },
  { element: <SpaceshipStar size={12} />,                   position: { top: 4,  left: 72 }, behind: true },
];

const meta = {
  title: 'Assets/Logo/SpaceshipLogoScene',
  component: SpaceshipLogoScene,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Saucer logo surrounded by decorative planets and stars. The entire scene flees together as a single object.',
      },
    },
  },
  argTypes: {
    width: {
      control: { type: 'number' },
      table: { category: 'Sizing' },
    },
    interactive: {
      control: 'boolean',
      table: { category: 'Behaviour' },
    },
    beamDuration: {
      control: { type: 'number' },
      table: { category: 'Behaviour' },
    },
    beamSkewRange: {
      control: { type: 'number' },
      table: { category: 'Behaviour' },
    },
    fleeRadius: {
      control: { type: 'number' },
      table: { category: 'Physics' },
    },
    maxDisplacement: {
      control: { type: 'number' },
      table: { category: 'Physics' },
    },
    disableMotion: {
      control: 'boolean',
      table: { category: 'Motion' },
    },
    domeColor: {
      control: { type: 'color' },
      table: { category: 'Colors' },
    },
    discColor: {
      control: { type: 'color' },
      table: { category: 'Colors' },
    },
    bellyColor: {
      control: { type: 'color' },
      table: { category: 'Colors' },
    },
    beamColor: {
      control: { type: 'color' },
      table: { category: 'Colors' },
    },
    outlineOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      table: { category: 'Colors' },
    },
    decorations: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  args: {
    width: 180,
    interactive: true,
    beamDuration: 3,
    beamSkewRange: 15,
    maxDisplacement: 100,
    disableMotion: false,
    domeColor: '#F9C600',
    discColor: '#3C7DFF',
    bellyColor: '#F9614D',
    beamColor: '#26E6B5',
    outlineOpacity: 0.1,
  },
} satisfies Meta<typeof SpaceshipLogoScene>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── Static ───────────────────────────────────────────────────────────────────

export const Static: Story = {
  args: { disableMotion: true },
};

// ─── Custom Decorations ───────────────────────────────────────────────────────

export const CustomDecorations: Story = {
  args: { interactive: false, decorations: CUSTOM_DECORATIONS },
};

// ─── Large ────────────────────────────────────────────────────────────────────

export const Large: Story = {
  args: { width: 300 },
};

// ─── Dark Background ──────────────────────────────────────────────────────────

export const DarkBackground: Story = {
  render: (args) => (
    <div className="rounded-lg bg-zinc-900 p-16 flex items-center justify-center">
      <SpaceshipLogoScene {...args} />
    </div>
  ),
};
