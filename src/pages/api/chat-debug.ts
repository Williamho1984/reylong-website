export const prerender = false
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any)?.runtime?.env ?? {}
  const ai = env.AI as { run: (model: string, opts: Record<string, unknown>) => Promise<unknown> } | undefined

  const supabaseUrl: string = env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL ?? 'https://lqgrvkhrbsgbatzhzgvy.supabase.co'
  const supabaseKey: string = env.SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY ?? 'sb_publishable_p5T1U-WGt_bNzoWdAHZu3Q_KvuYVN2J'

  const result: Record<string, unknown> = {
    ai_binding: !!ai,
    supabase_url: supabaseUrl,
    supabase_key_prefix: supabaseKey.slice(0, 20) + '...',
  }

  // Step 1: test embedding
  try {
    const embedResult = await ai!.run('@cf/baai/bge-small-en-v1.5', { text: ['maximum speed JL-L-2TZP600'] }) as { data: number[][] }
    const emb = embedResult?.data?.[0]
    result.embed_ok = true
    result.embed_length = emb?.length ?? 0
    result.embed_sample = emb?.slice(0, 3)

    // Step 2: test RPC
    const searchRes = await fetch(`${supabaseUrl}/rest/v1/rpc/match_chatbot_qa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ query_embedding: emb, match_threshold: 0.1, match_count: 3 }),
    })
    result.rpc_status = searchRes.status
    const body = await searchRes.text()
    result.rpc_ok = searchRes.ok
    result.rpc_response = body.slice(0, 300)
  } catch (err) {
    result.error = String(err)
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  })
}
