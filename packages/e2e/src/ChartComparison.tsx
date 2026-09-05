import { Chart } from '@tanstack/charts/react';
import { hydrateDefinition } from '@vizzo/core/hydrate';
import type { ChartDefinitionInput } from '@vizzo/schemas';
import { CHART_SIZE } from './size.ts';

export type ComparisonMode = 'side-by-side' | 'overlay';

export type ChartComparisonProps = {
  name: string;
  definition: ChartDefinitionInput;
  baseline: string;
  mode: ComparisonMode;
};

/**
 * The left pane is TanStack Charts drawing into the DOM; the right pane is the
 * PNG the CLI produced from the same JSON. `hydrateDefinition` returns a static
 * definition, which the DOM component accepts as the non-interactive case.
 */
export function ChartComparison({ name, definition, baseline, mode }: ChartComparisonProps) {
  const chart = hydrateDefinition(definition) as Parameters<typeof Chart>[0]['definition'];

  if (mode === 'overlay') {
    return (
      <figure style={styles.figure}>
        <figcaption style={styles.caption}>{name} — browser over PNG, differences glow</figcaption>
        <div style={{ ...styles.pane, ...styles.overlay }}>
          <img alt={`${name} rendered by vizzo`} src={baseline} {...CHART_SIZE} style={styles.image} />
          <div style={styles.overlayChart}>
            <Chart ariaLabel={`${name} rendered by TanStack Charts`} definition={chart} {...CHART_SIZE} />
          </div>
        </div>
      </figure>
    );
  }

  return (
    <figure style={styles.figure}>
      <figcaption style={styles.caption}>{name}</figcaption>
      <div style={styles.row}>
        <div style={styles.pane}>
          <span style={styles.label}>TanStack Charts, in the browser</span>
          <Chart ariaLabel={`${name} rendered by TanStack Charts`} definition={chart} {...CHART_SIZE} />
        </div>
        <div style={styles.pane}>
          <span style={styles.label}>vizzo PNG</span>
          <img alt={`${name} rendered by vizzo`} src={baseline} {...CHART_SIZE} style={styles.image} />
        </div>
      </div>
    </figure>
  );
}

const styles = {
  figure: { margin: 0, padding: 24, display: 'grid', gap: 12 },
  caption: { fontSize: 13, fontWeight: 600, color: '#0f172a' },
  row: { display: 'flex', flexWrap: 'wrap', gap: 24 },
  pane: { display: 'grid', gap: 8, border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, background: '#fff' },
  label: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, color: '#64748b' },
  image: { display: 'block', width: CHART_SIZE.width, height: CHART_SIZE.height },
  overlay: { position: 'relative', width: CHART_SIZE.width, height: CHART_SIZE.height },
  overlayChart: { position: 'absolute', inset: 12, mixBlendMode: 'difference' },
} satisfies Record<string, React.CSSProperties>;
