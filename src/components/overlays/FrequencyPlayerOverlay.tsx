import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme'

interface Props {
  hz: number
  name: string
  purpose?: string
  when?: string
  howTo?: string
  integration?: string
  duration?: string
  color?: string
  playing: boolean
  onToggle: () => void
  onClose: () => void
}

const BAR_HEIGHTS = [12, 22, 34, 44, 52, 40, 56, 46, 32, 24, 36, 50, 42, 28, 20, 32, 46, 38, 24, 14]

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function FrequencyPlayerOverlay({
  hz, name, purpose, when, howTo, integration, duration, color = Colors.purple,
  playing, onToggle, onClose,
}: Props) {
  const waveAnim  = useRef(new Animated.Value(0)).current
  const [elapsed, setElapsed] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  // Waveform animation
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

  // Session timer
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [playing])

  const hasDetails = !!(when || howTo || integration)

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <LinearGradient
        colors={['#0a0614', '#130826', '#0a0814']}
        locations={[0, 0.5, 1]}
        style={styles.container}
      >
        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.center}>
            {/* Label */}
            <Text style={styles.eyebrow}>FRECUENCIA</Text>

            {/* Hz number */}
            <Text style={[styles.hz, { color }]}>{hz}</Text>
            <Text style={[styles.hzUnit, { color }]}>Hz</Text>
            <Text style={styles.name}>{name}</Text>

            {/* Timer */}
            <View style={styles.timerRow}>
              <Text style={styles.timerText}>{fmtTime(elapsed)}</Text>
              {duration && <Text style={styles.timerSep}>·</Text>}
              {duration && <Text style={styles.timerDuration}>recomendado {duration}</Text>}
            </View>

            {/* Waveform */}
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
                        backgroundColor: i % 2 === 0 ? color : Colors.gold,
                        opacity,
                      },
                    ]}
                  />
                )
              })}
            </View>

            {/* Play / Pause */}
            <TouchableOpacity
              style={[styles.playBtn, { borderColor: color }, playing && { backgroundColor: color }]}
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
              <Text style={styles.purpose} numberOfLines={5}>{purpose}</Text>
            ) : null}

            {/* Expandable details */}
            {hasDetails && (
              <TouchableOpacity style={styles.detailToggle} onPress={() => setDetailOpen(o => !o)}>
                <Text style={styles.detailToggleText}>
                  {detailOpen ? '▲ Cerrar guía' : '▼ Cómo practicarla'}
                </Text>
              </TouchableOpacity>
            )}

            {detailOpen && (
              <View style={styles.details}>
                {when && (
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>CUÁNDO</Text>
                    <Text style={styles.detailValue}>{when}</Text>
                  </View>
                )}
                {howTo && (
                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>🎧 CÓMO PRACTICARLA</Text>
                    <Text style={styles.detailValue}>{howTo}</Text>
                  </View>
                )}
                {integration && (
                  <View style={[styles.detailBlock, styles.integrationBlock, { borderColor: color + '40' }]}>
                    <Text style={[styles.detailLabel, { color }]}>✦ INTEGRACIÓN</Text>
                    <Text style={styles.detailValue}>{integration}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={{ height: Spacing.xxl }} />
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },

  closeBtn: {
    position: 'absolute', top: 54, right: Spacing.lg,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  closeText: { fontSize: 16, color: Colors.textSecondary },

  center: {
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },

  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11, color: Colors.textDim,
    letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  hz: {
    fontFamily: Fonts.heading,
    fontSize: 96, lineHeight: 96,
    includeFontPadding: false,
  },
  hzUnit: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 18, opacity: 0.7,
    marginTop: -Spacing.sm,
  },
  name: {
    fontFamily: Fonts.headingItalic,
    fontSize: 22,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  timerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: Spacing.xs,
  },
  timerText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 24, color: Colors.textPrimary,
    letterSpacing: 1,
  },
  timerSep: { color: Colors.textDim, fontSize: 16 },
  timerDuration: { fontSize: 12, color: Colors.textDim, fontFamily: Fonts.body },

  waveform: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    height: 60, marginVertical: Spacing.lg,
  },
  waveBar: { width: 3.5, borderRadius: 2 },

  playBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.purpleDim,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  playIcon: { fontSize: 22, color: Colors.purple },
  playIconActive: { color: '#fff' },
  playHint: {
    fontFamily: Fonts.body, fontSize: 12, color: Colors.textDim,
    marginTop: Spacing.xs,
  },

  purpose: {
    fontFamily: Fonts.body, fontSize: 14,
    color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 22, marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },

  detailToggle: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  detailToggleText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13, color: Colors.textSecondary,
    letterSpacing: 0.4,
  },

  details: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  detailBlock: {
    gap: 6,
    backgroundColor: Colors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  integrationBlock: {
    backgroundColor: Colors.goldDim,
    borderWidth: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: Fonts.bodySemiBold,
    color: Colors.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14, color: Colors.textSecondary,
    lineHeight: 22, fontFamily: Fonts.body,
  },
})
