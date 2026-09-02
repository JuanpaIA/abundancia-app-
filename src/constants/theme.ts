export const Colors = {
  // Fondos
  background: '#F0E8EC',                      // blush-base — fondo general
  card: '#FBF6F8',                            // superficie blanca cálida
  cardBg: 'rgba(139,90,110,0.06)',            // card muy sutil
  surface2: 'rgba(139,90,110,0.08)',          // hover / interactive
  input: '#F5EDF1',                           // campo de texto

  // Hero band — el mauve rosa de las referencias
  roseHero: '#8C5A6E',                        // fondo del header/hero
  gradientTop: '#7A4D61',                     // para gradiente dentro del hero
  gradientMid: '#8C5A6E',

  // Gold — RESERVADO exclusivamente para el botón "Pide una señal"
  gold: '#d4a843',
  goldLight: '#eccb7a',
  goldDim: 'rgba(212,168,67,0.15)',

  // Plum — acento principal (reemplaza gold en todo lo demás)
  plum: '#6B3F5A',
  plumLight: '#8C5A72',
  plumDim: 'rgba(107,63,90,0.12)',

  // Purple aliases → plum/mauve (compatibilidad con código existente)
  purple: '#6B3F5A',
  purpleAccent: '#C4A0B4',                    // rose-lavanda suave
  purpleDim: 'rgba(107,63,90,0.12)',

  // Textos — sobre superficies blancas/claras
  textPrimary: '#2A1B22',                     // marrón-negro cálido
  textSecondary: '#8A6E7A',                   // rose-taupe apagado
  textDim: 'rgba(42,27,34,0.28)',
  textDisabled: '#9E7A8A',                    // rosa apagado legible

  // Textos en hero — sobre el fondo rose/mauve
  heroText: 'rgba(255,255,255,0.95)',
  heroTextMuted: 'rgba(255,255,255,0.60)',

  // Estados
  success: '#4CAF82',
  error: '#D64545',
  border: 'rgba(42,27,34,0.08)',
  borderGold: 'rgba(107,63,90,0.20)',
  borderPurple: 'rgba(107,63,90,0.15)',
}

export const Fonts = {
  heading: 'Cormorant_700Bold',
  headingSemiBold: 'Cormorant_600SemiBold',
  headingMedium: 'Cormorant_500Medium',
  headingItalic: 'Cormorant_500Medium_Italic',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
}

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,       // firma visual: el radio de la tarjeta que emerge del hero
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
