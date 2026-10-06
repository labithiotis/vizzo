import examples from './chartExamples.gen.json';

export const chartExamples = examples;
export type ChartExample = (typeof chartExamples)[number];
