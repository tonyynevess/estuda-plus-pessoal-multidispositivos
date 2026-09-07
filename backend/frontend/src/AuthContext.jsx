import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { demoAuthUser, demoList, demoUpdate } from '../lib/demoDb'
import { demoMode, supabase } from '../lib/supabase'

const AuthContext = createContext(null)
const demoSessionKey = 'estuda_plus_demo_session'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadAccount = async (user) => {
    if (!user) { setProfile(null); setSubscription(null); return }
    if (demoMode) {
      setProfile(demoList('profiles').find(p => p.id === user.id) || null)
      setSubscription(demoList('subscriptions').find(s => s.user_id === user.id) || null)
      return
    }
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
    ])
    setProfile(p || null)
    setSubscription(s || null)
  }

  useEffect(() => {
    let unsubscribe = () => {}
    const start = async () => {
      if (demoMode) {
        const active = localStorage.getItem(demoSessionKey) === 'active'
        const next = active ? { user: demoAuthUser } : null
        setSession(next); await loadAccount(next?.user); setLoading(false); return
      }
      const { data } = await supabase.auth.getSession()
      setSession(data.session); await loadAccount(data.session?.user); setLoading(false)
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        setSession(nextSession); await loadAccount(nextSession?.user)
      })
      unsubscribe = () => listener.subscription.unsubscribe()
    }
    start()
    return () => unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (demoMode) {
      if (!email || !password) throw new Error('Informe e-mail e senha.')
      localStorage.setItem(demoSessionKey, 'active')
      const next = { user: { ...demoAuthUser, email } }
      setSession(next); await loadAccount(next.user); return next
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }
  const signUp = async ({ name, email, password }) => {
    if (demoMode) return signIn(email, password)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/app` },
    })
    if (error) throw error
    return data
  }
  const signOut = async () => {
    if (demoMode) localStorage.removeItem(demoSessionKey)
    else await supabase.auth.signOut()
    setSession(null); setProfile(null); setSubscription(null)
  }
  const resetPassword = async (email) => {
    if (demoMode) return true
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/atualizar-senha` })
    if (error) throw error
    return true
  }
  const updatePassword = async (password) => {
    if (demoMode) return true
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    return true
  }
  const updateProfile = async (payload) => {
    if (!session?.user) throw new Error('Sessão não encontrada.')
    if (demoMode) {
      const next = demoUpdate('profiles', session.user.id, payload); setProfile(next); return next
    }
    const { data, error } = await supabase.from('profiles').update(payload).eq('id', session.user.id).select().single()
    if (error) throw error
    setProfile(data); return data
  }
  const refreshAccount = async () => loadAccount(session?.user)

  const isAdmin = profile?.role === 'admin'
  const subscriptionAllowed = useMemo(() => {
    if (profile?.blocked) return false
    if (demoMode || isAdmin) return true
    if (!subscription) return false
    if (['active', 'trial'].includes(subscription.status)) {
      if (subscription.status === 'trial' && subscription.trial_ends_at) return new Date(subscription.trial_ends_at) >= new Date()
      if (subscription.current_period_end) return new Date(subscription.current_period_end + 'T23:59:59') >= new Date()
      return true
    }
    return false
  }, [subscription, isAdmin, profile?.blocked])

  return <AuthContext.Provider value={{
    session, user: session?.user || null, profile, subscription, loading, demoMode,
    isAdmin, subscriptionAllowed, signIn, signUp, signOut, resetPassword,
    updatePassword, updateProfile, refreshAccount,
  }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
