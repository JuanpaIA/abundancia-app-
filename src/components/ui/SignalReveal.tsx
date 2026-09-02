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
  withSpring,
  runOnJS,
  Easing,
  ReduceMotion,
} from 'react-native-reanimated'

// Curves de Emil Kowalski — UI thread, tuned per type of motion
const EASE_OUT   = Easing.bezier(0.23, 1, 0.32, 1)    // UI entrance
const EASE_SHEET = Easing.bezier(0.32, 0.72, 0, 1)    // overlay que envuelve
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

const { height: SCREEN_H } = Dimensions.get('window')

const MASTER = new Set([11, 22, 33])

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

  // Keep a stable ref to play so the worklet callback doesn't capture a stale closure
  const playRef = useRef(sound.play)
  useEffect(() => { playRef.current = sound.play }, [sound.play])

  // Animated shared values
  const bgOpacity       = useSharedValue(0)
  const moonY           = useSharedValue(20)
  const moonOpacity     = useSharedValue(0)
  const numberScale     = useSharedValue(0.65)
  const numberOpacity   = useSharedValue(0)
  const readingOpacity  = useSharedValue(0)
  const hintOpacity     = useSharedValue(0)
  const expandedOpacity = useSharedValue(0)

  // Expand state — ref for use inside animated callbacks, state for rendering
  const expandedRef = useRef(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const dismissAll = useCallback(() => {
    const fade = { duration: 200 }
    moonOpacity.value     = withTiming(0, fade)
    numberOpacity.value   = withTiming(0, fade)
    readingOpacity.value  = withTiming(0, { duration: 150 })
    hintOpacity.value     = withTiming(0, { duration: 150 })
    expandedOpacity.value = withTiming(0, { duration: 150 })
    bgOpacity.value = withTiming(0, { duration: 280 }, () => {
      runOnJS(onDismiss)()
    })
  }, [bgOpacity, moonOpacity, numberOpacity, readingOpacity, hintOpacity, expandedOpacity, onDismiss])

  const handleExpand = useCallback(() => {
    if (expandedRef.current) return
    expandedRef.current = true
    setIsExpanded(true)
    hintOpacity.value     = withTiming(0, { duration: 200 })
    expandedOpacity.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) })
  }, [hintOpacity, expandedOpacity])

  useEffect(() => {
    if (!visible) return

    // Reset all values
    bgOpacity.value       = 0
    moonY.value           = 20
    moonOpacity.value     = 0
    numberScale.value     = 0.65
    numberOpacity.value   = 0
    readingOpacity.value  = 0
    hintOpacity.value     = 0
    expandedOpacity.value = 0
    expandedRef.current   = false
    setIsExpanded(false)

    // 0.0–0.28 s — overlay envuelve (EASE_SHEET: iOS sheet curve)
    bgOpacity.value = withTiming(1, {
      duration: 280,
      easing: EASE_SHEET,
      reduceMotion: ReduceMotion.System,
    })

    // 0.28–0.7 s — luna sube suavemente (EASE_OUT fuerte)
    moonY.value       = withDelay(280, withTiming(0, {
      duration: 420,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    }))
    moonOpacity.value = withDelay(280, withTiming(1, { duration: 360, reduceMotion: ReduceMotion.System }))

    // 0.72–1.2 s — número florece con spring (dampingRatio 0.8 = ligero overshoot físico)
    numberScale.value   = withDelay(720, withSpring(1, {
      duration: 500, dampingRatio: 0.8,
      reduceMotion: ReduceMotion.System,
    }))
    numberOpacity.value = withDelay(720, withTiming(1, { duration: 180, reduceMotion: ReduceMotion.System }, () => {
      runOnJS(playRef.current)()
    }))

    // 1.3–1.8 s — lectura aparece
    readingOpacity.value = withDelay(1300, withTiming(1, {
      duration: 480,
      easing: EASE_OUT,
      reduceMotion: ReduceMotion.System,
    }))

    // 2.0–2.4 s — hint "toca para más"
    hintOpacity.value = withDelay(2000, withTiming(1, { duration: 380, reduceMotion: ReduceMotion.System }))

    return () => { sound.cleanup() }
  }, [visible, signal]) // eslint-disable-line react-hooks/exhaustive-deps

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }))
  const moonStyle = useAnimatedStyle(() => ({
    opacity: moonOpacity.value,
    transform: [{ translateY: moonY.value }],
  }))
  const numberStyle = useAnimatedStyle(() => ({
    opacity: numberOpacity.value,
    transform: [{ scale: numberScale.value }],
  }))
  const readingStyle  = useAnimatedStyle(() => ({ opacity: readingOpacity.value }))
  const hintStyle     = useAnimatedStyle(() => ({ opacity: hintOpacity.value }))
  const expandedStyle = useAnimatedStyle(() => ({ opacity: expandedOpacity.value }))

  // Hooks must be called before any early return
  if (!visible) return null

  const isMaster    = MASTER.has(signal.number)
  const numFontSize = String(signal.number).length > 1 ? 112 : 128
  const glowColor   = isMaster ? 'rgba(236,203,122,0.60)' : 'rgba(236,203,122,0.28)'

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Dark overlay — tapping it dismisses */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, bgStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissAll} />
      </Animated.View>

      {/* Moon — floats in, no touch */}
      <Animated.View pointerEvents="none" style={[styles.moonWrap, moonStyle]}>
        <AlignmentMoon score={alignmentScore} tier={alignmentTier} size={56} />
      </Animated.View>

      {/* Number — absolute hero, no touch (taps fall through to overlay) */}
      <Animated.View pointerEvents="none" style={[styles.numberWrap, numberStyle]}>
        <Text
          style={[
            styles.number,
            {
              fontSize: numFontSize,
              textShadowColor: glowColor,
              textShadowRadius: isMaster ? 30 : 14,
              textShadowOffset: { width: 0, height: 0 },
            },
          ]}
        >
          {signal.number}
        </Text>
      </Animated.View>

      {/* Reading + expand area */}
      <Pressable style={styles.contentArea} onPress={handleExpand}>
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

      {/* Creator wordmark — visible when creatorMode=true for screen recordings */}
      {creatorMode && (
        <View pointerEvents="none" style={styles.creatorWordmark}>
          <Text style={styles.creatorWordmarkTxt}>LUMINA</Text>
        </View>
      )}

      {/* Bottom action row — share + close */}
      <Animated.View style={[styles.bottomRow, bgStyle]}>
        <Pressable style={styles.shareBtn} onPress={share}>
          <Text style={styles.shareTxt}>compartir</Text>
        </Pressable>
        <Pressable style={styles.closeBtn} onPress={dismissAll}>
          <Text style={styles.closeTxt}>—</Text>
        </Pressable>
      </Animated.View>

      {/* Off-screen card for native capture — only mounted when cardRef exists (native only) */}
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
  overlay: {
    backgroundColor: 'rgba(10,8,20,0.93)',
  },
  moonWrap: {
    position: 'absolute',
    alignSelf: 'center',
    top: SCREEN_H * 0.15,
  },
  numberWrap: {
    position: 'absolute',
    alignSelf: 'center',
    top: SCREEN_H * 0.27,
  },
  number: {
    fontFamily: Fonts.heading,
    color: Colors.goldLight,
    includeFontPadding: false,
  },
  contentArea: {
    position: 'absolute',
    bottom: 130,
    left: 32,
    right: 32,
    alignItems: 'center',
    gap: 14,
  },
  reading: {
    fontFamily: Fonts.headingMedium,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 29,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.textDim,
    textAlign: 'center',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  expanded: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  creatorWordmark: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
  },
  creatorWordmarkTxt: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    color: 'rgba(236,203,122,0.85)',
    letterSpacing: 12,
  },
  bottomRow: {
    position: 'absolute',
    bottom: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  shareTxt: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.goldLight,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  closeBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  closeTxt: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.textDim,
    letterSpacing: 5,
  },
  offScreen: {
    position: 'absolute',
    top: -10000,
    left: -10000,
  },
})
