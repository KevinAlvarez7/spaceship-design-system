'use client';

import { ChatThread, ChatBubble, ChatMessage, ChatInputBox } from '@/components/ui';
import { useChatDemo } from '@/app/patterns/_shared/useChatDemo';

export function ChatPage() {
  const { messages, streamedText, isStreaming, inputValue, setInputValue, handleSubmit } = useChatDemo();

  return (
    <div className="flex flex-col h-full">
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
  );
}
