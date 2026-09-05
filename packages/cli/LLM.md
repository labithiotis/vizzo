# Vizzo for LLMs

Vizzo renders a [TanStack Charts](https://tanstack.com/charts) definition to
SVG, PNG, or WebP. No browser, no Playwright, no Canvas — it runs cold in a
CI job, a Discord bot, or a tool call.

This file is the complete reference for producing charts with Vizzo. Everything
here is verified against the current implementation.

- **Input**: one JSON object (a *chart file*), from a path, a positional
  string, or stdin.
- **Output**: an image, to a file or stdout.
- **Vizzo is not a chart grammar.** `marks[].type` and `marks[].options` are
  the literal TanStack Charts function names and option names. Vizzo only gives
  them a JSON encoding so a chart can be described without executing
  JavaScript. Anything that requires a function value (accessors, curves,
  tick formatters) cannot be expressed — see [Limits](#limits).

## Grammar of graphics

TanStack Charts — and so Vizzo's JSON encoding of it — is built from
[Observable Plot](https://observablehq.com/plot/)-style
[grammar of graphics](https://tanstack.com/charts/latest/docs/concepts/grammar-of-graphics)
concepts. Knowing these six pieces is what lets you compose a chart you've
never seen an example of, instead of only ever copying a recipe:

| Concept | What it is | Where it lives in the JSON |
| --- | --- | --- |
| **Data** | The rows a mark consumes — one array per mark, no shared "series" container | `marks[].data` |
| **Marks** | The geometric form — line, bar, area, dot, rule, pie | `marks[].type` |
| **Channels** | Mappings *from a data field* to position, grouping, color, radius, or identity | `marks[].options.x` / `.y` / `.z` / `.color` / `.r` / `.key`, each set to a **field name string** |
| **Scales** | How semantic values (numbers, categories, dates) become pixel coordinates | `definition.x.scale` / `definition.y.scale` |
| **Guides** | Axes, ticks, grid lines, titles, legends — how the scales get explained | `definition.x`/`y` (`grid`, `label`, `axis`), `definition.color.legend` |
| **Layers** | Marks drawn together, in declaration order — later marks paint over earlier ones | the order of the `marks` array |

The one distinction that matters most: **a channel is a field name, a style
option is a constant.** `"x": "month"` reads the `month` field from every row;
`"stroke": "#2563eb"` paints every row the same color regardless of its data.
Mixing these up — passing a literal value where a field name belongs, or vice
versa — is the source of most malformed charts (see
[Troubleshooting](#troubleshooting)).

A chart is composed by picking marks (what geometry), giving each one data and
channels (what it draws and from where), choosing scales for the channels that
need one (how values become pixels), and optionally layering guides on top
(how the mapping gets explained to a reader). Everything below is the literal
vocabulary for each of those five decisions.

## CLI

```
vizzo <file|json> [output] [options]
```

```bash
vizzo chart.json                     # SVG to stdout
vizzo chart.json chart.png           # write a file; format from the extension
vizzo chart.json -o chart.png        # same thing
cat chart.json | vizzo chart.png     # read stdin, write a file
cat chart.json | vizzo > chart.svg   # read stdin, write stdout
vizzo '{"definition":{...}}'         # inline JSON
vizzo ./charts/*.json                # batch: each file -> <name>.<format>
```

Argument rules:

- A positional starting with `{` is treated as inline JSON; anything else is a
  file path or glob.
- A trailing positional ending in `.svg`, `.png`, or `.webp` is the output
  path. (Inputs are always JSON, outputs always images, so they never collide.)
- No positional input and piped stdin reads the chart from stdin.
- Passing both a positional output and `--output` is an error.
- Batch mode (more than one input) derives each output path from the input
  name and cannot be combined with a single explicit output.

| Option | Short | Meaning |
| --- | --- | --- |
| `--output <path>` | `-o` | Write to a file instead of stdout |
| `--width <px>` | `-w` | Chart width (default `960`) |
| `--height <px>` | `-h` | Chart height (default `540`) |
| `--format <fmt>` | `-f` | `svg` \| `png` \| `webp` (default `svg`, or inferred from the output extension) |
| `--theme <name>` | `-t` | `light` \| `dark` |
| `--preset <name>` | `-p` | `og` (1200×630) \| `twitter` (1200×675) \| `linkedin` (1200×627) \| `discord` (1200×630) |
| `--background <css>` | | Raster background color, PNG/WebP only |
| `--help` | | Usage (`-h` alone also means help; with other args `-h` is `--height`) |
| `--version` | `-v` | Version |

CLI flags override the same fields in the chart file. Precedence for size is
`--width/--height` → the file's `width`/`height` → a preset (from `--preset`
or the file's `preset`) → `960×540`. An explicit size always beats a preset.

## Chart file

```jsonc
{
  "definition": { /* required — see below */ },
  "width": 960,           // optional, positive integer
  "height": 540,          // optional, positive integer
  "format": "svg",        // optional: svg | png | webp
  "theme": "light",       // optional: light | dark
  "preset": "og",         // optional: og | twitter | linkedin | discord
  "background": "#ffffff" // optional, raster only
}
```

### definition

```jsonc
{
  "marks": [ /* required, at least one — see Marks */ ],
  "x": { /* axis */ },    // omit for pie; null only if no mark uses x
  "y": { /* axis */ },
  "color": { /* color scale + legend */ },
  "margin": 4,            // number, or { "top": 20, "right": 20, "bottom": 40, "left": 50 }
  "guides": true,         // false hides axes, ticks, grids, legends
  "clip": true,           // clip marks to the plot area
  "theme": { /* per-chart theme overrides */ }
}
```

### Axes (`x`, `y`)

```jsonc
{
  "scale": "linear",  // linear | band | point | ordinal | utc  (default linear)
  "padding": 0.2,     // band/point only, 0–1
  "nice": true,       // round the domain to friendly bounds
  "grid": true,       // draw grid lines
  "label": "Revenue", // axis title
  "axis": false       // hide this axis but keep the scale
}
```

Scale choice:

| Scale | Use for |
| --- | --- |
| `linear` | numbers — any quantitative axis |
| `band` | categories with width — **bar charts** |
| `point` | categories without width — line/area/dot over categories |
| `ordinal` | discrete categories mapped to discrete positions |
| `utc` | dates/times |

With `"scale": "utc"`, string or numeric values in that channel's field are
converted to `Date` automatically, so `"2024-01-01"` just works.

### color

```jsonc
{
  "domain": ["EU", "US"],            // category order
  "range": ["#2563eb", "#dc2626"],   // colors for that order
  "legend": true                     // or { "label": "Region" }
}
```

Set a mark's `color` channel to a field name to split it into colored series.
Without `range`, colors come from the theme palette.

### theme

`--theme light|dark` applies a preset; `definition.theme` overrides individual
keys on top of it.

```jsonc
{
  "foreground": "#0f172a",  // text and axis lines
  "muted": "#64748b",       // secondary text
  "grid": "#e2e8f0",        // grid lines
  "background": "#ffffff",
  "palette": ["#2563eb", "#dc2626", "#16a34a", "#d97706", "#7c3aed", "#0891b2"]
}
```

Dark preset: foreground `#f8fafc`, muted `#94a3b8`, grid `#334155`,
background `#0f172a`, palette `#60a5fa #f87171 #4ade80 #fbbf24 #a78bfa #22d3ee`.

## Marks

Every mark is `{ "type": ..., "data": [...], "options": {...} }`. `data` is an
array of row objects (or bare values for `ruleX`/`ruleY`). Each mark carries
its own `data`, so layers may use different rows.

**Channels** map a data field to a visual property: give the field *name* as a
string (`"x": "month"`). **Style options** take constants (`"stroke": "#2563eb"`,
`"strokeWidth": 2`). Marks render in array order — context first, annotations last.

> **The single most common failure:** a channel naming a field that does not
> exist in `data` renders an empty chart with no error. Channel values must
> match the row keys exactly.

### lineY / lineX

`lineY` plots a value over x; `lineX` plots a value over y.

`x`, `y`, `z`, `color`, `key`, `stroke`, `strokeOpacity`, `strokeWidth`,
`strokeDasharray`, `points`, `id`

- `z` splits rows into separate lines (one line per distinct value).
- `color` colors by field; usually set to the same field as `z`.
- `points: true` draws a dot at each datum.

### areaY

`x`, `y`, `y1`, `y2`, `z`, `color`, `key`, `fill`, `fillOpacity`, `stroke`,
`strokeWidth`, `layout`, `id`

- `y1`/`y2` draw a band instead of filling to zero.
- `layout` accepts a stack — see [Stacking](#stacking-and-grouping).

### barY / barX

`barY` is vertical (categorical `x`, numeric `y`); `barX` is horizontal
(numeric `x`, categorical `y`).

`x`, `y`, `y1`/`y2` (`barY`) or `x1`/`x2` (`barX`), `z`, `color`, `key`,
`fill`, `fillOpacity`, `stroke`, `strokeOpacity`, `strokeWidth`,
`strokeDasharray`, `layout`, `inset`, `maxThickness`, `radius`, `id`

- Use `band` for the categorical axis (`point` gives bars no width).
- `radius` rounds corners; `inset` trims both categorical edges;
  `maxThickness` caps painted thickness in pixels.

### dot

Scatter and bubble charts.

`x`, `y`, `z`, `color`, `key`, `r`, `fill`, `fillOpacity`, `stroke`,
`strokeOpacity`, `strokeWidth`, `id`

- `r` is a constant radius (`"r": 4`) or a **field name** for bubble sizing
  (`"r": "accounts"`).

### ruleY / ruleX

Reference lines. `data` is an array of bare values — `[20]` or `["Feb"]`.

`y` (`ruleY`) or `x` (`ruleX`), `color`, `stroke`, `strokeOpacity`,
`strokeWidth`, `strokeDasharray`, `id`

With bare values in `data` you can omit the channel entirely.

### pie

Pie and donut charts, via TanStack's polar marks.

`value` (**required**, field name of the numeric size), `color` (field name for
slice color, defaults to `value`), `key` (identity, defaults to `color`),
`innerRadius` (0 = pie, >0 = donut), `cornerRadius`, `radiusRatio`
(default `0.82`), `inset` (default `8`)

**A pie chart is polar, not cartesian.** If any mark is `pie`, Vizzo renders
*only* that pie and ignores `x`, `y`, `margin`, `guides`, `clip`, and every
other mark. Never mix `pie` with cartesian marks; `color` and `theme` still apply.

### Stacking and grouping

`barY`, `barX`, and `areaY` accept a `layout` object. Combine it with `z` (and
usually `color`) to define the series.

```jsonc
"layout": { "type": "stack" }
"layout": { "type": "stack", "offset": "normalize" }   // 100% stacked
"layout": { "type": "group", "padding": 0.1 }          // side-by-side bars
```

Stack options: `order` (`input` | `ascending` | `descending` | `inside-out`, or
an explicit array of series keys), `offset` (`diverging` | `normalize` |
`center` | `wiggle`), `reverse`, `anchor` (`{ "series": key, "fraction": 0–1 }`).
Group options: `padding`.

## Recipes

Each is a complete chart file. Render with `vizzo chart.json out.svg`.

**Line chart**

```json
{
  "definition": {
    "marks": [
      {
        "type": "lineY",
        "data": [{ "month": "Jan", "revenue": 42000 }, { "month": "Feb", "revenue": 51000 }],
        "options": { "x": "month", "y": "revenue", "stroke": "#2563eb", "strokeWidth": 2, "points": true }
      }
    ],
    "x": { "scale": "point", "label": "Month" },
    "y": { "scale": "linear", "nice": true, "grid": true, "label": "Revenue" }
  }
}
```

**Multi-series line with a legend** — one mark, `z` splits the series.

```json
{
  "definition": {
    "marks": [
      {
        "type": "lineY",
        "data": [
          { "week": "W1", "downloads": 120, "package": "core" },
          { "week": "W2", "downloads": 310, "package": "core" },
          { "week": "W1", "downloads": 60, "package": "cli" },
          { "week": "W2", "downloads": 205, "package": "cli" }
        ],
        "options": { "x": "week", "y": "downloads", "z": "package", "color": "package", "strokeWidth": 2.5 }
      }
    ],
    "x": { "scale": "point", "label": "Week" },
    "y": { "scale": "linear", "nice": true, "grid": true, "label": "Downloads" },
    "color": { "legend": { "label": "Package" } }
  }
}
```

**Bar chart** — categorical axis is `band`.

```json
{
  "definition": {
    "marks": [
      {
        "type": "barY",
        "data": [{ "letter": "A", "frequency": 0.08167 }, { "letter": "E", "frequency": 0.12702 }],
        "options": { "x": "letter", "y": "frequency", "fill": "#16a34a", "radius": 2 }
      }
    ],
    "x": { "scale": "band", "padding": 0.12, "label": "Letter" },
    "y": { "scale": "linear", "nice": true, "grid": true, "label": "Frequency" }
  }
}
```

**Stacked bars** — swap `layout` for `{ "type": "group", "padding": 0.1 }` to
group side-by-side, or add `"offset": "normalize"` for 100% stacked.

```json
{
  "definition": {
    "marks": [
      {
        "type": "barY",
        "data": [
          { "quarter": "Q1", "revenue": 120, "region": "EU" },
          { "quarter": "Q2", "revenue": 180, "region": "EU" },
          { "quarter": "Q1", "revenue": 90, "region": "US" },
          { "quarter": "Q2", "revenue": 140, "region": "US" }
        ],
        "options": { "x": "quarter", "y": "revenue", "z": "region", "color": "region", "layout": { "type": "stack" } }
      }
    ],
    "x": { "scale": "band", "padding": 0.2 },
    "y": { "scale": "linear", "nice": true, "grid": true },
    "color": { "legend": true }
  }
}
```

**Horizontal bars** — `barX`, with the categorical axis on `y`.

```json
{
  "definition": {
    "marks": [
      {
        "type": "barX",
        "data": [{ "name": "alpha", "count": 30 }, { "name": "beta", "count": 80 }],
        "options": { "x": "count", "y": "name", "fill": "#2563eb", "radius": 3 }
      }
    ],
    "x": { "scale": "linear", "nice": true, "grid": true },
    "y": { "scale": "band", "padding": 0.2 }
  }
}
```

**Area with a line on top** — layers render in order.

```json
{
  "definition": {
    "marks": [
      {
        "type": "areaY",
        "data": [{ "day": "Mon", "users": 120 }, { "day": "Tue", "users": 156 }],
        "options": { "x": "day", "y": "users", "fill": "#0891b2", "fillOpacity": 0.25 }
      },
      {
        "type": "lineY",
        "data": [{ "day": "Mon", "users": 120 }, { "day": "Tue", "users": 156 }],
        "options": { "x": "day", "y": "users", "stroke": "#0891b2", "strokeWidth": 2 }
      }
    ],
    "x": { "scale": "point", "label": "Day" },
    "y": { "scale": "linear", "nice": true, "grid": true, "label": "Active Users" }
  }
}
```

**Time series** — `utc` converts the date strings for you.

```json
{
  "definition": {
    "marks": [
      {
        "type": "lineY",
        "data": [{ "date": "2024-01-01", "value": 42 }, { "date": "2024-06-01", "value": 69 }],
        "options": { "x": "date", "y": "value", "stroke": "#7c3aed", "points": true }
      }
    ],
    "x": { "scale": "utc", "label": "Month" },
    "y": { "scale": "linear", "nice": true, "grid": true, "label": "Signups" }
  }
}
```

**Scatter / bubble** — `r` as a field name sizes each dot.

```json
{
  "definition": {
    "marks": [
      {
        "type": "dot",
        "data": [
          { "revenue": 10, "retention": 0.5, "accounts": 20, "segment": "SMB" },
          { "revenue": 30, "retention": 0.8, "accounts": 60, "segment": "Enterprise" }
        ],
        "options": { "x": "revenue", "y": "retention", "r": "accounts", "color": "segment", "fillOpacity": 0.7 }
      }
    ],
    "x": { "scale": "linear", "nice": true, "label": "Revenue" },
    "y": { "scale": "linear", "nice": true, "label": "Retention" },
    "color": { "legend": true }
  }
}
```

**Threshold annotation** — `ruleY`/`ruleX` take bare values.

```json
{
  "definition": {
    "marks": [
      {
        "type": "lineY",
        "data": [{ "month": "Jan", "latency": 180 }, { "month": "Feb", "latency": 260 }],
        "options": { "x": "month", "y": "latency", "stroke": "#2563eb" }
      },
      { "type": "ruleY", "data": [200], "options": { "stroke": "#dc2626", "strokeDasharray": "4 4" } }
    ],
    "x": { "scale": "point" },
    "y": { "scale": "linear", "nice": true, "grid": true, "label": "ms" }
  }
}
```

**Donut** — `innerRadius > 0`. No `x`/`y`, and no other marks.

```json
{
  "definition": {
    "marks": [
      {
        "type": "pie",
        "data": [{ "letter": "E", "frequency": 0.127 }, { "letter": "T", "frequency": 0.091 }],
        "options": { "value": "frequency", "color": "letter", "key": "letter", "innerRadius": 60, "cornerRadius": 4 }
      }
    ],
    "color": { "legend": { "label": "Letter" } }
  }
}
```

**Social card** — `vizzo chart.json card.png -p og -t dark`, or set
`"preset": "og"` and `"theme": "dark"` in the file.

## Limits

Not expressible in JSON, because they require function values:

- Accessor channels (`(row) => row.a / row.b`). Precompute the field in `data`.
- `curve` (line/area interpolation), `states` (hover/focus styles), motion and
  animation options, `rScale`, and the `scale` field of a `group` layout.
- Tick counts and tick formatters. Format numbers in `data` or use `label`.
- Custom scale factories — only the five named scales are available.

Not supported by Vizzo's mark set: text/annotation marks, box plots, hierarchy
marks, regression and other transforms, faceting, and every interactive
feature (tooltips, cursors, focus) — output is a static image.

Vizzo also does no data preparation. Aggregate, filter, sort, and bin before
handing rows to a mark.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Chart renders but is empty | A channel names a field that isn't in `data`. Check spelling against the row keys. |
| `invalid_value` listing mark names | `marks[].type` isn't one of the nine supported marks. |
| `too_small` on `marks` | `marks` must have at least one entry. |
| `Chart scale "y" cannot be null when a mark materializes its channel` | `"y": null` while a mark uses `y`. Use `"axis": false` to hide the axis instead. |
| `A "pie" mark requires a string "value" option naming the numeric field.` | Add `"value": "<field>"` to the pie's options. |
| Bars are hairlines | The categorical axis is `point`; use `band`. |
| Cartesian marks vanished | A `pie` mark is present, so only the pie renders. |
| PNG has a transparent background | Pass `--background '#ffffff'`. |

## Node SDK

```ts
import { render } from 'vizzo';

const result = await render({
  definition,       // the same object as the file's `definition`
  width: 1200,
  height: 630,
  format: 'png',    // 'svg' | 'png' | 'webp'
  theme: 'dark',
  preset: 'og',
  background: '#ffffff',
});

// result: { format, width, height, data: string (svg) | Uint8Array (png/webp) }
```
