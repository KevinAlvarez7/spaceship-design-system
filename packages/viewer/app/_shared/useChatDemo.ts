'use client';

import { useState, useEffect, useRef } from 'react';

export type Message =
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

export function useChatDemo() {
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

  function handleStop() {
    setIsStreaming(false);
    const partial = STREAMING_RESPONSE.slice(0, streamIndexRef.current);
    if (partial) {
      setMessages(prev => [...prev, { role: 'assistant', content: partial }]);
    }
    setStreamedText('');
  }

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

  return { messages, streamedText, isStreaming, inputValue, setInputValue, handleSubmit, handleStop };
}
