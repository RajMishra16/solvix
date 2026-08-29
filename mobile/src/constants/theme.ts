// Solvix Theme Colors
// Converted from oklch to hex for React Native compatibility

export const Colors = {
  // Primary - Teal/Emerald Green
  primary: '#0d9373',
  primaryLight: '#14b8a6',
  primaryDark: '#0a7560',
  primaryForeground: '#f0fdfa',

  // Backgrounds
  background: '#ffffff',
  backgroundDark: '#1c1917',

  // Cards
  card: '#ffffff',
  cardDark: '#292524',

  // Text
  foreground: '#1c1917',
  foregroundDark: '#fafaf9',

  // Muted
  muted: '#f5f5f4',
  mutedDark: '#44403c',
  mutedForeground: '#78716c',
  mutedForegroundDark: '#a8a29e',

  // Accent
  accent: '#f5f5f4',
  accentDark: '#44403c',

  // Chart colors (teal variants)
  chart1: '#5eead4',
  chart2: '#2dd4bf',
  chart3: '#14b8a6',
  chart4: '#0d9373',
  chart5: '#0f766e',

  // Destructive
  destructive: '#ef4444',

  // Borders
  border: '#e7e5e4',
  borderDark: 'rgba(255, 255, 255, 0.1)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 48,
} as const;

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
