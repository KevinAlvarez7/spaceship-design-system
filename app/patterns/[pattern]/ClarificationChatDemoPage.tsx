'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChatThread,
  ChatBubble,
  ChatMessage,
  ChatInputBox,
  ClarificationCard,
  TaskList,
} from '@/components/ui';
import type { ClarificationAnswers, ClarificationQuestion } from '@/components/ui';
import { GridBackground } from '@/components/effects';
import { EditableTitle, ShareableLink, ArtifactSegmentedControl } from '@/components/patterns';
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
  PRD_ARTIFACT,
  IMPLEMENTATION_PLAN_ARTIFACT,
  PREVIEW_ARTIFACT,
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

function buildAnswerText(questions: ClarificationQuestion[], answers: ClarificationAnswers): string {
  if (questions.length === 1) {
    const answer = answers[0];
    if (!answer) return '';
    return Array.isArray(answer) ? answer.join(' · ') : answer;
  }
  const lines: string[] = [];
  questions.forEach((q, i) => {
    const answer = answers[i];
    if (!answer || (Array.isArray(answer) && answer.length === 0)) return;
    const label = q.label.replace(/\?$/, '').trim();
    if (Array.isArray(answer)) {
      lines.push(`${label}: ${answer.join(' · ')}`);
    } else {
      lines.push(`${label}: ${answer}`);
    }
  });
  return lines.join('\n');
}

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

// ─── ClarificationChatDemoPage ────────────────────────────────────────────────

export function ClarificationChatDemoPage() {
  const [projectTitle, setProjectTitle]   = useState('HDB Price Explorer');
  const [domain, setDomain]               = useState('');
  const [items, setItems]                 = useState<ThreadItem[]>(INITIAL_ITEMS);
  const [phase, setPhase]                 = useState<Phase>('preamble');
  const [artifacts, setArtifacts]         = useState<Artifact[]>([]);
  const [activeArtifactId, setActiveArtifactId] = useState('');
  const [taskProgress, setTaskProgress]   = useState(0);
  const [inputValue, setInputValue]       = useState('');
  const timeouts  = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function addArtifact(a: Artifact) {
    setArtifacts(prev => [...prev, a]);
    setActiveArtifactId(a.id);
  }

  function updateArtifactStatus(id: string, status: ArtifactStatus) {
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
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

    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'preamble-typing'),
        { kind: 'assistant-text', id: 'preamble-intro', content: ASSISTANT_INTRO },
      ]);
    }, 800);

    schedule(() => {
      setPhase('step1');
    }, 1400);

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
    const summary = buildAnswerText(STEP_1_QUESTIONS, answers);
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
      addArtifact(PRD_ARTIFACT);

      const t2 = setTimeout(() => setPhase('step2'), 600);
      timeouts.current.push(t2);
    }, 800);
    timeouts.current.push(t1);
  }

  function handleStep2Submit(answers: ClarificationAnswers) {
    const summary = buildAnswerText(STEP_2_QUESTIONS, answers);
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
      updateArtifactStatus(PRD_ARTIFACT.id, 'complete');
      addArtifact(IMPLEMENTATION_PLAN_ARTIFACT);

      const t2 = setTimeout(() => setPhase('step3'), 600);
      timeouts.current.push(t2);
    }, 800);
    timeouts.current.push(t1);
  }

  function handleStep3Submit(answers: ClarificationAnswers) {
    const summary = buildAnswerText(STEP_3_QUESTIONS, answers);
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

      const t2 = setTimeout(() => {
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
              { kind: 'assistant-text', id: 'done-msg', content: 'All done! Your project is ready — all tasks completed successfully.' },
            ]);
            updateArtifactStatus(IMPLEMENTATION_PLAN_ARTIFACT.id, 'complete');
            // Delay phase flip so user sees all tasks checked before TaskList fades out
            const t3 = setTimeout(() => {
              setPhase('done');
              addArtifact(PREVIEW_ARTIFACT);
            }, 1000);
            timeouts.current.push(t3);
          }
        }, 1500);
      }, 600);
      timeouts.current.push(t2);
    }, 800);
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
        <div className="flex flex-col gap-3">
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
                  surface="shadow-border"
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
        {/* Nav */}
        <nav className="flex shrink-0 items-center justify-between px-4 py-3 gap-3">
          <EditableTitle
            title={projectTitle}
            onTitleChange={setProjectTitle}
            onMenuClick={() => {}}
          />
          <ShareableLink value={domain} onChange={setDomain} />
        </nav>

        {/* Main split */}
        <main className="flex flex-1 min-h-0 gap-6 px-4 pb-4">
          {/* Chat side */}
          <div className="flex flex-col flex-1 min-w-0 min-h-0">
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
