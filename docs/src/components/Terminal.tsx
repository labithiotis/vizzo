import { CopyButton } from './CopyButton';

export function Terminal({ lines, copyText, title }: { lines: readonly string[]; copyText?: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-grid bg-paper dark:border-grid-dark dark:bg-paper-dark">
      {title ? (
        <div className="flex items-center gap-3 border-grid border-b px-4 py-2 dark:border-grid-dark">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
            <span className="size-2 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
            <span className="size-2 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
          </div>
          <p className="font-mono-display text-[11px] text-ink/40 dark:text-ink-dark/40">{title}</p>
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-3 px-4 py-3 font-mono-display text-[13px] leading-6">
        <pre className="overflow-x-auto whitespace-pre-wrap break-all">{lines.join('\n')}</pre>
        {copyText ? <CopyButton text={copyText} /> : null}
      </div>
    </div>
  );
}
