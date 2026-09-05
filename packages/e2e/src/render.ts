import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chartNames, renderChartSvg } from './charts.ts';

const outputDirs = [
  fileURLToPath(new URL('../../../examples/', import.meta.url)),
  fileURLToPath(new URL('../../../docs/public/examples/', import.meta.url)),
];

for (const name of await chartNames()) {
  const svg = await renderChartSvg(name);
  await Promise.all(outputDirs.map((dir) => writeFile(join(dir, `${name}.svg`), svg)));
  console.log(`packages/e2e/charts/${name}.json -> ${name}.svg`);
}
