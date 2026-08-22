export type PortalType = 'espejo' | 'maestro' | 'leones' | 'eclipse_solar' | 'eclipse_lunar' | 'solsticio' | 'equinoccio'
export type PortalPower = 'alta' | 'muy_alta' | 'maxima'

export interface EnergeticPortal {
  name: string
  type: PortalType
  emoji: string
  power: PortalPower
  description: string
  energy: string        // qué tipo de energía trae
  intention: string     // qué manifestar hoy
  ritual: string        // acción concreta para el portal
  affirmation: string
}

// ─── Portales espejo (día = mes) ─────────────────────────────────────────────
const MIRROR_PORTALS: Record<number, EnergeticPortal> = {
  1: {
    name: 'Portal 1:1 — Inicio Absoluto',
    type: 'espejo', emoji: '✨', power: 'muy_alta',
    description: 'El primer portal espejo del año abre el ciclo de manifestación. Lo que siembras hoy se multiplica durante los 365 días siguientes.',
    energy: 'Creación, nuevos comienzos, potencial sin límites',
    intention: 'Define con precisión lo que deseas crear este año. Una sola intención, clara y específica.',
    ritual: 'Escribe en papel tu intención principal para el año. Léela en voz alta 11 veces y quema el papel o guárdalo en un lugar sagrado.',
    affirmation: 'Soy el inicio de todo lo que deseo. Mi intención es poderosa y se manifiesta ahora.',
  },
  2: {
    name: 'Portal 2:2 — Dualidad y Unión',
    type: 'espejo', emoji: '🌊', power: 'alta',
    description: 'Portal de la dualidad. Activa las relaciones, las alianzas y el equilibrio entre dar y recibir.',
    energy: 'Cooperación, amor, balance, asociaciones',
    intention: 'Atrae la relación o alianza que necesitas para tu siguiente nivel.',
    ritual: 'Escribe el nombre de alguien con quien desees fortalecer un vínculo. Visualiza la conexión en perfecta armonía por 2 minutos.',
    affirmation: 'Atraigo relaciones que elevan mi vibración y aceleran mi manifestación.',
  },
  3: {
    name: 'Portal 3:3 — Trinidad Creativa',
    type: 'espejo', emoji: '🎨', power: 'alta',
    description: 'Portal de la expresión y la creatividad. Activa tu voz, tus ideas y tu capacidad de comunicar tu visión al mundo.',
    energy: 'Creatividad, expresión, comunicación, expansión',
    intention: 'Expande tu presencia. Comparte tu idea o proyecto con al menos 3 personas hoy.',
    ritual: 'Crea algo — escribe, dibuja, graba, diseña. Cualquier acto de creación activa el portal. Hazlo en los primeros 33 minutos del día.',
    affirmation: 'Mi creatividad es abundante. Expreso mi visión con claridad y el mundo la recibe.',
  },
  4: {
    name: 'Portal 4:4 — Fundamentos Sólidos',
    type: 'espejo', emoji: '🏛️', power: 'alta',
    description: 'Portal de la estabilidad y la construcción. Es el día para establecer estructuras que sostengan tus sueños a largo plazo.',
    energy: 'Estabilidad, disciplina, estructura, seguridad material',
    intention: 'Construye el sistema o hábito que sostendrá tu meta en el tiempo.',
    ritual: 'Organiza una parte de tu vida — finanzas, agenda, espacio. Un sistema ordenado invita a la abundancia a quedarse.',
    affirmation: 'Construyo con intención. Mis fundamentos son sólidos y mi éxito es duradero.',
  },
  5: {
    name: 'Portal 5:5 — Cambio y Libertad',
    type: 'espejo', emoji: '🦋', power: 'alta',
    description: 'Portal del cambio acelerado. Rompe patrones, toma decisiones valientes y expándete hacia lo desconocido.',
    energy: 'Transformación, aventura, libertad, ruptura de límites',
    intention: 'Toma la decisión que has estado posponiendo. El portal amplifica el coraje.',
    ritual: 'Haz algo diferente hoy — una ruta nueva, una conversación incómoda, una acción que normalmente evitarías. El cambio activa el portal.',
    affirmation: 'Abrazo el cambio. Me muevo con confianza hacia mi siguiente versión.',
  },
  6: {
    name: 'Portal 6:6 — Amor y Armonía',
    type: 'espejo', emoji: '💚', power: 'alta',
    description: 'Portal del amor en todas sus formas. Activa la autoestima, las relaciones amorosas y la abundancia que nace del corazón.',
    energy: 'Amor propio, belleza, hogar, relaciones íntimas, servicio',
    intention: 'Profundiza el amor — hacia ti, hacia tus seres cercanos, hacia tu propósito.',
    ritual: 'Escribe 6 cosas que amas de ti mismo y 6 cosas que agradeces de tu vida. Lleva la lista contigo durante el día.',
    affirmation: 'Soy amor. Recibo y doy amor en abundancia. Mi corazón está abierto.',
  },
  7: {
    name: 'Portal 7:7 — Sabiduría Interior',
    type: 'espejo', emoji: '🔮', power: 'alta',
    description: 'Portal de la sabiduría espiritual. Activa la intuición, el conocimiento interno y la conexión con tu guía superior.',
    energy: 'Intuición, espiritualidad, análisis profundo, verdad',
    intention: 'Confía en lo que sabes. Tu intuición te está señalando el camino correcto.',
    ritual: 'Medita 7 minutos en silencio absoluto. Antes de cerrar los ojos, formula una pregunta. Al terminar, escribe lo primero que llegue a tu mente.',
    affirmation: 'Confío en mi sabiduría interior. Las respuestas que busco están dentro de mí.',
  },
  8: {
    name: 'Portal 8:8 — Puerta del León 🦁',
    type: 'leones', emoji: '🌟', power: 'maxima',
    description: 'El portal más poderoso del año. El 8/8 activa la Puerta del León: la alineación entre Sirio, el Sol y la Tierra abre el canal de abundancia máxima.',
    energy: 'Abundancia ilimitada, poder personal, manifestación instantánea',
    intention: 'Declara con total certeza lo que vas a lograr. No deseos — decisiones. El portal convierte decisiones en realidad.',
    ritual: 'Escribe una carta desde el futuro en tiempo pasado: "Gracias porque ya tengo [tu meta específica]". Sé detallado. Léela con emoción y gratitud como si ya ocurrió.',
    affirmation: 'Soy un imán de abundancia. La Puerta del León me abre paso a mi mayor versión. Lo que pienso, lo creo.',
  },
  9: {
    name: 'Portal 9:9 — Completud y Cierre',
    type: 'espejo', emoji: '🌙', power: 'alta',
    description: 'Portal del cierre de ciclos. Lo que ya no te sirve se libera, abriendo espacio para lo que viene.',
    energy: 'Liberación, perdón, completud, sabiduría de ciclos',
    intention: 'Suelta lo que está bloqueando tu siguiente ciclo — una creencia, una relación, un hábito.',
    ritual: 'Escribe en papel lo que deseas liberar. Quémalo o destrúyelo conscientemente. Di en voz alta: "Este ciclo termina. Estoy libre para recibir lo nuevo."',
    affirmation: 'Cierro ciclos con gratitud. Me libero de lo que ya no me sirve y abro espacio a mi abundancia.',
  },
  10: {
    name: 'Portal 10:10 — Orden Divino',
    type: 'espejo', emoji: '⚡', power: 'muy_alta',
    description: 'Portal del orden divino y la alineación perfecta. El universo está ordenando las piezas a tu favor.',
    energy: 'Alineación, orden, manifestación acelerada, señales claras',
    intention: 'Confía en el proceso. Hoy es un día de señales — presta atención a lo que aparece en tu camino.',
    ritual: 'Crea tu tablero de manifestación o actualiza el que tienes. Añade imágenes específicas de lo que deseas. El 10:10 acelera lo que ves repetidamente.',
    affirmation: 'El universo está ordenando todo a mi favor. Estoy en el lugar correcto, en el momento perfecto.',
  },
  11: {
    name: 'Portal 11:11 — Portal Maestro',
    type: 'maestro', emoji: '🌠', power: 'maxima',
    description: 'El portal maestro por excelencia. El 11:11 abre la puerta entre dimensiones — tus pensamientos se convierten en realidad con velocidad extraordinaria.',
    energy: 'Manifestación instantánea, despertar espiritual, conexión universal',
    intention: 'Sé absolutamente consciente de tus pensamientos hoy. Cada pensamiento es una orden al universo. Solo piensa en lo que SÍ quieres.',
    ritual: 'A las 11:11 AM y 11:11 PM detente. Cierra los ojos. Visualiza con detalle tu deseo ya cumplido. Siente la emoción como si es real. 11 segundos mínimo.',
    affirmation: 'Soy un portal de manifestación. Mis pensamientos crean mi realidad. Elijo la abundancia ahora.',
  },
  12: {
    name: 'Portal 12:12 — Ascensión y Gracia',
    type: 'espejo', emoji: '👑', power: 'muy_alta',
    description: 'El último portal espejo del año. Cierra el ciclo anual con gracia y prepara la energía para el próximo año.',
    energy: 'Gracia divina, completud anual, gratitud, preparación',
    intention: 'Cierra el año con intención. Evalúa lo que lograste y declara lo que el próximo ciclo traerá.',
    ritual: 'Escribe 12 logros del año — no importa su tamaño. Luego escribe 12 intenciones para el próximo ciclo. Este ritual es la bisagra entre años.',
    affirmation: 'Completo este ciclo con gratitud y gracia. Me preparo para recibir todo lo que el siguiente nivel tiene para mí.',
  },
}

