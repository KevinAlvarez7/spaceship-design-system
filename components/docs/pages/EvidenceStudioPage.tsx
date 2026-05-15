'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Folder, MessageSquare, Copy, Send } from 'lucide-react';
import {
  ChatThread,
  ChatBubble,
  ChatMessage,
  ChatInputBox,
  TaskList,
  Thinking,
  ShimmerDots,
  Button,
  DropdownMenuItem,
} from '@/components/ui';
import { optionLabel } from '@/components/ui';
import type { ClarificationQuestion, ClarificationAnswer } from '@/components/ui';
import { cn } from '@/lib/utils';
import { GridBackground, SpaceshipLogoScene } from '@/components/effects';
import { ArtifactPanelV2, ArtifactToolbarDropdown, ChatPanel } from '@/components/patterns';
import type { Artifact } from '@/components/patterns';
import { springs } from '@/tokens';
import { useMediaQuery } from '@/lib/use-media-query';
import { CitizenSurveyScene } from '@/components/playground/shared/CitizenSurveyScene';
import { EvidenceQuoteCard } from '@/components/playground/shared/EvidenceQuoteCard';
import { RenewalFlowPrototype } from '@/components/playground/shared/RenewalFlowPrototype';
import { EvidenceDashboard } from '@/components/playground/shared/EvidenceDashboard';
import { SUBMISSION_QUOTES, INTERVIEW_SNIPPETS } from '@/app/_shared/citizen-voices.mock';
import type { CitizenQuote } from '@/app/_shared/citizen-voices.mock';
import {
  ES_USER_MESSAGE,
  ES_ASSISTANT_INTRO,
  ES_ASSISTANT_AFTER_METHODS,
  ES_ASSISTANT_PLAN_READY,
  ES_ASSISTANT_SURVEY_LAUNCHED,
  ES_ASSISTANT_EVIDENCE_LOG_READY,
  ES_METHOD_QUESTIONS,
  ES_VALIDATION_TASKS,
  ES_PLAN_ARTIFACT,
  ES_EVIDENCE_LOG_ARTIFACT,
} from '@/app/_shared/evidence-studio.mock';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadItem =
  | { kind: 'user-bubble'; id: string; content: string }
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'typing'; id: string }
  | { kind: 'task-list'; id: string; items: string[]; completedCount: number; defaultExpanded?: boolean }
  | { kind: 'evidence-landing'; id: string }
  | { kind: 'evidence-quote'; id: string; quote: CitizenQuote };

export type Phase =
  | 'homepage'
  | 'pick-methods'
  | 'plan-tasks'
  | 'citizen-survey'
  | 'evidence-landing'
  | 'evidence-log';

export interface EvidenceStudioPageProps {
  /** Start the prototype at a specific phase for Storybook stories. Defaults to 'homepage'. */
  initialPhase?: Phase;
}

// ─── Combined evidence pool ───────────────────────────────────────────────────

const EVIDENCE_POOL: CitizenQuote[] = [
  ...SUBMISSION_QUOTES,
  ...INTERVIEW_SNIPPETS,
];

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
      value = opts[ans.index] != null ? optionLabel(opts[ans.index]) : '';
      if (ans.freeText) value += `: ${ans.freeText}`;
    } else if (ans.type === 'multi') {
      if (ans.indices.length === 0) return;
      value = ans.indices.map(idx => opts[idx] != null ? optionLabel(opts[idx]) : '').filter(Boolean).join(', ');
      if (ans.freeText) value += `: ${ans.freeText}`;
    } else {
      value = ans.order.map((item, n) => `${n + 1}. ${item}`).join(', ');
    }
    parts.push(`**Q:** ${q.label}\n\n**A:** ${value}`);
  });
  return parts.join('\n\n');
}

function randomThinkMs() {
  return (3 + Math.floor(Math.random() * 3)) * 1000;
}

