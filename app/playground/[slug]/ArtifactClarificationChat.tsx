'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  ChatThread,
  ChatBubble,
  ChatMessage,
  ChatInputBox,
  ClarificationCardKeycap,
} from '@/components/ui';
import type { ClarificationQuestion, ClarificationAnswer } from '@/components/ui';
import { springs } from '@/tokens';
import {
  STAGES,
  buildAnswerSummary,
  buildClosingMessage,
} from '@/components/patterns';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadItem =
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'user-bubble';    id: string; content: string }
  | { kind: 'typing';         id: string };

// ─── Preamble ─────────────────────────────────────────────────────────────────

const PREAMBLE_USER = "I want to build an AI-powered tool that generates web apps from natural language prompts. Can you help me scope it out?";
const PREAMBLE_ACK = "That sounds like a great project! I can see a few areas we need to nail down — the target user, the core interaction model, and the technical approach.";
const PREAMBLE_TRANSITIONAL = "Before I start building, I have a few questions to make sure we're aligned.";

// ─── Stage Transitions ────────────────────────────────────────────────────────

const STAGE_TRANSITIONS = [
  "Got it — that gives me a clear picture of who we're building for and what problems to solve. Now let's talk about the solution.",
  "Perfect. I know what we're building and the constraints we need to work within. One last thing — let's align on priorities.",
];

const INITIAL_ITEMS: ThreadItem[] = [
  { kind: 'user-bubble', id: 'preamble-user', content: PREAMBLE_USER },
];

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-(--text-tertiary)"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── Stage mapper ─────────────────────────────────────────────────────────────

function stageToQuestions(stageIndex: number): ClarificationQuestion[] {
  return STAGES[stageIndex].questions as ClarificationQuestion[];
}

// ─── ArtifactClarificationChat ────────────────────────────────────────────────

export function ArtifactClarificationChat() {
  const [items, setItems]             = useState<ThreadItem[]>(INITIAL_ITEMS);
  const [allAnswers, setAllAnswers]   = useState<ClarificationAnswer[][]>([]);
  const [activeStage, setActiveStage] = useState(-1);
  const [inputValue, setInputValue]   = useState('');
  const timeouts                      = useRef<NodeJS.Timeout[]>([]);

  // Preamble mount sequence: user bubble is visible immediately;
  // assistant messages arrive with typing indicators in between.
  useEffect(() => {
    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(fn, delay);
      timeouts.current.push(id);
    }

    // t=0: show first typing indicator
    schedule(() => {
      setItems(prev => [...prev, { kind: 'typing', id: 'preamble-typing-1' }]);
    }, 0);

    // t=600ms: replace typing with ack + start second typing
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'preamble-typing-1'),
        { kind: 'assistant-text', id: 'preamble-ack', content: PREAMBLE_ACK },
        { kind: 'typing',         id: 'preamble-typing-2' },
      ]);
    }, 600);

    // t=1200ms: replace typing with transitional + start third typing
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'preamble-typing-2'),
        { kind: 'assistant-text', id: 'preamble-transitional', content: PREAMBLE_TRANSITIONAL },
        { kind: 'typing',         id: 'preamble-typing-3' },
      ]);
    }, 1200);

    // t=1800ms: remove typing indicator, activate first stage card
    schedule(() => {
      setItems(prev => prev.filter(i => i.id !== 'preamble-typing-3'));
      setActiveStage(0);
    }, 1800);

    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, []);

  function handleStageSubmit(stageIndex: number, answers: ClarificationAnswer[]) {
    const stage = STAGES[stageIndex];
    const summary = buildAnswerSummary(stage, answers);
    const nextStageIndex = stageIndex + 1;
    const isFinal = nextStageIndex >= STAGES.length;

    const newAllAnswers = [...allAnswers];
    newAllAnswers[stageIndex] = answers;
    setAllAnswers(newAllAnswers);

    // Step 1 (immediate): hide current card, add user bubble + typing to thread
    setActiveStage(-2);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: `answer-${stageIndex}`, content: summary },
      { kind: 'typing',      id: `typing-${stageIndex}` },
    ]);

    // Step 2 (800ms): replace typing with transition/closing message
    const t1 = setTimeout(() => {
      setItems(prev => {
        const withoutTyping = prev.filter(i => i.id !== `typing-${stageIndex}`);
        if (isFinal) {
          return [
            ...withoutTyping,
            { kind: 'assistant-text', id: 'closing', content: buildClosingMessage(newAllAnswers) },
          ];
        }
        return [
          ...withoutTyping,
          { kind: 'assistant-text', id: `transition-${stageIndex}`, content: STAGE_TRANSITIONS[stageIndex] },
        ];
      });

      // Step 3 (1400ms total, non-final): reveal next card
      if (!isFinal) {
        const t2 = setTimeout(() => {
          setActiveStage(nextStageIndex);
        }, 600);
        timeouts.current.push(t2);
      } else {
        setActiveStage(STAGES.length);
      }
    }, 800);
    timeouts.current.push(t1);
  }

  const showPanel = activeStage >= 0 && activeStage < STAGES.length;
  const isTransitioning = activeStage === -2;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <ChatThread className="flex-1 min-h-0">
        {items.map(item => {
          if (item.kind === 'assistant-text') {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springs.interactive}
              >
                <ChatMessage content={item.content} />
              </motion.div>
            );
          }
          if (item.kind === 'user-bubble') {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={springs.interactive}
              >
                <ChatBubble>
                  <span className="whitespace-pre-wrap">{item.content}</span>
                </ChatBubble>
              </motion.div>
            );
          }
          if (item.kind === 'typing') {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <TypingIndicator />
              </motion.div>
            );
          }
          return null;
        })}
      </ChatThread>

      <div className="px-4 pb-4 pt-2 shrink-0">
        {showPanel ? (
          <ClarificationCardKeycap
            key={activeStage}
            questions={stageToQuestions(activeStage)}
            onSubmit={answers => handleStageSubmit(activeStage, answers)}
            surface="shadow-border"
          />
        ) : !isTransitioning ? (
          <ChatInputBox
            size="sm"
            submitLabel="Send"
            placeholder="What would you like to change?"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onSubmit={() => {}}
            disabled={activeStage === -1}
          />
        ) : null}
      </div>
    </div>
  );
}
