'use client';

import { useState } from 'react';
import { Preview } from '@/components/viewer/Preview';
import { ChatThread, ChatBubble, ChatMessage, Button } from '@/components/ui';
import type { ClarificationQuestion } from '@/components/ui';
import { ChatPanel, FooterSwitch } from '@/components/patterns';
import type { FooterSwitchProps } from '@/components/patterns';
import { useChatDemo } from '@/app/_shared/useChatDemo';

// ─── Demo clarification questions ─────────────────────────────────────────────

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

// ─── ChatPanelPage ─────────────────────────────────────────────────────────────

export function ChatPanelPage() {
  const [title, setTitle] = useState('Vibe Prototype');
  const { messages, streamedText, isStreaming, inputValue, setInputValue, handleSubmit, handleStop } = useChatDemo();

  // ── Transition demo state ─────────────────────────────────────────────────
  const [showClarification, setShowClarification] = useState(true);
  const [transitionTitle, setTransitionTitle] = useState('New Project');

  // ── FooterSwitch showcase state ───────────────────────────────────────────
  const [footerMode, setFooterMode] = useState<FooterSwitchProps['mode']>('clarification');

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Panel</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Self-contained chat column with an optional editable title header and a pinned footer slot.
        </p>
      </div>

      {/* ── FooterSwitch — shadow-safe transition showcase ─────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-1">FooterSwitch</h2>
        <p className="text-sm text-zinc-500 mb-3">
          Standalone component that swaps ClarificationCard and ChatInputBox without{' '}
          <code className="font-mono text-zinc-700">overflow-hidden</code>. Box-shadows on both
          components remain fully visible throughout the height spring animation.
        </p>
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant={footerMode === 'clarification' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFooterMode('clarification')}
          >
            Clarification
          </Button>
          <Button
            variant={footerMode === 'input' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFooterMode('input')}
          >
            Chat Input
          </Button>
        </div>
        <Preview label="FooterSwitch — shadow-safe ClarificationCard ↔ ChatInputBox">
          <div className="w-(--sizing-chat-default) py-6">
            <FooterSwitch
              mode={footerMode}
              clarification={{
                questions: DEMO_QUESTIONS,
                onSubmit: () => setFooterMode('input'),
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
        </Preview>
      </section>

      {/* ── Footer transition demo ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-1">Footer Transition</h2>
        <p className="text-sm text-zinc-500 mb-3">
          ClarificationCard ↔ ChatInputBox swap with height morphing and content crossfade.
        </p>
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant={showClarification ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowClarification(true)}
          >
            Clarification
          </Button>
          <Button
            variant={!showClarification ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowClarification(false)}
          >
            Chat Input
          </Button>
        </div>
        <Preview label="Footer transition — ClarificationCard ↔ ChatInputBox" className="h-[42rem]">
          <div className="w-(--sizing-chat-default)">
            <ChatPanel
              title={transitionTitle}
              onTitleChange={setTransitionTitle}
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
              <ChatThread className="flex-1 min-h-0">
                <ChatMessage content="Hi! Before we get started, I have a couple of quick questions." />
              </ChatThread>
            </ChatPanel>
          </div>
        </Preview>
      </section>

      {/* ── With Header & Footer ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With Header &amp; Footer</h2>
        <Preview label="Chat Panel — editable title + input" className="h-[36rem]">
          <div className="w-(--sizing-chat-default)">
            <ChatPanel
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
              <ChatThread className="flex-1 min-h-0">
                {messages.map((msg, i) =>
                  msg.role === 'user'
                    ? <ChatBubble key={i}>{msg.content}</ChatBubble>
                    : <ChatMessage key={i} content={msg.content} />
                )}
                {isStreaming && (
                  <ChatMessage content={streamedText} isStreaming />
                )}
              </ChatThread>
            </ChatPanel>
          </div>
        </Preview>
      </section>

      {/* ── Footer only ────────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Footer Only (no header)</h2>
        <Preview label="Chat Panel — no title header" className="h-[28rem]">
          <div className="w-(--sizing-chat-default)">
            <ChatPanel
              input={{
                size: 'sm',
                submitLabel: 'Send',
                placeholder: 'Ask anything...',
                value: '',
                onChange: () => {},
                onSubmit: () => {},
              }}
            >
              <ChatThread className="flex-1 min-h-0">
                <ChatMessage content="This panel has no header — the title lives at page level. Use this when the chat is one panel inside a larger layout." />
              </ChatThread>
            </ChatPanel>
          </div>
        </Preview>
      </section>
    </div>
  );
}
