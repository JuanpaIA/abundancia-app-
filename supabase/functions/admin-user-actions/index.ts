import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function err(msg: string, status = 400) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function ok(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  // Verificar JWT del admin
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return err('No autorizado', 401)

  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
  if (authError || !user) return err('Sesión inválida', 401)

  // Verificar que es admin
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return err('Acceso denegado', 403)

  const { action, ...payload } = await req.json()

  // ── Crear usuario ──────────────────────────────────────────────────────────
  if (action === 'create') {
    const { email, password, full_name, plan_type, subscription_status, plan_start_date } = payload

    if (!email || !password || !full_name) {
      return err('email, password y full_name son requeridos')
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (createError || !created.user) {
      return err(createError?.message ?? 'No se pudo crear el usuario')
    }

    const { error: profileError } = await supabaseAdmin.from('profiles').update({
      full_name,
      subscription_status: subscription_status ?? 'inactive',
      plan_type: plan_type ?? 'monthly',
      plan_start_date: plan_start_date ?? null,
    }).eq('id', created.user.id)

    if (profileError) {
      return err(`Usuario creado pero error en perfil: ${profileError.message}`)
    }

    return ok({ success: true, userId: created.user.id })
  }

  // ── Eliminar usuario ───────────────────────────────────────────────────────
  if (action === 'delete') {
    const { userId } = payload
    if (!userId) return err('userId es requerido')

    // No permitir que el admin se elimine a sí mismo
    if (userId === user.id) return err('No puedes eliminarte a ti mismo')

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) return err(deleteError.message)

    return ok({ success: true })
  }

  return err('Acción no reconocida')
})
