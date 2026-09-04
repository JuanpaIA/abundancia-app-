import React, { useEffect, useCallback, useRef, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  runOnJS,
  Easing,
  ReduceMotion,
  type SharedValue,
} from 'react-native-reanimated'
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg'
import { BlurOverlay } from './BlurOverlay'
import { GradientText } from './GradientText'

import { AlignmentMoon } from './AlignmentMoon'
import { SignalShareCard } from './SignalShareCard'
import { useSignalSound } from '../../hooks/useSignalSound'
import { useSignalShare } from '../../hooks/useSignalShare'
import { Colors, Fonts } from '../../constants/theme'
import type { SignalResult } from '@lumina/core'

interface SignalRevealProps {
  signal: SignalResult
  alignmentScore: number
  alignmentTier: string
  visible: boolean
  onDismiss: () => void
  creatorMode?: boolean
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window')

const EASE_OUT   = Easing.bezier(0.23, 1, 0.32, 1)
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1)
const MASTER     = new Set([11, 22, 33])

// ── Glow SVG behind number ────────────────────────────────────────────────────

function NumberGlow({ size, opacity }: { size: number; opacity: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))
  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.glowWrap, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <RadialGradient id="numGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%"   stopColor="#eccb7a" stopOpacity="0.55" />
            <Stop offset="50%"  stopColor="#eccb7a" stopOpacity="0.20" />
            <Stop offset="100%" stopColor="#eccb7a" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#numGlow)" />
      </Svg>
    </Animated.View>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SignalReveal({
  signal,
  alignmentScore,
  alignmentTier,
  visible,
  onDismiss,
  creatorMode = false,
}: SignalRevealProps) {
  const sound = useSignalSound()
  const { share, cardRef } = useSignalShare(signal, alignmentScore, alignmentTier)

  const playRef = useRef(sound.play)
  useEffect(() => { playRef.current = sound.play }, [sound.play])

  // Shared values
  const bgOpacity      = useSharedValue(0)
  const moonY          = useSharedValue(24)
  const moonOpacity    = useSharedValue(0)
  const numberScale    = useSharedValue(0.7)
  const numberOpacity  = useSharedValue(0)
  const glowOpacity    = useSharedValue(0)
  const readingOpacity = useSharedValue(0)
  const hintOpacity    = useSharedValue(0)
  const expandedOpacity = useSharedValue(0)

  const expandedRef = useRef(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const dismissAll = useCallback(() => {
    const fade = { duration: 200 }
    moonOpacity.value     = withTiming(0, fade)
    numberOpacity.value   = withTiming(0, fade)
    glowOpacity.value     = withTiming(0, fade)
    readingOpacity.value  = withTiming(0, { duration: 150 })
    hintOpacity.value     = withTiming(0, { duration: 150 })
    expandedOpacity.value = withTiming(0, { duration: 150 })
    bgOpacity.value = withTiming(0, { duration: 280 }, () => {
      runOnJS(onDismiss)()
    })
  }, [bgOpacity, moonOpacity, numberOpacity, glowOpacity, readingOpacity, hintOpacity, expandedOpacity, onDismiss])

  const handleExpand = useCallback(() => {
    if (expandedRef.current) return
    expandedRef.current = true
    setIsExpanded(true)
    hintOpacity.value     = withTiming(0, { duration: 200 })
    expandedOpacity.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) })
  }, [hintOpacity, expandedOpacity])

  useEffect(() => {
    if (!visible) return

    bgOpacity.value       = 0
    moonY.value           = 24
    moonOpacity.value     = 0
    numberScale.value     = 0.7
    numberOpacity.value   = 0
    glowOpacity.value     = 0
    readingOpacity.value  = 0
    hintOpacity.value     = 0
    expandedOpacity.value = 0
    expandedRef.current   = false
    setIsExpanded(false)

    // 0.0–0.28 s — overlay fills in
    bgOpacity.value = withTiming(1, { duration: 280, easing: EASE_SHEET, reduceMotion: ReduceMotion.System })

    // 0.28–0.7 s — moon rises
    moonY.value       = withDelay(280, withTiming(0, { duration: 420, easing: EASE_OUT, reduceMotion: ReduceMotion.System }))
    moonOpacity.value = withDelay(280, withTiming(1, { duration: 360, reduceMotion: ReduceMotion.System }))

    // 0.72–1.2 s — number ignites with spring + glow
    numberScale.value   = withDelay(720, withSpring(1, { duration: 600, dampingRatio: 0.75, reduceMotion: ReduceMotion.System }))
    numberOpacity.value = withDelay(720, withTiming(1, { duration: 220, reduceMotion: ReduceMotion.System }, () => {
      runOnJS(playRef.current)()
    }))
    glowOpacity.value   = withDelay(720, withTiming(0.35, { duration: 500, reduceMotion: ReduceMotion.System }))

    // Glow pulse: breathe between 0.35 and 0.55 every 3s
    const startPulse = () => {
      glowOpacity.value = withDelay(1200, withRepeat(
        withSequence(
          withTiming(0.55, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.35, { duration: 1500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      ))
    }
    setTimeout(startPulse, 1220)

    // 1.3–1.8 s — reading fades in
    readingOpacity.value = withDelay(1300, withTiming(1, { duration: 480, easing: EASE_OUT, reduceMotion: ReduceMotion.System }))

    // 2.0–2.4 s — hint
    hintOpacity.value = withDelay(2000, withTiming(1, { duration: 380, reduceMotion: ReduceMotion.System }))

    return () => { sound.cleanup() }
  }, [visible, signal]) // eslint-disable-line react-hooks/exhaustive-deps

  const bgStyle       = useAnimatedStyle(() => ({ opacity: bgOpacity.value }))
  const moonStyle     = useAnimatedStyle(() => ({ opacity: moonOpacity.value, transform: [{ translateY: moonY.value }] }))
  const numberStyle   = useAnimatedStyle(() => ({ opacity: numberOpacity.value, transform: [{ scale: numberScale.value }] }))
  const readingStyle  = useAnimatedStyle(() => ({ opacity: readingOpacity.value }))
  const hintStyle     = useAnimatedStyle(() => ({ opacity: hintOpacity.value }))
  const expandedStyle = useAnimatedStyle(() => ({ opacity: expandedOpacity.value }))

  if (!visible) return null

  const isMaster    = MASTER.has(signal.number)
  const numFontSize = String(signal.number).length > 1 ? 108 : 128
  const glowDiameter = numFontSize * 1.8

  return (
    <View style={[StyleSheet.absoluteFill, { flex: 1 }]}>
      {/* Blur + dark overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]} pointerEvents="auto">
        <BlurOverlay />
        <Pressable style={[StyleSheet.absoluteFill, styles.overlayColor]} onPress={dismissAll} />
      </Animated.View>

      {/* Central block — moon + number + reading, vertically centered */}
      <View style={styles.centerBlock} pointerEvents="box-none">
        {/* Moon */}
        <Animated.View pointerEvents="none" style={moonStyle}>
          <AlignmentMoon score={alignmentScore} tier={alignmentTier} size={140} showScore={false} />
        </Animated.View>

        {/* Number with glow behind */}
        <Animated.View pointerEvents="none" style={[styles.numberWrap, { width: glowDiameter, height: glowDiameter }, numberStyle]}>
          <NumberGlow size={glowDiameter} opacity={glowOpacity} />
          <View style={styles.numberInner}>
            <GradientText
              fontSize={numFontSize}
              style={isMaster ? styles.masterShadow : styles.normalShadow}
            >
              {signal.number}
            </GradientText>
          </View>
        </Animated.View>

        {/* Reading text */}
        <Pressable onPress={handleExpand} style={styles.readingWrap}>
          <Animated.Text style={[styles.reading, readingStyle]}>
            {signal.reading}
          </Animated.Text>

          {!isExpanded && (
            <Animated.Text style={[styles.hint, hintStyle]}>
              toca para más
            </Animated.Text>
          )}

          {isExpanded && (
            <Animated.Text style={[styles.expanded, expandedStyle]}>
              {signal.expanded}
            </Animated.Text>
          )}
        </Pressable>
      </View>

      {/* Creator wordmark */}
      {creatorMode && (
        <View pointerEvents="none" style={styles.creatorWordmark}>
          <Text style={styles.creatorWordmarkTxt}>LUMINA</Text>
        </View>
      )}

      {/* Bottom controls */}
      <Animated.View style={[styles.bottomRow, bgStyle]}>
        <Pressable style={styles.shareBtn} onPress={share}>
          <Text style={styles.shareTxt}>COMPARTIR</Text>
        </Pressable>
        <Pressable style={styles.closeBtn} onPress={dismissAll}>
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      </Animated.View>

      {/* Off-screen share card */}
      {cardRef && (
        <View pointerEvents="none" style={styles.offScreen}>
          <SignalShareCard
            ref={cardRef}
            signal={signal}
            alignmentScore={alignmentScore}
            alignmentTier={alignmentTier}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  overlayColor: {
    backgroundColor: 'rgba(8,6,15,0.97)',
  },
  glowWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Central block ──────────────────────────────────────────────────────────
  centerBlock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },

  numberWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  numberInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: Fonts.heading,
    color: Colors.goldLight,
    includeFontPadding: false,
    textAlign: 'center',
  },
  normalShadow: {
    textShadowColor: 'rgba(236,203,122,0.70)',
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 0 },
  },
  masterShadow: {
    textShadowColor: 'rgba(236,203,122,0.90)',
    textShadowRadius: 32,
    textShadowOffset: { width: 0, height: 0 },
  },

  // ── Reading ───────────────────────────────────────────────────────────────
  readingWrap: {
    marginTop: 32,
    paddingHorizontal: '8%',
    alignItems: 'center',
    gap: 20,
    maxWidth: SCREEN_W * 0.85,
  },
  reading: {
    fontFamily: Fonts.headingSemiBoldItalic,
    fontSize: 22,
    color: '#f6f4f1',
    textAlign: 'center',
    lineHeight: 32,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textDim,
    textAlign: 'center',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  expanded: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: 'rgba(179,178,201,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Creator ───────────────────────────────────────────────────────────────
  creatorWordmark: {
    position: 'absolute',
    bottom: 130,
    alignSelf: 'center',
  },
  creatorWordmarkTxt: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: 'rgba(236,203,122,0.85)',
    letterSpacing: 12,
  },

  // ── Bottom controls ───────────────────────────────────────────────────────
  bottomRow: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  shareBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  shareTxt: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.goldLight,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  closeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  closeTxt: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.textDim,
  },

  offScreen: {
    position: 'absolute',
    top: -10000,
    left: -10000,
  },
})
