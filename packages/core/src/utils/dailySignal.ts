import { calculateNumerology } from './calculations'

// ── Types ─────────────────────────────────────────────────────────────────────

type AreaKey = 'dinero' | 'amor' | 'salud' | 'proposito' | 'felicidad'

export interface SignalInput {
  fullName: string
  birthDate: string
  zodiacSign: string
  lunarPhase: string       // LunarPhase values from @lumina/core
  manifestationArea: string
  date: Date
  requestIndex: number     // 0, 1, or 2 — which of the 3 daily signals
}

export interface SignalResult {
  number: number           // 1-9, or master 11, 22, 33
  reading: string          // short line, max 12 words, area-specific
  expanded: string         // 2-3 sentences of context, area-specific
}

// ── Core math ─────────────────────────────────────────────────────────────────

// Deterministic hash (DJB2 variant): same string → same number, always
function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = (((h << 5) + h) ^ s.charCodeAt(i)) & 0x7fffffff
  }
  return h
}

// Reduce to 1-9 preserving master numbers 11, 22, 33 at each intermediate step
function numerologyReduce(n: number): number {
  n = Math.abs(n) || 1
  if (n === 11 || n === 22 || n === 33) return n
  while (n > 9) {
    n = String(n).split('').reduce((a, d) => a + Number(d), 0)
    if (n === 11 || n === 22 || n === 33) return n
  }
  return n || 1
}

// Collapse master to its base digit for use as an additive component
function toBase(n: number): number {
  if (n === 11) return 2
  if (n === 22) return 4
  if (n === 33) return 6
  return n
}

// Universal day number: reduce all digits of day + month + year
function universalDayNumber(date: Date): number {
  const d = date.getDate()
  const m = date.getMonth() + 1
  const y = date.getFullYear()
  const sum = `${d}${m}${y}`.split('').reduce((a, c) => a + Number(c), 0)
  return numerologyReduce(sum)
}

const PHASE_VALUE: Record<string, number> = {
  nueva: 1,
  creciente_inicial: 2,
  cuarto_creciente: 3,
  creciente_gibosa: 4,
  llena: 5,
  menguante_gibosa: 6,
  cuarto_menguante: 7,
  menguante_final: 8,
}

// ── Signal pool ───────────────────────────────────────────────────────────────
// 100-entry interleaved array with designed frequency:
//   each 1-9 → 10%  •  11 → 4%  •  22 → 4%  •  33 → 2%
// Adjacent entries always differ, so three daily signals are always distinct.
// Groups of 10 alternate between [1-9, master]; master type cycles across groups.
const SIGNAL_POOL: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 11,  // group 0
  1, 2, 3, 4, 5, 6, 7, 8, 9, 22,  // group 1
  1, 2, 3, 4, 5, 6, 7, 8, 9, 11,  // group 2
  1, 2, 3, 4, 5, 6, 7, 8, 9, 22,  // group 3
  1, 2, 3, 4, 5, 6, 7, 8, 9, 33,  // group 4
  1, 2, 3, 4, 5, 6, 7, 8, 9, 11,  // group 5
  1, 2, 3, 4, 5, 6, 7, 8, 9, 22,  // group 6
  1, 2, 3, 4, 5, 6, 7, 8, 9, 33,  // group 7
  1, 2, 3, 4, 5, 6, 7, 8, 9, 22,  // group 8
  1, 2, 3, 4, 5, 6, 7, 8, 9, 11,  // group 9
]

// ── Signal content ─────────────────────────────────────────────────────────────
// reading: ≤12 words — redirects attention to an attitude or action, never a promise
// expanded: 2-3 sentences — context rooted in the area of manifestation
//
// Health readings: may address rest, energy, habits, and body awareness.
// They do NOT suggest ignoring symptoms, discourage professional consultation,
// or position body intuition against medical opinion.

interface SignalContent {
  reading: Record<AreaKey, string>
  expanded: Record<AreaKey, string>
}

