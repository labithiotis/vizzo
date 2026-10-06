## TanStack calls, encoded as JSON

Vizzo uses [TanStack Charts](https://tanstack.com/charts) to build the chart scene. It translates JSON into the library's mark and scale factories. The names and options stay the same.

This TanStack mark call:

```ts
lineY(data, { x: 'month', y: 'revenue', points: true, stroke: '#2563eb' })
```

becomes this JSON mark:

```json
{
  "type": "lineY",
  "data": [{ "month": "Jan", "revenue": 42000 }, { "month": "Feb", "revenue": 58000 }],
  "options": { "x": "month", "y": "revenue", "points": true, "stroke": "#2563eb" }
}
```

Put marks inside `{ "definition": { "marks": [...] } }`, then pass that envelope to a URL, POST, the CLI, or the SDK. JSURL2 changes the transport encoding only.

## Choose a mark

| Mark | Useful for |
| --- | --- |
| `lineY`, `lineX` | Connected trends |
| `areaY` | Filled trends, often layered with a line |
| `barY`, `barX` | Vertical and horizontal comparisons |
| `dot` | Points and scatter plots |
| `ruleY`, `ruleX` | Reference lines and thresholds |
| `pie` | Category proportions; `innerRadius` makes a donut |

Layer multiple marks in one `marks` array. Each mark has its own `data` and `options`. A line over an area, a rule over bars, or dots on a trend uses the same grammar. See [real examples](/docs/examples).

## Pick scales that match the data

| JSON scale | TanStack factory | Use |
| --- | --- | --- |
| `linear` | `scaleLinear()` | Continuous numbers |
| `band` | `scaleBand()` | Bars across categories |
| `point` | `scalePoint()` | Lines or points across categories |
| `ordinal` | `scaleOrdinal()` | Discrete values |
| `utc` | `scaleUtc()` | UTC dates |

Set scales and axis options on `definition.x` and `definition.y`. `padding`, `nice`, `grid`, `label`, and `axis` map to TanStack's axis options. Set an axis to `null` to disable it. ISO date strings become dates for the UTC scale.

```json
{
  "x": { "scale": "point", "label": "Month", "padding": 0.2 },
  "y": { "scale": "linear", "nice": true, "grid": true, "label": "Revenue (USD)" }
}
```

## Group lines and control color

Set `z` to a series field and `color` to that field in the mark options. A color legend can show the series names. A fixed `stroke` or `fill` gives a single mark an explicit color.

```json
{
  "type": "lineY",
  "data": [
    { "week": "W1", "downloads": 120, "package": "core" },
    { "week": "W2", "downloads": 180, "package": "core" },
    { "week": "W1", "downloads": 60, "package": "cli" },
    { "week": "W2", "downloads": 95, "package": "cli" }
  ],
  "options": { "x": "week", "y": "downloads", "z": "package", "color": "package" }
}
```

At definition level, `color.domain` and `color.range` set category/color mappings. `color.legend` accepts `true` or `{ "label": "Package" }`.

## What JSON can express

Field names such as `"x": "month"` become accessors into each row. With array rows, `"x": "0"` selects the first item. Constant options such as `strokeWidth`, `fillOpacity`, and `innerRadius` pass through to the matching mark factory.

JSON cannot contain JavaScript functions, custom callbacks, React components, or interaction handlers. Vizzo supports the marks and scale kinds listed here, not every browser-only TanStack feature. It generates a static scene and serializes that scene to SVG. Resvg rasterizes PNG and WebP.

Use the [JSON Schema](/schema.json) for the envelope and definition shape. Mark `options` follow TanStack's API, so the schema does not enumerate every option or validate every possible TanStack combination. A valid JSON envelope can still fail rendering if the chart options do not form a valid scene.
