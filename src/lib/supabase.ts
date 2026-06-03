import { createClient } from '@supabase/supabase-js'

// The publishable key is public by design (Supabase: "can be safely shared publicly").
// Embed it directly so the public site never depends on a build-time env var that could
// hold a stale/legacy key. Rotate here if the publishable key is ever regenerated.
const supabaseUrl = import.meta.env.SUPABASE_URL ?? 'https://lqgrvkhrbsgbatzhzgvy.supabase.co'
const supabaseAnonKey = 'sb_publishable_p5T1U-WGt_bNzoWdAHZu3Q_KvuYVN2J'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
