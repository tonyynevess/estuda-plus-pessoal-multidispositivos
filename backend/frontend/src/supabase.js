import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(
  url && anonKey && !url.includes('SEU-PROJETO') && !anonKey.includes('COLE_')
)

export const demoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !supabaseConfigured

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
