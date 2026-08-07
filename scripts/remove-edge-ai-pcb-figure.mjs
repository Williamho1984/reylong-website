// The edge AI article illustrated "machine vision on a packaging line" with a
// stock photo of circuit boards under a laser inspection head. The alt text was
// honest about what the picture showed — "optically inspecting circuit
// boards" — which is exactly the problem: a packaging machinery article was
// showing an electronics process. Drop the figure from both languages.
//
// The second figure in that article stays: its photo is a servo/pneumatic
// production line and its alt and caption claim nothing more than that.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SUPABASE_URL = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co'
const SLUG = 'edge-ai-packaging-lines-vision-inspection-predictive-maintenance'
const DOOMED = 'news/edge-ai/vision-inspection.jpeg'

function readEnv(path) {
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split('\n')
      .filter(line => line.includes('=') && !line.trim().startsWith('#'))
      .map(line => {
        const at = line.indexOf('=')
        return [line.slice(0, at).trim(), line.slice(at + 1).trim()]
      })
  )
}

const key = readEnv(fileURLToPath(new URL('../.env', import.meta.url))).SUPABASE_SERVICE_ROLE_KEY
if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing from .env')

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

const [row] = await (
  await fetch(`${SUPABASE_URL}/rest/v1/news?slug=eq.${SLUG}&select=content_en,content_es`, { headers })
).json()
if (!row) throw new Error(`no row for ${SLUG}`)

// Swallow one run of surrounding whitespace along with the figure so the
// paragraph and the heading that bracketed it do not end up double-spaced.
const FIGURE = new RegExp(`\\s*<figure>(?:(?!</figure>)[\\s\\S])*?${DOOMED.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}[\\s\\S]*?</figure>\\s*`, 'i')

const update = {}
for (const field of ['content_en', 'content_es']) {
  const before = row[field]
  if (!before.includes(DOOMED)) throw new Error(`${field}: figure already gone, nothing to remove`)
  const after = before.replace(FIGURE, ' ')
  if (after.includes(DOOMED)) throw new Error(`${field}: regex did not match the figure`)
  if (after.length >= before.length) throw new Error(`${field}: replacement did not shrink the body`)
  console.log(`${field}: ${before.length} -> ${after.length} chars`)
  update[field] = after
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/news?slug=eq.${SLUG}&select=slug`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify(update),
})
const body = await res.text()
if (!res.ok) throw new Error(`HTTP ${res.status} — ${body}`)
console.log(`patched ${body}`)
