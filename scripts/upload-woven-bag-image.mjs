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
const remote = 'news/water-based-ink/printed-woven-bags.jpeg'
const { error } = await supabase.storage.from('product-media').upload(remote, readFileSync(join(SRC, 'printed-woven-bags.jpeg')), { contentType: 'image/jpeg', upsert: true })
if (error) { console.error('Upload failed', error.message); process.exit(1) }
console.log('OK', supabase.storage.from('product-media').getPublicUrl(remote).data.publicUrl)
