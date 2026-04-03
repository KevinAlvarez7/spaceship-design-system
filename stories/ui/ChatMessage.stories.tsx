import type { Meta, StoryObj } from '@storybook/react';
import { ChatMessage } from '@/components/ui';

const SAMPLE_MARKDOWN = `Here's a simple React counter component:

\`\`\`tsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

It uses \`useState\` to track the count and increments on click.`;

const meta = {
  title: 'Components/ChatMessage',
  component: ChatMessage,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Assistant message row with markdown rendering and optional streaming state.' } },
  },
  argTypes: {
    content:       { control: 'text' },
    isStreaming:   { control: 'boolean', table: { category: 'State' } },
    disableMotion: { control: 'boolean', table: { category: 'Motion' } },
  },
  args: {
    content: 'Hello! I can help you build anything. What would you like to create today?',
    isStreaming: false,
    disableMotion: false,
  },
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Streaming: Story = {
  args: { isStreaming: true, content: 'I\'m thinking about this…' },
};

export const WithMarkdown: Story = {
  args: { content: SAMPLE_MARKDOWN },
};

export const LongResponse: Story = {
  args: {
    content: `I'll help you build a complete dashboard. Here's my plan:\n\n1. **Authentication** — JWT-based login with refresh tokens\n2. **Layout** — Responsive sidebar + main content area\n3. **Charts** — Real-time data visualization using Recharts\n4. **API** — REST endpoints with Next.js Route Handlers\n\nShall I start with the authentication layer?`,
  },
};
