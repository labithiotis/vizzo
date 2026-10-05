import documentation from './documentation.gen.json';

export const docPages = documentation.pages;
export const chartExamples = documentation.examples;
export type DocPage = (typeof docPages)[number];
export type ChartExample = (typeof chartExamples)[number];

export function findDocPage(slug: string) {
  return docPages.find((page) => page.slug === slug);
}
