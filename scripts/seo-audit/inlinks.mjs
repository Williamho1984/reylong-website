// Crawl the live sitemap and rank every page by how many DISTINCT internal pages
// link to it with a dofollow <a>. That is the metric Ahrefs reports as
// "Page has only one dofollow incoming internal link" — so nav/footer chrome
// counts too, but we track the zone separately to see whether a page is carried
// purely by template links or by real editorial ones.
const SITE = process.env.SITE ?? 'https://www.reylong.com'

const sitemapXml = await (await fetch(`${SITE}/sitemap.xml`)).text()
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => SITE + new URL(m[1]).pathname)

const toPath = (href) => {
  if (!href) return null
  let p = href.startsWith(SITE) ? href.slice(SITE.length) : href
  if (!p.startsWith('/')) return null
  p = p.split('#')[0].split('?')[0]
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p || '/'
}

const stripTags = (s) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const inbound = new Map() // target path -> [{ source, anchor, zone }]
const pages = new Map()

const fetchPage = async (u) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(u)
      if (res.ok) return await res.text()
    } catch {
      // fall through to retry
    }
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  console.error(`  ! failed to fetch ${u}`)
  return null
}

const queue = [...urls]
const workers = Array.from({ length: 6 }, async () => {
  while (queue.length) {
    const u = queue.shift()
    const html = await fetchPage(u)
    if (html) pages.set(toPath(u), html)
  }
})
await Promise.all(workers)

console.log(`crawled ${pages.size}/${urls.length} pages from sitemap\n`)

for (const [sourcePath, html] of pages) {
  const navRanges = []
  for (const re of [/<nav\b[\s\S]*?<\/nav>/gi, /<footer\b[\s\S]*?<\/footer>/gi]) {
    for (const m of html.matchAll(re)) navRanges.push([m.index, m.index + m[0].length])
  }
  const zoneOf = (idx) => (navRanges.some(([a, b]) => idx >= a && idx < b) ? 'chrome' : 'body')

  for (const m of html.matchAll(/<a\b([^>]*)href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = `${m[1]} ${m[3]}`
    if (/rel="[^"]*nofollow/i.test(attrs)) continue // Ahrefs counts dofollow only
    const target = toPath(m[2])
    if (!target || target === sourcePath) continue
    if (!inbound.has(target)) inbound.set(target, [])
    inbound.get(target).push({
      source: sourcePath,
      anchor: stripTags(m[4]).slice(0, 60),
      zone: zoneOf(m.index),
    })
  }
}

const summarize = (path) => {
  const links = inbound.get(path) ?? []
  const body = links.filter((l) => l.zone === 'body')
  const chrome = links.filter((l) => l.zone === 'chrome')
  return {
    refPages: new Set(links.map((l) => l.source)).size,
    bodyRefPages: new Set(body.map((l) => l.source)).size,
    chromeRefPages: new Set(chrome.map((l) => l.source)).size,
    body,
  }
}

const rows = [...pages.keys()]
  .map((p) => ({ p, ...summarize(p) }))
  .sort((a, b) => a.refPages - b.refPages || a.p.localeCompare(b.p))

console.log('='.repeat(84))
console.log('全站入站內部連結排行（referring pages = 有幾個「不同頁面」連過來）')
console.log('='.repeat(84))
console.log(' ref  body  chrome   path')
for (const r of rows) {
  const flag = r.refPages <= 1 ? '  ← Ahrefs notice' : ''
  console.log(
    `${String(r.refPages).padStart(4)}  ${String(r.bodyRefPages).padStart(4)}  ${String(r.chromeRefPages).padStart(6)}   ${r.p}${flag}`
  )
}

console.log('\n' + '='.repeat(84))
console.log('只有 1 個（或 0 個）入站內部連結的頁面 — 它們的唯一來源是誰')
console.log('='.repeat(84))
for (const r of rows.filter((r) => r.refPages <= 1)) {
  console.log(`\n${r.p}   (ref pages: ${r.refPages})`)
  const links = inbound.get(r.p) ?? []
  const seen = new Set()
  for (const l of links) {
    const key = `${l.source}|${l.anchor}|${l.zone}`
    if (seen.has(key)) continue
    seen.add(key)
    console.log(`  ← [${l.zone}] ${l.source}`)
    console.log(`      "${l.anchor}"`)
  }
  if (!links.length) console.log('  （完全沒有入站內部連結 — 只靠 sitemap 被發現）')
}
