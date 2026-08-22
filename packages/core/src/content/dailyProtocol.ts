import { DailyProtocol, LunarPhase, ManifestationArea, ZodiacSign } from '../types'

const rituals: Record<LunarPhase, { title: string; description: string }> = {
  nueva: {
    title: 'Ritual de Siembra de Intenciones',
    description: 'Anota aquí 3 intenciones claras. Enciende una vela blanca y léelas en voz alta. Cierra los ojos e imagina que ya son tu realidad.',
  },
  creciente_inicial: {
    title: 'Ritual de Atracción',
    description: 'Sostén un objeto que represente lo que deseas. Respira profundo 7 veces. Declara: "Lo que deseo ya viene hacia mí con facilidad."',
  },
  cuarto_creciente: {
    title: 'Ritual de Acción',
    description: 'Anota aquí una acción concreta que tomarás hoy hacia tu meta. Comprométete en voz alta. El universo responde a quien actúa.',
  },
  creciente_gibosa: {
    title: 'Ritual de Expansión',
    description: 'Visualiza durante 5 minutos tu vida con todo lo que deseas. Siente la emoción en tu cuerpo. Termina con gratitud.',
  },
  llena: {
    title: 'Ritual de Gratitud Máxima',
    description: 'Anota aquí 10 cosas por las que estás agradecido/a hoy. Lee cada una lentamente. La luna llena amplifica tu campo de gratitud.',
  },
  menguante_gibosa: {
    title: 'Ritual de Liberación Inicial',
    description: 'Identifica un pensamiento limitante. Anótalo aquí. Visualiza cómo se disuelve y lo liberas. Declara: "Libero lo que no me sirve."',
  },
  cuarto_menguante: {
    title: 'Ritual de Soltar',
    description: 'Medita 10 minutos en silencio. Suelta expectativas. Confía en el proceso. La resistencia bloquea la abundancia.',
  },
  menguante_final: {
    title: 'Ritual de Cierre y Descanso',
    description: 'Revisa tus intenciones del mes. Celebra lo logrado. Perdona lo que no llegó. Descansa. El próximo ciclo trae nueva energía.',
  },
}

const affirmations: Record<number, string> = {
  1: 'Soy líder de mi propia vida. La abundancia fluye hacia mí con facilidad y gratitud.',
  2: 'Estoy en perfecta armonía con el universo. Recibo con amor todo lo que necesito.',
  3: 'Mi creatividad es mi mayor riqueza. Expreso mi abundancia con alegría cada día.',
  4: 'Mi disciplina construye mi prosperidad. Cada acción que tomo me acerca más a mis metas.',
  5: 'Abrazo el cambio con confianza. La libertad y la abundancia son mi estado natural.',
  6: 'El amor que doy regresa multiplicado. Vivo en abundancia porque soy abundancia.',
  7: 'Mi intuición me guía hacia la prosperidad. Confío en el proceso del universo.',
  8: 'Tengo el poder de manifestar mi prosperidad. El éxito es mi destino natural.',
  9: 'Soy un canal de abundancia para el mundo. Mientras más doy, más recibo.',
  11: 'Soy un ser de luz y abundancia. Mi propósito superior atrae todo lo que necesito.',
  22: 'Construyo mi realidad con intención y poder. La abundancia material es mi derecho.',
  33: 'Soy un maestro de la manifestación. Mi amor incondicional abre todos los caminos.',
}

const colors: Record<LunarPhase, { name: string; hex: string; reason: string }> = {
  nueva: { name: 'Blanco', hex: '#F0EEF8', reason: 'La luna nueva pide pureza y nuevos comienzos. El blanco limpia tu campo energético.' },
  creciente_inicial: { name: 'Verde', hex: '#4CAF82', reason: 'La luna creciente activa el campo de crecimiento y prosperidad.' },
  cuarto_creciente: { name: 'Amarillo', hex: '#F4C430', reason: 'El cuarto creciente amplifica tu confianza y claridad mental.' },
  creciente_gibosa: { name: 'Dorado', hex: '#C9A84C', reason: 'La energía está en su punto más expansivo. El dorado atrae abundancia máxima.' },
  llena: { name: 'Violeta', hex: '#7B3FD4', reason: 'La luna llena activa tu tercer ojo y tu poder de manifestación más alto.' },
  menguante_gibosa: { name: 'Azul', hex: '#4A90D9', reason: 'El azul calma y permite soltar lo que ya no sirve con gracia.' },
  cuarto_menguante: { name: 'Gris Plata', hex: '#9490B0', reason: 'La energía se retira. El plata protege tu campo mientras liberas.' },
  menguante_final: { name: 'Negro', hex: '#0D0A1E', reason: 'El negro absorbe lo que debes soltar antes del próximo ciclo.' },
}

