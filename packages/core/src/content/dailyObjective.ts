import { GoalDetails, ManifestationArea } from '../types'

export type PlanPhase = 'foundation' | 'activation' | 'momentum' | 'integration'

export interface PhaseInfo {
  phase: PlanPhase
  label: string
  emoji: string
  description: string
}

export interface DailyObjective {
  title: string
  action: string
  duration: string
  measurable: string
}

export function getPhaseInfo(planDay: number, planDuration: number): PhaseInfo {
  const pct = (planDay - 1) / planDuration
  if (pct < 0.25) return { phase: 'foundation', label: 'Fundación', emoji: '🌱', description: 'Estableciendo las bases de tu manifestación' }
  if (pct < 0.50) return { phase: 'activation', label: 'Activación', emoji: '⚡', description: 'Activando el campo de atracción' }
  if (pct < 0.75) return { phase: 'momentum', label: 'Momentum', emoji: '🔥', description: 'Acelerando hacia tu manifestación' }
  return { phase: 'integration', label: 'Integración', emoji: '🌕', description: 'Consolidando y cosechando' }
}

// ─── DINERO ───────────────────────────────────────────────────────────────────

function buildDineroCore(details: GoalDetails): DailyObjective[] {
  const skill = details.skill || 'tu habilidad'
  const goal = details.monthly_goal || 'tu meta'
  const obstacle = details.money_obstacle || 'tus bloqueos'
  const situation = details.situation || 'emprendedor'

  return [
    {
      title: 'Investiga tu mercado',
      action: `Busca 5 personas o negocios que ya ganan dinero con ${skill}. Anota cuánto cobran, cómo se presentan y qué ofrecen. Hoy solo observas — no comparas.`,
      duration: '30 min',
      measurable: '5 referencias encontradas y anotadas',
    },
    {
      title: 'Define tu oferta exacta',
      action: `Escribe en una hoja qué entregas exactamente con ${skill}, en cuánto tiempo y por cuánto dinero. Debe ser tan claro que cualquier desconocido lo entienda en 30 segundos.`,
      duration: '20 min',
      measurable: '1 oferta redactada y clara',
    },
    {
      title: 'Crea o actualiza tu portafolio',
      action: `Reúne tus 3 mejores trabajos o ejemplos de ${skill}. Si no tienes, crea uno hoy desde cero. Un portafolio básico vale más que uno perfecto que no existe.`,
      duration: '45 min',
      measurable: '3 ejemplos listos para mostrar',
    },
    {
      title: 'Escribe tu pitch de 3 líneas',
      action: `Redacta cómo te presentas cuando alguien te pregunta qué haces. Debe incluir: qué haces, para quién y qué resultado obtendrán. Pruébalo en voz alta 5 veces.`,
      duration: '20 min',
      measurable: '1 pitch listo y memorizado',
    },
    {
      title: 'Identifica 10 clientes potenciales',
      action: `Haz una lista de 10 personas, empresas o plataformas que podrían necesitar ${skill} y pagar por ello. Incluye nombre, dónde encontrarlos y por qué serían buenos clientes.`,
      duration: '30 min',
      measurable: 'Lista de 10 prospectos con contacto',
    },
    {
      title: 'Prepara tu presencia profesional',
      action: `Elige UNA plataforma (LinkedIn, Instagram, web o WhatsApp Business) y asegúrate de que tu perfil comunica claramente lo que ofreces con ${skill}. Foto, descripción y enlace de contacto.`,
      duration: '30 min',
      measurable: '1 perfil actualizado y profesional',
    },
    {
      title: 'Primer contacto con 3 prospectos',
      action: `Escribe un mensaje personalizado a 3 personas de tu lista del día 5. No vendas — pregunta si tienen el problema que tú resuelves con ${skill}. Conversación antes que propuesta.`,
      duration: '30 min',
      measurable: '3 mensajes enviados',
    },
    {
      title: 'Aprende algo que te acerque al objetivo',
      action: `Identifica un conocimiento específico que te falta para llegar a ${goal} con ${skill}. Dedica 30 minutos a aprenderlo hoy: video, artículo o podcast. Anota 3 aprendizajes concretos.`,
      duration: '30 min',
      measurable: '3 aprendizajes anotados',
    },
    {
      title: 'Crea contenido de valor',
      action: `Publica algo útil sobre ${skill} en tu plataforma elegida. Puede ser un tip, un antes/después, una pregunta o una historia. El contenido posiciona — una publicación ya es suficiente hoy.`,
      duration: '25 min',
      measurable: '1 publicación hecha',
    },
    {
      title: 'Haz seguimiento a contactos anteriores',
      action: `Escribe a las 3 personas que contactaste el día 7. Si respondieron, avanza la conversación. Si no, envía un mensaje de seguimiento amable. La constancia convierte prospectos en clientes.`,
      duration: '20 min',
      measurable: '3 seguimientos enviados',
    },
    {
      title: 'Enfrenta el bloqueo principal',
      action: `Escribiste que "${obstacle}" te ha frenado. Hoy dedica 20 minutos a escribir 3 acciones concretas que puedes tomar esta semana para reducir ese obstáculo. Luego ejecuta la primera.`,
      duration: '30 min',
      measurable: '1 acción anti-bloqueo ejecutada',
    },
    {
      title: 'Establece tu precio con confianza',
      action: `Escribe tus precios para ${skill}: precio básico, precio estándar y precio premium. La mayoría subestima su valor. Calcula cuántos clientes necesitas a cada precio para llegar a ${goal}.`,
      duration: '20 min',
      measurable: '3 niveles de precio definidos',
    },
    {
      title: 'Busca 10 nuevos prospectos',
      action: `Expande tu lista de potenciales clientes. Busca en grupos, eventos, redes o referidos. Añade 10 nuevos nombres con contacto. El pipeline de clientes se alimenta constantemente.`,
      duration: '30 min',
      measurable: '10 nuevos prospectos listados',
    },
    {
      title: 'Envía tu primera propuesta formal',
      action: `Elige el mejor prospecto de tu lista y envíale una propuesta clara: qué harás, en qué tiempo, cuánto cuesta y qué resultado obtendrá. Una propuesta enviada vale más que diez pensadas.`,
      duration: '30 min',
      measurable: '1 propuesta formal enviada',
    },
    {
      title: 'Revisión semanal de progreso',
      action: `Revisa tus últimas 2 semanas: ¿cuántos contactos hiciste? ¿Cuántas propuestas? ¿Qué funcionó? ¿Qué cambias? Escribe 3 ajustes concretos para la próxima semana.`,
      duration: '20 min',
      measurable: '3 ajustes estratégicos definidos',
    },
    {
      title: 'Mejora una habilidad clave',
      action: `Identifica la habilidad que más impacta tu capacidad de generar ${goal} con ${skill}. Dedica 30 minutos exclusivos a desarrollarla hoy. Documentar lo aprendido refuerza el aprendizaje.`,
      duration: '30 min',
      measurable: '1 habilidad trabajada con registro',
    },
    {
      title: 'Pide una referencia o testimonio',
      action: `Contacta a alguien que haya visto tu trabajo con ${skill} y pídele un testimonio escrito o que te refiera con alguien. Las referencias abren puertas que los anuncios no pueden.`,
      duration: '15 min',
      measurable: '1 solicitud de testimonio enviada',
    },
    {
      title: 'Crea un sistema de seguimiento',
      action: `Organiza tus prospectos en una hoja simple: nombre, estado (contactado, en conversación, propuesta enviada, cliente). Saber dónde está cada uno multiplica tus cierres.`,
      duration: '25 min',
      measurable: '1 sistema de seguimiento activo',
    },
    {
      title: 'Automatiza algo de tu proceso',
      action: `Identifica algo que haces repetidamente para conseguir clientes con ${skill} y crea una plantilla o proceso que lo haga más rápido. El tiempo ahorrado se convierte en más clientes.`,
      duration: '30 min',
      measurable: '1 plantilla o proceso creado',
    },
    {
      title: 'Contacta 5 prospectos nuevos',
      action: `Usando tu pitch y tu proceso mejorado, contacta 5 personas nuevas hoy. Personaliza cada mensaje — menciona algo específico de cada uno. La personalización duplica las respuestas.`,
      duration: '30 min',
      measurable: '5 contactos personalizados enviados',
    },
    {
      title: 'Calcula tu avance real',
      action: `Haz el cálculo honesto: ¿cuánto has generado o avanzado hacia ${goal}? ¿Qué falta? No para juzgarte — para ajustar. Los que llegan a sus metas se miden constantemente.`,
      duration: '15 min',
      measurable: '1 análisis numérico real completado',
    },
    {
      title: 'Desarrolla una fuente de ingreso adicional',
      action: `Con ${skill}, ¿puedes ofrecer algo escalable? (curso, plantilla, recurso descargable, grupo). Hoy escribe la idea y los primeros 3 pasos para hacerla realidad.`,
      duration: '30 min',
      measurable: '1 idea de ingreso escalable definida',
    },
    {
      title: 'Fortalece tu posicionamiento',
      action: `¿En qué aspecto de ${skill} eres o puedes ser el mejor? Define tu nicho específico. Quien intenta servir a todos, no sirve a nadie. Un nicho claro atrae mejores clientes.`,
      duration: '20 min',
      measurable: '1 nicho específico definido por escrito',
    },
    {
      title: 'Cierra o avanza una propuesta pendiente',
      action: `Revisa tus propuestas abiertas y da seguimiento a todas. Si hay una que lleva más de 5 días sin respuesta, llama o escribe hoy. Las propuestas no se cierran solas.`,
      duration: '20 min',
      measurable: 'Seguimiento a todas las propuestas activas',
    },
    {
      title: 'Invierte en tu crecimiento',
      action: `Identifica UN recurso (curso, libro, herramienta, mentoría) que aceleraría tu camino a ${goal} con ${skill}. Si puedes, adquiérelo hoy. Si no, planifica cuándo. Invertir en ti genera el mejor retorno.`,
      duration: '20 min',
      measurable: '1 recurso identificado y planificado',
    },
    {
      title: 'Crea contenido de autoridad',
      action: `Comparte un caso de estudio, proceso o resultado concreto de tu trabajo con ${skill}. La autoridad se demuestra con ejemplos reales, no con afirmaciones. Una publicación con resultados reales.`,
      duration: '30 min',
      measurable: '1 contenido de autoridad publicado',
    },
    {
      title: 'Construye una alianza estratégica',
      action: `Identifica una persona o negocio complementario a ${skill} con quien podrías colaborar o referirse clientes mutuamente. Escríbele hoy con una propuesta de colaboración simple.`,
      duration: '20 min',
      measurable: '1 propuesta de alianza enviada',
    },
    {
      title: 'Optimiza tu propuesta más exitosa',
      action: `Toma la propuesta o mensaje que mejor ha funcionado y mejórala. ¿Puedes hacerla más clara? ¿Más convincente? ¿Más específica? Una buena propuesta mejorada genera más cierres.`,
      duration: '25 min',
      measurable: '1 propuesta optimizada y lista',
    },
    {
      title: 'Establece una meta para el próximo mes',
      action: `Con todo lo aprendido este mes, define una meta específica para el próximo: número de clientes, ingresos exactos, habilidades a desarrollar. Escríbela como si ya fuera real.`,
      duration: '20 min',
      measurable: '1 meta mensual específica y escrita',
    },
    {
      title: 'Celebra y proyecta',
      action: `Escribe todo lo que lograste este ciclo de 30 días hacia ${goal}. Celebra cada avance — el universo responde a la gratitud. Luego escribe tu intención para el próximo ciclo.`,
      duration: '15 min',
      measurable: '1 registro de logros + nueva intención escrita',
    },
  ]
}

// ─── DINERO DEEPENING (días 31-60) ────────────────────────────────────────────

function buildDineroDeepening(details: GoalDetails): DailyObjective[] {
  const skill = details.skill || 'tu habilidad'
  const goal = details.monthly_goal || 'tu meta'
  const obstacle = details.money_obstacle || 'tus bloqueos'

  return [
    { title: 'Auditoría de los primeros 30 días', action: `Revisa métricas reales: contactos hechos, propuestas enviadas, respuestas recibidas, ingresos generados. No para juzgarte — para saber con precisión dónde estás respecto a ${goal}.`, duration: '30 min', measurable: '1 auditoría con métricas reales documentada' },
    { title: 'Sube tus precios un 20%', action: `Si tuviste cualquier señal de interés en ${skill}, es momento de subir. Actualiza todos tus materiales con el nuevo precio. El mercado que rechaza el aumento no era tu cliente ideal.`, duration: '20 min', measurable: 'Precios actualizados en todos los materiales' },
    { title: 'Diseña un paquete premium', action: `Crea una oferta de alto valor con ${skill}: más resultado, más exclusividad, más tiempo o acceso directo a ti. Ponle precio 2-3x mayor que tu oferta estándar. El 20% de tus clientes pagará el doble.`, duration: '30 min', measurable: '1 paquete premium definido con precio y entregables' },
    { title: 'Construye tu proceso de onboarding', action: `Define los primeros 3 pasos exactos cuando un cliente dice sí a ${skill}. Un proceso claro genera confianza y profesionalismo. Los clientes satisfechos generan referidos.`, duration: '25 min', measurable: '1 proceso de bienvenida de 3 pasos documentado' },
    { title: 'Activa un programa de referidos', action: `Escribe a 5 personas que conocen tu trabajo con ${skill} y pídeles que te refieran activamente. Ofrece algo concreto a cambio — descuento, comisión o un regalo. Los referidos convierten 3x más que el contacto en frío.`, duration: '25 min', measurable: '5 solicitudes de referido enviadas con incentivo' },
    { title: 'Refina tu cliente ideal con datos reales', action: `¿Quién respondió mejor en los primeros 30 días? ¿Quién pagó más rápido? ¿Con quién fue más fluido trabajar? Reescribe tu perfil de cliente ideal basado en evidencia, no suposiciones.`, duration: '20 min', measurable: '1 perfil de cliente ideal actualizado con evidencia real' },
    { title: 'Crea contenido que genera leads pasivos', action: `Publica algo sobre ${skill} que responda una pregunta que tu cliente ideal busca activamente. Un artículo, video corto o post optimizado. El contenido útil trabaja para ti mientras duermes.`, duration: '45 min', measurable: '1 pieza de contenido orientada a búsqueda publicada' },
    { title: 'Establece tu sistema de cobro', action: `Define y documenta cómo facturas y cobras: método de pago, plazos, recordatorios. Si no tienes sistema, créalo hoy. El dinero que no se cobra no existe. La claridad financiera atrae más clientes.`, duration: '20 min', measurable: '1 proceso de cobro documentado y activo' },
    { title: 'Automatiza una tarea repetitiva', action: `Identifica algo que haces repetidamente para conseguir clientes con ${skill} que no requiere tu talento único. Crea una plantilla, usa una herramienta o delégalo. Tu tiempo vale ${goal} por mes.`, duration: '30 min', measurable: '1 tarea automatizada o delegada con sistema' },
    { title: 'Diseña tu primera fuente de ingreso recurrente', action: `Un ingreso mensual predecible es la base de la libertad. Diseña cómo cobrar mensualmente por ${skill}: retainer, membresía, soporte continuo. Aunque sea 1 cliente fijo, ya cambia tu base.`, duration: '30 min', measurable: '1 propuesta de ingreso recurrente creada y lista para enviar' },
    { title: 'Desactiva creencias limitantes sobre el dinero', action: `Escribe las 3 creencias sobre el dinero que aún te frenan y que no resolviste en el mes pasado. Por cada una, construye una nueva creencia opuesta con evidencia real que la soporte.`, duration: '25 min', measurable: '3 creencias limitantes reemplazadas con evidencia' },
    { title: 'Recontacta tus mejores prospectos', action: `Vuelve a contactar a las 5 personas más prometedoras del primer mes que no convirtieron. Las personas dicen no por timing, no por falta de interés. Un seguimiento en el momento correcto cambia el resultado.`, duration: '30 min', measurable: '5 recontactos estratégicos con nuevo ángulo enviados' },
    { title: 'Documenta un caso de éxito', action: `Toma un resultado real que lograste con ${skill} y documéntalo con estructura: situación inicial, proceso, resultado. La autoridad se construye con evidencia específica, no con afirmaciones genéricas.`, duration: '45 min', measurable: '1 caso de éxito documentado con datos reales' },
    { title: 'Identifica el cuello de botella en tus ventas', action: `¿Dónde pierdes más prospectos? ¿En el primer contacto? ¿En la propuesta? ¿En el cierre? Identifica el punto de mayor pérdida y diseña un cambio concreto para mejorarlo esta semana.`, duration: '25 min', measurable: '1 cuello de botella identificado con plan de mejora' },
    { title: 'Revisión financiera de los 45 días', action: `Calcula honestamente: ¿cuánto generaste? ¿Cuánto falta para ${goal}? ¿Cuál es el camino más corto entre donde estás y tu meta? La claridad numérica genera estrategia.`, duration: '20 min', measurable: '1 revisión financiera con brecha y plan de cierre' },
    { title: 'Profundiza en tu nicho de expertise', action: `El primer mes identificaste tu nicho. Ahora ve más específico: dentro de ${skill}, ¿qué problema puntual puedes resolver mejor que nadie en tu mercado? La hiper-especialización cobra más y atrae clientes mejores.`, duration: '20 min', measurable: '1 nicho ultra-específico definido y comunicable' },
    { title: 'Crea escasez real o lista de espera', action: `Si tienes demanda, no aceptes a todos de inmediato. Una lista de espera o cupos limitados aumenta el valor percibido de ${skill}. La escasez genuina respeta tu capacidad y eleva tu posicionamiento.`, duration: '15 min', measurable: '1 sistema de gestión de demanda comunicado' },
    { title: 'Desarrolla una habilidad complementaria clave', action: `¿Qué habilidad añadida a ${skill} multiplicaría tu tarifa por 2? Identifícala hoy y dedica 30 minutos a comenzarla. Las combinaciones únicas de habilidades crean ventajas difíciles de copiar.`, duration: '30 min', measurable: '1 habilidad complementaria identificada y plan de desarrollo' },
    { title: 'Construye relaciones con pares de tu industria', action: `Conecta con 3 personas que trabajan en algo similar a ${skill}. No para competir — para aprender, compartir y potencialmente colaborar. Las colaboraciones entre pares abren mercados que ninguno alcanza solo.`, duration: '30 min', measurable: '3 conexiones genuinas con pares de industria' },
    { title: 'Evalúa si tu mercado te puede llevar a ${goal}', action: `Haz el cálculo: ¿cuántos clientes del perfil que tienes actualmente necesitas para llegar a ${goal}? Si el número es irreal, tu problema no es esfuerzo — es mercado. Define si necesitas repositionarte.`, duration: '20 min', measurable: '1 análisis de viabilidad de mercado completado' },
    { title: 'Crea un activo de conocimiento reutilizable', action: `Documenta tu proceso o metodología con ${skill} en formato reutilizable: guía, plantilla, checklist o mini-recurso. Los activos de conocimiento generan valor mientras no trabajas activamente.`, duration: '1 hora', measurable: '1 activo de conocimiento creado y usable' },
    { title: 'Practica negociación de alto valor', action: `En tu próxima conversación de precio, da tu tarifa con confianza y guarda silencio. No justifiques, no bajes inmediatamente. La pausa después del precio suele favorecer a quien la sostiene.`, duration: 'La próxima conversación', measurable: '1 negociación practicada con nueva técnica' },
    { title: 'Comunica tus logros públicamente', action: `Comparte un logro financiero o profesional de este período con ${skill} en tus redes o comunidad. Celebrar en voz alta refuerza tu identidad próspera y atrae nuevas oportunidades hacia ti.`, duration: '20 min', measurable: '1 logro financiero comunicado públicamente' },
    { title: 'Proyecta tus ingresos a 3 meses', action: `Con los datos reales de estos 50 días, proyecta tus ingresos potenciales si mantienes el ritmo. ¿Qué ajuste específico te acerca más a ${goal}? El futuro financiero se diseña con datos, no con esperanza.`, duration: '25 min', measurable: '1 proyección financiera a 3 meses con escenarios' },
    { title: 'Dobla tu esfuerzo en el canal que funciona', action: `¿Dónde llegaron la mayoría de tus clientes o prospectos? Referidos, contenido, contacto directo, redes. Identifica ese canal y dobla tu inversión de tiempo ahí esta semana. El foco supera la diversificación.`, duration: '30 min', measurable: '1 canal principal identificado y reforzado' },
    { title: 'Cierra compromisos que no generan hacia ${goal}', action: `Revisa tu agenda: ¿hay proyectos o compromisos que consumen tiempo sin acercarte a ${goal}? Planifica cómo terminarlos, delegarlos o renegociarlos. El tiempo liberado es el capital más escaso.`, duration: '20 min', measurable: '1 compromiso improductivo cerrado o renegociado' },
    { title: 'Conecta dos personas de tu red estratégicamente', action: `Identifica dos personas de tu red que se beneficiarían mutuamente de conocerse. Introdúcelas hoy sin esperar nada. Las personas que conectan son las que más reciben. La generosidad construye capital social real.`, duration: '20 min', measurable: '1 conexión generosa entre personas de tu red' },
    { title: 'Publica contenido de transformación', action: `Comparte un antes/después o historia de progreso relacionada con ${skill}. Un testimonio real, un proceso documentado, un resultado concreto. La transformación es el mensaje más persuasivo en cualquier mercado.`, duration: '40 min', measurable: '1 contenido de transformación publicado' },
    { title: 'Diseña tu sistema de crecimiento mensual', action: `¿Qué harás cada mes de manera sistemática para avanzar hacia ${goal}? Define 3 actividades mensuales no negociables. Los sistemas que funcionan sin motivación son los que construyen resultados reales.`, duration: '20 min', measurable: '3 actividades mensuales de crecimiento definidas y agendadas' },
    { title: 'Revisión y celebración de los 60 días', action: `Documenta todo lo que construiste: clientes, ingresos, habilidades, contactos, sistemas. Compara con el día 1. La distancia recorrida es tu mayor evidencia de que el proceso funciona.`, duration: '30 min', measurable: '1 revisión completa de 60 días documentada' },
  ]
}

