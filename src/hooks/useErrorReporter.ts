import { useCallback } from 'react'
import { Platform } from 'react-native'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

export function useErrorReporter(section: string) {
  const { profile } = useAuth()

  const reportError = useCallback(async (
    error: unknown,
    context?: Record<string, unknown>
  ) => {
    try {
      const msg = error instanceof Error ? error.message
        : typeof error === 'string' ? error
        : JSON.stringify(error)

      const details = error instanceof Error ? error.stack ?? null : null

      await supabase.from('error_reports').insert({
        user_id: profile?.id ?? null,
        section,
        error_message: msg,
        error_details: details,
        app_context: {
          platform: Platform.OS,
          ...context,
        },
      })
    } catch {
      // silencioso — no queremos que el reporter cause otro error
    }
  }, [profile?.id, section])

  return { reportError }
}