// Alimentos por área × fase lunar — protagonistas de la recomendación diaria
const areaLunarFoods: Record<ManifestationArea, Record<LunarPhase, { items: string[]; reason: string }>> = {
  dinero: {
    nueva:             { items: ['Semillas de girasol', 'Nuez de la India'],  reason: 'Las semillas simbolizan riqueza que germina. Planta hoy la energía de prosperidad.' },
    creciente_inicial: { items: ['Canela', 'Almendras'],                      reason: 'La canela activa el flujo del dinero; las almendras sostienen tu energía para atraerlo.' },
    cuarto_creciente:  { items: ['Chocolate oscuro 80%', 'Café'],             reason: 'La dopamina del cacao y la energía del café te activan para tomar acción financiera.' },
    creciente_gibosa:  { items: ['Nueces', 'Dátiles'],                        reason: 'Nueces y dátiles vibran en la frecuencia de la riqueza y la expansión.' },
    llena:             { items: ['Miel cruda', 'Piña'],                       reason: 'La miel y la piña celebran la abundancia que ya tienes y abren el canal para más.' },
    menguante_gibosa:  { items: ['Apio', 'Limón'],                            reason: 'Limpian la ansiedad financiera del cuerpo. El dinero fluye cuando sueltas el miedo.' },
    cuarto_menguante:  { items: ['Avena', 'Linaza'],                          reason: 'Alimentos de raíz que sostienen tu energía financiera a largo plazo.' },
    menguante_final:   { items: ['Jengibre', 'Té verde'],                     reason: 'Activan la transición hacia el nuevo ciclo de prosperidad que viene.' },
  },
  amor: {
    nueva:             { items: ['Granada', 'Rosa comestible'],               reason: 'La granada abre el corazón a nuevos comienzos; la rosa sintoniza con el amor.' },
    creciente_inicial: { items: ['Fresas', 'Cardamomo'],                      reason: 'Fresas y cardamomo vibran en la frecuencia romántica del amor que crece.' },
    cuarto_creciente:  { items: ['Aguacate', 'Cacao puro'],                   reason: 'El aguacate nutre el corazón físico y energético. El cacao abre tu capacidad de amar.' },
    creciente_gibosa:  { items: ['Chocolate oscuro', 'Frambuesas'],           reason: 'La feniletilamina del chocolate replica la química del enamoramiento.' },
    llena:             { items: ['Cerezas', 'Higos'],                         reason: 'Cerezas e higos celebran la plenitud del amor que ya existe en tu vida.' },
    menguante_gibosa:  { items: ['Manzanilla', 'Melocotón'],                  reason: 'Suavizan las emociones y ayudan a soltar heridas que bloquean el amor.' },
    cuarto_menguante:  { items: ['Jengibre', 'Menta fresca'],                 reason: 'Limpian el campo emocional para recibir amor con más apertura.' },
    menguante_final:   { items: ['Agua de rosas', 'Lavanda comestible'],      reason: 'Preparan el corazón para el nuevo ciclo de amor con calma y ternura.' },
  },
  salud: {
    nueva:             { items: ['Germinados', 'Espirulina'],                  reason: 'Alimentos vivos para intenciones vivas. La espirulina renueva tu campo celular.' },
    creciente_inicial: { items: ['Espinaca', 'Maca'],                         reason: 'Hierro y adaptógeno: construyen la energía sostenida que tu vitalidad necesita.' },
    cuarto_creciente:  { items: ['Cúrcuma', 'Pimienta negra'],                reason: 'La cúrcuma con pimienta es el mayor antiinflamatorio natural. Acción concreta de salud.' },
    creciente_gibosa:  { items: ['Arándanos', 'Brócoli'],                     reason: 'Antioxidantes en su pico. Protegen y elevan tu campo de salud en el momento más expansivo.' },
    llena:             { items: ['Sandía', 'Pepino'],                         reason: 'Hidratación profunda en la luna llena. Tu cuerpo celebra cuando lo nutres bien.' },
    menguante_gibosa:  { items: ['Apio', 'Alcachofa'],                        reason: 'Apoyan el hígado y drenan toxinas. La fase menguante potencia la limpieza.' },
    cuarto_menguante:  { items: ['Avena', 'Semillas de calabaza'],            reason: 'Magnesio y fibra para el sistema nervioso y la digestión en proceso de soltar.' },
    menguante_final:   { items: ['Aloe vera', 'Caldo vegetal'],               reason: 'Regeneran el intestino y preparan el cuerpo para el nuevo ciclo de vitalidad.' },
  },
  proposito: {
    nueva:             { items: ['Arándanos', 'Semillas de chía'],            reason: 'El cerebro despierta con antioxidantes. Las chías sostienen la energía mental de tus nuevas intenciones.' },
    creciente_inicial: { items: ['Nueces', 'Aguacate'],                       reason: 'Omega-3 de nuez y aguacate: combustible premium para la mente que busca su misión.' },
    cuarto_creciente:  { items: ['Café', 'Maca'],                             reason: 'Enfoque activo y adaptógeno: la combinación para ejecutar tu propósito hoy.' },
    creciente_gibosa:  { items: ['Salmón o chía', 'Aceite de oliva'],         reason: 'DHA y grasas buenas en el pico expansivo. Tu cerebro manifiesta desde la claridad.' },
    llena:             { items: ['Huevos', 'Quinoa'],                         reason: 'Proteína completa para celebrar desde la fortaleza lo que has construido.' },
    menguante_gibosa:  { items: ['Ashwagandha', 'Té de tulsi'],               reason: 'Adaptógenos que liberan el cortisol. El propósito se vive mejor sin estrés crónico.' },
    cuarto_menguante:  { items: ['Avena', 'Plátano'],                         reason: 'Energía estable y triptófano para la mente serena que escucha su misión.' },
    menguante_final:   { items: ['Chamomila', 'Nuez moscada'],                reason: 'Calman la mente para que el próximo ciclo de propósito nazca desde la paz.' },
  },
  felicidad: {
    nueva:             { items: ['Plátano', 'Cacao crudo'],                   reason: 'Triptófano del plátano y anandamida del cacao: química de la felicidad desde el primer día.' },
    creciente_inicial: { items: ['Naranja', 'Kiwi'],                          reason: 'Vitamina C y serotonina. Tu alegría crece con cada cítrico que consumes.' },
    cuarto_creciente:  { items: ['Chocolate oscuro', 'Fresas'],               reason: 'Endorfinas y dopamina: el combo de la felicidad activa que toma acción.' },
    creciente_gibosa:  { items: ['Mango', 'Piña'],                            reason: 'Frutas tropicales en el pico de la energía. La alegría se amplifica con lo que comes.' },
    llena:             { items: ['Sandía', 'Frutos del bosque'],              reason: 'Hidratación y antioxidantes para celebrar la vida en su máxima expresión.' },
    menguante_gibosa:  { items: ['Manzanilla', 'Pera'],                       reason: 'Suavizan la tristeza acumulada. Soltar lo que duele devuelve la alegría natural.' },
    cuarto_menguante:  { items: ['Avena', 'Vainilla natural'],                reason: 'La vainilla eleva el ánimo suavemente. La avena estabiliza la serotonina a largo plazo.' },
    menguante_final:   { items: ['Té de azahar', 'Miel'],                    reason: 'Dulzura consciente para cerrar el ciclo. La felicidad también es saber descansar.' },
  },
}

