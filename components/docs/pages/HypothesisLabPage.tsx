'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Folder, MessageSquare, Users, Copy } from 'lucide-react';
import {
  ChatThread,
  ChatBubble,
  ChatMessage,
  ChatInputBox,
  Thinking,
  Button,
  Modal,
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
import { CitizenSubmissionCard } from '@/components/playground/shared/CitizenSubmissionCard';
import { SUBMISSION_QUOTES } from '@/app/_shared/citizen-voices.mock';
import {
  HL_USER_MESSAGE,
  HL_ASSISTANT_INTRO,
  HL_ASSISTANT_AFTER_WHO,
  HL_ASSISTANT_AFTER_PROBLEM,
  HL_ASSISTANT_AFTER_FALSIFIER,
  HL_WHO_QUESTIONS,
  HL_PROBLEM_ASSUMPTION_QUESTIONS,
  HL_FALSIFIER_QUESTION,
  HL_BRIEF_ARTIFACT,
} from '@/app/_shared/hypothesis-lab.mock';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadItem =
  | { kind: 'user-bubble'; id: string; content: string }
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'typing'; id: string };

export type Phase =
  | 'homepage'
  | 'citizen-submit'
  | 'frame-who'
  | 'frame-problem-assumption'
  | 'frame-falsify'
  | 'brief';

export interface HypothesisLabPageProps {
  /** Start the prototype at a specific phase for Storybook stories. Defaults to 'homepage'. */
  initialPhase?: Phase;
}

// ─── Markdown prose styles ────────────────────────────────────────────────────

