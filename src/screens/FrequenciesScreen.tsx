import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { useFrequencyPlayer } from '../hooks/useFrequencyPlayer'
import { useErrorReporter } from '../hooks/useErrorReporter'
import { FrequencyPlayerOverlay } from '../components/overlays/FrequencyPlayerOverlay'

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
    purpose: 'La frecuencia de base del sistema Solfeggio. Nombrada en la tradición como el tono del anclaje y la quietud. Utilizada en sesiones de meditación y relajación profunda como punto de partida antes de explorar tonos más altos.',
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
    tagline: 'Renovación y retorno al equilibrio',
    purpose: 'Segunda frecuencia del sistema Solfeggio. Conocida en la tradición como el tono de la renovación. Utilizada en sesiones de bienestar orientadas al descanso profundo y el restablecimiento del equilibrio.',
    when: '☀️ Mañana · antes del desayuno',
    howTo: 'Escúchala con los ojos cerrados. Coloca una mano en el pecho y otra en el abdomen. Visualiza una luz verde suave que recorre tu cuerpo y disuelve la tensión acumulada en cada parte.',
    integration: 'Combínala con tu ritual del día en fases de Luna menguante, cuando el foco está en la liberación y el cierre de ciclos.',
    duration: '10–15 min',
    color: '#4CAF82',
    areas: ['salud', 'amor'],
  },
  {
    hz: 396,
    name: 'Liberación del miedo',
    tagline: 'Para soltar lo que pesa antes de declarar intenciones',
    purpose: 'Primera frecuencia del sistema Solfeggio clásico. Nombrada en la tradición como el tono de la liberación. Se usa habitualmente al inicio de una sesión, como preparación antes de declarar intenciones.',
    when: '☀️ Mañana · antes de iniciar el día',
    howTo: 'Siéntate en silencio, cierra los ojos y respira profundo. Visualiza que una ola de luz dorada disuelve todo miedo, culpa o tensión acumulada. No fuerces nada — permanece en quietud con la intención activa.',
    integration: 'Combínala con tu ritual del día para preparar el campo interior antes de declarar tus intenciones.',
    duration: '10–15 min',
    color: '#E05555',
    areas: ['dinero', 'proposito', 'felicidad'],
  },
  {
    hz: 417,
    name: 'Facilitar el cambio',
    tagline: 'Para momentos de tránsito y nuevo comienzo',
    purpose: 'Segunda frecuencia Solfeggio en la escala clásica. Nombrada en la tradición como el tono del cambio y el movimiento. Se usa en momentos de transición o al iniciar una nueva etapa del plan.',
    when: '🌤️ Tarde · en un momento de pausa',
    howTo: 'Ponla de fondo mientras revisas tu objetivo del día. Escribe en un papel lo que deseas cambiar o destrabar. Nombra en voz alta lo que estás listo/a para mover.',
    integration: 'Escúchala justo antes de ejecutar tu objetivo diario, especialmente en días donde la acción se siente difícil de iniciar.',
    duration: '10–20 min',
    color: '#F59E0B',
    areas: ['dinero', 'proposito'],
  },
  {
    hz: 432,
    name: 'Expansión natural',
    tagline: 'La frecuencia de la naturaleza y el equilibrio',
    purpose: 'Frecuencia alternativa de afinación musical, preferida por algunos músicos y practicantes de meditación como alternativa al estándar de 440 Hz. Utilizada como fondo sonoro durante el trabajo, el estudio o la lectura.',
    when: '🕐 Cualquier momento del día',
    howTo: 'Ponla como fondo de trabajo o estudio. No necesitas concentrarte en ella — deja que el entorno sonoro acompañe lo que ya estás haciendo.',
    integration: 'Ideal durante tu protocolo de tarde o mientras completas tu objetivo del día.',
    duration: '20–45 min',
    color: '#4CAF82',
    areas: ['salud', 'felicidad', 'proposito'],
  },
  {
    hz: 528,
    name: 'Transformación y amor',
    tagline: 'La frecuencia del milagro',
    purpose: 'La más conocida de las frecuencias Solfeggio. Llamada en la tradición "frecuencia del milagro". Ampliamente utilizada en prácticas de meditación, rituales de intención y sesiones de sonido.',
    when: '☀️ Mañana · durante tu ritual',
    howTo: 'Ponla de fondo mientras lees tu afirmación del día en voz alta. Repítela tres veces con convicción. Visualiza que cada célula de tu cuerpo vibra en la frecuencia del amor y la transformación.',
    integration: 'La combinación de tu afirmación del día + 528 Hz es uno de los rituales más completos del protocolo. No te saltes este momento.',
    duration: '10–15 min',
    color: '#C9A84C',
    areas: ['amor', 'salud', 'dinero', 'proposito', 'felicidad'],
  },
  {
    hz: 639,
    name: 'Conexión y relaciones',
    tagline: 'Para sesiones orientadas al vínculo y la conexión',
    purpose: 'Cuarta frecuencia del sistema Solfeggio. Nombrada en la tradición como el tono de la conexión y el vínculo. Utilizada en meditaciones relacionadas con el amor propio, las relaciones y la comunicación.',
    when: '🌙 Noche · como cierre del día',
    howTo: 'Escúchala tumbado/a o sentado/a. Visualiza las personas y relaciones que deseas fortalecer. Siente amor genuino fluyendo desde tu corazón hacia ellas sin condición.',
    integration: 'Combínala con tu protocolo de noche para cerrar el día con intención de vínculo y apertura.',
    duration: '15–20 min',
    color: '#EC4899',
    areas: ['amor', 'felicidad'],
  },
  {
    hz: 741,
    name: 'Despertar la intuición',
    tagline: 'Para momentos de claridad y decisión',
    purpose: 'Quinta frecuencia Solfeggio. Conocida en la tradición como el tono de la expresión y la intuición. Utilizada en sesiones de meditación creativa y antes de momentos que requieren claridad y toma de decisión.',
    when: '☀️ Mañana · durante la meditación',
    howTo: 'Escúchala con los ojos cerrados. Plantéate una pregunta relacionada con tu objetivo y deja fluir ideas sin juzgarlas. Anota todo lo que llegue al final.',
    integration: 'Úsala antes de leer tu objetivo del día, en especial cuando la dirección a tomar no está clara.',
    duration: '10–15 min',
    color: '#7B3FD4',
    areas: ['proposito', 'dinero'],
  },
  {
    hz: 852,
    name: 'Orden espiritual',
    tagline: 'Vuelve a tu centro cuando te pierdes',
    purpose: 'Sexta frecuencia del sistema Solfeggio. Nombrada en la tradición como el tono del orden espiritual. Utilizada en prácticas contemplativas y al cerrar una sesión para volver al centro interior.',
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
    purpose: 'Frecuencia utilizada tradicionalmente en prácticas de meditación. La más alta del sistema Solfeggio, conocida en la tradición como el tono de la unidad.',
    when: '🌙 Noche · última actividad antes de dormir',
    howTo: 'Recuéstate, cierra los ojos y visualiza tu conciencia expandiéndose más allá del cuerpo. Siente que eres parte de algo mucho más grande que tú mismo. Deja ir el día con gratitud total.',
    integration: 'Es el cierre natural del protocolo nocturno. Úsala como última actividad antes de dormir.',
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
  const [overlayFreq, setOverlayFreq] = useState<{ hz: number; name: string; purpose: string } | null>(null)

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
    <View style={styles.container}>
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
                <View style={[styles.freqBody, { backgroundColor: freq.color + '10' }]}>
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

                  <TouchableOpacity
                    style={styles.overlayBtn}
                    onPress={() => setOverlayFreq({ hz: freq.hz, name: freq.name, purpose: freq.purpose })}
                  >
                    <Text style={styles.overlayBtnText}>✦ Abrir visualizador de frecuencia</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        })}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {overlayFreq && (
        <FrequencyPlayerOverlay
          hz={overlayFreq.hz}
          name={overlayFreq.name}
          purpose={overlayFreq.purpose}
          playing={playingHz === overlayFreq.hz}
          onToggle={() => handlePlay(overlayFreq.hz)}
          onClose={() => setOverlayFreq(null)}
        />
      )}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.card },
  scroll: { padding: Spacing.lg, paddingTop: 60, paddingBottom: 40 },

  header: { marginBottom: Spacing.lg, gap: Spacing.xs },
  back: { color: Colors.plum, fontSize: 15, marginBottom: Spacing.sm },
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
    backgroundColor: Colors.plumDim,
    borderWidth: 1, borderColor: Colors.borderPurple,
  },
  todayBadgeText: { fontSize: 12, color: Colors.plum, fontFamily: Fonts.bodySemiBold },

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
    backgroundColor: Colors.plum,
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
  freqSectionLabel: { fontSize: 11, color: Colors.plum, fontFamily: Fonts.bodySemiBold },
  freqSectionText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  freqAreas: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  freqAreaTag: {
    paddingHorizontal: Spacing.sm, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.border, backgroundColor: Colors.cardBg,
  },
  freqAreaText: { fontSize: 11, color: Colors.textSecondary },
  overlayBtn: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  overlayBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    color: Colors.plum,
  },
})
