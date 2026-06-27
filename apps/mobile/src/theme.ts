// PawSense Mobile — Design Tokens
// Mirrors the desktop CSS variables

export const Colors = {
  // Core palette
  greenDeep: '#1a3a2a',
  greenForest: '#2d5a3d',
  greenSage: '#7a9882',
  greenPale: '#e8f0eb',
  greenMist: '#b8cfc0',

  // Neutrals
  cream: '#f5f0e8',
  ivory: '#faf7f2',
  warmWhite: '#ede8df',

  // Text
  textPrimary: '#1a1a18',
  textBody: '#3d3d38',
  textMuted: '#6b6b63',
  textLight: '#9b9b90',

  // Gold accent
  gold: '#c4956a',

  // Semantic
  error: '#c03a2b',
  errorBg: '#fdf0ee',
  success: '#2d7a4f',
  successBg: '#edf7f1',

  // Base
  white: '#ffffff',
  black: '#000000',
}

export const Typography = {
  // Font families — loaded via @expo-google-fonts or system fallback
  display: 'Cormorant Garamond',   // headings
  body: 'DM Sans',                  // body text
  system: 'System',                 // fallback

  // Sizes
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
}

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
}

export const Shadow = {
  sm: {
    shadowColor: '#1a3a2a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1a3a2a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1a3a2a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
}