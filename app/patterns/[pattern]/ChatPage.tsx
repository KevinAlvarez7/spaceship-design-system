'use client';

import { Preview } from '@/components/viewer/Preview';
import { ChatThread, ChatBubble, ChatMessage, ChatInputBox } from '@/components/ui';
import { useChatDemo } from '@/app/patterns/_shared/useChatDemo';

export function ChatPage() {
  const { messages, streamedText, isStreaming, inputValue, setInputValue, handleSubmit } = useChatDemo();

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Chat</h1>
        <p className="mt-2 text-sm text-zinc-500">Full-height conversational thread with streaming AI responses and input.</p>
      </div>
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Interactive Demo</h2>
        <Preview label="Interactive Demo" className="h-[32rem]">
          <div className="flex flex-col h-full w-full">
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

            <div className="px-(--spacing-2xs) pb-(--spacing-3xs) shrink-0">
              <ChatInputBox
                size="sm"
                submitLabel="Send"
                placeholder="Iterate further..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onSubmit={handleSubmit}
                disabled={isStreaming}
              />
            </div>
          </div>
        </Preview>
      </section>
    </div>
  );
}
