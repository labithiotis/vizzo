import { describe, expect, test } from 'bun:test';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { runRender } from './render.ts';

async function withStdin<T>(input: string, isTTY: boolean, fn: () => Promise<T>): Promise<T> {
  const original = process.stdin;
  const mock = Readable.from([Buffer.from(input)]) as unknown as typeof process.stdin;
  Object.defineProperty(mock, 'isTTY', { value: isTTY, configurable: true });
  Object.defineProperty(process, 'stdin', { value: mock, configurable: true });
  try {
    return await fn();
  } finally {
    Object.defineProperty(process, 'stdin', { value: original, configurable: true });
  }
}

async function captureStdout<T>(fn: () => Promise<T>): Promise<{ result: T; output: string }> {
  const original = process.stdout.write.bind(process.stdout);
  const chunks: string[] = [];
  process.stdout.write = ((chunk: string | Uint8Array) => {
    chunks.push(chunk.toString());
    return true;
  }) as typeof process.stdout.write;
  try {
    const result = await fn();
    return { result, output: chunks.join('') };
  } finally {
    process.stdout.write = original;
  }
}

const chartJson = JSON.stringify({
  definition: {
    marks: [
      {
        type: 'lineY',
        data: [
          { x: 1, y: 2 },
          { x: 2, y: 3 },
        ],
        options: { x: 'x', y: 'y' },
      },
    ],
    x: { scale: 'linear' },
    y: { scale: 'linear' },
  },
});

describe('runRender', () => {
  test('writes a file when --output is given', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-'));
    const input = join(dir, 'chart.json');
    const output = join(dir, 'chart.svg');
    await writeFile(input, chartJson);

    await runRender({ files: [input], output });

    expect(await readFile(output, 'utf8')).toContain('<svg');
  });

  test('rejects --output with more than one input file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-'));
    const a = join(dir, 'a.json');
    const b = join(dir, 'b.json');
    await writeFile(a, chartJson);
    await writeFile(b, chartJson);

    await expect(runRender({ files: [a, b], output: 'x.svg' })).rejects.toThrow();
  });

  test('derives a per-file output path in batch mode', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-'));
    const a = join(dir, 'a.json');
    const b = join(dir, 'b.json');
    await writeFile(a, chartJson);
    await writeFile(b, chartJson);

    await runRender({ files: [a, b] });

    expect(await readFile(join(dir, 'a.svg'), 'utf8')).toContain('<svg');
    expect(await readFile(join(dir, 'b.svg'), 'utf8')).toContain('<svg');
  });

  test('renders inline JSON given as a positional argument', async () => {
    const { output } = await captureStdout(() => runRender({ files: [chartJson] }));

    expect(output).toContain('<svg');
  });

  test('treats a trailing positional as the output path', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-'));
    const input = join(dir, 'chart.json');
    const output = join(dir, 'out.svg');
    await writeFile(input, chartJson);

    await runRender({ files: [input, output] });

    expect(await readFile(output, 'utf8')).toContain('<svg');
  });

  test('rejects a positional output combined with --output', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-'));
    const input = join(dir, 'chart.json');
    await writeFile(input, chartJson);

    await expect(runRender({ files: [input, join(dir, 'out.svg')], output: join(dir, 'other.svg') })).rejects.toThrow(
      'Cannot pass an output path both as a positional argument and with --output.',
    );
  });

  test('writes to stdout when no output is given', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-'));
    const input = join(dir, 'chart.json');
    await writeFile(input, chartJson);

    const { output } = await captureStdout(() => runRender({ files: [input] }));

    expect(output).toContain('<svg');
  });

  test('reads from stdin when no files are given', async () => {
    const { output } = await withStdin(chartJson, false, () => captureStdout(() => runRender({ files: [] })));

    expect(output).toContain('<svg');
  });

  test('reads piped stdin and writes to a positional output file', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-'));
    const output = join(dir, 'out.png');

    await withStdin(chartJson, false, () => runRender({ files: [output] }));

    expect(await readFile(output)).toBeInstanceOf(Buffer);
  });

  test('treats a lone image-extension positional as a literal input path when stdin is a TTY', async () => {
    await expect(withStdin('', true, () => runRender({ files: ['missing-chart.png'] }))).rejects.toThrow();
  });
});
