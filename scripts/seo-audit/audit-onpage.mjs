// Re-derive, from the live site, the Ahrefs Warning-level checks we can verify
// ourselves. The screenshots only showed which warning TYPES are wired to
// alerts — not which ones fired or on what URLs — so measure directly.
//
// Ahrefs thresholds used here:
//   title           30..60 chars
//   meta desc      110..160 chars
//   low word count  < 500 words
const SITE = process.env.SITE ?? 'https://www.reylong.com'

const sitemapXml = await (await fetch(`${SITE}/sitemap.xml`)).text()
// The sitemap always emits absolute production URLs, so take the path and
// re-attach it to SITE — that lets the same script audit localhost.
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (m) => SITE + new URL(m[1]).pathname
)

const toPath = (href) => {
  if (!href) return null
  let p = href.startsWith(SITE) ? href.slice(SITE.length) : href
  if (!p.startsWith('/')) return null
  return p.split('#')[0]
}

const fetchPage = async (u) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(u)
      if (res.ok) return await res.text()
    } catch {}
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
  }
  return null
}

const pages = new Map()
{
  const queue = [...urls]
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const u = queue.shift()
        const html = await fetchPage(u)
        if (html) pages.set(u.slice(SITE.length) || '/', html)
      }
    })
  )
}
console.log(`crawled ${pages.size}/${urls.length} pages\n`)

// Must handle NUMERIC entities too, not just named ones: Astro emits `&#34;`
// for a quote inside an attribute, and counting that as 5 characters instead
// of 1 inflates the measured length enough to fake a "too long" finding.
const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', deg: '°', plusmn: '±', times: '×', micro: 'µ',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ',
  iquest: '¿', iexcl: '¡'
}
const decode = (s) =>
  s.replace(/&(#\d+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, body) => {
    if (body.startsWith('#')) {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10)
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : match
    }
    return NAMED[body] ?? match
  })

const findings = {}
const add = (key, detail) => {
  if (!findings[key]) findings[key] = []
  findings[key].push(detail)
}

// Collect every internal href so we can status-check them for redirect links.
const internalTargets = new Set()

for (const [path, html] of pages) {
  // Strip chrome + non-content before measuring body text.
  const bodyOnly = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  const desc = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1]
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]*>/g, '').trim()
  )
  const htmlLang = html.match(/<html[^>]+lang="([^"]*)"/i)?.[1]
  const hreflangs = [...html.matchAll(/<link[^>]+hreflang="([^"]*)"/gi)].map((m) => m[1])
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i)?.[1]

  // --- Content warnings ---
  if (!title || !title.trim()) add('Title tag missing or empty', path)
  else {
    const t = decode(title).trim()
    if (t.length > 60) add('Title too long (>60)', `${path}  [${t.length}] ${t}`)
    if (t.length < 30) add('Title too short (<30)', `${path}  [${t.length}] ${t}`)
  }

  if (desc === undefined) add('Meta description tag missing or empty', path)
  else {
    const d = decode(desc).trim()
    if (!d) add('Meta description tag missing or empty', path)
    else {
      if (d.length > 160) add('Meta description too long (>160)', `${path}  [${d.length}]`)
      if (d.length < 110) add('Meta description too short (<110)', `${path}  [${d.length}] ${d}`)
    }
  }

  if (h1s.length === 0 || !h1s[0]) add('H1 tag missing or empty', path)
  if (h1s.length > 1) add('Multiple H1 tags (Notice)', `${path}  x${h1s.length}`)

  const words = bodyOnly
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length
  if (words < 500) add('Low word count (<500)', `${path}  [${words} words]`)

  // --- Localization ---
  if (hreflangs.length > 0 && !htmlLang) add('Hreflang defined but HTML lang missing', path)

  // --- Indexability ---
  if (canonical) {
    const canonPath = toPath(canonical)
    if (canonPath && canonPath !== path) {
      add('Canonical points elsewhere', `${path}  ->  ${canonPath}`)
    }
  }

  // --- Mixed content / insecure subresources ---
  for (const m of html.matchAll(/<img[^>]+src="(http:\/\/[^"]*)"/gi))
    add('HTTPS page links to HTTP image', `${path}  ${m[1]}`)
  for (const m of html.matchAll(/<script[^>]+src="(http:\/\/[^"]*)"/gi))
    add('HTTPS page links to HTTP JavaScript', `${path}  ${m[1]}`)
  for (const m of html.matchAll(/<link[^>]+href="(http:\/\/[^"]*)"[^>]*rel="stylesheet"/gi))
    add('HTTPS page links to HTTP CSS', `${path}  ${m[1]}`)

  // --- Images: missing alt ---
  for (const m of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attrs = m[1]
    const alt = attrs.match(/\balt="([^"]*)"/i)
    if (!alt) add('Missing alt text (no alt attribute)', `${path}  ${attrs.match(/src="([^"]*)"/)?.[1] ?? '?'}`)
  }

  // --- Links ---
  const anchors = [...bodyOnly.matchAll(/<a\b[^>]*href="([^"]*)"/gi)]
  const outgoing = anchors.map((m) => m[1]).filter((h) => h && !h.startsWith('#'))
  if (outgoing.length === 0) add('Page has no outgoing links', path)

  for (const m of html.matchAll(/<a\b[^>]*href="([^"]*)"/gi)) {
    const t = toPath(m[1])
    if (t) internalTargets.add(t)
  }
}

// --- Status-check every distinct internal link target (redirect / broken) ---
console.log(`status-checking ${internalTargets.size} distinct internal link targets...\n`)
const statuses = new Map()
{
  const queue = [...internalTargets]
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (queue.length) {
        const t = queue.shift()
        try {
          const res = await fetch(`${SITE}${t}`, { redirect: 'manual' })
          statuses.set(t, res.status)
        } catch {
          statuses.set(t, 'ERR')
        }
      }
    })
  )
}
for (const [t, s] of [...statuses].sort()) {
  if (typeof s === 'number' && s >= 300 && s < 400) add('Internal link points to a redirect', `${t}  -> ${s}`)
  if (s === 'ERR' || (typeof s === 'number' && s >= 400)) add('Internal link is broken', `${t}  -> ${s}`)
}

// --- Report ---
const order = Object.keys(findings).sort((a, b) => findings[b].length - findings[a].length)
for (const key of order) {
  console.log('='.repeat(80))
  console.log(`${key}  —  ${findings[key].length}`)
  console.log('='.repeat(80))
  for (const d of findings[key].slice(0, 40)) console.log(`  ${d}`)
  if (findings[key].length > 40) console.log(`  ... +${findings[key].length - 40} more`)
  console.log()
}
if (!order.length) console.log('no findings')
