// Edge Function: delete-account
// Elimina la cuenta del usuario autenticado que llama a esta función.
// No acepta userId en el payload — opera exclusivamente sobre auth.uid() del JWT.
// Requiere: service_role key configurada como SUPABASE_SERVICE_ROLE_KEY en los secrets de la función.

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

  // Verificar JWT del usuario que pide la eliminación
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return err('No autorizado', 401)

  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) return err('Sesión inválida', 401)

  const userId = user.id

  // Cliente con service_role para operaciones privilegiadas
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // ── 1. Eliminar archivos del bucket vision-boards ─────────────────────────
  // Los archivos están bajo la ruta "{userId}/<filename>"
  const { data: fileList, error: listError } = await admin.storage
    .from('vision-boards')
    .list(userId)

  if (!listError && fileList && fileList.length > 0) {
    const paths = fileList.map((f: { name: string }) => `${userId}/${f.name}`)
    await admin.storage.from('vision-boards').remove(paths)
    // No abortamos si falla el storage — procedemos igual para no dejar al usuario sin salida
  }

  // ── 2. Eliminar filas en tablas de datos de usuario ───────────────────────
  // El orden importa si hay FK sin CASCADE. Primero hijos, luego profiles, luego auth.

  await admin.from('vision_board_uploads').delete().eq('user_id', userId)
  await admin.from('daily_logs').delete().eq('user_id', userId)
  await admin.from('journal_entries').delete().eq('user_id', userId)
  await admin.from('error_reports').delete().eq('user_id', userId)
  await admin.from('profiles').delete().eq('id', userId)

  // ── 3. Eliminar usuario de auth.users ─────────────────────────────────────
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) return err(`Error eliminando usuario de auth: ${deleteError.message}`, 500)

  return ok({ success: true })
})
