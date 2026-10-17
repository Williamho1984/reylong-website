// Keeps the Worker's edge Cache API warm for every URL in the sitemap.
//
// Why this exists: the site's Cache-Control is `s-maxage=300` (see src/middleware.ts), so any
// page nobody visits for 5 minutes falls out of cache. Ahrefs crawls weekly, so for a long-tail
// page it is almost always the first visitor since the cache last expired — that forces a fresh
// Supabase connection (measured 707ms for a cold first query vs ~150-400ms warm) on top of
// Ahrefs' own network distance, which together push TTFB over Ahrefs' 1000ms "Slow page"
// threshold. Real visitors saw none of this (Core Web Vitals were clean) — it was purely an
// artifact of long gaps between requests.
//
// This does NOT change the site's content-freshness guarantee: it just re-requests each page
// often enough that the 5-minute cache window never fully closes, the same way organic traffic
// would if the site got enough of it. An edit to the database is still live within 5 minutes,
// exactly as before.
//
// Runs every 4 minutes from GitHub Actions — shorter than the 5-minute cache TTL to leave slack
// for scheduler jitter, and outside Cloudflare for the same reason health-check.mjs is: a
// Cloudflare-side outage should show up here, not take the monitor down with it.
const SITE = process.env.WARM_CACHE_SITE ?? 'https://www.reylong.com'
const CONCURRENCY = 6

export function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
}

export async function warmAll(urls, fetchImpl = fetch, concurrency = CONCURRENCY) {
  const results = []
  let next = 0
  async function worker() {
    while (next < urls.length) {
      const url = urls[next++]
      const t0 = Date.now()
      try {
        const res = await fetchImpl(url, { headers: { 'User-Agent': 'reylong-cache-warmer' } })
        results.push({ url, ok: res.ok, status: res.status, ms: Date.now() - t0 })
      } catch (err) {
        results.push({ url, ok: false, status: 0, ms: Date.now() - t0, error: err.message })
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker))
  return results
}

async function main() {
  const sitemapRes = await fetch(`${SITE}/sitemap.xml`)
  if (!sitemapRes.ok) {
    console.error(`sitemap fetch failed: HTTP ${sitemapRes.status}`)
    process.exitCode = 1
    return
  }
  const urls = parseSitemapUrls(await sitemapRes.text())
  const results = await warmAll(urls)
  const failed = results.filter(r => !r.ok)

  console.log(`warmed ${results.length} URLs, ${failed.length} failed`)
  for (const f of failed) console.log(`  FAILED ${f.url} — ${f.error ?? `HTTP ${f.status}`}`)

  // More than half failing points at the site itself being down, not a one-off blip on a
  // handful of pages — worth a loud CI failure rather than quietly retrying next cycle.
  if (failed.length > results.length / 2) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1].replace(/\\/g, '/')}`).href) {
  await main()
}
