/**
 * Standardized Design System for DGIHub Platform
 * Mobile-first, dark-mode-centric design compliant with UU PDP
 * Indonesian Vocational Digital Platform UI/UX Specifications
 */

export const colors = {
  // Primary Color Palette (Government Standard)
  primary: {
    navy: '#0D1B2A',      // Deep Navy - Primary
    emerald: '#2D6A4F',   // Emerald Green - "Green Jobs" accent
    crimson: '#BA1A1A',    // Crimson - Compliance alerts & danger
  },
  
  // Dark Mode (Primary)
  background: {
    dark: '#0D1B2A',       // Deep Navy background
    darkSecondary: '#1B263B', // Slightly lighter for cards
    light: '#ffffff',
  },
  foreground: {
    dark: '#E0E1DD',       // Light text on dark
    darkSecondary: '#C5C6C0', // Secondary text
    light: '#0D1B2A',
  },
  
  // Role-based Accent Colors (Updated with new professional blue)
  mitra: {
    primary: '#0EB0F9',
    secondary: '#0A9DE6',
    accent: '#3BC0FF',
    dark: '#0878B3',
  },
  talenta: {
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    dark: '#92400e',
  },
  industri: {
    primary: '#0EB0F9',
    secondary: '#0A9DE6',
    accent: '#3BC0FF',
    dark: '#0878B3',
  },
  
  // Status Colors
  status: {
    success: '#2D6A4F',    // Emerald Green
    warning: '#fbbf24',
    error: '#BA1A1A',      // Crimson
    info: '#0EB0F9',       // Professional Blue
    pending: '#f59e0b',
    active: '#2D6A4F',
    inactive: '#6b7280',
  },
  
  // Gray Scale (for dark mode)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    dark: '#1B263B',       // Dark mode card background
    darkBorder: '#415A77', // Dark mode borders
  },
};

export const typography = {
  fontFamily: {
    sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  touchTarget: '44px', // Minimum 44x44px (10mm) for mobile tap targets
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  // Standard spacing scale
  scale: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
  },
};

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  dark: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',
};

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
};

// Helper functions
export const getRoleColors = (userType: 'TALENTA' | 'MITRA' | 'INDUSTRI') => {
  switch (userType) {
    case 'TALENTA':
      return colors.talenta;
    case 'MITRA':
      return colors.mitra;
    case 'INDUSTRI':
      return colors.industri;
    default:
      return colors.industri;
  }
};

export const getRoleAccent = (userType: 'TALENTA' | 'MITRA' | 'INDUSTRI') => {
  const roleColors = getRoleColors(userType);
  return {
    primary: roleColors.primary,
    secondary: roleColors.secondary,
    accent: roleColors.accent,
    dark: roleColors.dark,
  };
};

// AQRF Level Colors (1-8)
export const aqrfColors = {
  1: '#ef4444', // Red - Basic
  2: '#f97316', // Orange
  3: '#f59e0b', // Amber
  4: '#eab308', // Yellow
  5: '#84cc16', // Lime
  6: '#22c55e', // Green
  7: '#10b981', // Emerald
  8: '#2D6A4F', // Deep Emerald - Expert
};

// Design tokens for CSS variables
export const designTokens = {
  colors,
  typography,
  spacing,
  breakpoints,
  shadows,
  borderRadius,
  transitions,
};
