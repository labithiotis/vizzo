import { createFileRoute } from '@tanstack/react-router';
import { ChartWindow } from '~/components/ChartWindow';
import { ExampleGallery } from '~/components/ExampleGallery';
import { FeatureList } from '~/components/FeatureList';
import { GithubMark } from '~/components/GithubMark';
import { Squiggle } from '~/components/Squiggle';
import { Terminal } from '~/components/Terminal';

export const Route = createFileRoute('/')({
  component: Home,
});

const RENDER_COMMAND = 'npx vizzo chart.json chart.png';

const CLI_LINES = [
  '$ npx vizzo chart.json',
  '$ npx vizzo chart.json chart.png',
  '$ cat chart.json | npx vizzo > chart.svg',
  '$ npx vizzo \'{"definition":{...}}\'',
  '$ npx vizzo chart.json --width 1200 --height 630',
  '$ npx vizzo chart.json --format png',
  '$ npx vizzo chart.json --theme dark',
  '$ npx vizzo ./charts/*.json',
];

const TYPESCRIPT_EXAMPLE_LINES = [
  "import { render } from 'vizzo';",
  '',
  'const result = await render({',
  '  definition,',
  '  width: 1200,',
  '  height: 630,',
  "  format: 'png',",
  '});',
];

function Home() {
  return (
    <main>
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-12rem] left-[-8rem] -z-10 size-[28rem] rounded-full bg-plotter-blue/20 blur-[100px] dark:bg-plotter-blue/25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-6rem] right-[-10rem] -z-10 size-[26rem] rounded-full bg-plotter-red/15 blur-[110px] dark:bg-plotter-red/20"
        />
        <header className="mx-auto grid max-w-6xl gap-12 px-6 pt-20 pb-20 sm:pt-28 sm:pb-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="vizzo-rise font-mono-display text-plotter-blue text-xs uppercase tracking-widest">
              SVG · PNG · WebP — no browser, no react
            </p>
            <h1 className="vizzo-rise mt-5 max-w-xl font-mono-display text-6xl leading-[1.02] tracking-tighter sm:text-7xl">
              Render charts,
              <br />
              <span className="relative inline-block text-plotter-blue">
                anywhere
                <Squiggle className="absolute -bottom-3 left-0 h-3 w-full text-plotter-green" />
              </span>
            </h1>
            <p
              className="vizzo-rise mt-8 max-w-lg text-ink/70 text-lg leading-relaxed dark:text-ink-dark/70"
              style={{ animationDelay: '0.1s' }}
            >
              Vizzo is a lightweight CLI and SDK that turns a{' '}
              <a
                href="https://ggplot2.tidyverse.org/"
                className="text-plotter-blue underline underline-offset-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                Grammar of Graphics
              </a>{' '}
              definition into pixels. Built so agents, bots, and CI can ship a chart without a browser in the loop.
            </p>
            <div className="vizzo-rise mt-9 max-w-xl" style={{ animationDelay: '0.2s' }}>
              <Terminal lines={[`$ ${RENDER_COMMAND}`]} copyText={RENDER_COMMAND} title="terminal" />
            </div>
            <div className="vizzo-rise mt-5 flex flex-wrap items-center gap-4" style={{ animationDelay: '0.3s' }}>
              <a
                href="https://github.com/vizzo/vizzo"
                className="flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 font-mono-display text-paper text-xs uppercase tracking-wide transition hover:opacity-85 dark:bg-paper dark:text-ink"
              >
                <GithubMark className="size-3.5" />
                GitHub
              </a>
              <p className="font-mono-display text-ink/50 text-xs dark:text-ink-dark/50">
                No install — also <code className="text-ink/70 dark:text-ink-dark/70">bunx vizzo</code> or{' '}
                <code className="text-ink/70 dark:text-ink-dark/70">pnpm dlx vizzo</code>
              </p>
            </div>
          </div>
          <div className="vizzo-rise" style={{ animationDelay: '0.15s' }}>
            <ChartWindow />
          </div>
        </header>
      </div>

      <section className="mx-auto max-w-6xl border-grid p-6 dark:border-grid-dark">
        <h2 className="font-mono-display text-ink/50 text-xs uppercase tracking-widest dark:text-ink-dark/50">
          Why Vizzo
        </h2>
        <div className="mt-6 max-w-3xl">
          <FeatureList />
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-grid p-6 dark:border-grid-dark">
        <h2 className="font-mono-display text-ink/50 text-xs uppercase tracking-widest dark:text-ink-dark/50">
          Examples
        </h2>
        <div className="mt-6">
          <ExampleGallery />
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-grid p-6 dark:border-grid-dark">
        <h2 className="font-mono-display text-ink/50 text-xs uppercase tracking-widest dark:text-ink-dark/50">CLI</h2>
        <div className="mt-6">
          <Terminal lines={CLI_LINES} title="terminal" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-grid p-6 dark:border-grid-dark">
        <h2 className="font-mono-display text-ink/50 text-xs uppercase tracking-widest dark:text-ink-dark/50">
          TypeScript example
        </h2>
        <div className="mt-6 max-w-xl">
          <Terminal lines={TYPESCRIPT_EXAMPLE_LINES} title="render.ts" />
        </div>
      </section>

      <footer className="mx-auto max-w-6xl border-grid p-6 dark:border-grid-dark">
        <p className="font-mono-display text-ink/50 text-xs dark:text-ink-dark/50">
          MIT licensed.{' '}
          <a href="https://github.com/vizzo/vizzo" className="text-plotter-blue underline underline-offset-4">
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
