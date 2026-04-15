import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SpaceshipLogoV2 } from '@/components/effects';
import { ThinkingSaucer } from '@/components/ui';

const meta = {
  title: 'Assets/Logo/SpaceshipLogo',
  component: SpaceshipLogoV2,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Standalone saucer logo with cursor-flee spring physics and a sweeping tractor beam.',
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
    showBeam: {
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
    className: { table: { disable: true } },
    onMouseEnter: { table: { disable: true } },
  },
  args: {
    width: 180,
    interactive: true,
    showBeam: true,
    beamDuration: 3,
    beamSkewRange: 15,
    fleeRadius: 300,
    maxDisplacement: 100,
    disableMotion: false,
    domeColor: '#F9C600',
    discColor: '#3C7DFF',
    bellyColor: '#F9614D',
    beamColor: '#26E6B5',
    outlineOpacity: 0.1,
  },
} satisfies Meta<typeof SpaceshipLogoV2>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ──────────────────────────────────────────────────────────────────

export const Default: Story = {};

// ─── All Sizes ────────────────────────────────────────────────────────────────

type LogoEntry =
  | { kind: 'logo';   subtitle: string; width: number; outlineOpacity: number; usedIn: string[] }
  | { kind: 'saucer'; subtitle: string; size: 'lg' | 'xl'; px: number; outlineOpacity: number; usedIn: string[] };

const ALL_SIZES: LogoEntry[] = [
  { kind: 'logo',   subtitle: 'Favicon',     width: 16,  outlineOpacity: 1,    usedIn: ['Browser favicon'] },
  { kind: 'logo',   subtitle: 'Thinking',    width: 20,  outlineOpacity: 1,    usedIn: ['ThinkingLogo'] },
  { kind: 'saucer', subtitle: 'Saucer / lg', size: 'lg', px: 24, outlineOpacity: 0.5,  usedIn: ['ThinkingSaucer (default)', 'Thinking component'] },
  { kind: 'saucer', subtitle: 'Saucer / xl', size: 'xl', px: 28, outlineOpacity: 0.25, usedIn: ['ThinkingSaucer size="xl"'] },
  { kind: 'logo',   subtitle: 'Navbar',      width: 32,  outlineOpacity: 0.1,  usedIn: ['Navigation header'] },
  { kind: 'logo',   subtitle: 'Icon',        width: 64,  outlineOpacity: 0.1,  usedIn: ['App icon'] },
  { kind: 'logo',   subtitle: 'Hero',        width: 110, outlineOpacity: 0.1,  usedIn: ['HomepagePage', 'NewProjectFlowPage'] },
];

export const AllSizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-8">
      {ALL_SIZES.map((entry) => {
        const px = entry.kind === 'logo' ? entry.width : entry.px;
        // Clip to visible saucer content only — viewBox spans 0–94 but visible art ends at y≈74.
        // Using 74 (not 94) removes the ~17px transparent whitespace at the SVG bottom so the
        // saucer appears flush with the bottom of its square stage.
        const clipH = entry.kind === 'logo' ? Math.round(74 * (entry.width / 129)) : px;
        return (
          <div key={`${entry.subtitle}-${px}`} className="flex flex-col items-center gap-3">
            {/* Square stage — logo pinned to bottom, clipped to visible content height */}
            <div style={{ position: 'relative', width: px, height: px, flexShrink: 0 }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: clipH, overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                {entry.kind === 'logo' ? (
                  <SpaceshipLogoV2
                    {...args}
                    width={entry.width}
                    disableMotion
                    interactive={false}
                    showBeam={false}
                  />
                ) : (
                  <ThinkingSaucer size={entry.size} disableMotion />
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-medium text-zinc-700">{px}px</span>
              <span className="text-xs text-zinc-400">{entry.subtitle}</span>
              <span className="text-xs text-zinc-400">opacity {entry.outlineOpacity}</span>
              {entry.usedIn.map(use => (
                <span key={use} className="text-xs text-zinc-400">{use}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  ),
};

// ─── Static ───────────────────────────────────────────────────────────────────

export const Static: Story = {
  args: { disableMotion: true },
};

// ─── No Beam ──────────────────────────────────────────────────────────────────

export const NoBeam: Story = {
  args: { showBeam: false },
};

// ─── Large ────────────────────────────────────────────────────────────────────

export const Large: Story = {
  args: { width: 300 },
};

// ─── Dark Background ──────────────────────────────────────────────────────────

export const DarkBackground: Story = {
  render: (args) => (
    <div className="rounded-lg bg-zinc-900 p-16 flex items-center justify-center">
      <SpaceshipLogoV2 {...args} />
    </div>
  ),
};
