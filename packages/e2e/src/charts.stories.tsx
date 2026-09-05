import type { Meta, StoryObj } from '@storybook/react-vite';
import { renderOptionsSchema } from '@vizzo/schemas';
import areaBaseline from '../baselines/area.png';
import barBaseline from '../baselines/bar.png';
import lineBaseline from '../baselines/line.png';
import multiSeriesBaseline from '../baselines/multi-series.png';
import pieBaseline from '../baselines/pie.png';
import timeSeriesBaseline from '../baselines/time-series.png';
import areaChart from '../charts/area.json';
import barChart from '../charts/bar.json';
import lineChart from '../charts/line.json';
import multiSeriesChart from '../charts/multi-series.json';
import pieChart from '../charts/pie.json';
import timeSeriesChart from '../charts/time-series.json';
import { ChartComparison } from './ChartComparison.tsx';

const meta = {
  title: 'Charts',
  component: ChartComparison,
  argTypes: {
    mode: { control: 'inline-radio', options: ['side-by-side', 'overlay'] },
    name: { table: { disable: true } },
    definition: { table: { disable: true } },
    baseline: { table: { disable: true } },
  },
  args: { mode: 'side-by-side' },
} satisfies Meta<typeof ChartComparison>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Parsing the envelope is what the CLI does, and it types the raw JSON import. */
function args(name: string, envelope: unknown, baseline: string) {
  return { name, definition: renderOptionsSchema.parse(envelope).definition, baseline };
}

export const Area: Story = { args: args('area', areaChart, areaBaseline) };
export const Bar: Story = { args: args('bar', barChart, barBaseline) };
export const Line: Story = { args: args('line', lineChart, lineBaseline) };
export const MultiSeries: Story = { args: args('multi-series', multiSeriesChart, multiSeriesBaseline) };
export const Pie: Story = { args: args('pie', pieChart, pieBaseline) };
export const TimeSeries: Story = { args: args('time-series', timeSeriesChart, timeSeriesBaseline) };
