'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ChatThread,
  ChatBubble,
  ChatMessage,
  ChatInputBox,
  TaskList,
  Thinking,
} from '@/components/ui';
import type { ClarificationAnswers, ClarificationQuestion } from '@/components/ui';
import { cn } from '@/lib/utils';
import { GridBackground, SpaceshipLogoScene } from '@/components/effects';
import { ArtifactSegmentedControl, ChatPanel } from '@/components/patterns';
import type { Artifact, ArtifactStatus } from '@/components/patterns';
import { springs } from '@/tokens';
import {
  ASSISTANT_INTRO,
  ASSISTANT_AFTER_STEP_1,
  ASSISTANT_AFTER_STEP_2,
  ASSISTANT_AFTER_GATE,
  ASSISTANT_AFTER_IMPL,
  ASSISTANT_REJECTION_PROMPT,
  ASSISTANT_AFTER_REVISION,
  ASSISTANT_AFTER_APPROVE,
  ASSISTANT_BUILD_COMPLETE,
  STEP_1_QUESTIONS,
  STEP_2_QUESTIONS,
  IMPL_QUESTIONS,
  BRIEF_ARTIFACT,
  BRIEF_CONTENT_V2,
  IMPL_PLAN_ARTIFACT,
  IMPL_PLAN_CONTENT,
  IMPL_PLAN_CONTENT_REVISED,
  PROTOTYPE_ARTIFACT,
  IMPLEMENTATION_TASKS,
} from '@/app/_shared/clarification-chat.mock';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadItem =
  | { kind: 'user-bubble'; id: string; content: string }
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'typing'; id: string }
  | { kind: 'task-list'; id: string; items: string[]; completedCount: number };

type Phase =
  | 'homepage'
  | 'thinking'
  | 'step1'
  | 'step2'
  | 'gate'
  | 'impl-questions'
  | 'approval'
  | 'approval-rejected'
  | 'building'
  | 'done';

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

