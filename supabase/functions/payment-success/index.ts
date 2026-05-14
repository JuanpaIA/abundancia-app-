Deno.serve(() => {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenida a Lumina</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0D0A1E; color: #F5F0E8; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { text-align: center; max-width: 400px; width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(201,168,76,0.25); border-radius: 20px; padding: 48px 32px; }
    .symbol { font-size: 52px; color: #C9A84C; margin-bottom: 16px; }
    .brand { font-size: 13px; letter-spacing: 3px; color: #C9A84C; text-transform: uppercase; margin-bottom: 20px; }
    h1 { font-size: 26px; color: #F5F0E8; font-weight: 700; margin-bottom: 16px; line-height: 1.3; }
    .divider { width: 48px; height: 2px; background: #C9A84C; margin: 20px auto; border-radius: 2px; }
    p { color: #8A8A9A; font-size: 15px; line-height: 24px; margin-bottom: 12px; }
    strong { color: #F5F0E8; }
    .hint { margin-top: 28px; font-size: 14px; color: #C9A84C; background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2); border-radius: 10px; padding: 12px 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="symbol">&#10022;</div>
    <div class="brand">Lumina</div>
    <h1>&#161;Tu sistema est&#225; activado!</h1>
    <div class="divider"></div>
    <p>Tu suscripci&#243;n est&#225; activa y tu protocolo personalizado te espera.</p>
    <p>Vuelve a la app y toca <strong>"Ya pagu&#233; &#8212; Verificar acceso"</strong> para comenzar.</p>
    <div class="hint">&#10022; Puedes cerrar esta ventana y regresar a L&#250;mina</div>
  </div>
</body>
</html>`
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
})
