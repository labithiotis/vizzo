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
    "x": { "scale": "linear" },
    "y": { "scale": "linear" }
  },
  "width": 1200,
  "height": 630,
  "format": "png"
}
```

Options belong in the JSON body. Query parameters do not configure rendering.

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
- At most 10 POST requests per minute per IP, including invalid requests.
- At most 1,000 ms CPU per Worker invocation when deployed.

Cloudflare's rate limiter uses approximate counters local to each Cloudflare
location. Clients sharing an IP share an allowance. This is a throttle, not an
exact global quota.

Successful responses use `image/png`, `image/svg+xml`, or `image/webp` and are
not cached. Browser requests are supported through public CORS and `OPTIONS /`.
`GET /` continues to serve the website.

Errors have a JSON `error` string. Validation errors also include Zod `issues`.

| Status | Meaning |
| --- | --- |
| `400` | Invalid JSON, options, dimensions, or data row count. |
| `413` | Request body exceeds 1 MiB. |
| `415` | Content type is not `application/json`. |
| `429` | Rate limit exceeded; `Retry-After: 60` advises when to retry. |
| `500` | Chart rendering failed. |

PNG and WebP run in Workers using the bundled Resvg and WebP WASM modules and
vendored Roboto font. Rendering needs no browser or Canvas. Authentication and
billing are not required.
