import { Link, Outlet } from '@tanstack/react-router';
import { docPages } from '~/documentation';
import { GithubMark } from '../GithubMark';

export function DocsLayout() {
  return (
    <div className="min-h-screen bg-doc-canvas text-doc-ink dark:bg-paper-dark dark:text-ink-dark">
      <a
        href="#docs-content"
        className="sr-only z-50 rounded bg-plotter-blue px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-20 border-doc-rule border-b bg-doc-canvas/95 backdrop-blur-sm dark:border-grid-dark dark:bg-paper-dark/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-mono-display font-semibold text-plotter-blue text-xl tracking-tighter">
              vizzo<span className="text-plotter-green">.</span>
            </Link>
            <span className="h-5 border-doc-rule border-l dark:border-grid-dark" />
            <Link to="/docs" className="text-doc-muted text-sm dark:text-ink-dark/60">
              Documentation
            </Link>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="/llms.txt"
              className="font-mono-display text-doc-muted text-xs hover:text-plotter-blue dark:text-ink-dark/60"
            >
              LLMs
            </a>
            <a
              href="https://github.com/labithiotis/vizzo"
              aria-label="Vizzo on GitHub"
              className="text-doc-muted hover:text-plotter-blue dark:text-ink-dark/60"
            >
              <GithubMark className="size-5" />
            </a>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <aside className="border-doc-rule border-b py-5 lg:sticky lg:top-20 lg:h-fit lg:border-0 lg:py-12 dark:border-grid-dark">
          <p className="mb-4 hidden font-mono-display text-doc-muted text-xs uppercase tracking-wider lg:block dark:text-ink-dark/45">
            Render & share
          </p>
          <nav aria-label="Documentation" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-2">
            {docPages.map((page) => (
              <Link
                key={page.slug}
                to={page.slug ? '/docs/$page' : '/docs'}
                params={page.slug ? { page: page.slug } : {}}
                activeOptions={{ exact: true }}
                activeProps={{
                  className: 'bg-plotter-blue/10 text-plotter-blue dark:bg-plotter-blue/20 dark:text-blue-300',
                  'aria-current': 'page',
                }}
                inactiveProps={{
                  className: 'text-doc-muted hover:bg-doc-rule/40 dark:text-ink-dark/65 dark:hover:bg-grid-dark',
                }}
                className="whitespace-nowrap rounded-lg px-3 py-2 text-sm"
              >
                {page.label}
              </Link>
            ))}
          </nav>
          <div className="mt-9 hidden space-y-3 border-doc-rule border-t pt-5 text-doc-muted text-xs lg:block dark:border-grid-dark dark:text-ink-dark/50">
            <p className="font-mono-display">SVG · PNG · WebP</p>
            <p className="leading-5">
              A definition in.
              <br />
              An image out.
            </p>
            <a href="https://tanstack.com/charts" className="inline-block underline underline-offset-4">
              Built on TanStack Charts ↗
            </a>
          </div>
        </aside>
        <main id="docs-content" className="min-w-0 py-9 lg:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
