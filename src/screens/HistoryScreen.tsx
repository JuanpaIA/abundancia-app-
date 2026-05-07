import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native'
import Svg, { Circle, Polyline, Line, Text as SvgText } from 'react-native-svg'
import { useState, useEffect } from 'react'
import { Colors, Spacing, Radius } from '../constants/theme'
import { Card } from '../components/ui/Card'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { getLunarPhase, getLunarPhaseEmoji, getLunarPhaseLabel } from '../utils/calculations'
import { getPortalForDate, getPortalPowerColor, getPortalPowerLabel } from '../utils/energeticPortals'
import { LUNAR_PHASE_CONTENT } from '../utils/lunarPhaseContent'
import { generateDailyProtocol } from '../content/dailyProtocol'
import { generateDailyObjective } from '../content/dailyObjective'
import { ZodiacSign, LunarPhase, DailyLog } from '../types'

// ── Resumen semanal ───────────────────────────────────────────────────────────

interface WeeklySummaryData {
  weekLabel: string; totalTasks: number; daysActive: number; pct: number
  bestDayLabel: string; bestDayCount: number; streak: number
}
const _DAYS_LONG   = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const _MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function buildWeeklySummary(logs: DailyLog[], currentStreak: number): WeeklySummaryData | null {
  const monday = new Date(); monday.setHours(0,0,0,0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const lastMonday = new Date(monday); lastMonday.setDate(lastMonday.getDate() - 7)
  const lastSunday  = new Date(monday); lastSunday.setDate(lastSunday.getDate() - 1)
  const weekDates: string[] = []
  const d = new Date(lastMonday)
  while (d <= lastSunday) { weekDates.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1) }
  const weekLogs = logs.filter(l => weekDates.includes(l.date))
  if (weekLogs.length === 0) return null
  function countLog(l: DailyLog): number {
    const hc: string[] = (l as any).habits_completed || []
    return [
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
  }
  const logMap = Object.fromEntries(weekLogs.map(l => [l.date, countLog(l)]))
  const totalTasks = weekDates.reduce((s, date) => s + (logMap[date] ?? 0), 0)
  const daysActive = weekDates.filter(date => (logMap[date] ?? 0) > 0).length
  const pct = Math.round((totalTasks / (7 * 9)) * 100)
  let bestDate = weekDates[0], bestCount = 0
  weekDates.forEach(date => { if ((logMap[date] ?? 0) > bestCount) { bestCount = logMap[date] ?? 0; bestDate = date } })
  const bestDayLabel = _DAYS_LONG[new Date(bestDate + 'T12:00:00').getDay()]
  const lm = lastMonday, ls = lastSunday
  const weekLabel = `${lm.getDate()} ${_MONTHS_SHORT[lm.getMonth()]} — ${ls.getDate()} ${_MONTHS_SHORT[ls.getMonth()]}`
  return { weekLabel, totalTasks, daysActive, pct, bestDayLabel, bestDayCount: bestCount, streak: currentStreak }
}

import { useRef } from 'react'

function WeeklySummaryModal({ data, firstName, onClose }: { data: WeeklySummaryData; firstName: string; onClose: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(60)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start()
  }, [])
  const msg = data.pct >= 80 ? 'Semana excepcional. Tu constancia está creando resultados reales.'
    : data.pct >= 60 ? 'Buena semana. Cada práctica completada eleva tu vibración.'
    : data.pct >= 40 ? 'Semana con progreso. Esta semana mantén el ritmo un paso más.'
    : data.pct >= 20 ? 'Semana lenta, pero aquí estás. Lo importante es no rendirse.'
    : 'Semana difícil. Esta semana empieza con una sola práctica — eso basta.'
  const pctColor = data.pct >= 60 ? Colors.gold : data.pct >= 30 ? '#4CAF82' : Colors.textSecondary
  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[wsStyles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[wsStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={wsStyles.eyebrow}>✨ Resumen Semanal</Text>
          <Text style={wsStyles.weekLabel}>{data.weekLabel}</Text>
          <Text style={wsStyles.greeting}>Así fue tu semana, {firstName}</Text>
          <View style={wsStyles.pctContainer}>
            <Text style={[wsStyles.pctNumber, { color: pctColor }]}>{data.pct}%</Text>
            <Text style={wsStyles.pctLabel}>de tu protocolo completado</Text>
          </View>
          <View style={wsStyles.statsGrid}>
            <View style={wsStyles.statBox}><Text style={wsStyles.statValue}>{data.totalTasks}</Text><Text style={wsStyles.statLabel}>tareas{'\n'}completadas</Text></View>
            <View style={[wsStyles.statBox, wsStyles.statBoxMid]}><Text style={wsStyles.statValue}>{data.daysActive}</Text><Text style={wsStyles.statLabel}>días{'\n'}activos</Text></View>
            <View style={wsStyles.statBox}><Text style={wsStyles.statValue}>🔥 {data.streak}</Text><Text style={wsStyles.statLabel}>racha{'\n'}actual</Text></View>
          </View>
          {data.bestDayCount > 0 && (
            <View style={wsStyles.bestDay}>
              <Text style={wsStyles.bestDayText}>⭐ Tu mejor día fue el <Text style={{ color: Colors.gold }}>{data.bestDayLabel}</Text> con {data.bestDayCount} prácticas</Text>
            </View>
          )}
          <Text style={wsStyles.msg}>{msg}</Text>
          <TouchableOpacity style={wsStyles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={wsStyles.btnText}>Comenzar nueva semana ✦</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const wsStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)', padding: Spacing.xl, paddingBottom: 44, gap: Spacing.md },
  eyebrow: { fontSize: 12, color: Colors.gold, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  weekLabel: { fontSize: 13, color: Colors.textDisabled },
  greeting: { fontSize: 22, color: Colors.textPrimary, fontWeight: '700' },
  pctContainer: { alignItems: 'center', paddingVertical: Spacing.sm },
  pctNumber: { fontSize: 72, fontWeight: '800', lineHeight: 80 },
  pctLabel: { fontSize: 13, color: Colors.textSecondary },
  statsGrid: { flexDirection: 'row', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, gap: 4 },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 20, color: Colors.textPrimary, fontWeight: '700' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  bestDay: { backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(201,168,76,0.20)' },
  bestDayText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  msg: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },
  btn: { backgroundColor: Colors.gold, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.xs },
  btnText: { fontSize: 15, color: Colors.background, fontWeight: '700' },
})

// ── Gráfica multi-línea ────────────────────────────────────────────────────────
const CHART_H = 180
const PAD_L = 24, PAD_R = 8, PAD_T = 14, PAD_B = 44
const PLOT_H = CHART_H - PAD_T - PAD_B
const Y_MAX = 9
const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]}`
}

interface ChartPoint { day: number; count: number; isToday: boolean; dateStr: string }

function MultiLineChart({ data }: { data: ChartPoint[] }) {
  const [chartW, setChartW] = React.useState(300)
  const plotW = chartW - PAD_L - PAD_R
  const n = data.length

  function xOf(i: number) {
    if (n <= 1) return PAD_L + plotW / 2
    return PAD_L + (i / (n - 1)) * plotW
  }
  function yOf(v: number) { return PAD_T + PLOT_H - (v / Y_MAX) * PLOT_H }

  const greenPts = data.map((d, i) => `${xOf(i)},${yOf(d.count)}`).join(' ')
  const redPts   = data.map((d, i) => `${xOf(i)},${yOf(Y_MAX - d.count)}`).join(' ')

  const step = n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : 5
  const showLabel = (i: number) => i === 0 || i === n - 1 || i % step === 0
  const axisY = PAD_T + PLOT_H

  return (
    <View onLayout={e => setChartW(e.nativeEvent.layout.width)}>
      <Svg width={chartW} height={CHART_H}>
        <SvgText
          x={10} y={PAD_T + PLOT_H / 2}
          fontSize={8} fill="rgba(255,255,255,0.30)"
          textAnchor="middle"
          transform={`rotate(-90, 10, ${PAD_T + PLOT_H / 2})`}
        >tareas</SvgText>
        {[0, 3, 6, 9].map(v => (
          <React.Fragment key={v}>
            <Line
              x1={PAD_L} y1={yOf(v)} x2={PAD_L + plotW} y2={yOf(v)}
              stroke={v === 0 ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.10)'}
              strokeWidth={v === 0 ? 1 : 0.8}
              strokeDasharray={v === 0 ? undefined : '3,5'}
            />
            <SvgText
              x={PAD_L - 4} y={yOf(v) + 4}
              fontSize={9} fill="rgba(255,255,255,0.40)" textAnchor="end"
            >{v}</SvgText>
          </React.Fragment>
        ))}
        {n > 1 && (
          <Polyline points={greenPts} fill="none" stroke="#E05555" strokeWidth={2.5}
            strokeLinejoin="round" strokeLinecap="round" />
        )}
        {n > 1 && (
          <Polyline points={redPts} fill="none" stroke="#4CAF82" strokeWidth={2.5}
            strokeLinejoin="round" strokeLinecap="round" />
        )}
        {data.map((d, i) => {
          const gx = xOf(i), gy = yOf(d.count)
          const rx = xOf(i), ry = yOf(Y_MAX - d.count)
          return (
            <React.Fragment key={d.day}>
              <Circle cx={gx} cy={gy} r={d.isToday ? 4.5 : 3} fill="#E05555" />
              <Circle cx={rx} cy={ry} r={d.isToday ? 4.5 : 3} fill="#4CAF82" />
              {d.isToday && (
                <>
                  <Circle cx={gx} cy={gy} r={8} fill="none" stroke="#E05555" strokeWidth={1} strokeOpacity={0.35}/>
                  <Circle cx={rx} cy={ry} r={8} fill="none" stroke="#4CAF82" strokeWidth={1} strokeOpacity={0.35}/>
                </>
              )}
            </React.Fragment>
          )
        })}
        {data.map((d, i) => {
          if (!showLabel(i)) return null
          const x = xOf(i), y = axisY + 10
          return (
            <SvgText key={d.day} x={x} y={y}
              fontSize={d.isToday ? 10 : 9}
              fill={d.isToday ? '#C9A84C' : 'rgba(255,255,255,0.40)'}
              fontWeight={d.isToday ? 'bold' : 'normal'}
              textAnchor="end"
              transform={`rotate(-40, ${x}, ${y})`}
            >{fmtDate(d.dateStr)}</SvgText>
          )
        })}
      </Svg>
    </View>
  )
}

// ── Círculo de progreso del día ───────────────────────────────────────────────
const DC_SIZE = 100, DC_SW = 9
const DC_R = (DC_SIZE - DC_SW) / 2
const DC_C = 2 * Math.PI * DC_R

function DayCircle({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? completed / total : 0
  const offset = DC_C * (1 - pct)
  const allDone = completed === total && total > 0
  const arc = allDone ? '#4CAF82' : '#C9A84C'
  const cx = DC_SIZE / 2, cy = DC_SIZE / 2
  return (
    <View style={dcStyles.root}>
      <Svg width={DC_SIZE} height={DC_SIZE}>
        <Circle cx={cx} cy={cy} r={DC_R} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={DC_SW} />
        {completed > 0 && (
          <Circle cx={cx} cy={cy} r={DC_R} fill="none"
            stroke={arc} strokeWidth={DC_SW}
            strokeDasharray={`${DC_C} ${DC_C}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        )}
        <SvgText x={cx} y={cy - 7} textAnchor="middle"
          fontSize={26} fontWeight="700" fill={completed > 0 ? arc : 'rgba(255,255,255,0.25)'}
        >{completed}</SvgText>
        <SvgText x={cx} y={cy + 13} textAnchor="middle"
          fontSize={10} fill="rgba(255,255,255,0.35)"
        >de {total} tareas</SvgText>
      </Svg>
      <View style={dcStyles.info}>
        <Text style={[dcStyles.pct, { color: arc }]}>{Math.round(pct * 100)}%</Text>
        <Text style={dcStyles.pctLabel}>completado</Text>
        <View style={dcStyles.sep} />
        <View style={dcStyles.stat}>
          <View style={[dcStyles.dot, { backgroundColor: arc }]} />
          <Text style={dcStyles.statText}>{completed} realizadas</Text>
        </View>
        <View style={dcStyles.stat}>
          <View style={[dcStyles.dot, { backgroundColor: '#E05555' }]} />
          <Text style={dcStyles.statText}>{total - completed} pendientes</Text>
        </View>
      </View>
    </View>
  )
}

