import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { Colors, Spacing, Radius } from '../constants/theme'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { getPortalForDate } from '../utils/energeticPortals'
import { getLunarPhase } from '../utils/calculations'
import { LUNAR_PHASE_CONTENT } from '../utils/lunarPhaseContent'
import { buildMorningMessage, MorningProfile } from '../utils/notifications'

interface Props { onBack: () => void }

interface NotifItem {
  id: string
  title: string
  body: string
  triggerDate: Date | null
  isDaily: boolean
  dailyHour?: number
  isPast?: boolean
  dayLabel?: string   // 'Hoy' | 'Ayer' | 'lunes 4 may' …
}

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const DAYS_ES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

function formatTime(d: Date): string {
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
}

function formatUpcoming(d: Date): string {
  const now = new Date(); now.setHours(0,0,0,0)
  const target = new Date(d); target.setHours(0,0,0,0)
  const diff = Math.round((target.getTime() - now.getTime()) / 86400000)
  const time = formatTime(d)
  if (diff === 0) return `Hoy · ${time}`
  if (diff === 1) return `Mañana · ${time}`
  return `${DAYS_ES[d.getDay()]} ${d.getDate()} ${MONTHS_ES[d.getMonth()]} · ${time}`
}

function dayHeader(offset: number, date: Date): string {
  if (offset === 0)  return 'Hoy'
  if (offset === -1) return 'Ayer'
  return `${DAYS_ES[date.getDay()]} ${date.getDate()} ${MONTHS_ES[date.getMonth()]}`
}

function categoryColor(title: string): string {
  if (title.includes('🌑') || title.includes('🌕')) return '#7B6FD7'
  if (title.includes('Portal') || title.includes('⚡')) return '#C9A84C'
  if (title.includes('🌙') || title.includes('⏰')) return '#4CAF82'
  return Colors.textSecondary
}

function categoryLabel(title: string): string {
  if (title.includes('🌑') || title.includes('🌕')) return 'Fase lunar'
  if (title.includes('Portal') || title.includes('⚡')) return 'Portal energético'
  if (title.includes('🌙 Cierre')) return 'Recordatorio nocturno'
  if (title.includes('⏰')) return 'Recordatorio de tarde'
  return 'Notificación'
}

// ── Genera ventana deslizante de 3 días de recordatorios + eventos próximos ──

