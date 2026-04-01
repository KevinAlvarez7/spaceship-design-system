import type { Artifact } from '@/components/patterns/artifact-types';
import type { ClarificationQuestion } from '@/components/ui';

export const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: 'brief',
    type: 'brief',
    title: 'Project Brief',
    status: 'complete',
    updatedAt: '2 min ago',
    content: `## Overview\n\nBuild an AI-powered tool that generates full-stack apps from natural language prompts.\n\n## Goals\n\n- Enable non-technical users to create production-ready apps\n- Reduce time-to-prototype from days to minutes`,
  },
  {
    id: 'code',
    type: 'code',
    title: 'Generated Code',
    status: 'in-progress',
    updatedAt: '5 min ago',
    content: `\`\`\`tsx\nfunction App() {\n  return <div>Hello World</div>;\n}\n\`\`\``,
  },
  {
    id: 'preview',
    type: 'preview',
    title: 'Live Preview',
    status: 'draft',
    updatedAt: '10 min ago',
    content: '',
  },
];

export const MOCK_CLARIFICATION_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'What type of project are you building?',
    options: ['Web app', 'Mobile app', 'API / backend', 'CLI tool'],
  },
  {
    type: 'multi',
    label: 'Which features do you need?',
    options: ['Authentication', 'Database', 'File uploads', 'Email notifications'],
  },
];
