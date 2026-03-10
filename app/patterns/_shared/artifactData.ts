export type ArtifactType = 'prd' | 'research' | 'implementation' | 'code' | 'preview';
export type ArtifactStatus = 'draft' | 'in-progress' | 'complete';

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  status: ArtifactStatus;
  content: string;
  updatedAt: string;
}

export interface ArtifactNavigationProps {
  artifacts: Artifact[];
  activeId: string;
  onSelect: (id: string) => void;
  onRefresh?: () => void;
  onOpenInNewTab?: () => void;
}

export const ARTIFACT_TYPE_LABEL: Record<ArtifactType, string> = {
  prd:            'PRD',
  research:       'Research',
  implementation: 'Impl. Plan',
  code:           'Code',
  preview:        'Preview',
};

export const ARTIFACT_STATUS_VARIANT: Record<ArtifactStatus, 'neutral' | 'warning' | 'success'> = {
  'draft':       'neutral',
  'in-progress': 'warning',
  'complete':    'success',
};

export const ARTIFACT_STATUS_LABEL: Record<ArtifactStatus, string> = {
  'draft':       'Draft',
  'in-progress': 'In Progress',
  'complete':    'Complete',
};

export const MOCK_ARTIFACTS: Artifact[] = [
  {
    id: 'prd',
    type: 'prd',
    title: 'Product Requirements',
    status: 'complete',
    updatedAt: '2 min ago',
    content: `## Overview

Build an AI-powered vibe-coding tool that generates full-stack web applications from natural language prompts. The tool continuously updates multiple artifact types as the user iterates.

## Goals

- Enable non-technical users to create production-ready apps
- Reduce time-to-prototype from days to minutes
- Support live iteration via a chat interface

## User Stories

1. As a founder, I want to describe my app idea and see a working prototype instantly
2. As a designer, I want to tweak UI details through natural language without writing code
3. As a developer, I want to see the generated code and override specific parts

## Success Metrics

- Time to first prototype: < 2 minutes
- User satisfaction score: > 4.5 / 5
- Iteration cycle time: < 30 seconds per change`,
  },
  {
    id: 'research',
    type: 'research',
    title: 'User Research Plan',
    status: 'in-progress',
    updatedAt: '5 min ago',
    content: `## Research Objectives

Understand how founders and designers currently prototype ideas and where they experience the most friction.

## Methods

### Interviews (Week 1–2)
- 12 semi-structured interviews with target users
- Focus on current workflow, pain points, and workarounds

### Usability Testing (Week 3)
- 6 participants, think-aloud protocol
- Tasks: create app, iterate on UI, export code

### Survey (Ongoing)
- 200 respondents from target segment
- Quantify frequency and severity of key pain points

## Key Questions

1. What tools do you currently use for rapid prototyping?
2. Where do you spend the most time during ideation?
3. What would make you switch to a new tool immediately?

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Recruitment | 1 week | 18 participants |
| Interviews | 2 weeks | Interview notes |
| Usability | 1 week | Session recordings |
| Analysis | 1 week | Research report |`,
  },
  {
    id: 'implementation',
    type: 'implementation',
    title: 'Implementation Plan',
    status: 'in-progress',
    updatedAt: '8 min ago',
    content: `## Architecture

### Frontend
- Next.js 15 App Router with TypeScript
- Tailwind CSS v4 for styling
- Framer Motion for animations
- Monaco Editor for code display

### Backend
- Node.js with tRPC for type-safe APIs
- Streaming responses via Server-Sent Events
- Redis for session state

### AI Pipeline
- Claude claude-sonnet-4-6 as primary generation model
- Multi-step chain: PRD → Research → Plan → Code
- Artifact streaming with incremental updates

## Milestones

1. **Sprint 1** — Core chat interface + basic code generation
2. **Sprint 2** — Multi-artifact panel layout + live preview
3. **Sprint 3** — Iteration engine + diff highlighting
4. **Sprint 4** — Export, sharing, and collaboration

## Risks

- Token limits for large codebases → chunked context strategy
- Preview iframe security → sandboxed execution environment
- Latency perception → streaming with skeleton states`,
  },
  {
    id: 'code',
    type: 'code',
    title: 'Generated Code',
    status: 'draft',
    updatedAt: '12 min ago',
    content: `import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={msg.role === 'user' ? 'text-right' : 'text-left'}
            >
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe what you want to build..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Send'}
        </button>
      </form>
    </div>
  );
}`,
  },
  {
    id: 'preview',
    type: 'preview',
    title: 'Live Preview',
    status: 'draft',
    updatedAt: '12 min ago',
    content: '',
  },
];
