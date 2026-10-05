import { defaultParseSearch } from '@tanstack/react-router';
import { render } from '@vizzo/core';
import { renderOptionsSchema } from '@vizzo/schemas';
import { z } from 'zod';

const MAX_BODY_BYTES = 1024 * 1024;
const MAX_DIMENSION = 2000;
const MAX_DATA_ROWS = 10_000;
const CORS_HEADERS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Expose-Headers': 'Retry-After' };

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
  return Response.json({ error }, { status, headers: { ...CORS_HEADERS, ...headers } });
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

async function readOptions(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    const url = new URL(request.url);
    const data = url.searchParams.getAll('data').join('');
    if (new TextEncoder().encode(data).byteLength > MAX_BODY_BYTES) {
      return errorResponse('Request data must not exceed 1 MiB.', 413);
    }
    return apiQuerySchema.safeParse(defaultParseSearch(url.search));
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
        { status: 400, headers: CORS_HEADERS },
      );
    }
    const result = await render(options.data);
    return new Response(typeof result.data === 'string' ? result.data : new Uint8Array(result.data), {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': result.format === 'svg' ? 'image/svg+xml' : `image/${result.format}`,
        'Cache-Control': 'no-store',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Chart rendering failed.', error);
    return errorResponse('Unable to render the chart.', 500);
  }
}
