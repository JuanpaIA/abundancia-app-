import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useErrorReporter } from '../hooks/useErrorReporter'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { getLunarPhase, getLunarPhaseEmoji, getLunarPhaseLabel } from '@lumina/core'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface JournalEntry {
  id: string
  date: string
  intention: string
  gratitude: string
  reflection: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatDateLong(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${DAYS_ES[d.getDay()]}, ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()].slice(0, 3)}`
}

function getPlanDay(planStartDate: string | null): number {
  if (!planStartDate) return 1
  const start = new Date(planStartDate + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1)
}

const PROMPTS = [
  { field: 'intention' as const, label: 'Intención del día', placeholder: 'Hoy declaro y afirmo que…', emoji: '🎯' },
  { field: 'gratitude' as const, label: 'Gratitud', placeholder: 'Soy profundamente agradecido/a por…', emoji: '🙏' },
  { field: 'reflection' as const, label: 'Señal o avance', placeholder: 'Una señal, sincronía o avance que noté hoy…', emoji: '✨' },
]

// ─── Componente principal ─────────────────────────────────────────────────────

interface Props {
  onBack: () => void
}

export function JournalScreen({ onBack }: Props) {
  const { profile } = useAuth()
  const { reportError } = useErrorReporter('journal')
  const todayStr = new Date().toISOString().split('T')[0]
  const todayDate = new Date(todayStr + 'T12:00:00')

  // Estado de hoy
  const [intention, setIntention] = useState('')
  const [gratitude, setGratitude] = useState('')
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // Entradas pasadas
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Carga inicial ────────────────────────────────────────────────────────────

  const loadEntries = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('journal_entries')
      .select('id, date, intention, gratitude, reflection')
      .eq('user_id', profile.id)
      .order('date', { ascending: false })

    if (!data) { setLoading(false); return }

    const today = data.find(e => e.date === todayStr)
    if (today) {
      setIntention(today.intention || '')
      setGratitude(today.gratitude || '')
      setReflection(today.reflection || '')
    }
    setPastEntries(data.filter(e => e.date !== todayStr))
    setLoading(false)
  }, [profile, todayStr])

  useEffect(() => { loadEntries() }, [loadEntries])

  // ── Auto-guardado con debounce ────────────────────────────────────────────────

  const scheduleAutoSave = useCallback((field: string, value: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      if (!profile) return
      setSaving(true)
      const now = { intention, gratitude, reflection, [field]: value }
      const { error } = await supabase.from('journal_entries').upsert(
        { user_id: profile.id, date: todayStr, ...now, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,date' }
      )
      if (error) reportError(error, { field, action: 'autosave_journal' })
      setSaving(false)
      const h = new Date().getHours()
      const m = String(new Date().getMinutes()).padStart(2, '0')
      setSavedAt(`${h}:${m}`)
    }, 1200)
  }, [profile, todayStr, intention, gratitude, reflection])

  function handleChange(field: 'intention' | 'gratitude' | 'reflection', value: string) {
    if (field === 'intention') setIntention(value)
    if (field === 'gratitude') setGratitude(value)
    if (field === 'reflection') setReflection(value)
    scheduleAutoSave(field, value)
  }

  // ── Datos contextuales ────────────────────────────────────────────────────────

  const lunarPhase = getLunarPhase(todayDate)
  const lunarEmoji = getLunarPhaseEmoji(lunarPhase)
  const lunarLabel = getLunarPhaseLabel(lunarPhase)
  const planDay = getPlanDay(profile?.plan_start_date ?? null)

  const todayValues = { intention, gratitude, reflection }
  const todayHasContent = intention.trim() || gratitude.trim() || reflection.trim()

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.plum} size="large" style={{ marginTop: 120 }} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Diario de Manifestación</Text>
          <Text style={styles.subtitle}>Tu espacio sagrado de intención</Text>
          <Text style={styles.description}>
            Cada entrada tiene tres preguntas: qué quieres crear hoy, qué agradeces ahora mismo, y qué señal recibiste. Responderlas convierte tu plan de 30 días en un registro tangible de transformación — y esa evidencia acelera tu manifestación.
          </Text>
        </View>

        {/* Contexto del día */}
        <View style={styles.contextRow}>
          <View style={styles.contextBadge}>
            <Text style={styles.contextBadgeText}>{lunarEmoji} {lunarLabel}</Text>
          </View>
          <View style={styles.contextBadge}>
            <Text style={styles.contextBadgeText}>Día {planDay} del plan</Text>
          </View>
        </View>

        {/* Entrada de hoy */}
        <View style={styles.todayCard}>
          <View style={styles.todayHeader}>
            <Text style={styles.todayDate}>{formatDateLong(todayStr)}</Text>
            <Text style={styles.saveStatus}>
              {saving ? '⏳ guardando…' : savedAt ? `✦ guardado ${savedAt}` : ''}
            </Text>
          </View>

          {PROMPTS.map(({ field, label, placeholder, emoji }) => (
            <View key={field} style={styles.promptBlock}>
              <Text style={styles.promptLabel}>{emoji} {label}</Text>
              <TextInput
                style={styles.promptInput}
                value={todayValues[field]}
                onChangeText={v => handleChange(field, v)}
                placeholder={placeholder}
                placeholderTextColor={Colors.textDisabled}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
            </View>
          ))}

          {!todayHasContent && (
            <Text style={styles.emptyHint}>
              Escribe tu primera intención del día — aunque sea una línea transforma tu energía.
            </Text>
          )}
        </View>

        {/* Entradas pasadas */}
        {pastEntries.length > 0 && (
          <>
            <View style={styles.pastDivider}>
              <View style={styles.pastDividerLine} />
              <Text style={styles.pastDividerLabel}>entradas anteriores</Text>
              <View style={styles.pastDividerLine} />
            </View>

            {pastEntries.map(entry => {
              const entryDate = new Date(entry.date + 'T12:00:00')
              const phase = getLunarPhase(entryDate)
              const isOpen = expanded === entry.id
              const hasAny = entry.intention || entry.gratitude || entry.reflection

              return (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.pastCard}
                  onPress={() => setExpanded(isOpen ? null : entry.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.pastCardHeader}>
                    <View style={styles.pastCardLeft}>
                      <Text style={styles.pastCardEmoji}>{getLunarPhaseEmoji(phase)}</Text>
                      <View>
                        <Text style={styles.pastCardDate}>{formatDateLong(entry.date)}</Text>
                        <Text style={styles.pastCardMeta}>{getLunarPhaseLabel(phase)}</Text>
                      </View>
                    </View>
                    <Text style={styles.pastCardChevron}>{isOpen ? '▲' : '▼'}</Text>
                  </View>

                  {!isOpen && hasAny && (
                    <Text style={styles.pastCardPreview} numberOfLines={2}>
                      {entry.intention || entry.gratitude || entry.reflection}
                    </Text>
                  )}

                  {isOpen && (
                    <View style={styles.pastCardContent}>
                      {PROMPTS.map(({ field, label, emoji }) =>
                        entry[field] ? (
                          <View key={field} style={styles.pastField}>
                            <Text style={styles.pastFieldLabel}>{emoji} {label}</Text>
                            <Text style={styles.pastFieldText}>{entry[field]}</Text>
                          </View>
                        ) : null
                      )}
                      {!hasAny && (
                        <Text style={styles.pastEmpty}>Entrada vacía</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </>
        )}

        {pastEntries.length === 0 && todayHasContent && (
          <Text style={styles.firstEntry}>
            Esta es tu primera entrada. Vuelve mañana para ver tu historial.
          </Text>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60, paddingBottom: 40 },

  header: { marginBottom: Spacing.lg, gap: Spacing.xs },
  back: { color: Colors.plum, fontSize: 15, marginBottom: Spacing.sm },
  title: { fontSize: 26, color: Colors.textPrimary, fontFamily: Fonts.headingSemiBold },
  subtitle: { fontSize: 13, color: Colors.textSecondary },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  contextRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  contextBadge: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.borderPurple,
    backgroundColor: Colors.plumDim,
  },
  contextBadgeText: { fontSize: 12, color: Colors.plum, fontWeight: '600' },

  todayCard: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.borderPurple,
    padding: Spacing.lg, marginBottom: Spacing.xl, gap: Spacing.lg,
  },
  todayHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: Spacing.xs,
  },
  todayDate: { fontSize: 15, color: Colors.textPrimary, fontWeight: '700' },
  saveStatus: { fontSize: 11, color: Colors.textDisabled },

  promptBlock: { gap: Spacing.xs },
  promptLabel: { fontSize: 13, color: Colors.plum, fontWeight: '700' },
  promptInput: {
    backgroundColor: Colors.input, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    color: Colors.textPrimary, fontSize: 14, lineHeight: 22,
    padding: Spacing.md, minHeight: 80,
    textAlignVertical: 'top',
  },
  emptyHint: {
    fontSize: 13, color: Colors.textDisabled,
    fontStyle: 'italic', textAlign: 'center',
    lineHeight: 20,
  },

  pastDivider: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.lg,
  },
  pastDividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  pastDividerLabel: { fontSize: 11, color: Colors.textDisabled, letterSpacing: 1, textTransform: 'uppercase' },

  pastCard: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm,
  },
  pastCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pastCardLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  pastCardEmoji: { fontSize: 24 },
  pastCardDate: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  pastCardMeta: { fontSize: 11, color: Colors.textSecondary },
  pastCardChevron: { fontSize: 11, color: Colors.textDisabled },
  pastCardPreview: {
    fontSize: 13, color: Colors.textSecondary,
    lineHeight: 20, fontStyle: 'italic',
  },
  pastCardContent: { gap: Spacing.md, paddingTop: Spacing.xs },
  pastField: { gap: 4 },
  pastFieldLabel: { fontSize: 12, color: Colors.plum, fontWeight: '700' },
  pastFieldText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  pastEmpty: { fontSize: 13, color: Colors.textDisabled, fontStyle: 'italic' },

  firstEntry: {
    textAlign: 'center', fontSize: 13,
    color: Colors.textDisabled, fontStyle: 'italic',
    marginTop: Spacing.md,
  },
})
