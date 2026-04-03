'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Globe, Link, Copy, Folder, MessageSquare } from 'lucide-react';
import {
  ChatThread,
  ChatBubble,
  ChatMessage,
  ChatInputBox,
  TaskList,
  Thinking,
  Button,
  DropdownMenuItem,
} from '@/components/ui';
import type { ClarificationQuestion, ClarificationAnswer } from '@/components/ui';
import { cn } from '@/lib/utils';
import { GridBackground, SpaceshipLogoScene } from '@/components/effects';
import { ArtifactPanelV2, ArtifactToolbarDropdown, ChatPanel, ShareableLink } from '@/components/patterns';
import type { Artifact, ArtifactStatus } from '@/components/patterns';
import { springs } from '@/tokens';
import { useMediaQuery } from '@/lib/use-media-query';
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
  PREVIEW_ARTIFACT,
  IMPLEMENTATION_TASKS,
} from '@/app/_shared/clarification-chat.mock';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadItem =
  | { kind: 'user-bubble'; id: string; content: string }
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'typing'; id: string }
  | { kind: 'task-list'; id: string; items: string[]; completedCount: number; defaultExpanded?: boolean };

export type Phase =
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

export interface NewProjectFlowPageProps {
  /** Start the prototype at a specific phase for Storybook stories. Defaults to 'homepage'. */
  initialPhase?: Phase;
}

// ─── Toolbar helpers ──────────────────────────────────────────────────────────

const VERSION_ITEMS = (
  <>
    <DropdownMenuItem>Version 1</DropdownMenuItem>
    <DropdownMenuItem>Version 2</DropdownMenuItem>
  </>
);

function PrototypeToolbar() {
  return (
    <div className="flex items-center w-full">
      <div className="px-2 py-1.5">
        <ArtifactToolbarDropdown label="Version 1">{VERSION_ITEMS}</ArtifactToolbarDropdown>
      </div>
      <div className="flex flex-1 items-center gap-2 p-2 border-l border-(--bg-surface-tertiary) bg-(--bg-surface-primary)">
        <div className="flex flex-1 items-center gap-2 px-2 py-1 min-w-0">
          <Globe className="size-4 shrink-0 text-(--text-tertiary)" />
          <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-placeholder) flex-1 truncate">
            Enter your domain name
          </span>
          <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary) shrink-0">
            .on.spaceship.gov.sg
          </span>
        </div>
        <Button variant="success" size="sm" trailingIcon={<Link />}>Share</Button>
      </div>
    </div>
  );
}

function DocumentToolbar() {
  return (
    <div className="flex items-center justify-between w-full p-2">
      <ArtifactToolbarDropdown label="Version 1">{VERSION_ITEMS}</ArtifactToolbarDropdown>
      <Button variant="success" size="sm" trailingIcon={<Copy />}>Copy</Button>
    </div>
  );
}

