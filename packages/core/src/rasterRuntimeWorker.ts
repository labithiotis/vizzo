import webpModule from '@jsquash/webp/codec/enc/webp_enc_simd.wasm';
import { init as initWebp } from '@jsquash/webp/encode';
import { initWasm } from '@resvg/resvg-wasm';
import resvgModule from '@resvg/resvg-wasm/index_bg.wasm';
import fontDataUrl from '../fonts/Roboto-Regular.ttf?inline';

let fontBuffer: Uint8Array | undefined;

let resvgReady: Promise<void> | undefined;
export function ensureResvg() {
  resvgReady ??= initWasm(resvgModule);
  return resvgReady;
}

let webpReady: Promise<unknown> | undefined;
export function ensureWebp() {
  webpReady ??= initWebp(webpModule);
  return webpReady;
}

export function loadFont(path: string | undefined) {
  if (path) throw new Error('Custom font paths are unavailable in Cloudflare Workers.');
  fontBuffer ??= Uint8Array.from(atob(fontDataUrl.slice(fontDataUrl.indexOf(',') + 1)), (character) =>
    character.charCodeAt(0),
  );
  return Promise.resolve(fontBuffer);
}
