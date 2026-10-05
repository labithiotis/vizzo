import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseMarkdown } from '@tanstack/markdown/parser';
import { render } from '@vizzo/core';
import { renderOptionsSchema } from '@vizzo/schemas';
import { stringify } from 'jsurl2';
import { z } from 'zod';

const docsDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const guides = [
  {
    slug: '',
    file: 'QUICKSTART',
    title: 'Make a chart. Send an image.',
    label: 'Quick start',
    description: 'Turn a TanStack Charts definition into an image with a URL, the CLI, or a POST request.',
  },
  {
    slug: 'cli',
    file: 'CLI',
    title: 'Render from your terminal',
    label: 'CLI',
    description: 'One command for a local chart. The same command for a scheduled report, a bot, or a CI job.',
  },
  {
    slug: 'http',
    file: 'HTTP',
    title: 'A URL that makes a chart',
    label: 'URL & HTTP API',
    description: 'Open an editable JSURL2 link or send JSON. Get back PNG, SVG, or WebP bytes.',
  },
  {
    slug: 'chart-definitions',
    file: 'CHART_DEFINITIONS',
    title: 'The TanStack Charts grammar',
    label: 'Chart definitions',
    description: 'Marks, data, scales, and colors. Vizzo keeps the names and options you know from TanStack Charts.',
  },
  {
    slug: 'examples',
    file: 'EXAMPLES',
    title: 'Pick a chart. Make it yours.',
    label: 'Chart gallery',
    description:
      'Lines, bars, layered areas, multiple series, dates, and proportions. Every image starts with the same small JSON envelope.',
  },
  {
    slug: 'reference',
    file: 'REFERENCE',
    title: 'Options at a glance',
    label: 'Reference',
    description: 'Output formats, dimensions, themes, presets, and the shape of a render request.',
  },
];

const specimens = [
  {
    id: 'line',
    title: 'Monthly revenue',
    description: 'A line with points makes a compact update for your team.',
    mark: 'lineY',
    use: 'Team updates',
    accent: '#2563eb',
  },
  {
    id: 'multi-series',
    title: 'Compare the trend',
    description: 'Group lines by a field, then give the series a shared color legend.',
    mark: 'lineY + color',
    use: 'Release reports',
    accent: '#e3402a',
  },
  {
    id: 'bar',
    title: 'Compare categories',
    description: 'Use a band scale when the order is categorical, not continuous.',
    mark: 'barY',
    use: 'Quick comparisons',
    accent: '#16a34a',
  },
  {
    id: 'area',
    title: 'Show the whole week',
    description: 'Layer an area and a line over the same data to give the trend weight.',
    mark: 'areaY + lineY',
    use: 'Weekly digests',
    accent: '#0891b2',
  },
  {
    id: 'time-series',
    title: 'Put time on the axis',
    description: 'ISO date strings and a UTC scale keep the timeline consistent.',
    mark: 'lineY + utc',
    use: 'Monthly reports',
    accent: '#7c3aed',
  },
  {
    id: 'pie',
    title: 'See the proportions',
    description: 'A pie mark and an ordinal color legend show the share of each category.',
    mark: 'pie',
    use: 'Share of total',
    accent: '#d97706',
  },
];

export async function createDocumentation() {
  const examples = await Promise.all(
    specimens.map(async (specimen) => {
      const source = await readFile(resolve(docsDirectory, `../packages/e2e/charts/${specimen.id}.json`), 'utf8');
      const options = renderOptionsSchema.parse({ ...JSON.parse(source), theme: 'light' });
      const json = `${JSON.stringify(options, null, 2)}\n`;
      const url = `https://vizzo.dev/x?width=960&height=540&theme=light&data=${stringify(options)}`;
      const command = `npx vizzo ${specimen.id}.json ${specimen.id}.png --theme light`;
      const post = `curl https://vizzo.dev/ \\\n  -H 'Content-Type: application/json' \\\n  --data-binary @${specimen.id}.json \\\n  --output ${specimen.id}.png`;
      return { ...specimen, options, json, url, darkUrl: url.replace('theme=light', 'theme=dark'), command, post };
    }),
  );

  const pages = await Promise.all(
    guides.map(async (guide) => {
      const source = await readFile(resolve(docsDirectory, `content/${guide.file}.md`), 'utf8');
      const markdown = source.replace(/\{\{([a-z-]+)\.(json|url|darkUrl|command|post)\}\}/g, (_, id, field) => {
        const example = examples.find((item) => item.id === id);
        if (!example) throw new Error(`Unknown documentation example: ${id}`);
        if (field === 'json') return example.json.trimEnd();
        if (field === 'url') return example.url;
        if (field === 'darkUrl') return example.darkUrl;
        if (field === 'command') return example.command;
        return example.post;
      });
      if (markdown.includes('{{')) throw new Error(`Unexpanded placeholder in ${guide.file}`);
      const [intro = '', notes = '', sharing = ''] = markdown.split(/<!-- (?:examples|sharing) -->/);
      return { ...guide, markdown, gallerySections: guide.slug === 'examples' ? { intro, notes, sharing } : null };
    }),
  );
  return { pages, examples };
}

async function write(path: string, content: string) {
  const filename = resolve(docsDirectory, path);
  await mkdir(dirname(filename), { recursive: true });
  await writeFile(filename, content);
}

export async function generateDocumentation() {
  const documentation = await createDocumentation();
  await write('src/documentation.gen.json', `${JSON.stringify(documentation, null, 2)}\n`);
  for (const page of documentation.pages) {
    const markdown = `# ${page.title}\n\n${page.description}\n\n${page.markdown}`;
    parseMarkdown(markdown);
    await write(`public/docs/${page.slug || 'index'}.md`, markdown);
  }
  for (const example of documentation.examples) {
    await write(`public/docs/examples/${example.id}.json`, example.json);
    const result = await render({ ...example.options, width: 960, height: 540, format: 'svg', theme: 'light' });
    if (typeof result.data !== 'string') throw new Error(`Expected SVG for ${example.id}`);
    await write(`public/docs/examples/${example.id}.svg`, result.data);
  }
  await write(
    'public/llms.txt',
    [
      '# Vizzo',
      '',
      '> Render JSON-encoded TanStack Charts definitions to PNG, SVG, and WebP. Use the CLI, GET /x with a JSURL2, JSON, or base64 data parameter, or POST / with a JSON body.',
      '',
      '## Documentation',
      ...documentation.pages.map(
        (page) => `- [${page.label}](https://vizzo.dev/docs/${page.slug || 'index'}.md): ${page.description}`,
      ),
      '- [Complete documentation](https://vizzo.dev/llms-full.txt)',
      '- [JSON Schema](https://vizzo.dev/schema.json): The render envelope. HTTP-specific limits are in the HTTP guide.',
      '',
    ].join('\n'),
  );
  await write(
    'public/llms-full.txt',
    [
      '# Vizzo documentation',
      '',
      ...documentation.pages.map(
        (page) =>
          `# ${page.title}\n\nSource: https://vizzo.dev/docs/${page.slug || 'index'}.md\n\n${page.description}\n\n${page.markdown}`,
      ),
    ].join('\n\n'),
  );
  await write('public/schema.json', `${JSON.stringify(z.toJSONSchema(renderOptionsSchema), null, 2)}\n`);
  console.log(
    `Generated ${documentation.pages.length} guides, ${documentation.examples.length} chart specimens, and LLM exports.`,
  );
}

if (import.meta.main) await generateDocumentation();
