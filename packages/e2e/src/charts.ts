import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '@vizzo/core';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { CHART_SIZE } from './size.ts';

export const chartsDir = fileURLToPath(new URL('../charts/', import.meta.url));
export const baselinesDir = fileURLToPath(new URL('../baselines/', import.meta.url));
export const diffsDir = fileURLToPath(new URL('../.diffs/', import.meta.url));

export async function chartNames(): Promise<string[]> {
  const files = await readdir(chartsDir);
  return files
    .filter((file) => file.endsWith('.json'))
    .map((file) => basename(file, extname(file)))
    .sort();
}

async function readDefinition(name: string): Promise<unknown> {
  const envelope = JSON.parse(await readFile(join(chartsDir, `${name}.json`), 'utf8'));
  return envelope.definition;
}

export async function renderChartSvg(name: string): Promise<string> {
  const result = await render({ definition: await readDefinition(name), ...CHART_SIZE });
  return result.data as string;
}

export async function renderChartPng(name: string): Promise<Buffer> {
  const result = await render({
    definition: await readDefinition(name),
    ...CHART_SIZE,
    format: 'png',
    background: '#ffffff',
  });
  return Buffer.from(result.data as Uint8Array);
}

export type Comparison = { changed: number; total: number; diff: Buffer };

/**
 * resvg is deterministic, so any nonzero pixel count is a real change. The
 * threshold only stops antialiasing noise from a resvg or font bump being
 * reported as a full repaint.
 */
export function comparePng(baseline: Buffer, current: Buffer): Comparison {
  const expected = PNG.sync.read(baseline);
  const actual = PNG.sync.read(current);
  if (expected.width !== actual.width || expected.height !== actual.height) {
    throw new Error(
      `Size changed: baseline is ${expected.width}x${expected.height}, render is ${actual.width}x${actual.height}.`,
    );
  }
  const diff = new PNG({ width: expected.width, height: expected.height });
  const changed = pixelmatch(expected.data, actual.data, diff.data, expected.width, expected.height, {
    threshold: 0.1,
  });
  return { changed, total: expected.width * expected.height, diff: PNG.sync.write(diff) };
}
