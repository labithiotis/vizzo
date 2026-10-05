import { chartExamples, type DocPage, docPages } from '~/documentation';
import { ChartSpecimen } from './ChartSpecimen';
import { DocMarkdown } from './DocMarkdown';
import { DocPageActions } from './DocPageActions';

export function DocArticle({ page }: { page: DocPage }) {
  const next = docPages[docPages.findIndex((item) => item.slug === page.slug) + 1];
  const quickstart = page.slug === '';
  const gallery = page.slug === 'examples';
  const firstExample = chartExamples[0];
  return (
    <article className="max-w-4xl">
      <header className="mb-9 max-w-3xl">
        <p className="mb-5 font-mono-display text-plotter-blue text-xs uppercase tracking-widest dark:text-blue-300">
          {quickstart ? 'From definition to conversation' : page.label}
        </p>
        <h1 className="font-mono-display font-semibold text-4xl leading-tight tracking-tighter sm:text-5xl">
          {page.title}
        </h1>
        <p className="mt-5 max-w-2xl text-doc-muted text-lg leading-8 dark:text-ink-dark/65">{page.description}</p>
        <DocPageActions key={page.slug} page={page} />
      </header>
      {quickstart && firstExample ? <ChartSpecimen example={firstExample} /> : null}
      {page.gallerySections ? <DocMarkdown text={page.gallerySections.intro} /> : null}
      {gallery ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {chartExamples.map((example) => (
            <ChartSpecimen key={example.id} example={example} compact />
          ))}
        </div>
      ) : null}
      {gallery ? (
        <details className="mt-10 rounded-xl border border-doc-rule px-5 py-4 dark:border-grid-dark">
          <summary className="cursor-pointer font-medium">Example notes and sharing commands</summary>
          <DocMarkdown text={page.gallerySections?.notes || ''} />
        </details>
      ) : (
        <div className="max-w-3xl">
          <DocMarkdown text={page.markdown} />
        </div>
      )}
      {page.gallerySections ? <DocMarkdown text={page.gallerySections.sharing} /> : null}
      <footer className="mt-12 flex flex-wrap items-center justify-between gap-6 border-doc-rule border-t pt-7 dark:border-grid-dark">
        <p className="font-mono-display text-doc-muted text-xs dark:text-ink-dark/50">
          TanStack Charts in. SVG, PNG, or WebP out.
        </p>
        {next ? (
          <a href={`/docs/${next.slug}`} className="text-plotter-blue text-sm dark:text-blue-300">
            {next.label} →
          </a>
        ) : (
          <a href="/docs/examples" className="text-plotter-blue text-sm dark:text-blue-300">
            Explore more charts →
          </a>
        )}
      </footer>
    </article>
  );
}
