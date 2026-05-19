import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Detect whether env vars are real or still placeholders
export const isSupabaseConfigured =
  rawUrl &&
  rawKey &&
  rawUrl !== 'your_url' &&
  rawKey !== 'your_anon_key' &&
  rawUrl.startsWith('https://')

// Always create a valid client so import never throws —
// it just won't be able to make real requests when unconfigured.
const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = isSupabaseConfigured
  ? rawKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMH0.placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
