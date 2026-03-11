'use client';

import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ExternalLink, FileText, Search, GitBranch, Code2, Eye } from 'lucide-react';
import { Button, Tag, TabBar, TabBarItem } from '@/components/ui';
import { ArtifactContentRenderer } from './ArtifactContentRenderer';
import {
  type ArtifactNavigationProps,
  type ArtifactType,
  type ArtifactStatus,
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

function StatusDot({ status }: { status: ArtifactStatus }) {
  if (status === 'draft') return null;
  return (
    <span className={status === 'complete' ? 'size-1.5 rounded-full shrink-0 bg-(--bg-interactive-success-default)' : 'size-1.5 rounded-full shrink-0 bg-(--bg-interactive-warning-default)'} />
  );
}

export function ArtifactSegmentedControl({
  artifacts,
  activeId,
  onSelect,
  onRefresh,
  onOpenInNewTab,
}: ArtifactNavigationProps) {
  const activeArtifact = artifacts.find(a => a.id === activeId) ?? artifacts[0];

  return (
    <div className="flex flex-1 min-h-0 flex-col rounded-xl shadow-(--shadow-border) bg-(--bg-surface-base) overflow-clip">
      {/* Header with tab bar */}
      <div className="bg-(--bg-surface-primary) border-b-2 border-(--bg-surface-secondary) flex shrink-0 items-center justify-between px-4 py-3 gap-4">
        <TabBar value={activeId} onChange={onSelect} layoutId="artifact-segment-pill">
          {artifacts.map(artifact => (
            <TabBarItem
              key={artifact.id}
              value={artifact.id}
              leadingIcon={TYPE_ICON[artifact.type]}
              badge={<StatusDot status={artifact.status} />}
            >
              {ARTIFACT_TYPE_LABEL[artifact.type]}
            </TabBarItem>
          ))}
        </TabBar>

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
