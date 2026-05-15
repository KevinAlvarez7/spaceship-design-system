'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Folder, MessageSquare, Copy, ArrowRight } from 'lucide-react';
import {
  ChatThread,
  ChatBubble,
  ChatMessage,
  ChatInputBox,
  Thinking,
  ThinkingSaucer,
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
import { ReadinessScoreCard } from '@/components/playground/readiness-gate/ReadinessScoreCard';
import type { AssumptionRow, AssumptionStatus } from '@/components/playground/readiness-gate/ReadinessScoreCard';
import { CitizenImpactCard } from '@/components/playground/readiness-gate/CitizenImpactCard';
import { RenewalFlowPrototype } from '@/components/playground/shared/RenewalFlowPrototype';
import { EvidenceDashboard } from '@/components/playground/shared/EvidenceDashboard';
import { IMPACT_PERSONAS } from '@/app/_shared/citizen-voices.mock';
import {
  RG_USER_MESSAGE,
  RG_ASSISTANT_INTRO,
  RG_ASSISTANT_AFTER_CHECKLIST,
  RG_ASSISTANT_AFTER_IMPACT,
  RG_ASSISTANT_AFTER_APPROVE,
  RG_ASSISTANT_AFTER_BLOCKED,
  RG_ASSUMPTION_QUESTIONS,
  RG_DEFAULT_ROWS,
  RG_BLOCKED_ROWS,
  RG_REPORT_ARTIFACT,
} from '@/app/_shared/readiness-gate.mock';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadItem =
  | { kind: 'user-bubble'; id: string; content: string }
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'typing'; id: string }
  | { kind: 'score-card'; id: string; rows: AssumptionRow[] }
  | { kind: 'impact-card'; id: string };

export type Phase =
  | 'homepage'
  | 'checklist'
  | 'score-pending'
  | 'citizen-impact-preview'
  | 'gate-decision'
  | 'gate-approved'
  | 'gate-blocked';

export interface ReadinessGatePageProps {
  /** Start the prototype at a specific phase. Defaults to 'homepage'. */
  initialPhase?: Phase;
  /** Use the blocked dataset instead of the default. */
  blocked?: boolean;
}

// ─── Markdown prose styles ────────────────────────────────────────────────────

