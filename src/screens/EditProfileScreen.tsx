import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { GradientButton } from '../components/ui/GradientButton'
import { supabase } from '../services/supabase'
import { calculateNumerology, getZodiacSign, getBaseFrequency, ManifestationArea, UserProfile, GoalDetails, NUMEROLOGY_PROFILES } from '@lumina/core'
import { ManifestationIntakeScreen } from './ManifestationIntakeScreen'

// ─── Labels y mapas ───────────────────────────────────────────────────────────

const ZODIAC_LABELS: Record<string, string> = {
  aries: 'Aries ♈', tauro: 'Tauro ♉', geminis: 'Géminis ♊',
  cancer: 'Cáncer ♋', leo: 'Leo ♌', virgo: 'Virgo ♍',
  libra: 'Libra ♎', escorpio: 'Escorpio ♏', sagitario: 'Sagitario ♐',
  capricornio: 'Capricornio ♑', acuario: 'Acuario ♒', piscis: 'Piscis ♓',
}

const AREAS: { key: ManifestationArea; label: string; emoji: string }[] = [
  { key: 'dinero',    label: 'Dinero y Prosperidad',  emoji: '💰' },
  { key: 'amor',      label: 'Amor y Relaciones',      emoji: '💗' },
  { key: 'salud',     label: 'Salud y Vitalidad',      emoji: '✨' },
  { key: 'proposito', label: 'Propósito y Misión',     emoji: '🔮' },
  { key: 'felicidad', label: 'Felicidad y Paz',        emoji: '🌟' },
]

const OPTION_LABELS: Record<string, string> = {
  empleado: 'Soy empleado/a', emprendedor: 'Soy emprendedor/a',
  freelance: 'Trabajo independiente', buscando: 'Busco oportunidades',
  nueva: 'Conocer una pareja nueva', mejorar: 'Mejorar mi relación actual',
  propio: 'Fortalecer mi amor propio', reconectar: 'Reconectar con alguien',
  deportes: 'Deportes y naturaleza', cultura: 'Arte, música y cultura',
  social: 'Reuniones sociales', digital: 'Conexiones digitales',
  energia: 'Más energía y vitalidad', peso: 'Peso y composición corporal',
  mental: 'Salud mental y emocional', especifica: 'Condición específica',
  claro: 'Lo tengo claro pero no lo vivo', iniciando: 'Estoy empezando a vivirlo',
  expandir: 'Quiero expandirlo',
  trabajo: 'Mi trabajo o rutina', relaciones: 'Relaciones difíciles',
  mente: 'Pensamientos negativos', proposito: 'Falta de dirección',
}

const QUESTION_LABELS: Partial<Record<keyof GoalDetails, string>> = {
  situation: 'Situación actual',
  skill: 'Habilidad para generar dinero',
  monthly_goal: 'Meta de ingresos al mes',
  money_obstacle: 'Obstáculo principal',
  relationship_type: 'Tipo de amor a manifestar',
  social_environments: 'Ambientes donde te sientes cómodo/a',
  shared_activities: 'Actividades de conexión',
  partner_values: 'Lo que más valoras en una pareja',
  health_focus: 'Aspecto de salud a transformar',
  health_obstacle: 'Mayor obstáculo con la salud',
  health_habit: 'Primer hábito a desarrollar',
  purpose_clarity: 'Relación con tu propósito',
  flow_activities: 'Actividades que te hacen perder el tiempo',
  desired_impact: 'Impacto que quieres tener',
  joy_blockers: 'Lo que te roba la alegría',
  joy_activities: 'Actividades que te generan gozo',
  happiness_change: 'El cambio que haría tu vida más feliz',
}

const AREA_FIELDS: Record<ManifestationArea, (keyof GoalDetails)[]> = {
  dinero:    ['situation', 'skill', 'monthly_goal', 'money_obstacle'],
  amor:      ['relationship_type', 'social_environments', 'shared_activities', 'partner_values'],
  salud:     ['health_focus', 'health_obstacle', 'health_habit'],
  proposito: ['purpose_clarity', 'flow_activities', 'desired_impact'],
  felicidad: ['joy_blockers', 'joy_activities', 'happiness_change'],
}

function displayValue(key: keyof GoalDetails, value: string): string {
  return OPTION_LABELS[value] || value
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  profile: UserProfile
  onSave: () => void
  onBack: () => void
}

