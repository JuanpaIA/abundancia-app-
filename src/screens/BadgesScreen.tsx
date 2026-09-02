import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { DailyLog } from '@lumina/core'

// ─── Definición de insignias ──────────────────────────────────────────────────

interface BadgeData {
  streak: number
  totalDays: number
  perfectDays: number
  planDay: number
  planDuration: number
  journalCount: number
}

interface BadgeDef {
  id: string
  emoji: string
  name: string
  desc: string
  how: string
  check: (d: BadgeData) => boolean
  category: string
}

const BADGE_DEFS: BadgeDef[] = [
  // ── Bienvenida ──
  {
    id: 'welcome',
    emoji: '🌙', name: 'Bienvenido a Lúmina',
    desc: 'Iniciaste tu camino de manifestación.',
    how: '', category: 'Inicio',
    check: () => true,
  },

  // ── Días activos ──
  {
    id: 'first_day',
    emoji: '✦', name: 'Primer Paso',
    desc: 'Registraste tu primer día en la app.',
    how: 'Completa tu primer día.', category: 'Constancia',
    check: d => d.totalDays >= 1,
  },
  {
    id: 'days7',
    emoji: '🌱', name: 'Una Semana',
    desc: '7 días activos en la app.',
    how: 'Llega a 7 días activos.', category: 'Constancia',
    check: d => d.totalDays >= 7,
  },
  {
    id: 'days30',
    emoji: '🌿', name: 'Mes Activo',
    desc: '30 días con actividad en la app.',
    how: 'Llega a 30 días activos.', category: 'Constancia',
    check: d => d.totalDays >= 30,
  },

  // ── Racha ──
  {
    id: 'streak7',
    emoji: '🔥', name: 'Racha de 7',
    desc: '7 días consecutivos sin fallar.',
    how: 'Mantén 7 días seguidos.', category: 'Racha',
    check: d => d.streak >= 7,
  },
  {
    id: 'streak14',
    emoji: '💪', name: 'Dos Semanas',
    desc: '14 días en racha.',
    how: 'Mantén 14 días seguidos.', category: 'Racha',
    check: d => d.streak >= 14,
  },
  {
    id: 'streak21',
    emoji: '🌟', name: 'Hábito Formado',
    desc: '21 días consecutivos — el hábito ya es tuyo.',
    how: 'Mantén 21 días seguidos.', category: 'Racha',
    check: d => d.streak >= 21,
  },
  {
    id: 'streak33',
    emoji: '✨', name: 'Un Mes de Poder',
    desc: '33 días en racha.',
    how: 'Mantén 33 días seguidos.', category: 'Racha',
    check: d => d.streak >= 33,
  },
  {
    id: 'streak66',
    emoji: '🏆', name: 'Transformación',
    desc: '66 días consecutivos.',
    how: 'Mantén 66 días seguidos.', category: 'Racha',
    check: d => d.streak >= 66,
  },
  {
    id: 'streak90',
    emoji: '👑', name: 'Maestría',
    desc: '90 días sin romper la racha.',
    how: 'Mantén 90 días seguidos.', category: 'Racha',
    check: d => d.streak >= 90,
  },

  // ── Protocolo ──
  {
    id: 'perfect1',
    emoji: '⭐', name: 'Día Perfecto',
    desc: 'Completaste las 9 prácticas en un día.',
    how: 'Completa las 9 prácticas en un día.', category: 'Protocolo',
    check: d => d.perfectDays >= 1,
  },
  {
    id: 'perfect7',
    emoji: '💎', name: '7 Días Perfectos',
    desc: '7 días con el protocolo completo.',
    how: 'Logra 7 días con las 9 prácticas.', category: 'Protocolo',
    check: d => d.perfectDays >= 7,
  },
  {
    id: 'perfect21',
    emoji: '🌠', name: '21 Días Perfectos',
    desc: '21 días completando todo el protocolo.',
    how: 'Logra 21 días con las 9 prácticas.', category: 'Protocolo',
    check: d => d.perfectDays >= 21,
  },

  // ── Plan ──
  {
    id: 'plan7',
    emoji: '🎯', name: 'Primera Semana del Plan',
    desc: 'Llegaste al día 7 de tu plan.',
    how: 'Llega al día 7 del plan.', category: 'Plan',
    check: d => d.planDay >= 7,
  },
  {
    id: 'plan_half',
    emoji: '🦋', name: 'Mitad del Viaje',
    desc: 'Llegaste a la mitad de tu plan.',
    how: 'Llega a la mitad de tu plan.', category: 'Plan',
    check: d => d.planDay >= d.planDuration / 2,
  },
  {
    id: 'plan_done',
    emoji: '🌕', name: 'Ciclo Completo',
    desc: 'Finalizaste tu plan de manifestación.',
    how: 'Completa tu plan.', category: 'Plan',
    check: d => d.planDay >= d.planDuration,
  },

  // ── Diario ──
  {
    id: 'journal1',
    emoji: '📖', name: 'Primera Intención',
    desc: 'Escribiste tu primera entrada en el diario.',
    how: 'Escribe en el diario de manifestación.', category: 'Diario',
    check: d => d.journalCount >= 1,
  },
  {
    id: 'journal7',
    emoji: '📝', name: 'Escritor Consistente',
    desc: '7 entradas en el diario.',
    how: 'Escribe 7 entradas en el diario.', category: 'Diario',
    check: d => d.journalCount >= 7,
  },
  {
    id: 'journal30',
    emoji: '🗒️', name: 'Diario del Manifestador',
    desc: '30 entradas en tu diario personal.',
    how: 'Escribe 30 entradas en el diario.', category: 'Diario',
    check: d => d.journalCount >= 30,
  },
]

