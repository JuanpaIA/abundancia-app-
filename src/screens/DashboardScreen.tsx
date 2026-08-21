import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, AppState, Modal, KeyboardAvoidingView, Platform, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg'
import { useAuth } from '../hooks/useAuth'
import { useFrequencyPlayer } from '../hooks/useFrequencyPlayer'
import { useErrorReporter } from '../hooks/useErrorReporter'
import { Card } from '../components/ui/Card'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { getLunarPhase, getLunarPhaseLabel, getLunarPhaseEmoji } from '../utils/calculations'
import { LUNAR_PHASE_CONTENT, getNextKeyPhase } from '../utils/lunarPhaseContent'
import { getPortalForDate, getNextPortal, getPortalPowerColor, getPortalPowerLabel } from '../utils/energeticPortals'
import { scheduleAbundanciaNotifications, scheduleWeeklyPatternNotification } from '../utils/notifications'
import * as Notifications from 'expo-notifications'
import * as SecureStore from 'expo-secure-store'
import { generateDailyProtocol } from '../content/dailyProtocol'
import { generateDailyObjective, getPhaseInfo } from '../content/dailyObjective'
import { playCelebrationSound } from '../utils/celebrationSound'
import { ZodiacSign, LunarPhase, DailyLog } from '../types'
import { supabase } from '../services/supabase'
import { EditProfileScreen } from './EditProfileScreen'
import { HistoryScreen } from './HistoryScreen'
import { NotificationsScreen } from './NotificationsScreen'
import { AdminScreen } from './AdminScreen'
import { JournalScreen } from './JournalScreen'
import { VisionBoardScreen } from './VisionBoardScreen'
import { BadgesScreen } from './BadgesScreen'
import { FrequenciesScreen } from './FrequenciesScreen'
import { FrequencyPlayerOverlay } from '../components/overlays/FrequencyPlayerOverlay'
import { AffirmationReveal } from '../components/overlays/AffirmationReveal'
import { TransformationCard } from '../components/overlays/TransformationCard'

// ── Numerología ───────────────────────────────────────────────────────────────
interface NumerologyInfo {
  archetype: string
  keywords: string[]
  energy: string
  shadow: string
}

const NUMEROLOGY_INFO: Record<number, NumerologyInfo> = {
  1: {
    archetype: 'El Iniciador',
    keywords: ['Liderazgo', 'Independencia', 'Pionero'],
    energy: 'Tu número irradia voluntad creadora. Tienes la fuerza innata para abrir caminos que otros aún no ven. Cada intención que declaras lleva la potencia de un nuevo comienzo.',
    shadow: 'El reto: soltar el control y confiar en el proceso.',
  },
  2: {
    archetype: 'El Diplomático',
    keywords: ['Intuición', 'Cooperación', 'Equilibrio'],
    energy: 'Tu número sintoniza con las frecuencias sutiles. Recibes señales del universo antes que los demás. Tu poder está en la escucha, la paciencia y el arte de unir.',
    shadow: 'El reto: confiar en tu propia percepción sin buscar validación externa.',
  },
  3: {
    archetype: 'El Creativo',
    keywords: ['Expresión', 'Alegría', 'Manifestación verbal'],
    energy: 'Tu número convierte palabras e ideas en realidad. Lo que dices y crees con entusiasmo tiende a materializarse con una velocidad poco común. Tu vibración eleva a todos los que te rodean.',
    shadow: 'El reto: canalizar la energía creativa sin dispersarla.',
  },
  4: {
    archetype: 'El Constructor',
    keywords: ['Disciplina', 'Solidez', 'Método'],
    energy: 'Tu número construye para durar. Los resultados que produces son sólidos, confiables y de largo plazo. El universo te responde cuando actúas con constancia y estructura.',
    shadow: 'El reto: abrirse al cambio y a lo inesperado sin resistencia.',
  },
  5: {
    archetype: 'El Libertador',
    keywords: ['Adaptabilidad', 'Cambio', 'Expansión'],
    energy: 'Tu número vive en el movimiento. Tu mayor manifestación llega cuando te permites fluir, experimentar y romper patrones que limitan tu crecimiento. La variedad es tu combustible.',
    shadow: 'El reto: sostener el compromiso cuando la novedad se desvanece.',
  },
  6: {
    archetype: 'El Armonizador',
    keywords: ['Amor', 'Responsabilidad', 'Servicio'],
    energy: 'Tu número magnifica el amor y la belleza. Manifiestas con mayor fuerza cuando tus acciones sirven a algo más grande que tú mismo. Tu energía crea ambientes que sanan.',
    shadow: 'El reto: aprender a recibir con la misma gracia con que das.',
  },
  7: {
    archetype: 'El Místico',
    keywords: ['Sabiduría', 'Introspección', 'Conexión interior'],
    energy: 'Tu número opera desde las profundidades. Manifiestas en silencio, con fe y con una comprensión que va más allá de lo racional. El universo se comunica contigo a través de señales y sincronías.',
    shadow: 'El reto: confiar en la vida aunque no puedas controlarlo todo.',
  },
  8: {
    archetype: 'El Manifestador',
    keywords: ['Abundancia', 'Poder', 'Éxito material'],
    energy: 'Tu número vibra en la frecuencia de la prosperidad. Tienes una relación natural con la riqueza, el liderazgo y la capacidad de transformar visión en resultados tangibles. La abundancia te reconoce.',
    shadow: 'El reto: equilibrar la ambición con el disfrute del camino.',
  },
  9: {
    archetype: 'El Sabio Universal',
    keywords: ['Compasión', 'Completitud', 'Legado'],
    energy: 'Tu número cierra ciclos y eleva conciencias. Manifiestas cuando actúas desde el amor incondicional y la visión colectiva. Tu presencia tiene el poder de transformar lo que toca.',
    shadow: 'El reto: soltar el pasado para abrirte plenamente al siguiente ciclo.',
  },
  11: {
    archetype: 'El Maestro Iluminado',
    keywords: ['Inspiración', 'Intuición elevada', 'Canal espiritual'],
    energy: 'Tu número es un número maestro. Eres un canal entre lo visible y lo invisible. Tu intuición opera en frecuencias que pocos comprenden. Cuando confías en ella, manifiestas a una velocidad que sorprende incluso a ti.',
    shadow: 'El reto: anclar la visión espiritual en acciones concretas del día a día.',
  },
  22: {
    archetype: 'El Constructor Maestro',
    keywords: ['Visión global', 'Manifestación a escala', 'Impacto'],
    energy: 'Tu número es el más poderoso para construir en el plano material. Estás diseñado para proyectos que trascienden lo personal y dejan huella en el mundo. Lo que creas dura generaciones.',
    shadow: 'El reto: no diluirte en la magnitud de la visión. Un paso a la vez.',
  },
  33: {
    archetype: 'El Maestro Sanador',
    keywords: ['Amor incondicional', 'Enseñanza', 'Sanación'],
    energy: 'Tu número lleva la vibración más alta de servicio. Eres un faro de amor y sanación para todos los que entran en contacto contigo. Tu manifestación más poderosa ocurre cuando enseñas, guías o elevas a otros.',
    shadow: 'El reto: cuidar tu propia energía con la misma devoción que cuidas a los demás.',
  },
}

// ── Contexto de frecuencias ───────────────────────────────────────────────────
interface FrequencyContext {
  when: string        // momento del día recomendado
  howTo: string       // qué hacer mientras escuchas
  integration: string // cómo conecta con el plan diario
  duration: string    // duración sugerida
}

const FREQUENCY_CONTEXT: Record<number, FrequencyContext> = {
  396: {
    when: '☀️ Mañana · antes de iniciar el día',
    howTo: 'Siéntate en silencio, cierra los ojos y respira profundo. Visualiza que una ola de luz dorada disuelve todo miedo, culpa o tensión acumulada. No fuerces nada — deja que la frecuencia haga el trabajo.',
    integration: 'Combínala con tu ritual del día para potenciar la liberación energética antes de declarar tus intenciones.',
    duration: '10–15 min',
  },
  417: {
    when: '🌤️ Tarde · en un momento de pausa',
    howTo: 'Ponla de fondo mientras revisas tu objetivo del día. Escribe en un papel lo que deseas cambiar o destrabar. Permite que la frecuencia abra caminos donde antes veías obstáculos.',
    integration: 'Escúchala justo antes de ejecutar tu objetivo diario para desbloquear la energía y entrar en acción con mayor fluidez.',
    duration: '10–20 min',
  },
  432: {
    when: '🕐 Cualquier momento del día',
    howTo: 'Ponla como fondo de trabajo o estudio. No necesitas concentrarte en ella — actúa en silencio sobre tu sistema nervioso, mejorando concentración y calma natural.',
    integration: 'Ideal durante tu protocolo de tarde o mientras completas tu objetivo del día. Su efecto es acumulativo.',
    duration: '20–45 min',
  },
  528: {
    when: '☀️ Mañana · durante tu ritual',
    howTo: 'Ponla de fondo mientras lees tu afirmación del día en voz alta. Repítela tres veces con convicción. Visualiza que cada célula de tu cuerpo vibra en la frecuencia del amor y la transformación.',
    integration: 'La combinación de tu afirmación del día + 528 Hz crea uno de los campos de manifestación más potentes del protocolo. No te saltes este momento.',
    duration: '10–15 min',
  },
  639: {
    when: '🌙 Noche · como cierre del día',
    howTo: 'Escúchala tumbado/a o sentado/a. Visualiza las personas y relaciones que deseas fortalecer. Siente amor genuino fluyendo desde tu corazón hacia ellas sin condición.',
    integration: 'Combínala con tu protocolo de noche. Cerrar el día en esta frecuencia programa tu mente inconsciente para atraer conexiones auténticas mientras duermes.',
    duration: '15–20 min',
  },
  741: {
    when: '☀️ Mañana · durante la meditación',
    howTo: 'Escúchala con los ojos cerrados. Plantéate una pregunta relacionada con tu objetivo y deja fluir ideas sin juzgarlas. Anota todo lo que llegue al final.',
    integration: 'Úsala antes de leer tu objetivo del día para activar tu capacidad de encontrar soluciones creativas. La claridad que genera potencia cada acción que tomes después.',
    duration: '10–15 min',
  },
  852: {
    when: '🌤️ Tarde · pausa de 10 minutos',
    howTo: 'Detente. Cierra los ojos. Pregúntate en silencio: ¿Qué señal del universo he ignorado hoy? Escucha sin forzar respuestas. La intuición habla en susurros.',
    integration: 'Combínala con tu afirmación del día: léela primero, luego escucha la frecuencia 10 minutos con esa intención activa en la mente. Refuerza la conexión entre tu lógica e intuición.',
    duration: '10–15 min',
  },
  963: {
    when: '🌙 Noche · última actividad antes de dormir',
    howTo: 'Recuéstate, cierra los ojos y visualiza tu conciencia expandiéndose más allá del cuerpo. Siente que eres parte de algo mucho más grande que tú mismo. Deja ir el día con gratitud total.',
    integration: 'Es el cierre perfecto de tu protocolo nocturno. Entrar al sueño en esta frecuencia programa tu subconsciente para recibir orientación y consolidar lo manifestado durante el día.',
    duration: '15–20 min',
  },
}
// ── Multi-line chart ──────────────────────────────────────────────────────────
const CHART_H = 180
const PAD_L = 24   // eje Y
const PAD_R = 8
const PAD_T = 14
const PAD_B = 44   // espacio para labels rotados
const PLOT_H = CHART_H - PAD_T - PAD_B
const Y_MAX = 9
const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]}`
}

interface ChartPoint { day: number; count: number; isToday: boolean; dateStr: string }

function MultiLineChart({ data }: { data: ChartPoint[] }) {
  const [chartW, setChartW] = useState(300)
  const plotW = chartW - PAD_L - PAD_R
  const n = data.length

  function xOf(i: number) {
    if (n <= 1) return PAD_L + plotW / 2
    return PAD_L + (i / (n - 1)) * plotW
  }
  function yOf(v: number) {
    return PAD_T + PLOT_H - (v / Y_MAX) * PLOT_H
  }

  const greenPts = data.map((d, i) => `${xOf(i)},${yOf(d.count)}`).join(' ')
  const redPts   = data.map((d, i) => `${xOf(i)},${yOf(Y_MAX - d.count)}`).join(' ')

  // Mostrar etiqueta X cada N días, siempre primer y último
  const step = n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : 5
  const showLabel = (i: number) => i === 0 || i === n - 1 || i % step === 0

  const axisY = PAD_T + PLOT_H

  return (
    <View onLayout={e => setChartW(e.nativeEvent.layout.width)}>
      <Svg width={chartW} height={CHART_H}>

        {/* Y axis label vertical */}
        <SvgText
          x={10} y={PAD_T + PLOT_H / 2}
          fontSize={8} fill="rgba(255,255,255,0.30)"
          textAnchor="middle"
          transform={`rotate(-90, 10, ${PAD_T + PLOT_H / 2})`}
        >tareas</SvgText>

        {/* Grid horizontal + Y tick labels */}
        {[0, 3, 6, 9].map(v => (
          <React.Fragment key={v}>
            <Line
              x1={PAD_L} y1={yOf(v)} x2={PAD_L + plotW} y2={yOf(v)}
              stroke={v === 0 ? 'rgba(201,168,76,0.25)' : 'rgba(201,168,76,0.10)'}
              strokeWidth={v === 0 ? 1 : 0.8}
              strokeDasharray={v === 0 ? undefined : '3,5'}
            />
            <SvgText
              x={PAD_L - 4} y={yOf(v) + 4}
              fontSize={9} fill="rgba(255,255,255,0.40)" textAnchor="end"
            >{v}</SvgText>
          </React.Fragment>
        ))}

        {/* Línea verde — tareas completadas */}
        {n > 1 && (
          <Polyline
            points={greenPts}
            fill="none" stroke="#4CAF82" strokeWidth={2.5}
            strokeLinejoin="round" strokeLinecap="round"
          />
        )}

        {/* Línea roja — tareas pendientes (invertido) */}
        {n > 1 && (
          <Polyline
            points={redPts}
            fill="none" stroke="#E05555" strokeWidth={2.5}
            strokeLinejoin="round" strokeLinecap="round"
          />
        )}

        {/* Puntos */}
        {data.map((d, i) => {
          const gx = xOf(i); const gy = yOf(d.count)
          const rx = xOf(i); const ry = yOf(Y_MAX - d.count)
          return (
            <React.Fragment key={d.day}>
              <Circle cx={gx} cy={gy} r={d.isToday ? 4.5 : 3} fill="#4CAF82" />
              <Circle cx={rx} cy={ry} r={d.isToday ? 4.5 : 3} fill="#E05555" />
              {d.isToday && (
                <>
                  <Circle cx={gx} cy={gy} r={8} fill="none" stroke="#E05555" strokeWidth={1} strokeOpacity={0.35}/>
                  <Circle cx={rx} cy={ry} r={8} fill="none" stroke="#4CAF82" strokeWidth={1} strokeOpacity={0.35}/>
                </>
              )}
            </React.Fragment>
          )
        })}

        {/* X labels rotados -45° */}
        {data.map((d, i) => {
          if (!showLabel(i)) return null
          const x = xOf(i)
          const y = axisY + 10
          return (
            <SvgText
              key={d.day}
              x={x} y={y}
              fontSize={d.isToday ? 10 : 9}
              fill={d.isToday ? '#C9A84C' : 'rgba(255,255,255,0.40)'}
              fontWeight={d.isToday ? 'bold' : 'normal'}
              textAnchor="end"
              transform={`rotate(-40, ${x}, ${y})`}
            >{fmtDate(d.dateStr)}</SvgText>
          )
        })}

      </Svg>
    </View>
  )
}
// ── Circular progress ─────────────────────────────────────────────────────────
const CP_SIZE = 128
const CP_SW   = 11
const CP_R    = (CP_SIZE - CP_SW) / 2
const CP_C    = 2 * Math.PI * CP_R

function CircularProgress({ completed, total }: { completed: number; total: number }) {
  const pct     = total > 0 ? completed / total : 0
  const offset  = CP_C * (1 - pct)
  const allDone = completed === total && total > 0
  const arcColor = allDone ? '#4CAF82' : '#C9A84C'
  const cx = CP_SIZE / 2
  const cy = CP_SIZE / 2

  return (
    <View style={cpStyles.root}>
      <Svg width={CP_SIZE} height={CP_SIZE}>
        {/* Track */}
        <Circle cx={cx} cy={cy} r={CP_R} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={CP_SW} />
        {/* Arc */}
        {completed > 0 && (
          <Circle cx={cx} cy={cy} r={CP_R} fill="none"
            stroke={arcColor} strokeWidth={CP_SW}
            strokeDasharray={`${CP_C} ${CP_C}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        )}
        {/* Number */}
        <SvgText x={cx} y={cy - 7} textAnchor="middle"
          fontSize={30} fontWeight="700" fill={arcColor}
        >{completed}</SvgText>
        <SvgText x={cx} y={cy + 13} textAnchor="middle"
          fontSize={10} fill="rgba(255,255,255,0.35)"
        >de {total} tareas</SvgText>
      </Svg>

      <View style={cpStyles.info}>
        <Text style={[cpStyles.pct, { color: arcColor }]}>
          {Math.round(pct * 100)}%
        </Text>
        <Text style={cpStyles.pctLabel}>completado hoy</Text>
        <View style={cpStyles.divider} />
        <View style={cpStyles.stat}>
          <View style={[cpStyles.dot, { backgroundColor: arcColor }]} />
          <Text style={cpStyles.statText}>{completed} realizadas</Text>
        </View>
        <View style={cpStyles.stat}>
          <View style={[cpStyles.dot, { backgroundColor: '#E05555' }]} />
          <Text style={cpStyles.statText}>{total - completed} pendientes</Text>
        </View>
      </View>
    </View>
  )
}

