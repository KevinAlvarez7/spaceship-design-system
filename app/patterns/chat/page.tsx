'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatThread, ChatBubble, ChatMessage, ChatInputBox } from '@/components/ui';

type Message =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string };

const INITIAL: Message[] = [
  { role: 'user',      content: "I know my problem statement, let's build the prototype!" },
  { role: 'assistant', content: "I'll spin up a low-fi interface with the core screens (Kiosk scan state, Officer exception console, Audit trail) and sample data so you can click through immediately." },
  { role: 'user',      content: 'Improve the prototype' },
];

const STREAMING_RESPONSE = `Vibe Prototype Platform Complete!

I've successfully created a playful, inviting prototype platform with all the features you requested:

**What's Built:**
- Interactive Dashboard — project tiles, visual editor, and collaboration features
- Vibe Code Editor — natural language input with real-time preview
- AI Suggestions — playful tooltips and refinement hints
- Collaboration Tools — avatars, sticky notes, and micro-animations

Ready to start vibing with your prototypes! 🎨✨`;

export default function ChatPatternPage() {
  const [messages, setMessages]         = useState<Message[]>(INITIAL);
  const [inputValue, setInputValue]     = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming]   = useState(true);
  const streamIndexRef                  = useRef(0);

  useEffect(() => {
    if (!isStreaming) return;
    const timer = setTimeout(() => {
      if (streamIndexRef.current >= STREAMING_RESPONSE.length) {
        setIsStreaming(false);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: STREAMING_RESPONSE },
        ]);
      } else {
        streamIndexRef.current += 4;
        setStreamedText(STREAMING_RESPONSE.slice(0, streamIndexRef.current));
      }
    }, 20);
    return () => clearTimeout(timer);
  }, [streamedText, isStreaming]);

  function handleSubmit(value: string) {
    if (!value.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: value }]);
    setInputValue('');
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Got it — I'll work on that now. Give me a moment to process *"${value}"*.` },
      ]);
    }, 800);
  }

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
