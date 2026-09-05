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

export async function svgToPng(svg: string, background?: string): Promise<Uint8Array> {
  await ensureResvg();
  const resvg = new Resvg(svg, background ? { background } : undefined);
  return resvg.render().asPng();
}

export async function svgToWebp(svg: string, background?: string): Promise<Uint8Array> {
  await Promise.all([ensureResvg(), ensureWebp()]);
  const resvg = new Resvg(svg, background ? { background } : undefined);
  const rendered = resvg.render();
  const imageData = {
    data: rendered.pixels,
    width: rendered.width,
    height: rendered.height,
  } as unknown as ImageData;
  const encoded = await encodeWebp(imageData);
  return new Uint8Array(encoded);
}
