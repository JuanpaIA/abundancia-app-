import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme'

interface Props {
  affirmation: string
  numerologyNumber?: number
  numerologyArchetype?: string
  onClose: () => void
  onDone?: () => void
  isDone?: boolean
}

export function AffirmationReveal({ affirmation, numerologyNumber, numerologyArchetype, onClose, onDone, isDone }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        {/* Background gradient */}
        <LinearGradient
          colors={['#0a0614', '#160f2e', '#0a0814']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Purple orb */}
        {/* @ts-ignore */}
        <View style={styles.orbPurple} aria-hidden />
        {/* Gold orb */}
        {/* @ts-ignore */}
        <View style={styles.orbGold} aria-hidden />

        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Content */}
        <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.eyebrow}>AFIRMACIÓN DE HOY</Text>

          {/* Decorative line */}
          <View style={styles.lineRow}>
            <View style={styles.line} />
            <Text style={styles.lineStar}>✦</Text>
            <View style={styles.line} />
          </View>

          {/* Affirmation text */}
          <Text style={styles.quote}>"{affirmation}"</Text>

          {/* Decorative line */}
          <View style={styles.lineRow}>
            <View style={styles.line} />
            <Text style={styles.lineStar}>✦</Text>
            <View style={styles.line} />
          </View>

          {/* Numerology context */}
          {numerologyNumber && numerologyArchetype ? (
            <View style={styles.numBox}>
              <View style={styles.numBadge}>
                <Text style={styles.numBadgeText}>{numerologyNumber}</Text>
              </View>
              <Text style={styles.numArchetype}>{numerologyArchetype}</Text>
            </View>
          ) : null}

          {/* Instruction */}
          <Text style={styles.instruction}>
            Repítela 3 veces en voz alta{'\n'}mirándote a los ojos
          </Text>

          {/* CTA */}
          {onDone && !isDone ? (
            <TouchableOpacity style={styles.doneBtn} onPress={onDone} activeOpacity={0.85}>
              <LinearGradient
                colors={[Colors.purpleAccent, '#6d5bdb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.doneBtnGradient}
              >
                <Text style={styles.doneBtnText}>Declarado ✦</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : isDone ? (
            <View style={styles.donedBadge}>
              <Text style={styles.donedText}>✦ Completado hoy</Text>
            </View>
          ) : null}
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },

  orbPurple: {
    position: 'absolute', width: 360, height: 360, top: -80, right: -80, borderRadius: 999,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(167,139,250,0.20) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  orbGold: {
    position: 'absolute', width: 280, height: 280, bottom: 40, left: -60, borderRadius: 999,
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

  content: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.md,
  },

  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.textDim,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    gap: Spacing.sm,
  },
  line: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.borderGold,
  },
  lineStar: {
    fontSize: 12,
    color: Colors.gold,
  },

  quote: {
    fontFamily: Fonts.headingItalic,
    fontSize: 26,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
    paddingHorizontal: Spacing.sm,
  },

  numBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  numBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  numBadgeText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 12,
    color: Colors.background,
  },
  numArchetype: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.gold,
  },

  instruction: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.xs,
  },

  doneBtn: {
    width: '100%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  doneBtnGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.5,
  },

  donedBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(76,175,130,0.12)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(76,175,130,0.35)',
    marginTop: Spacing.sm,
  },
  donedText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.success,
  },
})