const lunarFoods: Record<LunarPhase, { item: string; reason: string }> = {
  nueva:             { item: 'Semillas germinadas', reason: 'Las semillas germinadas activan la energía de nuevos comienzos.' },
  creciente_inicial: { item: 'Kiwi',                reason: 'El kiwi impulsa la vitalidad en la fase de crecimiento.' },
  cuarto_creciente:  { item: 'Huevos o legumbres',  reason: 'La proteína completa sostiene tu energía expansiva.' },
  creciente_gibosa:  { item: 'Mango o piña',        reason: 'Las frutas tropicales elevan tu vibración en el pico creciente.' },
  llena:             { item: 'Ajo y limón',          reason: 'La luna llena potencia la depuración y la claridad.' },
  menguante_gibosa:  { item: 'Apio o pepino',       reason: 'Los alimentos ligeros acompañan la fase de soltar.' },
  cuarto_menguante:  { item: 'Avena o linaza',       reason: 'La fibra nutre el proceso de limpieza interior.' },
  menguante_final:   { item: 'Caldo vegetal',        reason: 'Alimentos líquidos y suaves regeneran antes del nuevo ciclo.' },
}

const foods: Record<ZodiacSign, { items: string[]; reason: string }> = {
  aries: { items: ['Granada', 'Carne roja magra', 'Jengibre', 'Ají'], reason: 'Tu elemento fuego necesita alimentos que sostengan tu energía explosiva.' },
  tauro: { items: ['Aguacate', 'Nueces', 'Fresas', 'Queso'], reason: 'Tu elemento tierra se nutre con alimentos densos y placenteros.' },
  geminis: { items: ['Frutas cítricas', 'Frutos secos', 'Espinaca', 'Menta'], reason: 'Tu mente activa necesita nutrientes que mantengan el enfoque.' },
  cancer: { items: ['Leche de coco', 'Arroz integral', 'Calabaza', 'Melón'], reason: 'Tu elemento agua requiere alimentos que nutran desde adentro.' },
  leo: { items: ['Mango', 'Almendras', 'Proteína limpia', 'Cúrcuma'], reason: 'Tu energía solar necesita vitalidad. Aliméntate como el rey que eres.' },
  virgo: { items: ['Vegetales verdes', 'Semillas', 'Yogur natural', 'Avena'], reason: 'Tu cuerpo responde mejor a alimentos limpios y de fácil digestión.' },
  libra: { items: ['Manzana', 'Uvas', 'Té verde', 'Tofu'], reason: 'Tu búsqueda de equilibrio empieza en lo que comes. Busca balance nutricional.' },
  escorpio: { items: ['Arándanos', 'Chocolate oscuro', 'Betabel', 'Proteína'], reason: 'Tu intensidad necesita antioxidantes que limpien y potencien tu energía.' },
  sagitario: { items: ['Frutas tropicales', 'Quinoa', 'Cúrcuma', 'Nueces'], reason: 'Tu espíritu libre necesita energía sostenida para todas tus aventuras.' },
  capricornio: { items: ['Avena', 'Huevos', 'Legumbres', 'Vegetales de raíz'], reason: 'Tu disciplina se apoya en alimentos que dan energía duradera y estable.' },
  acuario: { items: ['Algas marinas', 'Frutos del bosque', 'Linaza', 'Agua mineral'], reason: 'Tu innovación necesita nutrientes que activen tu mente y circulación.' },
  piscis: { items: ['Pescado', 'Pepino', 'Agua de coco', 'Frutas suaves'], reason: 'Tu elemento agua se equilibra con alimentos que hidratan y calman.' },
}

