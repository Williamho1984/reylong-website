export const prerender = false

import type { APIRoute } from 'astro'
import { checkRateLimit, dailyBudgetKey, getClientIp } from '../../lib/rate-limit'

const ALLOWED_ORIGINS = ['https://www.reylong.com', 'https://reylong.com']

// Site-wide ceiling on chat turns per day. Every turn costs two Workers AI calls (an embedding
// plus a generation), so without this a single day of scripted abuse can drain the account's
// whole AI allowance and leave real visitors with a dead chatbot. Real traffic on this site runs
// well under this; override with CHAT_DAILY_LIMIT if that stops being true.
const DEFAULT_CHAT_DAILY_LIMIT = 500
const ONE_DAY_SECONDS = 86400

// Workers AI retires models out from under you: @cf/meta/llama-3.1-8b-instruct was deprecated on
// 2026-05-30 and every chat turn had been failing with AiError 5028 ever since. fp8 is the same
// model, quantized, and it streams the same `data: {"response": "..."}` frames the widget parses.
const GENERATION_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8'
// Must stay in lockstep with the model that produced the stored knowledge-base vectors — swapping
// it would silently put the query in a different vector space and every match would be garbage.
const EMBEDDING_MODEL = '@cf/baai/bge-small-en-v1.5'

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin')
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' }
  }
  return {}
}

const SYSTEM_PROMPT = `You are a sales assistant for Rey Long Machinery Co., Ltd., a professional manufacturer of plastic and packaging machinery in Taiwan.

Rey Long's actual product lineup (ONLY mention these — never invent other products):
- JL-L-2TZP600: Multi-format bag making machine (three-side seal, doypack, zipper bags)
- JLPTCSM-1300W: PP woven bag conversion line (printing + tube forming + cutting & sewing)
- JLRPM-6800BO/6C: 6-color flexographic printing machine for PP woven fabric
- JLECS-1000W: Eddy current separator for non-ferrous metal recycling
- AI Machine Intelligence: Edge computing / IoT retrofit solution for existing production lines

Rules:
- ONLY use information from the provided product knowledge context
- NEVER invent model numbers, product names, specifications, or features not in the context
- If the context does not cover the question, say you don't have that specific information and suggest contacting the sales team
- For pricing questions, direct customers to submit a quote request
- Keep answers concise and professional (2–4 sentences unless detail is needed)
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

  const rateLimit = await checkRateLimit(env.RATE_LIMIT, `chat:${getClientIp(request)}`, 8, 60)
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests, please slow down.' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimit.retryAfterSeconds),
        ...corsHeaders(request),
      },
    })
  }

  const dailyLimit = Number(env.CHAT_DAILY_LIMIT ?? DEFAULT_CHAT_DAILY_LIMIT) || DEFAULT_CHAT_DAILY_LIMIT
  const budget = await checkRateLimit(env.RATE_LIMIT, dailyBudgetKey('chat:budget'), dailyLimit, ONE_DAY_SECONDS)
  if (!budget.allowed) {
    return new Response(
      JSON.stringify({ error: 'The AI assistant is unavailable for the rest of today. Please use the contact form and our team will get back to you.' }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(budget.retryAfterSeconds),
          ...corsHeaders(request),
        },
      }
    )
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

  const supabaseUrl: string = (env.SUPABASE_URL ?? import.meta.env.SUPABASE_URL ?? 'https://lqgrvkhrbsgbatzhzgvy.supabase.co').trim()
  const supabaseKey: string = env.SUPABASE_ANON_KEY ?? import.meta.env.SUPABASE_ANON_KEY ?? 'sb_publishable_p5T1U-WGt_bNzoWdAHZu3Q_KvuYVN2J'

  try {
    // 1. Embed the query
    const embedResult = await ai.run(EMBEDDING_MODEL, { text: [message] }) as { data: number[][] }
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
          body: JSON.stringify({ query_embedding: queryEmbedding, match_threshold: 0.3, match_count: 4 }),
        })
        if (searchRes.ok) {
          const matches = await searchRes.json() as Array<{ question: string; answer: string; similarity?: number }>
          if (Array.isArray(matches) && matches.length > 0) {
            context = matches.map(m => `Q: ${m.question}\nA: ${m.answer}`).join('\n\n')
          }
        } else {
          console.error('[chat] RPC error:', searchRes.status, await searchRes.text())
        }
      } catch (searchErr) {
        console.error('[chat] search failed:', searchErr)
      }
    }

    const systemContent = context
      ? `${SYSTEM_PROMPT}\n\nRelevant product knowledge:\n${context}`
      : `${SYSTEM_PROMPT}\n\nNo specific product match found. Provide general guidance and suggest contacting our sales team.`

    // 3. Stream Llama response
    const stream = await ai.run(GENERATION_MODEL, {
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
        ...corsHeaders(request),
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

export const OPTIONS: APIRoute = ({ request }) =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...corsHeaders(request),
    },
  })
