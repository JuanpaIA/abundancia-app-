import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { GradientButton } from '../components/ui/GradientButton'
import { calculateNumerology, getZodiacSign, getBaseFrequency } from '../utils/calculations'
import { ManifestationArea, OnboardingData } from '../types'

const AREA_COLORS: Record<ManifestationArea, string> = {
  dinero: '#C9A84C',
  amor: '#EC4899',
  salud: '#4CAF82',
  proposito: '#7B3FD4',
  felicidad: '#4FC3F7',
}

const AREAS: { key: ManifestationArea; label: string; emoji: string; description: string }[] = [
  { key: 'dinero',    label: 'Dinero y Prosperidad', emoji: '💰', description: 'Abundancia financiera, ingresos, riqueza' },
  { key: 'amor',      label: 'Amor y Relaciones',    emoji: '💗', description: 'Pareja, conexiones, amor propio' },
  { key: 'salud',     label: 'Salud y Vitalidad',    emoji: '✨', description: 'Bienestar físico, energía, sanación' },
  { key: 'proposito', label: 'Propósito y Misión',   emoji: '🔮', description: 'Carrera, misión de vida, legado' },
  { key: 'felicidad', label: 'Felicidad y Paz',      emoji: '🌟', description: 'Alegría, equilibrio, bienestar emocional' },
]

interface Props {
  onComplete: (data: OnboardingData) => void
}

export function QuickOnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [manifestationArea, setManifestationArea] = useState<ManifestationArea | null>(null)

  function handleNameNext() {
    if (!name.trim()) return Alert.alert('Ingresa tu nombre completo')
    setStep(2)
  }

  function formatBirthDate(input: string): string {
    const digits = input.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 4) return digits
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
  }

  function normalizeBirthDate(input: string): string {
    const digits = input.replace(/\D/g, '')
    if (digits.length === 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
    }
    return input.trim()
  }

  function handleDateNext() {
    const normalized = normalizeBirthDate(birthDate)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      Alert.alert('Fecha incompleta', 'Ingresa tu fecha de nacimiento.\nEjemplo: 1990-11-15')
      return
    }
    const year = parseInt(normalized.slice(0, 4))
    if (year < 1920 || year > 2010) {
      Alert.alert('Fecha inválida', 'Verifica el año de nacimiento.')
      return
    }
    setBirthDate(normalized)
    setStep(3)
  }

  function handleAreaNext() {
    if (!manifestationArea) return Alert.alert('Selecciona qué deseas manifestar')
    const normalized = normalizeBirthDate(birthDate)
    const zodiac = getZodiacSign(normalized)
    const numerology = calculateNumerology(name)
    const frequency = getBaseFrequency(numerology)
    onComplete({ name: name.trim(), birthDate: normalized, zodiac, numerology, frequency, manifestationArea })
  }

  const BACK_STEPS: Record<number, number> = { 2: 1, 3: 2 }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {step > 1 && (
          <TouchableOpacity onPress={() => setStep(BACK_STEPS[step])} style={styles.backBtn}>
            <Text style={styles.backText}>← Regresar</Text>
          </TouchableOpacity>
        )}

        <View style={styles.progress}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.progressDot, step >= i && styles.progressDotActive]} />
          ))}
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>✨</Text>
            <Text style={styles.title}>Tu nombre energético</Text>
            <Text style={styles.subtitle}>Lo usamos para calcular tu número numerológico personal</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: María Fernanda López"
                placeholderTextColor="#7A7890"
                autoCapitalize="words"
              />
            </View>
            <GradientButton title="Continuar" onPress={handleNameNext} />
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>🌙</Text>
            <Text style={styles.title}>Tu fecha de nacimiento</Text>
            <Text style={styles.subtitle}>Calculamos tu signo zodiacal y número numerológico</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Fecha de nacimiento</Text>
              <TextInput
                style={styles.input}
                value={birthDate}
                onChangeText={v => setBirthDate(formatBirthDate(v))}
                placeholder="1990-11-15"
                placeholderTextColor="#7A7890"
                keyboardType="numeric"
                maxLength={10}
              />
              <View style={styles.dateHint}>
                <Text style={styles.dateHintPart}>AAAA</Text>
                <Text style={styles.dateHintSep}>—</Text>
                <Text style={styles.dateHintPart}>MM</Text>
                <Text style={styles.dateHintSep}>—</Text>
                <Text style={styles.dateHintPart}>DD</Text>
              </View>
              <Text style={styles.dateHintLabel}>Año · Mes · Día</Text>
            </View>
            <GradientButton title="Continuar" onPress={handleDateNext} />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={styles.title}>¿Qué deseas manifestar?</Text>
            <Text style={styles.subtitle}>Tu protocolo se alinea con tu intención principal</Text>
            <View style={styles.areaGrid}>
              {AREAS.map(area => {
                const areaColor = AREA_COLORS[area.key]
                const isSelected = manifestationArea === area.key
                return (
                  <TouchableOpacity
                    key={area.key}
                    style={[styles.areaCard, isSelected && { borderColor: areaColor, borderWidth: 2 }]}
                    onPress={() => setManifestationArea(area.key)}
                    activeOpacity={0.8}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={[areaColor + '28', 'transparent']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                    )}
                    <View style={[styles.areaEmojiWrap, isSelected && { backgroundColor: areaColor + '22' }]}>
                      <Text style={styles.areaEmoji}>{area.emoji}</Text>
                    </View>
                    <Text style={[styles.areaLabel, isSelected && { color: areaColor }]}>
                      {area.label}
                    </Text>
                    <Text style={styles.areaDescription}>{area.description}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
            <GradientButton title="Ver mi protocolo" onPress={handleAreaNext} />
          </View>
        )}

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60 },
  backBtn: { paddingBottom: Spacing.sm },
  backText: { fontSize: 14, color: Colors.textSecondary },
  progress: { flexDirection: 'row', gap: Spacing.sm, marginBottom: 40, justifyContent: 'center' },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  progressDotActive: { backgroundColor: Colors.gold, width: 24 },
  stepContainer: { gap: Spacing.md },
  stepEmoji: { fontSize: 48, textAlign: 'center' },
  title: { fontSize: 26, color: Colors.textPrimary, fontFamily: Fonts.heading, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  inputWrapper: { gap: Spacing.xs },
  label: { fontSize: 14, color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.input, borderRadius: Radius.md,
    padding: Spacing.md, color: Colors.textPrimary,
    fontSize: 16, borderWidth: 1, borderColor: Colors.border,
  },
  dateHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dateHintPart: { fontSize: 13, color: Colors.gold, fontWeight: '700', letterSpacing: 1 },
  dateHintSep: { fontSize: 13, color: Colors.textDisabled },
  dateHintLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  areaGrid: { gap: Spacing.sm },
  areaCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    gap: 6, overflow: 'hidden',
  },
  areaEmojiWrap: {
    width: 44, height: 44, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.input,
  },
  areaEmoji: { fontSize: 24 },
  areaLabel: { fontSize: 16, color: Colors.textPrimary, fontWeight: '600' },
  areaDescription: { fontSize: 13, color: Colors.textSecondary },
})
