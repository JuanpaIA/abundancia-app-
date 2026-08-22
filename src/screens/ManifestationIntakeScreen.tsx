import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { GradientButton } from '../components/ui/GradientButton'
import { ManifestationArea, GoalDetails } from '@lumina/core'

interface Question {
  key: keyof GoalDetails
  label: string
  placeholder: string
  type: 'text' | 'options'
  options?: { key: string; label: string; emoji: string }[]
}

const questions: Record<ManifestationArea, Question[]> = {
  dinero: [
    {
      key: 'situation',
      label: '¿Cuál es tu situación actual?',
      placeholder: '',
      type: 'options',
      options: [
        { key: 'empleado', label: 'Soy empleado/a', emoji: '💼' },
        { key: 'emprendedor', label: 'Soy emprendedor/a', emoji: '🚀' },
        { key: 'freelance', label: 'Trabajo independiente', emoji: '💻' },
        { key: 'buscando', label: 'Busco oportunidades', emoji: '🔍' },
      ],
    },
    {
      key: 'skill',
      label: '¿Qué habilidad tienes o podrías desarrollar para generar dinero?',
      placeholder: 'Ej: diseño, ventas, cocina, programación, idiomas…',
      type: 'text',
    },
    {
      key: 'monthly_goal',
      label: '¿Cuánto dinero quieres ganar al mes?',
      placeholder: 'Ej: $2,000 · $5,000 · $10,000',
      type: 'text',
    },
    {
      key: 'money_obstacle',
      label: '¿Qué te ha impedido lograrlo hasta ahora?',
      placeholder: 'Ej: miedo, falta de tiempo, no sé por dónde empezar…',
      type: 'text',
    },
  ],
  amor: [
    {
      key: 'relationship_type',
      label: '¿Qué tipo de amor quieres manifestar?',
      placeholder: '',
      type: 'options',
      options: [
        { key: 'nueva', label: 'Conocer una pareja nueva', emoji: '💗' },
        { key: 'mejorar', label: 'Mejorar mi relación actual', emoji: '🌹' },
        { key: 'propio', label: 'Fortalecer mi amor propio', emoji: '✨' },
        { key: 'reconectar', label: 'Reconectar con alguien', emoji: '🔮' },
      ],
    },
    {
      key: 'social_environments',
      label: '¿En qué ambientes te sientes más cómodo/a?',
      placeholder: '',
      type: 'options',
      options: [
        { key: 'deportes', label: 'Deportes y naturaleza', emoji: '🏃' },
        { key: 'cultura', label: 'Arte, música y cultura', emoji: '🎨' },
        { key: 'social', label: 'Reuniones sociales', emoji: '🥂' },
        { key: 'digital', label: 'Conexiones digitales', emoji: '📱' },
      ],
    },
    {
      key: 'shared_activities',
      label: '¿Qué actividades disfrutas y podrían conectarte con alguien afín?',
      placeholder: 'Ej: senderismo, cocinar, leer, bailar, viajar…',
      type: 'text',
    },
    {
      key: 'partner_values',
      label: '¿Qué valoras más en una pareja?',
      placeholder: 'Ej: lealtad, humor, ambición, espiritualidad, aventura…',
      type: 'text',
    },
  ],
  salud: [
    {
      key: 'health_focus',
      label: '¿Qué aspecto de tu salud quieres transformar?',
      placeholder: '',
      type: 'options',
      options: [
        { key: 'energia', label: 'Más energía y vitalidad', emoji: '⚡' },
        { key: 'peso', label: 'Peso y composición corporal', emoji: '🌿' },
        { key: 'mental', label: 'Salud mental y emocional', emoji: '🧠' },
        { key: 'especifica', label: 'Condición específica', emoji: '💫' },
      ],
    },
    {
      key: 'health_obstacle',
      label: '¿Cuál es tu mayor obstáculo con la salud hoy?',
      placeholder: 'Ej: falta de constancia, estrés, malos hábitos, tiempo…',
      type: 'text',
    },
    {
      key: 'health_habit',
      label: '¿Qué hábito de salud quieres desarrollar primero?',
      placeholder: 'Ej: ejercicio diario, mejor alimentación, dormir 8 horas…',
      type: 'text',
    },
  ],
  proposito: [
    {
      key: 'purpose_clarity',
      label: '¿Cómo describes tu relación con tu propósito?',
      placeholder: '',
      type: 'options',
      options: [
        { key: 'claro', label: 'Lo tengo claro pero no lo vivo', emoji: '🔮' },
        { key: 'buscando', label: 'Aún lo estoy buscando', emoji: '🌀' },
        { key: 'iniciando', label: 'Estoy empezando a vivirlo', emoji: '🌱' },
        { key: 'expandir', label: 'Quiero expandirlo', emoji: '🚀' },
      ],
    },
    {
      key: 'flow_activities',
      label: '¿Qué actividades te hacen perder la noción del tiempo?',
      placeholder: 'Ej: enseñar, crear, escribir, ayudar, construir…',
      type: 'text',
    },
    {
      key: 'desired_impact',
      label: '¿Qué impacto quieres tener en el mundo?',
      placeholder: 'Ej: inspirar personas, sanar, crear, enseñar, construir…',
      type: 'text',
    },
  ],
  felicidad: [
    {
      key: 'joy_blockers',
      label: '¿Qué te roba la alegría actualmente?',
      placeholder: '',
      type: 'options',
      options: [
        { key: 'trabajo', label: 'Mi trabajo o rutina', emoji: '😮‍💨' },
        { key: 'relaciones', label: 'Relaciones difíciles', emoji: '💔' },
        { key: 'mente', label: 'Pensamientos negativos', emoji: '🌫️' },
        { key: 'proposito', label: 'Falta de dirección', emoji: '🧭' },
      ],
    },
    {
      key: 'joy_activities',
      label: '¿Qué actividades te generan gozo genuino?',
      placeholder: 'Ej: bailar, estar en naturaleza, crear, conectar con amigos…',
      type: 'text',
    },
    {
      key: 'happiness_change',
      label: '¿Qué UN cambio haría tu vida más feliz hoy?',
      placeholder: 'Ej: más tiempo libre, una relación mejor, trabajo que ame…',
      type: 'text',
    },
  ],
}

