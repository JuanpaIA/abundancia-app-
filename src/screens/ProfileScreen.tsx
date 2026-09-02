import React, { useState, useEffect, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native'
import Svg, { Circle, Text as SvgText } from 'react-native-svg'

import { useAuth } from '../hooks/useAuth'
import { useStats, countTasksFromLog } from '../hooks/useStats'
import type { ProgressDay } from '../hooks/useStats'
import { Card } from '../components/ui/Card'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { useTheme, PALETTES } from '../contexts/ThemeContext'
import type { AppPalette } from '../contexts/ThemeContext'
import { supabase } from '../services/supabase'
import { DailyLog } from '@lumina/core'
import { getPhaseInfo } from '@lumina/core'
import { EditProfileScreen } from './EditProfileScreen'
import { HistoryScreen } from './HistoryScreen'
import { BadgesScreen } from './BadgesScreen'
import { NotificationsScreen } from './NotificationsScreen'
import { loadSignalHistory } from '../hooks/useSignalHistory'
import type { SignalHistoryEntry } from '../hooks/useSignalHistory'

// ── CircularProgress ──────────────────────────────────────────────────────────
const CP_SIZE = 128
const CP_SW   = 11
const CP_R    = (CP_SIZE - CP_SW) / 2
const CP_C    = 2 * Math.PI * CP_R

function CircularProgress({ completed, total }: { completed: number; total: number }) {
  const pct     = total > 0 ? completed / total : 0
  const offset  = CP_C * (1 - pct)
  const allDone = completed === total && total > 0
  const arcColor = allDone ? '#4CAF82' : Colors.plum
  const cx = CP_SIZE / 2, cy = CP_SIZE / 2
  return (
    <View style={cpStyles.root}>
      <Svg width={CP_SIZE} height={CP_SIZE}>
        <Circle cx={cx} cy={cy} r={CP_R} fill="none"
          stroke="rgba(42,27,34,0.10)" strokeWidth={CP_SW} />
        {completed > 0 && (
          <Circle cx={cx} cy={cy} r={CP_R} fill="none"
            stroke={arcColor} strokeWidth={CP_SW}
            strokeDasharray={`${CP_C} ${CP_C}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        )}
        <SvgText x={cx} y={cy - 7} textAnchor="middle"
          fontSize={30} fontWeight="700" fill={arcColor}>{completed}</SvgText>
        <SvgText x={cx} y={cy + 13} textAnchor="middle"
          fontSize={10} fill={Colors.textDim}>de {total} tareas</SvgText>
      </Svg>
      <View style={cpStyles.info}>
        <Text style={[cpStyles.pct, { color: arcColor }]}>{Math.round(pct * 100)}%</Text>
        <Text style={cpStyles.pctLabel}>completado hoy</Text>
        <View style={cpStyles.divider} />
        <View style={cpStyles.stat}>
          <View style={[cpStyles.dot, { backgroundColor: arcColor }]} />
          <Text style={cpStyles.statText}>{completed} realizadas</Text>
        </View>
        <View style={cpStyles.stat}>
          <View style={[cpStyles.dot, { backgroundColor: '#E05555' }]} />
          <Text style={cpStyles.statText}>{total - completed} pendientes</Text>
        </View>
      </View>
    </View>
  )
}
const cpStyles = StyleSheet.create({
  root:     { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  info:     { flex: 1, gap: 5 },
  pct:      { fontSize: 32, fontWeight: '800' },
  pctLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: -4 },
  divider:  { height: 0.5, backgroundColor: Colors.border, marginVertical: 4 },
  stat:     { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot:      { width: 8, height: 8, borderRadius: 4 },
  statText: { fontSize: 13, color: Colors.textSecondary },
})

// ── WeeklyProgressRing ────────────────────────────────────────────────────────
const WE_SIZE = 100
const WE_SW   = 9
const WE_R    = (WE_SIZE - WE_SW) / 2
const WE_C    = 2 * Math.PI * WE_R

function progressColor(count: number | null): string {
  if (count === null || count === 0) return 'rgba(42,27,34,0.10)'
  const pct = count / 9
  if (pct <= 0.33) return '#E05555'
  if (pct <= 0.55) return '#E09A55'
  if (pct <= 0.77) return '#E0C955'
  if (pct < 1)     return '#7FD47F'
  return '#4CAF82'
}

function WeeklyProgressRing({ days }: { days: ProgressDay[] }) {
  const filled  = days.filter(d => d.count !== null)
  const avgPct  = filled.length > 0
    ? filled.reduce((s, d) => s + d.count! / 9, 0) / filled.length
    : 0
  const offset   = WE_C * (1 - avgPct)
  const arcColor = avgPct > 0 ? progressColor(Math.round(avgPct * 9)) : 'rgba(42,27,34,0.15)'
  const cx = WE_SIZE / 2, cy = WE_SIZE / 2
  return (
    <View style={weStyles.root}>
      <Svg width={WE_SIZE} height={WE_SIZE}>
        <Circle cx={cx} cy={cy} r={WE_R} fill="none"
          stroke="rgba(42,27,34,0.10)" strokeWidth={WE_SW} />
        {avgPct > 0 && (
          <Circle cx={cx} cy={cy} r={WE_R} fill="none"
            stroke={arcColor} strokeWidth={WE_SW}
            strokeDasharray={`${WE_C} ${WE_C}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        )}
        <SvgText x={cx} y={cy - 5} textAnchor="middle"
          fontSize={20} fontWeight="700"
          fill={avgPct > 0 ? arcColor : Colors.textDim}
        >{avgPct > 0 ? `${Math.round(avgPct * 100)}%` : '–'}</SvgText>
        <SvgText x={cx} y={cy + 12} textAnchor="middle"
          fontSize={9} fill={Colors.textSecondary}>promedio</SvgText>
      </Svg>
      <View style={weStyles.right}>
        <Text style={weStyles.header}>Progreso últimos 7 días</Text>
        <View style={weStyles.daysRow}>
          {days.map((d, i) => (
            <View key={i} style={weStyles.dayCol}>
              <View style={[weStyles.dayDot, { backgroundColor: progressColor(d.count) },
                d.isToday && weStyles.dayDotToday]} />
              <Text style={[weStyles.dayLabel, d.isToday && weStyles.dayLabelToday]}>{d.label}</Text>
              <Text style={[weStyles.dayDate,  d.isToday && weStyles.dayLabelToday]}>{d.date}</Text>
              {d.count !== null && d.count > 0 && (
                <Text style={[weStyles.dayLevel, { color: progressColor(d.count) }]}>{d.count}</Text>
              )}
            </View>
          ))}
        </View>
        <Text style={weStyles.meta}>{filled.length}/7 días con actividad</Text>
      </View>
    </View>
  )
}
const weStyles = StyleSheet.create({
  root:          { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  right:         { flex: 1, gap: 6 },
  header:        { fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.4 },
  daysRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol:        { alignItems: 'center', gap: 3 },
  dayDot:        { width: 14, height: 14, borderRadius: 7 },
  dayDotToday:   { borderWidth: 2, borderColor: Colors.plum },
  dayLabel:      { fontSize: 9, color: Colors.textSecondary },
  dayLabelToday: { color: Colors.plum, fontWeight: '700' },
  dayDate:       { fontSize: 9, color: Colors.textSecondary, marginTop: -2 },
  dayLevel:      { fontSize: 9, fontWeight: '700' },
  meta:          { fontSize: 10, color: Colors.textDim },
})

// ── HABIT_DETAILS ─────────────────────────────────────────────────────────────
interface HabitDetail { name: string; emoji: string; tip: string }
const HABIT_DETAILS: Record<string, HabitDetail> = {
  daily_objective_done: { name: 'Objetivo del día', emoji: '🎯',
    tip: 'Léelo en voz alta cada mañana. Activar la intención conscientemente es el primer paso para materializarla.' },
  morning_done:   { name: 'Protocolo de mañana',  emoji: '☀️',
    tip: 'Hazlo antes de revisar el teléfono. Los primeros 5 minutos condicionan la energía de todo el día.' },
  afternoon_done: { name: 'Protocolo de tarde',   emoji: '🌤️',
    tip: 'Ponlo como recordatorio a mediodía. Una pausa consciente de 5 minutos sostiene tu vibración.' },
  night_done:     { name: 'Protocolo de noche',   emoji: '🌙',
    tip: 'Intégralo a tu rutina de sueño. Tu mente procesa durante la noche lo que siembras al dormir.' },
  ritual_done:    { name: 'Ritual del día',        emoji: '🔮',
    tip: 'Aunque sea en versión corta: 3 respiraciones + tu intención. La consistencia supera la duración.' },
  affirmation_done: { name: 'Afirmación del día', emoji: '💬',
    tip: 'Dila frente al espejo mirándote a los ojos. La voz y el reflejo amplifican el impacto neurológico.' },
  color_done:     { name: 'Color del día',         emoji: '👗',
    tip: 'Es el hábito más rápido del plan. El color que usas envía una señal vibracional constante.' },
  foods_done:     { name: 'Alimentos del día',     emoji: '🍽️',
    tip: 'Incorpora aunque sea uno de los sugeridos. Tu estado físico y tu capacidad de manifestar están conectados.' },
  biohack_done:   { name: 'Estrategia Biohack',   emoji: '⚡',
    tip: 'Pon la frecuencia mientras te preparas o desayunas. No requiere tiempo extra, solo intención.' },
}

// ── NUMEROLOGY_INFO ───────────────────────────────────────────────────────────
interface NumerologyInfo { archetype: string; keywords: string[]; energy: string; shadow: string }
const NUMEROLOGY_INFO: Record<number, NumerologyInfo> = {
  1:  { archetype: 'El Iniciador',          keywords: ['Liderazgo', 'Independencia', 'Pionero'],
        energy: 'Tu número irradia voluntad creadora. Tienes la fuerza innata para abrir caminos que otros aún no ven. Cada intención que declaras lleva la potencia de un nuevo comienzo.',
        shadow: 'El reto: soltar el control y confiar en el proceso.' },
  2:  { archetype: 'El Diplomático',        keywords: ['Intuición', 'Cooperación', 'Equilibrio'],
        energy: 'Tu número sintoniza con las frecuencias sutiles. Recibes señales del universo antes que los demás. Tu poder está en la escucha, la paciencia y el arte de unir.',
        shadow: 'El reto: confiar en tu propia percepción sin buscar validación externa.' },
  3:  { archetype: 'El Creativo',           keywords: ['Expresión', 'Alegría', 'Manifestación verbal'],
        energy: 'Tu número convierte palabras e ideas en realidad. Lo que dices y crees con entusiasmo tiende a materializarse con una velocidad poco común. Tu vibración eleva a todos los que te rodean.',
        shadow: 'El reto: canalizar la energía creativa sin dispersarla.' },
  4:  { archetype: 'El Constructor',        keywords: ['Disciplina', 'Solidez', 'Método'],
        energy: 'Tu número construye para durar. Los resultados que produces son sólidos, confiables y de largo plazo. El universo te responde cuando actúas con constancia y estructura.',
        shadow: 'El reto: abrirse al cambio y a lo inesperado sin resistencia.' },
  5:  { archetype: 'El Libertador',         keywords: ['Adaptabilidad', 'Cambio', 'Expansión'],
        energy: 'Tu número vive en el movimiento. Tu mayor manifestación llega cuando te permites fluir, experimentar y romper patrones que limitan tu crecimiento. La variedad es tu combustible.',
        shadow: 'El reto: sostener el compromiso cuando la novedad se desvanece.' },
  6:  { archetype: 'El Armonizador',        keywords: ['Amor', 'Responsabilidad', 'Servicio'],
        energy: 'Tu número magnifica el amor y la belleza. Manifiestas con mayor fuerza cuando tus acciones sirven a algo más grande que tú mismo. Tu energía crea ambientes que sanan.',
        shadow: 'El reto: aprender a recibir con la misma gracia con que das.' },
  7:  { archetype: 'El Místico',            keywords: ['Sabiduría', 'Introspección', 'Conexión interior'],
        energy: 'Tu número opera desde las profundidades. Manifiestas en silencio, con fe y con una comprensión que va más allá de lo racional. El universo se comunica contigo a través de señales y sincronías.',
        shadow: 'El reto: confiar en la vida aunque no puedas controlarlo todo.' },
  8:  { archetype: 'El Manifestador',       keywords: ['Abundancia', 'Poder', 'Éxito material'],
        energy: 'Tu número vibra en la frecuencia de la prosperidad. Tienes una relación natural con la riqueza, el liderazgo y la capacidad de transformar visión en resultados tangibles. La abundancia te reconoce.',
        shadow: 'El reto: equilibrar la ambición con el disfrute del camino.' },
  9:  { archetype: 'El Sabio Universal',    keywords: ['Compasión', 'Completitud', 'Legado'],
        energy: 'Tu número cierra ciclos y eleva conciencias. Manifiestas cuando actúas desde el amor incondicional y la visión colectiva. Tu presencia tiene el poder de transformar lo que toca.',
        shadow: 'El reto: soltar el pasado para abrirte plenamente al siguiente ciclo.' },
  11: { archetype: 'El Maestro Iluminado',  keywords: ['Inspiración', 'Intuición elevada', 'Canal espiritual'],
        energy: 'Tu número es un número maestro. Eres un canal entre lo visible y lo invisible. Tu intuición opera en frecuencias que pocos comprenden. Cuando confías en ella, manifiestas a una velocidad que sorprende incluso a ti.',
        shadow: 'El reto: anclar la visión espiritual en acciones concretas del día a día.' },
  22: { archetype: 'El Constructor Maestro', keywords: ['Visión global', 'Manifestación a escala', 'Impacto'],
        energy: 'Tu número es el más poderoso para construir en el plano material. Estás diseñado para proyectos que trascienden lo personal y dejan huella en el mundo. Lo que creas dura generaciones.',
        shadow: 'El reto: no diluirte en la magnitud de la visión. Un paso a la vez.' },
  33: { archetype: 'El Maestro Sanador',    keywords: ['Amor incondicional', 'Enseñanza', 'Sanación'],
        energy: 'Tu número lleva la vibración más alta de servicio. Eres un faro de amor y sanación para todos los que entran en contacto contigo. Tu manifestación más poderosa ocurre cuando enseñas, guías o elevas a otros.',
        shadow: 'El reto: cuidar tu propia energía con la misma devoción que cuidas a los demás.' },
}

// ── Main screen ───────────────────────────────────────────────────────────────

export function ProfileScreen({ bottomInset = 0 }: { bottomInset?: number }) {
  const { palette, setTheme } = useTheme()
  const { profile, signOut, refreshProfile } = useAuth()

  const [allLogs,               setAllLogs]               = useState<DailyLog[]>([])
  const [todayCount,            setTodayCount]            = useState(0)
  const [editingProfile,        setEditingProfile]        = useState(false)
  const [viewingHistory,        setViewingHistory]        = useState(false)
  const [viewingBadges,         setViewingBadges]         = useState(false)
  const [viewingNotifications,  setViewingNotifications]  = useState(false)
  const [deleteStep,            setDeleteStep]            = useState<0 | 1 | 2>(0)  // 0=none 1=confirm 2=final
  const [deleting,              setDeleting]              = useState(false)
  const [deleteError,           setDeleteError]           = useState<string | null>(null)
  const [signalHistory,         setSignalHistory]         = useState<SignalHistoryEntry[]>([])

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  useEffect(() => {
    if (!profile) return
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', profile.id)
      .order('date', { ascending: false })
      .limit(90)
      .then(({ data }) => {
        if (!data) return
        setAllLogs(data as DailyLog[])
        const todayLog = (data as DailyLog[]).find(l => l.date === todayStr)
        setTodayCount(todayLog ? countTasksFromLog(todayLog) : 0)
      })
  }, [profile?.id, todayStr])

  useEffect(() => {
    loadSignalHistory().then(setSignalHistory)
  }, [])

  const stats = useStats(allLogs, profile ?? null, todayStr, todayCount, null)

  if (!profile || !stats) return null

  // ── Sub-screen routing ─────────────────────────────────────────────────────
  if (editingProfile) {
    return (
      <EditProfileScreen
        profile={profile}
        onSave={() => { refreshProfile(); setEditingProfile(false) }}
        onBack={() => setEditingProfile(false)}
      />
    )
  }
  if (viewingHistory) {
    return <HistoryScreen onBack={() => setViewingHistory(false)} />
  }
  if (viewingBadges) {
    return <BadgesScreen onBack={() => setViewingBadges(false)} />
  }
  if (viewingNotifications) {
    return <NotificationsScreen onBack={() => setViewingNotifications(false)} />
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const { planDay, planDaysLeft, planComplete, streak, overallRate, weeklyProgressDays } = stats
  const planDuration = profile.plan_duration ?? 30
  const phaseInfo    = getPhaseInfo(Math.min(planDay, planDuration), planDuration)
  const planPct      = Math.min(Math.round(((planDay - 1) / planDuration) * 100), 100)

  const STREAK_MILESTONES = [3, 7, 14, 21, 33, 66, 90]
  const nextMilestone  = STREAK_MILESTONES.find(m => m > streak) ?? 90
  const prevMilestone  = [...STREAK_MILESTONES].reverse().find(m => m <= streak) ?? 0
  const streakProgress = nextMilestone > prevMilestone
    ? (streak - prevMilestone) / (nextMilestone - prevMilestone) : 1
  const streakColor    = streak >= 21 ? Colors.gold : streak >= 7 ? '#4CAF82' : Colors.textSecondary
  const streakMessage  = streak === 0
    ? 'Comienza hoy — cada gran racha empieza con un paso.'
    : streak < 3  ? 'Buen comienzo. No rompas la cadena.'
    : streak < 7  ? `${streak} días seguidos. Estás construyendo algo real.`
    : streak < 14 ? '¡Primera semana completa! La disciplina ya es tuya.'
    : streak < 21 ? 'Dos semanas de constancia. El hábito se está grabando.'
    : streak < 33 ? 'Hábito formado. Ya no es esfuerzo — es quien eres.'
    : streak < 66 ? 'Un mes de poder. Pocos llegan hasta aquí.'
    : '¡Racha legendaria! Eres constancia en estado puro.'

  // Weak habits from last 7 days
  const weakHabits: Array<HabitDetail & { completions: number }> = (() => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (i + 1))
      return d.toISOString().split('T')[0]
    })
    const weekLogs = allLogs.filter(l => last7.includes(l.date))
    if (weekLogs.length < 3) return []
    return Object.entries(HABIT_DETAILS)
      .map(([field, detail]) => ({
        ...detail,
        completions: weekLogs.filter(l => {
          const hc: string[] = (l as any).habits_completed || []
          return !!(l as any)[field] || hc.includes(field)
        }).length,
      }))
      .filter(h => h.completions < 4)
      .sort((a, b) => a.completions - b.completions)
  })()

  const numInfo = NUMEROLOGY_INFO[profile.numerology_number]
  const firstName = profile.full_name.split(' ')[0]

  async function handleSignOut() {
    await signOut()
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const { error } = await supabase.functions.invoke('delete-account')
      if (error) throw error
      await signOut()
    } catch (e: any) {
      setDeleting(false)
      setDeleteError(e?.message ?? 'Error inesperado. Intenta de nuevo.')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero band ── */}
        <View style={[styles.heroSection, { backgroundColor: palette.hero }]}>
          <Text style={styles.wordmark}>lumina</Text>
          <Text style={styles.greeting}>{firstName}.</Text>
          <Text style={styles.sub}>Día {Math.min(planDay, planDuration)} · Plan {planDuration} días</Text>
        </View>

        {/* ── Cards surface ── */}
        <View style={[styles.cardsSurface, { paddingBottom: Spacing.lg + bottomInset }]}>

        {/* ── Progreso de hoy ── */}
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>⭕ Progreso de hoy</Text>
          <Text style={styles.sectionSub}>Tu avance diario de hábitos</Text>
          <CircularProgress completed={todayCount} total={9} />
        </Card>

        {/* ── Racha ── */}
        <View style={[styles.streakCard, { borderColor: streak > 0 ? streakColor : Colors.border }]}>
          <View style={styles.streakTop}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakFlame}>🔥</Text>
              <View>
                <Text style={[styles.streakCount, { color: streakColor }]}>
                  {streak} {streak === 1 ? 'día' : 'días'} seguidos
                </Text>
                <Text style={styles.streakMessage}>{streakMessage}</Text>
              </View>
            </View>
            <View style={styles.streakBadge}>
              <Text style={[styles.streakBadgeText, { color: streakColor }]}>
                {streak >= 66 ? '👑' : streak >= 21 ? '⭐' : streak >= 7 ? '✦' : '○'}
              </Text>
            </View>
          </View>
          <View style={styles.streakBarTrack}>
            <View style={[styles.streakBarFill, { width: `${Math.round(streakProgress * 100)}%` as any, backgroundColor: streakColor }]} />
          </View>
          <Text style={styles.streakMilestone}>
            {streak >= nextMilestone
              ? '¡Hito alcanzado!'
              : `Próximo hito: día ${nextMilestone} · ${Math.round(streakProgress * 100)}% completado`}
          </Text>
        </View>

        {/* ── Fase del plan ── */}
        {!planComplete && (
          <View style={styles.planCard}>
            <View style={styles.planTop}>
              <View style={styles.planLeft}>
                <Text style={styles.planPhaseEmoji}>{phaseInfo.emoji}</Text>
                <View>
                  <Text style={styles.planEyebrow}>FASE ACTUAL</Text>
                  <Text style={styles.planPhaseName}>{phaseInfo.label}</Text>
                </View>
              </View>
              <Text style={styles.planPct}>{planPct}%</Text>
            </View>
            <View style={styles.planBarTrack}>
              <View style={[styles.planBarFill, { width: `${planPct}%` as any }]} />
            </View>
            <View style={styles.planStatsRow}>
              <View style={styles.planStat}>
                <Text style={styles.planStatVal}>Día {Math.min(planDay, planDuration)}</Text>
                <Text style={styles.planStatLbl}>actual</Text>
              </View>
              <View style={styles.planStatSep} />
              <View style={styles.planStat}>
                <Text style={styles.planStatVal}>{Math.max(planDaysLeft, 0)}</Text>
                <Text style={styles.planStatLbl}>restantes</Text>
              </View>
              <View style={styles.planStatSep} />
              <View style={styles.planStat}>
                <Text style={styles.planStatVal}>{planDuration}</Text>
                <Text style={styles.planStatLbl}>total</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Mapa semanal ── */}
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>📊 Mapa de Progreso · Semanal</Text>
          <Text style={styles.sectionSub}>Tu constancia de los últimos 7 días</Text>
          <WeeklyProgressRing days={weeklyProgressDays} />
        </Card>

        {/* ── Patrón débil ── */}
        {weakHabits.length > 0 && (
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>🔍 Patrón detectado esta semana</Text>
            <Text style={styles.sectionSub}>
              {weakHabits.length === 1
                ? 'Este hábito necesita más consistencia'
                : `Estos ${weakHabits.length} hábitos necesitan más consistencia`}
            </Text>
            {weakHabits.map((h, i) => (
              <View key={i} style={styles.patternItem}>
                <View style={styles.patternItemHeader}>
                  <Text style={styles.patternEmoji}>{h.emoji}</Text>
                  <Text style={styles.patternName}>{h.name}</Text>
                  <View style={[styles.patternBadge, h.completions > 0 && styles.patternBadgeOrange]}>
                    <Text style={[styles.patternBadgeText, h.completions > 0 && styles.patternBadgeTextOrange]}>
                      {h.completions}/7
                    </Text>
                  </View>
                </View>
                <View style={styles.patternTipBox}>
                  <Text style={styles.patternTipLabel}>💡 Cómo retomarlo</Text>
                  <Text style={styles.patternTip}>{h.tip}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* ── Numerología ── */}
        {numInfo && (
          <View style={styles.numCard}>
            <View style={styles.numHeader}>
              <View style={styles.numBadge}>
                <Text style={styles.numBadgeNum}>{profile.numerology_number}</Text>
              </View>
              <View style={styles.numTitles}>
                <Text style={styles.numArchetype}>{numInfo.archetype}</Text>
                <View style={styles.numKeywords}>
                  {numInfo.keywords.map(k => (
                    <View key={k} style={styles.numKeywordPill}>
                      <Text style={styles.numKeywordText}>{k}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.numEnergy}>{numInfo.energy}</Text>
            <Text style={styles.numShadow}>⚠ {numInfo.shadow}</Text>
          </View>
        )}

        {/* ── Mis señales ── */}
        {signalHistory.length > 0 && (() => {
          const counts: Record<number, number> = {}
          for (const e of signalHistory) counts[e.number] = (counts[e.number] ?? 0) + 1
          const topNum = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
          const MASTER_SET = new Set([11, 22, 33])
          return (
            <View style={styles.signalsSection}>
              <Text style={styles.navSectionLabel}>MIS SEÑALES</Text>
              <Text style={styles.signalsSummary}>Tu número más frecuente: {topNum}</Text>
              {signalHistory.slice(0, 30).map((entry, i) => (
                <View key={i} style={styles.signalRow}>
                  <View style={[styles.signalCircle, MASTER_SET.has(entry.number) && styles.signalCircleMaster]}>
                    <Text style={styles.signalCircleNum}>{entry.number}</Text>
                  </View>
                  <View style={styles.signalMeta}>
                    <Text style={styles.signalDate}>{entry.date}</Text>
                    <Text style={styles.signalReading} numberOfLines={2}>{entry.reading}</Text>
                  </View>
                </View>
              ))}
            </View>
          )
        })()}

        {/* ── Tema ── */}
        <View style={styles.navSection}>
          <Text style={styles.navSectionLabel}>TEMA DE COLOR</Text>
          <View style={themeStyles.row}>
            {PALETTES.map(p => {
              const active = palette.name === p.name
              return (
                <TouchableOpacity
                  key={p.name}
                  style={[themeStyles.swatch, active && { borderColor: p.accent, borderWidth: 2 }]}
                  onPress={() => setTheme(p.name)}
                  activeOpacity={0.8}
                >
                  <View style={[themeStyles.circle, { backgroundColor: p.hero }]}>
                    {active && <Text style={themeStyles.check}>✦</Text>}
                  </View>
                  <Text style={[themeStyles.swatchLabel, active && { color: p.accent, fontFamily: Fonts.bodySemiBold }]}>
                    {p.emoji} {p.name === 'rosa' ? 'Rosa' : 'Morado'}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* ── Navegación ── */}
        <View style={styles.navSection}>
          <Text style={styles.navSectionLabel}>MI CUENTA</Text>

          <NavRow
            emoji="✏️" label="Editar perfil"
            onPress={() => setEditingProfile(true)}
          />
          <NavRow
            emoji="📜" label="Historial"
            onPress={() => setViewingHistory(true)}
          />
          <NavRow
            emoji="🏅" label="Logros"
            onPress={() => setViewingBadges(true)}
          />
          <NavRow
            emoji="🔔" label="Notificaciones"
            onPress={() => setViewingNotifications(true)}
          />
        </View>

        {/* ── Sesión ── */}
        <View style={styles.navSection}>
          <Text style={styles.navSectionLabel}>SESIÓN</Text>

          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.75}>
            <Text style={styles.signOutText}>Cerrar sesión</Text>
          </TouchableOpacity>

          {/* Delete account — two-step confirmation */}
          {deleteStep === 0 && (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteStep(1)} activeOpacity={0.75}>
              <Text style={styles.deleteBtnText}>Eliminar cuenta</Text>
            </TouchableOpacity>
          )}
          {deleteStep === 1 && (
            <View style={styles.deleteConfirm}>
              <Text style={styles.deleteConfirmTitle}>¿Eliminar tu cuenta?</Text>
              <Text style={styles.deleteConfirmBody}>
                Esta acción es permanente. Se borrarán tu perfil, historial y acceso a la app.
              </Text>
              <View style={styles.deleteConfirmRow}>
                <TouchableOpacity style={styles.deleteCancelBtn} onPress={() => setDeleteStep(0)} activeOpacity={0.75}>
                  <Text style={styles.deleteCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteFinalBtn} onPress={() => setDeleteStep(2)} activeOpacity={0.75}>
                  <Text style={styles.deleteFinalText}>Sí, continuar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {deleteStep === 2 && (
            <View style={styles.deleteConfirm}>
              <Text style={styles.deleteConfirmTitle}>Eliminar cuenta — acción irreversible</Text>
              <Text style={styles.deleteConfirmBody}>
                Se borrarán permanentemente tu perfil, historial, diario e imágenes. No hay vuelta atrás.
              </Text>
              {deleteError && (
                <Text style={[styles.deleteConfirmBody, { color: '#E05555', marginTop: 4 }]}>
                  {deleteError}
                </Text>
              )}
              <View style={styles.deleteConfirmRow}>
                <TouchableOpacity
                  style={styles.deleteCancelBtn}
                  onPress={() => { setDeleteStep(0); setDeleteError(null) }}
                  activeOpacity={0.75}
                  disabled={deleting}
                >
                  <Text style={styles.deleteCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteFinalBtn, deleting && { opacity: 0.6 }]}
                  onPress={handleDeleteAccount}
                  activeOpacity={0.75}
                  disabled={deleting}
                >
                  {deleting
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.deleteFinalText}>Eliminar para siempre</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: Spacing.xxl }} />
        </View>{/* /cardsSurface */}
      </ScrollView>
    </View>
  )
}

// ── NavRow helper ─────────────────────────────────────────────────────────────
function NavRow({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.navRow} onPress={onPress} activeOpacity={0.75}>
      <Text style={styles.navRowEmoji}>{emoji}</Text>
      <Text style={styles.navRowLabel}>{label}</Text>
      <Text style={styles.navRowChevron}>›</Text>
    </TouchableOpacity>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: Colors.card },
  heroSection: {
    backgroundColor: Colors.roseHero,
    paddingTop: 72, paddingBottom: 44,
    paddingHorizontal: Spacing.lg,
  },
  cardsSurface: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    gap: Spacing.md,
    flex: 1,
  },

  wordmark: { fontSize: 11, letterSpacing: 3, color: Colors.heroTextMuted,
              fontFamily: Fonts.bodySemiBold, marginBottom: Spacing.md },
  greeting: { fontSize: 36, fontFamily: Fonts.headingItalic, color: Colors.heroText, marginBottom: 2 },
  sub:      { fontSize: 13, color: Colors.heroTextMuted, fontFamily: Fonts.body },

  card: { marginBottom: 0 },
  sectionLabel: { fontSize: 13, fontFamily: Fonts.bodySemiBold, color: Colors.textPrimary,
                  letterSpacing: 0.3, marginBottom: 3 },
  sectionSub:   { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.md },

  // Streak
  streakCard: {
    borderWidth: 1, borderRadius: Radius.lg,
    backgroundColor: Colors.cardBg,
    padding: Spacing.md, gap: Spacing.sm,
  },
  streakTop:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  streakFlame: { fontSize: 24 },
  streakCount: { fontSize: 17, fontFamily: Fonts.bodySemiBold },
  streakMessage: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  streakBadge: { width: 36, height: 36, borderRadius: 18,
                 backgroundColor: Colors.surface2,
                 alignItems: 'center', justifyContent: 'center' },
  streakBadgeText: { fontSize: 18 },
  streakBarTrack: { height: 4, borderRadius: 2, backgroundColor: 'rgba(42,27,34,0.10)' },
  streakBarFill:  { height: 4, borderRadius: 2 },
  streakMilestone: { fontSize: 11, color: Colors.textSecondary },

  // Plan phase
  planCard: {
    borderWidth: 1, borderColor: Colors.borderPurple,
    borderRadius: Radius.lg,
    backgroundColor: Colors.cardBg,
    padding: Spacing.md, gap: Spacing.sm,
  },
  planTop:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planLeft:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  planPhaseEmoji: { fontSize: 28 },
  planEyebrow:   { fontSize: 8, color: Colors.plum, opacity: 0.65, letterSpacing: 2,
                   fontFamily: Fonts.bodySemiBold },
  planPhaseName: { fontSize: 16, fontFamily: Fonts.bodySemiBold, color: Colors.textPrimary },
  planPct:       { fontSize: 24, fontFamily: Fonts.headingItalic, color: Colors.plum },
  planBarTrack:  { height: 4, borderRadius: 2, backgroundColor: 'rgba(42,27,34,0.10)' },
  planBarFill:   { height: 4, borderRadius: 2, backgroundColor: Colors.plum },
  planStatsRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  planStat:      { flex: 1, alignItems: 'center' },
  planStatVal:   { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.textPrimary },
  planStatLbl:   { fontSize: 10, color: Colors.textSecondary },
  planStatSep:   { width: 1, height: 28, backgroundColor: Colors.border },

  // Weak habits
  patternItem:       { paddingVertical: Spacing.sm, borderTopWidth: 1,
                       borderTopColor: Colors.border },
  patternItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  patternEmoji:      { fontSize: 18 },
  patternName:       { flex: 1, fontSize: 13, color: Colors.textPrimary, fontFamily: Fonts.bodySemiBold },
  patternBadge:      { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2,
                       backgroundColor: 'rgba(224,85,85,0.12)',
                       borderWidth: 1, borderColor: 'rgba(224,85,85,0.3)' },
  patternBadgeOrange: { backgroundColor: 'rgba(255,165,0,0.12)', borderColor: 'rgba(255,165,0,0.3)' },
  patternBadgeText:   { fontSize: 11, color: '#E05555', fontFamily: Fonts.bodySemiBold },
  patternBadgeTextOrange: { color: '#FFA500' },
  patternTipBox:     { backgroundColor: Colors.cardBg, borderRadius: 8,
                       padding: Spacing.sm, gap: 4 },
  patternTipLabel:   { fontSize: 10, color: Colors.plum, fontFamily: Fonts.bodySemiBold, opacity: 0.8 },
  patternTip:        { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  // Numerología
  numCard: {
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.borderPurple,
    padding: Spacing.md, gap: Spacing.sm,
    backgroundColor: Colors.cardBg,
  },
  numHeader:      { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  numBadge:       { width: 44, height: 44, borderRadius: 22,
                    borderWidth: 1.5, borderColor: Colors.plum,
                    alignItems: 'center', justifyContent: 'center' },
  numBadgeNum:    { fontSize: 18, fontFamily: Fonts.headingItalic, color: Colors.plum },
  numTitles:      { flex: 1, gap: 4 },
  numArchetype:   { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.textPrimary },
  numKeywords:    { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  numKeywordPill: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
                    backgroundColor: Colors.plumDim,
                    borderWidth: 1, borderColor: Colors.borderPurple },
  numKeywordText: { fontSize: 10, color: Colors.plum, opacity: 0.85 },
  numEnergy:      { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  numShadow:      { fontSize: 12, color: Colors.textDim, fontStyle: 'italic' },

  // Navigation section
  navSection: {
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.cardBg,
    overflow: 'hidden',
  },
  navSectionLabel: {
    fontSize: 9, letterSpacing: 2, color: Colors.textSecondary, opacity: 0.7,
    fontFamily: Fonts.bodySemiBold, paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm, paddingBottom: 6,
  },
  navRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  navRowEmoji:   { fontSize: 18, width: 26, textAlign: 'center' },
  navRowLabel:   { flex: 1, fontSize: 15, color: Colors.textPrimary, fontFamily: Fonts.body },
  navRowChevron: { fontSize: 22, color: Colors.textSecondary, marginTop: -2 },

  // Sign out
  signOutBtn: {
    marginHorizontal: Spacing.md, marginVertical: Spacing.sm,
    paddingVertical: 13,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  signOutText: { fontSize: 15, color: Colors.textPrimary, fontFamily: Fonts.bodySemiBold },

  // Delete account
  deleteBtn: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    paddingVertical: 13, borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(224,85,85,0.3)',
    alignItems: 'center',
  },
  deleteBtnText: { fontSize: 15, color: '#E05555', fontFamily: Fonts.bodySemiBold },
  deleteConfirm: {
    marginHorizontal: Spacing.md, marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(224,85,85,0.25)',
    backgroundColor: 'rgba(224,85,85,0.06)',
    gap: Spacing.sm,
  },
  deleteConfirmTitle: { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: '#E05555' },
  deleteConfirmBody:  { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  deleteConfirmRow:   { flexDirection: 'row', gap: Spacing.sm },
  deleteCancelBtn:    { flex: 1, paddingVertical: 10, borderRadius: Radius.sm,
                        borderWidth: 1, borderColor: Colors.border,
                        alignItems: 'center' },
  deleteCancelText:   { fontSize: 13, color: Colors.textPrimary },
  deleteFinalBtn:     { flex: 1, paddingVertical: 10, borderRadius: Radius.sm,
                        backgroundColor: 'rgba(224,85,85,0.2)',
                        borderWidth: 1, borderColor: 'rgba(224,85,85,0.4)',
                        alignItems: 'center' },
  deleteFinalText:    { fontSize: 13, color: '#E05555', fontFamily: Fonts.bodySemiBold },

  signalsSection: {
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.borderGold,
    backgroundColor: Colors.goldDim,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  signalsSummary: {
    fontSize: 12, color: Colors.gold, fontFamily: Fonts.bodySemiBold,
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm,
  },
  signalRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(212,168,67,0.10)',
  },
  signalCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(212,168,67,0.15)',
    borderWidth: 1, borderColor: 'rgba(212,168,67,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  signalCircleMaster: {
    backgroundColor: 'rgba(212,168,67,0.28)',
    borderColor: Colors.gold,
  },
  signalCircleNum: {
    fontFamily: Fonts.heading, fontSize: 15, color: Colors.gold,
  },
  signalMeta: { flex: 1, gap: 2 },
  signalDate: {
    fontSize: 10, color: Colors.textSecondary, letterSpacing: 0.5,
    fontFamily: Fonts.body,
  },
  signalReading: {
    fontSize: 12, color: Colors.textPrimary, lineHeight: 17,
    fontFamily: Fonts.body,
  },
})

const themeStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  swatch: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: Colors.cardBg,
  },
  circle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 18, color: '#fff' },
  swatchLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: Fonts.body,
  },
})
