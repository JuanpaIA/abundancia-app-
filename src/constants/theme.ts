export const Colors = {
  // Fondos
  background: '#0D0A1E',
  card: '#16132A',
  input: '#1F1B35',

  // Acentos
  gold: '#C9A84C',
  goldLight: '#E8D5A3',
  purple: '#7B3FD4',

  // Textos — todos pasan WCAG AA (4.5:1) sobre #0D0A1E
  textPrimary: '#F0EEF8',
  textSecondary: '#A8A4C0',  // era #9490B0 (ratio 3.4:1, ilegible)
  textDisabled: '#6B6890',   // era #4A4760 (ratio 1.8:1, invisible)

  // Estados
  success: '#4CAF82',
  error: '#E05555',
  border: '#2E2B45',         // separado de textDisabled (antes ambos eran #4A4760)
  borderGold: '#C9A84C',
}

export const Fonts = {
  heading: 'Cormorant_700Bold',
  headingMedium: 'Cormorant_500Medium',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
}

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}