const dcStyles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  info: { flex: 1, gap: 5 },
  pct: { fontSize: 30, fontWeight: '800' },
  pctLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: -4 },
  sep: { height: 0.5, backgroundColor: 'rgba(201,168,76,0.15)', marginVertical: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statText: { fontSize: 13, color: Colors.textSecondary },
})
// ─────────────────────────────────────────────────────────────────────────────

interface Props { onBack: () => void }

type DoneField =
  | 'daily_objective_done' | 'morning_done' | 'afternoon_done' | 'night_done'
  | 'ritual_done' | 'affirmation_done' | 'color_done' | 'foods_done' | 'biohack_done'

export function HistoryScreen({ onBack }: Props) {
  const { profile } = useAuth()
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null)
  const [tab, setTab] = useState<'rastreador' | 'plan'>('rastreador')

  useEffect(() => {
    if (!profile) return
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', profile.id)
      .gte('date', profile.created_at.split('T')[0])
      .order('date', { ascending: false })
      .then(({ data }) => { setLogs(data || []); setLoading(false) })
  }, [profile])

  if (!profile) return null

  const activationDate = profile.created_at

  function getDaysSinceActivation(): string[] {
    const start = new Date(activationDate); start.setHours(0, 0, 0, 0)
    const yesterday = new Date(); yesterday.setHours(0, 0, 0, 0); yesterday.setDate(yesterday.getDate() - 1)
    const days: string[] = []
    const d = new Date(yesterday)
    while (d >= start) { days.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() - 1) }
    return days
  }

  function getPlanDay(dateStr: string): number {
    const start = new Date(activationDate); start.setHours(0, 0, 0, 0)
    const date = new Date(dateStr + 'T00:00:00')
    return Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  function getDateLabel(dateStr: string) {
    const date = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    if (dateStr === today.toISOString().split('T')[0]) return 'Hoy'
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Ayer'
    return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function getEnergyLabel(level?: number | null) {
    if (!level) return null
    return ['', '😔 Baja', '😐 Regular', '🙂 Bien', '😊 Muy bien', '🌟 Excelente'][level]
  }

  function countTasksFromLog(l: DailyLog): number {
    const hc: string[] = (l as any).habits_completed || []
    return [
      l.daily_objective_done || hc.includes('daily_objective_done'),
      l.morning_done         || hc.includes('morning_done'),
      l.afternoon_done       || hc.includes('afternoon_done'),
      l.night_done           || hc.includes('night_done'),
      (l as any).ritual_done      || hc.includes('ritual_done'),
      (l as any).affirmation_done || hc.includes('affirmation_done'),
      (l as any).color_done       || hc.includes('color_done'),
      (l as any).foods_done       || hc.includes('foods_done'),
      (l as any).biohack_done     || hc.includes('biohack_done'),
    ].filter(Boolean).length
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const logMap: Record<string, DailyLog> = Object.fromEntries(logs.map(l => [l.date, l]))

  function getPlanDaysAsc(): string[] {
    const start = new Date(activationDate); start.setHours(0, 0, 0, 0)
    const end = new Date(); end.setHours(0, 0, 0, 0)
    const days: string[] = []
    const d = new Date(start)
    while (d <= end) { days.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1) }
    return days
  }

  const chartData: ChartPoint[] = getPlanDaysAsc().map((dateStr, i) => {
    const isToday = dateStr === todayStr
    const log = logMap[dateStr]
    const count = log ? countTasksFromLog(log) : 0
    return { dateStr, count, isToday, day: i + 1 }
  })

  const overallRate = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + d.count, 0) / (chartData.length * 9) * 100) : 0
  const perfectDays = chartData.filter(d => d.count === 9).length

  const streak = (() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    let expected = new Date(today)
    const countMap: Record<string, number> = Object.fromEntries(logs.map(l => [l.date, countTasksFromLog(l)]))
    let s = 0
    while (true) {
      const dateStr = expected.toISOString().split('T')[0]
      if ((countMap[dateStr] ?? 0) > 0) { s++; expected.setDate(expected.getDate() - 1) }
      else break
    }
    return s
  })()

  const selectedLog = logs.find(l => l.date === selectedDay)
  const userId = profile.id


  // ── Vista detalle de un día ────────────────────────────────────────────────
  if (selectedDay) {
    const date = new Date(selectedDay + 'T12:00:00')
    const lunarPhase: LunarPhase = getLunarPhase(date)
    const lunarContent = LUNAR_PHASE_CONTENT[lunarPhase]
    const dayPortal = getPortalForDate(date)
    const protocol = generateDailyProtocol(
      lunarPhase, profile.zodiac_sign as ZodiacSign,
      profile.numerology_number, profile.base_frequency, profile.manifestation_area
    )
    const histPlanDay = getPlanDay(selectedDay)
    const planDuration = profile.plan_duration ?? 30
    const objective = generateDailyObjective(
      profile.manifestation_area, profile.goal_details || {}, histPlanDay, planDuration
    )

    const TOTAL = 9
    const dayCount = selectedLog ? [
      selectedLog.daily_objective_done, selectedLog.morning_done,
      selectedLog.afternoon_done, selectedLog.night_done,
      selectedLog.ritual_done, selectedLog.affirmation_done,
      selectedLog.color_done, selectedLog.foods_done, selectedLog.biohack_done,
    ].filter(Boolean).length : 0

    const isDone = (f: DoneField) => !!(selectedLog as any)?.[f]

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* 1 — Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedDay(null)}>
              <Text style={styles.back}>← Tu plan de acción</Text>
            </TouchableOpacity>
            <Text style={styles.planDayTitle}>Día {getPlanDay(selectedDay)}</Text>
            <Text style={styles.dayTitle}>{getDateLabel(selectedDay)}</Text>
          </View>

          {/* 3 — Círculo de progreso del día */}
          <Card style={styles.circleCard}>
            <Text style={styles.sectionLabel}>⭕ Progreso del día</Text>
            <DayCircle completed={dayCount} total={TOTAL} />
          </Card>

          {/* 4 — ¿Cómo amaneció ese día? */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>⚡ ¿Cómo amaneció ese día?</Text>
            {selectedLog?.energy_level ? (
              <View style={styles.energyDisplay}>
                <View style={styles.energyBadge}>
                  <Text style={styles.energyBadgeNum}>{selectedLog.energy_level}</Text>
                </View>
                <Text style={styles.energyValueText}>{getEnergyLabel(selectedLog.energy_level)}</Text>
              </View>
            ) : (
              <Text style={styles.noData}>No registrado ese día</Text>
            )}
          </Card>

          {/* 5 — Portal energético */}
          {dayPortal ? (
            <View style={[styles.portalCard, { borderColor: getPortalPowerColor(dayPortal.power) }]}>
              <View style={styles.portalHeader}>
                <Text style={styles.portalEmoji}>{dayPortal.emoji}</Text>
                <View style={styles.portalTitles}>
                  <Text style={[styles.portalPowerBadge, { color: getPortalPowerColor(dayPortal.power) }]}>
                    ⚡ {getPortalPowerLabel(dayPortal.power)}
                  </Text>
                  <Text style={styles.portalName}>{dayPortal.name}</Text>
                </View>
              </View>
              <Text style={styles.portalEnergy}>✦ {dayPortal.energy}</Text>
              <Text style={styles.portalDescription}>{dayPortal.description}</Text>
              <View style={styles.portalDivider} />
              <Text style={styles.portalSectionLabel}>🎯 Intención del portal</Text>
              <Text style={styles.portalText}>{dayPortal.intention}</Text>
              <Text style={styles.portalSectionLabel}>🔮 Ritual especial</Text>
              <Text style={styles.portalText}>{dayPortal.ritual}</Text>
              <View style={[styles.portalAffBox, { borderLeftColor: getPortalPowerColor(dayPortal.power) }]}>
                <Text style={styles.portalAff}>"{dayPortal.affirmation}"</Text>
              </View>
            </View>
          ) : (
            <View style={styles.portalCardInactive}>
              <Text style={styles.portalInactiveLock}>🔒</Text>
              <View style={styles.portalInactiveBody}>
                <Text style={styles.portalInactiveTitle}>Portal Energético</Text>
                <Text style={styles.portalInactiveDesc}>
                  No había portal activo este día.
                </Text>
              </View>
            </View>
          )}

          {/* 6 — Contexto lunar */}
          {lunarContent.isKeyPhase ? (
            <View style={[styles.lunarCard, {
              borderColor: lunarContent.borderColor,
              backgroundColor: lunarPhase === 'nueva' ? 'rgba(107,95,215,0.08)' : 'rgba(232,201,107,0.06)',
            }]}>
              <View style={styles.lunarHeader}>
                <Text style={styles.lunarEmoji}>{lunarContent.emoji}</Text>
                <View style={styles.lunarTitles}>
                  <Text style={[styles.lunarPowerBadge, { color: lunarContent.borderColor }]}>
                    🌙 Fase clave del ciclo
                  </Text>
                  <Text style={styles.lunarName}>{lunarContent.name}</Text>
                </View>
              </View>
              <Text style={[styles.lunarEnergy, { color: lunarContent.borderColor }]}>
                ✦ {lunarContent.energy}
              </Text>
              <Text style={styles.lunarDescription}>{lunarContent.description}</Text>
              <View style={styles.lunarDivider} />
              <Text style={styles.lunarSectionLabel}>🎯 Tu intención lunar</Text>
              <Text style={styles.lunarText}>{lunarContent.intention}</Text>
              <Text style={styles.lunarSectionLabel}>🔮 Ritual recomendado</Text>
              <Text style={styles.lunarText}>{lunarContent.ritual}</Text>
              <View style={[styles.lunarAffBox, { borderLeftColor: lunarContent.borderColor }]}>
                <Text style={styles.lunarAff}>{lunarContent.affirmation}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.lunarCardInactive}>
              <Text style={styles.lunarInactiveEmoji}>{lunarContent.emoji}</Text>
              <View style={styles.lunarInactiveBody}>
                <Text style={styles.lunarInactiveTitle}>Fase Lunar · {lunarContent.name}</Text>
                <Text style={styles.lunarInactiveDesc}>{lunarContent.description}</Text>
              </View>
            </View>
          )}

          {/* 7 — Tu objetivo del día */}
          <Card goldBorder style={isDone('daily_objective_done') ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>🎯 Tu objetivo del día</Text>
              <Text style={isDone('daily_objective_done') ? styles.doneBadge : styles.pendingBadge}>
                {isDone('daily_objective_done') ? '✦ Completado' : '○ Pendiente'}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>{objective.title}</Text>
            <Text style={styles.sectionBody}>{objective.action}</Text>
            <Text style={styles.measurableText}>✓ {objective.measurable}</Text>
            {selectedLog?.objective_note ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteBoxLabel}>📝 Tu anotación</Text>
                <Text style={styles.noteBoxText}>{selectedLog.objective_note}</Text>
              </View>
            ) : null}
          </Card>

          {/* 8 — Protocolo de Manifestación */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>🌅 Protocolo de Manifestación</Text>
            <View style={styles.protocolRow}>
              <Text style={isDone('morning_done') ? [styles.protocolTime, styles.protocolDone] : styles.protocolTime}>
                {isDone('morning_done') ? '✦' : '○'} ☀️ Mañana
              </Text>
              <Text style={styles.protocolAction}>{protocol.protocol.morning}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.protocolRow}>
              <Text style={isDone('afternoon_done') ? [styles.protocolTime, styles.protocolDone] : styles.protocolTime}>
                {isDone('afternoon_done') ? '✦' : '○'} 🌤️ Tarde
              </Text>
              <Text style={styles.protocolAction}>{protocol.protocol.afternoon}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.protocolRow}>
              <Text style={isDone('night_done') ? [styles.protocolTime, styles.protocolDone] : styles.protocolTime}>
                {isDone('night_done') ? '✦' : '○'} 🌙 Noche
              </Text>
              <Text style={styles.protocolAction}>{protocol.protocol.night}</Text>
            </View>
          </Card>

          {/* 9 — Color del día */}
          <Card style={isDone('color_done') ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>👗 Color del día</Text>
              <Text style={isDone('color_done') ? styles.doneBadge : styles.pendingBadge}>
                {isDone('color_done') ? '✦ Hecho' : '○ Pendiente'}
              </Text>
            </View>
            <View style={styles.colorRow}>
              <View style={[styles.colorCircle, { backgroundColor: protocol.color.hex }]} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.sectionTitle}>{protocol.color.name}</Text>
                <Text style={styles.sectionBody}>{protocol.color.reason}</Text>
              </View>
            </View>
          </Card>

          {/* 9 — Ritual del día */}
          <Card style={isDone('ritual_done') ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>🔮 Ritual del día</Text>
              <Text style={isDone('ritual_done') ? styles.doneBadge : styles.pendingBadge}>
                {isDone('ritual_done') ? '✦ Hecho' : '○ Pendiente'}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>{protocol.ritual.title}</Text>
            <Text style={styles.sectionBody}>{protocol.ritual.description}</Text>
          </Card>

          {/* 9 — Afirmación del día */}
          <Card style={isDone('affirmation_done') ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>💬 Afirmación del día</Text>
              <Text style={isDone('affirmation_done') ? styles.doneBadge : styles.pendingBadge}>
                {isDone('affirmation_done') ? '✦ Hecho' : '○ Pendiente'}
              </Text>
            </View>
            <Text style={styles.affirmation}>"{protocol.affirmation}"</Text>
            <Text style={styles.numerologyTag}>Número {profile.numerology_number}</Text>
          </Card>

          {/* 9 — Alimentos del día */}
          <Card style={isDone('foods_done') ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>🍽️ Alimentos del día</Text>
              <Text style={isDone('foods_done') ? styles.doneBadge : styles.pendingBadge}>
                {isDone('foods_done') ? '✦ Hecho' : '○ Pendiente'}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>{protocol.foods.join(' · ')}</Text>
            <Text style={styles.sectionBody}>{protocol.foodReason}</Text>
          </Card>

          {/* 9 — Biohack */}
          <Card style={isDone('biohack_done') ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>⚡ Estrategia Biohack</Text>
              <Text style={isDone('biohack_done') ? styles.doneBadge : styles.pendingBadge}>
                {isDone('biohack_done') ? '✦ Hecho' : '○ Pendiente'}
              </Text>
            </View>
            <Text style={styles.sectionBody}>{protocol.biohack.activity}</Text>
            <View style={styles.freqBox}>
              <Text style={styles.freqHz}>{protocol.frequency.hz} Hz</Text>
              <Text style={styles.freqName}>{protocol.frequency.name}</Text>
            </View>
          </Card>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </View>
    )
  }

  // ── Vista lista ────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Tu plan de acción</Text>
          <Text style={styles.subtitle}>Rastreador de hábitos desde que activaste tu plan</Text>
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'rastreador' && styles.tabBtnActive]}
            onPress={() => setTab('rastreador')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, tab === 'rastreador' && styles.tabBtnTextActive]}>
              Rastreador
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'plan' && styles.tabBtnActive]}
            onPress={() => setTab('plan')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabBtnText, tab === 'plan' && styles.tabBtnTextActive]}>
              👑 Mi Plan Completo
            </Text>
          </TouchableOpacity>
        </View>

        {loading && <Text style={styles.loadingText}>Cargando tu historial...</Text>}

        {/* ── Tab: Mi Plan Completo ── */}
        {!loading && tab === 'plan' && (
          <>
            {[...getPlanDaysAsc()].reverse().map(dateStr => {
              const planDay = getPlanDay(dateStr)
              const planDuration = profile.plan_duration ?? 30
              const log = logMap[dateStr]
              const objective = generateDailyObjective(
                profile.manifestation_area, profile.goal_details || {}, planDay, planDuration
              )
              const done = !!(log?.daily_objective_done)
              const note = (log as any)?.objective_note as string | undefined

              const date = new Date(dateStr + 'T12:00:00')
              const dateLabel = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

              return (
                <View key={dateStr} style={styles.planCard}>
                  <View style={styles.planCardHeader}>
                    <Text style={styles.planCardDay}>Día {planDay}</Text>
                    <Text style={styles.planCardDate}>{dateLabel}</Text>
                    <Text style={done ? styles.planCardDone : styles.planCardPending}>
                      {done ? '✦' : '○'}
                    </Text>
                  </View>
                  <Text style={styles.planCardTitle}>{objective.title}</Text>
                  <Text style={styles.planCardAction}>{objective.action}</Text>
                  {note ? (
                    <View style={styles.planCardNoteBox}>
                      <Text style={styles.planCardNoteText}>{note}</Text>
                    </View>
                  ) : (
                    <Text style={styles.planCardNoNote}>Sin anotación</Text>
                  )}
                </View>
              )
            })}
          </>
        )}

        {/* ── Tab: Rastreador ── */}
        {!loading && tab === 'rastreador' && chartData.length > 1 && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionLabel}>📈 Progreso histórico</Text>
              <Text style={styles.chartMeta}>{overallRate}% completado</Text>
            </View>
            <MultiLineChart data={chartData} />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E05555' }]} />
                <Text style={styles.legendLabel}>Completadas</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF82' }]} />
                <Text style={styles.legendLabel}>Pendientes</Text>
              </View>
            </View>
            <View style={styles.chartStats}>
              <View style={styles.chartStatItem}>
                <Text style={styles.chartStatValue}>{chartData.length}</Text>
                <Text style={styles.chartStatLabel}>días en el plan</Text>
              </View>
              <View style={styles.chartStatSep} />
              <View style={styles.chartStatItem}>
                <Text style={styles.chartStatValue}>{perfectDays}</Text>
                <Text style={styles.chartStatLabel}>días perfectos</Text>
              </View>
              <View style={styles.chartStatSep} />
              <View style={styles.chartStatItem}>
                <Text style={styles.chartStatValue}>{overallRate}%</Text>
                <Text style={styles.chartStatLabel}>tasa global</Text>
              </View>
            </View>
          </Card>
        )}

        {!loading && tab === 'rastreador' && (
          <TouchableOpacity
            style={styles.weeklySummaryBtn}
            onPress={() => {
              const summary = buildWeeklySummary(logs, streak)
              if (summary) setWeeklySummary(summary)
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.weeklySummaryBtnEmoji}>✨</Text>
            <View style={styles.weeklySummaryBtnBody}>
              <Text style={styles.weeklySummaryBtnTitle}>Ver resumen semanal</Text>
              <Text style={styles.weeklySummaryBtnSub}>Semana pasada · tareas, días activos y racha</Text>
            </View>
            <Text style={styles.weeklySummaryBtnArrow}>›</Text>
          </TouchableOpacity>
        )}

        {!loading && tab === 'rastreador' && getDaysSinceActivation().map(dateStr => {
          const log = logs.find(l => l.date === dateStr)
          const date = new Date(dateStr + 'T12:00:00')
          const lunarPhase = getLunarPhase(date)
          const portal = getPortalForDate(date)
          const planDay = getPlanDay(dateStr)

          const completedCount = log ? [
            log.daily_objective_done, log.morning_done, log.afternoon_done,
            log.night_done, log.ritual_done, log.affirmation_done,
            log.color_done, log.foods_done, log.biohack_done,
          ].filter(Boolean).length : 0

          const allDone = completedCount === 9

          return (
            <TouchableOpacity key={dateStr} onPress={() => setSelectedDay(dateStr)} activeOpacity={0.8}>
              <Card style={allDone ? [styles.logCard, styles.logCardComplete] : styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.logDateRow}>
                      <Text style={styles.planDayBadge}>Día {planDay}</Text>
                      <Text style={styles.logDate}>{getDateLabel(dateStr)}</Text>
                    </View>
                    <Text style={styles.logLunar}>
                      {getLunarPhaseEmoji(lunarPhase)} {getLunarPhaseLabel(lunarPhase)}
                      {portal && <Text style={{ color: getPortalPowerColor(portal.power) }}>  {portal.emoji} Portal</Text>}
                    </Text>
                  </View>
                  <View style={styles.logRight}>
                    {log?.energy_level
                      ? <Text style={styles.logEnergy}>{['','😔','😐','🙂','😊','🌟'][log.energy_level]} {log.energy_level}/5</Text>
                      : <Text style={styles.logEnergySin}>Sin registrar</Text>
                    }
                    <Text style={log && completedCount > 0 ? styles.logProgress : styles.logProgressPending}>
                      {completedCount}/9 completados
                    </Text>
                  </View>
                </View>

                <View style={styles.logDots}>
                  {[
                    { done: log?.daily_objective_done, label: '🎯' },
                    { done: log?.morning_done,         label: '☀️' },
                    { done: log?.afternoon_done,       label: '🌤️' },
                    { done: log?.night_done,           label: '🌙' },
                    { done: log?.ritual_done,          label: '🔮' },
                    { done: log?.color_done,           label: '👗' },
                    { done: log?.affirmation_done,     label: '💬' },
                    { done: log?.foods_done,           label: '🍽️' },
                    { done: log?.biohack_done,         label: '⚡' },
                  ].map((item, i) => (
                    <View key={i} style={item.done ? [styles.dot, styles.dotDone] : styles.dot}>
                      <Text style={styles.dotEmoji}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            </TouchableOpacity>
          )
        })}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
      {weeklySummary && profile && (
        <WeeklySummaryModal
          data={weeklySummary}
          firstName={profile.full_name.split(' ')[0]}
          onClose={() => setWeeklySummary(null)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60 },
  header: { marginBottom: Spacing.xl, gap: Spacing.xs },
  back: { color: Colors.gold, fontSize: 15, marginBottom: Spacing.sm },
  title: { fontSize: 26, color: Colors.textPrimary, fontWeight: '700' },
  subtitle: { fontSize: 14, color: Colors.textSecondary },
  planDayTitle: { fontSize: 13, color: Colors.gold, fontWeight: '700', letterSpacing: 0.5 },
  dayTitle: { fontSize: 22, color: Colors.textPrimary, fontWeight: '700', textTransform: 'capitalize' },
  loadingText: { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xl },

  // Circle card
  circleCard: { marginBottom: Spacing.md, gap: Spacing.md },

  // Energy display
  energyDisplay: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  energyBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.gold,
    justifyContent: 'center', alignItems: 'center',
  },
  energyBadgeNum: { fontSize: 20, color: Colors.background, fontWeight: '800' },
  energyValueText: { fontSize: 16, color: Colors.textPrimary, fontWeight: '600' },
  noData: { fontSize: 14, color: Colors.textDisabled, fontStyle: 'italic' },

  // Portal active
  portalCard: {
    marginBottom: Spacing.md, borderRadius: 16,
    borderWidth: 1.5, padding: Spacing.md,
    backgroundColor: 'rgba(123,63,212,0.08)', gap: Spacing.sm,
  },
  portalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  portalEmoji: { fontSize: 36, lineHeight: 42 },
  portalTitles: { flex: 1, gap: 2 },
  portalPowerBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  portalName: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700', lineHeight: 22 },
  portalEnergy: { fontSize: 12, color: Colors.gold, fontStyle: 'italic' },
  portalDescription: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  portalDivider: { height: 0.5, backgroundColor: 'rgba(201,168,76,0.20)', marginVertical: 2 },
  portalSectionLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  portalText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  portalAffBox: { borderLeftWidth: 2, paddingLeft: Spacing.sm, marginTop: 2 },
  portalAff: { fontSize: 14, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
  // Portal inactive
  portalCardInactive: {
    marginBottom: Spacing.md, borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed',
    padding: Spacing.md, backgroundColor: 'rgba(255,255,255,0.03)',
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
  },
  portalInactiveLock: { fontSize: 22, opacity: 0.35, paddingTop: 2 },
  portalInactiveBody: { flex: 1, gap: Spacing.xs },
  portalInactiveTitle: { fontSize: 13, color: 'rgba(255,255,255,0.30)', fontWeight: '600', letterSpacing: 0.5 },
  portalInactiveDesc: { fontSize: 12, color: 'rgba(255,255,255,0.22)', lineHeight: 18 },

  // Lunar active
  lunarCard: {
    marginBottom: Spacing.md, borderRadius: 16,
    borderWidth: 1.5, padding: Spacing.md, gap: Spacing.sm,
  },
  lunarHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  lunarEmoji: { fontSize: 36, lineHeight: 42 },
  lunarTitles: { flex: 1, gap: 2 },
  lunarPowerBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  lunarName: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700', lineHeight: 22 },
  lunarEnergy: { fontSize: 12, fontStyle: 'italic' },
  lunarDescription: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  lunarDivider: { height: 0.5, backgroundColor: 'rgba(201,168,76,0.20)', marginVertical: 2 },
  lunarSectionLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.5 },
  lunarText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  lunarAffBox: { borderLeftWidth: 2, paddingLeft: Spacing.sm, marginTop: 2 },
  lunarAff: { fontSize: 14, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
  // Lunar inactive
  lunarCardInactive: {
    marginBottom: Spacing.md, borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'dashed',
    padding: Spacing.md, backgroundColor: 'rgba(255,255,255,0.03)',
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
  },
  lunarInactiveEmoji: { fontSize: 22, opacity: 0.4, paddingTop: 2 },
  lunarInactiveBody: { flex: 1, gap: Spacing.xs },
  lunarInactiveTitle: { fontSize: 13, color: 'rgba(255,255,255,0.30)', fontWeight: '600', letterSpacing: 0.5 },
  lunarInactiveDesc: { fontSize: 12, color: 'rgba(255,255,255,0.22)', lineHeight: 18 },

  // Sections
  sectionCard: { marginBottom: Spacing.md, gap: Spacing.sm },
  cardDone: { borderColor: Colors.success, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { fontSize: 12, color: Colors.textSecondary, letterSpacing: 0.5 },
  sectionTitle: { fontSize: 16, color: Colors.textPrimary, fontWeight: '600' },
  sectionBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  affirmation: { fontSize: 15, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 24 },
  numerologyTag: { fontSize: 12, color: Colors.gold },
  measurableText: { fontSize: 12, color: Colors.gold, fontStyle: 'italic' },
  doneBadge: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  pendingBadge: { fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: '500' },

  // Protocol
  protocolRow: { gap: 4 },
  protocolTime: { fontSize: 13, color: Colors.gold, fontWeight: '600' },
  protocolDone: { color: Colors.success },
  protocolAction: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  divider: { height: 0.5, backgroundColor: 'rgba(201,168,76,0.15)', marginVertical: Spacing.sm },

  // Color
  colorRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  colorCircle: { width: 48, height: 48, borderRadius: 24, marginTop: 4 },

  // Note
  noteBox: { borderTopWidth: 0.5, borderTopColor: 'rgba(201,168,76,0.15)', paddingTop: Spacing.sm, gap: 4 },
  noteBoxLabel: { fontSize: 11, color: Colors.textSecondary },
  noteBoxText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20, fontStyle: 'italic' },

  // Frequency
  freqBox: { backgroundColor: Colors.input, borderRadius: 12, padding: Spacing.md, gap: 4, marginTop: Spacing.sm },
  freqHz: { fontSize: 24, color: Colors.gold, fontWeight: '700' },
  freqName: { fontSize: 12, color: Colors.textSecondary },

  // Chart
  chartCard: { marginBottom: Spacing.md, gap: Spacing.sm },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chartMeta: { fontSize: 12, color: Colors.gold, fontWeight: '600' },
  chartLegend: { flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: 24 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: Colors.textSecondary },
  chartStats: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: Spacing.xs, borderTopWidth: 0.5,
    borderTopColor: 'rgba(201,168,76,0.15)',
  },
  chartStatItem: { alignItems: 'center', gap: 2 },
  chartStatValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: '700' },
  chartStatLabel: { fontSize: 10, color: Colors.textSecondary },
  chartStatSep: { width: 0.5, backgroundColor: 'rgba(201,168,76,0.15)', alignSelf: 'stretch' },

  // List view
  logCard: { marginBottom: Spacing.sm, gap: Spacing.md },
  logCardComplete: { borderColor: Colors.gold, borderWidth: 1 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  logDateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  planDayBadge: { fontSize: 11, color: Colors.gold, fontWeight: '700', letterSpacing: 0.5 },
  logDate: { fontSize: 15, color: Colors.textPrimary, fontWeight: '600', textTransform: 'capitalize' },
  logLunar: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  logRight: { alignItems: 'flex-end', gap: 2 },
  logEnergy: { fontSize: 12, color: Colors.textSecondary },
  logEnergySin: { fontSize: 12, color: Colors.textDisabled },
  logProgress: { fontSize: 12, color: Colors.gold },
  logProgressPending: { fontSize: 12, color: Colors.textDisabled },
  todayBadge: { color: Colors.gold, fontWeight: '700' },
  logDots: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.input,
    borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  dotDone: { backgroundColor: 'rgba(201,168,76,0.15)', borderColor: Colors.gold },
  dotEmoji: { fontSize: 13 },
  weeklySummaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.30)',
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  weeklySummaryBtnEmoji: { fontSize: 26 },
  weeklySummaryBtnBody: { flex: 1, gap: 2 },
  weeklySummaryBtnTitle: { fontSize: 15, color: Colors.textPrimary, fontWeight: '700' },
  weeklySummaryBtnSub: { fontSize: 12, color: Colors.textSecondary },
  weeklySummaryBtnArrow: { fontSize: 22, color: Colors.gold },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.lg,
    padding: 3,
    marginBottom: Spacing.lg,
    gap: 3,
  },
  tabBtn: {
    flex: 1, paddingVertical: Spacing.sm,
    alignItems: 'center', borderRadius: Radius.md,
  },
  tabBtnActive: {
    backgroundColor: Colors.gold,
  },
  tabBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  tabBtnTextActive: { color: Colors.background },

  // Mi Plan cards
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  planCardDay: { fontSize: 12, color: Colors.gold, fontWeight: '700' },
  planCardDate: { flex: 1, fontSize: 12, color: Colors.textSecondary, textTransform: 'capitalize' },
  planCardDone: { fontSize: 14, color: Colors.gold, fontWeight: '700' },
  planCardPending: { fontSize: 14, color: Colors.textDisabled },
  planCardTitle: { fontSize: 15, color: Colors.textPrimary, fontWeight: '700', lineHeight: 22 },
  planCardAction: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  planCardNoteBox: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(201,168,76,0.50)',
    paddingLeft: Spacing.sm,
    marginTop: Spacing.xs,
  },
  planCardNoteText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },
  planCardNoNote: { fontSize: 12, color: Colors.textDisabled, fontStyle: 'italic', marginTop: 2 },
})
