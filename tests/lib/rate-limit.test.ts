import { describe, it, expect } from 'vitest'
import { checkRateLimit, getClientIp } from '../../src/lib/rate-limit'

function createMockKv() {
  const store = new Map<string, string>()
  return {
    store,
    get: async (key: string) => store.get(key) ?? null,
    put: async (key: string, value: string) => {
      store.set(key, value)
    }
  }
}

describe('checkRateLimit', () => {
  it('allows requests under the limit', async () => {
    const kv = createMockKv()
    const result = await checkRateLimit(kv, 'chat:1.2.3.4', 3, 60)
    expect(result.allowed).toBe(true)
  })

  it('blocks requests once the limit is reached', async () => {
    const kv = createMockKv()
    await checkRateLimit(kv, 'chat:1.2.3.4', 3, 60)
    await checkRateLimit(kv, 'chat:1.2.3.4', 3, 60)
    await checkRateLimit(kv, 'chat:1.2.3.4', 3, 60)
    const result = await checkRateLimit(kv, 'chat:1.2.3.4', 3, 60)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBe(60)
  })

  it('tracks separate keys independently', async () => {
    const kv = createMockKv()
    await checkRateLimit(kv, 'chat:1.1.1.1', 1, 60)
    const otherIp = await checkRateLimit(kv, 'chat:2.2.2.2', 1, 60)
    expect(otherIp.allowed).toBe(true)
  })

  it('fails open when no KV binding is provided', async () => {
    const result = await checkRateLimit(undefined, 'chat:1.2.3.4', 1, 60)
    expect(result.allowed).toBe(true)
  })
})

describe('getClientIp', () => {
  it('reads cf-connecting-ip first', () => {
    const request = new Request('https://example.com', {
      headers: { 'cf-connecting-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' }
    })
    expect(getClientIp(request)).toBe('1.2.3.4')
  })

  it('falls back to x-forwarded-for', () => {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '9.9.9.9' }
    })
    expect(getClientIp(request)).toBe('9.9.9.9')
  })

  it('falls back to unknown when no IP headers are present', () => {
    const request = new Request('https://example.com')
    expect(getClientIp(request)).toBe('unknown')
  })
})