const cpStyles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  info: { flex: 1, gap: 5 },
  pct: { fontSize: 32, fontWeight: '800' },
  pctLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: -4 },
  divider: { height: 0.5, backgroundColor: 'rgba(201,168,76,0.15)', marginVertical: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statText: { fontSize: 13, color: Colors.textSecondary },
})
// ── Weekly energy ring ────────────────────────────────────────────────────────
const WE_SIZE = 100
const WE_SW   = 9
const WE_R    = (WE_SIZE - WE_SW) / 2
const WE_C    = 2 * Math.PI * WE_R

function levelColor(level: number | null): string {
  if (level === null) return 'rgba(255,255,255,0.10)'
  if (level <= 1) return '#E05555'
  if (level <= 2) return '#E09A55'
  if (level <= 3) return '#E0C955'
  if (level <= 4) return '#7FD47F'
  return '#4CAF82'
}

interface WeekDay { level: number | null; isToday: boolean; label: string; date: number }

function WeeklyEnergyRing({ days }: { days: WeekDay[] }) {
  const filled = days.filter(d => d.level !== null)
  const avg    = filled.length > 0
    ? filled.reduce((s, d) => s + d.level!, 0) / filled.length
    : 0
  const pct    = avg / 5
  const offset = WE_C * (1 - pct)
  const arc    = avg > 0 ? levelColor(Math.round(avg)) : 'rgba(255,255,255,0.15)'
  const cx = WE_SIZE / 2
  const cy = WE_SIZE / 2

  return (
    <View style={weStyles.root}>
      {/* Circle */}
      <Svg width={WE_SIZE} height={WE_SIZE}>
        <Circle cx={cx} cy={cy} r={WE_R} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={WE_SW} />
        {avg > 0 && (
          <Circle cx={cx} cy={cy} r={WE_R} fill="none"
            stroke={arc} strokeWidth={WE_SW}
            strokeDasharray={`${WE_C} ${WE_C}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        )}
        <SvgText x={cx} y={cy - 5} textAnchor="middle"
          fontSize={22} fontWeight="700"
          fill={avg > 0 ? arc : 'rgba(255,255,255,0.25)'}
        >{avg > 0 ? avg.toFixed(1) : '–'}</SvgText>
        <SvgText x={cx} y={cy + 12} textAnchor="middle"
          fontSize={9} fill="rgba(255,255,255,0.35)"
        >de 5</SvgText>
      </Svg>

      {/* Days */}
      <View style={weStyles.right}>
        <Text style={weStyles.header}>Promedio semanal</Text>
        <View style={weStyles.daysRow}>
          {days.map((d, i) => (
            <View key={i} style={weStyles.dayCol}>
              <View style={[
                weStyles.dayDot,
                { backgroundColor: levelColor(d.level) },
                d.isToday && weStyles.dayDotToday,
              ]} />
              <Text style={[weStyles.dayLabel, d.isToday && weStyles.dayLabelToday]}>
                {d.label}
              </Text>
              <Text style={[weStyles.dayDate, d.isToday && weStyles.dayLabelToday]}>
                {d.date}
              </Text>
              {d.level !== null && (
                <Text style={[weStyles.dayLevel, { color: levelColor(d.level) }]}>
                  {d.level}
                </Text>
              )}
            </View>
          ))}
        </View>
        <Text style={weStyles.meta}>{filled.length}/7 días registrados</Text>
      </View>
    </View>
  )
}

const weStyles = StyleSheet.create({
  root:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  right:  { flex: 1, gap: 6 },
  header: { fontSize: 11, color: Colors.textSecondary, letterSpacing: 0.4 },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol:  { alignItems: 'center', gap: 3 },
  dayDot:  { width: 14, height: 14, borderRadius: 7 },
  dayDotToday: { borderWidth: 2, borderColor: Colors.gold },
  dayLabel: { fontSize: 9, color: 'rgba(255,255,255,0.35)' },
  dayLabelToday: { color: Colors.gold, fontWeight: '700' },
  dayDate: { fontSize: 9, color: 'rgba(255,255,255,0.55)', marginTop: -2 },
  dayLevel: { fontSize: 9, fontWeight: '700' },
  meta: { fontSize: 10, color: 'rgba(255,255,255,0.25)' },
})
// ── Weekly progress ring ──────────────────────────────────────────────────────
interface ProgressDay { count: number | null; isToday: boolean; label: string; date: number }

function progressColor(count: number | null): string {
  if (count === null || count === 0) return 'rgba(255,255,255,0.10)'
  const pct = count / 9
  if (pct <= 0.33) return '#E05555'
  if (pct <= 0.55) return '#E09A55'
  if (pct <= 0.77) return '#E0C955'
  if (pct < 1)     return '#7FD47F'
  return '#4CAF82'
}

function WeeklyProgressRing({ days }: { days: ProgressDay[] }) {
  const filled  = days.filter(d => d.count !== null)
  const avgPct  = filled.length > 0
    ? filled.reduce((s, d) => s + d.count! / 9, 0) / filled.length
    : 0
  const offset  = WE_C * (1 - avgPct)
  const arcColor = avgPct > 0 ? progressColor(Math.round(avgPct * 9)) : 'rgba(255,255,255,0.15)'
  const cx = WE_SIZE / 2, cy = WE_SIZE / 2

  return (
    <View style={weStyles.root}>
      <Svg width={WE_SIZE} height={WE_SIZE}>
        <Circle cx={cx} cy={cy} r={WE_R} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={WE_SW} />
        {avgPct > 0 && (
          <Circle cx={cx} cy={cy} r={WE_R} fill="none"
            stroke={arcColor} strokeWidth={WE_SW}
            strokeDasharray={`${WE_C} ${WE_C}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        )}
        <SvgText x={cx} y={cy - 5} textAnchor="middle"
          fontSize={20} fontWeight="700"
          fill={avgPct > 0 ? arcColor : 'rgba(255,255,255,0.25)'}
        >{avgPct > 0 ? `${Math.round(avgPct * 100)}%` : '–'}</SvgText>
        <SvgText x={cx} y={cy + 12} textAnchor="middle"
          fontSize={9} fill="rgba(255,255,255,0.35)"
        >promedio</SvgText>
      </Svg>

      <View style={weStyles.right}>
        <Text style={weStyles.header}>Progreso últimos 7 días</Text>
        <View style={weStyles.daysRow}>
          {days.map((d, i) => (
            <View key={i} style={weStyles.dayCol}>
              <View style={[
                weStyles.dayDot,
                { backgroundColor: progressColor(d.count) },
                d.isToday && weStyles.dayDotToday,
              ]} />
              <Text style={[weStyles.dayLabel, d.isToday && weStyles.dayLabelToday]}>
                {d.label}
              </Text>
              <Text style={[weStyles.dayDate, d.isToday && weStyles.dayLabelToday]}>
                {d.date}
              </Text>
              {d.count !== null && d.count > 0 && (
                <Text style={[weStyles.dayLevel, { color: progressColor(d.count) }]}>
                  {d.count}
                </Text>
              )}
            </View>
          ))}
        </View>
        <Text style={weStyles.meta}>{filled.length}/7 días con actividad</Text>
      </View>
    </View>
  )
}
// ── Patrón semanal de hábitos ─────────────────────────────────────────────────
interface HabitDetail { name: string; emoji: string; tip: string }

const HABIT_DETAILS: Record<string, HabitDetail> = {
  daily_objective_done: {
    name: 'Objetivo del día', emoji: '🎯',
    tip: 'Léelo en voz alta cada mañana. Activar la intención conscientemente es el primer paso para materializarla.',
  },
  morning_done: {
    name: 'Protocolo de mañana', emoji: '☀️',
    tip: 'Hazlo antes de revisar el teléfono. Los primeros 5 minutos condicionan la energía de todo el día.',
  },
  afternoon_done: {
    name: 'Protocolo de tarde', emoji: '🌤️',
    tip: 'Ponlo como recordatorio a mediodía. Una pausa consciente de 5 minutos sostiene tu vibración.',
  },
  night_done: {
    name: 'Protocolo de noche', emoji: '🌙',
    tip: 'Intégralo a tu rutina de sueño. Tu mente procesa durante la noche lo que siembras al dormir.',
  },
  ritual_done: {
    name: 'Ritual del día', emoji: '🔮',
    tip: 'Aunque sea en versión corta: 3 respiraciones + tu intención. La consistencia supera la duración.',
  },
  affirmation_done: {
    name: 'Afirmación del día', emoji: '💬',
    tip: 'Dila frente al espejo mirándote a los ojos. La voz y el reflejo amplifican el impacto neurológico.',
  },
  color_done: {
    name: 'Color del día', emoji: '👗',
    tip: 'Es el hábito más rápido del plan. El color que usas envía una señal vibracional constante.',
  },
  foods_done: {
    name: 'Alimentos del día', emoji: '🍽️',
    tip: 'Incorpora aunque sea uno de los sugeridos. Tu estado físico y tu capacidad de manifestar están conectados.',
  },
  biohack_done: {
    name: 'Estrategia Biohack', emoji: '⚡',
    tip: 'Pon la frecuencia mientras te preparas o desayunas. No requiere tiempo extra, solo intención.',
  },
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── Helpers de almacenamiento (SecureStore en móvil, localStorage en web) ────

async function getStoredItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
  try { return await SecureStore.getItemAsync(key) } catch { return null }
}
async function setStoredItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') { if (typeof localStorage !== 'undefined') localStorage.setItem(key, value); return }
  try { await SecureStore.setItemAsync(key, value) } catch {}
}

// Devuelve true si el banner fue descartado y aún no llegó el siguiente slot (8h, 14h, 20h)
function isBannerSnoozed(dismissedAt: number | null): boolean {
  if (!dismissedAt) return false
  const SLOTS = [8, 14, 20]
  const now = new Date()
  const dismissed = new Date(dismissedAt)
  // Busca el próximo slot después del momento de dismissal
  const nextSlot = new Date(dismissed)
  const dismissedHour = dismissed.getHours() + dismissed.getMinutes() / 60
  const nextHour = SLOTS.find(h => h > dismissedHour)
  if (nextHour !== undefined) {
    nextSlot.setHours(nextHour, 0, 0, 0)
  } else {
    // Ya pasó el último slot del día → siguiente es 8h del día siguiente
    nextSlot.setDate(nextSlot.getDate() + 1)
    nextSlot.setHours(8, 0, 0, 0)
  }
  return now < nextSlot
}

function getMondayKey(): string {
  const d = new Date(); d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.toISOString().split('T')[0]
}

interface WeeklySummaryData {
  weekLabel: string
  totalTasks: number
  daysActive: number
  pct: number
  bestDayLabel: string
  bestDayCount: number
  streak: number
}

const DAYS_ES_LONG  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_SHORT  = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function buildWeeklySummary(logs: DailyLog[], currentStreak: number): WeeklySummaryData | null {
  const monday = new Date(); monday.setHours(0,0,0,0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const lastMonday = new Date(monday); lastMonday.setDate(lastMonday.getDate() - 7)
  const lastSunday = new Date(monday); lastSunday.setDate(lastSunday.getDate() - 1)

  const weekDates: string[] = []
  const d = new Date(lastMonday)
  while (d <= lastSunday) { weekDates.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1) }

  const weekLogs = logs.filter(l => weekDates.includes(l.date))
  if (weekLogs.length === 0) return null

  function countLog(l: DailyLog): number {
    const hc: string[] = (l as any).habits_completed || []
    return [
      l.daily_objective_done || hc.includes('daily_objective_done'),
      l.morning_done || hc.includes('morning_done'),
      l.afternoon_done || hc.includes('afternoon_done'),
      l.night_done || hc.includes('night_done'),
      (l as any).ritual_done || hc.includes('ritual_done'),
      (l as any).affirmation_done || hc.includes('affirmation_done'),
      (l as any).color_done || hc.includes('color_done'),
      (l as any).foods_done || hc.includes('foods_done'),
      (l as any).biohack_done || hc.includes('biohack_done'),
    ].filter(Boolean).length
  }

  const logMap = Object.fromEntries(weekLogs.map(l => [l.date, countLog(l)]))
  const totalTasks = weekDates.reduce((s, date) => s + (logMap[date] ?? 0), 0)
  const daysActive = weekDates.filter(date => (logMap[date] ?? 0) > 0).length
  const pct = Math.round((totalTasks / (7 * 9)) * 100)

  let bestDate = weekDates[0], bestCount = 0
  weekDates.forEach(date => { if ((logMap[date] ?? 0) > bestCount) { bestCount = logMap[date] ?? 0; bestDate = date } })
  const bestDayLabel = DAYS_ES_LONG[new Date(bestDate + 'T12:00:00').getDay()]

  const lm = lastMonday, ls = lastSunday
  const weekLabel = `${lm.getDate()} ${MONTHS_SHORT[lm.getMonth()]} — ${ls.getDate()} ${MONTHS_SHORT[ls.getMonth()]}`

  return { weekLabel, totalTasks, daysActive, pct, bestDayLabel, bestDayCount: bestCount, streak: currentStreak }
}

