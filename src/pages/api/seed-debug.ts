export const prerender = false
import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals as any)?.runtime?.env ?? {}
  const raw = env.SEED_SECRET ?? 'NOT_SET'
  const trimmed = raw.trim()
  return new Response(JSON.stringify({
    raw_length: raw.length,
    trimmed_length: trimmed.length,
    trimmed_value: trimmed,
    has_leading_space: raw !== raw.trimStart(),
    has_trailing_space: raw !== raw.trimEnd(),
  }), { headers: { 'Content-Type': 'application/json' } })
}
