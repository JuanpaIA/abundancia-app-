import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native'
import { supabase } from '../services/supabase'
import { Colors, Spacing, Radius } from '../constants/theme'
import { ScreenBackground } from '../components/ui/ScreenBackground'
import { ManifestationArea } from '@lumina/core'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RawProfile {
  id: string
  full_name: string
  email: string
  manifestation_area: ManifestationArea
  plan_start_date: string | null
  plan_duration: number | null
  numerology_number: number
  created_at: string
  is_admin: boolean
}

interface RawLog {
  user_id: string
  date: string
  daily_objective_done: boolean
  morning_done: boolean
  afternoon_done: boolean
  night_done: boolean
  ritual_done: boolean
  affirmation_done: boolean
  color_done: boolean
  foods_done: boolean
  biohack_done: boolean
}

interface AdminUser extends RawProfile {
  planDay: number
  planDuration: number
  lastActiveDate: string | null
  daysSinceActive: number
  completionRate: number
  totalDaysLogged: number
  isActive: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AREA_EMOJI: Record<ManifestationArea, string> = {
  dinero: '💰', amor: '💗', salud: '✨', proposito: '🔮', felicidad: '🌟',
}

const AREA_LABEL: Record<ManifestationArea, string> = {
  dinero: 'Dinero', amor: 'Amor', salud: 'Salud', proposito: 'Propósito', felicidad: 'Felicidad',
}

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(d: string): string {
  const dt = new Date(d + 'T12:00:00')
  return `${dt.getDate()} ${MONTHS_ES[dt.getMonth()]}`
}

function getPlanDay(startDate: string | null): number {
  if (!startDate) return 0
  const start = new Date(startDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - start.getTime()) / 86400000) + 1
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - d.getTime()) / 86400000)
}

function countTasks(log: RawLog): number {
  return [
    log.daily_objective_done, log.morning_done, log.afternoon_done,
    log.night_done, log.ritual_done, log.affirmation_done,
    log.color_done, log.foods_done, log.biohack_done,
  ].filter(Boolean).length
}

function buildAdminUser(profile: RawProfile, logs: RawLog[]): AdminUser {
  const userLogs = logs.filter(l => l.user_id === profile.id)
  const sortedDates = userLogs.map(l => l.date).sort().reverse()
  const lastActiveDate = sortedDates[0] || null
  const totalDays = userLogs.length
  const totalTasks = userLogs.reduce((sum, l) => sum + countTasks(l), 0)
  const completionRate = totalDays > 0 ? Math.round((totalTasks / (totalDays * 9)) * 100) : 0
  // Si nunca ha registrado actividad, medir desde que se registró
  const referenceDate = lastActiveDate ?? profile.created_at.split('T')[0]
  const dsa = daysSince(referenceDate)

  return {
    ...profile,
    planDay: getPlanDay(profile.plan_start_date),
    planDuration: profile.plan_duration ?? 30,
    lastActiveDate,
    daysSinceActive: dsa,
    completionRate,
    totalDaysLogged: totalDays,
    isActive: dsa <= 3,
  }
}

