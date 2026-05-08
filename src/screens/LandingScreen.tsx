import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, TouchableOpacity,
} from 'react-native'
import { useState } from 'react'
import { Colors, Spacing, Radius } from '../constants/theme'
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
          <Text style={s.heroTitle}>¿Sigues manifestando{'\n'}en desorden?</Text>
          <Text style={s.heroHook}>
            El universo responde a precisión, no a intención vaga.{'\n'}
            Lúmina crea tu protocolo único — basado en quién eres energéticamente — para que manifestes con exactitud, no con esperanza.
          </Text>
          <GradientButton title="Crear mi protocolo ahora" onPress={onGetStarted} />
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
        <Text style={s.h2}>El Sistema Trifuerza{'\n'}de Lúmina</Text>
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
        <Text style={s.h2}>5 herramientas que trabajan{'\n'}juntas por ti cada día</Text>
        <Text style={s.bodyText}>
          No es una app de afirmaciones. Es un sistema completo donde cada pieza alimenta a la siguiente — desliza para ver.
        </Text>

        <ScrollView
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
            <MockHabits />
            <Text style={s.screenLabel}>Seguimiento de hábitos</Text>
            <Text style={s.screenDesc}>Visualiza tu constancia semana a semana y detecta dónde flaqueas</Text>
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
        </ScrollView>

        <Divider />

        {/* ── TESTIMONIOS ── */}
        <SectionTag text="LO QUE DICEN" />
        <Text style={s.h2}>Personas que ya{'\n'}viven su protocolo</Text>

        {[
          {
            name: 'Camila R.',
            area: 'Dinero · Número 3',
            text: '"En 3 semanas de protocolo diario recibí dos propuestas de trabajo inesperadas. No lo puedo explicar racionalmente pero la constancia lo cambió todo."',
          },
          {
            name: 'Valentina M.',
            area: 'Amor · Número 7',
            text: '"Siempre hacía rituales sueltos sin estructura. Con Lúmina por primera vez siento que tengo un sistema real, no solo buenas intenciones."',
          },
          {
            name: 'Andrea L.',
            area: 'Propósito · Número 1',
            text: '"Lo que más me sorprendió es que cada día el protocolo es diferente. No es repetitivo. Me mantiene comprometida de una forma que ninguna otra app logró."',
          },
        ].map((t, i) => (
          <View key={i} style={s.testimonialCard}>
            <Text style={s.testimonialText}>{t.text}</Text>
            <View style={s.testimonialAuthor}>
              <Text style={s.testimonialName}>{t.name}</Text>
              <Text style={s.testimonialArea}>{t.area}</Text>
            </View>
          </View>
        ))}

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
        <Text style={s.h2}>Lúmina es para ti{'\n'}si te identificas con esto</Text>

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
            a: 'Sí. Lúmina funciona en cualquier dispositivo a través del navegador web en luumina.pro.',
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
const CARD_C = Colors.card

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

  sectionTag: { alignSelf: 'flex-start', backgroundColor: 'rgba(201,168,76,0.12)', borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12, marginHorizontal: Spacing.lg, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)' },
  sectionTagText: { fontSize: 10, color: Colors.gold, fontWeight: '700', letterSpacing: 1 },

  h2: { fontSize: 26, color: Colors.textPrimary, fontWeight: '700', lineHeight: 34, marginBottom: Spacing.md, paddingHorizontal: Spacing.lg },
  bodyText: { fontSize: 15, color: Colors.textSecondary, lineHeight: 23, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },

  // Hero
  hero: { paddingHorizontal: Spacing.lg, paddingTop: 72, paddingBottom: Spacing.xl, alignItems: 'center', gap: Spacing.md },
  heroMoon: { fontSize: 56 },
  brandName: { fontSize: 42, color: Colors.gold, fontWeight: '800', letterSpacing: 3, textAlign: 'center', marginTop: -4 },
  brandTagline: { fontSize: 13, color: Colors.textSecondary, letterSpacing: 1.5, textAlign: 'center', textTransform: 'uppercase', marginTop: -6 },
  heroDivider: { width: 40, height: 1, backgroundColor: 'rgba(201,168,76,0.40)', marginVertical: 4 },
  heroTitle: { fontSize: 34, color: Colors.textPrimary, fontWeight: '800', textAlign: 'center', lineHeight: 42 },
  heroHook: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  loginBtn: { paddingVertical: Spacing.sm },
  loginText: { fontSize: 15, color: Colors.gold, fontWeight: '600' },

  // Pain
  painCard: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md, paddingVertical: Spacing.sm },
  painIcon: { fontSize: 28, marginTop: 2 },
  painBody: { flex: 1, gap: 4 },
  painTitle: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700', lineHeight: 22 },
  painText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  // Trifuerza
  trifuerzaRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md },
  trifuerzaCard: { flex: 1, backgroundColor: 'rgba(201,168,76,0.06)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', padding: 12, gap: 3, alignItems: 'center' },
  trifuerzaIcon: { fontSize: 24, marginBottom: 4 },
  trifuerzaTitle: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  trifuerzaSub: { fontSize: 10, color: Colors.gold, textAlign: 'center', marginBottom: 4 },
  trifuerzaDesc: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 },
  trifuerzaResult: { marginHorizontal: Spacing.lg, backgroundColor: 'rgba(201,168,76,0.1)', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', marginBottom: Spacing.lg },
  trifuerzaResultText: { fontSize: 14, color: Colors.gold, textAlign: 'center', lineHeight: 21, fontWeight: '600' },

  // Steps
  stepsContainer: { paddingHorizontal: Spacing.lg, gap: Spacing.lg, marginBottom: Spacing.md },
  step: { flexDirection: 'row', gap: Spacing.md },
  stepNum: { fontSize: 48, color: 'rgba(201,168,76,0.60)', fontWeight: '900', lineHeight: 54, minWidth: 56 },
  stepContent: { flex: 1, gap: 6 },
  stepTitle: { fontSize: 16, color: Colors.textPrimary, fontWeight: '700' },
  stepBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },

  // Screens
  screensScroll: { marginTop: 20 },
  screensRow: { paddingHorizontal: Spacing.lg, gap: 16, paddingRight: Spacing.lg },
  screenCard: { width: MOCK_W + 16, gap: 10 },
  screenLabel: { fontSize: 14, color: Colors.textPrimary, fontWeight: '700', textAlign: 'center' },
  screenDesc: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },

  // Testimonials
  testimonialCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  testimonialText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },
  testimonialAuthor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  testimonialName: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700' },
  testimonialArea: { fontSize: 11, color: Colors.gold },

  // Features
  featGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: 10, marginBottom: Spacing.md },
  featCard: { width: '47%', backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, gap: 4, borderWidth: 1, borderColor: Colors.border },
  featIcon: { fontSize: 22 },
  featTitle: { fontSize: 13, color: Colors.textPrimary, fontWeight: '700' },
  featDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

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

  planCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 4 },
  planCardAnnual: { borderColor: 'rgba(201,168,76,0.4)', backgroundColor: 'rgba(201,168,76,0.05)', borderWidth: 2 },

  planBadge: { backgroundColor: Colors.gold, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 4 },
  planBadgeText: { fontSize: 10, color: Colors.background, fontWeight: '700' },

  planCardName: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700' },
  planCardTagline: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },

  planPriceRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  planCurrency: { fontSize: 18, color: Colors.textPrimary, fontWeight: '700', marginTop: 6 },
  planAmount: { fontSize: 42, color: Colors.textPrimary, fontWeight: '700', lineHeight: 48 },
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
  faqQ: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '600', lineHeight: 22 },
  faqChevron: { fontSize: 20, color: Colors.gold, lineHeight: 24, minWidth: 20, textAlign: 'center' },
  faqA: { fontSize: 14, color: Colors.textSecondary, lineHeight: 22, marginTop: Spacing.sm },

  // Final CTA
  finalCta: { paddingHorizontal: Spacing.lg, alignItems: 'center', gap: Spacing.md },
  finalSymbol: { fontSize: 36, color: Colors.gold },
  finalTitle: { fontSize: 28, color: Colors.textPrimary, fontWeight: '800', textAlign: 'center', lineHeight: 36 },
  finalSub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 23 },
})
