import encodeWebp from '@jsquash/webp/encode';
import { Resvg } from '@resvg/resvg-wasm';
import { ensureResvg, ensureWebp, loadFont } from '#rasterRuntime';

const DEFAULT_FONT_FAMILY = 'Roboto';

export type RasterOptions = {
  background?: string;
  /** Path to a .ttf/.otf file rendered instead of the bundled Roboto. */
  font?: string;
};

/**
 * TanStack paints with `var(--ts-chart-1, #2563eb)` so a page can restyle a
 * chart in CSS. resvg has no CSS engine and drops the whole paint, which turns
 * fills black and strokes invisible. The fallback is what a browser shows
 * without a stylesheet, so inlining it reproduces the browser exactly.
 */
function inlineCssVariables(svg: string): string {
  return svg.replace(/var\(\s*--[\w-]+\s*,\s*([^()]*?)\s*\)/g, '$1');
}

async function rasterize(svg: string, options: RasterOptions) {
  const [, fontBuffer] = await Promise.all([ensureResvg(), loadFont(options.font)]);
  const resvg = new Resvg(inlineCssVariables(svg), {
    ...(options.background ? { background: options.background } : {}),
    font: { fontBuffers: [fontBuffer], defaultFontFamily: DEFAULT_FONT_FAMILY },
  });
  try {
    return resvg.render();
  } finally {
    resvg.free();
  }
}

export async function svgToPng(svg: string, options: RasterOptions = {}): Promise<Uint8Array> {
  const rendered = await rasterize(svg, options);
  try {
    return rendered.asPng();
  } finally {
    rendered.free();
  }
}

export async function svgToWebp(svg: string, options: RasterOptions = {}): Promise<Uint8Array> {
  await ensureWebp();
  const rendered = await rasterize(svg, options);
  try {
    const imageData = {
      data: new Uint8ClampedArray(rendered.pixels),
      width: rendered.width,
      height: rendered.height,
      colorSpace: 'srgb',
    } satisfies ImageData;
    return new Uint8Array(await encodeWebp(imageData));
  } finally {
    rendered.free();
  }
}
