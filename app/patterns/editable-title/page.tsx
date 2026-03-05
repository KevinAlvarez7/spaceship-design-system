'use client';

import { EditableTitle } from '@/components/patterns';

export default function EditableTitlePage() {
  return (
    <div className="flex flex-col gap-(--spacing-sm) p-(--spacing-sm)">
      <div className="flex items-center gap-(--spacing-sm)">
        <EditableTitle title="My Project Prototype" />
      </div>
      <div className="flex items-center gap-(--spacing-sm)">
        <EditableTitle title="Short title" />
      </div>
    </div>
  );
}