const PROSE_CLASS = [
  'flex flex-col w-full font-(family-name:--font-family-mono)',
  '[&_h2]:[font-size:var(--font-size-base)] [&_h2]:font-bold [&_h2]:text-(--text-primary) [&_h2]:mb-3 [&_h2:first-child]:mt-0',
  '[&_h3]:[font-size:var(--font-size-sm)] [&_h3]:font-semibold [&_h3]:text-(--text-primary) [&_h3]:mt-4 [&_h3]:mb-2',
  '[&_p]:[font-size:var(--font-size-sm)] [&_p]:leading-(--line-height-sm) [&_p]:text-(--text-secondary) [&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:mb-2',
  '[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-2 [&_ol]:mb-2',
  '[&_li]:[font-size:var(--font-size-sm)] [&_li]:text-(--text-secondary)',
  '[&_strong]:font-semibold [&_strong]:text-(--text-primary)',
  '[&_hr]:my-4 [&_hr]:border-(--border-default)',
].join(' ');

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function BriefToolbar() {
  return (
    <div className="flex items-center justify-between w-full p-2">
      <ArtifactToolbarDropdown label="Version 1">
        <DropdownMenuItem>Version 1</DropdownMenuItem>
      </ArtifactToolbarDropdown>
      <Button variant="success" size="sm" trailingIcon={<Copy />}>Copy brief</Button>
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

// ─── Pre-populated state for phase-jump stories ───────────────────────────────

function buildInitialItems(phase: Phase): ThreadItem[] {
  if (phase === 'homepage' || phase === 'citizen-submit') return [];

  const base: ThreadItem[] = [
    { kind: 'user-bubble', id: 'user-msg', content: HL_USER_MESSAGE },
    { kind: 'assistant-text', id: 'intro', content: HL_ASSISTANT_INTRO },
  ];

  if (phase === 'frame-who') return base;

  const afterWho: ThreadItem[] = [
    ...base,
    { kind: 'user-bubble', id: 'answer-who', content: '*(who answers submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-who', content: HL_ASSISTANT_AFTER_WHO },
  ];

  if (phase === 'frame-problem-assumption') return afterWho;

  const afterProblem: ThreadItem[] = [
    ...afterWho,
    { kind: 'user-bubble', id: 'answer-problem', content: '*(problem + assumption submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-problem', content: HL_ASSISTANT_AFTER_PROBLEM },
  ];

  if (phase === 'frame-falsify') return afterProblem;

  return [
    ...afterProblem,
    { kind: 'user-bubble', id: 'answer-falsify', content: '*(falsifier criteria submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-falsify', content: HL_ASSISTANT_AFTER_FALSIFIER },
  ];
}

function buildInitialArtifacts(phase: Phase): Artifact[] {
  return phase === 'brief' ? [HL_BRIEF_ARTIFACT] : [];
}

// ━━━ HypothesisLabPage ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function HypothesisLabPage({ initialPhase = 'homepage' }: HypothesisLabPageProps) {
  const [phase, setPhase]                       = useState<Phase>(initialPhase);
  const [items, setItems]                       = useState<ThreadItem[]>(() => buildInitialItems(initialPhase));
  const [artifacts, setArtifacts]               = useState<Artifact[]>(() => buildInitialArtifacts(initialPhase));
  const [activeArtifactId, setActiveArtifactId] = useState(() => initialPhase === 'brief' ? HL_BRIEF_ARTIFACT.id : '');
  const [streamingId, setStreamingId]           = useState<string | null>(null);
  const [isArtifactOpen, setIsArtifactOpen]     = useState(true);
  const [mobileView, setMobileView]             = useState<'chat' | 'artifact'>('chat');
  const [citizenModalOpen, setCitizenModalOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width: 767.98px)');
  const isMobileRef = useRef(false);
  useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);

  const clearStreamingId = useCallback(() => setStreamingId(null), []);
  const timeouts = useRef<NodeJS.Timeout[]>([]);

  function schedule(fn: () => void, delay: number) {
    const id = setTimeout(fn, delay);
    timeouts.current.push(id);
  }

  useEffect(() => {
    const saved = timeouts.current;
    return () => saved.forEach(clearTimeout);
  }, []);

  // ── Homepage submit ───────────────────────────────────────────────────────

  function handleHomepageSubmit(value: string) {
    if (!value.trim()) return;
    setItems([
      { kind: 'user-bubble', id: 'user-msg', content: value },
      { kind: 'typing', id: 'typing-intro' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-intro'),
        { kind: 'assistant-text', id: 'intro', content: HL_ASSISTANT_INTRO },
      ]);
      setStreamingId('intro');
      setPhase('frame-who');
    }, randomThinkMs());
  }

  // ── Frame: Who ───────────────────────────────────────────────────────────

  function handleWhoSubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(HL_WHO_QUESTIONS, answers);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-who', content: summary },
      { kind: 'typing', id: 'typing-who' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-who'),
        { kind: 'assistant-text', id: 'msg-after-who', content: HL_ASSISTANT_AFTER_WHO },
      ]);
      setStreamingId('msg-after-who');
      schedule(() => setPhase('frame-problem-assumption'), 600);
    }, randomThinkMs());
  }

  // ── Frame: Problem + Assumption ──────────────────────────────────────────

  function handleProblemSubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(HL_PROBLEM_ASSUMPTION_QUESTIONS, answers);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-problem', content: summary },
      { kind: 'typing', id: 'typing-problem' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-problem'),
        { kind: 'assistant-text', id: 'msg-after-problem', content: HL_ASSISTANT_AFTER_PROBLEM },
      ]);
      setStreamingId('msg-after-problem');
      schedule(() => setPhase('frame-falsify'), 600);
    }, randomThinkMs());
  }

  // ── Frame: Falsifier ─────────────────────────────────────────────────────

  function handleFalsifySubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(HL_FALSIFIER_QUESTION, answers);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-falsify', content: summary },
      { kind: 'typing', id: 'typing-falsify' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-falsify'),
        { kind: 'assistant-text', id: 'msg-after-falsify', content: HL_ASSISTANT_AFTER_FALSIFIER },
      ]);
      setStreamingId('msg-after-falsify');
      schedule(() => {
        setArtifacts([HL_BRIEF_ARTIFACT]);
        setActiveArtifactId(HL_BRIEF_ARTIFACT.id);
        if (isMobileRef.current) setMobileView('artifact');
        setPhase('brief');
      }, 600);
    }, randomThinkMs());
  }

  // ── Footer derivation ────────────────────────────────────────────────────

  const clarificationProp =
    phase === 'frame-who'                ? { questions: HL_WHO_QUESTIONS,                onSubmit: handleWhoSubmit,      surface: 'shadow-border' as const } :
    phase === 'frame-problem-assumption' ? { questions: HL_PROBLEM_ASSUMPTION_QUESTIONS, onSubmit: handleProblemSubmit,  surface: 'shadow-border' as const } :
    phase === 'frame-falsify'            ? { questions: HL_FALSIFIER_QUESTION,           onSubmit: handleFalsifySubmit,  surface: 'shadow-border' as const, submitLabel: 'Generate brief' } :
    undefined;

  // ── Shared props ─────────────────────────────────────────────────────────

  const headerTrailingSlot = (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        surface="shadow"
        size="sm"
        leadingIcon={<Users />}
        onClick={() => setCitizenModalOpen(true)}
        aria-label="Preview citizen view"
      >
        Citizen view
      </Button>
      {artifacts.length > 0 && (
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
      )}
    </div>
  );

  const sharedChatPanelProps = {
    title: 'Hypothesis Lab' as const,
    onTitleChange: () => {},
    input: phase === 'brief' ? {
      size: 'sm' as const,
      submitLabel: 'Send',
      placeholder: 'Hypothesis ready — share or take into EvidenceStudio.',
      value: '',
      onChange: () => {},
      onSubmit: () => {},
      disabled: true,
    } : undefined,
    clarification: clarificationProp,
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
        return null;
      })}
    </ChatThread>
  );

  const sharedArtifactProps = {
    artifacts,
    activeId: activeArtifactId,
    onSelect: setActiveArtifactId,
    toolbar: artifacts.length > 0 ? <BriefToolbar /> : undefined,
  };

  // ── Citizen-submit standalone view ───────────────────────────────────────
  //
  // When initialPhase === 'citizen-submit', show the full-bleed citizen view
  // instead of the officer flow. Officer flow always has the modal accessible
  // via the header button.

  if (phase === 'citizen-submit') {
    return (
      <div className="relative flex-1 overflow-hidden">
        <GridBackground />
        <div className="absolute inset-0 flex items-center justify-center px-4 py-8 overflow-y-auto">
          <CitizenSubmissionCard
            recentSubmissions={SUBMISSION_QUOTES}
            onSubmit={() => {}}
          />
        </div>
      </div>
    );
  }

  // ── Officer-side render ──────────────────────────────────────────────────

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
                  What idea do you want to frame?
                </h1>
                <p className="font-sans [font-size:var(--font-size-base)] text-(--text-secondary) text-center max-w-md">
                  Drop a rough idea and we&apos;ll walk it through who, problem, assumption, and falsifier — so what comes out is testable, not just plausible.
                </p>
                <motion.div layoutId="hl-chat-input" className="w-full" transition={springs.gentle}>
                  <ChatInputBox
                    size="md"
                    placeholder="e.g. The citizen renewal flow needs to be easier..."
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
                    <div className="w-1/2 h-full flex flex-col min-h-0">
                      <ChatPanel {...sharedChatPanelProps}>
                        {threadContent}
                      </ChatPanel>
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

              {/* ── Desktop layout (≥768px) ──────────────────────────────── */}
              {!isMobile && (
                <main className="flex flex-1 min-h-0">
                  <div className={cn(
                    'flex flex-col min-h-0',
                    artifacts.length > 0 && isArtifactOpen ? 'w-(--sizing-chat-panel) shrink-0' : 'flex-1',
                  )}>
                    <ChatPanel {...sharedChatPanelProps}>
                      {threadContent}
                    </ChatPanel>
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

        {/* ── Citizen view modal ─────────────────────────────────────────── */}
        <Modal
          open={citizenModalOpen}
          onClose={() => setCitizenModalOpen(false)}
          className="max-w-2xl max-h-[85vh] overflow-y-auto"
        >
          <div className={PROSE_CLASS}>
            <p className="font-sans [font-size:var(--font-size-xs)] font-semibold uppercase tracking-wide text-(--text-tertiary) mb-2">
              Preview — what a citizen sees
            </p>
          </div>
          <CitizenSubmissionCard
            recentSubmissions={SUBMISSION_QUOTES}
            onSubmit={() => setCitizenModalOpen(false)}
          />
        </Modal>
      </div>
    </LayoutGroup>
  );
}