const SIGNAL_CONTENT: Record<number, SignalContent> = {
  1: {
    reading: {
      dinero:    'Una decisión financiera lleva días esperando. Tómala hoy.',
      amor:      'Da el primer paso tú. No esperes a que llegue.',
      salud:     'El hábito que postergas solo necesita un comienzo hoy.',
      proposito: 'No esperes condiciones perfectas. El momento es este.',
      felicidad: 'Haz hoy algo que hagas puramente porque quieres hacerlo.',
    },
    expanded: {
      dinero:   'Tu número abre caminos donde otros ven paredes. Hoy la energía te pide tomar una decisión económica que has estado postergando. No necesitas certeza para empezar — solo el primer paso.',
      amor:     'El 1 vibra en autenticidad. Hoy la acción más poderosa es mostrarte tal como eres, sin editar ni calcular. Las conexiones reales empiezan desde ahí.',
      salud:    'Tu cuerpo responde al liderazgo que ejerces sobre él. Un solo hábito elegido con convicción hoy tiene más peso que diez decididos a medias. Elige uno y honralo.',
      proposito: 'El 1 no espera permiso. Tu propósito se aclara cuando actúas, no cuando planeas. Hoy, da un paso en la dirección que tu intuición lleva tiempo señalando.',
      felicidad: 'La alegría del 1 viene de la autenticidad. Haz algo hoy que hagas puramente porque quieres — sin justificar, sin explicar. Eso es energía de manifestación.',
    },
  },

  2: {
    reading: {
      dinero:    'Una alianza que has ignorado puede cambiar tu panorama.',
      amor:      'Hoy escucha sin preparar tu respuesta. La diferencia es enorme.',
      salud:     'Descansar no es perder tiempo. Es parte del proceso.',
      proposito: 'Preguntar a quien ya llegó no es debilidad. Es estrategia.',
      felicidad: 'La alegría que compartes hoy vuelve multiplicada. Comparte algo.',
    },
    expanded: {
      dinero:   'El 2 recibe más cuando colabora que cuando compite. Si hay una conversación financiera que has evitado, hoy es un buen momento para abrirla. Tu sensibilidad para leer a las personas es un activo real.',
      amor:     'Tu número vibra en la escucha profunda. Hoy practica la presencia: pon toda tu atención en la persona que tienes enfrente. Lo que transmites sin palabras es más poderoso que cualquier argumento.',
      salud:    'El 2 necesita equilibrio, no intensidad. Un momento de pausa hoy — aunque sean cinco minutos — restaura más que una hora de actividad forzada. Permítete descansar sin culpa.',
      proposito: 'Tu propósito se construye en la cooperación. Piensa en alguien que admiras y que ya está donde quieres estar. Observarle, preguntar, aprender — eso es estrategia, no debilidad.',
      felicidad: 'El 2 florece en conexión. Haz algo hoy que involucre a alguien más: un mensaje sincero, un plan, un momento compartido. La alegría que generas afuera vuelve multiplicada.',
    },
  },

  3: {
    reading: {
      dinero:    'Tu trabajo vale más de lo que lo estás presentando.',
      amor:      'Lo que sientes merece ser expresado. No lo guardes.',
      salud:     'Darle espacio a lo que sientes también cuida el cuerpo.',
      proposito: 'La idea que tienes miedo de decir es la buena.',
      felicidad: 'Haz algo hoy que no estaba en ningún plan tuyo.',
    },
    expanded: {
      dinero:   'El 3 convierte la expresión en atracción. Habla de tu trabajo como si ya estuviera siendo recibido, no como algo que todavía tienes que vender. La forma en que presentas lo que haces es parte del precio.',
      amor:     'Tu energía es magnética cuando te expresas desde la alegría. Hoy, sé espontáneo/a: un mensaje divertido, un gesto inesperado, una risa genuina. El 3 atrae lo que irradia.',
      salud:    'El 3 necesita movimiento y expresión para sentirse bien. Si tu cuerpo está tenso, puede que haya emociones sin procesar. Una conversación honesta o un momento creativo libera tanto como una sesión de ejercicio.',
      proposito: 'Tu propósito se manifiesta cuando lo nombras. Hoy, cuéntale a alguien — aunque sea en una frase — hacia dónde vas. Pronunciarlo en voz alta te compromete contigo mismo/a.',
      felicidad: 'El 3 vive plenamente cuando se permite ser espontáneo. Haz algo hoy que no estaba en ninguna lista: improvisa, crea, juega. Ahí es donde tu energía más brilla.',
    },
  },

  4: {
    reading: {
      dinero:    'El hábito financiero que ya elegiste: sostenerlo hoy es suficiente.',
      amor:      'Cumple lo que dijiste que harías. Así se construye confianza.',
      salud:     'Una rutina moderada sostenida tiene más efecto que una semana intensa.',
      proposito: 'Lo que haces hoy y nadie ve es lo que sostiene todo.',
      felicidad: 'La estabilidad que ya tienes es digna de atención. Mírala.',
    },
    expanded: {
      dinero:   'El 4 construye riqueza ladrillo a ladrillo. Hoy no es día de grandes saltos — es día de sostener el hábito financiero que ya elegiste. La consistencia hace lo que el impulso no puede.',
      amor:     'El amor del 4 es confiable y profundo. Hoy, demuestra tu presencia con un acto concreto, no con palabras grandes. Cumplir lo que dijiste que harías es tu forma de amar.',
      salud:    'Tu cuerpo responde a la rutina, no a los extremos. Un hábito moderado sostenido por semanas tiene más efecto que una semana de intensidad seguida de abandono. Hoy, solo sostén.',
      proposito: 'El 4 edifica con paciencia. Si hoy no ves resultados visibles, es porque estás en la etapa de los cimientos. Los cimientos no se celebran, pero son los que hacen que todo lo demás se mantenga.',
      felicidad: 'La alegría del 4 viene de la estabilidad. Hoy, encuentra satisfacción en lo pequeño que ya funciona: una rutina, un espacio ordenado, una relación sólida. La gratitud por lo concreto te ancla.',
    },
  },

  5: {
    reading: {
      dinero:    'Pon atención a lo que normalmente ignoras. Ahí también llegan las oportunidades.',
      amor:      'Haz algo que no sea esperar. El amor responde al movimiento.',
      salud:     'Si la misma rutina ya no te entusiasma, cámbiala. No la abandones.',
      proposito: 'La respuesta puede estar en lo que aún no consideraste.',
      felicidad: 'Síguele la pista a lo que te da energía hoy. Sin justificar.',
    },
    expanded: {
      dinero:   'El 5 encuentra oportunidades donde otros ven caos. Hoy, presta atención a las conversaciones o situaciones inesperadas — ahí pueden estar las pistas que cambian tu panorama financiero.',
      amor:     'Tu energía es más atractiva cuando te permites ser impredecible. Hoy, rompe la rutina de alguna forma: propón algo distinto, sé espontáneo/a. La monotonía es el enemigo natural del 5.',
      salud:    'El 5 necesita variedad para mantenerse comprometido. Si la misma rutina ya no te entusiasma, cámbiala — no la abandones. Un ejercicio nuevo, un alimento distinto, una hora diferente.',
      proposito: 'Tu propósito se expande cuando te permites explorar. Hoy, considera algo que no habías tomado en cuenta. Las nuevas experiencias le dan materia prima a tu dirección real.',
      felicidad: 'El 5 es feliz cuando se permite ser libre. Hoy, síguele la pista a lo que te da energía — sin justificar, sin calcular. Eso es información directa sobre tu camino.',
    },
  },

  6: {
    reading: {
      dinero:    'Haz algo por tu dinero que no dependa del qué dirán.',
      amor:      'Cuida a alguien hoy de verdad, sin calcular el retorno.',
      salud:     'Hoy tu bienestar va primero. No es egoísmo, es base.',
      proposito: 'Sirve desde el amor, no desde la culpa. La diferencia se nota.',
      felicidad: 'Resuelve una fricción pequeña hoy. La paz exterior refleja la interior.',
    },
    expanded: {
      dinero:   'El 6 atrae abundancia cuando actúa desde el amor, no desde la aprobación ajena. Hoy, toma una decisión financiera porque es la correcta para ti — no porque otra persona espera que la tomes.',
      amor:     'Tu número vibra más fuerte en el dar que en el pedir. Hoy, haz algo concreto por alguien que amas — no lo que crees que quiere, sino lo que sientes que necesita. Pregunta primero.',
      salud:    'El 6 cuida a todos menos a sí mismo/a. Hoy la señal es clara: pon tu bienestar primero. No como un lujo — como una responsabilidad. No puedes dar desde lo vacío.',
      proposito: 'Tu propósito más auténtico siempre involucra servir a algo más grande. Pero hoy verifica de dónde viene ese impulso: si sirves desde la culpa o desde la obligación, agota. Si sirves desde el amor, regenera.',
      felicidad: 'El 6 florece cuando hay armonía en su entorno. Hoy, resuelve una pequeña fricción: una conversación pendiente, un espacio desorganizado, una rutina que no funciona. La paz exterior refleja la interior.',
    },
  },

  7: {
    reading: {
      dinero:    'Tienes suficiente información. Lo que falta es mover.',
      amor:      'Pensar no es lo mismo que sentir. Sal de tu cabeza.',
      salud:     'Tu cuerpo lleva días pidiendo pausa. Dásela.',
      proposito: 'No necesitas que lo entiendan todavía. Sigue.',
      felicidad: 'Un momento de silencio hoy vale más que una tarde ocupada.',
    },
    expanded: {
      dinero:   'El 7 construye riqueza desde la comprensión profunda. Hoy, en lugar de buscar más información, trabaja con la que ya tienes. La claridad que necesitas no viene de afuera — viene de la reflexión.',
      amor:     'Tu número necesita profundidad, no cantidad. Hoy, una conversación real vale más que diez conversaciones superficiales. Busca el nivel donde las cosas realmente importan.',
      salud:    'El 7 es sensible a los ambientes y las energías. Hoy cuida lo que consumes — información, conversaciones, pantallas. Tu sistema nervioso procesa más de lo que parece. El silencio también alimenta.',
      proposito: 'El 7 construye desde adentro. Tu proceso no siempre es visible para otros, y eso está bien — no necesitas validación externa para que sea real. Confía en lo que estás construyendo aunque todavía no sea visible.',
      felicidad: 'La alegría del 7 viene del entendimiento, no del entretenimiento. Hoy, haz algo que le dé sentido a tu día: leer, observar, crear, estudiar. Eso es lo que recarga tu energía.',
    },
  },

  8: {
    reading: {
      dinero:    'Pon tu precio. Lo estás cobrando por debajo.',
      amor:      'No te encojas para que otro esté cómodo.',
      salud:     'Poner un límite hoy es un acto de cuidado.',
      proposito: 'Deja de pedir permiso para lo que ya sabes hacer.',
      felicidad: 'Date crédito por lo que avanzaste esta semana. Aunque sea poco.',
    },
    expanded: {
      dinero:   'Tu número es el más alineado con la manifestación material. Pero el 8 necesita claridad de intención, no solo esfuerzo. Hoy, escribe una cifra, un objetivo, una meta concreta. Lo que defines con precisión, se mueve.',
      amor:     'El 8 en el amor necesita equilibrio: dar y recibir en proporción. Hoy observa si la balanza está desnivelada en alguna relación importante. No para resolver nada de golpe — solo para verlo con claridad.',
      salud:    'Tu cuerpo responde bien a la estructura y al ritmo. Hoy, honra una práctica de salud con la misma seriedad con que atiendes tus compromisos externos. Tu bienestar físico es parte de tu autoridad.',
      proposito: 'El 8 tiene visión de largo plazo natural. Hoy, conecta lo que estás haciendo ahora con el resultado que buscas en 6 o 12 meses. Ver la trayectoria completa renueva la motivación para los pasos pequeños.',
      felicidad: 'La alegría del 8 viene del logro y del reconocimiento propio. Hoy, date crédito por algo concreto que hayas avanzado — aunque sea pequeño. El 8 que no celebra sus propios logros pierde fuerza.',
    },
  },

  9: {
    reading: {
      dinero:    'Lo que das sin calcular hoy abre un camino distinto.',
      amor:      'Soltar lo que pasó hace espacio para lo que quieres que llegue.',
      salud:     'Identifica una tensión que no es tuya y suéltala con intención.',
      proposito: 'Conecta lo que haces hoy con el legado que quieres construir.',
      felicidad: 'Haz algo por alguien hoy sin guardarlo en la memoria.',
    },
    expanded: {
      dinero:   'El 9 atrae abundancia cuando opera desde la generosidad, no desde el cálculo. Hoy, haz algo sin esperar retorno directo — ayuda, comparte, contribuye. La energía del 9 lo que da, lo multiplica.',
      amor:     'Tu número tiene una capacidad de amor profunda y universal. Hoy, practica perdonar algo — no por la otra persona, sino para liberarte tú. El 9 que carga resentimiento bloquea su propio campo.',
      salud:    'El 9 lleva mucho en su campo energético. Hoy, practica soltar: una emoción que has estado cargando, una preocupación que no depende de ti, una tensión física. El cuerpo del 9 descansa cuando la mente suelta.',
      proposito: 'Tu propósito siempre tiene una dimensión de legado. Hoy, pregúntate: ¿qué estoy construyendo que importará más allá de mí? No tiene que ser grande — solo tiene que trascender.',
      felicidad: 'La alegría del 9 se activa cuando sirve. Hoy, encuentra una forma de contribuir a algo más grande que tu propio bienestar — un gesto, una palabra, un acto de presencia. Eso llena al 9 de una forma que el consumo nunca podrá.',
    },
  },

  11: {
    reading: {
      dinero:    'El primer número que pensaste era correcto. No lo cambies.',
      amor:      'Tu intuición sobre las personas es más precisa de lo que crees.',
      salud:     'La señal que ignoraste esta semana sigue ahí. Atiéndela.',
      proposito: 'Lo que viniste a hacer no necesita condiciones perfectas. Solo un paso.',
      felicidad: 'Un momento de conexión real hoy restaura más que horas de distracción.',
    },
    expanded: {
      dinero:   'El 11 percibe oportunidades antes de que sean visibles para los demás. Hoy, presta atención a los detalles que otros ignorarían: una conversación, una sensación, una coincidencia. Tu intuición financiera es un activo real.',
      amor:     'Eres capaz de conectar con las personas a un nivel que pocas personas alcanzan. Hoy, usa ese don: ve más allá de lo que alguien dice y sintoniza con lo que realmente necesita. Eso es amor maestro.',
      salud:    'El 11 es profundamente afectado por el entorno y las emociones ajenas. Hoy, protege tu campo: elige con cuidado con quién compartes tu tiempo. Tu bienestar empieza por lo que permites entrar.',
      proposito: 'Tu propósito tiene dimensiones que todavía no ves por completo. Hoy, no trates de entenderlo todo — confía en el paso que ya tienes claro. El 11 se despliega en capas, no de golpe.',
      felicidad: 'El 11 encuentra alegría profunda en los momentos de conexión real y creación auténtica. Hoy, busca uno de esos momentos — aunque sea breve. Eso restaura tu energía más que cualquier otra cosa.',
    },
  },

  22: {
    reading: {
      dinero:    'La pregunta no es cuánto ganas hoy. Es qué estás construyendo.',
      amor:      'El amor que quieres se construye. Da el primer ladrillo hoy.',
      salud:     'Lo que construyes no sobrevive si el constructor se rompe.',
      proposito: 'Todo gran plan empezó con un solo paso concreto. Da el tuyo.',
      felicidad: 'Reconoce hoy algo en lo que tu presencia mejoró algo real.',
    },
    expanded: {
      dinero:   'El 22 puede construir estructuras económicas que duran. Hoy, piensa en sistema, no en transacción: ¿qué estás construyendo que pueda funcionar sin depender solo de tu tiempo y esfuerzo?',
      amor:     'El 22 en el amor construye con visión de largo plazo. Hoy, invierte en la estructura de una relación importante: una conversación profunda, un acuerdo claro, un compromiso renovado.',
      salud:    'Tu cuerpo es el vehículo de todo lo que quieres construir. Hoy, trátalo como la infraestructura que es: no lo fuerces más allá de sus límites actuales; fortalécelo con constancia.',
      proposito: 'El 22 está aquí para construir algo que trascienda. Si todavía no sabes exactamente qué es, no importa: hoy da el paso que tienes claro. Los grandes arquitectos también empezaron con un solo ladrillo.',
      felicidad: 'La alegría del 22 viene de ver que lo que construye tiene impacto real. Hoy, reconoce una forma en que tu presencia mejoró algo — aunque sea pequeño. Eso alimenta la energía del constructor.',
    },
  },

  33: {
    reading: {
      dinero:    'Suelta la ansiedad sobre el dinero. No construye — bloquea.',
      amor:      'Ama con la misma generosidad hacia ti que hacia los demás.',
      salud:     'Identifica qué peso emocional no es tuyo y devuélvelo hoy.',
      proposito: 'Comparte algo de lo que aprendiste. Sin agenda. Sin esperar nada.',
      felicidad: 'Cuando alguien reconozca algo tuyo hoy, recíbelo. No lo desvíes.',
    },
    expanded: {
      dinero:   'El 33 atrae abundancia cuando opera desde el amor incondicional, no desde la necesidad. Hoy, suelta cualquier ansiedad financiera que estés cargando. La energía de la ansiedad no construye — bloquea.',
      amor:     'Tienes una capacidad de amar que puede ser un regalo para quienes te rodean. Hoy cuida que ese amor también vaya hacia ti. El 33 que se descuida a sí mismo/a termina vacío/a, aunque dé mucho.',
      salud:    'El 33 carga con las emociones de los que ama. Hoy, revisa qué peso estás cargando que no es tuyo. Devolverlo con compasión no es abandono — es sabiduría.',
      proposito: 'Tu propósito más alto tiene que ver con elevar a otros. Hoy, comparte algo de lo que has aprendido — sin agenda, sin esperar nada a cambio. Eso activa la frecuencia del 33.',
      felicidad: 'La alegría del 33 viene de sentir que su presencia importa. Hoy, permítete recibir ese reconocimiento cuando llega — no lo desvíes, no lo minimices. Recibirlo con gracia es parte de tu misión.',
    },
  },
}

