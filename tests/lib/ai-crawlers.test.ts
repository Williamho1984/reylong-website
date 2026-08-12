import { afterEach, describe, expect, it, vi } from 'vitest'
import { identifyCrawler, recordCrawlerHit } from '../../src/lib/ai-crawlers'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('identifyCrawler', () => {
  it('separates a live user fetch from the index crawl and the training crawl', () => {
    expect(identifyCrawler('Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)'))
      .toEqual({ bot: 'chatgpt-user', kind: 'user' })
    expect(identifyCrawler('Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)'))
      .toEqual({ bot: 'oai-searchbot', kind: 'search' })
    expect(identifyCrawler('Mozilla/5.0 (compatible; GPTBot/1.2; +https://openai.com/gptbot)'))
      .toEqual({ bot: 'gptbot', kind: 'training' })
  })

  it('does not confuse a vendor family whose agents share a prefix', () => {
    expect(identifyCrawler('PerplexityBot/1.0')?.kind).toBe('search')
    expect(identifyCrawler('Perplexity-User/1.0')?.kind).toBe('user')
    expect(identifyCrawler('ClaudeBot/1.0')?.kind).toBe('training')
    expect(identifyCrawler('Claude-User/1.0')?.kind).toBe('user')
    // A more specific token must win over the shorter one it contains.
    expect(identifyCrawler('Applebot-Extended/1.0')?.bot).toBe('applebot-extended')
  })

  it('ignores ordinary browsers, ordinary search engines, and nothing at all', () => {
    expect(identifyCrawler('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36')).toBeNull()
    expect(identifyCrawler(null)).toBeNull()
    expect(identifyCrawler('')).toBeNull()
    // Gemini and AI Overviews arrive as Googlebot and Copilot as bingbot, so they
    // cannot be told apart from ordinary search crawling. Counting them here would
    // look like coverage while measuring something else entirely.
    expect(identifyCrawler('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBeNull()
    expect(identifyCrawler('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')).toBeNull()
  })

  it('matches whatever case the agent happens to use', () => {
    expect(identifyCrawler('gptbot/1.2')?.bot).toBe('gptbot')
    expect(identifyCrawler('GPTBOT/1.2')?.bot).toBe('gptbot')
  })
})

describe('recordCrawlerHit', () => {
  const hit = {
    bot: 'gptbot' as const,
    kind: 'training' as const,
    path: '/products/eddy-current-non-ferrous-separator',
    status: 200,
    cache: 'HIT',
    verified: true,
    userAgent: 'GPTBot/1.2',
  }

  it('posts the hit to the log table', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    await recordCrawlerHit({ SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'key' }, hit)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.supabase.co/rest/v1/ai_crawler_hits')
    expect(JSON.parse(init.body)).toMatchObject({ bot: 'gptbot', kind: 'training', cache: 'HIT', verified: true })
  })

  it('truncates a very long user agent instead of storing all of it', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    await recordCrawlerHit({}, { ...hit, userAgent: 'x'.repeat(1000) })

    expect(JSON.parse(fetchMock.mock.calls[0][1].body).user_agent).toHaveLength(256)
  })

  it('swallows a logging failure rather than letting it reach the visitor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('supabase unreachable')))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    // The point of the test: this must resolve, not reject. A logging outage
    // turning into a page outage would cost far more than the missing row.
    await expect(recordCrawlerHit({}, hit)).resolves.toBeUndefined()
    expect(consoleError).toHaveBeenCalled()
    consoleError.mockRestore()
  })
})
