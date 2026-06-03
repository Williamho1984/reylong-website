import { createClient } from '@supabase/supabase-js'

// publishable key is designed to be public (safe to embed); used as a fallback so the
// public site keeps working even if the build env did not inject SUPABASE_ANON_KEY.
const supabaseUrl = import.meta.env.SUPABASE_URL ?? 'https://lqgrvkhrbsgbatzhzgvy.supabase.co'
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY ?? 'sb_publishable_p5T1U-WGt_bNzoWdAHZu3Q_KvuYVN2J'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
