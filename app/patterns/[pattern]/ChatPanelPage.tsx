'use client';

import { useState } from 'react';
import { Preview } from '@/components/viewer/Preview';
import { ChatThread, ChatBubble, ChatMessage } from '@/components/ui';
import { ChatPanel } from '@/components/patterns';
import { useChatDemo } from '@/app/patterns/_shared/useChatDemo';

export function ChatPanelPage() {
  const [title, setTitle] = useState('Vibe Prototype');
  const { messages, streamedText, isStreaming, inputValue, setInputValue, handleSubmit, handleStop } = useChatDemo();

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat Panel</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Self-contained chat column with an optional editable title header and a pinned footer slot.
        </p>
      </div>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With Header &amp; Footer</h2>
        <Preview label="Chat Panel — editable title + input" className="h-[36rem]">
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
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Footer Only (no header)</h2>
        <Preview label="Chat Panel — no title header" className="h-[28rem]">
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
        </Preview>
      </section>
    </div>
  );
}
