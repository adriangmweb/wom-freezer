import { writable, derived } from 'svelte/store'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '$lib/supabase/client'

export const session = writable<Session | null>(null)
export const user = derived(session, ($session): User | null => $session?.user ?? null)
export const authReady = writable(false)

export async function initAuth() {
  if (!supabase || !isSupabaseConfigured) {
    authReady.set(true)
    return
  }

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Failed to load session', error)
  }
  session.set(data.session ?? null)
  authReady.set(true)

  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.set(newSession)
  })
}

export async function signInWithApple() {
  if (!supabase) throw new Error('Supabase not configured')
  const redirectTo = `${window.location.origin}/auth/callback`
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo }
  })
  if (error) throw error
}

export async function signInWithEmail(email: string) {
  if (!supabase) throw new Error('Supabase not configured')
  const emailRedirectTo = `${window.location.origin}/auth/callback`
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo }
  })
  if (error) throw error
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  session.set(null)
}
