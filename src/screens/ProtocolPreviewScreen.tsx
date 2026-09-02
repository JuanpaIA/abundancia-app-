import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { OnboardingData } from '@lumina/core'
import { ScreenBackground } from '../components/ui/ScreenBackground'

interface Props {
  data: OnboardingData
  onUnlock: () => void
}

const AREA_LABELS: Record<string, string> = {
  dinero: 'Abundancia Financiera',
  amor: 'Amor y Relaciones',
  salud: 'Salud y Vitalidad',
  proposito: 'Propósito de Vida',
  felicidad: 'Felicidad y Paz',
}

const AREA_COLORS: Record<string, string> = {
  dinero: '#C9A84C',
  amor: '#EC4899',
  salud: '#4CAF82',
  proposito: '#7B3FD4',
  felicidad: '#4FC3F7',
}

function BlurredLine({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return (
    <View style={[styles.blurLine, { width: width as any, height }]} />
  )
}

function BlurredBlock() {
  return (
    <View style={styles.blurBlock}>
      <BlurredLine width="90%" />
      <BlurredLine width="75%" />
      <BlurredLine width="85%" />
    </View>
  )
}

export function ProtocolPreviewScreen({ data, onUnlock }: Props) {
  const areaLabel = AREA_LABELS[data.manifestationArea] ?? 'Manifestación'
  const areaColor = AREA_COLORS[data.manifestationArea] ?? Colors.gold

  return (
    <View style={styles.container}>
      <ScreenBackground />
      {/* Gradiente ambiental del área — se superpone al fondo base */}
      <LinearGradient
        colors={[areaColor + '28', 'transparent']}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.45 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.emojiWrap}><Text style={styles.emoji}>🔮</Text></View>
        <Text style={styles.eyebrow}>PLAN PERSONALIZADO</Text>
        <Text style={styles.title}>Tu protocolo está listo</Text>
        <Text style={[styles.subtitle, { color: areaColor }]}>
          {data.name.split(' ')[0]} · {areaLabel}
        </Text>

        {/* Preview difuminado del protocolo */}
        <View style={styles.previewCard}>
          <View style={styles.lockOverlay}>
            <Text style={styles.lockEmoji}>🔒</Text>
            <Text style={styles.lockText}>Desbloquea tu protocolo</Text>
            <Text style={styles.lockSub}>Empieza gratis, sin cobros inmediatos</Text>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>✦ RITUAL DE HOY</Text>
            <BlurredLine width="70%" height={18} />
            <BlurredBlock />
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>✦ AFIRMACIÓN</Text>
            <BlurredLine width="95%" height={14} />
            <BlurredLine width="60%" height={14} />
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>✦ RUTINA MAÑANA</Text>
            <BlurredBlock />
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>✦ COLOR VIBRACIONAL</Text>
            <View style={styles.colorRow}>
              <View style={[styles.colorCircle, { backgroundColor: areaColor }]} />
              <BlurredLine width="50%" height={14} />
            </View>
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>✦ FRECUENCIA</Text>
            <BlurredLine width="40%" height={20} />
          </View>
        </View>

        {/* Chips del sistema de personalización */}
        <View style={styles.chips}>
          <View style={styles.chip}><Text style={styles.chipText}>🔢 Número {data.numerology}</Text></View>
          <View style={[styles.chip, styles.chipHz, { borderColor: areaColor + '66', backgroundColor: areaColor + '18' }]}>
            <Text style={[styles.chipHzNum, { color: areaColor }]}>{data.frequency}</Text>
            <Text style={[styles.chipHzUnit, { color: areaColor }]}>Hz</Text>
          </View>
          <View style={styles.chip}><Text style={styles.chipText}>🌙 Fase lunar</Text></View>
          <View style={[styles.chip, { borderColor: areaColor + '66', backgroundColor: areaColor + '18' }]}>
            <Text style={[styles.chipText, { color: areaColor }]}>✨ {areaLabel}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.unlockBtn} onPress={onUnlock} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.gold, Colors.goldLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.unlockBtnGradient}
          >
            <Text style={styles.unlockBtnText}>Desbloquear mi protocolo gratis ✦</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.legal}>Sin cobros durante tu período de prueba · Cancela cuando quieras</Text>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60, alignItems: 'center', gap: Spacing.lg },

  emojiWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.purpleDim,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 36 },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11,
    color: Colors.textDim, letterSpacing: 2,
    textAlign: 'center',
  },
  title: { fontSize: 28, color: Colors.textPrimary, fontFamily: Fonts.headingSemiBold, textAlign: 'center', lineHeight: 34 },
  subtitle: { fontFamily: Fonts.headingItalic, fontSize: 15, color: Colors.gold, textAlign: 'center', marginTop: -Spacing.xs },

  previewCard: {
    width: '100%',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    padding: Spacing.lg,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,8,20,0.80)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.lg,
  },
  lockEmoji: { fontSize: 32 },
  lockText: { fontFamily: Fonts.headingSemiBold, fontSize: 18, color: '#FFFFFF' },
  lockSub: { fontFamily: Fonts.body, fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  previewSection: { gap: 8 },
  sectionLabel: {
    fontSize: 11, color: Colors.gold, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
  },

  blurLine: {
    backgroundColor: Colors.border,
    borderRadius: 4,
    opacity: 0.6,
  },
  blurBlock: { gap: 8 },

  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.gold, opacity: 0.4,
  },

  chips: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8, justifyContent: 'center',
  },
  chip: {
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)',
  },
  chipText: { fontSize: 12, color: Colors.gold, fontWeight: '600' },
  chipHz: {
    flexDirection: 'row', alignItems: 'baseline', gap: 2,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  chipHzNum: { fontFamily: Fonts.heading, fontSize: 22, lineHeight: 26, includeFontPadding: false },
  chipHzUnit: { fontFamily: Fonts.bodyBold, fontSize: 11 },

  unlockBtn: {
    width: '100%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  unlockBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  unlockBtnText: { fontFamily: Fonts.bodySemiBold, color: Colors.background, fontSize: 16, letterSpacing: 0.3 },

  legal: {
    fontSize: 12, color: Colors.textDisabled,
    textAlign: 'center', lineHeight: 18,
  },
})
