import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '@/components/ui';

export interface ArtifactToolbarDropdownProps {
  /** Label displayed in the trigger button */
  label: ReactNode;
  /** DropdownMenuItem / DropdownMenuSeparator elements */
  children?: ReactNode;
}

/** Version selector for the artifact toolbar slot — opens a DropdownMenu on click. */
export function ArtifactToolbarDropdown({ label, children }: ArtifactToolbarDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" trailingIcon={<ChevronDown />} isolateScale>
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
