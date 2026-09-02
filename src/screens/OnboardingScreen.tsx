import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { Colors, Spacing, Radius } from '../constants/theme'
import { ScreenBackground } from '../components/ui/ScreenBackground'
import { GradientButton } from '../components/ui/GradientButton'
import { Card } from '../components/ui/Card'
import { supabase } from '../services/supabase'
import { calculateNumerology, getZodiacSign, getBaseFrequency, ManifestationArea, NUMEROLOGY_PROFILES, OnboardingData } from '@lumina/core'

const ZODIAC_LABELS: Record<string, string> = {
  aries: 'Aries ♈', tauro: 'Tauro ♉', geminis: 'Géminis ♊',
  cancer: 'Cáncer ♋', leo: 'Leo ♌', virgo: 'Virgo ♍',
  libra: 'Libra ♎', escorpio: 'Escorpio ♏', sagitario: 'Sagitario ♐',
  capricornio: 'Capricornio ♑', acuario: 'Acuario ♒', piscis: 'Piscis ♓',
}

const AREAS: { key: ManifestationArea; label: string; emoji: string; description: string }[] = [
  { key: 'dinero', label: 'Dinero y Prosperidad', emoji: '💰', description: 'Abundancia financiera, ingresos, riqueza' },
  { key: 'amor', label: 'Amor y Relaciones', emoji: '💗', description: 'Pareja, conexiones, amor propio' },
  { key: 'salud', label: 'Salud y Vitalidad', emoji: '✨', description: 'Bienestar físico, energía, sanación' },
  { key: 'proposito', label: 'Propósito y Misión', emoji: '🔮', description: 'Carrera, misión de vida, legado' },
  { key: 'felicidad', label: 'Felicidad y Paz', emoji: '🌟', description: 'Alegría, equilibrio, bienestar emocional' },
]

interface Props {
  userId?: string
  onComplete: (data?: OnboardingData) => void
  onSignOut?: () => void
}

