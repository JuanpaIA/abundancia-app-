import { LunarPhase } from '../types'
import { getLunarPhase } from './calculations'

export interface LunarPhaseContent {
  name: string
  emoji: string
  isKeyPhase: boolean
  borderColor: string
  energy: string
  description: string
  intention: string
  ritual: string
  affirmation: string
}

export interface NextKeyPhaseInfo {
  phase: 'nueva' | 'llena'
  content: LunarPhaseContent
  daysAway: number
  dateLabel: string
}

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

export const LUNAR_PHASE_CONTENT: Record<LunarPhase, LunarPhaseContent> = {
  nueva: {
    name: 'Luna Nueva',
    emoji: '🌑',
    isKeyPhase: true,
    borderColor: '#7B6FD7',
    energy: 'Portal de nuevos comienzos · Silencio creativo',
    description: 'El cielo se oscurece para que veas con más claridad. La Luna Nueva es el momento más poderoso para sembrar intenciones. Lo que declares hoy tiene el respaldo del cosmos.',
    intention: 'Escribe en papel lo que deseas manifestar en este ciclo de 29 días. Sé específico, sé audaz. El universo está listo para recibirlo.',
    ritual: 'Enciende una vela blanca o plateada. Escribe tres deseos y léelos en voz alta. Visualiza cada uno cumplido y deja que la llama selle tu intención.',
    affirmation: '"Planto mis intenciones en tierra fértil. El universo ya trabaja a mi favor."',
  },
  llena: {
    name: 'Luna Llena',
    emoji: '🌕',
    isKeyPhase: true,
    borderColor: '#E8C96B',
    energy: 'Plenitud y cosecha · Gratitud en su cúspide',
    description: 'La luna brilla en su máximo esplendor. Es tiempo de celebrar lo manifestado, liberar lo que ya no sirve y amplificar tu energía con gratitud. El universo escucha hoy con especial claridad.',
    intention: 'Haz una lista de todo lo que llegó a tu vida desde la última Luna Nueva. Agradece incluso lo pequeño. Lo que agradeces se multiplica.',
    ritual: 'Siéntate bajo la luz de la luna o junto a una ventana. Respira profundo tres veces. Escribe en un papel lo que deseas liberar y quémalo o entiérralo con intención.',
    affirmation: '"Recibo con gratitud todo lo que he manifestado. Me abro a más abundancia en cada ciclo."',
  },
  creciente_inicial: {
    name: 'Luna Creciente',
    emoji: '🌒',
    isKeyPhase: false,
    borderColor: 'rgba(255,255,255,0.08)',
    energy: 'Impulso inicial · Primeros pasos en acción',
    description: 'El momentum está creciendo. Es tiempo de tomar acción concreta sobre las intenciones que sembraste en la Luna Nueva.',
    intention: '', ritual: '', affirmation: '',
  },
  cuarto_creciente: {
    name: 'Cuarto Creciente',
    emoji: '🌓',
    isKeyPhase: false,
    borderColor: 'rgba(255,255,255,0.08)',
    energy: 'Decisión y superación de obstáculos',
    description: 'Momento de empujar con determinación. Los obstáculos que aparecen ahora son una prueba de tu compromiso con lo que manifiestas.',
    intention: '', ritual: '', affirmation: '',
  },
  creciente_gibosa: {
    name: 'Creciente Gibosa',
    emoji: '🌔',
    isKeyPhase: false,
    borderColor: 'rgba(255,255,255,0.08)',
    energy: 'Refinamiento · A pasos de la plenitud',
    description: 'Ajusta, afina y perfecciona. Estás a pocos días de la Luna Llena — da los últimos toques a lo que manifiestas.',
    intention: '', ritual: '', affirmation: '',
  },
  menguante_gibosa: {
    name: 'Menguante Gibosa',
    emoji: '🌖',
    isKeyPhase: false,
    borderColor: 'rgba(255,255,255,0.08)',
    energy: 'Gratitud y reflexión interior',
    description: 'La energía fluye hacia adentro. Reflexiona sobre lo cosechado, agradece y comparte los aprendizajes de este ciclo.',
    intention: '', ritual: '', affirmation: '',
  },
  cuarto_menguante: {
    name: 'Cuarto Menguante',
    emoji: '🌗',
    isKeyPhase: false,
    borderColor: 'rgba(255,255,255,0.08)',
    energy: 'Rendición y liberación consciente',
    description: 'Suelta hábitos, creencias y situaciones que ya no te sirven. Crea espacio limpio para el próximo ciclo de manifestación.',
    intention: '', ritual: '', affirmation: '',
  },
  menguante_final: {
    name: 'Luna Menguante',
    emoji: '🌘',
    isKeyPhase: false,
    borderColor: 'rgba(255,255,255,0.08)',
    energy: 'Descanso y preparación para el nuevo ciclo',
    description: 'El cosmos te invita a descansar y renovarte. Es el momento de preparar tu energía para la próxima siembra de intenciones.',
    intention: '', ritual: '', affirmation: '',
  },
}

export function getNextKeyPhase(from: Date): NextKeyPhaseInfo | null {
  for (let i = 1; i <= 30; i++) {
    const d = new Date(from)
    d.setDate(d.getDate() + i)
    const phase = getLunarPhase(d)
    if (phase === 'nueva' || phase === 'llena') {
      return {
        phase,
        content: LUNAR_PHASE_CONTENT[phase],
        daysAway: i,
        dateLabel: `${d.getDate()} ${MONTHS_ES[d.getMonth()]}`,
      }
    }
  }
  return null
}
