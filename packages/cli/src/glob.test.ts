import { describe, expect, test } from 'bun:test';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expandGlobs } from './glob.ts';

describe('expandGlobs', () => {
  test('returns a pattern unchanged when it has no wildcard', () => {
    expect(expandGlobs(['chart.json'])).toEqual(['chart.json']);
  });

  test('expands a trailing * wildcard against the filesystem, sorted', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-glob-'));
    await writeFile(join(dir, 'b.json'), '{}');
    await writeFile(join(dir, 'a.json'), '{}');
    await writeFile(join(dir, 'c.txt'), '');

    expect(expandGlobs([join(dir, '*.json')])).toEqual([join(dir, 'a.json'), join(dir, 'b.json')]);
  });

  test('expands a ? wildcard to a single character', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-glob-'));
    await writeFile(join(dir, 'a1.json'), '{}');
    await writeFile(join(dir, 'a22.json'), '{}');

    expect(expandGlobs([join(dir, 'a?.json')])).toEqual([join(dir, 'a1.json')]);
  });

  test('flattens results across multiple patterns', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'vizzo-glob-'));
    await writeFile(join(dir, 'a.json'), '{}');
    await writeFile(join(dir, 'b.json'), '{}');

    expect(expandGlobs([join(dir, 'a.json'), join(dir, '*.json')])).toEqual([
      join(dir, 'a.json'),
      join(dir, 'a.json'),
      join(dir, 'b.json'),
    ]);
  });
});
