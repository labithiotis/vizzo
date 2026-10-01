import { describe, expect, mock, test } from 'bun:test';
import { render } from '@vizzo/core';
import { renderRequest } from './render';

const definition = {
  marks: [
    {
      type: 'lineY',
      data: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
      options: { x: 'x', y: 'y' },
    },
  ],
  x: { scale: 'linear' },
  y: { scale: 'linear' },
};

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request('https://vizzo.dev/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.1', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function allowedLimiter() {
  return { limit: mock(async () => ({ success: true })) } satisfies RateLimit;
}

describe('POST /', () => {
  test('defaults to PNG and uses the connecting IP for the rate limit', async () => {
    const limiter = allowedLimiter();
    const response = await renderRequest(request({ definition }), limiter);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(limiter.limit).toHaveBeenCalledWith({ key: '203.0.113.1' });
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    const dimensions = new DataView(bytes.buffer);
    expect(dimensions.getUint32(16)).toBe(960);
    expect(dimensions.getUint32(20)).toBe(540);
  });

  test.each(['svg', 'png', 'webp'] as const)('renders %s with the same bytes as the library', async (format) => {
    const options = { definition, format, width: 400, height: 240, theme: 'dark', background: '#fff' } as const;
    const response = await renderRequest(request(options), allowedLimiter());
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(format === 'svg' ? 'image/svg+xml' : `image/${format}`);
    const expected = await render(options);
    const expectedBytes = typeof expected.data === 'string' ? new TextEncoder().encode(expected.data) : expected.data;
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(expectedBytes));
  });

  test('applies social presets when explicit dimensions are omitted', async () => {
    const response = await renderRequest(request({ definition, preset: 'og', format: 'svg' }), allowedLimiter());
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('viewBox="0 0 1200 630"');
  });

  test.each([
    {},
    { definition: { marks: [] } },
    { definition, width: 2001 },
    { definition, height: 2001 },
    { definition, width: 0 },
    { definition, format: 'jpeg' },
    { definition, font: '/tmp/font.ttf' },
  ])('rejects invalid render options: %j', async (body) => {
    const response = await renderRequest(request(body), allowedLimiter());
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('issues');
  });

  test('counts data rows across every mark', async () => {
    const mark = { type: 'dot', data: Array.from({ length: 5001 }, () => ({ x: 1, y: 2 })) };
    const response = await renderRequest(request({ definition: { marks: [mark, mark] } }), allowedLimiter());
    expect(response.status).toBe(400);
    expect(JSON.stringify(await response.json())).toContain('10000 total data rows');
  });

  test('rejects malformed JSON', async () => {
    const response = await renderRequest(request('{'), allowedLimiter());
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('error', 'Request body must be valid JSON.');
  });

  test('requires the JSON content type', async () => {
    const response = await renderRequest(request({ definition }, { 'Content-Type': 'text/plain' }), allowedLimiter());
    expect(response.status).toBe(415);
  });

  test('accepts 1 MiB and rejects a larger body regardless of Content-Length', async () => {
    const json = JSON.stringify({ definition, format: 'svg' });
    const body = json + ' '.repeat(1024 * 1024 - new TextEncoder().encode(json).byteLength);
    const accepted = await renderRequest(request(body), allowedLimiter());
    expect(accepted.status).toBe(200);
    const rejected = await renderRequest(request(`${body} `, { 'Content-Length': '1' }), allowedLimiter());
    expect(rejected.status).toBe(413);
  });

  test('returns 429 with a retry delay when the rate limiter rejects a request', async () => {
    const response = await renderRequest(request({ definition }), { limit: async () => ({ success: false }) });
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(response.headers.get('Access-Control-Expose-Headers')).toBe('Retry-After');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });

  test('allows browser preflights without consuming a render request', async () => {
    const limiter = allowedLimiter();
    const response = await renderRequest(new Request('https://vizzo.dev/', { method: 'OPTIONS' }), limiter);
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(limiter.limit).not.toHaveBeenCalled();
  });
});