function WeeklySummaryModal({ data, firstName, onClose }: { data: WeeklySummaryData; firstName: string; onClose: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(60)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start()
  }, [])

  const msg = data.pct >= 80 ? 'Semana excepcional. Tu constancia está creando resultados reales.'
    : data.pct >= 60 ? 'Buena semana. Cada práctica completada eleva tu vibración.'
    : data.pct >= 40 ? 'Semana con progreso. Esta semana mantén el ritmo un paso más.'
    : data.pct >= 20 ? 'Semana lenta, pero aquí estás. Lo importante es no rendirse.'
    : 'Semana difícil. Esta semana empieza con una sola práctica — eso basta.'

  const pctColor = data.pct >= 60 ? Colors.gold : data.pct >= 30 ? '#4CAF82' : Colors.textSecondary

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[wsStyles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[wsStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <Text style={wsStyles.eyebrow}>✨ Resumen Semanal</Text>
          <Text style={wsStyles.weekLabel}>{data.weekLabel}</Text>
          <Text style={wsStyles.greeting}>Así fue tu semana, {firstName}</Text>
          <View style={wsStyles.pctContainer}>
            <Text style={[wsStyles.pctNumber, { color: pctColor }]}>{data.pct}%</Text>
            <Text style={wsStyles.pctLabel}>de tu protocolo completado</Text>
          </View>
          <View style={wsStyles.statsGrid}>
            <View style={wsStyles.statBox}>
              <Text style={wsStyles.statValue}>{data.totalTasks}</Text>
              <Text style={wsStyles.statLabel}>tareas{'\n'}completadas</Text>
            </View>
            <View style={[wsStyles.statBox, wsStyles.statBoxMid]}>
              <Text style={wsStyles.statValue}>{data.daysActive}</Text>
              <Text style={wsStyles.statLabel}>días{'\n'}activos</Text>
            </View>
            <View style={wsStyles.statBox}>
              <Text style={wsStyles.statValue}>🔥 {data.streak}</Text>
              <Text style={wsStyles.statLabel}>racha{'\n'}actual</Text>
            </View>
          </View>
          {data.bestDayCount > 0 && (
            <View style={wsStyles.bestDay}>
              <Text style={wsStyles.bestDayText}>
                ⭐ Tu mejor día fue el <Text style={{ color: Colors.gold }}>{data.bestDayLabel}</Text> con {data.bestDayCount} prácticas
              </Text>
            </View>
          )}
          <Text style={wsStyles.msg}>{msg}</Text>
          <TouchableOpacity style={wsStyles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={wsStyles.btnText}>Comenzar nueva semana ✦</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const wsStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)',
    padding: Spacing.xl, paddingBottom: 44, gap: Spacing.md,
  },
  eyebrow: { fontSize: 12, color: Colors.gold, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  weekLabel: { fontSize: 13, color: Colors.textDisabled },
  greeting: { fontSize: 22, color: Colors.textPrimary, fontWeight: '700' },
  pctContainer: { alignItems: 'center', paddingVertical: Spacing.sm },
  pctNumber: { fontSize: 72, fontWeight: '800', lineHeight: 80 },
  pctLabel: { fontSize: 13, color: Colors.textSecondary },
  statsGrid: { flexDirection: 'row', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, gap: 4 },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statValue: { fontSize: 20, color: Colors.textPrimary, fontWeight: '700' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  bestDay: { backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(201,168,76,0.20)' },
  bestDayText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  msg: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },
  btn: { backgroundColor: Colors.gold, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.xs },
  btnText: { fontSize: 15, color: Colors.background, fontWeight: '700' },
})

function WelcomeDayOneModal({
  affirmation,
  ritualTitle,
  ritualDescription,
  onComplete,
}: {
  affirmation: string
  ritualTitle: string
  ritualDescription: string
  onComplete: (affDone: boolean, ritDone: boolean) => void
}) {
  const [step, setStep] = useState(0)
  const [affDone, setAffDone] = useState(false)
  const [ritDone, setRitDone] = useState(false)
  const [celebrated, setCelebrated] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start()
  }, [step])

  function next() {
    fadeAnim.setValue(0)
    slideAnim.setValue(40)
    setStep(s => s + 1)
  }

  const SLIDES = [
    {
      emoji: '🌅',
      title: 'Tu día tiene 3 momentos',
      body: 'Mañana, tarde y noche — cada uno con su práctica. No necesitas hacerlo todo a la vez. El protocolo se adapta a tu ritmo.',
      rows: [
        { icon: '☀️', label: 'Mañana', desc: 'Activa tu energía del día' },
        { icon: '🌤️', label: 'Tarde', desc: 'Mantén el impulso' },
        { icon: '🌙', label: 'Noche', desc: 'Cierra con intención' },
      ],
    },
    {
      emoji: '🎯',
      title: 'Cada día, una misión',
      body: 'Tu Objetivo del día es específico para donde estás en tu plan. Escribe cómo lo harás — ese acto de declarar activa la manifestación.',
      rows: null,
    },
    {
      emoji: '✦',
      title: 'Cada práctica suma',
      body: 'No hay días perfectos ni días perdidos. Cada acción que completas eleva tu vibración y construye el campo de atracción de tu plan de 30 días.',
      rows: null,
    },
  ]

  // Step 3 — práctica
  if (step === 3) {
    const bothDone = affDone && ritDone
    return (
      <Modal visible transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[w1Styles.overlay, { opacity: fadeAnim }]}>
          <Animated.View style={[w1Styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            {!celebrated ? (
              <>
                <Text style={w1Styles.practiceEyebrow}>🌟 Tu primera práctica</Text>
                <Text style={w1Styles.practiceTitle}>Hagámoslo ahora</Text>
                <Text style={w1Styles.practiceDesc}>Completa estos dos pasos antes de entrar a tu plan.</Text>

                <TouchableOpacity
                  style={[w1Styles.practiceItem, affDone && w1Styles.practiceItemDone]}
                  onPress={() => setAffDone(true)}
                  activeOpacity={0.85}
                >
                  <View style={w1Styles.practiceItemLeft}>
                    <Text style={w1Styles.practiceItemEmoji}>💬</Text>
                    <View style={w1Styles.practiceItemText}>
                      <Text style={w1Styles.practiceItemLabel}>Afirmación del día</Text>
                      <Text style={w1Styles.practiceItemValue} numberOfLines={2}>"{affirmation}"</Text>
                    </View>
                  </View>
                  <Text style={[w1Styles.practiceCheck, affDone && w1Styles.practiceCheckDone]}>
                    {affDone ? '✦' : '○'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[w1Styles.practiceItem, ritDone && w1Styles.practiceItemDone]}
                  onPress={() => setRitDone(true)}
                  activeOpacity={0.85}
                >
                  <View style={w1Styles.practiceItemLeft}>
                    <Text style={w1Styles.practiceItemEmoji}>🔮</Text>
                    <View style={w1Styles.practiceItemText}>
                      <Text style={w1Styles.practiceItemLabel}>Ritual del día</Text>
                      <Text style={w1Styles.practiceItemValue} numberOfLines={2}>{ritualTitle}</Text>
                    </View>
                  </View>
                  <Text style={[w1Styles.practiceCheck, ritDone && w1Styles.practiceCheckDone]}>
                    {ritDone ? '✦' : '○'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[w1Styles.ctaBtn, !bothDone && w1Styles.ctaBtnDisabled]}
                  onPress={() => { if (bothDone) setCelebrated(true) }}
                  activeOpacity={bothDone ? 0.85 : 1}
                >
                  <Text style={w1Styles.ctaBtnText}>
                    {bothDone ? '¡Listo! Ver mi plan ✦' : 'Toca cada práctica para completarla'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={w1Styles.celebBox}>
                <Text style={w1Styles.celebEmoji}>🌕</Text>
                <Text style={w1Styles.celebTitle}>¡Primera victoria!</Text>
                <Text style={w1Styles.celebBody}>Completaste tus primeras 2 prácticas. Tu vibración ya está activa — ahora ve por el resto del día.</Text>
                <TouchableOpacity style={w1Styles.ctaBtn} onPress={() => onComplete(affDone, ritDone)}>
                  <Text style={w1Styles.ctaBtnText}>Entrar a mi plan ✦</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    )
  }

  const slide = SLIDES[step]
  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[w1Styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[w1Styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={w1Styles.dots}>
            {[0,1,2,3].map(i => (
              <View key={i} style={[w1Styles.dot, step === i && w1Styles.dotActive]} />
            ))}
          </View>
          <Text style={w1Styles.slideEmoji}>{slide.emoji}</Text>
          <Text style={w1Styles.slideTitle}>{slide.title}</Text>
          <Text style={w1Styles.slideBody}>{slide.body}</Text>
          {slide.rows && (
            <View style={w1Styles.rows}>
              {slide.rows.map(row => (
                <View key={row.label} style={w1Styles.row}>
                  <Text style={w1Styles.rowIcon}>{row.icon}</Text>
                  <View>
                    <Text style={w1Styles.rowLabel}>{row.label}</Text>
                    <Text style={w1Styles.rowDesc}>{row.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={w1Styles.ctaBtn} onPress={next} activeOpacity={0.85}>
            <Text style={w1Styles.ctaBtnText}>
              {step < 2 ? 'Continuar →' : 'Hacer mi primera práctica ✦'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onComplete(false, false)} style={w1Styles.skipBtn}>
            <Text style={w1Styles.skipText}>Saltar</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const w1Styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)',
    padding: Spacing.xl, paddingBottom: 44, gap: Spacing.md,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: Spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: Colors.gold, width: 18 },
  slideEmoji: { fontSize: 44, textAlign: 'center' },
  slideTitle: { fontSize: 22, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  slideBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, textAlign: 'center' },
  rows: { gap: Spacing.sm, marginVertical: Spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.md, padding: Spacing.sm },
  rowIcon: { fontSize: 24, width: 32, textAlign: 'center' },
  rowLabel: { fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  rowDesc: { fontSize: 12, color: Colors.textSecondary },
  ctaBtn: { backgroundColor: Colors.gold, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.xs },
  ctaBtnDisabled: { backgroundColor: 'rgba(201,168,76,0.25)' },
  ctaBtnText: { fontSize: 15, color: Colors.background, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: Spacing.xs },
  skipText: { fontSize: 13, color: Colors.textDisabled },
  // Practice step
  practiceEyebrow: { fontSize: 12, color: Colors.gold, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', textAlign: 'center' },
  practiceTitle: { fontSize: 22, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  practiceDesc: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  practiceItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
    padding: Spacing.md, gap: Spacing.sm,
  },
  practiceItemDone: { borderColor: Colors.gold, backgroundColor: 'rgba(201,168,76,0.08)' },
  practiceItemLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  practiceItemEmoji: { fontSize: 28 },
  practiceItemText: { flex: 1, gap: 2 },
  practiceItemLabel: { fontSize: 13, color: Colors.gold, fontWeight: '700' },
  practiceItemValue: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, fontStyle: 'italic' },
  practiceCheck: { fontSize: 18, color: Colors.textDisabled, fontWeight: '700' },
  practiceCheckDone: { color: Colors.gold },
  // Celebration
  celebBox: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  celebEmoji: { fontSize: 60 },
  celebTitle: { fontSize: 26, color: Colors.gold, fontWeight: '800' },
  celebBody: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
})

function CelebrationOverlay({ streak, firstName, onClose }: { streak: number; firstName: string; onClose: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.75)).current
  const EMOJIS = ['✨', '🌟', '⭐', '🔥', '🌙', '✦', '💫', '🌠', '⭐', '✨', '🌟', '✦']
  const particles = useRef(
    Array.from({ length: 12 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 8, useNativeDriver: true }),
    ]).start()

    particles.forEach((p, i) => {
      const angle = (i / particles.length) * 2 * Math.PI
      const dist = 90 + (i % 3) * 30
      Animated.sequence([
        Animated.delay(i * 40),
        Animated.parallel([
          Animated.timing(p.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(p.x, { toValue: Math.cos(angle) * dist, duration: 700, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: Math.sin(angle) * dist - 20, duration: 700, useNativeDriver: true }),
        ]),
        Animated.timing(p.opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start()
    })

    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [])

  const streakMsg = streak >= 33 ? `🔥 ${streak} días de racha. Imparable.`
    : streak >= 21 ? `🔥 ${streak} días. Hábito grabado en ti.`
    : streak >= 7  ? `🔥 ${streak} días seguidos. ¡Increíble!`
    : streak > 1   ? `🔥 ${streak} días en racha. Sigue.`
    : '¡Primer protocolo completo!'

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <TouchableOpacity style={celebStyles.overlay} onPress={onClose} activeOpacity={1}>
        <Animated.View style={[celebStyles.bg, { opacity: fadeAnim }]} />
        <View style={celebStyles.center} pointerEvents="none">
          {particles.map((p, i) => (
            <Animated.Text
              key={i}
              style={[celebStyles.particle, { opacity: p.opacity, transform: [{ translateX: p.x }, { translateY: p.y }] }]}
            >
              {EMOJIS[i]}
            </Animated.Text>
          ))}
          <Animated.View style={[celebStyles.card, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={celebStyles.moon}>🌕</Text>
            <Text style={celebStyles.title}>¡Día Completado!</Text>
            <Text style={celebStyles.name}>{firstName}</Text>
            <Text style={celebStyles.subtitle}>Las 9 prácticas de hoy — selladas.</Text>
            <View style={celebStyles.divider} />
            <Text style={celebStyles.streakMsg}>{streakMsg}</Text>
            <Text style={celebStyles.hint}>La manifestación honra a quien actúa.</Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

export function DashboardScreen() {
  const { profile, signOut, refreshProfile } = useAuth()
  const { playing, play } = useFrequencyPlayer()
  const { reportError: reportDashboardError } = useErrorReporter('dashboard')
  const [energyLevel, setEnergyLevel] = useState<number | null>(null)
  const [objectiveDone, setObjectiveDone] = useState(false)
  const [objectiveNote, setObjectiveNote] = useState('')
  const [savedNote, setSavedNote] = useState('')
  const [editingNote, setEditingNote] = useState(false)
  const [morningDone, setMorningDone] = useState(false)
  const [morningNote, setMorningNote] = useState('')
  const [savedMorningNote, setSavedMorningNote] = useState('')
  const [editingMorningNote, setEditingMorningNote] = useState(false)
  const [afternoonDone, setAfternoonDone] = useState(false)
  const [afternoonNote, setAfternoonNote] = useState('')
  const [savedAfternoonNote, setSavedAfternoonNote] = useState('')
  const [editingAfternoonNote, setEditingAfternoonNote] = useState(false)
  const [nightDone, setNightDone] = useState(false)
  const [nightNote, setNightNote] = useState('')
  const [savedNightNote, setSavedNightNote] = useState('')
  const [editingNightNote, setEditingNightNote] = useState(false)
  const [ritualDone, setRitualDone] = useState(false)
  const [affirmationDone, setAffirmationDone] = useState(false)
  const [colorDone, setColorDone] = useState(false)
  const [foodsDone, setFoodsDone] = useState(false)
  const [biohackDone, setBiohackDone] = useState(false)
  const [allLogs, setAllLogs] = useState<DailyLog[]>([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [viewingHistory, setViewingHistory] = useState(false)
  const [viewingNotifications, setViewingNotifications] = useState(false)
  const [viewingAdmin, setViewingAdmin] = useState(false)
  const [viewingJournal, setViewingJournal] = useState(false)
  const [viewingVisionBoard, setViewingVisionBoard] = useState(false)
  const [viewingBadges, setViewingBadges] = useState(false)
  const [viewingFrequencies, setViewingFrequencies] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const prevTodayCount = useRef(0)
  const celebratedToday = useRef(false)
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryData | null>(null)
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    if (!profile?.plan_start_date) return false
    const start = new Date(profile.plan_start_date + 'T00:00:00')
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return start.getTime() === today.getTime() && !profile.goal_details?.welcome_seen
  })
  const [legalModal, setLegalModal] = useState<'privacy' | 'terms' | null>(null)
  const [dashTab, setDashTab] = useState<'manana' | 'tarde' | 'noche'>('manana')
  const [bannerDismissedAt, setBannerDismissedAt] = useState<number | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showFreqOverlay, setShowFreqOverlay] = useState(false)
  const [showAffirmOverlay, setShowAffirmOverlay] = useState(false)
  const [showTransformCard, setShowTransformCard] = useState(false)

  // Entrance animations — header, affirmation, streak
  const anim0  = useRef(new Animated.Value(0)).current
  const slide0 = useRef(new Animated.Value(20)).current
  const anim1  = useRef(new Animated.Value(0)).current
  const slide1 = useRef(new Animated.Value(20)).current
  const anim2  = useRef(new Animated.Value(0)).current
  const slide2 = useRef(new Animated.Value(20)).current


  // todayStr estable: se calcula una vez al montar el componente
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])
  const today    = useMemo(() => new Date(todayStr + 'T12:00:00'), [todayStr])

  // ── Carga de datos del día ──────────────────────────────────────────────────
  const loadTodayData = useCallback(async () => {
    if (!profile) return

    // SELECT * avoids failures on any missing column — returns only what actually exists in DB
    const { data: rows, error } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', profile.id)
      .eq('date', todayStr)
      .order('id', { ascending: false })
      .limit(1)

    if (error) { setSyncError(`Error al cargar: ${error.message}`); return }

    const data = rows?.[0] ?? null
    if (!data) return

    if (data.energy_level) setEnergyLevel(data.energy_level)
    if (data.objective_note)  { setSavedNote(data.objective_note); setObjectiveNote(data.objective_note) }
    if (data.morning_note)    { setSavedMorningNote(data.morning_note); setMorningNote(data.morning_note) }
    if (data.afternoon_note)  { setSavedAfternoonNote(data.afternoon_note); setAfternoonNote(data.afternoon_note) }
    if (data.night_note)      { setSavedNightNote(data.night_note); setNightNote(data.night_note) }

    const hc: string[] = data.habits_completed || []
    if (data.daily_objective_done || hc.includes('daily_objective_done')) setObjectiveDone(true)
    if (data.morning_done         || hc.includes('morning_done'))         setMorningDone(true)
    if (data.afternoon_done       || hc.includes('afternoon_done'))       setAfternoonDone(true)
    if (data.night_done           || hc.includes('night_done'))           setNightDone(true)
    if (data.ritual_done      || hc.includes('ritual_done'))      setRitualDone(true)
    if (data.affirmation_done || hc.includes('affirmation_done')) setAffirmationDone(true)
    if (data.color_done       || hc.includes('color_done'))       setColorDone(true)
    if (data.foods_done       || hc.includes('foods_done'))       setFoodsDone(true)
    if (data.biohack_done     || hc.includes('biohack_done'))     setBiohackDone(true)
  }, [profile, todayStr])

  // Carga inicial
  useEffect(() => { loadTodayData() }, [loadTodayData])

  // Refresco al volver a primer plano (evita que los datos queden desincronizados)
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') loadTodayData()
    })
    return () => sub.remove()
  }, [loadTodayData])

  // Carga del historial completo para gráficas y patrón semanal
  useEffect(() => {
    if (!profile) return
    supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', profile.id)
      .gte('date', profile.created_at.split('T')[0])
      .order('date', { ascending: true })
      .then(({ data }) => {
        const logs = (data as DailyLog[]) || []
        setAllLogs(logs)
        scheduleWeeklyPatternNotification(logs).catch(() => {/* silencioso en web */})

        // Mostrar resumen semanal la primera vez que se abre la app esta semana
        const mondayKey = getMondayKey()
        getStoredItem(`weekly_summary_${mondayKey}`).then(shown => {
          if (shown) return
          // Calcular streak provisional con los logs cargados
          const logDates = new Set(logs.map((l: DailyLog) => l.date))
          const todayD = new Date(); todayD.setHours(0,0,0,0)
          let s = 0, cur = new Date(todayD)
          if (!logDates.has(todayD.toISOString().split('T')[0])) cur.setDate(cur.getDate() - 1)
          while (logDates.has(cur.toISOString().split('T')[0])) { s++; cur.setDate(cur.getDate() - 1) }
          const summary = buildWeeklySummary(logs, s)
          if (!summary) return
          setStoredItem(`weekly_summary_${mondayKey}`, '1')
          setWeeklySummary(summary)
        })
      })
  }, [profile])


  // Schedule notifications and register push token
  useEffect(() => {
    if (!profile) return
    scheduleAbundanciaNotifications({
      full_name: profile.full_name,
      manifestation_area: profile.manifestation_area,
      plan_start_date: profile.plan_start_date ?? null,
      zodiac_sign: profile.zodiac_sign,
    })
    if (Platform.OS !== 'web') {
      Notifications.getExpoPushTokenAsync({ projectId: 'cb4aef8a-1d66-4119-a02d-7e9cfef3c5a3' })
        .then(({ data: token }) => {
          supabase.from('profiles').update({ push_token: token }).eq('id', profile.id)
        })
        .catch(() => {})
    }
  }, [profile?.id])

  // Revisa notificaciones del admin al abrir la app
  useEffect(() => {
    if (!profile) return
    async function checkAdminNotifications() {
      const [notifsRes, readsRes] = await Promise.all([
        supabase
          .from('admin_notifications')
          .select('id, title, body')
          .or(`target_user_id.eq.${profile!.id},target_user_id.is.null`)
          .order('created_at', { ascending: true }),
        supabase
          .from('notification_reads')
          .select('notification_id')
          .eq('user_id', profile!.id),
      ])
      const notifs = notifsRes.data || []
      const readIds = new Set((readsRes.data || []).map((r: any) => r.notification_id))
      const unread = notifs.filter((n: any) => !readIds.has(n.id))
      if (unread.length === 0) return
      setUnreadCount(unread.length)
      await supabase.from('notification_reads').insert(
        unread.map((n: any) => ({ notification_id: n.id, user_id: profile!.id }))
      )
      const first = unread[0]
      const extra = unread.length > 1 ? `\n\n(${unread.length - 1} mensaje${unread.length > 2 ? 's' : ''} más)` : ''
      Alert.alert(first.title, first.body + extra, [{ text: 'OK', onPress: () => setUnreadCount(0) }])
    }
    checkAdminNotifications()
  }, [profile?.id])

  // Carga el timestamp de dismissal del banner al montar
  useEffect(() => {
    getStoredItem('pendingBannerDismissedAt').then(val => {
      if (val) setBannerDismissedAt(Number(val))
    })
  }, [])

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(anim0,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slide0, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(anim1,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slide1, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(anim2,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slide2, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      ]),
    ]).start()
  }, [])

  // Dispara celebración cuando se completan las 9 tareas
  useEffect(() => {
    const TOTAL = 9
    const current = [objectiveDone, morningDone, afternoonDone, nightDone, ritualDone, affirmationDone, colorDone, foodsDone, biohackDone].filter(Boolean).length
    if (current === TOTAL && prevTodayCount.current < TOTAL && !celebratedToday.current) {
      celebratedToday.current = true
      setShowCelebration(true)
    }
    prevTodayCount.current = current
  }, [objectiveDone, morningDone, afternoonDone, nightDone, ritualDone, affirmationDone, colorDone, foodsDone, biohackDone])

  async function sendFeedback() {
    if (!feedbackText.trim()) return
    setFeedbackSending(true)
    const { error } = await supabase.from('feedback').insert({
      user_id: profile!.id,
      message: feedbackText.trim(),
    })
    setFeedbackSending(false)
    if (error) {
      Alert.alert('Error', 'No se pudo enviar. Intenta de nuevo.')
    } else {
      setFeedbackText('')
      setFeedbackOpen(false)
      Alert.alert('¡Gracias!', 'Tu sugerencia fue enviada. La leemos con atención.')
    }
  }

  if (!profile) return null

  if (viewingHistory) {
    return <HistoryScreen onBack={() => setViewingHistory(false)} />
  }

  if (viewingNotifications) {
    return <NotificationsScreen onBack={() => setViewingNotifications(false)} />
  }

  if (viewingAdmin && profile.is_admin) {
    return (
      <AdminScreen
        onBack={() => setViewingAdmin(false)}
        onPreviewWeeklySummary={() => {
          setViewingAdmin(false)
          const logDates = new Set(allLogs.map(l => l.date))
          const todayD = new Date(); todayD.setHours(0, 0, 0, 0)
          let s = 0; const cur = new Date(todayD)
          if (!logDates.has(todayD.toISOString().split('T')[0])) cur.setDate(cur.getDate() - 1)
          while (logDates.has(cur.toISOString().split('T')[0])) { s++; cur.setDate(cur.getDate() - 1) }
          const summary = buildWeeklySummary(allLogs, s) ?? {
            weekLabel: 'Demo — sin datos la semana pasada',
            totalTasks: 23, daysActive: 5, pct: 37,
            bestDayLabel: 'Miércoles', bestDayCount: 6, streak: s,
          }
          setWeeklySummary(summary)
        }}
      />
    )
  }

  if (viewingJournal) {
    return <JournalScreen onBack={() => setViewingJournal(false)} />
  }

  if (viewingVisionBoard) {
    return <VisionBoardScreen onBack={() => setViewingVisionBoard(false)} />
  }

  if (viewingBadges) {
    return <BadgesScreen onBack={() => setViewingBadges(false)} />
  }

  if (viewingFrequencies) {
    const todayHz = generateDailyProtocol(
      getLunarPhase(new Date()),
      profile.zodiac_sign as ZodiacSign,
      profile.numerology_number,
      profile.base_frequency,
      profile.manifestation_area
    ).frequency.hz
    return <FrequenciesScreen onBack={() => setViewingFrequencies(false)} todayHz={todayHz} />
  }

  if (editingProfile) {
    return (
      <EditProfileScreen
        profile={profile}
        onSave={() => { refreshProfile(); setEditingProfile(false) }}
        onBack={() => setEditingProfile(false)}
      />
    )
  }

  // ── Chart computation ────────────────────────────────────────────────────
  const activationDate = profile.created_at
  const logMap: Record<string, DailyLog> = Object.fromEntries(allLogs.map(l => [l.date, l]))

  function countTasksFromLog(l: DailyLog): number {
    const hc: string[] = (l as any).habits_completed || []
    return [
      l.daily_objective_done || hc.includes('daily_objective_done'),
      l.morning_done         || hc.includes('morning_done'),
      l.afternoon_done       || hc.includes('afternoon_done'),
      l.night_done           || hc.includes('night_done'),
      (l as any).ritual_done      || hc.includes('ritual_done'),
      (l as any).affirmation_done || hc.includes('affirmation_done'),
      (l as any).color_done       || hc.includes('color_done'),
      (l as any).foods_done       || hc.includes('foods_done'),
      (l as any).biohack_done     || hc.includes('biohack_done'),
    ].filter(Boolean).length
  }

  function getPlanDaysAsc(): string[] {
    const start = new Date(activationDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(); end.setHours(0, 0, 0, 0)
    const days: string[] = []
    const d = new Date(start)
    while (d <= end) { days.push(d.toISOString().split('T')[0]); d.setDate(d.getDate() + 1) }
    return days
  }

  const chartData = getPlanDaysAsc().map((dateStr, i) => {
    const isToday = dateStr === todayStr
    const count = isToday
      ? [objectiveDone, morningDone, afternoonDone, nightDone, ritualDone, affirmationDone, colorDone, foodsDone, biohackDone].filter(Boolean).length
      : (() => { const l = logMap[dateStr]; return l ? countTasksFromLog(l) : 0 })()
    return { dateStr, count, isToday, day: i + 1 }
  })

  const overallRate = chartData.length > 0
    ? Math.round(chartData.reduce((s, d) => s + d.count, 0) / (chartData.length * 9) * 100) : 0
  const perfectDays = chartData.filter(d => d.count === 9).length
  let streak = 0
  const lastIdx = chartData.length - 1
  const startIdx = (chartData[lastIdx]?.count === 0 && chartData[lastIdx]?.isToday) ? lastIdx - 1 : lastIdx
  for (let i = startIdx; i >= 0; i--) { if (chartData[i].count > 0) streak++; else break }

  const STREAK_MILESTONES = [3, 7, 14, 21, 33, 66, 90]
  const nextMilestone = STREAK_MILESTONES.find(m => m > streak) ?? 90
  const prevMilestone = [...STREAK_MILESTONES].reverse().find(m => m <= streak) ?? 0
  const streakProgress = nextMilestone > prevMilestone
    ? (streak - prevMilestone) / (nextMilestone - prevMilestone) : 1
  const streakColor = streak >= 21 ? Colors.gold : streak >= 7 ? '#4CAF82' : Colors.textSecondary
  const streakMessage = streak === 0
    ? 'Comienza hoy — cada gran racha empieza con un paso.'
    : streak < 3  ? 'Buen comienzo. No rompas la cadena.'
    : streak < 7  ? `${streak} días seguidos. Estás construyendo algo real.`
    : streak < 14 ? '¡Primera semana completa! La disciplina ya es tuya.'
    : streak < 21 ? 'Dos semanas de constancia. El hábito se está grabando.'
    : streak < 33 ? 'Hábito formado. Ya no es esfuerzo — es quien eres.'
    : streak < 66 ? 'Un mes de poder. Pocos llegan hasta aquí.'
    : '¡Racha legendaria! Eres constancia en estado puro.'

  const TOTAL_TASKS = 9
  const todayCount = [objectiveDone, morningDone, afternoonDone, nightDone, ritualDone, affirmationDone, colorDone, foodsDone, biohackDone].filter(Boolean).length

  // Weekly ring data (last 7 days, oldest → newest)
  const DAYS_ES = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']
  const weeklyEnergyDays: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const isToday = dateStr === todayStr
    return {
      label: DAYS_ES[d.getDay()],
      date: d.getDate(),
      isToday,
      level: isToday ? energyLevel : (logMap[dateStr]?.energy_level ?? null),
    }
  })

  const weeklyProgressDays: ProgressDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const isToday = dateStr === todayStr
    const log = logMap[dateStr]
    const count = isToday
      ? todayCount
      : (log ? countTasksFromLog(log) : null)
    return { label: DAYS_ES[d.getDay()], date: d.getDate(), isToday, count }
  })

  // ── Patrones débiles de la semana (últimos 7 días sin contar hoy) ──────────
  const weakHabits: Array<HabitDetail & { completions: number }> = (() => {
    const last7Dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (i + 1))
      return d.toISOString().split('T')[0]
    })
    const weekLogs = allLogs.filter(l => last7Dates.includes(l.date))
    if (weekLogs.length < 3) return []   // datos insuficientes

    return Object.entries(HABIT_DETAILS)
      .map(([field, detail]) => ({
        ...detail,
        completions: weekLogs.filter(l => {
          const hc: string[] = (l as any).habits_completed || []
          return !!(l as any)[field] || hc.includes(field)
        }).length,
      }))
      .filter(h => h.completions < 4)
      .sort((a, b) => a.completions - b.completions)
  })()
  // ─────────────────────────────────────────────────────────────────────────

  const lunarPhase: LunarPhase = getLunarPhase(today)
  const lunarContent = LUNAR_PHASE_CONTENT[lunarPhase]
  const nextKeyPhase = lunarContent.isKeyPhase ? null : getNextKeyPhase(today)
  const todayPortal = getPortalForDate(today)
  const nextPortal = todayPortal ? null : getNextPortal(today)
  const protocol = generateDailyProtocol(
    lunarPhase,
    profile.zodiac_sign as ZodiacSign,
    profile.numerology_number,
    profile.base_frequency,
    profile.manifestation_area
  )

  const dateLabel = today.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  // ── Etiqueta del objetivo principal del usuario ───────────────────────────
  const goalLabel = (() => {
    const g = profile.goal_details as any || {}
    const area = profile.manifestation_area
    if (area === 'dinero'   && g.monthly_goal)      return `para ganar ${g.monthly_goal}`
    if (area === 'amor') {
      const map: Record<string, string> = { nueva: 'para encontrar pareja', mejorar: 'para mejorar tu relación', propio: 'para fortalecer tu amor propio', reconectar: 'para reconectar con alguien' }
      return map[g.relationship_type] ?? null
    }
    if (area === 'salud') {
      const map: Record<string, string> = { energia: 'para ganar más energía', peso: 'para transformar tu cuerpo', mental: 'para sanar tu salud mental', especifica: 'para sanar tu condición' }
      return map[g.health_focus] ?? null
    }
    if (area === 'proposito' && g.desired_impact)   return `para ${g.desired_impact}`
    if (area === 'felicidad' && g.happiness_change) return `para ${g.happiness_change}`
    return null
  })()

  // ── Plan de manifestación ─────────────────────────────────────────────────
  const planDuration   = profile.plan_duration ?? 30
  const planStartDate  = profile.plan_start_date ?? profile.created_at.split('T')[0]
  const planStart      = new Date(planStartDate + 'T12:00:00')
  const planDay        = Math.floor((today.getTime() - planStart.getTime()) / 86400000) + 1
  const planDaysLeft   = planDuration - planDay + 1
  const planComplete   = planDay > planDuration
  const phaseInfo      = getPhaseInfo(Math.min(planDay, planDuration), planDuration)
  const objective      = generateDailyObjective(
    profile.manifestation_area,
    profile.goal_details || {},
    planDay,
    planDuration
  )

  // ── Pantalla de cierre de ciclo ───────────────────────────────────────────
  async function handleRenewPlan(days: number) {
    const today2 = new Date().toISOString().split('T')[0]
    await supabase.from('profiles').update({ plan_duration: days, plan_start_date: today2 }).eq('id', profile!.id)
    refreshProfile()
  }

  if (planComplete) {
    const totalTasks    = allLogs.length * 9
    const doneTasks     = allLogs.reduce((s, l) => s + countTasksFromLog(l), 0)
    const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
    const area          = profile.manifestation_area

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.cycleEmoji}>🌕</Text>
          <Text style={styles.cycleTitle}>¡Ciclo completado!</Text>
          <Text style={styles.cycleSubtitle}>
            Completaste tu plan de {planDuration} días de manifestación.{'\n'}
            La constancia que demostraste ya está reescribiendo tu realidad.
          </Text>

          <Card goldBorder style={styles.cycleSummaryCard}>
            <Text style={styles.cycleSummaryTitle}>Tu resumen del ciclo</Text>
            <View style={styles.cycleSummaryRow}>
              <View style={styles.cycleStat}>
                <Text style={styles.cycleStatValue}>{planDuration}</Text>
                <Text style={styles.cycleStatLabel}>días de plan</Text>
              </View>
              <View style={styles.cycleStat}>
                <Text style={styles.cycleStatValue}>{allLogs.length}</Text>
                <Text style={styles.cycleStatLabel}>días activos</Text>
              </View>
              <View style={styles.cycleStat}>
                <Text style={styles.cycleStatValue}>{completionPct}%</Text>
                <Text style={styles.cycleStatLabel}>completado</Text>
              </View>
            </View>
          </Card>

          <Text style={styles.cycleRenewTitle}>Inicia un nuevo ciclo</Text>
          <Text style={styles.cycleRenewSub}>Elige la duración de tu próximo compromiso</Text>

          <View style={styles.cycleDurationGrid}>
            {[30, 45, 60, 90].map(d => (
              <TouchableOpacity key={d} style={styles.cycleDurationBtn} onPress={() => handleRenewPlan(d)}>
                <Text style={styles.cycleDurationDays}>{d} días</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    )
  }

  async function handleNoteSave() {
    if (!objectiveNote.trim()) return
    setSavedNote(objectiveNote.trim())
    setEditingNote(false)
    await upsertField({ objective_note: objectiveNote.trim() })
  }

  async function handleObjectiveDone() {
    setObjectiveDone(true)
    if (profile) playCelebrationSound(profile.manifestation_area)
    await upsertField({ daily_objective_done: true })
  }

  type DoneField = 'daily_objective_done'|'morning_done'|'afternoon_done'|'night_done'|'ritual_done'|'affirmation_done'|'color_done'|'foods_done'|'biohack_done'

  const fieldSetters: Record<DoneField, (v: boolean) => void> = {
    daily_objective_done: setObjectiveDone,
    morning_done:         setMorningDone,
    afternoon_done:       setAfternoonDone,
    night_done:           setNightDone,
    ritual_done:          setRitualDone,
    affirmation_done:     setAffirmationDone,
    color_done:           setColorDone,
    foods_done:           setFoodsDone,
    biohack_done:         setBiohackDone,
  }

  const ALL_COLUMNS = new Set([
    'energy_level', 'objective_note', 'morning_note', 'afternoon_note', 'night_note',
    'daily_objective_done', 'morning_done', 'afternoon_done', 'night_done',
    'ritual_done', 'affirmation_done', 'color_done', 'foods_done', 'biohack_done',
  ])
  // Campos de tarea: solo pueden ir de false → true, nunca al revés
  const TASK_FIELDS = new Set([
    'daily_objective_done', 'morning_done', 'afternoon_done', 'night_done',
    'ritual_done', 'affirmation_done', 'color_done', 'foods_done', 'biohack_done',
  ])

  async function upsertField(payload: Record<string, any>) {
    const fullPayload = Object.fromEntries(
      Object.entries(payload)
        .filter(([k]) => ALL_COLUMNS.has(k))
        // Nunca sobrescribir un campo de tarea con false — los registros son aditivos
        .filter(([k, v]) => !(TASK_FIELDS.has(k) && v === false))
    )
    const doneFields = Object.entries(payload)
      .filter(([k, v]) => v === true && TASK_FIELDS.has(k))
      .map(([k]) => k)

    const { data: rows, error: readErr } = await supabase
      .from('daily_logs')
      .select('id, habits_completed')
      .eq('user_id', profile!.id)
      .eq('date', todayStr)
      .limit(1)

    if (readErr) {
      setSyncError(`Error al guardar: ${readErr.message}`)
      reportDashboardError(readErr, { action: 'read_daily_log', payload: Object.keys(payload) })
      return
    }

    if (rows && rows.length > 0) {
      const existing: string[] = rows[0].habits_completed || []
      const merged = doneFields.length > 0
        ? Array.from(new Set([...existing, ...doneFields]))
        : existing
      const { error: updateErr } = await supabase
        .from('daily_logs')
        .update({ habits_completed: merged, ...fullPayload })
        .eq('user_id', profile!.id)
        .eq('date', todayStr)
      if (updateErr) {
        setSyncError(`Error al guardar: ${updateErr.message}`)
        reportDashboardError(updateErr, { action: 'update_daily_log', payload: Object.keys(payload) })
        return
      }
    } else {
      const { error: insertErr } = await supabase
        .from('daily_logs')
        .insert({ user_id: profile!.id, date: todayStr, habits_completed: doneFields, ...fullPayload })
      if (insertErr) {
        setSyncError(`Error al crear registro: ${insertErr.message}`)
        reportDashboardError(insertErr, { action: 'insert_daily_log', payload: Object.keys(payload) })
        return
      }
    }

    setSyncError(null)
  }

  async function markSectionDone(field: DoneField) {
    fieldSetters[field](true)
    if (profile) playCelebrationSound(profile.manifestation_area)
    await upsertField({ [field]: true })
  }

  async function handleProtocolDone(slot: 'morning' | 'afternoon' | 'night') {
    const field = `${slot}_done` as DoneField
    fieldSetters[field](true)
    if (profile) playCelebrationSound(profile.manifestation_area)
    await upsertField({ [field]: true })
  }

  async function handleEnergySelect(level: number) {
    setEnergyLevel(level)
    await upsertField({ energy_level: level })
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#16102A', '#0e0b1e', Colors.background]}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 0.55 }}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />
      {/* Noise texture — web-only grain para acabado premium */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, styles.noiseBg]}
      />
      {/* Glow orb morado — esquina superior derecha */}
      <View pointerEvents="none" style={styles.orbPurple} />
      {/* Glow orb dorado — esquina inferior izquierda */}
      <View pointerEvents="none" style={styles.orbGold} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 1 — Header */}
        <Animated.View style={[styles.header, { opacity: anim0, transform: [{ translateY: slide0 }] }]}>
          {/* Nav compacta */}
          <View style={styles.navRow}>
            <View style={styles.navLeft}>
              <TouchableOpacity onPress={() => { setViewingNotifications(true); setUnreadCount(0) }}>
                <Text style={[styles.navLink, unreadCount > 0 && styles.navLinkActive]}>
                  🔔{unreadCount > 0 ? ` ${unreadCount}` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewingHistory(true)}>
                <Text style={styles.navLink}>📅</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewingFrequencies(true)}>
                <Text style={styles.navLink}>🎵</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setViewingBadges(true)}>
                <Text style={styles.navLink}>🏅</Text>
              </TouchableOpacity>
              {profile.is_admin && (
                <TouchableOpacity onPress={() => setViewingAdmin(true)}>
                  <Text style={styles.navLink}>⚙</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.navRight}>
              <TouchableOpacity onPress={() => setEditingProfile(true)}>
                <Text style={styles.navLinkText}>Perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={signOut}>
                <Text style={styles.navLinkDim}>Salir</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Saludo */}
          <Text style={styles.greeting}>Hola, {profile.full_name.split(' ')[0]}</Text>
          <Text style={styles.date}>{dateLabel} · Día {Math.min(planDay, planDuration)} de {planDuration}</Text>
          <View style={styles.lunarBadge}>
            <Text style={styles.lunarBadgeText}>🌙 {getLunarPhaseLabel(lunarPhase)} · {lunarContent.energy.split(' · ')[0]}</Text>
          </View>

          {/* Cards de acceso rápido: Diario + Visión */}
          <View style={styles.featureGrid}>
            <TouchableOpacity style={styles.featureCard} onPress={() => setViewingJournal(true)} activeOpacity={0.8}>
              <View style={[styles.featureIconWrap, styles.featureIconGold]}>
                <Text style={styles.featureIcon}>📖</Text>
              </View>
              <Text style={styles.featureTitle}>Diario</Text>
              <Text style={styles.featureSub}>Intención · Gratitud</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.featureCard} onPress={() => setViewingVisionBoard(true)} activeOpacity={0.8}>
              <View style={[styles.featureIconWrap, styles.featureIconPurple]}>
                <Text style={styles.featureIcon}>🖼️</Text>
              </View>
              <Text style={styles.featureTitle}>Visión</Text>
              <Text style={styles.featureSub}>Imágenes · Activación</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Banner de error de sincronización */}
        {syncError && (
          <TouchableOpacity style={styles.syncErrorBanner} onPress={() => setSyncError(null)}>
            <Text style={styles.syncErrorText}>⚠️ {syncError}</Text>
            <Text style={styles.syncErrorDismiss}>Toca para cerrar</Text>
          </TouchableOpacity>
        )}

        {/* Banner disciplina pendiente — solo desde el día 2, respeta snooze */}
        {todayCount < TOTAL_TASKS && planDay > 1 && !isBannerSnoozed(bannerDismissedAt) && (
          <View style={styles.pendingBanner}>
            <View style={styles.pendingBannerLeft}>
              <Text style={styles.pendingBannerTitle}>Disciplina Pendiente</Text>
              <Text style={styles.pendingBannerBody}>La ruta de hoy aún espera tu sello.</Text>
              <Text style={styles.pendingBannerMotto}>La constancia es poder.</Text>
            </View>
            <TouchableOpacity
              style={styles.pendingBannerBtn}
              onPress={() => {
                const now = Date.now()
                setBannerDismissedAt(now)
                setStoredItem('pendingBannerDismissedAt', String(now))
                setViewingNotifications(true)
              }}
            >
              <Text style={styles.pendingBannerBtnText}>Ver alerta{'\n'}ahora</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Briefing: por qué tu protocolo es único hoy ── */}
        {(() => {
          const ZODIAC_LABELS: Record<string, { emoji: string; label: string }> = {
            aries:       { emoji: '♈', label: 'Aries' },
            tauro:       { emoji: '♉', label: 'Tauro' },
            geminis:     { emoji: '♊', label: 'Géminis' },
            cancer:      { emoji: '♋', label: 'Cáncer' },
            leo:         { emoji: '♌', label: 'Leo' },
            virgo:       { emoji: '♍', label: 'Virgo' },
            libra:       { emoji: '♎', label: 'Libra' },
            escorpio:    { emoji: '♏', label: 'Escorpio' },
            sagitario:   { emoji: '♐', label: 'Sagitario' },
            capricornio: { emoji: '♑', label: 'Capricornio' },
            acuario:     { emoji: '♒', label: 'Acuario' },
            piscis:      { emoji: '♓', label: 'Piscis' },
          }
          const AREA_LABELS: Record<string, { emoji: string; label: string }> = {
            dinero:    { emoji: '💰', label: 'Abundancia' },
            amor:      { emoji: '💕', label: 'Amor' },
            salud:     { emoji: '✨', label: 'Salud' },
            proposito: { emoji: '🎯', label: 'Propósito' },
            felicidad: { emoji: '🌟', label: 'Felicidad' },
          }
          const zodiac = ZODIAC_LABELS[profile.zodiac_sign] ?? { emoji: '⭐', label: profile.zodiac_sign }
          const area   = AREA_LABELS[profile.manifestation_area] ?? { emoji: '✦', label: profile.manifestation_area }
          const chips = [
            { emoji: '🔢', label: `Número ${profile.numerology_number}` },
            { emoji: zodiac.emoji, label: zodiac.label },
            { emoji: getLunarPhaseEmoji(lunarPhase), label: getLunarPhaseLabel(lunarPhase) },
            { emoji: area.emoji, label: area.label },
          ]
          return (
            <View style={styles.briefingCard}>
              <Text style={styles.briefingTitle}>Tu protocolo de hoy es único</Text>
              <Text style={styles.briefingSubtitle}>4 sistemas se combinaron para crearlo</Text>
              <View style={styles.briefingChips}>
                {chips.map((c, i) => (
                  <View key={i} style={styles.briefingChip}>
                    <Text style={styles.briefingChipEmoji}>{c.emoji}</Text>
                    <Text style={styles.briefingChipLabel}>{c.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )
        })()}

        {/* ── Tab bar ── */}
        {(() => {
          const manañaPending = (!energyLevel ? 1 : 0) + (!objectiveDone ? 1 : 0) + (!morningDone ? 1 : 0) + (!affirmationDone ? 1 : 0) + (!colorDone ? 1 : 0) + (!foodsDone ? 1 : 0) + (!biohackDone ? 1 : 0)
          const tardePending  = (!afternoonDone ? 1 : 0)
          const nochePending  = (!nightDone ? 1 : 0) + (!ritualDone ? 1 : 0)
          const tabs: { key: 'manana' | 'tarde' | 'noche'; label: string; emoji: string; pending: number }[] = [
            { key: 'manana', label: 'Mañana', emoji: '🌅', pending: manañaPending },
            { key: 'tarde',  label: 'Tarde',  emoji: '☀️', pending: tardePending  },
            { key: 'noche',  label: 'Noche',  emoji: '🌙', pending: nochePending  },
          ]
          return (
            <View style={styles.dayTabBar}>
              {tabs.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.dayTab, dashTab === t.key && styles.dayTabActive]}
                  onPress={() => setDashTab(t.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayTabEmoji}>{t.emoji}</Text>
                  <Text style={[styles.dayTabLabel, dashTab === t.key && styles.dayTabLabelActive]}>{t.label}</Text>
                  {t.pending > 0 && (
                    <View style={styles.dayTabBadge}>
                      <Text style={styles.dayTabBadgeText}>{t.pending}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )
        })()}

        {/* ══════════════ TAB: MAÑANA ══════════════ */}
        {dashTab === 'manana' && (<>

        {/* ⚡ ¿Cómo amaneciste hoy? */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>⚡ ¿Cómo amaneciste hoy?</Text>
          <Text style={styles.sectionSubtitle}>¿Cómo está mi vibración hoy?</Text>
          <View style={styles.energyRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity
                key={n}
                style={[styles.energyDot, energyLevel === n && styles.energyDotActive]}
                onPress={() => handleEnergySelect(n)}
              >
                <Text style={[styles.energyNumber, energyLevel === n && styles.energyNumberActive]}>
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {energyLevel && (
            <Text style={styles.energySaved}>Registrado ✦</Text>
          )}
          <View style={styles.divider} />
          <WeeklyEnergyRing days={weeklyEnergyDays} />
        </Card>

        {/* 7 — Tu objetivo de hoy */}
        <Card goldBorder style={styles.sectionCard}>
          <View style={styles.objectiveHeader}>
            <Text style={styles.sectionLabel}>🎯 Tu objetivo de hoy</Text>
            <View style={styles.phasePill}>
              <Text style={styles.phaseEmoji}>{phaseInfo.emoji}</Text>
              <Text style={styles.phaseLabel}>{phaseInfo.label}</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>¿Cuál es mi misión hoy?</Text>
          {planDay === 1 && !objectiveDone && (
            <View style={styles.firstStepBadge}>
              <Text style={styles.firstStepBadgeText}>⭐ Tu primer paso →</Text>
            </View>
          )}
          <Text style={styles.sectionTitle}>{objective.title}</Text>
          <Text style={styles.sectionBody}>{objective.action}</Text>
          <Text style={styles.objectiveMeasurable}>✓ {objective.measurable}</Text>
          <View style={styles.objectiveFooter}>
            <Text style={styles.objectiveDuration}>⏱ {objective.duration}</Text>
            {!objectiveDone ? (
              <TouchableOpacity
                style={[styles.objectiveBtn, !savedNote && styles.objectiveBtnLocked]}
                onPress={savedNote ? handleObjectiveDone : () => setEditingNote(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.objectiveBtnText, !savedNote && { color: Colors.textSecondary }]}>
                  {savedNote ? 'Marcar como hecho ✦' : '📝 Escribe cómo lo hiciste'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.objectiveDone}>✦ Completado hoy</Text>
            )}
          </View>
          <View style={styles.noteDivider} />
          {!editingNote && !savedNote && (
            <TouchableOpacity style={styles.noteAddBtn} onPress={() => setEditingNote(true)}>
              <Text style={styles.noteAddText}>📝 Agregar anotación para completar</Text>
            </TouchableOpacity>
          )}
          {!editingNote && savedNote ? (
            <View style={styles.noteSaved}>
              <View style={styles.noteSavedHeader}>
                <Text style={styles.noteSavedLabel}>📝 Tu anotación</Text>
                <TouchableOpacity onPress={() => setEditingNote(true)}>
                  <Text style={styles.noteEditLink}>Editar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.noteSavedText}>{savedNote}</Text>
            </View>
          ) : null}
          {editingNote && (
            <View style={styles.noteEditor}>
              <Text style={styles.noteRule}>✦ Mínimo 100 caracteres — describe qué hiciste, cómo te sentiste y qué aprendiste.</Text>
              <TextInput
                style={styles.noteInput}
                value={objectiveNote}
                onChangeText={setObjectiveNote}
                placeholder="Escribe lo que lograste, cómo te sentiste, qué aprendiste..."
                placeholderTextColor={Colors.textDisabled}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.noteCharRow}>
                <Text style={[styles.noteCharCount, objectiveNote.trim().length >= 100 && styles.noteCharCountOk]}>
                  {objectiveNote.trim().length} / 100
                </Text>
                {objectiveNote.trim().length >= 100 && (
                  <Text style={styles.noteCharReady}>✓ Listo para guardar</Text>
                )}
              </View>
              <View style={styles.noteActions}>
                <TouchableOpacity onPress={() => { setEditingNote(false); setObjectiveNote(savedNote) }}>
                  <Text style={styles.noteCancelBtn}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.noteSaveBtn, objectiveNote.trim().length < 100 && styles.noteSaveBtnDisabled]}
                  onPress={handleNoteSave}
                  disabled={objectiveNote.trim().length < 100}
                >
                  <Text style={styles.noteSaveBtnText}>Guardar nota ✦</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        {/* 🌅 Protocolo de mañana */}
        <Card style={morningDone ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.sectionLabel}>🌅 Protocolo de mañana</Text>
            {morningDone
              ? <Text style={styles.doneBadge}>✦ Hecho</Text>
              : <TouchableOpacity style={styles.doneBtn} onPress={() => handleProtocolDone('morning')}>
                  <Text style={styles.doneBtnText}>Marcar hecho ✦</Text>
                </TouchableOpacity>
            }
          </View>
          <Text style={styles.sectionSubtitle}>¿Qué practico esta mañana?</Text>
          <Text style={morningDone ? [styles.protocolAction, styles.protocolActionDone] : styles.protocolAction}>
            {protocol.protocol.morning}
          </Text>
          <View style={styles.noteDivider} />
          {!editingMorningNote && !savedMorningNote && (
            <TouchableOpacity style={styles.noteAddBtn} onPress={() => setEditingMorningNote(true)}>
              <Text style={styles.noteAddText}>📝 Agregar anotación</Text>
            </TouchableOpacity>
          )}
          {!editingMorningNote && savedMorningNote ? (
            <View style={styles.noteSaved}>
              <View style={styles.noteSavedHeader}>
                <Text style={styles.noteSavedLabel}>📝 Tu anotación</Text>
                <TouchableOpacity onPress={() => setEditingMorningNote(true)}>
                  <Text style={styles.noteEditLink}>Editar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.noteSavedText}>{savedMorningNote}</Text>
            </View>
          ) : null}
          {editingMorningNote && (
            <View style={styles.noteEditor}>
              <TextInput
                style={styles.noteInput}
                value={morningNote}
                onChangeText={setMorningNote}
                placeholder="Anota aquí lo que practicaste, cómo te sentiste..."
                placeholderTextColor={Colors.textDisabled}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.noteActions}>
                <TouchableOpacity onPress={() => { setEditingMorningNote(false); setMorningNote(savedMorningNote) }}>
                  <Text style={styles.noteCancelBtn}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.noteSaveBtn}
                  onPress={async () => {
                    const val = morningNote.trim()
                    setSavedMorningNote(val)
                    setEditingMorningNote(false)
                    await upsertField({ morning_note: val })
                  }}
                >
                  <Text style={styles.noteSaveBtnText}>Guardar nota ✦</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        {/* 💬 Afirmación del día */}
        <Animated.View style={{ opacity: anim1, transform: [{ translateY: slide1 }] }}>
        <LinearGradient
          colors={['rgba(167,139,250,0.10)', 'rgba(212,175,85,0.05)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[styles.affirmationCard, affirmationDone && styles.cardDone]}
        >
          <View style={styles.cardTopRow}>
            <Text style={styles.sectionLabel}>💬 Afirmación del día</Text>
            {affirmationDone
              ? <Text style={styles.doneBadge}>✦ Hecho</Text>
              : <TouchableOpacity style={styles.doneBtn} onPress={() => markSectionDone('affirmation_done')}>
                  <Text style={styles.doneBtnText}>Marcar hecho ✦</Text>
                </TouchableOpacity>
            }
          </View>
          <Text style={styles.sectionSubtitle}>¿Qué declaro para mí hoy?</Text>
          <TouchableOpacity activeOpacity={0.75} onPress={() => setShowAffirmOverlay(true)}>
            <Text style={styles.affirmationHero}>"{protocol.affirmation}"</Text>
            <Text style={styles.affirmRevealHint}>✦ Toca para declarar</Text>
          </TouchableOpacity>
          {(() => {
            const info = NUMEROLOGY_INFO[profile.numerology_number]
            if (!info) return null
            return (
              <View style={styles.numBox}>
                <View style={styles.numHeader}>
                  <View style={styles.numBadge}>
                    <Text style={styles.numBadgeNum}>{profile.numerology_number}</Text>
                  </View>
                  <View style={styles.numTitles}>
                    <Text style={styles.numArchetype}>{info.archetype}</Text>
                    <View style={styles.numKeywords}>
                      {info.keywords.map(k => (
                        <View key={k} style={styles.numKeywordPill}>
                          <Text style={styles.numKeywordText}>{k}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
                <Text style={styles.numEnergy}>{info.energy}</Text>
                <Text style={styles.numShadow}>⚠ {info.shadow}</Text>
              </View>
            )
          })()}
        </LinearGradient>
        </Animated.View>

        {/* 👗 Color del día */}
        <Card style={colorDone ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.sectionLabel}>👗 Color del día</Text>
            {colorDone
              ? <Text style={styles.doneBadge}>✦ Hecho</Text>
              : <TouchableOpacity style={styles.doneBtn} onPress={() => markSectionDone('color_done')}>
                  <Text style={styles.doneBtnText}>Marcar hecho ✦</Text>
                </TouchableOpacity>
            }
          </View>
          <Text style={styles.sectionSubtitle}>¿Qué vibración uso hoy?</Text>
          <View style={styles.colorsRow}>
            {protocol.colors.map((c, i) => (
              <View key={i} style={[styles.colorSwatch, { backgroundColor: c.hex }]}>
                <View style={styles.colorSwatchOverlay}>
                  <Text style={styles.colorSwatchName}>{c.name}</Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.sectionBody}>{protocol.color.reason}</Text>
        </Card>

        {/* 🍽️ Alimentos del día */}
        <Card style={foodsDone ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.sectionLabel}>🍽️ Alimentos del día</Text>
            {foodsDone
              ? <Text style={styles.doneBadge}>✦ Hecho</Text>
              : <TouchableOpacity style={styles.doneBtn} onPress={() => markSectionDone('foods_done')}>
                  <Text style={styles.doneBtnText}>Marcar hecho ✦</Text>
                </TouchableOpacity>
            }
          </View>
          <Text style={styles.sectionSubtitle}>¿Qué nutre mi cuerpo hoy?</Text>
          <View style={styles.foodChipsRow}>
            {protocol.foods.map((food, i) => (
              <View key={i} style={styles.foodChip}>
                <Text style={styles.foodChipEmoji}>
                  {['🌿','🌱','✨','🍃'][i % 4]}
                </Text>
                <Text style={styles.foodChipText}>{food}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionBody}>{protocol.foodReason}</Text>
        </Card>

        {/* ⚡ Estrategia Biohack */}
        <Card style={biohackDone ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.sectionLabel}>⚡ Estrategia Biohack</Text>
            {biohackDone
              ? <Text style={styles.doneBadge}>✦ Hecho</Text>
              : <TouchableOpacity style={styles.doneBtn} onPress={() => markSectionDone('biohack_done')}>
                  <Text style={styles.doneBtnText}>Marcar hecho ✦</Text>
                </TouchableOpacity>
            }
          </View>
          <Text style={styles.sectionSubtitle}>¿Cómo optimizo mi rendimiento hoy?</Text>
          <Text style={styles.sectionBody}>{protocol.biohack.activity}</Text>
        </Card>

        {/* 🎵 Frecuencia del día — standalone card */}
        <LinearGradient
          colors={['rgba(167,139,250,0.13)', 'rgba(123,97,220,0.04)']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.freqCard}
        >
          <Text style={styles.freqCardLabel}>Frecuencia del día</Text>
          <Text style={styles.frequencyHz}>{protocol.frequency.hz} Hz</Text>
          <Text style={styles.frequencyName}>{protocol.frequency.name}</Text>
          <View style={styles.freqPlayRow}>
            <TouchableOpacity
              style={[styles.playButton, playing && styles.playButtonActive]}
              onPress={() => play(protocol.frequency.hz)}
            >
              <Text style={styles.playIcon}>{playing ? '■' : '▶'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.freqExpandBtn} onPress={() => setShowFreqOverlay(true)}>
              <Text style={styles.freqExpandText}>Ver visualizador ↗</Text>
            </TouchableOpacity>
          </View>
          {(() => {
            const ctx = FREQUENCY_CONTEXT[protocol.frequency.hz]
            if (!ctx) return null
            return (
              <View style={styles.freqGuide}>
                <View style={styles.freqGuideHeader}>
                  <Text style={styles.freqGuideTitle}>🎧 Cómo usarla hoy</Text>
                  <View style={styles.freqDurationPill}>
                    <Text style={styles.freqDurationText}>⏱ {ctx.duration}</Text>
                  </View>
                </View>
                <View style={styles.freqWhenRow}>
                  <Text style={styles.freqWhenText}>{ctx.when}</Text>
                </View>
                <Text style={styles.freqHowTo}>{ctx.howTo}</Text>
                <View style={styles.freqIntegrationBox}>
                  <Text style={styles.freqIntegrationLabel}>✦ Integración con tu plan</Text>
                  <Text style={styles.freqIntegrationText}>{ctx.integration}</Text>
                </View>
              </View>
            )
          })()}
        </LinearGradient>

        </>)}
        {/* ══════════════ FIN TAB MAÑANA ══════════════ */}

        {/* ══════════════ TAB: TARDE ══════════════ */}
        {dashTab === 'tarde' && (<>

        {/* 5 — Portal energético */}
        <Text style={styles.sectionContextLabel}>¿Qué energía potencia mi día?</Text>
        {todayPortal ? (
          <View style={[styles.portalCard, { borderColor: getPortalPowerColor(todayPortal.power) }]}>
            <View style={styles.portalHeader}>
              <Text style={styles.portalEmoji}>{todayPortal.emoji}</Text>
              <View style={styles.portalTitles}>
                <Text style={[styles.portalPowerBadge, { color: getPortalPowerColor(todayPortal.power) }]}>
                  ⚡ {getPortalPowerLabel(todayPortal.power)}
                </Text>
                <Text style={styles.portalName}>{todayPortal.name}</Text>
              </View>
            </View>
            <Text style={styles.portalEnergy}>✦ {todayPortal.energy}</Text>
            <Text style={styles.portalDescription}>{todayPortal.description}</Text>
            <View style={styles.portalDivider} />
            <Text style={styles.portalSectionLabel}>🎯 Intención del portal</Text>
            <Text style={styles.portalText}>{todayPortal.intention}</Text>
            <Text style={styles.portalSectionLabel}>🔮 Ritual especial</Text>
            <Text style={styles.portalText}>{todayPortal.ritual}</Text>
            <View style={[styles.portalAffirmationBox, { borderLeftColor: getPortalPowerColor(todayPortal.power) }]}>
              <Text style={styles.portalAffirmation}>"{todayPortal.affirmation}"</Text>
            </View>
          </View>
        ) : (
          <View style={styles.portalCardInactive}>
            <View style={styles.portalInactiveLeft}>
              <Text style={styles.portalInactiveLock}>🔒</Text>
            </View>
            <View style={styles.portalInactiveBody}>
              <Text style={styles.portalInactiveTitle}>Portal Energético</Text>
              <Text style={styles.portalInactiveDesc}>
                Hoy no hay portal activo. Los portales se abren en fechas específicas del año y amplifican tu capacidad de manifestación.
              </Text>
              {nextPortal && (
                <View style={styles.portalNextRow}>
                  <Text style={styles.portalNextEmoji}>{nextPortal.portal.emoji}</Text>
                  <View>
                    <Text style={styles.portalNextLabel}>Próximo portal</Text>
                    <Text style={styles.portalNextName}>
                      {nextPortal.portal.name.split('—')[0].trim()} · {nextPortal.dateLabel}
                    </Text>
                    <Text style={styles.portalNextDays}>
                      {nextPortal.daysAway === 1 ? 'Mañana' : `En ${nextPortal.daysAway} días`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ☀️ Protocolo de tarde */}
        <Card style={afternoonDone ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.sectionLabel}>☀️ Protocolo de tarde</Text>
            {afternoonDone
              ? <Text style={styles.doneBadge}>✦ Hecho</Text>
              : <TouchableOpacity style={styles.doneBtn} onPress={() => handleProtocolDone('afternoon')}>
                  <Text style={styles.doneBtnText}>Marcar hecho ✦</Text>
                </TouchableOpacity>
            }
          </View>
          <Text style={styles.sectionSubtitle}>¿Qué practico esta tarde?</Text>
          <Text style={afternoonDone ? [styles.protocolAction, styles.protocolActionDone] : styles.protocolAction}>
            {protocol.protocol.afternoon}
          </Text>
          <View style={styles.noteDivider} />
          {!editingAfternoonNote && !savedAfternoonNote && (
            <TouchableOpacity style={styles.noteAddBtn} onPress={() => setEditingAfternoonNote(true)}>
              <Text style={styles.noteAddText}>📝 Agregar anotación</Text>
            </TouchableOpacity>
          )}
          {!editingAfternoonNote && savedAfternoonNote ? (
            <View style={styles.noteSaved}>
              <View style={styles.noteSavedHeader}>
                <Text style={styles.noteSavedLabel}>📝 Tu anotación</Text>
                <TouchableOpacity onPress={() => setEditingAfternoonNote(true)}>
                  <Text style={styles.noteEditLink}>Editar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.noteSavedText}>{savedAfternoonNote}</Text>
            </View>
          ) : null}
          {editingAfternoonNote && (
            <View style={styles.noteEditor}>
              <TextInput
                style={styles.noteInput}
                value={afternoonNote}
                onChangeText={setAfternoonNote}
                placeholder="Anota aquí lo que practicaste, cómo te sentiste..."
                placeholderTextColor={Colors.textDisabled}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.noteActions}>
                <TouchableOpacity onPress={() => { setEditingAfternoonNote(false); setAfternoonNote(savedAfternoonNote) }}>
                  <Text style={styles.noteCancelBtn}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.noteSaveBtn}
                  onPress={async () => {
                    const val = afternoonNote.trim()
                    setSavedAfternoonNote(val)
                    setEditingAfternoonNote(false)
                    await upsertField({ afternoon_note: val })
                  }}
                >
                  <Text style={styles.noteSaveBtnText}>Guardar nota ✦</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        </>)}
        {/* ══════════════ FIN TAB TARDE ══════════════ */}

        {/* ══════════════ TAB: NOCHE ══════════════ */}
        {dashTab === 'noche' && (<>

        {/* 🌙 Protocolo de noche */}
        <Card style={nightDone ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.sectionLabel}>🌙 Protocolo de noche</Text>
            {nightDone
              ? <Text style={styles.doneBadge}>✦ Hecho</Text>
              : <TouchableOpacity style={styles.doneBtn} onPress={() => handleProtocolDone('night')}>
                  <Text style={styles.doneBtnText}>Marcar hecho ✦</Text>
                </TouchableOpacity>
            }
          </View>
          <Text style={styles.sectionSubtitle}>¿Cómo cierro mi día?</Text>
          <Text style={nightDone ? [styles.protocolAction, styles.protocolActionDone] : styles.protocolAction}>
            {protocol.protocol.night}
          </Text>
          <View style={styles.noteDivider} />
          {!editingNightNote && !savedNightNote && (
            <TouchableOpacity style={styles.noteAddBtn} onPress={() => setEditingNightNote(true)}>
              <Text style={styles.noteAddText}>📝 Agregar anotación</Text>
            </TouchableOpacity>
          )}
          {!editingNightNote && savedNightNote ? (
            <View style={styles.noteSaved}>
              <View style={styles.noteSavedHeader}>
                <Text style={styles.noteSavedLabel}>📝 Tu anotación</Text>
                <TouchableOpacity onPress={() => setEditingNightNote(true)}>
                  <Text style={styles.noteEditLink}>Editar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.noteSavedText}>{savedNightNote}</Text>
            </View>
          ) : null}
          {editingNightNote && (
            <View style={styles.noteEditor}>
              <TextInput
                style={styles.noteInput}
                value={nightNote}
                onChangeText={setNightNote}
                placeholder="Anota aquí lo que practicaste, cómo te sentiste..."
                placeholderTextColor={Colors.textDisabled}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
              <View style={styles.noteActions}>
                <TouchableOpacity onPress={() => { setEditingNightNote(false); setNightNote(savedNightNote) }}>
                  <Text style={styles.noteCancelBtn}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.noteSaveBtn}
                  onPress={async () => {
                    const val = nightNote.trim()
                    setSavedNightNote(val)
                    setEditingNightNote(false)
                    await upsertField({ night_note: val })
                  }}
                >
                  <Text style={styles.noteSaveBtnText}>Guardar nota ✦</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        {/* 🔮 Ritual del día */}
        <Card style={ritualDone ? [styles.sectionCard, styles.cardDone] : styles.sectionCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.sectionLabel}>🔮 Ritual del día</Text>
            {ritualDone
              ? <Text style={styles.doneBadge}>✦ Hecho</Text>
              : <TouchableOpacity style={styles.doneBtn} onPress={() => markSectionDone('ritual_done')}>
                  <Text style={styles.doneBtnText}>Marcar hecho ✦</Text>
                </TouchableOpacity>
            }
          </View>
          <Text style={styles.sectionSubtitle}>¿Cómo activo mi energía hoy?</Text>
          <Text style={styles.sectionTitle}>{protocol.ritual.title}</Text>
          <Text style={styles.sectionBody}>{protocol.ritual.description}</Text>
        </Card>

        {/* 🌑/🌕 Fase lunar */}
        <Text style={styles.sectionContextLabel}>¿Qué fase guía mi camino hoy?</Text>
        {lunarContent.isKeyPhase ? (
          <View style={[styles.lunarCard, { borderColor: lunarContent.borderColor, backgroundColor: lunarPhase === 'nueva' ? 'rgba(107,95,215,0.08)' : 'rgba(232,201,107,0.06)' }]}>
            <View style={styles.lunarHeader}>
              <Text style={styles.lunarEmoji}>{lunarContent.emoji}</Text>
              <View style={styles.lunarTitles}>
                <Text style={[styles.lunarPowerBadge, { color: lunarContent.borderColor }]}>🌙 Fase clave del ciclo</Text>
                <Text style={styles.lunarName}>{lunarContent.name}</Text>
              </View>
            </View>
            <Text style={[styles.lunarEnergy, { color: lunarContent.borderColor }]}>✦ {lunarContent.energy}</Text>
            <Text style={styles.lunarDescription}>{lunarContent.description}</Text>
            <View style={styles.lunarDivider} />
            <Text style={styles.lunarSectionLabel}>🎯 Tu intención lunar</Text>
            <Text style={styles.lunarText}>{lunarContent.intention}</Text>
            <Text style={styles.lunarSectionLabel}>🔮 Ritual recomendado</Text>
            <Text style={styles.lunarText}>{lunarContent.ritual}</Text>
            <View style={[styles.lunarAffirmationBox, { borderLeftColor: lunarContent.borderColor }]}>
              <Text style={styles.lunarAffirmation}>{lunarContent.affirmation}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.lunarCardInactive}>
            <View style={styles.lunarInactiveLeft}>
              <Text style={styles.lunarInactiveEmoji}>{lunarContent.emoji}</Text>
            </View>
            <View style={styles.lunarInactiveBody}>
              <Text style={styles.lunarInactiveTitle}>Fase Lunar · {lunarContent.name}</Text>
              <Text style={styles.lunarInactiveEnergy}>{lunarContent.energy}</Text>
              <Text style={styles.lunarInactiveDesc}>{lunarContent.description}</Text>
              {nextKeyPhase && (
                <View style={styles.lunarNextRow}>
                  <Text style={styles.lunarNextEmoji}>{nextKeyPhase.content.emoji}</Text>
                  <View>
                    <Text style={styles.lunarNextLabel}>Próxima fase clave</Text>
                    <Text style={styles.lunarNextName}>
                      {nextKeyPhase.content.name} · {nextKeyPhase.dateLabel}
                    </Text>
                    <Text style={styles.lunarNextDays}>
                      {nextKeyPhase.daysAway === 1 ? 'Mañana' : `En ${nextKeyPhase.daysAway} días`}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        </>)}
        {/* ══════════════ FIN TAB NOCHE ══════════════ */}

        {/* ── Separador visual ── */}
        <View style={styles.alwaysDivider}>
          <View style={styles.alwaysDividerLine} />
          <Text style={styles.alwaysDividerLabel}>TU PROGRESO</Text>
          <View style={styles.alwaysDividerLine} />
        </View>

        {/* ⭕ Progreso · Racha · Plan · Mapa (siempre visibles) */}
        <View style={styles.alwaysBlock}>
        <Card style={styles.circleCard}>
          <Text style={styles.sectionLabel}>⭕ Progreso de hoy</Text>
          <Text style={styles.sectionSubtitle}>Tu avance diario de hábitos</Text>
          <CircularProgress completed={todayCount} total={TOTAL_TASKS} />
        </Card>

        <Animated.View style={[styles.streakCard, { borderColor: streak > 0 ? streakColor : Colors.border }, { opacity: anim2, transform: [{ translateY: slide2 }] }]}>
          <View style={styles.streakTop}>
            <View style={styles.streakLeft}>
              <Text style={styles.streakFlame}>🔥</Text>
              <View>
                <Text style={[styles.streakCount, { color: streakColor }]}>
                  {streak} {streak === 1 ? 'día' : 'días'} seguidos
                </Text>
                <Text style={styles.streakMessage}>{streakMessage}</Text>
              </View>
            </View>
            <View style={styles.streakBadge}>
              <Text style={[styles.streakBadgeText, { color: streakColor }]}>
                {streak >= 66 ? '👑' : streak >= 21 ? '⭐' : streak >= 7 ? '✦' : '○'}
              </Text>
            </View>
          </View>
          <View style={styles.streakBarTrack}>
            <View style={[styles.streakBarFill, { width: `${Math.round(streakProgress * 100)}%` as any, backgroundColor: streakColor }]} />
          </View>
          <Text style={styles.streakMilestoneLabel}>
            {streak >= nextMilestone
              ? `¡Hito alcanzado!`
              : `Próximo hito: día ${nextMilestone} · ${Math.round(streakProgress * 100)}% completado`}
          </Text>
          <TouchableOpacity style={styles.shareProgressBtn} onPress={() => setShowTransformCard(true)}>
            <Text style={styles.shareProgressText}>✦ Ver mi tarjeta de transformación</Text>
          </TouchableOpacity>
        </Animated.View>

        {!planComplete && (() => {
          const planPct    = Math.min(Math.round(((planDay - 1) / planDuration) * 100), 100)
          const PHASES = [
            { pct: 0,   label: 'Fundación',  emoji: '🌱' },
            { pct: 25,  label: 'Activación', emoji: '⚡' },
            { pct: 50,  label: 'Momentum',   emoji: '🔥' },
            { pct: 75,  label: 'Integración',emoji: '🌕' },
          ]
          const currentPhase = [...PHASES].reverse().find(p => planPct >= p.pct) ?? PHASES[0]
          const nextPhase = PHASES.find(p => p.pct > planPct)
          const phaseMsg = planPct < 25
            ? 'Estás sentando las bases. Cada día suma vibración.'
            : planPct < 50 ? 'El campo de atracción se está activando.'
            : planPct < 75 ? 'Estás en el momento de mayor impulso del plan.'
            : 'La etapa final — consolida y cosecha lo que sembraste.'
          return (
            <View style={styles.planCard}>
              <View style={styles.planTop}>
                <View style={styles.planPhaseLeft}>
                  <Text style={styles.planPhaseEmoji}>{currentPhase.emoji}</Text>
                  <View>
                    <Text style={styles.planPhaseEyebrow}>FASE ACTUAL</Text>
                    <Text style={styles.planPhaseName}>{currentPhase.label}</Text>
                  </View>
                </View>
                <Text style={styles.planPct}>{planPct}%</Text>
              </View>
              <View style={styles.planBarWrapper}>
                <View style={styles.planBarTrack}>
                  <View style={[styles.planBarFill, { width: `${planPct}%` as any }]} />
                  {[25, 50, 75].map(mark => (
                    <View key={mark} style={[styles.planMarker, { left: `${mark}%` as any }, planPct >= mark && styles.planMarkerPassed]} />
                  ))}
                </View>
              </View>
              <View style={styles.planPhaseLabels}>
                {PHASES.map((p, i) => (
                  <Text key={i} style={[styles.planPhaseLabel, planPct >= p.pct && styles.planPhaseLabelActive]} numberOfLines={1}>
                    {p.emoji}
                  </Text>
                ))}
              </View>
              <View style={styles.planStats}>
                <View style={styles.planStat}>
                  <Text style={styles.planStatValue}>Día {Math.min(planDay, planDuration)}</Text>
                  <Text style={styles.planStatLabel}>actual</Text>
                </View>
                <View style={styles.planStatSep} />
                <View style={styles.planStat}>
                  <Text style={styles.planStatValue}>{Math.max(planDaysLeft, 0)}</Text>
                  <Text style={styles.planStatLabel}>días restantes</Text>
                </View>
                <View style={styles.planStatSep} />
                <View style={styles.planStat}>
                  <Text style={styles.planStatValue}>{planDuration}</Text>
                  <Text style={styles.planStatLabel}>días totales</Text>
                </View>
              </View>
              <Text style={styles.planMsg}>{phaseMsg}</Text>
              {nextPhase && (
                <Text style={styles.planNext}>
                  Próxima fase: {nextPhase.emoji} {nextPhase.label} · día {Math.round(nextPhase.pct / 100 * planDuration) + 1}
                </Text>
              )}
            </View>
          )
        })()}

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>📊 Mapa de Progreso · Semanal</Text>
          <Text style={styles.sectionSubtitle}>Tu constancia de los últimos 7 días</Text>
          <WeeklyProgressRing days={weeklyProgressDays} />
        </Card>

        {allLogs.length === 0 && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: 60 }]} />
            </View>
            <View style={styles.skeletonChart} />
            <View style={styles.skeletonStatsRow}>
              {[0,1,2].map(i => <View key={i} style={styles.skeletonStat} />)}
            </View>
          </Card>
        )}

        {weakHabits.length > 0 && (
          <Card style={styles.patternCard}>
            <View style={styles.patternHeader}>
              <Text style={styles.patternTitle}>🔍 Patrón detectado esta semana</Text>
              <Text style={styles.patternSubtitle}>
                {weakHabits.length === 1
                  ? 'Este hábito necesita más consistencia esta semana'
                  : `Estos ${weakHabits.length} hábitos necesitan más consistencia esta semana`}
              </Text>
            </View>
            {weakHabits.map((h, i) => (
              <View key={i} style={styles.patternItem}>
                <View style={styles.patternItemHeader}>
                  <Text style={styles.patternEmoji}>{h.emoji}</Text>
                  <Text style={styles.patternHabitName}>{h.name}</Text>
                  <View style={[styles.patternZeroBadge, h.completions > 0 && { backgroundColor: 'rgba(255,165,0,0.15)', borderColor: 'rgba(255,165,0,0.4)' }]}>
                    <Text style={[styles.patternZeroText, h.completions > 0 && { color: '#FFA500' }]}>{h.completions}/7</Text>
                  </View>
                </View>
                <View style={styles.patternTipBox}>
                  <Text style={styles.patternTipLabel}>💡 Cómo retomarlo</Text>
                  <Text style={styles.patternTip}>{h.tip}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        </View>
        {/* ── Sugerencias y Legal (siempre visibles) ── */}
        <TouchableOpacity onPress={() => setFeedbackOpen(true)} style={styles.feedbackBtn}>
          <Text style={styles.feedbackText}>💬 ¿Tienes una sugerencia para Lúmina?</Text>
        </TouchableOpacity>

        {/* ── Legal ── */}
        <View style={styles.legalRow}>
          <TouchableOpacity onPress={() => setLegalModal('privacy')}>
            <Text style={styles.legalLink}>Política de privacidad</Text>
          </TouchableOpacity>
          <Text style={styles.legalSep}>·</Text>
          <TouchableOpacity onPress={() => setLegalModal('terms')}>
            <Text style={styles.legalLink}>Términos de servicio</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* ── Modal de bienvenida Día 1 ── */}
      {showWelcomeModal && (
        <WelcomeDayOneModal
          affirmation={protocol.affirmation}
          ritualTitle={protocol.ritual.title}
          ritualDescription={protocol.ritual.description}
          onComplete={async (affDone, ritDone) => {
            setShowWelcomeModal(false)
            if (affDone) await markSectionDone('affirmation_done')
            if (ritDone) await markSectionDone('ritual_done')
            await supabase.from('profiles').update({
              goal_details: { ...profile!.goal_details, welcome_seen: true },
            }).eq('id', profile!.id)
          }}
        />
      )}

      {/* ── Resumen semanal ── */}
      {weeklySummary && (
        <WeeklySummaryModal
          data={weeklySummary}
          firstName={profile.full_name.split(' ')[0]}
          onClose={() => setWeeklySummary(null)}
        />
      )}

      {/* ── Celebración día completo ── */}
      {showCelebration && (
        <CelebrationOverlay
          streak={streak}
          firstName={profile.full_name.split(' ')[0]}
          onClose={() => setShowCelebration(false)}
        />
      )}

      {/* ── Modal de sugerencias ── */}
      <Modal visible={feedbackOpen} transparent animationType="slide" onRequestClose={() => setFeedbackOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Tu sugerencia</Text>
            <Text style={styles.modalSub}>Cuéntanos qué mejorarías o qué te gustaría ver en la app.</Text>
            <TextInput
              style={styles.modalInput}
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Escribe aquí…"
              placeholderTextColor={Colors.textDisabled}
              multiline
              numberOfLines={5}
              autoCapitalize="sentences"
              autoFocus
            />
            <TouchableOpacity
              onPress={sendFeedback}
              style={[styles.modalSend, (!feedbackText.trim() || feedbackSending) && styles.modalSendDisabled]}
              disabled={!feedbackText.trim() || feedbackSending}
            >
              <Text style={styles.modalSendText}>{feedbackSending ? 'Enviando…' : 'Enviar sugerencia'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFeedbackOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Modal legal ── */}
      <Modal visible={legalModal !== null} transparent animationType="slide" onRequestClose={() => setLegalModal(null)}>
        <View style={styles.legalOverlay}>
          <View style={styles.legalSheet}>
            <Text style={styles.legalSheetTitle}>
              {legalModal === 'privacy' ? '🔒 Política de Privacidad' : '📄 Términos de Servicio'}
            </Text>
            <ScrollView style={styles.legalScroll} showsVerticalScrollIndicator={false}>
              {legalModal === 'privacy' ? <PrivacyPolicyContent /> : <TermsOfServiceContent />}
            </ScrollView>
            <TouchableOpacity onPress={() => setLegalModal(null)} style={styles.legalClose}>
              <Text style={styles.legalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Overlay: Visualizador de frecuencia ── */}
      {showFreqOverlay && (
        <FrequencyPlayerOverlay
          hz={protocol.frequency.hz}
          name={protocol.frequency.name}
          purpose={FREQUENCY_CONTEXT[protocol.frequency.hz]?.howTo}
          playing={playing}
          onToggle={() => play(protocol.frequency.hz)}
          onClose={() => setShowFreqOverlay(false)}
        />
      )}

      {/* ── Overlay: Afirmación del día ── */}
      {showAffirmOverlay && (
        <AffirmationReveal
          affirmation={protocol.affirmation}
          numerologyNumber={profile.numerology_number ?? undefined}
          numerologyArchetype={profile.numerology_number ? NUMEROLOGY_INFO[profile.numerology_number]?.archetype : undefined}
          onClose={() => setShowAffirmOverlay(false)}
          onDone={() => { markSectionDone('affirmation_done'); setShowAffirmOverlay(false) }}
          isDone={affirmationDone}
        />
      )}

      {/* ── Overlay: Tarjeta de transformación ── */}
      {showTransformCard && (
        <TransformationCard
          firstName={profile.full_name.split(' ')[0]}
          manifestationArea={profile.manifestation_area ?? 'dinero'}
          streak={streak}
          planDay={Math.min(planDay, planDuration)}
          planDuration={planDuration}
          overallRate={overallRate}
          todayCount={todayCount}
          totalTasks={TOTAL_TASKS}
          onClose={() => setShowTransformCard(false)}
        />
      )}

    </View>
  )
}

function PrivacyPolicyContent() {
  return (
    <View style={legalContentStyles.body}>
      <Text style={legalContentStyles.updated}>Última actualización: mayo 2025</Text>

      <Text style={legalContentStyles.section}>1. Información que recopilamos</Text>
      <Text style={legalContentStyles.text}>Recopilamos la información que nos proporcionas al registrarte: nombre, correo electrónico, fecha de nacimiento, signo zodiacal y área de manifestación. También registramos tu actividad dentro de la app (hábitos completados, anotaciones del diario, progreso del plan) para personalizar tu experiencia.</Text>

      <Text style={legalContentStyles.section}>2. Cómo usamos tu información</Text>
      <Text style={legalContentStyles.text}>Usamos tus datos para: entregar el plan de 30 días personalizado, enviar notificaciones de recordatorio, procesar pagos a través de Stripe, y mejorar la experiencia de la aplicación. No vendemos ni compartimos tu información personal con terceros para fines publicitarios.</Text>

      <Text style={legalContentStyles.section}>3. Pagos</Text>
      <Text style={legalContentStyles.text}>Los pagos son procesados por Stripe, Inc. No almacenamos datos de tarjetas de crédito en nuestros servidores. Stripe cuenta con certificación PCI DSS nivel 1. Puedes consultar su política de privacidad en stripe.com/privacy.</Text>

      <Text style={legalContentStyles.section}>4. Notificaciones</Text>
      <Text style={legalContentStyles.text}>Con tu permiso, enviamos notificaciones push para recordarte tu práctica diaria, portales energéticos activos y fases lunares clave. Puedes desactivarlas en cualquier momento desde la configuración de tu dispositivo.</Text>

      <Text style={legalContentStyles.section}>5. Almacenamiento y seguridad</Text>
      <Text style={legalContentStyles.text}>Tu información se almacena en servidores seguros proporcionados por Supabase con cifrado en tránsito (HTTPS/TLS). Tomamos medidas razonables para proteger tu información, aunque ningún sistema es 100% seguro.</Text>

      <Text style={legalContentStyles.section}>6. Tus derechos</Text>
      <Text style={legalContentStyles.text}>Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Para ejercer estos derechos o para cualquier consulta, escríbenos a: soporte@lumina-app.com</Text>

      <Text style={legalContentStyles.section}>7. Menores de edad</Text>
      <Text style={legalContentStyles.text}>Esta aplicación no está dirigida a personas menores de 18 años. No recopilamos intencionalmente información de menores.</Text>

      <Text style={legalContentStyles.section}>8. Cambios a esta política</Text>
      <Text style={legalContentStyles.text}>Podemos actualizar esta política periódicamente. Te notificaremos de cambios significativos a través de la app o por correo electrónico.</Text>
    </View>
  )
}

function TermsOfServiceContent() {
  return (
    <View style={legalContentStyles.body}>
      <Text style={legalContentStyles.updated}>Última actualización: mayo 2025</Text>

      <Text style={legalContentStyles.section}>1. Aceptación de los términos</Text>
      <Text style={legalContentStyles.text}>Al crear una cuenta y usar Lúmina, aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo, no uses la aplicación.</Text>

      <Text style={legalContentStyles.section}>2. Descripción del servicio</Text>
      <Text style={legalContentStyles.text}>Lúmina es una aplicación de bienestar personal que ofrece un plan de 30 días basado en hábitos, afirmaciones, rituales y seguimiento de intenciones. No somos un servicio médico, psicológico ni financiero. Los resultados varían según cada persona.</Text>

      <Text style={legalContentStyles.section}>3. Suscripción y pagos</Text>
      <Text style={legalContentStyles.text}>El acceso al plan completo requiere el pago único indicado al momento de la compra. El pago se procesa a través de Stripe. Una vez activado el plan, no se ofrecen reembolsos salvo en los casos contemplados por la ley aplicable en tu país de residencia.</Text>

      <Text style={legalContentStyles.section}>4. Uso permitido</Text>
      <Text style={legalContentStyles.text}>La app es para uso personal y no comercial. No puedes copiar, distribuir, modificar ni revender el contenido de Lúmina. Cada cuenta es personal e intransferible.</Text>

      <Text style={legalContentStyles.section}>5. Contenido del usuario</Text>
      <Text style={legalContentStyles.text}>Las anotaciones y entradas de diario que escribas son tuyas. Nos otorgas permiso limitado para almacenarlas en nuestros servidores únicamente para el funcionamiento de la app.</Text>

      <Text style={legalContentStyles.section}>6. Limitación de responsabilidad</Text>
      <Text style={legalContentStyles.text}>Lúmina no garantiza resultados específicos. La app es una herramienta de apoyo al desarrollo personal. No nos hacemos responsables de decisiones tomadas basándose en el contenido de la app.</Text>

      <Text style={legalContentStyles.section}>7. Terminación</Text>
      <Text style={legalContentStyles.text}>Podemos suspender o cancelar tu cuenta si detectamos uso fraudulento o violación de estos términos. Puedes eliminar tu cuenta en cualquier momento contactando a soporte@lumina-app.com</Text>

      <Text style={legalContentStyles.section}>8. Ley aplicable</Text>
      <Text style={legalContentStyles.text}>Estos términos se rigen por las leyes del país en el que opera el servicio. Cualquier disputa se resolverá de buena fe entre las partes.</Text>

      <Text style={legalContentStyles.section}>9. Contacto</Text>
      <Text style={legalContentStyles.text}>Para cualquier consulta sobre estos términos: soporte@lumina-app.com</Text>
    </View>
  )
}

const legalContentStyles = StyleSheet.create({
  body:    { gap: 12, paddingBottom: 8 },
  updated: { fontSize: 11, color: Colors.textDisabled, marginBottom: 4 },
  section: { fontSize: 13, color: Colors.gold, fontWeight: '700', marginTop: 4 },
  text:    { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingTop: 60 },
  // Atmospheric background layers
  noiseBg: {
    // @ts-ignore — web-only CSS passthrough
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    backgroundRepeat: 'repeat',
    opacity: 0.04,
  },
  orbPurple: {
    position: 'absolute', width: 320, height: 320, top: -80, right: -80, borderRadius: 160,
    // @ts-ignore — web-only
    background: 'radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 65%)',
  },
  orbGold: {
    position: 'absolute', width: 260, height: 260, bottom: 200, left: -80, borderRadius: 130,
    // @ts-ignore — web-only
    background: 'radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 65%)',
  },
  header: { flexDirection: 'column', marginBottom: Spacing.lg, gap: 4 },
  greeting: { fontSize: 30, color: Colors.textPrimary, fontFamily: Fonts.headingSemiBold },
  date: { fontSize: 14, color: 'rgba(240,238,248,0.5)', marginTop: 2, textTransform: 'capitalize' },
  planCounter: { fontSize: 12, color: Colors.gold, fontWeight: '600', marginTop: 2, letterSpacing: 0.3 },
  goalLabel:   { fontSize: 13, color: Colors.textSecondary, marginTop: 4, fontStyle: 'italic' },

  // Nav compacta
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  navLeft: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  navRight: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  navLink: { fontSize: 20, color: Colors.textSecondary },
  navLinkActive: { color: Colors.gold },
  navLinkText: { fontSize: 13, color: Colors.textSecondary, fontFamily: Fonts.bodyMedium },
  navLinkDim: { fontSize: 13, color: Colors.textDisabled },

  // Lunar badge
  lunarBadge: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(167,139,250,0.10)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.20)',
    borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5,
    marginTop: 6, marginBottom: Spacing.md,
  },
  lunarBadgeText: { fontSize: 12, color: '#a78bfa', fontWeight: '600' },

  // Feature grid (Diario + Visión)
  featureGrid: { flexDirection: 'row', gap: 10, marginTop: Spacing.sm },
  featureCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.lg, padding: Spacing.md, gap: 4, overflow: 'hidden',
  },
  featureIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  featureIconGold: { backgroundColor: Colors.goldDim },
  featureIconPurple: { backgroundColor: Colors.purpleDim },
  featureIcon: { fontSize: 20 },
  featureTitle: { fontSize: 17, color: Colors.textPrimary, fontFamily: Fonts.headingSemiBold },
  featureSub: { fontSize: 11, color: Colors.textDisabled },

  // Legados (no se usan pero evitan errores si algo los referencia)
  headerActions: { flexDirection: 'column', gap: Spacing.sm },
  headerRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  editProfile: { fontSize: 13, color: Colors.textSecondary },
  alertBtnActive: { backgroundColor: 'rgba(201,168,76,0.15)', borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  alertBtnText: { fontSize: 13, color: Colors.gold, fontWeight: '700' },
  signOut: { fontSize: 13, color: Colors.textDisabled },
  adminBtn: { fontSize: 13, color: '#9B7FD4' },

  // ── Briefing de personalización ───────────────────────────────────────────
  briefingCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.goldDim,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  briefingTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.gold,
    marginBottom: 2,
  },
  briefingSubtitle: {
    fontSize: 11,
    color: Colors.textDisabled,
    marginBottom: Spacing.sm,
    letterSpacing: 0.3,
  },
  briefingChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  briefingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  briefingChipEmoji: { fontSize: 12 },
  briefingChipLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: Fonts.bodyMedium,
  },
  firstStepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.40)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    marginBottom: Spacing.xs,
  },
  firstStepBadgeText: { fontSize: 12, color: Colors.gold, fontWeight: '700' },
  alwaysDivider: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  alwaysDividerLine: { flex: 1, height: 1, backgroundColor: Colors.gold, opacity: 0.35 },
  alwaysDividerLabel: {
    fontSize: 10, color: Colors.gold, fontWeight: '800',
    letterSpacing: 1.5, opacity: 0.8,
  },
  alwaysBlock: {
    backgroundColor: Colors.goldDim,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    padding: Spacing.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  dayTabBar: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16, padding: 4, marginBottom: Spacing.md,
  },
  dayTab: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
    gap: 2, position: 'relative',
  },
  dayTabActive: { backgroundColor: Colors.purpleDim },
  dayTabEmoji:  { fontSize: 16 },
  dayTabLabel:  { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  dayTabLabelActive: { color: '#a78bfa' },
  dayTabBadge: {
    position: 'absolute', top: 4, right: 8,
    backgroundColor: Colors.gold, borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  dayTabBadgeText: { fontSize: 9, color: Colors.background, fontWeight: '800' },

  feedbackBtn: { alignItems: 'center', paddingVertical: Spacing.lg, marginTop: Spacing.md },
  feedbackText: { fontSize: 13, color: Colors.textDisabled },

  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingBottom: Spacing.sm },
  legalLink: { fontSize: 11, color: Colors.textDisabled, textDecorationLine: 'underline' },
  legalSep:  { fontSize: 11, color: Colors.textDisabled },

  legalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  legalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: 40, maxHeight: '85%',
  },
  legalSheetTitle: { fontSize: 17, color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.md },
  legalScroll: { flex: 1 },
  legalClose: {
    marginTop: Spacing.md, alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderRadius: 12, paddingVertical: 12,
  },
  legalCloseText: { fontSize: 14, color: Colors.gold, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: Spacing.lg, paddingBottom: 40, gap: Spacing.sm,
  },
  modalTitle: { fontSize: 20, color: Colors.textPrimary, fontWeight: '700' },
  modalSub: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 4 },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 15,
    borderWidth: 1, borderColor: Colors.border,
    minHeight: 120, textAlignVertical: 'top',
    marginBottom: 4,
  },
  modalSend: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  modalSendDisabled: { opacity: 0.4 },
  modalSendText: { color: Colors.background, fontSize: 16, fontWeight: '700' },
  modalCancel: { alignItems: 'center', paddingVertical: Spacing.sm },
  modalCancelText: { fontSize: 14, color: Colors.textDisabled },
  lunarCard: {
    marginBottom: Spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  lunarHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  lunarEmoji: { fontSize: 36, lineHeight: 42 },
  lunarTitles: { flex: 1, gap: 2 },
  lunarPowerBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  lunarName: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700', lineHeight: 22 },
  lunarEnergy: { fontSize: 12, fontStyle: 'italic' },
  lunarDescription: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  lunarDivider: { height: 0.5, backgroundColor: 'rgba(201,168,76,0.20)', marginVertical: 2 },
  lunarSectionLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  lunarText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  lunarAffirmationBox: { borderLeftWidth: 2, paddingLeft: Spacing.sm, marginTop: 2 },
  lunarAffirmation: { fontSize: 14, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
  lunarCardInactive: {
    marginBottom: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  lunarInactiveLeft: { paddingTop: 2 },
  lunarInactiveEmoji: { fontSize: 22, opacity: 0.4 },
  lunarInactiveBody: { flex: 1, gap: Spacing.xs },
  lunarInactiveTitle: { fontSize: 13, color: 'rgba(255,255,255,0.30)', fontWeight: '600', letterSpacing: 0.5 },
  lunarInactiveEnergy: { fontSize: 11, color: 'rgba(255,255,255,0.22)', fontStyle: 'italic' },
  lunarInactiveDesc: { fontSize: 12, color: 'rgba(255,255,255,0.22)', lineHeight: 18 },
  lunarNextRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.08)' },
  lunarNextEmoji: { fontSize: 22 },
  lunarNextLabel: { fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: 0.5 },
  lunarNextName: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  lunarNextDays: { fontSize: 11, color: Colors.gold, fontWeight: '600' },
  circleCard: { marginBottom: Spacing.md, gap: Spacing.md },
  sectionCard: { marginBottom: Spacing.md, gap: Spacing.sm },

  // Sync error banner
  syncErrorBanner: {
    backgroundColor: 'rgba(224,85,85,0.15)',
    borderWidth: 1, borderColor: '#E05555',
    borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.md, gap: 4,
  },
  syncErrorText: { fontSize: 12, color: '#E05555', lineHeight: 18 },
  syncErrorDismiss: { fontSize: 10, color: 'rgba(224,85,85,0.6)' },

  pendingBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.10)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.40)',
    borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.md, gap: Spacing.md,
  },
  pendingBannerLeft: { flex: 1, gap: 3 },
  pendingBannerTitle: { fontSize: 15, color: Colors.gold, fontWeight: '700' },
  pendingBannerBody: { fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  pendingBannerMotto: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
  pendingBannerBtn: {
    backgroundColor: Colors.gold, borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center',
  },
  pendingBannerBtnText: { fontSize: 12, color: '#1A1A2E', fontWeight: '700', textAlign: 'center' },

  // Cierre de ciclo
  cycleEmoji:    { fontSize: 72, textAlign: 'center', marginTop: Spacing.xxl, marginBottom: Spacing.md },
  cycleTitle:    { fontSize: 28, color: Colors.gold, fontWeight: '800', textAlign: 'center' },
  cycleSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  cycleSummaryCard:  { marginBottom: Spacing.xl, gap: Spacing.md },
  cycleSummaryTitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 0.5 },
  cycleSummaryRow:   { flexDirection: 'row', justifyContent: 'space-around' },
  cycleStat:      { alignItems: 'center', gap: 4 },
  cycleStatValue: { fontSize: 28, color: Colors.gold, fontWeight: '800' },
  cycleStatLabel: { fontSize: 12, color: Colors.textSecondary },
  cycleRenewTitle: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginBottom: 4 },
  cycleRenewSub:   { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.md },
  cycleDurationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xxl },
  cycleDurationBtn: {
    flex: 1, minWidth: '45%',
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 1, borderColor: Colors.gold,
    borderRadius: Radius.md, padding: Spacing.md,
    alignItems: 'center',
  },
  cycleDurationDays: { fontSize: 18, color: Colors.gold, fontWeight: '700' },

  // Pattern card
  patternCard: {
    marginBottom: Spacing.md, gap: Spacing.md,
    borderColor: '#E05555', borderWidth: 1,
    backgroundColor: 'rgba(224,85,85,0.05)',
  },
  patternHeader: { gap: 4 },
  patternTitle: { fontSize: 14, color: '#E05555', fontWeight: '700' },
  patternSubtitle: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
  patternItem: { gap: Spacing.sm },
  patternItemHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  patternEmoji: { fontSize: 20 },
  patternHabitName: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '600' },
  patternZeroBadge: {
    backgroundColor: 'rgba(224,85,85,0.15)', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  patternZeroText: { fontSize: 11, color: '#E05555', fontWeight: '700' },
  patternTipBox: {
    borderLeftWidth: 2, borderLeftColor: Colors.gold,
    paddingLeft: Spacing.sm, gap: 3,
    marginLeft: 30,
  },
  patternTipLabel: { fontSize: 10, color: Colors.gold, fontWeight: '700', letterSpacing: 0.4 },
  patternTip: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  sectionLabel: { fontSize: 11, color: Colors.textDim, letterSpacing: 0.9, fontFamily: Fonts.bodySemiBold, textTransform: 'uppercase' },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.xs,
  },
  sectionContextLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  objectiveHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phasePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(201,168,76,0.10)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)' },
  phaseEmoji: { fontSize: 11 },
  phaseLabel: { fontSize: 10, color: Colors.gold, fontWeight: '700', letterSpacing: 0.3 },
  sectionTitle: { fontSize: 17, color: Colors.textPrimary, fontWeight: '600' },
  sectionBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  affirmation: { fontSize: 16, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 24 },
  affirmationHero: { fontSize: 22, color: Colors.textPrimary, fontFamily: Fonts.headingItalic, lineHeight: 32, marginTop: Spacing.xs },
  affirmRevealHint: { fontFamily: Fonts.body, fontSize: 11, color: Colors.purpleAccent, opacity: 0.7, marginTop: 4 },
  affirmationCard: { borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.md },
  numerologyTag: { fontSize: 12, color: Colors.gold },
  numBox: {
    backgroundColor: 'rgba(201,168,76,0.06)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.18)',
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  numHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  numBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.gold,
    justifyContent: 'center', alignItems: 'center',
  },
  numBadgeNum: { fontSize: 20, color: Colors.background, fontWeight: '800' },
  numTitles: { flex: 1, gap: 5 },
  numArchetype: { fontSize: 14, color: Colors.gold, fontWeight: '700' },
  numKeywords: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  numKeywordPill: {
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  numKeywordText: { fontSize: 11, color: Colors.gold },
  numEnergy: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  numShadow: { fontSize: 12, color: 'rgba(255,255,255,0.30)', fontStyle: 'italic', lineHeight: 18 },
  colorsRow: { flexDirection: 'row', gap: 10, marginVertical: Spacing.sm },
  colorSwatch: {
    flex: 1, height: 100, borderRadius: Radius.md,
    overflow: 'hidden', justifyContent: 'flex-end',
  },
  colorSwatchOverlay: {
    backgroundColor: 'rgba(0,0,0,0.30)',
    paddingHorizontal: 10, paddingVertical: 8,
  },
  colorSwatchName: { fontSize: 14, fontWeight: '700', color: '#fff', textAlign: 'center' },
  foodChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: Spacing.sm },
  foodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  foodChipEmoji: { fontSize: 13 },
  foodChipText:  { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  freqCard: { borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.xs },
  freqCardLabel: { fontSize: 11, color: 'rgba(167,139,250,0.6)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  freqPlayRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs, gap: Spacing.md },
  freqExpandBtn: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm },
  freqExpandText: { fontFamily: Fonts.bodySemiBold, fontSize: 12, color: Colors.purpleAccent, opacity: 0.8 },
  frequencyBox: {
    backgroundColor: Colors.input,
    borderRadius: 12,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  freqLeft: { gap: 2 },
  frequencyHz: { fontSize: 44, color: '#a78bfa', fontFamily: Fonts.heading, lineHeight: 50, includeFontPadding: false },
  frequencyName: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.xs },
  playButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#a78bfa',
    justifyContent: 'center', alignItems: 'center',
  },
  playIcon: { color: '#fff', fontSize: 16 },
  freqGuide: {
    backgroundColor: 'rgba(123,63,212,0.07)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(123,63,212,0.20)',
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  freqGuideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  freqGuideTitle: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.4 },
  freqDurationPill: {
    backgroundColor: 'rgba(123,63,212,0.20)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  freqDurationText: { fontSize: 11, color: Colors.purple, fontWeight: '600' },
  freqWhenRow: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  freqWhenText: { fontSize: 12, color: Colors.gold, fontWeight: '600' },
  freqHowTo: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  freqIntegrationBox: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.purple,
    paddingLeft: Spacing.sm,
    gap: 3,
  },
  freqIntegrationLabel: { fontSize: 11, color: Colors.purple, fontWeight: '700', letterSpacing: 0.3 },
  freqIntegrationText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },
  protocolRow: { gap: 4 },
  protocolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  protocolTime: { fontSize: 13, color: Colors.gold, fontWeight: '600' },
  protocolDone: { color: Colors.success },
  protocolActionDone: { color: 'rgba(76,175,130,0.55)' },
  protocolBtn: { fontSize: 12, color: Colors.gold, borderWidth: 1, borderColor: Colors.gold, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  protocolAction: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  divider: { height: 0.5, backgroundColor: 'rgba(201, 168, 76, 0.15)', marginVertical: Spacing.sm },
  energyRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
  energyDot: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.input,
    borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  energyDotActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  energyNumber: { color: Colors.textSecondary, fontWeight: '600' },
  energyNumberActive: { color: Colors.background },
  energySaved: { fontSize: 12, color: Colors.gold, marginTop: Spacing.xs },
  playButtonActive: { backgroundColor: Colors.gold },
  portalCard: {
    marginBottom: Spacing.md,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: Spacing.md,
    backgroundColor: 'rgba(123,63,212,0.08)',
    gap: Spacing.sm,
  },
  portalHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  portalEmoji: { fontSize: 36, lineHeight: 42 },
  portalTitles: { flex: 1, gap: 2 },
  portalPowerBadge: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  portalName: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700', lineHeight: 22 },
  portalEnergy: { fontSize: 12, color: Colors.gold, fontStyle: 'italic' },
  portalDescription: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  portalDivider: { height: 0.5, backgroundColor: 'rgba(201,168,76,0.20)', marginVertical: 2 },
  portalSectionLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  portalText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20 },
  portalAffirmationBox: { borderLeftWidth: 2, paddingLeft: Spacing.sm, marginTop: 2 },
  portalAffirmation: { fontSize: 14, color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
  portalCardInactive: {
    marginBottom: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  portalInactiveLeft: { paddingTop: 2 },
  portalInactiveLock: { fontSize: 22, opacity: 0.35 },
  portalInactiveBody: { flex: 1, gap: Spacing.xs },
  portalInactiveTitle: { fontSize: 13, color: 'rgba(255,255,255,0.30)', fontWeight: '600', letterSpacing: 0.5 },
  portalInactiveDesc: { fontSize: 12, color: 'rgba(255,255,255,0.22)', lineHeight: 18 },
  portalNextRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs, paddingTop: Spacing.xs, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.08)' },
  portalNextEmoji: { fontSize: 22 },
  portalNextLabel: { fontSize: 10, color: 'rgba(255,255,255,0.30)', letterSpacing: 0.5 },
  portalNextName: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },
  portalNextDays: { fontSize: 11, color: Colors.gold, fontWeight: '600' },
  progressCard: { marginBottom: Spacing.md, gap: Spacing.sm },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressMeta: { fontSize: 12, color: Colors.gold, fontWeight: '600' },
  legendRow: { flexDirection: 'row', gap: Spacing.lg, paddingHorizontal: PAD_L },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: Spacing.xs, borderTopWidth: 0.5, borderTopColor: 'rgba(201,168,76,0.15)' },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: '700' },
  statLabel: { fontSize: 10, color: Colors.textSecondary },
  statSep: { width: 0.5, backgroundColor: 'rgba(201,168,76,0.15)', alignSelf: 'stretch' },
  objectiveMeasurable: { fontSize: 12, color: Colors.gold, fontStyle: 'italic' },
  noteDivider: { height: 0.5, backgroundColor: 'rgba(201,168,76,0.15)', marginTop: Spacing.sm },
  noteAddBtn: { paddingVertical: Spacing.xs },
  noteAddText: { fontSize: 13, color: Colors.textDisabled },
  noteSaved: { gap: 4 },
  noteSavedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteSavedLabel: { fontSize: 11, color: Colors.textSecondary },
  noteEditLink: { fontSize: 12, color: Colors.gold },
  noteSavedText: { fontSize: 13, color: Colors.textPrimary, lineHeight: 20, fontStyle: 'italic' },
  noteEditor: { gap: Spacing.sm },
  noteRule: { fontSize: 12, color: Colors.gold, fontStyle: 'italic', lineHeight: 18 },
  noteCharRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteCharCount: { fontSize: 11, color: Colors.textDisabled },
  noteCharCountOk: { color: Colors.gold },
  noteCharReady: { fontSize: 11, color: Colors.success, fontWeight: '600' },
  noteInput: {
    backgroundColor: Colors.input,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 14,
    minHeight: 90,
    lineHeight: 21,
  },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: Spacing.md },
  noteCancelBtn: { fontSize: 13, color: Colors.textDisabled },
  noteSaveBtn: { backgroundColor: Colors.gold, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 20 },
  noteSaveBtnDisabled: { opacity: 0.4 },
  noteSaveBtnText: { fontSize: 13, color: Colors.background, fontWeight: '600' },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDone: { borderColor: Colors.success, borderWidth: 1 },
  doneBadge: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  doneBtn: { backgroundColor: '#a78bfa', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  doneBtnText: { fontSize: 11, color: '#ffffff', fontWeight: '600' },
  objectiveFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.sm },
  objectiveDuration: { fontSize: 12, color: Colors.textDisabled },
  objectiveBtn: { backgroundColor: Colors.gold, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: 20 },
  objectiveBtnLocked: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border },
  objectiveBtnText: { fontSize: 13, color: Colors.background, fontWeight: '600' },
  objectiveDone: { fontSize: 13, color: Colors.success, fontWeight: '600' },

  journalHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.10)',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.45)',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  journalHeroEmoji: { fontSize: 40 },
  journalHeroText: { flex: 1, gap: 4 },
  journalHeroTitle: { fontSize: 20, color: Colors.gold, fontFamily: Fonts.heading },
  journalHeroSub: { fontSize: 13, color: Colors.textSecondary },
  journalHeroArrow: { fontSize: 32, color: Colors.gold, fontWeight: '300', marginRight: 4 },

  streakCard: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg,
    borderWidth: 1, padding: Spacing.md,
    marginBottom: Spacing.md, gap: Spacing.sm,
  },
  streakTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  streakFlame: { fontSize: 32 },
  streakCount: { fontSize: 17, fontWeight: '700' },
  streakMessage: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  streakBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(201,168,76,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  streakBadgeText: { fontSize: 18 },
  streakBarTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2, overflow: 'hidden',
  },
  streakBarFill: { height: 4, borderRadius: 2 },
  streakMilestoneLabel: { fontSize: 11, color: Colors.textDisabled },
  shareProgressBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  shareProgressText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.gold,
    opacity: 0.75,
    letterSpacing: 0.3,
  },

  planCard: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.borderGold,
    padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm,
  },
  planTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planPhaseLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  planPhaseEmoji: { fontSize: 28 },
  planPhaseEyebrow: { fontSize: 9, color: Colors.textDisabled, letterSpacing: 1.5, fontWeight: '700' },
  planPhaseName: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700' },
  planPct: { fontSize: 28, color: Colors.gold, fontWeight: '800' },

  planBarWrapper: { paddingVertical: 4 },
  planBarTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4, overflow: 'visible', position: 'relative',
  },
  planBarFill: {
    height: 8, backgroundColor: Colors.gold,
    borderRadius: 4, position: 'absolute', left: 0, top: 0,
  },
  planMarker: {
    position: 'absolute', top: -3,
    width: 2, height: 14, backgroundColor: Colors.border,
    marginLeft: -1,
  },
  planMarkerPassed: { backgroundColor: Colors.gold },

  planPhaseLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 0 },
  planPhaseLabel: { fontSize: 16, opacity: 0.3 },
  planPhaseLabelActive: { opacity: 1 },

  planStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  planStat: { alignItems: 'center', gap: 2 },
  planStatValue: { fontSize: 15, color: Colors.textPrimary, fontWeight: '700' },
  planStatLabel: { fontSize: 10, color: Colors.textSecondary },
  planStatSep: { width: 1, height: 28, backgroundColor: Colors.border },

  planMsg: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
  planNext: { fontSize: 11, color: Colors.textDisabled },

  // Skeleton loader (shown while allLogs loads)
  skeletonLine: { height: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, width: '40%' },
  skeletonChart: { height: 180, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.md },
  skeletonStatsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: Spacing.xs },
  skeletonStat: { height: 32, width: 60, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 4 },
})

const celebStyles = StyleSheet.create({
  overlay: { flex: 1 },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: { position: 'absolute', fontSize: 22 },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.gold,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    width: 300,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  moon: { fontSize: 52 },
  title: { fontSize: 26, color: Colors.gold, fontFamily: Fonts.heading, letterSpacing: 0.5 },
  name: { fontSize: 16, color: Colors.textPrimary, fontWeight: '600' },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  divider: { width: 40, height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  streakMsg: { fontSize: 15, color: Colors.gold, fontWeight: '700', textAlign: 'center' },
  hint: { fontSize: 12, color: Colors.textDisabled, textAlign: 'center', fontStyle: 'italic' },
})
