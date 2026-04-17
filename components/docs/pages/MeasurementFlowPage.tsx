'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Compass, Hammer, Globe, Link, Copy, Folder, MessageSquare } from 'lucide-react';
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
import { optionLabel } from '@/components/ui';
import type { ClarificationQuestion, ClarificationAnswer } from '@/components/ui';
import { cn } from '@/lib/utils';
import { GridBackground, SpaceshipLogoScene } from '@/components/effects';
import { ArtifactPanelV2, ArtifactToolbarDropdown, ChatPanel, ShareableLink } from '@/components/patterns';
import type { Artifact } from '@/components/patterns';
import { springs } from '@/tokens';
import { useMediaQuery } from '@/lib/use-media-query';
import {
  INTENT_GATE_LABELS,
  MSG_BEFORE_INTENT,
  USER_PROMPT,
  NUDGE_QUESTIONS,
  PATH_CONTENT,
  type IntentPath,
} from '@/app/_shared/measurement-flow.mock';

// ─── Types ────────────────────────────────────────────────────────────────────

type ThreadItem =
  | { kind: 'user-bubble'; id: string; content: string }
  | { kind: 'assistant-text'; id: string; content: string }
  | { kind: 'typing'; id: string }
  | { kind: 'task-list'; id: string; items: string[]; completedCount: number; defaultExpanded?: boolean };

export type Phase =
  | 'homepage'
  | 'intent-gate'
  | 'thinking'
  | 'clarify-1'
  | 'clarify-2'
  | 'quality-gate'
  | 'quality-rejected'
  | 'impl-questions'
  | 'ack-gate'
  | 'ack-rejected'
  | 'building'
  | 'resolution'
  | 'resolution-rejected'
  | 'nudge'
  | 'done';

export interface MeasurementFlowPageProps {
  initialPhase?: Phase;
  initialPath?: IntentPath;
}

// ─── Intent options with icons ────────────────────────────────────────────────

const INTENT_OPTIONS: ClarificationQuestion[] = [
  {
    type: 'single',
    label: 'What are you here to do today?',
    options: [
      { label: INTENT_GATE_LABELS[0], icon: <FileText className="h-4 w-4" /> },
      { label: INTENT_GATE_LABELS[1], icon: <Compass className="h-4 w-4" /> },
      { label: INTENT_GATE_LABELS[2], icon: <Hammer className="h-4 w-4" /> },
    ],
  },
];

const INTENT_INDEX_TO_PATH: Record<number, IntentPath> = {
  0: 'tender',
  1: 'explore',
  2: 'build',
};

const INTENT_PATH_TO_LABEL: Record<IntentPath, string> = {
  tender:  INTENT_GATE_LABELS[0],
  explore: INTENT_GATE_LABELS[1],
  build:   INTENT_GATE_LABELS[2],
};

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
  '[&_code]:font-mono [&_code]:text-[0.85em] [&_code]:bg-(--bg-surface-secondary) [&_code]:text-(--text-primary) [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded',
  '[&_hr]:my-4 [&_hr]:border-(--border-default)',
  '[&_table]:w-full [&_table]:mb-2 [&_table]:border-collapse',
  '[&_th]:[font-size:var(--font-size-xs)] [&_th]:font-semibold [&_th]:text-(--text-primary) [&_th]:text-left [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-b [&_th]:border-(--border-default)',
  '[&_td]:[font-size:var(--font-size-xs)] [&_td]:text-(--text-secondary) [&_td]:px-2 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-(--border-default)',
].join(' ');

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className={PROSE_CLASS}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
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

// ─── Pre-populated state for phase-jump stories ───────────────────────────────

