import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { baselinesDir, chartNames, renderChartPng } from './charts.ts';

await mkdir(baselinesDir, { recursive: true });

for (const name of await chartNames()) {
  await writeFile(join(baselinesDir, `${name}.png`), await renderChartPng(name));
  console.log(`packages/e2e/charts/${name}.json -> baselines/${name}.png`);
}
