import { calculateNumerology } from './calculations'

// ── Types ──────────────────────────────────────────────────────────────────────
export type AlignmentTier = 'action' | 'building' | 'reception'

export interface AlignmentResult {
  score: number          // 45–98, integer
  tier:  AlignmentTier
  label: string          // "Día de acción" / "Día de construcción" / "Día de recepción"
}

export interface AlignmentInput {
  birthDate:         string  // YYYY-MM-DD
  fullName:          string
  zodiacSign:        string
  lunarPhase:        string  // LunarPhase key, e.g. 'llena'
  manifestationArea: string  // ManifestationArea key, e.g. 'dinero'
  date:              Date
}

// ── Lunar phase base scores (40 % weight) ─────────────────────────────────────
const LUNAR_SCORE: Record<string, number> = {
  nueva:            85,
  creciente_inicial: 78,
  cuarto_creciente:  82,
  creciente_gibosa:  90,
  llena:             95,
  menguante_gibosa:  70,
  cuarto_menguante:  60,
  menguante_final:   55,
}

// ── Zodiac element–phase affinity (30 % weight) ───────────────────────────────
// 3 tiers: PRIMARY=90 (peak resonance), SECONDARY=73, LOW=50.
// Each phase has exactly one primary element set, one secondary, one low.
// This ensures two profiles that share element tier but differ in element
// (e.g. water vs fire in creciente_gibosa) produce a meaningful score gap.
const FIRE  = new Set(['aries', 'leo', 'sagitario'])
const EARTH = new Set(['tauro', 'virgo', 'capricornio'])
const AIR   = new Set(['geminis', 'libra', 'acuario'])
const WATER = new Set(['cancer', 'escorpio', 'piscis'])

type ElementSet = Set<string>
const ZODIAC_TIERS: Record<string, { primary: ElementSet[]; secondary: ElementSet[]; low: ElementSet[] }> = {
  nueva:             { primary: [EARTH, AIR], secondary: [FIRE],       low: [WATER]       },
  creciente_inicial: { primary: [FIRE],       secondary: [AIR, WATER], low: [EARTH]       },
  cuarto_creciente:  { primary: [FIRE, AIR],  secondary: [WATER],      low: [EARTH]       },
  creciente_gibosa:  { primary: [WATER],      secondary: [FIRE, AIR],  low: [EARTH]       },
  llena:             { primary: [WATER, FIRE], secondary: [AIR],       low: [EARTH]       },
  menguante_gibosa:  { primary: [WATER, EARTH], secondary: [AIR],      low: [FIRE]        },
  cuarto_menguante:  { primary: [EARTH],      secondary: [WATER],      low: [AIR, FIRE]   },
  menguante_final:   { primary: [EARTH, WATER], secondary: [AIR],      low: [FIRE]        },
}

function zodiacScore(zodiac: string, phase: string): number {
  const z = zodiac.toLowerCase()
  const p = phase.toLowerCase()
  let elem: ElementSet | undefined
  if (FIRE.has(z))  elem = FIRE
  else if (EARTH.has(z)) elem = EARTH
  else if (AIR.has(z))   elem = AIR
  else if (WATER.has(z)) elem = WATER
  else return 70

  const tiers = ZODIAC_TIERS[p]
  if (!tiers) return 70
  if (tiers.primary.includes(elem))   return 90
  if (tiers.secondary.includes(elem)) return 73
  return 50
}

// ── Area affinity to lunar phase (10 % weight) ────────────────────────────────
// Sanación/paz covers salud + felicidad per spec
const AREA_HIGH: Record<string, Set<string>> = {
  dinero:    new Set(['creciente_inicial', 'cuarto_creciente', 'creciente_gibosa', 'llena']),
  proposito: new Set(['nueva', 'cuarto_creciente']),
  amor:      new Set(['llena', 'creciente_gibosa']),
  salud:     new Set(['menguante_final', 'cuarto_menguante', 'menguante_gibosa']),
  felicidad: new Set(['menguante_final', 'cuarto_menguante', 'menguante_gibosa']),
}

function areaScore(area: string, phase: string): number {
  const high = AREA_HIGH[area.toLowerCase()]
  if (!high) return 65
  return high.has(phase.toLowerCase()) ? 90 : 65
}

// ── Personal-day numerology (20 % weight) ─────────────────────────────────────
// Compatibility groups: 1-5-7 / 2-4-8 / 3-6-9
const COMPAT: number[][] = [[1, 5, 7], [2, 4, 8], [3, 6, 9]]

function reduceSingle(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((s, d) => s + +d, 0)
  }
  return n
}

// Life number: name numerology + sum of birth-date digits, reduced together
function lifeNumber(fullName: string, birthDate: string): number {
  const nameN   = calculateNumerology(fullName)
  const dateSum = birthDate.replace(/\D/g, '').split('').reduce((s, d) => s + +d, 0)
  return reduceSingle(nameN + dateSum)
}

// Day number: day + month + sum-of-year-digits, reduced
function dayNumber(date: Date): number {
  const d    = date.getDate()
  const m    = date.getMonth() + 1
  const ySum = String(date.getFullYear()).split('').reduce((s, c) => s + +c, 0)
  let   sum  = d + m + ySum
  while (sum > 9) sum = String(sum).split('').reduce((s, c) => s + +c, 0)
  return sum === 0 ? 9 : sum
}

// Reduce master numbers to base for compatibility comparison
function baseNum(n: number): number {
  return n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n
}

function numerologyScore(life: number, day: number): number {
  const l = baseNum(life)
  const d = baseNum(day)
  if (l === d) return 95
  for (const g of COMPAT) if (g.includes(l) && g.includes(d)) return 80
  return 60
}

// ── Normalisation [raw_min, raw_max] → [45, 98] ───────────────────────────────
// Theoretical raw bounds with 3-tier zodiac (50/73/90):
//   min ≈ 55*0.4 + 50*0.3 + 60*0.2 + 65*0.1 = 55.5  (LOW zodiac)
//   max ≈ 95*0.4 + 90*0.3 + 95*0.2 + 90*0.1 = 93.0  (PRIMARY zodiac)
const RAW_MIN = 55
const RAW_MAX = 93

function normalise(raw: number): number {
  const clamped = Math.max(RAW_MIN, Math.min(RAW_MAX, raw))
  const pct     = (clamped - RAW_MIN) / (RAW_MAX - RAW_MIN)
  return Math.round(Math.max(45, Math.min(98, 45 + pct * 53)))
}

// ── Tier + copy ───────────────────────────────────────────────────────────────
function tier(score: number): { tier: AlignmentTier; label: string } {
  if (score >= 80) return { tier: 'action',    label: 'Día de acción' }
  if (score >= 65) return { tier: 'building',  label: 'Día de construcción' }
  return               { tier: 'reception', label: 'Día de recepción' }
}

// ── Public API ────────────────────────────────────────────────────────────────
export function calculateAlignment(input: AlignmentInput): AlignmentResult {
  const { birthDate, fullName, zodiacSign, lunarPhase, manifestationArea, date } = input

  const lunar   = LUNAR_SCORE[lunarPhase] ?? 70
  const zodiac  = zodiacScore(zodiacSign, lunarPhase)
  const life    = lifeNumber(fullName, birthDate)
  const day     = dayNumber(date)
  const numNum  = numerologyScore(life, day)
  const area    = areaScore(manifestationArea, lunarPhase)

  const raw   = lunar * 0.40 + zodiac * 0.30 + numNum * 0.20 + area * 0.10
  const score = normalise(raw)

  return { score, ...tier(score) }
}
