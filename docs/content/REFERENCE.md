## The render envelope

Vizzo accepts the same envelope through the CLI and HTTP API. The SDK accepts the fields below plus local rendering options such as `font` and `ariaLabel`.

```json
{
  "definition": {
    "marks": [{
      "type": "barY",
      "data": [["A", 4], ["B", 8], ["C", 6]],
      "options": { "x": "0", "y": "1" }
    }],
    "x": { "scale": "band" },
    "y": { "scale": "linear" }
  },
  "width": 960,
  "height": 540,
  "format": "png",
  "theme": "light"
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `definition` | Yes | JSON encoding of TanStack marks, axes, color, margins, and theme |
| `width` | No | Positive integer pixel width |
| `height` | No | Positive integer pixel height |
| `format` | No | `svg`, `png`, or `webp` |
| `theme` | No | Named `light` or `dark` theme |
| `preset` | No | Social image dimensions |
| `background` | No | Raster background color |

The default size is 960 × 540. The CLI and SDK default to SVG; the HTTP API defaults to PNG. An explicit dimension wins over a preset dimension. A CLI flag wins over the matching envelope field. On GET, a query parameter wins over the matching field inside `data`.

## Image formats

| Format | Content type | Use |
| --- | --- | --- |
| PNG | `image/png` | Slack and Discord attachments, tweets, and email images |
| WebP | `image/webp` | Smaller raster files where supported |
| SVG | `image/svg+xml` | Vector output, web pages, and graphics tools |

Vizzo vendors Roboto for raster text. The CLI can use `--font` for a local font file. The public HTTP API uses its bundled font and does not accept a font upload.

## Themes and background

`theme=dark` sets light text, a dark background, and muted grid lines. `theme=light` sets dark text on white. Definition-level theme values override the named theme. Explicit mark colors stay explicit, so choose brighter strokes for a dark chart when needed.

```text
{{line.darkUrl}}
```

For PNG and WebP, `background` fills the raster canvas behind the chart. An opaque named or definition-level theme background covers that canvas. Change `definition.theme.background` to recolor the visible chart background in every format. Encode a literal `#` as `%23` in a query parameter.

`definition.theme` may set `foreground`, `muted`, `grid`, `background`, and `palette`. Use those values when your chart should match a report's palette.

## Social presets

| Preset | Size |
| --- | --- |
| `og` | 1200 × 630 |
| `twitter` | 1200 × 675 |
| `linkedin` | 1200 × 627 |
| `discord` | 1200 × 630 |

Presets only choose dimensions. Attach the result to your post, message, or email. A raw chart URL may not produce a rich social preview on every platform.

## Definition fields

`marks` is required and contains at least one mark. Other definition fields are `x`, `y`, `color`, `margin`, `clip`, `guides`, and `theme`. `margin` accepts a number or an object such as `{ "top": 24, "right": 24, "bottom": 48, "left": 64 }`.

See [chart definitions](/docs/chart-definitions) for supported marks/scales and the JSON-to-TanStack mapping. See [HTTP limits](/docs/http#public-limits-and-errors) for the public endpoint's validation and rate limits.

## Documentation for agents

- [llms.txt](/llms.txt) is a short index of the guides.
- [llms-full.txt](/llms-full.txt) contains the full guides and concrete commands/URLs.
- Every guide has a raw Markdown version, such as [the HTTP guide](/docs/http.md).
- [schema.json](/schema.json) describes the Zod render envelope. HTTP limits are documented separately.
- [Example JSON files](/docs/examples/line.json) contain real, renderable chart definitions.

All exports come from the same Markdown and chart definitions as these pages. An agent can fetch a guide, edit a definition, validate the envelope, and render it with the CLI or API.
