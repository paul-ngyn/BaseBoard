// Mirrors /design-tokens.json at the repo root — keep in sync with
// web/tailwind config so the two apps can't drift.
export const colors = {
  canvas: '#e7ddcc',
  bg: '#f4efe6',
  surface: '#ece3d4',
  sidebar: '#efe7d8',
  text: '#2a2018',
  textSecondary: '#7a6a58',
  textSecondaryAlt: '#8a7860',
  textMuted: '#9a8367',
  textMutedAlt: '#b0a087',
  accent: '#8a5a2b',
  accent600: '#744a22',
  accent700: '#5e3b1a',
  divider: 'rgba(42,32,24,0.1)',
  dividerStrong: 'rgba(42,32,24,0.12)',
};

export const stageColors: Record<string, { bg: string; fg: string; isDone?: boolean }> = {
  'Lead / Estimate': { bg: '#cbb488', fg: '#3a2e18' },
  Measure: { bg: '#c39a5a', fg: '#ffffff' },
  'Quote Sent': { bg: '#d98f3d', fg: '#3a2308' },
  Approved: { bg: '#b5701f', fg: '#ffffff' },
  'Materials Ordered': { bg: '#a9581f', fg: '#ffffff' },
  Scheduled: { bg: '#8a6d3b', fg: '#ffffff' },
  'Install In Progress': { bg: '#9c4a22', fg: '#ffffff' },
  'Sanding / Finishing': { bg: '#7d5a2e', fg: '#ffffff' },
  'Final Walkthrough': { bg: '#5f6b3a', fg: '#ffffff' },
  Complete: { bg: '#4a7a44', fg: '#ffffff', isDone: true },
  'Invoiced / Paid': { bg: '#3c5f34', fg: '#ffffff', isDone: true },
};

export const radius = {
  card: 10,
  cardLg: 14,
  pill: 100,
};

export const fontFamily = {
  regular: 'SourceSerif4_400Regular',
  semibold: 'SourceSerif4_600SemiBold',
};