// ─── DINERO INTEGRATION (días 61-90) ──────────────────────────────────────────

function buildDineroIntegration(details: GoalDetails): DailyObjective[] {
  const skill = details.skill || 'tu habilidad'
  const goal = details.monthly_goal || 'tu meta'

  return [
    { title: 'Sistematiza tu proceso completo de ventas', action: `Documenta cada paso de tu proceso — desde el primer contacto hasta el cobro — para que otro pueda ejecutarlo. Un proceso documentado puede delegarse, escalarse y mejorarse. Es la base de cualquier negocio real.`, duration: '1 hora', measurable: '1 proceso de ventas completo documentado' },
    { title: 'Lanza tu programa de referidos formal', action: `Crea y comunica tu programa de referidos: qué ofreces, a quién aplica, cómo se activa. Envíalo a todos tus clientes y contactos actuales. Los referidos son el canal de adquisición más rentable y sostenible.`, duration: '30 min', measurable: '1 programa de referidos lanzado y comunicado' },
    { title: 'Diseña tu primer ingreso 100% pasivo', action: `Identifica qué conocimiento de ${skill} puedes empacar en un producto que se vende sin tu presencia: curso, plantilla, guía premium, recurso descargable. Hoy define el producto y sus primeros 5 pasos de creación.`, duration: '45 min', measurable: '1 producto de ingreso pasivo definido con plan de creación' },
    { title: 'Escribe tu manifiesto de expertise', action: `Redacta en una página quién eres, qué resuelves con ${skill}, para quién, y por qué importa. No para publicar todavía — para tener claridad absoluta que informe cada mensaje que comunicas.`, duration: '30 min', measurable: '1 manifiesto de expertise escrito y claro' },
    { title: 'Posiciónate como referente visible', action: `Busca una oportunidad para aparecer donde está tu mercado: podcast, newsletter invitado, evento, panel, artículo externo. La visibilidad en el lugar correcto multiplica tu autoridad con ${skill}.`, duration: '30 min', measurable: '1 oportunidad de visibilidad externa identificada y contactada' },
    { title: 'Identifica tu primera contratación o colaboración', action: `¿Qué tarea de tu proceso actual podría hacer alguien más, liberando tu tiempo para lo que solo tú puedes hacer? Define el perfil, el costo y cuándo tiene sentido hacerlo. Delegar es multiplicar.`, duration: '25 min', measurable: '1 perfil de colaboración definido con criterios de activación' },
    { title: 'Crea tu metodología con nombre propio', action: `Nombra y estructura el proceso único que usas para generar resultados con ${skill}. Un método con nombre es más memorable, más vendible y más difícil de copiar que una lista de servicios genéricos.`, duration: '45 min', measurable: '1 metodología nombrada y con pasos definidos' },
    { title: 'Formaliza una alianza estratégica', action: `Elige la persona o negocio complementario más prometedor de tu red y propón una colaboración formal: referidos mutuos, co-creación, bundle de servicios. Las alianzas correctas multiplican el alcance sin multiplicar el esfuerzo.`, duration: '30 min', measurable: '1 propuesta de alianza formal enviada' },
    { title: 'Invierte una parte de lo ganado', action: `Destina el 10% de lo que generaste en este plan a una inversión: herramienta que multiplique tu capacidad, curso que acelere tu habilidad, o ahorro que construya tu colchón. El dinero invertido en ti mismo genera el mayor retorno.`, duration: '20 min', measurable: '1 inversión definida y ejecutada' },
    { title: 'Documenta tu metodología en formato guía', action: `Transforma tu metodología de ${skill} en una guía descargable de 5-10 páginas. Puede ser un lead magnet, un producto de entrada o material de ventas. El conocimiento empacado trabaja mientras duermes.`, duration: '1-2 horas', measurable: '1 guía de metodología creada y lista para compartir' },
    { title: 'Lanza un taller o clase corta', action: `Organiza un taller de 60-90 minutos sobre un problema específico que resuelves con ${skill}. Puede ser gratuito (para construir audiencia) o de pago (para generar ingreso). Enseñar posiciona como experto mejor que cualquier contenido.`, duration: '2 horas de preparación', measurable: '1 taller planificado con fecha y modo de registro' },
    { title: 'Construye tu biblioteca de contenido evergreen', action: `Identifica los 5 temas sobre ${skill} que más preguntan tus clientes. Crea una pieza de contenido definitiva sobre cada uno. El contenido evergreen se vuelve un activo permanente de atracción.`, duration: '1 hora', measurable: '5 temas evergreen definidos + 1 pieza creada' },
    { title: 'Crea o únete a un mastermind de pares', action: `Un grupo de 4-6 personas en tu nivel o superior que se reúnen mensualmente para compartir retos, avances y recursos. Los masterminds aceleran resultados más que cualquier curso. Busca uno o créalo hoy.`, duration: '30 min', measurable: '1 mastermind identificado o propuesto a pares' },
    { title: 'Crea un activo que trascienda tu tiempo', action: `Diseña algo que genere valor con ${skill} incluso cuando no trabajas activamente: comunidad, recurso automatizado, contenido en plataformas de búsqueda. Los activos que trascienden el tiempo construyen libertad.`, duration: '45 min', measurable: '1 activo de largo plazo creado o iniciado' },
    { title: 'Define tu visión financiera a 12 meses', action: `Con todo lo construido, escribe con precisión: ¿cuánto quieres ganar en 12 meses? ¿De cuántas fuentes? ¿Cuántas horas trabajando? La visión financiera específica orienta cada decisión diaria.`, duration: '25 min', measurable: '1 visión financiera a 12 meses con números y estructura' },
    { title: 'Automatiza el 80% de tu entrega de valor', action: `Identifica qué partes de cómo entregas ${skill} pueden ser plantillas, grabaciones, recursos, procesos documentados. El 80% de la entrega puede sistematizarse; tu energía va al 20% que requiere tu talento único.`, duration: '1 hora', measurable: '3 elementos de entrega automatizados o templados' },
    { title: 'Escribe tu declaración de identidad próspera', action: `Redacta en 3-5 oraciones quién eres como persona próspera — no qué haces, sino quién eres. Léela cada mañana durante el resto del plan. La identidad que declaras se convierte en el filtro de tus decisiones.`, duration: '20 min', measurable: '1 declaración de identidad próspera escrita y memorizada' },
    { title: 'Construye tu fondo de seguridad financiera', action: `Define cuánto necesitas ahorrado para operar 3 meses sin ingresos. Calcula qué porcentaje de tus ingresos actuales destinas a construirlo. La seguridad financiera no limita la abundancia — la acelera al reducir la ansiedad.`, duration: '20 min', measurable: '1 meta de fondo de seguridad definida con plan de ahorro' },
    { title: 'Identifica tu siguiente flujo de ingresos', action: `Con ${skill} como base, ¿qué flujo de ingresos completamente nuevo puedes desarrollar en los próximos 90 días? Un segundo flujo no es distracción — es el siguiente nivel de tu arquitectura financiera.`, duration: '25 min', measurable: '1 siguiente flujo de ingresos identificado con primeros pasos' },
    { title: 'Aprende de alguien 10 años adelante que tú', action: `Encuentra a alguien que ya logró lo que tú quieres con ${skill} y hazle una pregunta específica: ¿qué haría diferente en los primeros 90 días? Una respuesta honesta vale más que 100 horas de contenido genérico.`, duration: '30 min', measurable: '1 conversación de mentoría o aprendizaje completada' },
    { title: 'Publica contenido de autoridad externo', action: `Escribe un artículo invitado, graba un episodio de podcast o participa en un evento fuera de tu plataforma habitual. La autoridad externa es más poderosa que cualquier autopublicación. Una aparición externa ya cambia tu posicionamiento.`, duration: '1 hora', measurable: '1 pieza de contenido de autoridad externa publicada o enviada' },
    { title: 'Genera ingresos por colaboración o afiliación', action: `Identifica productos o servicios complementarios a ${skill} que ya usan tus clientes. Propón un acuerdo de afiliación o colaboración con quien los vende. Los ingresos por recomendación son los más eficientes en tiempo.`, duration: '30 min', measurable: '1 acuerdo de afiliación o colaboración propuesto' },
    { title: 'Documenta tu sistema de negocio completo', action: `Escribe el manual de tu negocio con ${skill}: cómo consigues clientes, cómo los sirves, cómo cobras, cómo creces. Un sistema documentado puede delegarse, replicarse y venderse. Es tu mayor activo intangible.`, duration: '1 hora', measurable: '1 manual de negocio básico documentado' },
    { title: 'Configura métricas y seguimiento de todo', action: `Define los 5 números que te dirán semanalmente si vas hacia ${goal}: ingresos, prospectos, propuestas, conversión, clientes activos. Lo que no se mide no se gestiona. Los números correctos revelan el camino.`, duration: '30 min', measurable: '5 métricas clave definidas con sistema de seguimiento semanal' },
    { title: 'Define tus próximos 5 clientes ideales con nombre', action: `Escribe 5 personas o empresas específicas a las que quieres llegar en los próximos 30 días. Con nombre, razón y primer paso de contacto. La claridad en los objetivos genera estrategia; la vaguedad genera parálisis.`, duration: '25 min', measurable: '5 prospectos nombrados con primer paso de contacto' },
    { title: 'Construye comunidad alrededor de tu expertise', action: `Una comunidad de personas interesadas en ${skill} es el activo más valioso a largo plazo. Define el formato (grupo, newsletter, canal), el tema central y el primer contenido. Empieza con 10 personas, no con 1000.`, duration: '30 min', measurable: '1 comunidad creada o formalizada con primeros miembros' },
    { title: 'Planifica tu próximo ciclo de 90 días', action: `Con todo lo aprendido, diseña tu estrategia para los próximos 90 días: meta de ingresos, acciones principales, recursos necesarios. El plan no tiene que ser perfecto — tiene que existir para poder mejorarse.`, duration: '30 min', measurable: '1 plan de 90 días definido con meta y estrategia' },
    { title: 'Establece metas trimestrales con hitos mensuales', action: `Desglosa tu meta anual en 4 trimestres y cada trimestre en 3 meses. ¿Qué tiene que ser verdad al final de cada mes para llegar a ${goal}? Los hitos mensuales convierten visiones en proyectos gestionables.`, duration: '25 min', measurable: '4 metas trimestrales + 12 hitos mensuales definidos' },
    { title: 'Calcula tu número de libertad financiera', action: `¿Cuánto necesitas generar mensualmente para que el dinero deje de ser una preocupación? Calcula ese número con honestidad. Luego calcula cuántos clientes o ventas de ${skill} necesitas. La libertad tiene un número exacto.`, duration: '20 min', measurable: '1 número de libertad financiera calculado con ruta' },
    { title: 'Celebra y documenta 90 días de transformación financiera', action: `Escribe quién eras financieramente el día 1 y quién eres hoy. No en términos de dinero solamente — en términos de mentalidad, habilidades, sistemas y claridad. La transformación documentada se convierte en combustible para el siguiente ciclo.`, duration: '30 min', measurable: '1 documento de transformación de 90 días escrito y guardado' },
  ]
}

function buildAmorCore(details: GoalDetails): DailyObjective[] {
  const relType = details.relationship_type || 'nueva'
  const env = details.social_environments || 'social'
  const activities = details.shared_activities || 'actividades que disfrutas'
  const values = details.partner_values || 'los valores que buscas'

  const envMap: Record<string, string> = {
    deportes: 'lugares deportivos, parques o clases de actividad física',
    cultura: 'eventos culturales, galerías, librerías o talleres creativos',
    social: 'reuniones, eventos de networking o encuentros de amigos',
    digital: 'comunidades online, apps de citas o grupos con intereses comunes',
  }
  const envLabel = envMap[env] || 'entornos sociales'

  return [
    { title: 'Define cómo quieres sentirte', action: `Escribe en detalle cómo quieres SENTIRTE con tu pareja ideal — no cómo es físicamente. ¿Seguro/a? ¿Visto/a? ¿Libre? La emoción que describes es la frecuencia que atraes.`, duration: '20 min', measurable: '5 emociones específicas escritas' },
    { title: 'Identifica tus patrones pasados', action: `Escribe honestamente: ¿qué patrón has repetido en tus relaciones? No para juzgarte — para reconocerlo. Lo que no se nombra, se repite.`, duration: '20 min', measurable: '1 patrón identificado con claridad' },
    { title: 'Practica amor propio activo', action: `Haz algo hoy exclusivamente para ti — sin justificarlo. Una actividad, un lugar, una experiencia que disfrutas solo/a. El amor que te das establece el estándar que aceptas de otros.`, duration: '1 hora', measurable: '1 acto de amor propio completado' },
    { title: 'Prepara tu campo social', action: `Identifica 3 lugares o eventos en ${envLabel} a los que puedes ir esta semana. Anótalos con fecha y hora. No es salir a buscar — es ponerte en el campo donde la conexión es posible.`, duration: '20 min', measurable: '3 eventos o lugares agendados' },
    { title: 'Expande tus actividades compartibles', action: `Elige una actividad nueva relacionada con ${activities} a la que nunca has ido. Inscríbete o agenda ir esta semana. Las conexiones genuinas nacen de intereses compartidos.`, duration: '20 min', measurable: '1 actividad nueva agendada' },
    { title: 'Conecta con alguien nuevo', action: `Hoy habla con una persona que no conocías antes — sin expectativas. En el trabajo, en una tienda, en una clase. El músculo de conectar se ejercita con práctica diaria.`, duration: 'El día', measurable: '1 conversación genuina con alguien nuevo' },
    { title: 'Aclara tus valores no negociables', action: `Escribe tus 5 valores no negociables en una pareja. Sé honesto/a — no lo que crees que deberías querer, sino lo que realmente necesitas. La claridad atrae personas alineadas.`, duration: '20 min', measurable: '5 valores no negociables definidos' },
    { title: 'Suelta una expectativa que te pesa', action: `Identifica una expectativa sobre el amor que te genera ansiedad. Escríbela y luego escribe cómo se vería confiar en el proceso. La rigidez aleja; la apertura atrae.`, duration: '20 min', measurable: '1 expectativa soltada conscientemente' },
    { title: 'Asiste a un evento en tu entorno', action: `Ve hoy o esta semana a ${envLabel}. No con el objetivo de conocer pareja — con el objetivo de disfrutar y estar presente. La conexión llega cuando no la persigues.`, duration: '2-3 horas', measurable: '1 evento o lugar visitado' },
    { title: 'Mejora tu energía de presencia', action: `Elige algo concreto que mejore cómo te presentas al mundo: ropa que te hace sentir bien, algo en tu imagen, tu postura o tu energía. Cuando te sientes bien contigo, otros lo sienten.`, duration: '30 min', measurable: '1 cambio concreto en tu presencia' },
    { title: 'Escribe una carta a tu pareja futura', action: `Escríbele una carta a la persona que quieres atraer — como si ya existiera. Cuéntale sobre ti, qué construirán juntos y cómo los hará sentir. Esta práctica activa la frecuencia de amor.`, duration: '20 min', measurable: '1 carta escrita con emoción genuina' },
    { title: 'Fortalece una relación existente', action: `El amor que das en tus relaciones actuales (amigos, familia) entrena tu capacidad de amar en pareja. Haz un gesto significativo hacia alguien importante hoy.`, duration: '30 min', measurable: '1 gesto de amor genuino dado' },
    { title: 'Identifica dónde están personas como la que buscas', action: `Basado en ${values}, ¿dónde están personas con esos valores? Comunidades, eventos, plataformas, profesiones. Escribe 5 lugares concretos y planifica ir a al menos uno esta semana.`, duration: '20 min', measurable: '5 lugares identificados + 1 planificado' },
    { title: 'Practica conversaciones significativas', action: `En una conversación hoy, ve más allá de lo superficial. Haz una pregunta que muestre interés genuino en la otra persona. Las conexiones profundas empiezan con preguntas reales.`, duration: 'El día', measurable: '1 conversación profunda iniciada' },
    { title: 'Revisión de la primera semana de amor', action: `¿Cuánto te abriste esta semana? ¿Cuántas conexiones nuevas hiciste? ¿Qué te costó más? Escribe 3 ajustes para la próxima semana. El amor es una práctica, no un evento.`, duration: '20 min', measurable: '3 ajustes de estrategia escritos' },
    { title: 'Libera una herida del pasado', action: `Escribe sobre una decepción amorosa que aún pesa. Luego escribe lo que aprendiste de ella. El perdón no justifica — te libera para amar de nuevo sin defensas innecesarias.`, duration: '25 min', measurable: '1 herida procesada y liberada por escrito' },
    { title: 'Amplía tu red social', action: `Acepta una invitación social que normalmente rechazarías. O crea una tú: invita a alguien a hacer algo. Cada nuevo contexto social es una nueva posibilidad de conexión.`, duration: '2+ horas', measurable: '1 encuentro social ampliado' },
    { title: 'Define cómo amas y cómo quieres ser amado/a', action: `Investiga los lenguajes del amor (palabras, tiempo, actos, regalos, contacto). ¿Cuál es el tuyo? ¿Cuál buscas en otro? Conocerte es el primer paso para conectar bien.`, duration: '20 min', measurable: '2 lenguajes del amor identificados' },
    { title: 'Haz algo que te llene de vida', action: `Cuando haces lo que amas, irradias una energía irresistible. Hoy dedica tiempo a ${activities} — no para conocer a alguien, sino para ser la versión más auténtica de ti.`, duration: '1-2 horas', measurable: '1 actividad de vida plena realizada' },
    { title: 'Conecta con intención en tu entorno', action: `Ve a ${envLabel} con la intención abierta de tener una conversación genuina con alguien. No busques resultados — busca conexión real. Una conversación auténtica ya es un éxito.`, duration: '2+ horas', measurable: '1 conexión genuina buscada activamente' },
    { title: 'Trabaja en tu seguridad interna', action: `Escribe 5 razones por las que eres una pareja valiosa. No en comparación con nadie — en relación a quien eres. La seguridad interna es el mayor atractivo. Léelas en voz alta.`, duration: '20 min', measurable: '5 cualidades propias reconocidas' },
    { title: 'Sal de tu zona de comodidad social', action: `Haz algo socialmente que normalmente no harías: iniciar una conversación, asistir solo/a a un evento, unirte a una actividad nueva. El amor suele esperarte donde no has ido aún.`, duration: '2+ horas', measurable: '1 acción fuera de zona de confort' },
    { title: 'Cultiva tus intereses como imán', action: `Las personas con pasiones son magnéticas. Dedica hoy a profundizar en ${activities}. No para impresionar — porque eso que amas en ti, atrae a quien lo valora en otros.`, duration: '1 hora', measurable: '1 pasión cultivada con dedicación' },
    { title: 'Actualiza tu presencia digital si aplica', action: `Si usas plataformas digitales para conectar, revisa hoy que tu perfil sea auténtico, cálido y refleje quien realmente eres. La autenticidad digital atrae conexiones reales.`, duration: '30 min', measurable: '1 perfil digital auténtico y actualizado' },
    { title: 'Practica el arte de escuchar', action: `En una conversación hoy, escucha para entender — no para responder. Haz preguntas de seguimiento. Las personas se sienten conectadas con quien las hace sentir vistas.`, duration: 'El día', measurable: '1 conversación con escucha activa plena' },
    { title: 'Celebra el amor que ya existe', action: `Escribe 10 formas en que el amor ya está presente en tu vida: amigos, familia, mascotas, momentos. La gratitud por el amor que tienes abre el canal para recibir más.`, duration: '15 min', measurable: '10 expresiones de amor existente reconocidas' },
    { title: 'Evalúa tu apertura emocional', action: `¿Qué tan abierto/a estás realmente para recibir amor? Escribe honestamente qué miedos aún te hacen protegerte de más. Nombrar el miedo reduce su poder.`, duration: '20 min', measurable: '1 evaluación honesta de apertura escrita' },
    { title: 'Haz un gesto de amor hacia ti', action: `Regálate algo que normalmente pospondrías: una experiencia, un objeto, tiempo libre. Tratarte bien te enseña y enseña a otros cómo tratarte.`, duration: '1+ horas', measurable: '1 gesto de amor propio significativo' },
    { title: 'Define tu próxima intención de amor', action: `Este ciclo termina. Escribe qué lograste en apertura, conexiones y amor propio. Y define una intención específica para el próximo ciclo — más concreta que la anterior.`, duration: '20 min', measurable: '1 intención de amor del próximo ciclo escrita' },
    { title: 'Celebra tu camino', action: `Escribe todo lo que hiciste este mes hacia el amor — incluyendo lo interno. Cada paso cuenta. La gratitud por el proceso acelera el resultado. Celebrar es parte del sistema.`, duration: '15 min', measurable: '1 registro completo de progreso de amor' },
  ]
}

