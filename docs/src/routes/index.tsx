import { env } from 'cloudflare:workers';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ExampleGallery } from '~/components/ExampleGallery';
import { FeatureList } from '~/components/FeatureList';
import { HomeHero } from '~/components/HomeHero';
import { renderRequest } from '~/render';

export const Route = createFileRoute('/')({
  component: Home,
  server: {
    handlers: {
      POST: ({ request }) => renderRequest(request, env.RENDER_RATE_LIMIT),
      OPTIONS: ({ request }) => renderRequest(request, env.RENDER_RATE_LIMIT),
    },
  },
});

function Home() {
  return (
    <main>
      <HomeHero />
      <section className="mx-auto max-w-6xl border-grid p-6 dark:border-grid-dark">
        <h2 className="font-mono-display text-ink/50 text-xs uppercase tracking-widest dark:text-ink-dark/50">
          What you get
        </h2>
        <div className="mt-6 max-w-3xl">
          <FeatureList />
        </div>
      </section>
      <section className="mx-auto max-w-6xl border-grid p-6 dark:border-grid-dark">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-mono-display text-ink/50 text-xs uppercase tracking-widest dark:text-ink-dark/50">
            Examples
          </h2>
          <Link
            to="/docs/$page"
            params={{ page: 'examples' }}
            className="font-mono-display text-plotter-blue text-xs hover:underline"
          >
            Browse chart gallery →
          </Link>
        </div>
        <p className="mt-3 text-ink/60 text-sm dark:text-ink-dark/60">
          Every chart on this site is rendered by the Vizzo API.
        </p>
        <div className="mt-6">
          <ExampleGallery />
        </div>
      </section>
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 border-grid p-6 dark:border-grid-dark">
        <nav aria-label="Documentation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link to="/docs" className="text-plotter-blue hover:underline">
            Quick start
          </Link>
          <Link to="/docs/$page" params={{ page: 'http' }} className="text-plotter-blue hover:underline">
            URL & API
          </Link>
          <Link to="/docs/$page" params={{ page: 'cli' }} className="text-plotter-blue hover:underline">
            CLI guide
          </Link>
        </nav>
        <p className="font-mono-display text-ink/50 text-xs dark:text-ink-dark/50">
          MIT licensed.{' '}
          <a href="https://github.com/labithiotis/vizzo" className="text-plotter-blue underline underline-offset-4">
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
