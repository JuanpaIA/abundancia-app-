// Shared pure-TS types and helpers — no platform APIs, no React Native imports.
// Both notifications.ts (web) and notifications.native.ts import from here
// to avoid Metro resolving '.native.ts' as its own dependency (require cycle).

import { ManifestationArea } from '@lumina/core'

const ZODIAC_ELEMENT: Record<string, 'fuego' | 'tierra' | 'aire' | 'agua'> = {
  aries: 'fuego', leo: 'fuego', sagitario: 'fuego',
  tauro: 'tierra', virgo: 'tierra', capricornio: 'tierra',
  geminis: 'aire', libra: 'aire', acuario: 'aire',
  cancer: 'agua', escorpio: 'agua', piscis: 'agua',
}

const ELEMENT_LINE: Record<'fuego' | 'tierra' | 'aire' | 'agua', string> = {
  fuego:  'Tu energía de fuego amplifica cada intención que declares hoy.',
  tierra: 'Tu energía de tierra convierte las intenciones en realidad concreta.',
  aire:   'Tu energía mental conecta las señales del cosmos con tu acción.',
  agua:   'Tu intuición está en su punto más alto — confía en lo que sientes.',
}

export const AREA_RESCUE: Record<ManifestationArea, string> = {
  dinero:    'Tu plan de abundancia te espera — incluso 5 minutos hoy mantiene tu vibración activa.',
  amor:      'Tu plan de amor te espera — un pequeño paso hoy reaviva tu energía.',
  salud:     'Tu plan de vitalidad te espera — retoma hoy con una sola práctica.',
  proposito: 'Tu plan de propósito te espera — cada día sin acción aleja tu misión.',
  felicidad: 'Tu plan de felicidad te espera — vuelve hoy, aunque sea un momento.',
}

export const AREA_MORNING: Record<ManifestationArea, string[]> = {
  dinero: [
    'Tu prosperidad se construye con constancia, no con suerte.',
    'Cada hábito cumplido hoy acerca el dinero a tu vida.',
    'La abundancia financiera es tuya — el sistema te muestra el camino.',
    'Hoy tienes en tus manos todo lo que necesitas para atraer prosperidad.',
    'Un día más de disciplina es un día más cerca de tu libertad financiera.',
    'Tu energía financiera está en su punto más alto cuando actúas.',
    'El dinero fluye hacia quienes tienen claridad y acción diaria.',
  ],
  amor: [
    'El amor que buscas empieza con la energía que cultivas hoy.',
    'Cada acción de hoy te acerca a la conexión que mereces.',
    'Tu corazón está listo para recibir — el universo también.',
    'Hoy es un día perfecto para abrirte al amor que ya viene hacia ti.',
    'La vibración del amor empieza en tu interior. Tu protocolo la eleva.',
    'Atrae lo que eres. Hoy, sé la versión más plena de ti.',
    'El amor responde a quienes se preparan para recibirlo.',
  ],
  salud: [
    'Tu cuerpo responde cuando le das la energía y atención que merece.',
    'Cada hábito cumplido hoy es una inversión en tu vitalidad.',
    'La salud no es un destino — es lo que construyes día a día.',
    'Hoy tu cuerpo está listo para recibir todo lo que le des.',
    'Una acción pequeña hoy crea el cuerpo que quieres mañana.',
    'Tu vitalidad está en tus manos — el protocolo de hoy la activa.',
    'La energía que necesitas está disponible. Hoy la despiertas.',
  ],
  proposito: [
    'Tu misión de vida no espera — cada día que actúas la acercas.',
    'Hoy tienes una oportunidad única de vivir alineado con tu propósito.',
    'El mundo necesita lo que solo tú puedes dar. Empieza hoy.',
    'Tu legado se construye en días como hoy — con acción y con fe.',
    'Vivir tu propósito no es un lujo — es tu derecho. Reclámalo hoy.',
    'Cada paso en tu protocolo te acerca a la vida que viniste a vivir.',
    'Tu propósito ya existe — hoy solo tienes que caminarlo.',
  ],
  felicidad: [
    'La paz y la alegría que buscas están más cerca de lo que crees.',
    'Hoy es un nuevo comienzo. Todo lo que quieres está al alcance de tu mano.',
    'La felicidad no espera al futuro — se construye en momentos como este.',
    'Tu bienestar importa. Hoy, dedica tiempo a lo que te hace florecer.',
    'Un día bien vivido es la base de una vida feliz. Empieza ahora.',
    'La alegría fluye cuando actúas desde la intención. Tu protocolo te guía.',
    'Hoy puedes elegir la versión más plena de ti.',
  ],
}

export interface MorningProfile {
  full_name: string
  manifestation_area: ManifestationArea
  plan_start_date: string | null
  zodiac_sign: string
}

export function buildMorningMessage(
  profile: MorningProfile,
  targetDate: Date,
): { title: string; body: string } {
  const firstName = profile.full_name.split(' ')[0]
  const area = profile.manifestation_area
  const messages = AREA_MORNING[area]

  const planStart = profile.plan_start_date
    ? new Date(profile.plan_start_date + 'T00:00:00')
    : new Date()
  const dayIndex = Math.max(0, Math.floor(
    (targetDate.getTime() - planStart.getTime()) / 86400000
  ))
  const planDay = dayIndex + 1

  const element = ZODIAC_ELEMENT[profile.zodiac_sign] ?? 'tierra'
  const elementLine = ELEMENT_LINE[element]
  const motiveLine = messages[dayIndex % messages.length]

  return {
    title: `🌅 Buenos días, ${firstName}`,
    body: `Día ${planDay} de tu plan. ${motiveLine} ${elementLine} Tu protocolo de hoy está listo — ábrelo y avanza.`,
  }
}