// ─── AMOR DEEPENING (días 31-60) ──────────────────────────────────────────────

function buildAmorDeepening(details: GoalDetails): DailyObjective[] {
  const relType = details.relationship_type || 'nueva'
  const env = details.social_environments || 'social'
  const activities = details.shared_activities || 'actividades que disfrutas'
  const values = details.partner_values || 'los valores que buscas'

  const envMap: Record<string, string> = {
    deportes: 'entornos deportivos', cultura: 'eventos culturales',
    social: 'entornos sociales', digital: 'plataformas digitales',
  }
  const envLabel = envMap[env] || 'entornos sociales'

  return [
    { title: 'Audita tu apertura del primer mes', action: `¿Cuántas conexiones nuevas hiciste? ¿Cuántas conversaciones profundas? ¿Cuántas veces elegiste abrirte en lugar de cerrarte? Los datos honestos revelan el nivel de apertura real, no el que crees tener.`, duration: '20 min', measurable: '1 auditoría de apertura emocional con métricas' },
    { title: 'Practica vulnerabilidad selectiva', action: `En tu próxima conversación significativa, comparte algo genuino sobre ti que normalmente guardarías. No todo — algo. La vulnerabilidad calculada construye conexión más profunda que la perfección constante.`, duration: 'La próxima conversación', measurable: '1 momento de vulnerabilidad genuina practicado' },
    { title: 'Aprende a comunicar lo que necesitas', action: `Escribe tus 3 necesidades principales en una relación. Practica decirlas en voz alta sin disculparte. Quien no puede expresar sus necesidades, tampoco puede tener relaciones que las satisfagan.`, duration: '25 min', measurable: '3 necesidades relacionales expresadas en voz alta' },
    { title: 'Identifica tu estilo de apego', action: `Investiga los 4 estilos de apego (seguro, ansioso, evitativo, desorganizado). Identifica el tuyo con honestidad. Conocer tu patrón de apego es el primer paso para no repetirlo inconscientemente.`, duration: '30 min', measurable: '1 estilo de apego identificado y su impacto comprendido' },
    { title: 'Amplía activamente tu red social esta semana', action: `Asiste a un evento en ${envLabel} que no hayas visitado antes. No con la meta de encontrar pareja — con la meta de conectar con personas nuevas. Cada nuevo círculo social es un universo de posibilidades.`, duration: '2-3 horas', measurable: '1 entorno social nuevo visitado con conexiones' },
    { title: 'Desarrolla conversaciones más profundas', action: `Practica la pregunta de los 3 niveles: superficial (¿qué haces?), media (¿qué te apasiona?), profunda (¿qué te da miedo perder?). Las conexiones reales empiezan donde terminan las preguntas de cortesía.`, duration: '1 conversación del día', measurable: '1 conversación que llegó al tercer nivel de profundidad' },
    { title: 'Trabaja en tu magnetismo natural', action: `La presencia genuina es el mayor atractivo. Hoy, en cualquier interacción, practica estar completamente presente: sin celular, sin mente en otro lugar. La persona que realmente escucha es memorable.`, duration: 'El día', measurable: '3 interacciones con presencia total y sin distracciones' },
    { title: 'Establece límites que te respetan', action: `Identifica un límite que no has puesto en tus relaciones actuales o dinámicas sociales por miedo a molestar. Comunícalo hoy con claridad y amabilidad. Los límites sanos no alejan al amor — lo filtran para que sea real.`, duration: '20 min', measurable: '1 límite saludable comunicado con claridad' },
    { title: 'Aprende a recibir sin incomodidad', action: `Cuando alguien te haga un cumplido, te ofrezca ayuda o te exprese afecto, acepta con un "gracias" simple sin minimizar. La incapacidad de recibir bloquea el amor tanto como la incapacidad de darlo.`, duration: 'El día', measurable: '3 actos de recibir con gracia practicados' },
    { title: 'Revisión de apertura de los 40 días', action: `¿Qué tan diferente es tu campo social comparado con hace 40 días? ¿Qué conexiones nuevas tienes? ¿Qué miedos redujiste? La apertura al amor se mide en acciones, no en deseos.`, duration: '20 min', measurable: '1 revisión con 3 cambios concretos documentados' },
    { title: 'Practica escucha empática profunda', action: `En la próxima conversación importante, escucha para entender completamente antes de responder. Haz preguntas de seguimiento. Repite con tus palabras lo que escuchaste antes de opinar. La empatía activa construye vínculo instantáneo.`, duration: '1 conversación', measurable: '1 conversación con escucha empática completa' },
    { title: 'Trabaja en tu autoestima en contextos románticos', action: `Escribe 5 cualidades que te hacen una pareja valiosa — no atributos físicos, sino cualidades de carácter. Léelas frente al espejo. La autoestima romántica no es vanidad; es la base de elegir bien.`, duration: '20 min', measurable: '5 cualidades de pareja reconocidas y afirmadas' },
    { title: 'Crea una experiencia memorable con alguien', action: `Organiza o propón una actividad de ${activities} con alguien que te interesa o con quien quieres profundizar la conexión. Las experiencias compartidas crean lazos que las conversaciones no pueden.`, duration: '2-3 horas', measurable: '1 experiencia compartida memorable creada' },
    { title: 'Evalúa la calidad de tus conexiones actuales', action: `De todas las personas con quienes conectaste en este proceso, ¿cuáles tienen mayor potencial de profundidad o afinidad real? Identifica 2-3 y decide invertir más tiempo en esas específicamente.`, duration: '20 min', measurable: '2-3 conexiones prioritarias identificadas con plan' },
    { title: 'Practica presencia total en un encuentro', action: `En tu próximo encuentro con alguien que te interesa o importa, deja el teléfono en el bolsillo completamente. Nada de revisar. La presencia total es escasa y, por tanto, magnética.`, duration: '1-2 horas', measurable: '1 encuentro completo sin interrupciones digitales' },
    { title: 'Desarrolla tu inteligencia emocional romántica', action: `Aprende a identificar y nombrar lo que sientes en contextos románticos en tiempo real. ¿Emoción o miedo? ¿Atracción o proyección? ¿Interés real o necesidad de validación? La claridad emocional evita relaciones equivocadas.`, duration: '25 min', measurable: '1 ejercicio de identificación emocional romántica completado' },
    { title: 'Practica consistencia en el interés', action: `La atracción sostenida requiere consistencia, no intensidad. Mantén contacto genuino con las personas que te importan sin lapsos largos de silencio ni explosiones de atención. El ritmo constante construye confianza.`, duration: 'La semana', measurable: '3 puntos de contacto consistentes con personas clave' },
    { title: 'Trabaja la resiliencia ante el rechazo', action: `Escribe sobre la última vez que sentiste rechazo romántico o social. ¿Qué historia te contaste? ¿Cuánto de esa historia es objetivamente verdadera? El rechazo es redireccionamiento, no veredicto sobre tu valor.`, duration: '20 min', measurable: '1 experiencia de rechazo reenmarcada con perspectiva' },
    { title: 'Activa conexiones digitales con intención clara', action: `Si usas plataformas digitales, dedica 20 minutos hoy a interactuar con intención real: conversaciones genuinas, no swipes vacíos. La calidad de tu presencia digital refleja la calidad de tu presencia real.`, duration: '20 min', measurable: '3 conexiones digitales con conversación genuina iniciada' },
    { title: 'Celebra el amor propio construido', action: `Escribe cómo cambió tu relación contigo mismo/a en estos 50 días. ¿Qué te das hoy que antes te negabas? El amor propio no es un destino — es una práctica que ya empezaste y que se nota.`, duration: '20 min', measurable: '5 formas de amor propio nuevas documentadas' },
    { title: 'Profundiza en una conexión prometedora', action: `Elige la persona de tu proceso que más potencial genuino tiene y propón un encuentro más profundo: una cena, una actividad de ${activities} más significativa. La conexión real requiere inversión intencional de tiempo.`, duration: '2+ horas', measurable: '1 encuentro profundo planeado o realizado' },
    { title: 'Trabaja en tu lenguaje no verbal', action: `El 70% de la comunicación es no verbal. Hoy practica: contacto visual sostenido, postura abierta, sonrisa genuina, tono de voz cálido. El cuerpo comunica tu nivel de seguridad antes de que abras la boca.`, duration: 'El día', measurable: '4 elementos de lenguaje no verbal practicados conscientemente' },
    { title: 'Crea un ritual semanal de amor propio', action: `Diseña una práctica que harás cada semana exclusivamente para ti: una actividad, un espacio, un tiempo sagrado. El amor propio no es un gesto ocasional — es una práctica estructurada que no se cancela.`, duration: '20 min', measurable: '1 ritual semanal de amor propio definido y agendado' },
    { title: 'Identifica con claridad lo que ofreces en una relación', action: `Escribe: ¿qué tipo de pareja eres? ¿Qué llevas a una relación? ¿Cómo haces sentir a las personas cercanas a ti? Conocer tu propuesta de valor romántica te permite buscar complementariedad real.`, duration: '20 min', measurable: '1 descripción honesta de tu valor como pareja' },
    { title: 'Afina con precisión lo que buscas', action: `Después de 55 días de práctica, ¿cambió lo que buscas en una pareja? Reescribe tus 5 valores no negociables con la claridad que tienes hoy. La claridad que se afina con experiencia atrae mejor.`, duration: '20 min', measurable: '5 valores no negociables refinados con claridad actual' },
    { title: 'Trabaja tu capacidad de compromiso', action: `El mayor miedo en el amor suele ser el compromiso. Escribe honestamente: ¿qué significa para ti comprometerte? ¿Qué temes perder? ¿Qué ganarías? La claridad sobre el compromiso elimina la ambivalencia que aleja las relaciones.`, duration: '25 min', measurable: '1 reflexión honesta sobre compromiso completada' },
    { title: 'Desarrolla una visión compartible de vida', action: `Escribe cómo imaginas tu vida ideal en pareja en 5 años: dónde, cómo, con qué ritmo. No para exigirla a nadie — para saber qué tipo de persona es compatible con esa visión y orientar tu búsqueda.`, duration: '20 min', measurable: '1 visión de vida en pareja escrita con detalle' },
    { title: 'Evalúa compatibilidad real con intención', action: `En tus próximas interacciones con personas de interés, observa: ¿tienen compatibilidad en valores fundamentales? ¿En ritmo de vida? ¿En lo que quieren construir? La atracción inicia la historia; la compatibilidad la sostiene.`, duration: 'El día', measurable: '1 evaluación de compatibilidad hecha con criterios claros' },
    { title: 'Diseña tu estrategia de amor para los próximos 30 días', action: `Con todo lo aprendido, define: ¿qué entornos seguirás frecuentando? ¿Qué conexiones profundizarás? ¿Qué patrones cambiarás? Una estrategia de amor no es calcular — es dirigir tu energía con intención.`, duration: '20 min', measurable: '1 estrategia de amor de 30 días definida' },
    { title: 'Celebra 60 días eligiendo abrirte al amor', action: `Documenta tu transformación: quién eras en apertura, amor propio y claridad el día 1 versus hoy. Por pequeños que parezcan los cambios, son reales. La persona que puedes amar llega cuando tú ya eres quien quieres ser.`, duration: '20 min', measurable: '1 celebración de 60 días de práctica de amor documentada' },
  ]
}

// ─── AMOR INTEGRATION (días 61-90) ────────────────────────────────────────────

function buildAmorIntegration(details: GoalDetails): DailyObjective[] {
  const activities = details.shared_activities || 'actividades que disfrutas'
  const values = details.partner_values || 'los valores que buscas'

  return [
    { title: 'Define qué tipo de relación estás construyendo', action: `Con claridad de 60 días, escribe con precisión qué relación quieres: tipo, ritmo, profundidad, dirección. No lo que crees que deberías querer — lo que genuinamente deseas. La claridad es el mayor acto de amor propio.`, duration: '25 min', measurable: '1 definición de relación deseada clara y honesta' },
    { title: 'Desarrolla rituales de conexión', action: `Diseña 3 rituales de conexión que practiques regularmente con la persona que te importa o contigo mismo/a: una llamada semanal, un paseo mensual, una actividad de ${activities} periódica. Los rituales crean intimidad sostenida.`, duration: '20 min', measurable: '3 rituales de conexión definidos y comunicados' },
    { title: 'Practica comunicación de pareja profunda', action: `Aprende y practica la comunicación no violenta: observación + sentimiento + necesidad + petición. Úsala en la próxima conversación difícil. La forma en que comunicas determina el tipo de relación que construyes.`, duration: '30 min', measurable: '1 conversación difícil con comunicación no violenta practicada' },
    { title: 'Cultiva el amor incondicional', action: `Elige a alguien en tu vida — pareja, amigo, familiar — y practica amarlo/a sin agenda hoy: sin esperar que cambie, sin condiciones. El amor incondicional empieza como práctica antes de volverse natural.`, duration: 'El día', measurable: '1 día de amor sin condiciones ni expectativas practicado' },
    { title: 'Construye un proyecto compartido', action: `Propón o inicia un proyecto pequeño con alguien que te importa: una actividad, un objetivo, una aventura de ${activities}. Los proyectos compartidos crean historia común que el tiempo convierte en vínculo.`, duration: '2+ horas', measurable: '1 proyecto compartido propuesto o iniciado' },
    { title: 'Aprende a resolver conflictos con amor', action: `Estudia el método de "reparación después del conflicto": pausa, escucha, reconoce, repara. Aplícalo en la próxima tensión que surja. Las parejas que duran no son las que no pelean — son las que saben reparar.`, duration: '25 min', measurable: '1 técnica de reparación post-conflicto aprendida y aplicada' },
    { title: 'Expresa amor activamente todos los días', action: `Identifica el lenguaje del amor de la persona más importante para ti (palabras, actos, tiempo, regalos, contacto). Exprésalo en ese lenguaje específico hoy — no en el tuyo. El amor que llega en el idioma correcto transforma.`, duration: '30 min', measurable: '1 expresión de amor en el lenguaje correcto para la otra persona' },
    { title: 'Desarrolla el amor como práctica espiritual', action: `El amor como práctica espiritual significa amar incluso cuando no es fácil, conveniente o recíproco en el momento. Elige hoy un acto de amor que no espere nada a cambio. El amor que da sin condiciones vuelve multiplicado.`, duration: '30 min', measurable: '1 acto de amor espiritual sin expectativa de retorno' },
    { title: 'Crea las condiciones para el compromiso', action: `Identifica qué condiciones internas y externas necesitan existir para que el compromiso sea posible en el tipo de relación que buscas. El compromiso no llega por accidente — se construye intencionalmente.`, duration: '20 min', measurable: '3 condiciones para el compromiso identificadas y trabajadas' },
    { title: 'Escribe tu visión de vida en pareja a 10 años', action: `Describe con detalle cómo quieres que sea tu vida en pareja en 10 años: dónde, cómo, con qué dinámicas, creando qué juntos. Esta visión orienta qué tipo de persona estás buscando y qué tipo de pareja debes ser.`, duration: '25 min', measurable: '1 visión de vida en pareja a 10 años escrita con detalle' },
    { title: 'Practica admiración activa', action: `Identifica 5 cualidades que genuinamente admiras de la persona más importante en tu vida sentimental o en la que quieres atraer. Expresa esa admiración directamente. La admiración sostenida es el oxígeno de las relaciones largas.`, duration: '20 min', measurable: '5 admiraciones expresadas directamente' },
    { title: 'Desarrolla intimidad emocional profunda', action: `La intimidad no es física primero — es emocional. Comparte con alguien cercano algo que raramente dices: un miedo, un sueño, una vulnerabilidad real. La intimidad emocional transforma conocidos en personas realmente cercanas.`, duration: '30 min', measurable: '1 acto de intimidad emocional genuina con otra persona' },
    { title: 'Construye seguridad en el amor', action: `La seguridad romántica viene de la consistencia — en las acciones, en las palabras, en la presencia. Evalúa: ¿eres consistente en cómo te muestras con las personas que amas? La inconsistencia genera ansiedad; la consistencia genera confianza.`, duration: '20 min', measurable: '1 área de consistencia identificada y fortalecida' },
    { title: 'Práctica del apoyo mutuo genuino', action: `Apoya activamente el sueño o meta de la persona más importante en tu vida sentimental o de amistad. No con consejos — con presencia, con recursos o con acciones concretas. El apoyo real dice "creo en ti" sin palabras.`, duration: '1+ horas', measurable: '1 acto de apoyo genuino al sueño de alguien importante' },
    { title: 'Revisión de amor de los 75 días', action: `¿Qué tipo de amor tienes hoy comparado con hace 75 días? ¿Más seguro? ¿Más claro? ¿Más abierto? Documenta los 5 mayores cambios en tu vida amorosa. Los cambios internos preceden siempre a los externos.`, duration: '20 min', measurable: '5 cambios en tu vida amorosa documentados' },
    { title: 'Crea tu lenguaje privado de amor', action: `Las mejores relaciones tienen rituales únicos: palabras, gestos, bromas internas que solo existen entre esas dos personas. Crea o refuerza esos elementos con alguien importante. Lo privado construye identidad de pareja.`, duration: '30 min', measurable: '1 elemento de lenguaje o ritual privado de amor creado' },
    { title: 'Practica gratitud romántica activa', action: `Escribe 10 razones específicas por las que estás agradecido/a por el amor que ya existe en tu vida — incluyendo el amor propio construido en estos 75 días. La gratitud por el amor que tienes abre el canal para recibir más.`, duration: '20 min', measurable: '10 gratitudes románticas específicas escritas' },
    { title: 'Desarrolla curiosidad permanente por el otro', action: `La curiosidad sostenida es lo que mantiene vivas las relaciones largas. Hoy, hazte estas preguntas sobre la persona que más amas: ¿qué la asusta? ¿Qué la emociona ahora? ¿Qué ha cambiado en ella últimamente? Luego pregúntale.`, duration: '30 min', measurable: '3 preguntas profundas hechas con genuina curiosidad' },
    { title: 'Practica amar en los días difíciles', action: `El amor real no es solo fácil cuando todo va bien. Elige hoy mostrar amor hacia alguien en un momento en que te cuesta — cuando estás cansado/a, frustrado/a o decepcionado/a. Ese es el amor que construye confianza real.`, duration: 'El día', measurable: '1 acto de amor elegido conscientemente en un momento difícil' },
    { title: 'Construye tradiciones que creen historia', action: `Propón una tradición nueva con alguien importante: una cena mensual, un viaje anual, una actividad semanal de ${activities}. Las tradiciones crean continuidad y dan a las relaciones una dimensión de tiempo que las profundiza.`, duration: '20 min', measurable: '1 tradición nueva propuesta y acordada' },
    { title: 'Aprende a reparar después del conflicto', action: `Después de cualquier fricción, practica el proceso de reparación: reconocer, disculparse si aplica, comprender la perspectiva del otro, acordar hacia adelante. La velocidad de reparación determina la salud de una relación.`, duration: 'La próxima oportunidad', measurable: '1 reparación post-conflicto ejecutada con los 4 pasos' },
    { title: 'Desarrolla independencia dentro de la relación', action: `Las relaciones más sanas son entre dos personas completas, no dos mitades. Fortalece hoy algo que te hace tú — una práctica, un interés, una meta — que no depende de la relación. La independencia sana hace el amor más profundo.`, duration: '1 hora', measurable: '1 práctica de identidad propia fortalecida dentro de la relación' },
    { title: 'Practica el amor desinteresado', action: `Haz algo hoy que beneficie a alguien que amas sin que lo sepa — un gesto invisible. El amor que no necesita ser visto ni reconocido es el más puro. Practicarlo limpia el amor de ego y lo vuelve genuino.`, duration: '30 min', measurable: '1 acto de amor invisible realizado sin expectativa de reconocimiento' },
    { title: 'Define el legado emocional que quieres dejar', action: `¿Cómo quieres que las personas más cercanas te recuerden en términos de amor? ¿Qué tipo de presencia amorosa quieres ser en sus vidas? El legado emocional se construye en los gestos cotidianos, no en los momentos grandes.`, duration: '20 min', measurable: '1 declaración de legado emocional escrita' },
    { title: 'Celebra el amor que ya construiste', action: `Escribe todo el amor que generaste en estos 85 días — hacia ti, hacia otros, el amor recibido. El amor que sembraste ya existe en el mundo aunque no siempre se vea. Celebrar lo cultivado atrae más.`, duration: '15 min', measurable: '10 expresiones de amor generadas en 85 días documentadas' },
    { title: 'Enseña con el ejemplo lo que es el amor sano', action: `Piensa en alguien en tu vida — amigo, familiar, conocido — que podría beneficiarse de ver el amor sano que has construido. Sé ese ejemplo hoy sin decir nada. La demostración es más poderosa que el consejo.`, duration: 'El día', measurable: '1 día vivido como modelo de amor sano' },
    { title: 'Diseña tu próximo ciclo de amor', action: `Con 86 días de práctica, define tu intención de amor para los próximos 90 días: ¿qué quieres profundizar? ¿Qué dejas ir? ¿Qué invitas? El amor que se cultiva con intención crece; el que se deja al azar, se estanca.`, duration: '20 min', measurable: '1 intención de amor del próximo ciclo definida' },
    { title: 'Documenta tu transformación amorosa', action: `Compara quién eras en amor el día 1 versus hoy: en amor propio, en apertura, en claridad, en conexiones. La transformación puede ser sutil pero es real. Documentarla la hace irreversible.`, duration: '25 min', measurable: '1 documento de transformación amorosa de 88 días' },
    { title: 'Renueva tu intención de amor', action: `Escribe tu intención de amor más profunda — no la que crees que deberías tener, sino la que realmente sientes. Firma el papel, ponle fecha. Renovar la intención es reiniciar el campo de atracción con la claridad que hoy tienes.`, duration: '15 min', measurable: '1 intención de amor renovada y firmada' },
    { title: 'Celebra 90 días eligiendo el amor', action: `Escribe quién eras emocionalmente el día 1 y quién eres hoy. Celebra cada elección que te acercó al amor — incluyendo las que costaron. El amor que construiste en 90 días ya no puede deshacerse porque ahora es parte de quien eres.`, duration: '25 min', measurable: '1 celebración de 90 días de amor documentada' },
  ]
}

