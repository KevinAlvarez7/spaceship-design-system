import type { Meta, StoryObj } from '@storybook/react';
import { ApprovalCard } from '@/components/ui';

const PLAN_CONTENT = `**Phase 1: Database schema**
- Create users, projects, and tasks tables
- Add foreign key relationships
- Write migration scripts

**Phase 2: API layer**
- Build REST endpoints with validation
- Add authentication middleware
- Write integration tests

**Phase 3: Frontend**
- Implement React components
- Connect to API
- Add loading and error states`;

const meta = {
  title: 'Components/ApprovalCard',
  component: ApprovalCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Approve/reject decision card for gating AI-generated plans before execution.' } },
  },
  decorators: [
    (Story) => (
      <div className="w-(--sizing-chat-default)">
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
    approveLabel:  { control: 'text' },
    rejectLabel:   { control: 'text' },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
    children:      { table: { disable: true } },
    onApprove:     { table: { disable: true } },
    onReject:      { table: { disable: true } },
  },
  args: {
    surface: 'shadow-border',
    approveLabel: 'Approve plan',
    rejectLabel: 'Request changes',
    disableMotion: false,
  },
  render: (args) => (
    <ApprovalCard {...args}>
      <div className="prose prose-sm max-w-none">
        <p className="text-sm whitespace-pre-line">{PLAN_CONTENT}</p>
      </div>
    </ApprovalCard>
  ),
} satisfies Meta<typeof ApprovalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabels: Story = {
  args: {
    approveLabel: 'Looks good, proceed',
    rejectLabel: 'Needs revision',
  },
};

export const DefaultSurface: Story = {
  args: { surface: 'default' },
};
