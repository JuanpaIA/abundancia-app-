import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { getPortalForDate } from './energeticPortals'
import { getLunarPhase } from './calculations'
import { LUNAR_PHASE_CONTENT } from './lunarPhaseContent'
import { ManifestationArea } from '../types'

// ── Mapeos de contexto ────────────────────────────────────────────────────────

const ZODIAC_ELEMENT: Record<string, 'fuego' | 'tierra' | 'aire' | 'agua'> = {
  aries: 'fuego', leo: 'fuego', sagitario: 'fuego',
  tauro: 'tierra', virgo: 'tierra', capricornio: 'tierra',
  geminis: 'aire', libra: 'aire', acuario: 'aire',
  cancer: 'agua', escorpio: 'agua', piscis: 'agua',
}

const ELEMENT_LINE: Record<'fuego' | 'tierra' | 'aire' | 'agua', string> = {
  fuego:  'Tu energía de fuego amplifica cada intención que declares hoy.',
  tierra: 'Tu energía de tierra convierte las intenciones en realidad concreta.',
  aire:   'Tu energía mental conecta las señales del cosmos con tu acción.',
  agua:   'Tu intuición está en su punto más alto — confía en lo que sientes.',
}

const AREA_KEYWORD: Record<ManifestationArea, string> = {
  dinero:    'abundancia',
  amor:      'amor',
  salud:     'vitalidad',
  proposito: 'propósito',
  felicidad: 'felicidad',
}

const AREA_RESCUE: Record<ManifestationArea, string> = {
  dinero:    'Tu plan de abundancia te espera — incluso 5 minutos hoy mantiene tu vibración activa.',
  amor:      'Tu plan de amor te espera — un pequeño paso hoy reaviva tu energía.',
  salud:     'Tu plan de vitalidad te espera — retoma hoy con una sola práctica.',
  proposito: 'Tu plan de propósito te espera — cada día sin acción aleja tu misión.',
  felicidad: 'Tu plan de felicidad te espera — vuelve hoy, aunque sea un momento.',
}

// ── Mensajes de mañana personalizados ────────────────────────────────────────

const AREA_MORNING: Record<ManifestationArea, string[]> = {
  dinero: [
    'Tu prosperidad se construye con constancia, no con suerte.',
    'Cada hábito cumplido hoy acerca el dinero a tu vida.',
    'La abundancia financiera es tuya — el sistema te muestra el camino.',
    'Hoy tienes en tus manos todo lo que necesitas para atraer prosperidad.',
    'Un día más de disciplina es un día más cerca de tu libertad financiera.',
    'Tu energía financiera está en su punto más alto cuando actúas.',
    'El dinero fluye hacia quienes tienen claridad y acción diaria.',
  ],
  amor: [
    'El amor que buscas empieza con la energía que cultivas hoy.',
    'Cada acción de hoy te acerca a la conexión que mereces.',
    'Tu corazón está listo para recibir — el universo también.',
    'Hoy es un día perfecto para abrirte al amor que ya viene hacia ti.',
    'La vibración del amor empieza en tu interior. Tu protocolo la eleva.',
    'Atrae lo que eres. Hoy, sé la versión más plena de ti.',
    'El amor responde a quienes se preparan para recibirlo.',
  ],
  salud: [
    'Tu cuerpo responde cuando le das la energía y atención que merece.',
    'Cada hábito cumplido hoy es una inversión en tu vitalidad.',
    'La salud no es un destino — es lo que construyes día a día.',
    'Hoy tu cuerpo está listo para recibir todo lo que le des.',
    'Una acción pequeña hoy crea el cuerpo que quieres mañana.',
    'Tu vitalidad está en tus manos — el protocolo de hoy la activa.',
    'La energía que necesitas está disponible. Hoy la despiertas.',
  ],
  proposito: [
    'Tu misión de vida no espera — cada día que actúas la acercas.',
    'Hoy tienes una oportunidad única de vivir alineado con tu propósito.',
    'El mundo necesita lo que solo tú puedes dar. Empieza hoy.',
    'Tu legado se construye en días como hoy — con acción y con fe.',
    'Vivir tu propósito no es un lujo — es tu derecho. Reclámalo hoy.',
    'Cada paso en tu protocolo te acerca a la vida que viniste a vivir.',
    'Tu propósito ya existe — hoy solo tienes que caminarlo.',
  ],
  felicidad: [
    'La paz y la alegría que buscas están más cerca de lo que crees.',
    'Hoy es un nuevo comienzo. Todo lo que quieres está al alcance de tu mano.',
    'La felicidad no espera al futuro — se construye en momentos como este.',
    'Tu bienestar importa. Hoy, dedica tiempo a lo que te hace florecer.',
    'Un día bien vivido es la base de una vida feliz. Empieza ahora.',
    'La alegría fluye cuando actúas desde la intención. Tu protocolo te guía.',
    'Hoy puedes elegir la versión más plena de ti.',
  ],
}