function buildSaludCore(details: GoalDetails): DailyObjective[] {
  const focus = details.health_focus || 'energia'
  const habit = details.health_habit || 'hábito de salud'
  const obstacle = details.health_obstacle || 'tu obstáculo'

  const focusLabel: Record<string, string> = {
    energia: 'energía y vitalidad',
    peso: 'composición corporal',
    mental: 'salud mental',
    especifica: 'tu condición específica',
  }
  const focusName = focusLabel[focus] || focus

  return [
    { title: 'Establece tu línea base', action: `Mide o registra tu estado actual de ${focusName}: peso, nivel de energía del 1-10, horas de sueño, cómo te sientes. No para juzgar — para saber de dónde partes.`, duration: '15 min', measurable: '1 registro de línea base completado' },
    { title: 'Define tu hábito ancla', action: `${habit} es tu compromiso principal. Hoy escríbelo como si fuera un contrato contigo: qué harás exactamente, cuándo y por cuánto tiempo. Ponlo visible.`, duration: '10 min', measurable: '1 hábito ancla definido y visible' },
    { title: 'Ejecuta tu hábito ancla por primera vez', action: `Haz ${habit} hoy — sin excusas, sin perfección. El primer día establece el patrón. Registra cómo te sentiste antes y después.`, duration: '30-45 min', measurable: '1 ejecución del hábito ancla + registro' },
    { title: 'Elimina un obstáculo concreto', action: `Identificaste "${obstacle}" como tu mayor bloqueo. Hoy toma UNA acción que lo reduzca: reorganiza tu horario, elimina algo de tu entorno o pide ayuda.`, duration: '20 min', measurable: '1 acción contra el obstáculo ejecutada' },
    { title: 'Optimiza tu alimentación hoy', action: `Sin hacer una dieta perfecta: elige hoy UN cambio en lo que comes. Más agua, menos procesados, una fruta extra. Un cambio sostenido vale más que mil cambios de un día.`, duration: 'El día', measurable: '1 mejora nutricional concreta mantenida' },
    { title: 'Duerme como acto de salud', action: `El sueño es el hábito de salud más subestimado. Hoy acuéstate 30 minutos antes de lo normal. Apaga pantallas 1 hora antes. El cuerpo sana mientras duermes.`, duration: '8 horas', measurable: 'Hora de dormir 30 min antes + pantallas apagadas' },
    { title: 'Mueve tu cuerpo con intención', action: `30 minutos de movimiento hoy — el que sea. Caminar, bailar, estirar, ejercicio. El movimiento es medicina. Registra cómo te sientes después.`, duration: '30 min', measurable: '30 min de movimiento + registro de sensación' },
    { title: 'Hidratación consciente', action: `Bebe 8 vasos de agua hoy con intención. Cada vez que bebas, piensa: "Me cuido, me nutro, me sano." La hidratación afecta energía, piel, concentración y humor.`, duration: 'El día', measurable: '8 vasos de agua registrados' },
    { title: 'Gestiona el estrés activamente', action: `El estrés es uno de los mayores enemigos de la salud. Hoy practica 10 minutos de respiración profunda: inhala 4, sostén 4, exhala 8. Repite al menos 2 veces en el día.`, duration: '10-20 min', measurable: '2 sesiones de respiración completadas' },
    { title: 'Revisa tu semana de salud', action: `¿Cuántos días ejecutaste ${habit}? ¿Cómo está tu energía comparado con hace 10 días? Escribe 3 ajustes concretos. La salud se construye con datos, no con esperanza.`, duration: '15 min', measurable: '1 revisión con 3 ajustes escritos' },
    { title: 'Aprende algo sobre tu salud específica', action: `Dedica 20 minutos a educarte sobre ${focusName}. Lee, mira o escucha algo de calidad. El conocimiento sobre tu cuerpo te da poder sobre tu salud.`, duration: '20 min', measurable: '3 aprendizajes específicos anotados' },
    { title: 'Cuida tu salud mental hoy', action: `Haz algo que nutra específicamente tu bienestar mental: journaling, meditación, una conversación honesta, tiempo en naturaleza o algo que genuinamente disfrutes.`, duration: '30 min', measurable: '1 práctica de salud mental completada' },
    { title: 'Reduce un hábito que daña tu salud', action: `Identifica el hábito que más daña tu ${focusName}. Hoy redúcelo a la mitad — no lo elimines aún, solo redúcelo. Los cambios graduales son los únicos que duran.`, duration: 'El día', measurable: '1 hábito dañino reducido a la mitad' },
    { title: 'Conecta cuerpo y mente', action: `Haz 10 minutos de movimiento consciente: yoga, tai-chi, estiramiento lento o simplemente caminar notando tu cuerpo. La conexión mente-cuerpo acelera cualquier proceso de salud.`, duration: '10-15 min', measurable: '10 min de movimiento consciente' },
    { title: 'Celebra tus logros de salud', action: `Escribe lo que tu cuerpo logró estas 2 semanas: días de hábito, cambios de energía, mejoras notadas. La celebración de avances pequeños sostiene el cambio a largo plazo.`, duration: '10 min', measurable: '5 logros de salud reconocidos y escritos' },
    { title: 'Optimiza tu entorno para la salud', action: `Tu entorno determina tus hábitos. Haz UN cambio en tu casa u oficina que haga más fácil ${habit}: pon el agua visible, prepara la ropa de ejercicio, etc.`, duration: '20 min', measurable: '1 cambio de entorno ejecutado' },
    { title: 'Busca apoyo o comunidad', action: `La salud es más fácil en comunidad. Busca o activa a alguien que comparta tu objetivo de ${focusName}: un amigo, un grupo, una clase. El apoyo social duplica la adherencia a los hábitos.`, duration: '20 min', measurable: '1 persona o comunidad de apoyo activada' },
    { title: 'Semana 3: sube la intensidad', action: `Has establecido la base. Hoy sube un nivel: más tiempo, más intensidad o un cambio adicional en ${habit}. El progreso requiere incremento gradual y constante.`, duration: '45 min', measurable: '1 nivel de intensidad aumentado' },
    { title: 'Conecta salud y energía', action: `¿Cómo está tu energía hoy en escala del 1-10? ¿Qué la afecta más: sueño, alimentación, ejercicio o estrés? Escribe los 2 factores que más impactan tu energía y ajústalos.`, duration: '15 min', measurable: '2 factores de energía identificados y ajustados' },
    { title: 'Un día de salud total', action: `Hoy integra todo: muévete, come bien, hidrátate, duerme suficiente y gestiona el estrés. No perfectamente — conscientemente. Un día de salud total muestra que es posible.`, duration: 'Todo el día', measurable: '4 pilares de salud cumplidos en el día' },
    { title: 'Evalúa tu progreso real', action: `Compara con tu línea base del día 1: ¿cómo está tu ${focusName}? Números reales. El progreso puede ser pequeño — lo que importa es que existe. Escribe lo que cambió.`, duration: '15 min', measurable: '1 comparación objetiva con línea base' },
    { title: 'Incorpora el descanso activo', action: `El descanso es parte del plan de salud. Hoy no entrenes duro — haz algo suave y restaurador. El cuerpo crece y sana en el descanso, no en el esfuerzo.`, duration: '30 min', measurable: '1 práctica de descanso activo completada' },
    { title: 'Consolida tu rutina de salud', action: `Escribe tu rutina de salud ideal: qué harás cada día para mantener y mejorar ${focusName}. Hazla simple, realista y sostenible. Las rutinas simples duran más que las perfectas.`, duration: '20 min', measurable: '1 rutina de salud sostenible definida' },
    { title: 'Celebra tu consistencia', action: `Cuenta cuántos días de los últimos 23 ejecutaste ${habit}. No te juzgues por los que faltaron — celebra los que sí. La consistencia imperfecta supera a la perfección imaginada.`, duration: '10 min', measurable: 'Conteo real de días de hábito + celebración' },
    { title: 'Identifica el siguiente nivel', action: `¿Cuál es el siguiente hábito de salud que quieres agregar una vez que ${habit} sea automático? Nómbralo y escribe cuándo lo incorporarás. La salud se construye por capas.`, duration: '15 min', measurable: '1 siguiente hábito de salud definido' },
    { title: 'Comparte tu progreso', action: `Cuéntale a alguien de confianza sobre tu progreso en ${focusName}. Hacerlo público refuerza el compromiso y puede inspirar a otros. El progreso compartido se vuelve más real.`, duration: '15 min', measurable: '1 persona informada de tu progreso' },
    { title: 'Semana 4: fortalece lo ganado', action: `La cuarta semana consolida lo construido. Haz ${habit} con más consciencia hoy — siente cómo tu cuerpo responde diferente que hace 30 días.`, duration: '45 min', measurable: '1 ejecución consciente con registro de cambios' },
    { title: 'Prepara el próximo ciclo de salud', action: `Define tu meta de salud para el próximo mes: más específica, más ambiciosa pero alcanzable. El crecimiento en salud es un proceso continuo — nunca llega, siempre evoluciona.`, duration: '20 min', measurable: '1 meta de salud del próximo ciclo definida' },
    { title: 'Ritual de gratitud por tu cuerpo', action: `Escribe 10 cosas que tu cuerpo hace por ti cada día que das por sentadas. La gratitud hacia tu cuerpo es la base de querer cuidarlo. Léelas en voz alta con la mano en tu corazón.`, duration: '15 min', measurable: '10 gratitudes corporales escritas y leídas' },
    { title: 'Cierra el ciclo y proyecta', action: `Escribe tu transformación de 30 días en salud. Por pequeña que sea, existe. Luego escribe quién quieres ser en salud en 90 días. El futuro que escribes hoy se convierte en el presente de mañana.`, duration: '20 min', measurable: '1 transformación documentada + visión a 90 días' },
  ]
}

// ─── SALUD DEEPENING (días 31-60) ─────────────────────────────────────────────

function buildSaludDeepening(details: GoalDetails): DailyObjective[] {
  const focus = details.health_focus || 'energia'
  const habit = details.health_habit || 'hábito de salud'
  const obstacle = details.health_obstacle || 'tu obstáculo'

  const focusLabel: Record<string, string> = {
    energia: 'energía y vitalidad', peso: 'composición corporal',
    mental: 'salud mental', especifica: 'tu condición específica',
  }
  const focusName = focusLabel[focus] || focus

  return [
    { title: 'Auditoría real de los primeros 30 días', action: `Mide objetivamente: ¿cuántos días ejecutaste ${habit}? ¿Cómo cambió tu ${focusName}? Compara con tu línea base del día 1. Los datos reales son más motivadores que cualquier teoría.`, duration: '20 min', measurable: '1 comparación objetiva con línea base documentada' },
    { title: 'Sube la intensidad de tu hábito ancla', action: `${habit} está establecido. Hoy súbelo un nivel: más tiempo, más intensidad o más frecuencia. El cuerpo se adapta a los estímulos — para seguir progresando necesita un estímulo mayor.`, duration: '45 min', measurable: '1 nivel de intensidad aumentado con registro de sensación' },
    { title: 'Agrega un segundo hábito de salud', action: `Tu primer hábito está sólido. Es momento de construir la siguiente capa. Elige UN hábito adicional de ${focusName} que sea sostenible. La salud se construye por capas, no de golpe.`, duration: '30 min', measurable: '1 segundo hábito de salud definido y ejecutado por primera vez' },
    { title: 'Optimiza tu nutrición con precisión', action: `En lugar de un cambio genérico, identifica el ajuste nutricional específico que más impacta tu ${focusName}. No una dieta completa — un cambio quirúrgico. Más proteína, menos azúcar procesada, mejor timing. Uno que puedas sostener.`, duration: 'El día', measurable: '1 ajuste nutricional específico implementado' },
    { title: 'Rediseña tu entorno para la salud', action: `Tu entorno determina tus hábitos más que tu fuerza de voluntad. Haz 3 cambios físicos en tu casa u oficina que hagan ${habit} más fácil y los hábitos dañinos más difíciles. Diseña el ambiente, no la disciplina.`, duration: '30 min', measurable: '3 cambios de entorno pro-salud ejecutados' },
    { title: 'Trabaja en la conexión mente-cuerpo', action: `La salud física y mental son inseparables. Practica 15 minutos de movimiento consciente hoy: cada movimiento con atención plena. La conexión mente-cuerpo acelera cualquier proceso de recuperación o mejora.`, duration: '15 min', measurable: '15 min de movimiento con conciencia plena' },
    { title: 'Optimiza tu sueño con ciencia', action: `El sueño es el hábito de salud más infrautilizado. Implementa hoy 2 mejoras concretas: hora fija de acostarte, temperatura del cuarto, exposición a luz, o rutina de cierre. La optimización del sueño multiplica los resultados de todo lo demás.`, duration: 'La noche', measurable: '2 mejoras de higiene del sueño implementadas' },
    { title: 'Gestiona el estrés como variable de salud', action: `El estrés crónico sabotea cualquier plan de salud. Identifica tu principal fuente de estrés y aplica una técnica concreta hoy: respiración 4-7-8, journaling, límite de tiempo de pantallas. El estrés gestionado es energía recuperada.`, duration: '20 min', measurable: '1 técnica de gestión de estrés aplicada y registrada' },
    { title: 'Incorpora recuperación activa', action: `El descanso no es lo opuesto del entrenamiento — es parte de él. Hoy practica recuperación activa: camina suave, estira, foam roller, baño de contraste. El cuerpo crece en el descanso, no en el esfuerzo.`, duration: '30 min', measurable: '1 sesión de recuperación activa completada' },
    { title: 'Revisión de progreso de los 40 días', action: `¿Cómo está tu ${focusName} comparado con el día 1 y con el día 30? ¿Qué está funcionando? ¿Qué necesita ajustarse? Escribe 3 cambios concretos para la próxima fase. El progreso real se mide, no se siente.`, duration: '20 min', measurable: '3 ajustes basados en datos reales de 40 días' },
    { title: 'Profundiza en el conocimiento de tu cuerpo', action: `Aprende algo específico sobre ${focusName} que te dé ventaja en tu proceso: un mecanismo fisiológico, una estrategia basada en evidencia, un protocolo probado. El conocimiento del propio cuerpo es el recurso más subestimado en salud.`, duration: '30 min', measurable: '3 conocimientos específicos de salud aprendidos y documentados' },
    { title: 'Trabaja en la salud mental activamente', action: `La salud mental no es ausencia de problemas — es capacidad de gestionarlos. Hoy practica algo que nutre específicamente tu bienestar mental: journaling profundo, meditación guiada, conversación honesta. Es tan importante como el ejercicio.`, duration: '30 min', measurable: '1 práctica de salud mental específica completada' },
    { title: 'Elimina definitivamente el hábito que más daña', action: `Identificaste "${obstacle}" como tu mayor bloqueo. Después de 42 días, es momento de atacarlo con más determinación. Diseña un plan de eliminación gradual con pasos concretos, no solo intención.`, duration: '25 min', measurable: '1 plan de eliminación de hábito dañino con pasos y fechas' },
    { title: 'Activa tu red de apoyo de salud', action: `La salud en comunidad es más fácil y más sostenible. Busca o activa a alguien que comparta tu objetivo de ${focusName}: un compañero de entrenamiento, un grupo, una clase. El apoyo social duplica la adherencia a hábitos.`, duration: '20 min', measurable: '1 persona o comunidad de apoyo de salud activada' },
    { title: 'Celebra la consistencia de 45 días', action: `Cuenta cuántos días ejecutaste ${habit} en los últimos 45. No te juzgues por los que faltaron — celebra los que sí. La consistencia imperfecta del 70% supera a la perfección del 100% que nunca llega.`, duration: '15 min', measurable: 'Conteo real de días + celebración documentada' },
    { title: 'Implementa un protocolo de bienestar matutino', action: `Diseña una rutina de mañana de 15-30 minutos que active tu ${focusName}: movimiento, hidratación, intención, nutrición. Las primeras horas del día determinan el tono fisiológico y mental de todo lo que sigue.`, duration: '30 min', measurable: '1 protocolo matutino de salud diseñado y ejecutado' },
    { title: 'Mide con herramientas lo que sientes', action: `Lo que se mide, mejora. Elige una métrica concreta de ${focusName} que puedas rastrear semanalmente: peso, energía del 1-10, pasos diarios, horas de sueño, variabilidad de frecuencia cardíaca. Un número honesto vale más que mil sensaciones.`, duration: '20 min', measurable: '1 métrica clave de salud con sistema de seguimiento semanal' },
    { title: 'Profundiza en el protocolo de hidratación', action: `La deshidratación crónica impacta energía, concentración, recuperación y humor antes de que sientas sed. Implementa hoy un protocolo de hidratación real: cantidad, timing, calidad del agua. Simple pero transformador.`, duration: 'El día', measurable: '2.5L de agua consumidos con registro horario' },
    { title: 'Trabaja la relación emocional con tu cuerpo', action: `¿Cómo hablas de tu cuerpo internamente? El lenguaje que usas sobre él determina cómo lo tratas. Escribe 10 cosas que tu cuerpo hace bien hoy — no lo que quisieras que fuera, sino lo que ya es. La gratitud corporal es medicina.`, duration: '20 min', measurable: '10 gratitudes específicas hacia tu cuerpo escritas' },
    { title: 'Integra movimiento en tu vida cotidiana', action: `El ejercicio formal es una parte del movimiento total. Diseña hoy cómo agregar movimiento en tu rutina diaria sin llamarlo "ejercicio": escaleras, caminatas cortas, estiramientos en pausas. El movimiento acumulado es tan poderoso como el estructurado.`, duration: 'El día', measurable: '30 min adicionales de movimiento incorporado en rutina diaria' },
    { title: 'Evalúa tu progreso real con datos', action: `Compara tu estado actual con tu línea base del día 1 usando los mismos indicadores. ¿Cuánto cambió tu ${focusName}? ¿Qué cambió además de lo que mediste? El progreso invisible también es real — nómbralo.`, duration: '20 min', measurable: '1 evaluación objetiva con comparación de 3 indicadores' },
    { title: 'Trabaja en la longevidad como objetivo', action: `La salud no es solo para hoy — es para los próximos 40 años. Aprende sobre un hábito con mayor impacto en longevidad: sueño, fuerza muscular, vínculos sociales, propósito. Planta hoy algo que cosecharás en décadas.`, duration: '30 min', measurable: '1 hábito de longevidad identificado e incorporado' },
    { title: 'Consolida tu rutina de salud definitiva', action: `Diseña tu rutina de salud ideal sostenible a largo plazo: qué harás cada día, cada semana, cada mes para mantener y mejorar ${focusName}. Simple, realista, no perfecta. Las rutinas que duran son las que caben en tu vida real.`, duration: '25 min', measurable: '1 rutina de salud sostenible documentada con frecuencias' },
    { title: 'Practica un día de salud total consciente', action: `Hoy integra todos los pilares: movimiento, nutrición, hidratación, sueño, gestión de estrés, conexión social. No perfectamente — conscientemente. Un día donde todos los pilares se cuidan muestra que es posible.`, duration: 'Todo el día', measurable: '5 pilares de salud cumplidos conscientemente en un día' },
    { title: 'Identifica el siguiente nivel de tu salud', action: `Después de 55 días, ¿cuál es el siguiente hábito que quieres incorporar una vez que ${habit} sea completamente automático? La salud óptima se construye por capas. Nombrar la siguiente capa ya activa la preparación para ella.`, duration: '15 min', measurable: '1 siguiente hábito de salud identificado y planificado' },
    { title: 'Comparte tu progreso de salud', action: `Cuéntale a alguien de confianza sobre tu transformación de ${focusName} en estos 55 días. Hacerlo público refuerza el compromiso y puede inspirar a alguien cercano. El progreso compartido se vuelve más permanente.`, duration: '20 min', measurable: '1 persona informada sobre tu transformación de salud' },
    { title: 'Diseña un plan de salud para los 90 días siguientes', action: `Con lo aprendido en 57 días, diseña tu siguiente plan: nuevo hábito ancla, meta específica de ${focusName}, ajuste nutricional, protocolo de recuperación. El plan que sigue siempre es mejor porque lo construyes con experiencia real.`, duration: '25 min', measurable: '1 plan de salud de 90 días diseñado' },
    { title: 'Trabaja en la imagen corporal con compasión', action: `La relación con tu cuerpo determina la sostenibilidad de cualquier hábito de salud. Escribe una carta de reconciliación a tu cuerpo: por lo que le has pedido, por lo que te ha dado, por lo que quieres construir juntos.`, duration: '20 min', measurable: '1 carta de reconciliación con tu cuerpo escrita' },
    { title: 'Prepara tu próximo ciclo de salud', action: `Define la meta de ${focusName} para los próximos 30 días: específica, medible, alcanzable pero desafiante. El crecimiento en salud no termina — evoluciona. Siempre hay un siguiente nivel disponible para quien sigue moviéndose.`, duration: '20 min', measurable: '1 meta de salud del próximo ciclo definida con criterios' },
    { title: 'Celebra 60 días de cuidar tu cuerpo', action: `Documenta tu transformación de salud en 60 días. Por pequeña que parezca, es real y es tuya. La persona que eligió el hábito difícil el día que no tenía ganas merece ser reconocida. Esa persona eres tú.`, duration: '20 min', measurable: '1 celebración de 60 días de práctica de salud documentada' },
  ]
}

