import React from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme'

const AREA_LABEL: Record<string, { emoji: string; label: string }> = {
  dinero:    { emoji: '💰', label: 'Abundancia' },
  amor:      { emoji: '💕', label: 'Amor' },
  salud:     { emoji: '✨', label: 'Salud' },
  proposito: { emoji: '🎯', label: 'Propósito' },
  felicidad: { emoji: '🌟', label: 'Felicidad' },
}

interface Props {
  firstName: string
  manifestationArea: string
  streak: number
  planDay: number
  planDuration: number
  overallRate: number
  todayCount: number
  totalTasks: number
  onClose: () => void
}

export function TransformationCard({ firstName, manifestationArea, streak, planDay, planDuration, overallRate, todayCount, totalTasks, onClose }: Props) {
  const area = AREA_LABEL[manifestationArea] ?? { emoji: '✦', label: manifestationArea }
  const planPct = Math.round((Math.min(planDay - 1, planDuration) / planDuration) * 100)

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        {/* Dim background */}
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />

        {/* The card (designed to screenshot + share) */}
        <View style={styles.cardWrap}>
          <LinearGradient
            colors={['#1a1030', '#0e0b22', '#0a0814']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* @ts-ignore */}
            <View style={styles.orbTop} aria-hidden />
            {/* @ts-ignore */}
            <View style={styles.orbBottom} aria-hidden />

            {/* Header */}
            <View style={styles.cardHeader}>
              <Text style={styles.brandMark}>LÚMINA</Text>
              <View style={styles.areaPill}>
                <Text style={styles.areaPillEmoji}>{area.emoji}</Text>
                <Text style={styles.areaPillLabel}>{area.label}</Text>
              </View>
            </View>

            {/* Greeting */}
            <Text style={styles.greeting}>{firstName}</Text>
            <Text style={styles.subtitle}>está manifestando su visión</Text>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerStar}>✦</Text>
              <View style={styles.divider} />
            </View>

            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{streak}</Text>
                <Text style={styles.statLabel}>días de{'\n'}racha</Text>
              </View>
              <View style={[styles.statBox, styles.statBoxCenter]}>
                <Text style={[styles.statNumber, { color: Colors.gold }]}>{overallRate}%</Text>
                <Text style={styles.statLabel}>protocolo{'\n'}completado</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>Día {planDay}</Text>
                <Text style={styles.statLabel}>de {planDuration}{'\n'}en el plan</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={[Colors.purpleAccent, Colors.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${planPct}%` as any }]}
                />
              </View>
              <Text style={styles.progressLabel}>Plan de manifestación · {planPct}%</Text>
            </View>

            {/* Today */}
            <View style={styles.todayRow}>
              <Text style={styles.todayText}>Hoy</Text>
              <View style={styles.todayDots}>
                {Array.from({ length: totalTasks }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.todayDot,
                      i < todayCount && styles.todayDotFilled,
                    ]}
                  />
                ))}
              </View>
              <Text style={styles.todayCount}>{todayCount}/{totalTasks}</Text>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>luumina.pro</Text>
          </LinearGradient>
        </View>

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  cardWrap: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.purpleAccent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },

  card: {
    padding: Spacing.xl,
    gap: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },

  orbTop: {
    position: 'absolute', width: 250, height: 250, top: -80, right: -60, borderRadius: 999,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  orbBottom: {
    position: 'absolute', width: 200, height: 200, bottom: -60, left: -40, borderRadius: 999,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(212,175,85,0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  brandMark: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.textDim,
    letterSpacing: 3,
  },
  areaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  areaPillEmoji: { fontSize: 11 },
  areaPillLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.gold,
  },

  greeting: {
    fontFamily: Fonts.heading,
    fontSize: 38,
    color: Colors.textPrimary,
    lineHeight: 42,
  },
  subtitle: {
    fontFamily: Fonts.headingItalic,
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: -Spacing.xs,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  divider: { flex: 1, height: 0.5, backgroundColor: Colors.borderGold },
  dividerStar: { fontSize: 11, color: Colors.gold },

  statsGrid: {
    flexDirection: 'row',
    gap: 1,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statBoxCenter: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
  },
  statNumber: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.purpleAccent,
    lineHeight: 32,
  },
  statLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textDim,
    textAlign: 'center',
    lineHeight: 14,
  },

  progressSection: { gap: 6 },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: Radius.full,
  },
  progressLabel: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textDim,
  },

  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: Colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  todayDots: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  todayDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.border,
  },
  todayDotFilled: {
    backgroundColor: Colors.purpleAccent,
  },
  todayCount: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.purpleAccent,
  },

  footer: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textDim,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: Spacing.xs,
  },

  closeBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  closeText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
})
