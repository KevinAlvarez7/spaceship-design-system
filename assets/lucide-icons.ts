import type { LucideIcon } from 'lucide-react';
import { Check, ChevronRight, Copy, Download, Moon, Sun } from 'lucide-react';

export type IconEntry = {
  name: string;
  icon: LucideIcon;
  importName: string;
  tags?: string[];
};

export const lucideIcons: IconEntry[] = [
  { name: 'Check',         icon: Check,        importName: 'Check',        tags: ['feedback', 'confirm'] },
  { name: 'Chevron Right', icon: ChevronRight,  importName: 'ChevronRight', tags: ['navigation', 'arrow'] },
  { name: 'Copy',          icon: Copy,          importName: 'Copy',         tags: ['action', 'clipboard'] },
  { name: 'Download',      icon: Download,      importName: 'Download',     tags: ['action', 'file'] },
  { name: 'Moon',          icon: Moon,          importName: 'Moon',         tags: ['theme', 'toggle'] },
  { name: 'Sun',           icon: Sun,           importName: 'Sun',          tags: ['theme', 'toggle'] },
];