// ─── SALUD INTEGRATION (días 61-90) ───────────────────────────────────────────

function buildSaludIntegration(details: GoalDetails): DailyObjective[] {
  const focus = details.health_focus || 'energia'
  const habit = details.health_habit || 'hábito de salud'

  const focusLabel: Record<string, string> = {
    energia: 'energía y vitalidad', peso: 'composición corporal',
    mental: 'salud mental', especifica: 'tu condición específica',
  }
  const focusName = focusLabel[focus] || focus

  return [
    { title: 'Sistematiza tu protocolo de salud completo', action: `Documenta tu rutina de salud completa — mañana, tarde, noche, semanal, mensual — como si tuvieras que enseñársela a alguien. Un sistema documentado puede sostenerse incluso en los días de menor motivación.`, duration: '30 min', measurable: '1 protocolo de salud completo documentado' },
    { title: 'Convierte tu hábito en identidad', action: `Ya no es algo que haces — es algo que eres. Escribe: "Soy una persona que [tu hábito ancla]" y 5 evidencias de que eso es verdad. La identidad de salud es más poderosa que cualquier meta de peso o rendimiento.`, duration: '20 min', measurable: '1 identidad de salud declarada con 5 evidencias reales' },
    { title: 'Alcanza un hito de rendimiento significativo', action: `Define y ejecuta hoy un hito de ${focusName} que sería imposible para quien eras el día 1: correr una distancia, levantar un peso, meditar por más tiempo, dormir una semana completa. Los hitos concretos hacen el progreso irrefutable.`, duration: '1-2 horas', measurable: '1 hito de rendimiento personal alcanzado y registrado' },
    { title: 'Aprende sobre biohacking aplicado', action: `Investiga una estrategia de optimización de ${focusName} basada en evidencia: ayuno intermitente, crioterapia, entrenamiento de fuerza, meditación de alta intensidad. No como moda — como herramienta. Elige una y diseña cómo probarla.`, duration: '30 min', measurable: '1 protocolo de biohacking identificado y planificado para probar' },
    { title: 'Enseña lo que aprendiste a alguien', action: `Comparte tu proceso de transformación de ${focusName} con alguien que lo necesita. No como experto — como alguien que recorrió el camino. Enseñar consolida lo aprendido y puede cambiar la vida de otro.`, duration: '30-45 min', measurable: '1 persona que recibió tu experiencia de salud' },
    { title: 'Construye tu entorno de salud permanente', action: `Haz cambios permanentes en tu entorno que hagan los hábitos saludables la opción por defecto: reorganiza tu cocina, tu espacio de ejercicio, tu cuarto. El entorno que facilita ${habit} es el mayor aliado a largo plazo.`, duration: '1 hora', measurable: '3 cambios permanentes de entorno pro-salud ejecutados' },
    { title: 'Incorpora la salud mental como pilar central', action: `La salud mental es tan importante como la física y generalmente menos atendida. Establece hoy una práctica regular de salud mental: psicoterapia, meditación diaria, journaling. No como respuesta a crisis — como mantenimiento preventivo.`, duration: '30 min', measurable: '1 práctica de salud mental establecida como hábito semanal' },
    { title: 'Explora la medicina preventiva', action: `Agenda los chequeos de salud preventivos que has postergado: análisis de sangre, densitometría, chequeo dental, revisión cardiovascular. La salud proactiva detecta lo que la reactiva ya no puede prevenir.`, duration: '20 min', measurable: '1-3 chequeos preventivos agendados' },
    { title: 'Trabaja la salud como inversión de largo plazo', action: `Calcula cuánto gastarías en enfermedad versus cuánto inviertes en prevención. La salud es el activo con mayor retorno en calidad de vida. Define tu presupuesto mensual de salud y lo que incluye.`, duration: '25 min', measurable: '1 presupuesto de inversión en salud definido con categorías' },
    { title: 'Desarrolla resiliencia fisiológica', action: `La resiliencia fisiológica es la capacidad del cuerpo de adaptarse al estrés y recuperarse. Practica hoy algo que incomode deliberadamente tu cuerpo en dosis controladas: ducha fría, ejercicio de alta intensidad breve, ayuno de 16 horas.`, duration: '30 min', measurable: '1 práctica de resiliencia fisiológica completada' },
    { title: 'Evalúa tu salud con perspectiva de 75 días', action: `Compara con el día 1 y el día 30: ¿cómo cambió tu ${focusName} en 75 días? No solo en el aspecto físico — en energía, en estado mental, en calidad de vida. La salud que se sostiene 75 días ya es un cambio estructural.`, duration: '20 min', measurable: '1 evaluación de 75 días con perspectiva de cambio estructural' },
    { title: 'Crea un plan de salud para las épocas difíciles', action: `Todos tenemos períodos de viaje, estrés extremo o falta de tiempo. Diseña hoy tu "protocolo mínimo viable de salud" para esos días: qué haces cuando no puedes hacer todo. El mínimo sostenido supera al máximo abandonado.`, duration: '20 min', measurable: '1 protocolo mínimo de salud para períodos difíciles' },
    { title: 'Trabaja en la dimensión espiritual de la salud', action: `La salud completa incluye una dimensión de sentido y propósito. ¿Tu salud actual te permite vivir el propósito que tienes? ¿Qué nivel de salud necesitas para hacer lo que viniste a hacer? Conectar salud con propósito es el motivador más profundo.`, duration: '20 min', measurable: '1 reflexión sobre salud y propósito documentada' },
    { title: 'Optimiza tu recuperación post-esfuerzo', action: `La recuperación es donde ocurre el progreso real. Diseña un protocolo de recuperación completo: nutrición post-ejercicio, sueño, técnicas de relajación activa. Quienes se recuperan mejor progresan más con menos esfuerzo.`, duration: '25 min', measurable: '1 protocolo de recuperación post-esfuerzo implementado' },
    { title: 'Construye hábitos de salud social', action: `La salud se practica también en comunidad: cenas conscientes con amigos, actividad física compartida, conversaciones sobre bienestar. La salud social no es opcional — es uno de los predictores más fuertes de longevidad.`, duration: '2 horas', measurable: '1 actividad de salud compartida con otras personas' },
    { title: 'Diseña tu cocina y alimentación para el largo plazo', action: `La alimentación no debería requerir fuerza de voluntad — debería ser el resultado de un entorno bien diseñado. Reorganiza tu cocina: lo saludable visible y accesible, lo dañino fuera del alcance inmediato.`, duration: '45 min', measurable: '1 cocina reorganizada para facilitar alimentación saludable' },
    { title: 'Practica la compasión en los días de quiebre', action: `Habrá días en que no cumplas ${habit}. La compasión ante el quiebre es la diferencia entre un tropiezo y una recaída. Escribe cómo te tratarás a ti mismo/a en esos días: con exactamente la misma amabilidad que le darías a un amigo.`, duration: '15 min', measurable: '1 protocolo de auto-compasión ante el quiebre escrito' },
    { title: 'Conecta con la medicina de la naturaleza', action: `El contacto con la naturaleza reduce el cortisol, aumenta la creatividad y mejora el sistema inmune. Diseña cómo incorporar naturaleza en tu vida semanal: un parque, una caminata, un jardín. La naturaleza sana lo que la tecnología no puede.`, duration: '1 hora', measurable: '1 hora en naturaleza + plan de incorporación semanal' },
    { title: 'Trabaja en la salud financiera como parte de la salud total', action: `El estrés financiero es una de las principales causas de deterioro de salud física y mental. Define una acción financiera que reduzca ese estrés: un ahorro, un gasto eliminado, una deuda atacada. La salud integral incluye la financiera.`, duration: '25 min', measurable: '1 acción financiera ejecutada que reduce estrés de salud' },
    { title: 'Evalúa tus relaciones como variable de salud', action: `Las relaciones tóxicas o de baja calidad deterioran la salud tanto como el tabaco. Evalúa honestamente: ¿cuáles de tus relaciones actuales suman energía y cuáles la drenan? La salud relacional es salud física.`, duration: '20 min', measurable: '1 evaluación relacional con decisión de acción documentada' },
    { title: 'Alcanza tu mejor versión medible', action: `Define y ejecuta hoy algo que sea tu mejor resultado medible en ${focusName}: la mejor marca, el día más completo, la semana más consistente. Tener un pico de referencia te muestra lo que es posible en tu mejor versión.`, duration: '1-2 horas', measurable: '1 mejor resultado personal medible de todo el plan' },
    { title: 'Crea un manifiesto de salud personal', action: `Escribe en una página tus principios de salud: cómo tratas tu cuerpo, qué priorizas, qué nunca comprometes. Un manifiesto se convierte en tu brújula en los momentos de menor claridad.`, duration: '25 min', measurable: '1 manifiesto de salud personal escrito' },
    { title: 'Construye un sistema de monitoreo de por vida', action: `Define qué indicadores de ${focusName} monitorearás cada semana, mes y año para el resto de tu vida. No para obsesionarte — para detectar tendencias antes de que se conviertan en problemas. La prevención requiere sistemas, no solo intención.`, duration: '20 min', measurable: '1 sistema de monitoreo de salud de por vida definido' },
    { title: 'Transmite tu transformación de salud', action: `Crea algo que documente o comparta tu transformación de ${focusName}: una publicación, una conversación, un mensaje. Tu proceso puede cambiar la decisión de alguien que está donde tú estabas hace 83 días.`, duration: '30 min', measurable: '1 transmisión de transformación de salud creada' },
    { title: 'Celebra la persona que se cuida', action: `Escribe quién eras en salud el día 1 — cómo te tratabas, qué priorizabas, cómo te sentías. Y quién eres hoy. La persona que se cuida es diferente a nivel de identidad, no solo de hábitos. Esa transformación ya es permanente.`, duration: '25 min', measurable: '1 celebración de identidad de salud transformada escrita' },
    { title: 'Establece tu protocolo de mantenimiento anual', action: `Diseña qué harás cada año para mantener y evolucionar tu ${focusName}: revisiones médicas, metas de rendimiento, renovación de hábitos. La salud a largo plazo no se da por sentada — se cultiva con rituales anuales.`, duration: '20 min', measurable: '1 protocolo de mantenimiento anual de salud definido' },
    { title: 'Aprende de tu cuerpo como sistema inteligente', action: `Tu cuerpo siempre está comunicando. Aprende a leer sus señales: calidad del sueño, nivel de energía, digestión, humor. Estas señales son datos de biofeedback que ningún médico puede darte. Desarrolla ese vocabulario corporal.`, duration: '25 min', measurable: '5 señales corporales identificadas e interpretadas' },
    { title: 'Diseña tu siguiente reto de salud', action: `Los retos que elegimos nos mantienen creciendo. Define tu siguiente desafío de ${focusName} para los próximos 90 días: algo que te parezca difícil pero posible. El cuerpo necesita metas que lo entusiasmen, no solo hábitos que lo mantengan.`, duration: '20 min', measurable: '1 siguiente reto de salud definido con fecha y criterios' },
    { title: 'Integra cuerpo, mente y espíritu en tu práctica', action: `La salud completa integra lo físico, lo mental y lo espiritual. Diseña una práctica semanal que atienda los tres: movimiento físico, trabajo mental y conexión con algo más grande que tú — naturaleza, meditación, propósito.`, duration: '25 min', measurable: '1 práctica semanal integradora de cuerpo-mente-espíritu diseñada' },
    { title: 'Deja un legado de salud en tu entorno', action: `Tu transformación puede impactar a quienes te rodean. ¿Qué hábito de salud puedes sembrar en tu familia o círculo cercano? No con imposición — con ejemplo e invitación. La salud en comunidad es exponencialmente más poderosa.`, duration: '30 min', measurable: '1 hábito de salud sembrado en el entorno cercano' },
    { title: 'Celebra 90 días de ser tu propio guardián', action: `Escribe quién eras en salud el día 1 y quién eres hoy en cada dimensión: física, mental, emocional, energética. Eres la persona que eligió cuidarse cuando no era fácil. Esa identidad ya no puede quitársete.`, duration: '25 min', measurable: '1 celebración completa de 90 días de transformación de salud' },
  ]
}

function buildPropositoCore(details: GoalDetails): DailyObjective[] {
  const flow = details.flow_activities || 'lo que te apasiona'
  const impact = details.desired_impact || 'el impacto que quieres generar'
  const clarity = details.purpose_clarity || 'buscando'

  return [
    { title: 'Escribe sin filtros tu propósito', action: `Pon un temporizador de 10 minutos y escribe: ¿Para qué estás aquí? ¿Qué pasaría si no lo hicieras? No edites. Las respuestas más honestas salen sin pensar.`, duration: '10 min', measurable: '1 escritura de propósito sin filtros' },
    { title: 'Identifica tus momentos de flujo', action: `¿Cuándo pierdes la noción del tiempo? Escribe 5 actividades específicas — incluyendo ${flow}. El propósito suele vivir en los momentos de flujo que ignoramos.`, duration: '15 min', measurable: '5 momentos de flujo identificados' },
    { title: 'Define el impacto que quieres tener', action: `Escribe con detalle: ¿Cómo quieres que el mundo sea diferente por haber existido tú? Enfócate en ${impact}. La claridad del impacto orienta todas las decisiones.`, duration: '20 min', measurable: '1 declaración de impacto específica escrita' },
    { title: 'Actúa desde tu propósito hoy', action: `Haz UNA cosa hoy alineada con ${impact}. Puede ser pequeña — lo que importa es que sea intencional. El propósito se vive en actos, no en reflexiones.`, duration: '30-60 min', measurable: '1 acción intencional de propósito ejecutada' },
    { title: 'Identifica quién ya vive tu propósito', action: `Busca 3 personas que ya están viviendo un propósito similar al tuyo. Estudia cómo llegaron ahí, qué hicieron primero, qué obstáculos superaron. El camino existe — alguien ya lo recorrió.`, duration: '30 min', measurable: '3 referentes de propósito estudiados' },
    { title: 'Elimina lo que te aleja de tu propósito', action: `Identifica UNA actividad, compromiso o hábito que consume tu tiempo y energía sin alinear con tu propósito. Decide cómo reducirlo o eliminarlo esta semana.`, duration: '15 min', measurable: '1 distractor identificado con plan de eliminación' },
    { title: 'Comparte tu propósito con alguien', action: `Cuéntale a una persona de confianza sobre tu propósito de ${impact}. Expresarlo en voz alta lo vuelve más real. La reacción de esa persona también te dará información.`, duration: '30 min', measurable: '1 propósito compartido en voz alta' },
    { title: 'Crea algo desde tu propósito', action: `Produce algo hoy — un texto, un audio, un dibujo, un plan — que esté completamente alineado con ${flow} y ${impact}. Crear desde el propósito es la forma más directa de vivirlo.`, duration: '45 min', measurable: '1 creación desde el propósito completada' },
    { title: 'Aprende algo que acelere tu propósito', action: `Identifica un conocimiento o habilidad que necesitas para generar ${impact}. Dedica 30 minutos a aprenderlo hoy. El propósito bien ejecutado requiere capacidad.`, duration: '30 min', measurable: '1 conocimiento clave aprendido y anotado' },
    { title: 'Revisión del propósito en acción', action: `¿Cuánto de tu semana pasó alineada con tu propósito? ¿Cuánto en lo urgente pero no importante? Escribe 3 cambios concretos para alinear más tu tiempo con ${impact}.`, duration: '20 min', measurable: '3 cambios de prioridad definidos' },
    { title: 'Diseña tu rutina de propósito', action: `¿A qué hora y por cuánto tiempo trabajas en tu propósito cada día? Define un bloque de tiempo sagrado para ${flow}. Lo que no se agenda, no sucede.`, duration: '15 min', measurable: '1 bloque de tiempo de propósito agendado diariamente' },
    { title: 'Conecta con tu comunidad de propósito', action: `Busca o activa una comunidad de personas que comparten tu orientación hacia ${impact}. Pueden ser grupos, eventos, redes. El propósito en comunidad crece más rápido.`, duration: '30 min', measurable: '1 comunidad de propósito identificada o activada' },
    { title: 'Supera el miedo a brillar', action: `Escribe tus miedos más honestos sobre vivir completamente tu propósito. ¿Qué temes que digan? ¿Qué temes perder? Lo que no se nombra, bloquea. Lo que se nombra, se puede superar.`, duration: '20 min', measurable: '3 miedos de propósito nombrados y procesados' },
    { title: 'Da un paso que te parezca grande', action: `Identifica una acción hacia ${impact} que has postergado por miedo o por sentirlo muy grande. Hoy da el primer paso de esa acción — solo el primero.`, duration: '30-60 min', measurable: '1 primer paso de acción grande ejecutado' },
    { title: 'Mide tu alineación de propósito', action: `Del 1 al 10: ¿qué tan alineada está tu vida actual con tu propósito? Escribe qué necesitaría cambiar para llegar a 10. No para angustiarte — para clarificarte.`, duration: '15 min', measurable: '1 evaluación de alineación + plan de mejora' },
    { title: 'Profundiza en ${flow}', action: `Dedica tiempo profundo a ${flow} hoy — no como hobbie, sino como manifestación de tu propósito. Cuando lo haces con intención, se convierte en una práctica de vivir tu misión.`, duration: '1 hora', measurable: '1 hora de profundización en actividad de flujo' },
    { title: 'Escribe tu manifiesto de propósito', action: `Redacta en media página quién eres, qué haces y por qué importa. No para publicar — para tener claro. El manifiesto se convierte en tu brújula cuando el camino no es claro.`, duration: '25 min', measurable: '1 manifiesto de propósito escrito' },
    { title: 'Impacta a alguien hoy', action: `Haz algo concreto hoy que genere ${impact} — aunque sea en una sola persona. El propósito se vuelve real cuando tocas la vida de otro. Una acción real, no imaginada.`, duration: '30-60 min', measurable: '1 impacto concreto en al menos 1 persona' },
    { title: 'Revisa y ajusta tu camino', action: `¿Estás en el camino correcto hacia ${impact}? ¿Qué señales te lo indican? Escribe honestamente. El propósito no siempre es recto — a veces requiere ajustar la dirección.`, duration: '20 min', measurable: '1 revisión honesta + ajuste si necesario' },
    { title: 'Construye un sistema para tu propósito', action: `Los grandes propósitos necesitan sistemas, no solo inspiración. Diseña hoy un proceso simple que te permita avanzar hacia ${impact} incluso en los días que no te sientes inspirado.`, duration: '25 min', measurable: '1 sistema de propósito diseñado' },
    { title: 'Reconoce tu avance', action: `Escribe todo lo que has hecho en los últimos 20 días hacia tu propósito. Los avances hacia el propósito suelen ser invisibles hasta que los documentas. Reconocerlos te da energía para continuar.`, duration: '15 min', measurable: '1 registro completo de avances de propósito' },
    { title: 'Amplía tu impacto', action: `¿Cómo puedes multiplicar ${impact}? Enseñando, colaborando, documentando, escalando. Escribe una idea concreta para que tu propósito toque más vidas.`, duration: '25 min', measurable: '1 idea de amplificación de impacto definida' },
    { title: 'Integra propósito en tu vida cotidiana', action: `¿Cómo puedes vivir ${impact} en tus actividades más cotidianas? La cena, las conversaciones, tu trabajo actual. El propósito no espera condiciones perfectas — se practica ahora.`, duration: '20 min', measurable: '3 micro-actos de propósito en el día' },
    { title: 'Genera algo que trascienda el tiempo', action: `Crea algo hoy que pueda existir después de que tú no estés: un texto, un recurso, una enseñanza, un sistema. La trascendencia empieza con un acto de creación intencional.`, duration: '45 min', measurable: '1 creación con intención de trascendencia' },
    { title: 'Renueva tu compromiso de propósito', action: `Escribe por qué tu propósito de ${impact} importa — no para el mundo, sino para ti. ¿Por qué NO puedes no hacerlo? El compromiso profundo no viene del deber, viene del amor.`, duration: '15 min', measurable: '1 declaración de compromiso renovada' },
    { title: 'Busca una mentoría o guía', action: `¿Quién podría acelerar tu camino hacia ${impact}? Identifica a esa persona y escríbele hoy — pide consejo, una llamada o cualquier punto de contacto. Los mentores comprimen el tiempo.`, duration: '20 min', measurable: '1 solicitud de mentoría o consejo enviada' },
    { title: 'Documenta tu transformación', action: `¿En qué se ha transformado tu relación con tu propósito en estos 26 días? Escribe la diferencia entre quien eras el día 1 y quien eres hoy. La transformación documentada se vuelve poder.`, duration: '20 min', measurable: '1 registro de transformación de propósito escrito' },
    { title: 'Da tu mayor paso hasta ahora', action: `¿Cuál sería la acción más valiente que podrías dar hoy hacia ${impact}? La que has postergado más. Hazla hoy — completamente o el primer paso de ella.`, duration: '1 hora', measurable: '1 acción más valiente ejecutada' },
    { title: 'Define tu propósito del próximo ciclo', action: `Con todo lo que descubriste, escribe tu propósito refinado para el próximo mes. Más claro, más concreto, más tuyo. El propósito evoluciona — y eso es señal de que estás vivo en él.`, duration: '20 min', measurable: '1 propósito refinado para el próximo ciclo' },
    { title: 'Celebra vivir con propósito', action: `Escribe todo lo que este mes te acercó a ${impact}. Luego haz algo que celebre quién te estás convirtiendo al vivir con propósito. La celebración es parte del sistema.`, duration: '20 min', measurable: '1 celebración consciente de 30 días de propósito' },
  ]
}

