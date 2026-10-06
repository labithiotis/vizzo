import { chartExamples } from '~/chartExamples';
import { ChartImage } from './ChartImage';

export function ChartWindow() {
  const example = chartExamples[1];
  if (!example) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-grid bg-paper shadow-[0_32px_64px_-24px_rgb(27_77_255_/_0.25)] dark:border-grid-dark dark:bg-paper-dark dark:shadow-[0_32px_64px_-24px_rgb(0_0_0_/_0.6)]">
      <div className="flex items-center gap-3 border-grid border-b px-4 py-2.5 dark:border-grid-dark">
        <div className="landing-window-dots flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
          <span className="size-2 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
          <span className="size-2 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
        </div>
        <p className="font-mono-display text-ink/40 text-xs dark:text-ink-dark/40">
          {example.id}.json → {example.id}.png
        </p>
      </div>
      <div className="landing-chart-image">
        <ChartImage example={example} loading="eager" />
      </div>
      <p
        className="vizzo-rise border-grid border-t px-4 py-2.5 font-mono-display text-ink/50 text-xs dark:border-grid-dark dark:text-ink-dark/50"
        data-enter-delay="350"
      >
        Rendered by the Vizzo API
      </p>
    </div>
  );
}
