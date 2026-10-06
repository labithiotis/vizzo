import { useSyncExternalStore } from 'react';
import type { ChartExample } from '~/chartExamples';

function subscribeTheme(onChange: () => void) {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function currentTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useChartTheme() {
  return useSyncExternalStore(subscribeTheme, currentTheme, () => 'light');
}

export function ChartImage({
  example,
  loading = 'lazy',
}: {
  example: Pick<ChartExample, 'url' | 'darkUrl' | 'title'>;
  loading?: 'lazy' | 'eager';
}) {
  const lightUrl = new URL(example.url);
  const darkUrl = new URL(example.darkUrl);
  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={`${darkUrl.pathname}${darkUrl.search}`} />
      <img
        src={`${lightUrl.pathname}${lightUrl.search}`}
        alt={`${example.title}, rendered by the Vizzo API`}
        width={960}
        height={540}
        className="aspect-video w-full object-contain"
        loading={loading}
      />
    </picture>
  );
}
