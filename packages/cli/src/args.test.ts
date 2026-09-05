import { describe, expect, test } from 'bun:test';
import { parseRenderArgs } from './args.ts';

describe('parseRenderArgs', () => {
  test('collects positionals as files', () => {
    const options = parseRenderArgs(['chart.json', 'other.json']);

    expect(options.files).toEqual(['chart.json', 'other.json']);
  });

  test('returns an empty files array when no positionals are given', () => {
    const options = parseRenderArgs([]);

    expect(options.files).toEqual([]);
  });

  test('parses long option flags', () => {
    const options = parseRenderArgs([
      'chart.json',
      '--output',
      'chart.png',
      '--width',
      '1200',
      '--height',
      '630',
      '--format',
      'png',
      '--theme',
      'dark',
      '--preset',
      'og',
      '--background',
      '#fff',
    ]);

    expect(options).toEqual({
      files: ['chart.json'],
      output: 'chart.png',
      width: 1200,
      height: 630,
      format: 'png',
      theme: 'dark',
      preset: 'og',
      background: '#fff',
      help: undefined,
    });
  });

  test('parses short option flags', () => {
    const options = parseRenderArgs([
      'chart.json',
      '-o',
      'chart.png',
      '-w',
      '400',
      '-h',
      '300',
      '-f',
      'webp',
      '-t',
      'light',
      '-p',
      'twitter',
    ]);

    expect(options.output).toBe('chart.png');
    expect(options.width).toBe(400);
    expect(options.height).toBe(300);
    expect(options.format).toBe('webp');
    expect(options.theme).toBe('light');
    expect(options.preset).toBe('twitter');
  });

  test('parses --help as a boolean flag', () => {
    const options = parseRenderArgs(['--help']);

    expect(options.help).toBe(true);
  });

  test('leaves width and height undefined when not provided', () => {
    const options = parseRenderArgs(['chart.json']);

    expect(options.width).toBeUndefined();
    expect(options.height).toBeUndefined();
  });

  test('interleaves flags and positionals', () => {
    const options = parseRenderArgs(['chart.json', '--width', '800', 'chart.png']);

    expect(options.files).toEqual(['chart.json', 'chart.png']);
    expect(options.width).toBe(800);
  });

  test('accepts an inline JSON string as a positional', () => {
    const json = '{"definition":{}}';
    const options = parseRenderArgs([json]);

    expect(options.files).toEqual([json]);
  });
});