const biohacks: Record<LunarPhase, string> = {
  nueva: 'Meditación de 10 minutos en silencio absoluto al amanecer. La luna nueva potencia el inicio desde el cero.',
  creciente_inicial: 'Paseo de 20 minutos en la naturaleza o parque. La luna creciente amplifica tu campo magnético en movimiento.',
  cuarto_creciente: 'Ejercicio de alta intensidad por 20 minutos. La energía creciente potencia tu fuerza física.',
  creciente_gibosa: 'Baño de sol directo por 15 minutos. La energía está en su pico. Absorbe vitalidad.',
  llena: 'Yoga o estiramientos bajo la luna llena si es posible al aire libre. La luna llena amplifica todo lo que haces.',
  menguante_gibosa: 'Caminata consciente y lenta de 30 minutos. La energía baja pide movimiento suave y reflexivo.',
  cuarto_menguante: 'Respiración profunda: 4 tiempos inhala, 4 sostén, 8 exhala. Repite 10 veces. Soltar es un acto físico.',
  menguante_final: 'Descanso consciente. Acuéstate temprano. El ciclo pide regeneración. No es pereza, es sabiduría.',
}

const protocols: Record<LunarPhase, { morning: string; afternoon: string; night: string }> = {
  nueva: {
    morning: 'Embellece un rincón de tu casa. Un espacio ordenado abre el campo para lo nuevo.',
    afternoon: 'Anota aquí una meta concreta para este ciclo lunar.',
    night: 'Cena consciente sin distracciones. Siente gratitud por cada alimento.',
  },
  creciente_inicial: {
    morning: 'Declara en voz alta tu intención del día antes de revisar el celular.',
    afternoon: 'Envía un mensaje de amor, gratitud o alegría a alguien sin motivo.',
    night: 'Anota aquí 3 cosas que avanzaron hoy hacia tu meta, por pequeñas que sean.',
  },
  cuarto_creciente: {
    morning: 'Haz una acción concreta hacia tu meta antes del mediodía.',
    afternoon: 'Desconéctate 30 minutos de pantallas. Reconecta con tu intención.',
    night: 'Visualiza tu meta cumplida durante 5 minutos antes de dormir.',
  },
  creciente_gibosa: {
    morning: 'Vístete con tu color del día y siente cómo cambia tu energía.',
    afternoon: 'Comparte algo positivo en tu círculo cercano. La energía alta se multiplica.',
    night: 'Anota aquí tu afirmación del día 7 veces — escribirla activa su poder.',
  },
  llena: {
    morning: 'Haz una limpieza rápida de tu espacio. La luna llena amplifica todo, incluyendo el desorden.',
    afternoon: 'Celebra un logro reciente aunque sea pequeño. La celebración atrae más.',
    night: 'Anota aquí 10 gratitudes del mes. Lee cada una en voz alta.',
  },
  menguante_gibosa: {
    morning: 'Identifica un hábito que quieres soltar. Anótalo aquí y ponle fecha de cierre.',
    afternoon: 'Sal a caminar sin celular. Observa. La naturaleza enseña a soltar.',
    night: 'Perdona a alguien en tu mente antes de dormir. El perdón libera tu campo.',
  },
  cuarto_menguante: {
    morning: 'No revises redes sociales en las primeras 2 horas. Tu energía es tuya.',
    afternoon: 'Ordena un cajón, carpeta o espacio digital. El orden externo refleja el interno.',
    night: 'Apaga pantallas 1 hora antes de dormir. El silencio es parte del sistema.',
  },
  menguante_final: {
    morning: 'Reflexiona: ¿Qué aprendiste este ciclo lunar? Anótalo aquí.',
    afternoon: 'Descansa sin culpa. La regeneración es parte del proceso de abundancia.',
    night: 'Anota aquí tus intenciones para el próximo ciclo. La luna nueva está cerca.',
  },
}

const frequencyNames: Record<number, string> = {
  396: 'Liberación del miedo',
  417: 'Facilitar el cambio',
  432: 'Expansión natural',
  528: 'Transformación y amor',
  639: 'Conexión y relaciones',
  741: 'Despertar la intuición',
  852: 'Orden espiritual',
  963: 'Conexión con el todo',
}

