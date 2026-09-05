import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded border border-grid px-2 py-1 font-mono-display text-[11px] text-ink/60 uppercase tracking-wide transition hover:border-plotter-blue hover:text-plotter-blue dark:border-grid-dark dark:text-ink-dark/60"
    >
      {copied ? 'copied' : 'copy'}
    </button>
  );
}