// ─── PROPÓSITO DEEPENING (días 31-60) ─────────────────────────────────────────

function buildPropositoDeepening(details: GoalDetails): DailyObjective[] {
  const flow = details.flow_activities || 'lo que te apasiona'
  const impact = details.desired_impact || 'el impacto que quieres generar'

  return [
    { title: 'Audita tu alineación del primer mes', action: `¿Cuánto de tu tiempo real estuvo alineado con ${impact}? Calcula el porcentaje honestamente. La brecha entre el tiempo que dices que importa y el tiempo que realmente inviertes es el mapa de tu siguiente trabajo.`, duration: '20 min', measurable: '1 auditoría de alineación de tiempo con métricas reales' },
    { title: 'Profundiza en el "por qué" de tu propósito', action: `Pregúntate 5 veces "¿por qué?" sobre tu ${impact}. Cada respuesta revela una capa más profunda. El propósito más duradero no viene de lo que quieres hacer — viene de quién no puedes dejar de ser.`, duration: '20 min', measurable: '5 capas de "por qué" exploradas y documentadas' },
    { title: 'Supera la resistencia que detiene tu propósito', action: `Identifica la resistencia específica que aparece cuando estás a punto de actuar desde tu propósito. ¿Es miedo al rechazo? ¿A no ser suficiente? ¿Al cambio que implicaría? Nombrarla con precisión es el primer paso para disolverla.`, duration: '25 min', measurable: '1 resistencia principal nombrada con plan de acción' },
    { title: 'Crea desde tu propósito con más profundidad', action: `Dedica 60 minutos a crear algo desde ${flow} con la intención explícita de generar ${impact}. No para que sea perfecto — para que sea genuino. La creación con propósito tiene una energía que el trabajo sin él no puede tener.`, duration: '1 hora', measurable: '1 creación de propósito completada con intención clara' },
    { title: 'Desarrolla habilidades que multiplican tu impacto', action: `¿Qué habilidad específica, si la desarrollaras, multiplicaría tu capacidad de generar ${impact}? Identifícala hoy y diseña cómo desarrollarla en los próximos 30 días. Las habilidades estratégicas aceleran el propósito.`, duration: '25 min', measurable: '1 habilidad multiplicadora identificada con plan de desarrollo' },
    { title: 'Elimina con decisión lo que no alinea', action: `Después de 35 días, ¿qué actividades, compromisos o relaciones siguen consumiendo energía sin acercarte a ${impact}? Elige UNO y toma hoy una decisión para eliminarlo, reducirlo o transformarlo.`, duration: '20 min', measurable: '1 elemento no alineado eliminado o reducido decisivamente' },
    { title: 'Construye autoridad alrededor de tu propósito', action: `La autoridad en ${impact} se construye con consistencia pública. Publica algo hoy que demuestre tu pensamiento, tu proceso o tu visión. Quien comparte su propósito en voz alta atrae a las personas y oportunidades que lo hacen posible.`, duration: '45 min', measurable: '1 publicación de autoridad de propósito compartida' },
    { title: 'Conecta con tu comunidad de propósito', action: `Identifica y activa una comunidad de personas que comparten la orientación hacia ${impact}. Puede ser un grupo existente o el inicio de uno nuevo. El propósito en comunidad se acelera y se sostiene mejor que el solitario.`, duration: '30 min', measurable: '1 comunidad de propósito identificada y contactada' },
    { title: 'Genera impacto medible esta semana', action: `Define una acción concreta que genere ${impact} en al menos 3 personas antes de que termine la semana. El propósito se vuelve real cuando se puede medir en personas afectadas, no solo en intenciones descritas.`, duration: '1 hora', measurable: '3 personas impactadas concretamente esta semana' },
    { title: 'Revisión de alineación de los 40 días', action: `¿Cómo cambió tu relación con tu propósito en 40 días? ¿Qué se clarificó? ¿Qué descubriste que no sabías? Escribe 3 aprendizajes sobre tu propósito que solo se pueden saber viviéndolo, no pensándolo.`, duration: '20 min', measurable: '3 aprendizajes de propósito en acción documentados' },
    { title: 'Diseña un sistema para tu propósito', action: `La inspiración inicia el propósito; los sistemas lo sostienen. Diseña hoy un proceso simple que te permita trabajar en ${impact} incluso en los días de poca energía: mínimo tiempo, mínimo esfuerzo, máximo avance.`, duration: '25 min', measurable: '1 sistema de propósito diseñado con protocolo mínimo' },
    { title: 'Enfrenta el miedo a tu máxima expresión', action: `Imagina que vives completamente tu propósito de ${impact}. ¿Qué te da más miedo de esa versión de ti? El miedo a brillar en tu máxima expresión es el obstáculo más común y menos nombrado del propósito.`, duration: '25 min', measurable: '1 miedo a la máxima expresión identificado y confrontado' },
    { title: 'Enseña lo que sabes sobre tu propósito', action: `Enseñar es la forma más profunda de aprender y de generar ${impact}. Organiza o participa en un espacio donde puedas compartir lo que sabes: clase, conversación, contenido, taller. El conocimiento que se enseña se consolida y multiplica.`, duration: '1 hora', measurable: '1 acto de enseñanza desde tu propósito completado' },
    { title: 'Da un paso que te parezca demasiado grande', action: `Identifica una acción hacia ${impact} que has evitado por parecerte demasiado ambiciosa o prematura. Da hoy el primer paso de esa acción — solo el primero. Los grandes pasos del propósito siempre parecen prematuros antes de darlos.`, duration: '30-60 min', measurable: '1 primer paso de acción grande ejecutado' },
    { title: 'Mide tu impacto real con evidencia', action: `¿Hay evidencia concreta de que estás generando ${impact}? Testimonios, cambios en personas, resultados medibles. Recoge esa evidencia hoy. El propósito respaldado por evidencia real genera una convicción que ninguna reflexión puede crear.`, duration: '25 min', measurable: '3 evidencias concretas de impacto recolectadas' },
    { title: 'Profundiza en ${flow} como práctica de propósito', action: `Dedica 90 minutos a ${flow} con la intención explícita de alcanzar el estado de flujo — donde pierdes la noción del tiempo. El flujo sostenido es la experiencia más clara de que estás en tu propósito.`, duration: '90 min', measurable: '1 sesión de flujo sostenido de 90 minutos completada' },
    { title: 'Escribe tu manifiesto de propósito definitivo', action: `Redacta en media página quién eres en tu propósito, qué haces, para quién y por qué importa. No la versión que te gustaría tener — la que puedes defender hoy con evidencia. El manifiesto real se escribe desde la acción, no desde la aspiración.`, duration: '30 min', measurable: '1 manifiesto de propósito definitivo escrito y revisado' },
    { title: 'Impacta a alguien que no esperabas', action: `Haz algo hoy que genere ${impact} en una persona o contexto donde no lo tenías planeado. Los propósitos más poderosos trascienden sus canales habituales. La oportunidad de impacto está en todos los momentos, no solo en los planificados.`, duration: '30 min', measurable: '1 impacto inesperado generado con intención' },
    { title: 'Construye alianzas que multipliquen tu propósito', action: `Identifica 3 personas cuyos propósitos se suman al tuyo — no idénticos, sino complementarios. Escríbeles con una propuesta concreta de colaboración. Los propósitos se multiplican en alianza.`, duration: '30 min', measurable: '3 alianzas de propósito propuestas' },
    { title: 'Evalúa tu modelo de impacto', action: `¿Cómo puedes generar ${impact} para 10x más personas con el mismo esfuerzo? ¿Con contenido, comunidad, tecnología, delegación? El modelo de impacto determina el techo de tu propósito.`, duration: '25 min', measurable: '1 modelo de impacto escalable diseñado' },
    { title: 'Documenta tu proceso de propósito', action: `Registra cómo trabajas en ${impact}: tu método, tu rutina, tus herramientas, tus principios. Documentar tu proceso lo hace más replicable, enseñable y escalable. El propósito documentado puede crecer más allá de quien lo inició.`, duration: '30 min', measurable: '1 proceso de propósito documentado' },
    { title: 'Amplía tu círculo de impacto', action: `¿Cómo puedes tocar más vidas con ${impact}? Enseñando, publicando, colaborando, escalando. Elige la forma de amplificación más alineada contigo y da un paso en esa dirección hoy.`, duration: '30 min', measurable: '1 acción de amplificación de impacto ejecutada' },
    { title: 'Trabaja en los días de oscuridad del propósito', action: `Todo propósito tiene días de duda: ¿para qué? ¿Vale la pena? ¿Quién soy yo para esto? Escribe hoy una carta para esos momentos futuros. Léela desde el lugar de claridad que tienes hoy. La carta del propósito es un ancla para las tormentas.`, duration: '20 min', measurable: '1 carta de propósito para los días difíciles escrita' },
    { title: 'Genera contenido de legado', action: `Crea algo hoy que pueda existir y generar ${impact} después de que tú no estés: un artículo, un recurso, una enseñanza, un sistema. La trascendencia empieza en actos de creación con conciencia de que trascienden el tiempo.`, duration: '1 hora', measurable: '1 contenido de legado creado y publicado o guardado' },
    { title: 'Renueva tu compromiso desde la experiencia', action: `Después de 55 días de acción, renueva tu compromiso con ${impact} desde la experiencia real, no desde la aspiración inicial. ¿Por qué NO puedes no hacer esto? El compromiso renovado desde la vivencia es más sólido que el inicial desde el entusiasmo.`, duration: '20 min', measurable: '1 compromiso de propósito renovado desde la experiencia' },
    { title: 'Busca mentores o guías para tu siguiente nivel', action: `¿Quién ya generó ${impact} al nivel que tú quieres alcanzar? Identifica a esa persona e inicia un camino de acceso a su sabiduría: libro, podcast, contacto directo, programa. Los mentores comprimen décadas en meses.`, duration: '25 min', measurable: '1 mentor o guía de propósito identificado y primer paso de acceso' },
    { title: 'Documenta tu transformación de propósito', action: `Compara quién eras en propósito el día 1 versus hoy. ¿Qué cambió en claridad, en acción, en impacto real? La transformación de propósito es la más profunda porque toca identidad. Documentarla la hace permanente.`, duration: '20 min', measurable: '1 transformación de propósito de 57 días documentada' },
    { title: 'Da tu mayor paso hacia ${impact}', action: `¿Cuál sería la acción más valiente que podrías dar hoy hacia ${impact}? La que has postergado más, la que más te da miedo, la que cambiaría más tu trayectoria. Hazla hoy — completamente o el primer paso real.`, duration: '1 hora', measurable: '1 acción más valiente de propósito ejecutada' },
    { title: 'Define tu propósito refinado para el siguiente ciclo', action: `Con 59 días de experiencia real, reescribe tu propósito: más preciso, más concreto, más tuyo. El propósito que se afina con la acción es más poderoso que el que nació perfecto en el papel.`, duration: '20 min', measurable: '1 propósito refinado definido para el siguiente ciclo' },
    { title: 'Celebra 60 días viviendo con propósito', action: `Documenta todo lo que te acercó a ${impact} en 60 días. La persona que actúa desde su propósito todos los días — incluyendo los difíciles — es ya la persona que su propósito necesita que sea.`, duration: '20 min', measurable: '1 celebración de 60 días de propósito en acción' },
  ]
}

// ─── PROPÓSITO INTEGRATION (días 61-90) ───────────────────────────────────────