// ── Interfaz de perfil ────────────────────────────────────────────────────────

export interface MorningProfile {
  full_name: string
  manifestation_area: ManifestationArea
  plan_start_date: string | null
  zodiac_sign: string
}

export function buildMorningMessage(
  profile: MorningProfile,
  targetDate: Date,
): { title: string; body: string } {
  const firstName = profile.full_name.split(' ')[0]
  const area = profile.manifestation_area
  const messages = AREA_MORNING[area]

  const planStart = profile.plan_start_date
    ? new Date(profile.plan_start_date + 'T00:00:00')
    : new Date()
  const dayIndex = Math.max(0, Math.floor(
    (targetDate.getTime() - planStart.getTime()) / 86400000
  ))
  const planDay = dayIndex + 1

  const phase = getLunarPhase(targetDate)
  const element = ZODIAC_ELEMENT[profile.zodiac_sign] ?? 'tierra'
  const elementLine = ELEMENT_LINE[element]
  const motiveLine = messages[dayIndex % messages.length]

  return {
    title: `🌅 Buenos días, ${firstName}`,
    body: `Día ${planDay} de tu plan. ${motiveLine} ${elementLine} Tu protocolo de hoy está listo — ábrelo y avanza.`,
  }
}

// ── Canal Android ─────────────────────────────────────────────────────────────

const CHANNEL_ID = 'abundancia-alerts'
const RESCUE_TITLE = '🌙 Tu plan te espera'

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Portales y Fases Lunares',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#C9A84C',
  })
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

// ── Programador principal ─────────────────────────────────────────────────────

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

    // Portal energético (9 AM) — sin cambios
    const portal = getPortalForDate(dayRef)
    if (portal) {
      toSchedule.push({
        title: `${portal.emoji} Portal Energético Activo`,
        body: `${portal.name.split('—')[0].trim()} — Hoy el universo amplifica tu energía de ${areaWord}. Abre tu app y activa tu intención.`,
        triggerDate: d9,
      })
    }

    // Fase lunar clave — personalizada con área (solo primer día)
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
  // Se programa 48 h hacia adelante normalizada a las 9 AM.
  // Cada vez que el usuario abre la app se cancela y reprograma.
  // Si no abre en 2 días, se dispara sola.
  if (profile) {
    const rescueDate = new Date(today)
    rescueDate.setDate(rescueDate.getDate() + 2)
    rescueDate.setHours(9, 0, 0, 0)
    if (rescueDate > now) {
      const firstName = profile.full_name.split(' ')[0]
      const rescueBody = AREA_RESCUE[profile.manifestation_area]
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${firstName}, tu plan te necesita 🌙`,
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

// ── Notificación semanal de patrones de hábitos ───────────────────────────────

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

const WEEKLY_PATTERN_TITLE = '🔍 Patrón de hábitos detectado'

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
