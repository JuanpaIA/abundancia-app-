import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated'
import Svg, { Defs, ClipPath, Circle, Rect, G } from 'react-native-svg'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts } from '../constants/theme'
import type { AlignmentTier } from '@lumina/core'
import { useLunarRevealSound } from '../hooks/useLunarRevealSound'

// ── SVG animated components ───────────────────────────────────────────────────
const AnimatedRect = Animated.createAnimatedComponent(Rect)

// ── Moon geometry ─────────────────────────────────────────────────────────────
const MOON = 200
const R    = MOON / 2

// Stylised craters — purely decorative, static
const CRATERS = [
  { x: 68,  y: 48,  r: 13 },
  { x: 135, y: 80,  r: 8  },
  { x: 94,  y: 130, r: 17 },
  { x: 152, y: 155, r: 7  },
  { x: 50,  y: 162, r: 10 },
  { x: 113, y: 54,  r: 5  },
  { x: 36,  y: 88,  r: 7  },
  { x: 172, y: 110, r: 5  },
]

// ── Tier visual config ────────────────────────────────────────────────────────
const TIER_CONFIG = {
  action: {
    gradient:    ['#291505', '#180e05', '#0a0814'] as const,
    moonLight:   '#eccb7a',
    haloColor:   'rgba(236,203,122,0.45)',
    ptColor:     '#eccb7a',
    ptCount:     20,
    ptAmplY:     75,
    ptAmplX:     18,
    ptDuration:  4000,
    radialColor: 'rgba(212,168,67,0.20)',
    phrase:      'El universo amplifica tu energía hoy.',
  },
  building: {
    gradient:    ['#1a1030', '#0e0b1e', '#0a0814'] as const,
    moonLight:   '#c4aff7',
    haloColor:   'rgba(196,175,247,0.40)',
    ptColor:     '#c4aff7',
    ptCount:     12,
    ptAmplY:     35,
    ptAmplX:     28,
    ptDuration:  6000,
    radialColor: 'rgba(155,93,229,0.13)',
    phrase:      'Cada acción construye tu manifestación.',
  },
  reception: {
    gradient:    ['#060d1a', '#050b16', '#040810'] as const,
    moonLight:   '#c8d6ec',
    haloColor:   'rgba(200,214,236,0.35)',
    ptColor:     '#a8bcd4',
    ptCount:     8,
    ptAmplY:     12,
    ptAmplX:     10,
    ptDuration:  9000,
    radialColor: 'rgba(100,120,160,0.10)',
    phrase:      'Abre tu corazón. El universo te habla.',
  },
} satisfies Record<AlignmentTier, object>

const TIER_LABELS: Record<AlignmentTier, string> = {
  action:    'Día de acción',
  building:  'Día de construcción',
  reception: 'Día de recepción',
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface LunarRevealProps {
  score:         number        // 45–98
  tier:          AlignmentTier
  numerology:    number
  zodiacLabel:   string
  lunarLabel:    string
  areaLabel:     string
  onComplete:    () => void
  skipAnimation?: boolean
  forceTier?:    AlignmentTier  // __DEV__ override
}

// ── Particle ──────────────────────────────────────────────────────────────────
interface PConfig {
  x: number; y: number; size: number; baseOpacity: number
  duration: number; moveY: number; moveX: number
}

function Particle({ x, y, size, baseOpacity, duration, moveY, moveX, color }: PConfig & { color: string }) {
  const p = useSharedValue(0)

  useEffect(() => {
    // Random phase offset so particles aren't in sync
    const offset = (Math.random() * duration) | 0
    p.value = withDelay(
      offset,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration >> 1, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: duration >> 1, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, false,
      ),
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity:   baseOpacity * (0.25 + 0.75 * p.value),
    transform: [{ translateY: -moveY * p.value }, { translateX: moveX * (p.value - 0.5) * 2 }],
  }))

  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  )
}

