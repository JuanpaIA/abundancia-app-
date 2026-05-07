import { ManifestationArea } from '../types'

export interface NumerologyProfile {
  archetype: string
  qualities: [string, string, string]
  essence: string
  areaMessage: Record<ManifestationArea, string>
}

export const NUMEROLOGY_PROFILES: Record<number, NumerologyProfile> = {
  1: {
    archetype: 'El Pionero',
    qualities: ['Liderazgo', 'Independencia', 'Determinación'],
    essence: 'Eres energía de inicio puro. Tu vibración abre puertas donde otros ven muros. El universo responde a tu acción directa.',
    areaMessage: {
      dinero: 'Tu camino a la prosperidad es el del fundador, no el del empleado. La riqueza que construyas será la primera de su clase en tu historia familiar.',
      amor: 'Necesitas una pareja que admire tu independencia, no que compita con ella. Tu número atrae vínculos donde eres fuente de inspiración mutua.',
      salud: 'Tu vitalidad nace de los retos. Sin un objetivo físico ambicioso en el horizonte, tu energía se estanca. El movimiento es tu medicina.',
      proposito: 'Naciste para abrir caminos que otros seguirán. Tu misión tiene el sello del fundador — liderar desde el frente, no desde la comodidad.',
      felicidad: 'Tu paz está en el movimiento hacia algo nuevo. Cuando estás avanzando, estás en tu estado natural. El estancamiento es tu único enemigo real.',
    },
  },
  2: {
    archetype: 'El Diplomático',
    qualities: ['Intuición', 'Cooperación', 'Sensibilidad'],
    essence: 'Tu vibración conecta lo que está separado. Donde otros ven diferencias, tú encuentras el puente invisible que une. La armonía es tu poder real.',
    areaMessage: {
      dinero: 'Tu prosperidad crece en alianzas. Los negocios más transformadores de tu vida serán co-creados, no construidos en solitario.',
      amor: 'El amor es tu elemento natural. El 2 es el número de las almas complementarias — tu corazón tiene la capacidad innata de reconocer su par.',
      salud: 'Tu cuerpo responde directamente a tu entorno emocional. Cuando hay armonía en tus relaciones, tu energía física alcanza su punto más alto.',
      proposito: 'Tu misión es ser puente entre personas y mundos opuestos. Tienes el don de hacer que quienes no se entienden, finalmente se escuchen.',
      felicidad: 'Tu alegría vive en la conexión profunda. Una conversación verdadera vale más para ti que mil logros solitarios. Invierte en tus vínculos.',
    },
  },
  3: {
    archetype: 'El Creador',
    qualities: ['Creatividad', 'Expresión', 'Alegría'],
    essence: 'Eres canal de inspiración pura. Tu vibración transforma lo ordinario en extraordinario. El mundo necesita lo que solo tú puedes expresar.',
    areaMessage: {
      dinero: 'Tu camino a la prosperidad pasa por la expresión. Lo que creas con tu voz, tus manos o tu mente tiene un valor económico que aún no has descubierto del todo.',
      amor: 'En el amor eres magnético. Tu alegría natural y energía creativa atraen a quienes buscan a alguien que los inspire a ser más.',
      salud: 'Tu cuerpo necesita expresarse. El movimiento, el arte, la danza — cualquier forma de creatividad física es tu recarga más poderosa.',
      proposito: 'Viniste a crear e inspirar. Tu legado serán las obras, ideas y personas que transformaste con tu expresión única e irrepetible.',
      felicidad: 'Tu felicidad es contagiosa cuando te permites expresarte sin filtros. La creatividad no es un hobby para ti — es una necesidad del alma.',
    },
  },
  4: {
    archetype: 'El Constructor',
    qualities: ['Disciplina', 'Estabilidad', 'Método'],
    essence: 'Tu vibración construye lo que perdura. Donde otros ven ladrillos sueltos, tú ves el edificio terminado. La constancia es tu forma de magia.',
    areaMessage: {
      dinero: 'Tu riqueza se construye ladrillo a ladrillo y dura generaciones. No dependes de golpes de suerte — tu disciplina es tu mayor activo financiero.',
      amor: 'En el amor eres el pilar. Tu pareja encuentra en ti la seguridad que necesita para crecer. Buscas instintivamente relaciones que resistan el paso del tiempo.',
      salud: 'La consistencia es tu superpoder. Los hábitos que otros abandonan a las dos semanas, tú los conviertes en resultados permanentes y medibles.',
      proposito: 'Estás aquí para construir sistemas que funcionen cuando tú ya no estés. Tu misión implica crear estructuras que sostengan a muchos durante mucho tiempo.',
      felicidad: 'Tu paz está en el orden y el progreso constante. Cuando tienes un plan sólido y ves avance real, estás completamente en tu elemento.',
    },
  },
  5: {
    archetype: 'El Libre',
    qualities: ['Libertad', 'Adaptabilidad', 'Aventura'],
    essence: 'Tu vibración rompe límites. Eres el recordatorio de que las reglas existen para cuestionarse. El cambio no te asusta — te alimenta.',
    areaMessage: {
      dinero: 'Tu prosperidad llega por caminos que no existían hace seis meses. Las oportunidades financieras más grandes de tu vida vendrán del cambio, no de la rutina.',
      amor: 'Necesitas una pareja que sea también tu compañero de aventuras. El amor que te transforma es el que te da libertad para seguir creciendo.',
      salud: 'Tu cuerpo necesita variedad. Romper la rutina de ejercicio, explorar nuevos hábitos y sorprender a tu cuerpo es lo que mantiene tu energía elevada.',
      proposito: 'Tu misión es expandir horizontes — los tuyos y los de quienes te rodean. Eres el arquetipo del explorador: comunicar, descubrir, transformar.',
      felicidad: 'Tu alegría vive en lo inesperado. Los mejores momentos de tu vida siempre habrán llegado cuando te permitiste improvisar y decir sí.',
    },
  },
  6: {
    archetype: 'El Armonizador',
    qualities: ['Amor', 'Responsabilidad', 'Belleza'],
    essence: 'Tu vibración sana y nutre. Donde llegas, el caos encuentra orden y el dolor encuentra consuelo. El amor es tu lenguaje nativo.',
    areaMessage: {
      dinero: 'Tu prosperidad está conectada al servicio genuino. Cuando lo que haces mejora la vida de otros, el dinero fluye hacia ti como consecuencia natural.',
      amor: 'El 6 es el número del amor incondicional. Tu capacidad de cuidar y nutrir crea vínculos tan profundos que se convierten en raíces irrompibles.',
      salud: 'Tu bienestar es colectivo. Cuando las personas que amas están bien y tu entorno es armonioso, tu cuerpo responde con una vitalidad que sorprende.',
      proposito: 'Estás aquí para servir con amor sin perder tu centro. Tu misión involucra sanar, nutrir o crear belleza tangible en el mundo que te rodea.',
      felicidad: 'Tu felicidad más profunda está en el hogar y en los vínculos verdaderos. Cuando tu entorno refleja armonía, tu alma encuentra su paz completa.',
    },
  },
  7: {
    archetype: 'El Sabio',
    qualities: ['Sabiduría', 'Análisis', 'Espiritualidad'],
    essence: 'Tu vibración busca la verdad detrás de la verdad. Donde otros aceptan la superficie, tú necesitas entender las raíces. El conocimiento es tu poder.',
    areaMessage: {
      dinero: 'Tu prosperidad nace de la especialización profunda. El conocimiento que nadie más tiene en tu campo es tu activo financiero más valioso.',
      amor: 'En el amor buscas conexión intelectual y espiritual antes que física. El 7 se enamora del alma — necesitas a alguien que te haga pensar diferente.',
      salud: 'Tu salud está directamente conectada a tu estado mental. La meditación, el silencio y la contemplación no son lujos para ti — son necesidades básicas.',
      proposito: 'Viniste a buscar la verdad y a compartirla. Tu misión tiene que ver con investigar, enseñar o despertar conciencia en quienes te rodean.',
      felicidad: 'Tu paz está en la comprensión. Cuando entiendes el por qué de lo que vives, encuentras sentido donde otros solo ven caos. Esa claridad es tu hogar.',
    },
  },
  8: {
    archetype: 'El Manifestador',
    qualities: ['Poder', 'Abundancia', 'Autoridad'],
    essence: 'Tu vibración está sintonizada con la prosperidad material y el poder legítimo. El 8 no pide permiso — crea los resultados que imagina.',
    areaMessage: {
      dinero: 'El 8 es el número de la abundancia material por excelencia. Tu energía está naturalmente calibrada para atraer, multiplicar y gestionar riqueza con visión.',
      amor: 'En el amor necesitas una pareja que comparta tu ambición y tu intensidad. Tu número atrae vínculos donde ambos se potencian mutuamente sin competir.',
      salud: 'Tu vitalidad está ligada a tu sentido de poder personal. Cuando estás ganando en tu área, tu cuerpo lo siente. Vigila el estrés — es tu única trampa.',
      proposito: 'Estás aquí para ejercer poder con integridad. Tu misión implica liderar, construir legado y demostrar al mundo que el éxito y los valores no se contradicen.',
      felicidad: 'Tu alegría está en los logros tangibles. Cada meta alcanzada recarga tu energía vital. No minimices tus victorias — celebrarlas es parte de tu camino.',
    },
  },
  9: {
    archetype: 'El Maestro',
    qualities: ['Compasión', 'Sabiduría universal', 'Completitud'],
    essence: 'Tu vibración abarca el ciclo completo. Eres el número de la sabiduría acumulada, el que llegó más lejos en esta vuelta. Tu propósito es más grande que tú.',
    areaMessage: {
      dinero: 'Tu prosperidad tiene propósito universal. La riqueza que construyas estará naturalmente vinculada a impactar vidas que van mucho más allá de la tuya.',
      amor: 'El 9 ama con profundidad que pocos comprenden. En el amor romántico buscas a quien comparta tu visión del mundo — alguien que también quiera dejar huella.',
      salud: 'Tu energía vital está conectada a tu sentido de misión. Cuando sientes que tu vida tiene impacto real, tu cuerpo genera una vitalidad que no tiene explicación racional.',
      proposito: 'Eres el número de la completitud y la maestría. Tu misión implica enseñar, sanar o liderar movimientos que eleven la conciencia colectiva.',
      felicidad: 'Tu alegría más profunda viene de saber que dejaste el mundo mejor de como lo encontraste. Tu felicidad no puede ser solo tuya — necesita ser compartida.',
    },
  },
}