function buildItems(profile: MorningProfile | undefined, planStartDate: string | null | undefined): NotifItem[] {
  const now = new Date()
  const items: NotifItem[] = []
  const planStart = planStartDate ? new Date(planStartDate + 'T00:00:00') : null

  // Recordatorios diarios — ventana -2 … 0 (hoy)
  const SLOTS = [
    { hour: 8,  buildTitle: (p?: MorningProfile) => p ? `🌅 Buenos días, ${p.full_name.split(' ')[0]}` : '🌅 Recordatorio de mañana',
                buildBody:  (p?: MorningProfile, d?: Date) => p && d ? buildMorningMessage(p, d).body : 'Tu protocolo de hoy está listo — ábrelo y avanza.' },
    { hour: 14, buildTitle: () => '⏰ Recordatorio de tarde',
                buildBody:  () => '¿Ya revisaste tus actividades de hoy? Cada tarea completada te acerca a tu objetivo. Ábrela y avanza.' },
    { hour: 20, buildTitle: () => '🌙 Cierre del día',
                buildBody:  () => 'Antes de descansar, completa tu protocolo. Tu constancia diaria es la fuerza que convierte tus intenciones en realidad.' },
  ]

  for (let offset = -2; offset <= 0; offset++) {
    const day = new Date(now)
    day.setDate(day.getDate() + offset)
    day.setHours(0, 0, 0, 0)

    // No mostrar días anteriores al inicio del plan
    if (planStart && day < planStart) continue

    const label = dayHeader(offset, day)

    SLOTS.forEach((slot, idx) => {
      const triggerDate = new Date(day)
      triggerDate.setHours(slot.hour, 0, 0, 0)
      items.push({
        id: `daily-${offset}-${idx}`,
        title: slot.buildTitle(profile),
        body:  slot.buildBody(profile, day),
        triggerDate,
        isDaily: true,
        dailyHour: slot.hour,
        isPast: triggerDate < now,
        dayLabel: label,
      })
    })
  }

  // Eventos de portales y fases lunares — próximos 90 días
  for (let i = 0; i <= 90; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    d.setHours(9, 0, 0, 0)
    if (d <= now) continue

    const dayRef = new Date(d); dayRef.setHours(0, 0, 0, 0)

    const portal = getPortalForDate(dayRef)
    if (portal) {
      items.push({
        id: `portal-${i}`,
        title: `${portal.emoji} Portal Energético Activo`,
        body: `${portal.name.split('—')[0].trim()} — Hoy el universo amplifica tu energía. Abre tu app y activa tu intención.`,
        triggerDate: new Date(d),
        isDaily: false,
        isPast: false,
      })
    }

    const phase = getLunarPhase(dayRef)
    const content = LUNAR_PHASE_CONTENT[phase]
    if (content.isKeyPhase) {
      const prev = new Date(dayRef); prev.setDate(prev.getDate() - 1)
      if (getLunarPhase(prev) !== phase) {
        items.push({
          id: `lunar-${i}`,
          title: phase === 'nueva' ? '🌑 Luna Nueva — El cosmos siembra contigo' : '🌕 Luna Llena — Celebra tu cosecha',
          body: phase === 'nueva'
            ? 'Hoy es el momento más poderoso para sembrar tus intenciones. Abre tu app y declara lo que manifiestas.'
            : 'La luna brilla en su plenitud. Celebra lo que has manifestado y libera lo que ya no te sirve.',
          triggerDate: new Date(d),
          isDaily: false,
          isPast: false,
        })
      }
    }
  }

  return items
}

// ──────────────────────────────────────────────────────────────────────────────

