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
const { data, error } = await supabase.from('news').select('*').eq('slug', 'eddy-current-separation-guide').single()
if (error) { console.error(error.message); process.exit(1) }
console.log('COVER:', data.cover_image_url)
console.log('TITLE_EN:', data.title_en)
console.log('TITLE_ES:', data.title_es)
console.log('\n===== CONTENT_EN =====\n' + data.content_en)
console.log('\n===== CONTENT_ES =====\n' + data.content_es)
