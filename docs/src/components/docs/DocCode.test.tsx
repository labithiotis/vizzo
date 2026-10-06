import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { DocCode } from './DocCode';
import { DocMarkdown } from './DocMarkdown';

test.each([
  ['json', '{ "width": 960, "theme": "dark" }', 'property'],
  ['ts', 'const width: number = 960;', 'keyword'],
  ['sh', '# Render a chart\nnpx vizzo chart.json chart.png --theme dark', 'comment'],
])('code blocks highlight %s without nested containers', (language, text, token) => {
  const html = renderToStaticMarkup(<DocCode text={text} label="Example" language={language} />);
  expect(html).toContain(`class="th-${token}"`);
  expect(html.match(/<pre\b/g)).toHaveLength(1);
  expect(html.match(/<code\b/g)).toHaveLength(1);
});

test('Markdown highlights fenced JSON while preserving inline code and escaping HTML', () => {
  const text = 'Use `render()`:\n\n```json\n{ "label": "<script>alert(1)</script>", "width": 960 }\n```';
  const html = renderToStaticMarkup(<DocMarkdown text={text} />);
  expect(html).toContain('>render()</code>');
  expect(html).toContain('class="th-property"');
  expect(html).toContain('class="th-number"');
  expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  expect(html).not.toContain('<script>');
  expect(html.match(/<pre\b/g)).toHaveLength(1);
});

test('unknown languages fall back to escaped plaintext', () => {
  const html = renderToStaticMarkup(
    <DocCode text={'<img src=x onerror="alert(1)">'} label="Example" language="unknown" />,
  );
  expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  expect(html).not.toContain('<img');
});
