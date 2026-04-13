import type { Meta, StoryObj } from '@storybook/react';
import { TaskList } from '@/components/ui';
import { CompositionTable, type CompositionEntry } from '@/components/docs/CompositionTable';

const TASKS = [
  'Set up project structure and configure TypeScript',
  'Design the database schema',
  'Implement user authentication with JWT',
  'Build REST API endpoints',
  'Create frontend components',
  'Write unit and integration tests',
  'Deploy to production',
];

const meta = {
  title: 'Components/TaskList',
  component: TaskList,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Animated task progress list with status indicators (pending, active, done) and staggered entry.' } },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    surface: {
      control: { type: 'select' },
      options: ['default', 'shadow-border'],
      table: { category: 'Variants' },
    },
    completedCount:  { control: { type: 'number', min: 0, max: 7 }, table: { category: 'State' } },
    isActive:        { control: 'boolean', table: { category: 'State' } },
    defaultExpanded: { control: 'boolean', table: { category: 'State' } },
    disableMotion:   { control: 'boolean', table: { category: 'Motion' } },
    updatedAt:       { control: 'text' },
    items:           { table: { disable: true } },
  },
  args: {
    items: TASKS,
    completedCount: 0,
    isActive: false,
    defaultExpanded: true,
    disableMotion: false,
    surface: 'default',
  },
} satisfies Meta<typeof TaskList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// ─── Composition ──────────────────────────────────────────────────────────────

const COMPOSITION: CompositionEntry[] = [
  { part: 'Container', padding: '—',         gap: '—',     radius: 'rounded' },
  { part: 'Header',    padding: 'p-3',       gap: '—',     radius: '—' },
  { part: 'Body',      padding: 'px-4 py-4', gap: 'gap-3', radius: '—' },
];

export const Composition: Story = {
  render: () => (
    <CompositionTable
      entries={COMPOSITION}
      sourcePath="components/ui/task-list.tsx"
      preview={
        <div className="w-80">
          <TaskList items={TASKS.slice(0, 3)} completedCount={0} defaultExpanded disableMotion />
        </div>
      }
    />
  ),
  parameters: { controls: { disable: true }, actions: { disable: true }, layout: 'fullscreen' },
  decorators: [],
};

export const InProgress: Story = {
  args: { completedCount: 3, isActive: true, updatedAt: 'Just now' },
};

export const Complete: Story = {
  args: { completedCount: 7 },
};

export const ShadowBorder: Story = {
  args: { surface: 'shadow-border' },
};

export const Collapsed: Story = {
  args: { defaultExpanded: false },
};

