import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { default as encodeWebp, init as initWebp } from '@jsquash/webp/encode';
import { initWasm, Resvg } from '@resvg/resvg-wasm';

/**
 * Both resvg and the WebP encoder ship as raw .wasm files loaded through
 * bundler-specific magic upstream (fetch() against import.meta.url). That
 * breaks under plain Node, whose fetch() rejects file:// URLs. Reading the
 * bytes ourselves via import.meta.resolve works under Bun, Node, and inside
 * a bundled CLI build.
 */
async function readWasmBinary(specifier: string) {
  return readFile(fileURLToPath(import.meta.resolve(specifier)));
}

let resvgReady: Promise<void> | undefined;
function ensureResvg() {
  resvgReady ??= readWasmBinary('@resvg/resvg-wasm/index_bg.wasm').then(initWasm);
  return resvgReady;
}

let webpReady: Promise<unknown> | undefined;
function ensureWebp() {
  webpReady ??= readWasmBinary('@jsquash/webp/codec/enc/webp_enc_simd.wasm').then((wasmBinary) =>
    initWebp({ wasmBinary }),
  );
  return webpReady;
}

/**
 * resvg-wasm cannot see the host's font directories, so an unstyled render
 * drops every <text> node. We ship Roboto next to the bundle and hand resvg
 * the bytes; `fonts/` sits one level up from both `src/` and the built
 * `dist/`, so the same relative URL resolves in the workspace and in the
 * published package.
 */
const DEFAULT_FONT_FAMILY = 'Roboto';
const DEFAULT_FONT_URL = new URL('../fonts/Roboto-Regular.ttf', import.meta.url);

const fontCache = new Map<string, Promise<Uint8Array>>();
function loadFont(path: string | undefined) {
  const key = path ?? '';
  const pending = fontCache.get(key) ?? readFile(path ?? DEFAULT_FONT_URL);
  fontCache.set(key, pending);
  return pending;
}

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
  return resvg.render();
}

export async function svgToPng(svg: string, options: RasterOptions = {}): Promise<Uint8Array> {
  return (await rasterize(svg, options)).asPng();
}

export async function svgToWebp(svg: string, options: RasterOptions = {}): Promise<Uint8Array> {
  await ensureWebp();
  const rendered = await rasterize(svg, options);
  const imageData = {
    data: rendered.pixels,
    width: rendered.width,
    height: rendered.height,
  } as unknown as ImageData;
  const encoded = await encodeWebp(imageData);
  return new Uint8Array(encoded);
}