function StreamingChatMessage({ content, onComplete }: { content: string; onComplete?: () => void }) {
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

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function ArtifactToolbar() {
  return (
    <div className="flex items-center justify-between w-full p-2">
      <ArtifactToolbarDropdown label="Version 1">
        <DropdownMenuItem>Version 1</DropdownMenuItem>
      </ArtifactToolbarDropdown>
      <Button variant="success" size="sm" trailingIcon={<Copy />}>Copy</Button>
    </div>
  );
}

// ─── Pre-populated state ──────────────────────────────────────────────────────

function buildInitialItems(phase: Phase): ThreadItem[] {
  if (phase === 'homepage' || phase === 'citizen-survey') return [];

  const base: ThreadItem[] = [
    { kind: 'user-bubble', id: 'user-msg', content: ES_USER_MESSAGE },
    { kind: 'assistant-text', id: 'intro', content: ES_ASSISTANT_INTRO },
  ];

  if (phase === 'pick-methods') return base;

  const afterMethods: ThreadItem[] = [
    ...base,
    { kind: 'user-bubble', id: 'answer-methods', content: '*(method selection submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-methods', content: ES_ASSISTANT_AFTER_METHODS },
    { kind: 'assistant-text', id: 'plan-ready', content: ES_ASSISTANT_PLAN_READY },
    {
      kind: 'task-list',
      id: 'live-tasks',
      items: ES_VALIDATION_TASKS,
      completedCount: 1,
      defaultExpanded: true,
    },
  ];

  if (phase === 'plan-tasks') return afterMethods;

  const afterLaunch: ThreadItem[] = [
    ...afterMethods.map(item =>
      item.kind === 'task-list' && item.id === 'live-tasks'
        ? { ...item, completedCount: 2 }
        : item
    ),
    { kind: 'user-bubble', id: 'launch-survey', content: 'Launch citizen survey' },
    { kind: 'assistant-text', id: 'survey-launched', content: ES_ASSISTANT_SURVEY_LAUNCHED },
    { kind: 'evidence-landing', id: 'landing-indicator' },
  ];

  if (phase === 'evidence-landing') {
    return [
      ...afterLaunch.map(item =>
        item.kind === 'task-list' && item.id === 'live-tasks'
          ? { ...item, completedCount: 3 }
          : item
      ),
      ...EVIDENCE_POOL.slice(0, 3).map((q): ThreadItem => ({
        kind: 'evidence-quote' as const,
        id: `evidence-${q.id}`,
        quote: q,
      })),
    ];
  }

  // phase === 'evidence-log'
  return [
    ...afterLaunch
      .filter(item => item.kind !== 'evidence-landing')
      .map(item =>
        item.kind === 'task-list' && item.id === 'live-tasks'
          ? { ...item, completedCount: ES_VALIDATION_TASKS.length }
          : item
      ),
    ...EVIDENCE_POOL.slice(0, 5).map((q): ThreadItem => ({
      kind: 'evidence-quote' as const,
      id: `evidence-${q.id}`,
      quote: q,
    })),
    { kind: 'assistant-text', id: 'evidence-summary', content: ES_ASSISTANT_EVIDENCE_LOG_READY },
  ];
}

// Citizen-facing surfaces — prototype + dashboard. The prototype is what
// citizens interact with; the dashboard is what officers review.
const ES_WALKTHROUGH_ARTIFACT: Artifact = {
  id:        'es-walkthrough',
  type:      'walkthrough',
  title:     'Service Prototype',
  status:    'in-progress',
  updatedAt: 'just now',
  content:   '',
};

const ES_DASHBOARD_ARTIFACT: Artifact = {
  id:        'es-dashboard',
  type:      'dashboard',
  title:     'Evidence Dashboard',
  status:    'in-progress',
  updatedAt: 'just now',
  content:   '',
};

function buildInitialArtifacts(phase: Phase): Artifact[] {
  switch (phase) {
    case 'plan-tasks':
    case 'citizen-survey':
    case 'evidence-landing':
      return [ES_PLAN_ARTIFACT, { ...ES_WALKTHROUGH_ARTIFACT, status: 'in-progress' }];
    case 'evidence-log':
      return [
        { ...ES_PLAN_ARTIFACT, status: 'complete' as const },
        { ...ES_WALKTHROUGH_ARTIFACT, status: 'complete' },
        { ...ES_DASHBOARD_ARTIFACT, status: 'complete' },
        ES_EVIDENCE_LOG_ARTIFACT,
      ];
    default:
      return [];
  }
}

// ━━━ EvidenceStudioPage ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function EvidenceStudioPage({ initialPhase = 'homepage' }: EvidenceStudioPageProps) {
  const [phase, setPhase]                       = useState<Phase>(initialPhase);
  const [items, setItems]                       = useState<ThreadItem[]>(() => buildInitialItems(initialPhase));
  const [artifacts, setArtifacts]               = useState<Artifact[]>(() => buildInitialArtifacts(initialPhase));
  const [activeArtifactId, setActiveArtifactId] = useState(() => {
    const arts = buildInitialArtifacts(initialPhase);
    return arts.length > 0 ? arts[arts.length - 1].id : '';
  });
  const [streamingId, setStreamingId]           = useState<string | null>(null);
  const [isArtifactOpen, setIsArtifactOpen]     = useState(true);
  const [mobileView, setMobileView]             = useState<'chat' | 'artifact'>('chat');

  const isMobile = useMediaQuery('(max-width: 767.98px)');
  const isMobileRef = useRef(false);
  useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);

  const clearStreamingId = useCallback(() => setStreamingId(null), []);
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function schedule(fn: () => void, delay: number) {
    const id = setTimeout(fn, delay);
    timeouts.current.push(id);
  }

  useEffect(() => {
    const saved = timeouts.current;
    const savedInterval = intervalRef.current;
    return () => {
      saved.forEach(clearTimeout);
      if (savedInterval) clearInterval(savedInterval);
    };
  }, []);

  function addArtifact(a: Artifact) {
    setArtifacts(prev => [...prev, a]);
    setActiveArtifactId(a.id);
    if (isMobileRef.current) setMobileView('artifact');
  }

  function updateArtifactStatus(id: string, status: Artifact['status']) {
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }

  function updateTaskProgress(progress: number) {
    setItems(prev => prev.map(item =>
      item.kind === 'task-list' && item.id === 'live-tasks'
        ? { ...item, completedCount: progress }
        : item
    ));
  }

  // ── Homepage ─────────────────────────────────────────────────────────────

  function handleHomepageSubmit(value: string) {
    if (!value.trim()) return;
    setItems([
      { kind: 'user-bubble', id: 'user-msg', content: value },
      { kind: 'typing', id: 'typing-intro' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-intro'),
        { kind: 'assistant-text', id: 'intro', content: ES_ASSISTANT_INTRO },
      ]);
      setStreamingId('intro');
      setPhase('pick-methods');
    }, randomThinkMs());
  }

  // ── Method submit ────────────────────────────────────────────────────────

  function handleMethodSubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(ES_METHOD_QUESTIONS, answers);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-methods', content: summary },
      { kind: 'typing', id: 'typing-methods' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-methods'),
        { kind: 'assistant-text', id: 'msg-after-methods', content: ES_ASSISTANT_AFTER_METHODS },
        { kind: 'assistant-text', id: 'plan-ready', content: ES_ASSISTANT_PLAN_READY },
        {
          kind: 'task-list',
          id: 'live-tasks',
          items: ES_VALIDATION_TASKS,
          completedCount: 1,
          defaultExpanded: true,
        },
      ]);
      setStreamingId('plan-ready');
      addArtifact(ES_PLAN_ARTIFACT);
      addArtifact({ ...ES_WALKTHROUGH_ARTIFACT, status: 'in-progress' });
      setPhase('plan-tasks');
    }, randomThinkMs());
  }

  // ── Launch survey ────────────────────────────────────────────────────────
  //
  // Officer launches the prototype to citizens. Citizens use the prototype in
  // their own context (the standalone citizen-survey story is their surface).
  // Evidence comes back into the officer tool as quote cards in chat, plus the
  // dashboard tab in the artifact panel.

  function handleLaunchSurvey() {
    setItems(prev => [
      ...prev.map(item =>
        item.kind === 'task-list' && item.id === 'live-tasks'
          ? { ...item, completedCount: 2 }
          : item
      ),
      { kind: 'user-bubble', id: 'launch-survey', content: 'Launch prototype to citizens' },
      { kind: 'assistant-text', id: 'survey-launched', content: ES_ASSISTANT_SURVEY_LAUNCHED },
      { kind: 'evidence-landing', id: 'landing-indicator' },
    ]);
    setStreamingId('survey-launched');
    setPhase('evidence-landing');

    // Tick evidence quotes in over time, then summarize
    EVIDENCE_POOL.slice(0, 5).forEach((q, i) => {
      schedule(() => {
        setItems(prev => [
          ...prev.filter(item => item.id !== 'landing-indicator' || i < EVIDENCE_POOL.length - 1),
          {
            kind: 'evidence-quote',
            id: `evidence-${q.id}`,
            quote: q,
          },
        ]);
        updateTaskProgress(Math.min(3 + i, ES_VALIDATION_TASKS.length - 1));
      }, 1500 * (i + 1));
    });

    schedule(() => {
      setItems(prev => [
        ...prev.filter(item => item.kind !== 'evidence-landing'),
        { kind: 'assistant-text', id: 'evidence-summary', content: ES_ASSISTANT_EVIDENCE_LOG_READY },
      ]);
      setStreamingId('evidence-summary');
      updateTaskProgress(ES_VALIDATION_TASKS.length);
      updateArtifactStatus(ES_PLAN_ARTIFACT.id, 'complete');
      updateArtifactStatus(ES_WALKTHROUGH_ARTIFACT.id, 'complete');
      addArtifact({ ...ES_DASHBOARD_ARTIFACT, status: 'complete' });
      addArtifact(ES_EVIDENCE_LOG_ARTIFACT);
      setPhase('evidence-log');
    }, 1500 * (EVIDENCE_POOL.slice(0, 5).length + 1));
  }

  // ── Footer derivation ────────────────────────────────────────────────────

  const clarificationProp =
    phase === 'pick-methods' ? { questions: ES_METHOD_QUESTIONS, onSubmit: handleMethodSubmit, surface: 'shadow-border' as const, submitLabel: 'Generate plan' } :
    undefined;

  // Allow launching the survey from plan-tasks via the input area
  const showLaunchButton = phase === 'plan-tasks';

  const headerTrailingSlot = artifacts.length > 0 ? (
    <Button
      variant="secondary"
      surface="shadow"
      size="icon-md"
      icon={<Folder />}
      onClick={() => {
        if (isMobile) setMobileView(mobileView === 'chat' ? 'artifact' : 'chat');
        else setIsArtifactOpen(prev => !prev);
      }}
      aria-label={isArtifactOpen ? 'Hide artifacts' : 'Show artifacts'}
    />
  ) : undefined;

  const inputProp = phase !== 'pick-methods' ? {
    size: 'sm' as const,
    submitLabel: showLaunchButton ? 'Launch survey' : 'Send',
    placeholder: showLaunchButton
      ? 'Ready to launch — type or hit Launch survey →'
      : phase === 'evidence-log'
        ? 'Evidence collected. Take this into ReadinessGate.'
        : 'Survey running. Watching for responses...',
    value: '',
    onChange: () => {},
    onSubmit: showLaunchButton ? handleLaunchSurvey : () => {},
    disabled: !showLaunchButton,
  } : undefined;

  const sharedChatPanelProps = {
    title: 'Evidence Studio' as const,
    onTitleChange: () => {},
    input: inputProp,
    clarification: clarificationProp,
    footerAddon: showLaunchButton ? (
      <div className="flex items-center justify-end pb-2">
        <Button
          variant="primary"
          size="sm"
          trailingIcon={<Send />}
          onClick={handleLaunchSurvey}
        >
          Launch citizen survey
        </Button>
      </div>
    ) : undefined,
    headerTrailingSlot,
  };

  const threadContent = (
    <ChatThread bare className="flex-1 min-h-0">
      {items.map(item => {
        if (item.kind === 'assistant-text') {
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springs.interactive}>
              {item.id === streamingId
                ? <StreamingChatMessage content={item.content} onComplete={clearStreamingId} />
                : <ChatMessage content={item.content} />}
            </motion.div>
          );
        }
        if (item.kind === 'user-bubble') {
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springs.interactive}>
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
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <Thinking textScramble />
            </motion.div>
          );
        }
        if (item.kind === 'task-list') {
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springs.interactive}>
              <TaskList
                items={item.items}
                completedCount={item.completedCount}
                defaultExpanded={item.defaultExpanded ?? false}
                surface="shadow-border"
              />
            </motion.div>
          );
        }
        if (item.kind === 'evidence-landing') {
          return (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex items-center gap-2">
              <ShimmerDots />
              <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary)">
                Waiting for citizen responses to land...
              </span>
            </motion.div>
          );
        }
        if (item.kind === 'evidence-quote') {
          return <EvidenceQuoteCard key={item.id} quote={item.quote} />;
        }
        return null;
      })}
    </ChatThread>
  );

  const renderArtifactContent = (artifact: Artifact) => {
    if (artifact.type === 'walkthrough') return <RenewalFlowPrototype />;
    if (artifact.type === 'dashboard')   return <EvidenceDashboard />;
    return null;
  };

  const sharedArtifactProps = {
    artifacts,
    activeId: activeArtifactId,
    onSelect: setActiveArtifactId,
    toolbar: artifacts.length > 0 ? <ArtifactToolbar /> : undefined,
    renderContent: renderArtifactContent,
  };

  // ── Standalone citizen-survey view ───────────────────────────────────────

  if (phase === 'citizen-survey') {
    return (
      <div className="relative flex-1 overflow-hidden">
        <GridBackground />
        <div className="absolute inset-0 flex items-center justify-center px-4 py-8 overflow-y-auto">
          <CitizenSurveyScene onSubmit={() => {}} />
        </div>
      </div>
    );
  }

  // ── Officer render ───────────────────────────────────────────────────────

  return (
    <LayoutGroup>
      <div className="relative flex-1 overflow-hidden">
        <GridBackground />

        <AnimatePresence mode="popLayout">
          {phase === 'homepage' ? (
            <motion.div
              key="homepage"
              className="absolute inset-0 flex items-center justify-center"
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-col items-center gap-4 w-full max-w-(--sizing-chat-max) px-4">
                <SpaceshipLogoScene width={110} interactive maxDisplacement={60} fleeRadius={200} />
                <h1 className="font-serif text-(length:--font-size-4xl) font-bold leading-(--line-height-4xl) text-(--text-primary) text-center">
                  Plan the evidence
                </h1>
                <p className="font-sans [font-size:var(--font-size-base)] text-(--text-secondary) text-center max-w-md">
                  Paste your hypothesis. We&apos;ll pick the validation methods, run the survey, and surface what supports it — and what contradicts it.
                </p>
                <motion.div layoutId="es-chat-input" className="w-full" transition={springs.gentle}>
                  <ChatInputBox
                    size="md"
                    placeholder="e.g. Seniors abandon renewal because the options aren't in plain language..."
                    onSubmit={handleHomepageSubmit}
                  />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              className="absolute inset-0 flex flex-col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {isMobile && (
                <main className="flex flex-1 min-h-0 overflow-hidden">
                  <div
                    className="flex shrink-0 h-full"
                    style={{
                      width: '200%',
                      transform: mobileView === 'artifact' && artifacts.length > 0 ? 'translateX(-50%)' : 'translateX(0%)',
                    }}
                  >
                    <div className="w-1/2 h-full flex flex-col min-h-0">
                      <ChatPanel {...sharedChatPanelProps}>{threadContent}</ChatPanel>
                    </div>
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

              {!isMobile && (
                <main className="flex flex-1 min-h-0">
                  <div className={cn(
                    'flex flex-col min-h-0',
                    artifacts.length > 0 && isArtifactOpen ? 'w-(--sizing-chat-panel) shrink-0' : 'flex-1',
                  )}>
                    <ChatPanel {...sharedChatPanelProps}>{threadContent}</ChatPanel>
                  </div>
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
