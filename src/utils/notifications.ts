// Web implementation — expo-notifications is native-only; all scheduling is a no-op here.
// Metro resolves notifications.native.ts on iOS/Android instead of this file.

export {
  AREA_RESCUE,
  AREA_MORNING,
  buildMorningMessage,
  type MorningProfile,
} from './notifications.shared'

import type { MorningProfile } from './notifications.shared'

export async function requestNotificationPermissions(): Promise<boolean> {
  if (__DEV__) console.warn('[notifications] scheduling no disponible en web')
  return false
}

export async function scheduleAbundanciaNotifications(_profile?: MorningProfile): Promise<void> {
  if (__DEV__) console.warn('[notifications] scheduling no disponible en web')
}

export async function scheduleWeeklyPatternNotification(
  _recentLogs: Record<string, any>[]
): Promise<void> {
  if (__DEV__) console.warn('[notifications] scheduling no disponible en web')
}
