export type PlanType = 'monthly' | 'weekly'

export type SubscriptionStatus = 'active' | 'inactive'

export type ZodiacSign =
  | 'aries' | 'tauro' | 'geminis' | 'cancer'
  | 'leo' | 'virgo' | 'libra' | 'escorpio'
  | 'sagitario' | 'capricornio' | 'acuario' | 'piscis'

export type ManifestationArea = 'dinero' | 'amor' | 'salud' | 'proposito' | 'felicidad'

export type LunarPhase =
  | 'nueva' | 'creciente_inicial' | 'cuarto_creciente' | 'creciente_gibosa'
  | 'llena' | 'menguante_gibosa' | 'cuarto_menguante' | 'menguante_final'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  is_admin?: boolean
  birth_date: string
  zodiac_sign: ZodiacSign
  numerology_number: number
  base_frequency: number
  manifestation_area: ManifestationArea
  goal_details: GoalDetails
  stripe_customer_id?: string
  subscription_status: SubscriptionStatus
  plan_type?: PlanType
  plan_duration?: number
  plan_start_date?: string
  push_token?: string
  created_at: string
}

export interface GoalDetails {
  // Dinero
  situation?: string
  skill?: string
  monthly_goal?: string
  money_obstacle?: string
  // Amor
  relationship_type?: string
  social_environments?: string
  shared_activities?: string
  partner_values?: string
  // Salud
  health_focus?: string
  health_obstacle?: string
  health_habit?: string
  // Propósito
  purpose_clarity?: string
  flow_activities?: string
  desired_impact?: string
  // Felicidad
  joy_blockers?: string
  joy_activities?: string
  happiness_change?: string
  // App state
  vision_board_ids?: string[]
  welcome_seen?: boolean
}

export interface DailyLog {
  id: string
  user_id: string
  date: string
  energy_level?: number
  habits_completed: string[]
  daily_objective_done: boolean
  objective_note?: string
  morning_done: boolean
  morning_note?: string
  afternoon_done: boolean
  afternoon_note?: string
  night_done: boolean
  night_note?: string
  ritual_done: boolean
  affirmation_done: boolean
  color_done: boolean
  foods_done: boolean
  biohack_done: boolean
}

export interface Habit {
  id: string
  user_id: string
  name: string
  active: boolean
  created_at: string
}

export interface Intention {
  id: string
  user_id: string
  desire: string
  emotion: string
  action: string
  target_date: string
  lunar_phase_created: LunarPhase
  created_at: string
}

export interface BalanceWheelEntry {
  id: string
  user_id: string
  date: string
  dinero: number
  salud: number
  amor: number
  proposito: number
  familia: number
  bienestar: number
  crecimiento: number
  gratitud: number
}

export interface DailyProtocol {
  ritual: { title: string; description: string }
  affirmation: string
  color: { name: string; hex: string; reason: string }
  colors: Array<{ name: string; hex: string; reason: string }>
  foods: string[]
  foodReason: string
  biohack: { activity: string; activityReason: string }
  frequency: { hz: number; name: string }
  protocol: {
    morning: string
    afternoon: string
    night: string
  }
}
