import { useState } from 'react';
import type { ChartExample } from '~/chartExamples';
import { ChartImage, useChartTheme } from '../ChartImage';
import { DocCode } from './DocCode';

const transports = ['URL', 'CLI', 'POST', 'JSON'];
const codeLanguages: Record<string, string> = { URL: 'text', CLI: 'sh', POST: 'sh', JSON: 'json' };

export function ChartSpecimen({ example, compact = false }: { example: ChartExample; compact?: boolean }) {
  const [transport, setTransport] = useState('URL');
  const theme = useChartTheme();
  const url = theme === 'dark' ? example.darkUrl : example.url;
  const text =
    transport === 'URL'
      ? url
      : transport === 'CLI'
        ? example.command
        : transport === 'POST'
          ? example.post
          : example.json.trimEnd();
  return (
    <section
      id={example.id}
      aria-label={`${example.title} example`}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-doc-rule bg-doc-sheet dark:border-grid-dark dark:bg-paper-dark"
    >
      <div className="flex items-center justify-between gap-3 border-doc-rule border-b px-5 py-3 dark:border-grid-dark">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="size-2 rounded-full" style={{ background: example.accent }} />
          <span className="font-mono-display text-xs">{example.title}</span>
        </div>
        <span className="font-mono-display text-doc-muted text-xs dark:text-ink-dark/60">{example.mark}</span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${example.title} PNG in a new tab`}
        className="block"
      >
        <ChartImage example={example} loading={compact ? 'lazy' : 'eager'} />
      </a>
      <div className="space-y-4 border-doc-rule border-t p-5 dark:border-grid-dark">
        {compact ? (
          <p className="text-doc-muted text-sm leading-6 dark:text-ink-dark/65">{example.description}</p>
        ) : null}
        <p className="text-doc-muted text-xs dark:text-ink-dark/60">
          Rendered by the Vizzo API · follows your device theme
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <fieldset className="flex gap-1">
            <legend className="sr-only">Example format</legend>
            {transports.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={transport === item}
                onClick={() => setTransport(item)}
                className={`rounded-md px-2.5 py-1.5 font-mono-display text-xs ${transport === item ? 'bg-plotter-blue/10 text-plotter-blue dark:bg-plotter-blue/20 dark:text-blue-300' : 'text-doc-muted hover:text-doc-ink dark:text-ink-dark/60 dark:hover:text-ink-dark'}`}
              >
                {item}
              </button>
            ))}
          </fieldset>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-plotter-blue text-xs underline-offset-4 hover:underline dark:text-blue-300"
          >
            Open PNG ↗
          </a>
        </div>
        <DocCode
          key={transport}
          text={text}
          label={
            transport === 'URL'
              ? 'JSURL2 · edit this URL'
              : transport === 'JSON'
                ? `${example.id}.json`
                : transport === 'CLI'
                  ? 'terminal'
                  : 'HTTP POST'
          }
          wrap={transport === 'URL'}
          language={codeLanguages[transport]}
        />
        <a
          href={`/docs/examples/${example.id}.json`}
          download
          className="inline-block text-doc-muted text-xs underline underline-offset-4 dark:text-ink-dark/60"
        >
          Download chart JSON
        </a>
      </div>
    </section>
  );
}
