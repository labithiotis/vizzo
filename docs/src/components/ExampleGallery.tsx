import { Link } from '@tanstack/react-router';
import { chartExamples } from '~/chartExamples';
import { ChartImage } from './ChartImage';

export function ExampleGallery() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {chartExamples.map((example, index) => (
        <Link
          key={example.id}
          to="/docs/$page"
          params={{ page: 'examples' }}
          hash={example.id}
          aria-label={`View ${example.title} chart example`}
          data-reveal
          data-reveal-delay={index * 70}
          className="landing-card overflow-hidden rounded-lg border border-grid bg-paper dark:border-grid-dark dark:bg-paper-dark"
        >
          <figure>
            <div className="h-1" style={{ background: example.accent }} />
            <ChartImage example={example} />
            <figcaption className="flex items-center justify-between gap-2 border-grid border-t px-3 py-2 dark:border-grid-dark">
              <span className="font-mono-display text-ink/70 text-xs uppercase tracking-wide dark:text-ink-dark/70">
                {example.mark}
              </span>
              <span className="inline-flex items-center gap-2 font-mono-display text-plotter-blue text-xs">
                View example{' '}
                <span aria-hidden="true" className="landing-arrow">
                  →
                </span>
              </span>
            </figcaption>
          </figure>
        </Link>
      ))}
    </div>
  );
}
