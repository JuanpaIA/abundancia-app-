import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Cálculo de fase lunar (portado de src/utils/calculations.ts) ─────────────
function getLunarPhase(date: Date): string {
  const knownNewMoon = new Date('2000-01-06')
  const lunarCycle = 29.53058867
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle
  if (phase < 1.85) return 'nueva'
  if (phase < 16.61) return 'intermedia'
  if (phase < 16.61 + 1.84) return 'llena'
  return 'intermedia'
}

function isLunaNueva(date: Date): boolean {
  const knownNewMoon = new Date('2000-01-06')
  const lunarCycle = 29.53058867
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle
  return phase < 1.85
}

function isLunaLlena(date: Date): boolean {
  const knownNewMoon = new Date('2000-01-06')
  const lunarCycle = 29.53058867
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle
  return phase >= 14.77 && phase < 16.61
}

// ── Detección de portales (portado de src/utils/energeticPortals.ts) ─────────
interface Portal { name: string; energy: string; emoji: string }

function getPortalForDate(date: Date): Portal | null {
  const month = date.getMonth() + 1
  const day = date.getDate()

  const MIRROR: Record<number, Portal> = {
    1:  { name: 'Portal 1:1', emoji: '✨', energy: 'Creación y nuevos comienzos' },
    2:  { name: 'Portal 2:2', emoji: '🌊', energy: 'Cooperación, amor y balance' },
    3:  { name: 'Portal 3:3', emoji: '🎨', energy: 'Creatividad y expresión' },
    4:  { name: 'Portal 4:4', emoji: '🏛️', energy: 'Estabilidad y construcción' },
    5:  { name: 'Portal 5:5', emoji: '🦋', energy: 'Transformación y libertad' },
    6:  { name: 'Portal 6:6', emoji: '💚', energy: 'Amor y armonía' },
    7:  { name: 'Portal 7:7', emoji: '🔮', energy: 'Intuición y sabiduría interior' },
    8:  { name: 'Portal 8:8 — Puerta del León', emoji: '🌟', energy: 'Abundancia ilimitada y manifestación máxima' },
    9:  { name: 'Portal 9:9', emoji: '🌙', energy: 'Completud y cierre de ciclos' },
    10: { name: 'Portal 10:10', emoji: '⚡', energy: 'Orden divino y alineación' },
    11: { name: 'Portal 11:11', emoji: '🌠', energy: 'Manifestación instantánea y despertar espiritual' },
    12: { name: 'Portal 12:12', emoji: '👑', energy: 'Ascensión y gracia divina' },
  }
  if (day === month && MIRROR[month]) return MIRROR[month]

  const FIXED: Record<string, Portal> = {
    '3/20':  { name: 'Equinoccio de Primavera', emoji: '🌸', energy: 'Siembra, equilibrio y nuevos comienzos' },
    '6/21':  { name: 'Solsticio de Verano',     emoji: '☀️', energy: 'Máxima energía solar, expansión y éxito' },
    '9/22':  { name: 'Equinoccio de Otoño',     emoji: '🍂', energy: 'Cosecha, gratitud y liberación' },
    '12/21': { name: 'Solsticio de Invierno',   emoji: '❄️', energy: 'Renacimiento y renovación' },
    '2/17':  { name: 'Eclipse Solar Anular',    emoji: '🌑', energy: 'Transformación radical e inicios poderosos' },
    '8/12':  { name: 'Eclipse Solar Total',     emoji: '🌑', energy: 'Transformación total y revelaciones' },
    '8/28':  { name: 'Eclipse Lunar Parcial',   emoji: '🌕', energy: 'Liberación emocional y sanación' },
  }
  return FIXED[`${month}/${day}`] ?? null
}

// ── Envío batch a Expo Push API ───────────────────────────────────────────────
async function sendBatch(messages: object[]) {
  for (let i = 0; i < messages.length; i += 100) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(messages.slice(i, i + 100)),
    })
  }
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  function err(msg: string, status = 400) {
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // Solo aceptar llamadas con el CRON_SECRET para evitar abuso
    const { secret } = await req.json().catch(() => ({}))
    if (!secret || secret !== Deno.env.get('CRON_SECRET')) return err('No autorizado', 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const today = new Date()
    const todayISO = dateStr(today)
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const portal = getPortalForDate(today)
    const lunaNueva = isLunaNueva(today)
    const lunaLlena = isLunaLlena(today)

    const results = { lunar: 0, portal: 0, reengagement: 0 }

    // ── Obtener todos los usuarios activos con push token ─────────────────────
    const { data: activeUsers } = await supabase
      .from('profiles')
      .select('id, push_token, full_name')
      .eq('subscription_status', 'active')
      .not('push_token', 'is', null)

    const users = activeUsers ?? []
    const tokens = (u: { push_token: string }) => u.push_token

    // ── 1. Luna nueva / luna llena → todos los usuarios activos ───────────────
    if (lunaNueva || lunaLlena) {
      const title = lunaNueva
        ? '🌑 Luna Nueva — Siembra tu intención'
        : '🌕 Luna Llena — Tu energía está al máximo'
      const body = lunaNueva
        ? 'El ciclo lunar comienza. Lo que plantes hoy en tu intención tiene el poder de toda una lunación.'
        : 'Es tiempo de manifestar y agradecer. Tu protocolo de hoy está diseñado para este momento de máxima energía.'

      await sendBatch(users.map(u => ({ to: tokens(u), title, body, sound: 'default', priority: 'high' })))
      results.lunar = users.length
    }

    // ── 2. Portal energético → todos los usuarios activos ────────────────────
    if (portal) {
      const title = `${portal.emoji} ${portal.name} — hoy`
      const body = `Tu protocolo de hoy está alineado con esta energía: ${portal.energy}. Ábrelo ahora.`
      await sendBatch(users.map(u => ({ to: tokens(u), title, body, sound: 'default', priority: 'high' })))
      results.portal = users.length
    }

    // ── 3. Re-engagement: 2 días sin abrir ───────────────────────────────────
    // Usuarios que tienen log hace 2 días pero NO ayer ni hoy
    const { data: loggedTwoDaysAgo } = await supabase
      .from('daily_logs')
      .select('user_id')
      .eq('date', dateStr(twoDaysAgo))

    const { data: recentLogs } = await supabase
      .from('daily_logs')
      .select('user_id')
      .in('date', [dateStr(yesterday), todayISO])

    const recentIds = new Set((recentLogs ?? []).map(l => l.user_id))
    const twoDaysIds = new Set((loggedTwoDaysAgo ?? []).map(l => l.user_id))
    const toReengage = new Set([...twoDaysIds].filter(id => !recentIds.has(id)))

    const reengageUsers = users.filter(u => toReengage.has(u.id))
    if (reengageUsers.length) {
      await sendBatch(reengageUsers.map(u => {
        const name = u.full_name?.split(' ')[0] ?? 'tú'
        return {
          to: u.push_token,
          title: '🌙 Tu protocolo te está esperando',
          body: `${name}, llevas 2 días sin completar tu protocolo. Vuelve hoy — tu racha sigue siendo tuya.`,
          sound: 'default',
          priority: 'high',
        }
      }))
      results.reengagement = reengageUsers.length
    }

    return new Response(
      JSON.stringify({ ok: true, date: todayISO, lunaNueva, lunaLlena, portal: portal?.name ?? null, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
