import { createHighlighter } from '@tanstack/highlight/core';
import { json } from '@tanstack/highlight/languages/json';
import { shell } from '@tanstack/highlight/languages/shell';
import { ts } from '@tanstack/highlight/languages/ts';
import { useEffect, useRef, useState } from 'react';

const highlighter = createHighlighter({ languages: [json, shell, ts] });

export function DocHighlightedCode({ text, language = 'text' }: { text: string; language?: string }) {
  const { tokens } = highlighter.tokenize(text, { lang: language });
  let offset = 0;
  return (
    <code className={`language-${language}`}>
      {tokens.map((token) => {
        const key = offset;
        offset += token.value.length;
        return token.className ? (
          <span key={key} className={`th-${token.className}`}>
            {token.value}
          </span>
        ) : (
          token.value
        );
      })}
    </code>
  );
}

export function DocCopy({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [status, setStatus] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Copied');
    } catch {
      setStatus('Select the text to copy');
    }
    timer.current = setTimeout(() => setStatus(''), 2000);
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span role="status" className={`docs-feedback text-xs ${status ? 'opacity-100' : 'opacity-0'}`}>
        {status}
      </span>
      <button
        type="button"
        onClick={copy}
        className="docs-press shrink-0 rounded-md border border-doc-rule px-3 py-1.5 font-mono-display text-doc-muted text-xs hover:border-plotter-blue hover:text-plotter-blue dark:border-grid-dark dark:text-ink-dark/70"
      >
        {label}
      </button>
    </span>
  );
}

export function DocCode({
  text,
  label,
  wrap = false,
  language = 'text',
}: {
  text: string;
  label: string;
  wrap?: boolean;
  language?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-doc-rule bg-doc-sheet dark:border-grid-dark dark:bg-paper-dark">
      <div className="flex min-h-12 items-center justify-between gap-4 border-doc-rule border-b px-4 dark:border-grid-dark">
        <span className="font-mono-display text-doc-muted text-xs dark:text-ink-dark/60">{label}</span>
        <DocCopy text={text} />
      </div>
      <pre
        className={`docs-code overflow-x-auto p-4 font-mono-display text-xs leading-6 sm:text-sm ${wrap ? 'whitespace-pre-wrap break-all' : ''}`}
      >
        <DocHighlightedCode text={text} language={language} />
      </pre>
    </div>
  );
}
