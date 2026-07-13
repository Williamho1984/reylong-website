// Lightweight per-key rate limiter backed by Cloudflare KV.
//
// KV reads/writes are eventually consistent across the edge, so this is
// best-effort abuse mitigation, not an exact counter. That's an acceptable
// trade-off here: the goal is to stop scripted/cross-site cost abuse of the
// AI endpoints, not to enforce a precise quota.
export interface KVNamespaceLike {
  get(key: string): Promise<string | null>
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

export async function checkRateLimit(
  kv: KVNamespaceLike | undefined,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  // If the binding isn't configured (e.g. local dev without KV), fail open
  // rather than breaking the feature.
  if (!kv) return { allowed: true, retryAfterSeconds: 0 }

  const raw = await kv.get(key)
  const count = raw ? parseInt(raw, 10) || 0 : 0

  if (count >= limit) {
    return { allowed: false, retryAfterSeconds: windowSeconds }
  }

  await kv.put(key, String(count + 1), { expirationTtl: windowSeconds })
  return { allowed: true, retryAfterSeconds: 0 }
}

// Key for a site-wide daily ceiling, used as a backstop in front of Workers AI.
//
// The per-IP limiter above cannot stop a determined burst: KV is eventually consistent, and a
// limit of 8 is small enough that concurrent requests race past it (verified in testing). A
// global counter shares that weakness, but here it barely matters — the ceiling is in the
// hundreds, so the overshoot a burst can achieve is bounded by its concurrency, not by the
// limit. It caps what one day of abuse can drain from the account's AI allowance, which is the
// thing actually worth protecting.
export function dailyBudgetKey(prefix: string, now: Date = new Date()): string {
  return `${prefix}:${now.toISOString().slice(0, 10)}`
}

export function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown'
}
