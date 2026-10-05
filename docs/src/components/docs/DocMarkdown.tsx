import { Markdown, type MarkdownComponents } from '@tanstack/markdown/react';
import { Children, isValidElement, type ReactNode } from 'react';
import { chartExamples } from '~/chartExamples';
import { ChartImage } from '../ChartImage';
import { DocCopy } from './DocCode';

function codeText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child);
      return isValidElement<{ children?: ReactNode }>(child) ? codeText(child.props.children) : '';
    })
    .join('');
}

const components: MarkdownComponents = {
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="mt-12 mb-5 scroll-mt-28 font-mono-display font-semibold text-xl tracking-tight sm:text-2xl"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 {...props} className="mt-8 mb-4 scroll-mt-28 font-semibold text-lg">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-4 text-doc-muted text-sm leading-7 sm:text-base dark:text-ink-dark/70">{children}</p>
  ),
  a: ({ children, ...props }) => (
    <a
      {...props}
      className="text-plotter-blue underline decoration-plotter-blue/30 underline-offset-4 hover:decoration-plotter-blue dark:text-blue-300"
    >
      {children}
    </a>
  ),
  code: ({ children, ...props }) => (
    <code
      {...props}
      className="rounded bg-doc-rule/40 px-1 py-0.5 font-mono-display text-[0.85em] text-doc-ink dark:bg-grid-dark dark:text-ink-dark"
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <div className="my-6 overflow-hidden rounded-xl border border-doc-rule bg-doc-sheet dark:border-grid-dark dark:bg-paper-dark">
      <div className="flex justify-end border-doc-rule border-b px-4 py-2 dark:border-grid-dark">
        <DocCopy text={codeText(children)} />
      </div>
      <pre className="overflow-x-auto p-4 font-mono-display text-xs leading-6 sm:text-sm">{children}</pre>
    </div>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-doc-rule dark:border-grid-dark">
      <table className="w-full min-w-lg border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-doc-rule border-b bg-doc-rule/30 px-4 py-3 font-medium text-doc-ink dark:border-grid-dark dark:bg-grid-dark dark:text-ink-dark">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-doc-rule border-b px-4 py-3 text-doc-muted leading-6 last:border-0 dark:border-grid-dark dark:text-ink-dark/70">
      {children}
    </td>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc space-y-2 pl-5 text-doc-muted text-sm leading-7 sm:text-base dark:text-ink-dark/70">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal space-y-2 pl-5 text-doc-muted text-sm leading-7 sm:text-base dark:text-ink-dark/70">
      {children}
    </ol>
  ),
  img: ({ alt, ...props }) => {
    const example = chartExamples.find((item) => item.url === props.src);
    if (example) return <ChartImage example={example} />;
    return (
      <img
        {...props}
        alt={alt || ''}
        className="my-6 aspect-video w-full rounded-xl border border-doc-rule bg-white object-contain dark:border-grid-dark"
        loading="lazy"
        width={960}
        height={540}
      />
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-plotter-blue border-l-2 pl-5">{children}</blockquote>
  ),
};

export function DocMarkdown({ text }: { text: string }) {
  return <Markdown components={components}>{text}</Markdown>;
}
