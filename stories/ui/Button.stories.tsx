import type { Meta, StoryObj } from '@storybook/react';
import { Rocket, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { EXCLUDE_MOTION_PROPS } from '../_helpers/motion-argtypes';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'success', 'destructive'],
      table: { category: 'Variants' },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'icon-sm', 'icon-md', 'icon-lg'],
      table: { category: 'Variants' },
    },
    surface: {
      control: { type: 'select' },
      options: ['flat', 'shadow'],
      table: { category: 'Variants' },
    },
    disabled: {
      control: 'boolean',
      table: { category: 'State' },
    },
    disableMotion: {
      control: 'boolean',
      table: { category: 'Motion' },
    },
    children: {
      control: 'text',
    },
    leadingIcon: { table: { disable: true } },
    trailingIcon: { table: { disable: true } },
    asChild: { table: { disable: true } },
    ...EXCLUDE_MOTION_PROPS,
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    surface: 'flat',
    disabled: false,
    disableMotion: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default ─────────────────────────────────────────────────────────────────
export const Default: Story = {};

// ─── All Variants ─────────────────────────────────────────────────────────────
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="success">Success</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

// ─── All Sizes ────────────────────────────────────────────────────────────────
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-end gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// ─── Shadow Surface ──────────────────────────────────────────────────────────
export const ShadowSurface: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" surface="shadow">Primary</Button>
      <Button variant="secondary" surface="shadow">Secondary</Button>
      <Button variant="ghost" surface="shadow">Ghost</Button>
      <Button variant="success" surface="shadow">Success</Button>
      <Button variant="destructive" surface="shadow">Destructive</Button>
    </div>
  ),
};

// ─── With Icons ───────────────────────────────────────────────────────────────
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button leadingIcon={Rocket}>Leading Icon</Button>
      <Button trailingIcon={ChevronRight}>Trailing Icon</Button>
      <Button leadingIcon={Star} trailingIcon={ChevronRight}>Both Icons</Button>
      <Button size="icon-md" leadingIcon={Rocket} aria-label="Rocket" />
    </div>
  ),
};

// ─── Disabled ────────────────────────────────────────────────────────────────
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" disabled>Primary</Button>
      <Button variant="secondary" disabled>Secondary</Button>
      <Button variant="ghost" disabled>Ghost</Button>
      <Button variant="destructive" disabled>Destructive</Button>
    </div>
  ),
};

// ─── Motion Disabled ─────────────────────────────────────────────────────────
export const MotionDisabled: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" disableMotion>Primary (no motion)</Button>
      <Button variant="secondary" disableMotion>Secondary (no motion)</Button>
    </div>
  ),
};
