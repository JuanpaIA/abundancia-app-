import React, { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { ScreenBackground } from '../components/ui/ScreenBackground'
import { useFrequencyPlayerContext } from '../contexts/FrequencyPlayerContext'
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

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  onBack: () => void
  todayHz?: number
}

export function FrequenciesScreen({ onBack, todayHz }: Props) {
  const insets = useSafeAreaInsets()
  const { playing, activeHz, toggle } = useFrequencyPlayerContext()
  const { reportError } = useErrorReporter('frequencies')
  const [overlayFreq, setOverlayFreq] = useState<FrequencyDef | null>(null)

  const todayFreq = FREQUENCIES.find(f => f.hz === todayHz) ?? FREQUENCIES.find(f => f.hz === 528)!
  const library   = FREQUENCIES.filter(f => f.hz !== todayFreq.hz)

  async function handlePlay(hz: number, label: string) {
    try {
      await toggle(hz, label)
    } catch (e) {
      reportError(e, { hz, action: 'play_frequency' })
    }
  }

  return (
    <View style={styles.container}>
      <ScreenBackground />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.back}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sonido</Text>
          <Text style={styles.subtitle}>Frecuencias Solfeggio para tu manifestación</Text>
        </View>

        {/* ── Frecuencia del día — destacada ── */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>TU FRECUENCIA DE HOY</Text>
        </View>

        <TouchableOpacity
          style={styles.featuredCard}
          activeOpacity={0.88}
          onPress={() => setOverlayFreq(todayFreq)}
        >
          {/* Glow border */}
          <View style={[styles.featuredStripe, { backgroundColor: todayFreq.color }]} />

          <View style={styles.featuredBody}>
            {/* Hz */}
            <View style={styles.featuredHzRow}>
              <Text style={[styles.featuredHz, { color: todayFreq.color }]}>{todayFreq.hz}</Text>
              <Text style={[styles.featuredHzUnit, { color: todayFreq.color }]}>Hz</Text>
            </View>
            <Text style={styles.featuredName}>{todayFreq.name}</Text>
            <Text style={styles.featuredTagline}>{todayFreq.tagline}</Text>

            {/* Waveform static bars */}
            <View style={styles.featuredWave}>
              {[8, 16, 28, 40, 52, 44, 56, 48, 36, 26, 38, 52, 44, 30, 20, 32, 46, 36, 22, 12].map((h, i) => (
                <View
                  key={i}
                  style={[styles.featuredWaveBar, {
                    height: h,
                    backgroundColor: todayFreq.color,
                    opacity: activeHz === todayFreq.hz ? 0.85 : 0.28,
                  }]}
                />
              ))}
            </View>

            {/* Play button */}
            <View style={styles.featuredControls}>
              <TouchableOpacity
                style={[
                  styles.featuredPlayBtn,
                  { borderColor: todayFreq.color },
                  activeHz === todayFreq.hz && { backgroundColor: todayFreq.color },
                ]}
                onPress={() => handlePlay(todayFreq.hz, todayFreq.name)}
                activeOpacity={0.8}
              >
                <Text style={[styles.featuredPlayIcon, activeHz === todayFreq.hz && styles.featuredPlayIconActive]}>
                  {activeHz === todayFreq.hz ? '■' : '▶'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.featuredWhen}>{todayFreq.when}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* ── Biblioteca ── */}
        <View style={[styles.sectionLabel, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionLabelText}>BIBLIOTECA</Text>
        </View>

        <View style={styles.libraryList}>
          {library.map(freq => {
            const isPlaying = activeHz === freq.hz
            return (
              <TouchableOpacity
                key={freq.hz}
                style={styles.libraryRow}
                onPress={() => setOverlayFreq(freq)}
                activeOpacity={0.75}
              >
                {/* Hz badge */}
                <View style={[styles.libraryBadge, { backgroundColor: freq.color + '20', borderColor: freq.color + '55' }]}>
                  <Text style={[styles.libraryHz, { color: freq.color }]}>{freq.hz}</Text>
                  <Text style={[styles.libraryHzUnit, { color: freq.color }]}>Hz</Text>
                </View>

                {/* Name + tagline */}
                <View style={styles.libraryMeta}>
                  <Text style={styles.libraryName}>{freq.name}</Text>
                  <Text style={styles.libraryTagline} numberOfLines={2}>{freq.tagline}</Text>
                </View>

                {/* Play */}
                <TouchableOpacity
                  style={[styles.libraryPlayBtn, { borderColor: freq.color + '66' }, isPlaying && { backgroundColor: freq.color }]}
                  onPress={() => handlePlay(freq.hz, freq.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.libraryPlayIcon, isPlaying && styles.libraryPlayIconActive]}>
                    {isPlaying ? '■' : '▶'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {overlayFreq && (
        <FrequencyPlayerOverlay
          hz={overlayFreq.hz}
          name={overlayFreq.name}
          purpose={overlayFreq.purpose}
          when={overlayFreq.when}
          howTo={overlayFreq.howTo}
          integration={overlayFreq.integration}
          duration={overlayFreq.duration}
          color={overlayFreq.color}
          playing={activeHz === overlayFreq.hz}
          onToggle={() => handlePlay(overlayFreq.hz, overlayFreq.name)}
          onClose={() => setOverlayFreq(null)}
        />
      )}
    </View>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: 64 },

  header: { marginBottom: Spacing.lg, gap: Spacing.xs },
  back:     { color: Colors.purple, fontSize: 15, marginBottom: Spacing.sm },
  title:    { fontSize: 28, color: Colors.textPrimary, fontFamily: Fonts.headingSemiBold },
  subtitle: { fontSize: 17, color: Colors.textSecondary },

  sectionLabel: { marginBottom: Spacing.sm },
  sectionLabelText: {
    fontSize: 11, color: Colors.textDim, fontFamily: Fonts.bodySemiBold,
    letterSpacing: 1.6, textTransform: 'uppercase',
  },

  // ── Featured card ────────────────────────────────────────────────────────────
  featuredCard: {
    backgroundColor: Colors.surface1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderPurple,
    overflow: 'hidden',
    shadowColor: Colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 6,
  },
  featuredStripe: {
    height: 3,
    width: '100%',
  },
  featuredBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  featuredHzRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  featuredHz: {
    fontFamily: Fonts.heading,
    fontSize: 56,
    lineHeight: 60,
    includeFontPadding: false,
  },
  featuredHzUnit: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 18,
    marginBottom: 6,
  },
  featuredName: {
    fontFamily: Fonts.headingItalic,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  featuredTagline: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  featuredWave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 60,
    marginVertical: Spacing.sm,
  },
  featuredWaveBar: {
    width: 3,
    borderRadius: 2,
  },
  featuredControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  featuredPlayBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  featuredPlayIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
  },
  featuredPlayIconActive: {
    color: Colors.background,
  },
  featuredWhen: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // ── Library list ─────────────────────────────────────────────────────────────
  libraryList: {
    gap: 2,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface1,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.smMd,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  libraryBadge: {
    width: 52, height: 52, borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    gap: 0,
  },
  libraryHz: {
    fontSize: 17, fontWeight: '800', lineHeight: 20,
  },
  libraryHzUnit: {
    fontSize: 9, fontWeight: '600', opacity: 0.8,
  },
  libraryMeta: {
    flex: 1,
    gap: 2,
  },
  libraryName: {
    fontSize: 17, color: Colors.textPrimary, fontFamily: Fonts.bodyMedium,
  },
  libraryTagline: {
    fontSize: 13, color: Colors.textDim,
  },
  libraryPlayBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  libraryPlayIcon: {
    fontSize: 12, color: Colors.textSecondary,
  },
  libraryPlayIconActive: {
    color: Colors.background,
  },
})
