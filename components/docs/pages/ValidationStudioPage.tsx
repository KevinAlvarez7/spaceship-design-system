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
  TaskList,
  Thinking,
  ThinkingSaucer,
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
import { CitizenSubmissionCard } from '@/components/playground/shared/CitizenSubmissionCard';
import { CitizenSurveyScene } from '@/components/playground/shared/CitizenSurveyScene';
import { CitizenInterviewSnippet } from '@/components/playground/shared/CitizenInterviewSnippet';
import { EvidenceQuoteCard } from '@/components/playground/shared/EvidenceQuoteCard';
import { RenewalFlowPrototype } from '@/components/playground/shared/RenewalFlowPrototype';
import { EvidenceDashboard } from '@/components/playground/shared/EvidenceDashboard';
import { ReadinessScoreCard } from '@/components/playground/readiness-gate/ReadinessScoreCard';
import { SUBMISSION_QUOTES, INTERVIEW_SNIPPETS } from '@/app/_shared/citizen-voices.mock';
import {
  HL_WHO_QUESTIONS,
  HL_PROBLEM_ASSUMPTION_QUESTIONS,
  HL_FALSIFIER_QUESTION,
} from '@/app/_shared/hypothesis-lab.mock';
import { ES_METHOD_QUESTIONS, ES_VALIDATION_TASKS } from '@/app/_shared/evidence-studio.mock';
import { RG_DEFAULT_ROWS } from '@/app/_shared/readiness-gate.mock';
import {
  VS_USER_MESSAGE,
  VS_ASSISTANT_INTRO,
  VS_ASSISTANT_AFTER_FRAME,
  VS_ASSISTANT_AFTER_PLAN,
  VS_ASSISTANT_AFTER_EVIDENCE,
  VS_ASSISTANT_READINESS,
  VS_ASSISTANT_AFTER_APPROVE,
  VS_ASSISTANT_AFTER_REJECT,
  VS_ASSISTANT_BUILD_COMPLETE,
  VS_BUILD_TASKS,
  VS_BRIEF_ARTIFACT,
  VS_BRIEF_CONTENT_V2,
  VS_PLAN_ARTIFACT,
  VS_EVIDENCE_LOG_ARTIFACT,
  VS_READINESS_ARTIFACT,
} from '@/app/_shared/validation-studio.mock';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadItem =
  | { kind: 'user-bubble'; id: string; content: string }
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'typing'; id: string }
  | { kind: 'task-list'; id: string; items: string[]; completedCount: number; defaultExpanded?: boolean }
  | { kind: 'evidence-landing'; id: string }
  | { kind: 'evidence-quote'; id: string; quote: typeof SUBMISSION_QUOTES[number] }
  | { kind: 'readiness-score'; id: string };

export type Phase =
  | 'homepage'
  | 'intake'
  | 'citizen-submit'
  | 'frame-who'
  | 'frame-problem-assumption'
  | 'frame-falsify'
  | 'brief-ready'
  | 'plan-methods'
  | 'plan-tasks'
  | 'citizen-survey'
  | 'citizen-interview'
  | 'evidence-log'
  | 'readiness-gate'
  | 'approval'
  | 'shipping'
  | 'done';

