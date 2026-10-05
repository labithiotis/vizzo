import { Link } from '@tanstack/react-router';
import { ChartWindow } from './ChartWindow';
import { Squiggle } from './Squiggle';

export function HomeHero() {
  return (
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
            SVG · PNG · WebP
          </p>
          <h1 className="vizzo-rise mt-5 max-w-xl font-mono-display text-5xl leading-[1.02] tracking-tighter sm:text-7xl">
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
            Turn a TanStack Charts definition into an image with a URL, the CLI, or your code. Share charts in Slack,
            Discord, tweets, and email.
          </p>
          <div className="vizzo-rise mt-9 flex flex-wrap gap-4" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/docs"
              className="rounded-md bg-plotter-blue px-4 py-2.5 font-mono-display text-white text-xs uppercase tracking-wide hover:opacity-85"
            >
              Read docs →
            </Link>
            <Link
              to="/docs/$page"
              params={{ page: 'examples' }}
              className="rounded-md border border-grid px-4 py-2.5 font-mono-display text-ink text-xs uppercase tracking-wide hover:border-plotter-blue dark:border-grid-dark dark:text-ink-dark"
            >
              Explore charts →
            </Link>
          </div>
        </div>
        <div className="vizzo-rise" style={{ animationDelay: '0.15s' }}>
          <ChartWindow />
        </div>
      </header>
    </div>
  );
}