// ── Main export ───────────────────────────────────────────────────────────────

export function calculateSignal(input: SignalInput): SignalResult {
  const { fullName, birthDate, zodiacSign, lunarPhase, manifestationArea, date, requestIndex } = input

  // Numerological shift: encodes person + day + phase energy (range 3-26)
  const lifeNumber = calculateNumerology(fullName)
  const dayBase    = toBase(universalDayNumber(date))
  const phaseVal   = PHASE_VALUE[lunarPhase] ?? 1
  const raw        = lifeNumber + dayBase + phaseVal

  // Personalized hash: encodes who × when × which signal
  // Including requestIndex ensures the 3 daily signals always differ
  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
  const h       = djb2(`${fullName}|${birthDate}|${zodiacSign}|${dateKey}|${requestIndex}`)

  // Pool lookup: numerological shift (raw) modulates which pool window is active;
  // hash (h) personalizes within that window. Interleaved pool guarantees
  // adjacent indices always produce distinct numbers.
  const signalNumber = SIGNAL_POOL[(raw + h) % 100]

  // Resolve content
  const content = SIGNAL_CONTENT[signalNumber] ?? SIGNAL_CONTENT[1]!
  const area    = (manifestationArea as AreaKey) in content.reading
    ? (manifestationArea as AreaKey)
    : 'felicidad'

  return {
    number:   signalNumber,
    reading:  content.reading[area],
    expanded: content.expanded[area],
  }
}
