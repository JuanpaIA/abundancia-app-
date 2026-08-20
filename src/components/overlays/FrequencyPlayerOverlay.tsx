import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme'

interface Props {
  hz: number
  name: string
  purpose?: string
  playing: boolean
  onToggle: () => void
  onClose: () => void
}

const BAR_HEIGHTS = [12, 22, 34, 44, 52, 40, 56, 46, 32, 24, 36, 50, 42, 28, 20, 32, 46, 38, 24, 14]

export function FrequencyPlayerOverlay({ hz, name, purpose, playing, onToggle, onClose }: Props) {
  const waveAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!playing) {
      waveAnim.setValue(0)
      return
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [playing])

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <LinearGradient
        colors={['#0a0614', '#130826', '#0a0814']}
        locations={[0, 0.5, 1]}
        style={styles.container}
      >
        {/* Atmospheric orbs */}
        {/* @ts-ignore */}
        <View style={styles.orbPurple} aria-hidden />
        {/* @ts-ignore */}
        <View style={styles.orbGold} aria-hidden />

        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.center}>
          {/* Label */}
          <Text style={styles.eyebrow}>FRECUENCIA DEL DÍA</Text>

          {/* Hz number — Cormorant large */}
          <Text style={styles.hz}>{hz}</Text>
          <Text style={styles.hzUnit}>Hz</Text>
          <Text style={styles.name}>{name}</Text>

          {/* Waveform visualizer */}
          <View style={styles.waveform}>
            {BAR_HEIGHTS.map((h, i) => {
              const delay = i / BAR_HEIGHTS.length
              const opacity = waveAnim.interpolate({
                inputRange: [0, delay, Math.min(delay + 0.5, 1), 1],
                outputRange: [0.25, 0.25, 0.9, 0.25],
                extrapolate: 'clamp',
              })
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: h,
                      backgroundColor: i % 2 === 0 ? Colors.purpleAccent : Colors.gold,
                      opacity,
                    },
                  ]}
                />
              )
            })}
          </View>

          {/* Play / Pause */}
          <TouchableOpacity
            style={[styles.playBtn, playing && styles.playBtnActive]}
            onPress={onToggle}
            activeOpacity={0.85}
          >
            <Text style={[styles.playIcon, playing && styles.playIconActive]}>
              {playing ? '■' : '▶'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.playHint}>{playing ? 'Reproduciendo · Toca para pausar' : 'Toca para reproducir'}</Text>

          {/* Purpose */}
          {purpose ? (
            <Text style={styles.purpose} numberOfLines={4}>{purpose}</Text>
          ) : null}
        </View>
      </LinearGradient>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },

  orbPurple: {
    position: 'absolute', width: 400, height: 400, top: -100, left: -100, borderRadius: 999,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  orbGold: {
    position: 'absolute', width: 300, height: 300, bottom: 60, right: -80, borderRadius: 999,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(212,175,85,0.12) 0%, transparent 60%)',
    pointerEvents: 'none',
  },

  closeBtn: {
    position: 'absolute', top: 54, right: Spacing.lg,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  closeText: { fontSize: 16, color: Colors.textSecondary },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl, gap: Spacing.sm,
  },

  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.textDim,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },

  hz: {
    fontFamily: Fonts.heading,
    fontSize: 96,
    color: Colors.purpleAccent,
    lineHeight: 96,
    includeFontPadding: false,
  },
  hzUnit: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 18,
    color: Colors.purpleAccent,
    opacity: 0.7,
    marginTop: -Spacing.sm,
  },
  name: {
    fontFamily: Fonts.headingItalic,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 60,
    marginVertical: Spacing.lg,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
  },

  playBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.purpleDim,
    borderWidth: 1, borderColor: Colors.purpleAccent,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  playBtnActive: {
    backgroundColor: Colors.purpleAccent,
  },
  playIcon: {
    fontSize: 22,
    color: Colors.purpleAccent,
  },
  playIconActive: {
    color: '#fff',
  },
  playHint: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.textDim,
    marginTop: Spacing.xs,
  },

  purpose: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
})
