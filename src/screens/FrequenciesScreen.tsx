import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { useFrequencyPlayer } from '../hooks/useFrequencyPlayer'
import { useErrorReporter } from '../hooks/useErrorReporter'

// ─── Catálogo de frecuencias ──────────────────────────────────────────────────

interface FrequencyDef {
  hz: number
  name: string
  tagline: string
  purpose: string
  when: string
  howTo: string
  integration: string
  duration: string
  color: string
  areas: string[]
}

const FREQUENCIES: FrequencyDef[] = [
  {
    hz: 174,
    name: 'Anclaje y seguridad',
    tagline: 'La frecuencia más baja — la más terrena',
    purpose: 'Reduce el estrés profundo y el dolor emocional. Ancla tu energía al presente cuando sientes miedo, incertidumbre o agotamiento. Es la base sobre la que se construye todo lo demás.',
    when: '🌙 Noche · al sentir ansiedad o agotamiento',
    howTo: 'Recuéstate y pon la frecuencia en volumen bajo. Siente el peso de tu cuerpo sobre la superficie. Respira 4 tiempos por nariz, 6 por boca. Deja que tu sistema nervioso se calme solo.',
    integration: 'Úsala cuando un día difícil amenaza con romper tu racha. Es el reset que te permite volver al protocolo sin culpa.',
    duration: '15–20 min',
    color: '#6B7280',
    areas: ['salud', 'felicidad'],
  },
  {
    hz: 285,
    name: 'Regeneración celular',
    tagline: 'Sanación desde adentro hacia afuera',
    purpose: 'Activa el potencial de regeneración del organismo. Especialmente efectiva para sanar patrones emocionales repetitivos y heridas antiguas que bloquean la manifestación.',
    when: '☀️ Mañana · antes del desayuno',
    howTo: 'Escúchala con los ojos cerrados. Coloca una mano en el pecho y otra en el abdomen. Visualiza una luz verde suave que recorre y sana cada órgano, cada célula, cada memoria dolorosa.',
    integration: 'Combínala con tu ritual del día en fases de sanación (Luna menguante). Potencia la liberación de patrones que frenan tu manifestación.',
    duration: '10–15 min',
    color: '#4CAF82',
    areas: ['salud', 'amor'],
  },
  {
    hz: 396,
    name: 'Liberación del miedo',
    tagline: 'Disuelve culpa, miedo y bloqueos internos',
    purpose: 'La primera frecuencia Solfeggio. Libera el miedo y la culpa acumulados — las dos emociones que más bloquean la manifestación. Limpia el campo energético para recibir.',
    when: '☀️ Mañana · antes de iniciar el día',
    howTo: 'Siéntate en silencio, cierra los ojos y respira profundo. Visualiza que una ola de luz dorada disuelve todo miedo, culpa o tensión acumulada. No fuerces nada — deja que la frecuencia haga el trabajo.',
    integration: 'Combínala con tu ritual del día para potenciar la liberación energética antes de declarar tus intenciones.',
    duration: '10–15 min',
    color: '#E05555',
    areas: ['dinero', 'proposito', 'felicidad'],
  },
  {
    hz: 417,
    name: 'Facilitar el cambio',
    tagline: 'Desbloquea situaciones estancadas',
    purpose: 'Activa el cambio y disuelve situaciones enquistadas. Si sientes que algo en tu vida no avanza — trabajo, relaciones, salud — esta frecuencia rompe la inercia y abre posibilidades.',
    when: '🌤️ Tarde · en un momento de pausa',
    howTo: 'Ponla de fondo mientras revisas tu objetivo del día. Escribe en un papel lo que deseas cambiar o destrabar. Permite que la frecuencia abra caminos donde antes veías obstáculos.',
    integration: 'Escúchala justo antes de ejecutar tu objetivo diario para desbloquear la energía y entrar en acción con mayor fluidez.',
    duration: '10–20 min',
    color: '#F59E0B',
    areas: ['dinero', 'proposito'],
  },
  {
    hz: 432,
    name: 'Expansión natural',
    tagline: 'La frecuencia de la naturaleza y el equilibrio',
    purpose: 'Frecuencia de sintonización con la naturaleza. Reduce la ansiedad, mejora la concentración y crea un estado de fluidez natural. La mente se expande sin esfuerzo.',
    when: '🕐 Cualquier momento del día',
    howTo: 'Ponla como fondo de trabajo o estudio. No necesitas concentrarte en ella — actúa en silencio sobre tu sistema nervioso, mejorando concentración y calma natural.',
    integration: 'Ideal durante tu protocolo de tarde o mientras completas tu objetivo del día. Su efecto es acumulativo.',
    duration: '20–45 min',
    color: '#4CAF82',
    areas: ['salud', 'felicidad', 'proposito'],
  },
  {
    hz: 528,
    name: 'Transformación y amor',
    tagline: 'La frecuencia del milagro',
    purpose: 'La frecuencia más estudiada del sistema Solfeggio. Conocida como la "frecuencia del milagro" — repara el ADN según algunos estudios, y activa el amor incondicional como campo de manifestación.',
    when: '☀️ Mañana · durante tu ritual',
    howTo: 'Ponla de fondo mientras lees tu afirmación del día en voz alta. Repítela tres veces con convicción. Visualiza que cada célula de tu cuerpo vibra en la frecuencia del amor y la transformación.',
    integration: 'La combinación de tu afirmación del día + 528 Hz crea uno de los campos de manifestación más potentes del protocolo. No te saltes este momento.',
    duration: '10–15 min',
    color: '#C9A84C',
    areas: ['amor', 'salud', 'dinero', 'proposito', 'felicidad'],
  },
  {
    hz: 639,
    name: 'Conexión y relaciones',
    tagline: 'Armoniza vínculos y atrae amor',
    purpose: 'Fortalece y armoniza las relaciones existentes. Atrae nuevas conexiones auténticas. Trabaja sobre la capacidad de amar, ser amado y comunicarse desde la verdad.',
    when: '🌙 Noche · como cierre del día',
    howTo: 'Escúchala tumbado/a o sentado/a. Visualiza las personas y relaciones que deseas fortalecer. Siente amor genuino fluyendo desde tu corazón hacia ellas sin condición.',
    integration: 'Combínala con tu protocolo de noche. Cerrar el día en esta frecuencia programa tu mente inconsciente para atraer conexiones auténticas mientras duermes.',
    duration: '15–20 min',
    color: '#EC4899',
    areas: ['amor', 'felicidad'],
  },
  {
    hz: 741,
    name: 'Despertar la intuición',
    tagline: 'Activa la mente y la creatividad',
    purpose: 'Expande la conciencia, despierta la intuición y potencia la creatividad. Ideal cuando necesitas claridad mental, tomar una decisión importante o encontrar la solución a un problema.',
    when: '☀️ Mañana · durante la meditación',
    howTo: 'Escúchala con los ojos cerrados. Plantéate una pregunta relacionada con tu objetivo y deja fluir ideas sin juzgarlas. Anota todo lo que llegue al final.',
    integration: 'Úsala antes de leer tu objetivo del día para activar tu capacidad de encontrar soluciones creativas. La claridad que genera potencia cada acción que tomes después.',
    duration: '10–15 min',
    color: '#7B3FD4',
    areas: ['proposito', 'dinero'],
  },
  {
    hz: 852,
    name: 'Orden espiritual',
    tagline: 'Vuelve a tu centro cuando te pierdes',
    purpose: 'Reconecta con tu intuición más profunda y tu propósito auténtico. Ideal cuando sientes que vas en la dirección equivocada o necesitas escuchar tu voz interior por encima del ruido externo.',
    when: '🌤️ Tarde · pausa de 10 minutos',
    howTo: 'Detente. Cierra los ojos. Pregúntate en silencio: ¿Qué señal del universo he ignorado hoy? Escucha sin forzar respuestas. La intuición habla en susurros.',
    integration: 'Combínala con tu afirmación del día: léela primero, luego escucha la frecuencia 10 minutos con esa intención activa en la mente.',
    duration: '10–15 min',
    color: '#8B9CF4',
    areas: ['proposito', 'felicidad'],
  },
  {
    hz: 963,
    name: 'Conexión con el todo',
    tagline: 'La frecuencia más alta del sistema',
    purpose: 'La frecuencia más elevada del sistema Solfeggio. Activa la glándula pineal y abre la conexión con la conciencia superior. Ideal para estados contemplativos profundos y para programar el subconsciente.',
    when: '🌙 Noche · última actividad antes de dormir',
    howTo: 'Recuéstate, cierra los ojos y visualiza tu conciencia expandiéndose más allá del cuerpo. Siente que eres parte de algo mucho más grande que tú mismo. Deja ir el día con gratitud total.',
    integration: 'Es el cierre perfecto de tu protocolo nocturno. Entrar al sueño en esta frecuencia programa tu subconsciente para recibir orientación y consolidar lo manifestado durante el día.',
    duration: '15–20 min',
    color: '#C9A84C',
    areas: ['proposito', 'felicidad', 'salud'],
  },
]