export interface ValidationStudioPageProps {
  /** Start the prototype at a specific phase. Defaults to 'homepage'. */
  initialPhase?: Phase;
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

function DocumentToolbar() {
  return (
    <div className="flex items-center justify-between w-full p-2">
      <ArtifactToolbarDropdown label="Version 1">
        <DropdownMenuItem>Version 1</DropdownMenuItem>
      </ArtifactToolbarDropdown>
      <Button variant="success" size="sm" trailingIcon={<Copy />}>Copy</Button>
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

function buildInitialItems(phase: Phase): ThreadItem[] {
  if (phase === 'homepage' || phase === 'citizen-submit' || phase === 'citizen-survey' || phase === 'citizen-interview') {
    return [];
  }

  const intro: ThreadItem[] = [
    { kind: 'user-bubble', id: 'user-msg', content: VS_USER_MESSAGE },
    { kind: 'assistant-text', id: 'intro', content: VS_ASSISTANT_INTRO },
  ];

  if (phase === 'intake' || phase === 'frame-who') return intro;

  const afterFrame: ThreadItem[] = [
    ...intro,
    { kind: 'user-bubble', id: 'answer-frame', content: '*(framing answers submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-frame', content: VS_ASSISTANT_AFTER_FRAME },
  ];

  if (phase === 'frame-problem-assumption' || phase === 'frame-falsify') return intro;
  if (phase === 'brief-ready') return afterFrame;

  const afterPlan: ThreadItem[] = [
    ...afterFrame,
    { kind: 'user-bubble', id: 'answer-methods', content: '*(method selection submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-plan', content: VS_ASSISTANT_AFTER_PLAN },
    {
      kind: 'task-list',
      id: 'live-tasks',
      items: ES_VALIDATION_TASKS,
      completedCount: 2,
      defaultExpanded: true,
    },
  ];

  if (phase === 'plan-methods') return afterFrame;
  if (phase === 'plan-tasks') return afterPlan;

  const afterEvidence: ThreadItem[] = [
    ...afterPlan.map(item =>
      item.kind === 'task-list' && item.id === 'live-tasks'
        ? { ...item, completedCount: ES_VALIDATION_TASKS.length }
        : item
    ),
    ...SUBMISSION_QUOTES.slice(0, 3).map((q): ThreadItem => ({
      kind: 'evidence-quote' as const,
      id: `evidence-${q.id}`,
      quote: q,
    })),
    { kind: 'assistant-text', id: 'msg-after-evidence', content: VS_ASSISTANT_AFTER_EVIDENCE },
  ];

  if (phase === 'evidence-log') return afterEvidence;

  const afterReadiness: ThreadItem[] = [
    ...afterEvidence,
    { kind: 'assistant-text', id: 'msg-readiness', content: VS_ASSISTANT_READINESS },
    { kind: 'readiness-score', id: 'readiness-score' },
  ];

  if (phase === 'readiness-gate' || phase === 'approval') return afterReadiness;

  if (phase === 'shipping') {
    return [
      ...afterReadiness,
      { kind: 'user-bubble', id: 'approve-gate', content: 'Approve — ship the service' },
      { kind: 'assistant-text', id: 'msg-after-approve', content: VS_ASSISTANT_AFTER_APPROVE },
      {
        kind: 'task-list',
        id: 'build-tasks',
        items: VS_BUILD_TASKS,
        completedCount: 0,
        defaultExpanded: true,
      },
    ];
  }

  // done
  return [
    ...afterReadiness,
    { kind: 'user-bubble', id: 'approve-gate', content: 'Approve — ship the service' },
    { kind: 'assistant-text', id: 'msg-after-approve', content: VS_ASSISTANT_AFTER_APPROVE },
    {
      kind: 'task-list',
      id: 'build-tasks',
      items: VS_BUILD_TASKS,
      completedCount: VS_BUILD_TASKS.length,
      defaultExpanded: false,
    },
    { kind: 'assistant-text', id: 'msg-build-done', content: VS_ASSISTANT_BUILD_COMPLETE },
  ];
}

// Citizen-facing surfaces — the prototype and the metrics dashboard. These are
// representations of the *service being validated*, not of the officer's tool.
const VS_WALKTHROUGH_ARTIFACT: Artifact = {
  id:        'vs-walkthrough',
  type:      'walkthrough',
  title:     'Service Prototype',
  status:    'in-progress',
  updatedAt: 'just now',
  content:   '',
};

const VS_DASHBOARD_ARTIFACT: Artifact = {
  id:        'vs-dashboard',
  type:      'dashboard',
  title:     'Evidence Dashboard',
  status:    'in-progress',
  updatedAt: 'just now',
  content:   '',
};

function buildInitialArtifacts(phase: Phase): Artifact[] {
  const brief = { ...VS_BRIEF_ARTIFACT, content: VS_BRIEF_CONTENT_V2, status: 'complete' as const };
  const plan  = { ...VS_PLAN_ARTIFACT, status: 'complete' as const };

  switch (phase) {
    case 'brief-ready':
    case 'plan-methods':
      return [brief];
    case 'plan-tasks':
    case 'citizen-survey':
    case 'citizen-interview':
      return [brief, plan, { ...VS_WALKTHROUGH_ARTIFACT, status: 'in-progress' }];
    case 'evidence-log':
    case 'readiness-gate':
    case 'approval':
      return [
        brief,
        plan,
        { ...VS_WALKTHROUGH_ARTIFACT, status: 'complete' },
        { ...VS_DASHBOARD_ARTIFACT, status: 'complete' },
        VS_EVIDENCE_LOG_ARTIFACT,
      ];
    case 'shipping':
    case 'done':
      return [
        brief,
        plan,
        { ...VS_WALKTHROUGH_ARTIFACT, status: 'complete' },
        { ...VS_DASHBOARD_ARTIFACT, status: 'complete' },
        VS_EVIDENCE_LOG_ARTIFACT,
        VS_READINESS_ARTIFACT,
      ];
    default:
      return [];
  }
}

// ━━━ ValidationStudioPage ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function ValidationStudioPage({ initialPhase = 'homepage' }: ValidationStudioPageProps) {
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

  function updateTaskProgress(listId: string, progress: number) {
    setItems(prev => prev.map(item =>
      item.kind === 'task-list' && item.id === listId
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
    setPhase('intake');
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-intro'),
        { kind: 'assistant-text', id: 'intro', content: VS_ASSISTANT_INTRO },
      ]);
      setStreamingId('intro');
      setPhase('frame-who');
    }, randomThinkMs());
  }