const areaRituals: Record<ManifestationArea, Record<LunarPhase, { title: string; description: string }>> = {
  dinero: {
    nueva: { title: 'Ritual de Prosperidad', description: 'Anota aquí 3 metas financieras concretas. Sostén un billete mientras las lees en voz alta. Declara: "El dinero fluye hacia mí con facilidad y gracia."' },
    creciente_inicial: { title: 'Ritual de Atracción Financiera', description: 'Coloca monedas en un vaso con agua bajo la luz. Visualiza tu cuenta bancaria con el saldo que deseas. Siente la seguridad de tenerlo.' },
    cuarto_creciente: { title: 'Ritual de Acción Financiera', description: 'Anota aquí una acción concreta de dinero que tomarás hoy. Puede ser cobrar, ahorrar, invertir o generar. El dinero responde a la acción, no solo a la intención.' },
    creciente_gibosa: { title: 'Ritual de Expansión de Riqueza', description: 'Visualiza durante 7 minutos tu vida con abundancia financiera completa. Siente cada detalle. Termina con: "Gracias porque ya es mío."' },
    llena: { title: 'Ritual de Gratitud por la Abundancia', description: 'Anota aquí 10 formas en que el dinero ya fluye en tu vida. La gratitud por lo que tienes abre el canal para recibir más.' },
    menguante_gibosa: { title: 'Ritual de Liberación de Escasez', description: 'Anota aquí tus creencias limitantes sobre el dinero. Visualiza cómo las liberas y se disuelven. Declara: "Libero la mentalidad de escasez. Soy digno/a de abundancia."' },
    cuarto_menguante: { title: 'Ritual de Soltar el Control', description: 'Medita 10 minutos soltando la ansiedad por el dinero. La desesperación aleja la abundancia. Confía en el proceso.' },
    menguante_final: { title: 'Ritual de Cierre Financiero', description: 'Revisa tus intenciones financieras del ciclo. Celebra cada avance. Perdona los retrasos. El próximo ciclo trae nuevas oportunidades.' },
  },
  amor: {
    nueva: { title: 'Ritual de Amor Propio', description: 'Frente al espejo, di 3 cosas que amas de ti. El amor externo comienza con el amor interno. Enciende una vela rosa y declara: "Soy amor y merezco amor."' },
    creciente_inicial: { title: 'Ritual de Apertura al Amor', description: 'Anota aquí cómo quieres sentirte en tu relación ideal. No describes a la persona — describes la EMOCIÓN. El universo trae lo que vibras.' },
    cuarto_creciente: { title: 'Ritual de Acción en el Amor', description: 'Haz un gesto de amor hoy. Hacia ti mismo/a o hacia alguien más. El amor crece cuando se expresa, no cuando se guarda.' },
    creciente_gibosa: { title: 'Ritual de Atracción Romántica', description: 'Visualiza 7 minutos tu relación ideal con todos los detalles sensoriales. Siente el amor en tu cuerpo. Termina con gratitud.' },
    llena: { title: 'Ritual de Amor Pleno', description: 'La luna llena amplifica el amor. Escribe aquí una carta de amor — a tu pareja, a alguien que deseas, o a ti mismo. Léela en voz alta.' },
    menguante_gibosa: { title: 'Ritual de Liberación de Heridas', description: 'Identifica una herida emocional que te impide dar o recibir amor. Anótala aquí. Declara: "Libero este dolor con amor y gratitud."' },
    cuarto_menguante: { title: 'Ritual de Perdón', description: 'Perdona a alguien que te lastimó — incluyéndote a ti. El perdón no justifica. Te libera a ti. Sin perdón, el amor no puede entrar.' },
    menguante_final: { title: 'Ritual de Cierre Emocional', description: 'Reflexiona: ¿Cuánto amor diste y recibiste este ciclo? Honra ambos. El siguiente ciclo trae más capacidad de amar.' },
  },
  salud: {
    nueva: { title: 'Ritual de Intención de Salud', description: 'Anota aquí 3 intenciones de salud para este ciclo. Sé específico/a: no "estar sano" sino "sentirme con energía al despertar". Bebe un vaso de agua mientras las lees.' },
    creciente_inicial: { title: 'Ritual de Vitalidad', description: 'Conecta con tu cuerpo. Pon las manos en tu corazón y di: "Mi cuerpo sana, mi cuerpo es fuerte, mi cuerpo me apoya." Siente el calor de tus manos.' },
    cuarto_creciente: { title: 'Ritual de Acción por tu Salud', description: 'Elige UNA acción concreta por tu salud hoy: un alimento mejor, movimiento, descanso, hidratación. La salud se construye decisión a decisión.' },
    creciente_gibosa: { title: 'Ritual de Visualización de Salud', description: 'Visualiza 7 minutos tu cuerpo completamente sano, lleno de energía. Siente la ligereza, la fuerza, la vitalidad. Tu mente crea la realidad física.' },
    llena: { title: 'Ritual de Gratitud por tu Cuerpo', description: 'Anota aquí 10 cosas que tu cuerpo hace por ti cada día. La gratitud por tu cuerpo activa su capacidad de sanar y regenerarse.' },
    menguante_gibosa: { title: 'Ritual de Detox Energético', description: 'La luna menguante es ideal para soltar toxinas. Bebe agua con limón, muévete suavemente. Anota aquí qué hábito tóxico quieres soltar.' },
    cuarto_menguante: { title: 'Ritual de Descanso Consciente', description: 'El descanso es parte de la salud. Duerme temprano, desconecta pantallas. Declara: "Mi cuerpo sana mientras duermo."' },
    menguante_final: { title: 'Ritual de Reconexión Corporal', description: 'Reflexiona sobre tu salud este ciclo. ¿Qué mejoró? ¿Qué necesita más atención? Sé compasivo/a. El cuerpo responde al amor.' },
  },
  proposito: {
    nueva: { title: 'Ritual de Claridad de Propósito', description: 'Pregúntate: ¿Para qué estoy aquí? Escribe aquí sin filtros durante 5 minutos. No edites. Las respuestas más honestas aparecen cuando dejas de pensar.' },
    creciente_inicial: { title: 'Ritual de Alineación con tu Misión', description: 'Visualiza tu vida completamente alineada con tu propósito. ¿Cómo te sientes? ¿Qué estás haciendo? ¿Con quién estás? El propósito tiene forma.' },
    cuarto_creciente: { title: 'Ritual de Acción con Propósito', description: 'Haz hoy UNA acción que esté alineada con tu propósito más profundo. No importa si es pequeña. La consistencia construye el destino.' },
    creciente_gibosa: { title: 'Ritual de Expansión de Misión', description: 'Visualiza tu propósito cumplido al máximo nivel. ¿Cuántas personas impactas? ¿Cómo se ve tu legado? Permítete soñar en grande.' },
    llena: { title: 'Ritual de Celebración del Propósito', description: 'Celebra los pasos que ya diste hacia tu propósito. Anota aquí tus logros. La luna llena amplifica lo que reconoces y agradeces.' },
    menguante_gibosa: { title: 'Ritual de Soltar el Miedo al Propósito', description: 'El miedo a brillar es real. Anota aquí tus miedos sobre vivir tu propósito. Lo que se nombra pierde su poder.' },
    cuarto_menguante: { title: 'Ritual de Silencio Interior', description: 'El propósito se escucha en el silencio. Medita 15 minutos sin agenda. Solo observa. Tu propósito te habla cuando dejas de buscar.' },
    menguante_final: { title: 'Ritual de Integración del Propósito', description: 'Reflexiona: ¿Qué aprendiste sobre tu propósito este ciclo? Cada ciclo revela una capa más profunda. Honra el proceso.' },
  },
  felicidad: {
    nueva: { title: 'Ritual de Intención de Alegría', description: 'Anota aquí 3 cosas que genuinamente te hacen feliz. Comprométete a incluir al menos una hoy. La felicidad no es un destino — es una práctica diaria.' },
    creciente_inicial: { title: 'Ritual de Expansión de Gozo', description: 'Recuerda un momento de felicidad pura. Revívelo con todos los sentidos. Esa frecuencia sigue disponible para ti en cualquier momento.' },
    cuarto_creciente: { title: 'Ritual de Acción Gozosa', description: 'Haz algo hoy que hagas SOLO porque te hace feliz. Sin justificación. Sin productividad. La alegría es suficiente razón.' },
    creciente_gibosa: { title: 'Ritual de Amplificación de Alegría', description: 'Comparte tu alegría. Llama a alguien que quieres. Sonríe a un extraño. La felicidad se multiplica cuando se comparte.' },
    llena: { title: 'Ritual de Celebración de la Vida', description: 'La luna llena pide celebración. Haz algo especial esta noche. Baila, canta, ríe. El universo ama cuando sus hijos celebran.' },
    menguante_gibosa: { title: 'Ritual de Soltar la Tristeza', description: 'Anota aquí qué está robando tu alegría. Sin juzgar. Luego declara: "Elijo soltar esto y elegir la felicidad en este momento."' },
    cuarto_menguante: { title: 'Ritual de Paz Interior', description: 'La felicidad profunda viene de la paz, no de la emoción constante. Medita. Respira. Suelta la necesidad de más. Estás completo/a ahora.' },
    menguante_final: { title: 'Ritual de Gratitud por la Alegría Vivida', description: 'Anota aquí los momentos de felicidad genuina de este ciclo. Por pequeños que sean. La gratitud por la alegría invita más alegría.' },
  },
}

