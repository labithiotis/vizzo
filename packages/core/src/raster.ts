/// <reference path="./assets.d.ts" />
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import webpModule from '@jsquash/webp/codec/enc/webp_enc_simd.wasm';
import encodeWebp, { init as initWebp } from '@jsquash/webp/encode';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import resvgModule from '@resvg/resvg-wasm/index_bg.wasm';
import fontSource from '../fonts/Roboto-Regular.ttf';

const DEFAULT_FONT_FAMILY = 'Roboto';
const fontCache = new Map<string, Promise<Uint8Array>>();
let resvgReady: Promise<void> | undefined;
let webpReady: Promise<unknown> | undefined;

// Workers imports precompiled WASM modules; Bun bundles asset paths for Node.
async function loadWasm(module: WebAssembly.Module | string): Promise<WebAssembly.Module> {
  return typeof module === 'string' ? WebAssembly.compile(await readFile(new URL(module, import.meta.url))) : module;
}

function loadFont(path: string | undefined) {
  const key = path ?? '';
  const cached = fontCache.get(key);
  if (cached) return cached;
  const pending = (
    !path && fontSource.startsWith('data:')
      ? Promise.resolve(Buffer.from(fontSource.slice(fontSource.indexOf(',') + 1), 'base64'))
      : readFile(path ?? new URL(fontSource, import.meta.url))
  ).catch((error) => {
    if (fontCache.get(key) === pending) fontCache.delete(key);
    throw error;
  });
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
  resvgReady ??= loadWasm(resvgModule)
    .then(initWasm)
    .catch((error) => {
      resvgReady = undefined;
      throw error;
    });
  const [, fontBuffer] = await Promise.all([resvgReady, loadFont(options.font)]);
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
  webpReady ??= loadWasm(webpModule)
    .then((module) => initWebp(module))
    .catch((error) => {
      webpReady = undefined;
      throw error;
    });
  await webpReady;
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
