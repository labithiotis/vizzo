import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { init as initWebp } from '@jsquash/webp/encode';
import { initWasm } from '@resvg/resvg-wasm';

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
export function ensureResvg() {
  resvgReady ??= readWasmBinary('@resvg/resvg-wasm/index_bg.wasm').then(initWasm);
  return resvgReady;
}

let webpReady: Promise<unknown> | undefined;
export function ensureWebp() {
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
const DEFAULT_FONT_URL = new URL('../fonts/Roboto-Regular.ttf', import.meta.url);

const fontCache = new Map<string, Promise<Uint8Array>>();
export function loadFont(path: string | undefined) {
  const key = path ?? '';
  const pending = fontCache.get(key) ?? readFile(path ?? DEFAULT_FONT_URL);
  fontCache.set(key, pending);
  return pending;
}
