import { LunarPhase, ZodiacSign } from '../types'

export function calculateNumerology(fullName: string): number {
  const letterValues: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  }

  const normalized = fullName.toLowerCase().replace(/[^a-záéíóúüñ]/g, '')
  const deaccented = normalized
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ü/g, 'u')
    .replace(/ñ/g, 'n')

  let sum = deaccented.split('').reduce((acc, char) => acc + (letterValues[char] || 0), 0)

  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d), 0)
  }

  return sum
}

export function getZodiacSign(birthDate: string): ZodiacSign {
  const date = new Date(birthDate)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'tauro'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'geminis'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'escorpio'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagitario'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricornio'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'acuario'
  return 'piscis'
}

export function getBaseFrequency(numerologyNumber: number): number {
  const frequencyMap: Record<number, number> = {
    1: 396, 2: 417, 3: 528, 4: 432, 5: 528,
    6: 639, 7: 741, 8: 852, 9: 963,
    11: 741, 22: 852, 33: 963,
  }
  return frequencyMap[numerologyNumber] || 432
}

export function getLunarPhase(date: Date = new Date()): LunarPhase {
  const knownNewMoon = new Date('2000-01-06')
  const lunarCycle = 29.53058867
  const daysSince = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24)
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle

  if (phase < 1.85) return 'nueva'
  if (phase < 7.38) return 'creciente_inicial'
  if (phase < 9.22) return 'cuarto_creciente'
  if (phase < 14.77) return 'creciente_gibosa'
  if (phase < 16.61) return 'llena'
  if (phase < 22.15) return 'menguante_gibosa'
  if (phase < 23.99) return 'cuarto_menguante'
  return 'menguante_final'
}

export function getLunarPhaseLabel(phase: LunarPhase): string {
  const labels: Record<LunarPhase, string> = {
    nueva: 'Luna Nueva',
    creciente_inicial: 'Luna Creciente',
    cuarto_creciente: 'Cuarto Creciente',
    creciente_gibosa: 'Creciente Gibosa',
    llena: 'Luna Llena',
    menguante_gibosa: 'Menguante Gibosa',
    cuarto_menguante: 'Cuarto Menguante',
    menguante_final: 'Luna Menguante',
  }
  return labels[phase]
}

export function getLunarPhaseEmoji(phase: LunarPhase): string {
  const emojis: Record<LunarPhase, string> = {
    nueva: '🌑',
    creciente_inicial: '🌒',
    cuarto_creciente: '🌓',
    creciente_gibosa: '🌔',
    llena: '🌕',
    menguante_gibosa: '🌖',
    cuarto_menguante: '🌗',
    menguante_final: '🌘',
  }
  return emojis[phase]
}
