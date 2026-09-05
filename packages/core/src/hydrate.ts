import {
  areaY,
  barX,
  barY,
  type ChartKey,
  type ChartMark,
  colorLegend,
  dot,
  lineX,
  lineY,
  ruleX,
  ruleY,
  type StaticChartDefinition,
} from '@tanstack/charts';
import { pie, polar, radialArc } from '@tanstack/charts/polar';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal';
import { scalePoint } from '@tanstack/charts/scales/point';
import type { ChartAxisInput, ChartColorInput, ChartDefinitionInput, ChartMarkInput, ScaleKind } from '@vizzo/schemas';
import { scaleUtc } from 'd3-scale';

/**
 * Turns a JSON-serializable chart definition into a real TanStack Charts
 * `StaticChartDefinition`. This is a 1:1 encoding of TanStack's own mark and
 * scale factory calls (same names, same options) so a chart.json file can
 * describe them without executing JavaScript. It is not a competing grammar.
 */

type UntypedMark = (data: readonly unknown[], options?: Record<string, unknown>) => ChartMark;

const CARTESIAN_MARKS: Record<string, UntypedMark> = {
  lineY: lineY as UntypedMark,
  lineX: lineX as UntypedMark,
  areaY: areaY as UntypedMark,
  barY: barY as UntypedMark,
  barX: barX as UntypedMark,
  ruleY: ruleY as UntypedMark,
  ruleX: ruleX as UntypedMark,
  dot: dot as UntypedMark,
};

function buildScale(kind: ScaleKind, padding: number | undefined) {
  switch (kind) {
    case 'linear':
      return scaleLinear;
    case 'ordinal':
      return scaleOrdinal;
    case 'utc':
      return scaleUtc;
    case 'band':
      return () => (padding == null ? scaleBand() : scaleBand().padding(padding));
    case 'point':
      return () => (padding == null ? scalePoint() : scalePoint().padding(padding));
    default:
      throw new Error(`Unsupported scale kind: ${kind satisfies never}`);
  }
}

function buildAxis(axis: ChartAxisInput | null | undefined) {
  if (axis === null) return null;
  if (axis === undefined) return undefined;
  return {
    scale: buildScale(axis.scale ?? 'linear', axis.padding),
    nice: axis.nice,
    grid: axis.grid,
    axis: axis.axis === false ? (false as const) : axis.label ? { label: axis.label } : undefined,
  };
}

function coerceTemporalField(data: readonly unknown[], fieldKey: unknown, kind: ScaleKind | undefined) {
  if (kind !== 'utc' || typeof fieldKey !== 'string') return data;
  return data.map((row) => {
    if (!row || typeof row !== 'object' || !(fieldKey in row)) return row;
    const value = (row as Record<string, unknown>)[fieldKey];
    if (typeof value !== 'string' && typeof value !== 'number') return row;
    return { ...row, [fieldKey]: new Date(value) };
  });
}

function buildMark(mark: ChartMarkInput, x: ChartAxisInput | null | undefined, y: ChartAxisInput | null | undefined) {
  const fn = CARTESIAN_MARKS[mark.type];
  if (!fn) throw new Error(`Unsupported mark type for a cartesian chart: "${mark.type}"`);
  const options = mark.options ?? {};
  const withX = coerceTemporalField(mark.data, options.x, x?.scale);
  const withY = coerceTemporalField(withX, options.y, y?.scale);
  return fn(withY, options);
}

function buildColor(color: ChartColorInput | undefined) {
  if (!color) return undefined;
  return {
    domain: color.domain,
    range: color.range,
    legend: color.legend
      ? colorLegend(typeof color.legend === 'object' ? { label: color.legend.label } : {})
      : undefined,
  };
}

/**
 * `defineChart(spec)` with no second argument is an identity function at
 * runtime (see @tanstack/charts/dist/scene.js); it only narrows types for a
 * literal spec object, which a JSON-driven definition can never provide. We
 * build the plain spec object ourselves and hand it straight to
 * `createChartScene`.
 */
function hydratePieDefinition(input: ChartDefinitionInput, pieMark: ChartMarkInput): StaticChartDefinition {
  const options = pieMark.options ?? {};
  const valueField = options.value;
  if (typeof valueField !== 'string') {
    throw new Error('A "pie" mark requires a string "value" option naming the numeric field.');
  }
  const colorField = typeof options.color === 'string' ? options.color : valueField;
  const keyField = typeof options.key === 'string' ? options.key : colorField;

  const slices = pie(pieMark.data as readonly Record<string, unknown>[], {
    value: (datum) => datum[valueField] as number,
  });
  const arc = radialArc(slices, {
    startAngle: (datum) => datum.startAngle,
    endAngle: (datum) => datum.endAngle,
    color: (datum) => datum[colorField] as ChartKey,
    key: (datum) => datum[keyField] as ChartKey,
    innerRadius: typeof options.innerRadius === 'number' ? options.innerRadius : 0,
    cornerRadius: typeof options.cornerRadius === 'number' ? options.cornerRadius : undefined,
  });

  return {
    marks: [
      polar({
        inset: typeof options.inset === 'number' ? options.inset : 8,
        radiusRatio: typeof options.radiusRatio === 'number' ? options.radiusRatio : 0.82,
        marks: [arc],
      }),
    ],
    color: buildColor(input.color),
    theme: input.theme,
  } as unknown as StaticChartDefinition;
}

function hydrateCartesianDefinition(input: ChartDefinitionInput): StaticChartDefinition {
  return {
    marks: input.marks.map((mark) => buildMark(mark, input.x, input.y)),
    x: buildAxis(input.x),
    y: buildAxis(input.y),
    color: buildColor(input.color),
    margin: input.margin,
    guides: input.guides,
    clip: input.clip,
    theme: input.theme,
  } as unknown as StaticChartDefinition;
}

export function hydrateDefinition(input: ChartDefinitionInput): StaticChartDefinition {
  const pieMark = input.marks.find((mark) => mark.type === 'pie');
  return pieMark ? hydratePieDefinition(input, pieMark) : hydrateCartesianDefinition(input);
}
