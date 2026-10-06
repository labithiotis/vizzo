import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { docPages } from '~/documentation';
import { docPageMarkdown, docPagePrompt, markdownToText } from './docPageContent';

test('page copies and agent prompts include the complete published page', async () => {
  for (const page of docPages) {
    const published = await readFile(
      new URL(`../../../public/docs/${page.slug || 'index'}.md`, import.meta.url),
      'utf8',
    );
    expect(docPageMarkdown(page)).toBe(published);
    expect(docPagePrompt(page)).toContain(published);
    expect(docPagePrompt(page)).toContain(`https://vizzo.dev/docs/${page.slug || 'index'}.md`);
  }
});

test('plain text keeps chart URLs, code, lists and table values without Markdown formatting', () => {
  const code = 'const chart = { label: "**keep this**", value: 42 };';
  const markdown = `# Render **a chart**\n\nUse [the API](https://vizzo.dev/x?theme=dark&data=(width~960)).\n\n\`\`\`ts\n${code}\n\`\`\`\n\n3. Render\n4. Share\n\n| Option | Default |\n| --- | --- |\n| width | 800 |\n\n<!-- examples -->`;
  const text = markdownToText(markdown);
  expect(text).toContain('Render a chart');
  expect(text).toContain('the API (https://vizzo.dev/x?theme=dark&data=(width~960))');
  expect(text).toContain(code);
  expect(text).toContain('3. Render\n4. Share');
  expect(text).toContain('Option\tDefault\nwidth\t800');
  expect(text).not.toContain('```');
  expect(text).not.toContain('<!-- examples -->');
});
