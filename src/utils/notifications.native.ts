// Native implementation — expo-notifications (iOS + Android).
// Swap trigger types or add categories here; callers never change.

import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { getPortalForDate, getLunarPhase, LUNAR_PHASE_CONTENT } from '@lumina/core'
import {
  MorningProfile,
  buildMorningMessage,
  AREA_MORNING,
  AREA_RESCUE,
} from './notifications'

// ── Private constants ─────────────────────────────────────────────────────────

const CHANNEL_ID        = 'abundancia-alerts'
const WEEKLY_PATTERN_TITLE = '🔍 Patrón de hábitos detectado'

const AREA_KEYWORD: Record<string, string> = {
  dinero:    'abundancia',
  amor:      'amor',
  salud:     'vitalidad',
  proposito: 'propósito',
  felicidad: 'felicidad',
}

const HABIT_NAMES: Record<string, string> = {
  daily_objective_done: 'Objetivo del día',
  morning_done:         'Protocolo de mañana',
  afternoon_done:       'Protocolo de tarde',
  night_done:           'Protocolo de noche',
  ritual_done:          'Ritual del día',
  affirmation_done:     'Afirmación del día',
  color_done:           'Color del día',
  foods_done:           'Alimentos del día',
  biohack_done:         'Estrategia Biohack',
}

// ── Canal Android ─────────────────────────────────────────────────────────────

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Portales y Fases Lunares',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#C9A84C',
  })
}

// ── Exported functions ────────────────────────────────────────────────────────

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

export async function scheduleAbundanciaNotifications(profile?: MorningProfile): Promise<void> {
  const granted = await requestNotificationPermissions()
  if (!granted) return

  await ensureAndroidChannel()
  await Notifications.cancelAllScheduledNotificationsAsync()

  const now = new Date()
  const today = new Date(now); today.setHours(0, 0, 0, 0)

  // ── 1. Notificación de mañana — DAILY (1 slot) ────────────────────────────
  if (profile) {
    const { title, body } = buildMorningMessage(profile, today)
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    })
  }

  // ── 2. Portales y fases lunares clave (próximos 60 días) ──────────────────
  const toSchedule: Array<{ title: string; body: string; triggerDate: Date }> = []
  const firstName = profile?.full_name.split(' ')[0] ?? ''
  const area = profile?.manifestation_area ?? 'dinero'
  const areaWord = AREA_KEYWORD[area]

  for (let i = 0; i <= 60; i++) {
    const dayRef = new Date(today)
    dayRef.setDate(dayRef.getDate() + i)

    const d9 = new Date(dayRef); d9.setHours(9, 0, 0, 0)
    if (d9 <= now) continue

    const portal = getPortalForDate(dayRef)
    if (portal) {
      toSchedule.push({
        title: `${portal.emoji} Portal Energético Activo`,
        body: `${portal.name.split('—')[0].trim()} — Hoy el universo amplifica tu energía de ${areaWord}. Abre tu app y activa tu intención.`,
        triggerDate: d9,
      })
    }

    const phase = getLunarPhase(dayRef)
    const content = LUNAR_PHASE_CONTENT[phase]
    if (content.isKeyPhase) {
      const prev = new Date(dayRef); prev.setDate(prev.getDate() - 1)
      if (getLunarPhase(prev) !== phase) {
        const isNueva = phase === 'nueva'
        toSchedule.push({
          title: isNueva
            ? '🌑 Luna Nueva — El cosmos siembra contigo'
            : '🌕 Luna Llena — Celebra tu cosecha',
          body: isNueva
            ? `${firstName ? firstName + ', este' : 'Este'} es el momento más poderoso para sembrar tu intención de ${areaWord}. Declara hoy lo que manifiestas — el universo está escuchando.`
            : `${firstName ? firstName + ', la' : 'La'} luna brilla en su plenitud e ilumina tu camino de ${areaWord}. Celebra lo que has construido y libera lo que ya no te sirve.`,
          triggerDate: d9,
        })
      }
    }
  }

  for (const { title, body, triggerDate } of toSchedule) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    })
  }

  // ── 3. Recordatorios diarios — DAILY (2 slots) ───────────────────────────
  const dailyReminders = [
    {
      hour: 14,
      title: '⏰ Recordatorio de tarde',
      body: '¿Ya revisaste tus actividades de hoy? Cada tarea completada te acerca a tu objetivo de manifestación. Ábrela y avanza.',
    },
    {
      hour: 20,
      title: '🌙 Cierre del día',
      body: 'Antes de descansar, completa tu protocolo. Tu constancia diaria es la fuerza que convierte tus intenciones en realidad.',
    },
  ]

  for (const { hour, title, body } of dailyReminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
      },
    })
  }

  // ── 4. Notificación de rescate — dead man's switch (1 slot) ──────────────
  if (profile) {
    const rescueDate = new Date(today)
    rescueDate.setDate(rescueDate.getDate() + 2)
    rescueDate.setHours(9, 0, 0, 0)
    if (rescueDate > now) {
      const rescueName = profile.full_name.split(' ')[0]
      const rescueBody = AREA_RESCUE[profile.manifestation_area]
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${rescueName}, tu plan te necesita 🌙`,
          body: rescueBody,
          sound: true,
          ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: rescueDate,
        },
      })
    }
  }
}

export async function scheduleWeeklyPatternNotification(
  recentLogs: Record<string, any>[]
): Promise<void> {
  const granted = await requestNotificationPermissions()
  if (!granted) return

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (i + 1))
    return d.toISOString().split('T')[0]
  })

  const weekLogs = recentLogs.filter((l: any) => last7Dates.includes(l.date))
  if (weekLogs.length < 3) return

  const neverDone = Object.keys(HABIT_NAMES).filter(field =>
    weekLogs.every(log => !(log as any)[field])
  )
  if (neverDone.length === 0) return

  const names = neverDone.slice(0, 3).map(f => HABIT_NAMES[f])
  const listStr = names.length === 1
    ? names[0]
    : names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1]
  const extra = neverDone.length > 3 ? ` (+${neverDone.length - 3} más)` : ''
  const body = `Esta semana no completaste: ${listStr}${extra}. Abre tu app, elige uno y retómalo hoy.`

  await ensureAndroidChannel()
  const existing = await Notifications.getAllScheduledNotificationsAsync()
  for (const n of existing) {
    if (n.content.title === WEEKLY_PATTERN_TITLE) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier)
    }
  }

  const nextSunday = new Date(today)
  const daysUntil = (7 - nextSunday.getDay()) % 7 || 7
  nextSunday.setDate(nextSunday.getDate() + daysUntil)
  nextSunday.setHours(9, 0, 0, 0)
  if (nextSunday <= new Date()) return

  await Notifications.scheduleNotificationAsync({
    content: {
      title: WEEKLY_PATTERN_TITLE,
      body,
      sound: true,
      ...(Platform.OS === 'android' && { channelId: CHANNEL_ID }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextSunday,
    },
  })
}
