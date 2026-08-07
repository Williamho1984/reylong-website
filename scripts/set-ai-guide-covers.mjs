// The three AI-inspection guides shipped without a cover image, which left
// `image` out of their NewsArticle JSON-LD and the page without a hero.
// Each image below was viewed before being assigned — a filename match is not
// evidence that the picture shows what the article describes.
//
// Rejected on inspection: news/edge-ai/vision-inspection.jpeg (PCB boards on a
// laser bench, wrong industry), news/edge-ai/smart-automation-line.jpeg (a
// FESTO pneumatic demo rig), ai-machine-intelligence-solutions/cover.jpg
// (generic robot assembly hall).
import { readFileSync } from 'node:fs'
// fileURLToPath, not url.pathname: the repo lives under a path with a space in
// it, which arrives percent-encoded and will not open.
import { fileURLToPath } from 'node:url'

const SUPABASE_URL = 'https://lqgrvkhrbsgbatzhzgvy.supabase.co'
const MEDIA = `${SUPABASE_URL}/storage/v1/object/public/product-media`

const COVERS = {
  // A multi-lens inspection head reading a printed woven web through the
  // rollers — the exact operation the article is about.
  'ai-visual-inspection-woven-bag-printing': `${MEDIA}/news/registration-drift/inspection-camera.jpg`,
  // Camera, edge box and operator HMI bolted onto a running machine: what a
  // retrofit physically adds.
  'retrofit-edge-ai-inspection-woven-bag-line': `${MEDIA}/news/registration-drift/ai-inspection-hmi.jpg`,
  // The real conversion line the comparison is set on. A plain product shot is
  // the honest choice here — no inspection hardware is being claimed.
  'manual-vs-ai-inspection-woven-bag-lines': `${MEDIA}/automatic-printing-tubing-cutting-sewing-line/cover.jpg`,
}

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

// REST rather than supabase-js: the client's session handling overrides the
// service_role credentials and the write comes back as permission denied.
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

for (const [slug, url] of Object.entries(COVERS)) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/news?slug=eq.${slug}&select=slug,cover_image_url`,
    { method: 'PATCH', headers, body: JSON.stringify({ cover_image_url: url }) }
  )
  const body = await res.text()
  if (!res.ok) throw new Error(`${slug}: HTTP ${res.status} — ${body}`)
  console.log(`${slug}\n    -> ${JSON.parse(body)[0]?.cover_image_url}`)
}
