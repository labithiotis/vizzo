## Run it anywhere Node runs

```sh
npx vizzo --help
npm install --global vizzo
vizzo line.json line.png
```

The published package works with Node. Bun and pnpm also work through `bunx vizzo` and `pnpm dlx vizzo`. Rendering uses TanStack Charts and Resvg directly. There is no browser or Canvas dependency.

## Choose your input

Pass a JSON envelope with a `definition` field. Input may be a file, inline JSON, stdin, or multiple files.

```sh
# A file, with a positional output path
npx vizzo line.json line.png

# Inline JSON
npx vizzo '{"definition":{"marks":[{"type":"barY","data":[["A",4],["B",8],["C",6]],"options":{"x":"0","y":"1"}}],"x":{"scale":"band"},"y":{"scale":"linear"}}}' chart.png

# Pipe an envelope from a script
cat line.json | npx vizzo --format png > line.png

# SVG goes to stdout when no output or format is given
npx vizzo line.json > line.svg

# Render a batch next to the source files
npx vizzo './charts/*.json' --format webp
```

Use [line.json](/docs/examples/line.json) from the quick start to try these commands. Batch rendering writes one image per input file. `--output` is for one input only.

## Set output options

Flags override values in the JSON envelope. Explicit dimensions override a preset.

| Flag | Short | What it changes |
| --- | --- | --- |
| `--output` | `-o` | Output path, also accepted as the last positional argument |
| `--width` | `-w` | Positive integer width in pixels |
| `--height` | `-h` | Positive integer height in pixels |
| `--format` | `-f` | `svg`, `png`, or `webp` |
| `--theme` | `-t` | `light` or `dark` |
| `--preset` | `-p` | `og`, `twitter`, `linkedin`, or `discord` dimensions |
| `--background` | | PNG/WebP canvas color behind transparent or uncovered chart areas |
| `--font` | | Local `.ttf` or `.otf` for raster text |
| `--help` | | Show usage |

Use `--height` for height and `--help` for help. A lone `-h` also shows help.

```sh
npx vizzo line.json --output report.png --preset twitter --theme dark
npx vizzo line.json report.webp --width 800 --height 450 --background '#ffffff'
```

The CLI defaults to 960 × 540 and SVG. An output extension selects a format unless `--format` or the envelope's `format` sets it explicitly. The public HTTP API has its own size and rate limits; the local CLI does not inherit them.

## Use the SDK in a bot or job

```ts
import { writeFile } from 'node:fs/promises';
import { render } from 'vizzo';
import chart from './line.json' with { type: 'json' };

const result = await render({
  ...chart,
  format: 'png',
  preset: 'discord',
  theme: 'dark',
});

await writeFile('report.png', result.data);
```

`render()` returns `{ format, width, height, data }`. SVG data is a string; PNG and WebP data are `Uint8Array`. Upload those bytes as a file attachment through your Slack or Discord bot, or save them for an email report.

See [chart definitions](/docs/chart-definitions) for the JSON mapping and [reference](/docs/reference) for theme and preset details.
