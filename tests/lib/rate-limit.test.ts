import { describe, it, expect } from 'vitest'
import { checkRateLimit, dailyBudgetKey, getClientIp } from '../../src/lib/rate-limit'

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

describe('dailyBudgetKey', () => {
  it('stamps the key with the UTC date so the budget resets at midnight', () => {
    const key = dailyBudgetKey('chat:budget', new Date('2026-07-13T23:59:00Z'))
    expect(key).toBe('chat:budget:2026-07-13')
  })

  it('produces a different key on the next day', () => {
    const day1 = dailyBudgetKey('chat:budget', new Date('2026-07-13T12:00:00Z'))
    const day2 = dailyBudgetKey('chat:budget', new Date('2026-07-14T12:00:00Z'))
    expect(day1).not.toBe(day2)
  })

  // The per-IP limiter cannot stop a burst from a single attacker (KV is eventually consistent,
  // and a limit of 8 is small enough to race past). A global ceiling is the backstop: it bounds
  // how much Workers AI quota one day of abuse can consume, whatever the source.
  it('stops AI calls once the whole site has spent its daily allowance', async () => {
    const kv = createMockKv()
    const key = dailyBudgetKey('chat:budget', new Date('2026-07-13T00:00:00Z'))
    for (let i = 0; i < 3; i++) {
      expect((await checkRateLimit(kv, key, 3, 86400)).allowed).toBe(true)
    }
    expect((await checkRateLimit(kv, key, 3, 86400)).allowed).toBe(false)
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
