Deno.serve(() => {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago cancelado · Abundancia</title>
  <style>
    body { background: #0D0D0F; color: #F5F0E8; font-family: -apple-system, sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { text-align: center; padding: 40px 32px; max-width: 360px; }
    .emoji { font-size: 64px; margin-bottom: 24px; }
    h1 { color: #F5F0E8; font-size: 26px; margin-bottom: 12px; }
    p { color: #8A8A9A; font-size: 16px; line-height: 24px; }
    .hint { margin-top: 32px; font-size: 14px; color: #C9A84C; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">🌙</div>
    <h1>Pago cancelado</h1>
    <p>No se realizó ningún cargo. Vuelve a la app cuando estés listo para activar tu sistema.</p>
    <p class="hint">Puedes cerrar esta ventana.</p>
  </div>
</body>
</html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
})