function buildInitialItems(phase: Phase, path: IntentPath | null, pathData: (typeof PATH_CONTENT)[IntentPath] | null): ThreadItem[] {
  if (phase === 'homepage') return [];
  if (phase === 'intent-gate') return [
    { kind: 'user-bubble', id: 'user-prompt', content: USER_PROMPT },
    { kind: 'assistant-text', id: 'msg-before-intent', content: MSG_BEFORE_INTENT },
  ];
  if (!pathData || !path) return [];

  const base: ThreadItem[] = [
    { kind: 'user-bubble', id: 'user-prompt', content: USER_PROMPT },
    { kind: 'assistant-text', id: 'msg-before-intent', content: MSG_BEFORE_INTENT },
    { kind: 'user-bubble', id: 'intent-selected', content: INTENT_PATH_TO_LABEL[path] },
    { kind: 'assistant-text', id: 'msg-intro', content: pathData.MSG_INTRO },
  ];

  const afterClarify1: ThreadItem[] = [
    ...base,
    { kind: 'user-bubble', id: 'answer-1', content: '*(clarification answers submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-1', content: pathData.MSG_AFTER_CLARIFY_1 },
  ];

  const afterClarify2: ThreadItem[] = [
    ...afterClarify1,
    { kind: 'user-bubble', id: 'answer-2', content: '*(solution answers submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-2', content: pathData.MSG_AFTER_CLARIFY_2 },
  ];

  const afterQuality: ThreadItem[] = [
    ...afterClarify2,
    { kind: 'user-bubble', id: 'approve-quality', content: 'Yes, looks right' },
    { kind: 'assistant-text', id: 'msg-quality-ok', content: pathData.MSG_QUALITY_APPROVED },
  ];

  const afterImpl: ThreadItem[] = [
    ...afterQuality,
    { kind: 'user-bubble', id: 'answer-impl', content: '*(implementation answers submitted)*' },
    { kind: 'assistant-text', id: 'msg-after-impl', content: pathData.MSG_AFTER_IMPL },
  ];

  const afterAck: ThreadItem[] = [
    ...afterImpl,
    { kind: 'user-bubble', id: 'approve-ack', content: pathData.ACK_APPROVE_LABEL },
    { kind: 'assistant-text', id: 'msg-ack-ok', content: pathData.MSG_ACK_APPROVED },
    {
      kind: 'task-list',
      id: 'live-tasks',
      items: pathData.TASKS,
      completedCount: pathData.TASKS.length,
      defaultExpanded: false,
    },
    { kind: 'assistant-text', id: 'msg-build-done', content: pathData.MSG_BUILD_COMPLETE },
  ];

  const afterResolution: ThreadItem[] = [
    ...afterAck,
    { kind: 'user-bubble', id: 'approve-resolution', content: pathData.RESOLUTION_APPROVE_LABEL },
    { kind: 'assistant-text', id: 'msg-resolution-ok', content: pathData.MSG_RESOLUTION_APPROVED },
  ];

  switch (phase) {
    case 'thinking':
    case 'clarify-1':
      return base;
    case 'clarify-2':
      return afterClarify1;
    case 'quality-gate':
    case 'quality-rejected':
      return afterClarify2;
    case 'impl-questions':
      return afterQuality;
    case 'ack-gate':
    case 'ack-rejected':
      return afterImpl;
    case 'building':
      return [
        ...afterImpl,
        { kind: 'user-bubble', id: 'approve-ack', content: pathData.ACK_APPROVE_LABEL },
        { kind: 'assistant-text', id: 'msg-ack-ok', content: pathData.MSG_ACK_APPROVED },
        { kind: 'task-list', id: 'live-tasks', items: pathData.TASKS, completedCount: 0, defaultExpanded: true },
      ];
    case 'resolution':
    case 'resolution-rejected':
      return afterAck;
    case 'nudge':
    case 'done':
      return afterResolution;
    default:
      return base;
  }
}

function buildInitialArtifacts(phase: Phase, pathData: (typeof PATH_CONTENT)[IntentPath] | null): Artifact[] {
  if (!pathData) return [];
  const brief = { ...pathData.BRIEF_ARTIFACT, content: pathData.BRIEF_V2, status: 'complete' as const };
  const impl  = { ...pathData.IMPL_PLAN_ARTIFACT, content: pathData.IMPL_PLAN, status: 'complete' as const };
  switch (phase) {
    // Brief approved at quality-gate → visible from impl-questions onward
    case 'impl-questions':
    case 'ack-gate':
    case 'ack-rejected':
      return [brief];
    // Impl plan approved at ack-gate → both visible from building onward
    case 'building':
    case 'resolution':
    case 'resolution-rejected':
      return [brief, impl];
    // Prototype approved at resolution → all four visible
    case 'nudge':
    case 'done':
      return [brief, impl, { ...pathData.PROTOTYPE_ARTIFACT }, { ...pathData.PREVIEW_ARTIFACT }];
    default:
      return [];
  }
}

