'use client';

import { useState } from 'react';
import { ChatThread, ChatBubble, ChatMessage, ChatInputBox } from '@/components/ui';

type Message = { role: 'user' | 'assistant'; content: string };

const SEED: Message[] = [
  { role: 'user',      content: 'What can you help me build?' },
  { role: 'assistant', content: 'I can help you prototype ideas, explore problems, and build interactive demos. What are you working on?' },
  { role: 'user',      content: 'I need a dashboard for logistics tracking.' },
  { role: 'assistant', content: 'Great choice! A **logistics dashboard** could include:\n\n- Real-time shipment map\n- Status timeline per order\n- Exception alerts\n\nShall I start with a low-fi wireframe?' },
];

export function ChatThreadDemo() {
  const [messages, setMessages] = useState<Message[]>(SEED);
  const [input, setInput] = useState('');

  function addMessage(value: string) {
    if (!value.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', content: value },
      { role: 'assistant', content: `Got it — you said: *"${value}"*. I'll work on that now.` },
    ]);
    setInput('');
  }

  return (
    <div className="flex flex-col h-[480px] gap-3">
      <ChatThread className="flex-1">
        {messages.map((msg, i) =>
          msg.role === 'user'
            ? <ChatBubble key={i}>{msg.content}</ChatBubble>
            : <ChatMessage key={i} content={msg.content} />
        )}
      </ChatThread>
      <ChatInputBox
        size="sm"
        submitLabel="Send"
        placeholder="Type a message and press Enter…"
        value={input}
        onChange={e => setInput(e.target.value)}
        onSubmit={addMessage}
      />
    </div>
  );
}
