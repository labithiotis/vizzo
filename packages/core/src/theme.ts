import type { ChartThemeInput, ChartThemeName } from '@vizzo/schemas';

export const THEME_PRESETS: Record<ChartThemeName, ChartThemeInput> = {
  light: {
    foreground: '#0f172a',
    muted: '#64748b',
    grid: '#e2e8f0',
    background: '#ffffff',
    palette: ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2'],
  },
  dark: {
    foreground: '#f8fafc',
    muted: '#94a3b8',
    grid: '#334155',
    background: '#0f172a',
    palette: ['#60a5fa', '#f87171', '#4ade80', '#fbbf24', '#a78bfa', '#22d3ee'],
  },
};