// ━━━ MeasurementFlowPage ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function MeasurementFlowPage({
  initialPhase = 'homepage',
  initialPath,
}: MeasurementFlowPageProps) {
  const [path, setPath]                         = useState<IntentPath | null>(initialPath ?? null);
  const [phase, setPhase]                       = useState<Phase>(initialPhase);
  const [inputValue, setInputValue]             = useState('');
  const [streamingId, setStreamingId]           = useState<string | null>(null);
  const [approvalContent, setApprovalContent]   = useState(() => {
    const pd = initialPath ? PATH_CONTENT[initialPath] : null;
    if (!pd) return '';
    if (initialPhase === 'ack-gate'    || initialPhase === 'ack-rejected')        return pd.ACK_REVIEW;
    if (initialPhase === 'resolution'  || initialPhase === 'resolution-rejected') return pd.RESOLUTION_CONTENT;
    if (initialPhase === 'quality-gate'|| initialPhase === 'quality-rejected')    return pd.BRIEF_V2;
    return '';
  });
  const [isArtifactOpen, setIsArtifactOpen]     = useState(true);
  const [mobileView, setMobileView]             = useState<'chat' | 'artifact'>('chat');
  const [activeArtifactId, setActiveArtifactId] = useState('');

  const pathData = path ? PATH_CONTENT[path] : null;

  const [items, setItems]       = useState<ThreadItem[]>(() =>
    buildInitialItems(initialPhase, initialPath ?? null, initialPath ? PATH_CONTENT[initialPath] : null)
  );
  const [artifacts, setArtifacts] = useState<Artifact[]>(() =>
    buildInitialArtifacts(initialPhase, initialPath ? PATH_CONTENT[initialPath] : null)
  );

  // Set initial active artifact
  useEffect(() => {
    if (artifacts.length > 0 && !activeArtifactId) {
      setActiveArtifactId(artifacts[artifacts.length - 1].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Responsive detection ──────────────────────────────────────────────────
  const isMobile = useMediaQuery('(max-width: 767.98px)');
  const isMobileRef = useRef(false);
  useEffect(() => { isMobileRef.current = isMobile; }, [isMobile]);

  const clearStreamingId = useCallback(() => setStreamingId(null), []);
  const timeouts   = useRef<NodeJS.Timeout[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function schedule(fn: () => void, delay: number) {
    const id = setTimeout(fn, delay);
    timeouts.current.push(id);
  }

  useEffect(() => {
    const saved = timeouts.current;
    return () => {
      saved.forEach(clearTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // ── Artifact helpers ──────────────────────────────────────────────────────

  function addArtifact(a: Artifact) {
    setArtifacts(prev => [...prev, a]);
    setActiveArtifactId(a.id);
    if (isMobileRef.current) setMobileView('artifact');
  }

  // ── Homepage submit — homepage → thinking → intent-gate ─────────────────

  function handleHomepageSubmit(value: string) {
    if (!value.trim()) return;
    setInputValue('');
    setItems([
      { kind: 'user-bubble', id: 'user-prompt', content: value },
      { kind: 'typing', id: 'typing-before-intent' },
    ]);
    setPhase('thinking');
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-before-intent'),
        { kind: 'assistant-text', id: 'msg-before-intent', content: MSG_BEFORE_INTENT },
      ]);
      setStreamingId('msg-before-intent');
      setPhase('intent-gate');
    }, randomThinkMs());
  }

  // ── IntentGate submit — intent-gate → thinking → clarify-1 ───────────────

  function handleIntentGateSubmit(answers: ClarificationAnswer[]) {
    const ans = answers[0];
    if (!ans || ans.type !== 'single') return;
    const selected = INTENT_INDEX_TO_PATH[ans.index];
    if (!selected) return;
    setPath(selected);
    const pd = PATH_CONTENT[selected];
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'intent-selected', content: INTENT_GATE_LABELS[ans.index] },
      { kind: 'typing', id: 'typing-intent' },
    ]);
    setPhase('thinking');
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-intent'),
        { kind: 'assistant-text', id: 'msg-intro', content: pd.MSG_INTRO },
      ]);
      setStreamingId('msg-intro');
      setPhase('clarify-1');
    }, randomThinkMs());
  }

  // ── Clarify 1 submit ──────────────────────────────────────────────────────

  function handleClarify1Submit(answers: ClarificationAnswer[]) {
    if (!pathData) return;
    const summary = buildAnswerMarkdown(pathData.CLARIFY_1, answers);
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-1', content: summary },
      { kind: 'typing', id: 'typing-1' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-1'),
        { kind: 'assistant-text', id: 'msg-after-1', content: pathData.MSG_AFTER_CLARIFY_1 },
      ]);
      setStreamingId('msg-after-1');
      schedule(() => setPhase('clarify-2'), 600);
    }, randomThinkMs());
  }

  // ── Clarify 2 submit ──────────────────────────────────────────────────────

  function handleClarify2Submit(answers: ClarificationAnswer[]) {
    if (!pathData) return;
    const summary = buildAnswerMarkdown(pathData.CLARIFY_2, answers);
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-2', content: summary },
      { kind: 'typing', id: 'typing-2' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-2'),
        { kind: 'assistant-text', id: 'msg-after-2', content: pathData.MSG_AFTER_CLARIFY_2 },
      ]);
      setStreamingId('msg-after-2');
      setApprovalContent(pathData.BRIEF_V2);
      schedule(() => setPhase('quality-gate'), 600);
    }, randomThinkMs());
  }

  // ── QualityGate handlers ──────────────────────────────────────────────────

  function handleQualityApprove() {
    if (!pathData) return;
    addArtifact({ ...pathData.BRIEF_ARTIFACT, content: pathData.BRIEF_V2, status: 'complete' });
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'approve-quality', content: 'Yes, looks right' },
      { kind: 'assistant-text', id: 'msg-quality-ok', content: pathData.MSG_QUALITY_APPROVED },
    ]);
    setStreamingId('msg-quality-ok');
    setPhase('impl-questions');
  }

  function handleQualityReject(message?: string) {
    if (!pathData) return;
    setPhase('quality-rejected');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'reject-quality', content: message || 'Needs changes' },
      { kind: 'assistant-text', id: 'msg-quality-reject', content: pathData.MSG_QUALITY_REJECTED },
    ]);
    setStreamingId('msg-quality-reject');
  }

  function handleQualityRevisionSubmit(value: string) {
    if (!value.trim() || !pathData) return;
    setInputValue('');
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: `revision-quality-${Date.now()}`, content: value },
      { kind: 'typing', id: 'typing-quality-revision' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-quality-revision'),
        { kind: 'assistant-text', id: `msg-quality-revised-${Date.now()}`, content: pathData.MSG_AFTER_QUALITY_REVISION },
      ]);
      setStreamingId(`msg-quality-revised-${Date.now()}`);
      schedule(() => setPhase('quality-gate'), 600);
    }, randomThinkMs());
  }

  // ── Impl questions submit ─────────────────────────────────────────────────

  function handleImplSubmit(answers: ClarificationAnswer[]) {
    if (!pathData) return;
    const summary = buildAnswerMarkdown(pathData.IMPL_QS, answers);
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'answer-impl', content: summary },
      { kind: 'typing', id: 'typing-impl' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-impl'),
        { kind: 'assistant-text', id: 'msg-after-impl', content: pathData.MSG_AFTER_IMPL },
      ]);
      setStreamingId('msg-after-impl');
      setApprovalContent(pathData.ACK_REVIEW);
      schedule(() => setPhase('ack-gate'), 600);
    }, randomThinkMs());
  }

  // ── AckGate handlers ──────────────────────────────────────────────────────

  function handleAckApprove() {
    if (!pathData) return;
    addArtifact({ ...pathData.IMPL_PLAN_ARTIFACT, content: pathData.IMPL_PLAN, status: 'complete' });
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'approve-ack', content: pathData.ACK_APPROVE_LABEL },
      { kind: 'assistant-text', id: 'msg-ack-ok', content: pathData.MSG_ACK_APPROVED },
    ]);
    setStreamingId('msg-ack-ok');
    setPhase('thinking');
    schedule(() => {
      setPhase('building');
      setItems(prev => {
        if (prev.some(i => i.kind === 'task-list' && i.id === 'live-tasks')) return prev;
        return [...prev, {
          kind: 'task-list',
          id: 'live-tasks',
          items: pathData.TASKS,
          completedCount: 0,
          defaultExpanded: true,
        }];
      });
    }, 600);
  }

  function handleAckReject(message?: string) {
    if (!pathData) return;
    setPhase('ack-rejected');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'reject-ack', content: message || pathData.ACK_REJECT_LABEL },
      { kind: 'assistant-text', id: 'msg-ack-reject', content: pathData.MSG_ACK_REJECTED },
    ]);
    setStreamingId('msg-ack-reject');
  }

  function handleAckRevisionSubmit(value: string) {
    if (!value.trim() || !pathData) return;
    setInputValue('');
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: `revision-ack-${Date.now()}`, content: value },
      { kind: 'typing', id: 'typing-ack-revision' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-ack-revision'),
        { kind: 'assistant-text', id: `msg-ack-revised-${Date.now()}`, content: pathData.MSG_AFTER_ACK_REVISION },
      ]);
      setStreamingId(`msg-ack-revised-${Date.now()}`);
      schedule(() => setPhase('ack-gate'), 600);
    }, randomThinkMs());
  }

  // ── Building phase — task ticker ──────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'building' || !pathData) return;

    let progress = 0;
    intervalRef.current = setInterval(() => {
      progress += 1;
      setItems(prev => prev.map(item =>
        item.kind === 'task-list' && item.id === 'live-tasks'
          ? { ...item, completedCount: progress }
          : item
      ));

      if (progress >= pathData.TASKS.length) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;

        const doneId = 'msg-build-done';
        setItems(prev => [
          ...prev,
          { kind: 'assistant-text', id: doneId, content: pathData.MSG_BUILD_COMPLETE },
        ]);
        setStreamingId(doneId);

        schedule(() => {
          setApprovalContent(pathData.RESOLUTION_CONTENT);
          setPhase('resolution');
        }, 1000);
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── ResolutionPrompt handlers ─────────────────────────────────────────────

  function handleResolutionApprove() {
    if (!pathData) return;
    addArtifact(pathData.PROTOTYPE_ARTIFACT);
    addArtifact(pathData.PREVIEW_ARTIFACT);
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'approve-resolution', content: pathData.RESOLUTION_APPROVE_LABEL },
      { kind: 'assistant-text', id: 'msg-resolution-ok', content: pathData.MSG_RESOLUTION_APPROVED },
    ]);
    setStreamingId('msg-resolution-ok');
    setPhase('nudge');
  }

  function handleResolutionReject(message?: string) {
    if (!pathData) return;
    setPhase('resolution-rejected');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: 'reject-resolution', content: message || pathData.RESOLUTION_REJECT_LABEL },
      { kind: 'assistant-text', id: 'msg-resolution-reject', content: pathData.MSG_RESOLUTION_REJECTED },
    ]);
    setStreamingId('msg-resolution-reject');
  }

  function handleResolutionRevisionSubmit(value: string) {
    if (!value.trim() || !pathData) return;
    setInputValue('');
    setPhase('thinking');
    setItems(prev => [
      ...prev,
      { kind: 'user-bubble', id: `revision-resolution-${Date.now()}`, content: value },
      { kind: 'typing', id: 'typing-resolution-revision' },
    ]);
    schedule(() => {
      setItems(prev => [
        ...prev.filter(i => i.id !== 'typing-resolution-revision'),
        { kind: 'assistant-text', id: `msg-resolution-revised-${Date.now()}`, content: pathData.MSG_AFTER_RESOLUTION_REVISION },
      ]);
      setStreamingId(`msg-resolution-revised-${Date.now()}`);
      schedule(() => setPhase('resolution'), 600);
    }, randomThinkMs());
  }

  // ── PostSessionNudge handlers ─────────────────────────────────────────────

  function handleNudgeSubmit(answers: ClarificationAnswer[]) {
    const summary = buildAnswerMarkdown(NUDGE_QUESTIONS, answers);
    if (summary) {
      setItems(prev => [...prev, { kind: 'user-bubble', id: 'nudge-answers', content: summary }]);
    }
    setPhase('done');
  }

  function handleNudgeClose() {
    setPhase('done');
  }

  // ── Toolbar derivation ────────────────────────────────────────────────────

  const activeArtifact = artifacts.find(a => a.id === activeArtifactId);

  const toolbar =
    activeArtifact?.type === 'prototype' ? <PrototypeToolbar /> :
    activeArtifact?.type === 'preview'   ? <PreviewToolbar /> :
    activeArtifact                        ? <DocumentToolbar /> :
    undefined;

  // ── Footer derivation ─────────────────────────────────────────────────────

  const clarificationProp =
    phase === 'intent-gate' ? {
      questions:   INTENT_OPTIONS,
      onSubmit:    handleIntentGateSubmit,
      weight:      'prominent' as const,
      surface:     'shadow-border' as const,
    } :
    !pathData ? undefined :
    phase === 'clarify-1'      ? { questions: pathData.CLARIFY_1,  onSubmit: handleClarify1Submit, surface: 'shadow-border' as const } :
    phase === 'clarify-2'      ? { questions: pathData.CLARIFY_2,  onSubmit: handleClarify2Submit, surface: 'shadow-border' as const } :
    phase === 'impl-questions' ? { questions: pathData.IMPL_QS,    onSubmit: handleImplSubmit,     surface: 'shadow-border' as const } :
    phase === 'nudge'          ? {
      questions:   NUDGE_QUESTIONS,
      onSubmit:    handleNudgeSubmit,
      onClose:     handleNudgeClose,
      submitLabel: 'Done',
      surface:     'shadow-border' as const,
    } :
    undefined;

  const approvalProp = !pathData ? undefined :
    phase === 'quality-gate' ? {
      title:        'Quality Check',
      approveLabel: 'Yes, looks right',
      rejectLabel:  'Needs changes',
      content:      <MarkdownContent content={approvalContent} />,
      onApprove:    handleQualityApprove,
      onReject:     handleQualityReject,
      surface:      'shadow-border' as const,
    } :
    phase === 'ack-gate' ? {
      title:        'Security Review',
      approveLabel: pathData.ACK_APPROVE_LABEL,
      rejectLabel:  pathData.ACK_REJECT_LABEL,
      content:      <MarkdownContent content={approvalContent} />,
      onApprove:    handleAckApprove,
      onReject:     handleAckReject,
      surface:      'shadow-border' as const,
    } :
    phase === 'resolution' ? {
      title:        'Resolution Check',
      approveLabel: pathData.RESOLUTION_APPROVE_LABEL,
      rejectLabel:  pathData.RESOLUTION_REJECT_LABEL,
      content:      <MarkdownContent content={approvalContent} />,
      onApprove:    handleResolutionApprove,
      onReject:     handleResolutionReject,
      surface:      'shadow-border' as const,
    } :
    undefined;

  const inputEnabled = ['quality-rejected', 'ack-rejected', 'resolution-rejected', 'done'].includes(phase);
  const inputPlaceholder =
    phase === 'quality-rejected'     ? 'What needs to change in the brief?' :
    phase === 'ack-rejected'         ? 'What concerns do you have?' :
    phase === 'resolution-rejected'  ? 'What else do you need?' :
    'What would you like to change?';
  const inputSubmit =
    phase === 'quality-rejected'     ? handleQualityRevisionSubmit :
    phase === 'ack-rejected'         ? handleAckRevisionSubmit :
    phase === 'resolution-rejected'  ? handleResolutionRevisionSubmit :
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
      disabled: !inputEnabled,
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
      <div className="relative flex-1 overflow-hidden">
        <GridBackground />

        <AnimatePresence mode="popLayout">
          {phase === 'homepage' ? (

            // ── Homepage — text input ─────────────────────────────────────
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
                    placeholder="Tell me what you want to build..."
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
