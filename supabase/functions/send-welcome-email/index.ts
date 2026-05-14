const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, name } = await req.json()

    const firstName = name ? name.split(' ')[0] : 'hola'

    const html = `
<div style="background-color:#0E0C1A;padding:40px 20px;font-family:Georgia,serif;max-width:480px;margin:0 auto;border-radius:16px">
  <div style="text-align:center;margin-bottom:32px">
    <p style="font-size:32px;margin:0">🌙</p>
    <h1 style="color:#C9A84C;font-size:28px;letter-spacing:3px;margin:8px 0 4px">Luumina</h1>
    <p style="color:#7A7890;font-size:12px;letter-spacing:2px;margin:0;text-transform:uppercase">tu protocolo diario de manifestación</p>
  </div>

  <p style="color:#E8E6F0;font-size:16px;line-height:26px;margin-bottom:8px">Hola, ${firstName} ✦</p>
  <p style="color:#E8E6F0;font-size:16px;line-height:26px;margin-bottom:24px">
    Bienvenida a Luumina. Tu protocolo personalizado ya está listo — creado especialmente para ti según tu energía, tu ciclo lunar y tu intención.
  </p>

  <div style="border-top:1px solid rgba(201,168,76,0.2);margin:24px 0;padding-top:24px">
    <p style="color:#C9A84C;font-size:13px;font-weight:700;margin:0 0 16px;text-align:center">Tu día tiene 3 momentos</p>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:12px 16px">
        <p style="color:#C9A84C;font-size:13px;margin:0 0 4px;font-weight:700">☀️ Mañana</p>
        <p style="color:#A09DB8;font-size:12px;margin:0;line-height:18px">Activa tu energía con tu ritual y afirmación del día</p>
      </div>
      <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:12px 16px">
        <p style="color:#C9A84C;font-size:13px;margin:0 0 4px;font-weight:700">🌤 Tarde</p>
        <p style="color:#A09DB8;font-size:12px;margin:0;line-height:18px">Mantén el impulso con tu objetivo y frecuencia del día</p>
      </div>
      <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:12px 16px">
        <p style="color:#C9A84C;font-size:13px;margin:0 0 4px;font-weight:700">🌙 Noche</p>
        <p style="color:#A09DB8;font-size:12px;margin:0;line-height:18px">Cierra el día con tu diario de manifestación</p>
      </div>
    </div>
  </div>

  <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.25);border-radius:8px;padding:16px;margin:24px 0;text-align:center">
    <p style="color:#C9A84C;font-size:13px;margin:0 0 6px;font-weight:700">✦ Tu primera práctica de hoy</p>
    <p style="color:#A09DB8;font-size:12px;margin:0;line-height:18px">Abre la app, lee tu afirmación del día en voz alta y completa tu ritual de mañana. Son menos de 5 minutos.</p>
  </div>

  <div style="text-align:center;margin:28px 0">
    <a href="https://luumina.pro" style="background-color:#C9A84C;color:#0E0C1A;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:700;display:inline-block">
      Abrir mi protocolo ✦
    </a>
  </div>

  <p style="color:#4A4760;font-size:11px;text-align:center;margin-top:32px;line-height:18px">
    Luumina · luumina.pro<br>
    Tu protocolo diario de manifestación
  </p>
</div>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Luumina <hola@luumina.pro>',
        to: email,
        subject: '✦ Bienvenida a Luumina — tu protocolo está listo',
        html,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
