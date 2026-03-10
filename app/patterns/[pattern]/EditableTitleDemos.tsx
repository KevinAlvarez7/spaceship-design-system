'use client';

import { useState } from 'react';
import { EditableTitle } from '@/components/patterns';

export function EditableTitleDemos() {
  const [title, setTitle] = useState('Spaceship Vibe Prototype');
  const [titleWithMenu, setTitleWithMenu] = useState('Spaceship Vibe Prototype');

  return (
    <div className="flex flex-col gap-10">
      {/* Default — editable, no menu */}
      <div className="flex flex-col gap-3">
        <p className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-secondary)">
          Default
        </p>
        <EditableTitle title={title} onTitleChange={setTitle} />
      </div>

      {/* With menu button */}
      <div className="flex flex-col gap-3">
        <p className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-secondary)">
          With menu button
        </p>
        <EditableTitle
          title={titleWithMenu}
          onTitleChange={setTitleWithMenu}
          onMenuClick={() => {}}
        />
      </div>

      {/* Error state */}
      <div className="flex flex-col gap-3">
        <p className="[font-size:var(--font-size-sm)] [font-weight:var(--font-weight-semibold)] text-(--text-secondary)">
          Error state
        </p>
        <EditableTitle
          title="Spaceship Vibe Prototype"
          onMenuClick={() => {}}
          error="Name already taken"
        />
      </div>
    </div>
  );
}
