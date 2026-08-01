// Two things Ahrefs reports that we have not measured yet:
//   "Structured data has Google rich results validation error"  (10)
//   "Slow page"                                                 (25)
// Pull every JSON-LD block and check it against Google's required/recommended
// fields per type, and time each page's HTML + its subresources.
const SITE = process.env.SITE ?? 'https://www.reylong.com'

const sitemapXml = await (await fetch(`${SITE}/sitemap.xml`)).text()
const paths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)

// Google's rich-result requirements for the types this site emits.
// required = error if absent; recommended = warning in Rich Results Test.
const RULES = {
  Product:      { required: ['name', 'image'], oneOf: [['offers', 'review', 'aggregateRating']] },
  Offer:        { required: ['price', 'priceCurrency'] },
  Article:      { required: ['headline', 'image'], recommended: ['datePublished', 'author'] },
  NewsArticle:  { required: ['headline', 'image'], recommended: ['datePublished', 'author'] },
  TechArticle:  { required: ['headline', 'image'], recommended: ['datePublished', 'author'] },
  BlogPosting:  { required: ['headline', 'image'], recommended: ['datePublished', 'author'] },
  FAQPage:      { required: ['mainEntity'] },
  Question:     { required: ['name', 'acceptedAnswer'] },
  BreadcrumbList: { required: ['itemListElement'] },
  Organization: { required: ['name'], recommended: ['logo', 'url'] },
  ImageObject:  { required: ['url'] },
  VideoObject:  { required: ['name', 'thumbnailUrl', 'uploadDate'] },
}

const results = []

const timeFetch = async (url) => {
  const t0 = performance.now()
  const res = await fetch(url)
  const buf = await res.arrayBuffer()
  return { ms: performance.now() - t0, bytes: buf.byteLength, status: res.status, res, buf }
}

const walk = (node, path, findings, seenTypes) => {
  if (Array.isArray(node)) {
    node.forEach((n, i) => walk(n, `${path}[${i}]`, findings, seenTypes))
    return
  }
  if (!node || typeof node !== 'object') return

  const type = node['@type']
  const types = Array.isArray(type) ? type : type ? [type] : []
  for (const t of types) {
    seenTypes.add(t)
    const rule = RULES[t]
    if (!rule) continue
    for (const f of rule.required ?? []) {
      if (node[f] === undefined || node[f] === null || node[f] === '') {
        findings.push({ severity: 'ERROR', type: t, field: f, at: path })
      }
    }
    for (const group of rule.oneOf ?? []) {
      if (!group.some((f) => node[f] !== undefined)) {
        findings.push({ severity: 'ERROR', type: t, field: `one of ${group.join('/')}`, at: path })
      }
    }
    for (const f of rule.recommended ?? []) {
      if (node[f] === undefined) {
        findings.push({ severity: 'WARN', type: t, field: f, at: path })
      }
    }
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('@')) continue
    walk(v, `${path}.${k}`, findings, seenTypes)
  }
}

const queue = [...paths]
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const p = queue.shift()
      let page
      try {
        page = await timeFetch(SITE + p)
      } catch (e) {
        results.push({ path: p, error: String(e) })
        continue
      }
      const html = new TextDecoder().decode(page.buf)

      // --- structured data ---
      const findings = []
      const seenTypes = new Set()
      let blocks = 0
      for (const m of html.matchAll(
        /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
      )) {
        blocks++
        try {
          walk(JSON.parse(m[1]), `block${blocks}`, findings, seenTypes)
        } catch (e) {
          findings.push({ severity: 'ERROR', type: 'JSON', field: 'unparseable', at: `block${blocks}` })
        }
      }

      // --- weight of subresources referenced by the page ---
      const assets = new Set()
      for (const re of [
        /<img[^>]+src="([^"]+)"/gi,
        /<script[^>]+src="([^"]+)"/gi,
        /<link[^>]+rel="stylesheet"[^>]*href="([^"]+)"/gi,
      ]) {
        for (const m of html.matchAll(re)) assets.add(m[1])
      }
      let assetBytes = 0
      let slowest = null
      await Promise.all(
        [...assets].map(async (a) => {
          const url = a.startsWith('http') ? a : SITE + (a.startsWith('/') ? a : '/' + a)
          try {
            const r = await timeFetch(url)
            assetBytes += r.bytes
            if (!slowest || r.ms > slowest.ms) slowest = { url: a, ms: r.ms, bytes: r.bytes }
          } catch {}
        })
      )

      results.push({
        path: p,
        htmlMs: page.ms,
        htmlBytes: page.bytes,
        assetCount: assets.size,
        assetBytes,
        slowest,
        totalBytes: page.bytes + assetBytes,
        findings,
        types: [...seenTypes],
        blocks,
      })
    }
  })
)

// ---------- structured data report ----------
const withErrors = results.filter((r) => r.findings?.some((f) => f.severity === 'ERROR'))
const withWarns = results.filter(
  (r) => r.findings?.some((f) => f.severity === 'WARN') && !r.findings.some((f) => f.severity === 'ERROR')
)
console.log('='.repeat(82))
console.log(`STRUCTURED DATA — pages with ERROR: ${withErrors.length}, warn-only: ${withWarns.length}`)
console.log('='.repeat(82))
const groupErr = new Map()
for (const r of results) {
  for (const f of r.findings ?? []) {
    const key = `${f.severity}  ${f.type}.${f.field}`
    if (!groupErr.has(key)) groupErr.set(key, [])
    groupErr.get(key).push(r.path)
  }
}
for (const [key, pages] of [...groupErr].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${key}  —  ${pages.length} pages`)
  for (const p of pages.slice(0, 12)) console.log(`    ${p}`)
  if (pages.length > 12) console.log(`    ... +${pages.length - 12} more`)
}
if (!groupErr.size) console.log('\nno structured-data findings')

// ---------- performance report ----------
console.log('\n' + '='.repeat(82))
console.log('SLOWEST / HEAVIEST PAGES (total transferred = HTML + img/js/css)')
console.log('='.repeat(82))
const perf = results.filter((r) => r.totalBytes !== undefined).sort((a, b) => b.totalBytes - a.totalBytes)
console.log('  totalKB   htmlKB  assets  assetKB   htmlMs   path')
for (const r of perf.slice(0, 30)) {
  console.log(
    `${String(Math.round(r.totalBytes / 1024)).padStart(9)} ${String(Math.round(r.htmlBytes / 1024)).padStart(8)} ${String(r.assetCount).padStart(7)} ${String(Math.round(r.assetBytes / 1024)).padStart(8)} ${String(Math.round(r.htmlMs)).padStart(8)}   ${r.path}`
  )
}

console.log('\n' + '='.repeat(82))
console.log('HEAVIEST SINGLE ASSETS (worst offender per page, deduped)')
console.log('='.repeat(82))
const assetMap = new Map()
for (const r of results) {
  if (r.slowest) {
    const prev = assetMap.get(r.slowest.url)
    if (!prev || r.slowest.bytes > prev.bytes) assetMap.set(r.slowest.url, r.slowest)
  }
}
for (const a of [...assetMap.values()].sort((x, y) => y.bytes - x.bytes).slice(0, 25)) {
  console.log(`${String(Math.round(a.bytes / 1024)).padStart(8)} KB  ${String(Math.round(a.ms)).padStart(6)} ms  ${a.url}`)
}
