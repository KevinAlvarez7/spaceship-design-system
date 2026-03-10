'use client';

import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ExternalLink, FileText, Search, GitBranch, Code2, Eye } from 'lucide-react';
import { Button, Tag } from '@/components/ui';
import { ArtifactContentRenderer } from './ArtifactContentRenderer';
import {
  type ArtifactNavigationProps,
  type ArtifactType,
  ARTIFACT_TYPE_LABEL,
  ARTIFACT_STATUS_VARIANT,
  ARTIFACT_STATUS_LABEL,
} from '@/app/patterns/_shared/artifactData';
import { springs } from '@/tokens';

const TYPE_ICON: Record<ArtifactType, React.ReactNode> = {
  prd:            <FileText className="size-4" />,
  research:       <Search className="size-4" />,
  implementation: <GitBranch className="size-4" />,
  code:           <Code2 className="size-4" />,
  preview:        <Eye className="size-4" />,
};

export function ArtifactSegmentedControl({
  artifacts,
  activeId,
  onSelect,
  onRefresh,
  onOpenInNewTab,
}: ArtifactNavigationProps) {
  const activeArtifact = artifacts.find(a => a.id === activeId) ?? artifacts[0];

  return (
    <div className="flex flex-1 min-h-0 flex-col rounded-3xl shadow-(--shadow-border) bg-(--bg-surface-base) overflow-clip">
      {/* Header with segmented control */}
      <div className="bg-(--bg-surface-primary) border-b-2 border-(--bg-surface-secondary) flex shrink-0 items-center justify-between px-4 py-3 gap-4">
        {/* Pill track */}
        <div className="relative flex items-center rounded-2xl bg-(--bg-surface-secondary) p-1 gap-0.5">
          {artifacts.map(artifact => {
            const isActive = artifact.id === activeId;
            return (
              <div key={artifact.id} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="segment-active-pill"
                    className="absolute inset-0 rounded-xl bg-(--bg-surface-base) shadow-(--shadow-border)"
                    transition={springs.interactive}
                    style={{ willChange: 'transform' }}
                  />
                )}
                <button
                  onClick={() => onSelect(artifact.id)}
                  className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <span className={isActive ? 'text-(--text-interactive-primary)' : 'text-(--text-tertiary)'}>
                    {TYPE_ICON[artifact.type]}
                  </span>
                  <span className={`font-sans [font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] whitespace-nowrap ${isActive ? 'text-(--text-primary)' : 'text-(--text-tertiary)'}`}>
                    {ARTIFACT_TYPE_LABEL[artifact.type]}
                  </span>
                  {artifact.status !== 'draft' && (
                    <span className={`size-1.5 rounded-full shrink-0 ${artifact.status === 'complete' ? 'bg-(--bg-interactive-success-default)' : 'bg-(--bg-interactive-warning-default)'}`} />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Tag variant={ARTIFACT_STATUS_VARIANT[activeArtifact.status]} size="sm">
            {ARTIFACT_STATUS_LABEL[activeArtifact.status]}
          </Tag>
          <Button
            variant="secondary"
            surface="shadow"
            size="sm"
            trailingIcon={<RefreshCw />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            surface="shadow"
            size="sm"
            trailingIcon={<ExternalLink />}
            onClick={onOpenInNewTab}
          >
            Open
          </Button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeArtifact.id}
          className="flex flex-1 min-h-0 overflow-auto"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ ...springs.interactive, duration: 0.15 }}
        >
          <ArtifactContentRenderer artifact={activeArtifact} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
