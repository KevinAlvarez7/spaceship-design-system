'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  ChatThread,
  ChatBubble,
  ChatMessage,
  ChatInputBox,
  ClarificationCard,
  TaskList,
  Thinking,
} from '@/components/ui';
import type { ClarificationAnswers, ClarificationQuestion } from '@/components/ui';
import { GridBackground } from '@/components/effects';
import { ArtifactSegmentedControl } from '@/components/patterns';
import { springs } from '@/tokens';
import {
  USER_MESSAGE,
  ASSISTANT_INTRO,
  ASSISTANT_AFTER_STEP_1,
  ASSISTANT_AFTER_STEP_2,
  ASSISTANT_AFTER_STEP_3,
  STEP_1_QUESTIONS,
  STEP_2_QUESTIONS,
  STEP_3_QUESTIONS,
  BRIEF_ARTIFACT,
  BRIEF_CONTENT_V2,
  BRIEF_CONTENT_V3,
  SECURITY_ARTIFACT,
  PROTOTYPE_ARTIFACT,
  IMPLEMENTATION_TASKS,
} from '@/app/patterns/_shared/clarification-chat.mock';
import type { Artifact, ArtifactStatus } from '@/app/patterns/_shared/artifactData';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadItem =
  | { kind: 'user-bubble'; id: string; content: string }
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'typing'; id: string };

type Phase = 'preamble' | 'step1' | 'transition' | 'step2' | 'step3' | 'building' | 'done';

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_ITEMS: ThreadItem[] = [
  { kind: 'user-bubble', id: 'user-msg', content: USER_MESSAGE },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildAnswerMarkdown(questions: ClarificationQuestion[], answers: ClarificationAnswers): string {
  const parts: string[] = [];
  questions.forEach((q, i) => {
    const answer = answers[i];
    if (!answer || (Array.isArray(answer) && answer.length === 0)) return;
    const a = Array.isArray(answer) ? answer.join(' · ') : answer;
    parts.push(`**Q:** ${q.label}\n\n**A:** ${a}`);
  });
  return parts.join('\n\n');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomThinkMs() {
  return (7 + Math.floor(Math.random() * 6)) * 1000; // 7 000–12 000 ms
}

// ─── StreamingChatMessage ─────────────────────────────────────────────────────

function StreamingChatMessage({ content, onComplete }: {
  content: string;
  onComplete?: () => void;
}) {
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (len >= content.length) {
      onComplete?.();
      return;
    }
    const t = setTimeout(() => setLen(l => Math.min(l + 4, content.length)), 20);
    return () => clearTimeout(t);
  }, [len, content.length, onComplete]);

  return <ChatMessage content={content.slice(0, len)} />;
}

// ─── ClarificationChatDemoPage ────────────────────────────────────────────────