const CATEGORIES = ['Inicio', 'Constancia', 'Racha', 'Protocolo', 'Plan', 'Diario']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeStreak(logs: DailyLog[]): number {
  const logDates = new Set(logs.map(l => l.date))
  const today = new Date(); today.setHours(0, 0, 0, 0)
  let count = 0
  const cur = new Date(today)
  if (!logDates.has(today.toISOString().split('T')[0])) cur.setDate(cur.getDate() - 1)
  while (logDates.has(cur.toISOString().split('T')[0])) {
    count++
    cur.setDate(cur.getDate() - 1)
  }
  return count
}

function countPerfectDays(logs: DailyLog[]): number {
  return logs.filter(l => {
    const hc: string[] = (l as any).habits_completed || []
    const count = [
      l.daily_objective_done || hc.includes('daily_objective_done'),
      l.morning_done || hc.includes('morning_done'),
      l.afternoon_done || hc.includes('afternoon_done'),
      l.night_done || hc.includes('night_done'),
      (l as any).ritual_done || hc.includes('ritual_done'),
      (l as any).affirmation_done || hc.includes('affirmation_done'),
      (l as any).color_done || hc.includes('color_done'),
      (l as any).foods_done || hc.includes('foods_done'),
      (l as any).biohack_done || hc.includes('biohack_done'),
    ].filter(Boolean).length
    return count === 9
  }).length
}

function getPlanDay(startDate: string | null): number {
  if (!startDate) return 1
  const start = new Date(startDate + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1)
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void
}

export function BadgesScreen({ onBack }: Props) {
  const { profile } = useAuth()
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      const [logsRes, journalRes] = await Promise.all([
        supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', profile!.id),
        supabase
          .from('journal_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', profile!.id),
      ])
      const logs = (logsRes.data as DailyLog[]) || []
      setBadgeData({
        streak: computeStreak(logs),
        totalDays: logs.length,
        perfectDays: countPerfectDays(logs),
        planDay: getPlanDay(profile!.plan_start_date ?? null),
        planDuration: profile!.plan_duration ?? 30,
        journalCount: journalRes.count ?? 0,
      })
      setLoading(false)
    }
    load()
  }, [profile])

  if (loading || !badgeData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={Colors.plum} size="large" style={{ marginTop: 120 }} />
      </View>
    )
  }

  const earned = BADGE_DEFS.filter(b => b.check(badgeData))
  const locked = BADGE_DEFS.filter(b => !b.check(badgeData))
  const pct = Math.round((earned.length / BADGE_DEFS.length) * 100)

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Insignias y Logros</Text>
          <Text style={styles.subtitle}>Tu camino de manifestación en hitos</Text>
        </View>

        {/* Progreso global */}
        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>{earned.length} de {BADGE_DEFS.length} desbloqueados</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
          </View>
        </View>

        {/* Insignias por categoría */}
        {CATEGORIES.map(cat => {
          const catBadges = BADGE_DEFS.filter(b => b.category === cat)
          const catEarned = catBadges.filter(b => b.check(badgeData))
          return (
            <View key={cat} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{cat}</Text>
                <Text style={styles.sectionCount}>{catEarned.length}/{catBadges.length}</Text>
              </View>
              <View style={styles.grid}>
                {catBadges.map(badge => {
                  const isEarned = badge.check(badgeData)
                  return (
                    <View key={badge.id} style={[styles.badgeCard, !isEarned && styles.badgeCardLocked]}>
                      <Text style={[styles.badgeEmoji, !isEarned && styles.badgeEmojiLocked]}>
                        {isEarned ? badge.emoji : '🔒'}
                      </Text>
                      <Text style={[styles.badgeName, !isEarned && styles.badgeNameLocked]} numberOfLines={2}>
                        {badge.name}
                      </Text>
                      <Text style={styles.badgeDesc} numberOfLines={2}>
                        {isEarned ? badge.desc : badge.how}
                      </Text>
                      {isEarned && (
                        <View style={styles.earnedDot} />
                      )}
                    </View>
                  )
                })}
              </View>
            </View>
          )
        })}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
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

  progressCard: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.borderPurple,
    padding: Spacing.md, marginBottom: Spacing.xl, gap: Spacing.sm,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 14, color: Colors.textSecondary },
  progressPct: { fontSize: 18, color: Colors.plum, fontWeight: '700' },
  progressTrack: {
    height: 6, backgroundColor: Colors.plumDim,
    borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: 6, backgroundColor: Colors.plum, borderRadius: 3 },

  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 13, color: Colors.plum, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  sectionCount: { fontSize: 12, color: Colors.textDisabled },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: {
    width: '30.5%',
    backgroundColor: Colors.plumDim,
    borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.borderPurple,
    padding: Spacing.sm, alignItems: 'center',
    gap: 4, position: 'relative',
  },
  badgeCardLocked: {
    borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
  },
  badgeEmoji: { fontSize: 28, marginBottom: 2 },
  badgeEmojiLocked: { opacity: 0.3 },
  badgeName: {
    fontSize: 11, color: Colors.textPrimary,
    fontWeight: '700', textAlign: 'center', lineHeight: 14,
  },
  badgeNameLocked: { color: Colors.textDisabled },
  badgeDesc: {
    fontSize: 10, color: Colors.textDisabled,
    textAlign: 'center', lineHeight: 13,
  },
  earnedDot: {
    position: 'absolute', top: 6, right: 6,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Colors.plum,
  },
})
