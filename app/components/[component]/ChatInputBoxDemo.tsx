'use client';

import { useState } from 'react';
import { ChatInputBox } from '@/components/ui';

export function ChatInputBoxDemo({ size }: { size?: 'md' | 'sm' }) {
  const [value, setValue] = useState('');
  return (
    <ChatInputBox
      size={size}
      value={value}
      onChange={e => setValue(e.target.value)}
      onSubmit={val => console.log('submit:', val)}
    />
  );
}
