export const prerender = false

import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any)?.runtime?.env ?? {}
  const supabaseUrl: string = (env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL ?? 'https://lqgrvkhrbsgbatzhzgvy.supabase.co').trim()
  const supabaseKey: string = env.SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY ?? 'sb_publishable_p5T1U-WGt_bNzoWdAHZu3Q_KvuYVN2J'

  let body: { session_id?: string; user_message?: string; ai_response?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 400 })
  }

  const { session_id, user_message, ai_response } = body
  if (!session_id || !user_message || !ai_response) {
    return new Response(JSON.stringify({ success: false }), { status: 400 })
  }

  try {
    await fetch(`${supabaseUrl}/rest/v1/chatbot_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ session_id, user_message, ai_response }),
    })
  } catch (err) {
    console.error('[chat-log] error:', err)
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
