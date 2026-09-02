import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { getLunarPhase, getLunarPhaseLabel, calculateAlignment } from '@lumina/core'
import { Colors, Fonts } from '../constants/theme'
import { LunarReveal } from './LunarReveal'

// ── Static labels ─────────────────────────────────────────────────────────────
const AREA_LABELS: Record<string, string> = {
  dinero: 'Abundancia', amor: 'Amor', salud: 'Salud & Vitalidad',
  proposito: 'Propósito', felicidad: 'Felicidad',
}
const ZODIAC_LABELS: Record<string, string> = {
  aries: 'Aries', tauro: 'Tauro', geminis: 'Géminis', cancer: 'Cáncer',
  leo: 'Leo', virgo: 'Virgo', libra: 'Libra', escorpio: 'Escorpio',
  sagitario: 'Sagitario', capricornio: 'Capricornio', acuario: 'Acuario', piscis: 'Piscis',
}
const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
function fmtToday(): string {
  const d = new Date()
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ── Timing configuration — all durations in ms ───────────────────────────────
const TIMINGS = {
  start:       300,
  fadeIn:      200,
  holdSource:  350,
  morph:       450,
  holdCenter:  60,
  fadeCenter:  140,
  assemblyIn:  260,
  gap:         200,
  finalPause:  600,   // breathing room after last chip pops in
  skipDelay:   1000,
}

const STEP = TIMINGS.fadeIn + TIMINGS.holdSource + TIMINGS.morph + TIMINGS.gap  // 1200 ms

function stepT(i: number) { return TIMINGS.start + i * STEP }

// Time after which LunarReveal kicks in
const ASSEMBLY_START = TIMINGS.fadeIn + TIMINGS.holdSource + TIMINGS.morph + TIMINGS.holdCenter
const REVEAL_AT = stepT(3) + ASSEMBLY_START + TIMINGS.assemblyIn + TIMINGS.finalPause  // ~6020 ms

// ── Props ─────────────────────────────────────────────────────────────────────
export interface EnsamblajeProps {
  name:              string
  birthDate:         string   // YYYY-MM-DD
  zodiac:            string
  numerology:        number
  frequency:         number
  manifestationArea: string
  onComplete:        () => void
  forceTier?:        import('@lumina/core').AlignmentTier  // __DEV__ override
  creatorMode?:      boolean
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Ensamblaje({
  name, birthDate, zodiac, numerology, manifestationArea, onComplete, forceTier, creatorMode = false,
}: EnsamblajeProps) {
  const firstName  = name.split(' ')[0]
  const zodiacLabel = ZODIAC_LABELS[zodiac] ?? zodiac
  const areaLabel   = AREA_LABELS[manifestationArea] ?? manifestationArea
  const lunarPhase  = getLunarPhase(new Date())
  const lunarLabel  = getLunarPhaseLabel(lunarPhase)

  // Alignment index — deterministic, computed once
  const alignment = calculateAlignment({
    fullName:          name,
    birthDate,
    zodiacSign:        zodiac,
    lunarPhase,
    manifestationArea,
    date:              new Date(),
  })

  const [showReveal, setShowReveal] = useState(false)

  // Trigger LunarReveal after all chips have settled
  useEffect(() => {
    const t = setTimeout(() => setShowReveal(true), REVEAL_AT)
    return () => clearTimeout(t)
  }, [])

  // ── Shared values ─────────────────────────────────────────────────────────
  const eyebrowOp = useSharedValue(0)
  const skipOp    = useSharedValue(0)

  const s1O = useSharedValue(0);  const s1S = useSharedValue(1)
  const s2O = useSharedValue(0);  const s2S = useSharedValue(1)
  const s3O = useSharedValue(0);  const s3S = useSharedValue(1)
  const s4O = useSharedValue(0);  const s4S = useSharedValue(1)

  const c1O = useSharedValue(0);  const c1S = useSharedValue(0)
  const c2O = useSharedValue(0);  const c2S = useSharedValue(0)
  const c3O = useSharedValue(0);  const c3S = useSharedValue(0)
  const c4O = useSharedValue(0);  const c4S = useSharedValue(0)

  const a1O = useSharedValue(0);  const a1S = useSharedValue(0.85)
  const a2O = useSharedValue(0);  const a2S = useSharedValue(0.85)
  const a3O = useSharedValue(0);  const a3S = useSharedValue(0.85)
  const a4O = useSharedValue(0);  const a4S = useSharedValue(0.85)

  // ── Animation sequencing ─────────────────────────────────────────────────
  useEffect(() => {
    const { fadeIn, holdSource, morph, holdCenter, fadeCenter, assemblyIn, skipDelay } = TIMINGS
    const ease   = Easing.out(Easing.quad)
    const easeIn = Easing.in(Easing.quad)
    const spring = Easing.out(Easing.back(1.5))
    const pop    = Easing.out(Easing.back(1.2))

    eyebrowOp.value = withTiming(1, { duration: 300, easing: ease })

    const morphStart    = fadeIn + holdSource
    const centerStart   = morphStart
    const assemblyStart = morphStart + morph + holdCenter

    function animStep(
      t: number,
      sO: typeof s1O, sS: typeof s1S,
      cO: typeof c1O, cS: typeof c1S,
      aO: typeof a1O, aS: typeof a1S,
    ) {
      sO.value = withDelay(t, withSequence(
        withTiming(1, { duration: fadeIn,     easing: ease }),
        withTiming(1, { duration: holdSource }),
        withTiming(0, { duration: morph,      easing: easeIn }),
      ))
      sS.value = withDelay(t + morphStart, withTiming(0, { duration: morph, easing: easeIn }))

      cO.value = withDelay(t + centerStart, withSequence(
        withTiming(1, { duration: morph,      easing: ease }),
        withTiming(1, { duration: holdCenter }),
        withTiming(0, { duration: fadeCenter }),
      ))
      cS.value = withDelay(t + centerStart, withSequence(
        withTiming(1, { duration: morph,      easing: spring }),
        withTiming(1, { duration: holdCenter }),
        withTiming(0.9, { duration: fadeCenter }),
      ))

      aO.value = withDelay(t + assemblyStart, withTiming(1, { duration: assemblyIn, easing: ease }))
      aS.value = withDelay(t + assemblyStart, withTiming(1, { duration: assemblyIn, easing: pop }))
    }

    animStep(stepT(0), s1O, s1S, c1O, c1S, a1O, a1S)
    animStep(stepT(1), s2O, s2S, c2O, c2S, a2O, a2S)
    animStep(stepT(2), s3O, s3S, c3O, c3S, a3O, a3S)
    animStep(stepT(3), s4O, s4S, c4O, c4S, a4O, a4S)

    skipOp.value = withDelay(skipDelay, withTiming(1, { duration: 400, easing: ease }))
  }, [])

  // ── Animated styles ───────────────────────────────────────────────────────
  const eyebrowStyle = useAnimatedStyle(() => ({ opacity: eyebrowOp.value }))
  const skipStyle    = useAnimatedStyle(() => ({ opacity: skipOp.value }))

  const s1Style = useAnimatedStyle(() => ({ opacity: s1O.value, transform: [{ scale: s1S.value }] }))
  const s2Style = useAnimatedStyle(() => ({ opacity: s2O.value, transform: [{ scale: s2S.value }] }))
  const s3Style = useAnimatedStyle(() => ({ opacity: s3O.value, transform: [{ scale: s3S.value }] }))
  const s4Style = useAnimatedStyle(() => ({ opacity: s4O.value, transform: [{ scale: s4S.value }] }))

  const c1Style = useAnimatedStyle(() => ({ opacity: c1O.value, transform: [{ scale: c1S.value }] }))
  const c2Style = useAnimatedStyle(() => ({ opacity: c2O.value, transform: [{ scale: c2S.value }] }))
  const c3Style = useAnimatedStyle(() => ({ opacity: c3O.value, transform: [{ scale: c3S.value }] }))
  const c4Style = useAnimatedStyle(() => ({ opacity: c4O.value, transform: [{ scale: c4S.value }] }))

  const a1Style = useAnimatedStyle(() => ({ opacity: a1O.value, transform: [{ scale: a1S.value }] }))
  const a2Style = useAnimatedStyle(() => ({ opacity: a2O.value, transform: [{ scale: a2S.value }] }))
  const a3Style = useAnimatedStyle(() => ({ opacity: a3O.value, transform: [{ scale: a3S.value }] }))
  const a4Style = useAnimatedStyle(() => ({ opacity: a4O.value, transform: [{ scale: a4S.value }] }))

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#16102a', '#0e0b1e', '#0a0814']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={styles.orbPurple} />
      <View pointerEvents="none" style={styles.orbGold} />

      <View style={styles.content}>
        <Animated.Text style={[styles.eyebrow, eyebrowStyle]}>
          ENSAMBLANDO TU PROTOCOLO
        </Animated.Text>

        {/* Transform zone: all sources + center chips share this space */}
        <View style={styles.transformZone}>
          <Animated.View style={[styles.zoneLayer, s1Style]}>
            <Text style={styles.sourceText}>{firstName}</Text>
          </Animated.View>
          <Animated.View style={[styles.zoneLayer, s2Style]}>
            <Text style={styles.sourceText}>{fmtDate(birthDate)}</Text>
          </Animated.View>
          <Animated.View style={[styles.zoneLayer, s3Style]}>
            <Text style={styles.sourceText}>{fmtToday()}</Text>
          </Animated.View>
          <Animated.View style={[styles.zoneLayer, s4Style]}>
            <Text style={styles.sourceText}>{manifestationArea}</Text>
          </Animated.View>

          <Animated.View style={[styles.zoneLayer, c1Style]}>
            <View style={styles.chip}><Text style={styles.chipLabel}>NÚMERO</Text><Text style={styles.chipValue}>{numerology}</Text></View>
          </Animated.View>
          <Animated.View style={[styles.zoneLayer, c2Style]}>
            <View style={styles.chip}><Text style={styles.chipLabel}>SIGNO</Text><Text style={styles.chipValue}>{zodiacLabel}</Text></View>
          </Animated.View>
          <Animated.View style={[styles.zoneLayer, c3Style]}>
            <View style={styles.chip}><Text style={styles.chipLabel}>LUNA</Text><Text style={styles.chipValue}>{lunarLabel}</Text></View>
          </Animated.View>
          <Animated.View style={[styles.zoneLayer, c4Style]}>
            <View style={styles.chip}><Text style={styles.chipLabel}>INTENCIÓN</Text><Text style={styles.chipValue}>{areaLabel}</Text></View>
          </Animated.View>
        </View>

        {/* Assembly grid */}
        <View style={styles.assemblyGrid}>
          <Animated.View style={[styles.chip, a1Style]}>
            <Text style={styles.chipLabel}>NÚMERO</Text><Text style={styles.chipValue}>{numerology}</Text>
          </Animated.View>
          <Animated.View style={[styles.chip, a2Style]}>
            <Text style={styles.chipLabel}>SIGNO</Text><Text style={styles.chipValue}>{zodiacLabel}</Text>
          </Animated.View>
          <Animated.View style={[styles.chip, a3Style]}>
            <Text style={styles.chipLabel}>LUNA</Text><Text style={styles.chipValue}>{lunarLabel}</Text>
          </Animated.View>
          <Animated.View style={[styles.chip, a4Style]}>
            <Text style={styles.chipLabel}>INTENCIÓN</Text><Text style={styles.chipValue}>{areaLabel}</Text>
          </Animated.View>
        </View>
      </View>

      {/* Creator wordmark — visible for screen recordings */}
      {creatorMode && (
        <View pointerEvents="none" style={styles.creatorWordmark}>
          <Text style={styles.creatorWordmarkTxt}>LUMINA</Text>
        </View>
      )}

      {/* Skip — available early; LunarReveal renders its own on top */}
      <Animated.View style={[styles.skipWrap, skipStyle]}>
        <Pressable onPress={onComplete} hitSlop={16}>
          <Text style={styles.skipText}>Continuar</Text>
        </Pressable>
      </Animated.View>

      {/* Revelación Lunar — absolute overlay, takes over at REVEAL_AT */}
      {showReveal && (
        <LunarReveal
          score={alignment.score}
          tier={alignment.tier}
          numerology={numerology}
          zodiacLabel={zodiacLabel}
          lunarLabel={lunarLabel}
          areaLabel={areaLabel}
          onComplete={onComplete}
          forceTier={forceTier}
        />
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  orbPurple: {
    position: 'absolute', top: -100, right: -80,
    width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(100,60,180,0.18)',
  },
  orbGold: {
    position: 'absolute', bottom: -80, left: -60,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(212,168,67,0.10)',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },

  eyebrow: {
    fontSize: 9, letterSpacing: 2.8,
    color: Colors.gold, opacity: 0.7,
    fontFamily: Fonts.bodySemiBold,
    marginBottom: 32,
  },

  transformZone: { height: 96, width: '100%', marginBottom: 32 },
  zoneLayer: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  sourceText: {
    fontSize: 36, fontFamily: Fonts.headingItalic,
    color: '#f0ece4', letterSpacing: 0.5, textAlign: 'center',
  },

  chip: {
    alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(212,168,67,0.28)', minWidth: 120,
  },
  chipLabel: {
    fontSize: 8, letterSpacing: 2, color: Colors.gold, opacity: 0.65,
    fontFamily: Fonts.bodySemiBold, marginBottom: 4,
  },
  chipValue: { fontSize: 18, fontFamily: Fonts.headingItalic, color: '#e8e3d8', letterSpacing: 0.3 },

  assemblyGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center', width: '100%', marginBottom: 28,
  },

  skipWrap: {
    position: 'absolute', bottom: 60, left: 0, right: 0, alignItems: 'center',
  },
  skipText: {
    fontSize: 13, color: 'rgba(255,255,255,0.22)',
    fontFamily: Fonts.bodySemiBold, letterSpacing: 0.5,
  },

  creatorWordmark: {
    position: 'absolute', bottom: 110, left: 0, right: 0, alignItems: 'center',
  },
  creatorWordmarkTxt: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: 'rgba(236,203,122,0.85)',
    letterSpacing: 12,
  },
})
