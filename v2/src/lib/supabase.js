import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isConfigured = Boolean(url && anonKey)

// Null until env vars are set — the UI shows a setup notice instead of crashing.
export const supabase = isConfigured ? createClient(url, anonKey) : null