function PreviewToolbar() {
  const [domain, setDomain] = useState('');
  return (
    <div className="flex items-center w-full p-2 gap-2">
      <ArtifactToolbarDropdown label="v2 (latest)">{VERSION_ITEMS}</ArtifactToolbarDropdown>
      <ShareableLink
        value={domain}
        onChange={setDomain}
        className="shadow-none rounded bg-(--bg-surface-primary) flex-1 min-w-0"
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildAnswerMarkdown(questions: ClarificationQuestion[], answers: ClarificationAnswer[]): string {
  const parts: string[] = [];
  questions.forEach((q, i) => {
    const ans = answers[i];
    if (!ans) return;
    const opts = 'options' in q ? q.options : [];
    let value: string;
    if (ans.type === 'single') {
      if (ans.index < 0) return;
      value = opts[ans.index] ?? '';
      if (ans.freeText) value += `: ${ans.freeText}`;
    } else if (ans.type === 'multi') {
      if (ans.indices.length === 0) return;
      value = ans.indices.map(idx => opts[idx]).filter(Boolean).join(', ');
      if (ans.freeText) value += `: ${ans.freeText}`;
    } else {
      value = ans.order.map((item, n) => `${n + 1}. ${item}`).join(', ');
    }
    parts.push(`**Q:** ${q.label}\n\n**A:** ${value}`);
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

// ─── ClarificationChatV2Page ──────────────────────────────────────────────────

export function NewProjectFlowPage({ initialPhase = 'homepage' }: NewProjectFlowPageProps) {
  const [phase, setPhase]                       = useState<Phase>(initialPhase);
  const [items, setItems]                       = useState<ThreadItem[]>([]);
  const [artifacts, setArtifacts]               = useState<Artifact[]>([]);
  const [activeArtifactId, setActiveArtifactId] = useState('');
  const [inputValue, setInputValue]             = useState('');
  const [streamingId, setStreamingId]           = useState<string | null>(null);
  const [approvalContent, setApprovalContent]   = useState(IMPL_PLAN_CONTENT);
  const [isArtifactOpen, setIsArtifactOpen]     = useState(true);
  const [mobileView, setMobileView]             = useState<'chat' | 'artifact'>('chat');

  // ── Responsive detection ──────────────────────────────────────────────────
  const isMobile = useMediaQuery('(max-width: 767.98px)');
  const isMobileRef = useRef(false);
  useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);

  const clearStreamingId = useCallback(() => setStreamingId(null), []);
  const timeouts         = useRef<NodeJS.Timeout[]>([]);
  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null);

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
    if (isMobileRef.current) setMobileView('artifact');
  }

  function updateArtifactStatus(id: string, status: ArtifactStatus) {
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  function updateArtifactContent(id: string, content: string) {
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, content } : a));
    if (isMobileRef.current) setMobileView('artifact');
  }

  // ── Homepage submit ───────────────────────────────────────────────────────

  function handleHomepageSubmit(value: string) {
    if (!value.trim()) return;
    setItems([{ kind: 'user-bubble', id: 'user-msg', content: value }]);
    setPhase('thinking');

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

  function handleStep1Submit(answers: ClarificationAnswer[]) {
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

  function handleStep2Submit(answers: ClarificationAnswer[]) {
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

  function handleImplSubmit(answers: ClarificationAnswer[]) {
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

    setItems(prev => {
      if (prev.some(i => i.kind === 'task-list' && i.id === 'live-tasks')) return prev;
      return [...prev, {
        kind: 'task-list',
        id: 'live-tasks',
        items: IMPLEMENTATION_TASKS,
        completedCount: 0,
        defaultExpanded: true,
      }];
    });

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 1;

      setItems(prev => prev.map(item =>
        item.kind === 'task-list' && item.id === 'live-tasks'
          ? { ...item, completedCount: progress }
          : item
      ));

      if (progress >= IMPLEMENTATION_TASKS.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;

        const doneMsgId = 'done-msg';
        setItems(prev => [
          ...prev,
          { kind: 'assistant-text', id: doneMsgId, content: ASSISTANT_BUILD_COMPLETE },
        ]);
        setStreamingId(doneMsgId);

        schedule(() => {
          setPhase('done');
          addArtifact(PROTOTYPE_ARTIFACT);
          addArtifact(PREVIEW_ARTIFACT);
        }, 1000);
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // ── Toolbar derivation ────────────────────────────────────────────────────

  const activeArtifact = artifacts.find(a => a.id === activeArtifactId);

  const toolbar =
    activeArtifact?.type === 'prototype' ? <PrototypeToolbar /> :
    activeArtifact?.type === 'preview'   ? <PreviewToolbar /> :
    activeArtifact                        ? <DocumentToolbar /> :
    undefined;

  // ── Footer state derivation ───────────────────────────────────────────────

  const clarificationProp =
    phase === 'step1'          ? { questions: STEP_1_QUESTIONS, onSubmit: handleStep1Submit, surface: 'shadow-border' as const } :
    phase === 'step2'          ? { questions: STEP_2_QUESTIONS, onSubmit: handleStep2Submit, surface: 'shadow-border' as const } :
    phase === 'impl-questions' ? { questions: IMPL_QUESTIONS,   onSubmit: handleImplSubmit,  surface: 'shadow-border' as const } :
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

  // ── Shared props ──────────────────────────────────────────────────────────

  const sharedChatPanelProps = {
    title: 'New conversation' as const,
    onTitleChange: () => {},
    input: {
      size: 'sm' as const,
      submitLabel: 'Send',
      placeholder: inputPlaceholder,
      value: inputValue,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value),
      onSubmit: inputSubmit,
      disabled: inputDisabled,
    },
    clarification: clarificationProp,
    approval: approvalProp,
  };

  const threadContent = (
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
                defaultExpanded={item.defaultExpanded ?? false}
                surface="shadow-border"
              />
            </motion.div>
          );
        }
        return null;
      })}
    </ChatThread>
  );

  const sharedArtifactProps = {
    artifacts,
    activeId: activeArtifactId,
    onSelect: setActiveArtifactId,
    toolbar,
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <LayoutGroup>
      {/* flex-1 fills the Storybook fullscreen root; overflow-hidden clips the grid canvas */}
      <div className="relative flex-1 overflow-hidden">
        <GridBackground />

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
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >

              {/* ── Mobile layout (<768px) ───────────────────────────────── */}
              {isMobile && (
                <main className="flex flex-1 min-h-0 overflow-hidden">
                  <div
                    className="flex shrink-0 h-full"
                    style={{
                      width: '200%',
                      transform: mobileView === 'artifact' && artifacts.length > 0 ? 'translateX(-50%)' : 'translateX(0%)',
                    }}
                  >
                    {/* Chat panel — left half */}
                    <div className="w-1/2 h-full flex flex-col min-h-0">
                      <ChatPanel
                        {...sharedChatPanelProps}
                        headerTrailingSlot={artifacts.length > 0 ? (
                          <Button
                            variant="secondary"
                            surface="shadow"
                            size="icon-md"
                            icon={<Folder />}
                            onClick={() => setMobileView('artifact')}
                            aria-label="Show artifacts"
                          />
                        ) : undefined}
                      >
                        {threadContent}
                      </ChatPanel>
                    </div>

                    {/* Artifact panel — right half */}
                    {artifacts.length > 0 && (
                      <div className="w-1/2 h-full flex flex-col min-h-0">
                        <ArtifactPanelV2
                          {...sharedArtifactProps}
                          leadingAction={
                            <Button
                              variant="ghost"
                              size="icon-md"
                              icon={<MessageSquare />}
                              onClick={() => setMobileView('chat')}
                              aria-label="Back to chat"
                            />
                          }
                        />
                      </div>
                    )}
                  </div>
                </main>
              )}

              {/* ── Desktop layout (≥768px) ──────────────────────────────── */}
              {!isMobile && (
                <main className="flex flex-1 min-h-0">

                  {/* Chat column */}
                  <div className={cn(
                    'flex flex-col min-h-0',
                    artifacts.length > 0 && isArtifactOpen ? 'w-(--sizing-chat-panel) shrink-0' : 'flex-1',
                  )}>
                    <ChatPanel
                      {...sharedChatPanelProps}
                      headerTrailingSlot={artifacts.length > 0 ? (
                        <Button
                          variant="secondary"
                          surface="shadow"
                          size="icon-md"
                          icon={<Folder />}
                          onClick={() => setIsArtifactOpen(prev => !prev)}
                          aria-label={isArtifactOpen ? 'Hide artifacts' : 'Show artifacts'}
                        />
                      ) : undefined}
                    >
                      {threadContent}
                    </ChatPanel>
                  </div>

                  {/* Artifact panel */}
                  {artifacts.length > 0 && isArtifactOpen && (
                    <div className="flex flex-col flex-1 min-w-0 min-h-0">
                      <ArtifactPanelV2 {...sharedArtifactProps} />
                    </div>
                  )}

                </main>
              )}

            </motion.div>

          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}
