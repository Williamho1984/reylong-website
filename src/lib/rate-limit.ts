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

export function getClientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown'
}
