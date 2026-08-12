// Reads back the AI crawler log that src/middleware.ts writes.
//
//   node scripts/geo-monitor-crawlers.mjs            # last 30 days
//   node scripts/geo-monitor-crawlers.mjs --days 7
//   node scripts/geo-monitor-crawlers.mjs --days 7 --json
//
// The table is insert-only for the publishable key on purpose — a publicly
// readable log would hand anyone a live map of which pages the AI engines
// favour — so reading needs the service key, taken from .env the same way the
// seed scripts do it. Nothing here writes.
//
// What the numbers mean, in descending order of how much they are worth:
//
//   user      a person asked their assistant something and it fetched the page
//             on the spot. The only line here that implies a live query.
//   search    the engine's retrieval index.
//   training  corpus crawling. A page being eligible for some future model says
//             nothing at all about being cited today, so a month where training
//             rises and user does not has not moved the thing being measured.
//
// Two blind spots, both structural, both worth restating every time this is read:
// Gemini and AI Overviews crawl as Googlebot and are not counted at all, and the
// prerendered pages — including the 82-question /faq/ — never reach the
// middleware. See src/lib/ai-crawlers.ts.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const args = process.argv.slice(2)
const asJson = args.includes('--json')
const daysIndex = args.indexOf('--days')
const days = daysIndex === -1 ? 30 : Number(args[daysIndex + 1])
if (!Number.isInteger(days) || days < 1) throw new Error('--days must be a positive integer')

// No dotenv in this project; the seed scripts parse .env by hand and so does this.
function readEnv(name) {
  const line = readFileSync(`${root}.env`, 'utf8')
    .split(/\r?\n/)
    .find(entry => entry.startsWith(`${name}=`))
  if (!line) throw new Error(`${name} is not set in .env`)
  return line.slice(name.length + 1).trim()
}

const fixtureIndex = args.indexOf('--fixture')
const fixture = fixtureIndex === -1 ? undefined : args[fixtureIndex + 1]
if (fixtureIndex !== -1 && (!fixture || fixture.startsWith('--'))) throw new Error('--fixture requires a path')

const url = (process.env.SUPABASE_URL ?? 'https://lqgrvkhrbsgbatzhzgvy.supabase.co').trim()
// Reading .env is deferred when replaying a fixture: the report must be runnable
// without credentials at all.
const key = fixture ? '' : (process.env.SUPABASE_SERVICE_ROLE_KEY ?? readEnv('SUPABASE_SERVICE_ROLE_KEY'))

const since = new Date(Date.now() - days * 86400_000).toISOString()
const endpoint = `${url}/rest/v1/ai_crawler_hits`
  + `?select=hit_at,bot,kind,path,status,verified&hit_at=gte.${since}&order=hit_at.desc&limit=10000`

// Everything below runs inside a function so an early exit can `return` and let
// the process wind down on its own. Calling process.exit() straight after a fetch
// tears down undici's still-open handle and crashes libuv on Windows, which turns
// a clean "table is missing" into an assertion failure and exit code 127.
async function main() {
  // --fixture replays a saved `--json` dump instead of querying, so the report can
  // be exercised without a live table and without inventing a fake HTTP layer.
  if (fixture) {
    report(JSON.parse(readFileSync(fixture, 'utf8')))
    return
  }

  const response = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })

  if (!response.ok) {
    const body = await response.text()
    process.exitCode = 1
    if (body.includes('PGRST205')) {
      console.error('ai_crawler_hits 這張表還不存在。')
      console.error('先在 Supabase SQL Editor 執行 supabase/migrations/004_ai_crawler_hits.sql。')
      return
    }
    console.error(`讀取失敗 HTTP ${response.status}: ${body.slice(0, 300)}`)
    return
  }

  const hits = await response.json()

  if (asJson) {
    console.log(JSON.stringify(hits, null, 2))
    return
  }

  console.log(`AI 爬蟲抓取紀錄 — 最近 ${days} 天\n`)

  if (!hits.length) {
    console.log('這段期間沒有任何紀錄。')
    console.log('若 middleware 才剛上線，等幾天再看；若已上線一段時間仍是空的，')
    console.log('代表 AI 引擎確實沒有在抓這個站 —— 那本身就是結論。')
    return
  }

  report(hits)
}

const tally = (records, field) => {
  const counts = new Map()
  for (const record of records) counts.set(record[field], (counts.get(record[field]) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

const KIND_LABEL = {
  user: 'user（有人當場在問）',
  search: 'search（檢索索引）',
  training: 'training（語料爬取）',
}

function report(hits) {
  console.log(`總計 ${hits.length} 次抓取\n`)

  console.log('依性質')
  for (const kind of ['user', 'search', 'training']) {
    const rows = hits.filter(hit => hit.kind === kind)
    console.log(`  ${KIND_LABEL[kind].padEnd(24)}${String(rows.length).padStart(5)} 次`)
  }

  console.log('\n依爬蟲')
  let corroborated = 0
  for (const [bot, count] of tally(hits, 'bot')) {
    const verified = hits.filter(hit => hit.bot === bot && hit.verified === true).length
    corroborated += verified
    // Without Cloudflare's flag a User-Agent is just a string someone sent, so say
    // how much of each count is actually corroborated rather than implying it all is.
    console.log(`  ${bot.padEnd(20)}${String(count).padStart(5)} 次${verified ? `（已驗證 ${verified}）` : ''}`)
  }
  // Measured against production this is always the case, because verified-bot is a
  // zone-level signal and the domain resolves outside Cloudflare. Said out loud so
  // nobody reads these counts as confirmed visits, or wastes time debugging a null.
  if (!corroborated) {
    console.log('\n  ※ 沒有任何一次經過 Cloudflare 驗證（本站 DNS 不在 Cloudflare，拿不到 verified-bot 訊號）。')
    console.log('    User-Agent 可偽造，以上數字一律視為上限，不是「確認來過」。')
  }

  console.log('\n最常被抓的頁面')
  for (const [path, count] of tally(hits, 'path').slice(0, 15)) {
    console.log(`  ${String(count).padStart(4)}  ${path}`)
  }

  const live = hits.filter(hit => hit.kind === 'user' || hit.kind === 'search')
  if (live.length) {
    console.log('\n只看 user + search（排除語料爬取後，真正跟查詢有關的抓取）')
    for (const [path, count] of tally(live, 'path').slice(0, 10)) {
      console.log(`  ${String(count).padStart(4)}  ${path}`)
    }
  } else {
    console.log('\n這段期間全部都是語料爬取，沒有任何一次與即時查詢有關。')
  }

  const errors = hits.filter(hit => hit.status && hit.status >= 400)
  if (errors.length) {
    const statuses = [...new Set(errors.map(hit => hit.status))].sort().join('、')
    console.log(`\n⚠ 有 ${errors.length} 次抓取拿到錯誤回應（${statuses}）`)
    for (const [path, count] of tally(errors, 'path').slice(0, 5)) {
      console.log(`  ${String(count).padStart(4)}  ${path}`)
    }
  }

  console.log('\n（Gemini／AI Overviews 以 Googlebot 身分抓取，不在此列；')
  console.log('  /about/、/faq/、/contact/、/es/about/ 為預渲染，不經 middleware，永遠不會出現在這裡。）')
}

await main()
