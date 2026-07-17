// Upload inline images for the mono-material and water-based-ink articles.
// Run: node scripts/upload-news-images-2.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(join(__dirname, '..', '.env'), 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).replace(/^﻿/, '').trim(), l.slice(i + 1).trim()] }))
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const SRC = 'C:/Users/WILLIM~1/AppData/Local/Temp/claude/c--dev-marketing-strategy/a1171d29-2b59-4a2b-939e-4402b4cfa4dd/scratchpad'
const BUCKET = 'product-media'
const files = [
  { local: join(SRC, 'mono-recyclable-pouch.jpeg'), remote: 'news/mono-material/recyclable-pouch.jpeg' },
  { local: join(SRC, 'flexo-printed-pouches.jpeg'),  remote: 'news/water-based-ink/printed-pouches.jpeg' },
]
for (const f of files) {
  const { error } = await supabase.storage.from(BUCKET).upload(f.remote, readFileSync(f.local), { contentType: 'image/jpeg', upsert: true })
  if (error) { console.error('Upload failed', f.remote, error.message); process.exit(1) }
  console.log('OK', supabase.storage.from(BUCKET).getPublicUrl(f.remote).data.publicUrl)
}
