const FEATURES = [
  'Grammar of Graphics',
  'No browser',
  'No Playwright',
  'No Canvas',
  'Works in CI',
  'Works in Discord bots',
  'Works with AI agents',
  'Deterministic output',
];

export function FeatureList() {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {FEATURES.map((feature) => (
        <li
          key={feature}
          className="flex items-center gap-3 rounded-lg border border-grid px-4 py-3 transition hover:-translate-y-0.5 hover:border-plotter-blue hover:shadow-lg dark:border-grid-dark"
        >
          <span
            aria-hidden="true"
            className="flex size-6 shrink-0 items-center justify-center rounded-md bg-plotter-blue/10 font-mono-display text-plotter-blue text-xs dark:bg-plotter-blue/15"
          >
            ✓
          </span>
          <span className="font-mono-display text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  );
}
