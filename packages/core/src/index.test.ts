import { describe, expect, test } from 'bun:test';
import { render } from './index.ts';

const lineDefinition = {
  marks: [
    {
      type: 'lineY',
      data: [
        { month: 'Jan', revenue: 42_000 },
        { month: 'Feb', revenue: 58_000 },
        { month: 'Mar', revenue: 76_000 },
      ],
      options: { x: 'month', y: 'revenue', points: true },
    },
  ],
  x: { scale: 'point', padding: 0.2 },
  y: { scale: 'linear', nice: true, grid: true },
};

const pieDefinition = {
  marks: [
    {
      type: 'pie',
      data: [
        { letter: 'E', frequency: 0.127 },
        { letter: 'T', frequency: 0.091 },
      ],
      options: { value: 'frequency', color: 'letter', key: 'letter' },
    },
  ],
};

describe('render', () => {
  test('renders a standalone SVG with an XML namespace resvg can parse', async () => {
    const result = await render({ definition: lineDefinition, width: 400, height: 200 });
    expect(result.format).toBe('svg');
    expect(result.data as string).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  test('renders PNG bytes', async () => {
    const result = await render({ definition: lineDefinition, width: 400, height: 200, format: 'png' });
    const bytes = result.data as Uint8Array;
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes[0]).toBe(0x89); // PNG signature
  });

  test('renders WebP bytes', async () => {
    const result = await render({ definition: lineDefinition, width: 400, height: 200, format: 'webp' });
    const bytes = result.data as Uint8Array;
    expect(bytes.length).toBeGreaterThan(0);
  });

  test('renders a pie chart through the polar hydration path', async () => {
    const result = await render({ definition: pieDefinition, width: 300, height: 300, theme: 'dark' });
    expect(result.data as string).toContain('<svg');
  });

  test('applies a social preset when no explicit size is given', async () => {
    const result = await render({ definition: lineDefinition, preset: 'og' });
    expect(result.width).toBe(1200);
    expect(result.height).toBe(630);
  });

  test('rejects a definition with no marks', async () => {
    await expect(render({ definition: { marks: [] } })).rejects.toThrow();
  });
});