interface Props {
  area: ManifestationArea
  onComplete: (details: GoalDetails) => void
  onBack: () => void
}

export function ManifestationIntakeScreen({ area, onComplete, onBack }: Props) {
  const [answers, setAnswers] = useState<GoalDetails>({})
  const [currentQ, setCurrentQ] = useState(0)

  const qs = questions[area]
  const question = qs[currentQ]
  const isLast = currentQ === qs.length - 1
  const progress = (currentQ + 1) / qs.length

  function handleNext() {
    if (isLast) {
      onComplete(answers)
    } else {
      setCurrentQ(currentQ + 1)
    }
  }

  function handleBack() {
    if (currentQ === 0) {
      onBack()
    } else {
      setCurrentQ(currentQ - 1)
    }
  }

  function handleOption(value: string) {
    setAnswers(prev => ({ ...prev, [question.key]: value }))
  }

  function canContinue() {
    const val = answers[question.key]
    return val && String(val).trim().length > 0
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

        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Regresar</Text>
        </TouchableOpacity>

        {/* Barra de progreso */}
        <View style={styles.progressBar}>
          <LinearGradient
            colors={[Colors.purpleAccent, Colors.gold]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%` as any }]}
          />
        </View>
        <Text style={styles.progressLabel}>{currentQ + 1} de {qs.length}</Text>

        <Text style={styles.stepEyebrow}>TU INTENCIÓN</Text>
        <Text style={styles.title}>{question.label}</Text>

        {question.type === 'options' && question.options && (
          <View style={styles.optionsGrid}>
            {question.options.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.optionCard,
                  answers[question.key] === opt.key && styles.optionCardSelected,
                ]}
                onPress={() => handleOption(opt.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={[
                  styles.optionLabel,
                  answers[question.key] === opt.key && styles.optionLabelSelected,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {question.type === 'text' && (
          <TextInput
            style={styles.input}
            value={String(answers[question.key] || '')}
            onChangeText={val => setAnswers(prev => ({ ...prev, [question.key]: val }))}
            placeholder={question.placeholder}
            placeholderTextColor="#7A7890"
            multiline
            numberOfLines={3}
            autoCapitalize="sentences"
          />
        )}

        <View style={styles.actions}>
          {canContinue() && (
            <GradientButton
              title={isLast ? 'Ver mi plan personalizado' : 'Continuar'}
              onPress={handleNext}
            />
          )}
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  orbGold: {
    position: 'absolute', width: 300, height: 300, bottom: 40, left: -60, borderRadius: 999,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(212,175,85,0.12) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  scroll: { padding: Spacing.lg, paddingTop: 64, gap: Spacing.lg },

  progressBar: {
    height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  progressLabel: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textDim, textAlign: 'right' },

  stepEyebrow: {
    fontFamily: Fonts.bodySemiBold, fontSize: 11,
    color: Colors.textDim, letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.headingSemiBold, fontSize: 24,
    color: Colors.textPrimary, lineHeight: 32,
  },

  optionsGrid: { gap: Spacing.sm },
  optionCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    overflow: 'hidden',
  },
  optionCardSelected: {
    borderColor: Colors.borderGold,
    borderWidth: 1,
    backgroundColor: Colors.goldDim,
  },
  optionEmoji: { fontSize: 24 },
  optionLabel: { fontFamily: Fonts.bodyMedium, fontSize: 15, color: Colors.textPrimary, flex: 1 },
  optionLabelSelected: { fontFamily: Fonts.bodySemiBold, color: Colors.gold },

  input: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: Fonts.body,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actions: { gap: Spacing.sm },
  backBtn: { paddingVertical: Spacing.sm },
  backText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.gold, opacity: 0.8 },
})