  // ── Framing ──────────────────────────────────────────────────────────────

  function handleWhoSubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(HL_WHO_QUESTIONS, answers);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-who', content: summary },
    ]);
    schedule(() => setPhase('frame-problem-assumption'), 600);
  }

  function handleProblemSubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(HL_PROBLEM_ASSUMPTION_QUESTIONS, answers);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-problem', content: summary },
    ]);
    schedule(() => setPhase('frame-falsify'), 600);
  }

  function handleFalsifySubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(HL_FALSIFIER_QUESTION, answers);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-falsify', content: summary },
      { kind: 'typing', id: 'typing-frame' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-frame'),
        { kind: 'assistant-text', id: 'msg-after-frame', content: VS_ASSISTANT_AFTER_FRAME },
      ]);
      setStreamingId('msg-after-frame');
      addArtifact({ ...VS_BRIEF_ARTIFACT, content: VS_BRIEF_CONTENT_V2, status: 'complete' });
      schedule(() => setPhase('brief-ready'), 600);
    }, randomThinkMs());
  }

  // ── Plan methods ─────────────────────────────────────────────────────────

  function handleAdvanceToMethods() {
    setPhase('plan-methods');
  }

  function handleMethodSubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(ES_METHOD_QUESTIONS, answers);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-methods', content: summary },
      { kind: 'typing', id: 'typing-plan' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-plan'),
        { kind: 'assistant-text', id: 'msg-after-plan', content: VS_ASSISTANT_AFTER_PLAN },
        {
          kind: 'task-list',
          id: 'live-tasks',
          items: ES_VALIDATION_TASKS,
          completedCount: 1,
          defaultExpanded: true,
        },
      ]);
      setStreamingId('msg-after-plan');
      addArtifact(VS_PLAN_ARTIFACT);
      addArtifact({ ...VS_WALKTHROUGH_ARTIFACT, status: 'in-progress' });
      schedule(() => setPhase('plan-tasks'), 600);
    }, randomThinkMs());
  }

  // ── Launch citizen survey ────────────────────────────────────────────────
  //
  // The officer launches the prototype to citizens. Citizens interact with it
  // in their own context (the standalone citizen-survey story shows what they
  // see). Here, evidence lands back in the officer's tool: chat quotes tick in,
  // the walkthrough artifact picks up annotations, and the dashboard appears.

  function handleLaunchSurvey() {
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'launch-survey', content: 'Launch prototype to citizens' },
      { kind: 'evidence-landing', id: 'landing-indicator' },
    ]);

    SUBMISSION_QUOTES.slice(0, 3).forEach((q, i) => {
      schedule(() => {
        setItems(prev => [
          ...prev.filter(item => item.kind !== 'evidence-landing' || i < SUBMISSION_QUOTES.length - 1),
          { kind: 'evidence-quote', id: `evidence-${q.id}`, quote: q },
        ]);
        updateTaskProgress('live-tasks', 3 + i);
      }, 1500 * (i + 1));
    });

    schedule(() => {
      setItems(prev => [
        ...prev.filter(item => item.kind !== 'evidence-landing'),
        { kind: 'assistant-text', id: 'msg-after-evidence', content: VS_ASSISTANT_AFTER_EVIDENCE },
      ]);
      setStreamingId('msg-after-evidence');
      updateTaskProgress('live-tasks', ES_VALIDATION_TASKS.length);
      updateArtifactStatus(VS_PLAN_ARTIFACT.id, 'complete');
      updateArtifactStatus(VS_WALKTHROUGH_ARTIFACT.id, 'complete');
      addArtifact({ ...VS_DASHBOARD_ARTIFACT, status: 'complete' });
      addArtifact(VS_EVIDENCE_LOG_ARTIFACT);
      setPhase('evidence-log');
    }, 1500 * 4);
  }

  function handleAdvanceToReadiness() {
    setItems(prev => [
      ...prev,
      { kind: 'assistant-text', id: 'msg-readiness', content: VS_ASSISTANT_READINESS },
      { kind: 'readiness-score', id: 'readiness-score' },
    ]);
    setStreamingId('msg-readiness');
    setPhase('readiness-gate');
  }

  function handleAdvanceToApproval() {
    setPhase('approval');
  }

  // ── Approval handlers ────────────────────────────────────────────────────

  function handleApprove() {
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'approve-gate', content: 'Approve — ship the service' },
      { kind: 'assistant-text', id: 'msg-after-approve', content: VS_ASSISTANT_AFTER_APPROVE },
      {
        kind: 'task-list',
        id: 'build-tasks',
        items: VS_BUILD_TASKS,
        completedCount: 0,
        defaultExpanded: true,
      },
    ]);
    setStreamingId('msg-after-approve');
    addArtifact(VS_READINESS_ARTIFACT);
    setPhase('shipping');
  }

  function handleReject() {
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'reject-gate', content: 'Request changes — needs more evidence' },
      { kind: 'assistant-text', id: 'msg-after-reject', content: VS_ASSISTANT_AFTER_REJECT },
    ]);
    setStreamingId('msg-after-reject');
  }

  // ── Build phase ticker ───────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'shipping') return;

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 1;
      updateTaskProgress('build-tasks', progress);

      if (progress >= VS_BUILD_TASKS.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;

        const doneMsgId = 'msg-build-done';
        setItems(prev => [
          ...prev,
          { kind: 'assistant-text', id: doneMsgId, content: VS_ASSISTANT_BUILD_COMPLETE },
        ]);
        setStreamingId(doneMsgId);

        schedule(() => {
          setPhase('done');
        }, 1000);
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // ── Footer derivation ────────────────────────────────────────────────────

  const clarificationConfig =
    phase === 'frame-who'                ? { questions: HL_WHO_QUESTIONS,                onSubmit: handleWhoSubmit,      surface: 'shadow-border' as const } :
    phase === 'frame-problem-assumption' ? { questions: HL_PROBLEM_ASSUMPTION_QUESTIONS, onSubmit: handleProblemSubmit,  surface: 'shadow-border' as const } :
    phase === 'frame-falsify'            ? { questions: HL_FALSIFIER_QUESTION,           onSubmit: handleFalsifySubmit,  surface: 'shadow-border' as const, submitLabel: 'Compile brief' } :
    phase === 'plan-methods'             ? { questions: ES_METHOD_QUESTIONS,             onSubmit: handleMethodSubmit,   surface: 'shadow-border' as const, submitLabel: 'Generate plan' } :
    undefined;

  const approvalConfig = phase === 'approval' ? {
    title:        'Readiness Gate',
    approveLabel: 'Approve — ship the service',
    rejectLabel:  'Request changes',
    content: (
      <div className={PROSE_CLASS}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {`## Gate Decision\n\nAll five assumptions have evidence. Three validated, two partially validated with planned follow-ups. **No unvalidated assumptions blocking ship.**\n\nApprove to lock the readiness report and start the build. Request changes to send a partial back to EvidenceStudio for more coverage first.`}
        </ReactMarkdown>
      </div>
    ),
    onApprove: handleApprove,
    onReject:  handleReject,
    surface:   'shadow-border' as const,
  } : undefined;

  // CTA buttons that appear in the footerAddon at the right phase.
  const footerAddon =
    phase === 'brief-ready' ? (
      <div className="flex items-center justify-end gap-2 pb-2">
        <Button variant="primary" size="sm" trailingIcon={<ArrowRight />} onClick={handleAdvanceToMethods}>
          Plan the validation methods
        </Button>
      </div>
    ) :
    phase === 'plan-tasks' ? (
      <div className="flex items-center justify-end gap-2 pb-2">
        <Button variant="primary" size="sm" trailingIcon={<ArrowRight />} onClick={handleLaunchSurvey}>
          Launch citizen survey
        </Button>
      </div>
    ) :
    phase === 'evidence-log' ? (
      <div className="flex items-center justify-end gap-2 pb-2">
        <Button variant="primary" size="sm" trailingIcon={<ArrowRight />} onClick={handleAdvanceToReadiness}>
          Continue to readiness gate
        </Button>
      </div>
    ) :
    phase === 'readiness-gate' ? (
      <div className="flex items-center justify-end gap-2 pb-2">
        <Button variant="primary" size="sm" trailingIcon={<ArrowRight />} onClick={handleAdvanceToApproval}>
          Continue to gate decision
        </Button>
      </div>
    ) :
    undefined;

  const showFallbackInput = phase === 'intake' || phase === 'shipping' || phase === 'done';
  const fallbackPlaceholder =
    phase === 'shipping' ? 'Service is being built...' :
    phase === 'done'     ? 'Service launched · follow-ups scheduled.' :
    'Thinking...';

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

  const sharedChatPanelProps = {
    title: 'Validation Studio' as const,
    onTitleChange: () => {},
    input: showFallbackInput ? {
      size: 'sm' as const,
      submitLabel: 'Send',
      placeholder: fallbackPlaceholder,
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
          return (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              {phase === 'readiness-gate' ? (
                <div className="flex items-center gap-3">
                  <ThinkingSaucer />
                  <span className="font-sans [font-size:var(--font-size-sm)] text-(--text-tertiary)">Compiling readiness...</span>
                </div>
              ) : <Thinking textScramble />}
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
                Citizen responses landing...
              </span>
            </motion.div>
          );
        }
        if (item.kind === 'evidence-quote') {
          return <EvidenceQuoteCard key={item.id} quote={item.quote} />;
        }
        if (item.kind === 'readiness-score') {
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springs.interactive}>
              <ReadinessScoreCard rows={RG_DEFAULT_ROWS} />
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
    toolbar: artifacts.length > 0 ? <DocumentToolbar /> : undefined,
    renderContent: renderArtifactContent,
  };

  // ── Standalone citizen views ─────────────────────────────────────────────

  if (phase === 'citizen-submit') {
    return (
      <div className="relative flex-1 overflow-hidden">
        <GridBackground />
        <div className="absolute inset-0 flex items-center justify-center px-4 py-8 overflow-y-auto">
          <CitizenSubmissionCard recentSubmissions={SUBMISSION_QUOTES} onSubmit={() => {}} />
        </div>
      </div>
    );
  }
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
  if (phase === 'citizen-interview') {
    return (
      <div className="relative flex-1 overflow-hidden">
        <GridBackground />
        <div className="absolute inset-0 flex items-center justify-center px-4 py-8 overflow-y-auto">
          <CitizenInterviewSnippet
            interviewee={{ name: 'Rajesh', context: 'Senior, 67, Bedok' }}
            quotes={INTERVIEW_SNIPPETS}
            listening
          />
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
                  End-to-end validation
                </h1>
                <p className="font-sans [font-size:var(--font-size-base)] text-(--text-secondary) text-center max-w-md">
                  Frame the hypothesis, plan the evidence, gather it from real citizens, and only ship when each assumption has evidence behind it.
                </p>
                <motion.div layoutId="vs-chat-input" className="w-full" transition={springs.gentle}>
                  <ChatInputBox
                    size="md"
                    placeholder="Which service idea do you want to validate?"
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