export function ClarificationChatDemoPage() {
  const [items, setItems]                 = useState<ThreadItem[]>(INITIAL_ITEMS);
  const [phase, setPhase]                 = useState<Phase>('preamble');
  const [artifacts, setArtifacts]         = useState<Artifact[]>([]);
  const [activeArtifactId, setActiveArtifactId] = useState('');
  const [taskProgress, setTaskProgress]   = useState(0);
  const [inputValue, setInputValue]       = useState('');
  const [streamingId, setStreamingId]     = useState<string | null>(null);
  const clearStreamingId = useCallback(() => setStreamingId(null), []);
  const timeouts  = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function addArtifact(a: Artifact) {
    setArtifacts(prev => [...prev, a]);
    setActiveArtifactId(a.id);
  }

  function updateArtifactStatus(id: string, status: ArtifactStatus) {
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  function updateArtifactContent(id: string, content: string) {
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, content } : a));
  }

  // Preamble sequence: user bubble is visible immediately; assistant message
  // arrives after a typing indicator delay, then step 1 card activates.
  useEffect(() => {
    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(fn, delay);
      timeouts.current.push(id);
    }

    schedule(() => {
      setItems(prev => [...prev, { kind: 'typing', id: 'preamble-typing' }]);
    }, 0);

    const thinkDelay = randomThinkMs();
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'preamble-typing'),
        { kind: 'assistant-text', id: 'preamble-intro', content: ASSISTANT_INTRO },
      ]);
      setStreamingId('preamble-intro');
    }, thinkDelay);

    schedule(() => {
      setPhase('step1');
    }, thinkDelay + 600);

    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // ── Step submit handlers ──────────────────────────────────────────────────

  function handleStep1Submit(answers: ClarificationAnswers) {
    const summary = buildAnswerMarkdown(STEP_1_QUESTIONS, answers);
    setPhase('transition');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-1', content: summary },
      { kind: 'typing',      id: 'typing-1' },
    ]);

    const t1 = setTimeout(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-1'),
        { kind: 'assistant-text', id: 'msg-after-1', content: ASSISTANT_AFTER_STEP_1 },
      ]);
      setStreamingId('msg-after-1');
      addArtifact(BRIEF_ARTIFACT);

      const t2 = setTimeout(() => setPhase('step2'), 600);
      timeouts.current.push(t2);
    }, randomThinkMs());
    timeouts.current.push(t1);
  }

  function handleStep2Submit(answers: ClarificationAnswers) {
    const summary = buildAnswerMarkdown(STEP_2_QUESTIONS, answers);
    setPhase('transition');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-2', content: summary },
      { kind: 'typing',      id: 'typing-2' },
    ]);

    const t1 = setTimeout(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-2'),
        { kind: 'assistant-text', id: 'msg-after-2', content: ASSISTANT_AFTER_STEP_2 },
      ]);
      setStreamingId('msg-after-2');
      updateArtifactContent(BRIEF_ARTIFACT.id, BRIEF_CONTENT_V2);

      const t2 = setTimeout(() => setPhase('step3'), 600);
      timeouts.current.push(t2);
    }, randomThinkMs());
    timeouts.current.push(t1);
  }

  function handleStep3Submit(answers: ClarificationAnswers) {
    const summary = buildAnswerMarkdown(STEP_3_QUESTIONS, answers);
    setPhase('transition');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-3', content: summary },
      { kind: 'typing',      id: 'typing-3' },
    ]);

    const t1 = setTimeout(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-3'),
        { kind: 'assistant-text', id: 'msg-after-3', content: ASSISTANT_AFTER_STEP_3 },
      ]);
      setStreamingId('msg-after-3');
      updateArtifactContent(BRIEF_ARTIFACT.id, BRIEF_CONTENT_V3);
      updateArtifactStatus(BRIEF_ARTIFACT.id, 'complete');

      // Stagger: Security Review appears 1.5s after Brief V3 update, then build starts
      const t2 = setTimeout(() => {
        addArtifact(SECURITY_ARTIFACT);

        const t3 = setTimeout(() => {
          setPhase('building');
          let progress = 0;

          intervalRef.current = setInterval(() => {
            progress += 1;
            setTaskProgress(progress);

            if (progress >= IMPLEMENTATION_TASKS.length) {
              clearInterval(intervalRef.current!);
              intervalRef.current = null;
              setItems(prev => [
                ...prev,
                { kind: 'assistant-text', id: 'done-msg', content: 'Your prototype is ready for user testing. Share the link with your test participants when you\'re ready to run your sessions.' },
              ]);
              updateArtifactStatus(SECURITY_ARTIFACT.id, 'complete');
              // Delay phase flip so user sees all tasks checked before TaskList fades out
              const t4 = setTimeout(() => {
                setPhase('done');
                addArtifact(PROTOTYPE_ARTIFACT);
              }, 1000);
              timeouts.current.push(t4);
            }
          }, 1500);
        }, 600);
        timeouts.current.push(t3);
      }, 1500);
      timeouts.current.push(t2);
    }, randomThinkMs());
    timeouts.current.push(t1);
  }

  // ── Footer ────────────────────────────────────────────────────────────────

  function renderFooter() {
    if (phase === 'step1') {
      return (
        <ClarificationCard
          key="step1"
          questions={STEP_1_QUESTIONS}
          onSubmit={handleStep1Submit}
          surface="shadow-border"
        />
      );
    }
    if (phase === 'step2') {
      return (
        <ClarificationCard
          key="step2"
          questions={STEP_2_QUESTIONS}
          onSubmit={handleStep2Submit}
          surface="shadow-border"
        />
      );
    }
    if (phase === 'step3') {
      return (
        <ClarificationCard
          key="step3"
          questions={STEP_3_QUESTIONS}
          onSubmit={handleStep3Submit}
          surface="shadow-border"
        />
      );
    }
    if (phase === 'building' || phase === 'done') {
      return (
        <div className="flex flex-col">
          <AnimatePresence>
            {phase === 'building' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={springs.interactive}
              >
                <TaskList
                  items={IMPLEMENTATION_TASKS}
                  completedCount={taskProgress}
                  isActive
                  updatedAt="Updated 2m ago"
                  surface="shadow-border"
                  className="rounded-b-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <ChatInputBox
            size="sm"
            submitLabel="Send"
            placeholder="What would you like to change?"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onSubmit={() => {}}
            disabled={phase === 'building'}
            containerClassName={phase === 'building' ? 'rounded-t-none' : undefined}
          />
        </div>
      );
    }
    return null;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative flex flex-1 overflow-hidden size-full">
      <GridBackground />

      <div className="relative z-10 flex flex-1 flex-col size-full">
        {/* Main split */}
        <main className="flex flex-1 min-h-0 gap-6 px-4 pb-4">
          {/* Chat side */}
          <div className="flex flex-col flex-1 min-w-0 min-h-0 max-w-2xl mx-auto">
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
                      {item.id === streamingId ? (
                        <StreamingChatMessage
                          content={item.content}
                          onComplete={clearStreamingId}
                        />
                      ) : (
                        <ChatMessage content={item.content} />
                      )}
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
                        <div className="[&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:[font-weight:var(--font-weight-semibold)]">
                          <ReactMarkdown>{item.content}</ReactMarkdown>
                        </div>
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
                      <Thinking textScramble size="caption-1" />
                    </motion.div>
                  );
                }
                return null;
              })}
            </ChatThread>

            <div className="px-4 pb-4 pt-2 shrink-0">
              {renderFooter()}
            </div>
          </div>

          {/* Artifact side — slides in when first artifact is generated */}
          <AnimatePresence>
            {artifacts.length > 0 && (
              <motion.div
                className="flex flex-col flex-1 min-w-0 min-h-0"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={springs.interactive}
              >
                <ArtifactSegmentedControl
                  artifacts={artifacts}
                  activeId={activeArtifactId}
                  onSelect={setActiveArtifactId}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
