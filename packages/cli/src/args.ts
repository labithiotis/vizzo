import { parseArgs } from 'node:util';

export interface RenderCliOptions {
  files: string[];
  output?: string;
  width?: number;
  height?: number;
  format?: 'svg' | 'png' | 'webp';
  theme?: 'light' | 'dark';
  preset?: string;
  background?: string;
  font?: string;
  help?: boolean;
}

export function parseRenderArgs(argv: readonly string[]): RenderCliOptions {
  const { values, positionals } = parseArgs({
    args: argv as string[],
    allowPositionals: true,
    options: {
      output: { type: 'string', short: 'o' },
      width: { type: 'string', short: 'w' },
      height: { type: 'string', short: 'h' },
      format: { type: 'string', short: 'f' },
      theme: { type: 'string', short: 't' },
      preset: { type: 'string', short: 'p' },
      background: { type: 'string' },
      font: { type: 'string' },
      help: { type: 'boolean' },
    },
  });

  return {
    files: positionals,
    output: values.output,
    width: values.width ? Number(values.width) : undefined,
    height: values.height ? Number(values.height) : undefined,
    format: values.format as RenderCliOptions['format'],
    theme: values.theme as RenderCliOptions['theme'],
    preset: values.preset,
    background: values.background,
    font: values.font,
    help: values.help,
  };
}