const areaFrequencies: Record<ManifestationArea, number> = {
  dinero: 528,
  amor: 639,
  salud: 396,
  proposito: 741,
  felicidad: 432,
}

const areaColors: Record<ManifestationArea, { name: string; hex: string; reason: string }> = {
  dinero: { name: 'Verde Dorado', hex: '#8BC34A', reason: 'El verde activa el campo de prosperidad y el dorado lo amplifica.' },
  amor: { name: 'Rosa', hex: '#E91E8C', reason: 'El rosa sintoniza tu campo con la frecuencia del amor incondicional.' },
  salud: { name: 'Turquesa', hex: '#26C6DA', reason: 'El turquesa activa la energía de sanación y regeneración.' },
  proposito: { name: 'Violeta', hex: '#7B3FD4', reason: 'El violeta conecta con tu propósito superior y claridad de misión.' },
  felicidad: { name: 'Amarillo Sol', hex: '#FFD600', reason: 'El amarillo irradia alegría y eleva tu vibración instantáneamente.' },
}

const areaProtocols: Record<ManifestationArea, Record<LunarPhase, { morning: string; afternoon: string; night: string }>> = {
  dinero: {
    nueva: { morning: 'Revisa tus finanzas con calma. Saber dónde estás es el primer paso.', afternoon: 'Investiga una fuente de ingreso nueva aunque sea 15 minutos.', night: 'Visualiza tu cuenta bancaria con el saldo que deseas. Duerme en esa frecuencia.' },
    creciente_inicial: { morning: 'Declara en voz alta: "Hoy recibo dinero de formas esperadas e inesperadas."', afternoon: 'Da un paso concreto hacia una meta financiera.', night: 'Anota aquí 3 formas en que el dinero ya fluye en tu vida.' },
    cuarto_creciente: { morning: 'Cobra algo que te deben o genera un ingreso pequeño hoy.', afternoon: 'Aprende algo sobre dinero, inversión o finanzas por 20 minutos.', night: 'Celebra cualquier entrada de dinero del día, por pequeña que sea.' },
    creciente_gibosa: { morning: 'Vístete como alguien próspero. La energía externa refuerza la interna.', afternoon: 'Envía una propuesta, precio o servicio a alguien.', night: 'Anota aquí tu afirmación financiera 7 veces.' },
    llena: { morning: 'Organiza tu espacio de trabajo o dinero. El orden atrae abundancia.', afternoon: 'Celebra un logro financiero reciente aunque sea pequeño.', night: 'Anota aquí 10 gratitudes por el dinero que ya tienes.' },
    menguante_gibosa: { morning: 'Identifica un gasto que no te sirve. Elimínalo esta semana.', afternoon: 'Suelta la ansiedad financiera. Camina 20 min y respira.', night: 'Perdona a alguien que te deba o haya fallado financieramente.' },
    cuarto_menguante: { morning: 'No revises redes. Usa esa energía en algo productivo financieramente.', afternoon: 'Organiza documentos, facturas o registros financieros.', night: 'Agradece y cierra el ciclo. El próximo trae más.' },
    menguante_final: { morning: 'Reflexiona: ¿Qué creencia sobre el dinero quieres cambiar? Anótala aquí.', afternoon: 'Descansa. La regeneración también aplica a tu relación con el dinero.', night: 'Anota aquí tus intenciones financieras para el próximo ciclo lunar.' },
  },
  amor: {
    nueva: { morning: 'Mírate al espejo y di: "Me elijo. Soy suficiente."', afternoon: 'Envía un mensaje de amor genuino a alguien sin esperar nada.', night: 'Anota aquí cómo quieres sentirte en tu relación ideal.' },
    creciente_inicial: { morning: 'Usa una prenda que te haga sentir atractivo/a y seguro/a.', afternoon: 'Haz algo que genuinamente disfrutes — el amor propio atrae amor.', night: 'Visualiza tu amor ideal con detalle. Siente la emoción.' },
    cuarto_creciente: { morning: 'Haz un gesto de amor hoy — hacia ti o alguien más.', afternoon: 'Abre una conversación con alguien que te importa.', night: 'Anota aquí 3 cualidades tuyas que hacen de ti una gran pareja.' },
    creciente_gibosa: { morning: 'Embellece tu espacio personal. El amor vive en entornos cuidados.', afternoon: 'Comparte algo tuyo con alguien. El amor se da.', night: 'Anota aquí tu afirmación de amor 7 veces.' },
    llena: { morning: 'Haz algo especial por ti. Una cita contigo mismo/a.', afternoon: 'Expresa amor a alguien importante en tu vida.', night: 'Anota aquí 10 gratitudes por el amor que ya existe en tu vida.' },
    menguante_gibosa: { morning: 'Identifica un patrón que aleja el amor. Nómbralo.', afternoon: 'Perdona una decepción amorosa pasada. El perdón libera espacio.', night: 'Suelta expectativas. El amor llega cuando dejas de controlarlo.' },
    cuarto_menguante: { morning: 'Medita en silencio sobre lo que el amor significa para ti.', afternoon: 'Reduce tiempo en redes. El amor real no vive ahí.', night: 'Duerme temprano. El amor también necesita que estés descansado/a.' },
    menguante_final: { morning: 'Reflexiona: ¿Cómo puedo amar mejor en el próximo ciclo? Anótalo aquí.', afternoon: 'Descansa y recarga. El amor fluye desde un lugar lleno.', night: 'Anota aquí tus intenciones de amor para la próxima luna nueva.' },
  },
  salud: {
    nueva: { morning: 'Bebe un vaso de agua en ayunas con intención de salud.', afternoon: 'Elige un alimento nutritivo con consciencia plena.', night: 'Anota aquí 3 intenciones de salud para este ciclo.' },
    creciente_inicial: { morning: 'Mueve tu cuerpo 20 minutos. La energía creciente potencia el ejercicio.', afternoon: 'Come con consciencia. Sin pantallas. Solo tú y tu alimento.', night: 'Visualiza tu cuerpo lleno de salud y vitalidad.' },
    cuarto_creciente: { morning: 'Toma aire fresco. Sal aunque sea 10 minutos.', afternoon: 'Elige la opción más sana en cada decisión de hoy.', night: 'Duerme 8 horas. El sueño es el mayor acto de salud.' },
    creciente_gibosa: { morning: 'Estira tu cuerpo al despertar. Dale las gracias.', afternoon: 'Hidratación consciente — toma agua cada hora.', night: 'Anota aquí tu afirmación de salud 7 veces.' },
    llena: { morning: 'Sal al sol directo 15 minutos. La luna llena también se refleja de día.', afternoon: 'Celebra algo que tu cuerpo logró esta semana.', night: 'Anota aquí 10 gratitudes por tu salud.' },
    menguante_gibosa: { morning: 'Día de detox suave: frutas, agua, movimiento lento.', afternoon: 'Identifica un hábito que daña tu salud. Ponle fecha de cierre.', night: 'Duerme con la ventana entreabierta. Oxígeno fresco sana.' },
    cuarto_menguante: { morning: 'Desayuno consciente y nutritivo. Sin prisa.', afternoon: 'Descansa activamente: camina lento, respira profundo.', night: 'Sin pantallas 1 hora antes de dormir. Tu sistema nervioso lo necesita.' },
    menguante_final: { morning: 'Reflexiona: ¿Qué le ha faltado a tu cuerpo este ciclo? Anótalo aquí.', afternoon: 'Descansa sin culpa. La regeneración es parte del ciclo de salud.', night: 'Anota aquí tus intenciones de salud para el próximo ciclo.' },
  },
  proposito: {
    nueva: { morning: 'Anota aquí sin filtros: ¿qué quiero crear en el mundo?', afternoon: 'Lee o escucha algo que esté alineado con tu propósito.', night: 'Visualiza tu vida completamente alineada con tu misión.' },
    creciente_inicial: { morning: 'Declara en voz alta tu propósito como si ya fuera real.', afternoon: 'Da un paso pequeño pero concreto hacia tu propósito hoy.', night: 'Anota aquí 3 acciones que puedes tomar esta semana.' },
    cuarto_creciente: { morning: 'Trabaja en tu propósito antes de revisar el celular.', afternoon: 'Conecta con alguien que esté en el camino que tú quieres.', night: 'Celebra el paso que diste hoy hacia tu propósito.' },
    creciente_gibosa: { morning: 'Actúa como si ya vivieras tu propósito. ¿Cómo te vestirías?', afternoon: 'Comparte algo de tu propósito con alguien. Nombrarlo lo hace real.', night: 'Anota aquí tu afirmación de propósito 7 veces.' },
    llena: { morning: 'Revisa cuánto has avanzado. Celebra con gratitud.', afternoon: 'Haz algo memorable relacionado con tu propósito.', night: 'Anota aquí 10 razones por las que tu propósito importa.' },
    menguante_gibosa: { morning: 'Identifica qué te distrae de tu propósito. Elimínalo.', afternoon: 'Suelta la necesidad de que todo salga perfecto.', night: 'Perdona los retrasos. El timing del universo es perfecto.' },
    cuarto_menguante: { morning: 'Silencio creativo: sin redes, sin ruido. Solo tú y tu propósito.', afternoon: 'Organiza tus ideas y planes. El orden facilita la misión.', night: 'Medita en tu propósito. El silencio revela el camino.' },
    menguante_final: { morning: 'Reflexiona: ¿Qué aprendí sobre mi propósito este ciclo? Anótalo aquí.', afternoon: 'Descansa. Los grandes propósitos necesitan personas descansadas.', night: 'Anota aquí tus intenciones de propósito para el próximo ciclo.' },
  },
  felicidad: {
    nueva: { morning: 'Sonríe antes de levantarte. El cuerpo sigue a la mente.', afternoon: 'Haz algo pequeño que te alegre sin razón.', night: 'Anota aquí 3 fuentes de felicidad genuina en tu vida.' },
    creciente_inicial: { morning: 'Declara: "Hoy elijo ser feliz independientemente de las circunstancias."', afternoon: 'Comparte una alegría con alguien cercano.', night: 'Visualiza tu día ideal — lleno de momentos de gozo.' },
    cuarto_creciente: { morning: 'Haz algo que hagas solo porque te hace feliz.', afternoon: 'Ríe. Busca algo gracioso. La risa sana y eleva la vibración.', night: 'Anota aquí el mejor momento de tu día.' },
    creciente_gibosa: { morning: 'Embellece un espacio de tu casa. La belleza externa crea gozo interno.', afternoon: 'Conecta con alguien que te da felicidad genuina.', night: 'Anota aquí tu afirmación de felicidad 7 veces.' },
    llena: { morning: 'Celebra. Baila. Canta. La luna llena pide expresión de alegría.', afternoon: 'Haz algo especial — para ti o para alguien más.', night: 'Anota aquí 10 gratitudes por la alegría en tu vida.' },
    menguante_gibosa: { morning: 'Identifica qué está robando tu alegría. Ponle nombre.', afternoon: 'Suelta una expectativa que te genera sufrimiento.', night: 'Perdona algo o a alguien. El perdón devuelve la alegría.' },
    cuarto_menguante: { morning: 'Silencio. La paz es la base de la alegría duradera.', afternoon: 'Desconéctate de lo que no te nutre.', night: 'Duerme temprano. La felicidad empieza con descanso.' },
    menguante_final: { morning: 'Reflexiona: ¿Qué momentos de felicidad genuina viví este ciclo? Anótalo aquí.', afternoon: 'Descansa sin culpa. El gozo también viene del descanso.', night: 'Anota aquí tus intenciones de alegría para el próximo ciclo.' },
  },
}

