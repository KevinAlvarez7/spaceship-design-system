'use client';

import { useState } from 'react';
import { ChatThread, ChatBubble, ChatMessage, ChatInputBox } from '@/components/ui';
import { GridBackground } from '@/components/effects';
import { PreviewPanel, EditableTitle, ShareableLink } from '@/components/patterns';
import { useChatDemo } from '@/app/patterns/_shared/useChatDemo';

const DEMO_URL = 'https://spaceship.design';

export function PrototypeWorkspacePage() {
  const [previewKey, setPreviewKey] = useState(0);
  const [projectTitle, setProjectTitle] = useState('Spaceship Vibe Prototype');
  const { messages, streamedText, isStreaming, inputValue, setInputValue, handleSubmit } = useChatDemo();

  return (
    <div className="relative flex flex-1 overflow-hidden size-full">
      {/* Layer 1: GridBackground canvas */}
      <GridBackground />

      {/* Layer 2: All content */}
      <div className="relative z-10 flex flex-1 flex-col size-full">

        {/* Project Navbar */}
        <nav className="flex shrink-0 items-center justify-between px-4 py-3 gap-3">
          {/* Left: project name pill with integrated menu */}
          <div className="flex items-center gap-3">
            <EditableTitle
              title={projectTitle}
              onTitleChange={setProjectTitle}
              onMenuClick={() => {}}
            />
          </div>

          {/* Right: URL pill + share button */}
          <div className="flex items-center gap-3">
            <ShareableLink url="spaceship.design/prototype/abc123" />
          </div>
        </nav>

        {/* Side-by-side panels */}
        <main className="flex flex-1 min-h-0 gap-6 px-4 pb-4">

          {/* Chat Panel */}
          <div className="flex flex-col flex-1 min-w-0">
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
            <div className="px-4 pb-3 shrink-0">
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

          {/* Preview Panel */}
          <div className="flex flex-1 min-w-0">
            <PreviewPanel
              onRefresh={() => setPreviewKey(k => k + 1)}
              onOpenInNewTab={() => window.open(DEMO_URL, '_blank')}
            >
              <iframe
                key={previewKey}
                src={DEMO_URL}
                className="w-full h-full border-0"
                title="Preview"
              />
            </PreviewPanel>
          </div>

        </main>
      </div>
    </div>
  );
}
