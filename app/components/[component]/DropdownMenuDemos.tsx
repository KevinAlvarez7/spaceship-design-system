'use client';

import { MoreVertical, PenLine, Trash2, Copy, Share } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import { Preview } from '@/components/viewer/Preview';

export function DropdownMenuDemos() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">Default</h2>
        <Preview label="Standard items + destructive">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" surface="shadow" size="icon-md" isolateScale icon={<MoreVertical />} aria-label="Open menu" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem><PenLine />Rename</DropdownMenuItem>
              <DropdownMenuItem><Copy />Duplicate</DropdownMenuItem>
              <DropdownMenuItem><Share />Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive"><Trash2 />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Preview>
      </section>

      <section>
        <h2 className="text-base font-semibold text-zinc-800 mb-3">With text trigger</h2>
        <Preview label="Button trigger with label">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" surface="shadow" isolateScale aria-label="Actions">Actions</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem><PenLine />Edit</DropdownMenuItem>
              <DropdownMenuItem><Copy />Copy</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive"><Trash2 />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Preview>
      </section>
    </div>
  );
}