// ─── Portales fijos del año (no espejo) ──────────────────────────────────────
// Formato: 'MM/DD'
const FIXED_PORTALS: Record<string, EnergeticPortal> = {
  // Equinoccios
  '3/20': {
    name: 'Equinoccio de Primavera',
    type: 'equinoccio', emoji: '🌸', power: 'muy_alta',
    description: 'El equinoccio activa el ciclo de siembra. La luz iguala a la oscuridad — es el momento perfecto para plantar semillas de manifestación.',
    energy: 'Nuevos comienzos, siembra, equilibrio, potencial',
    intention: 'Planta las semillas de tus metas más importantes. Lo que inicias en el equinoccio crece con la fuerza del sol.',
    ritual: 'Escribe 3 intenciones en papel. Entiérralas simbólicamente — pon el papel bajo una maceta, bajo tierra, o bajo una piedra. Las semillas crecen en silencio.',
    affirmation: 'Sembro con intención. Cada semilla que planto hoy florece en abundancia perfecta.',
  },
  '9/22': {
    name: 'Equinoccio de Otoño',
    type: 'equinoccio', emoji: '🍂', power: 'muy_alta',
    description: 'El equinoccio de otoño marca la cosecha. Es tiempo de agradecer lo logrado y liberar lo que no dio fruto.',
    energy: 'Cosecha, gratitud, liberación, balance',
    intention: 'Evalúa tu cosecha — qué lograste, qué aprendiste, qué debes soltar.',
    ritual: 'Haz una lista de 3 columnas: lo que cosechaste, lo que sueltas, lo que llevas al siguiente ciclo. Este mapa te guía hacia la siguiente siembra.',
    affirmation: 'Cosecho con gratitud lo que sembré. Suelto con amor lo que ya cumplió su propósito.',
  },
  '6/21': {
    name: 'Solsticio de Verano',
    type: 'solsticio', emoji: '☀️', power: 'muy_alta',
    description: 'El día más largo del año. La energía solar está en su punto máximo — ideal para activar proyectos, visibilidad y expansión.',
    energy: 'Máxima energía solar, visibilidad, expansión, éxito',
    intention: 'Activa tu mayor meta. El solsticio amplifica la acción — haz hoy el movimiento más importante de tu proyecto.',
    ritual: 'Sal al sol entre las 10 AM y 12 PM. Lleva tus metas escritas. Visualiza el calor del sol activando cada meta. 6 minutos mínimo.',
    affirmation: 'Brillo con la fuerza del sol. Mi visibilidad se expande. Mi éxito es inevitable.',
  },
  '12/21': {
    name: 'Solsticio de Invierno',
    type: 'solsticio', emoji: '❄️', power: 'muy_alta',
    description: 'La noche más larga. Desde hoy la luz regresa — es el punto de renacimiento donde la oscuridad da paso a un nuevo ciclo.',
    energy: 'Renacimiento, introspección, preparación, renovación',
    intention: 'Entra en tu visión para el próximo año. En el silencio más profundo nace la mayor claridad.',
    ritual: 'Apaga las luces. Enciende una vela. Escribe en silencio tu visión para el próximo ciclo — sin limitaciones. La oscuridad del solsticio transforma el sueño en semilla.',
    affirmation: 'Del silencio nace mi siguiente versión. Me renuevo. La luz regresa y con ella mi mayor manifestación.',
  },
  // Eclipses 2026
  '2/17': {
    name: 'Eclipse Solar Anular 2026',
    type: 'eclipse_solar', emoji: '🌑', power: 'maxima',
    description: 'Los eclipses solares son portales de transformación acelerada. Lo que inicias o cierras hoy tiene un impacto 10x mayor que en un día ordinario.',
    energy: 'Transformación radical, cierres definitivos, nuevos inicios poderosos',
    intention: 'Decide qué capítulo cierras definitivamente y qué capítulo nuevo abres. Los eclipses no permiten indecisión.',
    ritual: 'Escribe en rojo lo que termina hoy. Escribe en verde lo que comienza. No los mezcles. Son dos páginas distintas de tu historia.',
    affirmation: 'El eclipse acelera mi transformación. Cierro lo que ya no me sirve y abro con valentía mi siguiente capítulo.',
  },
  '8/12': {
    name: 'Eclipse Solar Total 2026',
    type: 'eclipse_solar', emoji: '🌑', power: 'maxima',
    description: 'El eclipse solar total más poderoso del año. Una ventana de transformación que se abre una vez cada varios años.',
    energy: 'Transformación total, revelaciones, cambios de vida irreversibles',
    intention: 'El universo te muestra lo que debe cambiar. Abre los ojos — las señales de hoy son mensajes directos.',
    ritual: 'Medita 12 minutos al medio día. Pide claridad sobre tu siguiente nivel. Escribe todo lo que llegue — imágenes, palabras, sensaciones.',
    affirmation: 'Me rindo a la transformación total. Lo que el eclipse revela me libera y me eleva.',
  },
  '8/28': {
    name: 'Eclipse Lunar Parcial 2026',
    type: 'eclipse_lunar', emoji: '🌕', power: 'muy_alta',
    description: 'El eclipse lunar amplifica los cierres emocionales. Lo que has cargado emocionalmente sale a la luz para ser liberado.',
    energy: 'Liberación emocional, sanación, cierres del pasado',
    intention: 'Suelta la carga emocional que has acumulado. Los eclipses lunares son los mejores días para soltar definitivamente.',
    ritual: 'Escribe una carta a alguien (o a ti mismo) perdonando completamente. No la envíes — quémala o rómpela. La intención es suficiente.',
    affirmation: 'Me libero de toda carga emocional. El perdón me da libertad. Soy ligero y poderoso.',
  },
}