async function sendInAppNotification(user: AdminUser | null): Promise<void> {
  const title = user
    ? `${user.full_name.split(' ')[0]}, tu protocolo te espera ✦`
    : '✦ Un mensaje de Lúmina para ti'
  const body = user
    ? user.lastActiveDate === null
      ? `Tu plan de ${AREA_LABEL[user.manifestation_area]} está listo desde el día 1. Ábrelo hoy — cada práctica que completes transforma tu energía.`
      : `Llevas ${user.daysSinceActive} día${user.daysSinceActive !== 1 ? 's' : ''} sin entrar. Tu plan de ${AREA_LABEL[user.manifestation_area]} está en el día ${user.planDay}. Cada día que retomas suma — ábrela ahora.`
    : 'Recuerda abrir Lúmina hoy y avanzar en tu protocolo. Tu abundancia te espera.'
  const { error } = await supabase.from('admin_notifications').insert({
    title,
    body,
    target_user_id: user?.id ?? null,
  })
  if (error) {
    Alert.alert('Error', error.message)
  } else {
    Alert.alert(
      '✓ Notificación enviada',
      user
        ? `${user.full_name} la verá la próxima vez que abra la app.`
        : 'Todos los usuarios la verán la próxima vez que abran la app.'
    )
  }
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface FeedbackItem {
  id: string
  user_id: string
  message: string
  created_at: string
  userName: string
  userEmail: string
}

interface ErrorReport {
  id: string
  user_id: string | null
  section: string
  error_message: string
  error_details: string | null
  app_context: Record<string, any> | null
  resolved: boolean
  created_at: string
  userName: string
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Filter = 'todos' | 'activos' | 'ausentes'
type AdminTab = 'usuarios' | 'sugerencias' | 'errores'

interface Props {
  onBack: () => void
  onPreviewWeeklySummary: () => void
}

export function AdminScreen({ onBack, onPreviewWeeklySummary }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<Filter>('todos')
  const [tab, setTab] = useState<AdminTab>('usuarios')
  const [sendingAll, setSendingAll] = useState(false)
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'active' | 'inactive'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newName, setNewName] = useState('')
  const [newPlanType, setNewPlanType] = useState<'monthly' | 'annual'>('monthly')
  const [newStatus, setNewStatus] = useState<'active' | 'inactive'>('inactive')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    const thirtyAgo = new Date()
    thirtyAgo.setDate(thirtyAgo.getDate() - 30)
    const since = thirtyAgo.toISOString().split('T')[0]

    const [profilesRes, logsRes, feedbackRes, errorsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, email, manifestation_area, plan_start_date, plan_duration, numerology_number, created_at, is_admin')
        .order('created_at', { ascending: false }),
      supabase
        .from('daily_logs')
        .select('user_id, date, daily_objective_done, morning_done, afternoon_done, night_done, ritual_done, affirmation_done, color_done, foods_done, biohack_done')
        .gte('date', since),
      supabase
        .from('feedback')
        .select('id, user_id, message, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('error_reports')
        .select('id, user_id, section, error_message, error_details, app_context, resolved, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (profilesRes.error || logsRes.error) {
      Alert.alert('Error', 'No se pudo cargar los datos de usuarios.')
      setLoading(false)
      setRefreshing(false)
      return
    }

    const profiles: RawProfile[] = profilesRes.data || []
    const logs: RawLog[] = logsRes.data || []
    const built = profiles.filter(p => !p.is_admin).map(p => buildAdminUser(p, logs))
    setUsers(built)

    const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]))
    const fb: FeedbackItem[] = (feedbackRes.data || []).map((f: any) => {
      const p = profileMap[f.user_id]
      return { ...f, userName: p?.full_name ?? 'Usuario desconocido', userEmail: p?.email ?? '' }
    })
    setFeedbacks(fb)

    const errs: ErrorReport[] = (errorsRes.data || []).map((e: any) => {
      const p = e.user_id ? profileMap[e.user_id] : null
      return { ...e, userName: p?.full_name ?? 'Usuario desconocido' }
    })
    setErrorReports(errs)

    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [load])

  const filtered = users.filter(u => {
    if (filter === 'activos') return u.isActive
    if (filter === 'ausentes') return !u.isActive
    return true
  })

  const totalActive = users.filter(u => u.isActive).length
  const totalAbsent = users.filter(u => !u.isActive).length

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onBack}>
              <Text style={styles.back}>← Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPreviewWeeklySummary}>
              <Text style={styles.previewBtn}>👁 Ver resumen semanal</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Panel Admin</Text>
          <Text style={styles.subtitle}>Vista general · solo tú ves esto</Text>
        </View>

        {/* Pestañas */}
        <View style={styles.tabRow}>
          {(['usuarios', 'sugerencias', 'errores'] as AdminTab[]).map(t => {
            const unresolved = errorReports.filter(e => !e.resolved).length
            const label = t === 'usuarios' ? `Usuarios (${users.length})`
              : t === 'sugerencias' ? `Sugerencias (${feedbacks.length})`
              : `Errores${unresolved > 0 ? ` (${unresolved})` : ''}`
            return (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive, t === 'errores' && unresolved > 0 && styles.tabBtnError]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive, t === 'errores' && unresolved > 0 && styles.tabTextError]}>
                  {label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.gold} size="large" style={{ marginTop: 60 }} />
        ) : tab === 'usuarios' ? (
          <>
            {/* Stats globales */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{users.length}</Text>
                <Text style={styles.statLabel}>Usuarios</Text>
              </View>
              <View style={[styles.statCard, styles.statCardGreen]}>
                <Text style={[styles.statNumber, { color: '#4CAF82' }]}>{totalActive}</Text>
                <Text style={styles.statLabel}>Activos</Text>
                <Text style={styles.statSub}>últimos 3 días</Text>
              </View>
              <View style={[styles.statCard, styles.statCardRed]}>
                <Text style={[styles.statNumber, { color: '#E05555' }]}>{totalAbsent}</Text>
                <Text style={styles.statLabel}>Ausentes</Text>
                <Text style={styles.statSub}>+3 días sin entrar</Text>
              </View>
            </View>

            {/* Agregar usuario */}
            <TouchableOpacity
              style={styles.addUserBtn}
              onPress={() => { setNewEmail(''); setNewPassword(''); setNewName(''); setNewPlanType('monthly'); setNewStatus('inactive'); setCreateOpen(true) }}
              activeOpacity={0.8}
            >
              <Text style={styles.addUserText}>＋ Agregar usuario manual</Text>
            </TouchableOpacity>

            {/* Broadcast por grupo */}
            <View style={styles.broadcastRow}>
              {([
                { target: 'all' as const, label: '📣 Todos', count: users.length },
                { target: 'active' as const, label: '✓ Activos', count: totalActive },
                { target: 'inactive' as const, label: '✗ Ausentes', count: totalAbsent },
              ]).map(({ target, label, count }) => (
                <TouchableOpacity
                  key={target}
                  style={styles.broadcastBtn}
                  onPress={() => { setBroadcastTarget(target); setBroadcastTitle(''); setBroadcastBody(''); setBroadcastOpen(true) }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.broadcastBtnLabel}>{label}</Text>
                  <Text style={styles.broadcastBtnCount}>{count}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtros */}
            <View style={styles.filterRow}>
              {(['todos', 'activos', 'ausentes'] as Filter[]).map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Lista de usuarios */}
            {filtered.length === 0 ? (
              <Text style={styles.empty}>No hay usuarios en esta categoría.</Text>
            ) : (
              filtered.map(user => <UserCard key={user.id} user={user} onPlanUpdated={load} onDeleted={load} />)
            )}
          </>
        ) : tab === 'sugerencias' ? (
          <>
            {feedbacks.length === 0 ? (
              <Text style={styles.empty}>Aún no hay sugerencias.</Text>
            ) : (
              feedbacks.map(fb => (
                <View key={fb.id} style={styles.fbCard}>
                  <View style={styles.fbHeader}>
                    <View style={styles.fbUserInfo}>
                      <Text style={styles.fbName}>{fb.userName}</Text>
                      <Text style={styles.fbEmail}>{fb.userEmail}</Text>
                    </View>
                    <Text style={styles.fbDate}>{fmtDate(fb.created_at.split('T')[0])}</Text>
                  </View>
                  <Text style={styles.fbMessage}>{fb.message}</Text>
                </View>
              ))
            )}
          </>
        ) : (
          <ErrorReportsTab
            reports={errorReports}
            onResolve={async (id) => {
              await supabase.from('error_reports').update({ resolved: true }).eq('id', id)
              setErrorReports(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e))
            }}
          />
        )}
      </ScrollView>

      {/* Modal: broadcast por grupo */}
      <Modal visible={broadcastOpen} transparent animationType="slide" onRequestClose={() => setBroadcastOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>
              {broadcastTarget === 'all' ? '📣 Mensaje para todos'
                : broadcastTarget === 'active' ? '✓ Mensaje para usuarios activos'
                : '✗ Mensaje para usuarios ausentes'}
            </Text>
            <Text style={styles.modalTargetHint}>
              {broadcastTarget === 'all' ? `${users.length} usuarios`
                : broadcastTarget === 'active' ? `${totalActive} usuario${totalActive !== 1 ? 's' : ''} activos (últimos 3 días)`
                : `${totalAbsent} usuario${totalAbsent !== 1 ? 's' : ''} sin entrar en +3 días`}
            </Text>
            <Text style={styles.modalLabel}>Título</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Ej: ¡Nueva función disponible!"
              placeholderTextColor={Colors.textDisabled}
              value={broadcastTitle}
              onChangeText={setBroadcastTitle}
              maxLength={80}
            />
            <Text style={styles.modalLabel}>Mensaje</Text>
            <TextInput
              style={[styles.modalInput, styles.modalInputMulti]}
              placeholder="Escribe aquí el mensaje que verán los usuarios al abrir la app…"
              placeholderTextColor={Colors.textDisabled}
              value={broadcastBody}
              onChangeText={setBroadcastBody}
              multiline
              numberOfLines={4}
              maxLength={300}
            />
            <Text style={styles.modalHint}>{broadcastBody.length}/300</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setBroadcastOpen(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSendBtn, (!broadcastTitle.trim() || !broadcastBody.trim()) && { opacity: 0.4 }]}
                disabled={!broadcastTitle.trim() || !broadcastBody.trim() || broadcasting}
                onPress={async () => {
                  setBroadcasting(true)
                  const targetUsers = broadcastTarget === 'all' ? users
                    : broadcastTarget === 'active' ? users.filter(u => u.isActive)
                    : users.filter(u => !u.isActive)

                  const records = targetUsers.map(u => ({
                    title: broadcastTitle.trim(),
                    body: broadcastBody.trim(),
                    target_user_id: u.id,
                  }))

                  const { error } = await supabase.from('admin_notifications').insert(records)
                  setBroadcasting(false)
                  if (error) {
                    Alert.alert('Error', error.message)
                  } else {
                    setBroadcastOpen(false)
                    Alert.alert('✓ Enviado', `Mensaje enviado a ${targetUsers.length} usuario${targetUsers.length !== 1 ? 's' : ''}. Lo verán la próxima vez que abran la app.`)
                  }
                }}
              >
                <Text style={styles.modalSendText}>{broadcasting ? 'Enviando…' : 'Enviar mensaje'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Modal: crear usuario manual */}
      <Modal visible={createOpen} transparent animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalSheet} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>＋ Agregar usuario</Text>

            <Text style={styles.modalLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="correo@email.com"
              placeholderTextColor={Colors.textDisabled}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.modalLabel}>Contraseña</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.textDisabled}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text style={styles.modalLabel}>Nombre completo</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre Apellido"
              placeholderTextColor={Colors.textDisabled}
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.modalLabel}>Estado de suscripción</Text>
            <View style={styles.segmentRow}>
              {(['inactive', 'active'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.segmentBtn, newStatus === s && styles.segmentBtnActive]}
                  onPress={() => setNewStatus(s)}
                >
                  <Text style={[styles.segmentText, newStatus === s && styles.segmentTextActive]}>
                    {s === 'active' ? '✓ Activo' : '✗ Inactivo'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Tipo de plan</Text>
            <View style={styles.segmentRow}>
              {(['monthly', 'annual'] as const).map(k => (
                <TouchableOpacity
                  key={k}
                  style={[styles.segmentBtn, newPlanType === k && styles.segmentBtnActive]}
                  onPress={() => setNewPlanType(k)}
                >
                  <Text style={[styles.segmentText, newPlanType === k && styles.segmentTextActive]}>
                    {k === 'monthly' ? 'Mensual $14' : 'Anual $99'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setCreateOpen(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSendBtn, (!newEmail.trim() || !newPassword.trim() || !newName.trim()) && { opacity: 0.4 }]}
                disabled={!newEmail.trim() || !newPassword.trim() || !newName.trim() || creating}
                onPress={async () => {
                  setCreating(true)
                  const { error } = await supabase.functions.invoke('admin-user-actions', {
                    body: {
                      action: 'create',
                      email: newEmail.trim(),
                      password: newPassword,
                      full_name: newName.trim(),
                      plan_type: newPlanType,
                      subscription_status: newStatus,
                    },
                  })
                  setCreating(false)
                  if (error) {
                    Alert.alert('Error', error.message)
                  } else {
                    setCreateOpen(false)
                    Alert.alert('✓ Usuario creado', `${newName.trim()} ya puede iniciar sesión con su email y contraseña.`)
                    load()
                  }
                }}
              >
                <Text style={styles.modalSendText}>{creating ? 'Creando…' : 'Crear usuario'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

// ─── Tab de errores ───────────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = {
  dashboard: '📊 Dashboard',
  frequencies: '🎵 Frecuencias',
  journal: '📖 Diario',
  badges: '🏅 Logros',
  notifications: '🔔 Notificaciones',
  admin: '⚙ Admin',
}

function ErrorReportsTab({ reports, onResolve }: { reports: ErrorReport[]; onResolve: (id: string) => void }) {
  const [resolving, setResolving] = useState<string | null>(null)
  const [showResolved, setShowResolved] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = reports.filter(e => showResolved ? true : !e.resolved)
  const unresolvedCount = reports.filter(e => !e.resolved).length

  if (reports.length === 0) {
    return <Text style={styles.empty}>Sin reportes de errores. ¡Todo funciona bien!</Text>
  }

  return (
    <View style={{ gap: Spacing.sm }}>
      <View style={styles.errFilterRow}>
        <Text style={styles.errSummary}>
          {unresolvedCount === 0 ? '✓ Sin errores pendientes' : `⚠ ${unresolvedCount} error${unresolvedCount > 1 ? 'es' : ''} sin resolver`}
        </Text>
        <TouchableOpacity onPress={() => setShowResolved(v => !v)}>
          <Text style={styles.errToggle}>{showResolved ? 'Ocultar resueltos' : 'Ver resueltos'}</Text>
        </TouchableOpacity>
      </View>

      {filtered.map(err => {
        const isOpen = expanded === err.id
        return (
          <View key={err.id} style={[styles.errCard, err.resolved && styles.errCardResolved]}>
            <TouchableOpacity onPress={() => setExpanded(isOpen ? null : err.id)} activeOpacity={0.8}>
              <View style={styles.errHeader}>
                <View style={styles.errLeft}>
                  <Text style={styles.errSection}>{SECTION_LABELS[err.section] ?? err.section}</Text>
                  <Text style={styles.errUser}>{err.userName}</Text>
                </View>
                <View style={styles.errRight}>
                  <Text style={styles.errDate}>{fmtDate(err.created_at.split('T')[0])}</Text>
                  {err.resolved && <Text style={styles.errResolvedBadge}>✓ Resuelto</Text>}
                </View>
              </View>
              <Text style={styles.errMessage} numberOfLines={isOpen ? undefined : 2}>
                {err.error_message}
              </Text>
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.errBody}>
                {err.app_context && (
                  <View style={styles.errContext}>
                    <Text style={styles.errContextLabel}>Contexto</Text>
                    {Object.entries(err.app_context).map(([k, v]) => (
                      <Text key={k} style={styles.errContextRow}>
                        <Text style={{ color: Colors.textSecondary }}>{k}: </Text>
                        <Text style={{ color: Colors.textPrimary }}>{String(v)}</Text>
                      </Text>
                    ))}
                  </View>
                )}
                {err.error_details && (
                  <Text style={styles.errDetails} numberOfLines={6}>{err.error_details}</Text>
                )}
                {!err.resolved && (
                  <TouchableOpacity
                    style={styles.errResolveBtn}
                    disabled={resolving === err.id}
                    onPress={async () => {
                      setResolving(err.id)
                      await onResolve(err.id)
                      setResolving(null)
                    }}
                  >
                    <Text style={styles.errResolveBtnText}>
                      {resolving === err.id ? 'Marcando…' : '✓ Marcar como resuelto'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

// ─── Tarjeta de usuario ───────────────────────────────────────────────────────

type PlanStatus = 'active' | 'inactive'
type PlanKind = 'monthly' | 'annual'

function UserCard({ user, onPlanUpdated, onDeleted }: { user: AdminUser; onPlanUpdated: () => void; onDeleted: () => void }) {
  const barWidth = Math.min(user.completionRate, 100)
  const barColor = user.completionRate >= 70 ? '#4CAF82' : user.completionRate >= 40 ? '#C9A84C' : '#E05555'
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)
  const [editStatus, setEditStatus] = useState<PlanStatus>('active')
  const [editKind, setEditKind] = useState<PlanKind>('monthly')
  const [editStartDate, setEditStartDate] = useState('')
  const [saving, setSaving] = useState(false)

  function openPlan() {
    setEditStatus(('subscription_status' in user ? (user as any).subscription_status : 'inactive') as PlanStatus)
    setEditKind((user.plan_duration === 365 ? 'annual' : 'monthly') as PlanKind)
    setEditStartDate(user.plan_start_date ?? '')
    setPlanOpen(true)
  }

  async function savePlan() {
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      subscription_status: editStatus,
      plan_type: editKind,
      plan_start_date: editStartDate || null,
    }).eq('id', user.id)
    setSaving(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      setPlanOpen(false)
      Alert.alert('✓ Plan actualizado', `Plan de ${user.full_name.split(' ')[0]} actualizado correctamente.`)
      onPlanUpdated()
    }
  }

  async function handleReminder() {
    setSending(true)
    await sendInAppNotification(user)
    setSending(false)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setDeleting(true)
    setConfirmDelete(false)
    const { error } = await supabase.functions.invoke('admin-user-actions', {
      body: { action: 'delete', userId: user.id },
    })
    setDeleting(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      onDeleted()
    }
  }

  return (
    <View style={styles.userCard}>
      {/* Fila superior */}
      <View style={styles.userTop}>
        <View style={styles.areaEmojiBadge}>
          <Text style={styles.areaEmojiText}>{AREA_EMOJI[user.manifestation_area]}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user.full_name}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
        </View>
        <View style={[styles.activeBadge, user.isActive ? styles.activeBadgeGreen : styles.activeBadgeRed]}>
          <Text style={[styles.activeBadgeText, { color: user.isActive ? '#4CAF82' : '#E05555' }]}>
            {user.isActive ? 'Activo' : 'Ausente'}
          </Text>
        </View>
      </View>

      {/* Stats de progreso */}
      <View style={styles.progressRow}>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>Día {user.planDay}</Text>
          <Text style={styles.progressLabel}>de {user.planDuration}</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>{user.totalDaysLogged}</Text>
          <Text style={styles.progressLabel}>días con log</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>{user.completionRate}%</Text>
          <Text style={styles.progressLabel}>completado</Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressValue}>
            {user.lastActiveDate ? fmtDate(user.lastActiveDate) : '—'}
          </Text>
          <Text style={styles.progressLabel}>último acceso</Text>
        </View>
      </View>

      {/* Barra de completado */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${barWidth}%` as any, backgroundColor: barColor }]} />
      </View>

      {/* Acciones */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.planBtn} onPress={openPlan} activeOpacity={0.8}>
          <Text style={styles.planBtnText}>⚙ Gestionar plan</Text>
        </TouchableOpacity>
        {!user.isActive && (
          <TouchableOpacity style={styles.reminderBtn} onPress={handleReminder} activeOpacity={0.8} disabled={sending}>
            <Text style={styles.reminderBtnText}>
              {sending ? 'Enviando…' : `📩 ${user.daysSinceActive}d sin entrar`}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.deleteBtn, confirmDelete && styles.deleteBtnConfirm]}
          onPress={() => setConfirmDelete(v => !v)}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmación inline de eliminación */}
      {confirmDelete && (
        <View style={styles.deleteConfirmRow}>
          <Text style={styles.deleteConfirmText}>¿Eliminar a {user.full_name.split(' ')[0]}?</Text>
          <TouchableOpacity style={styles.deleteConfirmCancel} onPress={() => setConfirmDelete(false)}>
            <Text style={styles.deleteConfirmCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteConfirmOk, deleting && { opacity: 0.5 }]}
            disabled={deleting}
            onPress={async () => {
              setDeleting(true)
              setConfirmDelete(false)
              const { error } = await supabase.functions.invoke('admin-user-actions', {
                body: { action: 'delete', userId: user.id },
              })
              setDeleting(false)
              if (error) Alert.alert('Error', error.message)
              else onDeleted()
            }}
          >
            <Text style={styles.deleteConfirmOkText}>{deleting ? 'Eliminando…' : 'Sí, eliminar'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de gestión de plan */}
      <Modal visible={planOpen} transparent animationType="slide" onRequestClose={() => setPlanOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>⚙ Plan de {user.full_name.split(' ')[0]}</Text>

            <Text style={styles.modalLabel}>Estado de suscripción</Text>
            <View style={styles.segmentRow}>
              {(['active', 'inactive'] as PlanStatus[]).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.segmentBtn, editStatus === s && styles.segmentBtnActive]}
                  onPress={() => setEditStatus(s)}
                >
                  <Text style={[styles.segmentText, editStatus === s && styles.segmentTextActive]}>
                    {s === 'active' ? '✓ Activo' : '✗ Inactivo'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Tipo de plan</Text>
            <View style={styles.segmentRow}>
              {(['monthly', 'annual'] as PlanKind[]).map(k => (
                <TouchableOpacity
                  key={k}
                  style={[styles.segmentBtn, editKind === k && styles.segmentBtnActive]}
                  onPress={() => setEditKind(k)}
                >
                  <Text style={[styles.segmentText, editKind === k && styles.segmentTextActive]}>
                    {k === 'monthly' ? 'Mensual $14' : 'Anual $99'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Fecha inicio del plan (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              value={editStartDate}
              onChangeText={setEditStartDate}
              placeholder="ej: 2025-01-15"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setPlanOpen(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSendBtn} onPress={savePlan} disabled={saving}>
                <Text style={styles.modalSendText}>{saving ? 'Guardando…' : 'Guardar cambios'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60, paddingBottom: 100 },

  header: { marginBottom: Spacing.xl, gap: Spacing.xs },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  back: { color: Colors.gold, fontSize: 15 },
  previewBtn: { fontSize: 13, color: Colors.textSecondary },
  title: { fontSize: 26, color: Colors.textPrimary, fontWeight: '700' },
  subtitle: { fontSize: 13, color: Colors.textSecondary },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', gap: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  statCardGreen: { borderColor: 'rgba(76,175,130,0.30)' },
  statCardRed: { borderColor: 'rgba(224,85,85,0.30)' },
  statNumber: { fontSize: 28, color: Colors.gold, fontWeight: '700' },
  statLabel: { fontSize: 12, color: Colors.textPrimary, fontWeight: '600' },
  statSub: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  filterBtn: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
    backgroundColor: Colors.card,
  },
  filterBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.10)' },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: Colors.gold, fontWeight: '700' },

  empty: { textAlign: 'center', color: Colors.textSecondary, marginTop: Spacing.xl, fontSize: 14 },

  tabRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  tabBtn: {
    flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
    backgroundColor: Colors.card,
  },
  tabBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.10)' },
  tabText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.gold, fontWeight: '700' },

  fbCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  fbHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  fbUserInfo: { gap: 2, flex: 1 },
  fbName: { fontSize: 14, color: Colors.textPrimary, fontWeight: '700' },
  fbEmail: { fontSize: 11, color: Colors.textSecondary },
  fbDate: { fontSize: 11, color: Colors.textDisabled },
  fbMessage: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  userCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  userTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  areaEmojiBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(201,168,76,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  areaEmojiText: { fontSize: 20 },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 15, color: Colors.textPrimary, fontWeight: '600' },
  userEmail: { fontSize: 12, color: Colors.textSecondary },
  activeBadge: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.sm, borderWidth: 1,
  },
  activeBadgeGreen: { backgroundColor: 'rgba(76,175,130,0.10)', borderColor: 'rgba(76,175,130,0.30)' },
  activeBadgeRed: { backgroundColor: 'rgba(224,85,85,0.10)', borderColor: 'rgba(224,85,85,0.30)' },
  activeBadgeText: { fontSize: 11, fontWeight: '700' },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressItem: { alignItems: 'center', gap: 2 },
  progressValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '700' },
  progressLabel: { fontSize: 10, color: Colors.textSecondary },

  barTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2, overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2 },

  reminderBtn: {
    flex: 1, backgroundColor: 'rgba(224,85,85,0.08)',
    borderRadius: Radius.md, padding: Spacing.sm,
    alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(224,85,85,0.25)',
  },
  reminderBtnText: { fontSize: 12, color: '#E05555', fontWeight: '600' },

  tabBtnError: { borderColor: 'rgba(224,85,85,0.40)', backgroundColor: 'rgba(224,85,85,0.08)' },
  tabTextError: { color: '#E05555' },

  errFilterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  errSummary: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  errToggle: { fontSize: 12, color: Colors.gold },

  errCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: 'rgba(224,85,85,0.35)',
    padding: Spacing.md, gap: Spacing.sm,
  },
  errCardResolved: { borderColor: Colors.border, opacity: 0.65 },
  errHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  errLeft: { gap: 2, flex: 1 },
  errRight: { alignItems: 'flex-end', gap: 3 },
  errSection: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700' },
  errUser: { fontSize: 11, color: Colors.textSecondary },
  errDate: { fontSize: 11, color: Colors.textDisabled },
  errResolvedBadge: { fontSize: 10, color: '#4CAF82', fontWeight: '700' },
  errMessage: { fontSize: 13, color: '#E05555', lineHeight: 19 },
  errBody: { gap: Spacing.sm, paddingTop: Spacing.xs },
  errContext: {
    backgroundColor: Colors.input, borderRadius: Radius.sm,
    padding: Spacing.sm, gap: 3,
  },
  errContextLabel: { fontSize: 10, color: Colors.textDisabled, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  errContextRow: { fontSize: 12, lineHeight: 18 },
  errDetails: { fontSize: 11, color: Colors.textDisabled, fontFamily: 'monospace', lineHeight: 16 },
  errResolveBtn: {
    borderRadius: Radius.md, padding: Spacing.sm,
    alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(76,175,130,0.40)',
    backgroundColor: 'rgba(76,175,130,0.08)',
  },
  errResolveBtnText: { fontSize: 13, color: '#4CAF82', fontWeight: '700' },

  broadcastRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  broadcastBtn: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.gold, padding: Spacing.sm,
    alignItems: 'center', gap: 2,
  },
  broadcastBtnLabel: { fontSize: 12, color: Colors.gold, fontWeight: '700' },
  broadcastBtnCount: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },

  cardActions: { flexDirection: 'row', gap: Spacing.sm },
  planBtn: {
    flex: 1, backgroundColor: 'rgba(201,168,76,0.08)',
    borderRadius: Radius.md, padding: Spacing.sm,
    alignItems: 'center', borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
  },
  planBtnText: { fontSize: 12, color: Colors.gold, fontWeight: '600' },

  segmentRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  segmentBtn: {
    flex: 1, padding: Spacing.sm, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.background, alignItems: 'center',
  },
  segmentBtnActive: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.12)' },
  segmentText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  segmentTextActive: { color: Colors.gold, fontWeight: '700' },

  modalTargetHint: { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: -4 },

  addUserBtn: {
    borderWidth: 1, borderColor: Colors.gold, borderRadius: Radius.md,
    borderStyle: 'dashed', padding: Spacing.md,
    alignItems: 'center', marginBottom: Spacing.md,
  },
  addUserText: { fontSize: 14, color: Colors.gold, fontWeight: '700' },

  deleteBtn: {
    width: 36, minHeight: 36, backgroundColor: 'rgba(224,85,85,0.08)',
    borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(224,85,85,0.25)',
    padding: Spacing.sm,
  },
  deleteBtnText: { fontSize: 16 },
  deleteBtnConfirm: {
    backgroundColor: 'rgba(224,85,85,0.25)',
    borderColor: 'rgba(224,85,85,0.6)',
  },

  deleteConfirmRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(224,85,85,0.08)',
    borderRadius: Radius.md, padding: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(224,85,85,0.25)',
  },
  deleteConfirmText: { flex: 1, fontSize: 12, color: '#E05555', fontWeight: '600' },
  deleteConfirmCancel: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border,
  },
  deleteConfirmCancelText: { fontSize: 12, color: Colors.textSecondary },
  deleteConfirmOk: {
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
    borderRadius: Radius.sm, backgroundColor: '#E05555',
  },
  deleteConfirmOkText: { fontSize: 12, color: '#fff', fontWeight: '700' },

  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.xl, paddingBottom: 40, gap: Spacing.sm,
  },
  modalTitle: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.sm },
  modalLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  modalInput: {
    backgroundColor: Colors.background, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    color: Colors.textPrimary, fontSize: 15,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  modalInputMulti: { height: 100, textAlignVertical: 'top', paddingTop: Spacing.sm },
  modalHint: { fontSize: 11, color: Colors.textDisabled, textAlign: 'right' },
  modalButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  modalCancelBtn: {
    flex: 1, padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  modalCancelText: { color: Colors.textSecondary, fontWeight: '600', fontSize: 14 },
  modalSendBtn: {
    flex: 2, padding: Spacing.md, borderRadius: Radius.md,
    backgroundColor: Colors.gold, alignItems: 'center',
  },
  modalSendText: { color: Colors.background, fontWeight: '700', fontSize: 14 },
})
