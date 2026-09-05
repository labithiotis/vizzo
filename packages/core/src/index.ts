import { createChartScene } from '@tanstack/charts/scene';
import { renderChartSvg } from '@tanstack/charts/svg';
import {
  type ChartDefinitionInput,
  type ChartFormat,
  type ChartThemeName,
  chartDefinitionSchema,
  SOCIAL_PRESETS,
  type SocialPresetName,
} from '@vizzo/schemas';
import { hydrateDefinition } from './hydrate.ts';
import { svgToPng, svgToWebp } from './raster.ts';
import { THEME_PRESETS } from './theme.ts';

export type { ChartFormat, ChartThemeName, SocialPresetName } from '@vizzo/schemas';
export { SOCIAL_PRESETS } from '@vizzo/schemas';

export interface RenderOptions {
  definition: unknown;
  width?: number;
  height?: number;
  format?: ChartFormat;
  theme?: ChartThemeName;
  preset?: SocialPresetName;
  background?: string;
  ariaLabel?: string;
}

export interface RenderResult {
  format: ChartFormat;
  width: number;
  height: number;
  data: Uint8Array | string;
}

const DEFAULT_WIDTH = 960;
const DEFAULT_HEIGHT = 540;
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

function applyTheme(definition: ChartDefinitionInput, theme: ChartThemeName | undefined): ChartDefinitionInput {
  if (!theme) return definition;
  return { ...definition, theme: { ...THEME_PRESETS[theme], ...definition.theme } };
}

/** `renderChartSvg` targets DOM insertion and omits the xmlns namespace a standalone file needs. */
function toStandaloneSvg(svg: string): string {
  return svg.includes('xmlns=') ? svg : svg.replace('<svg ', `<svg xmlns="${SVG_NAMESPACE}" `);
}

export async function render(options: RenderOptions): Promise<RenderResult> {
  const definition = applyTheme(chartDefinitionSchema.parse(options.definition), options.theme);
  const preset = options.preset ? SOCIAL_PRESETS[options.preset] : undefined;
  const width = options.width ?? preset?.width ?? DEFAULT_WIDTH;
  const height = options.height ?? preset?.height ?? DEFAULT_HEIGHT;
  const format = options.format ?? 'svg';

  const chart = hydrateDefinition(definition);
  const scene = createChartScene(chart, { width, height });
  const svg = toStandaloneSvg(renderChartSvg(scene, { ariaLabel: options.ariaLabel ?? 'Chart' }));

  if (format === 'svg') return { format, width, height, data: svg };
  if (format === 'png') return { format, width, height, data: await svgToPng(svg, options.background) };
  return { format, width, height, data: await svgToWebp(svg, options.background) };
}
