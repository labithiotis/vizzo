## An image, wherever the conversation happens

Send a revenue chart to Slack. Attach a release report in Discord. Put a weekly trend in an email or a PNG in a tweet. Vizzo renders the file from your chart definition, without launching a browser.

Start with a [working chart URL]({{line.url}}). It returns a PNG. Change `width=960` to `width=1200`, or change `theme=light` to `theme=dark` in the address bar. The `data` parameter uses JSURL2, a compact encoding of the same JSON accepted by the CLI.

## Save a chart definition

Download [line.json](/docs/examples/line.json), or save this envelope as `line.json`. A definition contains TanStack Charts marks and scales. Each mark names the factory function, its data, and its options.

```json
{{line.json}}
```

## Render a file with the CLI

No global installation is required. Use Node with `npx` or `pnpm dlx vizzo`. With Bun, use `bunx --bun vizzo` to run without Node installed.

```sh
{{line.command}}
```

The output filename selects PNG. Without an output file or format, the CLI writes SVG to stdout. [CLI guide](/docs/cli)

## Render with a URL

Open this URL to render the same definition. JSURL2 replaces JSON punctuation with URL-friendly separators, so you can edit values directly.

```text
{{line.url}}
```

Use `data` with raw JSON or base64 if your integration already generates those. For larger definitions, send the JSON envelope in a POST body. [HTTP guide](/docs/http)

## Render with POST

```sh
{{line.post}}
```

GET and POST return image bytes. The HTTP API defaults to PNG and allows 10 render requests per minute per IP. Rendering in the local CLI has no HTTP rate limit.

## Share the result

Attach the downloaded PNG or WebP in Slack, Discord, or a social post. A bot can upload the file with the platform's attachment API. For email, use an attached image or a hosted image in HTML according to your email provider's rules.

The `twitter`, `discord`, `og`, and `linkedin` presets choose image dimensions. They do not publish a post or guarantee that a platform will unfurl a chart URL. [Formats and presets](/docs/reference)

Want a different shape? [Browse the chart gallery](/docs/examples) for bars, layered areas, multiple series, UTC timelines, and pie charts.
