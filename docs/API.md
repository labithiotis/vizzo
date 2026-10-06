# Rendering API

Send `POST https://vizzo.dev/` with `Content-Type: application/json` and the same
JSON envelope used by the CLI. The response contains the rendered image bytes.

```sh
curl https://vizzo.dev/ \
  -H 'Content-Type: application/json' \
  --data-binary @chart.json \
  --output chart.png
```

```json
{
  "definition": {
    "marks": [
      {
        "type": "lineY",
        "data": [{ "x": 1, "y": 2 }, { "x": 2, "y": 3 }],
        "options": { "x": "x", "y": "y" }
      }
    ],
    "scales": {
      "x": { "scale": "linear" },
      "y": { "scale": "linear" }
    }
  },
  "width": 1200,
  "height": 630,
  "format": "png"
}
```

For POST, options belong in the JSON body; query parameters are ignored.

| Field | Behavior |
| --- | --- |
| `definition` | Required JSON encoding of a TanStack Charts definition. |
| `width`, `height` | Positive integers, up to 2,000 each. Defaults: 960 × 540. |
| `format` | `png` (default), `svg`, or `webp`. |
| `theme` | Optional `light` or `dark`. |
| `preset` | Optional `og`, `twitter`, `linkedin`, or `discord`. Supplies dimensions when omitted. |
| `background` | Optional raster background color. |

The API uses the existing Vizzo Zod schema with these public limits:

- At most 1 MiB of JSON, measured in bytes.
- At most 10,000 data rows across all marks.
- At most 10 rendering requests per minute per IP across POST and GET, including
  invalid requests.

Cloudflare's rate limiter uses approximate counters local to each Cloudflare
location. Clients sharing an IP share an allowance. This is a throttle, not an
exact global quota.

Successful responses use `image/png`, `image/svg+xml`, or `image/webp` and are
not cached. Browser requests use public CORS. JSON POST requests use
`OPTIONS /` for preflights; GET requests without custom headers need no preflight.
`GET /` continues to serve the website.

## Render from a URL

Send `GET https://vizzo.dev/x?width=200&data=<chart>`. The required `data`
parameter accepts raw JSON, UTF-8 JSON encoded as base64, or
[JSURL2](https://github.com/wmertens/jsurl2). Each encoding represents the same
JSON envelope as the POST body, including `definition`. Optional `width`, `height`, `format`, `theme`, `preset`, and
`background` query parameters override values in that JSON. PNG is the default.
Unknown query parameters are rejected.
Query options use TanStack's JSON-first parsing; repeated scalar parameters are rejected.

JSURL2 keeps the chart's keys and values readable in the URL. This example
renders a line chart; edit the numbers after `data~` to change its points:

```text
https://vizzo.dev/x?width=600&height=320&data=(definition~(marks~!(type~lineY~data~!!1~2~~!2~5~~!3~3~~!4~7~~~options~(x~*0~y~*1))~x~(scale~linear)y~(scale~linear~grid)))~
```

Generate JSURL2 from a render envelope with `jsurl2`:

```js
import { stringify } from 'jsurl2';

const imageUrl = `https://vizzo.dev/x?width=600&data=${stringify(options)}`;
```

JSURL2 escapes query delimiters itself, so concatenate its output directly to
keep `~` and parentheses visible. Its `short: true` output is also supported.
Browsers encode Unicode characters when sending the URL. JSURL2 changes only
the transport encoding; the chart still uses TanStack Charts' mark and scale names.

Raw JSON remains available:

```sh
curl --get https://vizzo.dev/x \
  --data-urlencode 'width=200' \
  --data-urlencode 'data={"definition":{"marks":[{"type":"barY","data":[{"letter":"A","frequency":3},{"letter":"B","frequency":7}],"options":{"x":"letter","y":"frequency"}}],"scales":{"x":{"scale":"band"},"y":{"scale":"linear"}}}}' \
  -o chart.png
```

Use `JSON.stringify` to remove unnecessary whitespace and `URLSearchParams` to
encode JSON, including characters such as
`&`, `+`, and `#`:

```js
const query = new URLSearchParams({ width: '200', data: JSON.stringify(options) });
const imageUrl = `https://vizzo.dev/x?${query}`;
```

For base64, encode the UTF-8 JSON rather than a JSURL2 string. Standard and
URL-safe base64 are supported, with or without valid padding. URL-safe base64
avoids `+` characters being interpreted as spaces. In Node or Bun:

```js
const data = Buffer.from(JSON.stringify(options), 'utf8').toString('base64url');
const imageUrl = `https://vizzo.dev/x?width=600&data=${data}`;
```

Pass standard base64 through `URLSearchParams` to escape its `+` characters.
Base64 makes the URL opaque and is not encryption.

GET uses the same validation, CORS headers, rendering limits, and IP rate limit as
POST. Missing or malformed `data` returns 400. Large charts should use POST;
browsers and Cloudflare impose URL length limits before the Worker receives the
request. The 1 MiB limit applies to decoded UTF-8 JSON; encoded data is also
bounded before parsing, allowing for base64 and JSURL2 escaping overhead.

Errors have a JSON `error` string. Validation errors also include Zod `issues`.

| Status | Meaning |
| --- | --- |
| `400` | Invalid JSON, base64, JSURL2, options, dimensions, or data row count. |
| `413` | Request body or decoded GET data exceeds 1 MiB. |
| `415` | POST content type is not `application/json`. |
| `429` | Rate limit exceeded; `Retry-After: 60` advises when to retry. |
| `500` | Chart rendering failed. |

PNG and WebP run in Workers using the bundled Resvg and WebP WASM modules and
vendored Roboto font. Rendering needs no browser or Canvas. Authentication and
billing are not required.