export function OnboardingScreen({ userId, onComplete, onSignOut }: Props) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [manifestationArea, setManifestationArea] = useState<ManifestationArea | null>(null)
  const [loading, setLoading] = useState(false)
  const [calculated, setCalculated] = useState<{
    zodiac: string; numerology: number; frequency: number
  } | null>(null)

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

  // Normaliza cualquier formato de entrada a YYYY-MM-DD
  function normalizeBirthDate(input: string): string {
    const digits = input.replace(/\D/g, '')
    if (digits.length === 8) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
    }
    return input.trim()
  }

  function handleDateNext() {
    const normalized = normalizeBirthDate(birthDate)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(normalized)) {
      Alert.alert('Fecha incompleta', 'Ingresa tu fecha de nacimiento completa.\nEjemplo: 1990-11-15')
      return
    }
    const year = parseInt(normalized.slice(0, 4))
    if (year < 1920 || year > 2010) {
      Alert.alert('Fecha inválida', 'Verifica el año de nacimiento.')
      return
    }
    const zodiac = getZodiacSign(normalized)
    const numerology = calculateNumerology(name)
    const frequency = getBaseFrequency(numerology)
    setBirthDate(normalized)
    setCalculated({ zodiac, numerology, frequency })
    setStep(3)
  }

  function handleAreaNext() {
    if (!manifestationArea) return Alert.alert('Selecciona qué deseas manifestar')
    setStep(6)
  }

  async function handleSave() {
    if (!calculated || !manifestationArea) return
    setLoading(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase.from('profiles').update({
        full_name: name,
        birth_date: birthDate,
        zodiac_sign: calculated.zodiac,
        numerology_number: calculated.numerology,
        base_frequency: calculated.frequency,
        manifestation_area: manifestationArea,
        goal_details: {},
        plan_duration: 30,
        plan_start_date: today,
      }).eq('id', userId)

      setLoading(false)
      if (error) {
        void supabase.from('error_reports').insert({
          user_id: userId,
          section: 'onboarding',
          error_message: error.message,
          app_context: { action: 'save_profile', manifestation_area: manifestationArea },
        })
        Alert.alert(
          'Error al guardar',
          `No se pudo guardar tu perfil.\n\nDetalle: ${error.message}\n\nContacta soporte si persiste.`,
          [{ text: 'OK' }]
        )
        return
      }

      // Enviar email de bienvenida en background (no bloqueante)
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.email) {
          supabase.functions.invoke('send-welcome-email', {
            body: { email: data.user.email, name },
          }).catch(() => {})
        }
      })

      onComplete(undefined)
    } catch (e: any) {
      setLoading(false)
      void supabase.from('error_reports').insert({
        user_id: userId,
        section: 'onboarding',
        error_message: e?.message ?? 'Error inesperado',
        app_context: { action: 'save_profile_exception', manifestation_area: manifestationArea },
      })
      Alert.alert('Error inesperado', `${e?.message ?? 'Error desconocido'}`, [{ text: 'OK' }])
    }
  }

  const BACK_STEPS: Record<number, number> = { 2: 1, 3: 2, 6: 3 }

  return (
    <View style={styles.container}>
      <ScreenBackground />
      {onSignOut && (
        <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {step > 1 && (
          <TouchableOpacity onPress={() => setStep(BACK_STEPS[step])} style={styles.backBtn}>
            <Text style={styles.backText}>← Regresar</Text>
          </TouchableOpacity>
        )}

        <View style={styles.progress}>
          {[1, 2, 3, 6].map(i => (
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
            <Text style={styles.subtitle}>Calculamos tu signo zodiacal y tus portales energéticos</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Fecha de nacimiento</Text>
              <TextInput
                style={styles.input}
                value={birthDate}
                onChangeText={text => setBirthDate(formatBirthDate(text))}
                placeholder="Ej: 19901115"
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
            <GradientButton title="Calcular mi perfil" onPress={handleDateNext} />
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={styles.title}>¿Qué deseas manifestar?</Text>
            <Text style={styles.subtitle}>
              Tu sistema diario se alinea completamente con tu intención principal.
              Elige el área más importante para ti ahora.
            </Text>

            <View style={styles.areaGrid}>
              {AREAS.map(area => (
                <TouchableOpacity
                  key={area.key}
                  style={[styles.areaCard, manifestationArea === area.key && styles.areaCardSelected]}
                  onPress={() => setManifestationArea(area.key)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.areaEmoji}>{area.emoji}</Text>
                  <Text style={[styles.areaLabel, manifestationArea === area.key && styles.areaLabelSelected]}>
                    {area.label}
                  </Text>
                  <Text style={styles.areaDescription}>{area.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <GradientButton title="Continuar" onPress={handleAreaNext} />
          </View>
        )}

        {step === 6 && calculated && (() => {
          const numProfile = NUMEROLOGY_PROFILES[calculated.numerology]
          const selectedArea = AREAS.find(a => a.key === manifestationArea)
          return (
            <View style={styles.stepContainer}>
              <Text style={styles.stepEmoji}>🔮</Text>
              <Text style={styles.title}>Tu perfil energético</Text>
              <Text style={styles.subtitle}>Tu sistema está listo y personalizado para ti</Text>

              <View style={styles.cards}>

                {/* Número energético — tarjeta expandida */}
                <Card goldBorder style={styles.numCard}>
                  <View style={styles.numHeader}>
                    <Text style={styles.resultNumber}>{calculated.numerology}</Text>
                    <View style={styles.numHeaderRight}>
                      <Text style={styles.numArchetype}>{numProfile.archetype}</Text>
                      <View style={styles.qualityRow}>
                        {numProfile.qualities.map(q => (
                          <View key={q} style={styles.qualityChip}>
                            <Text style={styles.qualityText}>{q}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={styles.numEssence}>{numProfile.essence}</Text>
                  {manifestationArea && (
                    <View style={styles.numAreaBlock}>
                      <Text style={styles.numAreaLabel}>
                        {selectedArea?.emoji} En tu camino de {selectedArea?.label.toLowerCase()}
                      </Text>
                      <Text style={styles.numAreaMessage}>
                        {numProfile.areaMessage[manifestationArea]}
                      </Text>
                    </View>
                  )}
                </Card>

                <Card style={styles.resultCard}>
                  <Text style={styles.resultValue}>{ZODIAC_LABELS[calculated.zodiac]}</Text>
                  <Text style={styles.resultLabel}>Tu signo zodiacal</Text>
                </Card>

                <Card style={styles.resultCard}>
                  <Text style={styles.resultValue}>
                    {selectedArea?.emoji}{' '}{selectedArea?.label}
                  </Text>
                  <Text style={styles.resultLabel}>Tu área de manifestación</Text>
                </Card>

                <Card style={styles.resultCard}>
                  <Text style={styles.resultValue}>{calculated.frequency} Hz</Text>
                  <Text style={styles.resultLabel}>Tu frecuencia base</Text>
                </Card>

              </View>

              <GradientButton
                title={userId ? 'Ver mi protocolo de hoy' : 'Continuar'}
                onPress={userId ? handleSave : () => {
                  if (!calculated || !manifestationArea) return
                  onComplete({
                    name: name.trim(),
                    birthDate,
                    zodiac: calculated.zodiac,
                    numerology: calculated.numerology,
                    frequency: calculated.frequency,
                    manifestationArea,
                  })
                }}
                loading={loading}
              />
            </View>
          )
        })()}

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  signOutBtn: { position: 'absolute', top: 52, right: Spacing.lg, zIndex: 10 },
  signOutText: { fontSize: 13, color: Colors.textDisabled },
  scroll: { padding: Spacing.lg, paddingTop: 60 },
  backBtn: { paddingBottom: Spacing.sm },
  backText: { fontSize: 14, color: Colors.textSecondary },
  progress: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xxl, justifyContent: 'center' },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  progressDotActive: { backgroundColor: Colors.gold, width: 24 },
  stepContainer: { gap: Spacing.md },
  stepEmoji: { fontSize: 48, textAlign: 'center' },
  title: { fontSize: 26, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  inputWrapper: { gap: Spacing.xs },
  label: { fontSize: 14, color: Colors.textSecondary },
  input: {
    backgroundColor: Colors.input,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  areaGrid: { gap: Spacing.sm },
  areaCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  areaCardSelected: {
    borderColor: Colors.gold,
    borderWidth: 2,
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
  },
  areaEmoji: { fontSize: 28 },
  areaLabel: { fontSize: 16, color: Colors.textPrimary, fontWeight: '600' },
  areaLabelSelected: { color: Colors.gold },
  areaDescription: { fontSize: 13, color: Colors.textSecondary },
  cards: { gap: Spacing.md },
  resultCard: { alignItems: 'center', paddingVertical: Spacing.lg },
  resultNumber: { fontSize: 56, color: Colors.gold, fontWeight: '700', lineHeight: 60 },
  resultValue: { fontSize: 18, color: Colors.textPrimary, fontWeight: '600', textAlign: 'center' },
  resultLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },

  // Tarjeta numerológica expandida
  numCard: { gap: Spacing.md },
  numHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  numHeaderRight: { flex: 1, gap: 6 },
  numArchetype: { fontSize: 20, color: Colors.gold, fontWeight: '700' },
  qualityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  qualityChip: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.30)',
  },
  qualityText: { fontSize: 11, color: Colors.gold, fontWeight: '600' },
  numEssence: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21, fontStyle: 'italic' },
  numAreaBlock: {
    backgroundColor: 'rgba(201,168,76,0.06)',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 6,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
  },
  numAreaLabel: { fontSize: 12, color: Colors.gold, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  numAreaMessage: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },

  dateHint: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6,
  },
  dateHintPart: {
    fontSize: 13, color: Colors.gold, fontWeight: '700', letterSpacing: 1,
  },
  dateHintSep: { fontSize: 13, color: Colors.textDisabled },
  dateHintLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

})
