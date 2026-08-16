export async function GET(request: Request) {
  // Vercel agrega automáticamente Authorization: Bearer ${CRON_SECRET} en cron jobs
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const cronSecret = process.env.CRON_SECRET

  if (!supabaseUrl || !serviceRoleKey || !cronSecret) {
    return Response.json({ error: 'Missing env vars' }, { status: 500 })
  }

  const res = await fetch(`${supabaseUrl}/functions/v1/smart-notifications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ secret: cronSecret }),
  })

  const data = await res.json()
  return Response.json(data)
}
