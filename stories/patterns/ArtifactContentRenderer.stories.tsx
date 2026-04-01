import type { Meta, StoryObj } from '@storybook/react';
import { ArtifactContentRenderer } from '@/components/patterns';
import type { Artifact } from '@/components/patterns/artifact-types';

const CODE_ARTIFACT: Artifact = {
  id: '1',
  type: 'code',
  title: 'App.tsx',
  status: 'complete',
  updatedAt: '1 min ago',
  content: `\`\`\`tsx
function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Counter App</h1>
      <p className="text-4xl tabular-nums">{count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}
\`\`\``,
};

const PREVIEW_ARTIFACT: Artifact = {
  id: '2',
  type: 'preview',
  title: 'Preview',
  status: 'draft',
  updatedAt: '2 min ago',
  content: '',
};

const MARKDOWN_ARTIFACT: Artifact = {
  id: '3',
  type: 'brief',
  title: 'Project Brief',
  status: 'complete',
  updatedAt: '5 min ago',
  content: `## Overview\n\nBuild an AI-powered vibe-coding tool.\n\n## Goals\n\n- Enable non-technical users\n- Reduce time-to-prototype\n\n## Timeline\n\n| Phase | Duration |\n|-------|----------|\n| Discovery | 1 week |\n| Build | 2 weeks |\n| Launch | 1 week |`,
};

const meta = {
  title: 'Patterns/ArtifactContentRenderer',
  component: ArtifactContentRenderer,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    artifact: { table: { disable: true } },
  },
  args: {
    artifact: CODE_ARTIFACT,
  },
} satisfies Meta<typeof ArtifactContentRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CodeArtifact: Story = {};

export const PreviewArtifact: Story = {
  args: { artifact: PREVIEW_ARTIFACT },
};

export const MarkdownArtifact: Story = {
  args: { artifact: MARKDOWN_ARTIFACT },
};
