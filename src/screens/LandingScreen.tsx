import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, TouchableOpacity,
} from 'react-native'
import { useState } from 'react'
import { Colors, Spacing, Radius } from '../constants/theme'
import { GradientButton } from '../components/ui/GradientButton'

interface Props {
  onGetStarted: () => void
  onLogin: () => void
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

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

// ── Mocks de pantalla ─────────────────────────────────────────────────────────

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

// ── Screen principal ──────────────────────────────────────────────────────────

export function LandingScreen({ onGetStarted, onLogin }: Props) {
  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <View style={s.hero}>
          <Text style={s.heroMoon}>🌙</Text>
          <Text style={s.brandName}>Lúmina</Text>
          <Text style={s.brandTagline}>el secreto de manifestación judía</Text>
          <View style={s.heroDivider} />
          <Text style={s.heroTitle}>Tu protocolo diario{'\n'}para manifestar en serio</Text>
          <Text style={s.heroSub}>
            Basado en tu numerología, signo zodiacal y ciclo lunar.{'\n'}
            Un sistema único. Tuyo. Todos los días.
          </Text>
          <GradientButton title="Quiero mi sistema" onPress={onGetStarted} />
          <TouchableOpacity onPress={onLogin} style={s.loginBtn}>
            <Text style={s.loginText}>Ya soy usuario activo → Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

        <Divider />

        {/* ── PROBLEMA ── */}
        <SectionTag text="EL PROBLEMA" />
        <Text style={s.h2}>¿Por qué sigues repitiendo{'\n'}intenciones sin resultados?</Text>

        {[
          {
            icon: '🔁',
            title: 'Rituales genéricos que no son tuyos',
            body: 'Copias lo que hace otra persona. Pero su fecha de nacimiento, su energía y su ciclo no son los tuyos. Lo que funciona para ella puede bloquearte a ti.',
          },
          {
            icon: '📅',
            title: 'Sin estructura, la intención se evapora',
            body: 'Un ritual hecho al azar, un día sí y tres no, sin un momento definido, sin seguimiento — es solo teatro. La manifestación responde a la constancia, no a la intensidad.',
          },
          {
            icon: '🌙',
            title: 'Ignorar los ciclos lo hace todo más difícil',
            body: 'Hay momentos del mes para sembrar, para actuar, para soltar. Si empujas cuando deberías descansar — o descansas cuando deberías moverte — gastas energía donde no hay retorno.',
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

        {/* ── SOLUCIÓN ── */}
        <SectionTag text="LA SOLUCIÓN" />
        <Text style={s.h2}>Abundancia lo calcula{'\n'}y lo estructura todo por ti</Text>
        <Text style={s.bodyText}>
          No tienes que saber de numerología ni de astrología. Solo dinos quién eres. El sistema hace el resto.
        </Text>

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
        <Text style={s.h2}>Todo lo que necesitas{'\n'}en una sola pantalla</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.screensRow}
          style={s.screensScroll}
        >
          <View style={s.screenCard}>
            <MockDashboard />
            <Text style={s.screenLabel}>Protocolo diario</Text>
            <Text style={s.screenDesc}>9 acciones personalizadas cada día alineadas con tu ciclo lunar</Text>
          </View>
          <View style={s.screenCard}>
            <MockProfile />
            <Text style={s.screenLabel}>Perfil energético</Text>
            <Text style={s.screenDesc}>Tu número, arquetipo, signo y frecuencia base en un solo perfil</Text>
          </View>
          <View style={s.screenCard}>
            <MockFrequency />
            <Text style={s.screenLabel}>Reproductor de frecuencias</Text>
            <Text style={s.screenDesc}>Frecuencias de manifestación para escuchar mientras trabajas o meditas</Text>
          </View>
        </ScrollView>

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
            { icon: '📊', title: 'Mapa de progreso', desc: 'Visualiza tu constancia semana a semana' },
            { icon: '🌟', title: 'Portales energéticos', desc: 'Alerta en fechas de alta vibración' },
            { icon: '🌀', title: 'Rueda de abundancia', desc: 'Evalúa tus 8 áreas de vida' },
            { icon: '📝', title: 'Mis intenciones', desc: 'Escribe tu objetivo del día con intención' },
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
        <Text style={s.h2}>Abundancia es para ti{'\n'}si te identificas con esto</Text>

        {[
          {
            icon: '✅',
            text: 'Has intentado manifestar pero los resultados son inconsistentes o no llegan.',
          },
          {
            icon: '✅',
            text: 'Practicas rituales, afirmaciones o meditación pero no tienes una estructura diaria.',
          },
          {
            icon: '✅',
            text: 'Quieres trabajar en una meta específica: más dinero, mejor relación, más salud, claridad o paz.',
          },
          {
            icon: '✅',
            text: 'Crees en la energía, los ciclos y la intención — pero necesitas un sistema que lo conecte todo.',
          },
          {
            icon: '✅',
            text: 'Estás dispuesto/a a comprometerte con un protocolo diario por 30 a 90 días.',
          },
        ].map((item, i) => (
          <View key={i} style={s.forRow}>
            <Text style={s.forIcon}>{item.icon}</Text>
            <Text style={s.forText}>{item.text}</Text>
          </View>
        ))}

        <Divider />

        {/* ── PLANES ── */}
        <SectionTag text="PLANES" />
        <Text style={s.h2}>Elige cómo quieres{'\n'}activar tu sistema</Text>

        {/* Anual */}
        <TouchableOpacity style={s.planCardAnnual} onPress={onGetStarted} activeOpacity={0.85}>
          <View style={s.popularBadge}>
            <Text style={s.popularText}>Más popular · 41% descuento</Text>
          </View>
          <Text style={s.planPrice}>$99</Text>
          <Text style={s.planPeriod}>/año · $8.25 por mes</Text>
          <Text style={s.planSaving}>Ahorras $69 vs mensual</Text>
          <View style={s.planFeatureList}>
            {['Acceso completo', 'Protocolo diario personalizado', 'Todas las actualizaciones incluidas', 'Soporte prioritario'].map(f => (
              <View key={f} style={s.planFeat}>
                <Text style={s.planFeatDot}>✦</Text>
                <Text style={s.planFeatText}>{f}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Mensual */}
        <TouchableOpacity style={s.planCardMonthly} onPress={onGetStarted} activeOpacity={0.85}>
          <Text style={s.planPriceMonthly}>$14</Text>
          <Text style={s.planPeriod}>/mes · Sin compromiso</Text>
          <View style={s.planFeatureList}>
            {['Acceso completo', 'Cancela cuando quieras'].map(f => (
              <View key={f} style={s.planFeat}>
                <Text style={s.planFeatDotGray}>✦</Text>
                <Text style={s.planFeatTextGray}>{f}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        <Text style={s.planLegal}>Pago seguro vía Stripe · Cancela cuando quieras.</Text>

        <Divider />

        {/* ── FAQ ── */}
        <SectionTag text="PREGUNTAS FRECUENTES" />
        <Text style={s.h2}>Lo que suelen{'\n'}preguntar</Text>

        {[
          {
            q: '¿Necesito creer en numerología o astrología para que funcione?',
            a: 'No. El sistema usa estas disciplinas como marcos de estructura y significado personal, no como dogmas. Lo importante es que tú te comprometas con las acciones diarias. La constancia hace el trabajo.',
          },
          {
            q: '¿El contenido cambia todos los días?',
            a: 'Sí. Cada día tu protocolo es diferente porque está alineado con la fase lunar, tu ciclo energético y el avance de tu plan. No hay dos días iguales.',
          },
          {
            q: '¿Qué pasa si quiero cambiar mi intención principal?',
            a: 'Puedes editarlo desde tu perfil cuando quieras. El sistema recalculará tu protocolo según la nueva área de manifestación que elijas.',
          },
          {
            q: '¿Cuánto tiempo por día requiere el protocolo?',
            a: 'Entre 10 y 25 minutos dependiendo de cuántos pasos completes. El objetivo es que sea manejable y sostenible, no que se sienta como otra tarea más.',
          },
          {
            q: '¿Funciona en iPhone y Android?',
            a: 'Sí, la app funciona en ambas plataformas a través de Expo Go, y también en tu navegador web.',
          },
          {
            q: '¿Puedo cancelar cuando quiera?',
            a: 'Sí. Si tienes el plan mensual puedes cancelar en cualquier momento sin cargos adicionales. El plan anual también puede cancelarse, aunque es un único pago.',
          },
        ].map((item) => (
          <FaqItem key={item.q} q={item.q} a={item.a} />
        ))}

        <Divider />

        {/* ── CTA FINAL ── */}
        <View style={s.finalCta}>
          <Text style={s.finalSymbol}>✦</Text>
          <Text style={s.finalTitle}>El mejor momento{'\n'}para empezar es hoy.</Text>
          <Text style={s.finalSub}>
            La luna no espera. Tu energía tampoco.{'\n'}
            Crea tu protocolo en menos de 3 minutos.
          </Text>
          <GradientButton title="Quiero mi sistema" onPress={onGetStarted} />
          <TouchableOpacity onPress={onLogin} style={s.loginBtn}>
            <Text style={s.loginText}>Ya soy usuario activo → Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

// ── Estilos del mock de pantalla ──────────────────────────────────────────────

const MOCK_W = 200
const MOCK_H = 340
const G = Colors.gold
const BG = Colors.background
const CARD_C = Colors.card

const mock = StyleSheet.create({
  phone: {
    width: MOCK_W, height: MOCK_H,
    backgroundColor: BG,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(201,168,76,0.30)',
    padding: 12,
    gap: 6,
  },
  phoneBrow: {
    width: 40, height: 4,
    backgroundColor: 'rgba(201,168,76,0.25)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
  },
  header: { marginBottom: 4 },
  greeting: { fontSize: 13, color: G, fontWeight: '700' },
  sub: { fontSize: 10, color: Colors.textDisabled, marginTop: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  box: {
    width: 14, height: 14, borderRadius: 3,
    borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  boxDone: { backgroundColor: G, borderColor: G },
  check: { fontSize: 8, color: BG, fontWeight: '900' },
  taskText: { fontSize: 11, color: Colors.textSecondary, flex: 1 },
  taskDone: { color: Colors.textDisabled, textDecorationLine: 'line-through' },

  screenTitle: { fontSize: 12, color: G, fontWeight: '700', marginBottom: 8 },
  numCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(201,168,76,0.08)',
    borderRadius: 8, padding: 8, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)',
  },
  numBig: { fontSize: 36, color: G, fontWeight: '900', lineHeight: 42 },
  numRight: { flex: 1, gap: 4 },
  numArch: { fontSize: 13, color: G, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  chip: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1,
  },
  chipText: { fontSize: 8, color: G },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoLabel: { fontSize: 10, color: Colors.textDisabled },
  infoVal: { fontSize: 10, color: Colors.textPrimary, fontWeight: '600' },

  freqRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: CARD_C, borderRadius: 8, padding: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  freqRowActive: { borderColor: G, backgroundColor: 'rgba(201,168,76,0.08)' },
  freqInfo: { gap: 2 },
  freqHz: { fontSize: 13, color: Colors.textSecondary, fontWeight: '700' },
  freqHzActive: { color: G },
  freqLabel: { fontSize: 10, color: Colors.textDisabled },
  playBtn: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  playBtnActive: { backgroundColor: G, borderColor: G },
  playIcon: { fontSize: 10, color: Colors.textSecondary },
  playIconActive: { color: BG, fontWeight: '900' },
})

// ── Estilos principales ───────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 60 },
  divider: { height: 1, backgroundColor: 'rgba(201,168,76,0.18)', marginVertical: 36, marginHorizontal: Spacing.lg },

  // Section tag
  sectionTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 4,
    marginBottom: 12,
    marginHorizontal: Spacing.lg,
    borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)',
  },
  sectionTagText: { fontSize: 10, color: Colors.gold, fontWeight: '700', letterSpacing: 1 },

  h2: {
    fontSize: 26, color: Colors.textPrimary, fontWeight: '700',
    lineHeight: 34, marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  bodyText: {
    fontSize: 15, color: Colors.textSecondary, lineHeight: 23,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg,
  },

  // Hero
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 72,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroMoon: { fontSize: 56 },
  brandName: {
    fontSize: 42,
    color: Colors.gold,
    fontWeight: '800',
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: -4,
  },
  brandTagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: -6,
  },
  heroDivider: {
    width: 40,
    height: 1,
    backgroundColor: 'rgba(201,168,76,0.40)',
    marginVertical: 4,
  },
  heroTitle: {
    fontSize: 32, color: Colors.textPrimary, fontWeight: '800',
    textAlign: 'center', lineHeight: 42,
  },
  heroSub: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 23,
  },
  loginBtn: { paddingVertical: Spacing.sm },
  loginText: { fontSize: 15, color: Colors.gold, fontWeight: '600' },

  // Pain cards
  painCard: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  painIcon: { fontSize: 28, marginTop: 2 },
  painBody: { flex: 1, gap: 4 },
  painTitle: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700', lineHeight: 22 },
  painText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  // Steps
  stepsContainer: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, marginBottom: Spacing.md },
  step: { flexDirection: 'row', gap: Spacing.md },
  stepNum: {
    fontSize: 48, color: 'rgba(201,168,76,0.60)', fontWeight: '900',
    lineHeight: 54, minWidth: 56,
  },
  stepContent: { flex: 1, gap: 6 },
  stepTitle: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700' },
  stepBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  // App screens
  screensScroll: { marginTop: 20 },
  screensRow: { paddingHorizontal: Spacing.lg, gap: 16, paddingRight: Spacing.lg },
  screenCard: { width: MOCK_W + 16, gap: 10 },
  screenLabel: { fontSize: 14, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  screenDesc: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },

  // Features grid
  featGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: 10,
    marginBottom: Spacing.md,
  },
  featCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  featIcon: { fontSize: 22 },
  featTitle: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700' },
  featDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  // For whom
  forRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm,
  },
  forIcon: { fontSize: 16, marginTop: 1 },
  forText: { flex: 1, fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },

  // Plans
  planCardAnnual: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2, borderColor: Colors.gold,
    marginBottom: Spacing.md,
    gap: 4,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gold,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  popularText: { fontSize: 11, color: Colors.background, fontWeight: '700' },
  planPrice: { fontSize: 48, color: Colors.gold, fontWeight: '800', lineHeight: 54 },
  planPriceMonthly: { fontSize: 48, color: Colors.textPrimary, fontWeight: '800', lineHeight: 54 },
  planPeriod: { fontSize: 14, color: Colors.textSecondary, marginTop: -4 },
  planSaving: { fontSize: 13, color: Colors.success, marginBottom: Spacing.sm },
  planFeatureList: { gap: 6, marginTop: Spacing.sm },
  planFeat: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  planFeatDot: { fontSize: 10, color: Colors.gold },
  planFeatText: { fontSize: 14, color: Colors.textPrimary },
  planFeatDotGray: { fontSize: 10, color: Colors.textDisabled },
  planFeatTextGray: { fontSize: 14, color: Colors.textSecondary },
  planCardMonthly: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  planLegal: {
    fontSize: 11, color: Colors.textDisabled,
    textAlign: 'center', marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },

  // FAQ
  faqItem: {
    marginHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.12)',
  },
  faqRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  faqQ: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '600', lineHeight: 22 },
  faqChevron: { fontSize: 20, color: Colors.gold, lineHeight: 24, minWidth: 20, textAlign: 'center' },
  faqA: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginTop: Spacing.sm },

  // Final CTA
  finalCta: {
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  finalSymbol: { fontSize: 36, color: Colors.gold },
  finalTitle: {
    fontSize: 28, color: Colors.textPrimary, fontWeight: '800',
    textAlign: 'center', lineHeight: 36,
  },
  finalSub: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 23,
  },
})
