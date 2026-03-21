'use client';

import { useState } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'motion/react';
import { GridBackground, SpaceshipLogoScene } from '@/components/effects';
import { ChatBubble, ChatInputBox } from '@/components/ui';
import { springs } from '@/tokens';

type Phase = 'homepage' | 'chat';

export function HomepagePage() {
  const [phase, setPhase] = useState<Phase>('homepage');
  const [prompt, setPrompt] = useState('');

  function handleSubmit(value: string) {
    if (!value.trim()) return;
    setPrompt(value);
    setPhase('chat');
  }

  return (
    <LayoutGroup>
      <div className="relative flex-1 overflow-hidden bg-(--bg-surface-primary)">

        {/* Grid background — static canvas, always underneath */}
        <div className="absolute inset-0">
          <GridBackground background="var(--bg-surface-base)" />
        </div>

        {/* Full-rectangle fade cover — opacity 0→1, no visible circle shape */}
        <AnimatePresence>
          {phase === 'chat' && (
            <motion.div
              className="absolute inset-0 bg-(--bg-surface-primary)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          )}
        </AnimatePresence>

        {/* Content trees — ChatInputBox shared via layoutId */}
        <AnimatePresence mode="popLayout">
          {phase === 'homepage' ? (
            <motion.div
              key="homepage"
              className="absolute inset-0 flex items-center justify-center"
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-col items-center gap-4 w-full max-w-(--sizing-chat-max) px-4">
                <SpaceshipLogoScene
                  width={110}
                  interactive
                  maxDisplacement={60}
                  fleeRadius={200}
                />
                <h1 className="font-serif text-(length:--font-size-4xl) [font-weight:var(--font-weight-bold)] leading-(--line-height-4xl) text-(--text-primary) text-center">
                  What ideas do you want to explore?
                </h1>
                <motion.div layoutId="chat-input" className="w-full" transition={springs.gentle}>
                  <ChatInputBox
                    size="md"
                    placeholder="Explore any problems, prototype any ideas..."
                    onSubmit={handleSubmit}
                  />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              className="absolute inset-0 flex flex-col items-center p-4 gap-2"
            >
              <motion.p
                className="w-(--sizing-chat-default) [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-secondary) shrink-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                New Chat
              </motion.p>
              <div className="flex flex-col flex-1 w-(--sizing-chat-default) min-h-0 overflow-y-auto gap-3 py-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.45 }}
                >
                  <ChatBubble>{prompt}</ChatBubble>
                </motion.div>
              </div>
              <div className="w-(--sizing-chat-default) shrink-0">
                <motion.div layoutId="chat-input" transition={springs.gentle}>
                  <ChatInputBox
                    size="md"
                    placeholder="Continue the conversation..."
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </LayoutGroup>
  );
}
