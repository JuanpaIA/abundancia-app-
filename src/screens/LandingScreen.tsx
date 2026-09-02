import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, TouchableOpacity, Animated, Platform,
} from 'react-native'
import { useState, useRef, useEffect } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Colors, Spacing, Radius, Fonts } from '../constants/theme'
import { GradientButton } from '../components/ui/GradientButton'

const planBenefits = [
  'Protocolo diario 100% personalizado',
  'Rituales por fase lunar y área de manifestación',
  'Afirmaciones según tu número numerológico',
  'Color y alimentos vibracionales del día',
  'Frecuencias de manifestación con reproductor',
  'Protocolo mañana, tarde y noche',
  'Diario de manifestación',
  'Seguimiento de 9 hábitos diarios',
  'Portales energéticos y fases lunares',
  'Acceso web y móvil',
  'Actualizaciones constantes',
]

interface Props {
  onGetStarted: () => void
  onLogin: () => void
}

function Divider() {
  return <View style={s.divider} />
}

function SectionTag({ text }: { text: string }) {
  return (
    <View style={s.sectionTag}>
      <Text style={s.sectionTagText}>{text}</Text>
    </View>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <TouchableOpacity onPress={() => setOpen(!open)} style={s.faqItem} activeOpacity={0.8}>
      <View style={s.faqRow}>
        <Text style={s.faqQ}>{q}</Text>
        <Text style={s.faqChevron}>{open ? '−' : '+'}</Text>
      </View>
      {open && <Text style={s.faqA}>{a}</Text>}
    </TouchableOpacity>
  )
}

function MockDashboard() {
  return (
    <View style={mock.phone}>
      <View style={mock.phoneBrow} />
      <View style={mock.header}>
        <Text style={mock.greeting}>Hola, María ✦</Text>
        <Text style={mock.sub}>Día 14 · Luna Nueva 🌑</Text>
      </View>
      {[
        { done: true,  label: '🌅 Ritual de mañana' },
        { done: true,  label: '🎵 Frecuencia 528 Hz' },
        { done: false, label: '✨ Afirmación del día' },
        { done: false, label: '🌿 Color: Dorado' },
        { done: false, label: '🥑 Alimento clave' },
        { done: false, label: '🌙 Ritual de noche' },
      ].map((t, i) => (
        <View key={i} style={mock.taskRow}>
          <View style={[mock.box, t.done && mock.boxDone]}>
            {t.done && <Text style={mock.check}>✓</Text>}
          </View>
          <Text style={[mock.taskText, t.done && mock.taskDone]}>{t.label}</Text>
        </View>
      ))}
    </View>
  )
}

function MockProfile() {
  return (
    <View style={mock.phone}>
      <View style={mock.phoneBrow} />
      <Text style={mock.screenTitle}>Tu Perfil Energético</Text>
      <View style={mock.numCard}>
        <Text style={mock.numBig}>7</Text>
        <View style={mock.numRight}>
          <Text style={mock.numArch}>El Místico</Text>
          <View style={mock.chipRow}>
            {['Intuición', 'Análisis', 'Sabiduría'].map(c => (
              <View key={c} style={mock.chip}><Text style={mock.chipText}>{c}</Text></View>
            ))}
          </View>
        </View>
      </View>
      <View style={mock.infoRow}><Text style={mock.infoLabel}>Signo zodiacal</Text><Text style={mock.infoVal}>Escorpio ♏</Text></View>
      <View style={mock.infoRow}><Text style={mock.infoLabel}>Área principal</Text><Text style={mock.infoVal}>💰 Dinero</Text></View>
      <View style={mock.infoRow}><Text style={mock.infoLabel}>Frecuencia base</Text><Text style={mock.infoVal}>432 Hz</Text></View>
    </View>
  )
}

