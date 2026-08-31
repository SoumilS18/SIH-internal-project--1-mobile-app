/**
 * constants/theme.ts
 * AgriOptima AI Mobile Design System & Tokens
 * A warm, modern, sophisticated agricultural design language inspired by earth, soil, crops, and sunlight.
 */

export const Colors = {
  // Brand Evergreen Palette
  primary: {
    dark: '#173024',       // Deep rich botanical forest
    main: '#244E38',       // Commanding organic green
    light: '#3D6E53',      // Soft sage green
    subtle: '#E8F1EC',     // Pale mist
    bg: '#F3F8F5',         // Clean tinted surface
  },
  // Warm Earth & Crop Accents
  accent: {
    terracotta: '#C65D3B',       // Warm Indian clay
    terracottaBg: '#FDF2EE',
    terracottaBorder: '#F5CEBF',
    ochre: '#D49A3D',            // Golden harvest sun
    ochreBg: '#FEF8EC',
    ochreBorder: '#FADFA8',
    sand: '#EADCC8',             // Fertile loam sand
    olive: '#5E7361',            // Muted foliage
    sky: '#357A9E',              // Monsoon cloud blue
    skyBg: '#EDF5F9',
    skyBorder: '#BEE0EE',
  },
  // Natural Warm Backgrounds & Surfaces
  neutral: {
    white: '#FFFFFF',
    background: '#FBF9F5',       // Soft sandstone cream canvas
    surface: '#FFFFFF',          // Card surface
    surfaceMuted: '#F3EFE8',     // Subtle recessed container
    surfaceElevated: '#FFFFFF',
    border: '#E6E1D7',           // Warm organic border
    borderLight: '#EFECE5',      // Gentle divider
    textPrimary: '#1B241E',      // Dark loam charcoal
    textSecondary: '#536257',    // Earthy slate
    textMuted: '#86958B',        // Muted sage gray
    darkBg: '#11231A',           // Dark container tone
  },
  // Status Colors (Organic & Clear)
  status: {
    success: '#287A4B',
    successBg: '#EBF7F0',
    successBorder: '#B9E4CD',
    warning: '#C27803',
    warningBg: '#FEF8EC',
    warningBorder: '#FADFA8',
    danger: '#C53B3B',
    dangerBg: '#FDF2F2',
    dangerBorder: '#F8C6C6',
    info: '#2A7B9B',
    infoBg: '#EDF6FA',
    infoBorder: '#BCE0EE',
  },
  weather: {
    sunny: '#D49A3D',
    rainy: '#2A7B9B',
    cloudy: '#667C72',
    temp: '#C65D3B',
    soil: '#6E4728',
  },
};

export const Typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 28,
    giant: 34,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.45,
    relaxed: 1.65,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  giant: 40,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  base: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#173024',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  base: {
    shadowColor: '#173024',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#173024',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#173024',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
};