function buildPropositoIntegration(details: GoalDetails): DailyObjective[] {
  const flow = details.flow_activities || 'lo que te apasiona'
  const impact = details.desired_impact || 'el impacto que quieres generar'

  return [
    { title: 'Sistematiza tu motor de impacto', action: `Documenta el sistema completo que usas para generar ${impact}: cómo lo planificas, cómo lo ejecutas, cómo lo mides, cómo lo mejoras. Un sistema de propósito documentado puede crecer más allá de tu energía personal.`, duration: '1 hora', measurable: '1 sistema de impacto documentado con todos sus componentes' },
    { title: 'Construye tu plataforma de propósito', action: `Define cuál es el canal principal desde el que generarás ${impact} a escala: una comunidad, una plataforma de contenido, un servicio, un movimiento. La plataforma convierte el propósito personal en impacto colectivo.`, duration: '45 min', measurable: '1 plataforma de propósito definida y con primeros pasos activos' },
    { title: 'Lanza algo que no existía antes de ti', action: `Crea y lanza hoy algo nuevo orientado a ${impact}: un recurso, una iniciativa, un proyecto, una propuesta. No cuando esté perfecto — cuando esté suficientemente bueno para generar impacto real en alguien.`, duration: '2 horas', measurable: '1 creación nueva lanzada al mundo' },
    { title: 'Empieza a construir un equipo de propósito', action: `Los grandes propósitos no se ejecutan solos. Identifica a 1-3 personas que podrían compartir, apoyar o complementar tu trabajo en ${impact}. La conversación de propósito compartido puede iniciar colaboraciones que transformen la escala de tu impacto.`, duration: '30 min', measurable: '1-3 personas identificadas para equipo de propósito' },
    { title: 'Desarrolla liderazgo desde el propósito', action: `El liderazgo de propósito no se impone — se inspira. Practica hoy liderar a alguien hacia ${impact} desde el ejemplo: muestra cómo lo vives tú, no cómo debería vivirlo el otro. El liderazgo inspirador multiplica el impacto.`, duration: '1 hora', measurable: '1 acto de liderazgo inspirador desde el propósito' },
    { title: 'Monetiza tu propósito de manera sostenible', action: `El propósito que no se sostiene económicamente tiene fecha de vencimiento. Diseña cómo ${impact} puede generar los recursos que permitan seguir haciéndolo a largo plazo. No con avaricia — con visión de sostenibilidad.`, duration: '30 min', measurable: '1 modelo de sostenibilidad económica del propósito diseñado' },
    { title: 'Crea un movimiento alrededor de tu propósito', action: `Un movimiento nace cuando tu propósito resuena con suficientes personas para crear identidad colectiva. Define el nombre, el manifiesto y los primeros 10 miembros de tu movimiento hacia ${impact}.`, duration: '45 min', measurable: '1 concepto de movimiento definido con identidad y primeros miembros' },
    { title: 'Trabaja en la maestría de tu propósito', action: `La maestría en ${flow} requiere práctica deliberada: no repetición, sino esfuerzo en los bordes de tu capacidad actual. Hoy practica algo específico dentro de ${flow} que esté en la frontera de lo que puedes hacer bien.`, duration: '1 hora', measurable: '1 sesión de práctica deliberada en la frontera de tu habilidad' },
    { title: 'Escala tu impacto con tecnología o sistemas', action: `¿Cómo puede la tecnología multiplicar tu capacidad de generar ${impact}? Una herramienta, una plataforma, un proceso automatizado. La tecnología al servicio del propósito puede multiplicar el impacto sin multiplicar el esfuerzo.`, duration: '30 min', measurable: '1 herramienta o sistema tecnológico al servicio de ${impact}' },
    { title: 'Crea contenido que inspire a otros a su propósito', action: `Comparte tu proceso de vivir con propósito de forma que inspire a otros a encontrar el suyo — no a copiar el tuyo. El mayor impacto del propósito no es lo que creas directamente, sino los propósitos que activas en otros.`, duration: '45 min', measurable: '1 contenido inspirador de propósito creado y compartido' },
    { title: 'Evalúa tu impacto con evidencia de 75 días', action: `¿Qué evidencia concreta tienes de que ${impact} ocurrió en estos 75 días? Testimonios, cambios observables, resultados medibles. El propósito evaluado con evidencia real genera convicción que ninguna reflexión puede dar.`, duration: '25 min', measurable: '5 evidencias concretas de impacto de 75 días documentadas' },
    { title: 'Desarrolla resiliencia de propósito', action: `Los propósitos grandes enfrentan obstáculos grandes. Escribe los 3 mayores desafíos que tu propósito podría enfrentar y diseña cómo los navegarías. La resiliencia de propósito se construye antes de necesitarla.`, duration: '25 min', measurable: '3 escenarios de adversidad de propósito con plan de respuesta' },
    { title: 'Construye puentes entre tu propósito y otros', action: `Identifica 5 personas en tu red cuyos propósitos se beneficiarían del tuyo y viceversa. Crea un espacio de encuentro: una conversación, un proyecto, una colaboración. Los propósitos que se conectan se multiplican.`, duration: '30 min', measurable: '5 puentes de propósito identificados y al menos 1 activado' },
    { title: 'Trabaja en la coherencia total de tu propósito', action: `¿Tu vida cotidiana — decisiones de tiempo, dinero, relaciones, trabajo — está alineada con ${impact}? La coherencia entre lo que dices ser y cómo vives es la medida real del propósito. Identifica la mayor incoherencia y trabájala hoy.`, duration: '25 min', measurable: '1 incoherencia de propósito identificada y plan de alineación' },
    { title: 'Crea un legado tangible este mes', action: `Diseña y ejecuta algo concreto este mes que pueda existir después de ti: un recurso, un documento, un sistema, una comunidad. El legado no es un plan futuro — es lo que creas hoy con conciencia de que trasciende el tiempo.`, duration: '2 horas', measurable: '1 pieza de legado tangible creada este mes' },
    { title: 'Fortalece tu identidad de propósito', action: `Ya no es algo que haces — es quien eres. Escribe: "Soy alguien que genera ${impact}" y 10 evidencias de que eso es verdad hoy. La identidad de propósito es el anclaje que sostiene el camino en los momentos de duda.`, duration: '20 min', measurable: '1 identidad de propósito declarada con 10 evidencias reales' },
    { title: 'Enseña tu metodología de propósito', action: `Organiza una experiencia donde enseñes a otros cómo encontrar o vivir su propósito — basándote en tu proceso real. Enseñar el camino al propósito es uno de los impactos más profundos que puedes tener.`, duration: '1-2 horas', measurable: '1 experiencia de enseñanza de propósito organizada' },
    { title: 'Integra propósito en cada área de tu vida', action: `¿Cómo se expresa ${impact} en tu trabajo, tus relaciones, tu salud, tu dinero, tu ocio? El propósito integrado no es una actividad separada — es el filtro desde el que vives todo. Identifica cómo integrarlo en 3 áreas más.`, duration: '25 min', measurable: '3 áreas de vida donde el propósito está integrado' },
    { title: 'Desarrolla la paciencia del propósito', action: `Los grandes propósitos se miden en años, no en días. Escribe cómo quieres que sea tu impacto en 10 años si sigues con la dirección actual. La visión larga transforma la impaciencia a corto plazo en movimiento sostenido.`, duration: '20 min', measurable: '1 visión de impacto a 10 años escrita' },
    { title: 'Celebra cada impacto sin importar el tamaño', action: `Escribe todos los impactos que generaste esta semana, por pequeños que sean. Una conversación que inspiró, un recurso que ayudó, una presencia que importó. Celebrar cada impacto entrena el propósito para buscar más.`, duration: '15 min', measurable: '7 impactos de la semana celebrados por escrito' },
    { title: 'Construye un programa o producto de propósito', action: `Diseña un programa, curso, servicio o producto que empaque tu conocimiento de ${impact} en algo que otros puedan usar de forma independiente. El conocimiento empacado es el propósito que trabaja mientras duermes.`, duration: '1 hora', measurable: '1 programa o producto de propósito diseñado con estructura' },
    { title: 'Trabaja en el impacto sistémico', action: `¿Cómo puede ${impact} afectar no solo a individuos sino a sistemas: organizaciones, comunidades, estructuras? El propósito sistémico trasciende el impacto personal y se convierte en cambio cultural. Define una acción en esa dirección.`, duration: '30 min', measurable: '1 acción de impacto sistémico identificada y ejecutada' },
    { title: 'Documenta las historias de impacto', action: `Recopila historias concretas de personas cuya vida se vio afectada por tu trabajo hacia ${impact}. Las historias son el lenguaje del propósito — son lo que inspira a otros a continuar cuando los datos no alcanzan.`, duration: '30 min', measurable: '3 historias de impacto documentadas' },
    { title: 'Diseña tu arquitectura de propósito de por vida', action: `Define cómo estructurarás tu vida para que ${impact} sea posible para siempre: cuánto tiempo, qué recursos, qué sistemas, qué comunidad. El propósito de por vida requiere una arquitectura de por vida.`, duration: '30 min', measurable: '1 arquitectura de propósito sostenible diseñada' },
    { title: 'Celebra quién te convertiste en 85 días', action: `Escribe la diferencia entre quien eras en propósito el día 1 y quien eres hoy. No en logros externos — en claridad, en compromiso, en identidad, en impacto. La persona que vive con propósito es una persona diferente.`, duration: '25 min', measurable: '1 celebración de transformación de propósito de 85 días' },
    { title: 'Activa tu siguiente nivel de impacto', action: `Con 86 días de práctica, ¿cuál es el siguiente nivel de ${impact} que es posible para ti? ¿Más personas, más profundidad, más escala, más sostenibilidad? Define ese siguiente nivel y el primer paso para alcanzarlo.`, duration: '25 min', measurable: '1 siguiente nivel de impacto definido con primer paso' },
    { title: 'Escribe tu historia de propósito', action: `Documenta tu historia de propósito completa: desde la confusión inicial hasta la claridad de hoy. Esta historia es un activo que puede inspirar a otros y es la evidencia más poderosa de que tu propósito es real.`, duration: '30 min', measurable: '1 historia de propósito escrita de principio a fin' },
    { title: 'Diseña tu próximo ciclo de propósito', action: `Define tu intención de propósito para los próximos 90 días: ¿qué impacto específico quieres generar? ¿Con quiénes? ¿De qué forma? El propósito no termina en 90 días — evoluciona en ciclos cada vez más profundos.`, duration: '25 min', measurable: '1 intención de propósito del próximo ciclo definida' },
    { title: 'Transmite el fuego del propósito', action: `Identifica a alguien en tu entorno que está buscando su propósito y comparte tu proceso con generosidad. No para que siga el tuyo — para que encuentre el suyo. Transmitir el fuego del propósito es el mayor acto de impacto.`, duration: '1 hora', measurable: '1 persona acompañada en el proceso de claridad de propósito' },
    { title: 'Celebra 90 días viviendo con propósito pleno', action: `Escribe quién eras el día 1 y quién eres hoy en cada dimensión del propósito. Luego declara en voz alta tu propósito con toda la convicción que construiste en 90 días. Esta declaración ya es diferente — viene desde quien eres, no desde quien esperas ser.`, duration: '30 min', measurable: '1 celebración de 90 días de propósito pleno documentada y declarada' },
  ]
}

function buildFelicidadCore(details: GoalDetails): DailyObjective[] {
  const blocker = details.joy_blockers || 'trabajo'
  const joyActs = details.joy_activities || 'lo que te da alegría'
  const change = details.happiness_change || 'el cambio que necesitas'

  return [
    { title: 'Define tu alegría auténtica', action: `Escribe 5 momentos en tu vida donde fuiste genuinamente feliz. ¿Qué tenían en común? Esa es la firma de tu felicidad. Hoy la defines — no la que debería ser, la que es.`, duration: '20 min', measurable: '5 momentos + 3 elementos en común' },
    { title: 'Identifica lo que roba tu alegría', action: `¿Qué situación, persona o patrón mental te quita la alegría más frecuentemente? Nómbralo con honestidad — sin culpa. Lo que se nombra, se puede cambiar.`, duration: '15 min', measurable: '1-3 ladrones de alegría nombrados' },
    { title: 'Una hora de gozo puro', action: `Dedica 1 hora a ${joyActs} — sin justificarlo, sin hacerlo productivo. Solo porque te alegra. La felicidad no es un premio que se merece — es una práctica que se elige.`, duration: '1 hora', measurable: '1 hora de gozo sin justificación' },
    { title: 'Reduce lo que te pesa', action: `Toma UN paso hoy para reducir lo que identificaste como tu mayor ladrón de alegría. Si es ${blocker === 'trabajo' ? 'tu rutina' : blocker === 'relaciones' ? 'una relación difícil' : blocker === 'mente' ? 'tus pensamientos negativos' : 'la falta de dirección'}: ¿qué puedes cambiar hoy?`, duration: '20-30 min', measurable: '1 acción concreta para reducir el ladrón de alegría' },
    { title: 'Practica gratitud profunda', action: `Escribe 10 cosas pequeñas y cotidianas por las que estás agradecido/a hoy. No las grandes — las pequeñas. La gratitud por lo cotidiano es la base más sólida de la felicidad duradera.`, duration: '15 min', measurable: '10 gratitudes cotidianas escritas' },
    { title: 'Conecta con alguien que te alegra', action: `Llama, visita o escribe a una persona que genuinamente te alegra estar con ella. No por obligación — por alegría. Las relaciones que dan energía son uno de los mayores predictores de felicidad.`, duration: '30-60 min', measurable: '1 conexión alegre activa hoy' },
    { title: 'Haz algo por primera vez', action: `La novedad activa el cerebro y genera bienestar. Haz algo hoy que nunca hayas hecho — puede ser pequeño: un lugar nuevo, un alimento nuevo, una ruta diferente.`, duration: '1 hora', measurable: '1 experiencia nueva completada' },
    { title: 'Trabaja en el cambio que traerá felicidad', action: `Escribiste que "${change}" haría tu vida más feliz. Hoy da el primer paso concreto hacia ese cambio. No el cambio completo — el primer paso. Los grandes cambios empiezan con pasos pequeños.`, duration: '30 min', measurable: '1 primer paso hacia el cambio deseado' },
    { title: 'Practica la presencia total', action: `Elige una actividad de hoy y hazla con presencia total: sin celular, sin distracción. Comer, caminar, conversar. La presencia es la puerta a la alegría que ya existe.`, duration: '30-60 min', measurable: '1 actividad con presencia total' },
    { title: 'Revisión de alegría de la semana', action: `¿Cuántos momentos genuinos de alegría tuviste esta semana? ¿Qué los provocó? ¿Qué los impidió? Escribe 3 ajustes para tener más alegría la próxima semana.`, duration: '15 min', measurable: '3 ajustes para más alegría escritos' },
    { title: 'Da alegría para recibirla', action: `Haz algo que alegre a otra persona hoy — sin esperar nada. Un mensaje, un gesto, un detalle. La alegría que das regresa multiplicada. El universo es un espejo.`, duration: '20-30 min', measurable: '1 acto de dar alegría ejecutado' },
    { title: 'Cuida tu energía', action: `La felicidad requiere energía. Hoy duerme bien, muévete, come algo que te nutra. No hay alegría sostenible sin un cuerpo bien cuidado. La salud y la felicidad se alimentan mutuamente.`, duration: 'Todo el día', measurable: '3 pilares de energía cuidados: sueño, movimiento, nutrición' },
    { title: 'Suelta una obligación que no te alegra', action: `Identifica algo en tu agenda que haces por obligación sin que te aporte alegría ni propósito. Hoy decide: ¿puedes eliminarlo? ¿Delegarlo? ¿Reducirlo? Lo que no alegra ni aporta, pesa.`, duration: '15 min', measurable: '1 obligación sin alegría ni propósito eliminada o reducida' },
    { title: 'Celebra un logro aunque sea pequeño', action: `Identifica algo que hayas hecho bien en los últimos días — por pequeño que sea. Celébralo en serio: escríbelo, cuéntaselo a alguien o date un regalo simbólico. Celebrar entrena al cerebro a buscar más victorias.`, duration: '20 min', measurable: '1 logro celebrado conscientemente' },
    { title: 'Diseña un día de felicidad', action: `Planifica un día próximo (esta semana) donde todo gire alrededor de ${joyActs}. Desde la mañana hasta la noche. No para cuando tengas tiempo — agéndalo ahora como cita ineludible.`, duration: '20 min', measurable: '1 día de felicidad planeado y agendado' },
    { title: 'Practica la aceptación', action: `Hay cosas que no puedes cambiar hoy. Escribe 3 y practica decirles: "Acepto que esto es así ahora — y desde aquí elijo mi respuesta." La aceptación no es rendirse — es liberar energía para lo que sí puedes cambiar.`, duration: '15 min', measurable: '3 situaciones aceptadas con intención' },
    { title: 'Activa un sueño postergado', action: `¿Hay algo que siempre quisiste hacer y postergaste? Hoy no lo hagas completo — da el primer paso. Compra el libro, inscríbete, escribe el plan. Los sueños postergados pesan más que el trabajo de realizarlos.`, duration: '20-30 min', measurable: '1 primer paso hacia un sueño postergado' },
    { title: 'Vive el presente con intención', action: `Hoy, al menos 3 veces, detente y pregúntate: "¿Qué tiene de bueno este momento?" Aunque sea pequeño. El cerebro encuentra lo que busca — entrenar la búsqueda de lo bueno cambia la realidad percibida.`, duration: 'El día', measurable: '3 pausas de apreciación del presente' },
    { title: 'Expresa lo que sientes', action: `La felicidad reprimida no dura. Di hoy lo que sientes — alegría, gratitud, amor, admiración — a alguien que lo merece escuchar. La expresión emocional honesta conecta y libera.`, duration: '20 min', measurable: '1 expresión emocional honesta hacia otra persona' },
    { title: 'Reduce el ruido digital', action: `El ruido constante de redes y noticias drena la alegría sin que lo notemos. Hoy desconéctate al menos 2 horas consecutivas. Observa cómo cambia tu estado mental en ese tiempo.`, duration: '2 horas', measurable: '2 horas sin consumo digital + registro del estado' },
    { title: 'Crea algo hermoso', action: `La creatividad genera bienestar. Hoy crea algo — cocina algo especial, arregla un espacio, escribe algo, dibuja, fotografía. No importa el resultado. El acto de crear alegra.`, duration: '45 min', measurable: '1 creación estética completada' },
    { title: 'Conecta con la naturaleza', action: `La naturaleza reduce el cortisol y aumenta la dopamina. Hoy pasa al menos 20 minutos en un parque, jardín o espacio natural — sin celular. La naturaleza recalibra.`, duration: '20-30 min', measurable: '20 min en naturaleza sin pantallas' },
    { title: 'Practica la generosidad', action: `Da algo hoy — tiempo, dinero, conocimiento, ayuda — sin esperar nada. La generosidad activa el sistema de recompensa del cerebro más que recibirlo. Dar bien genera alegría profunda.`, duration: '30 min', measurable: '1 acto de generosidad genuina ejecutado' },
    { title: 'Revisión de 24 días de alegría', action: `Escribe tus 5 mayores aprendizajes sobre tu felicidad en estos 24 días. ¿Qué descubriste que te alegra? ¿Qué descubriste que te pesa? Este autoconocimiento es el activo más valioso.`, duration: '20 min', measurable: '5 aprendizajes de felicidad propia escritos' },
    { title: 'Vive tu día ideal de alegría', action: `Hoy es el día que planeaste el día 15. Vívelo completamente — sin culpa, sin postergarlo, sin "primero termino esto". La alegría que postergamos es la que más duele no haber vivido.`, duration: 'Todo el día', measurable: '1 día completo de felicidad intencional vivido' },
    { title: 'Cierra lo que pesa', action: `¿Hay algo incompleto que te genera ruido mental? Una conversación pendiente, una decisión, una tarea. Hoy ciérralo — o decide conscientemente dejarlo ir. Los asuntos abiertos drenan la alegría silenciosamente.`, duration: '30-60 min', measurable: '1 asunto incompleto cerrado o liberado' },
    { title: 'Cultiva la esperanza', action: `Escribe 3 cosas que esperas con ilusión en los próximos meses. No con ansiedad — con esperanza activa. La esperanza es la emoción que sostiene la alegría en los días difíciles.`, duration: '15 min', measurable: '3 expectativas positivas escritas con ilusión' },
    { title: 'Agradece en voz alta', action: `Di gracias en voz alta — a alguien, al universo, a la vida. No en silencio: en voz alta. La voz tiene frecuencia y esa frecuencia cambia tu estado interno cuando expresa gratitud real.`, duration: '10-15 min', measurable: '3 gratitudes expresadas en voz alta' },
    { title: 'Define tu práctica diaria de alegría', action: `¿Qué hará que la alegría sea un hábito sostenible en tu vida? Escribe UNA práctica diaria de 10-15 minutos que puedas mantener para siempre. La felicidad no llega — se practica.`, duration: '15 min', measurable: '1 práctica diaria de alegría definida y sostenible' },
    { title: 'Celebra 30 días de elegir la felicidad', action: `Escribiste, actuaste, soltaste, diste, recibiste y practicaste. Hoy celebra que elegiste activamente la felicidad cada día. Eso no es pequeño. Escribe quién eres ahora comparado con el día 1.`, duration: '20 min', measurable: '1 celebración y reflexión de transformación de 30 días' },
  ]
}

// ─── FELICIDAD DEEPENING (días 31-60) ─────────────────────────────────────────

