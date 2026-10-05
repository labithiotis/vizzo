import type { BlockNode, InlineNode } from '@tanstack/markdown';
import { parseMarkdown } from '@tanstack/markdown/parser';
import type { DocPage } from '~/documentation';

export function docPageMarkdown(page: DocPage) {
  return `# ${page.title}\n\n${page.description}\n\n${page.markdown}`;
}

function inlineText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
        case 'inlineCode':
          return node.value;
        case 'link':
          return `${inlineText(node.children)} (${node.href})`;
        case 'image':
          return `${node.alt} (${node.src})`;
        case 'break':
          return '\n';
        case 'footnoteReference':
          return `[${node.number}]`;
        case 'inlineHtml':
          return '';
        default:
          return inlineText(node.children);
      }
    })
    .join('');
}

function blockText(nodes: BlockNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'heading':
        case 'paragraph':
          return inlineText(node.children);
        case 'code':
          return node.value;
        case 'list':
          return node.items
            .map((item, index) => `${node.ordered ? `${(node.start ?? 1) + index}.` : '•'} ${blockText(item.children)}`)
            .join('\n');
        case 'table':
          return [node.header, ...node.rows]
            .map((row) => row.map((cell) => inlineText(cell.children)).join('\t'))
            .join('\n');
        case 'footnotes':
          return node.items.map((item) => `[${item.number}] ${blockText(item.children)}`).join('\n');
        case 'html':
        case 'thematicBreak':
          return '';
        case 'callout':
          return `${node.title}\n${blockText(node.children)}`;
        default:
          return blockText(node.children);
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

export function markdownToText(markdown: string) {
  return blockText(parseMarkdown(markdown, { allowHtml: true }).children);
}

export function docPagePrompt(page: DocPage) {
  return `Use this Vizzo documentation to help me render a TanStack Charts definition as an image. Follow the documented options and examples. Ask what chart I need before suggesting a definition.\n\nSource: https://vizzo.dev/docs/${page.slug || 'index'}.md\n\n${docPageMarkdown(page)}`;
}