const PROSE_CLASS = [
  'flex flex-col w-full font-(family-name:--font-family-mono)',
  '[&_h2]:[font-size:var(--font-size-base)] [&_h2]:font-bold [&_h2]:text-(--text-primary) [&_h2]:mb-3 [&_h2:first-child]:mt-0',
  '[&_h3]:[font-size:var(--font-size-sm)] [&_h3]:font-semibold [&_h3]:text-(--text-primary) [&_h3]:mt-4 [&_h3]:mb-2',
  '[&_p]:[font-size:var(--font-size-sm)] [&_p]:leading-(--line-height-sm) [&_p]:text-(--text-secondary) [&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:mb-2',
  '[&_li]:[font-size:var(--font-size-sm)] [&_li]:text-(--text-secondary)',
  '[&_strong]:font-semibold [&_strong]:text-(--text-primary)',
  '[&_hr]:my-4 [&_hr]:border-(--border-default)',
  '[&_table]:w-full [&_table]:mb-2 [&_table]:border-collapse',
  '[&_th]:[font-size:var(--font-size-xs)] [&_th]:font-semibold [&_th]:text-(--text-primary) [&_th]:text-left [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-b [&_th]:border-(--border-default)',
  '[&_td]:[font-size:var(--font-size-xs)] [&_td]:text-(--text-secondary) [&_td]:px-2 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-(--border-default)',
].join(' ');

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function ReportToolbar() {
  return (
    <div className="flex items-center justify-between w-full p-2">
      <ArtifactToolbarDropdown label="Version 1">
        <DropdownMenuItem>Version 1</DropdownMenuItem>
      </ArtifactToolbarDropdown>
      <Button variant="success" size="sm" trailingIcon={<Copy />}>Copy report</Button>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildAnswerMarkdown(questions: ClarificationQuestion[], answers: ClarificationAnswer[]): string {
  const parts: string[] = [];
  questions.forEach((q, i) => {
    const ans = answers[i];
    if (!ans || ans.type !== 'single' || ans.index < 0) return;
    const opts = 'options' in q ? q.options : [];
    const value = opts[ans.index] != null ? optionLabel(opts[ans.index]) : '';
    parts.push(`**${q.label}**\n\n${value}`);
  });
  return parts.join('\n\n');
}

/** Maps a single-answer index (0/1/2) to an assumption status. */
function indexToStatus(idx: number): AssumptionStatus {
  if (idx === 0) return 'validated';
  if (idx === 1) return 'partial';
  return 'unvalidated';
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

// ─── Pre-populated state ──────────────────────────────────────────────────────

function buildInitialItems(phase: Phase, rows: AssumptionRow[]): ThreadItem[] {
  if (phase === 'homepage') return [];

  const base: ThreadItem[] = [
    { kind: 'user-bubble', id: 'user-msg', content: RG_USER_MESSAGE },
    { kind: 'assistant-text', id: 'intro', content: RG_ASSISTANT_INTRO },
  ];

  if (phase === 'checklist') return base;

  const afterChecklist: ThreadItem[] = [
    ...base,
    { kind: 'user-bubble', id: 'answer-checklist', content: '*(assumption assessments submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-checklist', content: RG_ASSISTANT_AFTER_CHECKLIST },
  ];

  if (phase === 'score-pending') return afterChecklist;

  const afterScore: ThreadItem[] = [
    ...afterChecklist,
    { kind: 'score-card', id: 'score-card', rows },
  ];

  if (phase === 'citizen-impact-preview' || phase === 'gate-decision') {
    return [
      ...afterScore,
      { kind: 'assistant-text', id: 'msg-after-impact', content: RG_ASSISTANT_AFTER_IMPACT },
      { kind: 'impact-card', id: 'impact-card' },
    ];
  }

  if (phase === 'gate-approved') {
    return [
      ...afterScore,
      { kind: 'assistant-text', id: 'msg-after-impact', content: RG_ASSISTANT_AFTER_IMPACT },
      { kind: 'impact-card', id: 'impact-card' },
      { kind: 'user-bubble', id: 'approve-gate', content: 'Approve — ship the service' },
      { kind: 'assistant-text', id: 'msg-approved', content: RG_ASSISTANT_AFTER_APPROVE },
    ];
  }

  // gate-blocked
  return [
    ...afterScore,
    { kind: 'assistant-text', id: 'msg-after-impact', content: RG_ASSISTANT_AFTER_IMPACT },
    { kind: 'impact-card', id: 'impact-card' },
    { kind: 'user-bubble', id: 'reject-gate', content: 'Request changes — needs more evidence' },
    { kind: 'assistant-text', id: 'msg-blocked', content: RG_ASSISTANT_AFTER_BLOCKED },
  ];
}

// Citizen-facing surfaces — the service prototype + the evidence dashboard.
// The officer reviews these alongside the readiness report.
const RG_WALKTHROUGH_ARTIFACT: Artifact = {
  id:        'rg-walkthrough',
  type:      'walkthrough',
  title:     'Service Prototype',
  status:    'complete',
  updatedAt: 'just now',
  content:   '',
};

const RG_DASHBOARD_ARTIFACT: Artifact = {
  id:        'rg-dashboard',
  type:      'dashboard',
  title:     'Evidence Dashboard',
  status:    'complete',
  updatedAt: 'just now',
  content:   '',
};

function buildInitialArtifacts(phase: Phase): Artifact[] {
  switch (phase) {
    case 'citizen-impact-preview':
    case 'gate-decision':
    case 'gate-blocked':
      return [RG_WALKTHROUGH_ARTIFACT, RG_DASHBOARD_ARTIFACT];
    case 'gate-approved':
      return [RG_WALKTHROUGH_ARTIFACT, RG_DASHBOARD_ARTIFACT, RG_REPORT_ARTIFACT];
    default:
      return [];
  }
}

// ━━━ ReadinessGatePage ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ReadinessGatePage({
  initialPhase = 'homepage',
  blocked = false,
}: ReadinessGatePageProps) {
  const initialRows = blocked ? RG_BLOCKED_ROWS : RG_DEFAULT_ROWS;

  const [phase, setPhase]                       = useState<Phase>(initialPhase);
  const [rows, setRows]                         = useState<AssumptionRow[]>(initialRows);
  const [items, setItems]                       = useState<ThreadItem[]>(() => buildInitialItems(initialPhase, initialRows));
  const [artifacts, setArtifacts]               = useState<Artifact[]>(() => buildInitialArtifacts(initialPhase));
  const [activeArtifactId, setActiveArtifactId] = useState(() => initialPhase === 'gate-approved' ? RG_REPORT_ARTIFACT.id : '');
  const [streamingId, setStreamingId]           = useState<string | null>(null);
  const [isArtifactOpen, setIsArtifactOpen]     = useState(true);
  const [mobileView, setMobileView]             = useState<'chat' | 'artifact'>('chat');
  // Whether the gate decision (approve/reject) appears as a footer overlay.
  const showGate = phase === 'gate-decision';

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
        { kind: 'assistant-text', id: 'intro', content: RG_ASSISTANT_INTRO },
      ]);
      setStreamingId('intro');
      setPhase('checklist');
    }, 2500);
  }

  // ── Checklist submit ─────────────────────────────────────────────────────

  function handleChecklistSubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(RG_ASSUMPTION_QUESTIONS, answers);
    const newRows: AssumptionRow[] = RG_ASSUMPTION_QUESTIONS.map((q, i) => {
      const ans = answers[i];
      const idx = ans?.type === 'single' && ans.index >= 0 ? ans.index : 2;
      const baseRow = RG_DEFAULT_ROWS[i] ?? { id: `a${i + 1}`, label: q.label, status: 'unvalidated' as const };
      return {
        ...baseRow,
        status: indexToStatus(idx),
      };
    });
    setRows(newRows);

    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-checklist', content: summary },
      { kind: 'typing', id: 'typing-score' },
    ]);
    setPhase('score-pending');

    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-score'),
        { kind: 'assistant-text', id: 'msg-after-checklist', content: RG_ASSISTANT_AFTER_CHECKLIST },
        { kind: 'score-card', id: 'score-card', rows: newRows },
      ]);
      setStreamingId('msg-after-checklist');
      setArtifacts([RG_WALKTHROUGH_ARTIFACT, RG_DASHBOARD_ARTIFACT]);
      setActiveArtifactId(RG_DASHBOARD_ARTIFACT.id);
      schedule(() => {
        setItems(prev => [
          ...prev,
          { kind: 'assistant-text', id: 'msg-after-impact', content: RG_ASSISTANT_AFTER_IMPACT },
          { kind: 'impact-card', id: 'impact-card' },
        ]);
        setStreamingId('msg-after-impact');
        setPhase('citizen-impact-preview');
      }, 800);
    }, 2500);
  }

  function handleAdvanceToGateDecision() {
    setPhase('gate-decision');
  }

  // ── Gate decision handlers ───────────────────────────────────────────────

  function handleApprove() {
    const allValidated = !rows.some(r => r.status === 'unvalidated');
    if (allValidated) {
      setItems(prev => [
        ...prev,
        { kind: 'user-bubble', id: 'approve-gate', content: 'Approve — ship the service' },
        { kind: 'assistant-text', id: 'msg-approved', content: RG_ASSISTANT_AFTER_APPROVE },
      ]);
      setStreamingId('msg-approved');
      setArtifacts([RG_WALKTHROUGH_ARTIFACT, RG_DASHBOARD_ARTIFACT, RG_REPORT_ARTIFACT]);
      setActiveArtifactId(RG_REPORT_ARTIFACT.id);
      if (isMobileRef.current) setMobileView('artifact');
      setPhase('gate-approved');
    } else {
      handleReject();
    }
  }

  function handleReject() {
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'reject-gate', content: 'Request changes — needs more evidence' },
      { kind: 'assistant-text', id: 'msg-blocked', content: RG_ASSISTANT_AFTER_BLOCKED },
    ]);
    setStreamingId('msg-blocked');
    setPhase('gate-blocked');
  }

  // ── Footer derivation ────────────────────────────────────────────────────

  const clarificationConfig =
    phase === 'checklist' ? {
      questions: RG_ASSUMPTION_QUESTIONS,
      onSubmit: handleChecklistSubmit,
      surface: 'shadow-border' as const,
      submitLabel: 'Compile readiness',
    } : undefined;

  const approvalConfig = showGate ? {
    title:        'Readiness Gate',
    approveLabel: 'Approve — ship the service',
    rejectLabel:  'Request changes',
    content: (
      <div className={PROSE_CLASS}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {`## Gate Decision\n\nReview the assumption table above and the citizen impact preview. ${rows.some(r => r.status === 'unvalidated') ? '**There are unvalidated assumptions** — approving will leave them unmeasured.' : 'All assumptions have evidence behind them at some level. Partial-validation items have follow-up measurements planned.'}\n\nApprove to lock the readiness report. Request changes to send unvalidated assumptions back into EvidenceStudio.`}
        </ReactMarkdown>
      </div>
    ),
    onApprove: handleApprove,
    onReject:  handleReject,
    surface:   'shadow-border' as const,
  } : undefined;

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

  const footerAddon = phase === 'citizen-impact-preview' ? (
    <div className="flex items-center justify-end gap-2 pb-2">
      <Button variant="primary" size="sm" trailingIcon={<ArrowRight />} onClick={handleAdvanceToGateDecision}>
        Continue to gate decision
      </Button>
    </div>
  ) : undefined;

  // Show a disabled placeholder input on terminal phases where no clarification
  // or approval card is present.
  const showFallbackInput = phase === 'gate-approved' || phase === 'gate-blocked';
  const sharedChatPanelProps = {
    title: 'Readiness Gate' as const,
    onTitleChange: () => {},
    input: showFallbackInput ? {
      size: 'sm' as const,
      submitLabel: 'Send',
      placeholder: phase === 'gate-approved' ? 'Report locked. Ready to ship.' : phase === 'gate-blocked' ? 'Unvalidated — take blockers into EvidenceStudio.' : '',
      value: '',
      onChange: () => {},
      onSubmit: () => {},
      disabled: true,
    } : undefined,
    clarification: clarificationConfig,
    approval: approvalConfig,
    footerAddon,
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
          if (phase === 'score-pending' || item.id === 'typing-score') {
            return (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
                <ThinkingSaucer />
                <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary)">
                  Compiling readiness assessment...
                </span>
              </motion.div>
            );
          }
          return (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <Thinking textScramble />
            </motion.div>
          );
        }
        if (item.kind === 'score-card') {
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springs.interactive}>
              <ReadinessScoreCard rows={item.rows} />
            </motion.div>
          );
        }
        if (item.kind === 'impact-card') {
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springs.interactive}>
              <CitizenImpactCard personas={IMPACT_PERSONAS} />
            </motion.div>
          );
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
    toolbar: artifacts.length > 0 ? <ReportToolbar /> : undefined,
    renderContent: renderArtifactContent,
  };

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
                  Pre-commit readiness
                </h1>
                <p className="font-sans [font-size:var(--font-size-base)] text-(--text-secondary) text-center max-w-md">
                  Walk through every load-bearing assumption before launch. Validated, partial, or unvalidated — no invented scores. The output is an honest gate decision.
                </p>
                <motion.div layoutId="rg-chat-input" className="w-full" transition={springs.gentle}>
                  <ChatInputBox
                    size="md"
                    placeholder="Which service are you gating?"
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
