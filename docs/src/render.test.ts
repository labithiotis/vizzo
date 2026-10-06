import { describe, expect, mock, test } from 'bun:test';
import { render } from '@vizzo/core';
import { stringify } from 'jsurl2';
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
  scales: {
    x: { scale: 'linear' },
    y: { scale: 'linear' },
  },
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

function queryRequest(body: unknown, options: Record<string, string> = {}) {
  const query = new URLSearchParams({ data: typeof body === 'string' ? body : JSON.stringify(body), ...options });
  return new Request(`https://vizzo.dev/x?${query}`, { headers: { 'CF-Connecting-IP': '203.0.113.1' } });
}

const encodings = [
  { name: 'raw JSON', encode: JSON.stringify },
  { name: 'base64', encode: (body: unknown) => Buffer.from(JSON.stringify(body)).toString('base64') },
  {
    name: 'unpadded base64',
    encode: (body: unknown) => Buffer.from(JSON.stringify(body)).toString('base64').replace(/=+$/, ''),
  },
  { name: 'base64url', encode: (body: unknown) => Buffer.from(JSON.stringify(body)).toString('base64url') },
  {
    name: 'padded base64url',
    encode: (body: unknown) =>
      Buffer.from(JSON.stringify(body)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
  },
  { name: 'JSURL2', encode: stringify },
  { name: 'short JSURL2', encode: (body: unknown) => stringify(body, { short: true }) },
];

describe('POST /', () => {
  test('defaults to PNG and uses the connecting IP for the rate limit', async () => {
    const limiter = allowedLimiter();
    const response = await renderRequest(request({ definition }), limiter);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
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
    { definition: { ...definition, marks: [] } },
    { definition, width: 2001 },
    { definition, height: 2001 },
    { definition, width: 0 },
    { definition, width: '200' },
    { definition, format: 'jpeg' },
    { definition, font: '/tmp/font.ttf' },
  ])('rejects invalid render options: %j', async (body) => {
    const response = await renderRequest(request(body), allowedLimiter());
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('issues');
  });

  test('counts data rows across every mark', async () => {
    const mark = { type: 'dot', data: Array.from({ length: 5001 }, () => ({ x: 1, y: 2 })) };
    const response = await renderRequest(
      request({ definition: { ...definition, marks: [mark, mark] } }),
      allowedLimiter(),
    );
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

describe('GET /x', () => {
  test.each(encodings)('renders $name with the same bytes as POST and preserves Unicode', async ({ encode }) => {
    const input = {
      definition: {
        ...definition,
        scales: { ...definition.scales, x: { ...definition.scales.x, label: 'Café 💡 & + / = # ~ (_) * \n' } },
      },
      format: 'png',
      width: 240,
      height: 160,
      theme: 'dark',
      background: '#0f172a',
    };
    const get = await renderRequest(queryRequest(encode(input)), allowedLimiter());
    const post = await renderRequest(request(input), allowedLimiter());
    expect(get.status).toBe(200);
    expect(get.headers.get('Content-Type')).toBe('image/png');
    expect(new Uint8Array(await get.arrayBuffer())).toEqual(new Uint8Array(await post.arrayBuffer()));
  });

  test.each(encodings)('applies query overrides before shared validation for $name', async ({ encode }) => {
    const input = { definition, width: 'invalid', height: -1, format: 'jpeg' };
    const response = await renderRequest(
      queryRequest(encode(input), { width: '200', height: '120', format: 'svg' }),
      allowedLimiter(),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('viewBox="0 0 200 120"');
  });

  test.each(encodings)('rejects duplicated $name data without choosing an encoding', async ({ encode }) => {
    const url = new URL(queryRequest(encode({ definition })).url);
    url.searchParams.append('data', url.searchParams.get('data') ?? '');
    const response = await renderRequest(new Request(url), allowedLimiter());
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('issues');
  });

  test.each(encodings)('supports $name in TanStack HEAD fallback', async ({ encode }) => {
    const head = new Request(queryRequest(encode({ definition, format: 'svg', width: 200, height: 120 })), {
      method: 'HEAD',
    });
    const response = await renderRequest(head, allowedLimiter());
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(await response.text()).toContain('viewBox="0 0 200 120"');
  });

  test.each(encodings)('rejects values outside the render envelope in $name', async ({ encode }) => {
    for (const input of [null, [], 1, 'text', {}, definition, { definition, width: '200' }]) {
      const response = await renderRequest(queryRequest(encode(input)), allowedLimiter());
      expect(response.status).toBe(400);
    }
  });

  test('supports editable JSURL2 directly in a URL without escaping its delimiters', async () => {
    const input = { definition, format: 'svg', width: 200, height: 120 };
    const response = await renderRequest(new Request(`https://vizzo.dev/x?data=${stringify(input)}`), allowedLimiter());
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('viewBox="0 0 200 120"');
  });

  test.each(['(definition~*?', '(definition~_Unknown)', '////', 'ew==', 'abc=', 'bad===', '💡'])(
    'rejects malformed codec data: %j',
    async (data) => {
      const response = await renderRequest(queryRequest(data), allowedLimiter());
      expect(response.status).toBe(400);
    },
  );

  test('bounds decoded base64 JSON bytes without rejecting encoding overhead', async () => {
    const json = JSON.stringify({ definition, format: 'svg' });
    const body = json + ' '.repeat(1024 * 1024 - json.length);
    const accepted = await renderRequest(queryRequest(Buffer.from(body).toString('base64')), allowedLimiter());
    expect(accepted.status).toBe(200);
    const rejected = await renderRequest(queryRequest(Buffer.from(`${body} `).toString('base64')), allowedLimiter());
    expect(rejected.status).toBe(413);
  });

  test('bounds decoded JSURL2 JSON bytes without rejecting escaping overhead', async () => {
    const input = { definition, format: 'svg', background: '' };
    input.background = '#'.repeat(1024 * 1024 - JSON.stringify(input).length);
    const accepted = await renderRequest(queryRequest(stringify(input)), allowedLimiter());
    expect(accepted.status).toBe(200);
    const rejected = await renderRequest(
      queryRequest(stringify({ ...input, background: `${input.background}#` })),
      allowedLimiter(),
    );
    expect(rejected.status).toBe(413);
  });

  test.each(encodings)('rejects quoted JSON strings containing $name envelopes', async ({ encode }) => {
    const response = await renderRequest(queryRequest(JSON.stringify(encode({ definition }))), allowedLimiter());
    expect(response.status).toBe(400);
  });

  test.each(['A'.repeat(Math.ceil((1024 * 1024) / 3) * 4 + 1), `(${'A'.repeat(1024 * 1024 * 2)}`])(
    'bounds encoded data before decoding',
    async (data) => {
      const response = await renderRequest(queryRequest(data), allowedLimiter());
      expect(response.status).toBe(413);
    },
  );

  test('parses query options for the TanStack HEAD fallback', async () => {
    const head = new Request(queryRequest({ definition }, { width: '200', height: '120', format: 'svg' }), {
      method: 'HEAD',
    });
    const response = await renderRequest(head, allowedLimiter());
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(await response.text()).toContain('viewBox="0 0 200 120"');
  });

  test('defaults to the same PNG as POST without a content type', async () => {
    const limiter = allowedLimiter();
    const response = await renderRequest(queryRequest({ definition }), limiter);
    const post = await renderRequest(request({ definition }), allowedLimiter());
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(limiter.limit).toHaveBeenCalledWith({ key: '203.0.113.1' });
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(await post.arrayBuffer()));
  });

  test.each(['svg', 'png', 'webp'] as const)('query options override JSON options for %s', async (format) => {
    const input = { definition, width: 400, height: 240, format: 'svg', theme: 'light', background: '#000' };
    const response = await renderRequest(
      queryRequest(input, { width: '200', height: '120', format, theme: 'dark', background: '#fff' }),
      allowedLimiter(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(format === 'svg' ? 'image/svg+xml' : `image/${format}`);
    const expected = await render({ definition, width: 200, height: 120, format, theme: 'dark', background: '#fff' });
    expect(response.headers.get('Content-Security-Policy')).toBe(
      "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    );
    const bytes = typeof expected.data === 'string' ? new TextEncoder().encode(expected.data) : expected.data;
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(bytes));
  });

  test('applies query overrides before validating JSON options', async () => {
    const response = await renderRequest(
      queryRequest(
        { definition, width: 'invalid', height: -1, format: 'jpeg' },
        { width: '200', height: '120', format: 'svg' },
      ),
      allowedLimiter(),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('viewBox="0 0 200 120"');
  });

  test('preserves JSON options when query overrides are omitted', async () => {
    const response = await renderRequest(
      queryRequest({ definition, width: 200, height: 120, format: 'svg' }),
      allowedLimiter(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
    expect(await response.text()).toContain('viewBox="0 0 200 120"');
  });

  test.each(['width', 'height'])('GET and POST report the same %s limit errors', async (dimension) => {
    const post = await renderRequest(request({ definition, [dimension]: 2001 }), allowedLimiter());
    const get = await renderRequest(queryRequest({ definition }, { [dimension]: '2001' }), allowedLimiter());
    expect(post.status).toBe(400);
    expect(get.status).toBe(400);
    expect(await get.json()).toEqual(await post.json());
  });

  test.each(['width', 'data'])('rejects repeated scalar query parameters: %s', async (parameter) => {
    const url = new URL(queryRequest({ definition }, { width: '200' }).url);
    url.searchParams.append(parameter, url.searchParams.get(parameter) ?? '');
    const response = await renderRequest(new Request(url), allowedLimiter());
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('issues');
  });

  test('accepts presets in query parameters', async () => {
    const response = await renderRequest(
      queryRequest({ definition }, { preset: 'og', format: 'svg' }),
      allowedLimiter(),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('viewBox="0 0 1200 630"');
  });

  const invalidQueryOptions: Record<string, string>[] = [
    { width: '2001' },
    { height: '2001' },
    { width: '0' },
    { width: '' },
    { width: '1.5' },
    { width: 'nope' },
    { width: 'Infinity' },
    { format: 'jpeg' },
    { font: '/tmp/font.ttf' },
    { definition: JSON.stringify(definition) },
  ];
  test.each(invalidQueryOptions)('validates query options: %j', async (options) => {
    const response = await renderRequest(queryRequest({ definition }, options), allowedLimiter());
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('issues');
  });

  test.each(['{', '', 'null', '[]', '1', '"text"'])('rejects malformed or invalid data: %j', async (data) => {
    const response = await renderRequest(queryRequest(data), allowedLimiter());
    expect(response.status).toBe(400);
  });

  test('requires the data parameter', async () => {
    const response = await renderRequest(new Request('https://vizzo.dev/x?width=200'), allowedLimiter());
    expect(response.status).toBe(400);
    expect(await response.json()).toHaveProperty('issues');
  });

  test('bounds decoded data by UTF-8 bytes', async () => {
    const response = await renderRequest(
      queryRequest({ definition, background: '€'.repeat(Math.ceil((1024 * 1024) / 3)) }),
      allowedLimiter(),
    );
    expect(response.status).toBe(413);
  });

  test('bounds all decoded data before parsing repeated query parameters', async () => {
    const url = new URL(queryRequest({ definition }).url);
    url.searchParams.append('data', '€'.repeat(Math.ceil((1024 * 1024) / 3)));
    const response = await renderRequest(new Request(url), allowedLimiter());
    expect(response.status).toBe(413);
  });

  test('counts data rows across every mark', async () => {
    const mark = { type: 'dot', data: Array.from({ length: 5001 }, () => ({ x: 1, y: 2 })) };
    const response = await renderRequest(
      queryRequest({ definition: { ...definition, marks: [mark, mark] } }),
      allowedLimiter(),
    );
    expect(response.status).toBe(400);
    expect(JSON.stringify(await response.json())).toContain('10000 total data rows');
  });

  test('uses the same rate limiter as POST before parsing data', async () => {
    let remaining = 1;
    const limiter = { limit: mock(async () => ({ success: remaining-- > 0 })) } satisfies RateLimit;
    const post = await renderRequest(request({ definition, format: 'svg' }), limiter);
    const response = await renderRequest(queryRequest('{'), limiter);
    expect(post.status).toBe(200);
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(response.headers.get('Access-Control-Expose-Headers')).toBe('Retry-After');
    expect(limiter.limit).toHaveBeenNthCalledWith(1, { key: '203.0.113.1' });
    expect(limiter.limit).toHaveBeenNthCalledWith(2, { key: '203.0.113.1' });
  });
});

describe('image caching', () => {
  test.each(['png', 'svg', 'webp'])('successful GET %s images have a 30-day public TTL', async (format) => {
    const response = await renderRequest(queryRequest({ definition }, { format }), allowedLimiter());
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=2592000');
  });

  test('invalid requests and rate-limit responses cannot enter a shared cache', async () => {
    const invalid = await renderRequest(queryRequest({ definition }, { theme: 'invalid' }), allowedLimiter());
    expect(invalid.status).toBe(400);
    expect(invalid.headers.get('Cache-Control')).toBe('no-store');
    const limited = await renderRequest(queryRequest({ definition }), { limit: async () => ({ success: false }) });
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Cache-Control')).toBe('no-store');
  });
});
