const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const REVENUE = [42, 58, 76, 64, 81, 93];
const COSTS = [30, 34, 40, 38, 44, 50];

const WIDTH = 320;
const HEIGHT = 176;
const PAD = { top: 14, right: 12, bottom: 24, left: 12 };
const PLOT_WIDTH = WIDTH - PAD.left - PAD.right;
const PLOT_HEIGHT = HEIGHT - PAD.top - PAD.bottom;
const GRID_LINES = [0.25, 0.5, 0.75];

function scale(values: readonly number[], min: number, max: number) {
  const span = max - min || 1;
  return values.map((value, index) => ({
    x: PAD.left + (index / (values.length - 1)) * PLOT_WIDTH,
    y: PAD.top + (1 - (value - min) / span) * PLOT_HEIGHT,
  }));
}

function toPolyline(points: { x: number; y: number }[]) {
  return points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

export function ChartWindow() {
  const min = Math.min(...REVENUE, ...COSTS);
  const max = Math.max(...REVENUE, ...COSTS);
  const revenue = scale(REVENUE, min, max);
  const costs = scale(COSTS, min, max);
  const revenueEnd = revenue.at(-1);
  const costsEnd = costs.at(-1);

  return (
    <div className="overflow-hidden rounded-xl border border-grid bg-paper shadow-[0_32px_64px_-24px_rgb(27_77_255_/_0.25)] dark:border-grid-dark dark:bg-paper-dark dark:shadow-[0_32px_64px_-24px_rgb(0_0_0_/_0.6)]">
      <div className="flex items-center gap-3 border-grid border-b px-4 py-2.5 dark:border-grid-dark">
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
          <span className="size-2 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
          <span className="size-2 rounded-full bg-ink/15 dark:bg-ink-dark/20" />
        </div>
        <p className="font-mono-display text-[11px] text-ink/40 dark:text-ink-dark/40">
          revenue.json <span className="text-ink/25 dark:text-ink-dark/25">→</span> revenue.png
        </p>
      </div>
      <div className="px-5 pt-5 pb-4">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true" className="w-full">
          {GRID_LINES.map((fraction) => {
            const y = PAD.top + fraction * PLOT_HEIGHT;
            return (
              <line
                key={fraction}
                x1={PAD.left}
                y1={y}
                x2={WIDTH - PAD.right}
                y2={y}
                strokeWidth="1"
                className="stroke-grid dark:stroke-grid-dark"
              />
            );
          })}
          <polyline
            points={toPolyline(costs)}
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="vizzo-trace stroke-plotter-green"
            style={{ animationDelay: '0.5s' }}
          />
          <polyline
            points={toPolyline(revenue)}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="vizzo-trace stroke-plotter-blue"
          />
          {revenueEnd ? (
            <circle
              cx={revenueEnd.x}
              cy={revenueEnd.y}
              r="3"
              className="vizzo-dot fill-plotter-blue"
              style={{ animationDelay: '1.8s' }}
            />
          ) : null}
          {costsEnd ? (
            <circle
              cx={costsEnd.x}
              cy={costsEnd.y}
              r="3"
              className="vizzo-dot fill-plotter-green"
              style={{ animationDelay: '2.3s' }}
            />
          ) : null}
          {MONTHS.map((month, index) => (
            <text
              key={month}
              x={PAD.left + (index / (MONTHS.length - 1)) * PLOT_WIDTH}
              y={HEIGHT - 6}
              textAnchor="middle"
              className="fill-ink/35 font-mono-display text-[8px] uppercase dark:fill-ink-dark/35"
            >
              {month}
            </text>
          ))}
        </svg>
        <div className="mt-1 flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-mono-display text-[10px] text-ink/50 uppercase tracking-wide dark:text-ink-dark/50">
            <span className="size-1.5 rounded-full bg-plotter-blue" /> Revenue
          </span>
          <span className="flex items-center gap-1.5 font-mono-display text-[10px] text-ink/50 uppercase tracking-wide dark:text-ink-dark/50">
            <span className="size-1.5 rounded-full bg-plotter-green" /> Costs
          </span>
        </div>
      </div>
    </div>
  );
}
