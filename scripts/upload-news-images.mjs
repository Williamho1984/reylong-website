// Upload news article images to Supabase Storage (product-media bucket, news/ path).
// Self-hosting (vs hotlinking) so the images are owned by us and reliable.
// Run: node scripts/upload-news-images.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env'), 'utf8')
    .split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()] })
)

const SUPABASE_URL = env.SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const SRC = 'C:/Users/WILLIM~1/AppData/Local/Temp/claude/c--dev-marketing-strategy/a1171d29-2b59-4a2b-939e-4402b4cfa4dd/scratchpad'
const BUCKET = 'product-media'

const files = [
  { local: join(SRC, 'vision-inspection.jpeg'),       remote: 'news/edge-ai/vision-inspection.jpeg' },
  { local: join(SRC, 'smart-automation-line.jpeg'),   remote: 'news/edge-ai/smart-automation-line.jpeg' },
]

for (const f of files) {
  const buf = readFileSync(f.local)
  const { error } = await supabase.storage.from(BUCKET).upload(f.remote, buf, {
    contentType: 'image/jpeg', upsert: true,
  })
  if (error) { console.error('Upload failed for', f.remote, '->', error.message); process.exit(1) }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(f.remote)
  console.log('OK', f.remote, '->', data.publicUrl)
}
