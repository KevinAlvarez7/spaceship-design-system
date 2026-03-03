import { notFound } from 'next/navigation';
import { Topbar }      from '@/components/viewer/Topbar';
import { ButtonPage }  from './ButtonPage';
import { InputPage }   from './InputPage';
import { CardPage }    from './CardPage';
import { BadgePage }   from './BadgePage';
import { ChatInputBoxPage } from './ChatInputBoxPage';
import { ChatBubblePage }  from './ChatBubblePage';
import { ChatMessagePage } from './ChatMessagePage';
import { ChatThreadPage }  from './ChatThreadPage';

const PAGES: Record<string, { title: string; Component: React.ComponentType }> = {
  button:           { title: 'Button',         Component: ButtonPage },
  input:            { title: 'Input',          Component: InputPage },
  card:             { title: 'Card',           Component: CardPage },
  badge:            { title: 'Badge',          Component: BadgePage },
  'chat-input-box': { title: 'Chat Input Box', Component: ChatInputBoxPage },
  'chat-bubble':    { title: 'Chat Bubble',    Component: ChatBubblePage },
  'chat-message':   { title: 'Chat Message',   Component: ChatMessagePage },
  'chat-thread':    { title: 'Chat Thread',    Component: ChatThreadPage },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map(component => ({ component }));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ component: string }>;
}) {
  const { component } = await params;
  const page = PAGES[component];
  if (!page) notFound();
  const { title, Component } = page;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title={`Components / ${title}`} />
      <main className="flex-1 overflow-y-auto p-8">
        <Component />
      </main>
    </div>
  );
}