function MockFrequency() {
  return (
    <View style={mock.phone}>
      <View style={mock.phoneBrow} />
      <Text style={mock.screenTitle}>Frecuencias</Text>
      {[
        { hz: '396 Hz', label: 'Liberar bloqueos' },
        { hz: '528 Hz', label: 'Amor y sanación' },
        { hz: '741 Hz', label: 'Intuición y verdad' },
      ].map((f, i) => (
        <View key={i} style={[mock.freqRow, i === 1 && mock.freqRowActive]}>
          <View style={mock.freqInfo}>
            <Text style={[mock.freqHz, i === 1 && mock.freqHzActive]}>{f.hz}</Text>
            <Text style={mock.freqLabel}>{f.label}</Text>
          </View>
          <View style={[mock.playBtn, i === 1 && mock.playBtnActive]}>
            <Text style={[mock.playIcon, i === 1 && mock.playIconActive]}>
              {i === 1 ? '▮▮' : '▶'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

function MockJournal() {
  return (
    <View style={mock.phone}>
      <View style={mock.phoneBrow} />
      <Text style={mock.screenTitle}>Diario · Viernes 8</Text>
      {[
        { time: '🌅 Mañana', note: 'Hoy declaro que el dinero fluye hacia mí con facilidad...', done: true },
        { time: '🌤 Tarde', note: 'Gratitud: inesperadamente conseguí un nuevo cliente hoy.', done: true },
        { time: '🌙 Noche', note: 'Escribe tu reflexión del día...', done: false },
      ].map((entry, i) => (
        <View key={i} style={[mock.journalEntry, entry.done && mock.journalEntryDone]}>
          <Text style={mock.journalTime}>{entry.time}</Text>
          <Text style={[mock.journalNote, !entry.done && mock.journalNotePlaceholder]} numberOfLines={2}>
            {entry.note}
          </Text>
        </View>
      ))}
      <View style={mock.signalBox}>
        <Text style={mock.signalLabel}>✦ Señal del día</Text>
        <Text style={mock.signalText}>Luna en Escorpio — ideal para soltar lo que ya no sirve</Text>
      </View>
    </View>
  )
}

function MockHabits() {
  return (
    <View style={mock.phone}>
      <View style={mock.phoneBrow} />
      <Text style={mock.screenTitle}>Mis hábitos · Semana 2</Text>
      {[
        { label: 'Ritual de mañana',   done: 6 },
        { label: 'Frecuencia diaria',  done: 5 },
        { label: 'Afirmación',         done: 7 },
        { label: 'Color del día',      done: 4 },
        { label: 'Alimento clave',     done: 3 },
      ].map((h, i) => (
        <View key={i} style={mock.habitRow}>
          <View style={mock.habitLeft}>
            <Text style={mock.habitLabel}>{h.label}</Text>
            <View style={mock.habitDots}>
              {Array.from({ length: 7 }).map((_, d) => (
                <View key={d} style={[mock.dot, d < h.done && mock.dotDone]} />
              ))}
            </View>
          </View>
          <Text style={[mock.habitCount, h.done >= 5 ? mock.habitCountGold : mock.habitCountWeak]}>
            {h.done}/7
          </Text>
        </View>
      ))}
    </View>
  )
}

function MockProgress() {
  return (
    <View style={mock.phone}>
      <View style={mock.phoneBrow} />
      <Text style={mock.screenTitle}>Mi progreso · Día 14</Text>

      {/* Círculo de progreso simulado */}
      <View style={mock.progressCircleBox}>
        <View style={mock.progressCircle}>
          <Text style={mock.progressPct}>78%</Text>
          <Text style={mock.progressPctLabel}>hoy</Text>
        </View>
        <View style={mock.progressMeta}>
          <Text style={mock.progressMetaVal}>🔥 14</Text>
          <Text style={mock.progressMetaLabel}>días seguidos</Text>
          <Text style={[mock.progressMetaVal, { marginTop: 8 }]}>⚡ 4.2</Text>
          <Text style={mock.progressMetaLabel}>energía semanal</Text>
        </View>
      </View>

      {/* Mini anillo semanal */}
      <View style={mock.weekRow}>
        {['L','M','M','J','V','S','D'].map((d, i) => (
          <View key={i} style={mock.weekDay}>
            <View style={[mock.weekDot, i < 5 && mock.weekDotDone, i === 4 && mock.weekDotToday]} />
            <Text style={mock.weekDayLabel}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={mock.streakBox}>
        <Text style={mock.streakText}>✦ Vas por tu mejor racha — no lo rompas hoy</Text>
      </View>
    </View>
  )
}

function MockPortals() {
  return (
    <View style={mock.phone}>
      <View style={mock.phoneBrow} />
      <Text style={mock.screenTitle}>Portales y Luna</Text>

      <View style={[mock.portalCard, mock.portalCardActive]}>
        <View style={mock.portalCardLeft}>
          <Text style={mock.portalEmoji}>🌕</Text>
          <View>
            <Text style={mock.portalName}>Luna Llena</Text>
            <Text style={mock.portalDate}>Hoy · Alta vibración</Text>
          </View>
        </View>
        <View style={mock.portalBadge}><Text style={mock.portalBadgeText}>ACTIVO</Text></View>
      </View>

      <View style={mock.portalCard}>
        <View style={mock.portalCardLeft}>
          <Text style={mock.portalEmoji}>🌀</Text>
          <View>
            <Text style={mock.portalName}>Portal 5/5</Text>
            <Text style={mock.portalDate}>En 3 días</Text>
          </View>
        </View>
        <View style={mock.portalBadgeInactive}><Text style={mock.portalBadgeInactiveText}>PRÓXIMO</Text></View>
      </View>

      <View style={mock.portalCard}>
        <View style={mock.portalCardLeft}>
          <Text style={mock.portalEmoji}>✨</Text>
          <View>
            <Text style={mock.portalName}>Portal 6/6</Text>
            <Text style={mock.portalDate}>En 34 días</Text>
          </View>
        </View>
        <View style={mock.portalBadgeInactive}><Text style={mock.portalBadgeInactiveText}>PRÓXIMO</Text></View>
      </View>

      <Text style={mock.portalHint}>Recibes una alerta el día antes de cada portal</Text>
    </View>
  )
}

function MockBadges() {
  return (
    <View style={mock.phone}>
      <View style={mock.phoneBrow} />
      <Text style={mock.screenTitle}>Mis insignias</Text>
      <View style={mock.badgesGrid}>
        {[
          { emoji: '🌙', name: 'Bienvenida', earned: true },
          { emoji: '🔥', name: '7 días', earned: true },
          { emoji: '⚡', name: 'Primer portal', earned: true },
          { emoji: '🌕', name: 'Luna llena', earned: true },
          { emoji: '💎', name: '30 días', earned: false },
          { emoji: '🌟', name: '90 días', earned: false },
        ].map((b, i) => (
          <View key={i} style={[mock.badgeItem, !b.earned && mock.badgeItemLocked]}>
            <Text style={[mock.badgeEmoji, !b.earned && mock.badgeEmojiLocked]}>{b.emoji}</Text>
            <Text style={[mock.badgeName, !b.earned && mock.badgeNameLocked]}>{b.name}</Text>
          </View>
        ))}
      </View>
      <View style={mock.badgeMotivation}>
        <Text style={mock.badgeMotivationText}>🏆 4 de 6 insignias desbloqueadas</Text>
      </View>
    </View>
  )
}

export function LandingScreen({ onGetStarted, onLogin }: Props) {
  // ── Animaciones ──
  const moonFloat   = useRef(new Animated.Value(0)).current
  const moonGlow    = useRef(new Animated.Value(0.4)).current
  const heroOpacity = useRef(new Animated.Value(0)).current
  const heroSlide   = useRef(new Animated.Value(40)).current
  const textOpacity = useRef(new Animated.Value(0)).current
  const ctaScale    = useRef(new Animated.Value(1)).current
  const testimonialsRef = useRef<ScrollView>(null)
  const testimonialIndex = useRef(0)
  const screensRef = useRef<ScrollView>(null)
  const screenIndex = useRef(0)

  useEffect(() => {
    // Hero entrance: luna → título → CTA en secuencia
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(heroSlide,   { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start()

    // Luna flotando suavemente
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonFloat, { toValue: -10, duration: 2200, useNativeDriver: true }),
        Animated.timing(moonFloat, { toValue: 0,   duration: 2200, useNativeDriver: true }),
      ])
    ).start()

    // Halo lunar pulsando
    Animated.loop(
      Animated.sequence([
        Animated.timing(moonGlow, { toValue: 0.9, duration: 1800, useNativeDriver: true }),
        Animated.timing(moonGlow, { toValue: 0.4, duration: 1800, useNativeDriver: true }),
      ])
    ).start()

    // CTA pulsando para llamar al clic
    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaScale, { toValue: 1.04, duration: 1000, useNativeDriver: true }),
        Animated.timing(ctaScale, { toValue: 1,    duration: 1000, useNativeDriver: true }),
      ])
    ).start()

    // Auto-scroll de testimonios cada 3s
    const testimonialInterval = setInterval(() => {
      testimonialIndex.current = (testimonialIndex.current + 1) % 5
      testimonialsRef.current?.scrollTo({ x: testimonialIndex.current * 254, animated: true })
    }, 3000)

    // Scroll continuo tipo ticker — 1.2px cada 20ms ≈ 60px/seg, ciclo ~26s
    const TOTAL_WIDTH = 8 * 232
    const screenInterval = setInterval(() => {
      screenIndex.current = screenIndex.current + 1.2
      if (screenIndex.current >= TOTAL_WIDTH) {
        screenIndex.current = 0
        screensRef.current?.scrollTo({ x: 0, animated: false })
      } else {
        screensRef.current?.scrollTo({ x: screenIndex.current, animated: false })
      }
    }, 20)

    return () => {
      clearInterval(testimonialInterval)
      clearInterval(screenInterval)
    }
  }, [])

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <View style={s.heroWrapper}>

          {/* Estrellas de fondo */}
          {[
            { top: 18,  left: '10%', size: 10, op: 0.15 },
            { top: 60,  left: '85%', size: 14, op: 0.20 },
            { top: 110, left: '5%',  size: 8,  op: 0.12 },
            { top: 160, left: '92%', size: 10, op: 0.18 },
            { top: 220, left: '15%', size: 6,  op: 0.10 },
            { top: 280, left: '78%', size: 12, op: 0.14 },
            { top: 320, left: '45%', size: 6,  op: 0.08 },
            { top: 380, left: '25%', size: 8,  op: 0.12 },
            { top: 420, left: '65%', size: 10, op: 0.16 },
          ].map((star, i) => (
            <Text key={i} style={{
              position: 'absolute', top: star.top, left: star.left as any,
              fontSize: star.size, color: Colors.gold, opacity: star.op,
            }}>✦</Text>
          ))}

          <Animated.View style={[s.hero, { opacity: heroOpacity, transform: [{ translateY: heroSlide }] }]}>

            {/* Brand */}
            <Text style={s.brandName}>Luumina</Text>
            <Text style={s.brandTagline}>sistema de manifestación personalizado</Text>

            {/* Orbes Trifuerza */}
            <View style={s.trifuerzaOrbs}>
              {[
                { icon: '🔢', label: 'Número', color: '#C9A84C' },
                { icon: '🌙', label: 'Luna',   color: '#9B7FD4' },
                { icon: '♏',  label: 'Zodiacal', color: '#4CAF82' },
              ].map((orb, i) => (
                <View key={i} style={s.orbWrapper}>
                  {i > 0 && <View style={s.orbConnector} />}
                  <Animated.View style={[
                    s.orb,
                    { borderColor: orb.color + '80', shadowColor: orb.color },
                    i === 1 && { transform: [{ translateY: moonFloat }] },
                  ]}>
                    <Text style={s.orbIcon}>{orb.icon}</Text>
                  </Animated.View>
                  <Text style={[s.orbLabel, { color: orb.color }]}>{orb.label}</Text>
                </View>
              ))}
            </View>

            {/* Título con gradiente */}
            <Animated.View style={{ opacity: textOpacity, alignItems: 'center', gap: 14, width: '100%' }}>
              <View style={s.heroTitleWrapper}>
                <Text style={s.heroTitlePlain}>¿Sigues manifestando</Text>
                <LinearGradient
                  colors={['#C9A84C', '#F0D080', '#C9A84C']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.heroTitleGradientBg}
                >
                  <Text style={s.heroTitleGradient}>en desorden?</Text>
                </LinearGradient>
              </View>

              <Text style={s.heroHook}>
                El universo responde a precisión, no a intención vaga.{' '}
                Luumina combina tu número, tu luna y tu signo para crear un protocolo único — tuyo — cada día.
              </Text>

              <Animated.View style={{ transform: [{ scale: ctaScale }], width: '100%' }}>
                <LinearGradient
                  colors={['#C9A84C', '#E8C060', '#C9A84C']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.ctaGradient}
                >
                  <TouchableOpacity onPress={onGetStarted} style={s.ctaInner} activeOpacity={0.85}>
                    <Text style={s.ctaText}>Crear mi protocolo ahora ✦</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>

              <TouchableOpacity onPress={onLogin} style={s.loginBtn}>
                <Text style={s.loginText}>Ya soy usuario activo → Iniciar sesión</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>

        <Divider />

        {/* ── PROBLEMA ── */}
        <SectionTag text="EL PROBLEMA" />
        <Text style={s.h2}>¿Por qué sigues repitiendo{'\n'}intenciones sin resultados?</Text>

        {[
          {
            icon: '🔁',
            title: 'Rituales copiados que no son tuyos',
            body: 'Sigues lo que hace otra persona. Pero su energía, su ciclo y su fecha de nacimiento no son los tuyos. Lo que la activa a ella puede bloquearte a ti.',
          },
          {
            icon: '📅',
            title: 'Sin estructura, la intención se evapora',
            body: 'Un ritual al azar, un día sí y tres no, sin seguimiento. La manifestación responde a la constancia, no a la intensidad de un momento.',
          },
          {
            icon: '🌙',
            title: 'Ignorar los ciclos lo hace todo más difícil',
            body: 'Hay momentos para sembrar, actuar y soltar. Si empujas cuando deberías descansar — o descansas cuando deberías moverte — gastas energía sin retorno.',
          },
        ].map((p, i) => (
          <View key={i} style={s.painCard}>
            <Text style={s.painIcon}>{p.icon}</Text>
            <View style={s.painBody}>
              <Text style={s.painTitle}>{p.title}</Text>
              <Text style={s.painText}>{p.body}</Text>
            </View>
          </View>
        ))}

        <Divider />

        {/* ── MECANISMO ÚNICO ── */}
        <SectionTag text="EL MECANISMO ÚNICO" />
        <Text style={s.h2}>El Sistema Trifuerza{'\n'}de Luumina</Text>
        <Text style={s.bodyText}>
          No hay otro sistema que combine estas tres variables para crear un protocolo diferente cada día, diseñado exclusivamente para ti.
        </Text>

        <View style={s.trifuerzaRow}>
          {[
            { icon: '🔢', title: 'Tu Número', sub: 'Numerología', desc: 'Tu número de vida determina tu arquetipo energético y tus afirmaciones diarias.' },
            { icon: '🌙', title: 'Tu Ciclo', sub: 'Fase Lunar', desc: 'Cada fase lunar define el tipo de acción: sembrar, crecer, soltar o integrar.' },
            { icon: '♏', title: 'Tu Signo', sub: 'Zodiacal', desc: 'Tu energía astrológica define tus frecuencias, colores y alimentos clave.' },
          ].map((item, i) => (
            <View key={i} style={s.trifuerzaCard}>
              <Text style={s.trifuerzaIcon}>{item.icon}</Text>
              <Text style={s.trifuerzaTitle}>{item.title}</Text>
              <Text style={s.trifuerzaSub}>{item.sub}</Text>
              <Text style={s.trifuerzaDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <View style={s.trifuerzaResult}>
          <Text style={s.trifuerzaResultText}>
            ✦ El resultado: un protocolo de 9 acciones diarias que ninguna otra persona en el mundo recibe igual que tú.
          </Text>
        </View>

        <View style={s.stepsContainer}>
          {[
            {
              num: '01',
              title: 'Tu perfil energético personal',
              body: 'Con tu nombre y fecha de nacimiento calculamos tu número numerológico, signo zodiacal y frecuencia base. Estas tres variables son la raíz de todo tu protocolo.',
            },
            {
              num: '02',
              title: 'Tu intención, tu área, tu plan',
              body: 'Defines qué quieres manifestar: dinero, amor, salud, propósito o felicidad. Contestas 3 preguntas personalizadas. El sistema sabe exactamente qué darte cada día.',
            },
            {
              num: '03',
              title: 'Un protocolo diferente cada día',
              body: 'Cada mañana recibes 9 acciones alineadas con la luna, tu energía y tu intención. Afirmaciones, rituales, frecuencias, colores, alimentos. Todo en un solo lugar.',
            },
          ].map((step) => (
            <View key={step.num} style={s.step}>
              <Text style={s.stepNum}>{step.num}</Text>
              <View style={s.stepContent}>
                <Text style={s.stepTitle}>{step.title}</Text>
                <Text style={s.stepBody}>{step.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Divider />

        {/* ── CAPTURAS ── */}
        <SectionTag text="LA APP POR DENTRO" />
        <Text style={s.h2}>Así se ve tu vida{'\n'}con Luumina — día a día</Text>
        <Text style={s.bodyText}>
          No es una app que abres una vez. Es un sistema que te acompaña cada día y construye el hábito que cambia todo — desliza para ver.
        </Text>

        <ScrollView
          ref={screensRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.screensRow}
          style={s.screensScroll}
        >
          <View style={s.screenCard}>
            <MockDashboard />
            <Text style={s.screenLabel}>Protocolo diario</Text>
            <Text style={s.screenDesc}>9 acciones personalizadas alineadas con tu luna y tu energía</Text>
          </View>
          <View style={s.screenCard}>
            <MockJournal />
            <Text style={s.screenLabel}>Diario de manifestación</Text>
            <Text style={s.screenDesc}>Intención en la mañana, gratitud al mediodía, reflexión en la noche</Text>
          </View>
          <View style={s.screenCard}>
            <MockProgress />
            <Text style={s.screenLabel}>Mapa de progreso</Text>
            <Text style={s.screenDesc}>Tu % diario, racha activa y nivel de energía semanal en tiempo real</Text>
          </View>
          <View style={s.screenCard}>
            <MockHabits />
            <Text style={s.screenLabel}>Seguimiento de hábitos</Text>
            <Text style={s.screenDesc}>Visualiza tu constancia semana a semana y detecta dónde flaqueas</Text>
          </View>
          <View style={s.screenCard}>
            <MockPortals />
            <Text style={s.screenLabel}>Portales y fases lunares</Text>
            <Text style={s.screenDesc}>Alertas de fechas de alta vibración para que no pierdas ningún portal</Text>
          </View>
          <View style={s.screenCard}>
            <MockProfile />
            <Text style={s.screenLabel}>Perfil energético</Text>
            <Text style={s.screenDesc}>Tu número, arquetipo, signo y frecuencia base en un solo lugar</Text>
          </View>
          <View style={s.screenCard}>
            <MockFrequency />
            <Text style={s.screenLabel}>Frecuencias de manifestación</Text>
            <Text style={s.screenDesc}>Escucha mientras trabajas, meditas o descansas</Text>
          </View>
          <View style={s.screenCard}>
            <MockBadges />
            <Text style={s.screenLabel}>Insignias de constancia</Text>
            <Text style={s.screenDesc}>Gana badges por cada hito — 7 días, 30 días, portales y más</Text>
          </View>
        </ScrollView>

        <Divider />

        {/* ── TESTIMONIOS ── */}
        <View style={s.testimonialsSection}>
          <View style={s.sectionTagLight}>
            <Text style={s.sectionTagLightText}>LO QUE DICEN</Text>
          </View>
          <Text style={s.h2White}>Personas que ya{'\n'}viven su protocolo</Text>

        <ScrollView
          ref={testimonialsRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.testimonialsRow}
          style={s.testimonialsScroll}
        >
          {[
            {
              name: 'Camila R.',
              initials: 'CR',
              area: 'Dinero · Número 3',
              color: '#C9A84C',
              text: 'En 3 semanas de protocolo diario recibí dos propuestas de trabajo inesperadas. No lo puedo explicar racionalmente pero la constancia lo cambió todo.',
            },
            {
              name: 'Valentina M.',
              initials: 'VM',
              area: 'Amor · Número 7',
              color: '#9B7FD4',
              text: 'Siempre hacía rituales sueltos sin estructura. Con Luumina por primera vez siento que tengo un sistema real, no solo buenas intenciones.',
            },
            {
              name: 'Andrea L.',
              initials: 'AL',
              area: 'Propósito · Número 1',
              color: '#4CAF82',
              text: 'Lo que más me sorprendió es que cada día el protocolo es diferente. No es repetitivo. Me mantiene comprometida de una forma que ninguna otra app logró.',
            },
            {
              name: 'Sofía G.',
              initials: 'SG',
              area: 'Salud · Número 5',
              color: '#E07A5F',
              text: 'Llevaba años queriendo ser constante con mis hábitos. El seguimiento semanal y las alertas del portal lo hicieron posible por primera vez.',
            },
            {
              name: 'Daniela P.',
              initials: 'DP',
              area: 'Felicidad · Número 9',
              color: '#5B8DEF',
              text: 'El diario de manifestación me cambió la forma de terminar el día. Escribir mi intención cada mañana me dio una claridad que no sabía que me faltaba.',
            },
          ].map((t, i) => (
            <View key={i} style={s.testimonialCard}>
              {/* Estrellas + comillas */}
              <View style={s.testimonialTop}>
                <Text style={s.testimonialStars}>★★★★★</Text>
                <Text style={s.testimonialQuoteIcon}>❝</Text>
              </View>
              <Text style={s.testimonialText}>"{t.text}"</Text>
              <View style={s.testimonialDivider} />
              {/* Avatar + datos */}
              <View style={s.testimonialAuthor}>
                <View style={[s.testimonialAvatar, { backgroundColor: t.color + '25', borderColor: t.color + '60' }]}>
                  <Text style={[s.testimonialInitials, { color: t.color }]}>{t.initials}</Text>
                </View>
                <View style={s.testimonialInfo}>
                  <Text style={s.testimonialName}>{t.name}</Text>
                  <Text style={s.testimonialArea}>{t.area}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        </View>

        <Divider />

        {/* ── QUÉ INCLUYE ── */}
        <SectionTag text="QUÉ INCLUYE" />
        <Text style={s.h2}>Todo lo que un sistema{'\n'}de manifestación necesita</Text>

        <View style={s.featGrid}>
          {[
            { icon: '🌒', title: 'Ritual lunar diario', desc: 'Acción alineada con la fase de la luna' },
            { icon: '🔢', title: 'Numerología aplicada', desc: 'Afirmaciones según tu número energético' },
            { icon: '🎵', title: 'Frecuencias de manifestación', desc: '396, 528, 741 Hz y más' },
            { icon: '🌈', title: 'Color del día', desc: 'El color que amplifica tu energía hoy' },
            { icon: '🥑', title: 'Alimento clave', desc: 'Nutrición alineada con tu intención' },
            { icon: '⚡', title: 'Biohack diario', desc: 'Una técnica de alto rendimiento al día' },
            { icon: '🔍', title: 'Análisis de patrones', desc: 'Detecta qué hábitos te sabotean sin darte cuenta' },
            { icon: '🌟', title: 'Portales energéticos', desc: 'Alerta en fechas de alta vibración' },
            { icon: '📖', title: 'Diario de manifestación', desc: 'Intención, gratitud y señal del día' },
            { icon: '📊', title: 'Mapa de progreso', desc: 'Visualiza tu constancia semana a semana' },
            { icon: '🗓', title: 'Calendario lunar', desc: 'El ciclo completo del mes a la vista' },
            { icon: '🔔', title: 'Recordatorios inteligentes', desc: 'Notificaciones en el momento correcto' },
          ].map((f) => (
            <View key={f.title} style={s.featCard}>
              <Text style={s.featIcon}>{f.icon}</Text>
              <Text style={s.featTitle}>{f.title}</Text>
              <Text style={s.featDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        <Divider />

        {/* ── PARA QUIÉN ── */}
        <SectionTag text="PARA QUIÉN ES" />
        <Text style={s.h2}>Luumina es para ti{'\n'}si te identificas con esto</Text>

        {[
          { icon: '✅', text: 'Has intentado manifestar pero los resultados son inconsistentes o no llegan.' },
          { icon: '✅', text: 'Practicas rituales o afirmaciones pero no tienes una estructura diaria.' },
          { icon: '✅', text: 'Quieres trabajar en una meta específica: dinero, amor, salud, claridad o paz.' },
          { icon: '✅', text: 'Crees en la energía y los ciclos — pero necesitas un sistema que lo conecte todo.' },
          { icon: '✅', text: 'Estás dispuesta a comprometerte con un protocolo diario por 30 a 90 días.' },
        ].map((item, i) => (
          <View key={i} style={s.forRow}>
            <Text style={s.forIcon}>{item.icon}</Text>
            <Text style={s.forText}>{item.text}</Text>
          </View>
        ))}

        <Divider />

        {/* ── COMPARATIVO ── */}
        <SectionTag text="LA DIFERENCIA" />
        <Text style={s.h2}>Luumina vs lo{'\n'}que ya intentaste</Text>
        <Text style={s.bodyText}>
          No es otro planificador. No son rituales sueltos. Es un sistema vivo que cambia contigo cada día.
        </Text>

        <View style={s.vsRow}>
          {/* Columna izquierda — Lo de siempre */}
          <View style={s.vsCardBad}>
            <View style={s.vsCardHeader}>
              <Text style={s.vsCardIcon}>📓</Text>
              <Text style={s.vsCardTitleBad}>Lo de siempre</Text>
            </View>
            <View style={s.vsDividerLine} />
            {[
              'Rituales copiados que no son para ti',
              'Hoy sí, mañana no — sin estructura',
              'No sabes si estás progresando',
              'Ignoras portales y ciclos lunares',
              'Todo disperso en libretas distintas',
              'Te motivas un día y lo abandonas',
            ].map((item, i) => (
              <View key={i} style={s.vsRow2}>
                <View style={s.vsBadIcon}><Text style={s.vsBadIconText}>✕</Text></View>
                <Text style={s.vsBadText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Columna derecha — Luumina */}
          <View style={s.vsCardGood}>
            <View style={s.vsCardHeader}>
              <Text style={s.vsCardIcon}>🌙</Text>
              <Text style={s.vsCardTitleGood}>Luumina</Text>
            </View>
            <View style={[s.vsDividerLine, { borderColor: 'rgba(201,168,76,0.3)' }]} />
            {[
              'Protocolo único para tu energía',
              'Sistema completo mañana, tarde y noche',
              'Mapa de progreso y racha diaria',
              'Alertas de portales y fases lunares',
              'Todo en un solo lugar, conectado',
              'El sistema te mantiene constante',
            ].map((item, i) => (
              <View key={i} style={s.vsRow2}>
                <View style={s.vsGoodIcon}><Text style={s.vsGoodIconText}>✓</Text></View>
                <Text style={s.vsGoodText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <Divider />

        {/* ── OFERTA ── */}
        <SectionTag text="ELIGE TU PLAN" />
        <Text style={s.h2}>Acceso completo a todo{'\n'}el sistema de manifestación</Text>

        {/* Toggle mensual / anual */}
        <View style={s.planToggle}>
          <TouchableOpacity
            style={[s.planToggleBtn, s.planToggleBtnActive]}
          >
            <Text style={[s.planToggleText, s.planToggleTextActive]}>Anual</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.planToggleBtn}>
            <Text style={s.planToggleText}>Mensual</Text>
          </TouchableOpacity>
        </View>

        {/* Cards lado a lado */}
        <View style={s.planCardsRow}>

          {/* Card Mensual */}
          <TouchableOpacity style={s.planCard} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={s.planCardName}>Mensual</Text>
            <Text style={s.planCardTagline}>Flexibilidad total</Text>
            <View style={s.planPriceRow}>
              <Text style={s.planCurrency}>$</Text>
              <Text style={s.planAmount}>14</Text>
            </View>
            <Text style={s.planPeriodLabel}>/mes</Text>

            <View style={s.planDivider} />

            {planBenefits.map((b, i) => (
              <View key={i} style={s.planBenefitRow}>
                <Text style={s.planCheck}>✦</Text>
                <Text style={s.planBenefitText}>{b}</Text>
              </View>
            ))}

            <View style={[s.planBtn, s.planBtnSecondary]}>
              <Text style={s.planBtnSecondaryText}>Comenzar ahora</Text>
            </View>
          </TouchableOpacity>

          {/* Card Anual */}
          <TouchableOpacity style={[s.planCard, s.planCardAnnual]} onPress={onGetStarted} activeOpacity={0.85}>
            <View style={s.planBadge}>
              <Text style={s.planBadgeText}>Más popular</Text>
            </View>
            <Text style={[s.planCardName, { color: Colors.gold }]}>Anual</Text>
            <Text style={s.planCardTagline}>41% de descuento</Text>
            <View style={s.planPriceRow}>
              <Text style={[s.planCurrency, { color: Colors.gold }]}>$</Text>
              <Text style={[s.planAmount, { color: Colors.gold }]}>99</Text>
            </View>
            <Text style={s.planPeriodLabel}>$8.25/mes · Ahorras $69</Text>

            <View style={[s.planDivider, { borderColor: 'rgba(201,168,76,0.3)' }]} />

            {/* Función exclusiva destacada */}
            <View style={s.planExclusiveBox}>
              <Text style={s.planExclusiveText}>🔍 Análisis de patrones: descubre qué te sabotea sin darte cuenta</Text>
            </View>

            {planBenefits.map((b, i) => (
              <View key={i} style={s.planBenefitRow}>
                <Text style={[s.planCheck, { color: Colors.gold }]}>✦</Text>
                <Text style={s.planBenefitText}>{b}</Text>
              </View>
            ))}

            <View style={[s.planBtn, s.planBtnPrimary]}>
              <Text style={s.planBtnPrimaryText}>Comenzar ahora</Text>
            </View>
          </TouchableOpacity>

        </View>

        <Text style={s.planLegal}>Pago seguro vía Stripe · Cancela cuando quieras</Text>

        <Divider />

        {/* ── FAQ ── */}
        <SectionTag text="PREGUNTAS FRECUENTES" />
        <Text style={s.h2}>Lo que suelen{'\n'}preguntar</Text>

        {[
          {
            q: '¿Necesito saber de numerología o astrología?',
            a: 'No. Solo dinos tu nombre, fecha de nacimiento y qué quieres manifestar. El sistema calcula todo automáticamente. Tú solo sigues el protocolo.',
          },
          {
            q: '¿El contenido cambia todos los días?',
            a: 'Sí. Cada día tu protocolo es diferente porque está alineado con la fase lunar, tu ciclo energético y el avance de tu plan. No hay dos días iguales.',
          },
          {
            q: '¿Cuánto tiempo por día requiere?',
            a: 'Entre 10 y 25 minutos. Está diseñado para ser sostenible, no para añadir más presión a tu día.',
          },
          {
            q: '¿Qué pasa si quiero cambiar mi intención?',
            a: 'Puedes editarlo desde tu perfil en cualquier momento. El sistema recalculará tu protocolo para la nueva área que elijas.',
          },
          {
            q: '¿Funciona en iPhone, Android y computador?',
            a: 'Sí. Luumina funciona en cualquier dispositivo a través del navegador web en luumina.pro.',
          },
        ].map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}

        <Divider />

        {/* ── CTA FINAL ── */}
        <View style={s.finalCta}>
          <Text style={s.finalSymbol}>✦</Text>
          <Text style={s.finalTitle}>La luna no espera.{'\n'}Tu energía tampoco.</Text>
          <Text style={s.finalSub}>
            Cada día sin un protocolo es energía que se escapa.{'\n'}
            Crea el tuyo en menos de 3 minutos.
          </Text>
          <GradientButton title="Crear mi protocolo ahora" onPress={onGetStarted} />
          <TouchableOpacity onPress={onLogin} style={s.loginBtn}>
            <Text style={s.loginText}>Ya soy usuario activo → Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

const MOCK_W = 200
const MOCK_H = 340
const G = Colors.gold
const BG = Colors.background
const CARD_C = Colors.cardBg

const mock = StyleSheet.create({
  phone: {
    width: MOCK_W, height: MOCK_H,
    backgroundColor: BG, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.30)',
    padding: 12, gap: 6,
  },
  phoneBrow: { width: 40, height: 4, backgroundColor: 'rgba(201,168,76,0.25)', borderRadius: 2, alignSelf: 'center', marginBottom: 6 },
  header: { marginBottom: 4 },
  greeting: { fontSize: 13, color: G, fontWeight: '700' },
  sub: { fontSize: 10, color: Colors.textDisabled, marginTop: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  box: { width: 14, height: 14, borderRadius: 3, borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.4)', alignItems: 'center', justifyContent: 'center' },
  boxDone: { backgroundColor: G, borderColor: G },
  check: { fontSize: 8, color: BG, fontWeight: '900' },
  taskText: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  taskDone: { color: Colors.textDisabled, textDecorationLine: 'line-through' },
  screenTitle: { fontSize: 12, color: G, fontWeight: '700', marginBottom: 8 },
  numCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 8, padding: 8, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)' },
  numBig: { fontSize: 36, color: G, fontWeight: '900', lineHeight: 42 },
  numRight: { flex: 1, gap: 4 },
  numArch: { fontSize: 13, color: G, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  chip: { backgroundColor: 'rgba(201,168,76,0.15)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  chipText: { fontSize: 8, color: G },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)' },
  infoLabel: { fontSize: 10, color: Colors.textDisabled },
  infoVal: { fontSize: 10, color: Colors.textPrimary, fontWeight: '600' },
  freqRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: CARD_C, borderRadius: 8, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  freqRowActive: { borderColor: G, backgroundColor: 'rgba(201,168,76,0.08)' },
  freqInfo: { gap: 2 },
  freqHz: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700' },
  freqHzActive: { color: G },
  freqLabel: { fontSize: 10, color: Colors.textDisabled },
  playBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  playBtnActive: { backgroundColor: G, borderColor: G },
  playIcon: { fontSize: 10, color: Colors.textSecondary },
  playIconActive: { color: BG, fontWeight: '900' },

  // Journal mock
  journalEntry: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 8, gap: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  journalEntryDone: { borderColor: 'rgba(201,168,76,0.2)' },
  journalTime: { fontSize: 9, color: G, fontWeight: '700' },
  journalNote: { fontSize: 10, color: Colors.textSecondary, lineHeight: 14 },
  journalNotePlaceholder: { color: Colors.textDisabled, fontStyle: 'italic' },
  signalBox: { backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 6, padding: 7, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', gap: 2 },
  signalLabel: { fontSize: 9, color: G, fontWeight: '700' },
  signalText: { fontSize: 9, color: Colors.textSecondary, lineHeight: 13 },

  // Progress mock
  progressCircleBox: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  progressCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: G, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(201,168,76,0.08)' },
  progressPct: { fontSize: 18, color: G, fontWeight: '900' },
  progressPctLabel: { fontSize: 8, color: Colors.textDisabled },
  progressMeta: { flex: 1 },
  progressMetaVal: { fontSize: 14, color: G, fontWeight: '700' },
  progressMetaLabel: { fontSize: 9, color: Colors.textDisabled },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  weekDay: { alignItems: 'center', gap: 3 },
  weekDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)' },
  weekDotDone: { backgroundColor: G },
  weekDotToday: { borderWidth: 2, borderColor: G, backgroundColor: 'transparent' },
  weekDayLabel: { fontSize: 8, color: Colors.textDisabled },
  streakBox: { backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)' },
  streakText: { fontSize: 9, color: G, textAlign: 'center', lineHeight: 14 },

  // Portals mock
  portalCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  portalCardActive: { borderColor: 'rgba(201,168,76,0.4)', backgroundColor: 'rgba(201,168,76,0.06)' },
  portalCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  portalEmoji: { fontSize: 20 },
  portalName: { fontSize: 11, color: Colors.textPrimary, fontWeight: '700' },
  portalDate: { fontSize: 9, color: Colors.textDisabled },
  portalBadge: { backgroundColor: G, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  portalBadgeText: { fontSize: 8, color: BG, fontWeight: '700' },
  portalBadgeInactive: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  portalBadgeInactiveText: { fontSize: 8, color: Colors.textDisabled, fontWeight: '700' },
  portalHint: { fontSize: 9, color: Colors.textDisabled, textAlign: 'center', marginTop: 4, lineHeight: 13 },

  // Badges mock
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeItem: { width: '30%', alignItems: 'center', backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)', gap: 4 },
  badgeItemLocked: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' },
  badgeEmoji: { fontSize: 22 },
  badgeEmojiLocked: { opacity: 0.3 },
  badgeName: { fontSize: 8, color: G, fontWeight: '700', textAlign: 'center' },
  badgeNameLocked: { color: Colors.textDisabled },
  badgeMotivation: { backgroundColor: 'rgba(201,168,76,0.08)', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginTop: 4 },
  badgeMotivationText: { fontSize: 9, color: G, textAlign: 'center' },

  // Habits mock
  habitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  habitLeft: { flex: 1, gap: 4 },
  habitLabel: { fontSize: 10, color: Colors.textPrimary },
  habitDots: { flexDirection: 'row', gap: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)' },
  dotDone: { backgroundColor: G },
  habitCount: { fontSize: 11, fontWeight: '700', marginLeft: 8 },
  habitCountGold: { color: G },
  habitCountWeak: { color: '#E07A5F' },
})

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 60 },
  divider: { height: 1, backgroundColor: 'rgba(201,168,76,0.18)', marginVertical: 36, marginHorizontal: Spacing.lg },

  sectionTag: { alignSelf: 'flex-start', backgroundColor: Colors.goldDim, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12, marginHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.borderGold },
  sectionTagText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.gold, letterSpacing: 1 },

  h2: { fontSize: 26, color: Colors.textPrimary, fontFamily: Fonts.heading, lineHeight: 34, marginBottom: Spacing.md, paddingHorizontal: Spacing.lg },
  bodyText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 23, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },

  // Hero
  heroWrapper: {
    position: 'relative', overflow: 'hidden',
    backgroundColor: Colors.background,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.15)',
  },
  hero: { paddingHorizontal: Spacing.lg, paddingTop: 72, paddingBottom: Spacing.xl, alignItems: 'center', gap: Spacing.lg },
  brandName: { fontSize: 44, color: Colors.gold, fontFamily: Fonts.heading, letterSpacing: 4, textAlign: 'center' },
  brandTagline: { fontSize: 11, color: Colors.textDisabled, letterSpacing: 2.5, textAlign: 'center', textTransform: 'uppercase', marginTop: -8 },

  // Orbes Trifuerza
  trifuerzaOrbs: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, marginVertical: 8 },
  orbWrapper: { alignItems: 'center', gap: 6, flexDirection: 'column' },
  orbConnector: { width: 28, height: 1, backgroundColor: 'rgba(201,168,76,0.3)', marginBottom: 20, alignSelf: 'center' },
  orb: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowRadius: 16, shadowOpacity: 0.6,
    elevation: 8,
  },
  orbIcon: { fontSize: 28 },
  orbLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  // Título gradiente
  heroTitleWrapper: { alignItems: 'center', gap: 4 },
  heroTitlePlain: { fontSize: 32, color: Colors.textPrimary, fontFamily: Fonts.heading, textAlign: 'center', lineHeight: 40 },
  heroTitleGradientBg: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  heroTitleGradient: { fontSize: 32, color: Colors.background, fontFamily: Fonts.heading, textAlign: 'center', lineHeight: 40 },

  heroHook: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },

  // CTA gradiente
  ctaGradient: { borderRadius: Radius.md, width: '100%' },
  ctaInner: { paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontFamily: Fonts.bodyBold, fontSize: 17, color: Colors.background, letterSpacing: 0.5 },

  loginBtn: { paddingVertical: Spacing.sm },
  loginText: { fontFamily: Fonts.bodySemiBold, fontSize: 15, color: Colors.gold },

  // Comparativo
  vsRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 10, alignItems: 'flex-start', marginBottom: Spacing.md },
  vsCardBad: { flex: 1, backgroundColor: 'rgba(220,53,69,0.06)', borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(220,53,69,0.2)', padding: 14, gap: 8 },
  vsCardGood: { flex: 1, backgroundColor: 'rgba(201,168,76,0.06)', borderRadius: Radius.lg, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', padding: 14, gap: 8 },
  vsCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  vsCardIcon: { fontSize: 16 },
  vsCardTitleBad: { fontSize: 13, color: '#E07A5F', fontWeight: '700' },
  vsCardTitleGood: { fontSize: 13, color: Colors.gold, fontWeight: '700' },
  vsDividerLine: { borderTopWidth: 1, borderColor: 'rgba(220,53,69,0.2)', marginBottom: 4 },
  vsRow2: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  vsBadIcon: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(220,53,69,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  vsBadIconText: { fontSize: 8, color: '#E07A5F', fontWeight: '900' },
  vsBadText: { fontSize: 11, color: Colors.textSecondary, flex: 1, lineHeight: 16 },
  vsGoodIcon: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(201,168,76,0.2)', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  vsGoodIconText: { fontSize: 8, color: Colors.gold, fontWeight: '900' },
  vsGoodText: { fontSize: 11, color: Colors.textPrimary, flex: 1, lineHeight: 16 },

  // Pain
  painCard: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, paddingVertical: Spacing.sm },
  painIcon: { fontSize: 28, marginTop: 2 },
  painBody: { flex: 1, gap: 4 },
  painTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.textPrimary, lineHeight: 22 },
  painText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  // Trifuerza
  trifuerzaRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md },
  trifuerzaCard: { flex: 1, backgroundColor: Colors.goldDim, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.borderGold, padding: 12, gap: 3, alignItems: 'center' },
  trifuerzaIcon: { fontSize: 24, marginBottom: 4 },
  trifuerzaTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textPrimary, textAlign: 'center' },
  trifuerzaSub: { fontFamily: Fonts.body, fontSize: 10, color: Colors.gold, textAlign: 'center', marginBottom: 4 },
  trifuerzaDesc: { fontFamily: Fonts.body, fontSize: 11, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 },
  trifuerzaResult: { marginHorizontal: Spacing.lg, backgroundColor: Colors.goldDim, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold, marginBottom: Spacing.lg },
  trifuerzaResultText: { fontFamily: Fonts.bodySemiBold, fontSize: 14, color: Colors.gold, textAlign: 'center', lineHeight: 21 },

  // Steps
  stepsContainer: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, marginBottom: Spacing.md },
  step: { flexDirection: 'row', gap: Spacing.md },
  stepNum: { fontFamily: Fonts.heading, fontSize: 48, color: 'rgba(212,175,85,0.50)', lineHeight: 54, minWidth: 56 },
  stepContent: { flex: 1, gap: 6 },
  stepTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 16, color: Colors.textPrimary },
  stepBody: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  // Screens
  screensScroll: { marginTop: 20 },
  screensRow: { paddingHorizontal: Spacing.lg, gap: 16, paddingRight: Spacing.lg },
  screenCard: { width: MOCK_W + 16, gap: 10 },
  screenLabel: { fontSize: 14, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  screenDesc: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },

  // Testimonials — dark theme
  testimonialsSection: { paddingVertical: Spacing.xl },
  h2White: { fontSize: 26, color: Colors.textPrimary, fontFamily: Fonts.heading, lineHeight: 34, marginBottom: Spacing.md, paddingHorizontal: Spacing.lg },
  sectionTagLight: { alignSelf: 'flex-start', backgroundColor: Colors.goldDim, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12, marginHorizontal: Spacing.lg, borderWidth: 1, borderColor: Colors.borderGold },
  sectionTagLightText: { fontFamily: Fonts.bodySemiBold, fontSize: 10, color: Colors.gold, letterSpacing: 1 },
  testimonialsScroll: { marginTop: 8 },
  testimonialsRow: { paddingHorizontal: Spacing.lg, gap: 14, paddingRight: Spacing.lg, paddingBottom: 8 },
  testimonialCard: {
    width: 240,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGold,
  },
  testimonialTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  testimonialStars: { fontSize: 13, color: Colors.gold, letterSpacing: 1 },
  testimonialQuoteIcon: { fontSize: 24, color: Colors.goldDim },
  testimonialText: { fontFamily: Fonts.headingItalic, fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  testimonialDivider: { borderTopWidth: 1, borderColor: Colors.border },
  testimonialAuthor: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  testimonialAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  testimonialInitials: { fontFamily: Fonts.bodyBold, fontSize: 13 },
  testimonialInfo: { flex: 1 },
  testimonialName: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textPrimary },
  testimonialArea: { fontFamily: Fonts.body, fontSize: 10, color: Colors.textSecondary },

  // Features
  featGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md },
  featCard: { width: '47%', backgroundColor: Colors.cardBg, borderRadius: Radius.md, padding: Spacing.md, gap: 4, borderWidth: 1, borderColor: Colors.border },
  featIcon: { fontSize: 22 },
  featTitle: { fontFamily: Fonts.bodySemiBold, fontSize: 13, color: Colors.textPrimary },
  featDesc: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  // For whom
  forRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  forIcon: { fontSize: 16, marginTop: 1 },
  forText: { flex: 1, fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },

  // Plan section
  planToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.full, padding: 4, marginBottom: Spacing.lg, alignSelf: 'center' },
  planToggleBtn: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: Radius.full },
  planToggleBtnActive: { backgroundColor: Colors.gold },
  planToggleText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  planToggleTextActive: { color: Colors.background },

  planCardsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: Spacing.lg, alignItems: 'flex-start', marginBottom: Spacing.sm },

  planCard: { flex: 1, backgroundColor: Colors.cardBg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 4 },
  planCardAnnual: { borderColor: Colors.borderGold, backgroundColor: Colors.goldDim, borderWidth: 1 },

  planBadge: { backgroundColor: Colors.gold, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 4 },
  planBadgeText: { fontSize: 10, color: Colors.background, fontWeight: '700' },

  planCardName: { fontFamily: Fonts.bodySemiBold, fontSize: 18, color: Colors.textPrimary },
  planCardTagline: { fontFamily: Fonts.body, fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },

  planPriceRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  planCurrency: { fontFamily: Fonts.bodySemiBold, fontSize: 18, color: Colors.textPrimary, marginTop: 6 },
  planAmount: { fontFamily: Fonts.heading, fontSize: 42, color: Colors.textPrimary, lineHeight: 48 },
  planPeriodLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 8 },

  planDivider: { borderTopWidth: 1, borderColor: Colors.border, marginVertical: 10 },

  planExclusiveBox: { backgroundColor: 'rgba(201,168,76,0.12)', borderWidth: 1, borderColor: 'rgba(201,168,76,0.35)', borderRadius: Radius.md, padding: 10, marginBottom: 8 },
  planExclusiveText: { fontSize: 12, color: Colors.gold, fontWeight: '600', lineHeight: 18 },

  planBenefitRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 5 },
  planCheck: { color: '#4CAF82', fontSize: 10, marginTop: 3 },
  planBenefitText: { fontSize: 12, color: Colors.textPrimary, flex: 1, lineHeight: 18 },

  planBtn: { borderRadius: Radius.md, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  planBtnPrimary: { backgroundColor: Colors.gold },
  planBtnPrimaryText: { color: Colors.background, fontWeight: '700', fontSize: 14 },
  planBtnSecondary: { borderWidth: 1, borderColor: Colors.border },
  planBtnSecondaryText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 14 },

  planLegal: { fontSize: 11, color: Colors.textDisabled, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.lg },

  // FAQ
  faqItem: { marginHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.12)' },
  faqRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  faqQ: { fontFamily: Fonts.bodySemiBold, flex: 1, fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },
  faqChevron: { fontFamily: Fonts.bodyBold, fontSize: 20, color: Colors.gold, lineHeight: 24, minWidth: 20, textAlign: 'center' },
  faqA: { fontFamily: Fonts.body, fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginTop: Spacing.sm },

  // Final CTA
  finalCta: { paddingHorizontal: Spacing.lg, alignItems: 'center', gap: Spacing.md },
  finalSymbol: { fontSize: 36, color: Colors.gold },
  finalTitle: { fontFamily: Fonts.heading, fontSize: 30, color: Colors.textPrimary, textAlign: 'center', lineHeight: 38 },
  finalSub: { fontFamily: Fonts.body, fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 23 },
})