/** Returns a random thinking delay between 7 000–12 000 ms. */
function randomThinkMs() {
  return (7 + Math.floor(Math.random() * 6)) * 1000;
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
  const [phase, setPhase]                       = useState<Phase>('homepage');
  const [items, setItems]                       = useState<ThreadItem[]>([]);
  const [artifacts, setArtifacts]               = useState<Artifact[]>([]);
  const [activeArtifactId, setActiveArtifactId] = useState('');
  const [taskProgress, setTaskProgress]         = useState(0);
  const [inputValue, setInputValue]             = useState('');
  const [streamingId, setStreamingId]           = useState<string | null>(null);
  const [approvalContent, setApprovalContent]   = useState(IMPL_PLAN_CONTENT);
  const clearStreamingId                        = useCallback(() => setStreamingId(null), []);
  const timeouts                                = useRef<NodeJS.Timeout[]>([]);
  const intervalRef                             = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Schedules a callback and tracks the timeout for cleanup. */
  function schedule(fn: () => void, delay: number) {
    const id = setTimeout(fn, delay);
    timeouts.current.push(id);
  }

  // Cleanup all pending timers on unmount
  useEffect(() => {
    const savedTimeouts = timeouts.current;
    return () => {
      savedTimeouts.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Artifact helpers ──────────────────────────────────────────────────────

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

  // ── Homepage submit ───────────────────────────────────────────────────────

  function handleHomepageSubmit(value: string) {
    if (!value.trim()) return;
    setItems([{ kind: 'user-bubble', id: 'user-msg', content: value }]);
    setPhase('thinking');

    // Small delay lets the layout transition settle before the typing indicator
    schedule(() => {
      setItems(prev => [...prev, { kind: 'typing', id: 'preamble-typing' }]);
    }, 350);

    const thinkDelay = randomThinkMs();
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'preamble-typing'),
        { kind: 'assistant-text', id: 'preamble-intro', content: ASSISTANT_INTRO },
      ]);
      setStreamingId('preamble-intro');
    }, 350 + thinkDelay);

    schedule(() => setPhase('step1'), 350 + thinkDelay + 600);
  }

  // ── Step 1 — Problem clarification ───────────────────────────────────────

  function handleStep1Submit(answers: ClarificationAnswers) {
    const summary = buildAnswerMarkdown(STEP_1_QUESTIONS, answers);
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-1', content: summary },
      { kind: 'typing', id: 'typing-1' },
    ]);

    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-1'),
        { kind: 'assistant-text', id: 'msg-after-1', content: ASSISTANT_AFTER_STEP_1 },
      ]);
      setStreamingId('msg-after-1');
      addArtifact(BRIEF_ARTIFACT);
      schedule(() => setPhase('step2'), 600);
    }, randomThinkMs());
  }

  // ── Step 2 — Solution clarification ──────────────────────────────────────

  function handleStep2Submit(answers: ClarificationAnswers) {
    const summary = buildAnswerMarkdown(STEP_2_QUESTIONS, answers);
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-2', content: summary },
      { kind: 'typing', id: 'typing-2' },
    ]);

    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-2'),
        { kind: 'assistant-text', id: 'msg-after-2', content: ASSISTANT_AFTER_STEP_2 },
      ]);
      setStreamingId('msg-after-2');
      updateArtifactContent(BRIEF_ARTIFACT.id, BRIEF_CONTENT_V2);
      updateArtifactStatus(BRIEF_ARTIFACT.id, 'complete');
      schedule(() => setPhase('gate'), 600);
    }, randomThinkMs());
  }

  // ── Gate — user confirms moving to implementation ─────────────────────────

  function handleGateSubmit(value: string) {
    if (!value.trim()) return;
    setInputValue('');
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'gate-reply', content: value },
      { kind: 'typing', id: 'typing-gate' },
    ]);

    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-gate'),
        { kind: 'assistant-text', id: 'msg-after-gate', content: ASSISTANT_AFTER_GATE },
      ]);
      setStreamingId('msg-after-gate');
      schedule(() => setPhase('impl-questions'), 600);
    }, randomThinkMs());
  }

  // ── Implementation questions ──────────────────────────────────────────────

  function handleImplSubmit(answers: ClarificationAnswers) {
    const summary = buildAnswerMarkdown(IMPL_QUESTIONS, answers);
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-impl', content: summary },
      { kind: 'typing', id: 'typing-impl' },
    ]);

    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-impl'),
        { kind: 'assistant-text', id: 'msg-after-impl', content: ASSISTANT_AFTER_IMPL },
      ]);
      setStreamingId('msg-after-impl');
      schedule(() => setPhase('approval'), 600);
    }, randomThinkMs());
  }

  // ── Approval ──────────────────────────────────────────────────────────────

  function handleApprove() {
    addArtifact({ ...IMPL_PLAN_ARTIFACT, status: 'complete' });
    setItems(prev => [
      ...prev,
      { kind: 'assistant-text', id: 'msg-approved', content: ASSISTANT_AFTER_APPROVE },
    ]);
    setStreamingId('msg-approved');
    setPhase('thinking');
    schedule(() => setPhase('building'), 600);
  }

  function handleReject() {
    setPhase('approval-rejected');
    setItems(prev => [
      ...prev,
      { kind: 'assistant-text', id: 'msg-rejected', content: ASSISTANT_REJECTION_PROMPT },
    ]);
    setStreamingId('msg-rejected');
  }

  function handleRevisionSubmit(value: string) {
    if (!value.trim()) return;
    setInputValue('');
    const msgId = `msg-revised-${Date.now()}`;
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: `revision-${Date.now()}`, content: value },
      { kind: 'typing', id: 'typing-revision' },
    ]);

    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-revision'),
        { kind: 'assistant-text', id: msgId, content: ASSISTANT_AFTER_REVISION },
      ]);
      setStreamingId(msgId);
      setApprovalContent(IMPL_PLAN_CONTENT_REVISED);
      schedule(() => setPhase('approval'), 600);
    }, randomThinkMs());
  }

  // ── Building phase — task ticker ──────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'building') return;

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 1;
      setTaskProgress(progress);

      if (progress >= IMPLEMENTATION_TASKS.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;

        // Move TaskList into the thread, then show summary and prototype
        const doneMsgId = 'done-msg';
        setItems(prev => [
          ...prev,
          {
            kind: 'task-list',
            id: 'completed-tasks',
            items: IMPLEMENTATION_TASKS,
            completedCount: IMPLEMENTATION_TASKS.length,
          },
          { kind: 'assistant-text', id: doneMsgId, content: ASSISTANT_BUILD_COMPLETE },
        ]);
        setStreamingId(doneMsgId);

        schedule(() => {
          setPhase('done');
          addArtifact(PROTOTYPE_ARTIFACT);
        }, 1000);
      }
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // ── Footer state derivation ───────────────────────────────────────────────

  const clarificationProp =
    phase === 'step1'         ? { questions: STEP_1_QUESTIONS, onSubmit: handleStep1Submit, surface: 'shadow-border' as const } :
    phase === 'step2'         ? { questions: STEP_2_QUESTIONS, onSubmit: handleStep2Submit, surface: 'shadow-border' as const } :
    phase === 'impl-questions'? { questions: IMPL_QUESTIONS,   onSubmit: handleImplSubmit,  surface: 'shadow-border' as const } :
    undefined;

  const approvalProp =
    phase === 'approval' ? {
      content: (
        <div className={[
          'flex flex-col w-full font-(family-name:--font-family-mono)',
          '[&_h2]:[font-size:var(--font-size-base)] [&_h2]:font-bold [&_h2]:text-(--text-primary) [&_h2]:mb-3 [&_h2:first-child]:mt-0',
          '[&_h3]:[font-size:var(--font-size-sm)] [&_h3]:font-semibold [&_h3]:text-(--text-primary) [&_h3]:mt-4 [&_h3]:mb-2',
          '[&_p]:[font-size:var(--font-size-sm)] [&_p]:leading-(--line-height-sm) [&_p]:text-(--text-secondary) [&_p]:mb-2 [&_p:last-child]:mb-0',
          '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:mb-2',
          '[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-2 [&_ol]:mb-2',
          '[&_li]:[font-size:var(--font-size-sm)] [&_li]:text-(--text-secondary)',
          '[&_strong]:font-semibold [&_strong]:text-(--text-primary)',
          '[&_code]:font-mono [&_code]:text-[0.85em] [&_code]:bg-(--bg-surface-secondary) [&_code]:text-(--text-primary) [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded',
          '[&_hr]:my-4 [&_hr]:border-(--border-default)',
          '[&_table]:w-full [&_table]:mb-2 [&_table]:border-collapse',
          '[&_th]:[font-size:var(--font-size-xs)] [&_th]:font-semibold [&_th]:text-(--text-primary) [&_th]:text-left [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-b [&_th]:border-(--border-default)',
          '[&_td]:[font-size:var(--font-size-xs)] [&_td]:text-(--text-secondary) [&_td]:px-2 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-(--border-default)',
        ].join(' ')}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{approvalContent}</ReactMarkdown>
        </div>
      ),
      onApprove: handleApprove,
      onReject: handleReject,
      surface: 'shadow-border' as const,
    } : undefined;

  const inputDisabled = phase !== 'gate' && phase !== 'approval-rejected' && phase !== 'done';
  const inputPlaceholder =
    phase === 'gate'              ? 'Reply to continue...' :
    phase === 'approval-rejected' ? 'What would you like me to revise?' :
    'What would you like to change?';
  const inputSubmit =
    phase === 'gate'              ? handleGateSubmit :
    phase === 'approval-rejected' ? handleRevisionSubmit :
    () => {};

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LayoutGroup>
      <div className="relative flex flex-1 overflow-hidden size-full">
        <GridBackground />

        <div className="relative z-10 flex flex-1 size-full">
          <AnimatePresence mode="popLayout">

            {phase === 'homepage' ? (

              // ── Homepage hero ─────────────────────────────────────────────
              <motion.div
                key="homepage"
                className="absolute inset-0 flex items-center justify-center"
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex flex-col items-center gap-4 w-full max-w-(--sizing-chat-max) px-4">
                  <SpaceshipLogoScene width={110} interactive maxDisplacement={60} fleeRadius={200} />
                  <h1 className="font-serif text-(length:--font-size-4xl) font-bold leading-(--line-height-4xl) text-(--text-primary) text-center">
                    What ideas do you want to explore?
                  </h1>
                  <motion.div layoutId="chat-input" className="w-full" transition={springs.gentle}>
                    <ChatInputBox
                      size="md"
                      placeholder="Explore any problems, prototype any ideas..."
                      onSubmit={handleHomepageSubmit}
                    />
                  </motion.div>
                </div>
              </motion.div>

            ) : (

              // ── Chat layout ───────────────────────────────────────────────
              <motion.div
                key="chat"
                className="flex flex-1 size-full flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <main className="flex flex-1 min-h-0 gap-6">

                  {/* ── Chat column ── */}
                  <div className={cn(
                    'flex flex-col min-h-0',
                    artifacts.length > 0 ? 'w-(--sizing-chat-default) shrink-0' : 'flex-1',
                  )}>
                    <ChatPanel
                      title="New conversation"
                      onTitleChange={() => {}}
                      input={{
                        size: 'sm',
                        submitLabel: 'Send',
                        placeholder: inputPlaceholder,
                        value: inputValue,
                        onChange: e => setInputValue(e.target.value),
                        onSubmit: inputSubmit,
                        disabled: inputDisabled,
                        containerClassName: phase === 'building' ? 'rounded-t-none' : undefined,
                      }}
                      clarification={clarificationProp}
                      approval={approvalProp}
                      footerAddon={phase === 'building' ? (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={springs.interactive}
                        >
                          <TaskList
                            items={IMPLEMENTATION_TASKS}
                            completedCount={taskProgress}
                            isActive
                            updatedAt="Updated just now"
                            surface="shadow-border"
                            className="rounded-b-none"
                          />
                        </motion.div>
                      ) : undefined}
                    >
                      <ChatThread bare className="flex-1 min-h-0">
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
                                  <StreamingChatMessage content={item.content} onComplete={clearStreamingId} />
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
                                  <div className="[&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold">
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
                                <Thinking textScramble />
                              </motion.div>
                            );
                          }
                          if (item.kind === 'task-list') {
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={springs.interactive}
                              >
                                <TaskList
                                  items={item.items}
                                  completedCount={item.completedCount}
                                  defaultExpanded={false}
                                  surface="shadow-border"
                                />
                              </motion.div>
                            );
                          }
                          return null;
                        })}
                      </ChatThread>
                    </ChatPanel>
                  </div>

                  {/* ── Artifact panel — slides in on first artifact ── */}
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
              </motion.div>

            )}
          </AnimatePresence>
        </div>
      </div>
    </LayoutGroup>
  );
}
