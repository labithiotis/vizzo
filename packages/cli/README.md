# Vizzo

Render TanStack Charts to PNG, SVG, and WebP.

```bash
cat chart.json | vizzo chart.png
```

✓ TanStack-native
✓ No browser
✓ No Playwright
✓ No Canvas
✓ Works in CI
✓ Works in Discord bots
✓ Works with AI agents

Building with an AI agent or coding tool? Point it at [`LLM.md`](LLM.md) — a
single-file reference covering every mark, scale, and option, with
copy-pasteable recipes for each chart type.

Vizzo is a lightweight CLI and SDK that takes a [TanStack Charts](https://tanstack.com/charts)
definition and renders it to SVG, PNG, or WebP — no browser, no Playwright, no
Canvas. It uses TanStack's own chart definition format; it is not another
chart library, grammar, or dashboard builder. See [Non-goals](#non-goals).

## Install

No install needed — run it with `npx`:

```bash
npx vizzo chart.json --output chart.png
```

`bunx vizzo` and `pnpm dlx vizzo` work the same way.

## CLI

```bash
# Render from a file
vizzo chart.json

# Render from stdin
cat chart.json | vizzo > chart.svg

# Render inline JSON
vizzo '{"definition":{...}}'

# Write to a file — as a second argument, --output, or via stdin
vizzo chart.json chart.png
vizzo chart.json --output chart.png
cat chart.json | vizzo chart.png

# Specify dimensions, format, or theme
vizzo chart.json --width 1200 --height 630
vizzo chart.json --format png
vizzo chart.json --theme dark

# Batch rendering
vizzo ./charts/*.json
```

Supported formats: `svg`, `png`, `webp`.

### Chart files

A chart file (or inline JSON argument) is a small JSON envelope around a
TanStack Charts definition:

```json
{
  "definition": {
    "marks": [{ "type": "lineY", "data": [{ "month": "Jan", "revenue": 42000 }], "options": { "x": "month", "y": "revenue" } }],
    "x": { "scale": "point" },
    "y": { "scale": "linear", "grid": true }
  },
  "width": 960,
  "height": 540
}
```

`marks[].type` and `marks[].options` are the exact function name and options
TanStack Charts itself uses (`lineY`, `barY`, `areaY`, `ruleY`, `dot`, `pie`,
and their `X` counterparts) — Vizzo just gives them a JSON encoding so a file
can describe them without executing JavaScript. Axis `scale` accepts
`linear`, `band`, `point`, `ordinal`, or `utc`.

### GitHub Action

```yaml
- uses: vizzo/render-chart
```

### Theming

```bash
vizzo chart.json --theme dark
```

### Social cards

```bash
vizzo chart.json --preset og
```

Presets: `og`, `twitter`, `linkedin`, `discord`.

## TypeScript example

```ts
import { render } from 'vizzo';

const result = await render({
  definition,
  width: 1200,
  height: 630,
  format: 'png',
});
```

```ts
type RenderOptions = {
  definition: unknown;
  width?: number;
  height?: number;
  format?: 'svg' | 'png' | 'webp';
  theme?: 'light' | 'dark';
  preset?: 'og' | 'twitter' | 'linkedin' | 'discord';
  background?: string;
};
```

## Examples

See [`packages/examples/charts`](packages/examples/charts) for the source
definitions and [`examples/`](examples) for their rendered output: line, bar,
area, pie, multi-series, and time-series charts.

## Repository

```txt
vizzo/
├── packages/
│   ├── cli/        the published `vizzo` package (CLI + SDK)
│   ├── core/        render() and the JSON→TanStack Charts hydration layer
│   ├── schemas/     Zod schemas for the chart-file envelope
│   └── examples/    example chart definitions
├── docs/            vizzo.dev (TanStack Start on Cloudflare Workers)
├── examples/        rendered example output
└── .github/
```

## Development

```bash
bun install
bun run check   # lint, format, typecheck, test
```

## Non-goals

Vizzo does not:

- Build another chart library or chart grammar.
- Compete with TanStack Charts.
- Build a dashboard application or a visual editor.

## License

MIT
rary or chart grammar.
- Compete with TanStack Charts.
- Build a dashboard application or a visual editor.

## License

MIT
