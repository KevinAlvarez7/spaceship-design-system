'use client';

import { useState } from 'react';
import {
  TabBar, TabBarItem,
  ChatThread, ChatBubble, ChatMessage, Button,
} from '@/components/ui';
import type { ClarificationQuestion } from '@/components/ui';
import { ChatPanel, ChatInputSlot } from '@/components/patterns';
import type { ChatInputSlotProps } from '@/components/patterns';
import { useChatDemo } from '@/app/_shared/useChatDemo';

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_QUESTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'What kind of project is this?',
    options: ['Web app', 'Mobile app', 'CLI tool', 'API service'],
  },
  {
    type: 'multi',
    label: 'Which tools are you using?',
    options: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
  },
];

type DemoKey = 'footer-swap' | 'clarification' | 'chat' | 'minimal';

// ─── Demo: Footer Swap ────────────────────────────────────────────────────────

function FooterSwapDemo() {
  const [mode, setMode] = useState<ChatInputSlotProps['mode']>('clarification');

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <Button
          variant={mode === 'clarification' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('clarification')}
        >
          Clarification
        </Button>
        <Button
          variant={mode === 'input' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setMode('input')}
        >
          Chat Input
        </Button>
      </div>
      <div className="flex flex-1 min-h-0 items-end">
        <ChatInputSlot
          mode={mode}
          clarification={{
            questions: DEMO_QUESTIONS,
            onSubmit: () => setMode('input'),
          }}
          input={{
            size: 'sm',
            submitLabel: 'Send',
            placeholder: 'Ask anything...',
            value: '',
            onChange: () => {},
            onSubmit: () => {},
          }}
        />
      </div>
    </div>
  );
}

// ─── Demo: Clarification Flow ─────────────────────────────────────────────────

function ClarificationFlowDemo() {
  const [title, setTitle] = useState('New Project');
  const [showClarification, setShowClarification] = useState(true);

  return (
    <ChatPanel
      className="h-full"
      title={title}
      onTitleChange={setTitle}
      onMenuClick={() => {}}
      clarification={showClarification ? {
        questions: DEMO_QUESTIONS,
        onSubmit: () => setShowClarification(false),
      } : undefined}
      input={!showClarification ? {
        size: 'sm',
        submitLabel: 'Send',
        placeholder: 'Ask anything...',
        value: '',
        onChange: () => {},
        onSubmit: () => {},
      } : undefined}
    >
      <ChatThread bare className="flex-1 min-h-0">
        <ChatMessage content="Hi! Before we get started, I have a couple of quick questions." />
      </ChatThread>
    </ChatPanel>
  );
}

// ─── Demo: Chat ───────────────────────────────────────────────────────────────

function ChatDemo() {
  const [title, setTitle] = useState('Vibe Prototype');
  const { messages, streamedText, isStreaming, inputValue, setInputValue, handleSubmit, handleStop } = useChatDemo();

  return (
    <ChatPanel
      className="h-full"
      title={title}
      onTitleChange={setTitle}
      onMenuClick={() => {}}
      input={{
        size: 'sm',
        submitLabel: 'Send',
        placeholder: 'Iterate further...',
        value: inputValue,
        onChange: e => setInputValue(e.target.value),
        onSubmit: handleSubmit,
        onStop: isStreaming ? handleStop : undefined,
      }}
    >
      <ChatThread bare className="flex-1 min-h-0">
        {messages.map((msg, i) =>
          msg.role === 'user'
            ? <ChatBubble key={i}>{msg.content}</ChatBubble>
            : <ChatMessage key={i} content={msg.content} />
        )}
        {isStreaming && <ChatMessage content={streamedText} isStreaming />}
      </ChatThread>
    </ChatPanel>
  );
}

// ─── Demo: Minimal ────────────────────────────────────────────────────────────

function MinimalDemo() {
  return (
    <ChatPanel
      className="h-full"
      input={{
        size: 'sm',
        submitLabel: 'Send',
        placeholder: 'Ask anything...',
        value: '',
        onChange: () => {},
        onSubmit: () => {},
      }}
    >
      <ChatThread bare className="flex-1 min-h-0">
        <ChatMessage content="This panel has no header — the title lives at page level. Use this when the chat is one panel inside a larger layout." />
      </ChatThread>
    </ChatPanel>
  );
}

// ─── ChatPanelPage ────────────────────────────────────────────────────────────

export function ChatPanelPage() {
  const [activeDemo, setActiveDemo] = useState<DemoKey>('chat');

  return (
    <div className="flex flex-col size-full overflow-hidden">

      {/* Toolbar — viewer chrome */}
      <div className="flex items-center justify-between shrink-0 px-4 py-2 border-b border-zinc-200 bg-white">
        <span className="text-sm font-semibold text-zinc-800">Chat Panel</span>
        <TabBar value={activeDemo} onChange={v => setActiveDemo(v as DemoKey)} surface="default">
          <TabBarItem value="footer-swap">Footer Swap</TabBarItem>
          <TabBarItem value="clarification">Clarification Flow</TabBarItem>
          <TabBarItem value="chat">Chat</TabBarItem>
          <TabBarItem value="minimal">Minimal</TabBarItem>
        </TabBar>
      </div>

      {/* Active demo — fills remaining height */}
      <div className="flex flex-col flex-1 min-h-0 p-6 items-center">
        <div className="w-(--sizing-chat-default) h-full">
          {activeDemo === 'footer-swap'    && <FooterSwapDemo />}
          {activeDemo === 'clarification'  && <ClarificationFlowDemo />}
          {activeDemo === 'chat'           && <ChatDemo />}
          {activeDemo === 'minimal'        && <MinimalDemo />}
        </div>
      </div>

    </div>
  );
}
