import { describe, it, expect, vi } from 'vitest'
import { parseSitemapUrls, warmAll } from '../../scripts/warm-cache.mjs'

const sampleSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.reylong.com/</loc></url>
  <url><loc>https://www.reylong.com/es</loc></url>
  <url><loc>https://www.reylong.com/news/fibc-jumbo-bag-production-trends</loc></url>
</urlset>`

describe('parseSitemapUrls', () => {
  it('extracts every <loc> entry in document order', () => {
    expect(parseSitemapUrls(sampleSitemap)).toEqual([
      'https://www.reylong.com/',
      'https://www.reylong.com/es',
      'https://www.reylong.com/news/fibc-jumbo-bag-production-trends',
    ])
  })

  it('returns an empty array for a sitemap with no URLs', () => {
    expect(parseSitemapUrls('<urlset></urlset>')).toEqual([])
  })
})

describe('warmAll', () => {
  it('requests every URL and reports ok for 200s', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    const urls = ['https://a.test/', 'https://b.test/']
    const results = await warmAll(urls, fetchImpl, 2)

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(results.every(r => r.ok)).toBe(true)
    expect(results.map(r => r.url).sort()).toEqual(urls.sort())
  })

  it('records a failed request without aborting the rest — one dead page should not stop warming the others', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, status: 200 })
    const results = await warmAll(['https://broken.test/', 'https://fine.test/'], fetchImpl, 2)

    const broken = results.find(r => r.url === 'https://broken.test/')
    const fine = results.find(r => r.url === 'https://fine.test/')
    expect(broken?.ok).toBe(false)
    expect(broken?.status).toBe(500)
    expect(fine?.ok).toBe(true)
  })

  it('catches a thrown network error instead of rejecting the whole batch', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'))
    const results = await warmAll(['https://unreachable.test/'], fetchImpl, 1)

    expect(results[0].ok).toBe(false)
    expect(results[0].error).toBe('network down')
  })

  it('gives every request its own abort signal — nothing should be able to hang forever', async () => {
    // The real bug this guards against: the first production run hung for 2.5+ hours with
    // zero output because one unresponsive URL blocked its worker's Promise.all forever,
    // which stalled the entire warm-then-sleep loop on every subsequent cycle too.
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    await warmAll(['https://a.test/'], fetchImpl, 1)

    const [, options] = fetchImpl.mock.calls[0]
    expect(options.signal).toBeInstanceOf(AbortSignal)
  })

  it('never runs more concurrent requests than URLs remain', async () => {
    let inFlight = 0
    let maxInFlight = 0
    const fetchImpl = vi.fn().mockImplementation(async () => {
      inFlight++
      maxInFlight = Math.max(maxInFlight, inFlight)
      await new Promise(r => setTimeout(r, 5))
      inFlight--
      return { ok: true, status: 200 }
    })
    await warmAll(['https://a.test/'], fetchImpl, 6)

    expect(maxInFlight).toBe(1)
  })
})