export function generateDailyProtocol(
  lunarPhase: LunarPhase,
  zodiacSign: ZodiacSign,
  numerologyNumber: number,
  baseFrequency: number,
  manifestationArea: ManifestationArea = 'proposito'
): DailyProtocol {
  const areaFrequency = areaFrequencies[manifestationArea]
  const areaColor = areaColors[manifestationArea]
  const lunarColor = colors[lunarPhase]

  return {
    ritual: areaRituals[manifestationArea][lunarPhase],
    affirmation: affirmations[numerologyNumber] || affirmations[1],
    color: {
      name: `${lunarColor.name} · ${areaColor.name}`,
      hex: lunarColor.hex,
      reason: `${lunarColor.reason} ${areaColor.reason}`,
    },
    colors: [
      { name: lunarColor.name, hex: lunarColor.hex, reason: lunarColor.reason },
      { name: areaColor.name,  hex: areaColor.hex,  reason: areaColor.reason  },
    ],
    foods: [
      ...areaLunarFoods[manifestationArea][lunarPhase].items,
      lunarFoods[lunarPhase].item,
      foods[zodiacSign].items[0],
    ],
    foodReason: `${areaLunarFoods[manifestationArea][lunarPhase].reason} · ${lunarFoods[lunarPhase].reason} · ${foods[zodiacSign].reason}`,
    biohack: {
      activity: biohacks[lunarPhase],
      activityReason: '',
    },
    frequency: {
      hz: areaFrequency,
      name: frequencyNames[areaFrequency] || 'Expansión',
    },
    protocol: areaProtocols[manifestationArea][lunarPhase],
  }
}
