import { defaultParseSearch } from '@tanstack/react-router';
import { render } from '@vizzo/core';
import { renderOptionsSchema } from '@vizzo/schemas';
import { parse } from 'jsurl2';
import { z } from 'zod';

const MAX_BODY_BYTES = 1024 * 1024;
const MAX_DIMENSION = 2000;
const MAX_DATA_ROWS = 10_000;
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'Retry-After' };
const BASE64 = /^[A-Za-z\d+/_-]+={0,2}$/;

const apiOptionsSchema = renderOptionsSchema
  .extend({
    width: renderOptionsSchema.shape.width.unwrap().max(MAX_DIMENSION).optional(),
    height: renderOptionsSchema.shape.height.unwrap().max(MAX_DIMENSION).optional(),
    format: renderOptionsSchema.shape.format.default('png'),
  })
  .strict()
  .refine((options) => options.definition.marks.reduce((count, mark) => count + mark.data.length, 0) <= MAX_DATA_ROWS, {
    path: ['definition', 'marks'],
    message: `Charts may contain at most ${MAX_DATA_ROWS} total data rows.`,
  });

const apiQuerySchema = renderOptionsSchema
  .omit({ definition: true })
  .extend({ data: z.record(z.string(), z.unknown()) })
  .strict()
  .transform(({ data, ...overrides }) => ({ ...data, ...overrides }))
  .pipe(apiOptionsSchema);

function errorResponse(error: string, status: number, headers: Record<string, string> = {}) {
  return Response.json({ error }, { status, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store', ...headers } });
}

async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let size = 0;
  let body = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return body + decoder.decode();
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

function readQueryOptions(url: URL) {
  const data = url.searchParams.getAll('data').join('');
  const jsurl = data.startsWith('(');
  const base64 = BASE64.test(data);
  const maxBytes = jsurl ? MAX_BODY_BYTES * 2 : base64 ? Math.ceil(MAX_BODY_BYTES / 3) * 4 : MAX_BODY_BYTES;
  if (new TextEncoder().encode(data).byteLength > maxBytes) {
    return errorResponse('Request data must not exceed 1 MiB.', 413);
  }
  const query: Record<string, unknown> = defaultParseSearch(url.search);
  if (typeof query.data === 'string' && query.data === data && (jsurl || base64)) {
    const decoded = decodeData(data, jsurl);
    if (decoded instanceof Response) return decoded;
    query.data = decoded;
  }
  return apiQuerySchema.safeParse(query);
}

function decodeData(data: string, jsurl: boolean) {
  try {
    if (jsurl) {
      const decoded = parse<unknown>(data);
      const json = JSON.stringify(decoded);
      if (new TextEncoder().encode(json).byteLength > MAX_BODY_BYTES) {
        return errorResponse('Request data must not exceed 1 MiB.', 413);
      }
      return decoded;
    }
    const bytes = Uint8Array.from(atob(data.replace(/-/g, '+').replace(/_/g, '/')), (character) =>
      character.charCodeAt(0),
    );
    if (bytes.byteLength > MAX_BODY_BYTES) return errorResponse('Request data must not exceed 1 MiB.', 413);
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch {
    return errorResponse('Request data must be valid JSON, base64-encoded JSON, or JSURL2.', 400);
  }
}

async function readOptions(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return readQueryOptions(new URL(request.url));
  }
  if (request.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase() !== 'application/json') {
    return errorResponse('Content-Type must be application/json.', 415);
  }
  const body = await readBody(request);
  if (body === null) return errorResponse('Request body must not exceed 1 MiB.', 413);
  try {
    return apiOptionsSchema.safeParse(JSON.parse(body));
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }
}

export async function renderRequest(request: Request, limiter: RateLimit): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { success } = await limiter.limit({ key: request.headers.get('CF-Connecting-IP') ?? 'unknown' });
    if (!success) return errorResponse('Rate limit exceeded. Try again in 60 seconds.', 429, { 'Retry-After': '60' });
    const options = await readOptions(request);
    if (options instanceof Response) return options;
    if (!options.success) {
      return Response.json(
        { error: 'Invalid render options.', issues: options.error.issues },
        { status: 400, headers: { ...CORS_HEADERS, 'Cache-Control': 'no-store' } },
      );
    }
    const result = await render(options.data);
    return new Response(typeof result.data === 'string' ? result.data : new Uint8Array(result.data), {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': result.format === 'svg' ? 'image/svg+xml' : `image/${result.format}`,
        'Cache-Control': request.method === 'GET' || request.method === 'HEAD' ? 'public, max-age=2592000' : 'no-store',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Chart rendering failed.', error);
    return errorResponse('Unable to render the chart.', 500);
  }
}
