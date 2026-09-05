import { expect, test } from 'bun:test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { baselinesDir, chartNames, comparePng, diffsDir, renderChartPng } from './charts.ts';

const names = await chartNames();

test.each(names)('%s renders identically to its baseline', async (name) => {
  const baseline = await readFile(join(baselinesDir, `${name}.png`)).catch(() => {
    throw new Error(`No baseline for "${name}". Run: bun run --cwd packages/e2e baseline`);
  });

  const { changed, total, diff } = comparePng(baseline, await renderChartPng(name));
  if (changed > 0) {
    await mkdir(diffsDir, { recursive: true });
    const diffPath = join(diffsDir, `${name}.png`);
    await writeFile(diffPath, diff);
    throw new Error(
      `${changed} of ${total} pixels changed (${((changed / total) * 100).toFixed(2)}%). ` +
        `See ${relative(process.cwd(), diffPath)}, then run: bun run --cwd packages/e2e baseline`,
    );
  }
  expect(changed).toBe(0);
});
