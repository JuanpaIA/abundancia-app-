import { useMemo } from 'react'
import { DailyLog, UserProfile } from '@lumina/core'

// ── Shared types (used by DashboardScreen components) ─────────────────────────

export interface ChartPoint  { dateStr: string; count: number; isToday: boolean; day: number }
export interface WeekDay     { level: number | null; isToday: boolean; label: string; date: number }
export interface ProgressDay { count: number | null; isToday: boolean; label: string; date: number }

export interface WeeklySummaryData {
  weekLabel: string
  totalTasks: number
  daysActive: number
  pct: number
  bestDayLabel: string
  bestDayCount: number
  streak: number
}

// ── Pure helpers ──────────────────────────────────────────────────────────────

const DAYS_ES_SHORT = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
const DAYS_ES_LONG  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_SHORT  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

export function countTasksFromLog(l: DailyLog): number {
  const hc: string[] = (l as any).habits_completed || []
  return [
    l.daily_objective_done      || hc.includes('daily_objective_done'),
    l.morning_done              || hc.includes('morning_done'),
    l.afternoon_done            || hc.includes('afternoon_done'),
    l.night_done                || hc.includes('night_done'),
    (l as any).ritual_done      || hc.includes('ritual_done'),
    (l as any).affirmation_done || hc.includes('affirmation_done'),
    (l as any).color_done       || hc.includes('color_done'),
    (l as any).foods_done       || hc.includes('foods_done'),
    (l as any).biohack_done     || hc.includes('biohack_done'),
  ].filter(Boolean).length
}

export function buildWeeklySummary(logs: DailyLog[], currentStreak: number): WeeklySummaryData | null {
  const monday = new Date(); monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const lastMonday = new Date(monday); lastMonday.setDate(lastMonday.getDate() - 7)
  const lastSunday = new Date(monday); lastSunday.setDate(lastSunday.getDate() - 1)

  const weekDates: string[] = []
  const d = new Date(lastMonday)
  while (d <= lastSunday) { weekDates.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1) }

  const weekLogs = logs.filter(l => weekDates.includes(l.date))
  if (weekLogs.length === 0) return null

  const logMap = Object.fromEntries(weekLogs.map(l => [l.date, countTasksFromLog(l)]))
  const totalTasks = weekDates.reduce((s, date) => s + (logMap[date] ?? 0), 0)
  const daysActive = weekDates.filter(date => (logMap[date] ?? 0) > 0).length
  const pct = Math.round((totalTasks / (7 * 9)) * 100)

  let bestDate = weekDates[0], bestCount = 0
  weekDates.forEach(date => { if ((logMap[date] ?? 0) > bestCount) { bestCount = logMap[date] ?? 0; bestDate = date } })
  const bestDayLabel = DAYS_ES_LONG[new Date(bestDate + 'T12:00:00').getDay()]

  const weekLabel = `${lastMonday.getDate()} ${MONTHS_SHORT[lastMonday.getMonth()]} — ${lastSunday.getDate()} ${MONTHS_SHORT[lastSunday.getMonth()]}`

  return { weekLabel, totalTasks, daysActive, pct, bestDayLabel, bestDayCount: bestCount, streak: currentStreak }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useStats(
  allLogs: DailyLog[],
  profile: UserProfile | null,
  todayStr: string,
  todayCount: number,
  energyLevel: number | null,
) {
  return useMemo(() => {
    if (!profile) return null

    const logMap: Record<string, DailyLog> = Object.fromEntries(allLogs.map(l => [l.date, l]))

    // ── Plan day ──────────────────────────────────────────────────────────────
    const planDuration  = profile.plan_duration ?? 30
    const planStartDate = profile.plan_start_date ?? profile.created_at.split('T')[0]
    const planStart     = new Date(planStartDate + 'T12:00:00')
    const today         = new Date(todayStr + 'T12:00:00')
    const planDay       = Math.floor((today.getTime() - planStart.getTime()) / 86400000) + 1
    const planDaysLeft  = planDuration - planDay + 1
    const planComplete  = planDay > planDuration

    // ── Chart data (activation date → today) ─────────────────────────────────
    const activationStart = new Date(profile.created_at); activationStart.setHours(0, 0, 0, 0)
    const activationEnd   = new Date(todayStr + 'T00:00:00')
    const chartData: ChartPoint[] = []
    const cur = new Date(activationStart)
    let dayIdx = 1
    while (cur <= activationEnd) {
      const dateStr = cur.toISOString().split('T')[0]
      const isToday = dateStr === todayStr
      const count   = isToday ? todayCount : (() => { const l = logMap[dateStr]; return l ? countTasksFromLog(l) : 0 })()
      chartData.push({ dateStr, count, isToday, day: dayIdx++ })
      cur.setDate(cur.getDate() + 1)
    }

    // ── Streak ────────────────────────────────────────────────────────────────
    const lastIdx  = chartData.length - 1
    const startIdx = (chartData[lastIdx]?.count === 0 && chartData[lastIdx]?.isToday) ? lastIdx - 1 : lastIdx
    let streak = 0
    for (let i = startIdx; i >= 0; i--) { if (chartData[i].count > 0) streak++; else break }

    // ── Aggregate stats ───────────────────────────────────────────────────────
    const overallRate = chartData.length > 0
      ? Math.round(chartData.reduce((s, d) => s + d.count, 0) / (chartData.length * 9) * 100) : 0
    const perfectDays = chartData.filter(d => d.count === 9).length

    // ── Weekly ring data (last 7 days, oldest → newest) ───────────────────────
    const weeklyEnergyDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      const ds = d.toISOString().split('T')[0]
      return {
        label:   DAYS_ES_SHORT[d.getDay()],
        date:    d.getDate(),
        isToday: ds === todayStr,
        level:   ds === todayStr ? energyLevel : (logMap[ds]?.energy_level ?? null),
      }
    })

    const weeklyProgressDays: ProgressDay[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      const ds = d.toISOString().split('T')[0]
      const isToday = ds === todayStr
      const count   = isToday ? todayCount : (() => { const l = logMap[ds]; return l ? countTasksFromLog(l) : null })()
      return { label: DAYS_ES_SHORT[d.getDay()], date: d.getDate(), isToday, count }
    })

    return { planDay, planDaysLeft, planComplete, streak, overallRate, perfectDays, chartData, weeklyEnergyDays, weeklyProgressDays }
  }, [allLogs, profile, todayStr, todayCount, energyLevel])
}
