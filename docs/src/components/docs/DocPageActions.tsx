import { useEffect, useRef, useState } from 'react';
import type { DocPage } from '~/documentation';
import { docPageMarkdown, docPagePrompt, markdownToText } from './docPageContent';

type CopyFormat = 'Markdown' | 'Plain text' | 'Agent prompt';
const copyFormats: CopyFormat[] = ['Markdown', 'Plain text', 'Agent prompt'];

export function DocPageActions({ page }: { page: DocPage }) {
  const details = useRef<HTMLDetailsElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [status, setStatus] = useState('');
  const markdown = docPageMarkdown(page);
  const markdownPath = `/docs/${page.slug || 'index'}.md`;
  const question = encodeURIComponent(`Read https://vizzo.dev${markdownPath} and help me use Vizzo to render a chart.`);
  const assistants = [
    { name: 'Claude', href: `https://claude.ai/new?q=${question}` },
    { name: 'ChatGPT', href: `https://chatgpt.com/?q=${question}` },
    { name: 'T3 Chat', href: `https://t3.chat/new?q=${question}` },
    { name: 'Cursor', href: `cursor://anysphere.cursor-deeplink/prompt?text=${question}` },
  ];

  useEffect(() => {
    function dismiss(event: PointerEvent | KeyboardEvent) {
      if (!details.current?.open) return;
      if (event instanceof KeyboardEvent) {
        if (event.key !== 'Escape') return;
        details.current.querySelector('summary')?.focus();
      } else if (event.target instanceof Node && details.current.contains(event.target)) {
        return;
      }
      details.current.open = false;
    }
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', dismiss);
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', dismiss);
    };
  }, []);

  async function copy(format: CopyFormat) {
    clearTimeout(timer.current);
    try {
      const text =
        format === 'Markdown' ? markdown : format === 'Plain text' ? markdownToText(markdown) : docPagePrompt(page);
      await navigator.clipboard.writeText(text);
      setStatus(`${format} copied`);
    } catch {
      setStatus('Copy failed. Open Markdown and copy the text.');
    }
    if (details.current?.open) {
      details.current.open = false;
      details.current.querySelector('summary')?.focus();
    }
    timer.current = setTimeout(() => setStatus(''), 3000);
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div className="relative flex items-center rounded-lg border border-doc-rule bg-doc-sheet dark:border-grid-dark dark:bg-paper-dark">
          <button
            type="button"
            onClick={() => copy('Markdown')}
            className="docs-press flex items-center gap-2 rounded-l-lg px-3 py-2 font-mono-display text-xs hover:text-plotter-blue dark:hover:text-blue-300"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-3.5"
            >
              <path d="M7 7V3h10v10h-4M3 7h10v10H3z" />
            </svg>
            Copy page
          </button>
          <details ref={details}>
            <summary className="flex cursor-pointer list-none items-center rounded-r-lg border-doc-rule border-l px-2.5 py-2 hover:text-plotter-blue dark:border-grid-dark dark:hover:text-blue-300 [&::-webkit-details-marker]:hidden">
              <span className="sr-only">More page options</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="size-4"
              >
                <path d="m5 8 5 5 5-5" />
              </svg>
            </summary>
            <div className="absolute top-full left-0 z-30 mt-2 max-h-[70vh] w-72 max-w-[calc(100vw-2.5rem)] overflow-y-auto rounded-xl border border-doc-rule bg-doc-sheet p-1.5 shadow-lg dark:border-grid-dark dark:bg-paper-dark">
              {copyFormats.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => copy(format)}
                  className="block w-full rounded-md px-3 py-2.5 text-left text-sm hover:bg-doc-rule/40 dark:hover:bg-grid-dark"
                >
                  Copy as {format.toLowerCase()}
                </button>
              ))}
              <a
                href={markdownPath}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md px-3 py-2.5 text-sm hover:bg-doc-rule/40 dark:hover:bg-grid-dark"
              >
                View as Markdown ↗
              </a>
              <div className="my-1 border-doc-rule border-t dark:border-grid-dark" />
              {assistants.map((assistant) => (
                <a
                  key={assistant.name}
                  href={assistant.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md px-3 py-2.5 text-sm hover:bg-doc-rule/40 dark:hover:bg-grid-dark"
                >
                  <span className="block">Open in {assistant.name} ↗</span>
                  <span className="mt-0.5 block text-doc-muted text-xs dark:text-ink-dark/50">Ask about this page</span>
                </a>
              ))}
            </div>
          </details>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono-display text-doc-muted text-xs dark:text-ink-dark/50">
          <a href="/llms-full.txt" className="underline underline-offset-4">
            LLM docs ↗
          </a>
          <a href="/schema.json" className="underline underline-offset-4">
            JSON Schema ↗
          </a>
        </div>
      </div>
      <p role="status" className="docs-feedback mt-2 min-h-4 text-doc-muted text-xs dark:text-ink-dark/60">
        {status}
      </p>
    </div>
  );
}
