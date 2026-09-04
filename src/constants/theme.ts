export const Colors = {
  // ── Fondo ───────────────────────────────────────────────────────────────────
  background: '#2a1550',    // fallback sólido (spinners, loaders, texto sobre dorado)
  bgTop:      '#3c1a7c',    // violeta intenso — tope del gradiente
  bgMid:      '#18083a',    // índigo profundo — banda media
  bgBottom:   '#010007',    // negro casi puro — base

  // ── Dorado ──────────────────────────────────────────────────────────────────
  gold:      '#d4a843',
  goldLight: '#eccb7a',
  goldDim:   'rgba(212,168,67,0.15)',

  // ── Morado ──────────────────────────────────────────────────────────────────
  purple:      '#9b5de5',
  purpleSoft:  '#7b52c0',
  purpleGlow:  'rgba(155,93,229,0.18)',
  purpleAccent: '#9b5de5',  // compat

  // ── Texto ───────────────────────────────────────────────────────────────────
  textPrimary:   '#f6f4f1',
  textSecondary: '#b3b2c9',
  textDim:       '#767693',
  textDisabled:  'rgba(118,118,147,0.5)',
  heroText:      '#f6f4f1',    // compat
  heroTextMuted: '#b3b2c9',    // compat

  // ── Superficies ─────────────────────────────────────────────────────────────
  surface1: 'rgba(255,255,255,0.045)',
  surface2: 'rgba(255,255,255,0.07)',
  surface3: 'rgba(255,255,255,0.10)',
  line:     'rgba(255,255,255,0.08)',

  // ── Alias de compat (se depuran en Bloque 4 pantalla a pantalla) ─────────────
  card:         'rgba(255,255,255,0.045)',
  cardBg:       'rgba(255,255,255,0.045)',
  input:        'rgba(255,255,255,0.07)',
  plum:         '#9b5de5',     // compat → purple
  plumLight:    '#7b52c0',     // compat → purpleSoft
  plumDim:      'rgba(155,93,229,0.12)',
  purpleDim:    'rgba(155,93,229,0.12)',
  roseHero:     '#2a1550',     // compat
  gradientTop:  '#2a1550',     // compat
  gradientMid:  '#1d0f3a',     // compat

  // ── Bordes ──────────────────────────────────────────────────────────────────
  border:       'rgba(255,255,255,0.08)',
  borderGold:   'rgba(212,168,67,0.25)',
  borderPurple: 'rgba(155,93,229,0.20)',

  // ── Estados ─────────────────────────────────────────────────────────────────
  success: '#4CAF82',
  error:   '#D64545',
}

export const Fonts = {
  heading:               'Cormorant_700Bold',
  headingSemiBold:       'Cormorant_600SemiBold',
  headingMedium:         'Cormorant_500Medium',
  headingItalic:         'Cormorant_500Medium_Italic',
  headingSemiBoldItalic: 'Cormorant_600SemiBold_Italic',
  body:                  'DMSans_400Regular',
  bodyMedium:            'DMSans_500Medium',
  bodySemiBold:          'DMSans_600SemiBold',
  bodyBold:              'DMSans_700Bold',
}

export const Radius = {
  sm:   12,
  md:   16,
  lg:   20,
  xl:   28,    // compat
  full: 999,
  pill: 999,
}

export const Spacing = {
  xs:   4,
  sm:   8,
  smMd: 12,   // nuevo punto intermedio
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
}

export const Typography = {
  title:  18,  // section/card titles
  body:   17,  // primary body text, descriptions
  meta:   15,  // secondary labels, metadata
  small:  13,  // supporting, tertiary
  micro:  11,  // eyebrows, badges, captions
}
