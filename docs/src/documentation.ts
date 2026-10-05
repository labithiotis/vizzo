import documentation from './documentation.gen.json';

export { type ChartExample, chartExamples } from './chartExamples';

export const docPages = documentation.pages;
export type DocPage = (typeof docPages)[number];

export function findDocPage(slug: string) {
  return docPages.find((page) => page.slug === slug);
}