// ── LunarReveal ───────────────────────────────────────────────────────────────
export function LunarReveal({
  score, tier: tierProp, numerology, zodiacLabel, lunarLabel, areaLabel, onComplete, skipAnimation = false, forceTier,
}: LunarRevealProps) {
  const { width: W, height: H } = useWindowDimensions()
  const tier  = forceTier ?? tierProp
  const cfg   = TIER_CONFIG[tier]
  const sound = useLunarRevealSound()

  // Particle configs — computed once with deterministic LCG
  const particles = useRef<PConfig[]>(null as any)
  if (!particles.current) {
    let s = 0xdeadbeef
    const rng = () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff }
    particles.current = Array.from({ length: cfg.ptCount }, () => ({
      x:           rng() * (W || 375),
      y:           rng() * (H || 812),
      size:        1.5 + rng() * 2.5,
      baseOpacity: 0.25 + rng() * 0.45,
      duration:    cfg.ptDuration * (0.65 + rng() * 0.7),
      moveY:       cfg.ptAmplY * (0.45 + rng() * 0.55),
      moveX:       (rng() - 0.5) * cfg.ptAmplX * 2,
    }))
  }

  // ── Shared values ─────────────────────────────────────────────────────────
  const rootOp    = useSharedValue(0)
  const chipsY    = useSharedValue(0)
  const chipsOp   = useSharedValue(1)
  const moonOp    = useSharedValue(0)
  const fillLvl   = useSharedValue(0)
  const scoreOp   = useSharedValue(0)
  const haloOp    = useSharedValue(0)
  const haloScale = useSharedValue(1)
  const tierOp    = useSharedValue(0)
  const protoOp   = useSharedValue(0)
  const skipOp    = useSharedValue(0)

  // ── Animation sequence ────────────────────────────────────────────────────
  useEffect(() => {
    if (skipAnimation) {
      rootOp.value  = 1; chipsY.value = -70; chipsOp.value = 0.55
      moonOp.value  = 1; fillLvl.value = score / 100; scoreOp.value = 1
      haloOp.value  = 0; tierOp.value  = 1; protoOp.value = 1; skipOp.value = 1
      return
    }

    const ease = Easing.out(Easing.cubic)

    // +0.0s root fades in
    rootOp.value  = withTiming(1, { duration: 350, easing: ease })
    // chips slide up
    chipsY.value  = withTiming(-70, { duration: 650, easing: ease })
    chipsOp.value = withTiming(0.5, { duration: 650 })
    // +0.2s background tier gradient transition (root opacity handles this)
    // +0.4s moon appears
    moonOp.value  = withDelay(400, withTiming(1, { duration: 500, easing: ease }))
    // +0.8s fill rises from bottom — out-cubic for deceleration near target
    fillLvl.value = withDelay(800, withTiming(score / 100, {
      duration: 600,
      easing:   Easing.out(Easing.cubic),
    }))
    // +1.6s score number (after fill stops at 1.4s + 0.2s pause)
    scoreOp.value = withDelay(1600, withTiming(1, { duration: 350, easing: ease }))
    // +2.0s halo single pulse
    haloOp.value  = withDelay(2000, withSequence(
      withTiming(0.75, { duration: 200 }),
      withTiming(0,    { duration: 700 }),
    ))
    haloScale.value = withDelay(2000, withTiming(1.45, { duration: 900, easing: ease }))
    // +2.4s tier label + phrase
    tierOp.value  = withDelay(2400, withTiming(1, { duration: 400, easing: ease }))
    // +3.0s protocol text
    protoOp.value = withDelay(3000, withTiming(1, { duration: 400, easing: ease }))
    // skip visible quickly so user can always bail
    skipOp.value  = withDelay(400, withTiming(1, { duration: 400, easing: ease }))
  }, [])

  // Sound at +0.8s (synced with fill start)
  useEffect(() => {
    if (skipAnimation) return
    const t = setTimeout(() => sound.play(tier), 800)
    return () => { clearTimeout(t); sound.cleanup() }
  }, [])

  // Auto-advance — full reveal is done by ~3.5s; give buffer to 5s
  useEffect(() => {
    const t = setTimeout(onComplete, 5000)
    return () => clearTimeout(t)
  }, [])

  // ── Animated props (SVG fill rect — runs on UI thread) ───────────────────
  const fillAnimProps = useAnimatedProps(() => ({
    y:      MOON * (1 - fillLvl.value),
    height: MOON * fillLvl.value,
  }))

  // ── Styles ────────────────────────────────────────────────────────────────
  const rootStyle   = useAnimatedStyle(() => ({ opacity: rootOp.value }))
  const chipsStyle  = useAnimatedStyle(() => ({
    opacity:   chipsOp.value,
    transform: [{ translateY: chipsY.value }],
  }))
  const moonStyle   = useAnimatedStyle(() => ({ opacity: moonOp.value }))
  const scoreStyle  = useAnimatedStyle(() => ({ opacity: scoreOp.value }))
  const haloStyle   = useAnimatedStyle(() => ({
    opacity:   haloOp.value,
    transform: [{ scale: haloScale.value }],
  }))
  const tierStyle   = useAnimatedStyle(() => ({ opacity: tierOp.value }))
  const protoStyle  = useAnimatedStyle(() => ({ opacity: protoOp.value }))
  const skipStyle   = useAnimatedStyle(() => ({ opacity: skipOp.value }))

  return (
    <Animated.View style={[styles.root, rootStyle]}>
      {/* Tier-specific background */}
      <LinearGradient
        colors={cfg.gradient}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Central radial warmth / glow */}
      <View pointerEvents="none" style={[styles.radialGlow, { backgroundColor: cfg.radialColor }]} />

      {/* Particles — absolute, no pointer events */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {particles.current.map((p, i) => (
          <Particle key={i} {...p} color={cfg.ptColor} />
        ))}
      </View>

      {/* Main content column */}
      <View style={styles.content}>

        {/* Chip mini-grid — reagrupa y sube */}
        <Animated.View style={[styles.chipGrid, chipsStyle]}>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>NÚMERO</Text>
              <Text style={styles.chipValue}>{numerology}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>SIGNO</Text>
              <Text style={styles.chipValue}>{zodiacLabel}</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>LUNA</Text>
              <Text style={styles.chipValue}>{lunarLabel}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>INTENCIÓN</Text>
              <Text style={styles.chipValue}>{areaLabel}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Moon container */}
        <Animated.View style={[styles.moonWrap, moonStyle]}>
          {/* Halo ring — single pulse */}
          <Animated.View
            style={[styles.halo, { borderColor: cfg.haloColor }, haloStyle]}
          />

          {/* SVG moon */}
          <Svg width={MOON} height={MOON}>
            <Defs>
              <ClipPath id="lr-clip">
                <Circle cx={R} cy={R} r={R} />
              </ClipPath>
            </Defs>

            {/* Dark sphere */}
            <Circle cx={R} cy={R} r={R} fill="#12102a" />

            {/* Light fill — animated from bottom upward */}
            <G clipPath="url(#lr-clip)">
              <AnimatedRect
                x={0}
                width={MOON}
                fill={cfg.moonLight}
                opacity={0.88}
                animatedProps={fillAnimProps}
              />
            </G>

            {/* Stylised craters — static texture */}
            <G clipPath="url(#lr-clip)">
              {CRATERS.map((c, i) => (
                <Circle
                  key={i} cx={c.x} cy={c.y} r={c.r}
                  fill="transparent"
                  stroke="rgba(0,0,0,0.14)"
                  strokeWidth={1.5}
                />
              ))}
            </G>

            {/* Edge rim highlight */}
            <Circle
              cx={R} cy={R} r={R - 1}
              fill="transparent"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth={2}
            />
          </Svg>

          {/* Score number — absolutely centered over SVG */}
          <Animated.View style={[StyleSheet.absoluteFillObject, styles.scoreOverlay, scoreStyle]}>
            <Text style={styles.scoreNumber}>{score}</Text>
          </Animated.View>
        </Animated.View>

        {/* Tier label + phrase */}
        <Animated.View style={[styles.tierArea, tierStyle]}>
          <Text style={styles.tierLabel}>{TIER_LABELS[tier]}</Text>
          <Text style={styles.tierPhrase}>{cfg.phrase}</Text>
        </Animated.View>

        {/* Protocol copy */}
        <Animated.View style={[styles.protocolArea, protoStyle]}>
          <Text style={styles.protocolTitle}>Tu protocolo está listo</Text>
          <Text style={styles.protocolSub}>ÚNICO · PERSONALIZADO · HOY</Text>
        </Animated.View>

      </View>

      {/* Skip — visible quickly, anchored to bottom */}
      <Animated.View style={[styles.skipWrap, skipStyle]}>
        <Pressable onPress={onComplete} hitSlop={16}>
          <Text style={styles.skipText}>Continuar</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },

  radialGlow: {
    position: 'absolute',
    top: '20%', left: '10%', right: '10%', bottom: '20%',
    borderRadius: 999,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },

  // ── Chips ──────────────────────────────────────────────────────────────────
  chipGrid: { gap: 8, alignItems: 'center' },
  chipRow:  { flexDirection: 'row', gap: 8 },
  chip: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: 1,
    borderColor: 'rgba(212,168,67,0.22)',
    minWidth: 100,
  },
  chipLabel: {
    fontSize: 7,
    letterSpacing: 1.8,
    color: Colors.gold,
    opacity: 0.6,
    fontFamily: Fonts.bodySemiBold,
    marginBottom: 3,
  },
  chipValue: {
    fontSize: 14,
    fontFamily: Fonts.headingItalic,
    color: '#e8e3d8',
    letterSpacing: 0.2,
  },

  // ── Moon ───────────────────────────────────────────────────────────────────
  moonWrap: {
    width:  MOON,
    height: MOON,
  },

  // Halo ring — animates scale + opacity via haloStyle
  halo: {
    position:     'absolute',
    top:          -12, left: -12,
    width:        MOON + 24,
    height:       MOON + 24,
    borderRadius: (MOON + 24) / 2,
    borderWidth:  2,
  },

  // Score number centred over SVG
  scoreOverlay: {
    alignItems:     'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontSize:          64,
    fontFamily:        Fonts.headingItalic,
    color:             '#ffffff',
    letterSpacing:     -1,
    textShadowColor:   'rgba(0,0,0,0.65)',
    textShadowOffset:  { width: 0, height: 0 },
    textShadowRadius:  14,
  },

  // ── Tier ───────────────────────────────────────────────────────────────────
  tierArea: { alignItems: 'center', gap: 6 },
  tierLabel: {
    fontSize:    18,
    fontFamily:  Fonts.headingItalic,
    color:       Colors.goldLight,
    letterSpacing: 0.4,
  },
  tierPhrase: {
    fontSize:    13,
    fontFamily:  Fonts.body,
    color:       Colors.textSecondary,
    textAlign:   'center',
    lineHeight:  19,
    paddingHorizontal: 16,
  },

  // ── Protocol ───────────────────────────────────────────────────────────────
  protocolArea: { alignItems: 'center', gap: 4 },
  protocolTitle: {
    fontSize:    17,
    fontFamily:  Fonts.headingItalic,
    color:       Colors.textPrimary,
    letterSpacing: 0.3,
  },
  protocolSub: {
    fontSize:    8,
    letterSpacing: 2.2,
    color:       'rgba(255,255,255,0.25)',
    fontFamily:  Fonts.bodySemiBold,
  },

  // ── Skip ───────────────────────────────────────────────────────────────────
  skipWrap: {
    position:    'absolute',
    bottom:      60,
    left:        0, right: 0,
    alignItems:  'center',
  },
  skipText: {
    fontSize:    13,
    color:       'rgba(255,255,255,0.22)',
    fontFamily:  Fonts.bodySemiBold,
    letterSpacing: 0.5,
  },
})
