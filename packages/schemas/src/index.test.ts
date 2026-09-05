import { describe, expect, test } from 'bun:test';
import { renderOptionsSchema } from './index.ts';

describe('renderOptionsSchema', () => {
  test('accepts a minimal chart envelope', () => {
    const result = renderOptionsSchema.parse({
      definition: {
        marks: [{ type: 'lineY', data: [{ x: 1, y: 2 }], options: { x: 'x', y: 'y' } }],
        x: { scale: 'linear' },
        y: { scale: 'linear' },
      },
    });
    expect(result.definition.marks).toHaveLength(1);
  });

  test('rejects a definition with no marks', () => {
    expect(() => renderOptionsSchema.parse({ definition: { marks: [] } })).toThrow();
  });

  test('rejects an unknown mark type', () => {
    expect(() =>
      renderOptionsSchema.parse({
        definition: { marks: [{ type: 'notAMark', data: [] }] },
      }),
    ).toThrow();
  });
});
