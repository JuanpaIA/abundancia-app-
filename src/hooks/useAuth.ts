import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { UserProfile } from '@lumina/core'
import { Session } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [resetPasswordMode, setResetPasswordMode] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSession(session)
        setResetPasswordMode(true)
        setLoading(false)
        return
      }
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const timeout = new Promise<null>(resolve => setTimeout(() => resolve(null), 8000))
    const query = supabase.from('profiles').select('*').eq('id', userId).single()

    const result = await Promise.race([query, timeout])

    if (result && 'data' in result && !result.error) {
      setProfile(result.data)
    }
    setLoading(false)
  }

  async function signUp(email: string, password: string, metadata: object) {
    return supabase.auth.signUp({ email, password, options: { data: metadata } })
  }

  async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateProfile(updates: Partial<UserProfile>) {
    if (!session) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single()
    if (!error && data) setProfile(data)
  }

  async function refreshProfile() {
    if (!session) return
    await fetchProfile(session.user.id)
  }

  function clearResetMode() {
    setResetPasswordMode(false)
    setSession(null)
    setProfile(null)
  }

  const isSubscribed = profile?.subscription_status === 'active'
  const hasProfile = !!profile?.full_name

  return { session, profile, loading, isSubscribed, hasProfile, resetPasswordMode, clearResetMode, signUp, signIn, signOut, updateProfile, refreshProfile }
}
