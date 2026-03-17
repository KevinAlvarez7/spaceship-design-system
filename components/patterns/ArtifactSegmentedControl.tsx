'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ExternalLink, FileText, Search, GitBranch, Code2, Eye, BookOpen, FileCheck, ShieldCheck, Smartphone } from 'lucide-react';
import { Button, FolderTabs, FolderTab } from '@/components/ui';
import { ArtifactContentRenderer } from './ArtifactContentRenderer';
import {
  type ArtifactNavigationProps,
  type ArtifactType,
  ARTIFACT_TYPE_LABEL,
} from '@/app/patterns/_shared/artifactData';
import { springs } from '@/tokens';

const TYPE_ICON: Record<ArtifactType, React.ReactNode> = {
  prd:            <FileText className="size-4" />,
  research:       <Search className="size-4" />,
  implementation: <GitBranch className="size-4" />,
  code:           <Code2 className="size-4" />,
  preview:        <Eye className="size-4" />,
  brief:          <BookOpen className="size-4" />,
  proposal:       <FileCheck className="size-4" />,
  security:       <ShieldCheck className="size-4" />,
  prototype:      <Smartphone className="size-4" />,
};

export function ArtifactSegmentedControl({
  artifacts,
  activeId,
  onSelect,
  onRefresh,
  onOpenInNewTab,
}: ArtifactNavigationProps) {
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
    <div className="flex flex-1 min-h-0 flex-col rounded-xl shadow-(--shadow-border) bg-(--bg-surface-base) overflow-clip">
      {/* Folder tab bar — active tab merges with content surface */}
      <FolderTabs
        value={activeId}
        onChange={onSelect}
        layoutId="artifact-folder-tabs"
        activeActions={
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              leadingIcon={<RefreshCw />}
              onClick={onRefresh}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              leadingIcon={<ExternalLink />}
              onClick={onOpenInNewTab}
            />
          </>
        }
      >
        {artifacts.map(artifact => (
          <FolderTab
            key={artifact.id}
            value={artifact.id}
            leadingIcon={TYPE_ICON[artifact.type]}
          >
            {ARTIFACT_TYPE_LABEL[artifact.type]}
          </FolderTab>
        ))}
      </FolderTabs>

      {/* Content */}
      <div className="relative flex flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeArtifact.id}
            ref={contentRef}
            className="flex flex-1 min-h-0 overflow-auto"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ ...springs.interactive, duration: 0.15 }}
          >
            <ArtifactContentRenderer artifact={activeArtifact} />
          </motion.div>
        </AnimatePresence>

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
  );
}
