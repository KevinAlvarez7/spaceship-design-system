'use client';

import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui';

interface SidebarToggleProps {
  onToggle?: () => void;
  isOpen?: boolean;
}

export function SidebarToggle({ onToggle }: SidebarToggleProps) {
  return (
    <Button variant="secondary" surface="shadow" size="icon-sm" icon={<PanelLeft />} onClick={onToggle} />
  );
}