// ─── Función principal ────────────────────────────────────────────────────────

export function getPortalForDate(date: Date): EnergeticPortal | null {
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 1. Portal espejo: día === mes
  if (day === month && MIRROR_PORTALS[month]) {
    return MIRROR_PORTALS[month]
  }

  // 2. Portales fijos por fecha
  const key = `${month}/${day}`
  if (FIXED_PORTALS[key]) return FIXED_PORTALS[key]

  return null
}

export interface NextPortalInfo {
  date: Date
  portal: EnergeticPortal
  daysAway: number
  dateLabel: string
}

export function getNextPortal(from: Date): NextPortalInfo | null {
  const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
  const start = new Date(from)
  start.setHours(0, 0, 0, 0)

  for (let i = 1; i <= 365; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const portal = getPortalForDate(d)
    if (portal) {
      const day = d.getDate()
      const month = MONTHS_ES[d.getMonth()]
      return {
        date: d,
        portal,
        daysAway: i,
        dateLabel: `${day} ${month}`,
      }
    }
  }
  return null
}

export function getPortalPowerLabel(power: PortalPower): string {
  if (power === 'maxima') return 'Poder MÁXIMO'
  if (power === 'muy_alta') return 'Poder Muy Alto'
  return 'Poder Alto'
}

export function getPortalPowerColor(power: PortalPower): string {
  if (power === 'maxima') return '#C9A84C'   // gold
  if (power === 'muy_alta') return '#9B7FD4' // purple
  return '#4CAF82'                            // green
}