export function EditProfileScreen({ profile, onSave, onBack }: Props) {
  const [name, setName] = useState(profile.full_name)
  const [birthDate, setBirthDate] = useState(profile.birth_date)
  const [manifestationArea, setManifestationArea] = useState<ManifestationArea>(profile.manifestation_area)
  const [goalDetails, setGoalDetails] = useState<GoalDetails>(profile.goal_details || {})
  const [planDuration, setPlanDuration] = useState<number>(profile.plan_duration ?? 30)
  const [loading, setLoading] = useState(false)
  const [editingIntake, setEditingIntake] = useState(false)

  const previewZodiac = (() => {
    try { return getZodiacSign(birthDate) } catch { return profile.zodiac_sign }
  })()
  const previewNumerology = name.trim() ? calculateNumerology(name) : profile.numerology_number
  const currentArea = AREAS.find(a => a.key === manifestationArea)!
  const fieldsForArea = AREA_FIELDS[manifestationArea] || []
  const filledFields = fieldsForArea.filter(f => goalDetails[f])

  async function handleIntakeComplete(details: GoalDetails) {
    setGoalDetails(details)
    setEditingIntake(false)
    await supabase.from('profiles').update({ goal_details: details }).eq('id', profile.id)
  }

  async function handleSave() {
    if (!name.trim()) return Alert.alert('El nombre no puede estar vacío')
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(birthDate)) return Alert.alert('Ingresa tu fecha completa\nEjemplo: 19901115')

    setLoading(true)
    const zodiac = getZodiacSign(birthDate)
    const numerology = calculateNumerology(name)
    const frequency = getBaseFrequency(numerology)

    const { error } = await supabase.from('profiles').update({
      full_name: name,
      birth_date: birthDate,
      zodiac_sign: zodiac,
      numerology_number: numerology,
      base_frequency: frequency,
      manifestation_area: manifestationArea,
      plan_duration: planDuration,
    }).eq('id', profile.id)

    setLoading(false)
    if (error) return Alert.alert('Error', error.message)
    Alert.alert('✦ Perfil actualizado', 'Tu sistema se ha recalibrado.', [
      { text: 'Ver mi protocolo', onPress: onSave }
    ])
  }

  if (editingIntake) {
    return (
      <ManifestationIntakeScreen
        area={manifestationArea}
        onComplete={handleIntakeComplete}
        onBack={() => setEditingIntake(false)}
      />
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#16102a', '#0e0b1e', '#0a0814']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      {/* @ts-ignore */}
      <View style={styles.orbGold} aria-hidden />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Mi perfil</Text>
        </View>

        {/* ── Resumen energético ── */}
        {(() => {
          const numProfile = NUMEROLOGY_PROFILES[profile.numerology_number]
          const currentAreaInfo = AREAS.find(a => a.key === profile.manifestation_area)
          return (
            <View style={styles.energyCard}>
              <Text style={styles.energyName}>{profile.full_name}</Text>

              {/* Fila compacta: signo y frecuencia */}
              <View style={styles.energyRow}>
                <View style={styles.energyItem}>
                  <Text style={styles.energyValue}>{ZODIAC_LABELS[profile.zodiac_sign] || profile.zodiac_sign}</Text>
                  <Text style={styles.energyLabel}>Signo zodiacal</Text>
                </View>
                <View style={styles.energySep} />
                <View style={styles.energyItem}>
                  <Text style={styles.energyValue}>{profile.base_frequency} Hz</Text>
                  <Text style={styles.energyLabel}>Frecuencia base</Text>
                </View>
              </View>

              {/* Número energético expandido */}
              {numProfile && (
                <View style={styles.numSection}>
                  <View style={styles.numHeader}>
                    <Text style={styles.numBigNumber}>{profile.numerology_number}</Text>
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
                  {currentAreaInfo && (
                    <View style={styles.numAreaBlock}>
                      <Text style={styles.numAreaLabel}>
                        {currentAreaInfo.emoji} En tu camino de {currentAreaInfo.label.toLowerCase()}
                      </Text>
                      <Text style={styles.numAreaMessage}>
                        {numProfile.areaMessage[profile.manifestation_area]}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )
        })()}

        {/* ── Intención de manifestación ── */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionBlockHeader}>
            <Text style={styles.sectionBlockTitle}>Mi intención de manifestación</Text>
            <TouchableOpacity onPress={() => setEditingIntake(true)}>
              <Text style={styles.editLink}>Editar ✎</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.intentionAreaRow}>
            <Text style={styles.intentionAreaEmoji}>{currentArea.emoji}</Text>
            <View>
              <Text style={styles.intentionAreaLabel}>Área de manifestación</Text>
              <Text style={styles.intentionAreaName}>{currentArea.label}</Text>
            </View>
          </View>

          {filledFields.length > 0 ? (
            filledFields.map(field => (
              <View key={field} style={styles.detailRow}>
                <Text style={styles.detailQuestion}>{QUESTION_LABELS[field]}</Text>
                <Text style={styles.detailAnswer}>{displayValue(field, String(goalDetails[field]!))}</Text>
              </View>
            ))
          ) : (
            <TouchableOpacity style={styles.emptyIntention} onPress={() => setEditingIntake(true)}>
              <Text style={styles.emptyIntentionText}>
                Aún no has completado tu cuestionario de manifestación.{'\n'}
                Toca aquí para configurar tu plan personalizado.
              </Text>
              <Text style={styles.emptyIntentionCta}>Completar ahora →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Datos personales ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionBlockTitle}>Datos personales</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor={Colors.textDisabled}
            />
            {name.trim() && name !== profile.full_name && (
              <Text style={styles.preview}>Número energético: {previewNumerology}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Fecha de nacimiento</Text>
            <TextInput
              style={styles.input}
              value={birthDate}
              onChangeText={text => {
                const digits = text.replace(/\D/g, '').slice(0, 8)
                if (digits.length <= 4) setBirthDate(digits)
                else if (digits.length <= 6) setBirthDate(`${digits.slice(0,4)}-${digits.slice(4)}`)
                else setBirthDate(`${digits.slice(0,4)}-${digits.slice(4,6)}-${digits.slice(6)}`)
              }}
              placeholder="Ej: 19901115"
              placeholderTextColor={Colors.textDisabled}
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
            {birthDate.length === 10 && birthDate !== profile.birth_date && (
              <Text style={styles.preview}>Signo: {ZODIAC_LABELS[previewZodiac] || previewZodiac}</Text>
            )}
          </View>
        </View>

        {/* ── Área de manifestación ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionBlockTitle}>¿Qué deseas manifestar?</Text>
          <Text style={styles.sectionBlockSub}>Si cambias el área, actualiza también tu cuestionario.</Text>
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
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Duración del plan ── */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionBlockTitle}>Duración del plan</Text>
          <Text style={styles.sectionBlockSub}>Cambia la duración de tu próximo ciclo.</Text>
          <View style={styles.durationRow}>
            {[30, 45, 60, 90].map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durationBtn, planDuration === d && styles.durationBtnSelected]}
                onPress={() => setPlanDuration(d)}
              >
                <Text style={[styles.durationBtnText, planDuration === d && styles.durationBtnTextSelected]}>
                  {d}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <GradientButton title="Guardar cambios" onPress={handleSave} loading={loading} />

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  orbGold: {
    position: 'absolute', width: 300, height: 300, bottom: 60, left: -60, borderRadius: 999,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(212,175,85,0.10) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  scroll: { padding: Spacing.lg, paddingTop: 60 },
  header: { marginBottom: Spacing.xl, gap: Spacing.sm },
  back: { fontFamily: Fonts.body, color: Colors.gold, fontSize: 15 },
  title: { fontFamily: Fonts.headingSemiBold, fontSize: 28, color: Colors.textPrimary, lineHeight: 34 },

  energyCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  energyName: { fontFamily: Fonts.headingSemiBold, fontSize: 22, color: Colors.textPrimary },
  energyRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  energyItem: { alignItems: 'center', gap: 3 },
  energyValue: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.gold },
  energyLabel: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textSecondary },
  energySep: { width: 0.5, height: 32, backgroundColor: Colors.borderGold },

  numSection: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.borderGold,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  numHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  numHeaderRight: { flex: 1, gap: 6 },
  numBigNumber: { fontFamily: Fonts.heading, fontSize: 52, color: Colors.gold, lineHeight: 56 },
  numArchetype: { fontFamily: Fonts.headingSemiBold, fontSize: 18, color: Colors.gold },
  qualityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  qualityChip: {
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  qualityText: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.gold },
  numEssence: { fontFamily: Fonts.headingItalic, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  numAreaBlock: {
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 6,
    borderLeftWidth: 2,
    borderLeftColor: Colors.gold,
  },
  numAreaLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 11, color: Colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  numAreaMessage: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },

  sectionBlock: { marginBottom: Spacing.xl, gap: Spacing.md },
  sectionBlockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionBlockTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.textPrimary },
  sectionBlockSub: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textSecondary, marginTop: -Spacing.sm },
  editLink: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.gold },

  intentionAreaRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  intentionAreaEmoji: { fontSize: 28 },
  intentionAreaLabel: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textSecondary },
  intentionAreaName: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.gold },

  detailRow: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  detailQuestion: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textDim, letterSpacing: 0.3 },
  detailAnswer: { fontFamily: Fonts.bodyMedium, fontSize: 14, color: Colors.textPrimary },

  emptyIntention: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    borderStyle: 'dashed',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  emptyIntentionText: { fontFamily: Fonts.body, fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyIntentionCta: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.gold },

  durationRow: { flexDirection: 'row', gap: Spacing.sm },
  durationBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  durationBtnSelected: { borderColor: Colors.borderGold, backgroundColor: Colors.goldDim },
  durationBtnText: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.textSecondary },
  durationBtnTextSelected: { fontFamily: Fonts.bodySemiBold, color: Colors.gold },

  field: { gap: Spacing.xs },
  fieldLabel: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.textDim, letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  preview: { fontFamily: Fonts.bodyMedium, fontSize: 13, color: Colors.gold },
  dateHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dateHintPart: { fontFamily: Fonts.bodyBold, fontSize: 12, color: Colors.gold, letterSpacing: 1 },
  dateHintSep: { fontSize: 13, color: Colors.textDisabled },
  dateHintLabel: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  areaGrid: { gap: Spacing.sm },
  areaCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  areaCardSelected: {
    borderColor: Colors.borderGold,
    backgroundColor: Colors.goldDim,
  },
  areaEmoji: { fontSize: 24 },
  areaLabel: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.textPrimary },
  areaLabelSelected: { fontFamily: Fonts.bodySemiBold, color: Colors.gold },
})
