import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { render } from '@vizzo/core';
import { renderOptionsSchema } from '@vizzo/schemas';
import { parse } from 'jsurl2';
import { z } from 'zod';
import { createDocumentation } from '../scripts/generateDocs';
import { chartExamples, docPages } from './documentation';
import { renderRequest } from './render';

const docsDirectory = resolve(import.meta.dir, '..');

test('published documentation and examples match their canonical source files', async () => {
  const documentation = await createDocumentation();
  expect(docPages).toEqual(documentation.pages);
  expect<unknown>(chartExamples).toEqual(documentation.examples);
  for (const page of documentation.pages) {
    const raw = await readFile(resolve(docsDirectory, `public/docs/${page.slug || 'index'}.md`), 'utf8');
    expect(raw).toBe(`# ${page.title}\n\n${page.description}\n\n${page.markdown}`);
    expect(raw).not.toContain('{{');
  }
});

test('each editable JSURL2 URL returns the same image as its JSON definition', async () => {
  for (const example of chartExamples) {
    const url = new URL(example.url);
    const data = url.searchParams.get('data');
    expect(data).not.toBeNull();
    expect(data?.startsWith('(')).toBe(true);
    expect<unknown>(parse(data || '')).toEqual(example.options);
    expect(example.url).not.toContain('%22');
    const response = await renderRequest(new Request(example.url), { limit: async () => ({ success: true }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    const rendered = await render({
      ...renderOptionsSchema.parse(example.options),
      width: 960,
      height: 540,
      theme: 'light',
      format: 'png',
    });
    if (typeof rendered.data === 'string') throw new Error('Expected PNG bytes');
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(rendered.data));
    const post = await renderRequest(
      new Request('https://vizzo.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: example.json,
      }),
      { limit: async () => ({ success: true }) },
    );
    expect(post.status).toBe(200);
    expect(new Uint8Array(await post.arrayBuffer())).toEqual(new Uint8Array(rendered.data));
  }
});

test('static previews are the renderer output and downloaded JSON contains the same chart', async () => {
  for (const example of chartExamples) {
    const raw = await readFile(resolve(docsDirectory, `public/docs/examples/${example.id}.json`), 'utf8');
    expect<unknown>(renderOptionsSchema.parse(JSON.parse(raw))).toEqual(example.options);
    const svg = await readFile(resolve(docsDirectory, `public/docs/examples/${example.id}.svg`), 'utf8');
    const rendered = await render({
      ...renderOptionsSchema.parse(example.options),
      width: 960,
      height: 540,
      theme: 'light',
      format: 'svg',
    });
    if (typeof rendered.data !== 'string') throw new Error('Expected SVG text');
    expect(svg).toBe(rendered.data);
    expect(example.post).not.toContain('\n+');
    expect(example.command).toContain(`${example.id}.json ${example.id}.png`);
  }
});

test('standalone JSON, inline CLI, and HTTP TypeScript definitions in the guides render', async () => {
  const envelopes = [];
  for (const page of docPages) {
    for (const match of page.markdown.matchAll(/```json\n([\s\S]*?)\n```/g)) {
      const input = JSON.parse(match[1] || 'null');
      if (typeof input === 'object' && input !== null && 'definition' in input) envelopes.push(input);
    }
    for (const match of page.markdown.matchAll(/npx vizzo '([^']+)' chart\.png/g))
      envelopes.push(JSON.parse(match[1] || 'null'));
  }
  const http = docPages.find((page) => page.slug === 'http');
  const definition = http?.markdown.match(/const envelope = ([\s\S]*?);\n\nconst url/);
  expect(definition).not.toBeNull();
  const readEnvelope = new Function(`return (${definition?.[1]});`);
  envelopes.push(readEnvelope());
  expect(envelopes.length).toBeGreaterThanOrEqual(4);
  for (const envelope of envelopes) {
    const result = await render({ ...renderOptionsSchema.parse(envelope), format: 'svg' });
    expect(result.data).toContain('<svg');
  }
});

test('LLM exports contain complete concrete guides and schema comes from Zod', async () => {
  const index = await readFile(resolve(docsDirectory, 'public/llms.txt'), 'utf8');
  const complete = await readFile(resolve(docsDirectory, 'public/llms-full.txt'), 'utf8');
  for (const page of docPages) {
    expect(index).toContain(`https://vizzo.dev/docs/${page.slug || 'index'}.md`);
    expect(complete).toContain(page.markdown);
  }
  for (const example of chartExamples) expect(complete).toContain(example.url);
  const schema = JSON.parse(await readFile(resolve(docsDirectory, 'public/schema.json'), 'utf8'));
  expect(schema).toEqual(z.toJSONSchema(renderOptionsSchema));
  expect(schema.required).toEqual(['definition']);
});