export function NotificationsScreen({ onBack }: Props) {
  const { profile } = useAuth()
  const [items, setItems]   = useState<NotifItem[]>([])
  const [loading, setLoading] = useState(true)

  const morningProfile: MorningProfile | undefined = profile ? {
    full_name: profile.full_name,
    manifestation_area: profile.manifestation_area,
    plan_start_date: profile.plan_start_date ?? null,
    zodiac_sign: profile.zodiac_sign,
  } : undefined

  const isFirstDay = (() => {
    if (!profile?.plan_start_date) return false
    const start = new Date(profile.plan_start_date + 'T00:00:00')
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return start.getTime() === today.getTime()
  })()

  useEffect(() => {
    // Esperar a que el perfil esté disponible para evitar el flash en usuarios nuevos
    if (!profile) return

    if (Platform.OS === 'web') {
      const all = buildItems(morningProfile, profile.plan_start_date)
      const daily   = isFirstDay ? [] : all.filter(n => n.isDaily)
      const oneTime = all.filter(n => !n.isDaily).sort((a, b) => a.triggerDate!.getTime() - b.triggerDate!.getTime())
      setItems([...daily, ...oneTime])
      setLoading(false)
      return
    }

    // Nativo: construimos los recordatorios diarios igual que en web
    // (las notificaciones ya disparadas no aparecen en getAllScheduledNotificationsAsync)
    const dailyItems: NotifItem[] = isFirstDay ? [] :
      buildItems(morningProfile, profile.plan_start_date).filter(n => n.isDaily)

    Notifications.getAllScheduledNotificationsAsync().then(scheduled => {
      const oneTime: NotifItem[] = []
      for (const n of scheduled) {
        const trigger = n.trigger as any
        const isDaily = trigger?.type === 'daily' || trigger?.repeats === true
        if (isDaily) continue  // los diarios los manejamos con buildItems

        const triggerDate = trigger?.value
          ? new Date(trigger.value)
          : trigger?.date
            ? new Date(trigger.date)
            : null
        if (!triggerDate) continue

        oneTime.push({
          id: n.identifier,
          title: (n.content.title as string) ?? '',
          body:  (n.content.body  as string) ?? '',
          triggerDate,
          isDaily: false,
          isPast: false,
        })
      }

      oneTime.sort((a, b) => a.triggerDate!.getTime() - b.triggerDate!.getTime())
      setItems([...dailyItems, ...oneTime])
      setLoading(false)
    })
  }, [profile?.id, isFirstDay])

  // Agrupar recordatorios diarios por dayLabel
  const daily   = items.filter(n => n.isDaily)
  const oneTime = items.filter(n => !n.isDaily)

  // Grupos: ['Hoy', 'Ayer', ...]
  const dayGroups: { label: string; items: NotifItem[] }[] = []
  for (const item of daily) {
    const label = item.dayLabel ?? 'Hoy'
    const existing = dayGroups.find(g => g.label === label)
    if (existing) existing.items.push(item)
    else dayGroups.unshift({ label, items: [item] }) // más reciente primero
  }
  // Ordenar: Hoy primero, luego Ayer, etc.
  dayGroups.sort((a, b) => {
    const order = ['Hoy', 'Ayer']
    const ai = order.indexOf(a.label)
    const bi = order.indexOf(b.label)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return 0
  })
  // Dentro de cada grupo: 8pm arriba → 2pm → 8am abajo
  dayGroups.forEach(g => {
    g.items.sort((a, b) => (b.dailyHour ?? 0) - (a.dailyHour ?? 0))
  })

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🔔 Centro de notificaciones</Text>
          <Text style={styles.subtitle}>Alertas programadas para mantener tu práctica diaria</Text>
        </View>

        {loading && <ActivityIndicator color={Colors.gold} style={{ marginTop: 40 }} />}

        {/* Banner Día 1 */}
        {!loading && isFirstDay && (
          <Card style={styles.firstDayCard}>
            <Text style={styles.firstDayEmoji}>🌅</Text>
            <Text style={styles.firstDayTitle}>Bienvenida a tu plan</Text>
            <Text style={styles.firstDayBody}>
              Tus recordatorios diarios están activados y llegarán automáticamente:
            </Text>
            <View style={styles.firstDaySchedule}>
              <Text style={styles.firstDayHour}>🌅 08:00 — Arranque de mañana</Text>
              <Text style={styles.firstDayHour}>⏰ 14:00 — Recordatorio de tarde</Text>
              <Text style={styles.firstDayHour}>🌙 20:00 — Cierre del día</Text>
            </View>
            <Text style={styles.firstDayFooter}>
              A partir de mañana verás aquí el historial de alertas y los próximos eventos especiales.
            </Text>
          </Card>
        )}

        {!loading && !isFirstDay && items.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Sin notificaciones programadas</Text>
            <Text style={styles.emptyBody}>
              Las notificaciones se programan al abrir la app. Asegúrate de haber otorgado permisos en la configuración de tu dispositivo.
            </Text>
          </Card>
        )}

        {/* Recordatorios diarios agrupados por día */}
        {dayGroups.length > 0 && (
          <>
            <Text style={styles.groupLabel}>RECORDATORIOS DIARIOS</Text>
            {dayGroups.map(group => (
              <View key={group.label}>
                <Text style={styles.dayHeader}>{group.label}</Text>
                {group.items.map(n => (
                  <Card key={n.id} style={[styles.notifCard, n.isPast && styles.notifCardPast]}>
                    <View style={styles.notifRow}>
                      <View style={[styles.categoryPill, { borderColor: categoryColor(n.title) }]}>
                        <Text style={[styles.categoryText, { color: categoryColor(n.title) }]}>
                          {categoryLabel(n.title)}
                        </Text>
                      </View>
                      {n.isPast
                        ? <Text style={styles.sentBadge}>✓ Enviada</Text>
                        : <Text style={styles.repeatBadge}>Próxima</Text>
                      }
                    </View>
                    <Text style={[styles.notifTitle, n.isPast && styles.notifTitlePast]}>{n.title}</Text>
                    {!n.isPast && <Text style={styles.notifBody}>{n.body}</Text>}
                    <View style={styles.timeRow}>
                      <Text style={styles.timeIcon}>🕐</Text>
                      <Text style={[styles.timeText, n.isPast && styles.timeTextPast]}>
                        {n.triggerDate ? formatTime(n.triggerDate) : '–'}
                      </Text>
                    </View>
                  </Card>
                ))}
              </View>
            ))}
          </>
        )}

        {/* Próximos eventos */}
        {oneTime.length > 0 && (
          <>
            <Text style={styles.groupLabel}>PRÓXIMOS EVENTOS</Text>
            {oneTime.slice(0, 30).map(n => (
              <Card key={n.id} style={styles.notifCard}>
                <View style={styles.notifRow}>
                  <View style={[styles.categoryPill, { borderColor: categoryColor(n.title) }]}>
                    <Text style={[styles.categoryText, { color: categoryColor(n.title) }]}>
                      {categoryLabel(n.title)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.notifTitle}>{n.title}</Text>
                <Text style={styles.notifBody}>{n.body}</Text>
                <View style={styles.timeRow}>
                  <Text style={styles.timeIcon}>🕐</Text>
                  <Text style={styles.timeText}>
                    {n.triggerDate ? formatUpcoming(n.triggerDate) : '–'}
                  </Text>
                </View>
              </Card>
            ))}
            {oneTime.length > 30 && (
              <Text style={styles.moreText}>+ {oneTime.length - 30} eventos más en los próximos 90 días</Text>
            )}
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60 },

  header: { marginBottom: Spacing.xl, gap: Spacing.xs },
  back:   { color: Colors.gold, fontSize: 15, marginBottom: Spacing.sm },
  title:  { fontSize: 24, color: Colors.textPrimary, fontWeight: '700' },
  subtitle: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  groupLabel: {
    fontSize: 11, color: Colors.textSecondary, fontWeight: '700',
    letterSpacing: 1, marginBottom: Spacing.xs, marginTop: Spacing.md,
  },
  dayHeader: {
    fontSize: 12, color: Colors.gold, fontWeight: '700',
    letterSpacing: 0.5, marginBottom: Spacing.xs, marginTop: Spacing.sm,
    textTransform: 'uppercase',
  },

  notifCard:     { marginBottom: Spacing.xs, gap: Spacing.xs },
  notifCardPast: { opacity: 0.6 },
  notifRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  categoryPill: {
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  categoryText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },

  repeatBadge: {
    fontSize: 10, color: '#4CAF82', fontWeight: '600',
    backgroundColor: 'rgba(76,175,130,0.12)',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },
  sentBadge: {
    fontSize: 10, color: Colors.textSecondary, fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10,
  },

  notifTitle:     { fontSize: 14, color: Colors.textPrimary, fontWeight: '700', lineHeight: 20 },
  notifTitlePast: { color: Colors.textSecondary },
  notifBody:      { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  timeRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  timeIcon:     { fontSize: 11 },
  timeText:     { fontSize: 12, color: Colors.gold, fontWeight: '600' },
  timeTextPast: { color: Colors.textSecondary },

  emptyCard:  { gap: Spacing.sm, marginTop: Spacing.xl },
  emptyTitle: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700' },
  emptyBody:  { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  moreText: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm },

  firstDayCard: { gap: Spacing.sm, marginTop: Spacing.sm, alignItems: 'center', paddingVertical: Spacing.xl },
  firstDayEmoji: { fontSize: 40 },
  firstDayTitle: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  firstDayBody: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  firstDaySchedule: {
    gap: 6, width: '100%',
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderRadius: 10, padding: Spacing.md,
    marginVertical: Spacing.xs,
  },
  firstDayHour:   { fontSize: 13, color: Colors.gold, fontWeight: '600' },
  firstDayFooter: { fontSize: 12, color: Colors.textDisabled, textAlign: 'center', lineHeight: 18 },
})
