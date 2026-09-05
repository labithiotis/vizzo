import { z } from 'zod';

export const FORMATS = ['svg', 'png', 'webp'] as const;
export type ChartFormat = (typeof FORMATS)[number];

export const THEMES = ['light', 'dark'] as const;
export type ChartThemeName = (typeof THEMES)[number];

export const SOCIAL_PRESETS = {
  og: { width: 1200, height: 630 },
  twitter: { width: 1200, height: 675 },
  linkedin: { width: 1200, height: 627 },
  discord: { width: 1200, height: 630 },
} as const;
export type SocialPresetName = keyof typeof SOCIAL_PRESETS;

export const MARK_TYPES = ['lineY', 'lineX', 'areaY', 'barY', 'barX', 'ruleY', 'ruleX', 'dot', 'pie'] as const;
export type MarkType = (typeof MARK_TYPES)[number];

export const SCALE_KINDS = ['linear', 'band', 'point', 'ordinal', 'utc'] as const;
export type ScaleKind = (typeof SCALE_KINDS)[number];

/**
 * A JSON encoding of one TanStack Charts mark call: `type` is the exported
 * function name (e.g. `lineY`), `data` and `options` are passed through
 * unchanged as that function's arguments.
 */
export const chartMarkSchema = z.object({
  type: z.enum(MARK_TYPES),
  data: z.array(z.unknown()),
  options: z.record(z.string(), z.unknown()).optional(),
});
export type ChartMarkInput = z.infer<typeof chartMarkSchema>;

export const chartAxisSchema = z.object({
  scale: z.enum(SCALE_KINDS).optional(),
  padding: z.number().optional(),
  nice: z.boolean().optional(),
  grid: z.boolean().optional(),
  label: z.string().optional(),
  axis: z.boolean().optional(),
});
export type ChartAxisInput = z.infer<typeof chartAxisSchema>;

export const chartColorSchema = z.object({
  domain: z.array(z.unknown()).optional(),
  range: z.array(z.string()).optional(),
  legend: z.union([z.boolean(), z.object({ label: z.string().optional() })]).optional(),
});
export type ChartColorInput = z.infer<typeof chartColorSchema>;

export const chartThemeSchema = z.object({
  foreground: z.string().optional(),
  muted: z.string().optional(),
  grid: z.string().optional(),
  background: z.string().optional(),
  palette: z.array(z.string()).optional(),
});
export type ChartThemeInput = z.infer<typeof chartThemeSchema>;

/** A thin JSON encoding of a TanStack Charts `ChartSpec`. Not a competing chart grammar. */
export const chartDefinitionSchema = z.object({
  marks: z.array(chartMarkSchema).min(1),
  x: chartAxisSchema.nullish(),
  y: chartAxisSchema.nullish(),
  color: chartColorSchema.optional(),
  margin: z.union([z.number(), z.record(z.string(), z.number())]).optional(),
  guides: z.boolean().optional(),
  clip: z.boolean().optional(),
  theme: chartThemeSchema.optional(),
});
export type ChartDefinitionInput = z.infer<typeof chartDefinitionSchema>;

export const renderOptionsSchema = z.object({
  definition: chartDefinitionSchema,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.enum(FORMATS).optional(),
  theme: z.enum(THEMES).optional(),
  preset: z.enum(Object.keys(SOCIAL_PRESETS) as [SocialPresetName, ...SocialPresetName[]]).optional(),
  background: z.string().optional(),
});
export type RenderOptionsInput = z.infer<typeof renderOptionsSchema>;
