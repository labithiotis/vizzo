import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '@vizzo/core';

const chartsDir = fileURLToPath(new URL('../charts/', import.meta.url));
const outputDirs = [
  fileURLToPath(new URL('../../../examples/', import.meta.url)),
  fileURLToPath(new URL('../../../docs/public/examples/', import.meta.url)),
];

const files = (await readdir(chartsDir)).filter((file) => file.endsWith('.json')).sort();

for (const file of files) {
  const envelope = JSON.parse(await readFile(join(chartsDir, file), 'utf8'));
  const result = await render({ definition: envelope.definition, width: 800, height: 450 });
  const name = basename(file, extname(file));
  await Promise.all(outputDirs.map((dir) => writeFile(join(dir, `${name}.svg`), result.data as string)));
  console.log(`packages/examples/charts/${file} -> ${name}.svg`);
}
