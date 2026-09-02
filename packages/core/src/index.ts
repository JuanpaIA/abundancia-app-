export type {
  PlanType,
  SubscriptionStatus,
  ManifestationArea,
  ZodiacSign,
  OnboardingData,
  LunarPhase,
  UserProfile,
  GoalDetails,
  DailyLog,
  Habit,
  Intention,
  BalanceWheelEntry,
  DailyProtocol,
} from './types/index'

export type { PlanPhase, PhaseInfo, DailyObjective } from './content/dailyObjective'
export { getPhaseInfo, generateDailyObjective } from './content/dailyObjective'

export { generateDailyProtocol } from './content/dailyProtocol'

export type { NumerologyProfile } from './content/numerologyContent'
export { NUMEROLOGY_PROFILES } from './content/numerologyContent'

export type { VisionImage } from './content/visionBoardImages'
export { VISION_IMAGES } from './content/visionBoardImages'

export {
  calculateNumerology,
  getZodiacSign,
  getBaseFrequency,
  getLunarPhase,
  getLunarPhaseLabel,
  getLunarPhaseEmoji,
} from './utils/calculations'

export type { PortalType, PortalPower, EnergeticPortal, NextPortalInfo } from './utils/energeticPortals'
export {
  getPortalForDate,
  getNextPortal,
  getPortalPowerLabel,
  getPortalPowerColor,
} from './utils/energeticPortals'

export type { LunarPhaseContent, NextKeyPhaseInfo } from './utils/lunarPhaseContent'
export { LUNAR_PHASE_CONTENT, getNextKeyPhase } from './utils/lunarPhaseContent'

export type { AlignmentTier, AlignmentResult, AlignmentInput } from './utils/alignmentIndex'
export { calculateAlignment } from './utils/alignmentIndex'

export type { SignalInput, SignalResult } from './utils/dailySignal'
export { calculateSignal } from './utils/dailySignal'
