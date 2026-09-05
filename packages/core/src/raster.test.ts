import { describe, expect, test } from 'bun:test';
import { fileURLToPath } from 'node:url';
import { svgToPng } from './raster.ts';

const BLANK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"></svg>';
const TEXT_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><text x="10" y="40" font-family="inherit" font-size="24">Vizzo</text></svg>';

describe('svgToPng', () => {
  test('draws text with the bundled font instead of dropping it', async () => {
    const [blank, text] = await Promise.all([svgToPng(BLANK_SVG), svgToPng(TEXT_SVG)]);
    expect(Buffer.compare(Buffer.from(text), Buffer.from(blank))).not.toBe(0);
  });

  test('draws text with a font supplied by path', async () => {
    const font = fileURLToPath(new URL('../fonts/Roboto-Regular.ttf', import.meta.url));
    const [blank, text] = await Promise.all([svgToPng(BLANK_SVG), svgToPng(TEXT_SVG, { font })]);
    expect(Buffer.compare(Buffer.from(text), Buffer.from(blank))).not.toBe(0);
  });

  test('fails loudly when the supplied font path does not exist', async () => {
    expect(svgToPng(TEXT_SVG, { font: '/no/such/font.ttf' })).rejects.toThrow();
  });

  /** resvg has no CSS engine: an unresolved var() turns fills black and drops strokes entirely. */
  test('paints var() fallbacks exactly as a literal color would', async () => {
    const literal =
      '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect x="5" y="5" width="50" height="50" fill="#2563eb"/><path d="M5,55L55,5" stroke="#f97316" stroke-width="4"/></svg>';
    const variables =
      '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect x="5" y="5" width="50" height="50" fill="var(--ts-chart-1, #2563eb)"/><path d="M5,55L55,5" stroke="var(--ts-chart-2, #f97316)" stroke-width="4"/></svg>';

    const [fromLiteral, fromVariables] = await Promise.all([svgToPng(literal), svgToPng(variables)]);
    expect(Buffer.compare(Buffer.from(fromVariables), Buffer.from(fromLiteral))).toBe(0);
  });
});
