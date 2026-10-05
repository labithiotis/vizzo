## Open a chart with GET

The render route is `GET https://vizzo.dev/x`. Put the render envelope in the `data` parameter and add output options as query parameters.

```text
{{line.url}}
```

[Open the chart]({{line.url}}), then edit `width`, `height`, or `theme` in the URL. Query options override the same fields inside the envelope. The API returns image bytes, not a page or a JSON wrapper.

## JSURL2 is the default for our examples

JSURL2 encodes the existing JSON envelope with readable separators. It does not change the chart grammar. Use the small `jsurl2` package to create a link.

```ts
import { stringify } from 'jsurl2';

const envelope = {
  definition: {
    marks: [{
      type: 'barY',
      data: [['A', 4], ['B', 8], ['C', 6]],
      options: { x: '0', y: '1' },
    }],
    x: { scale: 'band' },
    y: { scale: 'linear' },
  },
};

const url = `https://vizzo.dev/x?width=800&data=${stringify(envelope)}`;
```

JSURL2 escapes URL delimiters itself. Keep its string directly after `data=` to preserve readable parentheses and tildes. An additional `URLSearchParams` encoding also works, but escapes some of that punctuation again. Do not invent or hand-encode JSURL2 escapes; use the library when values contain reserved characters or Unicode.

## Raw JSON and base64 work too

All three encodings use the same `data` parameter. The API detects the encoding and validates the decoded envelope with the same Zod schema as POST.

```ts
// Raw JSON, safely percent-encoded
const raw = new URL('https://vizzo.dev/x');
raw.searchParams.set('data', JSON.stringify(envelope));

// UTF-8 JSON as base64url in Node or Bun
const data = Buffer.from(JSON.stringify(envelope), 'utf8').toString('base64url');
const base64 = `https://vizzo.dev/x?data=${data}`;
```

Standard base64 also works. Encode it with `URLSearchParams` so `+` does not become a space. Base64 hides the chart structure and is not compression. JSON without whitespace is smaller than pretty-printed JSON for every encoding.

## Send JSON with POST

`POST https://vizzo.dev/` accepts an envelope as an `application/json` body. Use POST when a chart has many rows or a link would exceed a browser, proxy, or chat application's URL limit.

```sh
{{line.post}}
```

```ts
const response = await fetch('https://vizzo.dev/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...envelope, format: 'webp', theme: 'dark' }),
});

if (!response.ok) throw new Error(await response.text());
const image = await response.arrayBuffer();
```

## Output options

| Field | Default | Accepted values |
| --- | --- | --- |
| `data` | Required for GET | JSURL2, percent-encoded JSON, base64, or base64url render envelope |
| `definition` | Required inside the envelope | TanStack Charts definition |
| `width` | 960 | Integer from 1 to 2,000 |
| `height` | 540 | Integer from 1 to 2,000 |
| `format` | `png` | `png`, `svg`, `webp` |
| `theme` | Chart's theme | `light`, `dark` |
| `preset` | None | `og`, `twitter`, `linkedin`, `discord` |
| `background` | Theme background | PNG/WebP canvas color behind transparent or uncovered chart areas |

Dimensions from `preset` apply when no explicit width or height is given. On GET, query fields override fields in `data`. Use a field once; duplicate or unknown query parameters are rejected. POST dimensions must be JSON numbers, not strings.

`HEAD /x` uses GET validation and rendering, then returns headers without an image body. It consumes a render request. Other methods on `/x` return `405`. `OPTIONS /` handles browser CORS preflight without consuming a render request. The API permits cross-origin requests.

## Public limits and errors

GET and POST share an allowance of 10 render requests per minute per IP address. Cloudflare's limiter is approximate and local to each location. Responses are not publicly cached by the renderer.

The JSON payload limit is 1 MiB, measured after decoding. Encoded GET inputs are also bounded before parsing. Output dimensions are at most 2,000 × 2,000. The sum of all mark data arrays must not exceed 10,000 rows; two marks over the same 6,000 rows count as 12,000.

| Status | Meaning | What to change |
| --- | --- | --- |
| `200` | Image bytes | Read `Content-Type` to identify the format |
| `400` | Invalid encoding, JSON, options, definition, or render input | Read the JSON error and validation `issues` when present |
| `405` | Unsupported method | Use GET on `/x` or POST on `/` |
| `413` | Request data is too large | Reduce input size or row count; POST still has the 1 MiB body limit |
| `415` | Unsupported POST content type | Set `Content-Type: application/json` |
| `429` | Rate limit exceeded | Wait before requesting another render |

Dimension and row limits fail validation with `400`. Oversized input bytes return `413`. Errors are JSON with an `error` message. Download an image once and upload the file to your messaging platform; each new render URL request counts toward the allowance.
