#!/usr/bin/env node
import packageJson from '../package.json' with { type: 'json' };
import { parseRenderArgs } from './args.ts';
import { runRender } from './render.ts';

const HELP = `vizzo <file|json> [output] [options]

Render a TanStack Charts definition to SVG, PNG, or WebP.

  vizzo chart.json
  vizzo chart.json chart.png
  cat chart.json | vizzo chart.png
  cat chart.json | vizzo > chart.png
  vizzo '{"definition":{...}}'
  vizzo chart.json --width 1200 --height 630 --format png
  vizzo chart.json --theme dark
  vizzo ./charts/*.json

Options:
  -o, --output <path>     Write to a file instead of stdout
  -w, --width <number>    Chart width in pixels
  -h, --height <number>   Chart height in pixels
  -f, --format <format>   svg | png | webp
  -t, --theme <name>      light | dark
  -p, --preset <name>     og | twitter | linkedin | discord
      --background <css>  Raster background color (png/webp only)
      --help              Show this message
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 1 && args[0] === '-h') {
    process.stdout.write(HELP);
    return;
  }
  if (args.length === 0 && process.stdin.isTTY) {
    process.stdout.write(HELP);
    return;
  }
  if (args[0] === '--version' || args[0] === '-v') {
    process.stdout.write(`${packageJson.version}\n`);
    return;
  }

  const options = parseRenderArgs(args);
  if (options.help) {
    process.stdout.write(HELP);
    return;
  }

  await runRender(options);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
