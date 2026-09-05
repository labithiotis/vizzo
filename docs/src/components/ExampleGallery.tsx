const EXAMPLES = [
  { file: 'line', label: 'Line', accent: 'bg-plotter-blue' },
  { file: 'bar', label: 'Bar', accent: 'bg-plotter-red' },
  { file: 'area', label: 'Area', accent: 'bg-plotter-green' },
  { file: 'pie', label: 'Pie', accent: 'bg-plotter-blue' },
  { file: 'multi-series', label: 'Multi-series', accent: 'bg-plotter-red' },
  { file: 'time-series', label: 'Time-series', accent: 'bg-plotter-green' },
];

export function ExampleGallery() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {EXAMPLES.map((example) => (
        <figure
          key={example.file}
          className="group overflow-hidden rounded-lg border border-grid bg-paper transition hover:-translate-y-1 hover:border-plotter-blue hover:shadow-xl dark:border-grid-dark dark:bg-paper-dark"
        >
          <div className={`h-1 ${example.accent}`} />
          <img
            src={`/examples/${example.file}.svg`}
            alt={`${example.label} chart rendered by Vizzo`}
            className="aspect-16/9 w-full object-cover transition group-hover:scale-[1.02]"
            loading="lazy"
          />
          <figcaption className="flex items-center justify-between gap-2 border-grid border-t px-3 py-2 dark:border-grid-dark">
            <span className="font-mono-display text-ink/70 text-xs uppercase tracking-wide dark:text-ink-dark/70">
              {example.label}
            </span>
            <code className="truncate font-mono-display text-[11px] text-ink/50 dark:text-ink-dark/50">
              npx vizzo examples/{example.file}.json
            </code>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
