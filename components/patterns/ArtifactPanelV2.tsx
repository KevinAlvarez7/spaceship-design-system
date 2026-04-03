'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { FileText, AppWindow } from 'lucide-react';
import { FolderTabs, FolderTab } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ArtifactContentRenderer } from './ArtifactContentRenderer';
import {
  type ArtifactNavigationProps,
  type ArtifactType,
  ARTIFACT_TYPE_LABEL,
} from './artifact-types';

// ─── Constants ─────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<ArtifactType, ReactNode> = {
  prd:            <FileText className="size-4" />,
  research:       <FileText className="size-4" />,
  implementation: <FileText className="size-4" />,
  code:           <FileText className="size-4" />,
  preview:        <FileText className="size-4" />,
  brief:          <FileText className="size-4" />,
  proposal:       <FileText className="size-4" />,
  security:       <FileText className="size-4" />,
  prototype:      <AppWindow className="size-4" />,
};

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface ArtifactPanelV2Props extends ArtifactNavigationProps {
  /** Flexible toolbar slot rendered in the content card header. Varies per artifact type. */
  toolbar?: ReactNode;
  /** Action button rendered before the tab list (e.g. mobile back-to-chat). */
  leadingAction?: ReactNode;
  className?: string;
}

// ─── ArtifactPanelV2 ──────────────────────────────────────────────────────────

export function ArtifactPanelV2({
  artifacts,
  activeId,
  onSelect,
  changedIds,
  toolbar,
  leadingAction,
  className,
}: ArtifactPanelV2Props) {
  const activeArtifact = artifacts.find(a => a.id === activeId) ?? artifacts[0];
  const contentRef = useRef<HTMLDivElement>(null);

  // Derived shimmer state — React's getDerivedStateFromProps pattern.
  // setState during render (conditioned on actual change) is the approved way
  // to derive state from props without triggering it inside a useEffect.
  const [{ prevContent, prevId, shimmerKey }, setShimmerState] = useState({
    prevContent: activeArtifact?.content ?? '',
    prevId: activeArtifact?.id ?? '',
    shimmerKey: 0,
  });

  const currentContent = activeArtifact?.content ?? '';
  const currentId = activeArtifact?.id ?? '';

  if (currentId === prevId && prevContent !== '' && prevContent !== currentContent) {
    // Same artifact, content updated → trigger shimmer
    setShimmerState({ prevContent: currentContent, prevId: currentId, shimmerKey: shimmerKey + 1 });
  } else if (currentContent !== prevContent || currentId !== prevId) {
    // Tab switch or initial content — just sync, no shimmer
    setShimmerState(s => ({ ...s, prevContent: currentContent, prevId: currentId }));
  }

  // Scroll to top when shimmerKey advances (same artifact content update)
  useEffect(() => {
    if (shimmerKey > 0) {
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [shimmerKey]);

  return (
    <div className={cn('flex flex-col flex-1 min-h-0 overflow-hidden', className)}>

      <div className="flex flex-col flex-1 min-h-0 p-4">

        {/* ── Folder tab bar ── */}
        <FolderTabs
          value={activeId}
          onChange={onSelect}
          surface="shadow-border"
          leadingAction={leadingAction}
          toolbar={toolbar}
        >
          {artifacts.map(artifact => (
            <FolderTab
              key={artifact.id}
              value={artifact.id}
              leadingIcon={
                changedIds?.has(artifact.id)
                  ? <span className="size-1.5 rounded-full bg-(--bg-interactive-error-default) blink-dot" />
                  : TYPE_ICON[artifact.type]
              }
            >
              {ARTIFACT_TYPE_LABEL[artifact.type]}
            </FolderTab>
          ))}
        </FolderTabs>

        {/* ── Content card ── */}
        <div className="flex flex-col flex-1 min-h-0 rounded-b-lg shadow-border bg-(--bg-surface-base) overflow-clip">

          {/* Scrollable content + shimmer overlay */}
          <div className="relative flex flex-1 min-h-0">
            <div
              ref={contentRef}
              className="flex flex-1 min-h-0 overflow-auto"
            >
              <ArtifactContentRenderer artifact={activeArtifact} />
            </div>

            {/* Shimmer sweep — remounts on every shimmerKey change, replaying entrance animation */}
            {shimmerKey > 0 && (
              <motion.div
                key={shimmerKey}
                className="absolute inset-0 pointer-events-none overflow-hidden z-10"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
              >
                <motion.div
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '400%' }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
