import { codeToHtml } from 'shiki';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

export async function CodeBlock({ code, lang = 'tsx' }: CodeBlockProps) {
  // Safe: Shiki generates HTML from our own static code strings, not user input.
  const html = await codeToHtml(code, {
    lang,
    theme: 'github-light',
  });

  return (
    <div className="relative rounded-lg border border-zinc-200 overflow-hidden text-sm">
      <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-4 py-2">
        <span className="text-xs text-zinc-400 font-mono">{lang}</span>
      </div>
      {/* Safe: content is Shiki-generated HTML from static code strings */}
      <div
        className="overflow-x-auto p-4 bg-white [&>pre]:!bg-transparent [&>pre]:!m-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