function buildFelicidadDeepening(details: GoalDetails): DailyObjective[] {
  const blocker = details.joy_blockers || 'trabajo'
  const joyActs = details.joy_activities || 'lo que te da alegría'
  const change = details.happiness_change || 'el cambio que necesitas'

  return [
    { title: 'Audita tu alegría del primer mes', action: `¿Cuántos momentos genuinos de alegría tuviste en los primeros 30 días? ¿Qué los generó? ¿Qué los bloqueó? Los datos reales de tu alegría son más valiosos que cualquier teoría sobre la felicidad.`, duration: '20 min', measurable: '1 auditoría de alegría con momentos contados y fuentes identificadas' },
    { title: 'Profundiza en tus fuentes de gozo auténtico', action: `De todo lo que probaste el primer mes, ¿qué generó el gozo más genuino y sostenido? Hoy profundiza en eso — no en lo que debería hacerte feliz, sino en lo que ya demostró hacerlo.`, duration: '1 hora', measurable: '1 fuente de gozo auténtico profundizada con registro' },
    { title: 'Trabaja en la felicidad de fondo', action: `La felicidad de fondo es un estado base de bienestar que no depende de eventos externos. Se construye con prácticas: sueño, ejercicio, vínculos, propósito. Identifica cuál de estos pilares está más débil y trabájalo hoy.`, duration: '30 min', measurable: '1 pilar de felicidad de fondo fortalecido' },
    { title: 'Reduce con decisión lo que más roba tu alegría', action: `Después de 31 días, ¿sigue siendo ${blocker === 'trabajo' ? 'la rutina de trabajo' : blocker === 'relaciones' ? 'alguna relación difícil' : blocker === 'mente' ? 'los patrones mentales negativos' : 'la falta de dirección'} tu principal ladrón de alegría? Toma hoy una decisión concreta — no intención, decisión — para reducirlo.`, duration: '25 min', measurable: '1 decisión concreta tomada para reducir el principal ladrón de alegría' },
    { title: 'Desarrolla el estado de flujo intencionalmente', action: `El flujo es el estado de absorción total en una actividad. Practica hoy ${joyActs} por 90 minutos sin interrupciones. El flujo sostenido es la experiencia de mayor bienestar que la mente humana puede tener.`, duration: '90 min', measurable: '90 minutos de flujo sin interrupción completados' },
    { title: 'Cultiva la alegría relacional profunda', action: `La calidad de tus relaciones es el predictor más robusto de felicidad sostenida. Identifica la relación que más te da alegría y hazle una inversión concreta hoy: tiempo, atención, gesto.`, duration: '1-2 horas', measurable: '1 inversión concreta en tu relación más alegre' },
    { title: 'Trabaja en la aceptación radical', action: `La aceptación no es resignación — es dejar de gastar energía en lo que no puede cambiar hoy. Identifica 3 situaciones que resistías y practica decirles con convicción: "Acepto esto como es ahora." La energía liberada se convierte en alegría disponible.`, duration: '20 min', measurable: '3 situaciones aceptadas con alivio documentado' },
    { title: 'Practica la alegría sin razón', action: `La alegría no siempre necesita una causa. Elige hoy sentirte bien sin que algo específico lo justifique. Baila, canta, ríe sin motivo. El sistema nervioso no distingue entre alegría espontánea y alegría elegida — ambas activan los mismos circuitos.`, duration: '20 min', measurable: '1 acto de alegría sin causa elegido conscientemente' },
    { title: 'Desarrolla la apreciación activa', action: `La apreciación activa es encontrar belleza en lo cotidiano sin esperar lo extraordinario. Hoy, cada hora, busca una cosa específica que tenga valor aunque sea pequeño. El cerebro que busca lo bueno lo encuentra con más frecuencia.`, duration: 'El día', measurable: '8 momentos de apreciación activa registrados en el día' },
    { title: 'Revisión de alegría de los 40 días', action: `¿Cómo cambió tu nivel base de alegría en 40 días? Compara usando la misma escala del 1-10. ¿Qué práctica tuvo más impacto? ¿Qué sigue sin funcionar? La felicidad que se mide se gestiona mejor.`, duration: '20 min', measurable: '1 revisión de nivel de alegría con comparación de 40 días' },
    { title: 'Trabaja en la generosidad como fuente de alegría', action: `La generosidad activa los mismos circuitos cerebrales que recibir, pero con mayor duración. Haz hoy un acto de generosidad que te cueste algo real: tiempo, dinero, atención, esfuerzo. La alegría que se da regresa con interés.`, duration: '30-60 min', measurable: '1 acto de generosidad con costo real completado' },
    { title: 'Desarrolla la gratitud específica y profunda', action: `La gratitud genérica pierde impacto. Hoy practica gratitud hiperespecífica: no "gracias por mi familia" sino "gracias por la forma en que [nombre] dijo [algo concreto] el [día]." La especificidad hace que la gratitud llegue más profundo.`, duration: '15 min', measurable: '5 gratitudes hiperespecíficas escritas' },
    { title: 'Libera una herida emocional que pesa', action: `Hay heridas que drenan la alegría silenciosamente. Elige una — una decepción, un resentimiento, una pérdida no procesada — y dedica 20 minutos a procesarla con escritura. No para olvidar — para que deje de consumir energía emocional.`, duration: '25 min', measurable: '1 herida emocional procesada por escrito' },
    { title: 'Diseña una semana de máxima alegría', action: `Planifica los próximos 7 días con la alegría como criterio principal: incluye ${joyActs}, una experiencia nueva, una conexión importante y al menos un acto de generosidad. No esperes que suceda — diseñala.`, duration: '20 min', measurable: '1 semana de alegría diseñada con actividades específicas' },
    { title: 'Celebra el progreso de 45 días', action: `¿Qué tan diferente es tu relación con la alegría hoy comparado con hace 45 días? Documenta 5 cambios concretos. La felicidad que se celebra se refuerza. El cerebro que recibe señales de progreso busca más progreso.`, duration: '20 min', measurable: '5 cambios en alegría de 45 días documentados y celebrados' },
    { title: 'Practica mindfulness como tecnología de alegría', action: `El mindfulness no es solo meditación — es atención plena en cualquier actividad. Elige hoy una actividad cotidiana y hazla con presencia total: comer, caminar, ducharte. La presencia plena revela la alegría que la rutina oculta.`, duration: '30 min', measurable: '1 actividad cotidiana hecha con presencia plena total' },
    { title: 'Trabaja en la alegría ante lo difícil', action: `La felicidad más profunda no es la ausencia de dificultad — es la capacidad de mantener el bienestar dentro de ella. Identifica algo difícil que estés viviendo ahora y encuentra un aspecto real de crecimiento o aprendizaje que coexista con ello.`, duration: '20 min', measurable: '1 situación difícil con perspectiva de crecimiento documentada' },
    { title: 'Desarrolla rituales de alegría matutina', action: `Los primeros 30 minutos del día determinan el tono emocional del resto. Diseña una rutina matutina que active la alegría antes de cualquier responsabilidad: movimiento, gratitud, ${joyActs} en dosis pequeñas. Los días felices se construyen en la mañana.`, duration: '30 min', measurable: '1 rutina matutina de alegría diseñada y ejecutada' },
    { title: 'Activa la alegría a través del servicio', action: `El servicio genuino — ayudar sin agenda — genera uno de los estados de bienestar más duraderos. Encuentra hoy cómo tu tiempo, conocimiento o presencia puede reducir el sufrimiento o aumentar la alegría de alguien más.`, duration: '1 hora', measurable: '1 acto de servicio genuino que generó bienestar' },
    { title: 'Trabaja en la ecuanimidad como base de alegría', action: `La ecuanimidad es la capacidad de mantenerse estable ante los altibajos de la vida. No es indiferencia — es tener un centro que no se mueve con todo viento. Practica hoy responder en lugar de reaccionar ante algo que normalmente te saca del centro.`, duration: 'El día', measurable: '1 situación respondida con ecuanimidad en lugar de reacción' },
    { title: 'Evalúa tu entorno de alegría', action: `¿Tu entorno físico y social apoya tu felicidad? Identifica 3 elementos de tu entorno que drenan alegría y 3 que la potencian. Haz un cambio concreto para reducir los primeros y amplificar los segundos.`, duration: '25 min', measurable: '3 cambios de entorno pro-alegría ejecutados' },
    { title: 'Desarrolla la alegría como práctica espiritual', action: `La alegría profunda tiene una dimensión espiritual: la experiencia de ser parte de algo más grande que uno mismo. Conéctate hoy con esa dimensión — naturaleza, música, arte, silencio, servicio — y registra cómo afecta tu estado.`, duration: '45 min', measurable: '1 práctica espiritual de alegría completada con registro' },
    { title: 'Cultiva el asombro deliberadamente', action: `El asombro es la emoción más conectada con el bienestar a largo plazo. Busca hoy algo que te genere genuina maravilla: un fenómeno natural, una obra de arte, un logro humano, una historia. El asombro cultiva la humildad y la alegría simultáneamente.`, duration: '30 min', measurable: '1 experiencia de asombro genuino buscada y documentada' },
    { title: 'Trabaja en el cambio que traerá más felicidad', action: `Escribiste que "${change}" cambiaría tu vida. Después de 53 días, ¿diste los pasos hacia ese cambio? Evalúa el progreso y da hoy el siguiente paso más concreto. El cambio que se posterga pesa más que el que se ejecuta.`, duration: '30 min', measurable: '1 paso concreto hacia el cambio de vida ejecutado' },
    { title: 'Practica la alegría incondicional', action: `La alegría incondicional es independiente de las circunstancias. Elige ser feliz hoy sin esperar que algo cambie primero. Escribe: "Elijo la alegría aunque..." y completa con la cosa más difícil de tu vida ahora. Ese "aunque" es donde vive el poder.`, duration: '20 min', measurable: '1 elección de alegría incondicional practicada y documentada' },
    { title: 'Comparte tu proceso de felicidad', action: `Cuéntale a alguien cómo cambió tu relación con la alegría en estos 55 días. No para impresionar — para conectar. Las conversaciones sobre felicidad son, en sí mismas, una de las fuentes más consistentes de bienestar.`, duration: '30 min', measurable: '1 conversación profunda sobre tu proceso de alegría' },
    { title: 'Diseña tu práctica de alegría de por vida', action: `Después de 57 días, tienes evidencia de qué genera alegría real para ti. Diseña una práctica simple que puedas sostener siempre: qué harás cada día, cada semana, cada mes para cultivar el bienestar. La felicidad que dura se practica.`, duration: '25 min', measurable: '1 práctica de alegría de por vida diseñada y sostenible' },
    { title: 'Trabaja en la alegría en las relaciones difíciles', action: `Hay personas en tu vida con quienes es difícil sentir alegría. Elige una de esas relaciones y practica encontrar un ángulo genuino de gratitud o apreciación hacia ella. No para negar lo difícil — para no dejar que lo difícil sea todo.`, duration: '20 min', measurable: '1 aspecto de gratitud en una relación difícil encontrado' },
    { title: 'Celebra 59 días de elegir la alegría', action: `Documenta los 5 mayores cambios en tu relación con la felicidad en estos 59 días. La persona que elige activamente la alegría durante 59 días seguidos ya tiene una relación diferente con el bienestar — más estable, más propia, más real.`, duration: '20 min', measurable: '5 transformaciones de alegría de 59 días documentadas' },
    { title: 'Celebra 60 días de práctica de felicidad', action: `Escribe quién eras en alegría el día 1 y quién eres hoy. No en términos de lo que tienes — en términos de cómo te relacionas con la vida. La felicidad de 60 días ya no es un estado que buscas — es una capacidad que construiste.`, duration: '20 min', measurable: '1 celebración de 60 días de práctica de felicidad documentada' },
  ]
}

// ─── FELICIDAD INTEGRATION (días 61-90) ───────────────────────────────────────

function buildFelicidadIntegration(details: GoalDetails): DailyObjective[] {
  const joyActs = details.joy_activities || 'lo que te da alegría'
  const change = details.happiness_change || 'el cambio que necesitas'

  return [
    { title: 'Sistematiza tu arquitectura de alegría', action: `Documenta tu sistema completo de bienestar: qué haces diariamente, semanalmente, mensualmente para mantener y cultivar tu alegría. Un sistema documentado puede sostenerse incluso cuando la motivación flaquea.`, duration: '30 min', measurable: '1 arquitectura de alegría documentada con frecuencias' },
    { title: 'Construye tu identidad de persona feliz', action: `Ya no es un estado que buscas — es quien eres. Escribe: "Soy una persona fundamentalmente alegre" y 10 evidencias de que eso es verdad hoy. La identidad de alegría es más poderosa que cualquier práctica puntual.`, duration: '20 min', measurable: '1 identidad de alegría declarada con 10 evidencias reales' },
    { title: 'Alcanza tu nivel de alegría más alto medible', action: `Define y crea hoy tu experiencia de mayor alegría posible: el día, el momento o la actividad que genera el mayor bienestar para ti. Tener un pico de referencia te muestra lo que es posible en tu mejor versión.`, duration: 'Todo el día', measurable: '1 experiencia de alegría máxima creada intencionalmente' },
    { title: 'Enseña lo que aprendiste sobre la felicidad', action: `Comparte tu proceso de transformación de alegría con alguien que lo necesita. No como experto — como alguien que recorrió el camino. Enseñar la felicidad es uno de los actos más alegres que existen.`, duration: '45 min', measurable: '1 persona que recibió tu experiencia de alegría' },
    { title: 'Rediseña tu entorno para la alegría permanente', action: `Haz cambios permanentes en tu entorno físico que hagan la alegría más accesible: fotos que te alegran, colores que elevan tu energía, objetos que generan gozo. El entorno que irradia alegría activa la alegría en quien lo habita.`, duration: '1 hora', measurable: '3 cambios permanentes de entorno pro-alegría ejecutados' },
    { title: 'Desarrolla la alegría como servicio al mundo', action: `Una persona genuinamente alegre es un regalo para su entorno. Define cómo tu alegría puede ser un servicio: contagiando bienestar, inspirando a otros, creando espacios de gozo. La alegría compartida no se divide — se multiplica.`, duration: '30 min', measurable: '1 forma de alegría como servicio definida y practicada' },
    { title: 'Trabaja en la felicidad profunda más allá del placer', action: `La eudaimonía — bienestar profundo — viene del sentido, la virtud y el crecimiento, no del placer momentáneo. Identifica qué actividades te dan bienestar profundo versus cuáles solo dan placer inmediato. Invierte más en las primeras.`, duration: '25 min', measurable: '3 actividades de bienestar profundo identificadas y priorizadas' },
    { title: 'Cultiva la alegría en la adversidad', action: `La resiliencia hedónica es la capacidad de recuperar el bienestar después de eventos negativos. Practica hoy encontrar algo genuinamente bueno en una situación difícil de tu vida. No como negación — como habilidad.`, duration: '20 min', measurable: '1 aspecto genuinamente positivo en una situación difícil encontrado' },
    { title: 'Construye relaciones que sostengan tu alegría', action: `Las relaciones de alta calidad son el predictor más robusto de bienestar a largo plazo. Evalúa tus 5 relaciones más frecuentes: ¿cuáles elevan tu alegría? Decide hoy invertir más en las que suman y poner límites en las que drenan.`, duration: '25 min', measurable: '5 relaciones evaluadas con decisión de inversión' },
    { title: 'Practica la alegría contemplativa', action: `La alegría contemplativa es el bienestar que viene de simplemente estar — sin hacer, sin lograr, sin demostrar. Dedica 30 minutos hoy a estar sin agenda: observar, sentir, existir. Esta capacidad es la base de la felicidad duradera.`, duration: '30 min', measurable: '30 minutos de alegría contemplativa sin agenda' },
    { title: 'Evalúa tu transformación de alegría de 75 días', action: `Compara tu nivel de bienestar con el día 1, el día 30 y hoy. ¿Qué transformación ocurrió? ¿Qué se consolidó? ¿Qué sigue en proceso? La felicidad evaluada con perspectiva de 75 días revela patrones que los días individuales no muestran.`, duration: '20 min', measurable: '1 evaluación de transformación de alegría de 75 días' },
    { title: 'Trabaja en la alegría ante la incertidumbre', action: `La incertidumbre es la condición permanente de la vida. Practica hoy hacer las paces con algo que no sabes ni puedes controlar. La paz con la incertidumbre libera enormes cantidades de energía que se convierten en alegría disponible.`, duration: '20 min', measurable: '1 incertidumbre aceptada con bienestar documentado' },
    { title: 'Crea experiencias de alegría memorables', action: `Las experiencias memorables se graban en la memoria con mayor impacto que los objetos o logros. Diseña y crea hoy una experiencia que te genere un recuerdo de alegría: algo nuevo, algo especial, algo que cuente una historia.`, duration: '2-3 horas', measurable: '1 experiencia memorable de alegría creada' },
    { title: 'Integra la alegría en tu trabajo diario', action: `Si tu trabajo es una fuente de estrés, identifica cómo incorporar elementos de ${joyActs} en él: pausas de gozo, pequeños rituales, momentos de conexión. No transformar todo — agregar gotitas de alegría en lo cotidiano.`, duration: '30 min', measurable: '3 elementos de alegría integrados en la rutina de trabajo' },
    { title: 'Desarrolla la alegría como competencia emocional', action: `La alegría es una habilidad que se desarrolla, no solo un estado que se recibe. Identifica qué aspectos de tu capacidad de sentir alegría quieres seguir desarrollando. La competencia emocional se estudia y se practica como cualquier otra.`, duration: '20 min', measurable: '3 aspectos de alegría como competencia identificados para desarrollo' },
    { title: 'Diseña tu día ideal de alegría', action: `Diseña cómo sería tu día perfecto en términos de alegría: desde que despiertas hasta que duermes. No desde el lujo ni los logros — desde el bienestar real. Luego vive ese día esta semana.`, duration: '25 min', measurable: '1 día ideal de alegría diseñado y agendado para esta semana' },
    { title: 'Celebra los días difíciles en que elegiste la alegría', action: `Escribe los días más difíciles de estos 80 días en los que aun así elegiste la alegría o el bienestar. Esos son los días que definen tu relación con la felicidad. No los fáciles — los difíciles.`, duration: '20 min', measurable: '5 días difíciles donde se eligió la alegría celebrados' },
    { title: 'Transmite alegría activamente', action: `Tu bienestar es contagioso — biológicamente. Cuando estás genuinamente alegre, afectas el estado emocional de quienes te rodean. Hoy actúa conscientemente como agente de bienestar en tu entorno: en casa, en el trabajo, en cualquier espacio.`, duration: 'El día', measurable: '1 día vivido como agente consciente de alegría en el entorno' },
    { title: 'Trabaja en la gratitud como práctica permanente', action: `La gratitud practicada consistentemente durante 90 días cambia la estructura neuronal del cerebro. Establece hoy tu práctica de gratitud de por vida: qué forma, cuándo, con qué profundidad. Esta práctica sola puede sostener el bienestar base.`, duration: '20 min', measurable: '1 práctica de gratitud de por vida establecida con sistema' },
    { title: 'Conecta alegría con propósito', action: `La alegría más profunda ocurre cuando lo que haces contribuye a algo más grande que tú. ¿Cómo se conecta tu ${joyActs} con un propósito que trasciende tu satisfacción personal? Cuando la alegría tiene propósito, se vuelve inagotable.`, duration: '25 min', measurable: '1 conexión entre alegría y propósito documentada' },
    { title: 'Crea un legado de alegría', action: `¿Qué alegría quieres haber sembrado en el mundo cuando ya no estés? No en términos de logros — en términos de cómo te recordarán sintiéndose cuando estaban contigo. Define hoy ese legado y un acto que lo exprese.`, duration: '20 min', measurable: '1 declaración de legado de alegría escrita y acto expresado' },
    { title: 'Practica la ecuanimidad ante la alegría misma', action: `Paradójicamente, la búsqueda desesperada de alegría la aleja. Practica hoy la ecuanimidad ante el bienestar: no aferrarte a los momentos de alegría ni temer que se vayan. La alegría que no se agarra se queda más tiempo.`, duration: '20 min', measurable: '1 momento de alegría experimentado sin aferramiento' },
    { title: 'Trabaja en la alegría intergeneracional', action: `La felicidad que cultivas hoy afecta a tu familia, a tus hijos o a las personas que te rodearán en el futuro. Siembra hoy un hábito de alegría en alguien más joven o menos experimentado. La felicidad que se enseña se multiplica generacionalmente.`, duration: '30 min', measurable: '1 hábito de alegría sembrado en alguien de tu entorno cercano' },
    { title: 'Define tu práctica maestra de bienestar', action: `Después de 83 días, ¿cuál es la UNA práctica que más ha impactado tu alegría? Nómbrala, documenta por qué funciona para ti específicamente, y comprométete a ella de por vida. El maestro de la felicidad conoce su herramienta principal.`, duration: '20 min', measurable: '1 práctica maestra de bienestar identificada y comprometida' },
    { title: 'Celebra quien te convertiste en 84 días', action: `Escribe la diferencia entre quien eras en alegría el día 1 y quien eres hoy. No lo que tienes diferente — quien eres diferente. La transformación de la relación con la alegría es la más profunda porque cambia el sabor de toda experiencia.`, duration: '25 min', measurable: '1 celebración de identidad de alegría transformada' },
    { title: 'Activa tu siguiente nivel de felicidad', action: `La felicidad no tiene techo — siempre hay un nivel más profundo disponible. Define qué dimensión de bienestar quieres cultivar en el próximo ciclo: más flujo, más conexión, más propósito, más ecuanimidad. El siguiente nivel ya existe — está esperando tu intención.`, duration: '20 min', measurable: '1 siguiente nivel de felicidad definido con primera práctica' },
    { title: 'Diseña tu próximo ciclo de alegría', action: `Define tu intención de alegría para los próximos 90 días: ¿qué profundizarás? ¿Qué soltarás? ¿Qué nuevas prácticas incorporarás? La felicidad que se cultiva con intención en ciclos crece en espiral ascendente.`, duration: '20 min', measurable: '1 intención de alegría del próximo ciclo definida' },
    { title: 'Escribe tu manifiesto de alegría', action: `Redacta en una página tus principios de felicidad: cómo eliges vivir, qué priorizas, qué prácticas nunca abandonas. Este manifiesto se convierte en tu brújula cuando la vida complica la alegría.`, duration: '25 min', measurable: '1 manifiesto personal de alegría escrito' },
    { title: 'Transmite el arte de la alegría', action: `Crea algo hoy que enseñe o inspire a otros a cultivar su propia alegría: una conversación, un texto, un video, una experiencia compartida. La felicidad que se transmite no se agota — regresa multiplicada al que la da.`, duration: '45 min', measurable: '1 transmisión del arte de la alegría creada' },
    { title: 'Celebra 90 días eligiendo la felicidad', action: `Escribe quién eras emocionalmente el día 1 y quién eres hoy. Celebra con la plenitud que merece: 90 días de elegir activamente el bienestar es una de las decisiones más poderosas que un ser humano puede tomar. Esa persona eres tú.`, duration: '25 min', measurable: '1 celebración plena de 90 días de práctica de felicidad' },
  ]
}

export function generateDailyObjective(
  area: ManifestationArea,
  details: GoalDetails,
  planDay: number,
  planDuration: number = 30
): DailyObjective {
  let core: DailyObjective[]
  let deepening: DailyObjective[]
  let integration: DailyObjective[]

  switch (area) {
    case 'dinero':
      core = buildDineroCore(details); deepening = buildDineroDeepening(details); integration = buildDineroIntegration(details); break
    case 'amor':
      core = buildAmorCore(details); deepening = buildAmorDeepening(details); integration = buildAmorIntegration(details); break
    case 'salud':
      core = buildSaludCore(details); deepening = buildSaludDeepening(details); integration = buildSaludIntegration(details); break
    case 'proposito':
      core = buildPropositoCore(details); deepening = buildPropositoDeepening(details); integration = buildPropositoIntegration(details); break
    case 'felicidad':
      core = buildFelicidadCore(details); deepening = buildFelicidadDeepening(details); integration = buildFelicidadIntegration(details); break
    default:
      core = buildDineroCore(details); deepening = buildDineroDeepening(details); integration = buildDineroIntegration(details)
  }

  const pool = [...core, ...deepening, ...integration]
  const index = Math.min(Math.max(planDay - 1, 0), pool.length - 1)
  return pool[index]
}
