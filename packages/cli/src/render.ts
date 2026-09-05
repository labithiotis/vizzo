import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, join } from 'node:path';
import { type RenderOptions, render as renderChart } from '@vizzo/core';
import { renderOptionsSchema, type SocialPresetName } from '@vizzo/schemas';
import type { RenderCliOptions } from './args.ts';
import { expandGlobs } from './glob.ts';

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
}

function isInlineJson(arg: string): boolean {
  return arg.trimStart().startsWith('{');
}

function isOutputPath(arg: string): boolean {
  const ext = extname(arg).slice(1);
  return ext === 'svg' || ext === 'png' || ext === 'webp';
}

/**
 * Lets the last positional double as an output path (`vizzo chart.json chart.png`).
 * Safe because inputs are always JSON while outputs are always svg/png/webp, so
 * the two never collide — except a lone positional, which only counts as an
 * output when stdin is piped in (otherwise it's plausibly a (mistaken) input path).
 */
function withPositionalOutput(cli: RenderCliOptions): RenderCliOptions {
  const last = cli.files[cli.files.length - 1];
  if (last === undefined || !isOutputPath(last)) return cli;
  if (cli.files.length === 1 && process.stdin.isTTY) return cli;

  if (cli.output) {
    throw new Error('Cannot pass an output path both as a positional argument and with --output.');
  }
  return { ...cli, files: cli.files.slice(0, -1), output: last };
}

function inferFormat(output: string | undefined, explicit: string | undefined): 'svg' | 'png' | 'webp' | undefined {
  if (explicit) return explicit as 'svg' | 'png' | 'webp';
  const ext = output ? extname(output).slice(1) : '';
  return ext === 'svg' || ext === 'png' || ext === 'webp' ? ext : undefined;
}

function deriveOutputPath(inputPath: string, format: string): string {
  const dir = dirname(inputPath);
  const name = basename(inputPath, extname(inputPath));
  return join(dir, `${name}.${format}`);
}

function toRenderOptions(raw: string, cli: RenderCliOptions, formatFallback: 'svg' | 'png' | 'webp'): RenderOptions {
  const file = renderOptionsSchema.parse(JSON.parse(raw));
  return {
    definition: file.definition,
    width: cli.width ?? file.width,
    height: cli.height ?? file.height,
    format: cli.format ?? file.format ?? formatFallback,
    theme: cli.theme ?? file.theme,
    preset: (cli.preset as SocialPresetName | undefined) ?? file.preset,
    background: cli.background ?? file.background,
  };
}

async function writeOutput(data: Uint8Array | string, outputPath: string | undefined): Promise<void> {
  if (!outputPath) {
    process.stdout.write(data);
    return;
  }
  await writeFile(outputPath, typeof data === 'string' ? data : Buffer.from(data));
}

async function renderBatch(files: readonly string[], cli: RenderCliOptions): Promise<void> {
  if (cli.output) throw new Error('--output cannot be used with more than one input file.');
  for (const file of files) {
    const raw = await readFile(file, 'utf8');
    const result = await renderChart(toRenderOptions(raw, cli, 'svg'));
    const outputPath = deriveOutputPath(file, result.format);
    await writeOutput(result.data, outputPath);
    process.stderr.write(`${file} -> ${outputPath}\n`);
  }
}

async function renderSingle(files: readonly string[], cli: RenderCliOptions): Promise<void> {
  const raw = files[0] ? (isInlineJson(files[0]) ? files[0] : await readFile(files[0], 'utf8')) : await readStdin();
  const formatFallback = inferFormat(cli.output, cli.format) ?? 'svg';
  const result = await renderChart(toRenderOptions(raw, cli, formatFallback));
  await writeOutput(result.data, cli.output);
}

export async function runRender(rawCli: RenderCliOptions): Promise<void> {
  const cli = withPositionalOutput(rawCli);
  const [firstFile] = cli.files;
  if (cli.files.length === 1 && firstFile && isInlineJson(firstFile)) {
    await renderSingle(cli.files, cli);
    return;
  }
  const files = expandGlobs(cli.files);
  if (files.length > 1) {
    await renderBatch(files, cli);
    return;
  }
  await renderSingle(files, cli);
}
