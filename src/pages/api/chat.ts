export const prerender = false

import type { APIRoute } from 'astro'

const SYSTEM_PROMPT = `You are a helpful sales assistant for Rey Long Machinery Co., Ltd., a professional manufacturer of plastic and packaging machinery in Taiwan.

Guidelines:
- Answer technical questions accurately using the provided product knowledge
- For pricing questions, always direct customers to submit a quote request via the website contact form
- Keep answers concise and professional (2–4 sentences unless detail is needed)
- If the context does not cover the question, suggest contacting the sales team directly
- Company contact: t6960638@ms45.hinet.net | Tel: +886-5-5511888`

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any)?.runtime?.env ?? {}
  const ai = env.AI as { run: (model: string, opts: Record<string, unknown>) => Promise<unknown> } | undefined

  if (!ai) {
    return new Response(JSON.stringify({ error: 'AI binding not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let message: string
  try {
    const body = await request.json() as { message?: string }
    message = body?.message?.trim() ?? ''
    if (!message) throw new Error('empty')
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl: string = env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL ?? 'https://lqgrvkhrbsgbatzhzgvy.supabase.co'
  const supabaseKey: string = env.SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY ?? 'sb_publishable_p5T1U-WGt_bNzoWdAHZu3Q_KvuYVN2J'

  try {
    // 1. Embed the query
    const embedResult = await ai.run('@cf/baai/bge-small-en-v1.5', { text: [message] }) as { data: number[][] }
    const queryEmbedding = embedResult.data[0]

    // 2. Search Supabase pgvector
    let context = ''
    if (supabaseUrl && supabaseKey) {
      try {
        const searchRes = await fetch(`${supabaseUrl}/rest/v1/rpc/match_chatbot_qa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ query_embedding: queryEmbedding, match_threshold: 0.4, match_count: 3 }),
        })
        if (searchRes.ok) {
          const matches = await searchRes.json() as Array<{ question: string; answer: string }>
          if (Array.isArray(matches) && matches.length > 0) {
            context = matches.map(m => `Q: ${m.question}\nA: ${m.answer}`).join('\n\n')
          }
        }
      } catch {
        // continue without context
      }
    }

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\nRelevant product knowledge:\n${context}`
      : `${SYSTEM_PROMPT}\n\nNo specific product match found. Provide general guidance and suggest contacting our sales team.`

    // 3. Stream Llama response
    const stream = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
      stream: true,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: message },
      ],
    }) as ReadableStream

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('[chat] error:', err)
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const OPTIONS: APIRoute = () =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
