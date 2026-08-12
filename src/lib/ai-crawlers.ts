// Identifies AI crawlers from the User-Agent header so their visits can be counted.
//
// Why this exists: the site's analytics is client-side JavaScript, which no crawler
// executes, so today there is no record at all of whether AI engines fetch these
// pages. That leaves the most basic question about AEO work unanswerable — not
// "are we cited", but "is anyone even reading it".
//
// Three kinds, in descending order of how much they tell you:
//
//   user      a person asked their assistant something and it fetched this page
//             on the spot. The strongest signal available: a real query, right now.
//   search    the engine's own retrieval index, fetched to answer live queries.
//   training  a corpus crawl. Says the page is eligible for a future model, and
//             nothing whatsoever about being cited today.
//
// Two limitations that must not be forgotten when reading the numbers:
//
// 1. Google and Bing are absent on purpose. Gemini and AI Overviews are served from
//    the ordinary Google index and crawl as Googlebot — `Google-Extended` is a
//    robots.txt opt-out token, not a User-Agent — and Copilot rides on bingbot the
//    same way. So AI Overviews, which is one of the four engines in the monitoring
//    baseline, is invisible to this method. Counting Googlebot here would look like
//    coverage while measuring ordinary search crawling.
//
// 2. A User-Agent is a string anyone can send. Nothing here proves the request came
//    from the company it names, so every count is an upper bound. The `verified`
//    column exists for Cloudflare's verified-bot flag, but measured against
//    production it always arrives undefined and is therefore always stored as null:
//    verified-bot is a zone-level signal and reylong.com resolves outside
//    Cloudflare, the same reason zone Cache Rules were unusable and the Cache API
//    had to be used directly in middleware.ts. The column is kept because it would
//    start populating if the domain ever moved onto Cloudflare, but nothing today
//    corroborates a single one of these counts. Treat every number as an upper
//    bound, not as evidence a named crawler really visited.
export type CrawlerKind = 'user' | 'search' | 'training'

export interface Crawler {
  readonly bot: string
  readonly kind: CrawlerKind
}

// Matched in order, first hit wins, so a more specific token has to precede the
// token it contains — `applebot-extended` before any plain `applebot` rule.
const SIGNATURES: ReadonlyArray<readonly [string, string, CrawlerKind]> = [
  ['chatgpt-user', 'chatgpt-user', 'user'],
  ['oai-searchbot', 'oai-searchbot', 'search'],
  ['gptbot', 'gptbot', 'training'],
  ['perplexity-user', 'perplexity-user', 'user'],
  ['perplexitybot', 'perplexitybot', 'search'],
  ['claude-user', 'claude-user', 'user'],
  ['claude-searchbot', 'claude-searchbot', 'search'],
  ['claudebot', 'claudebot', 'training'],
  ['anthropic-ai', 'anthropic-ai', 'training'],
  ['mistralai-user', 'mistralai-user', 'user'],
  ['duckassistbot', 'duckassistbot', 'search'],
  ['youbot', 'youbot', 'search'],
  ['meta-externalagent', 'meta-externalagent', 'training'],
  ['applebot-extended', 'applebot-extended', 'training'],
  ['amazonbot', 'amazonbot', 'training'],
  ['bytespider', 'bytespider', 'training'],
  ['ccbot', 'ccbot', 'training'],
  ['cohere-ai', 'cohere-ai', 'training'],
  ['diffbot', 'diffbot', 'training'],
  ['timpibot', 'timpibot', 'training'],
]

export function identifyCrawler(userAgent: string | null | undefined): Crawler | null {
  if (!userAgent) return null
  const haystack = userAgent.toLowerCase()
  for (const [token, bot, kind] of SIGNATURES) {
    if (haystack.includes(token)) return { bot, kind }
  }
  return null
}

export interface CrawlerHit {
  readonly bot: string
  readonly kind: CrawlerKind
  readonly path: string
  readonly status: number
  readonly cache: string
  readonly verified: boolean | null
  readonly userAgent: string
}

interface SupabaseEnv {
  readonly SUPABASE_URL?: string
  readonly SUPABASE_ANON_KEY?: string
}

const DEFAULT_URL = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co'
// Publishable key: safe to embed, matching the pattern the API routes already use.
const DEFAULT_KEY = 'sb_publishable_p5T1U-WGt_bNzoWdAHZu3Q_KvuYVN2J'

// Fire-and-forget. Never awaited on the response path and never allowed to throw:
// a logging outage must not turn into a page outage for a crawler, which would cost
// far more than the missing row.
export async function recordCrawlerHit(env: SupabaseEnv, hit: CrawlerHit): Promise<void> {
  const url = (env.SUPABASE_URL ?? DEFAULT_URL).trim()
  const key = env.SUPABASE_ANON_KEY ?? DEFAULT_KEY
  try {
    await fetch(`${url}/rest/v1/ai_crawler_hits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        bot: hit.bot,
        kind: hit.kind,
        path: hit.path,
        status: hit.status,
        cache: hit.cache,
        verified: hit.verified,
        // Kept for spotting a spoofed or newly renamed agent later; truncated
        // because some crawlers send very long strings and none of the tail matters.
        user_agent: hit.userAgent.slice(0, 256),
      }),
    })
  } catch (error) {
    console.error('[ai-crawlers] failed to record hit:', error)
  }
}