const AREA_LABELS: Record<string, string> = {
  dinero: '💰 Dinero', amor: '💗 Amor', salud: '✨ Salud',
  proposito: '🔮 Propósito', felicidad: '🌟 Felicidad',
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void
  todayHz?: number
}

export function FrequenciesScreen({ onBack, todayHz }: Props) {
  const { playing, play } = useFrequencyPlayer()
  const { reportError } = useErrorReporter('frequencies')
  const [playingHz, setPlayingHz] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(todayHz ?? null)

  async function handlePlay(hz: number) {
    try {
      if (playingHz === hz) {
        await play(hz)
        setPlayingHz(null)
      } else {
        if (playingHz !== null) await play(playingHz)
        await play(hz)
        setPlayingHz(playing ? null : hz)
      }
    } catch (e) {
      reportError(e, { hz, action: 'play_frequency' })
    }
  }

  // Determinar Hz activo basado en estado del player
  const activeHz = playing ? playingHz : null

  return (
    <LinearGradient
      colors={['#16102a', '#0e0b1e', '#0a0814']}
      locations={[0, 0.4, 1]}
      style={styles.container}
    >
      {/* @ts-ignore */}
      <View style={styles.noiseBg} aria-hidden />
      <View style={styles.orbPurple} aria-hidden />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Biblioteca de Frecuencias</Text>
          <Text style={styles.subtitle}>10 frecuencias Solfeggio para tu manifestación</Text>
        </View>

        {/* Info general */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Las frecuencias Solfeggio son tonos específicos que interactúan con el sistema nervioso y el campo energético. Escúchalas con auriculares para maximizar el efecto. No requieren atención consciente — trabajan mientras tú simplemente estás presente.
          </Text>
        </View>

        {/* Frecuencia del día */}
        {todayHz && (
          <View style={styles.todayBadgeRow}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>✦ Tu frecuencia de hoy: {todayHz} Hz</Text>
            </View>
          </View>
        )}

        {/* Lista de frecuencias */}
        {FREQUENCIES.map(freq => {
          const isToday = freq.hz === todayHz
          const isPlaying = activeHz === freq.hz
          const isOpen = expanded === freq.hz

          return (
            <View key={freq.hz} style={[styles.freqCard, isToday && styles.freqCardToday, isPlaying && { borderColor: freq.color + '99' }]}>
              {/* Franja de color izquierda */}
              <View style={[styles.freqStripe, { backgroundColor: freq.color }]} />

              {/* Cabecera */}
              <TouchableOpacity
                style={styles.freqHeader}
                onPress={() => setExpanded(isOpen ? null : freq.hz)}
                activeOpacity={0.8}
              >
                <View style={[styles.freqHzBadge, { backgroundColor: freq.color + '22', borderColor: freq.color + '55' }]}>
                  <Text style={[styles.freqHzText, { color: freq.color }]}>{freq.hz}</Text>
                  <Text style={[styles.freqHzUnit, { color: freq.color }]}>Hz</Text>
                </View>
                <View style={styles.freqTitleBlock}>
                  <View style={styles.freqNameRow}>
                    <Text style={styles.freqName}>{freq.name}</Text>
                    {isToday && <View style={styles.todayDot} />}
                  </View>
                  <Text style={styles.freqTagline}>{freq.tagline}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.playBtn, { borderColor: freq.color + '88' }, isPlaying && { backgroundColor: freq.color }]}
                  onPress={() => handlePlay(freq.hz)}
                >
                  <Text style={[styles.playIcon, isPlaying && { color: Colors.background }]}>
                    {isPlaying ? '■' : '▶'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Onda visual cuando está expandida */}
              {isOpen && (
                <View style={styles.freqWave}>
                  {[4, 8, 14, 20, 16, 22, 12, 18, 8, 20, 14, 10, 18, 6, 14].map((h, i) => (
                    <View
                      key={i}
                      style={[styles.freqWaveBar, {
                        height: h,
                        backgroundColor: freq.color,
                        opacity: isPlaying ? 0.85 : 0.22,
                      }]}
                    />
                  ))}
                </View>
              )}

              {/* Contenido expandido */}
              {isOpen && (
                <LinearGradient
                  colors={[freq.color + '12', 'transparent']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.freqBody}
                >
                  <Text style={styles.freqPurpose}>{freq.purpose}</Text>

                  <View style={styles.freqMeta}>
                    <View style={styles.freqMetaItem}>
                      <Text style={styles.freqMetaLabel}>Cuándo</Text>
                      <Text style={styles.freqMetaValue}>{freq.when}</Text>
                    </View>
                    <View style={styles.freqMetaItem}>
                      <Text style={styles.freqMetaLabel}>Duración</Text>
                      <Text style={styles.freqMetaValue}>⏱ {freq.duration}</Text>
                    </View>
                  </View>

                  <View style={styles.freqSection}>
                    <Text style={styles.freqSectionLabel}>🎧 Cómo practicarla</Text>
                    <Text style={styles.freqSectionText}>{freq.howTo}</Text>
                  </View>

                  <View style={[styles.freqSection, styles.freqIntegration]}>
                    <Text style={styles.freqSectionLabel}>✦ Integración con tu plan</Text>
                    <Text style={styles.freqSectionText}>{freq.integration}</Text>
                  </View>

                  <View style={styles.freqAreas}>
                    {freq.areas.map(a => (
                      <View key={a} style={styles.freqAreaTag}>
                        <Text style={styles.freqAreaText}>{AREA_LABELS[a]}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              )}
            </View>
          )
        })}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const NOISE_URI = `data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(#n)' opacity='1'/></svg>")}`

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: 60, paddingBottom: 40 },

  // Atmospheric layers
  noiseBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.04,
    // @ts-ignore
    backgroundImage: `url("${NOISE_URI}")`,
    backgroundRepeat: 'repeat',
    pointerEvents: 'none',
  },
  orbPurple: {
    position: 'absolute', width: 300, height: 300, top: -60, right: -80, borderRadius: 999,
    // @ts-ignore
    background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 65%)',
    pointerEvents: 'none',
  },

  header: { marginBottom: Spacing.lg, gap: Spacing.xs },
  back: { color: Colors.gold, fontSize: 15, marginBottom: Spacing.sm },
  title: { fontSize: 26, color: Colors.textPrimary, fontFamily: Fonts.headingSemiBold },
  subtitle: { fontSize: 13, color: Colors.textSecondary },

  infoCard: {
    backgroundColor: Colors.goldDim, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.borderGold,
    padding: Spacing.md, marginBottom: Spacing.lg,
  },
  infoText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  todayBadgeRow: { marginBottom: Spacing.md },
  todayBadge: {
    alignSelf: 'flex-start', paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs, borderRadius: Radius.full,
    backgroundColor: Colors.purpleDim,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.30)',
  },
  todayBadgeText: { fontSize: 12, color: Colors.purpleAccent, fontFamily: Fonts.bodySemiBold },

  freqCard: {
    backgroundColor: Colors.cardBg, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm, overflow: 'hidden', position: 'relative',
  },
  freqStripe: {
    position: 'absolute', top: 0, bottom: 0, left: 0, width: 4,
  },
  freqCardToday: { borderColor: Colors.borderGold },

  freqHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingLeft: Spacing.md + 4, paddingRight: Spacing.md,
    paddingVertical: Spacing.md, gap: Spacing.sm,
  },
  freqWave: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    paddingVertical: 10, paddingHorizontal: Spacing.md + 4, gap: 3,
  },
  freqWaveBar: { width: 3, borderRadius: 2 },
  freqHzBadge: {
    width: 56, height: 56, borderRadius: Radius.md,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  freqHzText: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  freqHzUnit: { fontSize: 10, fontWeight: '600', opacity: 0.8 },

  freqTitleBlock: { flex: 1, gap: 2 },
  freqNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  freqName: { fontSize: 14, color: Colors.textPrimary, fontWeight: '700' },
  todayDot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  freqTagline: { fontSize: 11, color: Colors.textSecondary },

  playBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  playIcon: { fontSize: 14, color: Colors.textPrimary },

  freqBody: {
    paddingHorizontal: Spacing.md, paddingBottom: Spacing.md,
    gap: Spacing.md, borderTopWidth: 0.5, borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  freqPurpose: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  freqMeta: { flexDirection: 'row', gap: Spacing.md },
  freqMetaItem: { flex: 1, gap: 3 },
  freqMetaLabel: { fontSize: 10, color: Colors.textDisabled, textTransform: 'uppercase', letterSpacing: 0.8 },
  freqMetaValue: { fontSize: 12, color: Colors.textSecondary },

  freqSection: { gap: 6 },
  freqIntegration: {
    backgroundColor: Colors.goldDim, borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.borderGold,
  },
  freqSectionLabel: { fontSize: 11, color: Colors.gold, fontFamily: Fonts.bodySemiBold },
  freqSectionText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  freqAreas: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  freqAreaTag: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.cardBg,
  },
  freqAreaText: { fontSize: 11, color: Colors.textSecondary },
})
