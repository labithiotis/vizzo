import { describe, expect, test } from 'bun:test';
import { renderOptionsSchema } from './index.ts';

describe('renderOptionsSchema', () => {
  test('accepts a minimal chart envelope', () => {
    const result = renderOptionsSchema.parse({
      definition: {
        marks: [{ type: 'lineY', data: [{ x: 1, y: 2 }], options: { x: 'x', y: 'y' } }],
        scales: {
          x: { scale: 'linear' },
          y: { scale: 'linear' },
        },
      },
    });
    expect(result.definition.marks).toHaveLength(1);
  });

  test('rejects a definition with no marks', () => {
    expect(() => renderOptionsSchema.parse({ definition: { marks: [], scales: { x: null, y: null } } })).toThrow();
  });

  test('rejects an unknown mark type', () => {
    expect(() =>
      renderOptionsSchema.parse({
        definition: { marks: [{ type: 'notAMark', data: [] }], scales: { x: null, y: null } },
      }),
    ).toThrow();
  });

  test.each([undefined, {}, { x: null }, { y: null }])('rejects an incomplete scale registry: %j', (scales) => {
    expect(() =>
      renderOptionsSchema.parse({
        definition: { marks: [{ type: 'pie', data: [] }], scales },
      }),
    ).toThrow();
  });

  test('accepts explicit null scales for a pie chart', () => {
    const result = renderOptionsSchema.parse({
      definition: { marks: [{ type: 'pie', data: [] }], scales: { x: null, y: null } },
    });
    expect(result.definition.scales).toEqual({ x: null, y: null });
  });

  test('rejects the former root axis shape', () => {
    const result = renderOptionsSchema.safeParse({
      definition: {
        marks: [{ type: 'lineY', data: [{ x: 1, y: 2 }], options: { x: 'x', y: 'y' } }],
        x: { scale: 'linear' },
        y: { scale: 'linear' },
      },
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toEqual(['definition', 'scales']);
  });
});
