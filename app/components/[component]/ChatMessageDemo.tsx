'use client';

import { useState, useEffect } from 'react';
import { ChatMessage } from '@/components/ui';

const FULL_TEXT = `Here's what I built:

**Core screens:**
- Kiosk scan state with sample data
- Officer exception console
- Audit trail view

Ready to click through immediately.`;

export function ChatMessageStreamingDemo() {
  const [displayed, setDisplayed] = useState('');
  const [streaming, setStreaming] = useState(true);

  useEffect(() => {
    if (!streaming) return;
    if (displayed.length >= FULL_TEXT.length) {
      setStreaming(false);
      return;
    }
    const timer = setTimeout(() => {
      setDisplayed(FULL_TEXT.slice(0, displayed.length + 3));
    }, 30);
    return () => clearTimeout(timer);
  }, [displayed, streaming]);

  function restart() {
    setDisplayed('');
    setStreaming(true);
  }

  return (
    <div className="space-y-4">
      <ChatMessage content={displayed} isStreaming={streaming} />
      {!streaming && (
        <button
          onClick={restart}
          className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          ↺ Replay
        </button>
      )}
    </div>
  );
}
